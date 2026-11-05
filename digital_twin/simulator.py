"""
Digital Twin Simulation Engine
==============================
No IoT hardware involved. This module IS the sensor feed: a SimPy
discrete-event simulation of a small factory line, where each machine
accumulates stochastic wear every cycle, and wear drives synthetic
vibration/temperature signals plus an eventual failure event.

This replaces the "real sensors -> MQTT/OPC-UA -> historian" pipeline you'd
normally need IoT hardware for. The AI pipeline downstream (anomaly
detection, RUL prediction, agents) doesn't know or care that the data is
synthetic — it consumes the same MachineState schema either way, so you
could later swap this module for a real ingestion layer without touching
anything else.

Run standalone:
    python -m digital_twin.simulator
"""
from __future__ import annotations

import random
import math
from collections import deque
from datetime import datetime, timedelta, timezone
from typing import Callable, Optional

import simpy

from digital_twin.models import MachineConfig, MachineState, MachineStatus


DEFAULT_FLEET: list[MachineConfig] = [
    MachineConfig(
        machine_id="CNC-01",
        machine_type="CNC_MILL",
        nominal_cycle_time_s=12.0,
        wear_rate_mean=0.0018,
        wear_rate_std=0.0006,
        failure_wear_threshold=1.0,
        maintenance_duration_s=600.0,
    ),
    MachineConfig(
        machine_id="CNC-02",
        machine_type="CNC_MILL",
        nominal_cycle_time_s=10.0,
        wear_rate_mean=0.0015,
        wear_rate_std=0.0005,
        failure_wear_threshold=1.0,
        maintenance_duration_s=500.0,
    ),
    MachineConfig(
        machine_id="PRESS-01",
        machine_type="HYDRAULIC_PRESS",
        nominal_cycle_time_s=8.0,
        wear_rate_mean=0.0026,
        wear_rate_std=0.0011,
        failure_wear_threshold=1.0,
        maintenance_duration_s=900.0,
    ),
    MachineConfig(
        machine_id="PRESS-02",
        machine_type="HYDRAULIC_PRESS",
        nominal_cycle_time_s=6.0,
        wear_rate_mean=0.0020,
        wear_rate_std=0.0008,
        failure_wear_threshold=1.0,
        maintenance_duration_s=750.0,
    ),
    MachineConfig(
        machine_id="FURN-01",
        machine_type="FURNACE",
        nominal_cycle_time_s=15.0,
        wear_rate_mean=0.0012,
        wear_rate_std=0.0004,
        failure_wear_threshold=1.0,
        maintenance_duration_s=1200.0,
    ),
    MachineConfig(
        machine_id="ROBOT-01",
        machine_type="ROBOT_ARM",
        nominal_cycle_time_s=7.0,
        wear_rate_mean=0.0014,
        wear_rate_std=0.0005,
        failure_wear_threshold=1.0,
        maintenance_duration_s=450.0,
    ),
    MachineConfig(
        machine_id="CONV-01",
        machine_type="CONVEYOR",
        nominal_cycle_time_s=3.0,
        wear_rate_mean=0.0009,
        wear_rate_std=0.0003,
        failure_wear_threshold=1.0,
        maintenance_duration_s=300.0,
    ),
    MachineConfig(
        machine_id="LASER-01",
        machine_type="METROLOGY",
        nominal_cycle_time_s=4.0,
        wear_rate_mean=0.0007,
        wear_rate_std=0.0002,
        failure_wear_threshold=1.0,
        maintenance_duration_s=250.0,
    ),
]



