# Portfólio Interativo e Ferramentas de IA

Este repositório contém o código-fonte do meu portfólio pessoal ([jean-rgsocd.github.io](https://jean-rgsocd.github.io/)), um site estático que integra dinamicamente projetos de backend como o **Tipster IA** e o **Radar IA**, além de oferecer ferramentas interativas como um gerador de prompts avançado e um simulador de análise de segurança.

---

### **Estrutura do Repositório**

O projeto foi organizado de forma modular para separar claramente a estrutura, os dados e a lógica da aplicação.

-   `/`
    -   `index.html`: Arquivo principal que contém a estrutura (esqueleto) de todas as páginas e seções do site.
    -   `README.md`: Este arquivo.
    -   `perfil.jpg`: Imagem de perfil utilizada na seção "Sobre".

-   `**/categorias/**`
    -   Contém múltiplos arquivos `.js` que funcionam como um banco de dados para o Gerador de Prompts. Cada arquivo representa uma categoria (ex: `programacao.js`, `marketing.js`) e armazena os prompts de profissões correspondentes.

-   `**/scripts/**`
    -   Contém todo o código JavaScript que controla a interatividade e a lógica do site.
        -   `main.js`: Lógica principal da página (menu, animações de texto, gráfico de competências).
        -   `navigation.js`: Gerencia a exibição e ocultação das seções de projetos interativos.
        -   `prompts.js`: Controla toda a funcionalidade do Gerador de Prompts Interativo.
        -   `scanner.js`: Controla a simulação do Analisador de Segurança Web.
        -   `tipster.js`: Integra-se com o backend para alimentar o Analisador de Apostas Esportivas.
        -   `radar.js`: Reservado para a funcionalidade do projeto futuro "Radar IA".

---

### **Arquitetura**

A arquitetura do projeto é baseada na clara separação de responsabilidades:

1.  **Frontend (GitHub Pages)**:
    -   **Estrutura e Estilo**: O `index.html` é responsável por toda a estrutura HTML, utilizando **TailwindCSS** para estilização.
    -   **Dados (Prompts)**: A pasta `categorias` armazena os dados dos prompts de forma modular. O `index.html` carrega esses arquivos para alimentar o gerador.
    -   **Lógica e Interatividade**: A pasta `scripts` contém o **JavaScript (Vanilla)** que manipula o DOM e controla toda a interatividade do site.

2.  **Backend (Render/Vercel)**:
    -   **Tipster IA (analisador-apostas-backend)**: Uma API em **Python (FastAPI)** que processa dados esportivos e fornece análises para o frontend. Endpoints principais:
        -   `/ligas/{sport}`
        -   `/partidas-por-esporte/{sport}`
        -   `/analisar-pre-jogo/{game_id}`
        -   `/analisar-ao-vivo/{game_id}`
    -   **Radar IA (radar-ia-backend)**: API em desenvolvimento para monitoramento esportivo em tempo real.

---

### **Fluxo de Uso das Ferramentas**

-   **Tipster IA**:
    1.  Usuário escolhe Esporte -> Liga -> Jogo.
    2.  O `scripts/tipster.js` (frontend) chama a API de backend correspondente.
    3.  O backend processa os dados e retorna a análise (justificativas, confiança).
    4.  O resultado é renderizado no site.

-   **Gerador de Prompts**:
    1.  Usuário seleciona uma categoria no primeiro dropdown.
    2.  O `scripts/prompts.js` utiliza os dados carregados dos arquivos da pasta `categorias` para popular o segundo dropdown com as profissões.
    3.  Ao clicar em "Gerar", o prompt correspondente é exibido.

---

### **Manutenção e Futuras Adições**

Para adicionar novos conteúdos de forma organizada, siga os passos abaixo:

#### **Adicionar nova Categoria de Prompts:**
1.  Criar o novo arquivo `nova-categoria.js` dentro da pasta `/categorias/`.
2.  Adicionar o nome `nova-categoria.js` na lista de categorias dentro do select `<select id="categoria-profissao">` no `index.html`.
3.  Adicionar a linha `<script src="categorias/nova-categoria.js"></script>` no final do `index.html` para carregar os novos dados.

#### **Adicionar novo Projeto Interativo:**
1.  Criar a seção HTML para o novo projeto dentro do `index.html`, iniciando com a classe `hidden`.
2.  Criar o card de apresentação do projeto na seção `#projetos`.
3.  Criar o arquivo `novo-projeto.js` dentro da pasta `/scripts/` com toda a lógica da nova ferramenta.
4.  Adicionar a chamada `<script src="scripts/novo-projeto.js" defer></script>` no final do `index.html`.
5.  Atualizar o `scripts/navigation.js` para incluir os botões de "Ver Projeto" e "Retornar" da nova ferramenta.

---

### **Tecnologias**

-   **Frontend**: HTML, TailwindCSS, JavaScript (Vanilla)
-   **Backend**: Python (FastAPI)
-   **Hospedagem Frontend**: GitHub Pages
-   **Hospedagem Backend**: Render / Vercel (conforme deploy)

---

**Autor:** Jean Carlos
