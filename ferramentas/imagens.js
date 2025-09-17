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
    "Retrato Cinematográfico com Dupla Exposição": "Hyper-realistic cinematic tall vertical portrait in 9:16 of a man with black sunglasses, reflecting a futuristic city skyline. A surreal double exposure blends his silhouette with gleaming skyscrapers and a luxury Porsche 911 in the foreground. Inspired by the noir style, it's elegant and powerful. --ar 9:16 --v 6.0",
    "Fotografia de Dupla Exposição (Litoral)": "Create a double exposure photo with a man in profile. Incorporate into his silhouette a wild seascape with cliffs, a person sitting looking out to sea, and a flock of birds flying in the sky. Use black and white style to highlight the emotion and composition, realistic 4k image quality. 9:16 aspect ratio. --ar 9:16 --v 6.0",
    "Homem Confiante em Carro de Luxo": "A confident man in a luxury car, wearing a stylish black suit with a bow tie, looking cool and powerful. The photo has a cinematic tone with moody contrast, light rain on the car's surface, and a shallow depth of field. Enhance colors subtly, sharpen facial details, and add a soft vignette for a dramatic effect. Maintain a classy, high-end look a picture should be realistic (f/2.8), ratio 9:16. --ar 9:16 --v 6.0",
    "Fotografia Editorial em Filme 35mm": "A hyper-realistic 35mm film editorial photograph of a young man (curly dark hair, trimmed beard and goatee, natural Mediterranean skin tone, strong jawline). He is sitting on a sleek black-and-red sport motorcycle. One leg casually rests on the bike's frame while the other supports him on the ground. His outfit: fully buttoned crisp white dress shirt with a black-and-gray striped tie, layered with a gray inner jacket, and topped with an oversized dark brown leather coat. He also wears glossy black leather pants and fitted black leather gloves. His posture is confident yet relaxed, leaning slightly forward with one hand resting on his thigh, the other hand on the motorcycle frame near a black helmet. Expression: calm, powerful, stylish, looking straight ahead. Background: metallic silver-gray industrial mesh panels. Lighting: cinematic white-and-blue studio lighting from above, creating a cool luxurious fashion mood. The photo has fine 35mm film grain, natural skin textures, authentic colors, and a high-fashion editorial cinematic atmosphere - completely natural, without any artificial or plastic AI look. --ar 9:16 --v 6.0",
    "Cena Noturna Urbana com Luzes de Néon": "Ultra-realistic 8K half-body shot of the subject in a moody urban night scene, framed against a blurred cityscape awash in electric blues and hot pinks. Neon streaks slash diagonally across the frame — as though caught mid-exposure — painting soft colored highlights across his jacket, cheekbones, and hair. He wears a black bomber jacket with subtle quilted paneling, a plain white tee visible beneath. Around his neck, a slim black cord necklace with a polished steel pendant rests lightly. The shallow depth of field isolates his face in crystal clarity while the city lights melt into an abstract, glowing bokeh. High shutter speed captures the crisp textures of skin pores, hair strands, and fabric stitching. --ar 9:16 --v 6.0",
    "Retrato Vertical Dramático (Filme Noir)": "Ultra-realistic 8K, vertical portrait 9:16 of a man in a dark coat. A white light coming from above illuminates only a part of his face, creating intense shadows and a dramatic film noir atmosphere. --ar 9:16 --v 6.0",
    "Cena Noturna Cinematográfica com Chuva": "Cinematic vertical portrait 9:16 of a man leaning against a luxury car under red neon lights. Rain on the ground creating shiny reflections, elegant and dark atmosphere. --ar 9:16 --v 6.0",
    "Foco nas Mãos em Oração": "Hyper-realistic 8K, close-up on hands joined in prayer in front of a face half-hidden by shadow. Spiritual and mysterious atmosphere. --ar 9:16 --v 6.0",
    "Homem em Cenário com Fumaça": "Vertical portrait 9:16 of a man sitting on a metal chair, surrounded by smoke. Hard, cold studio lighting, intense and dramatic atmosphere. --ar 9:16 --v 6.0",
    "Rosto com Luz Contraste em Azul e Vermelho": "Hyper-detailed close-up in 8K of a face partially covered by a hand. Red and blue light projected in contrast, mysterious and elegant atmosphere, cinematic style. --ar 9:16 --v 6.0",
    "Retrato de Homem na Chuva (Noir)": "Black and white editorial portrait 9:16 of a man in a drenched suit, water drops streaming down his face and hair. Dramatic Vogue style, hard and contrasting light. --ar 9:16 --v 6.0",
    "Homem em Deserto com Pôr do Sol": "Wide shot 9:16 of a man walking alone in an infinite desert, footsteps behind him, orange setting sun illuminating the horizon. Symbolic and inspiring atmosphere, personal transformation mood. --ar 9:16 --v 6.0",
    "Homem em Rua Chuvosa com Néon": "Ultra-realistic 8K, vertical portrait 9:16 of a man in a black suit, standing in pouring rain on a street lit by blue and pink neon lights. Water runs down his face and coat, creating a dramatic and powerful atmosphere. --ar 9:16 --v 6.0",
    "Retrato Cinematográfico Feminino com Halo Dourado": "Retrato pessoal de alta gama, ultra realista da pessoa na foto fornecida, preservando sua fisionomia, idade aparente, gênero, tom de pele, cabelo, olhos e expressão única. Texturas fotorrealistas de pele, cabelo e tecido. Sujeito principal: Uma mulher com cabelo solto e levemente desordenado, tonalidade castanha escura, iluminada por trás criando um halo dourado sobre fundo escuro. Expressão e pose: rosto girado para a câmera, mirada direta, parcialmente coberta por sombras. Contraluz potente e cálido, luz secundária fria (azul/verde) iluminando o rosto e ombro. Fundo escuro realçando os brilhos do cabelo. Lente fixa 50-85mm, abertura f/1.4-f/2.8. Estilo cinematográfico e dramático. --ar 9:16 --v 6.0",
    "Retrato Cinematográfico Solitário na Chuva": "Tomada cinematográfica 3:4 de um homem parado em uma calçada chuvosa da cidade. Vestindo camiseta preta grande, calças largas e tênis. Segurando guarda-chuva, chuva intensa ao redor. Iluminação sombria, profundidade de campo rasa, reflexos no pavimento molhado, halo de luz de fundo suave. Aparência de filme estático, cores ligeiramente dessaturadas, foco na emoção e solidão. --ar 3:4 --v 6.0",
    "Retrato Cinematográfico Estilo Sala de Aula": "Retrato cinematográfico com toque sombrio, jovem asiático em sala de aula vintage mal iluminada. Luz suave amarelo-dourada refletida de uma fresta, criando linhas diagonais sobre o rosto. Sentado sozinho, expressão relaxada, cabelos bagunçados estilo coreano Comma. Suéter verde-militar oversized, calças cargo creme, tênis Converse, fones vermelhos. Fundo com parede off-white, post-its e decoração típica de sala de aula. Atmosfera nostálgica e contemplativa, tons suaves de luz dourada misturados a sombras escuras, sem efeito bokeh, granulação de filme 35mm, ISO 1600, abertura f/5.6, obturador 1/60s. --ar 3:4 --v 6.0",
    "Selfie Realista com Ação de Hollywood (É necessário fazer o upload do famoso e sua foto)": "Crie uma selfie realista combinando as imagens enviadas (usuário + figuras de referência). As pessoas podem estar segurando bebida, sorrindo ou abraçando-se. Fundo natural ou urbano, rostos levemente desfocados, iluminação cinematográfica, vertical 9:16. --ar 9:16 --v 6.0",
    "Selfie Olho de Peixe com Estrelas (É necessário fazer o upload do famoso e sua foto)": "Selfie olho de peixe vertical 9:16, ultrarrealista 3D combinando imagens enviadas. Pessoas sorrindo, algumas interagindo com o usuário (beliscando rosto, fazendo caretas). Dentro de um elevador ou espaço fechado, iluminação realista, rosto do usuário em destaque, fundo levemente desfocado. --ar 9:16 --v 6.0",
    "Foto Polaroid com Famosos (É necessário fazer o upload do famoso e sua foto)": "Crie uma imagem estilo Polaroid combinando a foto do usuário e a(s) figura(s) enviada(s). Pessoas podem estar abraçando-se, sorrindo ou interagindo de forma natural. Fundo levemente desfocado, luz suave de flash, atmosfera realista. --ar 3:4 --v 6.0",
    "Selfie em Festa de Gala (É necessário fazer o upload do famoso e sua foto)": "Selfie vertical 9:16 do usuário junto com figuras enviadas. Pessoas sorrindo, vestindo trajes elegantes, fundo desfocado com iluminação cinematográfica. --ar 9:16 --v 6.0",
    "Selfie Urbana com Reflexos Neon (É necessário fazer o upload do famoso e sua foto)": "Selfie vertical 9:16 do usuário e figuras enviadas em ambiente urbano noturno. Luzes neon refletindo em poças, rostos levemente desfocados, cores vibrantes, atmosfera cinematográfica. --ar 9:16 --v 6.0",
    "Selfie Dreamy com Luz Suave (É necessário fazer o upload do famoso e sua foto)": "Selfie vertical 9:16 do usuário e figuras enviadas com iluminação difusa e fundo levemente embaçado. Rostos levemente desfocados, cores suaves, atmosfera etérea, estilo cinematográfico. --ar 9:16 --v 6.0",
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