class MachineTwin:
    """A single machine's live digital twin, running inside the SimPy env."""

    def __init__(
        self,
        env: simpy.Environment,
        config: MachineConfig,
        start_wall_clock: datetime,
        on_state: Optional[Callable[[MachineState], None]] = None,
        rng: Optional[random.Random] = None,
    ):
        self.env = env
        self.config = config
        self.start_wall_clock = start_wall_clock
        self.on_state = on_state
        self.rng = rng or random.Random()

        self.wear_level = 0.0
        self.cycle_count = 0
        self.life_cycles = 0          # cycles since the last service
        self.throughput_units = 0
        self.status = MachineStatus.HEALTHY
        self.under_maintenance_until: Optional[float] = None  # sim time a service ends

        self.action = env.process(self.run())

    # -- synthetic signal generation -------------------------------------
    def _vibration_rms(self) -> float:
        """Vibration rises non-linearly with wear + sensor noise."""
        base = 0.5 + 4.0 * (self.wear_level ** 1.8)
        noise = self.rng.gauss(0, 0.08)
        return round(max(0.0, base + noise), 3)

    def _temperature_c(self) -> float:
        """Temperature climbs with wear, plus small periodic + noise terms."""
        base = 38 + 35 * (self.wear_level ** 1.5)
        cyclical = 1.5 * math.sin(self.env.now / 300.0)
        noise = self.rng.gauss(0, 0.6)
        return round(base + cyclical + noise, 2)

    def _status_from_wear(self) -> MachineStatus:
        if self.wear_level >= self.config.failure_wear_threshold:
            return MachineStatus.FAILED
        if self.wear_level >= 0.85:
            return MachineStatus.CRITICAL
        if self.wear_level >= 0.6:
            return MachineStatus.WARNING
        if self.wear_level >= 0.25:
            return MachineStatus.DEGRADING
        return MachineStatus.HEALTHY

    def _emit_state(self, keep_status: bool = False):
        if not keep_status:
            self.status = self._status_from_wear()
        state = MachineState(
            machine_id=self.config.machine_id,
            timestamp=self.start_wall_clock + timedelta(seconds=self.env.now),
            sim_time_s=self.env.now,
            wear_level=round(self.wear_level, 4),
            vibration_rms=self._vibration_rms(),
            temperature_c=self._temperature_c(),
            cycle_count=self.cycle_count,
            status=self.status,
            throughput_units=self.throughput_units,
            cycles_since_service=self.life_cycles,
        )
        if self.on_state:
            self.on_state(state)
        return state

    # -- accelerated aging, used for live demos -----------------------------
    def age_to(self, target_wear: float, max_cycles: int = 5000):
        """Fast-forwards this machine's own wear process until it reaches
        `target_wear`, emitting a reading for every cycle on the way.

        Jumping the wear level directly would leave a single huge vibration
        step in the history, which the RUL model has never seen and reads as
        imminent failure. Aging cycle by cycle produces the same trajectory a
        real degrading machine would, so every model downstream sees
        realistic input. Simulation time does not advance.
        """
        target = min(1.0, max(0.0, float(target_wear)))
        if target <= self.wear_level:
            self.wear_level = target
            return self._emit_state()
        state = None
        for _ in range(max_cycles):
            if self.wear_level >= target:
                break
            self.cycle_count += 1
            self.life_cycles += 1
            self.throughput_units += 1
            step = max(self.config.wear_rate_mean * 0.25,
                       self.rng.gauss(self.config.wear_rate_mean, self.config.wear_rate_std))
            self.wear_level = min(target, self.wear_level + step)
            state = self._emit_state()
        return state

    # -- maintenance hook, callable by agents / scheduler -----------------
    def perform_maintenance(self):
        """Resets wear to 0 and marks machine as in maintenance for its
        configured duration. Designed to be called by the Scheduler Agent's
        tool, or directly in a what-if simulation."""
        self.status = MachineStatus.IN_MAINTENANCE
        self.under_maintenance_until = self.env.now + self.config.maintenance_duration_s
        self._emit_state(keep_status=True)  # make "in service" visible right away
        yield self.env.timeout(self.config.maintenance_duration_s)
        self.wear_level = 0.0
        self.life_cycles = 0
        self.status = MachineStatus.HEALTHY
        self.under_maintenance_until = None

    # -- main process loop --------------------------------------------------
    def run(self):
        while True:
            if self.status == MachineStatus.FAILED:
                # Sits failed until an external agent/scheduler intervenes.
                self._emit_state()
                try:
                    yield self.env.timeout(self.config.nominal_cycle_time_s)
                except simpy.Interrupt:
                    yield from self.perform_maintenance()
                    self._emit_state()
                continue

            # cycle time creeps up slightly as wear increases (friction/slop)
            cycle_time = self.config.nominal_cycle_time_s * (1 + 0.4 * self.wear_level)
            try:
                yield self.env.timeout(cycle_time)
            except simpy.Interrupt:
                # Scheduler/agent pulled this machine in for maintenance mid-cycle.
                yield from self.perform_maintenance()
                self._emit_state()
                continue

            self.cycle_count += 1
            self.life_cycles += 1
            self.throughput_units += 1
            wear_increment = max(
                0.0, self.rng.gauss(self.config.wear_rate_mean, self.config.wear_rate_std)
            )
            self.wear_level = min(1.0, self.wear_level + wear_increment)

            self._emit_state()


