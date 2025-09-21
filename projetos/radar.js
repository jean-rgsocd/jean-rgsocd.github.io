// ---------------- Radar IA ----------------
const RADAR_API = "https://radar-ia-backend.vercel.app"; 
// ajusta a URL do deploy do seu backend

const radarLeagueSelect = document.getElementById("radar-league-select");
const radarGameSelect = document.getElementById("radar-game-select");
const radarResultsPanel = document.getElementById("radar-results-panel");

async function loadRadarLeagues() {
  radarLeagueSelect.innerHTML = '<option>Carregando ligas...</option>';
  try {
    const res = await fetch(`${RADAR_API}/jogos-aovivo`);
    const data = await res.json();

    // Agrupar por liga
    const leagues = [...new Set(data.map(g => g.league))];
    radarLeagueSelect.innerHTML = '<option value="">Selecione uma liga</option>';
    leagues.forEach(league => {
      radarLeagueSelect.add(new Option(league, league));
    });
  } catch (err) {
    radarLeagueSelect.innerHTML = '<option>Erro ao carregar ligas</option>';
  }
}

async function loadRadarGames() {
  const league = radarLeagueSelect.value;
  radarGameSelect.innerHTML = '<option>Carregando jogos...</option>';
  try {
    const res = await fetch(`${RADAR_API}/jogos-aovivo`);
    const data = await res.json();
    const games = data.filter(g => g.league === league);

    radarGameSelect.innerHTML = '<option value="">Selecione um jogo</option>';
    games.forEach(game => {
      radarGameSelect.add(new Option(`${game.home} vs ${game.away}`, game.game_id));
    });
  } catch (err) {
    radarGameSelect.innerHTML = '<option>Erro ao carregar jogos</option>';
  }
}

async function loadRadarStats() {
  const gameId = radarGameSelect.value;
  if (!gameId) return;
  radarResultsPanel.innerHTML = "<p class='text-center text-slate-400'>Carregando estatísticas...</p>";

  try {
    const res = await fetch(`${RADAR_API}/stats-aovivo/${gameId}`);
    const stats = await res.json();

    radarResultsPanel.innerHTML = `
      <div class="text-center">
        <h3 class="text-xl font-bold text-cyan-400">${stats.home} ${stats.score.home} - ${stats.score.away} ${stats.away}</h3>
        <p class="text-slate-400">${stats.status}</p>
      </div>

      <!-- Barra de pressão -->
      <div class="flex h-4 w-full bg-slate-700 rounded overflow-hidden my-4">
        <div class="bg-green-500" style="width:${stats.pressure.home}%"></div>
        <div class="bg-red-500" style="width:${stats.pressure.away}%"></div>
      </div>

      <!-- Estatísticas -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-slate-300">
        <div><strong>Remates:</strong> ${stats.shots.home} - ${stats.shots.away}</div>
        <div><strong>Remates Certos:</strong> ${stats.shotsOn.home} - ${stats.shotsOn.away}</div>
        <div><strong>Ataques Perigosos:</strong> ${stats.attacks.home} - ${stats.attacks.away}</div>
        <div><strong>Cantos:</strong> ${stats.corners.home} - ${stats.corners.away}</div>
        <div><strong>Posse de Bola:</strong> ${stats.possession.home}% - ${stats.possession.away}%</div>
      </div>
    `;
  } catch (err) {
    radarResultsPanel.innerHTML = `<p class="text-red-400">Erro ao carregar estatísticas.</p>`;
  }
}

// Eventos
radarLeagueSelect.addEventListener("change", loadRadarGames);
radarGameSelect.addEventListener("change", loadRadarStats);

// Auto refresh a cada 30s
setInterval(() => {
  if (radarGameSelect.value) loadRadarStats();
}, 30000);
