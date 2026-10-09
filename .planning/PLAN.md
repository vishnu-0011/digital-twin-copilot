# Plan: End-to-End Pipeline & SCADA UI Refinement

## Backpressure Command
`./venv/bin/python -m unittest discover -s tests -p "test_*.py"`

---

## Tasks

### Task 1: Pipeline Data Model & API Endpoints (Tracer)
- **Objective:** Add `/pipeline/flow` endpoint in `api/main.py` that computes Titan Aerospace production stages (WIP units, throughput, cycle times, bottleneck alert) and AI inference trace status. Update `digital_twin/models.py` and `tests/test_api_web.py`.
- **Target Files:** `api/main.py`, `tests/test_api_web.py`.
- **Verification:** Unit test `tests/test_api_web.py` passes for `/pipeline/flow`.

### Task 2: Camera Preset Director & Dynamic AGV Follow Cam
- **Objective:** Add camera preset methods in `web/js/scene.js` (`setCameraPreset('global' | 'cnc' | 'press' | 'conv' | 'agv')`) with cinematic easing and continuous tracking in `animate()` loop when in AGV follow mode. Add director buttons to `web/index.html`.
- **Target Files:** `web/js/scene.js`, `web/index.html`, `web/js/app.js`.
- **Verification:** Verify camera moves smoothly to each target and follows AGV without jitter.

### Task 3: Interactive End-to-End Pipeline & Flow Bar UI
- **Objective:** Build the dual-mode process pipeline ribbon docked at the bottom/top of the screen. Mode 1 shows Titan Aerospace production stages (Ingot → CNC → Press → Conveyor → AGV) with animated WIP part badges and bottleneck highlights. Mode 2 shows the live AI Reasoning Chain.
- **Target Files:** `web/index.html`, `web/css/style.css`, `web/js/hud.js`, `web/js/app.js`.
- **Verification:** Clicking tab switches modes; live data updates from `/pipeline/flow`.

### Task 4: Refined SCADA Inspection Drawer & Dual-Trace Oscilloscope
- **Objective:** Refactor `#machine-drawer` into a 3-tab layout: (1) Telemetry & Dual-Trace Oscilloscope (Vibration RMS + Temperature gradient on canvas), (2) 2021 TCN Prognostics with 15% safety buffer breakdown, (3) Titan Aerospace SOP protocols with actionable checkmarks and ISO 10816 vibration classification.
- **Target Files:** `web/index.html`, `web/css/style.css`, `web/js/hud.js`.
- **Verification:** Waveform canvas renders dual channels smoothly; tabs switch cleanly.

### Task 5: Testing, Polish, Audio Feedback & Documentation
- **Objective:** Run full test suite (`python -m unittest discover -s tests`), polish Web Audio clicks and transitions, update documentation in `README.md`, and verify zero console errors.
- **Target Files:** `tests/test_api_web.py`, `README.md`, `web/js/audio.js`.
- **Verification:** All 15+ automated tests pass; application serves 3D UI at `http://localhost:8000/`.
