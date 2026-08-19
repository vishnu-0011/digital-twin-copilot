"""
Agent Tools ("skills")
========================
Every function here is a tool an agent node can call. Keeping them as plain
Python functions (rather than burying them inside agent classes) means they
can be unit tested independently of any LLM, and reused across the Monitor,
Diagnosis, and Scheduler agents.
"""
from __future__ import annotations

from digital_twin.simulator import FactoryTwin
from ml_pipeline.anomaly_detector import AnomalyDetector
from ml_pipeline.rul_predictor import RULPredictor, label_rul
from rag.knowledge_base import MaintenanceKnowledgeBase


def get_machine_state(twin: FactoryTwin, machine_id: str) -> dict | None:
    """Tool: returns the latest known state for one machine."""
    state = twin.latest_state.get(machine_id)
    return state.to_dict() if state else None


def get_fleet_state(twin: FactoryTwin) -> list[dict]:
    """Tool: returns the latest state for every machine in the fleet."""
    return [s.to_dict() for s in twin.get_latest_states()]


def detect_anomalies(twin: FactoryTwin, detector: AnomalyDetector) -> list[dict]:
    """Tool: scores the current fleet snapshot for anomalies. Assumes
    `detector` has already been fit on twin history (see agents/orchestrator.py)."""
    states = get_fleet_state(twin)
    if not states:
        return []
    return detector.score_latest(states)


def predict_remaining_life(twin: FactoryTwin, predictor: RULPredictor) -> list[dict]:
    """Tool: predicts remaining-useful-life (in cycles) for every machine
    currently running. Assumes `predictor` has already been fit."""
    states = get_fleet_state(twin)
    if not states:
        return []
    return predictor.predict_latest(states)


def lookup_sop_guidance(kb: MaintenanceKnowledgeBase, symptom_description: str, machine_type: str) -> list[dict]:
    """Tool: RAG lookup — retrieves relevant SOP text for a described
    symptom on a given machine type. This is what grounds the Diagnosis
    Agent's explanation instead of letting it hallucinate a root cause."""
    return kb.retrieve(symptom_description, machine_type=machine_type, k=3)


def schedule_maintenance(twin: FactoryTwin, machine_id: str, reason: str) -> dict:
    """Tool: the Scheduler Agent's action tool. Actually interrupts the
    machine's run loop in the twin and triggers a maintenance event."""
    scheduled = twin.schedule_maintenance(machine_id)
    return {
        "machine_id": machine_id,
        "scheduled": scheduled,
        "reason": reason,
    }


def run_what_if_simulation(fleet_config=None, duration_s: float = 3600, seed: int = 7) -> dict:
    """Tool: spins up an independent, throwaway twin to answer 'what if'
    questions (e.g. different fleet config, longer horizon) without
    disturbing the live/primary twin instance."""
    sandbox = FactoryTwin(fleet=fleet_config, seed=seed)
    sandbox.run(duration_s=duration_s)
    return {
        "final_states": [s.to_dict() for s in sandbox.get_latest_states()],
        "total_telemetry_points": len(sandbox.history),
        "duration_simulated_s": duration_s,
    }
