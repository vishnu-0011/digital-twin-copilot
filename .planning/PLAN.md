# Plan: Darkvex RTS Aerospace Complex 3D Models & Atmosphere Overhaul

## Backpressure Commands
- Test Suite: `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`
- JavaScript Validation: `node --check web/js/*.js`
- Live Health & API Check: `curl -s http://localhost:8000/health && curl -s http://localhost:8000/fleet`

---

## Execution Waves

### Wave 1: Environment, High-Bay Storage Racks (ASRS) & Dynamic Gantry Crane
- **Task 1.1**: Build procedural High-Bay Warehouse Pallet Storage Racks (ASRS) along perimeter walls in `web/js/models.js` with structural steel uprights, multi-tier crossbeams, loaded aerospace parts pallets, and glowing barcode ID badges.
- **Task 1.2**: Upgrade the overhead yellow industrial gantry crane to span across the facility with dual runway tracks, motorized end-trucks, and dynamic traversal motion in `web/js/scene.js`.
- **Task 1.3**: Replace circular runway track with a rectangular industrial hazard-striped navigation corridor aligned with the AMR waypoints.

### Wave 2: CNC-01 Milling Center & PRESS-01 Forging Press Deep Detailing
- **Task 2.1**: Upgrade `CNC-01` into a DMG MORI style enclosed 5-axis machining center with sliding safety doors, side tool carousel magazine with tool holders, swarf chip auger chute with chip bin, coolant spray nozzles, and internal cyan worklight.
- **Task 2.2**: Upgrade `PRESS-01` with overhead hydraulic oil reservoir tank with sight gauge, hydraulic manifold block with braided stainless hoses, infrared photoelectric safety light curtains (glowing ruby beams), polished chrome ram, and stamping shockwave ring + hot billet thermal radiation.

### Wave 3: CONV-01 Laser QC Inspection Gate, AGV-01 AMR Headlights & Atmospheric Particles
- **Task 3.1**: Upgrade `CONV-01` with emergency E-stop pull cords, an enclosed Laser QC Inspection Tunnel arch with overhead digital HUD readout and pulsing vertical laser triangulation plane, and palletized turbine/avionics fixtures.
- **Task 3.2**: Upgrade `AGV-01` AMR with rotating 3D LiDAR cone, forward roving headlights that illuminate the floor in front of the vehicle, flashing amber safety beacon, and secured payload pallet.
- **Task 3.3**: Add subtle industrial atmospheric dust motes particle cloud (`THREE.Points`) and dynamic machine interior worklights in `web/js/scene.js`.

### Wave 4: Integration, Full Regression & Final Verification Gate
- **Task 4.1**: Verify ES6 syntax across all JS modules with `node --check web/js/*.js`.
- **Task 4.2**: Verify full Python test suite with `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`.
- **Task 4.3**: Verify WebGL rendering performance, camera director transitions, and SCADA drawer interactions.
- **Task 4.4**: Produce `VERIFICATION.md` and commit atomic outcomes following git identity rules.
