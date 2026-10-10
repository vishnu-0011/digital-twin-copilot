import unittest
from agents.diagnosis_agent import local_ml_diagnose


class TestLocalMLDiagnosis(unittest.TestCase):
    def test_cnc_mill_bearing_wear_diagnosis(self):
        telemetry = {
            "vibration_rms": 3.8,
            "temperature_c": 52.0,
            "status": "warning",
            "predicted_rul_cycles": 25.0,
        }
        sop_chunks = [{"text": "SOP Spindle bearing wear response...", "source": "cnc_mill_sop.md"}]

        diagnosis = local_ml_diagnose("CNC-01", "CNC_MILL", telemetry, sop_chunks)

        self.assertIn("likely_cause", diagnosis)
        self.assertIn("recommended_action", diagnosis)
        self.assertIn("bearing", diagnosis["likely_cause"].lower())
        self.assertEqual(diagnosis["urgency"], "high")  # RUL < 30
        self.assertEqual(diagnosis["confidence"], "high")

    def test_hydraulic_press_seal_degradation_diagnosis(self):
        telemetry = {
            "vibration_rms": 3.2,
            "temperature_c": 62.0,
            "status": "warning",
            "predicted_rul_cycles": 20.0,
        }
        sop_chunks = [{"text": "SOP Press seal degradation...", "source": "hydraulic_press_sop.md"}]

        diagnosis = local_ml_diagnose("PRESS-01", "HYDRAULIC_PRESS", telemetry, sop_chunks)

        self.assertIn("seal", diagnosis["likely_cause"].lower())
        self.assertEqual(diagnosis["urgency"], "high")

    def test_conveyor_diagnosis(self):
        telemetry = {
            "vibration_rms": 1.8,
            "temperature_c": 42.0,
            "status": "warning",
            "predicted_rul_cycles": 55.0,
        }
        sop_chunks = [{"text": "SOP Conveyor belt response...", "source": "conveyor_sop.md"}]

        diagnosis = local_ml_diagnose("CONV-01", "CONVEYOR", telemetry, sop_chunks)

        self.assertIn("belt", diagnosis["likely_cause"].lower())
        self.assertEqual(diagnosis["urgency"], "medium")


if __name__ == "__main__":
    unittest.main()
