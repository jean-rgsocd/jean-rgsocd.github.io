// scripts/navigation.js
// Versão COMPLETA E CORRIGIDA

document.addEventListener('DOMContentLoaded', function () {
    const projectListContainer = document.getElementById('project-list-container');
    
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
        'radar': {
            showBtn: document.getElementById('showRadarButton'),
            hideBtn: document.getElementById('hideRadarButton'),
            section: document.getElementById('radar-ia-section'),
            anchor: '#radar-ia-section'
        }
    };

    function showSection(view) {
        if (projectListContainer) projectListContainer.classList.add('hidden');
        if (view.section) view.section.classList.remove('hidden');
        window.location.hash = view.anchor;
    }

    function hideSection(view) {
        if (view.section) view.section.classList.add('hidden');
        if (projectListContainer) projectListContainer.classList.remove('hidden');
        window.location.hash = 'projetos';
    }

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
