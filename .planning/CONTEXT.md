# Phase Context: Executive Cleanroom Mega-Factory (Light Theme & Expanded 8-Machine Fleet)

## Problem & User Intent
The user asked:
> "why is the factory so small ? do we have only that data ? no nmore data is present other than that in our system ?"
> "option 1 but try to use the light theme , this doesnt catch the eye of the HOD , ok ? and also remove the AI slops"

The user's Head of Department (HOD) / executive stakeholders require:
1. **Scale**: A full-scale enterprise mega-factory with 8–10 distinct workcells across multiple bays, multiple AMRs, and deep multi-shift telemetry.
2. **Executive Light Theme**: A clean, modern, high-contrast, professional light cleanroom aesthetic (Porsche / Apple / Siemens industrial cleanroom) rather than a moody dark theme, maximizing executive presentation clarity.
3. **Zero AI Slop**: Elimination of buzzwordy AI fluff in favor of concrete industrial manufacturing reality (real machine models, ISO 10816 vibration classes, OEE breakdown, real cycle times, and physical SimPy dynamics).

## Locked Architectural Decisions
- **Enterprise Fleet Scale (8 Workcells + 2 AMRs)**:
  - `CNC-01`: 5-Axis Inconel Turbine Roughing Mill
  - `CNC-02`: 5-Axis High-Speed Airfoil Finishing Center
  - `PRESS-01`: 1000-Ton Airframe Bulkhead Forging Press
  - `PRESS-02`: 500-Ton Hydraulic Extrusion Press
  - `FURN-01`: Vacuum Heat Treatment Carburizing Furnace
  - `ROBOT-01`: 6-DOF Robotic Deburring & Polishing Workcell
  - `CONV-01`: Main Avionics Assembly Conveyor
  - `LASER-01`: Dual-Axis Laser Triangulation QC Arch
  - `AGV-01` & `AGV-02`: Dual Autonomous Mobile Robots patrolling coordinated transit corridors.
- **Executive Cleanroom Light Theme**:
  - Pristine polished architectural white epoxy slab with crisp daylight floodlights and subtle soft shadows.
  - Frost-white glassmorphic HUD, high-contrast dark slate typography (`#0f172a`), crisp emerald/amber/red status indicators.
  - Light-themed dual-channel oscilloscope canvas with dark slate text and vivid vibration/temperature traces.
  - Dynamic Theme Switcher (`☀️ Light / 🌙 Dark`) preserved for user flexibility.
- **Backend & Physics Expansion**:
  - Expand `DEFAULT_FLEET` in `digital_twin/simulator.py` to all 8 workcells.
  - Expand `GET /pipeline/flow` to map all 8 physical stages and the 6-step AI reasoning trace.
  - Full automated test suite compatibility across all 8 machines.

## Verification & Backpressure Seams
- Test suite: `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`
- JavaScript validation: `node --check web/js/*.js`
- Live endpoint checks: `GET /fleet` (8 machines returned), `GET /pipeline/flow` (8 stages mapped).

