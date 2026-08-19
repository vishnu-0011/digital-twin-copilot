"""
Remaining Useful Life (RUL) Prediction
=======================================
Regresses "cycles remaining until failure" from current telemetry, using
gradient boosting (XGBoost if available, sklearn's HistGradientBoosting as a
zero-extra-dependency fallback). Trained on labeled runs from the digital
twin: since we control the simulation, we know the true failure point of
every run and can compute ground-truth RUL for supervised training — this
is the "generate your own labels from the twin" pattern that lets you skip
needing a real historical failure dataset.

If you want to swap in a public benchmark instead of twin-generated data,
NASA C-MAPSS follows the same schema shape (per-unit sensor readings +
cycle count + RUL label) and this predictor's interface won't need to change.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

try:
    from xgboost import XGBRegressor
    _BACKEND = "xgboost"
except ImportError:
    from sklearn.ensemble import HistGradientBoostingRegressor as XGBRegressor
    _BACKEND = "sklearn_hgb"

FEATURE_COLUMNS = ["vibration_rms", "temperature_c", "wear_level", "cycle_count"]


def label_rul(history_df: pd.DataFrame) -> pd.DataFrame:
    """Adds a `rul_cycles` column: cycles remaining until that machine's
    wear_level first hits 1.0 in this run. Rows after failure are dropped."""
    labeled = []
    for machine_id, g in history_df.groupby("machine_id"):
        g = g.sort_values("cycle_count").reset_index(drop=True)
        failure_idx = g.index[g["wear_level"] >= 0.999]
        if len(failure_idx) == 0:
            # Never failed within the simulated window — skip, no ground truth.
            continue
        last_cycle = g.loc[failure_idx[0], "cycle_count"]
        g = g.loc[: failure_idx[0]].copy()
        g["rul_cycles"] = last_cycle - g["cycle_count"]
        labeled.append(g)
    if not labeled:
        raise ValueError(
            "No machine reached failure in this simulation window — "
            "run the twin for longer (increase duration_s) before training RUL."
        )
    return pd.concat(labeled, ignore_index=True)


class RULPredictor:
    def __init__(self):
        self.model = XGBRegressor(
            n_estimators=200, max_depth=4, learning_rate=0.05
        ) if _BACKEND == "xgboost" else XGBRegressor(max_depth=4, learning_rate=0.05)
        self.backend = _BACKEND

    def fit(self, labeled_df: pd.DataFrame):
        X = labeled_df[FEATURE_COLUMNS]
        y = labeled_df["rul_cycles"]
        self.model.fit(X, y)
        return self

    def predict(self, df: pd.DataFrame) -> np.ndarray:
        preds = self.model.predict(df[FEATURE_COLUMNS])
        return np.clip(preds, 0, None)

    def predict_latest(self, latest_states: list[dict]) -> list[dict]:
        df = pd.DataFrame(latest_states)
        df["predicted_rul_cycles"] = self.predict(df)
        return df.to_dict(orient="records")


if __name__ == "__main__":
    from digital_twin.simulator import FactoryTwin

    # Run long enough that machines actually fail (needed for RUL labels)
    twin = FactoryTwin()
    twin.run(duration_s=20000)
    history = twin.history_dataframe()

    labeled = label_rul(history)
    print(f"Backend: {_BACKEND} | Labeled rows: {len(labeled)}")

    predictor = RULPredictor().fit(labeled)
    sample = labeled.sample(min(5, len(labeled)), random_state=1)
    sample["predicted_rul"] = predictor.predict(sample)
    print(sample[["machine_id", "cycle_count", "wear_level", "rul_cycles", "predicted_rul"]])
