document.addEventListener('DOMContentLoaded', function () {
    const promptsPorEstilo = {
        "photorealistic": (descricao, qualidade) => `Hyper-realistic, cinematic portrait of a person with ${descricao}, 8K photo, with dramatic studio lighting, soft shadows, sharp focus, capturing fine details and natural skin textures. No filter, no blur, high resolution. --ar 9:16 --v 6.0`,
        "digital art": (descricao, qualidade) => `Digital art of a person with ${descricao}, in a magical atmosphere, with glowing elements and vibrant colors. Highly detailed, artistic lighting, concept art style. ${qualidade}.`,
        "cartoon": (descricao, qualidade) => `Animated portrait of a person with ${descricao}, in a vibrant cartoon style. 2D animation, clean lines, colorful, minimalist background, playful expression. ${qualidade}.`,
        "fantasy art": (descricao, qualidade) => `Epic fantasy art portrait of a person with ${descricao}, in a majestic setting. Dynamic pose, flowing clothes, dramatic lighting, rich colors, intricate details. ${qualidade}.`,
        "impressionist": (descricao, qualidade) => `Impressionist style painting of a person with ${descricao}. Soft, visible brushstrokes, luminous colors, vibrant lighting, emotional mood. ${qualidade}.`,
    };
            
    const promptsProntos = {
        "Retrato Fashion em Preto e Branco": "Black and white fashion portrait of a handsome young man looking over his shoulder. He is wearing a stylish black leather jacket and modern rectangular red sunglasses. The background is a seamless, minimalist white studio backdrop with blue circle ring. The lighting is dramatic high-contrast studio lighting, creating sharp focus and highlighting the texture of the leather jacket. --ar 9:16 --v 6.0",
        "Retrato Surreal e Detalhado com Efeito Glitch": "A surreal, ultra-detailed portrait of a young man holding a vibrant red rose close to his face. He is wearing a plain oversized white sweatshirt and a thin silver chain necklace. His fingers are adorned with rings, the background is minimalistic and shadowy, emphasizing his presence. The portrait is styled with a digital glitch effect, parts of his face and body are fragmented into horizontal pixel streaks in. --ar 9:16 --v 6.0",
        // ... (cole aqui TODOS os outros prompts prontos que estavam no seu HTML) ...
        "Selfie com Luz de Contraluz Dramática (É necessário fazer o upload do famoso e sua foto)": "Selfie vertical 9:16 do usuário com figuras enviadas, luz intensa atrás criando halo, rostos levemente desfocados, cores quentes, atmosfera cinematográfica. --ar 9:16 --v 6.0"
    };

    const estiloSelect = document.getElementById('estilo-imagem');
    const descricaoInput = document.getElementById('descricao-imagem');
    const qualidadeSelect = document.getElementById('qualidade-imagem');
    const gerarBtnImagem = document.getElementById('gerar-prompt-imagem');
    const outputImagem = document.getElementById('prompt-imagem-output');
    const copiarBtnImagem = document.getElementById('copiar-prompt-imagem');
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

            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Selecione um prompt pronto...";
            qualidadeSelect.appendChild(defaultOption);

            for (const titulo in promptsProntos) {
                const option = document.createElement('option');
                option.value = titulo;
                option.textContent = titulo;
                qualidadeSelect.appendChild(option);
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

            originalQualities.forEach(item => {
                const option = document.createElement('option');
                option.value = item.value;
                option.textContent = item.text;
                qualidadeSelect.appendChild(option);
            });
        }
    });

    qualidadeSelect.addEventListener('change', () => {
        const estilo = estiloSelect.value;
        const promptEscolhido = qualidadeSelect.value;

        if (estilo === 'prompts-prontos' && promptEscolhido) {
            outputImagem.value = promptsProntos[promptEscolhido];
            gerarBtnImagem.textContent = 'Copiar Prompt Selecionado';
        } else {
            outputImagem.value = "Seu prompt aparecerá aqui. Lembre-se de fazer o upload da sua imagem para a IA e, se possível, indicar o uso dela no prompt (ex: \"utilize a imagem fornecida como referência principal\").";
            gerarBtnImagem.textContent = 'Gerar Prompt de Imagem';
        }
    });

    gerarBtnImagem.addEventListener('click', () => {
        const estilo = estiloSelect.value;
        if (estilo === 'prompts-prontos') {
            outputImagem.select();
            outputImagem.setSelectionRange(0, 99999);
            document.execCommand('copy');
            gerarBtnImagem.textContent = 'Copiado!';
            setTimeout(() => {
                gerarBtnImagem.textContent = 'Copiar Prompt Selecionado';
            }, 2000);
        } else {
            const descricao = descricaoInput.value.trim();
            const qualidade = qualidadeSelect.value;
            if (descricao) {
                const promptTemplate = promptsPorEstilo[estilo];
                if (promptTemplate) {
                    const prompt = promptTemplate(descricao, qualidade);
                    outputImagem.value = prompt;
                } else {
                    outputImagem.value = "Estilo não encontrado. Por favor, selecione um estilo válido.";
                }
            } else {
                outputImagem.value = "Por favor, descreva a cena desejada.";
            }
        }
    });

    copiarBtnImagem.addEventListener('click', () => {
        outputImagem.select();
        outputImagem.setSelectionRange(0, 99999);
        document.execCommand('copy');
        copiarBtnImagem.textContent = 'Copiado!';
        setTimeout(() => {
            copiarBtnImagem.textContent = 'Copiar';
        }, 2000);
    });
});