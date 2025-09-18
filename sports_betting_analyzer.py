# Filename: sports_betting_analyzer.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import math
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sports Betting Analyzer", version="0.1")

# Adicionando Middleware CORS para permitir que seu site chame a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens (idealmente, restrinja ao seu site)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatchInput(BaseModel):
    home_team: str
    away_team: str
    competition: str
    status: str
    minute: Optional[int] = 0

class BettingTip(BaseModel):
    market: str
    probability_pct: int
    confidence_score: float
    justification: str

class MatchAnalysis(BaseModel):
    match: MatchInput
    generated_at: str
    top_tips: list[BettingTip]

def compute_probabilities(m):
    # Lógica com dados simulados (como antes)
    stats = {
        "xG_home": 0.85, "xG_away": 0.60, "shots_on_target_home": 3,
        "shots_on_target_away": 1, "possession_home": 54, "corners_home": 4,
        "corners_away": 1, "dangerous_attacks_home": 12, "away_team_elo": 1860
    }
    intensity = (stats["shots_on_target_home"] + stats["shots_on_target_away"])
    xg_sum = stats["xG_home"] + stats["xG_away"]
    raw_goal_rate = 1 - math.exp(-(xg_sum + intensity * 0.05))
    over_1_5_ft = min(1.0, raw_goal_rate * 1.1)
    btts = min(1.0, (stats["xG_home"] * 0.5) + (stats["xG_away"] * 0.5))
    home_win = min(1.0, (stats["xG_home"] * 1.2 + stats["possession_home"]*0.01) / 2)
    away_win = 1.0 - home_win
    corners_over_7_5_ft = min(1.0, (stats["corners_home"] + stats["corners_away"]) / 7.5)

    return {
        "over_1_5_ft": over_1_5_ft, "btts": btts, "home_win": home_win,
        "away_win": away_win, "corners_over_7_5_ft": corners_over_7_5_ft
    }

@app.post("/analyze", response_model=MatchAnalysis)
def analyze_match(match: MatchInput):
    try:
        probs = compute_probabilities(match)
        markets_info = {
            "over_1_5_ft": {"label": "Mais de 1.5 Gols (FT)"},
            "btts": {"label": "Ambas as Equipes Marcam"},
            "home_win": {"label": f"{match.home_team} para Vencer"},
            "away_win": {"label": f"{match.away_team} para Vencer"},
            "corners_over_7_5_ft": {"label": "Mais de 7.5 Escanteios"}
        }
        ranked = sorted(probs.items(), key=lambda kv: kv[1], reverse=True)
        tips = []
        for market_key, prob in ranked[:3]:
            tips.append(BettingTip(
                market=markets_info[market_key]["label"],
                probability_pct=round(prob * 100),
                confidence_score=round(prob, 3),
                justification="Análise baseada em estatísticas simuladas."
            ))
        return MatchAnalysis(
            match=match,
            generated_at=datetime.utcnow().isoformat() + "Z",
            top_tips=tips
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
