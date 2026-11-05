"""
Runs the whole evaluation suite and writes the results.

    python -m evaluation.run_all                 # everything (about 15 minutes)
    python -m evaluation.run_all --quick         # skip the C-MAPSS benchmark
    python -m evaluation.run_all --cmapss-only   # only (re)run C-MAPSS, keep the rest

Outputs
  web/data/results.json   read by the Results page (/results.html)
  docs/RESULTS.md         the same numbers as a report
"""
from __future__ import annotations

import json
import os
import platform
import sys
import time
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT, "web", "data", "results.json")
MD_PATH = os.path.join(ROOT, "docs", "RESULTS.md")


def _training_summary(predictor) -> dict:
    from ml_pipeline.rul_predictor import label_rul
    from ml_pipeline.training_data import simulate_history

    hist = simulate_history(42, 30000)
    lab = label_rul(hist)
    params = sum(p.numel() for p in predictor.tcn_model.model.parameters())
    return {
        "plant_seed": 42,
        "simulated_hours": round(30000 / 3600, 1),
        "readings": int(len(hist)),
        "run_to_failure_lives": int(lab.groupby(["machine_id", "life"]).ngroups),
        "labelled_readings": int(len(lab)),
        "tcn_parameters": int(params),
        "inputs": ["vibration_rms", "temperature_c", "vibration_diff", "temperature_diff",
                   "vibration_roll_mean", "vibration_roll_std", "cycles_since_service"],
    }


def _write(out: dict):
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    with open(JSON_PATH, "w") as f:
        json.dump(out, f, indent=1)
    with open(MD_PATH, "w") as f:
        f.write(render_markdown(out))
    print(f"[eval] wrote {JSON_PATH} and {MD_PATH}")


def main(quick: bool = False, cmapss_only: bool = False):
    from evaluation import cmapss_benchmark, policy_eval, twin_eval
    from ml_pipeline.model_cache import load_or_train

    if cmapss_only:
        print("[eval] NASA C-MAPSS benchmark")
        cm = cmapss_benchmark.run()
        with open(JSON_PATH) as f:   # read after the run, so a parallel run's results are kept
            out = json.load(f)
        out["cmapss"] = cm
        _write(out)
        return

    t0 = time.time()
    detector, predictor, _ = load_or_train()
    out = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "environment": {"python": platform.python_version(), "machine": platform.machine()},
        "training": _training_summary(predictor),
    }
    print("[eval] remaining-life models on unseen plants")
    out["rul"] = twin_eval.evaluate_rul(predictor)
    print("[eval] anomaly detection")
    out["anomaly"] = twin_eval.evaluate_anomaly(detector)
    print("[eval] maintenance policies")
    out["policy"] = policy_eval.evaluate_policies(predictor)
    if not quick:
        print("[eval] NASA C-MAPSS benchmark")
        out["cmapss"] = cmapss_benchmark.run()
    out["seconds"] = round(time.time() - t0, 1)
    if quick and os.path.exists(JSON_PATH):   # keep an earlier C-MAPSS result (read at write time)
        with open(JSON_PATH) as f:
            prev = json.load(f)
        if "cmapss" in prev:
            out["cmapss"] = prev["cmapss"]
    _write(out)


def _fmt(ms: dict, digits=1) -> str:
    return f"{ms['mean']:.{digits}f} ± {ms['sd']:.{digits}f}" if ms["n"] > 1 else f"{ms['mean']:.{digits}f}"


