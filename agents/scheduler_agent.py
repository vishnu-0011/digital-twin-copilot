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


def build_scheduler_node(twin: FactoryTwin):
    def scheduler_node(state: CopilotState) -> CopilotState:
        decisions = []
        for diagnosis in state.get("diagnoses", []):
            machine_id = diagnosis["machine_id"]
            urgency = diagnosis.get("urgency", "medium")
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
                "reason": diagnosis.get("likely_cause", ""),
            })

        return {**state, "maintenance_decisions": decisions}

    return scheduler_node
