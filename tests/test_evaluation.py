"""Tests for the evaluation suite and the data fixes it relies on."""
import unittest

import numpy as np
import pandas as pd

from digital_twin.simulator import FactoryTwin
from evaluation.fast_features import life_features
from evaluation.metrics import binary_report, nasa_score, rmse
from ml_pipeline.features import OBSERVABLE_ENGINEERED_COLUMNS, add_engineered_features, label_rul_piecewise
from ml_pipeline.training_data import operating_rows, simulate_history


class TestMetrics(unittest.TestCase):
    def test_nasa_score_penalises_late_more_than_early(self):
        self.assertEqual(nasa_score([10], [10]), 0.0)
        late, early = nasa_score([20], [10]), nasa_score([0], [10])
        self.assertGreater(late, early)
        self.assertAlmostEqual(late, np.exp(1.0) - 1.0)
        self.assertAlmostEqual(early, np.exp(10 / 13) - 1.0)

    def test_rmse_and_binary_report(self):
        self.assertAlmostEqual(rmse([1, 3], [1, 1]), np.sqrt(2))
        rep = binary_report([1, 1, 0, 0], [1, 0, 1, 0])
        self.assertEqual((rep["tp"], rep["fp"], rep["fn"], rep["tn"]), (1, 1, 1, 1))
        self.assertEqual(rep["precision"], 0.5)


class TestLifeAwareData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.hist = simulate_history(seed=7, duration_s=9000)

    def test_cycles_since_service_resets_but_cycle_count_does_not(self):
        g = self.hist[self.hist["machine_id"] == "CONV-01"]
        self.assertTrue((g["cycles_since_service"].diff() < 0).any(), "auto-repair should start new lives")
        self.assertTrue((g["cycle_count"].diff().fillna(0) >= 0).all())

    def test_labels_are_per_life_and_skip_stopped_rows(self):
        lab = label_rul_piecewise(self.hist)
        lives_per_machine = lab.groupby("machine_id")["life"].nunique()
        self.assertGreaterEqual(lives_per_machine.max(), 2, "a repaired machine contributes several lives")
        self.assertFalse(lab["status"].eq("in_maintenance").any())
        # RUL counts down to 0 at the failure reading of every life
        last = lab.sort_values("cycles_since_service").groupby(["machine_id", "life"]).tail(1)
        self.assertTrue((last["rul_cycles"] == 0).all())

    def test_age_feature_replaces_lifetime_counter(self):
        self.assertIn("cycles_since_service", OBSERVABLE_ENGINEERED_COLUMNS)
        self.assertNotIn("cycle_count", OBSERVABLE_ENGINEERED_COLUMNS)
        self.assertNotIn("wear_level", OBSERVABLE_ENGINEERED_COLUMNS)

    def test_fast_features_match_pandas(self):
        feats = add_engineered_features(operating_rows(self.hist))
        g = feats[(feats["machine_id"] == "CNC-01") & (feats["life"] == 0)].sort_values("cycles_since_service")
        fast = life_features(g["vibration_rms"].values, g["temperature_c"].values, g["cycles_since_service"].values)
        np.testing.assert_allclose(fast, g[OBSERVABLE_ENGINEERED_COLUMNS].values.astype(np.float32), rtol=1e-5, atol=1e-5)


class TestPolicies(unittest.TestCase):
    def test_fixed_interval_services_before_failure(self):
        from digital_twin.forecast import _simulate

        twin = FactoryTwin(seed=3)
        intervals = {mid: 0.5 / m.config.wear_rate_mean for mid, m in twin.machines.items()}
        out = _simulate(twin, 4 * 3600, 2, "fixed_interval", seed=3, interval_cycles=intervals)
        self.assertGreater(out["summary"]["planned_services"], 0)
        self.assertEqual(out["summary"]["breakdowns"], 0)
        self.assertLess(out["summary"]["mean_wear_at_service"], 0.7)

    def test_model_policy_uses_estimator(self):
        from digital_twin.forecast import _simulate

        twin = FactoryTwin(seed=3)
        calls = []

        def always_low(machines, readings):
            calls.append(len(machines))
            return {mid: 0.0 for mid in machines}

        out = _simulate(twin, 1800, 2, "copilot", seed=3, rul_estimator=always_low)
        self.assertTrue(calls)
        self.assertGreater(out["summary"]["planned_services"], 0)


class TestAnomalyReference(unittest.TestCase):
    def test_detector_learns_healthy_envelope(self):
        from ml_pipeline.anomaly_detector import AnomalyDetector

        hist = operating_rows(simulate_history(seed=11, duration_s=9000))
        det = AnomalyDetector().fit(hist)
        scored = det.score(hist)
        worn = scored[scored["wear_level"] >= 0.6]
        fresh = scored[scored["wear_level"] < 0.1]
        self.assertGreater(worn["is_anomaly"].mean(), 0.95)
        self.assertLess(fresh["is_anomaly"].mean(), 0.05)


if __name__ == "__main__":
    unittest.main()
