"""
Benchmark on NASA C-MAPSS (real benchmark data, not the twin)
=============================================================
The twin is our own simulator, so good scores on it prove little on their
own. This script trains the SAME TCN architecture (ml_pipeline/tcn_model.py)
on the public NASA C-MAPSS turbofan dataset and scores it on the official
test set, so the numbers can be compared with published work.

Protocol (the common one in the C-MAPSS literature):
  * sub-dataset FD003 by default (FD001 is used instead if train_FD001.txt is
    present in data/CMaps): one operating condition, two fault modes
  * drop sensors that are constant in training; min-max scale on train only
  * RUL target capped at 125 cycles; windows of 30 cycles
  * 20% of training engines held out for early stopping and learning-rate
    decay (the test set is never used for any choice)
  * test score = the last window of each of the 100 test engines, against the
    official RUL_FD00x.txt labels; RMSE and the PHM08 score
  * 3 training seeds, mean +/- sd

Baselines: ridge regression and a random forest on per-window summary
features (last value, mean and slope of each sensor).
"""
from __future__ import annotations

import os
import time

import numpy as np
import pandas as pd
import torch
import torch.nn as nn

from evaluation.metrics import mean_sd, nasa_score, rmse
from ml_pipeline.loaders.load_cmapss import COLUMN_NAMES
from ml_pipeline.tcn_model import TCNRemainingLifeModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "CMaps")
WINDOW = 30
RUL_CAP = 125
SEEDS = (0, 1, 2)

# Published FD001/FD003 RMSE, as reported in each paper (same capped-RUL protocol).
LITERATURE = {
    "FD001": [
        {"model": "CNN (Babu et al., 2016)", "rmse": 18.45},
        {"model": "LSTM (Zheng et al., 2017)", "rmse": 16.14},
        {"model": "Deep CNN (Li et al., 2018)", "rmse": 12.61},
    ],
    "FD003": [
        {"model": "CNN (Babu et al., 2016)", "rmse": 19.82},
        {"model": "LSTM (Zheng et al., 2017)", "rmse": 16.18},
        {"model": "Deep CNN (Li et al., 2018)", "rmse": 12.64},
    ],
}


def _subset() -> str:
    return "FD001" if os.path.exists(os.path.join(DATA, "train_FD001.txt")) else "FD003"


def _load(name: str):
    read = lambda f: pd.read_csv(os.path.join(DATA, f), sep=r"\s+", header=None, names=COLUMN_NAMES)
    train, test = read(f"train_{name}.txt"), read(f"test_{name}.txt")
    rul = pd.read_csv(os.path.join(DATA, f"RUL_{name}.txt"), sep=r"\s+", header=None)[0].values
    sensors = [c for c in COLUMN_NAMES if c.startswith("sensor_") and train[c].std() > 1e-3]
    lo, hi = train[sensors].min(), train[sensors].max()
    for df in (train, test):
        df[sensors] = (df[sensors] - lo) / (hi - lo + 1e-9)
    train["rul"] = (train.groupby("unit_number")["time_in_cycles"].transform("max") - train["time_in_cycles"]).clip(upper=RUL_CAP)
    return train, test, rul.clip(max=RUL_CAP), sensors


def _windows(df, sensors, last_only=False):
    X, y, units = [], [], []
    for u, g in df.groupby("unit_number"):
        a = g[sensors].values.astype(np.float32)
        if len(a) < WINDOW:  # pad short test engines with their first reading
            a = np.vstack([np.repeat(a[:1], WINDOW - len(a), 0), a])
        ends = [len(a)] if last_only else range(WINDOW, len(a) + 1)
        for e in ends:
            X.append(a[e - WINDOW:e])
            units.append(u)
            if "rul" in g:
                y.append(float(g["rul"].values[min(e, len(g)) - 1]))
    return np.stack(X), np.array(y, np.float32), np.array(units)


def _summary(X):
    t = np.arange(X.shape[1]) - (X.shape[1] - 1) / 2
    slope = (X * t[None, :, None]).sum(1) / (t ** 2).sum()
    return np.hstack([X[:, -1], X.mean(1), slope])


