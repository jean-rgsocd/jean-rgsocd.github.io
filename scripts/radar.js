// radar.js - atualizado para casar com radar_ia.py
// - 60s refresh
// - busca stats direto da API por período (full, first, second)
// - eventos com display_time (minuto/seg) e categoria
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

  const statPossEl   = document.getElementById("stat-possession");
  const statShotsEl  = document.getElementById("stat-shots");
  const statCornersEl= document.getElementById("stat-corners");
  const statFoulsEl  = document.getElementById("stat-fouls");
  const statYellowEl = document.getElementById("stat-yellow-cards");
  const statRedEl    = document.getElementById("stat-red-cards");

  let currentGameId = null;
  let currentPeriod = "full"; // "full", "first", "second"
  let updateInterval = null;
  let latestData = null;

  // helpers
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

  function iconFor(cat = "") {
    const c = (cat || "").toLowerCase();
    if (c.includes("goal")) return "⚽";
    if (c.includes("penalty")) return "🥅";
    if (c.includes("freekick") || c.includes("free kick")) return "🎯";
    if (c.includes("yellow")) return "🟨";
    if (c.includes("red")) return "🟥";
    if (c.includes("sub")) return "🔁";
    if (c.includes("shot") || c.includes("on target")) return "🎯";
    if (c.includes("corner")) return "🚩";
    if (c.includes("foul")) return "🛑";
    return "•";
  }

  function formatRawTime(t = {}) {
    if (!t) return "-";
    const elapsed = t.elapsed;
    const sec = (t.second != null) ? `${String(t.second).padStart(2,'0')}"` : "";
    const extra = t.extra ? `+${t.extra}` : "";
    if (elapsed == null) return "-";
    return `${elapsed}${extra}' ${sec}`;
  }

  function renderEvents(events = []) {
    eventsEl.innerHTML = "";
    if (!events || events.length === 0) {
      eventsEl.innerHTML = "<li>Nenhum evento recente</li>";
      return;
    }
    // mais recentes primeiro
    events = events.slice().sort((a,b) => (b._sort || 0) - (a._sort || 0));
    events.forEach(ev => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-2 py-1";

      const timeLabel = ev.display_time || (ev.raw && ev.raw.time ? formatRawTime(ev.raw.time) : "-");
      const icon = iconFor(ev.category || ev.type || ev.detail || "");
      const detail = ev.detail ? ` — ${ev.detail}` : "";
      const player = ev.player ? ` — ${ev.player}` : "";
      const team = ev.team ? ` (${ev.team})` : "";

      li.innerHTML = `<span class="font-semibold text-slate-200">${timeLabel}</span>
                      <span class="ml-2">${icon}</span>
                      <div class="ml-2 text-sm text-slate-300">${(ev.type || '')}${detail}${player}${team}</div>`;
      eventsEl.appendChild(li);
    });
  }

  // listas de candidatos (nomes possíveis vindos da API)
  const possessionCandidates = ["possession","ball possession","ball possession%","possession%","possession %"];
  const totalShotsCandidates = ["total_shots","total shots","totalshots","total shots"];
  const onTargetCandidates   = ["shots_on_goal","shots on goal","shots_on_target","shots on target"];
  const cornersCandidates    = ["corner kicks","corner_kicks","cornerkicks","corners","corner"];
  const foulsCandidates      = ["fouls","foul"];
  const yellowCandidates     = ["yellow_cards","yellow cards","yellow card","yellow"];
  const redCandidates        = ["red_cards","red cards","red card","red"];

  function getValWithFallback(statsObj, sideObj, side, candidates) {
    return pickStat(sideObj, candidates) ?? "-";
  }

  function setStatsPanel(statsObj = {}, periodKey = "full") {
    if (!statsObj) {
      [statPossEl, statShotsEl, statCornersEl, statFoulsEl, statYellowEl, statRedEl]
        .forEach(el => el && (el.textContent = "-"));
      return;
    }

    let source = statsObj[periodKey] || statsObj.full || {};
    const home = (source && source.home) || {};
    const away = (source && source.away) || {};

    // Possession
    const hPoss = getValWithFallback(statsObj, home, "home", possessionCandidates);
    const aPoss = getValWithFallback(statsObj, away, "away", possessionCandidates);
    statPossEl && (statPossEl.textContent = `${hPoss} / ${aPoss}`);

    // Shots
    const hTotal = getValWithFallback(statsObj, home, "home", totalShotsCandidates);
    const aTotal = getValWithFallback(statsObj, away, "away", totalShotsCandidates);
    const hOn = getValWithFallback(statsObj, home, "home", onTargetCandidates);
    const aOn = getValWithFallback(statsObj, away, "away", onTargetCandidates);
    statShotsEl && (statShotsEl.textContent = `${hTotal} (${hOn}) / ${aTotal} (${aOn})`);

    // Corners
    const hCorners = getValWithFallback(statsObj, home, "home", cornersCandidates);
    const aCorners = getValWithFallback(statsObj, away, "away", cornersCandidates);
    statCornersEl && (statCornersEl.textContent = `${hCorners} / ${aCorners}`);

    // Fouls
    const hFouls = getValWithFallback(statsObj, home, "home", foulsCandidates);
    const aFouls = getValWithFallback(statsObj, away, "away", foulsCandidates);
    statFoulsEl && (statFoulsEl.textContent = `${hFouls} / ${aFouls}`);

    // Cards
    const hY = getValWithFallback(statsObj, home, "home", yellowCandidates);
    const aY = getValWithFallback(statsObj, away, "away", yellowCandidates);
    statYellowEl && (statYellowEl.textContent = `${hY} / ${aY}`);

    const hR = getValWithFallback(statsObj, home, "home", redCandidates);
    const aR = getValWithFallback(statsObj, away, "away", redCandidates);
    statRedEl && (statRedEl.textContent = `${hR} / ${aR}`);
  }

  // carregar ligas
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

  // carregar jogos ao vivo
  async function loadGames(leagueId = null) {
    if (!gameSelect) return;
    gameSelect.disabled = true;
    gameSelect.innerHTML = `<option>Carregando jogos ao vivo...</option>`;
    try {
      const url = leagueId
        ? `${RADAR_API}/jogos-aovivo?league=${encodeURIComponent(leagueId)}`
        : `${RADAR_API}/jogos-aovivo`;
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

  // buscar estatísticas por período
  async function fetchStatsByPeriod(gameId, periodKey = "full") {
    let url = `${RADAR_API}/stats-aovivo/${encodeURIComponent(gameId)}?sport=football`;
    if (periodKey === "first") url += "&period=first";
    else if (periodKey === "second") url += "&period=second";
    const r = await fetch(url);
    if (!r.ok) throw new Error("Erro ao buscar stats");
    return await r.json();
  }

  // buscar dados e renderizar
  async function fetchAndRender(gameId) {
    if (!gameId) return;
    try {
      const data = await fetchStatsByPeriod(gameId, currentPeriod);
      latestData = data;

      const fixture = data.fixture || {};
      const teams = data.teams || {};
      const home = teams.home || {};
      const away = teams.away || {};

      homeTeamEl.textContent = home.name || "Time Casa";
      awayTeamEl.textContent = away.name || "Time Fora";

      const goals = data.score || fixture.goals || {};
      const h = (data.score && data.score.home != null) ? data.score.home : (goals.home ?? "-");
      const a = (data.score && data.score.away != null) ? data.score.away : (goals.away ?? "-");
      scoreEl.textContent = `${h} - ${a}`;

      const elapsed = (data.status && data.status.elapsed) || (fixture.status && fixture.status.elapsed) || null;
      minuteEl.textContent = elapsed ? `${elapsed}'` : "-";

      if (data.estimated_extra) {
        stoppageBox?.classList.remove("hidden");
        stoppageVal && (stoppageVal.textContent = data.estimated_extra);
      } else {
        stoppageBox?.classList.add("hidden");
      }

      setStatsPanel(data.statistics || {}, currentPeriod);
      renderEvents(data.events || []);
      dashboard?.classList.remove("hidden");
    } catch (err) {
      console.error("fetchAndRender error", err);
      dashboard?.classList.add("hidden");
    }
  }

  // handlers
  gameSelect?.addEventListener("change", (ev) => {
    const id = ev.target.value;
    clearInterval(updateInterval);
    if (!id) {
      dashboard?.classList.add("hidden");
      return;
    }
    currentGameId = id;
    fetchAndRender(currentGameId);
    updateInterval = setInterval(() => fetchAndRender(currentGameId), 60000);
  });

  leagueSelect?.addEventListener("change", (ev) => {
    const lid = ev.target.value;
    if (!lid) return;
    loadGames(lid);
  });

  tabs?.forEach(btn => {
    btn.addEventListener("click", async () => {
      tabs.forEach(b => b.classList.remove("bg-cyan-600", "text-white"));
      btn.classList.add("bg-cyan-600", "text-white");

      const p = btn.dataset.period;
      if (p === "firstHalf") currentPeriod = "first";
      else if (p === "secondHalf") currentPeriod = "second";
      else currentPeriod = "full";

      if (currentGameId) {
        try {
          const data = await fetchStatsByPeriod(currentGameId, currentPeriod);
          latestData = data;
          setStatsPanel(data.statistics || {}, currentPeriod);
        } catch (err) {
          console.error("Erro ao trocar período", err);
        }
      }
    });
  });

  // carregar ligas assim que a seção entrar na tela
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadLeagues();
      obs.disconnect();
    }
  }, { threshold: 0.1 });
  obs.observe(radarSection);
});
