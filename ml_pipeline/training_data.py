"""
Training and evaluation data from the digital twin
===================================================
One place that decides how simulated data is generated, so training, the
holdout check and the evaluation suite all see the same kind of data.

* `simulate_history` runs the twin with automatic repairs: a failed machine
  is repaired after 3x its planned service time (the same assumption the
  forecast uses), then starts a new life. A long run therefore yields many
  run-to-failure trajectories per machine, not one.
* Different seeds give independent plants. Training uses seed 42; the
  holdout check and the evaluation suite use other seeds, so the models are
  always scored on lives they never saw.
"""
from __future__ import annotations

import pandas as pd

from ml_pipeline.features import NON_OPERATING_STATUSES

REPAIR_DELAY_FACTOR = 3.0


def simulate_history(seed: int, duration_s: float, auto_repair: bool = True) -> pd.DataFrame:
    from digital_twin.simulator import FactoryTwin

    twin = FactoryTwin(seed=seed)
    if auto_repair:
        twin.enable_auto_repair(delay_factor=REPAIR_DELAY_FACTOR)
    twin.run(duration_s=duration_s)
    return twin.history_dataframe()


def operating_rows(history: pd.DataFrame) -> pd.DataFrame:
    """Readings from running machines only (not broken, not being serviced)."""
    if "status" not in history.columns:
        return history
    return history[~history["status"].isin(NON_OPERATING_STATUSES)]
