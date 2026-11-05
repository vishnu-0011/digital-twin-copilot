"""Metrics used across the evaluation suite."""
from __future__ import annotations

import numpy as np


def rmse(pred, true) -> float:
    pred, true = np.asarray(pred, float), np.asarray(true, float)
    return float(np.sqrt(np.mean((pred - true) ** 2)))


def mae(pred, true) -> float:
    pred, true = np.asarray(pred, float), np.asarray(true, float)
    return float(np.mean(np.abs(pred - true)))


def nasa_score(pred, true) -> float:
    """Asymmetric scoring function from the PHM08 challenge (Saxena et al., 2008).

    d = predicted - true. Late predictions (d > 0) are penalised more than
    early ones, because predicting failure too late is the dangerous error.
    Lower is better; it is a sum, so it grows with the number of engines.
    """
    d = np.asarray(pred, float) - np.asarray(true, float)
    return float(np.sum(np.where(d < 0, np.exp(-d / 13.0) - 1.0, np.exp(d / 10.0) - 1.0)))


def binary_report(flagged, actual) -> dict:
    flagged, actual = np.asarray(flagged, bool), np.asarray(actual, bool)
    tp = int(np.sum(flagged & actual))
    fp = int(np.sum(flagged & ~actual))
    fn = int(np.sum(~flagged & actual))
    tn = int(np.sum(~flagged & ~actual))
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {"tp": tp, "fp": fp, "fn": fn, "tn": tn,
            "precision": round(precision, 3), "recall": round(recall, 3), "f1": round(f1, 3)}


def mean_sd(values) -> dict:
    v = np.asarray(values, float)
    return {"mean": round(float(v.mean()), 2), "sd": round(float(v.std(ddof=1)) if len(v) > 1 else 0.0, 2),
            "n": int(len(v))}