class FactoryTwin:
    """Owns the SimPy environment and the fleet of MachineTwins.

    This is the object your API / agents talk to. It exposes:
      - run(duration_s): advance the simulation and collect telemetry
      - get_latest_states(): current snapshot of every machine
      - schedule_maintenance(machine_id): agent-callable tool
    """

    RECENT_PER_MACHINE = 240

    def __init__(
        self,
        fleet: Optional[list[MachineConfig]] = None,
        seed: int = 42,
        max_history: Optional[int] = None,
    ):
        self.env = simpy.Environment()
        self.rng = random.Random(seed)
        self.start_wall_clock = datetime.now(timezone.utc)
        # Full history for training runs; a long-running live plant caps it
        # (max_history) so memory stays flat.
        self.history = deque(maxlen=max_history) if max_history else []
        # Short per-machine window: all that live inference and charts need.
        self.recent: dict[str, deque] = {}
        self.latest_state: dict[str, MachineState] = {}
        # Optional hook, called (machine_id, old_status, new_status) when a
        # machine's status changes.
        self.on_transition: Optional[Callable[[str, MachineStatus, MachineStatus], None]] = None
        # Optional hook, called with a machine_id just before an agent-scheduled
        # service starts (the API uses it to count prevented failures).
        self.on_service: Optional[Callable[[str], None]] = None

        configs = fleet or DEFAULT_FLEET
        self.machines: dict[str, MachineTwin] = {
            cfg.machine_id: MachineTwin(
                self.env, cfg, self.start_wall_clock,
                on_state=self._record_state,
                rng=random.Random(self.rng.randint(0, 1_000_000)),
            )
            for cfg in configs
        }

    def _record_state(self, state: MachineState):
        self.history.append(state)
        prev = self.latest_state.get(state.machine_id)
        self.latest_state[state.machine_id] = state
        self.recent.setdefault(state.machine_id, deque(maxlen=self.RECENT_PER_MACHINE)).append(state)
        if self.on_transition and prev is not None and prev.status != state.status:
            self.on_transition(state.machine_id, prev.status, state.status)

    def run(self, duration_s: float):
        self.env.run(until=self.env.now + duration_s)

    def enable_auto_repair(self, delay_factor: float = 3.0, check_s: float = 5.0):
        """Repairs every failed machine after `delay_factor` x its planned
        service time, so a long run produces many run-to-failure lives per
        machine instead of one life followed by hours of a broken machine.
        Used to generate training and evaluation data."""
        failed_at: dict[str, float] = {}

        def loop():
            while True:
                for mid, m in self.machines.items():
                    if m.status == MachineStatus.FAILED:
                        t0 = failed_at.setdefault(mid, self.env.now)
                        wait = max(0.0, (delay_factor - 1.0) * m.config.maintenance_duration_s)
                        if self.env.now - t0 >= wait:
                            failed_at.pop(mid, None)
                            m.action.interrupt("auto_repair")
                yield self.env.timeout(check_s)

        self.env.process(loop())
        return self

    def get_latest_states(self) -> list[MachineState]:
        return list(self.latest_state.values())

    def schedule_maintenance(self, machine_id: str):
        """Agent-callable tool: interrupts a machine's run loop and performs
        maintenance. Returns True if scheduled, False if machine unknown."""
        twin = self.machines.get(machine_id)
        if not twin:
            return False
        if twin.status == MachineStatus.IN_MAINTENANCE:
            return False  # already being serviced; a second interrupt would crash it
        if self.on_service:
            self.on_service(machine_id)
        twin.action.interrupt("maintenance_requested")
        return True

    def history_dataframe(self):
        """Convenience export for the ML pipeline (pandas DataFrame)."""
        import pandas as pd
        return pd.DataFrame([s.to_dict() for s in self.history])

    def recent_dataframe(self, per_machine: int = 30):
        """Last `per_machine` readings of every machine. Live inference only
        needs a short window, so this stays cheap however long the plant runs."""
        import pandas as pd
        rows = []
        for q in self.recent.values():
            rows.extend(s.to_dict() for s in list(q)[-per_machine:])
        return pd.DataFrame(rows)

    def recent_readings(self, machine_id: str, n: int = 60) -> list[dict]:
        q = self.recent.get(machine_id)
        return [s.to_dict() for s in list(q)[-n:]] if q else []


if __name__ == "__main__":
    twin = FactoryTwin()
    twin.run(duration_s=3600)  # simulate 1 hour of production
    for state in twin.get_latest_states():
        print(state)
    print(f"\nTotal telemetry points generated: {len(twin.history)}")
