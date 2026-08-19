"""
Shared LangGraph state schema.

Every node in the graph reads from and writes to this single TypedDict.
Keeping it flat and explicit (rather than a free-form message list) makes
the flow easy to trace: you can print the state after any node and see
exactly what each agent contributed.
"""
from __future__ import annotations

from typing import TypedDict, Optional


class CopilotState(TypedDict, total=False):
    # -- inputs --
    trigger: str  # "scheduled_check" | "operator_query"
    operator_question: Optional[str]

    # -- Monitor Agent output --
    fleet_snapshot: list[dict]
    anomalies: list[dict]
    rul_predictions: list[dict]
    flagged_machine_ids: list[str]

    # -- Diagnosis Agent output --
    diagnoses: list[dict]  # [{machine_id, likely_cause, sop_sources, recommended_action}]

    # -- Scheduler Agent output --
    maintenance_decisions: list[dict]  # [{machine_id, action, scheduled, reason}]

    # -- Orchestrator output --
    final_report: str
