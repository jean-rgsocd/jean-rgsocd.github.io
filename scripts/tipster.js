// tipster.js
document.addEventListener('DOMContentLoaded', function () {
    const TIPSTER_BASE_URL = "<COLOQUE_O_URL_DO_BACKEND_AQUI>"; // ex: https://analisador-apostas.onrender.com

    const container = document.getElementById('analisador-apostas');
    if (!container) return;

    const sportSelect = document.getElementById('sport-select');
    const countryGroup = document.getElementById('country-selector-group');
    const countrySelect = document.getElementById('country-select');
    const leagueGroup = document.getElementById('league-selector-group');
    const leagueSelect = document.getElementById('league-select');
    const gameGroup = document.getElementById('game-selector-group');
    const gameSelect = document.getElementById('game-select');
    const resultBox = document.getElementById('tipster-analysis-result');

    // caches
    let footballGames = null;
    let nbaGames = null;
    let nflGames = null;

    const hide = el => el && el.classList.add('hidden');
    const show = el => el && el.classList.remove('hidden');

    const resetSelect = (sel, placeholder) => {
        if (!sel) return;
        sel.innerHTML = `<option value="">${placeholder}</option>`;
        sel.disabled = true;
    };

    // inicializa
    resetSelect(countrySelect, 'Selecione um país');
    resetSelect(leagueSelect, 'Selecione uma liga');
    resetSelect(gameSelect, 'Selecione um jogo');
    hide(countryGroup);
    hide(leagueGroup);
    hide(gameGroup);
    hide(resultBox);

    // carregar países (via endpoint)
    const loadCountries = async () => {
        try {
            const resp = await fetch(`${TIPSTER_BASE_URL}/countries`);
            if (!resp.ok) throw new Error('Erro countries');
            const data = await resp.json();
            countrySelect.innerHTML = `<option value="">Escolha um país</option>`;
            data.forEach(c => countrySelect.add(new Option(c, c)));
            countrySelect.disabled = false;
        } catch (err) {
            console.error('loadCountries', err);
            countrySelect.innerHTML = `<option value="">Erro ao carregar países</option>`;
        }
    };

    // carregar ligas por país
    const loadLeagues = async (country) => {
        try {
            const resp = await fetch(`${TIPSTER_BASE_URL}/leagues?country=${encodeURIComponent(country)}`);
            if (!resp.ok) throw new Error('Erro leagues');
            const data = await resp.json();
            leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
            data.forEach(l => leagueSelect.add(new Option(l.name, l.id)));
            leagueSelect.disabled = false;
        } catch (err) {
            console.error('loadLeagues', err);
            leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
        }
    };

    // carregar jogos (por esporte e opcionalmente por liga)
    const loadGames = async (sport, leagueId) => {
        try {
            resetSelect(gameSelect, 'Carregando jogos...');
            show(gameGroup);
            let url = `${TIPSTER_BASE_URL}/games?sport=${encodeURIComponent(sport)}`;
            if (leagueId) url += `&league=${encodeURIComponent(leagueId)}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Erro games');
            const data = await resp.json();
            if (!data || data.length === 0) {
                gameSelect.innerHTML = `<option value="">Nenhum jogo encontrado</option>`;
                return;
            }
            gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
            data.forEach(g => {
                const home = (g.teams && g.teams.home && (g.teams.home.name || g.teams.home.full_name)) || "Home";
                const away = (g.teams && g.teams.away && (g.teams.away.name || g.teams.away.full_name)) || "Away";
                const date = g.date ? new Date(g.date).toLocaleString() : "-";
                const liveLabel = g.type === "live" ? " (AO VIVO)" : "";
                gameSelect.add(new Option(`${home} vs ${away} - ${date}${liveLabel}`, g.game_id));
            });
            gameSelect.disabled = false;
        } catch (err) {
            console.error('loadGames', err);
            gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
        }
    };

    // analyze
    const showLoadingAnalysis = () => {
        resultBox.innerHTML = `<div class="p-3 bg-slate-900/40 border border-slate-700 rounded-md text-slate-200">Carregando análise...</div>`;
        show(resultBox);
    };
    const renderAnalysis = (data) => {
        if (!data || !data.predictions) {
            resultBox.innerHTML = `<div class="p-3 bg-yellow-900/30 border border-yellow-500 rounded-md text-yellow-200">Nenhuma análise disponível.</div>`;
            show(resultBox);
            return;
        }
        let html = `<div class="p-4 bg-slate-900/40 border border-slate-700 rounded-md text-slate-200">
            <h4 class="font-bold mb-2">Tipster IA — Recomendações</h4>
            <p class="text-sm text-slate-300 mb-3">Jogo: ${data.summary.home_team || data.summary.home || ''} vs ${data.summary.away_team || data.summary.away || ''}</p>
            <div class="space-y-2">`;
        data.predictions.forEach(p => {
            const conf = p.confidence !== undefined ? p.confidence : 0;
            const cls = conf >= 0.7 ? "bg-green-600" : (conf >= 0.5 ? "bg-amber-600" : "bg-slate-700");
            html += `<div class="p-3 ${cls} rounded-md">
                <div class="flex justify-between items-center">
                    <div class="font-semibold">${p.market}</div>
                    <div class="font-bold">${p.recommendation}</div>
                </div>
                <div class="text-xs text-slate-200 mt-1">Confiança: ${Math.round(conf*100)}% — ${p.reason || ''}</div>
            </div>`;
        });
        html += `</div></div>`;
        resultBox.innerHTML = html;
        show(resultBox);
    };

    // eventos UI
    sportSelect.addEventListener('change', async () => {
        const sport = sportSelect.value;
        // reset
        resetSelect(countrySelect, 'Selecione um país');
        resetSelect(leagueSelect, 'Selecione uma liga');
        resetSelect(gameSelect, 'Selecione um jogo');
        hide(countryGroup); hide(leagueGroup); hide(gameGroup); hide(resultBox);

        if (sport === 'football') {
            // show countries and prepare leagues/games flow
            await loadCountries();
            show(countryGroup);
        } else if (sport === 'nba' || sport === 'nfl') {
            // show games directly
            show(gameGroup);
            await loadGames(sport);
        }
    });

    countrySelect.addEventListener('change', async () => {
        const country = countrySelect.value;
        resetSelect(leagueSelect, 'Selecione uma liga');
        resetSelect(gameSelect, 'Selecione um jogo');
        hide(gameGroup); hide(resultBox);
        if (!country) { hide(leagueGroup); return; }
        await loadLeagues(country);
        show(leagueGroup);
    });

    leagueSelect.addEventListener('change', async () => {
        const leagueId = leagueSelect.value;
        resetSelect(gameSelect, 'Selecione um jogo');
        hide(resultBox);
        if (!leagueId) { hide(gameGroup); return; }
        await loadGames('football', leagueId);
        show(gameGroup);
    });

    gameSelect.addEventListener('change', async () => {
        const gameId = gameSelect.value;
        const sport = sportSelect.value || 'football';
        if (!gameId) { hide(resultBox); return; }
        showLoadingAnalysis();
        try {
            const resp = await fetch(`${TIPSTER_BASE_URL}/analyze?game_id=${encodeURIComponent(gameId)}&sport=${encodeURIComponent(sport)}`);
            if (!resp.ok) throw new Error('erro analyze');
            const j = await resp.json();
            renderAnalysis(j);
        } catch (err) {
            console.error('analyze error', err);
            resultBox.innerHTML = `<div class="p-3 bg-red-700/40 border border-red-600 rounded text-red-100">Erro ao gerar análise.</div>`;
            show(resultBox);
        }
    });

    // initial: optionally prefetch countries if sport preselected
    // end
});
