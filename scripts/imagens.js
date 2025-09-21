// scripts/imagens.js

document.addEventListener("DOMContentLoaded", () => {
  const carrossel = document.querySelectorAll(".carrossel");
  carrossel.forEach(initCarrossel);
});

function initCarrossel(carrossel) {
  const imagens = carrossel.querySelectorAll("img");
  let idx = 0;

  // Oculta todas e mostra só a atual
  function mostrarImagem(i) {
    imagens.forEach((img, k) => {
      img.style.display = k === i ? "block" : "none";
    });
  }

  // Botões next/prev (se existirem)
  const btnPrev = carrossel.querySelector(".btn-prev");
  const btnNext = carrossel.querySelector(".btn-next");

  btnPrev?.addEventListener("click", () => {
    idx = (idx - 1 + imagens.length) % imagens.length;
    mostrarImagem(idx);
  });

  btnNext?.addEventListener("click", () => {
    idx = (idx + 1) % imagens.length;
    mostrarImagem(idx);
  });

  // Timer automático (opcional)
  setInterval(() => {
    idx = (idx + 1) % imagens.length;
    mostrarImagem(idx);
  }, 8000); // troca a cada 8s

  // Mostrar primeira
  mostrarImagem(idx);
}
