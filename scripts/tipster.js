document.addEventListener('DOMContentLoaded', function () {
    const tipsterSection = document.getElementById('analisador-apostas');
    if (!tipsterSection) return;

    // Seletores de elementos da UI
    const sportSelect = tipsterSection.querySelector('#sport-select');
    const gameGroup = tipsterSection.querySelector('#game-selector-group');
    const gameSelect = tipsterSection.querySelector('#game-select');
    
    // Oculta permanentemente os seletores de país e liga
    const countryGroup = tipsterSection.querySelector('#country-selector-group');
    const leagueGroup = tipsterSection.querySelector('#league-selector-group');
    if(countryGroup) countryGroup.classList.add('hidden');
    if(leagueGroup) leagueGroup.classList.add('hidden');
    
    const TIPSTER_BASE_URL = 'https://analisador-apostas.onrender.com';

    const resetSelect = (selectElement, message) => {
        selectElement.innerHTML = `<option value="">${message}</option>`;
        selectElement.disabled = true;
    };
    
    const loadGames = async (sport) => {
        resetSelect(gameSelect, 'Buscando jogos (Hoje + Próximos 5 dias)...');
        gameGroup.classList.remove('hidden');
        
        const sportEndpoints = {
            'football': 'futebol',
            'basketball': 'nba',
            'american-football': 'nfl'
        };

        const endpoint = sportEndpoints[sport];
        if (!endpoint) {
            resetSelect(gameSelect, 'Esporte inválido');
            return;
        }

        try {
            const response = await fetch(`${TIPSTER_BASE_URL}/${endpoint}`);
            if (!response.ok) throw new Error(`Falha ao buscar jogos (${response.status})`);
            const games = await response.json();
            
            gameSelect.innerHTML = '<option value="">Selecione um Jogo</option>';
            if (games.length === 0) {
                gameSelect.innerHTML = '<option value="">Nenhum jogo encontrado nos próximos dias</option>';
            } else {
                games.forEach(g => {
                    gameSelect.add(new Option(g.text, g.game_id));
                });
                gameSelect.disabled = false;
            }
        } catch (error) {
            resetSelect(gameSelect, 'Erro ao carregar jogos');
            console.error(error);
        }
    };

    // --- EVENT LISTENER ---
    sportSelect.addEventListener('change', () => {
        const sport = sportSelect.value;
        gameGroup.classList.add('hidden');
        resetSelect(gameSelect, 'Aguardando seleção...');

        if (sport) {
            loadGames(sport);
        }
    });
});
