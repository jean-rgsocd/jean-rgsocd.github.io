document.addEventListener('DOMContentLoaded', function () {
    const tipsterSection = document.getElementById('analisador-apostas');
    if (!tipsterSection) return;

    const sportSelect = tipsterSection.querySelector('#sport-select');
    const countryGroup = tipsterSection.querySelector('#country-selector-group');
    const leagueGroup = tipsterSection.querySelector('#league-selector-group');
    const gameGroup = tipsterSection.querySelector('#game-selector-group');
    const countrySelect = tipsterSection.querySelector('#country-select');
    const leagueSelect = tipsterSection.querySelector('#league-select');
    const gameSelect = tipsterSection.querySelector('#game-select');
    const resultsDiv = tipsterSection.querySelector('#bettingResults');
    
    // URL do seu backend para o Tipster IA
    const TIPSTER_BASE_URL = 'https://analisador-apostas.onrender.com';

    // Função para resetar e desabilitar um seletor
    const resetSelect = (selectElement, message) => {
        selectElement.innerHTML = `<option value="">${message}</option>`;
        selectElement.disabled = true;
    };

    // Esconde todos os seletores dependentes
    const hideDependentSelectors = () => {
        countryGroup.classList.add('hidden');
        leagueGroup.classList.add('hidden');
        gameGroup.classList.add('hidden');
        resultsDiv.classList.add('hidden');
    };

    const loadCountries = async () => {
        resetSelect(countrySelect, 'Carregando países...');
        try {
            const response = await fetch(`${TIPSTER_BASE_URL}/paises/football`);
            if (!response.ok) throw new Error('Falha ao buscar países');
            const countries = await response.json();
            
            countrySelect.innerHTML = '<option value="">Selecione o País</option>';
            countries.forEach(c => countrySelect.add(new Option(c.name, c.code)));
            countrySelect.disabled = false;
        } catch (error) {
            resetSelect(countrySelect, 'Erro ao carregar');
            console.error(error);
        }
    };

    const loadLeagues = async (sport, countryCode = null) => {
        resetSelect(leagueSelect, 'Carregando ligas...');
        let url = `${TIPSTER_BASE_URL}/ligas/${sport}`;
        if (sport === 'football' && countryCode) {
            url += `?country_code=${countryCode}`;
        } else if (sport === 'football' && !countryCode) {
            resetSelect(leagueSelect, 'Selecione um país');
            return;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Falha ao buscar ligas');
            const leagues = await response.json();

            leagueSelect.innerHTML = '<option value="">Selecione a Liga</option>';
            if (leagues.length === 0) {
                 leagueSelect.innerHTML = '<option value="">Nenhuma liga encontrada</option>';
            } else {
                 leagues.forEach(l => leagueSelect.add(new Option(l.name, l.id)));
                 leagueSelect.disabled = false;
            }
        } catch (error) {
            resetSelect(leagueSelect, 'Erro ao carregar');
            console.error(error);
        }
    };
    
    const loadGames = async (sport, leagueId) => {
        if (!sport || !leagueId) return;
        resetSelect(gameSelect, 'Carregando jogos...');
        gameGroup.classList.remove('hidden');

        try {
            const response = await fetch(`${TIPSTER_BASE_URL}/partidas/${sport}/${leagueId}`);
            if (!response.ok) throw new Error('Falha ao buscar jogos');
            const games = await response.json();
            
            gameSelect.innerHTML = '<option value="">Selecione o Jogo</option>';
            if (games.length === 0) {
                gameSelect.innerHTML = '<option value="">Nenhum jogo encontrado</option>';
            } else {
                games.forEach(g => {
                    const date = new Date(g.time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                    const optionText = `${g.home} vs ${g.away} (${date})`;
                    gameSelect.add(new Option(optionText, g.game_id));
                });
                gameSelect.disabled = false;
            }
        } catch (error) {
            resetSelect(gameSelect, 'Erro ao carregar');
            console.error(error);
        }
    };

    // --- EVENT LISTENERS ---
    sportSelect.addEventListener('change', () => {
        const sport = sportSelect.value;
        hideDependentSelectors();
        resetSelect(countrySelect, '...');
        resetSelect(leagueSelect, '...');
        resetSelect(gameSelect, '...');

        if (sport) {
            leagueGroup.classList.remove('hidden');
            if (sport === 'football') {
                countryGroup.classList.remove('hidden');
                loadCountries();
            } else {
                loadLeagues(sport);
            }
        }
    });

    countrySelect.addEventListener('change', () => {
        const sport = sportSelect.value;
        const countryCode = countrySelect.value;
        resetSelect(leagueSelect, '...');
        resetSelect(gameSelect, '...');
        if (countryCode) {
            loadLeagues(sport, countryCode);
        }
    });

    leagueSelect.addEventListener('change', () => {
        const sport = sportSelect.value;
        const leagueId = leagueSelect.value;
        resetSelect(gameSelect, '...');
        resultsDiv.classList.add('hidden');
        if (leagueId) {
            loadGames(sport, leagueId);
        }
    });
    
    gameSelect.addEventListener('change', () => {
        // A lógica de análise de jogo foi mantida conforme o original,
        // pois o backend para análise não foi solicitado para refatoração.
        // Se houver um endpoint de análise, ele seria chamado aqui.
        resultsDiv.classList.remove('hidden');
        const gameText = gameSelect.options[gameSelect.selectedIndex].text.split(' (')[0];
        resultsDiv.innerHTML = `<p class="text-slate-400 text-center">Análise para ${gameText} não implementada neste frontend.</p>`;
    });
});
