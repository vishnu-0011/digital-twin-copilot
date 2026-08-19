# SOP-CNC-014: CNC Mill Vibration & Spindle Wear Response

**Applies to:** CNC_MILL class machines (e.g. CNC-01)
**Severity levels:** DEGRADING, WARNING, CRITICAL

## Symptom: Elevated vibration RMS (> 3.0)
Elevated spindle vibration combined with wear_level > 0.6 typically indicates
bearing wear in the spindle housing. Left unaddressed, this progresses to
chatter marks on the workpiece and, eventually, spindle seizure.

**Recommended action:**
1. If wear_level is between 0.6 and 0.85 (WARNING): schedule maintenance
   within the next 2 production shifts. Continued operation is acceptable
   short-term but throughput should be monitored for quality drift.
2. If wear_level exceeds 0.85 (CRITICAL): schedule maintenance immediately.
   Risk of unscheduled failure within 50-100 cycles is high.
3. Do not increase feed rate to compensate for cycle time drift — this
   accelerates spindle wear further.

## Symptom: Temperature rise without vibration increase
Suggests coolant flow restriction rather than mechanical wear. Check coolant
lines before assuming spindle bearing failure. This is a separate root cause
from vibration-driven wear and should not trigger a full spindle service.

## Maintenance procedure summary
Standard spindle service takes approximately 600 seconds of downtime
(bearing inspection, lubrication, wear-level reset). No specialized parts
required for wear_level < 0.95; above that threshold, bearing replacement
(not just service) may be required and downtime should be re-estimated at
2-3x standard duration.
