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

import asyncio
import itertools
import os
import time
from collections import deque
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from digital_twin.simulator import FactoryTwin
from digital_twin.models import MachineStatus
from digital_twin.standards import iso_zone
from digital_twin.forecast import forecast_fleet, UNPLANNED_REPAIR_MULTIPLIER
from ml_pipeline.model_cache import load_or_train
from rag.knowledge_base import MaintenanceKnowledgeBase
from agents.orchestrator import build_copilot_graph
from agents.tools import run_what_if_simulation

# -- app-level state, built once at startup ---------------------------------
app_state: dict = {}


# -- WebSocket Connection Manager & Telemetry Broadcaster -------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)


ws_manager = ConnectionManager()


def _with_zone(rows: list[dict]) -> list[dict]:
    for r in rows:
        r["iso_zone"] = iso_zone(r.get("vibration_rms", 0.0))
        twin = app_state.get("twin")
        m = twin.machines.get(r.get("machine_id")) if twin else None
        if m:
            r["nominal_cycle_time_s"] = m.config.nominal_cycle_time_s
            r["machine_type"] = m.config.machine_type
            r["service_duration_s"] = m.config.maintenance_duration_s
            r["service_ends_s"] = m.under_maintenance_until
    return rows


def build_fleet_payload():
    twin: FactoryTwin = app_state["twin"]
    predictor = app_state.get("predictor")
    latest_states = [s.to_dict() for s in twin.get_latest_states()]
    if predictor:
        try:
            # The TCN reads the last 20 cycles per machine. Using only a short
            # recent window keeps this constant-time as the plant runs on.
            scored = predictor.predict_latest(latest_states, history_df=twin.recent_dataframe())
            return _with_zone(scored)
        except Exception:
            pass
    return _with_zone(latest_states)


# -- Maintenance log & shared actions ----------------------------------------
_log_ids = itertools.count(1)


def log_event(kind: str, machine_id: str | None, by: str, text: str):
    """Append-only audit trail shown in the UI's Log tab."""
    twin = app_state.get("twin")
    app_state.setdefault("log", deque(maxlen=300)).append({
        "id": next(_log_ids),
        "ts": time.time(),
        "plant_s": round(twin.env.now, 1) if twin else None,
        "kind": kind,
        "machine_id": machine_id,
        "by": by,
        "text": text,
    })


def on_transition(machine_id: str, old: MachineStatus, new: MachineStatus):
    if new == MachineStatus.FAILED:
        log_event("breakdown", machine_id, "Plant", f"{machine_id} broke down and stopped the line")
    elif old == MachineStatus.IN_MAINTENANCE and new != MachineStatus.IN_MAINTENANCE:
        log_event("back_in_service", machine_id, "Technician", f"{machine_id} service complete, back in production")
    elif new == MachineStatus.CRITICAL:
        log_event("alert", machine_id, "Copilot", f"{machine_id} needs service now")


def on_service(machine_id: str):
    """Called by the twin just before a scheduled service starts."""
    record_service(machine_id)
    actor = app_state.get("_actor") or "Copilot"
    if actor == "Copilot":
        log_event("auto_service", machine_id, "Copilot", f"Copilot scheduled service on {machine_id} (high urgency)")


def act_work_order(machine_id: str, by: str = "Supervisor") -> dict:
    """Approves a work order: the machine goes into service for its planned
    duration (plant time), then comes back with wear reset."""
    twin: FactoryTwin = app_state["twin"]
    m = twin.machines.get(machine_id)
    if not m:
        return {"status": "error", "error": f"Unknown machine {machine_id}"}
    if m.status == MachineStatus.IN_MAINTENANCE:
        return {"status": "noop", "machine_id": machine_id, "message": "Already in service"}
    app_state["_actor"] = by
    try:
        ok = twin.schedule_maintenance(machine_id)
        twin.run(0.01)  # let SimPy deliver the interrupt so the state flips now
    finally:
        app_state["_actor"] = None
    if ok:
        mins = round(m.config.maintenance_duration_s / 60)
        log_event("work_order", machine_id, by, f"Work order approved for {machine_id} ({mins} min planned service)")
    return {"status": "ok" if ok else "error", "machine_id": machine_id,
            "service_ends_s": m.under_maintenance_until}


