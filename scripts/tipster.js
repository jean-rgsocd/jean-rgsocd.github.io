// tipster.js - frontend para Tipster IA (Futebol, NBA, NFL)
// Todos os esportes: ao vivo + hoje + 2 dias
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

    const TIPSTER_BASE_URL = 'https://analisador-apostas.onrender.com';

    // esconder selects inicialmente
    if (countryGroup) countryGroup.classList.add('hidden');
    if (leagueGroup) leagueGroup.classList.add('hidden');
    if (gameGroup) gameGroup.classList.add('hidden');

    const reset = (selectEl, placeholder) => {
        selectEl.innerHTML = `<option value="">${placeholder}</option>`;
        selectEl.disabled = true;
    };

    // ao mudar o esporte
    sportSelect.addEventListener('change', async () => {
        const sport = sportSelect.value;

        reset(countrySelect, 'Selecione um país');
        reset(leagueSelect, 'Selecione uma liga');
        reset(gameSelect, 'Selecione um jogo');
        countryGroup.classList.add('hidden');
        leagueGroup.classList.add('hidden');
        gameGroup.classList.add('hidden');

        if (sport === 'football') {
            // Futebol → fluxo: país -> liga -> jogo
            countryGroup.classList.remove('hidden');
            try {
                const resp = await fetch(`${TIPSTER_BASE_URL}/futebol`);
                const games = await resp.json();

                // montar lista única de países a partir dos jogos
                const countries = [...new Set(games.map(g => g.league?.country).filter(Boolean))];
                countrySelect.innerHTML = `<option value="">Escolha um país</option>`;
                countries.forEach(c => countrySelect.add(new Option(c, c)));
                countrySelect.disabled = false;
            } catch (err) {
                countrySelect.innerHTML = `<option value="">Erro ao carregar países</option>`;
            }
        } else if (sport === 'nba') {
            // NBA → jogos diretos
            gameGroup.classList.remove('hidden');
            try {
                const resp = await fetch(`${TIPSTER_BASE_URL}/nba`);
                const games = await resp.json();
                gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
                games.forEach(g => {
                    const home = g.teams?.home?.name || "Home";
                    const away = g.teams?.away?.name || "Away";
                    const date = g.date ? new Date(g.date).toLocaleString() : "-";
                    const label = `${home} vs ${away} - ${date} ${g.type === "live" ? "(AO VIVO)" : ""}`;
                    gameSelect.add(new Option(label, g.game_id));
                });
                gameSelect.disabled = false;
            } catch (err) {
                gameSelect.innerHTML = `<option value="">Erro ao carregar jogos NBA</option>`;
            }
        } else if (sport === 'nfl') {
            // NFL → jogos diretos
            gameGroup.classList.remove('hidden');
            try {
                const resp = await fetch(`${TIPSTER_BASE_URL}/nfl`);
                const games = await resp.json();
                gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
                games.forEach(g => {
                    const home = g.teams?.home?.name || "Home";
                    const away = g.teams?.away?.name || "Away";
                    const date = g.date ? new Date(g.date).toLocaleString() : "-";
                    const label = `${home} vs ${away} - ${date} ${g.type === "live" ? "(AO VIVO)" : ""}`;
                    gameSelect.add(new Option(label, g.game_id));
                });
                gameSelect.disabled = false;
            } catch (err) {
                gameSelect.innerHTML = `<option value="">Erro ao carregar jogos NFL</option>`;
            }
        }
    });

    // ao escolher país → carregar ligas
    countrySelect.addEventListener('change', async () => {
        const country = countrySelect.value;
        reset(leagueSelect, 'Selecione uma liga');
        reset(gameSelect, 'Selecione um jogo');
        leagueGroup.classList.add('hidden');
        gameGroup.classList.add('hidden');

        if (!country) return;
        leagueGroup.classList.remove('hidden');

        try {
            const resp = await fetch(`${TIPSTER_BASE_URL}/futebol`);
            const games = await resp.json();
            const leagues = [...new Map(
                games.filter(g => g.league?.country === country)
                     .map(g => [g.league?.id, g.league])
            ).values()];

            leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
            leagues.forEach(l => leagueSelect.add(new Option(l.name, l.id)));
            leagueSelect.disabled = false;
        } catch (err) {
            leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
        }
    });

    // ao escolher liga → carregar jogos
    leagueSelect.addEventListener('change', async () => {
        const leagueId = leagueSelect.value;
        reset(gameSelect, 'Selecione um jogo');
        gameGroup.classList.add('hidden');

        if (!leagueId) return;
        gameGroup.classList.remove('hidden');

        try {
            const resp = await fetch(`${TIPSTER_BASE_URL}/futebol`);
            const games = await resp.json();
            const filtered = games.filter(g => g.league?.id == leagueId);

            if (filtered.length === 0) {
                gameSelect.innerHTML = `<option value="">Nenhum jogo encontrado</option>`;
            } else {
                gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
                filtered.forEach(g => {
                    const home = g.teams?.home?.name || "Home";
                    const away = g.teams?.away?.name || "Away";
                    const date = g.date ? new Date(g.date).toLocaleString() : "-";
                    const label = `${home} vs ${away} - ${date} ${g.type === "live" ? "(AO VIVO)" : ""}`;
                    gameSelect.add(new Option(label, g.game_id));
                });
                gameSelect.disabled = false;
            }
        } catch (err) {
            gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
        }
    });
});
