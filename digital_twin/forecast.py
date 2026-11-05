"""
Forecast: run the twin forward from the live state
===================================================
This is the core promise of a digital twin: copy the plant as it is right
now, then fast-forward it to see what happens next.

`forecast_fleet` clones the live fleet (wear, cycle counts, parts made) into
a throwaway SimPy environment and simulates the next few hours twice, with
the same random seed so both futures see identical wear:

  run_to_failure  Nobody intervenes until a machine breaks. A breakdown is
                  then repaired reactively, taking UNPLANNED_REPAIR_MULTIPLIER
                  times as long as a planned service.
  copilot         The scheduler's own rule: service a machine as soon as its
                  safety-adjusted remaining life (0.85 x RUL) drops below 30
                  cycles. By default the RUL estimate is the twin's true wear
                  trend, i.e. a perfect model (an upper bound). Pass
                  `rul_estimator` to drive the rule with a real model instead.
  fixed_interval  Preventive maintenance on a schedule: service every machine
                  after a fixed number of cycles since its last service
                  (`interval_cycles`). The usual alternative to prediction.

The evaluation suite (evaluation/policy_eval.py) runs all of these over many
seeds with the trained TCN; the live forecast in the UI uses the fast
perfect-model version and says so.

The result is sampled on a fixed time grid for the UI's time slider, plus a
summary of breakdowns, downtime and parts for each policy.
"""
from __future__ import annotations

import math
import random

import simpy

from digital_twin.models import MachineStatus
from digital_twin.simulator import FactoryTwin, MachineTwin

UNPLANNED_REPAIR_MULTIPLIER = 3.0
SAFETY_FACTOR = 0.85          # same as agents/scheduler_agent.py
CRITICAL_RUL_CYCLES = 30.0    # same as agents/scheduler_agent.py
RUL_CAP_CYCLES = 100.0        # same cap the RUL model is trained with
POLICY_CHECK_S = 30.0


def _vibration(wear: float) -> float:
    return 0.5 + 4.0 * (wear ** 1.8)


def _temperature(wear: float) -> float:
    return 38 + 35 * (wear ** 1.5)


def _clone_fleet(live: FactoryTwin, seed: int) -> FactoryTwin:
    """Copies the live machines into a fresh environment at t=0."""
    sandbox = FactoryTwin(fleet=[m.config for m in live.machines.values()], seed=seed)
    sandbox.history = []  # not needed; keeps memory flat for long horizons
    sandbox._record_state = lambda state: sandbox.latest_state.__setitem__(state.machine_id, state)
    for mid, src in live.machines.items():
        dst: MachineTwin = sandbox.machines[mid]
        dst.on_state = sandbox._record_state
        dst.wear_level = src.wear_level
        dst.cycle_count = src.cycle_count
        dst.life_cycles = src.life_cycles
        dst.throughput_units = src.throughput_units
        dst.status = (
            MachineStatus.FAILED if src.wear_level >= src.config.failure_wear_threshold
            else src._status_from_wear()
        )
        dst.rng = random.Random(f"{seed}-{mid}")
    return sandbox


def _true_rul(m: MachineTwin) -> float:
    return (m.config.failure_wear_threshold - m.wear_level) / m.config.wear_rate_mean


