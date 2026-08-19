"""
NASA C-MAPSS Turbofan Engine Degradation Dataset Loader
=========================================================
Source: https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data
(also mirrored on Kaggle — search "NASA Turbofan Jet Engine Data Set")

Download `train_FD001.txt` and place it at: data/train_FD001.txt
(FD001 is the simplest of the four sub-datasets — single operating
condition, single fault mode. Good starting point.)

WHAT THIS IS GOOD FOR: RUL prediction (`ml_pipeline/rul_predictor.py`).
Unlike AI4I 2020, this IS a proper time series — each engine (`unit_number`)
has many sequential cycle readings up to the cycle it failed at, so RUL
labels can be computed directly the same way `label_rul()` does for
twin-generated data: cycles_at_failure - current_cycle.

File format: space-separated, no header, 26 columns:
    unit_number, time_in_cycles, op_setting_1..3, sensor_1..21
"""
from __future__ import annotations

import os
import pandas as pd

COLUMN_NAMES = (
    ["unit_number", "time_in_cycles", "op_setting_1", "op_setting_2", "op_setting_3"]
    + [f"sensor_{i}" for i in range(1, 22)]
)

# Sensor 11 (HPC outlet static pressure) and sensor 4 (LPT outlet temp) are
# among the most correlated with degradation in C-MAPSS FD001; we use them
# as stand-ins for vibration_rms / temperature_c respectively. This is a
# simplification — a fuller model would use all 21 sensors as features.
VIBRATION_PROXY_COL = "sensor_11"
TEMPERATURE_PROXY_COL = "sensor_4"


def load_cmapss(txt_path: str = "data/train_FD001.txt") -> pd.DataFrame:
    if not os.path.exists(txt_path):
        raise FileNotFoundError(
            f"Couldn't find {txt_path}. Download train_FD001.txt from "
            "https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data "
            f"and place it at {txt_path}."
        )

    raw = pd.read_csv(txt_path, sep=r"\s+", header=None, names=COLUMN_NAMES)

    out = pd.DataFrame({
        "machine_id": "ENGINE-" + raw["unit_number"].astype(str),
        "cycle_count": raw["time_in_cycles"],
        "vibration_rms": raw[VIBRATION_PROXY_COL],
        "temperature_c": raw[TEMPERATURE_PROXY_COL],
    })

    # wear_level isn't directly present in C-MAPSS — approximate it as
    # each engine's fraction of the way through its own observed lifespan.
    # This mirrors what wear_level represents in the twin (0 = new, 1 = failed).
    max_cycle_per_unit = out.groupby("machine_id")["cycle_count"].transform("max")
    out["wear_level"] = out["cycle_count"] / max_cycle_per_unit

    return out


def label_rul_cmapss(df: pd.DataFrame) -> pd.DataFrame:
    """Same idea as ml_pipeline.rul_predictor.label_rul(), adapted for
    C-MAPSS's column names. Every engine in this dataset runs to failure by
    construction, so every row gets a real RUL label — no filtering needed."""
    labeled = df.copy()
    max_cycle_per_unit = labeled.groupby("machine_id")["cycle_count"].transform("max")
    labeled["rul_cycles"] = max_cycle_per_unit - labeled["cycle_count"]
    return labeled


if __name__ == "__main__":
    from ml_pipeline.rul_predictor import RULPredictor, FEATURE_COLUMNS

    df = load_cmapss()
    print(f"Loaded {len(df)} rows across {df['machine_id'].nunique()} engines.")

    labeled = label_rul_cmapss(df)
    print(labeled[["machine_id", "cycle_count", "wear_level", "rul_cycles"]].head())

    predictor = RULPredictor().fit(labeled)
    sample = labeled.sample(5, random_state=1)
    sample["predicted_rul"] = predictor.predict(sample)
    print("\n", sample[["machine_id", "cycle_count", "rul_cycles", "predicted_rul"]])
