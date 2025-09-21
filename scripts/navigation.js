document.addEventListener('DOMContentLoaded', function () {
    const projectListContainer = document.getElementById('project-list-container');
    
    // Mapeamento dos botões e seções
    const projectViews = {
        'scanner': {
            showBtn: document.getElementById('showScannerButton'),
            hideBtn: document.getElementById('hideScannerButton'),
            section: document.getElementById('analisador-seguranca-web'),
            anchor: '#analisador-seguranca-web'
        },
        'prompts': {
            showBtn: document.getElementById('showPromptsButton'),
            hideBtn: document.getElementById('hidePromptsButton'),
            section: document.getElementById('prompt-generator-section'),
            anchor: '#prompt-generator-section'
        },
        'betting': {
            showBtn: document.getElementById('showBettingButton'),
            hideBtn: document.getElementById('hideBettingButton'),
            section: document.getElementById('analisador-apostas'),
            anchor: '#analisador-apostas'
        },
        // --- CORREÇÃO ADICIONADA AQUI ---
        'radar': {
            showBtn: document.getElementById('showRadarButton'),
            hideBtn: document.getElementById('hideRadarButton'),
            section: document.getElementById('radar-ia-section'),
            anchor: '#radar-ia-section'
        }
    };

    // Função genérica para mostrar uma seção
    function showSection(view) {
        if (projectListContainer) projectListContainer.classList.add('hidden');
        if (view.section) view.section.classList.remove('hidden');
        window.location.href = view.anchor;
    }

    // Função genérica para esconder uma seção
    function hideSection(view) {
        if (view.section) view.section.classList.add('hidden');
        if (projectListContainer) projectListContainer.classList.remove('hidden');
        window.location.href = '#projetos';
    }

    // Adiciona os event listeners
    for (const key in projectViews) {
        const view = projectViews[key];
        if (view.showBtn) {
            view.showBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(view);
            });
        }
        if (view.hideBtn) {
            view.hideBtn.addEventListener('click', () => {
                hideSection(view);
            });
        }
    }
});
