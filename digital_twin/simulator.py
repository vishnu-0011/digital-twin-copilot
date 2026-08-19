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
        machine_id="PRESS-01",
        machine_type="HYDRAULIC_PRESS",
        nominal_cycle_time_s=8.0,
        wear_rate_mean=0.0026,
        wear_rate_std=0.0011,
        failure_wear_threshold=1.0,
        maintenance_duration_s=900.0,
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
        self.throughput_units = 0
        self.status = MachineStatus.HEALTHY
        self.under_maintenance_until: Optional[float] = None

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

    def _emit_state(self):
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
        )
        if self.on_state:
            self.on_state(state)
        return state

    # -- maintenance hook, callable by agents / scheduler -----------------
    def perform_maintenance(self):
        """Resets wear to 0 and marks machine as in maintenance for its
        configured duration. Designed to be called by the Scheduler Agent's
        tool, or directly in a what-if simulation."""
        self.status = MachineStatus.IN_MAINTENANCE
        yield self.env.timeout(self.config.maintenance_duration_s)
        self.wear_level = 0.0
        self.status = MachineStatus.HEALTHY

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

    def __init__(self, fleet: Optional[list[MachineConfig]] = None, seed: int = 42):
        self.env = simpy.Environment()
        self.rng = random.Random(seed)
        self.start_wall_clock = datetime.now(timezone.utc)
        self.history: list[MachineState] = []
        self.latest_state: dict[str, MachineState] = {}

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
        self.latest_state[state.machine_id] = state

    def run(self, duration_s: float):
        self.env.run(until=self.env.now + duration_s)

    def get_latest_states(self) -> list[MachineState]:
        return list(self.latest_state.values())

    def schedule_maintenance(self, machine_id: str):
        """Agent-callable tool: interrupts a machine's run loop and performs
        maintenance. Returns True if scheduled, False if machine unknown."""
        twin = self.machines.get(machine_id)
        if not twin:
            return False
        twin.action.interrupt("maintenance_requested")
        return True

    def history_dataframe(self):
        """Convenience export for the ML pipeline (pandas DataFrame)."""
        import pandas as pd
        return pd.DataFrame([s.to_dict() for s in self.history])


if __name__ == "__main__":
    twin = FactoryTwin()
    twin.run(duration_s=3600)  # simulate 1 hour of production
    for state in twin.get_latest_states():
        print(state)
    print(f"\nTotal telemetry points generated: {len(twin.history)}")
