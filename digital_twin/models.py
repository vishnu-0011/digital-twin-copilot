"""
Shared data models for the digital twin.

These are intentionally framework-agnostic (plain dataclasses) so they can be
consumed by SimPy, pandas, the ML pipeline, and the LangGraph agents without
pulling in extra dependencies.
"""
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum


class MachineStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADING = "degrading"
    WARNING = "warning"
    CRITICAL = "critical"
    FAILED = "failed"
    IN_MAINTENANCE = "in_maintenance"


@dataclass
class MachineConfig:
    """Static properties of a simulated machine — its 'digital thread'."""
    machine_id: str
    machine_type: str  # e.g. "CNC_MILL", "CONVEYOR", "PRESS"
    nominal_cycle_time_s: float
    wear_rate_mean: float          # base wear increment per cycle
    wear_rate_std: float           # stochastic variation in wear
    failure_wear_threshold: float  # wear level (0-1) at which failure occurs
    maintenance_duration_s: float


@dataclass
class MachineState:
    """A single timestep snapshot of a machine — this is the 'virtual sensor reading'."""
    machine_id: str
    timestamp: datetime
    sim_time_s: float
    wear_level: float           # 0.0 (new) -> 1.0 (failed)
    vibration_rms: float        # synthetic vibration signal, correlates with wear
    temperature_c: float        # synthetic temperature signal
    cycle_count: int
    status: MachineStatus
    throughput_units: int

    def to_dict(self) -> dict:
        d = asdict(self)
        d["timestamp"] = self.timestamp.isoformat()
        d["status"] = self.status.value
        return d


@dataclass
class MaintenanceEvent:
    machine_id: str
    event_type: str  # "scheduled", "unscheduled", "predicted"
    start_sim_time_s: float
    duration_s: float
    reason: str
    triggered_by: str = "system"  # "agent", "operator", "system"
