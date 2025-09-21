// radar.js - Radar IA (liga -> jogo ao vivo -> estatísticas + eventos)
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

    const tab1 = document.getElementById("tab-1t");
    const tab2 = document.getElementById("tab-2t");
    const tabFull = document.getElementById("tab-full");

    let interval = null;
    let currentGameId = null;
    let currentPeriod = "full";

    // -------- Carregar Ligas --------
    const loadLeagues = async () => {
        leagueSelect.disabled = true;
        leagueSelect.innerHTML = `<option>Carregando ligas...</option>`;
        try {
            const resp = await fetch(`${RADAR_API}/ligas`);
            const leagues = await resp.json();
            leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
            leagues.forEach(l => leagueSelect.add(new Option(`${l.name} - ${l.country}`, l.id)));
            leagueSelect.disabled = false;
        } catch (err) {
            leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
            console.error(err);
        }
    };

    // -------- Carregar Jogos --------
    const loadGames = async (leagueId) => {
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
            gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
            console.error(err);
        }
    };

    // -------- Renderizar Estatísticas e Eventos --------
    const renderStats = (data) => {
        homeTeamEl.textContent = data.teams?.home?.name || "Time Casa";
        awayTeamEl.textContent = data.teams?.away?.name || "Time Fora";
        scoreEl.textContent = `${data.goals?.home ?? 0} - ${data.goals?.away ?? 0}`;
        minuteEl.textContent = data.fixture?.status?.elapsed ? `${data.fixture.status.elapsed}'` : "-";

        // Acréscimos
        if (data.estimated_extra) {
            stoppageBox.classList.remove("hidden");
            stoppageVal.textContent = data.estimated_extra;
        } else {
            stoppageBox.classList.add("hidden");
        }

        // Eventos
        eventsEl.innerHTML = "";
        const events = data.events || [];
        if (events.length > 0) {
            events.forEach(e => {
                const li = document.createElement("li");
                li.className = "truncate py-1 flex items-center gap-2";

                const timeLabel = e.display_time || (e.raw?.time?.elapsed ? `${e.raw.time.elapsed}'` : "-");

                // Ícones por tipo
                let icon = "⚪";
                const type = (e.type || "").toLowerCase();
                const detail = (e.detail || "").toLowerCase();
                if (type.includes("goal")) icon = "⚽";
                else if (detail.includes("yellow")) icon = "🟨";
                else if (detail.includes("red")) icon = "🟥";
                else if (type.includes("substitution")) icon = "🔄";
                else if (type.includes("shot")) icon = "🎯";
                else if (type.includes("foul")) icon = "🛑";
                else if (type.includes("corner")) icon = "🚩";

                const player = (e.player) ? ` — ${e.player}` : "";
                const team = (e.team) ? ` (${e.team})` : "";

                li.innerHTML = `<span class="font-semibold">${timeLabel}</span> ${icon} ${e.type || ""} ${e.detail || ""}${player}${team}`;
                eventsEl.appendChild(li);
            });
        } else {
            eventsEl.innerHTML = "<li>Nenhum evento recente.</li>";
        }

        dashboard.classList.remove("hidden");
    };

    // -------- Buscar Stats --------
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

    // -------- Eventos de UI --------
    gameSelect.addEventListener('change', () => {
        const id = gameSelect.value;
        clearInterval(interval);
        if (!id) {
            dashboard.classList.add("hidden");
            return;
        }
        currentGameId = id;
        fetchGame(currentGameId);
        interval = setInterval(() => fetchGame(currentGameId), 45000);
    });

    leagueSelect.addEventListener('change', () => {
        const lid = leagueSelect.value;
        if (!lid) return;
        loadGames(lid);
    });

    tab1 && tab1.addEventListener('click', () => { currentPeriod = "1t"; });
    tab2 && tab2.addEventListener('click', () => { currentPeriod = "2t"; });
    tabFull && tabFull.addEventListener('click', () => { currentPeriod = "full"; });

    // -------- Inicialização --------
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadLeagues();
            observer.disconnect();
        }
    }, { threshold: 0.1 });

    observer.observe(radarSection);
});
