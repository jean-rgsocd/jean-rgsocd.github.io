// scripts/radar.js
// Versão 4.0 - Lógica de Filtro por Tempo e Acréscimos

document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("radar-ia-section")) return;

    const RADAR_API = "https://radar-ia-backend.onrender.com";

    const gameSelect = document.getElementById("radar-game-select");
    const dashboard = document.getElementById("radar-dashboard");
    const scoreEl = document.getElementById("radar-score");
    const minuteEl = document.getElementById("radar-minute");
    const eventsEl = document.getElementById("radar-events");
    const periodButtons = document.querySelectorAll(".period-btn");
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
        if (!currentData || !currentData.stats[period]) {
            console.error("Dados para o período", period, "não encontrados.");
            return;
        }

        const stats = currentData.stats[period];

        // Para posse, só o 'fullGame' tem. Usamos ele como fallback.
        const possession = currentData.stats.fullGame.possession;
        document.getElementById("stat-possession").textContent = `${possession.home}% / ${possession.away}%`;

        const shotsOnGoal = stats.shots_on_goal || { home: 0, away: 0 };
        const totalShots = stats.total_shots || { home: 0, away: 0 };
        document.getElementById("stat-shots").textContent = `${totalShots.home} (${shotsOnGoal.home}) / ${totalShots.away} (${shotsOnGoal.away})`;
        
        document.getElementById("stat-corners").textContent = `${stats.corners.home} / ${stats.corners.away}`;
        document.getElementById("stat-fouls").textContent = `${stats.fouls.home} / ${stats.fouls.away}`;
        document.getElementById("stat-yellow-cards").textContent = `${stats.yellow_cards.home} / ${stats.yellow_cards.away}`;
        document.getElementById("stat-red-cards").textContent = `${stats.red_cards.home} / ${stats.red_cards.away}`;

        // Atualiza botão ativo
        periodButtons.forEach(btn => {
            if (btn.dataset.period === period) {
                btn.classList.add("bg-cyan-600", "text-white");
            } else {
                btn.classList.remove("bg-cyan-600", "text-white");
            }
        });
    }

    async function fetchGameStats(gameId) {
        try {
            const res = await fetch(`${RADAR_API}/stats-aovivo/${gameId}`);
            if (!res.ok) throw new Error("Falha ao buscar estatísticas");
            currentData = await res.json();
            
            dashboard.classList.remove("hidden");

            scoreEl.textContent = currentData.score || "-";
            minuteEl.textContent = (currentData.minute || "-") + "'";

            // Atualiza a visão de estatísticas com o período selecionado
            updateStatsView(currentPeriod);
            
            // Atualiza eventos
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

            // Lógica para mostrar/esconder estimativa de acréscimos
            const stoppage = currentData.estimated_stoppage;
            if (stoppage && (stoppage.first_half || stoppage.second_half)) {
                const periodKey = currentData.minute >= 85 ? "second_half" : "first_half";
                if (stoppage[periodKey]) {
                    stoppageValueEl.textContent = `+${stoppage[periodKey]}`;
                    stoppagePredictionEl.classList.remove("hidden");
                }
            } else {
                stoppagePredictionEl.classList.add("hidden");
            }

        } catch (err) {
            console.error("Erro ao carregar estatísticas:", err);
            // Poderia mostrar um erro no dashboard
        }
    }
    
    gameSelect.addEventListener("change", () => {
        const gameId = gameSelect.value;
        clearInterval(updateInterval); // Limpa o intervalo anterior

        if (gameId) {
            fetchGameStats(gameId); // Busca imediata
            updateInterval = setInterval(() => fetchGameStats(gameId), 30000); // E depois a cada 30s
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

    loadLiveGames();
});