def _train_tcn(Xtr, ytr, Xva, yva, seed, log, max_epochs=80, patience=10, lr=5e-4):
    torch.manual_seed(seed)
    np.random.seed(seed)
    torch.set_num_threads(1)
    model = TCNRemainingLifeModel(in_features=Xtr.shape[2])
    nn.init.constant_(model.head[-1].bias, 60.0)
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    sched = torch.optim.lr_scheduler.ReduceLROnPlateau(opt, factor=0.5, patience=3)
    loss_fn = nn.MSELoss()
    Xt, yt = torch.from_numpy(Xtr), torch.from_numpy(ytr)
    Xv = torch.from_numpy(Xva)
    best, best_state, bad = 1e9, None, 0
    for ep in range(max_epochs):
        model.train()
        perm = torch.randperm(len(Xt))
        for i in range(0, len(Xt), 256):
            idx = perm[i:i + 256]
            opt.zero_grad()
            loss = loss_fn(model(Xt[idx]), yt[idx])
            loss.backward()
            opt.step()
        model.eval()
        with torch.no_grad():
            v = rmse(model(Xv).numpy(), yva)
        sched.step(v)
        if v < best - 1e-3:
            best, bad = v, 0
            best_state = {k: t.clone() for k, t in model.state_dict().items()}
        else:
            bad += 1
            if bad >= patience:
                break
    model.load_state_dict(best_state)
    log(f"[cmapss] TCN seed {seed}: best validation RMSE {best:.2f} after {ep + 1} epochs")
    return model


def run(log=print) -> dict:
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.linear_model import Ridge

    name = _subset()
    t0 = time.time()
    train, test, rul_test, sensors = _load(name)
    units = train["unit_number"].unique()
    rng = np.random.default_rng(0)
    val_units = set(rng.choice(units, size=max(1, len(units) // 5), replace=False))
    tr = train[~train["unit_number"].isin(val_units)]
    va = train[train["unit_number"].isin(val_units)]
    Xtr, ytr, _ = _windows(tr, sensors)
    Xva, yva, _ = _windows(va, sensors)
    Xte, _, _ = _windows(test, sensors, last_only=True)
    log(f"[cmapss] {name}: {len(sensors)} sensors, {len(Xtr)} training windows, {len(Xte)} test engines")

    results = []
    tcn_rmse, tcn_score, preds_keep = [], [], None
    for seed in SEEDS:
        model = _train_tcn(Xtr, ytr, Xva, yva, seed, log)
        with torch.no_grad():
            p = np.clip(model(torch.from_numpy(Xte)).numpy(), 0, RUL_CAP)
        tcn_rmse.append(rmse(p, rul_test))
        tcn_score.append(nasa_score(p, rul_test))
        if preds_keep is None:
            preds_keep = p
    results.append({"model": "TCN (this project, same architecture)", "rmse": mean_sd(tcn_rmse),
                    "score": mean_sd(tcn_score)})

    Str, Ste = _summary(np.vstack([Xtr, Xva])), _summary(Xte)
    ytrva = np.concatenate([ytr, yva])
    for label, est in (("Ridge regression (window summary)", Ridge(alpha=1.0)),
                       ("Random forest (window summary)", RandomForestRegressor(
                           n_estimators=200, max_depth=12, min_samples_leaf=5, n_jobs=-1, random_state=0))):
        p = np.clip(est.fit(Str, ytrva).predict(Ste), 0, RUL_CAP)
        results.append({"model": label, "rmse": {"mean": round(rmse(p, rul_test), 2), "sd": 0.0, "n": 1},
                        "score": {"mean": round(nasa_score(p, rul_test), 1), "sd": 0.0, "n": 1}})

    order = np.argsort(rul_test)
    return {
        "subset": name,
        "sensors": sensors,
        "train_windows": int(len(Xtr)),
        "test_engines": int(len(Xte)),
        "results": results,
        "literature": LITERATURE.get(name, []),
        "test_curve": [[int(i), float(rul_test[j]), round(float(preds_keep[j]), 1)] for i, j in enumerate(order)],
        "seconds": round(time.time() - t0, 1),
    }
