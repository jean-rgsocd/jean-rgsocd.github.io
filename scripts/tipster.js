document.addEventListener('DOMContentLoaded', function () {
    const TIPSTER_BASE_URL = "https://analisador-apostas.onrender.com";
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

    let cachedFootball = null;

    const hide = el => el && el.classList.add('hidden');
    const show = el => el && el.classList.remove('hidden');
    const resetSelect = (sel, text) => { 
        if(!sel) return; 
        sel.innerHTML = `<option value="">${text}</option>`; 
        sel.disabled = true; 
    };

    // init
    resetSelect(countrySelect, 'Selecione um país');
    resetSelect(leagueSelect, 'Selecione uma liga');
    resetSelect(gameSelect, 'Selecione um jogo');
    hide(countryGroup); hide(leagueGroup); hide(gameGroup); hide(resultBox);

    async function loadCountries() {
        try {
            const r = await fetch(`${TIPSTER_BASE_URL}/countries`);
            const data = await r.json();
            countrySelect.innerHTML = `<option value="">Escolha um país</option>`;
            data.forEach(c => countrySelect.add(new Option(c, c)));
            countrySelect.disabled = false;
            show(countryGroup);
        } catch (e) {
            console.error("loadCountries", e);
            countrySelect.innerHTML = `<option value="">Erro ao carregar países</option>`;
        }
    }

    async function loadLeagues(country) {
        try {
            const r = await fetch(`${TIPSTER_BASE_URL}/leagues?country=${encodeURIComponent(country)}`);
            const data = await r.json();
            leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
            data.forEach(l => leagueSelect.add(new Option(`${l.name} - ${l.country || ''}`, l.id)));
            leagueSelect.disabled = false;
            show(leagueGroup);
        } catch (e) {
            console.error("loadLeagues", e);
            leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
        }
    }

    async function loadGames(sport, leagueId) {
        try {
            resetSelect(gameSelect, 'Carregando jogos...');
            show(gameGroup);
            let url = `${TIPSTER_BASE_URL}/jogos-aovivo`;
            if (leagueId) url += `?league=${encodeURIComponent(leagueId)}`;
            const r = await fetch(url);
            const data = await r.json();
            if (!data || data.length === 0) {
                gameSelect.innerHTML = `<option value="">Nenhum jogo ao vivo</option>`;
                return;
            }
            gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
            data.forEach(g => {
                const home = g.teams?.home?.name || "Home";
                const away = g.teams?.away?.name || "Away";
                const date = g.fixture?.date ? new Date(g.fixture.date).toLocaleString() : "-";
                const live = (g.status?.short === "1H" || g.status?.short === "2H") ? " (AO VIVO)" : "";
                gameSelect.add(new Option(`${home} vs ${away} - ${date}${live}`, g.game_id));
            });
            gameSelect.disabled = false;
        } catch (e) {
            console.error("loadGames", e);
            gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
        }
    }

    async function analyzeGame(sport, gameId) {
        resultBox.innerHTML = `<div class="p-3 bg-slate-900/40 border border-slate-700 rounded-md text-slate-200">Carregando análise...</div>`;
        show(resultBox);
        try {
            const r = await fetch(`${TIPSTER_BASE_URL}/stats-aovivo/${encodeURIComponent(gameId)}?sport=${sport}`);
            if (!r.ok) throw new Error("Erro ao carregar stats");
            const j = await r.json();

            if (!j || !j.predictions) {
                resultBox.innerHTML = `<div class="p-3 bg-yellow-900/30 border border-yellow-500 rounded-md text-yellow-200">Nenhuma análise disponível.</div>`;
                return;
            }

            let html = `<div class="p-4 bg-slate-900/40 border border-slate-700 rounded-md text-slate-200">
                <h4 class="font-bold mb-2">Tipster IA — Recomendações</h4>
                <p class="text-sm text-slate-300 mb-3">Jogo: ${j.teams?.home?.name || ''} vs ${j.teams?.away?.name || ''}</p>
                <div class="space-y-3">`;

            j.predictions.forEach(p => {
                const conf = p.confidence || 0;
                const cls = conf >= 0.7 ? "bg-green-600" : (conf >= 0.5 ? "bg-amber-600" : "bg-slate-700");
                html += `<div class="p-3 ${cls} rounded-md">
                    <div class="flex justify-between items-center">
                        <div class="font-semibold">${p.market}</div>
                        <div class="font-bold">${p.recommendation}</div>
                    </div>
                    <div class="text-xs text-slate-200 mt-1">Confiança: ${Math.round(conf*100)}% — ${p.reason || ''}</div>
                </div>`;
            });

            if (j.statistics) {
                html += `<div class="p-3 bg-slate-800 rounded-md">
                    <div class="font-semibold mb-1">Estatísticas</div>
                    <pre class="text-xs">${JSON.stringify(j.statistics, null, 2)}</pre>
                </div>`;
            }

            if (j.events && j.events.length) {
                html += `<div class="p-3 bg-slate-800 rounded-md">
                    <div class="font-semibold mb-1">Eventos Recentes</div>
                    <ul class="text-xs space-y-1">`;
                j.events.slice(0, 10).forEach(ev => {
                    html += `<li>${ev.display_time} — ${ev.category} ${ev.player ? `(${ev.player})` : ""}</li>`;
                });
                html += `</ul></div>`;
            }

            if (j.estimated_extra) {
                html += `<div class="p-3 bg-amber-600/30 rounded-md">
                    <span class="font-semibold">Estimativa de acréscimo:</span> ${j.estimated_extra} min
                </div>`;
            }

            html += `</div></div>`;
            resultBox.innerHTML = html;
            show(resultBox);
        } catch (e) {
            console.error("analyzeGame", e);
            resultBox.innerHTML = `<div class="p-3 bg-red-700/40 border border-red-600 rounded text-red-100">Erro ao carregar análise.</div>`;
            show(resultBox);
        }
    }

    // events
    sportSelect.addEventListener('change', async () => {
        const sport = sportSelect.value;
        resetSelect(countrySelect, 'Selecione um país'); 
        resetSelect(leagueSelect, 'Selecione uma liga'); 
        resetSelect(gameSelect, 'Selecione um jogo');
        hide(countryGroup); hide(leagueGroup); hide(gameGroup); hide(resultBox);

        if (sport === 'football') {
            await loadCountries();
        } else if (sport === 'nba' || sport === 'nfl') {
            await loadGames(sport);
        }
    });

    countrySelect.addEventListener('change', async () => {
        const country = countrySelect.value;
        resetSelect(leagueSelect, 'Selecione uma liga'); 
        resetSelect(gameSelect, 'Selecione um jogo');
        hide(leagueGroup); hide(gameGroup); hide(resultBox);
        if (!country) return;
        await loadLeagues(country);
    });

    leagueSelect.addEventListener('change', async () => {
        const lid = leagueSelect.value;
        resetSelect(gameSelect, 'Selecione um jogo'); 
        hide(gameGroup); hide(resultBox);
        if (!lid) return;
        await loadGames('football', lid);
    });

    gameSelect.addEventListener('change', async () => {
        const gid = gameSelect.value; 
        const sport = sportSelect.value || 'football';
        if (!gid) { hide(resultBox); return; }
        await analyzeGame(sport, gid);
    });

});
