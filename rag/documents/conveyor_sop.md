# SOP-CONV-007: Conveyor System Wear Response

**Applies to:** CONVEYOR class machines (e.g. CONV-01)
**Severity levels:** DEGRADING, WARNING, CRITICAL

## Symptom: Gradual vibration increase, low absolute magnitude
Conveyors show much lower absolute vibration values than CNC mills or
presses even at high wear — a vibration_rms of 2.0 on a conveyor is
proportionally more significant than the same value on a CNC mill. Use
wear_level as the primary signal for conveyors, not raw vibration magnitude.

**Recommended action:**
1. WARNING (wear_level 0.6-0.85): schedule maintenance within 3 shifts.
   Conveyors have the most operational slack of the three machine types
   since belt wear degrades gradually and predictably.
2. CRITICAL (wear_level > 0.85): schedule within 1 shift. Belt slippage
   risk increases sharply above this threshold and can cause secondary
   quality defects on downstream machines even before outright failure.
3. Standard maintenance duration is 300 seconds — shortest of the fleet.
   Conveyors are the cheapest and fastest machine class to service, so
   when scheduling is contested, deprioritize conveyors relative to
   presses and mills unless conveyor wear_level is CRITICAL.
