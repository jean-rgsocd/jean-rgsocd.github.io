// ---------------- Loader de Ferramentas ----------------

// Lista de arquivos de ferramentas
const ferramentas = [
  "ia.js",
  "imagens.js",
  "seguranca.js",
  "videos.js",
];

// Carrega dinamicamente
ferramentas.forEach(file => {
  const script = document.createElement("script");
  script.src = `ferramentas/${file}`;
  document.body.appendChild(script);
});