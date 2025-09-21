document.addEventListener('DOMContentLoaded', function () {
    const promptGeneratorSection = document.getElementById('prompt-generator-section');
    if (!promptGeneratorSection) return;

    // --- LÓGICA GERAL DAS ABAS ---
    const promptTabs = document.querySelectorAll('#prompt-generator-section .tab-button');
    const promptContents = document.querySelectorAll('#prompt-generator-section .tab-content');
    
    promptTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.id.replace('tab-', 'content-');
            
            promptTabs.forEach(t => {
                t.classList.remove('active', 'text-cyan-300', 'border-cyan-300');
                t.classList.add('text-slate-400', 'border-transparent', 'hover:text-slate-200', 'hover:border-slate-500');
            });
            
            tab.classList.add('active', 'text-cyan-300', 'border-cyan-300');
            tab.classList.remove('text-slate-400', 'border-transparent');
            
            promptContents.forEach(content => content.classList.add('hidden'));
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // --- ABA 1: GERADOR DE PROMPTS (PROFISSÕES) ---
    const categoriaSelect = document.getElementById('categoria-profissao');
    const profissaoSelect = document.getElementById('profissao');
    const gerarBtnProfissao = document.getElementById('gerar-prompt-profissao');
    const outputProfissao = document.getElementById('prompt-profissao-output');
    const copiarBtnProfissao = document.getElementById('copiar-prompt-profissao');
    
    if (categoriaSelect) {
        categoriaSelect.addEventListener('change', () => {
            const categoria = categoriaSelect.value;
            profissaoSelect.innerHTML = '<option value="">Selecione uma profissão...</option>';
            profissaoSelect.disabled = !categoria;
            if (categoria && typeof promptsData !== 'undefined' && promptsData[categoria]) {
                for (const profissao in promptsData[categoria]) {
                    const option = new Option(profissao, profissao);
                    profissaoSelect.appendChild(option);
                }
            }
        });
    }

    if(gerarBtnProfissao) {
        gerarBtnProfissao.addEventListener('click', () => {
            const categoria = categoriaSelect.value;
            const profissao = profissaoSelect.value;
            if (categoria && profissao && promptsData[categoria] && promptsData[categoria][profissao]) {
                outputProfissao.value = promptsData[categoria][profissao];
            } else {
                outputProfissao.value = "Por favor, selecione uma categoria e uma profissão.";
            }
        });
    }

    if(copiarBtnProfissao) {
        copiarBtnProfissao.addEventListener('click', () => {
            outputProfissao.select();
            document.execCommand('copy');
            copiarBtnProfissao.textContent = 'Copiado!';
            setTimeout(() => { copiarBtnProfissao.textContent = 'Copiar'; }, 2000);
        });
    }

    // --- ABA 2: GERADOR DE PROMPTS (IMAGENS) - Lógica migrada de imagens.js ---
    const promptsPorEstilo = {
        "photorealistic": (descricao, qualidade) => `Hyper-realistic, cinematic portrait of a person with ${descricao}, 8K photo, with dramatic studio lighting, soft shadows, sharp focus, capturing fine details and natural skin textures. No filter, no blur, high resolution. --ar 9:16 --v 6.0`,
        "digital art": (descricao, qualidade) => `Digital art of a person with ${descricao}, in a magical atmosphere, with glowing elements and vibrant colors. Highly detailed, artistic lighting, concept art style. ${qualidade}.`,
        "cartoon": (descricao, qualidade) => `Animated portrait of a person with ${descricao}, in a vibrant cartoon style. 2D animation, clean lines, colorful, minimalist background, playful expression. ${qualidade}.`,
        "fantasy art": (descricao, qualidade) => `Epic fantasy art portrait of a person with ${descricao}, in a majestic setting. Dynamic pose, flowing clothes, dramatic lighting, rich colors, intricate details. ${qualidade}.`,
        "impressionist": (descricao, qualidade) => `Impressionist style painting of a person with ${descricao}. Soft, visible brushstrokes, luminous colors, vibrant lighting, emotional mood. ${qualidade}.`,
    };
            
    const promptsProntos = {
        "Retrato Fashion em Preto e Branco": "Black and white fashion portrait of a handsome young man looking over his shoulder. He is wearing a stylish black leather jacket and modern rectangular red sunglasses. The background is a seamless, minimalist white studio backdrop with blue circle ring. The lighting is dramatic high-contrast studio lighting, creating sharp focus and highlighting the texture of the leather jacket. --ar 9:16 --v 6.0",
        // ... (todos os outros prompts prontos que você tinha)
    };

    const estiloSelect = document.getElementById('estilo-imagem');
    const descricaoInput = document.getElementById('descricao-imagem');
    const qualidadeSelect = document.getElementById('qualidade-imagem');
    const gerarBtnImagem = document.getElementById('gerar-prompt-imagem');
    const outputImagem = document.getElementById('prompt-imagem-output');
    const copiarBtnImagem = document.getElementById('copiar-prompt-imagem');
    
    if(estiloSelect) {
        const descricaoWrapper = descricaoInput.closest('.mb-6');
        const qualidadeWrapper = qualidadeSelect.closest('.mb-6');

        estiloSelect.addEventListener('change', () => {
            const estilo = estiloSelect.value;
            qualidadeSelect.innerHTML = '';
            qualidadeSelect.disabled = true;

            if (estilo === 'prompts-prontos') {
                descricaoWrapper.classList.add('hidden');
                qualidadeWrapper.classList.remove('hidden');
                qualidadeSelect.disabled = false;
                qualidadeSelect.innerHTML = '<option value="">Selecione um prompt pronto...</option>';
                for (const titulo in promptsProntos) {
                    qualidadeSelect.add(new Option(titulo, titulo));
                }
            } else {
                descricaoWrapper.classList.remove('hidden');
                qualidadeWrapper.classList.remove('hidden');
                qualidadeSelect.disabled = false;
                const originalQualities = [
                    { value: ", ultra detailed, 8K", text: "Ultra detalhada, 8K" },
                    { value: ", high quality, sharp focus", text: "Alta qualidade, foco nítido" },
                    { value: ", good resolution", text: "Boa resolução" }
                ];
                originalQualities.forEach(item => qualidadeSelect.add(new Option(item.text, item.value)));
            }
        });

        qualidadeSelect.addEventListener('change', () => {
            if (estiloSelect.value === 'prompts-prontos' && qualidadeSelect.value) {
                outputImagem.value = promptsProntos[qualidadeSelect.value];
                gerarBtnImagem.textContent = 'Copiar Prompt Selecionado';
            } else {
                outputImagem.value = "Seu prompt aparecerá aqui...";
                gerarBtnImagem.textContent = 'Gerar Prompt de Imagem';
            }
        });
    }

    if(gerarBtnImagem) {
        gerarBtnImagem.addEventListener('click', () => {
            const estilo = estiloSelect.value;
            if (estilo === 'prompts-prontos') {
                outputImagem.select();
                document.execCommand('copy');
                gerarBtnImagem.textContent = 'Copiado!';
                setTimeout(() => { gerarBtnImagem.textContent = 'Copiar Prompt Selecionado'; }, 2000);
            } else {
                const descricao = descricaoInput.value.trim();
                const qualidade = qualidadeSelect.value;
                if (descricao) {
                    outputImagem.value = promptsPorEstilo[estilo] ? promptsPorEstilo[estilo](descricao, qualidade) : "Estilo não encontrado.";
                } else {
                    outputImagem.value = "Por favor, descreva a cena desejada.";
                }
            }
        });
    }

    if(copiarBtnImagem) {
        copiarBtnImagem.addEventListener('click', () => {
            outputImagem.select();
            document.execCommand('copy');
            copiarBtnImagem.textContent = 'Copiado!';
            setTimeout(() => { copiarBtnImagem.textContent = 'Copiar'; }, 2000);
        });
    }

    // --- ABA 3: PROMPTS DE VÍDEOS (Lógica migrada de videos.js) ---
    // Adicione IDs ao seu HTML para esta parte funcionar:
    // <select id="vid-type">, <select id="vid-tone">, <button onclick="generateVideoPrompt()">, <textarea id="vid-result">
    window.generateVideoPrompt = function() {
        const type = document.getElementById('vid-type').value;
        const tone = document.getElementById('vid-tone').value;
        const prompt = `VEO 3 MASTER PROMPT v4.0\nCreate a ${type.toLowerCase()} video with a ${tone.toLowerCase()} tone.\nRequirements:\n- Cinematic transitions\n- Professional pacing\n- Engaging visuals\n- Narrative depth.`;
        document.getElementById('vid-result').innerText = prompt;
    }

    // --- ABA 4: FERRAMENTAS DE IA (Lógica migrada de ia.js) ---
    // Adicione IDs ao seu HTML:
    // <select id="ai-tool">, <textarea id="ai-input">, <button onclick="runAITool()">, <p id="ai-result">
    window.runAITool = function() {
        const tool = document.getElementById('ai-tool').value;
        const text = document.getElementById('ai-input').value;
        let result = "";
        if (tool === "Summarizer") {
            result = "Summary: " + text.split(" ").slice(0, 20).join(" ") + "...";
        } else if (tool === "Translator") {
            result = "[Translated to English] " + text;
        } else if (tool === "Creative Rewriter") {
            result = "Creative rewrite: " + text.replace(/\bAI\b/gi, "Artificial Intelligence (AI)").replace("world","world in transformation");
        }
        document.getElementById('ai-result').innerText = result;
    }
});
