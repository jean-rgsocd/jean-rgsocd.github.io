document.addEventListener("DOMContentLoaded", function () {
    // URL base do seu backend onde o opta.py está rodando.
    const OPTA_BASE_URL = "https://analisador-apostas.onrender.com";

    const container = document.getElementById("opta-ia");
    if (!container) {
        return; // Se o container não existe, não faz nada.
    }

    // Mapeamento dos elementos HTML
    const countrySelect = document.getElementById("opta-country-select");
    const leagueGroup = document.getElementById("opta-league-selector-group");
    const leagueSelect = document.getElementById("opta-league-select");
    const teamGroup = document.getElementById("opta-team-selector-group");
    const teamSelect = document.getElementById("opta-team-select");
    const playerGroup = document.getElementById("opta-player-selector-group");
    const playerSelect = document.getElementById("opta-player-select");
    const resultBox = document.getElementById("opta-analysis-result");

    // Funções auxiliares para manipular a interface do usuário (UI)
    const hide = el => el && el.classList.add("hidden");
    const show = el => el && el.classList.remove("hidden");
    const resetSelect = (selectElement, defaultText) => {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        selectElement.disabled = true;
    };
    const setLoading = (selectElement, message) => {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${message}</option>`;
        selectElement.disabled = true;
        selectElement.parentElement.classList.remove('hidden');
    };
    const enableSelect = (selectElement) => {
        if (selectElement) selectElement.disabled = false;
    };

    // Função genérica para buscar dados da API do backend de forma segura
    async function fetchData(endpoint) {
        try {
            const response = await fetch(`${OPTA_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Erro na rede: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar dados de ${endpoint}:`, error);
            throw error;
        }
    }

    // Funções para carregar os dados em cascata (País -> Liga -> Time -> Jogador)
    async function loadCountries() {
        try {
            const countries = await fetchData("/opta/countries");
            resetSelect(countrySelect, "Escolha o País");
            countries.forEach(country => {
                countrySelect.add(new Option(country.name, country.code));
            });
            enableSelect(countrySelect);
        } catch (error) {
            resetSelect(countrySelect, "Erro ao carregar países");
        }
    }

    async function loadLeagues(countryCode) {
        try {
            const leagues = await fetchData(`/opta/leagues?country_code=${countryCode}`);
            resetSelect(leagueSelect, "Escolha a Liga");
            leagues.forEach(league => {
                leagueSelect.add(new Option(league.name, league.id));
            });
            enableSelect(leagueSelect);
            show(leagueGroup);
        } catch (error) {
            resetSelect(leagueSelect, "Erro ao carregar ligas");
        }
    }

    async function loadTeams(leagueId) {
        try {
            const teams = await fetchData(`/opta/teams?league_id=${leagueId}`);
            resetSelect(teamSelect, "Escolha o Time");
            teams.forEach(team => {
                teamSelect.add(new Option(team.name, team.id));
            });
            enableSelect(teamSelect);
            show(teamGroup);
        } catch (error) {
            resetSelect(teamSelect, "Erro ao carregar times");
        }
    }

    async function loadPlayers(teamId) {
        try {
            const players = await fetchData(`/opta/players?team_id=${teamId}`);
            resetSelect(playerSelect, "Escolha o Jogador");
            players.forEach(player => {
                playerSelect.add(new Option(player.name, player.id));
            });
            enableSelect(playerSelect);
            show(playerGroup);
        } catch (error) {
            resetSelect(playerSelect, "Erro ao carregar jogadores");
        }
    }

    // Função principal que busca e exibe a análise do jogador
    async function analyzePlayer(playerId) {
        resultBox.innerHTML = `<div class="p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-center text-slate-300">🔍 Analisando dados do jogador...</div>`;
        show(resultBox);
        try {
            const data = await fetchData(`/opta/analyze?player_id=${playerId}`);

            if (!data || !data.player_info || Object.keys(data.key_stats).length === 0) {
                resultBox.innerHTML = `<div class="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300">Dados insuficientes para análise deste jogador.</div>`;
                return;
            }

            // Monta o HTML do resultado com todas as estatísticas e recomendações
            let html = `
                <div class="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <div class="flex items-center mb-4">
                        <img src="${data.player_info.photo}" alt="Foto de ${data.player_info.name}" class="w-16 h-16 rounded-full mr-4 border-2 border-cyan-400 object-cover bg-slate-700">
                        <div>
                            <h4 class="font-bold text-xl text-slate-100">${data.player_info.name}</h4>
                            <p class="text-sm text-slate-400">${data.player_info.team} | ${data.player_info.position} | ${data.player_info.age} anos</p>
                        </div>
                    </div>

                    <h5 class="font-semibold text-cyan-300 mb-3 mt-6">📊 Estatísticas Chave (Média por Jogo)</h5>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        ${Object.entries(data.key_stats).map(([stat, value]) => `
                            <div class="bg-slate-800 p-2 rounded-md">
                                <p class="text-xs text-slate-400">${stat}</p>
                                <p class="font-bold text-lg text-slate-100">${value}</p>
                            </div>
                        `).join('')}
                    </div>

                    <h5 class="font-semibold text-cyan-300 mb-3 mt-6">🎯 Recomendações de Aposta (Tipster)</h5>
                    <div class="space-y-2">
                        ${data.recommendations.length > 0 ? data.recommendations.map(rec => {
                            const confidence = rec.confidence || 0;
                            let bgColor = 'bg-slate-700/80';
                            if (confidence >= 0.75) bgColor = 'bg-green-600/70';
                            else if (confidence >= 0.5) bgColor = 'bg-yellow-600/70';

                            return `
                            <div class="p-3 ${bgColor} rounded-md border border-slate-600">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-slate-100">${rec.market}</span>
                                    <span class="font-bold text-white text-lg">${rec.recommendation}</span>
                                </div>
                                <div class="text-xs text-slate-200 mt-1">
                                    Confiança: <strong>${Math.round(confidence * 100)}%</strong> — ${rec.reason}
                                </div>
                            </div>
                            `
                        }).join('') : `<p class="text-slate-400 text-sm p-3 bg-slate-800 rounded-md">Nenhuma recomendação forte encontrada com base nas estatísticas atuais.</p>`}
                    </div>
                </div>
            `;
            resultBox.innerHTML = html;
        } catch (error) {
            resultBox.innerHTML = `<div class="p-4 bg-red-800/50 border border-red-700 rounded-lg text-red-300">Ocorreu um erro ao buscar a análise. Verifique o console ou tente novamente.</div>`;
        }
    }


    // Lógica de Eventos que conecta as seleções
    countrySelect.addEventListener('change', () => {
        const countryCode = countrySelect.value;
        hide(leagueGroup);
        hide(teamGroup);
        hide(playerGroup);
        hide(resultBox);
        resetSelect(leagueSelect, "Selecione a Liga");
        if (!countryCode) return;
        
        setLoading(leagueSelect, "Carregando ligas...");
        loadLeagues(countryCode);
    });

    leagueSelect.addEventListener('change', () => {
        const leagueId = leagueSelect.value;
        hide(teamGroup);
        hide(playerGroup);
        hide(resultBox);
        resetSelect(teamSelect, "Selecione o Time");
        if (!leagueId) return;

        setLoading(teamSelect, "Carregando times...");
        loadTeams(leagueId);
    });

    teamSelect.addEventListener('change', () => {
        const teamId = teamSelect.value;
        hide(playerGroup);
        hide(resultBox);
        resetSelect(playerSelect, "Selecione o Jogador");
        if (!teamId) return;

        setLoading(playerSelect, "Carregando jogadores...");
        loadPlayers(teamId);
    });

    playerSelect.addEventListener('change', () => {
        const playerId = playerSelect.value;
        hide(resultBox);
        if (!playerId) return;

        analyzePlayer(playerId);
    });

    // Inicia todo o processo carregando os países
    loadCountries();
});