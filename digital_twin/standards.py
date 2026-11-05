"""
Vibration severity standard used across the whole system
=========================================================
ISO 10816-3 (now ISO 20816-3), machine group 2 (medium machines,
15–300 kW) on a rigid foundation, broadband velocity RMS in mm/s:

    Zone A  < 1.4   newly commissioned condition
    Zone B  < 2.8   acceptable for unrestricted long-term operation
    Zone C  < 4.5   unsatisfactory for continuous operation; plan corrective action
    Zone D  ≥ 4.5   severe enough to cause damage

Every machine in the fleet (18 kW spindles up to a 92 kW furnace) falls in
group 2. The simulator's vibration model (0.5 + 4·wear^1.8 mm/s) spans these
zones end to end: a fresh tool sits in A and a fully worn one reaches D.

The frontend mirrors these numbers in web/js/standards.js; a unit test keeps
the two files in sync.
"""
from __future__ import annotations

ISO_10816_ZONE_LIMITS_MM_S = (1.4, 2.8, 4.5)  # A/B, B/C, C/D boundaries

ZONE_LABELS = {
    "A": "good",
    "B": "acceptable",
    "C": "plan corrective action",
    "D": "damage occurring",
}


def iso_zone(vibration_rms_mm_s: float) -> str:
    """Returns the ISO 10816-3 group 2 zone letter for a velocity RMS reading."""
    ab, bc, cd = ISO_10816_ZONE_LIMITS_MM_S
    v = float(vibration_rms_mm_s)
    if v < ab:
        return "A"
    if v < bc:
        return "B"
    if v < cd:
        return "C"
    return "D"


def zone_c_threshold() -> float:
    """Velocity RMS at which a machine leaves the long-term acceptable zones."""
    return ISO_10816_ZONE_LIMITS_MM_S[1]
