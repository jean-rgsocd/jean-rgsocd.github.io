// ---------------- Tipster IA ----------------
const TIPSTER_API = "https://analisador-apostas.onrender.com";

const sportSelect = document.getElementById("sportSelect");
const leagueSelect = document.getElementById("leagueSelect");
const gameSelect = document.getElementById("gameSelect");
const leagueSelectorGroup = document.getElementById("leagueSelectorGroup");
const bettingResultsDiv = document.getElementById("bettingResults");

function resetAndDisable(select, msg) {
  select.innerHTML = `<option value="">${msg}</option>`;
  select.disabled = true;
}

// --- Evento: escolher esporte ---
sportSelect.addEventListener("change", async () => {
  const sport = sportSelect.value;
  bettingResultsDiv.classList.add("hidden");

  resetAndDisable(leagueSelect, "Selecione uma liga");
  resetAndDisable(gameSelect, "Selecione um jogo");

  if (sport === "football") {
    leagueSelectorGroup.style.display = "block";
    try {
      const res = await fetch(`${TIPSTER_API}/ligas/football`);
      if (!res.ok) throw new Error("Falha ao buscar ligas");
      const leagues = await res.json();

      leagueSelect.disabled = false;
      leagueSelect.innerHTML = `<option value="">Selecione uma liga</option>`;
      leagues.forEach(l => leagueSelect.add(new Option(l.title, l.id)));
    } catch (err) {
      resetAndDisable(leagueSelect, `Erro: ${err.message}`);
    }
  } else if (sport === "nba" || sport === "nfl") {
    // Para NBA/NFL não precisamos de liga extra, já sabemos os IDs
    leagueSelectorGroup.style.display = "none";

    const leagueId = sport === "nba" ? 12 : 16;
    try {
      const res = await fetch(`${TIPSTER_API}/partidas/${sport === "nba" ? "basketball" : "nfl"}/${leagueId}`);
      if (!res.ok) throw new Error("Falha ao buscar jogos");
      const games = await res.json();

      gameSelect.disabled = false;
      gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
      if (games.length === 0) {
        gameSelect.innerHTML = `<option value="">Nenhum jogo encontrado</option>`;
      } else {
        games.forEach(g =>
          gameSelect.add(new Option(`${g.home} vs ${g.away} (${new Date(g.time).toLocaleString()})`, g.fixture_id))
        );
      }
    } catch (err) {
      resetAndDisable(gameSelect, `Erro: ${err.message}`);
    }
  }
});

// --- Evento: escolher liga (só Futebol) ---
leagueSelect.addEventListener("change", async () => {
  const leagueId = leagueSelect.value;
  bettingResultsDiv.classList.add("hidden");
  resetAndDisable(gameSelect, "Carregando jogos...");

  if (leagueId) {
    try {
      const res = await fetch(`${TIPSTER_API}/partidas/football/${encodeURIComponent(leagueId)}`);
      if (!res.ok) throw new Error("Falha ao buscar jogos");
      const games = await res.json();

      gameSelect.disabled = false;
      gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
      if (games.length === 0) {
        gameSelect.innerHTML = `<option value="">Nenhum jogo encontrado</option>`;
      } else {
        games.forEach(g =>
          gameSelect.add(new Option(`${g.home} vs ${g.away} (${new Date(g.time).toLocaleString()})`, g.fixture_id))
        );
      }
    } catch (err) {
      resetAndDisable(gameSelect, `Erro: ${err.message}`);
    }
  }
});

// --- Evento: escolher jogo ---
gameSelect.addEventListener("change", async () => {
  const fixtureId = gameSelect.value;
  const sport = sportSelect.value;
  const leagueId = leagueSelect.value;

  bettingResultsDiv.classList.add("hidden");
  bettingResultsDiv.innerHTML = "";

  if (!fixtureId) return;

  try {
    let url = "";
    if (sport === "football") {
      url = `${TIPSTER_API}/analise/football/${encodeURIComponent(fixtureId)}`;
    } else if (sport === "nba") {
      url = `${TIPSTER_API}/analise/basketball/${encodeURIComponent(fixtureId)}`;
    } else if (sport === "nfl") {
      url = `${TIPSTER_API}/analise/nfl/${encodeURIComponent(fixtureId)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha ao buscar análise");
    const analysis = await res.json();

    bettingResultsDiv.classList.remove("hidden");
    let htmlResult = `<h3 class="font-bold text-xl text-cyan-300 mb-4">Análise Pré-Jogo</h3>`;

    analysis.forEach(market => {
      htmlResult += `
        <div class="p-4 border rounded-lg border-slate-700 bg-slate-900 space-y-2">
          <p class="text-slate-300"><strong class="text-cyan-400">Mercado:</strong> ${market.market}</p>
          <p class="text-slate-400 mt-2"><i>${market.analysis}</i></p>
        </div>`;
    });

    bettingResultsDiv.innerHTML = htmlResult;
  } catch (err) {
    bettingResultsDiv.classList.remove("hidden");
    bettingResultsDiv.innerHTML = `
      <div class="p-4 border rounded-lg border-red-500/50 bg-red-900/50 text-red-300">
        <strong>Erro:</strong> ${err.message}
      </div>`;
  }
});
