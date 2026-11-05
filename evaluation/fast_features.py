"""NumPy version of ml_pipeline.features.add_engineered_features for one
machine's current life. Used inside the policy simulation, where pandas would
be far too slow to call every 30 simulated seconds. A unit test checks that it
matches the pandas version exactly."""
from __future__ import annotations

import numpy as np


def life_features(vib: np.ndarray, temp: np.ndarray, age: np.ndarray, window: int = 5) -> np.ndarray:
    """Rows: readings of one life in time order. Columns follow
    OBSERVABLE_ENGINEERED_COLUMNS."""
    n = len(vib)
    vdiff = np.diff(vib, prepend=vib[:1])
    tdiff = np.diff(temp, prepend=temp[:1])
    rmean = np.empty(n)
    rstd = np.zeros(n)
    for i in range(n):
        w = vib[max(0, i - window + 1): i + 1]
        rmean[i] = w.mean()
        rstd[i] = w.std(ddof=1) if len(w) > 1 else 0.0
    return np.column_stack([vib, temp, vdiff, tdiff, rmean, rstd, age]).astype(np.float32)
