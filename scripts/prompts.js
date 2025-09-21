// scripts/prompts.js

document.addEventListener("DOMContentLoaded", () => {
  const categoriaSelect = document.getElementById("categoria-profissao");
  const profissaoSelect = document.getElementById("profissao");
  const outputTextarea = document.getElementById("prompt-profissao-output");
  const btnGerar = document.getElementById("gerar-prompt-profissao");
  const btnCopiar = document.getElementById("copiar-prompt-profissao");

  // Categorias → profissões / prompts
  const categorias = {
    "Fotografia": {
      "Retrato Fashion em Preto e Branco": "Black and white fashion portrait of a confident man with sharp lighting and dramatic tones. --ar 9:16 --v 6.0",
      "Retrato Ultra Detalhado com Efeito Glitch": "A surreal, ultra-detailed glitch portrait with distorted neon overlays and futuristic mood. --ar 9:16 --v 6.0",
      "Fotografia de Dupla Exposição (Litoral)": "Double exposure photo of a man in profile with a seascape in his silhouette, cliffs, birds, cinematic black and white. --ar 9:16 --v 6.0"
    },
    "Cenas Urbanas": {
      "Cena Noturna Urbana com Luzes de Néon": "Ultra-realistic 8K shot, neon-lit rainy street, electric blues and pinks reflecting. --ar 9:16 --v 6.0",
      "Retrato Vertical Dramático (Filme Noir)": "Cinematic vertical noir portrait, harsh top light, deep shadows, moody aesthetic. --ar 9:16 --v 6.0",
      "Cena Noturna Cinematográfica com Chuva": "Man leaning on a luxury car under neon red light, rain reflections on the ground. --ar 9:16 --v 6.0"
    },
    "Arte Digital": {
      "Rosto com Luz Contraste em Azul e Vermelho": "Hyper-detailed close-up of a man with contrasting red/blue light. --ar 9:16 --v 6.0",
      "Homem em Cenário com Fumaça": "Portrait of a man sitting on a chair surrounded by smoke, dramatic lighting. --ar 9:16 --v 6.0",
      "Homem em Rua Chuvosa com Néon": "Black suit man under neon rain, cinematic 8K style, powerful vibe. --ar 9:16 --v 6.0"
    }
  };

  // Popular categorias
  for (const cat in categorias) {
    categoriaSelect.add(new Option(cat, cat));
  }

  // Ao trocar categoria → popular profissões
  categoriaSelect?.addEventListener("change", () => {
    profissaoSelect.innerHTML = `<option value="">Selecione</option>`;
    const cat = categoriaSelect.value;
    if (cat && categorias[cat]) {
      Object.keys(categorias[cat]).forEach(prof => {
        profissaoSelect.add(new Option(prof, prof));
      });
    }
  });

  // Botão gerar → mostra prompt no textarea
  btnGerar?.addEventListener("click", () => {
    const cat = categoriaSelect.value;
    const prof = profissaoSelect.value;
    if (cat && prof && categorias[cat][prof]) {
      outputTextarea.value = categorias[cat][prof];
    } else {
      outputTextarea.value = "Selecione uma categoria e profissão para gerar um prompt.";
    }
  });

  // Botão copiar
  btnCopiar?.addEventListener("click", () => {
    if (outputTextarea.value.trim()) {
      navigator.clipboard.writeText(outputTextarea.value).then(() => {
        btnCopiar.textContent = "Copiado!";
        setTimeout(() => (btnCopiar.textContent = "Copiar"), 1500);
      });
    }
  });
});
