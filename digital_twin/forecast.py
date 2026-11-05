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
                  cycles. The forecast uses the twin's wear trend as the RUL
                  estimate, standing in for the TCN.

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
        dst.throughput_units = src.throughput_units
        dst.status = (
            MachineStatus.FAILED if src.wear_level >= src.config.failure_wear_threshold
            else src._status_from_wear()
        )
        dst.rng = random.Random(f"{seed}-{mid}")
    return sandbox


def _simulate(live: FactoryTwin, horizon_s: float, samples: int, policy: str, seed: int) -> dict:
    sandbox = _clone_fleet(live, seed)
    env: simpy.Environment = sandbox.env
    machines = sandbox.machines
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
        events.append({"t": round(env.now, 1), "machine_id": mid, "type": kind, "duration_s": planned})
        m.action.interrupt(kind)

    def policy_loop():
        while True:
            for mid, m in machines.items():
                if env.now < busy_until[mid]:
                    continue
                if m.status == MachineStatus.FAILED:
                    if mid not in failed_since:
                        failed_since[mid] = env.now
                        events.append({"t": round(env.now, 1), "machine_id": mid, "type": "breakdown"})
                    # Reactive repair: the extra waiting time before the
                    # actual repair work (diagnosis, parts, sign-off).
                    wait = (UNPLANNED_REPAIR_MULTIPLIER - 1) * m.config.maintenance_duration_s
                    if env.now - failed_since[mid] >= wait:
                        failed_since.pop(mid, None)
                        service(mid, "repair")
                elif policy == "copilot":
                    rul = (m.config.failure_wear_threshold - m.wear_level) / m.config.wear_rate_mean
                    if SAFETY_FACTOR * rul < CRITICAL_RUL_CYCLES:
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
    return {
        "machines": out_machines,
        "events": sorted(events, key=lambda e: e["t"]),
        "summary": {
            "breakdowns": breakdowns,
            "planned_services": sum(1 for e in events if e["type"] == "service"),
            "parts": sum(v["parts_made"] for v in out_machines.values()),
            "downtime_h": round(sum(downtime_s.values()) / 3600.0, 2),
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
            "rul_estimate": "wear trend (stand-in for the TCN)",
            "seed": seed,
        },
    }
