// tipster.js - frontend Tipster otimizado (cache local, usa /futebol, /nba, /nfl)
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

    // caches locais
    let footballGames = null;
    let nbaGames = null;
    let nflGames = null;

    // esconder selects inicialmente
    if (countryGroup) countryGroup.classList.add('hidden');
    if (leagueGroup) leagueGroup.classList.add('hidden');
    if (gameGroup) gameGroup.classList.add('hidden');

    const reset = (selectEl, placeholder) => {
        selectEl.innerHTML = `<option value="">${placeholder}</option>`;
        selectEl.disabled = true;
    };

    sportSelect.addEventListener('change', async () => {
        const sport = sportSelect.value;
        reset(countrySelect, 'Escolha um país');
        reset(leagueSelect, 'Escolha uma liga');
        reset(gameSelect, 'Selecione um jogo');
        countryGroup.classList.add('hidden');
        leagueGroup.classList.add('hidden');
        gameGroup.classList.add('hidden');

        if (sport === 'football') {
            // carregar jogos (cache)
            countryGroup.classList.remove('hidden');
            countrySelect.innerHTML = `<option>Carregando...</option>`;
            if (!footballGames) {
                try {
                    const resp = await fetch(`${TIPSTER_BASE_URL}/futebol`);
                    footballGames = await resp.json();
                } catch (err) {
                    countrySelect.innerHTML = `<option>Erro ao carregar</option>`;
                    console.error(err);
                    return;
                }
            }
            // extrair países das ligas
            const countries = Array.from(new Set(footballGames.map(g => (g.league && g.league.country) || null).filter(Boolean))).sort();
            countrySelect.innerHTML = `<option value="">Escolha um país</option>`;
            countries.forEach(c => countrySelect.add(new Option(c, c)));
            countrySelect.disabled = false;
        } else if (sport === 'nba') {
            gameGroup.classList.remove('hidden');
            gameSelect.innerHTML = `<option>Carregando jogos...</option>`;
            if (!nbaGames) {
                try {
                    const resp = await fetch(`${TIPSTER_BASE_URL}/nba`);
                    nbaGames = await resp.json();
                } catch (err) {
                    gameSelect.innerHTML = `<option>Erro ao carregar jogos NBA</option>`;
                    console.error(err);
                    return;
                }
            }
            gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
            nbaGames.forEach(g => {
                const home = g.teams?.home?.name || g.teams?.home?.teamName || "Home";
                const away = g.teams?.away?.name || g.teams?.away?.teamName || "Away";
                const date = g.date ? new Date(g.date).toLocaleString() : "-";
                gameSelect.add(new Option(`${home} vs ${away} - ${date} ${g.type === "live" ? "(AO VIVO)" : ""}`, g.game_id));
            });
            gameSelect.disabled = false;
        } else if (sport === 'nfl') {
            gameGroup.classList.remove('hidden');
            gameSelect.innerHTML = `<option>Carregando jogos...</option>`;
            if (!nflGames) {
                try {
                    const resp = await fetch(`${TIPSTER_BASE_URL}/nfl`);
                    nflGames = await resp.json();
                } catch (err) {
                    gameSelect.innerHTML = `<option>Erro ao carregar jogos NFL</option>`;
                    console.error(err);
                    return;
                }
            }
            gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
            nflGames.forEach(g => {
                const home = g.teams?.home?.name || "Home";
                const away = g.teams?.away?.name || "Away";
                const date = g.date ? new Date(g.date).toLocaleString() : "-";
                gameSelect.add(new Option(`${home} vs ${away} - ${date} ${g.type === "live" ? "(AO VIVO)" : ""}`, g.game_id));
            });
            gameSelect.disabled = false;
        }
    });

    // país -> ligas
    countrySelect.addEventListener('change', () => {
        const country = countrySelect.value;
        reset(leagueSelect, 'Escolha uma liga');
        reset(gameSelect, 'Selecione um jogo');
        leagueGroup.classList.add('hidden');
        gameGroup.classList.add('hidden');
        if (!country) return;

        // filtrar leagues no cache footballGames
        const leagueMap = new Map();
        footballGames.filter(g => g.league && g.league.country === country).forEach(g => {
            const l = g.league;
            if (l && l.id) leagueMap.set(l.id, l);
        });
        const leagues = Array.from(leagueMap.values());
        leagueGroup.classList.remove('hidden');
        leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
        leagues.forEach(l => leagueSelect.add(new Option(`${l.name} (${l.season || ''})`, l.id)));
        leagueSelect.disabled = false;
    });

    // liga -> jogos
    leagueSelect.addEventListener('change', () => {
        const leagueId = leagueSelect.value;
        reset(gameSelect, 'Selecione um jogo');
        gameGroup.classList.add('hidden');
        if (!leagueId) return;

        const filtered = footballGames.filter(g => g.league && String(g.league.id) === String(leagueId));
        gameGroup.classList.remove('hidden');
        if (!filtered.length) {
            gameSelect.innerHTML = `<option value="">Nenhum jogo encontrado</option>`;
            return;
        }
        gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
        filtered.forEach(g => {
            const home = g.teams?.home?.name || "Home";
            const away = g.teams?.away?.name || "Away";
            const date = g.date ? new Date(g.date).toLocaleString() : "-";
            gameSelect.add(new Option(`${home} vs ${away} - ${date} ${g.type === "live" ? "(AO VIVO)" : ""}`, g.game_id));
        });
        gameSelect.disabled = false;
    });

});
