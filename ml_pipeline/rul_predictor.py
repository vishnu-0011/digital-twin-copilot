"""
Remaining Useful Life (RUL) Prediction
=======================================
Implements the 2021 PHM Competition Winning Strategy:
- Dilated 1D Temporal Convolutional Network (TCN)
- Variable-Length Historical Sequences
- Degradation-Aware Sampling
- Piecewise Linear Target Transformation (label_rul_piecewise)
- Zero Feature Leakage (Observable sensors only: vibration, temperature, dynamics)

Includes an automatic fallback to gradient boosting (XGBoost/HistGradientBoosting)
for maximum deployment portability.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import torch

from ml_pipeline.features import (
    OBSERVABLE_ENGINEERED_COLUMNS,
    add_engineered_features,
    label_rul_piecewise,
)

try:
    from ml_pipeline.tcn_model import TCNPredictor
    _TCN_AVAILABLE = True
except ImportError:
    _TCN_AVAILABLE = False

try:
    from xgboost import XGBRegressor
    _test = XGBRegressor(n_estimators=1)
    _XGB_BACKEND = "xgboost"
except Exception:
    from sklearn.ensemble import HistGradientBoostingRegressor as XGBRegressor
    _XGB_BACKEND = "sklearn_hgb"

FEATURE_COLUMNS = OBSERVABLE_ENGINEERED_COLUMNS
label_rul = label_rul_piecewise


class RULPredictor:
    def __init__(self, prefer_tcn: bool = True):
        self.use_tcn = prefer_tcn and _TCN_AVAILABLE
        self.tcn_model = TCNPredictor() if self.use_tcn else None

        self.xgb_model = (
            XGBRegressor(n_estimators=200, max_depth=4, learning_rate=0.05)
            if _XGB_BACKEND == "xgboost"
            else XGBRegressor(max_depth=4, learning_rate=0.05)
        )
        self.backend = "tcn_2021" if self.use_tcn else _XGB_BACKEND
        self.is_fitted = False

    def fit(self, labeled_df: pd.DataFrame, epochs: int = 15):
        # Prepare engineered observable features
        df = (
            labeled_df
            if all(c in labeled_df.columns for c in FEATURE_COLUMNS)
            else add_engineered_features(labeled_df)
        )

        # 1. Fit secondary gradient boosting model
        X = df[FEATURE_COLUMNS]
        y = df["rul_cycles"]
        self.xgb_model.fit(X, y)

        # 2. Fit 2021 winning Dilated TCN model if available
        if self.use_tcn and self.tcn_model:
            try:
                self.tcn_model.fit(df, epochs=epochs)
            except Exception as e:
                print(f"[RULPredictor] TCN training encountered {e}; falling back to {_XGB_BACKEND}")
                self.use_tcn = False

        self.is_fitted = True
        return self

    def predict(self, df: pd.DataFrame) -> np.ndarray:
        inp = (
            df
            if all(c in df.columns for c in FEATURE_COLUMNS)
            else add_engineered_features(df)
        )

        if self.use_tcn and self.tcn_model and self.tcn_model.is_fitted:
            # Format rows as sequence slices per machine
            sequences = []
            for _, g in inp.groupby("machine_id", sort=False):
                g_sorted = g.sort_values("cycle_count")
                feat = g_sorted[FEATURE_COLUMNS].values.astype(np.float32)
                sequences.append(torch.tensor(feat, dtype=torch.float32))

            if sequences:
                return self.tcn_model.predict_sequences(sequences)

        preds = self.xgb_model.predict(inp[FEATURE_COLUMNS])
        return np.clip(preds, 0, None)

    def predict_latest(
        self,
        latest_states: list[dict],
        history_df: pd.DataFrame | None = None,
        max_history_window: int = 20,
    ) -> list[dict]:
        """
        Predicts RUL for the current fleet.
        If `history_df` is provided, constructs recent temporal sequence windows
        for each machine to feed the 2021 Dilated ConvNet.
        """
        df_latest = pd.DataFrame(latest_states)
        if df_latest.empty:
            return []

        if self.use_tcn and self.tcn_model and self.tcn_model.is_fitted and history_df is not None and not history_df.empty:
            # Build temporal sequence windows per machine
            feat_hist = add_engineered_features(history_df)
            sequences = []
            for state in latest_states:
                mid = state["machine_id"]
                m_hist = feat_hist[feat_hist["machine_id"] == mid].sort_values("cycle_count")
                # Take the most recent window up to max_history_window
                window = m_hist.tail(max_history_window)
                if len(window) > 0:
                    seq_vals = window[FEATURE_COLUMNS].values.astype(np.float32)
                    sequences.append(torch.tensor(seq_vals, dtype=torch.float32))
                else:
                    # Single state fallback
                    s_df = add_engineered_features(pd.DataFrame([state]))
                    seq_vals = s_df[FEATURE_COLUMNS].values.astype(np.float32)
                    sequences.append(torch.tensor(seq_vals, dtype=torch.float32))

            preds = self.tcn_model.predict_sequences(sequences)
            df_latest["predicted_rul_cycles"] = [round(float(p), 1) for p in preds]
        else:
            # Snapshot fallback using gradient boosting
            df_feat = add_engineered_features(df_latest)
            preds = self.xgb_model.predict(df_feat[FEATURE_COLUMNS])
            df_latest["predicted_rul_cycles"] = [round(float(max(0.0, p)), 1) for p in preds]

        return df_latest.to_dict(orient="records")


if __name__ == "__main__":
    from digital_twin.simulator import FactoryTwin

    print("Running Factory Twin to generate run-to-failure sequences...")
    twin = FactoryTwin()
    twin.run(duration_s=20000)
    history = twin.history_dataframe()

    labeled = label_rul(history)
    print(f"Labeled rows: {len(labeled)}")

    predictor = RULPredictor(prefer_tcn=True).fit(labeled, epochs=10)
    print(f"Active Backend: {predictor.backend}")

    latest = twin.get_latest_states()
    scored = predictor.predict_latest([s.to_dict() for s in latest], history_df=history)
    for s in scored:
        print(f"Machine: {s['machine_id']} | Status: {s['status']} | Predicted RUL: {s['predicted_rul_cycles']} cycles")
