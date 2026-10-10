import unittest
import torch
import numpy as np
import pandas as pd

from ml_pipeline.tcn_model import (
    TemporalBlock,
    TemporalConvNet,
    TCNRemainingLifeModel,
    TCNPredictor,
    create_variable_sequences,
)
from ml_pipeline.rul_predictor import RULPredictor
from ml_pipeline.features import label_rul_piecewise


class TestTCNArchitecture(unittest.TestCase):
    def test_temporal_block_causality(self):
        # Batch=2, Channels=8, SeqLen=10
        x = torch.randn(2, 8, 10)
        block = TemporalBlock(in_channels=8, out_channels=16, kernel_size=3, dilation=2)
        out = block(x)
        # Sequence length must be preserved exactly
        self.assertEqual(out.shape, (2, 16, 10))

    def test_tcn_model_forward(self):
        # Input: (batch=4, seq_len=15, in_features=7)
        x = torch.randn(4, 15, 7)
        model = TCNRemainingLifeModel(in_features=7, num_channels=[16, 32, 16])
        out = model(x)
        # Output should be (batch=4,)
        self.assertEqual(out.shape, (4,))
        # Non-negative RUL
        self.assertTrue((out >= 0).all())

    def test_variable_sequences_sampling(self):
        # Create synthetic runs
        records = []
        for mid in ["M1", "M2"]:
            for c in range(40):
                records.append({
                    "machine_id": mid,
                    "cycle_count": c,
                    "vibration_rms": 0.5 + 0.05 * c,
                    "temperature_c": 38.0 + 0.3 * c,
                    "wear_level": c / 39.0,
                })
        df = label_rul_piecewise(pd.DataFrame(records), max_rul=50.0)
        seqs, targets = create_variable_sequences(df, min_seq_len=5, max_seq_len=20)
        self.assertGreater(len(seqs), 0)
        self.assertEqual(len(seqs), len(targets))

    def test_tcn_predictor_fit_predict(self):
        records = []
        for mid in ["M1", "M2"]:
            for c in range(35):
                records.append({
                    "machine_id": mid,
                    "cycle_count": c,
                    "vibration_rms": 0.5 + 0.08 * c,
                    "temperature_c": 38.0 + 0.4 * c,
                    "wear_level": c / 34.0,
                })
        df = label_rul_piecewise(pd.DataFrame(records), max_rul=30.0)

        predictor = RULPredictor(prefer_tcn=True)
        predictor.fit(df, epochs=5)
        self.assertTrue(predictor.is_fitted)
        self.assertEqual(predictor.backend, "tcn_2021")

        latest_states = [
            {"machine_id": "M1", "cycle_count": 30, "vibration_rms": 2.8, "temperature_c": 50.0, "status": "warning"},
            {"machine_id": "M2", "cycle_count": 5, "vibration_rms": 0.6, "temperature_c": 39.0, "status": "healthy"},
        ]
        results = predictor.predict_latest(latest_states, history_df=df)
        self.assertEqual(len(results), 2)
        for r in results:
            self.assertIn("predicted_rul_cycles", r)
            self.assertGreaterEqual(r["predicted_rul_cycles"], 0.0)


if __name__ == "__main__":
    unittest.main()
