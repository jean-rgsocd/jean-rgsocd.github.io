// scripts/scanner.js
document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("scanner-run");
  const urlInput = document.getElementById("scanner-url");
  const resultsEl = document.getElementById("scanner-results");

  runBtn?.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) {
      resultsEl.innerHTML = `<div class="text-red-400">Informe uma URL válida.</div>`;
      return;
    }

    resultsEl.innerHTML = `<div class="text-slate-400">🔍 Analisando ${url}...</div>`;

    try {
      const start = performance.now();
      const resp = await fetch(url, { method: "GET", mode: "no-cors" }); // no-cors apenas para demo
      const end = performance.now();

      resultsEl.innerHTML = `
        <div>✅ Requisição enviada com sucesso.</div>
        <div><strong>Status:</strong> ${resp.status || "indefinido (CORS)"}</div>
        <div><strong>Tempo de resposta:</strong> ${Math.round(end - start)} ms</div>
        <div class="text-yellow-400">⚠️ Atenção: Este é apenas um teste demonstrativo, não substitui scanners reais de segurança.</div>
      `;
    } catch (err) {
      resultsEl.innerHTML = `<div class="text-red-400">Erro ao acessar ${url}: ${err.message}</div>`;
    }
  });
});
