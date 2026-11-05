# Evaluation results

Generated 2026-11-05T20:11:29+00:00 by `python -m evaluation.run_all`. Every number below is reproducible with that command; the Results page in the app (`/results.html`) shows the same file.

## Training data

The models are trained on one simulated plant (seed 42, 8.3 simulated hours, 30,672 readings, 31 run-to-failure lives). Failed machines are repaired after 3× a planned service, so each machine contributes several lives. The TCN has 61,889 parameters and sees only observable inputs: vibration_rms, temperature_c, vibration_diff, temperature_diff, vibration_roll_mean, vibration_roll_std, cycles_since_service. All scores below come from plants with other seeds that the models never saw.

## Remaining useful life (unseen plants)

3,000 readings in the wear phase (true RUL < 100 cycles) from plants 1234, 2024, 31337.

| Model | MAE (cycles) | RMSE (cycles) | PHM08 score per reading |
|---|---:|---:|---:|
| TCN (deployed) | 3.68 | 4.63 | 0.399 |
| Gradient boosting (one reading) | 4.10 | 5.41 | 0.525 |
| Fleet-average life (no sensors) | 7.12 | 8.89 | 1.227 |

The UI shows each prediction as ± MAE (3.7 cycles). That band contains the true value 59% of the time; 90% of errors are within ±7.6 cycles. 35% of predictions are late (too optimistic), which the scheduler's 15% safety margin absorbs.

| True RUL | MAE | Bias (pred − true) | Readings |
|---|---:|---:|---:|
| 0-25 | 2.60 | +0.31 | 750 |
| 25-50 | 3.15 | -1.46 | 750 |
| 50-75 | 3.57 | -1.23 | 750 |
| 75-100 | 5.42 | -4.04 | 750 |

## Anomaly detection (unseen plants)

32,050 readings from running machines. Positive = wear has started (wear ≥ 0.25, 70% of readings).

| Detector | Precision | Recall | F1 | Recall on worn (≥ 0.6) | False alarms while healthy | Median alert lead (cycles) |
|---|---:|---:|---:|---:|---:|---:|
| Isolation Forest (deployed) | 0.952 | 0.995 | 0.973 | 1.000 | 11.7% | 484.0 |
| ISO 10816 zone C threshold | 1.000 | 0.278 | 0.436 | 0.614 | 0.0% | 172.0 |

## Maintenance policies

10 simulated plants, one 8-hour shift each, same seeds for every policy. Mean ± standard deviation across plants. Downtime is summed over 8 machines. Each plant starts with machines at random wear (0-75%).

| Policy | Breakdowns | Planned services | Downtime (machine-hours) | Parts made | Share of part life used |
|---|---:|---:|---:|---:|---:|
| Run to failure | 30.9 ± 0.7 | 0.0 ± 0.0 | 14.23 ± 0.23 | 23844 ± 82 | 100% (runs to failure) |
| Fixed schedule (best: 95% of average life) | 0.0 ± 0.0 | 38.5 ± 0.7 | 6.38 ± 0.14 | 27796 ± 45 | 95% |
| Copilot (TCN) | 0.0 ± 0.0 | 38.6 ± 0.7 | 6.43 ± 0.13 | 27782 ± 56 | 94% |
| Copilot (perfect model, upper bound) | 0.0 ± 0.0 | 38.5 ± 0.7 | 6.42 ± 0.13 | 27772 ± 54 | 95% |

Fixed-schedule sweep (service after k × average life):

| k | Downtime (h) | Breakdowns |
|---:|---:|---:|
| 0.6 | 9.95 | 0.0 |
| 0.7 | 8.65 | 0.0 |
| 0.8 | 7.46 | 0.0 |
| 0.8 | 7.01 | 0.0 |
| 0.9 | 6.67 | 0.0 |
| 0.9 | 6.38 | 0.0 |
| 1.0 | 11.16 | 19.8 |

Sensitivity to how long a breakdown repair takes (multiple of a planned service):

| Multiplier | Run to failure (h) | Copilot with TCN (h) |
|---:|---:|---:|
| 1.5× | 8.43 | 6.43 |
| 2.0× | 10.38 | 6.43 |
| 3.0× | 14.23 | 6.43 |
| 5.0× | 19.67 | 6.43 |

## Reading these results

* The twin is our own simulator, so the twin scores show the system works end to end, not that it would on a real machine. The C-MAPSS benchmark is the check on public data.
* The perfect-model row is an upper bound: it uses the true wear, which no real system can see.
* The fixed schedule is tuned on the same plants it is scored on, which flatters it. The copilot is not tuned on them.
