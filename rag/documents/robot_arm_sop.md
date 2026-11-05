# SOP-ROB-005: Robot Arm Joint Gearbox Wear

**Applies to:** ROBOT_ARM class machines (ROBOT-01)
**Planned service:** about 8 minutes (re-grease, backlash check)
**Signals used:** joint vibration, motor temperature, predicted remaining life (RUL)

## Symptom: Rising joint vibration and motor temperature
Wear in the harmonic or cycloidal joint gearboxes increases backlash. The arm
vibrates more at direction changes and the motors run hotter. Positioning
accuracy drops before the gearbox fails outright.

**Recommended action:**
1. Service soon (safety-adjusted RUL under 60 cycles): plan a re-grease and
   backlash check at the next shift change.
2. Service now (safety-adjusted RUL under 30 cycles): stop the cell; a seized
   joint can drop the part or collide with the fixture.

## Procedure
1. Move the arm to the service pose; lock out the cell.
2. Purge and re-grease each joint gearbox with the specified grease.
3. Measure backlash on axes 1-3; replace the gearbox if over the limit.
4. Re-run the calibration routine; confirm repeatability before release.
