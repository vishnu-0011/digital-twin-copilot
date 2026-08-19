"""
Data Source Selector
=====================
This is the piece that makes "just drop a CSV in and run" work. Auto-detects
which training data to use, per model:

  ANOMALY DETECTOR needs: vibration_rms, temperature_c, wear_level (snapshot
  data — AI4I 2020 fits this shape).

  RUL PREDICTOR needs: those same columns PLUS a real time-series-to-failure
  per machine (C-MAPSS fits this shape; AI4I 2020 does NOT, since it's
  cross-sectional, not longitudinal).

Detection priority (checked in this order):
  1. Explicit override: set env var DATA_SOURCE=twin | ai4i2020 | cmapss
  2. Auto-detect: if data/ai4i2020.csv exists, anomaly detector uses it.
     If data/train_FD001.txt exists, RUL predictor uses it.
  3. Fallback: anything not covered by 1/2 uses twin-generated data.

You can mix sources — e.g. drop in only ai4i2020.csv, and the anomaly
detector will use real data while the RUL predictor still falls back to
the twin, since AI4I isn't suitable for RUL anyway.

USAGE — literally just place a file and re-run:
    data/ai4i2020.csv      -> anomaly detector trains on real AI4I data
    data/train_FD001.txt   -> RUL predictor trains on real C-MAPSS data
No code changes, no flags required. See README section "Using a real
dataset" for exact download links and file placement.
"""
from __future__ import annotations

import os
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
AI4I_PATH = os.path.join(DATA_DIR, "ai4i2020.csv")
CMAPSS_PATH = os.path.join(DATA_DIR, "train_FD001.txt")

# Cache so we only ever spin up ONE throwaway twin per process, even if
# both the anomaly detector and RUL predictor need twin fallback data.
_twin_cache: dict = {}


def _get_twin_data(warmup_s: float = 20000):
    if "history" not in _twin_cache:
        from digital_twin.simulator import FactoryTwin
        from ml_pipeline.rul_predictor import label_rul

        twin = FactoryTwin()
        twin.run(duration_s=warmup_s)
        history = twin.history_dataframe()
        _twin_cache["history"] = history
        _twin_cache["labeled"] = label_rul(history)
    return _twin_cache["history"], _twin_cache["labeled"]


def get_anomaly_training_data() -> tuple[pd.DataFrame, str]:
    """Returns (dataframe, source_name) ready for AnomalyDetector().fit()."""
    override = os.environ.get("DATA_SOURCE", "").lower()

    use_ai4i = override == "ai4i2020" or (override == "" and os.path.exists(AI4I_PATH))
    if use_ai4i:
        from ml_pipeline.loaders.load_ai4i2020 import load_ai4i2020
        print(f"[data_source] Anomaly detector: using real AI4I 2020 data ({AI4I_PATH})")
        return load_ai4i2020(AI4I_PATH), "ai4i2020"

    if override not in ("", "twin"):
        raise ValueError(f"Unknown DATA_SOURCE override for anomaly detector: {override!r}")

    print("[data_source] Anomaly detector: using twin-generated data (no dataset found in data/)")
    history, _ = _get_twin_data()
    return history, "twin"


def get_rul_training_data() -> tuple[pd.DataFrame, str]:
    """Returns (labeled_dataframe, source_name) ready for RULPredictor().fit()."""
    override = os.environ.get("DATA_SOURCE", "").lower()

    use_cmapss = override == "cmapss" or (override == "" and os.path.exists(CMAPSS_PATH))
    if use_cmapss:
        from ml_pipeline.loaders.load_cmapss import load_cmapss, label_rul_cmapss
        print(f"[data_source] RUL predictor: using real NASA C-MAPSS data ({CMAPSS_PATH})")
        return label_rul_cmapss(load_cmapss(CMAPSS_PATH)), "cmapss"

    if override not in ("", "twin"):
        raise ValueError(f"Unknown DATA_SOURCE override for RUL predictor: {override!r}")

    print("[data_source] RUL predictor: using twin-generated data (no dataset found in data/)")
    _, labeled = _get_twin_data()
    return labeled, "twin"