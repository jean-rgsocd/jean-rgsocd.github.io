document.addEventListener('DOMContentLoaded', function () {
    const scannerSection = document.getElementById('analisador-seguranca-web');
    if (!scannerSection) return; // Só executa se a seção existir

    const urlInput = document.getElementById('urlInput');
    const scanButton = document.getElementById('scanButton');
    const scanStatusDiv = document.getElementById('scanStatus');
    const statusMessage = document.getElementById('statusMessage');
    const progressBar = document.getElementById('progressBar');
    const resultsDiv = document.getElementById('results');
    const analyzedUrlSpan = document.getElementById('analyzedUrl');
    const overallStatusSpan = document.getElementById('overallStatus');
    const vulnerabilitiesDiv = document.getElementById('vulnerabilitiesResults');

    scanButton.addEventListener('click', iniciarAnalise);

    function iniciarAnalise() {
        const url = urlInput.value;
        if (!url || !url.startsWith('http')) {
            alert('Por favor, insira uma URL válida (ex: https://site.com).');
            return;
        }

        // Resetar a interface
        scanStatusDiv.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        progressBar.style.width = '0%';
        statusMessage.textContent = 'Iniciando análise em ' + url;
        vulnerabilitiesDiv.innerHTML = '<h3 class="font-bold text-xl text-cyan-300">Detalhes das Verificações</h3>';

        // ===================================================================
        // COLE AQUI A LÓGICA DE SIMULAÇÃO DO SCANNER
        // O código abaixo é um exemplo de como a simulação pode ser feita
        // Adapte com o seu código original.
        // ===================================================================
        
        // Exemplo de Simulação:
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressBar.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
                statusMessage.textContent = 'Análise Concluída!';
                exibirResultadosSimulados(url);
            }
        }, 200);
    }

    function exibirResultadosSimulados(url) {
        resultsDiv.classList.remove('hidden');
        analyzedUrlSpan.textContent = url;
        
        // Simulação de resultados
        const vulnerabilidades = [
            { nome: 'Cross-Site Scripting (XSS)', status: 'Vulnerável', severidade: 'Alta', desc: 'Permite que atacantes injetem scripts maliciosos em páginas web.' },
            { nome: 'SQL Injection', status: 'Seguro', severidade: 'Crítica', desc: 'Impede a manipulação de queries ao banco de dados.' },
            { nome: 'Cabeçalhos de Segurança', status: 'Vulnerável', severidade: 'Média', desc: 'Faltam cabeçalhos como HSTS e CSP, expondo o site a certos tipos de ataque.' },
            { nome: 'Validação de Certificado SSL/TLS', status: 'Seguro', severidade: 'Alta', desc: 'A conexão é criptografada e segura.' }
        ];

        let temVulnerabilidadeAlta = false;
        vulnerabilidades.forEach(vuln => {
            const statusClass = vuln.status === 'Vulnerável' ? 'vulnerable-status' : 'secure-status';
            if(vuln.status === 'Vulnerável' && (vuln.severidade === 'Alta' || vuln.severidade === 'Crítica')) {
                temVulnerabilidadeAlta = true;
            }
            const vulnHtml = `
                <div class="p-4 border rounded-lg border-slate-700 bg-slate-900">
                    <div class="flex justify-between items-center">
                        <h4 class="font-bold text-slate-200">${vuln.nome}</h4>
                        <span class="font-bold text-sm ${statusClass}">${vuln.status.toUpperCase()}</span>
                    </div>
                    <p class="text-sm text-slate-400 mt-1">${vuln.desc}</p>
                    <p class="text-xs text-slate-500 mt-2">Severidade: ${vuln.severidade}</p>
                </div>
            `;
            vulnerabilitiesDiv.innerHTML += vulnHtml;
        });

        if (temVulnerabilidadeAlta) {
            overallStatusSpan.textContent = 'VULNERÁVEL';
            overallStatusSpan.className = 'font-bold vulnerable-status';
        } else {
            overallStatusSpan.textContent = 'SEGURO';
            overallStatusSpan.className = 'font-bold secure-status';
        }
    }
});