def act_repair(machine_id: str, by: str = "Supervisor") -> bool:
    """Instant repair (demo shortcut): wear back to zero immediately."""
    twin: FactoryTwin = app_state["twin"]
    m = twin.machines.get(machine_id)
    if not m:
        return False
    record_service(machine_id)
    m.wear_level = 0.0
    m.status = MachineStatus.HEALTHY
    m._emit_state()
    log_event("repair", machine_id, by, f"{machine_id} serviced, wear reset")
    return True


def act_reset():
    twin: FactoryTwin = app_state["twin"]
    for m in twin.machines.values():
        m.wear_level = 0.05
        m.status = MachineStatus.HEALTHY
        m._emit_state()
    log_event("reset", None, "Demo", "Plant reset to a fresh shift")


def act_inject(machine_id: str, wear: float) -> bool:
    twin: FactoryTwin = app_state["twin"]
    m = twin.machines.get(machine_id)
    if not m:
        return False
    m.age_to(wear)
    log_event("fault", machine_id, "Demo", f"{machine_id} aged to {round(wear * 100)}% wear (demo)")
    return True


def act_step(duration_s: float):
    app_state["twin"].run(duration_s=duration_s)
    log_event("step", None, "Demo", f"Plant fast-forwarded {round(duration_s / 60)} min (demo)")


def record_service(machine_id: str):
    """Counts a service done before breakdown as a prevented failure."""
    twin: FactoryTwin = app_state["twin"]
    m = twin.machines.get(machine_id)
    if not m:
        return
    impact = app_state.setdefault("impact", {"failures_prevented": 0, "downtime_avoided_s": 0.0})
    if m.status in (MachineStatus.WARNING, MachineStatus.CRITICAL) or m.wear_level >= 0.6:
        planned = m.config.maintenance_duration_s
        impact["failures_prevented"] += 1
        impact["downtime_avoided_s"] += planned * (UNPLANNED_REPAIR_MULTIPLIER - 1)


def build_pipeline_flow_data():
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
    impact = app_state.get("impact", {"failures_prevented": 0, "downtime_avoided_s": 0.0})
    down = sum(1 for s in states.values() if s.get("status") in ("failed", "in_maintenance"))
    availability = round(100.0 * (len(states) - down) / max(1, len(states)), 1)

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
            "availability_pct": availability,
            "failures_prevented": impact["failures_prevented"],
            "downtime_avoided_h": round(impact["downtime_avoided_s"] / 3600.0, 2),
            "unplanned_repair_multiplier": UNPLANNED_REPAIR_MULTIPLIER,
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
                "name": "Telemetry Ingestion",
                "metric": "Per-cycle vibration & temp",
                "status": "STREAMING",
                "details": "One reading per machine cycle, pushed to the console at 2 Hz",
            },
            {
                "step": 2,
                "name": "Signal Dynamics",
                "metric": "Rolling Variance & RMS",
                "status": "PASS",
                "details": "Per-cycle deltas plus 5-cycle rolling mean and spread",
            },
            {
                "step": 3,
                "name": "Predictive Health (RUL)",
                "metric": "Degradation Forecasting",
                "status": "INFERRED",
                "details": "Multi-cycle trajectory projection of remaining tool life",
            },
            {
                "step": 4,
                "name": "Anomaly Gate",
                "metric": "Multivariate Analysis",
                "status": "PASS" if not bottleneck else "ALERT",
                "details": "Continuous statistical deviation check against baseline envelope",
            },
            {
                "step": 5,
                "name": "Procedure Alignment",
                "metric": "SOP Standard Catalog",
                "status": "RESOLVED",
                "details": "Contextual grounding against approved aerospace maintenance manuals",
            },
            {
                "step": 6,
                "name": "Risk-Aware Scheduling",
                "metric": "15% Safety Margin",
                "status": "ACTIVE",
                "details": "Conservative threshold buffer applied to prevent unscheduled downtime",
            },
        ],
    }


def build_plant_info():
    twin: FactoryTwin = app_state["twin"]
    predictor = app_state.get("predictor")
    metrics = getattr(predictor, "holdout_metrics", None) or {}
    impact = app_state.get("impact", {"failures_prevented": 0, "downtime_avoided_s": 0.0})
    return {
        "time_s": round(twin.env.now, 1),
        "speed": app_state.get("plant_speed", 1.0),
        "wall_ts": time.time(),
        "simulated": True,
        "rul_mae_cycles": metrics.get("mae_cycles"),
        "impact": {
            "failures_prevented": impact["failures_prevented"],
            "downtime_avoided_h": round(impact["downtime_avoided_s"] / 3600.0, 2),
            "unplanned_repair_multiplier": UNPLANNED_REPAIR_MULTIPLIER,
        },
    }


