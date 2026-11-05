# SOP-CNC-014: CNC Mill Spindle Bearing Wear

**Applies to:** CNC_MILL class machines (CNC-01, CNC-02)
**Planned service:** about 10 minutes (bearing inspection, lubrication, preload check)
**Signals used:** spindle vibration velocity RMS (ISO 10816-3 zone), temperature, predicted remaining life (RUL)

## Symptom: Vibration rising through ISO zones B and C
Spindle vibration that climbs steadily through zone B (1.4-2.8 mm/s) into
zone C (2.8-4.5 mm/s) is the classic signature of spindle bearing wear. Left
alone it leads to chatter marks on the workpiece and, eventually, spindle
seizure mid-cut, which can scrap the part being machined.

**Recommended action:**
1. Service soon (safety-adjusted RUL under 60 cycles, or zone C): plan the
   bearing service within the next 2 shifts at a natural break between parts.
2. Service now (safety-adjusted RUL under 30 cycles, or zone D above 4.5 mm/s):
   stop at the end of the current part and service immediately.
3. Do not raise feed rate to recover cycle time lost to wear. It accelerates
   bearing damage.

## Procedure
1. Finish the current part; park the spindle and lock out.
2. Check spindle runout with a dial indicator (limit 0.003 mm TIR).
3. Inspect and re-grease bearings; check preload. Replace the bearing set if
   runout is out of limit or the races show pitting.
4. Run a warm-up cycle; confirm vibration is back in zone A (below 1.4 mm/s).

## Symptom: Temperature rise without a vibration rise
Points to restricted coolant flow, not bearing wear. Check coolant lines,
pump pressure and nozzles before scheduling a spindle service.
