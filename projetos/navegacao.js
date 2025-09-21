// projetos/navegacao.js

document.addEventListener("DOMContentLoaded", () => {
  const botoes = document.querySelectorAll(".ver-projeto");
  const tipsterContainer = document.getElementById("tipster-container");
  const radarContainer = document.getElementById("radar-container");
  const projetosSection = document.getElementById("projetos");

  // Esconde todos os containers de projetos
  function esconderProjetos() {
    tipsterContainer.classList.add("hidden");
    radarContainer.classList.add("hidden");
  }

  // Mostrar projeto escolhido
  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      esconderProjetos();
      const projeto = botao.dataset.projeto;

      if (projeto === "tipster") {
        tipsterContainer.classList.remove("hidden");
        tipsterContainer.innerHTML = `
          <h3 class="text-xl font-bold text-teal-400 mb-4">Tipster IA</h3>
          <p class="text-gray-300 mb-4">Escolha um esporte e veja os jogos disponíveis.</p>
          <div id="tipster-app"></div>
          <button class="mt-6 bg-red-500 px-4 py-2 rounded-lg text-white retornar">Retornar</button>
        `;
      }

      if (projeto === "radar") {
        radarContainer.classList.remove("hidden");
        radarContainer.innerHTML = `
          <h3 class="text-xl font-bold text-teal-400 mb-4">Radar IA</h3>
          <p class="text-gray-300 mb-4">Selecione uma liga e acompanhe jogos ao vivo.</p>
          <div id="radar-app"></div>
          <button class="mt-6 bg-red-500 px-4 py-2 rounded-lg text-white retornar">Retornar</button>
        `;
      }

      // Botão de retorno
      const btnRetornar = projetosSection.querySelector(".retornar");
      if (btnRetornar) {
        btnRetornar.addEventListener("click", () => {
          esconderProjetos();
        });
      }
    });
  });
});
