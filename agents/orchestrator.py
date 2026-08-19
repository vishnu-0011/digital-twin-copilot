"""
Orchestrator
============
Wires Monitor -> Diagnosis -> Scheduler -> Report into a LangGraph.

TRAINING DATA: uses `ml_pipeline.data_source` to pick training data
automatically — real datasets if you've dropped them into data/, twin-
generated data otherwise. See data_source.py for the exact detection rules.

The LIVE monitoring feed (what the Monitor Agent watches each cycle) is
always the digital twin — that's the "factory floor" this system watches
in real time. Only the *training* data for the ML models is swappable.

Run standalone:
    python -m agents.orchestrator
"""
from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()  # reads .env in the project root and sets ANTHROPIC_API_KEY etc.

from langgraph.graph import StateGraph, END

from digital_twin.simulator import FactoryTwin
from ml_pipeline.anomaly_detector import AnomalyDetector
from ml_pipeline.rul_predictor import RULPredictor
from ml_pipeline.data_source import get_anomaly_training_data, get_rul_training_data
from rag.knowledge_base import MaintenanceKnowledgeBase
from agents.state import CopilotState
from agents.monitor_agent import build_monitor_node
from agents.diagnosis_agent import build_diagnosis_node
from agents.scheduler_agent import build_scheduler_node


def _route_after_monitor(state: CopilotState) -> str:
    return "diagnosis" if state.get("flagged_machine_ids") else "report"


def build_report_node():
    def report_node(state: CopilotState) -> CopilotState:
        flagged = state.get("flagged_machine_ids", [])
        if not flagged:
            return {**state, "final_report": "Fleet check complete. No anomalies detected."}

        lines = [f"Fleet check complete. {len(flagged)} machine(s) flagged:\n"]
        decisions_by_machine = {d["machine_id"]: d for d in state.get("maintenance_decisions", [])}
        for diagnosis in state.get("diagnoses", []):
            mid = diagnosis["machine_id"]
            decision = decisions_by_machine.get(mid, {})
            lines.append(
                f"• {mid} ({diagnosis['machine_type']}) — urgency: {diagnosis['urgency']}\n"
                f"    Cause: {diagnosis['likely_cause']}\n"
                f"    Action: {diagnosis['recommended_action']}\n"
                f"    Decision: {decision.get('action', 'n/a')}"
                f"{' (maintenance triggered)' if decision.get('scheduled') else ''}\n"
                f"    Grounded in: {', '.join(diagnosis.get('sop_sources', [])) or 'n/a'}\n"
            )
        return {**state, "final_report": "\n".join(lines)}

    return report_node


def build_copilot_graph(twin: FactoryTwin, detector: AnomalyDetector, predictor: RULPredictor, kb: MaintenanceKnowledgeBase):
    graph = StateGraph(CopilotState)
    graph.add_node("monitor", build_monitor_node(twin, detector, predictor))
    graph.add_node("diagnosis", build_diagnosis_node(twin, kb))
    graph.add_node("scheduler", build_scheduler_node(twin))
    graph.add_node("report", build_report_node())
    graph.set_entry_point("monitor")
    graph.add_conditional_edges("monitor", _route_after_monitor, {"diagnosis": "diagnosis", "report": "report"})
    graph.add_edge("diagnosis", "scheduler")
    graph.add_edge("scheduler", "report")
    graph.add_edge("report", END)
    return graph.compile()


def train_models() -> tuple[AnomalyDetector, RULPredictor]:
    """Trains both ML models using whatever data_source.py selects —
    real dataset if dropped into data/, twin-generated data otherwise.
    Prints which source was used for each model so it's never ambiguous."""
    anomaly_df, anomaly_source = get_anomaly_training_data()
    detector = AnomalyDetector().fit(anomaly_df)

    rul_df, rul_source = get_rul_training_data()
    predictor = RULPredictor().fit(rul_df)

    print(f"\nModels trained — anomaly detector: [{anomaly_source}], RUL predictor: [{rul_source}]\n")
    return detector, predictor


def run_copilot_cycle(check_duration_s: float = 5000): #1800
    print("Training ML models (see data_source selection above)...")
    detector, predictor = train_models()

    print("Ingesting maintenance SOPs into RAG knowledge base...")
    kb = MaintenanceKnowledgeBase()
    kb.ingest_directory()

    print(f"Starting live digital twin and advancing {check_duration_s}s...")
    twin = FactoryTwin()
    twin.run(duration_s=check_duration_s)

    print("Running agent graph...\n")
    app = build_copilot_graph(twin, detector, predictor, kb)
    result = app.invoke({"trigger": "scheduled_check"})

    print(result["final_report"])
    return result


if __name__ == "__main__":
    run_copilot_cycle()