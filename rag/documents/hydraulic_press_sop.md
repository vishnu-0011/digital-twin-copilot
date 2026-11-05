# SOP-PRESS-022: Hydraulic Press Ram Seal Degradation

**Applies to:** HYDRAULIC_PRESS class machines (PRESS-01, PRESS-02)
**Planned service:** about 12-15 minutes (seal replacement, fluid check)
**Signals used:** vibration RMS, oil temperature, predicted remaining life (RUL)

## Symptom: Vibration and temperature rising together
When vibration and temperature climb at the same time, the usual cause is
ram seal wear, not bearings. A worn seal lets fluid bypass internally, which
heats the oil, which wears the seal faster: a compounding failure that
escalates faster than a mill's bearing wear.

**Recommended action:**
1. Service soon (safety-adjusted RUL under 60 cycles): plan the seal change
   within 1 shift, not 2. Presses degrade faster than mills past this point.
2. Service now (safety-adjusted RUL under 30 cycles, or zone D): treat as
   urgent; a pressure drop mid-stroke can damage the die.
3. After a breakdown, expect extra cleanup: allow about 1.5x the planned time.

## Procedure
1. Retract the ram, block the platen, lock out and bleed pressure.
2. Replace ram seals and wipers; inspect the rod for scoring.
3. Check fluid level and temperature; replace the filter if the bypass
   indicator is up.
4. Cycle under no load, then under load; confirm pressure holds and vibration
   is back in zone A.

## Cross-reference
Do not apply mill vibration rules to presses: the failure mechanism differs
(seal bypass versus bearing wear) even though both show as vibration.
