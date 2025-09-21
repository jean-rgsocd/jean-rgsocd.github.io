document.addEventListener('DOMContentLoaded', function () {
    const projectListContainer = document.getElementById('project-list-container');
    
    // Mapeamento completo dos botões e seções dos projetos
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
        }
        // Quando o Radar IA estiver pronto, adicione-o aqui.
        // 'radar': {
        //     showBtn: document.getElementById('showRadarButton'),
        //     hideBtn: document.getElementById('hideRadarButton'),
        //     section: document.getElementById('radar-ia-section'),
        //     anchor: '#radar-ia-section'
        // }
    };

    // Função genérica para mostrar uma seção de projeto
    function showSection(view) {
        if (projectListContainer) projectListContainer.classList.add('hidden');
        if (view.section) view.section.classList.remove('hidden');
        // A navegação por âncora pode causar um "salto" na página.
        // Se preferir, pode remover a linha abaixo e usar scrollIntoView.
        // view.section.scrollIntoView({ behavior: 'smooth' });
        window.location.hash = view.anchor;
    }

    // Função genérica para esconder uma seção de projeto e mostrar a lista
    function hideSection(view) {
        if (view.section) view.section.classList.add('hidden');
        if (projectListContainer) projectListContainer.classList.remove('hidden');
        window.location.hash = 'projetos';
    }

    // Adiciona os event listeners para todos os projetos mapeados
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
