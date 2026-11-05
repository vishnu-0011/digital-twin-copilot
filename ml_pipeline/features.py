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
2. Piecewise-linear RUL target (common practice on C-MAPSS since Heimes 2008):
   During early healthy cycles, equipment shows zero wear signals. Training a model
   to distinguish between e.g. 300 vs 280 cycles creates noisy gradients.
   Capping early-life target RUL at `max_rul` (e.g. 100 cycles) forces the model to
   focus capacity strictly on the active degradation trajectory.
"""
from __future__ import annotations

import pandas as pd
import numpy as np

# Observable sensor signals available on a factory line (no feature leakage).
# `cycles_since_service` is the age of the current part: a real plant knows it
# from its maintenance log. The lifetime `cycle_count` is NOT used as an input,
# because it keeps growing across services and would tell the model nothing
# about the part that is actually wearing.
OBSERVABLE_BASE_COLUMNS = ["vibration_rms", "temperature_c", "cycles_since_service"]

OBSERVABLE_ENGINEERED_COLUMNS = [
    "vibration_rms",
    "temperature_c",
    "vibration_diff",
    "temperature_diff",
    "vibration_roll_mean",
    "vibration_roll_std",
    "cycles_since_service",
]

# Rows that are not normal operation: a stopped machine produces no useful
# wear signal (it is either broken or being serviced).
NON_OPERATING_STATUSES = ("failed", "in_maintenance")


def _with_life_index(df: pd.DataFrame) -> pd.DataFrame:
    """Adds `cycles_since_service` (if missing) and a per-machine `life` index
    that increments every time a service resets the part's age."""
    out = df
    if "cycles_since_service" not in out.columns:
        # Single-life data (unit tests, C-MAPSS engines): age = cycle count.
        out = out.assign(cycles_since_service=out["cycle_count"])
    if "life" not in out.columns:
        reset = out.groupby("machine_id")["cycles_since_service"].diff().fillna(0) < 0
        out = out.assign(life=reset.astype(int).groupby(out["machine_id"]).cumsum())
    return out


def add_engineered_features(df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
    """Computes rate-of-change and rolling temporal statistics per machine and
    per life, so a service never shows up as a huge negative 'trend'."""
    out = df.copy()
    if "machine_id" not in out.columns:
        out["machine_id"] = "DEFAULT_MACHINE"

    sort_cols = ["machine_id", "sim_time_s"] if "sim_time_s" in out.columns else ["machine_id", "cycle_count"]
    out = out.sort_values(sort_cols, kind="stable").reset_index(drop=True)
    out = _with_life_index(out)
    keys = [out["machine_id"], out["life"]]

    out["vibration_diff"] = out.groupby(keys)["vibration_rms"].diff().fillna(0.0)
    out["temperature_diff"] = out.groupby(keys)["temperature_c"].diff().fillna(0.0)
    out["vibration_roll_mean"] = out.groupby(keys)["vibration_rms"].transform(
        lambda s: s.rolling(window, min_periods=1).mean()
    )
    out["vibration_roll_std"] = out.groupby(keys)["vibration_rms"].transform(
        lambda s: s.rolling(window, min_periods=1).std()
    ).fillna(0.0)
    return out


def label_rul_piecewise(
    history_df: pd.DataFrame,
    max_rul: float = 100.0,
    failure_wear_threshold: float = 0.999,
) -> pd.DataFrame:
    """
    Labels every operating reading with the cycles left until that part's
    failure, capped at `max_rul` (piecewise-linear target).

    Works per life: a machine that was repaired three times contributes three
    run-to-failure trajectories. Lives that ended in a planned service before
    failing are dropped, because their true failure time is unknown
    (right-censored). Readings taken while a machine was stopped are dropped.
    """
    if history_df.empty:
        return history_df

    df = history_df
    sort_cols = ["machine_id", "sim_time_s"] if "sim_time_s" in df.columns else ["machine_id", "cycle_count"]
    df = _with_life_index(df.sort_values(sort_cols, kind="stable").reset_index(drop=True))
    if "status" in df.columns:
        stopped = df["status"].isin(NON_OPERATING_STATUSES) & (df["wear_level"] < failure_wear_threshold)
        df = df[~stopped]

    labeled = []
    for _, g in df.groupby(["machine_id", "life"], sort=False):
        g = g.reset_index(drop=True)
        failure_indices = g.index[g["wear_level"] >= failure_wear_threshold]
        if len(failure_indices) == 0:
            if "status" in g.columns:
                continue  # censored life: it never reached failure
            last_idx = len(g) - 1  # synthetic single-life data without status
        else:
            last_idx = failure_indices[0]

        valid_g = g.loc[:last_idx].copy()
        last_age = valid_g["cycles_since_service"].iloc[-1]
        raw_rul = last_age - valid_g["cycles_since_service"]
        valid_g["rul_cycles"] = np.minimum(raw_rul.values, max_rul)
        labeled.append(valid_g)

    if not labeled:
        return pd.DataFrame()

    return pd.concat(labeled, ignore_index=True)
