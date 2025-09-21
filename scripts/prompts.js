document.addEventListener('DOMContentLoaded', function () {
    const promptGeneratorSection = document.getElementById('prompt-generator-section');
    if (!promptGeneratorSection) return; // Só executa se a seção existir

    // Lógica do Gerador de Prompts (PROFISSÕES)
    const categoriaSelect = document.getElementById('categoria-profissao');
    const profissaoSelect = document.getElementById('profissao');
    const gerarBtnProfissao = document.getElementById('gerar-prompt-profissao');
    const outputProfissao = document.getElementById('prompt-profissao-output');
    const copiarBtnProfissao = document.getElementById('copiar-prompt-profissao');
    
    categoriaSelect.addEventListener('change', () => {
        const categoria = categoriaSelect.value;
        profissaoSelect.innerHTML = '<option value="">Selecione uma profissão...</option>';
        profissaoSelect.disabled = !categoria;
        // A variável 'promptsData' é global e carregada pelos scripts no index.html
        if (categoria && promptsData[categoria]) {
            for (const profissao in promptsData[categoria]) {
                const option = document.createElement('option');
                option.value = profissao;
                option.textContent = profissao;
                profissaoSelect.appendChild(option);
            }
        }
    });

    gerarBtnProfissao.addEventListener('click', () => {
        const categoria = categoriaSelect.value;
        const profissao = profissaoSelect.value;
        if (categoria && profissao && promptsData[categoria] && promptsData[categoria][profissao]) {
            outputProfissao.value = promptsData[categoria][profissao];
        } else {
            outputProfissao.value = "Por favor, selecione uma categoria e uma profissão.";
        }
    });

    copiarBtnProfissao.addEventListener('click', () => {
        outputProfissao.select();
        outputProfissao.setSelectionRange(0, 99999);
        document.execCommand('copy');
        copiarBtnProfissao.textContent = 'Copiado!';
        setTimeout(() => {
            copiarBtnProfissao.textContent = 'Copiar';
        }, 2000);
    });

    // Lógica das Abas do Gerador de Prompts
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

    // A lógica para os geradores de imagem, vídeo e IA seria adicionada aqui também
    // Por exemplo, para o gerador de imagem:
    const gerarPromptImagemBtn = document.getElementById('gerar-prompt-imagem');
    const copiarPromptImagemBtn = document.getElementById('copiar-prompt-imagem');
    
    if(gerarPromptImagemBtn) {
        gerarPromptImagemBtn.addEventListener('click', () => {
            const estilo = document.getElementById('estilo-imagem').value;
            const qualidade = document.getElementById('qualidade-imagem').value;
            const descricao = document.getElementById('descricao-imagem').value;
            const output = document.getElementById('prompt-imagem-output');

            if (descricao.trim() === '') {
                output.value = "Por favor, descreva a cena desejada.";
                return;
            }

            output.value = `${estilo} style, ${descricao}${qualidade}`;
        });
    }

    if(copiarPromptImagemBtn) {
        copiarPromptImagemBtn.addEventListener('click', () => {
            const output = document.getElementById('prompt-imagem-output');
            output.select();
            document.execCommand('copy');
            copiarPromptImagemBtn.textContent = 'Copiado!';
            setTimeout(() => {
                copiarPromptImagemBtn.textContent = 'Copiar';
            }, 2000);
        });
    }
});
