## 🏭 Titan Aerospace — Darkvex RTS 3D Operations Center & Pure ML Digital Twin Copilot

> **Reference Inspiration:** [darkvex.ai Instagram Reel](https://www.instagram.com/reel/DeG2mQszTrc/) — *"What if managing an entire warehouse felt like playing a strategy game?"*  
> **100% Pure Local Machine Learning &bull; 100% Offline &bull; ZERO API Keys &bull; Zero Node/NPM Build Overhead**

---

### 📸 Visual Showcase: Multi-Angle 3D Operations Center

| 🌐 **1. Global Factory Overview** | ⚙️ **2. CNC-01 5-Axis Machining Center** |
| :---: | :---: |
| ![01_factory_overview](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/01_factory_overview.png) | ![02_cnc_mill_focus](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/02_cnc_mill_focus.png) |
| *Full plant overview with High-Bay Racks, traversing gantry crane, hazard pads, and live pipeline ribbon.* | *Enclosed 5-axis mill with tool carousel magazine, swarf chip auger, sliding glass doors & coolant mist.* |

| 🔨 **3. PRESS-01 1000-Ton Forging Press** | 📦 **4. CONV-01 Laser QC Inspection Tunnel** |
| :---: | :---: |
| ![03_hydraulic_press_focus](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/03_hydraulic_press_focus.png) | ![04_conveyor_laser_qc_focus](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/04_conveyor_laser_qc_focus.png) |
| *Tie-rod columns, fluid reservoir, nitrogen accumulators, photoelectric ruby light curtains & hot billet.* | *Dual-rail conveyor with emergency E-stop cords, digital tolerance HUD & vertical laser triangulation sheet.* |

| 🤖 **5. AGV-01 AMR Rover Chase Cam** | 📊 **6. Holographic SCADA Drawer Diagnostics** |
| :---: | :---: |
| ![05_agv_patrol_chase](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/05_agv_patrol_chase.png) | ![06_scada_drawer_diagnostics](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/06_scada_drawer_diagnostics.png) |
| *Follow-cam tracking AMR with rotating 3D LiDAR cone, forward floor headlights & secured cargo.* | *Slide-out drawer with 60 FPS dual-channel oscilloscope, 2021 TCN RUL forecast & ISO 10816 SOP protocol.* |

| 🧠 **7. AI Inference Reasoning Pipeline Trace** |
| :---: |
| ![07_ai_reasoning_pipeline](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/07_ai_reasoning_pipeline.png) |
| *Real-time 6-step AI trace: Sensors ➔ Features ➔ 2021 TCN ➔ Anomaly Gate ➔ SOP Match ➔ Asymmetric Scheduler.* |

---

### 🎯 Key Features & Architectural Upgrades

#### 1. Procedural 3D Machinery & Industrial Plant (`web/js/models.js` & `web/js/scene.js`)
* **Perimeter High-Bay Warehouse Racks (ASRS)**: 3-tier industrial shelving along the rear walls with blue structural uprights, orange load beams, loaded wood pallets with aerospace billet crates, and glowing RFID inventory badges.
* **Traversing Overhead Industrial Gantry Crane**: Dual runway girders spanning the plant at $Y = 12.5\text{m}$. Yellow crane bridge continuously traverses the facility bay ($X = \pm 8.0\text{m}$) with a motorized hoist trolley, steel wire rope, heavy lifting hook, flashing amber strobe, and suspended turbofan casing.
* **`CNC-01` 5-Axis Milling Center**: DMG MORI style enclosed cabin with sliding safety glass doors, radial 6-tool carousel magazine, chip auger ejection trough feeding a roll-away chip bin, translating $X/Z$ tool carriage cutting an Inconel 718 airfoil, pulsating coolant mist, and interior cyan worklight.
* **`PRESS-01` 1000-Ton Hydraulic Forging Press**: Chromed tie-rod columns with hex nut caps, overhead hydraulic fluid reservoir with sight gauge, nitrogen accumulators, manifold block, photoelectric ruby infrared light curtains, and a glowing $1200^\circ\text{C}$ hot billet with floor impact shockwaves.
* **`CONV-01` Dual-Rail Conveyor & Laser QC Gate**: Modular aluminum extrusion frame with red emergency E-stop pull cords, enclosed inspection tunnel arch with overhead digital HUD (`TOLERANCE ±0.002mm • LASER TRIANGULATION ACTIVE`), and vertical laser triangulation scanning plane.
* **`AGV-01` Armored AMR Rover**: Mecanum drive with side hazard chevrons, rotating 3D LiDAR puck with cyan scanning cone, flashing amber mast beacon, and twin forward driving headlights casting real illumination onto the floor ahead of the robot.
* **Atmospheric Dust Motes & Worklights**: 180 floating industrial dust motes drifting across the facility volume catching overhead floodlights.

#### 2. Process Pipeline Ribbon & Enterprise Context (`GET /pipeline/flow`)
* **Mock Enterprise Identity**: Rebranded telemetry and workcells around **Titan Aerospace Precision Fab** (Inconel 718 turbine blades, titanium airframe bulkheads, and avionics cores).
* **Dual-Mode Process Ribbon**:
  * **Manufacturing Line Flow**: Real-time part transit from Ingot Ingestion ➔ CNC Milling ➔ 1000T Forging ➔ Laser QC Gate ➔ AGV Cleanroom Transit with WIP counters and line balance metrics.
  * **AI Reasoning Chain**: 6-step end-to-end inference trace showing sensor feeds, zero-leakage feature extraction, 2021 TCN prognostics, Isolation Forest gating, ChromaDB SOP matching, and risk-buffered scheduling.
* **Shift Reset Endpoint (`POST /fleet/reset`)**: Restores plant fleet to pristine shift-start condition on demand.

#### 3. Holographic SCADA Drawer & Camera Director Bar
* **Camera Director Presets**: 5 one-click cinematic presets (`🌐 Overview`, `⚙️ CNC Mill`, `🔨 1000T Press`, `📦 Conveyor`, `🤖 Follow AGV Chase Cam`).
* **Tabbed SCADA Drawer**:
  * **Telemetry Tab**: Physical wear progression bar, 60 FPS dual-channel oscilloscope (Vibration RMS + Core Thermal gradient), and ISO 10816 vibration classification (Zone A/B/C/D).
  * **TCN Prognostics Tab**: 2021 TCN remaining useful life prediction with receptive field specs and 15% asymmetric safety margin breakdown.
  * **Titan SOP Tab**: Grounded ISO 10816 root-cause steps with interactive checklist and closed-loop maintenance execution button (`POST /maintenance/trigger`).

#### 4. 100% Pure Machine Learning & Physical Twin Engine
* **2021 PHM Winner TCN**: 1D Dilated Causal Temporal Convolutional Network with residual connections ($d = 1, 2, 4, 8$) trained on degradation sequences.
* **Zero Feature Leakage**: Strictly observable physical sensors (`vibration_rms`, `temperature_c`, $\Delta\text{vib}$, $\Delta\text{temp}$).
* **15% Asymmetric Safety Buffer**: $\text{RUL}_{\text{safe}} = 0.85 \times \text{RUL}_{\text{pred}}$ to eliminate catastrophic in-cut spindle crashes.
* **Local NLP Diagnosis**: TF-IDF cosine similarity against ChromaDB plant SOPs — zero external LLM API keys required.

---

### 🧪 Verification & Backpressure Testing

* [x] **Unit & Integration Tests**: 16/16 tests passing in 34.5s (`./venv/bin/python -m unittest discover -s tests -p "test_*.py"`).
* [x] **JavaScript Syntax Validation**: `node --check web/js/*.js` clean with zero syntax errors.
* [x] **FastAPI Endpoints**: `GET /health`, `GET /fleet`, `GET /pipeline/flow`, `POST /simulate`, `POST /maintenance/trigger`, `POST /fleet/reset` verified live.
* [x] **Hardware-Accelerated 3D WebGL**: Verified at 60 FPS across all camera presets.
* [x] **Zero Build Overhead**: 100% offline self-containment with vendored Three.js and native ES6 modules.
