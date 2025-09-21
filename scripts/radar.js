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
    const periodButtons = radarSection.querySelectorAll(".period-btn");
    const stoppagePredictionEl = document.getElementById("stoppage-time-prediction");
    const stoppageValueEl = document.getElementById("stoppage-time-value");

    let currentData = null;
    let currentPeriod = "fullGame";
    let updateInterval = null;

    async function loadLiveGames() {
        gameSelect.innerHTML = `<option value="">Carregando jogos...</option>`;
        try {
            const res = await fetch(`${RADAR_API}/jogos-aovivo`);
            if (!res.ok) throw new Error("Falha ao buscar jogos");
            const games = await res.json();

            gameSelect.innerHTML = "";
            if (games.length === 0) {
                gameSelect.innerHTML = `<option value="">Nenhum jogo ao vivo no momento</option>`;
                return;
            }

            gameSelect.add(new Option("Selecione um jogo para acompanhar", ""));
            games.forEach(g => gameSelect.add(new Option(g.title, g.game_id)));
        } catch (err) {
            gameSelect.innerHTML = `<option value="">Erro ao carregar: ${err.message}</option>`;
        }
    }

    function updateStatsView(period) {
        if (!currentData || !currentData.stats[period]) return;

        const stats = currentData.stats[period];
        const possession = (period === 'fullGame' && stats.possession) ? stats.possession : currentData.stats.fullGame.possession;
        
        document.getElementById("stat-possession").textContent = `${possession.home}% / ${possession.away}%`;

        const shotsOnGoal = stats.shots_on_goal || { home: 0, away: 0 };
        const totalShots = stats.total_shots || { home: 0, away: 0 };
        document.getElementById("stat-shots").textContent = `${totalShots.home} (${shotsOnGoal.home}) / ${totalShots.away} (${shotsOnGoal.away})`;
        
        document.getElementById("stat-corners").textContent = `${stats.corners.home} / ${stats.corners.away}`;
        document.getElementById("stat-fouls").textContent = `${stats.fouls.home} / ${stats.fouls.away}`;
        document.getElementById("stat-yellow-cards").textContent = `${stats.yellow_cards.home} / ${stats.yellow_cards.away}`;
        document.getElementById("stat-red-cards").textContent = `${stats.red_cards.home} / ${stats.red_cards.away}`;

        periodButtons.forEach(btn => {
            btn.classList.toggle("bg-cyan-600", btn.dataset.period === period);
            btn.classList.toggle("text-white", btn.dataset.period === period);
        });
    }

    async function fetchGameStats(gameId) {
        try {
            const res = await fetch(`${RADAR_API}/stats-aovivo/${gameId}`);
            if (!res.ok) throw new Error("Falha ao buscar estatísticas");
            currentData = await res.json();
            
            dashboard.classList.remove("hidden");

            homeTeamEl.textContent = currentData.teams.home || "Time Casa";
            awayTeamEl.textContent = currentData.teams.away || "Time Fora";
            scoreEl.textContent = currentData.score || "-";
            minuteEl.textContent = (currentData.minute || "-") + "'";

            updateStatsView(currentPeriod);
            
            eventsEl.innerHTML = "";
            if (currentData.events && currentData.events.length > 0) {
                currentData.events.forEach(e => {
                    const li = document.createElement("li");
                    li.textContent = `${e.minute}' - ${e.type} por ${e.detail}`;
                    eventsEl.appendChild(li);
                });
            } else {
                eventsEl.innerHTML = "<li>Nenhum evento registrado.</li>";
            }

            const stoppage = currentData.estimated_stoppage;
            const minute = currentData.minute;
            let periodKey = null;
            if (minute >= 85) periodKey = "second_half";
            else if (minute >= 40 && minute < 55) periodKey = "first_half";

            if (stoppage && periodKey && stoppage[periodKey]) {
                stoppageValueEl.textContent = `+${stoppage[periodKey]}`;
                stoppagePredictionEl.classList.remove("hidden");
            } else {
                stoppagePredictionEl.classList.add("hidden");
            }

        } catch (err) {
            console.error("Erro ao carregar estatísticas:", err);
            dashboard.classList.add("hidden");
        }
    }
    
    gameSelect.addEventListener("change", () => {
        const gameId = gameSelect.value;
        clearInterval(updateInterval); 

        if (gameId) {
            fetchGameStats(gameId); 
            updateInterval = setInterval(() => fetchGameStats(gameId), 30000); 
        } else {
            dashboard.classList.add("hidden");
        }
    });

    periodButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentPeriod = button.dataset.period;
            updateStatsView(currentPeriod);
        });
    });

    const radarCardButton = document.getElementById('showRadarButton');
    if(radarCardButton){
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadLiveGames();
                observer.disconnect();
            }
        });
        observer.observe(radarSection);
    }
});
