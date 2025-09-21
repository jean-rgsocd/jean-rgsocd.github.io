// radar.js - radar ao vivo com seleção por liga -> jogo e perídos clicáveis
document.addEventListener("DOMContentLoaded", function () {
    const radarSection = document.getElementById("radar-ia-section");
    if (!radarSection) return;

    const RADAR_API = "https://radar-ia-backend.onrender.com";
    const leagueSelect = document.getElementById("radar-league-select");
    const gameSelect = document.getElementById("radar-game-select");
    const dashboard = document.getElementById("radar-dashboard");
    const scoreEl = document.getElementById("radar-score");
    const minuteEl = document.getElementById("radar-minute");
    const homeTeamEl = document.getElementById("home-team-name");
    const awayTeamEl = document.getElementById("away-team-name");
    const eventsEl = document.getElementById("radar-events");
    const tab1 = document.getElementById("tab-1t");
    const tab2 = document.getElementById("tab-2t");
    const tabFull = document.getElementById("tab-full");

    let interval = null;
    let currentGameId = null;
    let currentPeriod = "full"; // "1t", "2t", "full"

    // carregar ligas ao abrir a seção
    const loadLeagues = async () => {
        leagueSelect.disabled = true;
        leagueSelect.innerHTML = `<option>Carregando ligas...</option>`;
        try {
            const resp = await fetch(`${RADAR_API}/ligas`);
            const leagues = await resp.json();
            leagueSelect.innerHTML = `<option value="">Escolha uma liga</option>`;
            leagues.forEach(l => leagueSelect.add(new Option(`${l.name} - ${l.country}`, l.id)));
            leagueSelect.disabled = false;
        } catch (err) {
            leagueSelect.innerHTML = `<option value="">Erro ao carregar ligas</option>`;
        }
    };

    // carregar jogos da liga selecionada (ao vivo)
    const loadGames = async (leagueId) => {
        gameSelect.disabled = true;
        gameSelect.innerHTML = `<option>Carregando jogos...</option>`;
        try {
            const resp = await fetch(`${RADAR_API}/jogos-aovivo?league=${leagueId}`);
            const games = await resp.json();
            if (!games || games.length === 0) {
                gameSelect.innerHTML = `<option value="">Nenhum jogo ao vivo</option>`;
                return;
            }
            gameSelect.innerHTML = `<option value="">Selecione um jogo</option>`;
            games.forEach(g => gameSelect.add(new Option(g.title, g.game_id)));
            gameSelect.disabled = false;
        } catch (err) {
            gameSelect.innerHTML = `<option value="">Erro ao carregar jogos</option>`;
        }
    };

    const renderStats = (data) => {
        homeTeamEl.textContent = data.teams?.home?.name || "Home";
        awayTeamEl.textContent = data.teams?.away?.name || "Away";
        scoreEl.textContent = `${data.goals?.home ?? 0} - ${data.goals?.away ?? 0}`;
        minuteEl.textContent = data.fixture?.status?.elapsed ? `${data.fixture.status.elapsed}'` : "-";

        // eventos
        eventsEl.innerHTML = "";
        if (data.events && data.events.length > 0) {
            data.events.forEach(e => {
                const li = document.createElement("li");
                li.className = "truncate";
                const timeLabel = e.time?.elapsed ? `${e.time.elapsed}'` : '';
                const extraSec = e.time?.second ? `:${e.time.second}` : '';
                li.textContent = `${timeLabel}${extraSec} - ${e.type} (${e.detail}) - ${e.player?.name || ''}`;
                eventsEl.appendChild(li);
            });
        } else {
            eventsEl.innerHTML = "<li>Nenhum evento recente.</li>";
        }

        dashboard.classList.remove("hidden");
    };

    const fetchGame = async (gameId) => {
        try {
            const resp = await fetch(`${RADAR_API}/stats-aovivo/${gameId}`);
            if (!resp.ok) throw new Error("Erro stats");
            const data = await resp.json();
            renderStats(data);
        } catch (err) {
            console.error("Erro ao carregar estatísticas:", err);
            dashboard.classList.add("hidden");
            clearInterval(interval);
        }
    };

    gameSelect.addEventListener('change', () => {
        const id = gameSelect.value;
        clearInterval(interval);
        if (!id) {
            dashboard.classList.add("hidden");
            return;
        }
        currentGameId = id;
        fetchGame(currentGameId);
        interval = setInterval(() => fetchGame(currentGameId), 45000); // atualiza a cada 45s
    });

    leagueSelect.addEventListener('change', () => {
        const lid = leagueSelect.value;
        if (!lid) return;
        loadGames(lid);
    });

    tab1 && tab1.addEventListener('click', () => {
        currentPeriod = "1t";
        // atualmente backend retorna estatísticas por período em "statistics" se disponível
    });
    tab2 && tab2.addEventListener('click', () => {
        currentPeriod = "2t";
    });
    tabFull && tabFull.addEventListener('click', () => {
        currentPeriod = "full";
    });

    // observer para carregar ligas quando a seção ficar visível
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadLeagues();
            observer.disconnect();
        }
    }, { threshold: 0.1 });

    observer.observe(radarSection);
});
