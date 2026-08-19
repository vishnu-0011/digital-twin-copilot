"""
AI4I 2020 Predictive Maintenance Dataset Loader
=================================================
Source: https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset
Download `ai4i2020.csv` from that page and place it at: data/ai4i2020.csv

WHAT THIS IS GOOD FOR: anomaly detection (`ml_pipeline/anomaly_detector.py`).
Each row is an independent snapshot of a distinct machine, NOT a time series
of the same machine over many cycles — so it does NOT have the longitudinal
structure `rul_predictor.py`'s `label_rul()` needs (that requires repeated
readings of the same unit approaching failure). For RUL training, use
`load_cmapss.py` instead.

Column mapping (AI4I -> project schema):
    Product ID              -> machine_id
    Tool wear [min]          -> wear_level (normalized 0-1 by max observed)
    Process temperature [K]  -> temperature_c (converted from Kelvin)
    Torque [Nm]               -> vibration_rms (proxy — AI4I has no vibration
                                 sensor column; torque is the closest
                                 available signal that varies with mechanical
                                 stress. Flagged clearly as a proxy, not a
                                 real vibration reading.)
    UDI                       -> cycle_count
    Machine failure           -> is_anomaly (ground truth, for evaluation)
"""
from __future__ import annotations

import os
import pandas as pd

REQUIRED_COLUMNS = [
    "UDI", "Product ID", "Tool wear [min]", "Process temperature [K]",
    "Torque [Nm]", "Machine failure",
]


def load_ai4i2020(csv_path: str = "data/ai4i2020.csv") -> pd.DataFrame:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Couldn't find {csv_path}. Download ai4i2020.csv from "
            "https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset "
            f"and place it at {csv_path}."
        )

    df = pd.read_csv(csv_path)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"CSV is missing expected columns: {missing}. Is this the right file?")

    max_wear = df["Tool wear [min]"].max()

    out = pd.DataFrame({
        "machine_id": df["Product ID"],
        "cycle_count": df["UDI"],
        "wear_level": df["Tool wear [min]"] / max_wear if max_wear > 0 else 0.0,
        "temperature_c": df["Process temperature [K]"] - 273.15,
        "vibration_rms": df["Torque [Nm]"] / df["Torque [Nm]"].max() * 5.0,  # rescaled proxy
        "ground_truth_failure": df["Machine failure"].astype(bool),
    })
    return out


if __name__ == "__main__":
    from ml_pipeline.anomaly_detector import AnomalyDetector

    df = load_ai4i2020()
    print(f"Loaded {len(df)} rows from AI4I 2020.")
    print(df.head())

    detector = AnomalyDetector(contamination=df["ground_truth_failure"].mean()).fit(df)
    scored = detector.score(df)

    # Quick sanity check against the real failure labels
    agreement = (scored["is_anomaly"] == scored["ground_truth_failure"]).mean()
    print(f"\nAnomaly flag vs. real failure label agreement: {agreement:.1%}")
