// scripts/navigation.js
// Versão COMPLETA E CORRIGIDA

document.addEventListener('DOMContentLoaded', function () {
    const projectListContainer = document.getElementById('project-list-container');
    
    // Objeto que mapeia todas as ferramentas interativas do portfólio
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
        },
        // --- ADIÇÃO PARA O OPTA IA ---
        // Adicionamos a nova ferramenta aqui, seguindo o mesmo padrão
        'opta': {
            showBtn: document.getElementById('showOptaButton'),
            hideBtn: document.getElementById('hideOptaButton'),
            section: document.getElementById('opta-ia'),
            anchor: '#opta-ia'
        }
        // -----------------------------
    };

    // Função genérica para MOSTRAR uma seção de ferramenta
    function showSection(view) {
        if (projectListContainer) projectListContainer.classList.add('hidden');
        if (view.section) view.section.classList.remove('hidden');
        
        // Leva o usuário para o topo da seção da ferramenta
        const targetElement = document.querySelector(view.anchor);
        if(targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Função genérica para ESCONDER a seção e voltar para a lista
    function hideSection(view) {
        if (view.section) view.section.classList.add('hidden');
        if (projectListContainer) projectListContainer.classList.remove('hidden');
        
        // Leva o usuário de volta para a seção de projetos
        const targetElement = document.getElementById('projetos');
        if(targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Loop que adiciona os eventos de clique para todas as ferramentas
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
