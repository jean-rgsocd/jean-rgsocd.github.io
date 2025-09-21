document.addEventListener('DOMContentLoaded', function () {
    const tipsterSection = document.getElementById('analisador-apostas');
    if (!tipsterSection) return;

    // Seletores de elementos da UI
    const sportSelect = tipsterSection.querySelector('#sport-select');
    const gameGroup = tipsterSection.querySelector('#game-selector-group');
    const gameSelect = tipsterSection.querySelector('#game-select');
    
    // Oculta os seletores de país e liga que não são mais necessários
    const countryGroup = tipsterSection.querySelector('#country-selector-group');
    const leagueGroup = tipsterSection.querySelector('#league-selector-group');
    countryGroup.classList.add('hidden');
    leagueGroup.classList.add('hidden');
    
    const TIPSTER_BASE_URL = 'https://analisador-apostas.onrender.com';

    const resetSelect = (selectElement, message) => {
        selectElement.innerHTML = `<option value="">${message}</option>`;
        selectElement.disabled = true;
    };
    
    const loadGames = async (sport) => {
        resetSelect(gameSelect, 'Carregando jogos (Hoje + 5 dias)...');
        gameGroup.classList.remove('hidden');
        
        try {
            const response = await fetch(`${TIPSTER_BASE_URL}/jogos-agendados/${sport}`);
            if (!response.ok) throw new Error(`Falha ao buscar jogos (${response.status})`);
            const games = await response.json();
            
            gameSelect.innerHTML = '<option value="">Selecione o Jogo</option>';
            if (games.length === 0) {
                gameSelect.innerHTML = '<option value="">Nenhum jogo encontrado nos próximos dias</option>';
            } else {
                games.forEach(g => {
                    const date = new Date(g.time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                    const optionText = `${g.home} vs ${g.away} (${date})`;
                    gameSelect.add(new Option(optionText, g.game_id));
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
        resetSelect(gameSelect, '...');

        if (sport) {
            loadGames(sport);
        }
    });
});
