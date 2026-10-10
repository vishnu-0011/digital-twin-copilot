"""
Scheduler Agent
================
Takes the Diagnosis Agent's urgency ratings and decides what to actually do:
  - "high" urgency  -> schedule maintenance immediately (calls the twin's
    schedule_maintenance tool, which really does interrupt the machine)
  - "medium" urgency -> log a recommendation for the next planning cycle,
    don't interrupt production yet
  - "low" urgency    -> log only, no action

Deliberately rule-based rather than another LLM call: scheduling logic
should be deterministic and auditable, not subject to prompt-dependent
variation. This is also where you'd plug in production-schedule awareness
(e.g. don't pull a machine mid-batch) in a real deployment.
"""
from __future__ import annotations

from digital_twin.simulator import FactoryTwin
from agents.state import CopilotState
from agents.tools import schedule_maintenance

URGENCY_ACTION_MAP = {
    "high": "schedule_now",
    "medium": "recommend_next_cycle",
    "low": "log_only",
}

# 2021 Competition Winning Strategy: Asymmetric Industrial Risk Margin
# Overestimating RUL causes catastrophic tooling crashes. We apply a 15% safety buffer.
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
            if action == "schedule_now":
                result = schedule_maintenance(
                    twin, machine_id, reason=diagnosis.get("likely_cause", "")
                )
                scheduled = result["scheduled"]

            decisions.append({
                "machine_id": machine_id,
                "action": action,
                "scheduled": scheduled,
                "urgency": urgency,
                "safe_rul_cycles": round(safe_rul, 1),
                "reason": diagnosis.get("likely_cause", ""),
            })

        return {**state, "maintenance_decisions": decisions}

    return scheduler_node
