# SOP-PRESS-022: Hydraulic Press Wear & Thermal Response

**Applies to:** HYDRAULIC_PRESS class machines (e.g. PRESS-01)
**Severity levels:** DEGRADING, WARNING, CRITICAL

## Symptom: High vibration RMS combined with high temperature
Hydraulic presses showing both elevated vibration AND elevated temperature
simultaneously usually indicate seal degradation, not bearing wear (unlike
CNC mills). Seal degradation causes internal fluid bypass, which raises
operating temperature, which in turn accelerates further seal wear — this
is a compounding failure mode and escalates faster than linear wear models
suggest.

**Recommended action:**
1. WARNING (wear_level 0.6-0.85): schedule maintenance within 1 shift, not
   2 — presses degrade faster than CNC equipment once past this threshold.
2. CRITICAL (wear_level > 0.85): treat as urgent. Unscheduled failure risk
   is significantly higher for presses than for mills at equivalent wear
   levels because of the compounding thermal effect above.
3. Standard maintenance duration is 900 seconds. If failure has already
   occurred (wear_level >= 1.0), re-estimate downtime at 1.5x standard —
   seal replacement after failure typically requires additional cleanup.

## Cross-reference
Do not apply CNC mill vibration thresholds to presses — the failure
mechanics differ (bearing wear vs. seal degradation) even though both
surface as elevated vibration_rms in telemetry.