def _simulate(
    live: FactoryTwin,
    horizon_s: float,
    samples: int,
    policy: str,
    seed: int,
    rul_estimator=None,
    interval_cycles: dict | None = None,
    repair_multiplier: float = UNPLANNED_REPAIR_MULTIPLIER,
) -> dict:
    """`rul_estimator(machines, readings) -> {machine_id: rul}` replaces the
    perfect wear-based estimate for the copilot policy. `readings` holds the
    recent readings of each machine's current life."""
    sandbox = _clone_fleet(live, seed)
    env: simpy.Environment = sandbox.env
    machines = sandbox.machines
    readings: dict[str, list] = {mid: [] for mid in machines}
    if rul_estimator is not None:
        def record(state, _sb=sandbox):
            _sb.latest_state[state.machine_id] = state
            buf = readings[state.machine_id]
            if buf and state.cycles_since_service < buf[-1].cycles_since_service:
                buf.clear()  # a service started a new life
            if state.status.value != "in_maintenance":
                buf.append(state)
                if len(buf) > 40:
                    del buf[:-40]
        for m in machines.values():
            m.on_state = record
        # Seed each buffer with the live plant's recent readings of this life.
        for mid in machines:
            src = list(live.recent.get(mid, []))
            life = [r for r in src if r.cycles_since_service <= live.machines[mid].life_cycles]
            readings[mid].extend(r for r in life[-40:] if r.status.value != "in_maintenance")
    busy_until = {mid: -1.0 for mid in machines}
    events: list[dict] = []
    downtime_s = {mid: 0.0 for mid in machines}
    failed_since: dict[str, float] = {}

    def service(mid: str, kind: str):
        m = machines[mid]
        if env.now < busy_until[mid]:
            return
        planned = m.config.maintenance_duration_s
        busy_until[mid] = env.now + planned + 1.0
        events.append({"t": round(env.now, 1), "machine_id": mid, "type": kind, "duration_s": planned,
                       "wear": round(m.wear_level, 3)})
        m.action.interrupt(kind)

    def policy_loop():
        while True:
            estimates = None
            if policy == "copilot" and rul_estimator is not None:
                running = {mid: m for mid, m in machines.items()
                           if env.now >= busy_until[mid] and m.status != MachineStatus.FAILED}
                estimates = rul_estimator(running, readings) if running else {}
            for mid, m in machines.items():
                if env.now < busy_until[mid]:
                    continue
                if m.status == MachineStatus.FAILED:
                    if mid not in failed_since:
                        failed_since[mid] = env.now
                        events.append({"t": round(env.now, 1), "machine_id": mid, "type": "breakdown"})
                    # Reactive repair: the extra waiting time before the
                    # actual repair work (diagnosis, parts, sign-off).
                    wait = (repair_multiplier - 1) * m.config.maintenance_duration_s
                    if env.now - failed_since[mid] >= wait:
                        failed_since.pop(mid, None)
                        service(mid, "repair")
                elif policy == "copilot":
                    rul = estimates.get(mid) if estimates is not None else _true_rul(m)
                    if rul is not None and SAFETY_FACTOR * rul < CRITICAL_RUL_CYCLES:
                        service(mid, "service")
                elif policy == "fixed_interval" and interval_cycles:
                    if m.life_cycles >= interval_cycles.get(mid, float("inf")):
                        service(mid, "service")
            yield env.timeout(POLICY_CHECK_S)

    grid = [horizon_s * i / (samples - 1) for i in range(samples)]
    series = {mid: {"wear": [], "status": [], "parts": []} for mid in machines}

    def sampler():
        for t in grid:
            if t > env.now:
                yield env.timeout(t - env.now)
            for mid, m in machines.items():
                in_service = env.now < busy_until[mid] and m.status != MachineStatus.FAILED
                status = MachineStatus.IN_MAINTENANCE if in_service else (
                    MachineStatus.FAILED if m.status == MachineStatus.FAILED else m._status_from_wear()
                )
                s = series[mid]
                s["wear"].append(round(m.wear_level, 4))
                s["status"].append(status.value)
                s["parts"].append(m.throughput_units)

    def downtime_meter():
        step = 10.0
        while True:
            for mid, m in machines.items():
                if m.status in (MachineStatus.FAILED, MachineStatus.IN_MAINTENANCE) or env.now < busy_until[mid]:
                    downtime_s[mid] += step
            yield env.timeout(step)

    def resume_live_services():
        # Machines already being serviced in the live plant stay in service.
        yield env.timeout(0)
        for mid, src in live.machines.items():
            if src.status == MachineStatus.IN_MAINTENANCE:
                service(mid, "in_service")

    env.process(resume_live_services())
    env.process(policy_loop())
    env.process(sampler())
    env.process(downtime_meter())
    start_parts = {mid: m.throughput_units for mid, m in machines.items()}
    env.run(until=horizon_s + 1e-6)

    out_machines = {}
    for mid, m in machines.items():
        cfg = m.config
        s = series[mid]
        s["vibration_rms"] = [round(_vibration(w), 3) for w in s["wear"]]
        s["temperature_c"] = [round(_temperature(w), 2) for w in s["wear"]]
        s["rul_cycles"] = [
            round(min(RUL_CAP_CYCLES, max(0.0, (cfg.failure_wear_threshold - w) / cfg.wear_rate_mean)), 1)
            for w in s["wear"]
        ]
        first_break = next((e["t"] for e in events if e["machine_id"] == mid and e["type"] == "breakdown"), None)
        out_machines[mid] = {
            **s,
            "first_breakdown_s": first_break,
            "parts_made": m.throughput_units - start_parts[mid],
            "downtime_s": round(downtime_s[mid], 1),
        }

    breakdowns = sum(1 for e in events if e["type"] == "breakdown")
    planned = [e for e in events if e["type"] == "service"]
    return {
        "machines": out_machines,
        "events": sorted(events, key=lambda e: e["t"]),
        "summary": {
            "breakdowns": breakdowns,
            "planned_services": sum(1 for e in events if e["type"] == "service"),
            "parts": sum(v["parts_made"] for v in out_machines.values()),
            "downtime_h": round(sum(downtime_s.values()) / 3600.0, 2),
            # How much of each part's life a planned service used (1.0 = all of it).
            "mean_wear_at_service": round(sum(e["wear"] for e in planned) / len(planned), 3) if planned else None,
        },
    }


def forecast_fleet(live: FactoryTwin, horizon_s: float = 8 * 3600, samples: int = 97, seed: int = 7) -> dict:
    """Simulates both policies from the live state and returns slider-ready series."""
    horizon_s = float(max(600.0, min(horizon_s, 48 * 3600)))
    samples = int(max(2, min(samples, 400)))
    runs = {p: _simulate(live, horizon_s, samples, p, seed) for p in ("run_to_failure", "copilot")}
    times = [round(horizon_s * i / (samples - 1), 1) for i in range(samples)]
    return {
        "horizon_s": horizon_s,
        "times_s": times,
        "machine_meta": {
            mid: {
                "machine_type": m.config.machine_type,
                "nominal_cycle_time_s": m.config.nominal_cycle_time_s,
                "service_duration_s": m.config.maintenance_duration_s,
            }
            for mid, m in live.machines.items()
        },
        "policies": runs,
        "assumptions": {
            "unplanned_repair_multiplier": UNPLANNED_REPAIR_MULTIPLIER,
            "copilot_rule": f"service when {SAFETY_FACTOR} x RUL < {CRITICAL_RUL_CYCLES:.0f} cycles",
            "rul_estimate": "perfect model (true wear trend): an upper bound. Measured results with the real TCN are on the Results page.",
            "seed": seed,
        },
    }
