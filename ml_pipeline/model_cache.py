"""
Trained-model cache
===================
Training the TCN takes over a minute on a laptop CPU, which made every server
start look broken. The trained detector and RUL predictor are pickled to
`.model_cache/` and reused on the next start.

The cache key is a hash of the source files that shape training (simulator,
features, models) plus the training parameters and library versions, so
editing any of them retrains automatically. Set TWIN_RETRAIN=1 to force it.
"""
from __future__ import annotations

import hashlib
import json
import os
import pickle
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = Path(os.environ.get("TWIN_MODEL_CACHE", ROOT / ".model_cache"))

_SOURCES = [
    "ml_pipeline/training_data.py",
    "digital_twin/simulator.py",
    "digital_twin/models.py",
    "ml_pipeline/features.py",
    "ml_pipeline/anomaly_detector.py",
    "ml_pipeline/rul_predictor.py",
    "ml_pipeline/tcn_model.py",
]


def _fingerprint(params: dict) -> str:
    import sklearn
    import torch

    h = hashlib.sha256()
    for rel in _SOURCES:
        h.update(rel.encode())
        h.update((ROOT / rel).read_bytes())
    h.update(json.dumps(params, sort_keys=True).encode())
    h.update(f"torch={torch.__version__};sklearn={sklearn.__version__}".encode())
    return h.hexdigest()[:16]


def _seed_everything(seed: int):
    import random

    import numpy as np
    import torch

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def evaluate_rul(predictor, seed: int = 1234, duration_s: float = 12000) -> dict:
    """Scores the RUL model on a run-to-failure history it never saw.

    Returns the mean absolute error (cycles) over windows in the degradation
    phase (true RUL < 100) and the spread of predictions, which catches a
    collapsed model that predicts one constant everywhere.
    """
    import numpy as np
    import torch

    from ml_pipeline.features import add_engineered_features
    from ml_pipeline.rul_predictor import FEATURE_COLUMNS, label_rul
    from ml_pipeline.training_data import simulate_history

    labeled = add_engineered_features(label_rul(simulate_history(seed, duration_s)))
    seqs, truth = [], []
    for _, g in labeled.groupby(["machine_id", "life"]):
        g = g.sort_values("cycles_since_service")
        feats = g[FEATURE_COLUMNS].values.astype(np.float32)
        rul = g["rul_cycles"].values
        for end in range(20, len(g) + 1, 5):
            if rul[end - 1] < 100:
                seqs.append(torch.tensor(feats[end - 20:end]))
                truth.append(rul[end - 1])
    if not seqs:
        return {"mae_cycles": None, "pred_std": None, "windows": 0}
    if predictor.use_tcn and predictor.tcn_model and predictor.tcn_model.is_fitted:
        preds = predictor.tcn_model.predict_sequences(seqs)
    else:
        import pandas as pd
        preds = np.clip(predictor.xgb_model.predict(pd.DataFrame([s[-1].numpy() for s in seqs], columns=FEATURE_COLUMNS)), 0, None)
    truth = np.array(truth)
    return {
        "mae_cycles": round(float(np.mean(np.abs(preds - truth))), 1),
        "rmse_cycles": round(float(np.sqrt(np.mean((preds - truth) ** 2))), 1),
        "pred_std": round(float(np.std(preds)), 1),
        "windows": len(seqs),
    }


def _train(seed: int, duration_s: float, log=print):
    from ml_pipeline.anomaly_detector import AnomalyDetector
    from ml_pipeline.rul_predictor import RULPredictor, label_rul
    from ml_pipeline.training_data import operating_rows, simulate_history

    history = simulate_history(seed, duration_s)
    # The detector learns what normal running looks like, so it is fitted on
    # readings from running machines, not on broken or stopped ones.
    detector = AnomalyDetector().fit(operating_rows(history))

    # A healthy model spreads its predictions across the 0-100 range. Retry
    # with a new seed if training collapsed to a near-constant output.
    for attempt in range(3):
        _seed_everything(seed + attempt)
        predictor = RULPredictor().fit(label_rul(history))
        metrics = evaluate_rul(predictor)
        log(f"[models] RUL holdout: MAE {metrics['mae_cycles']} cycles, prediction spread {metrics['pred_std']}")
        if metrics["pred_std"] is None or metrics["pred_std"] > 5.0:
            break
        log("[models] RUL model collapsed to a constant; retraining")
    predictor.holdout_metrics = metrics
    return detector, predictor


def load_or_train(seed: int = 42, duration_s: float = 30000, log=print):
    """Returns (detector, predictor, source) where source is 'cache' or 'trained'."""
    key = _fingerprint({"seed": seed, "duration_s": duration_s})
    path = CACHE_DIR / f"models-{key}.pkl"

    if path.exists() and os.environ.get("TWIN_RETRAIN") != "1":
        try:
            with path.open("rb") as f:
                bundle = pickle.load(f)
            log(f"[models] loaded cached models ({path.name})")
            return bundle["detector"], bundle["predictor"], "cache"
        except Exception as e:  # corrupt or incompatible cache: retrain
            log(f"[models] cache unreadable ({e}); retraining")

    log("[models] training models (first run, about two minutes)...")
    detector, predictor = _train(seed, duration_s, log=log)
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        for old in CACHE_DIR.glob("models-*.pkl"):
            old.unlink(missing_ok=True)
        tmp = path.with_suffix(".tmp")
        with tmp.open("wb") as f:
            pickle.dump({"detector": detector, "predictor": predictor}, f)
        os.replace(tmp, path)
        log(f"[models] cached to {path}")
    except OSError as e:
        log(f"[models] could not write cache ({e}); continuing")
    return detector, predictor, "trained"
