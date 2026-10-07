import unittest
import pandas as pd
import numpy as np

from ml_pipeline.features import (
    add_engineered_features,
    label_rul_piecewise,
    OBSERVABLE_ENGINEERED_COLUMNS,
)


class TestFeatureEngineering(unittest.TestCase):
    def setUp(self):
        # Create a mock run-to-failure trajectory for 2 machines
        records = []
        for mid in ["CNC-01", "PRESS-01"]:
            for cycle in range(50):
                wear = cycle / 49.0  # reaches 1.0 at cycle 49
                records.append({
                    "machine_id": mid,
                    "cycle_count": cycle,
                    "wear_level": wear,
                    "vibration_rms": 0.5 + 4.0 * (wear ** 1.8),
                    "temperature_c": 38.0 + 35.0 * (wear ** 1.5),
                })
        self.mock_df = pd.DataFrame(records)

    def test_add_engineered_features(self):
        featured = add_engineered_features(self.mock_df, window=5)
        for col in OBSERVABLE_ENGINEERED_COLUMNS:
            self.assertIn(col, featured.columns, f"Expected column {col} in featured dataframe")

        # Verify no NaN values
        self.assertFalse(featured[OBSERVABLE_ENGINEERED_COLUMNS].isna().any().any())

        # Verify rate of change calculation
        # Cycle 0 diff should be 0.0
        m1_c0 = featured[(featured["machine_id"] == "CNC-01") & (featured["cycle_count"] == 0)]
        self.assertEqual(m1_c0["vibration_diff"].iloc[0], 0.0)

        # Later cycle diff should be positive as vibration climbs
        m1_c10 = featured[(featured["machine_id"] == "CNC-01") & (featured["cycle_count"] == 10)]
        self.assertGreater(m1_c10["vibration_diff"].iloc[0], 0.0)

    def test_label_rul_piecewise(self):
        max_rul = 20.0
        labeled = label_rul_piecewise(self.mock_df, max_rul=max_rul, failure_wear_threshold=0.99)
        self.assertIn("rul_cycles", labeled.columns)

        # Total cycles is 50 (cycles 0 to 49). Failure is at cycle 49.
        # At cycle 0, raw_rul = 49 - 0 = 49. With max_rul=20, it should be capped at 20.
        c0 = labeled[labeled["cycle_count"] == 0]
        self.assertTrue((c0["rul_cycles"] == 20.0).all())

        # At cycle 39, raw_rul = 49 - 39 = 10. Below max_rul=20, so rul_cycles should be 10.
        c39 = labeled[labeled["cycle_count"] == 39]
        self.assertTrue((c39["rul_cycles"] == 10.0).all())

        # At failure cycle 49, rul_cycles should be 0.
        c49 = labeled[labeled["cycle_count"] == 49]
        self.assertTrue((c49["rul_cycles"] == 0.0).all())


if __name__ == "__main__":
    unittest.main()
