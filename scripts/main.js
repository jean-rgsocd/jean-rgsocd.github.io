document.addEventListener('DOMContentLoaded', function () {
    // Lógica do Menu Mobile
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Lógica do Texto de Introdução (Typed.js)
    if (document.getElementById('typed-headline')) {
        new Typed('#typed-headline', {
            strings: ['Profissional de Tecnologia e Segurança Cibernética'],
            typeSpeed: 50,
            showCursor: true,
            cursorChar: '_',
            startDelay: 500,
            onComplete: (self) => {
                self.cursor.style.display = 'none';
                const paragraphEl = document.getElementById('intro-paragraph');
                paragraphEl.style.opacity = 1;
                
                setTimeout(() => {
                    new Typed('#typed-paragraph', {
                        strings: [
                            'Com base sólida em Gestão de Projetos, IA e Cybersecurity, busco aplicar minha visão estratégica para garantir a integridade, eficiência e segurança de sistemas. Minha experiência em operações e análise de dados me preparou para resolver problemas complexos e liderar com foco em resultados na área de tecnologia.'
                        ],
                        typeSpeed: 25,
                        showCursor: true,
                        cursorChar: '_',
                        startDelay: 200,
                        onComplete: (selfPara) => {
                            selfPara.cursor.style.display = 'none';
                        },
                    });
                }, 300);
            }
        });
    }

    // Lógica do Gráfico de Competências (Chart.js)
    if (document.getElementById('skillsChart')) {
        const ctx = document.getElementById('skillsChart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Análise de Vulnerabilidades', 'Pentesting', 'Gestão Ágil', 'Liderança', 'Análise de Dados', 'Arquitetura de Segurança'],
                datasets: [{
                    label: 'Nível de Proficiência',
                    data: [90, 85, 80, 95, 88, 75],
                    backgroundColor: 'rgba(0, 230, 230, 0.2)',
                    borderColor: 'rgba(0, 230, 230, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 230, 230, 1)',
                    pointBorderColor: '#0d1117',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(0, 230, 230, 1)'
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(201, 209, 217, 0.1)' },
                        grid: { color: 'rgba(201, 209, 217, 0.1)' },
                        pointLabels: {
                            font: { size: 12, weight: 'bold' },
                            color: '#c9d1d9'
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            stepSize: 20,
                            color: '#c9d1d9'
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                             label: function(context) {
                                 return (context.dataset.label || '') + ': ' + context.parsed.r + '%';
                             }
                         }
                    }
                }
            }
        });
    }

    // Lógica das Abas de Competências
    const tabs = document.querySelectorAll('#competencias .tab-btn');
    const contents = document.querySelectorAll('#competencias .tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach(t => {
                t.classList.remove('text-cyan-300', 'border-cyan-300');
                t.classList.add('text-slate-400', 'border-transparent', 'hover:text-slate-300', 'hover:border-slate-500');
            });
            tab.classList.add('text-cyan-300', 'border-cyan-300');
            tab.classList.remove('text-slate-400', 'border-transparent');
            
            contents.forEach(content => content.classList.add('hidden'));
            document.getElementById(target + '-content').classList.remove('hidden');
        });
    });
});
