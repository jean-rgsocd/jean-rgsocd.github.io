// radar.js - exibição de eventos (mais recentes primeiro) com minuto/seg e categoria
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
    const tab1 = document.getElementById("tab-1t");
    const tab2 = document.getElementById("tab-2t");
    const tabFull = document.getElementById("tab-full");

    let interval = null;
    let currentGameId = null;
    let currentPeriod = "full";

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

    const renderStats = (data) => {
        homeTeamEl.textContent = data.teams?.home?.name || "Time Casa";
        awayTeamEl.textContent = data.teams?.away?.name || "Time Fora";
        scoreEl.textContent = `${data.goals?.home ?? 0} - ${data.goals?.away ?? 0}`;
        minuteEl.textContent = data.fixture?.status?.elapsed ? `${data.fixture.status.elapsed}'` : "-";

        // eventos: já vêm do backend em ordem decrescente (mais recentes primeiro)
        eventsEl.innerHTML = "";
        const events = data.events || [];
        if (events.length > 0) {
            // criar lista mostrando display_time (min/seg) e categoria
            events.forEach(e => {
                const li = document.createElement("li");
                li.className = "truncate py-1";

                // use display_time se existir, senao fallback para time.elapsed
                const timeLabel = e.display_time || (e.time?.elapsed ? `${e.time.elapsed}'` : "-");
                const category = e.category || (e.type || e.detail || "Evento");
                const detail = e.detail ? ` — ${e.detail}` : "";
                const player = (e.player && e.player.name) ? ` por ${e.player.name}` : "";

                // exemplo: 80'23" — Shot on Target — Chute no alvo por E. Haaland
                li.innerHTML = `<span class="font-semibold mr-2">${timeLabel}</span>
                                <span class="text-sm event-cat mr-2">${category}</span>
                                <span class="text-xs text-muted">${detail}${player}</span>`;
                eventsEl.appendChild(li);
            });
        } else {
            eventsEl.innerHTML = "<li>Nenhum evento recente.</li>";
        }

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

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadLeagues();
            observer.disconnect();
        }
    }, { threshold: 0.1 });

    observer.observe(radarSection);
});
