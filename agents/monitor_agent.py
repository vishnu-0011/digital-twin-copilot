"""
Monitor Agent
=============
Purely mechanical, no LLM call needed here — it pulls the latest twin
snapshot, runs it through the anomaly detector and RUL predictor, and
flags any machine that needs attention. This keeps cost/latency down by
reserving LLM calls for the Diagnosis and Orchestrator agents, where
natural-language reasoning actually adds value.

A flagged machine is one that is either:
  - statistically anomalous (Isolation Forest), or
  - predicted to fail within `rul_alert_threshold_cycles`, or
  - already in WARNING / CRITICAL / FAILED status
"""
from __future__ import annotations

from digital_twin.simulator import FactoryTwin
from ml_pipeline.anomaly_detector import AnomalyDetector
from ml_pipeline.rul_predictor import RULPredictor
from agents.state import CopilotState
from agents.tools import get_fleet_state, detect_anomalies, predict_remaining_life

ALERT_STATUSES = {"warning", "critical", "failed"}
RUL_ALERT_THRESHOLD_CYCLES = 50


def build_monitor_node(twin: FactoryTwin, detector: AnomalyDetector, predictor: RULPredictor):
    """Returns a LangGraph node function closed over the twin + fitted models."""

    def monitor_node(state: CopilotState) -> CopilotState:
        fleet_snapshot = get_fleet_state(twin)
        anomalies = detect_anomalies(twin, detector)
        rul_predictions = predict_remaining_life(twin, predictor)

        rul_by_machine = {r["machine_id"]: r["predicted_rul_cycles"] for r in rul_predictions}
        anomaly_by_machine = {a["machine_id"]: a["is_anomaly"] for a in anomalies}

        flagged = []
        for m in fleet_snapshot:
            mid = m["machine_id"]
            is_status_alert = m["status"] in ALERT_STATUSES
            is_anomalous = anomaly_by_machine.get(mid, False)
            is_low_rul = rul_by_machine.get(mid, float("inf")) < RUL_ALERT_THRESHOLD_CYCLES
            if is_status_alert or is_anomalous or is_low_rul:
                flagged.append(mid)

        return {
            **state,
            "fleet_snapshot": fleet_snapshot,
            "anomalies": anomalies,
            "rul_predictions": rul_predictions,
            "flagged_machine_ids": flagged,
        }

    return monitor_node
