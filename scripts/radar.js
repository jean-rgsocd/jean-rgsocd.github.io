// radar.js - versão simplificada SEM Half-Time
document.addEventListener("DOMContentLoaded", () => {
  const RADAR_API = "https://radar-ia-backend.onrender.com";
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

  const statPossEl   = document.getElementById("stat-possession");
  const statShotsEl  = document.getElementById("stat-shots");
  const statCornersEl= document.getElementById("stat-corners");
  const statFoulsEl  = document.getElementById("stat-fouls");
  const statYellowEl = document.getElementById("stat-yellow-cards");
  const statRedEl    = document.getElementById("stat-red-cards");
  const statDangerEl = document.getElementById("stat-dangerous-attacks"); // NOVO

  let currentGameId = null;
  let updateInterval = null;

  // ----------------------
  // utils
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
  function getVal(sideObj, candidates) {
    return pickStat(sideObj, candidates) ?? "-";
  }

  function iconFor(cat = "") {
    const c = (cat || "").toLowerCase();
    if (c.includes("goal")) return "⚽";
    if (c.includes("penalty")) return "🥅";
    if (c.includes("freekick") || c.includes("free kick")) return "🎯";
    if (c.includes("yellow")) return "🟨";
    if (c.includes("red")) return "🟥";
    if (c.includes("sub")) return "🔁";
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

  // ----------------------
  // candidatos
  const possessionCandidates = ["possession","ball possession","ball possession%","possession%","possession %"];
  const totalShotsCandidates = ["total_shots","total shots"];
  const onTargetCandidates   = ["shots_on_goal","shots on goal"];
  const offTargetCandidates  = ["shots_off_goal","shots off goal"];
  const blockedCandidates    = ["shots_blocked","blocked shots"];
  const cornersCandidates    = ["corner kicks","corner_kicks","corners","corner"];
  const foulsCandidates      = ["fouls","foul"];
  const yellowCandidates     = ["yellow_cards","yellow cards","yellow"];
  const redCandidates        = ["red_cards","red cards","red"];
  const dangerCandidates     = ["dangerous_attacks","dangerous attacks","attacks dangerous"]; // NOVO

  function setStatsPanel(statsObj = {}) {
    if (!statsObj || !statsObj.home || !statsObj.away) {
      [statPossEl, statShotsEl, statCornersEl, statFoulsEl, statYellowEl, statRedEl, statDangerEl]
        .forEach(el => el && (el.textContent = "-"));
      return;
    }

    const home = statsObj.home || {};
    const away = statsObj.away || {};

    statPossEl.textContent =
      `${getVal(home, possessionCandidates)} / ${getVal(away, possessionCandidates)}`;

    statShotsEl.textContent =
      `${getVal(home, totalShotsCandidates)} ` +
      `(${getVal(home, onTargetCandidates)} no gol / ` +
      `${getVal(home, offTargetCandidates)} fora / ` +
      `${getVal(home, blockedCandidates)} bloqueadas)` +
      ` / ` +
      `${getVal(away, totalShotsCandidates)} ` +
      `(${getVal(away, onTargetCandidates)} no gol / ` +
      `${getVal(away, offTargetCandidates)} fora / ` +
      `${getVal(away, blockedCandidates)} bloqueadas)`;

    statCornersEl.textContent =
      `${getVal(home, cornersCandidates)} / ${getVal(away, cornersCandidates)}`;

    statFoulsEl.textContent =
      `${getVal(home, foulsCandidates)} / ${getVal(away, foulsCandidates)}`;

    statYellowEl.textContent =
      `${getVal(home, yellowCandidates)} / ${getVal(away, yellowCandidates)}`;

    statRedEl.textContent =
      `${getVal(home, redCandidates)} / ${getVal(away, redCandidates)}`;

    statDangerEl.textContent =
      `${getVal(home, dangerCandidates)} / ${getVal(away, dangerCandidates)}`;
  }

  // ----------------------
  // carregar ligas
  async function loadLeagues() {
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
    }
  }

  // carregar jogos
  async function loadGames(leagueId = null) {
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
      gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
    }
  }

  // ----------------------
  async function fetchStats(gameId) {
    let url = `${RADAR_API}/stats-aovivo/${encodeURIComponent(gameId)}?sport=football`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Erro ao buscar stats");
    return await r.json();
  }

  async function fetchAndRender(gameId) {
    if (!gameId) return;
    try {
      const data = await fetchStats(gameId);

      const fixture = data.fixture || {};
      const teams = data.teams || {};
      homeTeamEl.textContent = teams.home?.name || "Time Casa";
      awayTeamEl.textContent = teams.away?.name || "Time Fora";

      scoreEl.textContent = `${data.score?.home ?? fixture.goals?.home ?? "-"} - ${data.score?.away ?? fixture.goals?.away ?? "-"}`;
      minuteEl.textContent = data.status?.elapsed ? `${data.status.elapsed}'` : "-";

      if (data.estimated_extra) {
        stoppageBox.classList.remove("hidden");
        stoppageBox.querySelector("p").innerHTML = `<span class="font-semibold">Estimativa de Acréscimo Ao Vivo:</span> ${data.estimated_extra} minutos`;
      } else {
        stoppageBox.classList.add("hidden");
      }

      setStatsPanel(data.statistics || {});
      renderEvents(data.events || []);
      dashboard?.classList.remove("hidden");
    } catch (err) {
      console.error("fetchAndRender error", err);
      dashboard?.classList.add("hidden");
    }
  }

  // ----------------------
  // eventos
  gameSelect?.addEventListener("change", (ev) => {
    const id = ev.target.value;
    clearInterval(updateInterval);
    if (!id) {
      dashboard.classList.add("hidden");
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

  // ----------------------
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadLeagues();
      obs.disconnect();
    }
  }, { threshold: 0.1 });
  obs.observe(radarSection);
});
