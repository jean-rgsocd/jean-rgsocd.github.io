document.addEventListener('DOMContentLoaded', function () {
    const tipsterSection = document.getElementById('analisador-apostas');
    if (!tipsterSection) return;

    const sportSelect = document.getElementById('sport-select'); 
    const gameSelect = document.getElementById('game-select');
    const resultsDiv = document.getElementById('bettingResults');
    const TIPSTER_BASE_URL = 'https://analisador-apostas.onrender.com';

    const resetSelect = (el, msg) => {
        el.innerHTML = `<option value="">${msg}</option>`;
        el.disabled = true;
    };

    const loadSports = async () => {
        resetSelect(sportSelect, 'Carregando Esportes...');
        sportSelect.disabled = false;
        try {
            const res = await fetch(`${TIPSTER_BASE_URL}/sports`);
            if (!res.ok) throw new Error('Falha ao buscar esportes');
            const data = await res.json();
            sportSelect.innerHTML = '<option value="">Selecione um Esporte</option>';
            data.forEach(sport => {
                sportSelect.add(new Option(sport.title, sport.key));
            });
        } catch (err) {
            resetSelect(sportSelect, err.message);
        }
    };

    sportSelect.addEventListener('change', async () => {
        const sportKey = sportSelect.value;
        resultsDiv.classList.add('hidden');
        if (!sportKey) {
            resetSelect(gameSelect, 'Selecione um esporte');
            return;
        }

        resetSelect(gameSelect, 'Carregando jogos...');
        gameSelect.disabled = false;
        try {
            const res = await fetch(`${TIPSTER_BASE_URL}/upcoming-games/${sportKey}`);
            if (!res.ok) throw new Error('Falha ao buscar jogos');
            const games = await res.json();
            
            gameSelect.gamesData = games; 

            gameSelect.innerHTML = '<option value="">Selecione um Jogo</option>';
            if (games.length === 0) {
                gameSelect.innerHTML = '<option value="">Nenhum jogo encontrado</option>';
            } else {
                games.forEach(game => {
                    const date = new Date(game.commence_time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                    const opt = new Option(`${game.home_team} vs ${game.away_team} (${date})`, game.id);
                    gameSelect.add(opt);
                });
            }
        } catch (err) {
            resetSelect(gameSelect, err.message);
        }
    });

    gameSelect.addEventListener('change', () => {
        const gameId = gameSelect.value;
        if (!gameId || !gameSelect.gamesData) {
            resultsDiv.classList.add('hidden');
            return;
        }

        const selectedGame = gameSelect.gamesData.find(g => g.id === gameId);
        if (!selectedGame) return;

        resultsDiv.classList.remove('hidden');
        let html = `<h3 class="font-bold text-xl text-cyan-300 mb-4">Odds para: ${selectedGame.home_team} vs ${selectedGame.away_team}</h3>`;
        
        html += '<div class="p-4 border rounded-lg border-slate-700 bg-slate-900 space-y-2">';
        for (const team in selectedGame.odds) {
            html += `<p class="text-slate-300 flex justify-between"><span>${team}:</span> <span class="font-bold text-cyan-400">${selectedGame.odds[team]}</span></p>`;
        }
        html += '</div>';
        
        resultsDiv.innerHTML = html;
    });

    loadSports();
});
