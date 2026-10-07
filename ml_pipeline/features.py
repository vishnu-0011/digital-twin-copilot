"""
Feature Engineering & Piecewise Target Transformation
======================================================
Implements:
1. Observable Feature Extraction:
   Real factory sensors cannot measure internal microscopic wear during operation.
   We eliminate `wear_level` from input features and derive dynamic signals:
   - vibration_diff: rate of vibration change per cycle (instantaneous acceleration)
   - temperature_diff: rate of temperature rise per cycle
   - vibration_roll_mean: smoothed vibration energy over rolling window
   - vibration_roll_std: vibration volatility/impulse indicator over rolling window
2. 2021 Competition Winning Piecewise Linear RUL Target:
   During early healthy cycles, equipment shows zero wear signals. Training a model
   to distinguish between e.g. 300 vs 280 cycles creates noisy gradients.
   Capping early-life target RUL at `max_rul` (e.g. 100 cycles) forces the model to
   focus capacity strictly on the active degradation trajectory.
"""
from __future__ import annotations

import pandas as pd
import numpy as np

# Observable sensor signals available on a factory line (Zero Feature Leakage)
OBSERVABLE_BASE_COLUMNS = ["vibration_rms", "temperature_c", "cycle_count"]

OBSERVABLE_ENGINEERED_COLUMNS = [
    "vibration_rms",
    "temperature_c",
    "vibration_diff",
    "temperature_diff",
    "vibration_roll_mean",
    "vibration_roll_std",
    "cycle_count",
]


def add_engineered_features(df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
    """Computes rate-of-change and rolling temporal statistics per machine."""
    out = df.copy()
    if "machine_id" not in out.columns:
        out["machine_id"] = "DEFAULT_MACHINE"

    out = out.sort_values(["machine_id", "cycle_count"]).reset_index(drop=True)

    # First-order differences (wear velocity / acceleration proxy)
    out["vibration_diff"] = (
        out.groupby("machine_id")["vibration_rms"]
        .diff()
        .fillna(0.0)
    )
    out["temperature_diff"] = (
        out.groupby("machine_id")["temperature_c"]
        .diff()
        .fillna(0.0)
    )

    # Rolling window statistics (trend and volatility)
    out["vibration_roll_mean"] = (
        out.groupby("machine_id")["vibration_rms"]
        .transform(lambda s: s.rolling(window, min_periods=1).mean())
    )
    out["vibration_roll_std"] = (
        out.groupby("machine_id")["vibration_rms"]
        .transform(lambda s: s.rolling(window, min_periods=1).std())
        .fillna(0.0)
    )

    return out


def label_rul_piecewise(
    history_df: pd.DataFrame,
    max_rul: float = 100.0,
    failure_wear_threshold: float = 0.999,
) -> pd.DataFrame:
    """
    Computes remaining cycles until failure for each machine run,
    and applies piecewise linear target clipping at `max_rul`.
    Rows after failure are dropped.
    """
    if history_df.empty:
        return history_df

    labeled = []
    for machine_id, g in history_df.groupby("machine_id"):
        g = g.sort_values("cycle_count").reset_index(drop=True)
        # Find index where failure occurred
        failure_indices = g.index[g["wear_level"] >= failure_wear_threshold]
        if len(failure_indices) == 0:
            # If no machine reached failure threshold, use the final observed cycle as lower bound
            last_idx = len(g) - 1
        else:
            last_idx = failure_indices[0]

        last_cycle = g.loc[last_idx, "cycle_count"]
        # Keep up to failure point
        valid_g = g.loc[:last_idx].copy()

        # Raw remaining cycles
        raw_rul = last_cycle - valid_g["cycle_count"]

        # 2021 Competition winning piecewise clipping:
        valid_g["rul_cycles"] = np.minimum(raw_rul.values, max_rul)
        labeled.append(valid_g)

    if not labeled:
        return pd.DataFrame()

    return pd.concat(labeled, ignore_index=True)
