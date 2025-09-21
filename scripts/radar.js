// radar.js - atualizado para casar com radar_ia.py
// - 60s refresh
// - fallback para derived periods (soma 1T + 2T) quando full stats não estiverem disponíveis
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

  // try to compute full stat from firstHalf + secondHalf if missing
  function deriveFullFromPeriods(statsObj, side, candidates) {
    try {
      const first = (statsObj.firstHalf_derived && statsObj.firstHalf_derived[side]) || {};
      const second = (statsObj.secondHalf_derived && statsObj.secondHalf_derived[side]) || {};
      // candidates holds possible key names but derived period keys are generally normalized like "shots","corners"
      // try common normalized keys first
      for (const k of candidates) {
        // attempt normalized key forms
        const nk = k.toLowerCase().replace(/\s|%|_/g, "");
        // check in first/second with relaxed keys
        const firstVal = first[nk] != null ? first[nk] : (first[k] != null ? first[k] : null);
        const secondVal = second[nk] != null ? second[nk] : (second[k] != null ? second[k] : null);
        if (firstVal != null || secondVal != null) {
          const a = (firstVal == null ? 0 : Number(firstVal)) + (secondVal == null ? 0 : Number(secondVal));
          return a;
        }
      }
    } catch (err) { /* ignore */ }
    return null;
  }

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
    // ensure newest first (backend already sorts, but safe)
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

  // candidate lists (expanded to include variants observed in API)
  const possessionCandidates = ["possession","ball possession","ball possession%","possession%","possession %"];
  const totalShotsCandidates = ["total_shots","total shots","totalshots","total shots","total shots"];
  const onTargetCandidates = ["shots_on_goal","shots on goal","shots_on_target","shots on target","shots on goal"];
  const cornersCandidates = ["corner kicks","corner_kicks","cornerkicks","corner kicks","corners","corner"];
  const foulsCandidates = ["fouls","foul"];
  const yellowCandidates = ["yellow_cards","yellow cards","yellow card","yellow","yellow_cards"];
  const redCandidates = ["red_cards","red cards","red card","red"];

  function getValWithFallback(statsObj, sideObj, side, candidates, periodKey) {
    // 1) try pick from chosen source (sideObj)
    const v = pickStat(sideObj, candidates);
    if (v != null && v !== undefined) return v;

    // 2) if showing full, try to derive from periods sums
    if (periodKey === "full" && statsObj) {
      const derived = deriveFullFromPeriods(statsObj, side, candidates);
      if (derived != null) return derived;
    }

    // 3) as last resort, maybe statsObj has normalized fields under full with different keys -> try pickStat on full normalized
    if (statsObj && statsObj.full && statsObj.full[side]) {
      const alt = pickStat(statsObj.full[side], candidates);
      if (alt != null) return alt;
    }

    return null;
  }

  function setStatsPanel(statsObj = {}, periodKey = "full") {
    if (!statsObj) {
      [statPossEl, statShotsEl, statCornersEl, statFoulsEl, statYellowEl, statRedEl].forEach(el => el && (el.textContent = "-"));
      return;
    }

    let source = null;
    if (periodKey === "first") source = statsObj.firstHalf_derived || statsObj.first || {};
    else if (periodKey === "second") source = statsObj.secondHalf_derived || statsObj.second || {};
    else source = statsObj.full || {};

    const home = (source && source.home) || {};
    const away = (source && source.away) || {};

    // Possession
    const hPoss = getValWithFallback(statsObj, home, "home", possessionCandidates, periodKey);
    const aPoss = getValWithFallback(statsObj, away, "away", possessionCandidates, periodKey);
    statPossEl && (statPossEl.textContent = (hPoss != null || aPoss != null) ? `${hPoss ?? "-"} / ${aPoss ?? "-"}` : "-");

    // Shots: try total shots and shots on target
    const hTotal = getValWithFallback(statsObj, home, "home", totalShotsCandidates, periodKey) ?? "-";
    const aTotal = getValWithFallback(statsObj, away, "away", totalShotsCandidates, periodKey) ?? "-";
    const hOn = getValWithFallback(statsObj, home, "home", onTargetCandidates, periodKey) ?? "-";
    const aOn = getValWithFallback(statsObj, away, "away", onTargetCandidates, periodKey) ?? "-";
    statShotsEl && (statShotsEl.textContent = `${hTotal} (${hOn}) / ${aTotal} (${aOn})`);

    // Corners
    const hCorners = getValWithFallback(statsObj, home, "home", cornersCandidates, periodKey) ?? "-";
    const aCorners = getValWithFallback(statsObj, away, "away", cornersCandidates, periodKey) ?? "-";
    statCornersEl && (statCornersEl.textContent = `${hCorners} / ${aCorners}`);

    // Fouls
    const hFouls = getValWithFallback(statsObj, home, "home", foulsCandidates, periodKey) ?? "-";
    const aFouls = getValWithFallback(statsObj, away, "away", foulsCandidates, periodKey) ?? "-";
    statFoulsEl && (statFoulsEl.textContent = `${hFouls} / ${aFouls}`);

    // Cards
    const hY = getValWithFallback(statsObj, home, "home", yellowCandidates, periodKey) ?? "-";
    const aY = getValWithFallback(statsObj, away, "away", yellowCandidates, periodKey) ?? "-";
    statYellowEl && (statYellowEl.textContent = `${hY} / ${aY}`);

    const hR = getValWithFallback(statsObj, home, "home", redCandidates, periodKey) ?? "-";
    const aR = getValWithFallback(statsObj, away, "away", redCandidates, periodKey) ?? "-";
    statRedEl && (statRedEl.textContent = `${hR} / ${aR}`);
  }

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

      const goals = data.score || fixture.goals || {};
      const h = (data.score && data.score.home != null) ? data.score.home : (goals.home != null ? goals.home : "-");
      const a = (data.score && data.score.away != null) ? data.score.away : (goals.away != null ? goals.away : "-");
      scoreEl.textContent = `${h} - ${a}`;

      const elapsed = (data.status && data.status.elapsed) || (fixture && fixture.status && fixture.status.elapsed) || null;
      minuteEl.textContent = elapsed ? `${elapsed}'` : "-";

      if (data.estimated_extra) {
        stoppageBox && stoppageBox.classList.remove("hidden");
        stoppageVal && (stoppageVal.textContent = data.estimated_extra);
      } else {
        stoppageBox && stoppageBox.classList.add("hidden");
      }

      setStatsPanel(data.statistics || {}, currentPeriod);
      renderEvents(data.events || []);
      dashboard && dashboard.classList.remove("hidden");
    } catch (err) {
      console.error("fetchAndRender error", err);
      dashboard && dashboard.classList.add("hidden");
    }
  }

  // handlers
  gameSelect && gameSelect.addEventListener("change", (ev) => {
    const id = ev.target.value;
    clearInterval(updateInterval);
    if (!id) {
      dashboard && dashboard.classList.add("hidden");
      return;
    }
    currentGameId = id;
    fetchAndRender(currentGameId);
    updateInterval = setInterval(() => fetchAndRender(currentGameId), 60000);
  });

  leagueSelect && leagueSelect.addEventListener("change", (ev) => {
    const lid = ev.target.value;
    if (!lid) return;
    loadGames(lid);
  });

  tabs && tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("bg-cyan-600","text-white"));
      btn.classList.add("bg-cyan-600","text-white");
      const p = btn.dataset.period;
      if (p === "firstHalf") currentPeriod = "first";
      else if (p === "secondHalf") currentPeriod = "second";
      else currentPeriod = "full";
      if (latestData) setStatsPanel(latestData.statistics || {}, currentPeriod);
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
