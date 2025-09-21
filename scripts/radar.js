// radar.js
document.addEventListener("DOMContentLoaded", function () {
    const RADAR_API = "https://radar-ia-backend.onrender.com"; // <--- substitua pelo seu backend
    const radarSection = document.getElementById("radar-ia-section");
    if (!radarSection) return;

    const leagueSelect = document.getElementById("radar-league-select");
    const gameSelect = document.getElementById("radar-game-select");
    const dashboard = document.getElementById("radar-dashboard");
    const scoreEl = document.getElementById("radar-score");
    const minuteEl = document.getElementById("radar-minute");
    const homeTeamEl = document.getElementById("home-team-name");
    const awayTeamEl = document.getElementById("away-team-name");
    const eventsEl = document.getElementById("radar-events");
    const stoppageBox = document.getElementById("stoppage-time-prediction");
    const stoppageVal = document.getElementById("stoppage-time-value");
    const tabs = document.querySelectorAll(".period-btn");
    const statElements = {
        possession: document.getElementById("stat-possession"),
        shots: document.getElementById("stat-shots"),
        corners: document.getElementById("stat-corners"),
        fouls: document.getElementById("stat-fouls"),
        yellow: document.getElementById("stat-yellow-cards"),
        red: document.getElementById("stat-red-cards")
    };

    let interval = null; 
    let currentGameId = null; 
    let currentPeriod = "full";

    const loadLeagues = async () => {
        if (!leagueSelect) return;
        leagueSelect.disabled = true;
        leagueSelect.innerHTML = `<option>Carregando ligas...</option>`;
        try {
            const r = await fetch(`${RADAR_API}/ligas`);
            const data = await r.json();
            leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
            data.forEach(l => leagueSelect.add(new Option(`${l.name} - ${l.country || ''}`, l.id)));
            leagueSelect.disabled = false;
        } catch (e) {
            console.error("loadLeagues", e);
            leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
        }
    };

    const loadGames = async (leagueId) => {
        if (!gameSelect) return;
        gameSelect.disabled = true;
        gameSelect.innerHTML = `<option>Carregando jogos ao vivo...</option>`;
        try {
            const r = await fetch(`${RADAR_API}/jogos-aovivo?league=${encodeURIComponent(leagueId)}`);
            const data = await r.json();
            if (!data || data.length === 0) {
                gameSelect.innerHTML = `<option value="">Nenhum jogo ao vivo</option>`;
                return;
            }
            gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
            data.forEach(g => gameSelect.add(new Option(g.title, g.game_id)));
            gameSelect.disabled = false;
        } catch (e) {
            console.error("loadGames", e);
            gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
        }
    };

    function formatTimeLabel(ev) {
        if (!ev) return "-";
        if (ev.display_time) return ev.display_time;
        if (ev.raw && ev.raw.time) {
            const t = ev.raw.time, elapsed = t.elapsed, sec = t.second, extra = t.extra;
            if (elapsed == null) return "-";
            if (extra != null) return `${elapsed}+${extra}' ${sec ? sec + '"' : ""}`;
            return `${elapsed}'`;
        }
        return "-";
    }

    function iconFor(cat) {
        const c = (cat || "").toLowerCase();
        if (c.includes("goal")) return "⚽";
        if (c.includes("yellow")) return "🟨";
        if (c.includes("red")) return "🟥";
        if (c.includes("sub") || c.includes("substitution")) return "🔁";
        if (c.includes("shot") || c.includes("on target")) return "🎯";
        if (c.includes("corner")) return "🚩";
        if (c.includes("foul")) return "🛑";
        return "•";
    }

    function renderEvents(events) {
        eventsEl.innerHTML = "";
        if (!events || events.length === 0) { 
            eventsEl.innerHTML = "<li>Nenhum evento recente</li>"; 
            return; 
        }
        events.forEach(ev => {
            const li = document.createElement("li");
            li.className = "flex items-start gap-2 py-1";
            const timeLabel = formatTimeLabel(ev);
            const icon = iconFor(ev.category || ev.type || ev.detail);
            const player = ev.player ? ` — ${ev.player}` : "";
            const team = ev.team ? ` (${ev.team})` : "";
            li.innerHTML = `<span class="font-semibold text-slate-200">${timeLabel}</span>
                            <span class="ml-2">${icon}</span>
                            <div class="ml-2 text-sm text-slate-300">${ev.type || ''} ${ev.detail ? `— ${ev.detail}` : ''}${player}${team}</div>`;
            eventsEl.appendChild(li);
        });
    }

    function setStatsPanel(statObj, periodKey="full") {
        if (!statObj) { 
            Object.values(statElements).forEach(el => el && (el.textContent="-")); 
            return; 
        }
        const full = statObj.full || {};
        let srcHome = full.home || {}, srcAway = full.away || {};
        if (periodKey === "firstHalf" && statObj.firstHalf_derived) { 
            srcHome = statObj.firstHalf_derived.home || {}; 
            srcAway = statObj.firstHalf_derived.away || {};
        } else if (periodKey === "secondHalf" && statObj.secondHalf_derived) { 
            srcHome = statObj.secondHalf_derived.home || {}; 
            srcAway = statObj.secondHalf_derived.away || {};
        }
        const parsePoss = v => { 
            if (v == null) return "-"; 
            if (typeof v === "string" && v.includes("%")) return v; 
            return `${v}%`; 
        };
        if (statElements.possession) statElements.possession.textContent = parsePoss(srcHome.possession) || "-";
        if (statElements.shots) statElements.shots.textContent = `${srcHome.total_shots ?? "-"} / ${srcAway.total_shots ?? "-"}`;
        if (statElements.corners) statElements.corners.textContent = `${srcHome.corners ?? "-"} / ${srcAway.corners ?? "-"}`;
        if (statElements.fouls) statElements.fouls.textContent = `${srcHome.fouls ?? "-"} / ${srcAway.fouls ?? "-"}`;
        if (statElements.yellow) statElements.yellow.textContent = `${srcHome.yellow_cards ?? srcHome.yellow ?? "-"} / ${srcAway.yellow_cards ?? srcAway.yellow ?? "-"}`;
        if (statElements.red) statElements.red.textContent = `${srcHome.red_cards ?? srcHome.red ?? "-"} / ${srcAway.red_cards ?? srcAway.red ?? "-"}`;
    }

    async function fetchAndRender(gameId) {
        try {
            const r = await fetch(`${RADAR_API}/stats-aovivo/${encodeURIComponent(gameId)}?sport=football`);
            if (!r.ok) throw new Error("Erro stats");
            const data = await r.json();
            const fixture = data.fixture || {};
            const teams = data.teams || {};
            const home = teams.home || {}, away = teams.away || {};
            homeTeamEl.textContent = home.name || "Time Casa"; 
            awayTeamEl.textContent = away.name || "Time Fora";
            const goals = data.score || fixture.goals || {};
            const h = (data.score && data.score.home!=null) ? data.score.home : (goals.home!=null ? goals.home : "-");
            const a = (data.score && data.score.away!=null) ? data.score.away : (goals.away!=null ? goals.away : "-");
            scoreEl.textContent = `${h} - ${a}`;
            const elapsed = (data.status && data.status.elapsed) || (fixture && fixture.status && fixture.status.elapsed);
            minuteEl.textContent = elapsed ? `${elapsed}'` : "-";
            if (data.estimated_extra) { 
                stoppageBox.classList.remove("hidden"); 
                stoppageVal.textContent = data.estimated_extra; 
            } else stoppageBox.classList.add("hidden");
            setStatsPanel(data.statistics, currentPeriod === "firstHalf" ? "firstHalf" : (currentPeriod === "secondHalf" ? "secondHalf" : "full"));
            renderEvents(data.events || []);
            dashboard.classList.remove("hidden");
        } catch (e) {
            console.error("fetchAndRender", e);
            dashboard.classList.add("hidden");
        }
    }

    gameSelect && gameSelect.addEventListener("change", (e) => {
        const id = e.target.value;
        clearInterval(interval);
        if (!id) { dashboard.classList.add("hidden"); return; }
        currentGameId = id;
        fetchAndRender(currentGameId);
        interval = setInterval(() => fetchAndRender(currentGameId), 60000); // agora 60s
    });

    leagueSelect && leagueSelect.addEventListener("change", (e) => {
        const id = e.target.value;
        if (!id) return;
        loadGames(id);
    });

    tabs.forEach(btn => {
        btn.addEventListener("click", () => {
            tabs.forEach(b => b.classList.remove("bg-cyan-600","text-white"));
            btn.classList.add("bg-cyan-600","text-white");
            const target = btn.dataset.period;
            if (target === "firstHalf") currentPeriod = "firstHalf";
            else if (target === "secondHalf") currentPeriod = "secondHalf";
            else currentPeriod = "full";
            if (currentGameId) fetchAndRender(currentGameId);
        });
    });

    const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { loadLeagues(); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(radarSection);
});
