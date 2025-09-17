document.addEventListener('DOMContentLoaded', function () {
    const urlInput = document.getElementById('urlInput');
    const scanButton = document.getElementById('scanButton');
    const scanStatus = document.getElementById('scanStatus');
    const statusMessage = document.getElementById('statusMessage');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    const resultsDiv = document.getElementById('results');
    const analyzedUrlSpan = document.getElementById('analyzedUrl');
    const overallStatusSpan = document.getElementById('overallStatus');
    const vulnerabilitiesResults = document.getElementById('vulnerabilitiesResults');
    
    const vulnerabilities = [
        { name: 'Injeção de SQL', risk: 'high', description: 'Permite que um atacante manipule consultas ao banco de dados.' },
        { name: 'Cross-Site Scripting (XSS)', risk: 'high', description: 'Permite que um atacante injete scripts maliciosos em páginas web.' },
        { name: 'Exposição de Dados Sensíveis', risk: 'high', description: 'Dados confidenciais são expostos sem criptografia adequada.' },
        { name: 'Quebra de Autenticação', risk: 'high', description: 'Permite que atacantes roubem sessões para se passar por usuários.' },
        { name: 'Falsificação de Requisição entre Sites (CSRF)', risk: 'high', description: 'Força o navegador de um usuário a enviar uma requisição maliciosa.' },
        { name: 'Upload de Arquivos Não-restrito', risk: 'high', description: 'Permite que atacantes enviem arquivos maliciosos para o servidor.' },
        { name: 'Vulnerabilidades em Componentes Desatualizados', risk: 'medium', description: 'Bibliotecas e frameworks com falhas de segurança conhecidas.' },
        { name: 'Configuração Incorreta de Segurança', risk: 'medium', description: 'Causada por configurações padrão do servidor ou portas abertas.' },
        { name: 'Falta de HTTPS', risk: 'medium', description: 'Comunicação não é criptografada, expondo dados a interceptação.' },
        { name: 'Inclusão de Arquivos Remotos (RFI/LFI)', risk: 'medium', description: 'Permite que um atacante leia ou execute arquivos no servidor.' },
        { name: 'Gerenciamento de Sessão Inseguro', risk: 'low', description: 'O atacante pode roubar a sessão de um usuário (cookie).' },
        { name: 'Exposição de Informações do Servidor', risk: 'low', description: 'Informações detalhadas sobre o servidor são expostas.' },
    ];
    
    scanButton.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) {
            alert('Por favor, digite uma URL válida.');
            return;
        }

        scanStatus.classList.remove('hidden');
        statusMessage.textContent = 'Iniciando varredura minuciosa...';
        progressBarContainer.classList.remove('hidden');
        resultsDiv.classList.add('hidden');
        progressBar.style.width = '0%';

        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 5 + 1;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                setTimeout(showResults, 500);
            }
            progressBar.style.width = progress + '%';
        }, 100);

        function showResults() {
            statusMessage.textContent = 'Análise concluída com sucesso!';
            resultsDiv.classList.remove('hidden');
            analyzedUrlSpan.textContent = url;
            
            vulnerabilitiesResults.innerHTML = '<h3 class="font-bold text-xl text-cyan-300">Detalhes das Verificações</h3>';
            let hasHighRisk = false;

            const highRiskVulns = vulnerabilities.filter(v => v.risk === 'high');
            const mediumRiskVulns = vulnerabilities.filter(v => v.risk === 'medium');
            const lowRiskVulns = vulnerabilities.filter(v => v.risk === 'low');
            
            const numHigh = 2 + Math.floor(Math.random() * 2);
            const numMedium = 2 + Math.floor(Math.random() * 2);
            const numLow = 1 + Math.floor(Math.random() * 2);

            const selectedVulns = [
                ...highRiskVulns.sort(() => 0.5 - Math.random()).slice(0, numHigh),
                ...mediumRiskVulns.sort(() => 0.5 - Math.random()).slice(0, numMedium),
                ...lowRiskVulns.sort(() => 0.5 - Math.random()).slice(0, numLow)
            ].sort(() => 0.5 - Math.random());

            selectedVulns.forEach(vuln => {
                if (vuln.risk === 'high') hasHighRisk = true;
                const icon = (vuln.risk === 'high') ? '🚨' : (vuln.risk === 'medium' ? '⚠️' : '✅');
                const riskClass = (vuln.risk === 'high') ? 'vulnerable-status' : (vuln.risk === 'medium' ? 'text-yellow-400' : 'secure-status');
                const borderClass = (vuln.risk === 'high') ? 'border-red-600' : (vuln.risk === 'medium' ? 'border-yellow-400' : 'border-green-400');
                
                const vulnerabilityElement = document.createElement('div');
                vulnerabilityElement.className = `p-4 rounded-lg border ${borderClass} flex items-center space-x-4`;
                vulnerabilityElement.innerHTML = `
                    <span class="text-2xl">${icon}</span>
                    <div>
                        <p class="font-bold text-slate-100">${vuln.name}</p>
                        <p class="text-sm text-slate-400">${vuln.description}</p>
                        <p class="text-xs font-bold mt-1 ${riskClass}">Risco: ${vuln.risk.charAt(0).toUpperCase() + vuln.risk.slice(1)}</p>
                    </div>
                `;
                vulnerabilitiesResults.appendChild(vulnerabilityElement);
            });

            overallStatusSpan.textContent = hasHighRisk ? 'Criticamente Vulnerável' : 'Vulnerável';
            overallStatusSpan.className = 'font-bold vulnerable-status';
            document.getElementById('cta-section').classList.remove('hidden');
        }
    });
});