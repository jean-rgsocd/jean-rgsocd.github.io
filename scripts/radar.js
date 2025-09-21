// radar.js - atualizado para separar 1ºT, 2ºT e jogo completo
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
  let firstHalfStats = null; // snapshot do 1º tempo

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

  // candidatos
  const possessionCandidates = ["possession","ball possession","ball possession%","possession%","possession %"];
  const totalShotsCandidates = ["total_shots","total shots","totalshots","total shots"];
  const onTargetCandidates   = ["shots_on_goal","shots on goal","shots_on_target","shots on target"];
  const cornersCandidates    = ["corner kicks","corner_kicks","cornerkicks","corners","corner"];
  const foulsCandidates      = ["fouls","foul"];
  const yellowCandidates     = ["yellow_cards","yellow cards","yellow card","yellow"];
  const redCandidates        = ["red_cards","red cards","red card","red"];

  function getValWithFallback(sideObj, candidates) {
    return pickStat(sideObj, candidates) ?? "-";
  }

  function setStatsPanel(statsObj = {}) {
    if (!statsObj || !statsObj.home || !statsObj.away) {
      [statPossEl, statShotsEl, statCornersEl, statFoulsEl, statYellowEl, statRedEl]
        .forEach(el => el && (el.textContent = "-"));
      return;
    }

    const home = statsObj.home || {};
    const away = statsObj.away || {};

    const hPoss = getValWithFallback(home, possessionCandidates);
    const aPoss = getValWithFallback(away, possessionCandidates);
    statPossEl.textContent = `${hPoss} / ${aPoss}`;

    const hTotal = getValWithFallback(home, totalShotsCandidates);
    const aTotal = getValWithFallback(away, totalShotsCandidates);
    const hOn = getValWithFallback(home, onTargetCandidates);
    const aOn = getValWithFallback(away, onTargetCandidates);
    statShotsEl.textContent = `${hTotal} (${hOn}) / ${aTotal} (${aOn})`;

    const hCorners = getValWithFallback(home, cornersCandidates);
    const aCorners = getValWithFallback(away, cornersCandidates);
    statCornersEl.textContent = `${hCorners} / ${aCorners}`;

    const hFouls = getValWithFallback(home, foulsCandidates);
    const aFouls = getValWithFallback(away, foulsCandidates);
    statFoulsEl.textContent = `${hFouls} / ${aFouls}`;

    const hY = getValWithFallback(home, yellowCandidates);
    const aY = getValWithFallback(away, yellowCandidates);
    statYellowEl.textContent = `${hY} / ${aY}`;

    const hR = getValWithFallback(home, redCandidates);
    const aR = getValWithFallback(away, redCandidates);
    statRedEl.textContent = `${hR} / ${aR}`;
  }

  function computeSecondHalf(fullStats, firstStats) {
    const result = { home: {}, away: {} };
    for (const side of ["home", "away"]) {
      const full = fullStats[side] || {};
      const first = firstStats[side] || {};
      const out = {};
      for (const key in full) {
        const f = Number(full[key] || 0);
        const h1 = Number(first[key] || 0);
        if (!isNaN(f) && !isNaN(h1)) {
          out[key] = f - h1;
        }
      }
      result[side] = out;
    }
    return result;
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

  // carregar jogos
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

  async function fetchStatsByPeriod(gameId) {
    const url = `${RADAR_API}/stats-aovivo/${encodeURIComponent(gameId)}?sport=football`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Erro ao buscar stats");
    return await r.json();
  }

  async function fetchAndRender(gameId) {
    if (!gameId) return;
    try {
      const data = await fetchStatsByPeriod(gameId);
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
        stoppageVal.textContent = data.estimated_extra;
      } else {
        stoppageBox?.classList.add("hidden");
      }

      const fullStats = data.statistics || {};

      // salva snapshot do 1º tempo no intervalo
      if (data.status?.short === "HT" && !firstHalfStats) {
        firstHalfStats = JSON.parse(JSON.stringify(fullStats));
      }

      if (currentPeriod === "first") {
        setStatsPanel(firstHalfStats || fullStats);
      } else if (currentPeriod === "second") {
        if (firstHalfStats) {
          const second = computeSecondHalf(fullStats, firstHalfStats);
          setStatsPanel(second);
        } else {
          setStatsPanel({});
        }
      } else {
        setStatsPanel(fullStats);
      }

      renderEvents(data.events || []);
      dashboard?.classList.remove("hidden");
    } catch (err) {
      console.error("fetchAndRender error", err);
      dashboard?.classList.add("hidden");
    }
  }

  // eventos
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
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("bg-cyan-600", "text-white"));
      btn.classList.add("bg-cyan-600", "text-white");
      const p = btn.dataset.period;
      if (p === "firstHalf") currentPeriod = "first";
      else if (p === "secondHalf") currentPeriod = "second";
      else currentPeriod = "full";
      if (currentGameId) fetchAndRender(currentGameId);
    });
  });

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadLeagues();
      obs.disconnect();
    }
  }, { threshold: 0.1 });
  obs.observe(radarSection);
});
