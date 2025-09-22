document.addEventListener("DOMContentLoaded", function () {
    // URL base do backend (ajuste para o seu Render/VPS)
    const OPTA_BASE_URL = "https://opta-ia-backend.onrender.com";

    const container = document.getElementById("opta-ia");
    if (!container) return;

    // Seletores da UI
    const countrySelect = document.getElementById("opta-country-select");
    const leagueGroup = document.getElementById("opta-league-selector-group");
    const leagueSelect = document.getElementById("opta-league-select");
    const teamGroup = document.getElementById("opta-team-selector-group");
    const teamSelect = document.getElementById("opta-team-select");
    const playerGroup = document.getElementById("opta-player-selector-group");
    const playerSelect = document.getElementById("opta-player-select");
    const resultBox = document.getElementById("opta-analysis-result");

    // Helpers de UI
    const hide = el => el && el.classList.add("hidden");
    const show = el => el && el.classList.remove("hidden");
    const resetSelect = (sel, txt) => {
        if (!sel) return;
        sel.innerHTML = `<option value="">${txt}</option>`;
        sel.disabled = true;
    };
    const setLoading = (sel, msg) => {
        if (!sel) return;
        sel.innerHTML = `<option value="">${msg}</option>`;
        sel.disabled = true;
        sel.parentElement.classList.remove("hidden");
    };
    const enableSelect = sel => { if (sel) sel.disabled = false; };

    // Função segura para buscar API
    async function fetchData(endpoint) {
        try {
            const r = await fetch(`${OPTA_BASE_URL}${endpoint}`);
            if (!r.ok) throw new Error(`Erro HTTP: ${r.status}`);
            return await r.json();
        } catch (e) {
            console.error(`Erro em fetchData(${endpoint})`, e);
            throw e;
        }
    }

    // --- Loaders ---
    async function loadCountries() {
        try {
            const countries = await fetchData("/opta/countries");
            resetSelect(countrySelect, "Escolha o País");
            countries.forEach(c => countrySelect.add(new Option(c.name, c.code || c.country || c.name)));
            enableSelect(countrySelect);
        } catch {
            resetSelect(countrySelect, "Erro ao carregar países");
        }
    }

    async function loadLeagues(countryCode) {
        try {
            const leagues = await fetchData(`/opta/leagues?country_code=${encodeURIComponent(countryCode)}`);
            resetSelect(leagueSelect, "Escolha a Liga");
            leagues.forEach(l => leagueSelect.add(new Option(`${l.name} - ${l.country}`, l.id)));
            enableSelect(leagueSelect);
            show(leagueGroup);
        } catch {
            resetSelect(leagueSelect, "Erro ao carregar ligas");
        }
    }

    async function loadTeams(leagueId) {
        try {
            const teams = await fetchData(`/opta/teams?league_id=${encodeURIComponent(leagueId)}`);
            resetSelect(teamSelect, "Escolha o Time");
            teams.forEach(t => teamSelect.add(new Option(t.name, t.id)));
            enableSelect(teamSelect);
            show(teamGroup);
        } catch {
            resetSelect(teamSelect, "Erro ao carregar times");
        }
    }

    async function loadPlayers(teamId) {
        try {
            const players = await fetchData(`/opta/players?team_id=${encodeURIComponent(teamId)}`);
            resetSelect(playerSelect, "Escolha o Jogador");
            players.forEach(p => playerSelect.add(new Option(p.name, p.id)));
            enableSelect(playerSelect);
            show(playerGroup);
        } catch {
            resetSelect(playerSelect, "Erro ao carregar jogadores");
        }
    }

    // --- Análise ---
    async function analyzePlayer(playerId) {
        resultBox.innerHTML = `<div class="p-4 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 text-center">🔍 Analisando estatísticas e odds...</div>`;
        show(resultBox);
        try {
            const j = await fetchData(`/opta/analyze?player_id=${encodeURIComponent(playerId)}`);

            if (!j || !j.player_info || !j.key_stats || Object.keys(j.key_stats).length === 0) {
                resultBox.innerHTML = `<div class="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg text-yellow-300">Dados insuficientes para análise deste jogador.</div>`;
                return;
            }

            let html = `
                <div class="p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <div class="flex items-center mb-4">
                        <img src="${j.player_info.photo}" alt="Foto ${j.player_info.name}" class="w-16 h-16 rounded-full mr-4 border-2 border-cyan-400 object-cover bg-slate-700">
                        <div>
                            <h4 class="font-bold text-xl text-slate-100">${j.player_info.name}</h4>
                            <p class="text-sm text-slate-400">${j.player_info.team} | ${j.player_info.position} | ${j.player_info.age} anos</p>
                        </div>
                    </div>

                    <h5 class="font-semibold text-cyan-300 mb-3 mt-6">📊 Estatísticas (Média/Jogo)</h5>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        ${Object.entries(j.key_stats).map(([k,v]) => `
                            <div class="bg-slate-800 p-2 rounded-md">
                                <p class="text-xs text-slate-400">${k}</p>
                                <p class="font-bold text-lg text-slate-100">${v}</p>
                            </div>
                        `).join("")}
                    </div>

                    <h5 class="font-semibold text-cyan-300 mb-3 mt-6">🎯 Recomendações (Odds do próximo jogo)</h5>
                    <div class="space-y-2">
                        ${j.recommendations && j.recommendations.length > 0 ? j.recommendations.map(rec => {
                            const conf = rec.confidence || 0;
                            let cls = "bg-slate-700/80";
                            if (conf >= 0.75) cls = "bg-green-600/70";
                            else if (conf >= 0.5) cls = "bg-yellow-600/70";

                            let oddsHtml = "";
                            if (rec.best_odd && rec.bookmaker) {
                                oddsHtml = `<div class="mt-2 pt-2 border-t border-slate-500/50 text-xs text-white">
                                    Melhor Odd: <span class="font-bold text-lg">${rec.best_odd}</span> na <span class="font-semibold">${rec.bookmaker}</span>
                                </div>`;
                            }

                            return `
                                <div class="p-3 ${cls} rounded-md border border-slate-600">
                                    <div class="flex justify-between items-center">
                                        <span class="font-semibold text-slate-100">${rec.market}</span>
                                        <span class="font-bold text-white text-lg">${rec.recommendation} ${rec.line || ""}</span>
                                    </div>
                                    <div class="text-xs text-slate-200 mt-1">
                                        Confiança: <strong>${Math.round(conf * 100)}%</strong> — ${rec.reason || ""}
                                    </div>
                                    ${oddsHtml}
                                </div>
                            `;
                        }).join("") : `<p class="p-3 bg-slate-800 rounded-md text-slate-400 text-sm">Nenhuma recomendação disponível.</p>`}
                    </div>
                </div>
            `;

            resultBox.innerHTML = html;
        } catch (e) {
            console.error("analyzePlayer", e);
            resultBox.innerHTML = `<div class="p-4 bg-red-800/50 border border-red-700 rounded-lg text-red-300">Erro ao buscar análise. Tente novamente.</div>`;
        }
    }

    // --- Eventos ---
    countrySelect.addEventListener("change", () => {
        const c = countrySelect.value;
        hide(leagueGroup); hide(teamGroup); hide(playerGroup); hide(resultBox);
        resetSelect(leagueSelect, "Selecione a Liga");
        if (!c) return;
        setLoading(leagueSelect, "Carregando ligas...");
        loadLeagues(c);
    });

    leagueSelect.addEventListener("change", () => {
        const l = leagueSelect.value;
        hide(teamGroup); hide(playerGroup); hide(resultBox);
        resetSelect(teamSelect, "Selecione o Time");
        if (!l) return;
        setLoading(teamSelect, "Carregando times...");
        loadTeams(l);
    });

    teamSelect.addEventListener("change", () => {
        const t = teamSelect.value;
        hide(playerGroup); hide(resultBox);
        resetSelect(playerSelect, "Selecione o Jogador");
        if (!t) return;
        setLoading(playerSelect, "Carregando jogadores...");
        loadPlayers(t);
    });

    playerSelect.addEventListener("change", () => {
        const p = playerSelect.value;
        hide(resultBox);
        if (!p) return;
        analyzePlayer(p);
    });

    // Start flow
    loadCountries();
});
