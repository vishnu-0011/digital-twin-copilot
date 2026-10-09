# Plan: Executive Cleanroom Mega-Factory (Light Theme & 8-Machine Fleet)

## Backpressure Commands
- Test Suite: `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`
- JavaScript Validation: `node --check web/js/*.js`
- API Live Check: `curl -s http://localhost:8000/health && curl -s http://localhost:8000/fleet`

---

## Execution Waves

### Wave 1: SimPy Physics Fleet Scale (8 Workcells) & API Pipeline Update
- **Task 1.1**: Expand `DEFAULT_FLEET` in `digital_twin/simulator.py` to 8 machines (`CNC-01`, `CNC-02`, `PRESS-01`, `PRESS-02`, `FURN-01`, `ROBOT-01`, `CONV-01`, `LASER-01`) with realistic industrial cycle times and wear parameters.
- **Task 1.2**: Update `api/main.py` `/pipeline/flow` endpoint to map all 8 workcells and manufacturing stages.
- **Task 1.3**: Update test suite in `tests/test_api_web.py` and `tests/test_digital_twin.py`.

### Wave 2: Executive Cleanroom Light Theme UI (`web/css/style.css` & `web/index.html`)
- **Task 2.1**: Implement light theme CSS variables (frost-white glassmorphic background, dark slate `#0f172a` text, crisp emerald/amber/red status indicators, and clean cards).
- **Task 2.2**: Add interactive Theme Switcher button (`☀️ Light / 🌙 Dark`) in the top HUD, defaulting to the Executive Light Theme.
- **Task 2.3**: Update SCADA drawer, dual-channel oscilloscope canvas, floating badges, and bottom pipeline ribbon for crisp light theme contrast.

### Wave 3: Mega-Factory 3D Environment & Machinery Expansion (`web/js/models.js` & `web/js/scene.js`)
- **Task 3.1**: Double factory floor footprint to $64\text{m} \times 52\text{m}$ with light polished cleanroom epoxy slab and expanded perimeter I-beams.
- **Task 3.2**: Build procedural 3D models for all 8 workcells across 4 zoned bays:
  - Bay 1 (Machining): `CNC-01` (Roughing Mill) + `CNC-02` (Finishing Center).
  - Bay 2 (Forming & Thermal): `PRESS-01` (1000T Press) + `PRESS-02` (500T Press) + `FURN-01` (Vacuum Furnace).
  - Bay 3 (Robotics & Metrology): `ROBOT-01` (6-DOF Robotic Arm Cell) + `LASER-01` (Laser Triangulation QC Arch).
  - Bay 4 (Assembly Line): `CONV-01` (Dual-rail assembly line).
  - Logistics Fleet: Dual roving AMRs (`AGV-01` and `AGV-02`) with coordinated waypoint navigation loops.
- **Task 3.3**: Update camera director bar presets (`Overview`, `Machining Bay`, `Forging Bay`, `Robotics Bay`, `Assembly Bay`, `Follow AGV-01`, `Follow AGV-02`).

### Wave 4: Verification, Automated Testing, Screenshots & PR Synchronization
- **Task 4.1**: Verify full test suite passing with `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`.
- **Task 4.2**: Recapture multi-angle screenshots in the new Executive Light Theme.
- **Task 4.3**: Update `README.md` and commit atomic outcomes to git branch.