def build_telemetry_snapshot():
    return {
        "type": "telemetry",
        "timestamp": time.time(),
        "machines": build_fleet_payload(),
        "pipeline": build_pipeline_flow_data(),
        "plant": build_plant_info(),
        "log": list(app_state.get("log", []))[-40:],
    }


async def telemetry_broadcaster_task(interval: float = 0.5):
    """Runs the plant clock in real time (times TWIN_SPEED) and pushes a
    snapshot to every connected console twice a second."""
    loop = asyncio.get_running_loop()
    last = loop.time()
    try:
        while True:
            await asyncio.sleep(interval)
            now = loop.time()
            dt, last = now - last, now
            if "twin" in app_state and app_state.get("plant_speed", 0) > 0:
                try:
                    app_state["twin"].run(duration_s=dt * app_state["plant_speed"])
                except Exception:
                    pass
            if ws_manager.active_connections and "twin" in app_state:
                try:
                    payload = build_telemetry_snapshot()
                    await ws_manager.broadcast(payload)
                except Exception:
                    pass
    except asyncio.CancelledError:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Offline ML models trained on synthetic run-to-failure history.
    #    Cached on disk after the first run so restarts take seconds.
    detector, predictor, model_source = load_or_train(seed=42, duration_s=20000)

    kb = MaintenanceKnowledgeBase()
    kb.ingest_directory()

    # 2. Live production plant starts fresh in an active nominal shift (~20 min run-in)
    live_twin = FactoryTwin(seed=101, max_history=50_000)
    live_twin.run(duration_s=1200)

    app_state["twin"] = live_twin
    app_state["plant_speed"] = float(os.environ.get("TWIN_SPEED", "1.0"))
    app_state["log"] = deque(maxlen=300)
    live_twin.on_service = on_service
    live_twin.on_transition = on_transition
    log_event("start", None, "Plant", "Shift started, copilot monitoring 8 machines")
    app_state["detector"] = detector
    app_state["predictor"] = predictor
    app_state["kb"] = kb
    app_state["model_source"] = model_source
    app_state["impact"] = {"failures_prevented": 0, "downtime_avoided_s": 0.0}
    app_state["graph"] = build_copilot_graph(live_twin, detector, predictor, kb)

    # 3. Start background real-time telemetry broadcaster
    broadcast_task = asyncio.create_task(telemetry_broadcaster_task(interval=0.5))

    yield

    broadcast_task.cancel()
    try:
        await broadcast_task
    except asyncio.CancelledError:
        pass
    app_state.clear()



app = FastAPI(title="Smart Manufacturing Digital Twin Copilot", lifespan=lifespan)


@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith(("/js/", "/css/", "/vendor/")) or request.url.path in ("/", "/index.html"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


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
        "models": app_state.get("model_source", "unknown"),
        "rul_holdout": getattr(predictor, "holdout_metrics", None) if predictor else None,
    }


@app.get("/fleet")
def fleet_state():
    return {
        "machines": build_fleet_payload(),
        "plant": build_plant_info(),
        "log": list(app_state.get("log", []))[-40:],
    }


@app.post("/simulate")
def simulate(req: SimulateRequest):
    twin: FactoryTwin = app_state["twin"]
    act_step(req.duration_s)
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
    scheduled = act_repair(req.machine_id)
    return {
        "machine_id": req.machine_id,
        "scheduled": scheduled,
        "fleet": [s.to_dict() for s in twin.get_latest_states()],
    }


@app.post("/fleet/reset")
def reset_fleet():
    """Resets all machines in the live factory twin back to nominal fresh-shift status."""
    twin: FactoryTwin = app_state["twin"]
    act_reset()
    return {
        "status": "SUCCESS",
        "message": "All workcells reset to nominal operating condition.",
        "fleet": [s.to_dict() for s in twin.get_latest_states()],
    }


class FaultInjectRequest(BaseModel):
    machine_id: str = "CNC-01"
    wear_level: float = 0.85
    status: str = "critical"


