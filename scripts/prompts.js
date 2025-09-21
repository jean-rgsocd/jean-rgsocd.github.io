document.addEventListener('DOMContentLoaded', function () {
    const promptGeneratorSection = document.getElementById('prompt-generator-section');
    if (!promptGeneratorSection) return;

    // --- LÓGICA DAS ABAS (VERSÃO À PROVA DE FALHAS) ---
    const promptTabs = promptGeneratorSection.querySelectorAll('.tab-button');
    const promptContents = promptGeneratorSection.querySelectorAll('.tab-content');
    
    // Mapa que conecta o ID do botão ao ID do conteúdo
    const tabMap = {
        'tab-profissoes': 'content-profissoes',
        'tab-imagens': 'content-imagens',
        'tab-videos': 'content-veo3',
        'tab-ferramentas': 'content-ai-tools'
    };

    promptTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const buttonId = tab.id;
            const targetContentId = tabMap[buttonId]; // Usa o mapa para achar o alvo
            
            // Atualiza a aparência dos botões
            promptTabs.forEach(t => {
                t.classList.remove('active', 'text-cyan-300', 'border-cyan-300');
                t.classList.add('text-slate-400', 'border-transparent', 'hover:text-slate-200', 'hover:border-slate-500');
            });
            tab.classList.add('active', 'text-cyan-300', 'border-cyan-300');
            
            // Esconde todos os conteúdos
            promptContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Mostra o conteúdo correto
            const targetContent = document.getElementById(targetContentId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });

    // --- LÓGICA DA ABA DE PROFISSÕES ---
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

    if (gerarBtnProfissao) {
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

    if (copiarBtnProfissao) {
        copiarBtnProfissao.addEventListener('click', () => {
            outputProfissao.select();
            document.execCommand('copy');
            copiarBtnProfissao.textContent = 'Copiado!';
            setTimeout(() => { copiarBtnProfissao.textContent = 'Copiar'; }, 2000);
        });
    }

    // --- LÓGICA DA ABA DE IMAGENS ---
    const estiloSelect = document.getElementById('estilo-imagem');
    const descricaoInput = document.getElementById('descricao-imagem');
    const qualidadeSelect = document.getElementById('qualidade-imagem');
    const gerarBtnImagem = document.getElementById('gerar-prompt-imagem');
    const outputImagem = document.getElementById('prompt-imagem-output');
    const copiarBtnImagem = document.getElementById('copiar-prompt-imagem');
    
    const promptsPorEstilo = {
        "photorealistic": (descricao, qualidade) => `Hyper-realistic, cinematic portrait of ${descricao}, 8K photo, dramatic studio lighting, soft shadows, sharp focus. ${qualidade}`,
        "digital art": (descricao, qualidade) => `Digital art of ${descricao}, magical atmosphere, glowing elements, vibrant colors, highly detailed, concept art style. ${qualidade}`,
        "cartoon": (descricao, qualidade) => `Animated portrait of ${descricao}, vibrant cartoon style, 2D animation, clean lines, colorful, minimalist background. ${qualidade}`,
        "fantasy art": (descricao, qualidade) => `Epic fantasy art portrait of ${descricao}, majestic setting, dynamic pose, flowing clothes, dramatic lighting, rich colors. ${qualidade}`,
        "impressionist": (descricao, qualidade) => `Impressionist style painting of ${descricao}, soft visible brushstrokes, luminous colors, vibrant lighting. ${qualidade}`,
    };

    const promptsProntos = {
        "Retrato Fashion P&B": "Black and white fashion portrait of a handsome young man looking over his shoulder. He is wearing a stylish black leather jacket and modern rectangular red sunglasses. The background is a seamless, minimalist white studio backdrop with blue circle ring. --ar 9:16 --v 6.0",
        "Guerreira Fantasia": "Epic fantasy art portrait of a female warrior with intricate armor, standing on a mountain peak at sunset. Dynamic pose, flowing cape, dramatic lighting, rich colors. --ar 9:16 --v 6.0"
    };
            
    if (estiloSelect) {
        estiloSelect.addEventListener('change', () => {
            const estilo = estiloSelect.value;
            const descricaoWrapper = descricaoInput.closest('.mb-6');
            
            if (estilo === 'prompts-prontos') {
                descricaoWrapper.classList.add('hidden');
                qualidadeSelect.innerHTML = '<option value="">Selecione um prompt...</option>';
                for (const titulo in promptsProntos) {
                    qualidadeSelect.add(new Option(titulo, titulo));
                }
            } else {
                descricaoWrapper.classList.remove('hidden');
                qualidadeSelect.innerHTML = '';
                const originalQualities = [
                    { value: ", ultra detailed, 8K", text: "Ultra detalhada, 8K" },
                    { value: ", high quality, sharp focus", text: "Alta qualidade, foco nítido" },
                    { value: ", good resolution", text: "Boa resolução" }
                ];
                originalQualities.forEach(item => qualidadeSelect.add(new Option(item.text, item.value)));
            }
            outputImagem.value = "Seu prompt aparecerá aqui...";
        });
    }

    if (gerarBtnImagem) {
        gerarBtnImagem.addEventListener('click', () => {
            const estilo = estiloSelect.value;
            if (estilo === 'prompts-prontos') {
                const promptSelecionado = qualidadeSelect.value;
                if (promptSelecionado && promptsProntos[promptSelecionado]) {
                    outputImagem.value = promptsProntos[promptSelecionado];
                } else {
                    outputImagem.value = "Por favor, selecione um prompt pronto da lista.";
                }
            } else {
                const descricao = descricaoInput.value.trim();
                const qualidade = qualidadeSelect.value;
                if (descricao && promptsPorEstilo[estilo]) {
                    outputImagem.value = promptsPorEstilo[estilo](descricao, qualidade);
                } else {
                    outputImagem.value = "Por favor, descreva a cena e selecione um estilo.";
                }
            }
        });
    }
    
    if (copiarBtnImagem) {
        copiarBtnImagem.addEventListener('click', () => {
            outputImagem.select();
            document.execCommand('copy');
            copiarBtnImagem.textContent = 'Copiado!';
            setTimeout(() => { copiarBtnImagem.textContent = 'Copiar'; }, 2000);
        });
    }
});
