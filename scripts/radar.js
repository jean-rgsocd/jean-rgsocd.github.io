document.addEventListener("DOMContentLoaded", function () {
    const radarSection = document.getElementById("radar-ia-section");
    if (!radarSection) return;

    const RADAR_API = "https://radar-ia-backend.onrender.com";

    const gameSelect = document.getElementById("radar-game-select");
    const dashboard = document.getElementById("radar-dashboard");
    // ... (demais seletores de elementos)
    const scoreEl = document.getElementById("radar-score");
    const minuteEl = document.getElementById("radar-minute");
    const homeTeamEl = document.getElementById("home-team-name");
    const awayTeamEl = document.getElementById("away-team-name");
    const eventsEl = document.getElementById("radar-events");
    // ... (outros seletores de estatísticas)

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
    
    // ... (restante das funções updateDashboardUI e fetchGameStats) ...
    // O restante do arquivo pode ser mantido como na versão anterior.
});
