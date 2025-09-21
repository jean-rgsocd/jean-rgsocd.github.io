// scripts/radar.js

const RADAR_API = "https://radar-ia-backend.onrender.com";

const radarGameSelect = document.getElementById("radar-game-select");
const radarScore = document.getElementById("radar-score");
const radarMinute = document.getElementById("radar-minute");
const homePossession = document.getElementById("home-possession");
const awayPossession = document.getElementById("away-possession");
const homeShots = document.getElementById("home-shots");
const awayShots = document.getElementById("away-shots");
const homeCorners = document.getElementById("home-corners");
const awayCorners = document.getElementById("away-corners");
const pressureBar = document.getElementById("pressure-bar");
const radarEvents = document.getElementById("radar-events");

// Função para carregar jogos ao vivo
async function loadLiveGames() {
  if (!radarGameSelect) return;
  radarGameSelect.innerHTML = `<option value="">Carregando jogos...</option>`;
  try {
    const res = await fetch(`${RADAR_API}/jogos-aovivo`);
    if (!res.ok) throw new Error("Falha ao buscar jogos");
    const games = await res.json();

    radarGameSelect.innerHTML = "";
    if (games.length === 0) {
      radarGameSelect.innerHTML = `<option value="">Nenhum jogo ao vivo</option>`;
      return;
    }

    radarGameSelect.add(new Option("Selecione um jogo", ""));
    games.forEach(g =>
      radarGameSelect.add(new Option(g.title, g.game_id))
    );
  } catch (err) {
    radarGameSelect.innerHTML = `<option value="">Erro: ${err.message}</option>`;
  }
}

// Função para carregar estatísticas do jogo selecionado
async function loadGameStats(gameId) {
  try {
    const res = await fetch(`${RADAR_API}/stats-aovivo/${gameId}`);
    if (!res.ok) throw new Error("Falha ao buscar estatísticas");
    const data = await res.json();

    radarScore.textContent = data.score || "-";
    radarMinute.textContent = data.minute || "-";

    homePossession.textContent = data.stats.possession.home;
    awayPossession.textContent = data.stats.possession.away;
    homeShots.textContent = data.stats.shots.home;
    awayShots.textContent = data.stats.shots.away;
    homeCorners.textContent = data.stats.corners.home;
    awayCorners.textContent = data.stats.corners.away;

    // Atualizar barra de pressão
    if (data.indice_pressao) {
      const pctHome = data.indice_pressao.home;
      pressureBar.style.width = pctHome + "%";
      pressureBar.style.background = pctHome > 50 ? "#06b6d4" : "#f43f5e";
    }

    // Eventos recentes
    radarEvents.innerHTML = "";
    if (data.events && data.events.length > 0) {
      data.events.forEach(e => {
        const li = document.createElement("li");
        li.textContent = `${e.minute}' - ${e.type} - ${e.detail}`;
        radarEvents.appendChild(li);
      });
    } else {
      radarEvents.innerHTML = "<li>Nenhum evento recente</li>";
    }
  } catch (err) {
    console.error("Erro ao carregar estatísticas:", err);
  }
}

// Evento: selecionar jogo
radarGameSelect?.addEventListener("change", () => {
  const gameId = radarGameSelect.value;
  if (gameId) {
    loadGameStats(gameId);
    // Atualiza a cada 30s
    setInterval(() => loadGameStats(gameId), 30000);
  }
});

// Carregar jogos ao vivo assim que abrir modal
document.addEventListener("DOMContentLoaded", loadLiveGames);
