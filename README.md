# 🌐 Projetos Destacados (Frontend)

Este repositório contém o **frontend** (site em GitHub Pages) que integra os projetos **Tipster IA** e **Radar IA**, além de ferramentas e geradores de prompts.

---

## 📂 Estrutura do Repositório

/ (raiz)
│ index.html
│
├── categorias/ → prompts organizados por profissão/categoria
│ ├── advocacia.js
│ ├── tecnologia.js
│ ├── ...
│ └── index.js → carrega automaticamente todas as categorias
│
├── ferramentas/ → utilidades extras
│ ├── ia.js
│ ├── imagens.js
│ ├── seguranca.js
│ ├── videos.js
│ └── index.js → carrega automaticamente todas as ferramentas
│
└── projetos/
├── tipster.js → integra com sports_betting_analyzer.py
├── radar.js → integra com radar_ia.py
└── navegacao.js → controla abrir/fechar projetos no site
---

## ⚙️ Arquitetura
🌐 Usuário (Navegador)
│
▼
📱 Frontend (GitHub Pages)
│
├── Tipster IA → tipster.js
│ │
│ ▼
│ 📊 Backend (analizador-apostas-backend)
│ Endpoints:
│ - /ligas/football
│ - /partidas/{league}
│ - /partidas-por-esporte/{sport}
│ - /analise/{league}/{game_id}
│
└── Radar IA → radar.js
│
▼
📡 Backend (radar-ia-backend)
Endpoints:
- /jogos-aovivo
- /stats-aovivo/{game_id}

---

## 🚀 Fluxo de Uso

### Tipster IA
1. Usuário escolhe **Futebol, NBA ou NFL**.  
   - Futebol → liga → jogo.  
   - NBA/NFL → jogos diretos.  
2. `tipster.js` chama o backend **Tipster IA**.  
3. API retorna a análise (mercados, justificativas, confiança).  
4. Resultado renderizado no site.

### Radar IA
1. Usuário abre projeto → carrega **ligas ao vivo**.  
2. Escolhe a liga e depois o jogo disponível.  
3. `radar.js` chama o backend **Radar IA**.  
4. API retorna estatísticas em tempo real (placar, ataques, remates, posse).  
5. Atualização automática a cada **30s**.

---

## 🔧 Manutenção

- Para adicionar **nova categoria**:
  1. Criar o arquivo em `categorias/`.
  2. Adicionar o nome do arquivo em `categorias/index.js`.

- Para adicionar **nova ferramenta**:
  1. Criar o arquivo em `ferramentas/`.
  2. Adicionar o nome do arquivo em `ferramentas/index.js`.

- Para adicionar **novo projeto**:
  1. Criar `projetos/novoProjeto.js`.
  2. Criar seção no `index.html`.
  3. Adicionar botões de abrir/fechar e IDs no `navegacao.js`.

---

## 📌 Tecnologias

- **Frontend:** HTML + TailwindCSS + JavaScript vanilla  
- **Backend Tipster IA:** FastAPI (Python)  
- **Backend Radar IA:** FastAPI (Python)  
- **Hospedagem frontend:** GitHub Pages  
- **Hospedagem backend:** Vercel/Render (ajustar conforme deploy)

---

✍️ **Autor:** Jean Carlos  
