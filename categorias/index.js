// ---------------- Loader de Categorias ----------------

// Lista de arquivos de categorias
const categorias = [
  "advocacia.js",
  "artes-criativas.js",
  "copywriters.js",
  "corporativos.js",
  "criativos.js",
  "desenvolvedores-e-ti.js",
  "educacao.js",
  "empreendedorismo.js",
  "entretenimento.js",
  "escrita.js",
  "estudantes.js",
  "financas.js",
  "fitness.js",
  "marketing.js",
  "negocios.js",
  "professores.js",
  "programacao.js",
  "saude.js",
  "tecnologia.js",
  "youtubers.js",
];

// Carrega dinamicamente
categorias.forEach(file => {
  const script = document.createElement("script");
  script.src = `categorias/${file}`;
  document.body.appendChild(script);
});
