"""
Scheduler Agent
================
Takes the Diagnosis Agent's urgency ratings and decides what to do:
  - "high" urgency   -> draft a work order for a supervisor to approve
  - "medium" urgency -> recommend it for the next planning cycle
  - "low" urgency    -> log only

Human in the loop by default: the copilot never stops a machine on its own.
The supervisor approves the drafted work order in the UI (POST /work-orders).
A lights-out cell can opt into autonomy with COPILOT_AUTONOMY=1, in which case
high-urgency work orders are executed immediately.

Urgency is escalated to "high" when the safety-adjusted remaining life
(0.85 x predicted RUL) drops below 30 cycles. The 15% margin is there
because a late prediction (failure before the service) costs far more than
an early one; the evaluation suite measures how often predictions are late.

Deliberately rule-based: scheduling should be deterministic and auditable.
"""
from __future__ import annotations

import os

from digital_twin.simulator import FactoryTwin
from agents.state import CopilotState
from agents.tools import schedule_maintenance

URGENCY_ACTION_MAP = {
    "high": "draft_work_order",
    "medium": "recommend_next_cycle",
    "low": "log_only",
}

# Asymmetric risk margin: over-estimating remaining life is the dangerous error.
ASYMMETRIC_SAFETY_FACTOR = 0.85
CRITICAL_RUL_THRESHOLD = 30.0


def build_scheduler_node(twin: FactoryTwin):
    def scheduler_node(state: CopilotState) -> CopilotState:
        decisions = []
        rul_by_id = {
            r["machine_id"]: r.get("predicted_rul_cycles", 100.0)
            for r in state.get("rul_predictions", [])
        }

        for diagnosis in state.get("diagnoses", []):
            machine_id = diagnosis["machine_id"]
            raw_urgency = diagnosis.get("urgency", "medium")

            # Apply asymmetric risk margin to predicted RUL
            predicted_rul = float(rul_by_id.get(machine_id, 100.0))
            safe_rul = predicted_rul * ASYMMETRIC_SAFETY_FACTOR

            # Escalate urgency if safe RUL violates critical threshold
            if safe_rul < CRITICAL_RUL_THRESHOLD or raw_urgency == "high":
                urgency = "high"
            else:
                urgency = raw_urgency

            action = URGENCY_ACTION_MAP.get(urgency, "recommend_next_cycle")

            scheduled = False
            if action == "draft_work_order" and os.environ.get("COPILOT_AUTONOMY") == "1":
                result = schedule_maintenance(
                    twin, machine_id, reason=diagnosis.get("likely_cause", "")
                )
                scheduled = result["scheduled"]

            decisions.append({
                "machine_id": machine_id,
                "action": action,
                "scheduled": scheduled,
                "awaiting_approval": action == "draft_work_order" and not scheduled,
                "urgency": urgency,
                "safe_rul_cycles": round(safe_rul, 1),
                "reason": diagnosis.get("likely_cause", ""),
            })

        return {**state, "maintenance_decisions": decisions}

    return scheduler_node
