// radar.js - Radar IA atualizado (liga -> jogo, eventos invertidos, ícones, estimated_extra)
document.addEventListener("DOMContentLoaded", function () {
    const radarSection = document.getElementById("radar-ia-section");
    if (!radarSection) return;

    const RADAR_API = "https://radar-ia-backend.onrender.com";
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
    const periodButtons = document.querySelectorAll(".period-btn");

    let interval = null;
    let currentGameId = null;
    let currentPeriod = "fullGame";

    const loadLeagues = async () => {
        if (!leagueSelect) return;
        leagueSelect.disabled = true;
        leagueSelect.innerHTML = `<option>Carregando ligas...</option>`;
        try {
            const resp = await fetch(`${RADAR_API}/ligas`);
            const leagues = await resp.json();
            leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
            leagues.forEach(l => leagueSelect.add(new Option(`${l.name} - ${l.country || ''}`, l.id)));
            leagueSelect.disabled = false;
        } catch (err) {
            console.error(err);
            leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
        }
    };

    const loadGames = async (leagueId) => {
        if (!gameSelect) return;
        gameSelect.disabled = true;
        gameSelect.innerHTML = `<option>Carregando jogos...</option>`;
        try {
            const resp = await fetch(`${RADAR_API}/jogos-aovivo?league=${leagueId}`);
            const games = await resp.json();
            if (!games || games.length === 0) {
                gameSelect.innerHTML = `<option value="">Nenhum jogo ao vivo</option>`;
                return;
            }
            gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
            games.forEach(g => gameSelect.add(new Option(g.title, g.game_id)));
            gameSelect.disabled = false;
        } catch (err) {
            console.error(err);
            gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
        }
    };

    const iconForCategory = (cat) => {
        const c = (cat || "").toLowerCase();
        if (c.includes("goal")) return "⚽";
        if (c.includes("yellow")) return "🟨";
        if (c.includes("red")) return "🟥";
        if (c.includes("sub") || c.includes("substitution")) return "🔁";
        if (c.includes("shot") || c.includes("target") || c.includes("on target")) return "🎯";
        if (c.includes("corner")) return "� flag" /* fallback, replaced below */;
        if (c.includes("foul")) return "🛑";
        if (c.includes("injury") || c.includes("interruption")) return "⛑️";
        return "•";
    };

    // fallback for corner icon
    const cornerIcon = "🚩";

    const renderStats = (data) => {
        homeTeamEl.textContent = data.teams?.home?.name || "Time Casa";
        awayTeamEl.textContent = data.teams?.away?.name || "Time Fora";
        scoreEl.textContent = `${data.goals?.home ?? 0} - ${data.goals?.away ?? 0}`;
        minuteEl.textContent = data.fixture?.status?.elapsed ? `${data.fixture.status.elapsed}'` : "-";

        // stoppage time
        if (data.estimated_extra) {
            stoppageBox.classList.remove("hidden");
            stoppageVal.textContent = data.estimated_extra;
        } else {
            stoppageBox.classList.add("hidden");
        }

        // mostrar estatísticas resumidas (se houver)
        // seu HTML já tem elementos com ids: stat-possession, stat-shots, stat-corners, stat-fouls, stat-yellow-cards, stat-red-cards
        const stats = data.statistics || {};
        try {
            const home = stats.home || {};
            const away = stats.away || {};
            const setIfExist = (id, val) => {
                const el = document.getElementById(id);
                if (!el) return;
                el.textContent = val !== undefined && val !== null ? val : "-";
            };
            // tentar extrair valores comuns
            setIfExist("stat-possession", (home.possession || "-") + (away.possession ? ` / ${away.possession}` : ""));
            setIfExist("stat-shots", (home.shots_on_goal || home.shots || "-") + (away.shots_on_goal ? ` / ${away.shots_on_goal}` : ""));
            setIfExist("stat-corners", (home.corner || home.corners || "-") + (away.corner ? ` / ${away.corner}` : ""));
            setIfExist("stat-fouls", (home.fouls || "-") + (away.fouls ? ` / ${away.fouls}` : ""));
            setIfExist("stat-yellow-cards", (home.yellow_cards || home.yellowcard || "-") + (away.yellow_cards ? ` / ${away.yellow_cards}` : ""));
            setIfExist("stat-red-cards", (home.red_cards || home.redcard || "-") + (away.red_cards ? ` / ${away.red_cards}` : ""));
        } catch (e) {
            console.warn("Erro ao renderizar estatísticas:", e);
        }

        // events (já ordenados no backend: mais recentes primeiro)
        eventsEl.innerHTML = "";
        const evs = data.events || [];
        if (evs.length === 0) {
            eventsEl.innerHTML = "<li>Nenhum evento recente</li>";
        } else {
            evs.forEach(ev => {
                const li = document.createElement("li");
                li.className = "flex items-start gap-2 py-1";
                const icon = ev.category && ev.category.toLowerCase().includes("corner") ? cornerIcon : iconForCategory(ev.category);
                const time = ev.display_time || (ev.raw && ev.raw.time && ev.raw.time.elapsed ? `${ev.raw.time.elapsed}'` : "-");
                const player = ev.player ? ` — ${ev.player}` : "";
                const team = ev.team ? ` (${ev.team})` : "";
                li.innerHTML = `<span class="font-semibold">${time}</span>
                                <span class="ml-2">${icon}</span>
                                <div class="ml-2 text-sm text-slate-300">${ev.type || ""} ${ev.detail ? ` — ${ev.detail}` : ""}${player}${team}</div>`;
                eventsEl.appendChild(li);
            });
        }

        // mostrar painel
        dashboard.classList.remove("hidden");
    };

    const fetchGame = async (gameId) => {
        try {
            const resp = await fetch(`${RADAR_API}/stats-aovivo/${gameId}`);
            if (!resp.ok) throw new Error("Erro ao buscar stats");
            const data = await resp.json();
            renderStats(data);
        } catch (err) {
            console.error("Erro ao carregar estatísticas:", err);
            dashboard.classList.add("hidden");
            clearInterval(interval);
        }
    };

    // UI events
    leagueSelect && leagueSelect.addEventListener("change", (e) => {
        const lid = e.target.value;
        if (!lid) return;
        loadGames(lid);
    });

    gameSelect && gameSelect.addEventListener("change", (e) => {
        const id = e.target.value;
        clearInterval(interval);
        if (!id) {
            dashboard.classList.add("hidden");
            return;
        }
        currentGameId = id;
        fetchGame(currentGameId);
        interval = setInterval(() => fetchGame(currentGameId), 35000);
    });

    periodButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // toggling visual active class
            periodButtons.forEach(b => b.classList.remove("bg-cyan-600","text-white"));
            btn.classList.add("bg-cyan-600","text-white");
            currentPeriod = btn.dataset.period;
            // currently backend returns stats aggregated; if we expand to period-specific, we would re-render here
        });
    });

    // load leagues when section appears
    const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadLeagues();
            obs.disconnect();
        }
    }, { threshold: 0.1 });
    obs.observe(radarSection);
});
