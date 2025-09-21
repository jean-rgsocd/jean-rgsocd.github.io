// tipster.js - chama /analyze e mostra recomendações do Tipster IA
document.addEventListener('DOMContentLoaded', function () {
    const tipsterSection = document.getElementById('analisador-apostas');
    if (!tipsterSection) return;

    const sportSelect = tipsterSection.querySelector('#sport-select');
    const countrySelect = tipsterSection.querySelector('#country-select');
    const countryGroup = tipsterSection.querySelector('#country-selector-group');
    const leagueSelect = tipsterSection.querySelector('#league-select');
    const leagueGroup = tipsterSection.querySelector('#league-selector-group');
    const gameSelect = tipsterSection.querySelector('#game-select');
    const gameGroup = tipsterSection.querySelector('#game-selector-group');

    const TIPSTER_BASE_URL = 'https://analisador-apostas.onrender.com';

    let footballGames = null;
    let nbaGames = null;
    let nflGames = null;

    // result container creation
    let resultContainer = tipsterSection.querySelector('#tipster-analysis-result');
    if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.id = 'tipster-analysis-result';
        resultContainer.className = 'mt-4';
        // place after gameGroup
        if (gameGroup && gameGroup.parentNode) gameGroup.parentNode.insertBefore(resultContainer, gameGroup.nextSibling);
        else tipsterSection.appendChild(resultContainer);
    }

    const resetSelect = (el, placeholder) => {
        el.innerHTML = `<option value="">${placeholder}</option>`;
        el.disabled = true;
    };

    const showAnalysisLoading = () => {
        resultContainer.innerHTML = `<div class="p-4 bg-slate-900/50 border border-slate-700 rounded-md text-slate-200">Carregando análise...</div>`;
    };

    const renderAnalysis = (data) => {
        // clear
        if (!data || !data.predictions) {
            resultContainer.innerHTML = `<div class="p-4 bg-yellow-900/30 border border-yellow-500 rounded-md text-yellow-200">Nenhuma análise disponível.</div>`;
            return;
        }
        let html = `<div class="p-4 bg-slate-900/40 border border-slate-700 rounded-md text-slate-200">
            <h4 class="font-bold mb-2">Tipster IA — Recomendações</h4>
            <p class="text-sm text-slate-300 mb-3">Jogo: ${data.summary.home_team || data.summary.home || ''} vs ${data.summary.away_team || data.summary.away || ''}</p>
            <div class="space-y-2">`;
        data.predictions.forEach(p => {
            const conf = (p.confidence !== undefined) ? p.confidence : (p.confidence || 0);
            const color = conf >= 0.7 ? "bg-green-600" : (conf >= 0.5 ? "bg-amber-600" : "bg-slate-700");
            html += `<div class="p-3 ${color} rounded-md">
                <div class="flex justify-between items-center">
                    <div class="font-semibold">${p.market}</div>
                    <div class="font-bold">${p.recommendation}</div>
                </div>
                <div class="text-xs text-slate-200 mt-1">Confiança: ${Math.round(conf*100)}% — ${p.reason || ''}</div>
            </div>`;
        });
        html += `</div></div>`;
        resultContainer.innerHTML = html;
    };

    // call analyze endpoint
    const analyzeGame = async (sport, gameId) => {
        showAnalysisLoading();
        try {
            const resp = await fetch(`${TIPSTER_BASE_URL}/analyze?game_id=${encodeURIComponent(gameId)}&sport=${encodeURIComponent(sport)}`);
            if (!resp.ok) {
                const txt = await resp.text();
                resultContainer.innerHTML = `<div class="p-3 bg-red-700/40 border border-red-600 rounded text-red-100">Erro na análise: ${resp.status} ${txt}</div>`;
                return;
            }
            const j = await resp.json();
            renderAnalysis(j);
        } catch (err) {
            console.error("analyze error", err);
            resultContainer.innerHTML = `<div class="p-3 bg-red-700/40 border border-red-600 rounded text-red-100">Erro ao conectar ao serviço de análise.</div>`;
        }
    };

    // when user selects a game, trigger analyze
    gameSelect.addEventListener('change', (e) => {
        const gameId = e.target.value;
        const sport = sportSelect.value;
        if (!gameId) {
            resultContainer.innerHTML = '';
            return;
        }
        // call analyze
        analyzeGame(sport, gameId);
    });

    // existing logic to populate selects (abridged - keep your existing fill logic)
    sportSelect.addEventListener('change', async () => {
        const sport = sportSelect.value;
        // reset selects
        resetSelect(countrySelect, 'Escolha um país');
        resetSelect(leagueSelect, 'Escolha uma liga');
        resetSelect(gameSelect, 'Selecione um jogo');
        countryGroup && countryGroup.classList.add('hidden');
        leagueGroup && leagueGroup.classList.add('hidden');
        gameGroup && gameGroup.classList.add('hidden');
        resultContainer.innerHTML = '';

        if (sport === 'football') {
            countryGroup.classList.remove('hidden');
            if (!footballGames) {
                try {
                    const resp = await fetch(`${TIPSTER_BASE_URL}/futebol`);
                    footballGames = await resp.json();
                } catch (err) {
                    countrySelect.innerHTML = `<option>Erro ao carregar</option>`;
                    return;
                }
            }
            const countries = Array.from(new Set(footballGames.map(g => g.league && g.league.country).filter(Boolean))).sort();
            countrySelect.innerHTML = `<option value="">Escolha um país</option>`;
            countries.forEach(c => countrySelect.add(new Option(c, c)));
            countrySelect.disabled = false;
        } else if (sport === 'nba') {
            gameGroup.classList.remove('hidden');
            if (!nbaGames) {
                try {
                    const resp = await fetch(`${TIPSTER_BASE_URL}/nba`);
                    nbaGames = await resp.json();
                } catch (err) {
                    gameSelect.innerHTML = `<option>Erro ao carregar jogos NBA</option>`;
                    return;
                }
            }
            gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
            nbaGames.forEach(g => {
                const home = g.teams?.home?.name || g.teams?.home?.full_name || 'Home';
                const away = g.teams?.away?.name || g.teams?.away?.full_name || 'Away';
                const date = g.date ? new Date(g.date).toLocaleString() : '-';
                gameSelect.add(new Option(`${home} vs ${away} - ${date} ${g.type === "live" ? "(AO VIVO)" : ""}`, g.game_id));
            });
            gameSelect.disabled = false;
        } else if (sport === 'nfl') {
            gameGroup.classList.remove('hidden');
            if (!nflGames) {
                try {
                    const resp = await fetch(`${TIPSTER_BASE_URL}/nfl`);
                    nflGames = await resp.json();
                } catch (err) {
                    gameSelect.innerHTML = `<option>Erro ao carregar jogos NFL</option>`;
                    return;
                }
            }
            gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
            nflGames.forEach(g => {
                const home = g.teams?.home?.name || 'Home';
                const away = g.teams?.away?.name || 'Away';
                const date = g.date ? new Date(g.date).toLocaleString() : '-';
                gameSelect.add(new Option(`${home} vs ${away} - ${date} ${g.type === "live" ? "(AO VIVO)" : ""}`, g.game_id));
            });
            gameSelect.disabled = false;
        }
    });

    // country -> league -> games logic unchanged (keep your current implementation)...
    countrySelect.addEventListener('change', () => {
        // existing behavior expected from your implementation
        // ensure you rebuild leagues list from footballGames similar to earlier code
    });
    leagueSelect.addEventListener('change', () => {
        // build gameSelect from footballGames filtered by leagueId
    });

});
