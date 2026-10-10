# PRD: 3D Isometric Strategy-Game Factory Twin UI

## Problem & User Intent
The user requests a complete redesign of the user interface into an interactive **3D isometric strategy-game style operations center**, inspired by the reference concept (`darkvex.ai`), where managing the factory floor feels like playing an RTS/strategy game (Factorio/SimCity meets high-tech industrial SCADA). The UI must connect end-to-end to our SimPy Digital Twin, the 2021 TCN ML Prognostics engine, the local NLP SOP Diagnosis engine, and closed-loop maintenance actions.

## Mental Model & Core Abstractions
1. **The 3D Factory Floor:** An isometric orthographic 3D scene featuring interactive procedural industrial assets (`CNC-01` Mill, `PRESS-01` Hydraulic Press, `CONV-01` Conveyor Line, and an autonomous patrol AGV).
2. **Visual Telemetry & Physical Wear Cues:** Machines visually reflect their physical degradation: high wear triggers dynamic vibration jitter, glowing heat auras, and color-coded holographic status rings.
3. **Floating 3D Holographic Badges:** Hovering 3D markers display real-time status (`HEALTHY` 🟢, `WARNING` 🟡, `CRITICAL` 🔴, `REPAIRING` 🔧) and predicted RUL cycles directly above the assets.
4. **Click-to-Inspect Holographic Drawer:** Clicking any 3D asset smoothly zooms the camera in and slides out a glassmorphic HUD detailing real-time sensor waveforms, 2021 TCN predictions (with 15% safety buffer), plant SOP diagnoses, and an instant "Trigger Maintenance" action.
5. **Radar Scan & Copilot Actions:** A "Scan Factory" button triggers a glowing laser radar sweep across the 3D grid, executing `/monitor/check` and highlighting flagged machines.
6. **Zero-Build, High-Performance WebGL:** Built with Three.js via vanilla ES6 modules and modern CSS glassmorphism, served directly by FastAPI at `http://localhost:8000/`. Zero Node.js build overhead, 60 FPS hardware-accelerated.

## Verification & Backpressure
Command(s) to verify:
- Automated tests: `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`
- Static web assets validation: HTTP GET `http://localhost:8000/` and API endpoints.

---

## Discrete Tasks

### Task 1: FastAPI Static Web Mounting & Maintenance Action API
- **Objective:** Configure FastAPI in `api/main.py` to serve static web files from `web/` at `/`, and add a dedicated `POST /maintenance/trigger` endpoint so the 3D UI can manually trigger maintenance and reset wear on individual machines.
- **Acceptance Criteria:** `GET /` serves HTML, and `POST /maintenance/trigger` successfully triggers maintenance on any valid machine ID.
- **Target Files:** `api/main.py`, `tests/test_api_web.py`.

### Task 2: 3D Scene Engine & Procedural Industrial Machinery Models
- **Objective:** Build the core Three.js WebGL scene with an isometric/orthographic camera, soft shadows, an industrial grid floor, and animated procedural 3D models for the CNC Mill, Hydraulic Press, Conveyor Belt, and roaming AGV robot.
- **Acceptance Criteria:** 3D scene renders cleanly with working animations (spindle spinning, press stamping, conveyor moving parts, AGV pathfinding) and visual wear effects (jitter and heat glow).
- **Target Files:** `web/js/scene.js`, `web/js/models.js`.

### Task 3: Sci-Fi Glassmorphic HUD & Web Audio Synthesizer
- **Objective:** Build the modern dark-mode glassmorphic HUD overlay (top OEE & production metrics, speed toggles, simulation controls, floating 3D machine badges) and a procedural Web Audio API sound synthesizer with mute control.
- **Acceptance Criteria:** HUD overlays render crisply with responsive styling, floating 3D labels track machine positions accurately, and audio plays subtle UI feedback on user actions.
- **Target Files:** `web/css/style.css`, `web/js/hud.js`, `web/js/audio.js`.

### Task 4: Interactive Inspection Panel, Radar Scan & Full State Sync
- **Objective:** Wire machine click-to-focus interactions, the slide-out holographic inspection drawer (live vibration graphs, 2021 TCN RUL, SOP diagnosis cards, maintenance action button), and the "Scan Factory" laser radar sweep. Sync real-time state with `/fleet`, `/simulate`, and `/monitor/check`.
- **Acceptance Criteria:** Clicking any machine focuses the 3D camera and displays live telemetry & TCN forecasts; clicking "Trigger Maintenance" immediately repairs the machine in 3D and resets wear; "Scan Factory" sweeps the grid and executes the agent cycle.
- **Target Files:** `web/js/app.js`, `web/index.html`.

### Task 5: End-to-End Testing, Polish & Documentation
- **Objective:** Test the entire application across unit tests and live API requests, ensure smooth 60 FPS rendering, add documentation in `README.md`, and verify zero console errors.
- **Acceptance Criteria:** Full test suite passes, FastAPI serves the 3D Strategy Game UI at `http://localhost:8000/`, and documentation is updated.
- **Target Files:** `README.md`, `tests/test_api_web.py`.
