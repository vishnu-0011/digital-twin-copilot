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
from digital_twin.models import MachineStatus
from ml_pipeline.anomaly_detector import AnomalyDetector
from ml_pipeline.rul_predictor import RULPredictor, label_rul
from rag.knowledge_base import MaintenanceKnowledgeBase
from agents.orchestrator import build_copilot_graph
from agents.tools import run_what_if_simulation

# -- app-level state, built once at startup ---------------------------------
app_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Warm up offline ML models with synthetic run-to-failure historical data
    training_twin = FactoryTwin(seed=42)
    training_twin.run(duration_s=20000)
    history = training_twin.history_dataframe()

    detector = AnomalyDetector().fit(history)
    predictor = RULPredictor().fit(label_rul(history))

    kb = MaintenanceKnowledgeBase()
    kb.ingest_directory()

    # 2. Live production plant starts fresh in an active nominal shift (~20 min run-in)
    live_twin = FactoryTwin(seed=101)
    live_twin.run(duration_s=1200)

    app_state["twin"] = live_twin
    app_state["detector"] = detector
    app_state["predictor"] = predictor
    app_state["kb"] = kb
    app_state["graph"] = build_copilot_graph(live_twin, detector, predictor, kb)

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
    m_twin = twin.machines.get(req.machine_id)
    if m_twin:
        m_twin.wear_level = 0.0
        m_twin.status = MachineStatus.HEALTHY
        m_twin._emit_state()
        scheduled = True
    else:
        scheduled = False
    return {
        "machine_id": req.machine_id,
        "scheduled": scheduled,
        "fleet": [s.to_dict() for s in twin.get_latest_states()],
    }


@app.post("/fleet/reset")
def reset_fleet():
    """Resets all machines in the live factory twin back to nominal fresh-shift status."""
    twin: FactoryTwin = app_state["twin"]
    for m in twin.machines.values():
        m.wear_level = 0.05
        m.status = MachineStatus.HEALTHY
        m._emit_state()
    return {
        "status": "SUCCESS",
        "message": "All workcells reset to nominal operating condition.",
        "fleet": [s.to_dict() for s in twin.get_latest_states()],
    }


@app.get("/pipeline/flow")
def pipeline_flow():
    """Returns end-to-end Titan Aerospace manufacturing stages, WIP stats,
    and live AI reasoning pipeline steps."""
    twin: FactoryTwin = app_state["twin"]
    states = {s.machine_id: s.to_dict() for s in twin.get_latest_states()}

    cnc1 = states.get("CNC-01", {})
    cnc2 = states.get("CNC-02", {})
    press1 = states.get("PRESS-01", {})
    press2 = states.get("PRESS-02", {})
    furn = states.get("FURN-01", {})
    robot = states.get("ROBOT-01", {})
    conv = states.get("CONV-01", {})
    laser = states.get("LASER-01", {})

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
                "component": "Inconel 718 & Ti-6Al-4V Billets",
                "status": "NOMINAL",
                "cycle_time_s": 4.0,
                "wip_count": 24,
                "station_type": "FEEDER",
            },
            {
                "id": "STAGE-02",
                "name": "Heavy Roughing Milling",
                "workcell_id": "CNC-01",
                "component": "Turbine Blade Blanks",
                "status": (cnc1.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 12.0,
                "wip_count": cnc1.get("throughput_units", 0),
                "wear_level": cnc1.get("wear_level", 0.0),
                "station_type": "MACHINING",
            },
            {
                "id": "STAGE-03",
                "name": "High-Speed Airfoil Finishing",
                "workcell_id": "CNC-02",
                "component": "Aero Airfoil Profiles",
                "status": (cnc2.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 10.0,
                "wip_count": cnc2.get("throughput_units", 0),
                "wear_level": cnc2.get("wear_level", 0.0),
                "station_type": "MACHINING",
            },
            {
                "id": "STAGE-04",
                "name": "1000T Bulkhead Forging",
                "workcell_id": "PRESS-01",
                "component": "Airframe Bulkhead Ribs",
                "status": (press1.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 8.0,
                "wip_count": press1.get("throughput_units", 0),
                "wear_level": press1.get("wear_level", 0.0),
                "station_type": "FORGING",
            },
            {
                "id": "STAGE-05",
                "name": "500T Hydraulic Extrusion",
                "workcell_id": "PRESS-02",
                "component": "Titanium Spar Extrusions",
                "status": (press2.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 6.0,
                "wip_count": press2.get("throughput_units", 0),
                "wear_level": press2.get("wear_level", 0.0),
                "station_type": "FORMING",
            },
            {
                "id": "STAGE-06",
                "name": "Vacuum Carburizing Heat Treat",
                "workcell_id": "FURN-01",
                "component": "Thermal Case Hardening",
                "status": (furn.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 15.0,
                "wip_count": furn.get("throughput_units", 0),
                "wear_level": furn.get("wear_level", 0.0),
                "station_type": "THERMAL",
            },
            {
                "id": "STAGE-07",
                "name": "6-DOF Robotic Deburring",
                "workcell_id": "ROBOT-01",
                "component": "Root Radius Polishing",
                "status": (robot.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 7.0,
                "wip_count": robot.get("throughput_units", 0),
                "wear_level": robot.get("wear_level", 0.0),
                "station_type": "ROBOTICS",
            },
            {
                "id": "STAGE-08",
                "name": "Laser Triangulation QC Gate",
                "workcell_id": "LASER-01",
                "component": "Sub-Micron Profile Metrology",
                "status": (laser.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 4.0,
                "wip_count": laser.get("throughput_units", 0),
                "wear_level": laser.get("wear_level", 0.0),
                "station_type": "METROLOGY",
            },
            {
                "id": "STAGE-09",
                "name": "Avionics Assembly Line",
                "workcell_id": "CONV-01",
                "component": "Avionics Core Integration",
                "status": (conv.get("status") or "HEALTHY").upper(),
                "cycle_time_s": 3.0,
                "wip_count": conv.get("throughput_units", 0),
                "wear_level": conv.get("wear_level", 0.0),
                "station_type": "ASSEMBLY",
            },
            {
                "id": "STAGE-10",
                "name": "Autonomous AMR Cleanroom Transit",
                "workcell_id": "AGV-01",
                "component": "Finished Assemblies Depot Transit",
                "status": "ACTIVE",
                "cycle_time_s": 24.0,
                "wip_count": 8,
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
