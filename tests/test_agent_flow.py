import unittest
import pandas as pd

from digital_twin.simulator import FactoryTwin
from ml_pipeline.anomaly_detector import AnomalyDetector
from ml_pipeline.rul_predictor import RULPredictor, label_rul
from rag.knowledge_base import MaintenanceKnowledgeBase
from agents.state import CopilotState
from agents.monitor_agent import build_monitor_node
from agents.diagnosis_agent import build_diagnosis_node
from agents.scheduler_agent import build_scheduler_node


class TestAgentFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Setup small digital twin and train models
        cls.twin = FactoryTwin(seed=42)
        cls.twin.run(duration_s=6000)
        history = cls.twin.history_dataframe()

        cls.detector = AnomalyDetector().fit(history)
        cls.predictor = RULPredictor(prefer_tcn=True).fit(label_rul(history), epochs=3)

        cls.kb = MaintenanceKnowledgeBase()
        cls.kb.ingest_directory()

    def test_end_to_end_agent_execution_zero_api_keys(self):
        # 1. Run Monitor Node
        monitor_node = build_monitor_node(self.twin, self.detector, self.predictor)
        state: CopilotState = {"trigger": "scheduled_check"}
        state = monitor_node(state)

        self.assertIn("fleet_snapshot", state)
        self.assertIn("anomalies", state)
        self.assertIn("rul_predictions", state)
        self.assertIn("flagged_machine_ids", state)

        # 2. Run Diagnosis Node (Pure ML, zero external calls)
        diagnosis_node = build_diagnosis_node(self.twin, self.kb)
        state = diagnosis_node(state)
        self.assertIn("diagnoses", state)

        # 3. Run Scheduler Node (Asymmetric safety factor)
        scheduler_node = build_scheduler_node(self.twin)
        state = scheduler_node(state)
        self.assertIn("maintenance_decisions", state)

        # Verify scheduler decisions have safe_rul_cycles
        for decision in state["maintenance_decisions"]:
            self.assertIn("safe_rul_cycles", decision)
            self.assertIn("action", decision)


if __name__ == "__main__":
    unittest.main()
