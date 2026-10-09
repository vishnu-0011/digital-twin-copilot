"""
FastAPI Service
================
Exposes the digital twin + agent copilot as an HTTP API. This is the layer
a dashboard (React, Streamlit, whatever) or a demo script would call.

Run:
    uvicorn api.main:app --reload --port 8000

Endpoints:
    GET  /health
    GET  /fleet                      -> latest state of every machine
    POST /simulate?duration_s=1800   -> advance the simulation clock
    POST /monitor/check              -> run one full agent monitoring cycle
    POST /whatif                     -> run an isolated what-if simulation
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from pydantic import BaseModel

from digital_twin.simulator import FactoryTwin
from ml_pipeline.anomaly_detector import AnomalyDetector
from ml_pipeline.rul_predictor import RULPredictor, label_rul
from rag.knowledge_base import MaintenanceKnowledgeBase
from agents.orchestrator import build_copilot_graph
from agents.tools import run_what_if_simulation

# -- app-level state, built once at startup ---------------------------------
app_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    twin = FactoryTwin()
    twin.run(duration_s=20000)  # warm up so ML models have failure examples
    history = twin.history_dataframe()

    detector = AnomalyDetector().fit(history)
    predictor = RULPredictor().fit(label_rul(history))

    kb = MaintenanceKnowledgeBase()
    kb.ingest_directory()

    app_state["twin"] = twin
    app_state["detector"] = detector
    app_state["predictor"] = predictor
    app_state["kb"] = kb
    app_state["graph"] = build_copilot_graph(twin, detector, predictor, kb)

    yield
    app_state.clear()


app = FastAPI(title="Smart Manufacturing Digital Twin Copilot", lifespan=lifespan)


class SimulateRequest(BaseModel):
    duration_s: float = 1800


class WhatIfRequest(BaseModel):
    duration_s: float = 3600
    seed: int = 7


@app.get("/health")
def health():
    predictor = app_state.get("predictor")
    return {
        "status": "ok",
        "mode": "100% Pure ML (Zero API Keys)",
        "rul_backend": predictor.backend if predictor else "tcn_2021",
    }


@app.get("/fleet")
def fleet_state():
    twin: FactoryTwin = app_state["twin"]
    predictor = app_state.get("predictor")
    latest_states = [s.to_dict() for s in twin.get_latest_states()]
    if predictor:
        try:
            history_df = twin.history_dataframe() if hasattr(twin, "history_dataframe") else None
            scored = predictor.predict_latest(latest_states, history_df=history_df)
            return {"machines": scored}
        except Exception:
            pass
    return {"machines": latest_states}


@app.post("/simulate")
def simulate(req: SimulateRequest):
    twin: FactoryTwin = app_state["twin"]
    twin.run(duration_s=req.duration_s)
    return {"advanced_s": req.duration_s, "fleet": [s.to_dict() for s in twin.get_latest_states()]}


@app.post("/monitor/check")
def monitor_check():
    """Runs one full Monitor -> Diagnosis -> Scheduler -> Report cycle
    through the live agent graph and returns the structured result."""
    graph = app_state["graph"]
    result = graph.invoke({"trigger": "scheduled_check"})
    return result


class MaintenanceTriggerRequest(BaseModel):
    machine_id: str
    reason: str = "Manual operator intervention from 3D console"


@app.post("/maintenance/trigger")
def trigger_maintenance(req: MaintenanceTriggerRequest):
    twin: FactoryTwin = app_state["twin"]
    scheduled = twin.schedule_maintenance(req.machine_id)
    return {
        "machine_id": req.machine_id,
        "scheduled": scheduled,
        "fleet": [s.to_dict() for s in twin.get_latest_states()],
    }


@app.post("/whatif")
def whatif(req: WhatIfRequest):
    """Runs an isolated, throwaway simulation — does not affect the live twin."""
    return run_what_if_simulation(duration_s=req.duration_s, seed=req.seed)


# -- Serve 3D Strategy Game UI at root (placed after API routes) -------------
import os
from fastapi.staticfiles import StaticFiles

WEB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web")
os.makedirs(WEB_DIR, exist_ok=True)
app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")
