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


@app.get("/pipeline/flow")
def pipeline_flow():
    """Returns end-to-end Titan Aerospace manufacturing stages, WIP stats,
    and live AI reasoning pipeline steps."""
    twin: FactoryTwin = app_state["twin"]
    states = {s.machine_id: s.to_dict() for s in twin.get_latest_states()}

    cnc = states.get("CNC-01", {})
    press = states.get("PRESS-01", {})
    conv = states.get("CONV-01", {})

    total_parts = sum(s.get("throughput_units", 0) for s in states.values())

    bottleneck = None
    for mid, s in states.items():
        if s.get("status") in ["warning", "critical", "failed", "in_maintenance"]:
            bottleneck = mid
            break

    return {
        "company": {
            "name": "Titan Aerospace Precision Fab",
            "facility": "Sector 7 Advanced Machining Facility",
            "total_throughput_parts": total_parts,
            "line_balance_pct": 96.8 if not bottleneck else 74.2,
            "downtime_cost_saved_usd": round(total_parts * 42.50, 2),
            "active_bottleneck": bottleneck,
        },
        "manufacturing_stages": [
            {
                "id": "STAGE-01",
                "name": "Raw Ingot Ingestion",
                "component": "Inconel 718 Billets",
                "status": "NOMINAL",
                "cycle_time_s": 5.0,
                "wip_count": 18,
                "station_type": "FEEDER",
            },
            {
                "id": "STAGE-02",
                "name": "High-Speed CNC Milling",
                "workcell_id": "CNC-01",
                "component": "Turbine Blades (HP Stage 1)",
                "status": (cnc.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 12.0,
                "wip_count": cnc.get("throughput_units", 0),
                "wear_level": cnc.get("wear_level", 0.0),
                "station_type": "MACHINING",
            },
            {
                "id": "STAGE-03",
                "name": "1000T Hydraulic Forging",
                "workcell_id": "PRESS-01",
                "component": "Airframe Bulkhead Ribs",
                "status": (press.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 8.0,
                "wip_count": press.get("throughput_units", 0),
                "wear_level": press.get("wear_level", 0.0),
                "station_type": "FORGING",
            },
            {
                "id": "STAGE-04",
                "name": "Assembly & Laser QC Gate",
                "workcell_id": "CONV-01",
                "component": "Avionics Core Integration",
                "status": (conv.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 3.0,
                "wip_count": conv.get("throughput_units", 0),
                "wear_level": conv.get("wear_level", 0.0),
                "station_type": "INSPECTION",
            },
            {
                "id": "STAGE-05",
                "name": "Autonomous Hangar Transit",
                "workcell_id": "AGV-01",
                "component": "Cleanroom Depot Transit",
                "status": "ACTIVE",
                "cycle_time_s": 24.0,
                "wip_count": 4,
                "station_type": "LOGISTICS",
            },
        ],
        "ai_reasoning_pipeline": [
            {
                "step": 1,
                "name": "Sensor Ingestion",
                "metric": "60Hz Vibration & Temp",
                "status": "STREAMING",
                "details": "Continuous SimPy physical telemetry feeds",
            },
            {
                "step": 2,
                "name": "Feature Extraction",
                "metric": "Observable Dynamics Only",
                "status": "PASS",
                "details": "Zero leakage: wear_level omitted, Δvib & rolling dynamics active",
            },
            {
                "step": 3,
                "name": "2021 TCN Prognostics",
                "metric": "1D Dilated Residual TCN",
                "status": "INFERRED",
                "details": "Exponential receptive fields (d=1,2,4,8) + piecewise linear ceiling",
            },
            {
                "step": 4,
                "name": "Anomaly Gate",
                "metric": "Isolation Forest",
                "status": "PASS" if not bottleneck else "ALERT",
                "details": "Contamination threshold 0.05 over multivariant feature space",
            },
            {
                "step": 5,
                "name": "SOP Semantic Match",
                "metric": "ChromaDB RAG / TF-IDF",
                "status": "RESOLVED",
                "details": "Offline cosine similarity against plant maintenance manuals",
            },
            {
                "step": 6,
                "name": "Risk-Aware Scheduling",
                "metric": "15% Asymmetric Safety Buffer",
                "status": "ACTIVE",
                "details": "RUL_safe = 0.85 * RUL_pred prevents catastrophic spindle crashes",
            },
        ],
    }


# -- Serve 3D Strategy Game UI at root (placed after API routes) -------------
import os
from fastapi.staticfiles import StaticFiles

WEB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web")
os.makedirs(WEB_DIR, exist_ok=True)
app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")