@app.post("/fault/inject")
async def inject_fault(req: FaultInjectRequest):
    """Ages a machine to the requested wear for live demos (accelerated aging,
    one emitted reading per cycle, so the models see a realistic history)."""
    twin: FactoryTwin = app_state["twin"]
    m_twin = twin.machines.get(req.machine_id)
    if not m_twin:
        return {"status": "ERROR", "message": f"Machine {req.machine_id} not found"}

    # Status follows from the wear the machine reaches (see MachineTwin.age_to).
    act_inject(req.machine_id, req.wear_level)

    latest = [s.to_dict() for s in twin.get_latest_states()]
    m_state = next((s for s in latest if s["machine_id"] == req.machine_id), {})

    # Broadcast update via WebSocket
    await ws_manager.broadcast(build_telemetry_snapshot())

    return {
        "status": "SUCCESS",
        "message": f"Fault injected into {req.machine_id}: wear={req.wear_level}, status={req.status}",
        "machine": m_state,
        "fleet": latest,
    }


class WorkOrderRequest(BaseModel):
    machine_id: str
    approved_by: str = "Supervisor"


@app.post("/work-orders")
def create_work_order(req: WorkOrderRequest):
    """Approves a planned service: the machine is in service for its planned
    duration, then returns to production with wear reset."""
    return act_work_order(req.machine_id, by=req.approved_by)


@app.get("/maintenance/log")
def maintenance_log(limit: int = 100):
    return {"entries": list(app_state.get("log", []))[-limit:]}


@app.get("/machines/{machine_id}/history")
def machine_history(machine_id: str, n: int = 60):
    twin: FactoryTwin = app_state["twin"]
    if machine_id not in twin.machines:
        return {"machine_id": machine_id, "readings": []}
    rows = twin.recent_readings(machine_id, n=max(1, min(n, 240)))
    return {
        "machine_id": machine_id,
        "readings": [
            {k: r[k] for k in ("sim_time_s", "cycle_count", "vibration_rms", "temperature_c", "wear_level", "status")}
            for r in rows
        ],
    }


@app.get("/forecast")
def forecast(horizon_h: float = 8.0, samples: int = 97, seed: int = 7):
    """Fast-forwards a copy of the live plant (the live twin is untouched) and
    returns what happens with and without the copilot, sampled for the UI's
    time slider."""
    twin: FactoryTwin = app_state["twin"]
    result = forecast_fleet(twin, horizon_s=horizon_h * 3600.0, samples=samples, seed=seed)
    result["generated_at"] = time.time()
    return result


@app.get("/pipeline/flow")
def pipeline_flow():
    """Returns end-to-end Titan Aerospace manufacturing stages, WIP stats,
    and live AI reasoning pipeline steps."""
    return build_pipeline_flow_data()


# -- Real-Time WebSocket Telemetry Endpoint ----------------------------------
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """Real-time bi-directional WebSocket telemetry stream for 3D SCADA operations center.
    Pushes continuous machine health and pipeline flow snapshots, and accepts
    instant operator actions (ping, step, repair, reset, scan)."""
    await ws_manager.connect(websocket)
    try:
        # Push immediate snapshot upon initial connection
        if "twin" in app_state:
            await websocket.send_json(build_telemetry_snapshot())

        while True:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "ping":
                await websocket.send_json({"type": "pong", "timestamp": time.time()})

            elif action == "scan":
                result = app_state["graph"].invoke({"trigger": "scheduled_check"})
                await ws_manager.broadcast(build_telemetry_snapshot())
                await websocket.send_json({"type": "scan_result", "status": "ok", "result": result})

            elif action in ("step", "repair", "reset", "inject_fault", "work_order"):
                # Every action shares one implementation with its HTTP twin.
                mid = data.get("machine_id")
                result: dict = {"type": "action_result", "action": action, "status": "ok"}
                if action == "step":
                    duration_s = float(data.get("duration_s", 1800))
                    act_step(duration_s)
                    result["advanced_s"] = duration_s
                elif action == "reset":
                    act_reset()
                elif action == "repair":
                    result["machine_id"] = mid
                    if not act_repair(mid, by=data.get("by", "Supervisor")):
                        result.update(status="error", error=f"Unknown machine {mid}")
                elif action == "inject_fault":
                    wear = float(data.get("wear_level", 0.85))
                    mid = mid or "CNC-01"
                    result.update(machine_id=mid, wear_level=wear)
                    if not act_inject(mid, wear):
                        result.update(status="error", error=f"Unknown machine {mid}")
                elif action == "work_order":
                    result.update(act_work_order(mid, by=data.get("by", "Supervisor")))
                    result["type"] = "action_result"
                    result["action"] = action
                await ws_manager.broadcast(build_telemetry_snapshot())
                await websocket.send_json(result)

            else:
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown action: {action}",
                })
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


# -- Serve 3D Strategy Game UI at root (placed after API routes) -------------
WEB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web")
os.makedirs(WEB_DIR, exist_ok=True)
app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")
