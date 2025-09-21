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
    const TIPSTER_BASE_URL = 'https://analisador-apostas.onrender.com';

    const resetSelect = (el, msg) => {
        el.innerHTML = `<option value="">${msg}</option>`;
        el.disabled = true;
    };

    const hideAllSelectors = () => {
        [countryGroup, leagueGroup, gameGroup].forEach(group => {
            group.classList.add('hidden');
            group.classList.remove('flex');
        });
    };

    const loadCountries = async () => {
        resetSelect(countrySelect, 'Carregando...');
        countrySelect.disabled = false;
        try {
            const res = await fetch(`${TIPSTER_BASE_URL}/paises/football`);
            if (!res.ok) throw new Error('Falha ao buscar países');
            const data = await res.json();
            countrySelect.innerHTML = '<option value="">Selecione País</option>';
            data.forEach(c => countrySelect.add(new Option(c.name, c.code)));
        } catch (err) {
            resetSelect(countrySelect, err.message);
        }
    };

    const loadLeagues = async () => {
        const sport = sportSelect.value;
        let url;

        if (sport === "football") {
            const countryCode = countrySelect.value;
            if (!countryCode) return;
            url = `${TIPSTER_BASE_URL}/ligas/football/${countryCode}`;
        } else if (sport === "basketball") {
            url = `${TIPSTER_BASE_URL}/ligas/basketball`;
        } else if (sport === "american-football") {
            url = `${TIPSTER_BASE_URL}/ligas/american-football`;
        } else {
            return;
        }

        resetSelect(leagueSelect, 'Carregando...');
        leagueSelect.disabled = false;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Falha ao buscar ligas');
            const data = await res.json();
            leagueSelect.innerHTML = '<option value="">Selecione Liga</option>';
            data.forEach(l => leagueSelect.add(new Option(l.name, l.id)));

            // se NBA ou NFL, já dispara os jogos direto
            if (sport !== "football" && data.length > 0) {
                loadGames(sport, data[0].id);
            }
        } catch (err) {
            resetSelect(leagueSelect, err.message);
        }
    };

    const loadGames = async (sport, leagueId) => {
        if (!sport || !leagueId) return;
        resetSelect(gameSelect, 'Carregando...');
        gameGroup.classList.remove('hidden');
        gameGroup.classList.add('flex');
        try {
            const res = await fetch(`${TIPSTER_BASE_URL}/partidas/${sport}/${leagueId}`);
            if (!res.ok) throw new Error('Falha ao buscar jogos.');
            const data = await res.json();
            gameSelect.innerHTML = '<option value="">Selecione Jogo</option>';
            if (data.length === 0) {
                gameSelect.innerHTML = '<option value="">Nenhum jogo encontrado</option>';
            } else {
                data.forEach(g => {
                    const date = new Date(g.time).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    const opt = new Option(`${g.home} vs ${g.away} (${date})`, g.game_id);
                    opt.dataset.status = g.status;
                    gameSelect.add(opt);
                });
            }
        } catch (err) {
            resetSelect(gameSelect, err.message);
        }
    };

    const fetchAnalysis = async (gameId, status) => {
        if (!gameId) {
            resultsDiv.classList.add('hidden');
            return;
        }
        resultsDiv.classList.remove('hidden');
        resultsDiv.innerHTML = `<p class="text-slate-400 text-center">Analisando... 🧠</p>`;
        const sport = sportSelect.value;
        const endpoint = ['LIVE', '1H', 'HT', '2H'].includes(status)
            ? 'analisar-ao-vivo'
            : 'analisar-pre-jogo';
        try {
            const res = await fetch(`${TIPSTER_BASE_URL}/${endpoint}?game_id=${gameId}&sport=${sport}`);
            if (!res.ok) throw new Error('Servidor de análise indisponível.');
            const tips = await res.json();
            const gameText = gameSelect.options[gameSelect.selectedIndex].text.split(' (')[0];
            let html = `<h3 class="font-bold text-xl text-cyan-300 mb-4">Análise para: ${gameText}</h3>`;
            if (tips.length === 0 || (tips[0] && tips[0].confidence === 0)) {
                html += `<div class="p-4 border rounded-lg border-slate-700 bg-slate-900"><p class="text-slate-400">${tips[0]?.justification || 'Sem dicas de alta confiança.'}</p></div>`;
            } else {
                tips.forEach(tip => {
                    html += `<div class="p-4 border rounded-lg border-slate-700 bg-slate-900 space-y-2 mb-4">
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
            resultsDiv.innerHTML = html;
        } catch (err) {
            resultsDiv.innerHTML = `<div class="p-4 border rounded-lg border-red-500/50 bg-red-900/50 text-red-300"><strong>Erro:</strong> ${err.message}</div>`;
        }
    };

    // EVENTOS
    sportSelect.addEventListener('change', () => {
        const sport = sportSelect.value;
        resultsDiv.classList.add('hidden');
        hideAllSelectors();
        resetSelect(gameSelect, '...');
        resetSelect(leagueSelect, '...');
        resetSelect(countrySelect, '...');

        if (sport === 'football') {
            countryGroup.classList.remove('hidden');
            countryGroup.classList.add('flex');
            leagueGroup.classList.remove('hidden');
            leagueGroup.classList.add('flex');
            gameGroup.classList.remove('lg:col-span-2');
            loadCountries();
        } else if (sport === 'basketball' || sport === 'american-football') {
            leagueGroup.classList.remove('hidden');
            leagueGroup.classList.add('flex');
            gameGroup.classList.add('lg:col-span-2');
            loadLeagues();
        }
    });

    countrySelect.addEventListener('change', loadLeagues);
    leagueSelect.addEventListener('change', () => loadGames(sportSelect.value, leagueSelect.value));
    gameSelect.addEventListener('change', () => {
        const opt = gameSelect.options[gameSelect.selectedIndex];
        if (opt && opt.value) fetchAnalysis(opt.value, opt.dataset.status);
    });
});