def render_markdown(r: dict) -> str:
    L = ["# Evaluation results", "",
         f"Generated {r['generated_at']} by `python -m evaluation.run_all`. "
         "Every number below is reproducible with that command; the Results page in the app (`/results.html`) shows the same file.", ""]
    t = r["training"]
    L += ["## Training data", "",
          f"The models are trained on one simulated plant (seed {t['plant_seed']}, {t['simulated_hours']} simulated hours, "
          f"{t['readings']:,} readings, {t['run_to_failure_lives']} run-to-failure lives). Failed machines are repaired after "
          "3× a planned service, so each machine contributes several lives. The TCN has "
          f"{t['tcn_parameters']:,} parameters and sees only observable inputs: {', '.join(t['inputs'])}. "
          "All scores below come from plants with other seeds that the models never saw.", ""]

    rul = r["rul"]
    L += ["## Remaining useful life (unseen plants)", "",
          f"{rul['windows']:,} readings in the wear phase (true RUL < 100 cycles) from plants {', '.join(map(str, rul['test_plants']))}.", "",
          "| Model | MAE (cycles) | RMSE (cycles) | PHM08 score per reading |", "|---|---:|---:|---:|"]
    for row in rul["table"]:
        L.append(f"| {row['model']} | {row['mae']:.2f} | {row['rmse']:.2f} | {row['nasa_score_per_window']:.3f} |")
    b = rul["band"]
    L += ["", f"The UI shows each prediction as ± MAE ({b['mae']:.1f} cycles). That band contains the true value "
          f"{b['coverage_of_pm_mae']:.0%} of the time; 90% of errors are within ±{b['p90_abs_error']:.1f} cycles. "
          f"{b['late_share']:.0%} of predictions are late (too optimistic), which the scheduler's 15% safety margin absorbs.", "",
          "| True RUL | MAE | Bias (pred − true) | Readings |", "|---|---:|---:|---:|"]
    for row in rul["tcn_by_true_rul"]:
        L.append(f"| {row['range']} | {row['mae']:.2f} | {row['bias']:+.2f} | {row['n']} |")

    an = r["anomaly"]
    L += ["", "## Anomaly detection (unseen plants)", "",
          f"{an['readings']:,} readings from running machines. Positive = wear has started (wear ≥ 0.25, {an['positive_share']:.0%} of readings).", "",
          "| Detector | Precision | Recall | F1 | Recall on worn (≥ 0.6) | False alarms while healthy | Median alert lead (cycles) |",
          "|---|---:|---:|---:|---:|---:|---:|"]
    for name, m in an["models"].items():
        L.append(f"| {name} | {m['precision']:.3f} | {m['recall']:.3f} | {m['f1']:.3f} | {m['recall_worn']:.3f} | "
                 f"{m['false_alarm_rate_healthy']:.1%} | {m['median_lead_cycles']} |")

    pol = r["policy"]
    L += ["", "## Maintenance policies", "",
          f"{len(pol['seeds'])} simulated plants, one {pol['horizon_h']:.0f}-hour shift each, same seeds for every policy. "
          f"Mean ± standard deviation across plants. {pol['notes']}", "",
          "| Policy | Breakdowns | Planned services | Downtime (machine-hours) | Parts made | Share of part life used |",
          "|---|---:|---:|---:|---:|---:|"]
    for name, m in pol["policies"].items():
        life = f"{m['life_used']['mean']:.0%}" if m["life_used"] else "100% (runs to failure)"
        L.append(f"| {name} | {_fmt(m['breakdowns'])} | {_fmt(m['planned_services'])} | {_fmt(m['downtime_h'], 2)} | "
                 f"{_fmt(m['parts'], 0)} | {life} |")
    L += ["", "Fixed-schedule sweep (service after k × average life):", "",
          "| k | Downtime (h) | Breakdowns |", "|---:|---:|---:|"]
    for row in pol["fixed_interval_sweep"]:
        L.append(f"| {row['k']:.1f} | {row['downtime_h']:.2f} | {row['breakdowns']:.1f} |")
    L += ["", "Sensitivity to how long a breakdown repair takes (multiple of a planned service):", "",
          "| Multiplier | Run to failure (h) | Copilot with TCN (h) |", "|---:|---:|---:|"]
    for row in pol["repair_time_sensitivity"]:
        L.append(f"| {row['multiplier']:.1f}× | {row['run_to_failure_h']:.2f} | {row['copilot_h']:.2f} |")

    if "cmapss" in r:
        c = r["cmapss"]
        L += ["", f"## NASA C-MAPSS {c['subset']} benchmark", "",
              f"Same TCN architecture, trained on the public dataset ({len(c['sensors'])} informative sensors, "
              f"{c['train_windows']:,} training windows) and scored on the official {c['test_engines']} test engines. "
              "RUL capped at 125, windows of 30 cycles.", "",
              "| Model | RMSE | PHM08 score |", "|---|---:|---:|"]
        for row in c["results"]:
            L.append(f"| {row['model']} | {_fmt(row['rmse'], 2)} | {_fmt(row['score'], 0)} |")
        for row in c["literature"]:
            L.append(f"| {row['model']} (reported) | {row['rmse']:.2f} | – |")
    L += ["", "## Reading these results", "",
          "* The twin is our own simulator, so the twin scores show the system works end to end, not that it would on a real machine. The C-MAPSS benchmark is the check on public data.",
          "* The perfect-model row is an upper bound: it uses the true wear, which no real system can see.",
          "* The fixed schedule is tuned on the same plants it is scored on, which flatters it. The copilot is not tuned on them.", ""]
    return "\n".join(L)


if __name__ == "__main__":
    main(quick="--quick" in sys.argv, cmapss_only="--cmapss-only" in sys.argv)
