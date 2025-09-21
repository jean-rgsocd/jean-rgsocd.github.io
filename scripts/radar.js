// radar.js - compatível com radar_ia.py (statistics as object { full, firstHalf_derived, secondHalf_derived })
// - Atualiza a cada 60s
// - Mostra eventos mais recentes primeiro (display_time com minuto/segundo)
// - Lê estrutura retornada por /stats-aovivo/{id}
document.addEventListener("DOMContentLoaded", () => {
  const RADAR_API = "https://radar-ia-backend.onrender.com"; // ajuste se necessário
  const radarSection = document.getElementById("radar-ia-section");
  if (!radarSection) return;

  const leagueSelect = document.getElementById("radar-league-select");
  const gameSelect   = document.getElementById("radar-game-select");
  const dashboard    = document.getElementById("radar-dashboard");
  const scoreEl      = document.getElementById("radar-score");
  const minuteEl     = document.getElementById("radar-minute");
  const homeTeamEl   = document.getElementById("home-team-name");
  const awayTeamEl   = document.getElementById("away-team-name");
  const eventsEl     = document.getElementById("radar-events");
  const stoppageBox  = document.getElementById("stoppage-time-prediction");
  const stoppageVal  = document.getElementById("stoppage-time-value");
  const tabs         = document.querySelectorAll(".period-btn");

  const statPossEl = document.getElementById("stat-possession");
  const statShotsEl = document.getElementById("stat-shots");
  const statCornersEl = document.getElementById("stat-corners");
  const statFoulsEl = document.getElementById("stat-fouls");
  const statYellowEl = document.getElementById("stat-yellow-cards");
  const statRedEl = document.getElementById("stat-red-cards");

  let currentGameId = null;
  let currentPeriod = "full"; // "full", "first", "second"
  let updateInterval = null;
  let latestData = null;

  // --- helpers para extrair estatísticas mesmo com nomes variáveis
  function mapKeysLower(obj = {}) {
    const m = {};
    Object.keys(obj || {}).forEach(k => { m[k.toLowerCase()] = obj[k]; });
    return m;
  }
  function pickStat(sideObj, candidates = []) {
    if (!sideObj) return null;
    const m = mapKeysLower(sideObj);
    for (const c of candidates) {
      const key = c.toLowerCase();
      if (m[key] !== undefined && m[key] !== null) return m[key];
    }
    return null;
  }

  // --- ícone para categoria
  function iconFor(cat = "") {
    const c = (cat || "").toLowerCase();
    if (c.includes("goal")) return "⚽";
    if (c.includes("yellow")) return "🟨";
    if (c.includes("red")) return "🟥";
    if (c.includes("sub")) return "🔁";
    if (c.includes("shot") || c.includes("on target")) return "🎯";
    if (c.includes("corner")) return "🚩";
    if (c.includes("foul")) return "🛑";
    return "•";
  }

  // --- render eventos (já vem ordenado pelo backend: mais recentes primeiro)
  function renderEvents(events = []) {
    eventsEl.innerHTML = "";
    if (!events || events.length === 0) {
      eventsEl.innerHTML = "<li>Nenhum evento recente</li>";
      return;
    }
    events.forEach(ev => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-2 py-1";

      const timeLabel = ev.display_time || (ev.raw && ev.raw.time ? formatRawTime(ev.raw.time) : "-");
      const icon = iconFor(ev.category || ev.type || ev.detail);
      const detail = ev.detail ? ` — ${ev.detail}` : "";
      const player = ev.player ? ` — ${ev.player}` : "";
      const team = ev.team ? ` (${ev.team})` : "";

      li.innerHTML = `<span class="font-semibold text-slate-200">${timeLabel}</span>
                      <span class="ml-2">${icon}</span>
                      <div class="ml-2 text-sm text-slate-300">${(ev.type || '')}${detail}${player}${team}</div>`;
      eventsEl.appendChild(li);
    });
  }
  function formatRawTime(t = {}) {
    if (!t) return "-";
    const elapsed = t.elapsed;
    const sec = (t.second != null) ? `${String(t.second).padStart(2,'0')}"` : "";
    const extra = t.extra ? `+${t.extra}` : "";
    if (elapsed == null) return "-";
    return `${elapsed}${extra}' ${sec}`;
  }

  // --- popula lista de ligas (do backend radar)
  async function loadLeagues() {
    if (!leagueSelect) return;
    leagueSelect.disabled = true;
    leagueSelect.innerHTML = `<option>Carregando ligas...</option>`;
    try {
      const r = await fetch(`${RADAR_API}/ligas`);
      const data = await r.json();
      leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
      data.forEach(l => leagueSelect.add(new Option(`${l.name} - ${l.country || ''}`, l.id)));
      leagueSelect.disabled = false;
    } catch (err) {
      leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
      console.error("loadLeagues error", err);
    }
  }

  // --- carrega jogos ao vivo (ou de uma liga específica)
  async function loadGames(leagueId = null) {
    if (!gameSelect) return;
    gameSelect.disabled = true;
    gameSelect.innerHTML = `<option>Carregando jogos ao vivo...</option>`;
    try {
      const url = leagueId ? `${RADAR_API}/jogos-aovivo?league=${encodeURIComponent(leagueId)}` : `${RADAR_API}/jogos-aovivo`;
      const r = await fetch(url);
      const data = await r.json();
      if (!data || data.length === 0) {
        gameSelect.innerHTML = `<option value="">Nenhum jogo ao vivo</option>`;
        gameSelect.disabled = true;
        return;
      }
      gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
      data.forEach(g => gameSelect.add(new Option(g.title, g.game_id)));
      gameSelect.disabled = false;
    } catch (err) {
      console.error("loadGames", err);
      gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
    }
  }

  // --- popula painel de estatísticas baseado na estrutura do backend
  function setStatsPanel(statsObj = {}, periodKey = "full") {
    // statsObj pode ser: { full: {home:{}, away:{}}, firstHalf_derived: {...}, secondHalf_derived: {...} }
    if (!statsObj) {
      [statPossEl, statShotsEl, statCornersEl, statFoulsEl, statYellowEl, statRedEl].forEach(el => el && (el.textContent = "-"));
      return;
    }

    // escolher fonte de dados de acordo com periodKey
    let source = null;
    if (periodKey === "first") source = statsObj.firstHalf_derived || statsObj.first || null;
    else if (periodKey === "second") source = statsObj.secondHalf_derived || statsObj.second || null;
    else source = statsObj.full || statsObj;

    const home = (source && source.home) || {};
    const away = (source && source.away) || {};

    // Possibilidade de nomes variados, usamos lista de candidatos
    const possessionCandidates = ["possession", "ball possession", "possession%"];
    const totalShotsCandidates = ["total_shots","total shots","totalshots","totalshots"];
    const onTargetCandidates = ["shots_on_goal","shots on goal","shots_on_target","shots on target"];
    const cornersCandidates = ["corners","corner"];
    const foulsCandidates = ["fouls","foul"];
    const yellowCandidates = ["yellow_cards","yellow card","yellow","yellow_cards"];
    const redCandidates = ["red_cards","red card","red"];

    const getVal = (obj, candidates) => {
      let v = pickStat(obj, candidates);
      if (v === null || v === undefined) return null;
      // se string com % mantém como string
      if (typeof v === "string" && v.includes("%")) return v;
      return v;
    };

    // Possession (exibimos em porcentagem "H% / A%")
    const hPoss = getVal(home, possessionCandidates);
    const aPoss = getVal(away, possessionCandidates);
    statPossEl && (statPossEl.textContent = (hPoss != null || aPoss != null) ? `${hPoss ?? "-"} / ${aPoss ?? "-"}` : "-");

    // Shots (total / on target)
    const hTotal = getVal(home, totalShotsCandidates) ?? "-";
    const aTotal = getVal(away, totalShotsCandidates) ?? "-";
    const hOn = getVal(home, onTargetCandidates) ?? "-";
    const aOn = getVal(away, onTargetCandidates) ?? "-";
    statShotsEl && (statShotsEl.textContent = `${hTotal} (${hOn}) / ${aTotal} (${aOn})`);

    // Corners / Fouls / Cards
    const hCorners = getVal(home, cornersCandidates) ?? "-";
    const aCorners = getVal(away, cornersCandidates) ?? "-";
    statCornersEl && (statCornersEl.textContent = `${hCorners} / ${aCorners}`);

    const hFouls = getVal(home, foulsCandidates) ?? "-";
    const aFouls = getVal(away, foulsCandidates) ?? "-";
    statFoulsEl && (statFoulsEl.textContent = `${hFouls} / ${aFouls}`);

    const hY = getVal(home, yellowCandidates) ?? "-";
    const aY = getVal(away, yellowCandidates) ?? "-";
    statYellowEl && (statYellowEl.textContent = `${hY} / ${aY}`);

    const hR = getVal(home, redCandidates) ?? "-";
    const aR = getVal(away, redCandidates) ?? "-";
    statRedEl && (statRedEl.textContent = `${hR} / ${aR}`);
  }

  // --- fetch e render completo
  async function fetchAndRender(gameId) {
    if (!gameId) return;
    try {
      const r = await fetch(`${RADAR_API}/stats-aovivo/${encodeURIComponent(gameId)}?sport=football`);
      if (!r.ok) throw new Error("Erro ao buscar stats");
      const data = await r.json();
      latestData = data;

      const fixture = data.fixture || {};
      const teams = data.teams || {};
      const home = teams.home || {};
      const away = teams.away || {};

      homeTeamEl.textContent = home.name || "Time Casa";
      awayTeamEl.textContent = away.name || "Time Fora";

      // score pode estar em data.score ou fixture.goals
      const goals = data.score || fixture.goals || {};
      const h = (data.score && data.score.home != null) ? data.score.home : (goals.home != null ? goals.home : "-");
      const a = (data.score && data.score.away != null) ? data.score.away : (goals.away != null ? goals.away : "-");
      scoreEl.textContent = `${h} - ${a}`;

      const elapsed = (data.status && data.status.elapsed) || (fixture && fixture.status && fixture.status.elapsed) || null;
      minuteEl.textContent = elapsed ? `${elapsed}'` : "-";

      // estimated extra: backend já calcula apenas em momentos permitidos (35'/80')
      if (data.estimated_extra) {
        stoppageBox && stoppageBox.classList.remove("hidden");
        stoppageVal && (stoppageVal.textContent = data.estimated_extra);
      } else {
        stoppageBox && stoppageBox.classList.add("hidden");
      }

      // stats
      setStatsPanel(data.statistics || {}, currentPeriod);

      // eventos (já ordenados no backend - mais recentes primeiro)
      renderEvents(data.events || []);

      dashboard && dashboard.classList.remove("hidden");
    } catch (err) {
      console.error("fetchAndRender error", err);
      dashboard && dashboard.classList.add("hidden");
    }
  }

  // --- handlers
  gameSelect && gameSelect.addEventListener("change", (ev) => {
    const id = ev.target.value;
    clearInterval(updateInterval);
    if (!id) {
      dashboard && dashboard.classList.add("hidden");
      return;
    }
    currentGameId = id;
    fetchAndRender(currentGameId);
    updateInterval = setInterval(() => fetchAndRender(currentGameId), 60000); // 60s
  });

  leagueSelect && leagueSelect.addEventListener("change", (ev) => {
    const lid = ev.target.value;
    if (!lid) return;
    loadGames(lid);
  });

  tabs && tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      // limpar classes visuais
      tabs.forEach(b => b.classList.remove("bg-cyan-600","text-white"));
      btn.classList.add("bg-cyan-600","text-white");
      const p = btn.dataset.period;
      if (p === "firstHalf") currentPeriod = "first";
      else if (p === "secondHalf") currentPeriod = "second";
      else currentPeriod = "full";
      // re-render com dados atuais
      if (currentGameId && latestData) setStatsPanel(latestData.statistics || {}, currentPeriod);
    });
  });

  // carregamento inicial (quando a seção entra em viewport)
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadLeagues();
      obs.disconnect();
    }
  }, { threshold: 0.1 });
  obs.observe(radarSection);
});
