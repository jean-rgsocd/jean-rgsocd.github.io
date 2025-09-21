// scripts/navigation.js

// Headline digitada (se quiser usar typed.js, substitua aqui)
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("typed-headline");
  if (el) {
    const mensagens = [
      "Profissional de Tecnologia e Segurança Cibernética",
      "Desenvolvedor Python, FastAPI e Integrações",
      "Projetos de IA aplicados a esportes e segurança"
    ];
    let idx = 0;
    setInterval(() => {
      el.textContent = mensagens[idx];
      idx = (idx + 1) % mensagens.length;
    }, 4000);
  }
});
