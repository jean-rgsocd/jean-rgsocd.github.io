// tipster.js - frontend logic para Tipster IA (escondendo selects até serem necessários)
document.addEventListener('DOMContentLoaded', function () {
    const tipsterSection = document.getElementById('analisador-apostas');
    if (!tipsterSection) return;

    const sportSelect = tipsterSection.querySelector('#sport-select');
    const countryGroup = tipsterSection.querySelector('#country-selector-group');
    const countrySelect = tipsterSection.querySelector('#country-select');
    const leagueGroup = tipsterSection.querySelector('#league-selector-group');
    const leagueSelect = tipsterSection.querySelector('#league-select');
    const gameGroup = tipsterSection.querySelector('#game-selector-group');
    const gameSelect = tipsterSection.querySelector('#game-select');

    // esconder inicialmente
    if(countryGroup) countryGroup.classList.add('hidden');
    if(leagueGroup) leagueGroup.classList.add('hidden');
    if(gameGroup) gameGroup.classList.add('hidden');

    const TIPSTER_BASE_URL = 'https://analisador-apostas.onrender.com';

    const reset = (selectEl, placeholder) => {
        selectEl.innerHTML = `<option value="">${placeholder}</option>`;
        selectEl.disabled = true;
    };

    // quando escolhe esporte
    sportSelect.addEventListener('change', async () => {
        const sport = sportSelect.value;
        // reset tudo
        reset(countrySelect, 'Selecione um país');
        reset(leagueSelect, 'Selecione uma liga');
        reset(gameSelect, 'Selecione um jogo');
        countryGroup.classList.add('hidden');
        leagueGroup.classList.add('hidden');
        gameGroup.classList.add('hidden');

        if (sport === 'football') {
            // mostrar seletor de país -> liga -> jogo
            countryGroup.classList.remove('hidden');
            countrySelect.disabled = true;
            countrySelect.innerHTML = `<option>Carregando países...</option>`;
            try {
                const resp = await fetch(`${TIPSTER_BASE_URL}/futebol/countries`);
                const countries = await resp.json();
                countrySelect.innerHTML = `<option value="">Escolha um país</option>`;
                countries.forEach(c => countrySelect.add(new Option(`${c.country} (${c.count})`, c.country)));
                countrySelect.disabled = false;
            } catch (err) {
                countrySelect.innerHTML = `<option value="">Erro ao carregar países</option>`;
            }
        } else if (sport === 'basketball') {
            // carregar diretamente jogos NBA (hoje + 30 dias)
            gameGroup.classList.remove('hidden');
            gameSelect.innerHTML = `<option>Carregando jogos NBA...</option>`;
            try {
                const resp = await fetch(`${TIPSTER_BASE_URL}/nba`);
                const games = await resp.json();
                gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
                games.forEach(g => {
                    const label = `${g.home?.name || g.home?.full_name || 'Home'} vs ${g.away?.name || g.away?.full_name || 'Away'} - ${g.date}`;
                    gameSelect.add(new Option(label, g.game_id));
                });
                gameSelect.disabled = false;
            } catch (err) {
                gameSelect.innerHTML = `<option value="">Erro ao carregar jogos NBA</option>`;
            }
        } else if (sport === 'american-football') {
            gameGroup.classList.remove('hidden');
            gameSelect.innerHTML = `<option>Carregando jogos NFL...</option>`;
            try {
                const resp = await fetch(`${TIPSTER_BASE_URL}/nfl`);
                const games = await resp.json();
                gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
                games.forEach(g => {
                    const label = `${g.teams?.home?.name || 'Home'} vs ${g.teams?.away?.name || 'Away'} - ${g.date}`;
                    gameSelect.add(new Option(label, g.game_id));
                });
                gameSelect.disabled = false;
            } catch (err) {
                gameSelect.innerHTML = `<option value="">Erro ao carregar jogos NFL</option>`;
            }
        }
    });

    // quando escolhe país -> carregar ligas
    countrySelect.addEventListener('change', async () => {
        const country = countrySelect.value;
        reset(leagueSelect, 'Selecione uma liga');
        reset(gameSelect, 'Selecione um jogo');
        leagueGroup.classList.add('hidden');
        gameGroup.classList.add('hidden');

        if (!country) return;
        leagueGroup.classList.remove('hidden');
        leagueSelect.innerHTML = `<option>Carregando ligas...</option>`;
        try {
            const resp = await fetch(`${TIPSTER_BASE_URL}/futebol/leagues?country=${encodeURIComponent(country)}`);
            const leagues = await resp.json();
            leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
            leagues.forEach(l => leagueSelect.add(new Option(`${l.name} (${l.season || ''})`, l.id)));
            leagueSelect.disabled = false;
        } catch (err) {
            leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
        }
    });

    // quando escolhe liga -> carregar jogos
    leagueSelect.addEventListener('change', async () => {
        const leagueId = leagueSelect.value;
        reset(gameSelect, 'Selecione um jogo');
        gameGroup.classList.add('hidden');

        if (!leagueId) return;
        gameGroup.classList.remove('hidden');
        gameSelect.innerHTML = `<option>Carregando jogos...</option>`;
        try {
            const resp = await fetch(`${TIPSTER_BASE_URL}/futebol/games?league_id=${leagueId}`);
            const games = await resp.json();
            if (!games || games.length === 0) {
                gameSelect.innerHTML = `<option value="">Nenhum jogo encontrado</option>`;
            } else {
                gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
                games.forEach(g => {
                    const date = g.fixture?.date ? new Date(g.fixture.date).toLocaleString() : 'Data indefinida';
                    const label = `${g.teams.home.name} vs ${g.teams.away.name} - ${date} ${g.type === 'live' ? '(AO VIVO)' : ''}`;
                    gameSelect.add(new Option(label, g.game_id));
                });
                gameSelect.disabled = false;
            }
        } catch (err) {
            gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
        }
    });
});
