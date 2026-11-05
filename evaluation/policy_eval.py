"""
Maintenance policy evaluation
=============================
Does the copilot actually reduce downtime, compared with what a plant would
otherwise do? Each policy runs the same simulated plants (same seeds, same
random wear) for one 8-hour shift:

  run_to_failure     repair only after a breakdown (3x a planned service)
  fixed_interval     preventive schedule: service after k x the machine's
                     average life. k is swept and the best value is reported,
                     so the copilot is compared with the strongest schedule.
  copilot (TCN)      the deployed rule (service when 0.85 x RUL < 30 cycles)
                     driven by the trained TCN reading the live sensors
  copilot (perfect)  the same rule with the true remaining life: an upper
                     bound for what a perfect model could do

Each plant starts mid-shift: every machine is aged to a random wear level,
cycle by cycle, so models see a realistic history.
"""
from __future__ import annotations

import random

import numpy as np
import torch

from digital_twin.forecast import _simulate
from digital_twin.simulator import FactoryTwin
from evaluation.fast_features import life_features
from evaluation.metrics import mean_sd

SEEDS = tuple(range(101, 111))      # 10 independent plants
HORIZON_S = 8 * 3600
INTERVAL_FRACTIONS = (0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1.0)
SENSITIVITY_MULTIPLIERS = (1.5, 2.0, 3.0, 5.0)
WINDOW = 20


def _start_plant(seed: int) -> FactoryTwin:
    plant = FactoryTwin(seed=seed, max_history=10)
    rng = random.Random(seed)
    for m in plant.machines.values():
        m.age_to(rng.uniform(0.0, 0.75))
    return plant


def tcn_estimator(predictor):
    """Wraps the trained TCN as `rul_estimator(machines, readings)`."""
    model = predictor.tcn_model

    def estimate(machines, readings):
        seqs, ids = [], []
        for mid in machines:
            buf = readings.get(mid) or []
            if len(buf) < 3:
                continue
            vib = np.array([r.vibration_rms for r in buf], float)
            temp = np.array([r.temperature_c for r in buf], float)
            age = np.array([r.cycles_since_service for r in buf], float)
            seqs.append(torch.from_numpy(life_features(vib, temp, age)[-WINDOW:]))
            ids.append(mid)
        if not seqs:
            return {}
        return dict(zip(ids, model.predict_sequences(seqs)))

    return estimate


def _mean_life_cycles(plant: FactoryTwin) -> dict:
    return {mid: m.config.failure_wear_threshold / m.config.wear_rate_mean for mid, m in plant.machines.items()}


def _run(policy, seed, **kw):
    plant = _start_plant(seed)
    return _simulate(plant, HORIZON_S, 2, policy, seed, **kw)["summary"]


def _collect(runs: list[dict]) -> dict:
    out = {k: mean_sd([r[k] for r in runs]) for k in ("breakdowns", "planned_services", "downtime_h", "parts")}
    wear = [r["mean_wear_at_service"] for r in runs if r["mean_wear_at_service"] is not None]
    out["life_used"] = mean_sd(wear) if wear else None
    return out


def evaluate_policies(predictor, log=print) -> dict:
    est = tcn_estimator(predictor)
    results = {}

    log("[policy] run to failure")
    results["Run to failure"] = _collect([_run("run_to_failure", s) for s in SEEDS])

    best = None
    sweep = []
    for k in INTERVAL_FRACTIONS:
        log(f"[policy] fixed interval k={k}")
        runs = [_run("fixed_interval", s, interval_cycles={mid: k * L for mid, L in
                                                            _mean_life_cycles(_start_plant(s)).items()})
                for s in SEEDS]
        agg = _collect(runs)
        sweep.append({"k": k, "downtime_h": agg["downtime_h"]["mean"], "breakdowns": agg["breakdowns"]["mean"]})
        if best is None or agg["downtime_h"]["mean"] < best[1]["downtime_h"]["mean"]:
            best = (k, agg)
    results[f"Fixed schedule (best: {best[0]:.0%} of average life)"] = best[1]

    log("[policy] copilot with the TCN")
    results["Copilot (TCN)"] = _collect([_run("copilot", s, rul_estimator=est) for s in SEEDS])
    log("[policy] copilot with a perfect model")
    results["Copilot (perfect model, upper bound)"] = _collect([_run("copilot", s) for s in SEEDS])

    log("[policy] sensitivity to breakdown repair time")
    sens = []
    for mult in SENSITIVITY_MULTIPLIERS:
        rtf = [_run("run_to_failure", s, repair_multiplier=mult)["downtime_h"] for s in SEEDS]
        cop = [_run("copilot", s, rul_estimator=est, repair_multiplier=mult)["downtime_h"] for s in SEEDS]
        sens.append({"multiplier": mult, "run_to_failure_h": round(float(np.mean(rtf)), 2),
                     "copilot_h": round(float(np.mean(cop)), 2)})

    return {
        "seeds": list(SEEDS),
        "horizon_h": HORIZON_S / 3600,
        "policies": results,
        "fixed_interval_sweep": sweep,
        "repair_time_sensitivity": sens,
        "notes": "Downtime is summed over 8 machines. Each plant starts with machines at random wear (0-75%).",
    }
