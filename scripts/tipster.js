// tipster.js - integra com RADAR backend para ligas + TIPSTER backend para análise
document.addEventListener('DOMContentLoaded', function () {
  const TIPSTER_BASE_URL = "https://analisador-apostas.onrender.com"; // seu backend de análise
  const RADAR_API = "https://radar-ia-backend.onrender.com"; // backend do radar (liga/jogos ao vivo)
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

  const hide = el => el && el.classList.add('hidden');
  const show = el => el && el.classList.remove('hidden');
  const resetSelect = (sel, text) => { if(!sel) return; sel.innerHTML = `<option value="">${text}</option>`; sel.disabled = true; };

  // init
  resetSelect(countrySelect, 'Selecione um país');
  resetSelect(leagueSelect, 'Selecione uma liga');
  resetSelect(gameSelect, 'Selecione um jogo');
  hide(countryGroup); hide(leagueGroup); hide(gameGroup); hide(resultBox);

  // --- carregar países a partir das ligas que o radar lista (usa /ligas)
  async function loadCountriesFromRadar() {
    try {
      const r = await fetch(`${RADAR_API}/ligas`);
      const leagues = await r.json();
      const countries = Array.from(new Set((leagues || []).map(l => l.country).filter(Boolean))).sort();
      countrySelect.innerHTML = `<option value="">Escolha um país</option>`;
      countries.forEach(c => countrySelect.add(new Option(c, c)));
      countrySelect.disabled = false;
      show(countryGroup);
    } catch (e) {
      console.error("loadCountriesFromRadar", e);
      countrySelect.innerHTML = `<option value="">Erro ao carregar países</option>`;
    }
  }

  // --- carregar ligas filtrando por país (local: pega ligas do radar e filtra)
  async function loadLeaguesFromRadar(country) {
    try {
      const r = await fetch(`${RADAR_API}/ligas`);
      const leagues = await r.json();
      const filtered = (leagues || []).filter(l => (l.country || "") === country);
      leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
      filtered.forEach(l => leagueSelect.add(new Option(l.name, l.id)));
      leagueSelect.disabled = false;
      show(leagueGroup);
    } catch (e) {
      console.error("loadLeaguesFromRadar", e);
      leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
    }
  }

  // --- carregar jogos: tenta TIPSTER backend /games primeiro (vai buscar jogos futuros),
  // se não houver fallback para jogos ao vivo via RADAR /jogos-aovivo
  async function loadGames(sport, leagueId = null) {
    resetSelect(gameSelect, 'Carregando jogos...');
    show(gameGroup);
    try {
      let url = `${TIPSTER_BASE_URL}/games?sport=${encodeURIComponent(sport)}`;
      if (leagueId) url += `&league=${encodeURIComponent(leagueId)}`;
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        // filtrar: queremos AO VIVO ou próximos 2 dias
        const now = new Date();
        const maxDate = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)); // +2 dias
        const available = (data || []).filter(g => {
          const isLive = (g.type === "live") || (g.fixture && g.fixture.status && g.fixture.status.short === "LIVE");
          let d = g.date || (g.fixture && g.fixture.date) || g.start;
          if (!d) return isLive;
          const dt = new Date(d);
          // include hoje->+2 dias OR live
          return isLive || (dt >= now && dt <= maxDate);
        });
        if (!available || available.length === 0) {
          // fallback to RADAR live
          return await loadGamesFallbackRadar(leagueId);
        }
        gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
        available.forEach(g => {
          const home = (g.teams && (g.teams.home?.name || g.teams.home?.full_name)) || (g.home && g.home.name) || "Home";
          const away = (g.teams && (g.teams.away?.name || g.teams.away?.full_name)) || (g.away && g.away.name) || "Away";
          const date = g.date || (g.fixture && g.fixture.date) || "";
          const dateLabel = date ? ` - ${new Date(date).toLocaleString()}` : (g.type === "live" ? " (AO VIVO)" : "");
          gameSelect.add(new Option(`${home} vs ${away}${dateLabel}`, g.game_id || (g.fixture && g.fixture.id) || g.id));
        });
        gameSelect.disabled = false;
        return;
      } else {
        // fallback
        return await loadGamesFallbackRadar(leagueId);
      }
    } catch (e) {
      console.error("loadGames error, fallback to radar", e);
      return await loadGamesFallbackRadar(leagueId);
    }
  }

  // --- fallback: lista de jogos AO VIVO do radar
  async function loadGamesFallbackRadar(leagueId = null) {
    try {
      const url = leagueId ? `${RADAR_API}/jogos-aovivo?league=${encodeURIComponent(leagueId)}` : `${RADAR_API}/jogos-aovivo`;
      const r = await fetch(url);
      const data = await r.json();
      if (!data || data.length === 0) {
        gameSelect.innerHTML = `<option value="">Nenhum jogo disponível</option>`;
        gameSelect.disabled = true;
        return;
      }
      gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
      data.forEach(g => {
        gameSelect.add(new Option(g.title, g.game_id));
      });
      gameSelect.disabled = false;
    } catch (e) {
      console.error("loadGamesFallbackRadar", e);
      gameSelect.innerHTML = `<option value="">Erro ao buscar jogos</option>`;
    }
  }

  // --- chamar análise (Tipster backend)
  async function analyzeGame(sport, gameId) {
    resultBox.innerHTML = `<div class="p-3 bg-slate-900/40 border border-slate-700 rounded-md text-slate-200">Carregando análise...</div>`;
    show(resultBox);
    try {
      const r = await fetch(`${TIPSTER_BASE_URL}/analyze?game_id=${encodeURIComponent(gameId)}&sport=${encodeURIComponent(sport)}`);
      if (!r.ok) throw new Error("Erro analyze");
      const j = await r.json();
      if (!j || !j.predictions) {
        resultBox.innerHTML = `<div class="p-3 bg-yellow-900/30 border border-yellow-500 rounded-md text-yellow-200">Nenhuma análise disponível.</div>`;
        return;
      }
      let html = `<div class="p-4 bg-slate-900/40 border border-slate-700 rounded-md text-slate-200">
                    <h4 class="font-bold mb-2">Tipster IA — Recomendações</h4>
                    <p class="text-sm text-slate-300 mb-3">Jogo: ${j.summary?.home_team || j.summary?.home || ''} vs ${j.summary?.away_team || j.summary?.away || ''}</p>
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
      html += `</div></div>`;
      resultBox.innerHTML = html;
      show(resultBox);
    } catch (e) {
      console.error("analyzeGame", e);
      resultBox.innerHTML = `<div class="p-3 bg-red-700/40 border border-red-600 rounded text-red-100">Erro ao gerar análise.</div>`;
      show(resultBox);
    }
  }

  // --- eventos UI
  sportSelect.addEventListener('change', async () => {
    const sport = sportSelect.value;
    resetSelect(countrySelect, 'Selecione um país'); resetSelect(leagueSelect, 'Selecione uma liga'); resetSelect(gameSelect, 'Selecione um jogo');
    hide(countryGroup); hide(leagueGroup); hide(gameGroup); hide(resultBox);
    if (sport === 'football') {
      await loadCountriesFromRadar();
    } else if (sport === 'nba' || sport === 'nfl') {
      // para NBA/NFL tentamos buscar jogos diretamente do TIPSTER backend (próximos 30 dias / hoje)
      await loadGames(sport);
    }
  });

  countrySelect.addEventListener('change', async () => {
    const country = countrySelect.value;
    resetSelect(leagueSelect, 'Selecione uma liga'); resetSelect(gameSelect, 'Selecione um jogo');
    hide(leagueGroup); hide(gameGroup); hide(resultBox);
    if (!country) return;
    await loadLeaguesFromRadar(country);
  });

  leagueSelect.addEventListener('change', async () => {
    const lid = leagueSelect.value;
    resetSelect(gameSelect, 'Selecione um jogo'); hide(gameGroup); hide(resultBox);
    if (!lid) return;
    const sport = sportSelect.value || 'football';
    await loadGames(sport, lid);
  });

  gameSelect.addEventListener('change', async () => {
    const gid = gameSelect.value;
    const sport = sportSelect.value || 'football';
    if (!gid) { hide(resultBox); return; }
    await analyzeGame(sport, gid);
  });

});
