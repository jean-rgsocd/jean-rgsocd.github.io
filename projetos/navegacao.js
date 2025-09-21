// ---------------- Navegação dos Projetos ----------------

// Containers
const projectListContainer = document.getElementById("project-list-container");
const tipsterSection = document.getElementById("tipster-ia-section");
const radarSection = document.getElementById("radar-ia-section");

// Botões Tipster IA
const showBettingButton = document.getElementById("showBettingButton");
const hideBettingButton = document.getElementById("hideBettingButton");

// Botões Radar IA
const showRadarButton = document.getElementById("showRadarButton");
const hideRadarButton = document.getElementById("hideRadarButton");

function showSection(section) {
  projectListContainer.classList.add("hidden");
  section.classList.remove("hidden");
}

function hideSection(section) {
  section.classList.add("hidden");
  projectListContainer.classList.remove("hidden");
}

// --- Tipster IA ---
if (showBettingButton) {
  showBettingButton.addEventListener("click", () => {
    showSection(tipsterSection);
  });
}

if (hideBettingButton) {
  hideBettingButton.addEventListener("click", () => {
    hideSection(tipsterSection);
  });
}

// --- Radar IA ---
if (showRadarButton) {
  showRadarButton.addEventListener("click", () => {
    showSection(radarSection);
    loadRadarLeagues(); // inicia carregamento automático ao abrir
  });
}

if (hideRadarButton) {
  hideRadarButton.addEventListener("click", () => {
    hideSection(radarSection);
  });
}
