// scripts/tipster.js
// Versão COMPLETA E CORRIGIDA

document.addEventListener('DOMContentLoaded', function () {
    const sportSelect = document.getElementById('sport-select');
    if (!sportSelect) return;

    const leagueSelectorGroup = document.getElementById('league-selector-group');
    const countrySelectorGroup = document.getElementById('country-selector-group'); 
    const leagueSelect = document.getElementById('league-select');
    const gameSelect = document.getElementById('game-select');
    const bettingResultsDiv = document.getElementById('bettingResults');
    const BASE_URL = 'https://analisador-apostas.onrender.com';

    function resetAndDisable(selectElement, message) {
        selectElement.innerHTML = `<option value="">${message}</option>`;
        selectElement.disabled = true;
    }

    async function loadLeagues(sport) {
        leagueSelect.innerHTML = '<option value="">Carregando ligas...</option>';
        leagueSelect.disabled = false;
        try {
            const response = await fetch(`${BASE_URL}/ligas/${sport}`);
            if (!response.ok) throw new Error('Falha ao buscar ligas.');
            const leagues = await response.json();
            leagueSelect.innerHTML = '<option value="">Selecione uma Liga</option>';
            leagues.forEach(league => leagueSelect.add(new Option(league.title, league.id)));
        } catch (error) {
            leagueSelect.innerHTML = `<option value="">${error.message}</option>`;
        }
    }

    async function loadGames(sport, leagueId) {
        if (!sport || !leagueId) return;
        gameSelect.innerHTML = '<option value="">Carregando jogos...</option>';
        gameSelect.disabled = false;
        try {
            const response = await fetch(`${BASE_URL}/partidas/${sport}/${leagueId}`);
            if (!response.ok) throw new Error('Falha ao buscar jogos.');
            const games = await response.json();
            gameSelect.innerHTML = '<option value="">Selecione um Jogo</option>';
            if (games.length === 0) {
                gameSelect.innerHTML = '<option value="">Nenhum jogo encontrado</option>';
            } else {
                games.forEach(game => {
                    const gameDate = new Date(game.time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                    const statusText = game.status !== 'NS' ? ` (${game.status})` : '';
                    const option = new Option(`${game.home} vs ${game.away} (${gameDate})${statusText}`, game.game_id);
                    option.dataset.status = game.status;
                    gameSelect.add(option);
                });
            }
        } catch (error) {
            gameSelect.innerHTML = `<option value="">${error.message}</option>`;
        }
    }

    async function fetchAndDisplayAnalysis(gameId, status) {
        if (!gameId) {
            bettingResultsDiv.classList.add('hidden');
            return;
        }
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
                htmlResult += `<div class="p-4 border rounded-lg border-slate-700 bg-slate-900"><p class="text-slate-400">${tips.length > 0 ? tips[0].justification : 'Sem dicas de alta confiança para este jogo.'}</p></div>`;
            } else {
                tips.forEach(tip => {
                    htmlResult += `
                        <div class="p-4 border rounded-lg border-slate-700 bg-slate-900 space-y-2 mb-4">
                            <p class="text-slate-300"><strong class="text-cyan-400">Mercado:</strong> ${tip.market}</p>
                            <p class="text-slate-300"><strong class="text-cyan-400">Sugestão:</strong> ${tip.suggestion}</p>
                            <p class="text-slate-400 mt-2"><i>${tip.justification}</i></p>
                            <div class="w-full bg-slate-700 rounded-full h-2.5 mt-3">
                                <div class="bg-cyan-500 h-2.5 rounded-full" style="width: ${tip.confidence}%"></div>
                            </div>
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
        resetAndDisable(gameSelect, 'Selecione um Jogo');

        if(countrySelectorGroup) countrySelectorGroup.style.display = 'none';

        if (sport === 'football') {
            leagueSelectorGroup.style.display = 'block';
            resetAndDisable(leagueSelect, 'Selecione uma Liga');
            loadLeagues('football');
        } else if (sport === 'basketball') { 
            leagueSelectorGroup.style.display = 'none';
            loadGames('basketball', 12); 
        } else if (sport === 'american-football') {
            leagueSelectorGroup.style.display = 'none';
            loadGames('american-football', 16); 
        } else {
            leagueSelectorGroup.style.display = 'block';
            resetAndDisable(leagueSelect, 'Selecione um esporte');
        }
    });

    leagueSelect.addEventListener('change', () => {
        const sport = sportSelect.value;
        const leagueId = leagueSelect.value;
        loadGames(sport, leagueId);
    });

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
