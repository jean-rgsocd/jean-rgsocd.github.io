// radar.js - Radar IA frontend (exibir mais campos, 1T/2T, eventos em ordem decrescente)
document.addEventListener("DOMContentLoaded", () => {
    const radarSection = document.getElementById("radar-ia-section");
    if (!radarSection) return;

    const RADAR_API = "https://radar-ia-backend.onrender.com"; // ajuste se precisar
    const leagueSelect = document.getElementById("radar-league-select");
    const gameSelect = document.getElementById("radar-game-select");
    const dashboard = document.getElementById("radar-dashboard");
    const scoreEl = document.getElementById("radar-score");
    const minuteEl = document.getElementById("radar-minute");
    const homeTeamEl = document.getElementById("home-team-name");
    const awayTeamEl = document.getElementById("away-team-name");
    const eventsEl = document.getElementById("radar-events");
    const statElements = {
        possession: document.getElementById("stat-possession"),
        shots: document.getElementById("stat-shots"),
        corners: document.getElementById("stat-corners"),
        fouls: document.getElementById("stat-fouls"),
        yellow: document.getElementById("stat-yellow-cards"),
        red: document.getElementById("stat-red-cards")
    };
    const tabs = document.querySelectorAll(".period-btn");

    let currentGameId = null;
    let interval = null;
    let currentPeriod = "full"; // "firstHalf", "secondHalf", "full"

    function formatTimeLabel(ev) {
        // prefer e.display_time, else build from ev.time.elapsed and ev.time.extra
        if (!ev) return "-";
        if (ev.display_time) return ev.display_time;
        const t = ev.time || {};
        const elapsed = t.elapsed;
        const extra = t.extra;
        if (elapsed == null) return "-";
        if (extra != null) {
            // try show minutes'seconds if available (some APIs include extra seconds)
            return `${elapsed}' ${extra}"`;
        }
        return `${elapsed}'`;
    }

    function mapEventCategory(ev) {
        const type = (ev.type||"").toLowerCase();
        const detail = (ev.detail||"").toLowerCase();
        if (type.includes("goal") || detail.includes("goal")) return "Goal";
        if (type.includes("card") || detail.includes("yellow") || detail.includes("red")) {
            if (detail.includes("red")) return "Red Card";
            return "Yellow Card";
        }
        if (type.includes("subst") || detail.includes("substitution")) return "Substitution";
        if (type.includes("var") || detail.includes("var")) return "VAR";
        if (detail.includes("corner") || type.includes("corner")) return "Corner";
        if (detail.includes("offside") || type.includes("offside")) return "Offside";
        if (detail.includes("foul") || type.includes("foul")) return "Foul";
        if (detail.includes("shot") || type.includes("shot")) {
            if (detail.includes("on target") || detail.includes("goal")) return "Shot on Target";
            return "Shot";
        }
        // fallback
        return ev.type || ev.detail || "Evento";
    }

    function renderEvents(events) {
        eventsEl.innerHTML = "";
        if (!events || events.length === 0) {
            eventsEl.innerHTML = "<li>Nenhum evento recente</li>";
            return;
        }
        // events are expected sorted DESC by backend; ensure that
        events.forEach(ev => {
            const li = document.createElement("li");
            li.className = "truncate py-1 flex items-start gap-2";
            const timeLabel = formatTimeLabel(ev);
            const cat = mapEventCategory(ev);
            const teamName = (ev.team && ev.team.name) ? ` — ${ev.team.name}` : "";
            const playerName = (ev.player && ev.player.name) ? ` — ${ev.player.name}` : "";
            li.innerHTML = `<span class="font-semibold mr-2 text-slate-200">${timeLabel}</span>
                            <span class="text-sm text-cyan-300 mr-2">${cat}</span>
                            <span class="text-xs text-slate-400">${ev.detail || ev.type || ''}${playerName}${teamName}</span>`;
            eventsEl.appendChild(li);
        });
    }

    function setStatsPanel(statsObj, periodKey = "full") {
        // statsObj: { full: {home:{...}, away:{...}}, firstHalf_derived: {...}, secondHalf_derived: {...} }
        if (!statsObj) {
            Object.values(statElements).forEach(el => el.textContent = "-");
            return;
        }
        const home = statsObj.full && statsObj.full.home ? statsObj.full.home : {};
        const away = statsObj.full && statsObj.full.away ? statsObj.full.away : {};
        let srcHome = home, srcAway = away;
        if (periodKey === "firstHalf" && statsObj.firstHalf_derived) {
            srcHome = statsObj.firstHalf_derived.home || {};
            srcAway = statsObj.firstHalf_derived.away || {};
        } else if (periodKey === "secondHalf" && statsObj.secondHalf_derived) {
            srcHome = statsObj.secondHalf_derived.home || {};
            srcAway = statsObj.secondHalf_derived.away || {};
        }
        // Possession may be in "possession" as percentage string or int
        const parsePoss = v => {
            if (v == null) return "-";
            if (typeof v === "string" && v.indexOf("%")!==-1) return v;
            return `${v}%`;
        };
        statElements.possession.textContent = (parsePoss(srcHome.possession) || "-");
        statElements.shots.textContent = `${srcHome.total_shots ?? "-"} / ${srcAway.total_shots ?? "-"}`;
        statElements.corners.textContent = `${srcHome.corners ?? "-"} / ${srcAway.corners ?? "-"}`;
        statElements.fouls.textContent = `${srcHome.fouls ?? "-"} / ${srcAway.fouls ?? "-"}`;
        statElements.yellow.textContent = `${srcHome.yellow_cards ?? srcHome.yellow ?? "-"} / ${srcAway.yellow_cards ?? srcAway.yellow ?? "-"}`;
        statElements.red.textContent = `${srcHome.red_cards ?? srcHome.red ?? "-"} / ${srcAway.red_cards ?? srcAway.red ?? "-"}`;
    }

    async function fetchAndRender(gameId) {
        try {
            const resp = await fetch(`${RADAR_API}/stats-aovivo/${encodeURIComponent(gameId)}?sport=football`);
            if (!resp.ok) throw new Error("Erro ao buscar dados");
            const data = await resp.json();
            // header info
            const fixture = data.fixture || {};
            const team = data.teams || {};
            const home = team.home || {};
            const away = team.away || {};
            homeTeamEl.textContent = home.name || "Time Casa";
            awayTeamEl.textContent = away.name || "Time Fora";
            // score
            const goals = data.score || data.fixture?.goals || {};
            const h = (goals.home!=null)?goals.home: (data.fixture?.score?.fulltime?.home ?? "-");
            const a = (goals.away!=null)?goals.away: (data.fixture?.score?.fulltime?.away ?? "-");
            scoreEl.textContent = `${h} - ${a}`;
            // minute
            const status = data.status || {};
            const elapsed = status.elapsed || (fixture?.status?.elapsed);
            minuteEl.textContent = elapsed ? `${elapsed}'` : "-";
            // stats
            setStatsPanel(data.statistics, currentPeriod === "firstHalf" ? "firstHalf" : (currentPeriod === "secondHalf" ? "secondHalf" : "full"));
            // events (already sorted desc in backend)
            renderEvents(data.events || []);
            dashboard.classList.remove("hidden");
        } catch (err) {
            console.error("Radar fetch error", err);
            dashboard.classList.add("hidden");
        }
    }

    // handle selects: when a game selected start polling
    gameSelect && gameSelect.addEventListener("change", (e) => {
        const id = e.target.value;
        clearInterval(interval);
        if (!id) { dashboard.classList.add("hidden"); return; }
        currentGameId = id;
        fetchAndRender(currentGameId);
        // events updated often; docs recommend frequent updates - use 15s-30s (be careful with rate limit)
        interval = setInterval(() => fetchAndRender(currentGameId), 15000);
    });

    // tab buttons
    tabs.forEach(btn => {
        btn.addEventListener("click", () => {
            tabs.forEach(b => b.classList.remove("bg-cyan-600","text-white"));
            btn.classList.add("bg-cyan-600","text-white");
            const p = btn.getAttribute("data-period");
            if (p === "firstHalf") currentPeriod = "firstHalf";
            else if (p === "secondHalf") currentPeriod = "secondHalf";
            else currentPeriod = "full";
            // re-render using last-fetched data by calling once
            if (currentGameId) fetchAndRender(currentGameId);
        });
    });

    // observer to lazy-load leagues/games if you want (existing logic)
    // if you previously had code to load leagues/games, keep it; else we rely on server to fill gameSelect
});
