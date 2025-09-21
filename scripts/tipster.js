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
        countryGroup.classList.add('hidden');
        countryGroup.classList.remove('flex');
        leagueGroup.classList.add('hidden');
        leagueGroup.classList.remove('flex');
        gameGroup.classList.add('hidden');
        gameGroup.classList.remove('flex');
    };

    const loadCountries = async () => {
        countrySelect.innerHTML = '<option value="">Carregando...</option>';
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
        const countryCode = countrySelect.value;
        if (!countryCode) return;
        leagueSelect.innerHTML = '<option value="">Carregando...</option>';
        leagueSelect.disabled = false;
        try {
            const res = await fetch(`${TIPSTER_BASE_URL}/ligas/football/${countryCode}`);
            if (!res.ok) throw new Error('Falha ao buscar ligas');
            const data = await res.json();
            leagueSelect.innerHTML = '<option value="">Selecione Liga</option>';
            data.forEach(l => leagueSelect.add(new Option(l.name, l.id)));
        } catch (err) {
            resetSelect(leagueSelect, err.message);
        }
    };

    const loadGames = async (sport, leagueId) => {
        if (!sport || !leagueId) return;
        gameSelect.innerHTML = '<option value="">Carregando...</option>';
        gameSelect.disabled = false;
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
                    const date = new Date(g.time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                    const opt = new Option(`${g.home} vs ${g.away} (${date})`, g.game_id);
                    opt.dataset.status = g.status;
                    gameSelect.add(opt);
                });
            }
        } catch (err) {
            resetSelect(gameSelect, err.message);
        }
    };

    sportSelect.addEventListener('change', () => {
        const sport = sportSelect.value;
        resultsDiv.innerHTML = '';
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
            gameGroup.classList.add('lg:col-span-2');
            loadCountries();
        } else if (sport === 'basketball') {
            gameGroup.classList.add('lg:col-span-2');
            loadGames('basketball', 12);
        } else if (sport === 'american-football') {
            gameGroup.classList.add('lg:col-span-2');
            loadGames('american-football', 16);
        }
    });

    countrySelect.addEventListener('change', loadLeagues);
    leagueSelect.addEventListener('change', () => loadGames(sportSelect.value, leagueSelect.value));
    
    // O evento de selecionar um jogo agora só mostra uma mensagem simples
    gameSelect.addEventListener('change', () => {
        const gameId = gameSelect.value;
        if (gameId) {
            resultsDiv.classList.remove('hidden');
            resultsDiv.innerHTML = `<div class="p-4 border rounded-lg border-slate-700 bg-slate-900"><p class="text-slate-400">Jogo selecionado. A funcionalidade de análise será reativada em breve.</p></div>`;
        } else {
            resultsDiv.classList.add('hidden');
        }
    });
});
