document.addEventListener("DOMContentLoaded", function () {
    const radarSection = document.getElementById("radar-ia-section");
    if (!radarSection) return;

    const RADAR_API = "https://radar-ia-backend.onrender.com";

    const gameSelect = document.getElementById("radar-game-select");
    const dashboard = document.getElementById("radar-dashboard");
    const scoreEl = document.getElementById("radar-score");
    const minuteEl = document.getElementById("radar-minute");
    const homeTeamEl = document.getElementById("home-team-name");
    const awayTeamEl = document.getElementById("away-team-name");
    const eventsEl = document.getElementById("radar-events");
    const statPossessionEl = document.getElementById("stat-possession");
    const statShotsEl = document.getElementById("stat-shots");
    const statCornersEl = document.getElementById("stat-corners");
    const statFoulsEl = document.getElementById("stat-fouls");
    const statYellowCardsEl = document.getElementById("stat-yellow-cards");
    const statRedCardsEl = document.getElementById("stat-red-cards");
    
    let updateInterval = null;

    const loadLiveGames = async () => {
        gameSelect.disabled = true;
        gameSelect.innerHTML = `<option value="">Carregando jogos ao vivo...</option>`;
        try {
            const response = await fetch(`${RADAR_API}/jogos-aovivo`);
            if (!response.ok) throw new Error("Falha ao buscar jogos ao vivo");
            const games = await response.json();

            if (games.length === 0) {
                gameSelect.innerHTML = `<option value="">Nenhum jogo ao vivo no momento</option>`;
                gameSelect.disabled = true;
                return;
            }

            gameSelect.innerHTML = `<option value="">Selecione um jogo para acompanhar</option>`;
            games.forEach(g => gameSelect.add(new Option(g.title, g.game_id)));
            gameSelect.disabled = false;
        } catch (err) {
            gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
            console.error(err);
        }
    };
    
    const updateDashboardUI = (data) => {
        homeTeamEl.textContent = data.teams?.home?.name || "Time Casa";
        awayTeamEl.textContent = data.teams?.away?.name || "Time Fora";
        scoreEl.textContent = `${data.goals?.home || 0} - ${data.goals?.away || 0}`;
        minuteEl.textContent = data.fixture?.status?.elapsed ? `${data.fixture.status.elapsed}'` : "-";
        
        const homeStatsData = data.statistics?.find(s => s.team.id === data.teams.home.id);
        const awayStatsData = data.statistics?.find(s => s.team.id === data.teams.away.id);
        
        const homeStats = homeStatsData?.statistics || [];
        const awayStats = awayStatsData?.statistics || [];

        const getStat = (stats, name) => (stats.find(s => s.type === name)?.value || 0);
        
        statPossessionEl.textContent = `${getStat(homeStats, 'Ball Possession') || 'N/A'}`;
        statShotsEl.textContent = `${getStat(homeStats, 'Total Shots')} (${getStat(homeStats, 'Shots on Goal')}) / ${getStat(awayStats, 'Total Shots')} (${getStat(awayStats, 'Shots on Goal')})`;
        statCornersEl.textContent = `${getStat(homeStats, 'Corner Kicks')} / ${getStat(awayStats, 'Corner Kicks')}`;
        statFoulsEl.textContent = `${getStat(homeStats, 'Fouls')} / ${getStat(awayStats, 'Fouls')}`;
        statYellowCardsEl.textContent = `${getStat(homeStats, 'Yellow Cards')} / ${getStat(awayStats, 'Yellow Cards')}`;
        statRedCardsEl.textContent = `${getStat(homeStats, 'Red Cards')} / ${getStat(awayStats, 'Red Cards')}`;
        
        eventsEl.innerHTML = "";
        if (data.events && data.events.length > 0) {
            data.events.forEach(e => {
                const li = document.createElement("li");
                li.className = "truncate";
                li.textContent = `${e.time.elapsed}' - ${e.type} (${e.detail}) por ${e.player.name}`;
                eventsEl.appendChild(li);
            });
        } else {
            eventsEl.innerHTML = "<li>Nenhum evento recente.</li>";
        }
        
        dashboard.classList.remove("hidden");
    };

    const fetchGameStats = async (gameId) => {
        try {
            const response = await fetch(`${RADAR_API}/stats-aovivo/${gameId}`);
            if (!response.ok) throw new Error("Falha ao buscar estatísticas");
            const data = await response.json();
            updateDashboardUI(data);
        } catch (err) {
            console.error("Erro ao carregar estatísticas:", err);
            dashboard.classList.add("hidden");
            clearInterval(updateInterval);
        }
    };
    
    gameSelect.addEventListener("change", () => {
        const gameId = gameSelect.value;
        clearInterval(updateInterval); 

        if (gameId) {
            dashboard.classList.add("hidden");
            fetchGameStats(gameId); 
            updateInterval = setInterval(() => fetchGameStats(gameId), 45000);
        } else {
            dashboard.classList.add("hidden");
        }
    });

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadLiveGames();
            observer.disconnect();
        }
    }, { threshold: 0.1 });
    
    if (radarSection) {
        observer.observe(radarSection);
    }
});
