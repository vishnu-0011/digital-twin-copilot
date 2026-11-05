"""
Model evaluation on the digital twin
====================================
Scores the trained models on plants they never saw (different random seeds
from the training plant, seed 42).

Remaining life (RUL)
  * TCN: the deployed model, fed the last 20 readings of the current life.
  * Gradient boosting: the snapshot model trained alongside (one reading).
  * Fleet-average life: the "no model" baseline a planner could use from
    maintenance records: average life of this machine type minus the age of
    the part. Uses no sensor data at all.
  Scored on readings in the wear phase (true RUL < 100, the capped range),
  which is where scheduling decisions are made.

Anomaly detection
  * Isolation Forest (deployed) versus a fixed ISO 10816 zone-C threshold.
  * The detector's job is to notice that wear has started (point P), so the
    ground truth is wear >= 0.25 (the twin's DEGRADING level). Recall on
    clearly worn readings (wear >= 0.6) is reported too.
  * Alert lead time: cycles between the first alert in a life and that
    life's failure. More lead = more time to plan.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from evaluation.metrics import binary_report, mae, nasa_score, rmse
from ml_pipeline.features import add_engineered_features
from ml_pipeline.rul_predictor import FEATURE_COLUMNS, label_rul
from ml_pipeline.training_data import operating_rows, simulate_history

TEST_SEEDS = (1234, 2024, 31337)
TEST_DURATION_S = 12000
WINDOW = 20
TRAIN_SEED, TRAIN_DURATION_S = 42, 30000


def _fleet_average_life() -> dict:
    """Mean life (cycles) per machine type, from the TRAINING plant only."""
    labeled = label_rul(simulate_history(TRAIN_SEED, TRAIN_DURATION_S), max_rul=1e9)
    lives = labeled.groupby(["machine_id", "life"])["cycles_since_service"].max()
    return lives.groupby(level=0).mean().to_dict()


def _windows(labeled: pd.DataFrame):
    """(features window, last row) for every wear-phase reading with enough history."""
    feats = add_engineered_features(labeled)
    out = []
    for _, g in feats.groupby(["machine_id", "life"]):
        g = g.sort_values("cycles_since_service").reset_index(drop=True)
        X = g[FEATURE_COLUMNS].values.astype(np.float32)
        for end in range(3, len(g) + 1):
            row = g.iloc[end - 1]
            if row["rul_cycles"] < 100:
                out.append((X[max(0, end - WINDOW):end], row))
    return out


def evaluate_rul(predictor) -> dict:
    import torch

    avg_life = _fleet_average_life()
    truth, p_tcn, p_gb, p_avg, ids = [], [], [], [], []
    for seed in TEST_SEEDS:
        labeled = label_rul(simulate_history(seed, TEST_DURATION_S))
        win = _windows(labeled)
        seqs = [torch.tensor(w) for w, _ in win]
        p_tcn.extend(predictor.tcn_model.predict_sequences(seqs))
        last = pd.DataFrame([r for _, r in win])
        p_gb.extend(np.clip(predictor.xgb_model.predict(last[FEATURE_COLUMNS]), 0, None))
        for _, r in win:
            p_avg.append(float(np.clip(avg_life[r["machine_id"]] - r["cycles_since_service"], 0, 100)))
            truth.append(float(r["rul_cycles"]))
            ids.append(r["machine_id"])

    truth = np.array(truth)
    models = {
        "TCN (deployed)": np.minimum(np.array(p_tcn), 100),
        "Gradient boosting (one reading)": np.minimum(np.array(p_gb), 100),
        "Fleet-average life (no sensors)": np.array(p_avg),
    }
    table = []
    for name, p in models.items():
        table.append({"model": name, "mae": round(mae(p, truth), 2), "rmse": round(rmse(p, truth), 2),
                      "nasa_score_per_window": round(nasa_score(p, truth) / len(truth), 3)})

    tcn = models["TCN (deployed)"]
    err = tcn - truth
    buckets = []
    for lo, hi in ((0, 25), (25, 50), (50, 75), (75, 100)):
        sel = (truth >= lo) & (truth < hi)
        if sel.any():
            buckets.append({"range": f"{lo}-{hi}", "mae": round(float(np.mean(np.abs(err[sel]))), 2),
                            "bias": round(float(np.mean(err[sel])), 2), "n": int(sel.sum())})
    m = mae(tcn, truth)
    rng = np.random.default_rng(0)
    pick = rng.choice(len(truth), size=min(400, len(truth)), replace=False)
    return {
        "test_plants": list(TEST_SEEDS),
        "windows": int(len(truth)),
        "table": table,
        "tcn_by_true_rul": buckets,
        "band": {
            "mae": round(m, 2),
            "coverage_of_pm_mae": round(float(np.mean(np.abs(err) <= m)), 3),
            "p90_abs_error": round(float(np.quantile(np.abs(err), 0.9)), 2),
            "late_share": round(float(np.mean(err > 0)), 3),
        },
        "scatter": [[round(float(truth[i]), 1), round(float(tcn[i]), 1)] for i in pick],
    }


def evaluate_anomaly(detector) -> dict:
    from digital_twin.standards import zone_c_threshold

    rows = []
    lead_if, lead_iso = [], []
    for seed in TEST_SEEDS:
        hist = simulate_history(seed, TEST_DURATION_S)
        hist = add_engineered_features(hist)  # adds the per-life index
        failed = hist[hist["wear_level"] >= 0.999]
        fail_age = failed.groupby(["machine_id", "life"])["cycles_since_service"].min().to_dict()
        op = operating_rows(hist).copy()
        scored = detector.score(op)
        op["flag_if"] = scored["is_anomaly"].values
        op["flag_iso"] = op["vibration_rms"] >= zone_c_threshold()
        rows.append(op)
        for key, g in op.groupby(["machine_id", "life"]):
            if key not in fail_age:
                continue  # this life did not end in a failure inside the run
            fa = fail_age[key]
            for col, sink in (("flag_if", lead_if), ("flag_iso", lead_iso)):
                # First alert once wear is under way (very early false alarms
                # are reported separately and would inflate the lead time).
                hits = g.loc[g[col] & (g["wear_level"] >= 0.15), "cycles_since_service"]
                sink.append(float(fa - hits.min()) if len(hits) else 0.0)
    df = pd.concat(rows)
    actual = df["wear_level"] >= 0.25
    worn = df["wear_level"] >= 0.6
    healthy = df["wear_level"] < 0.25
    out = {}
    for name, col, leads in (("Isolation Forest (deployed)", "flag_if", lead_if),
                             ("ISO 10816 zone C threshold", "flag_iso", lead_iso)):
        rep = binary_report(df[col], actual)
        rep["false_alarm_rate_healthy"] = round(float(df.loc[healthy, col].mean()), 4)
        rep["recall_worn"] = round(float(df.loc[worn, col].mean()), 3)
        rep["median_lead_cycles"] = round(float(np.median(leads)), 1) if leads else None
        rep["lives"] = len(leads)
        out[name] = rep
    return {"readings": int(len(df)), "positive_share": round(float(actual.mean()), 3), "models": out}
