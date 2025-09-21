document.addEventListener('DOMContentLoaded', function () {
    const sportSelect = document.getElementById('sport-select');
    if (!sportSelect) return; // Só executa se o elemento existir

    const countrySelectorGroup = document.getElementById('country-selector-group');
    const leagueSelectorGroup = document.getElementById('league-selector-group');
    const countrySelect = document.getElementById('country-select');
    const leagueSelect = document.getElementById('league-select');
    const gameSelect = document.getElementById('game-select');
    const bettingResultsDiv = document.getElementById('bettingResults');
    const BASE_URL = 'https://analisador-apostas.onrender.com';

    function resetAndDisable(selectElement, message) {
        selectElement.innerHTML = `<option value="">${message}</option>`;
        selectElement.disabled = true;
    }

    async function loadCountries() {
        countrySelect.innerHTML = '<option value="">Carregando países...</option>';
        countrySelect.disabled = false;
        try {
            const response = await fetch(`${BASE_URL}/paises/football`);
            if (!response.ok) throw new Error('Falha ao buscar países.');
            const countries = await response.json();
            countrySelect.innerHTML = '<option value="">Selecione um País</option>';
            countries.forEach(country => {
                if (country.code) countrySelect.add(new Option(country.name, country.code));
            });
        } catch (error) {
            countrySelect.innerHTML = `<option value="">${error.message}</option>`;
        }
    }

    async function loadLeaguesByCountry() {
        const countryCode = countrySelect.value;
        if (!countryCode) return;
        leagueSelect.innerHTML = '<option value="">Carregando ligas...</option>';
        leagueSelect.disabled = false;
        try {
            const response = await fetch(`${BASE_URL}/ligas/football/${countryCode}`)
            if (!response.ok) throw new Error('Falha ao buscar ligas.');
            const leagues = await response.json();
            leagueSelect.innerHTML = '<option value="">Selecione uma Liga</option>';
            leagues.forEach(league => leagueSelect.add(new Option(league.name, league.id)));
        } catch (error) {
            leagueSelect.innerHTML = `<option value="">${error.message}</option>`;
        }
    }

    async function loadGamesByLeague() {
        const leagueId = leagueSelect.value;
        if (!leagueId) return;
        gameSelect.innerHTML = '<option value="">Carregando jogos...</option>';
        gameSelect.disabled = false;
        try {
            const response = await fetch(`${BASE_URL}/partidas/football/${leagueId}`)
            if (!response.ok) throw new Error('Falha ao buscar jogos.');
            const games = await response.json();
            gameSelect.innerHTML = '<option value="">Selecione um Jogo</option>';
            if (games.length === 0) {
                gameSelect.innerHTML = '<option value="">Nenhum jogo hoje ou amanhã</option>';
            }
            games.forEach(game => {
                const statusText = game.status !== 'NS' ? ` (${game.status})` : '';
                const option = new Option(`${game.home} vs ${game.away} (${game.time})${statusText}`, game.game_id);
                option.dataset.status = game.status;
                gameSelect.add(option);
            });
        } catch (error) {
            gameSelect.innerHTML = `<option value="">${error.message}</option>`;
        }
    }

    async function loadGamesBySport(sport) {
        gameSelect.innerHTML = '<option value="">Carregando jogos...</option>';
        gameSelect.disabled = false;
        try {
            const response = await fetch(`${BASE_URL}/partidas-por-esporte/${sport}`);
            if (!response.ok) throw new Error('Falha ao buscar jogos.');
            const games = await response.json();
            gameSelect.innerHTML = '<option value="">Selecione um Jogo</option>';
            if (games.length === 0) {
                gameSelect.innerHTML = '<option value="">Nenhum jogo hoje ou amanhã</option>';
            }
            games.forEach(game => {
                const statusText = game.status !== 'NS' ? ` (${game.status})` : '';
                const option = new Option(`${game.home} vs ${game.away} (${game.time})${statusText}`, game.game_id);
                option.dataset.status = game.status;
                gameSelect.add(option);
            });
        } catch (error) {
            gameSelect.innerHTML = `<option value="">${error.message}</option>`;
        }
    }

    async function fetchAndDisplayAnalysis(gameId, status) {
        if (!gameId) { bettingResultsDiv.classList.add('hidden'); return; }
        bettingResultsDiv.classList.remove('hidden');
        bettingResultsDiv.innerHTML = `<p class="text-slate-400 text-center">Analisando estatísticas... 🧠</p>`;
        const sport = sportSelect.value;
        const liveStatusList = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT'];
        const isLive = liveStatusList.includes(status);
        const endpoint = isLive ? 'analisar-ao-vivo' : 'analisar-pre-jogo';
        const analyzeUrl = `${BASE_URL}/${endpoint}?game_id=${gameId}&sport=${sport}`;
        try {
            const response = await fetch(analyzeUrl);
            if (!response.ok) throw new Error('O servidor de análise retornou um erro.');
            const tips = await response.json();
            const selectedGameText = gameSelect.options[gameSelect.selectedIndex].text.split(' (')[0];
            let htmlResult = `<h3 class="font-bold text-xl text-cyan-300 mb-4">${isLive ? 'Análise Ao Vivo' : 'Análise Pré-Jogo'} para: ${selectedGameText}</h3>`;
            if (tips.length === 0 || (tips[0] && tips[0].confidence === 0)) {
                 htmlResult += `<div class="p-4 border rounded-lg border-slate-700 bg-slate-900"><p class="text-slate-400">${tips.length > 0 ? tips[0].justification : 'Sem dicas de alta confiança.'}</p></div>`;
            } else {
                tips.forEach(tip => {
                    htmlResult += `
                        <div class="p-4 border rounded-lg border-slate-700 bg-slate-900 space-y-2">
                            <p class="text-slate-300"><strong class="text-cyan-400">Mercado:</strong> ${tip.market}</p>
                            <p class="text-slate-300"><strong class="text-cyan-400">Sugestão:</strong> ${tip.suggestion}</p>
                            <p class="text-slate-400 mt-2"><i>${tip.justification}</i></p>
                            <div class="w-full bg-slate-700 rounded-full h-2.5 mt-3"><div class="bg-cyan-500 h-2.5 rounded-full" style="width: ${tip.confidence}%"></div></div>
                            <p class="text-xs text-slate-500 text-right mt-1">Confiança: ${tip.confidence}%</p>
                        </div>`;
                });
            }
            bettingResultsDiv.innerHTML = htmlResult;
        } catch (error) {
            bettingResultsDiv.innerHTML = `<div class="p-4 border rounded-lg border-red-500/50 bg-red-900/50 text-red-300"><strong>Erro na Análise:</strong> ${error.message}</div>`;
        }
    }

    sportSelect.addEventListener('change', () => {
        const sport = sportSelect.value;
        bettingResultsDiv.classList.add('hidden');

        if (sport === 'football') {
            countrySelectorGroup.style.display = 'block';
            leagueSelectorGroup.style.display = 'block';
            resetAndDisable(countrySelect, 'Carregando...');
            resetAndDisable(leagueSelect, 'Selecione um país');
            resetAndDisable(gameSelect, 'Selecione uma liga');
            countrySelect.disabled = false;
            loadCountries();
        } else if (sport) {
            countrySelectorGroup.style.display = 'none';
            leagueSelectorGroup.style.display = 'none';
            loadGamesBySport(sport);
        } else {
            countrySelectorGroup.style.display = 'block';
            leagueSelectorGroup.style.display = 'block';
            resetAndDisable(countrySelect, 'Selecione um esporte');
            resetAndDisable(leagueSelect, 'Selecione um esporte');
            resetAndDisable(gameSelect, 'Selecione um esporte');
        }
    });

    countrySelect.addEventListener('change', loadLeaguesByCountry);
    leagueSelect.addEventListener('change', loadGamesByLeague);
    gameSelect.addEventListener('change', () => {
        const selectedOption = gameSelect.options[gameSelect.selectedIndex];
        if (!selectedOption || !selectedOption.value) {
            bettingResultsDiv.classList.add('hidden');
            return;
        }
        const gameId = selectedOption.value;
        const gameStatus = selectedOption.dataset.status;
        fetchAndDisplayAnalysis(gameId, gameStatus);
    });
});
