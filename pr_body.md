## 🏭 Titan Aerospace — Campus Exterior, Dollhouse Interior & Pure ML Digital Twin Copilot

> **Reference Inspiration:** [darkvex.ai Strategy-Game Aesthetic](https://www.instagram.com/reel/DeG2mQszTrc/) — *"What if managing an entire aerospace plant felt like playing an RTS strategy game?"*  
> **100% Pure Local Machine Learning &bull; 100% Offline &bull; ZERO API Keys &bull; Zero Node/NPM Build Overhead**

---

### 🎥 Live Motion Demonstration (3-Second Tour)
![Titan Aerospace Operations Tour](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/videos/factory_tour.gif)

---

### 📸 Visual Showcase: Titan Aerospace Campus & Mega-Factory (12 Live Views)

| 🏢 **1. Titan Aerospace City Campus Exterior** | 🌐 **2. Cleanroom Dollhouse Cutaway Interior** |
| :---: | :---: |
| ![01_town_campus_overview](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/01_town_campus_overview.png) | ![01_cleanroom_mega_factory_overview](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/01_cleanroom_mega_factory_overview.png) |
| *Exterior covered building shell, rooftop HVAC & solar arrays, busy 2-lane roads with moving traffic, parking lot, and open vista.* | *Interactive dollhouse cutaway with 64m × 48m cleanroom epoxy floor, 8 workcells across 4 bays, and 10-stage process pipeline.* |

| ⚙️ **3. Bay 1: CNC Machining Centers** | 🔨 **4. Bay 2: Heavy Forming & Thermal** |
| :---: | :---: |
| ![02_bay1_cnc_machining_centers](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/02_bay1_cnc_machining_centers.png) | ![03_bay2_forming_vacuum_furnace](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/03_bay2_forming_vacuum_furnace.png) |
| *`CNC-01` 5-Axis Heavy Roughing Mill and `CNC-02` High-Speed Airfoil Finishing Center with mist extraction & Siemens 840D console.* | *`PRESS-01` 1000T Forge, `PRESS-02` 500T Extrusion Press with runoff table, and `FURN-01` Vacuum Carburizing Furnace.* |

| 🤖 **5. Bay 3: Robotics & Quality Control** | 📦 **6. Bay 4: Avionics Assembly Line** |
| :---: | :---: |
| ![04_bay3_robotics_laser_metrology](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/04_bay3_robotics_laser_metrology.png) | ![05_bay4_avionics_assembly_line](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/05_bay4_avionics_assembly_line.png) |
| *`ROBOT-01` 6-DOF deburring robotic arm inside safety fencing and `LASER-01` Dual Laser Triangulation QC Arch on granite.* | *Dual-rail conveyor with emergency E-stop cords, digital tolerance HUD, and laser QC inspection tunnel with scanning sheet.* |

| 🚚 **7. Autonomous Logistics Fleet (AMR Chase)** | 🅿️ **8. Company Parking Area & Covered Corridor** |
| :---: | :---: |
| ![06_agv_autonomous_logistics](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/06_agv_autonomous_logistics.png) | ![08_company_parking_corridor](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/08_company_parking_corridor.png) |
| *Dynamic follow-cam tracking `AGV-01` navigating transit corridors with rotating 3D LiDAR cone & driving headlights.* | *Marked employee parking, parked cars, EV charging pedestals, security guardhouse, and covered pedestrian walkway canopy.* |

| 📊 **9. Holographic SCADA Inspection Drawer** | 🏭 **10. 10-Stage Process Pipeline Ribbon** |
| :---: | :---: |
| ![07_cleanroom_scada_diagnostics](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/07_cleanroom_scada_diagnostics.png) | ![08_end_to_end_10stage_pipeline](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/08_end_to_end_10stage_pipeline.png) |
| *Slide-out SCADA drawer with live 60 FPS oscilloscope, 2021 TCN RUL forecast, ISO 10816 bands, and closed-loop maintenance button.* | *Interactive docked ribbon mapping all 10 physical stages with real-time WIP counters, cycle times, and click-to-focus.* |

| 🌙 **11. Cyberpunk Strategy Night Theme** | 🚪 **12. Executive Cleanroom Entrance Portal** |
| :---: | :---: |
| ![09_dark_mode_cyberpunk_view](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/09_dark_mode_cyberpunk_view.png) | ![10_titan_aerospace_entrance_portal](https://raw.githubusercontent.com/vishnu-0011/digital-twin-copilot/feat/3d-strategy-game-ui/docs/screenshots/10_titan_aerospace_entrance_portal.png) |
| *Dark strategy environment with illuminated headlights, streetlamps, electric cyan grid (`0x00f3ff`), and dark SCADA HUD.* | *Illuminated dual-sided "▲ TITAN AEROSPACE" signage, automated glass airlock doors, RFID pedestals, and covered walkway connection.* |

---

### 🎯 Key Enhancements & Milestone Deliverables

#### 1. Architectural Building Shell & Dollhouse Cutaway Interaction
* **Covered Building Exterior**: Added procedural architectural walls, ribbon windows, parapets, roof slab, 4 skylight lanterns, 3 rooftop HVAC chiller skids with spinning fan blades, 2 solar panel arrays, and illuminated rooftop "▲ TITAN AEROSPACE" signage.
* **Dollhouse Cutaway Mode**: By default, loads in Campus View with the covered building shell. Clicking anywhere on the building (or clicking `🏭 Interior` on the Director bar) triggers a smooth camera glide into the cleanroom, fading out the roof and upper walls to reveal the active interior.
* **Smart Mode Switching**: Screen-space floating badges dynamically swap: a single glowing portal badge (`TITAN AEROSPACE CAMPUS • 8 Workcells Active • Click to Enter →`) displays in Campus View, and 8 individual machine telemetry badges project in Interior View.

#### 2. Busy Town Environment & Company Campus Infrastructure
* **Two-Lane Perimeter Roads**: 175m × 155m urban ground with perimeter two-lane asphalt roads, dashed yellow centerlines, and pedestrian crosswalks.
* **Continuous Animated Vehicle Traffic**: 6 animated procedural vehicles (coupes, delivery vans, box cargo trucks) driving continuously along closed-loop waypoint paths around the facility.
* **Dedicated Company Parking Lot**: Marked parking stalls, 8 parked employee/fleet vehicles, dual EV charging stations with charging cables, and a security guardhouse with motorized barrier gate.
* **Covered Pedestrian Transit Corridor**: Modern steel-and-glass covered walkway canopy connecting the parking lot directly to the factory cleanroom entrance airlock.
* **Urban Detailing**: 12 modern LED streetlamps, 12 stylized street trees, and an open, uncluttered vista highlighting the aerospace facility.

#### 3. Facility Scale: 8 Distinct Aerospace Workcells across 4 Zoned Bays
* **Bay 1 (Machining Bay)**: `CNC-01` 5-Axis Heavy Roughing Mill & `CNC-02` 5-Axis High-Speed Airfoil Finishing Center.
* **Bay 2 (Forming & Thermal Bay)**: `PRESS-01` 1000-Ton Forging Press, `PRESS-02` 500-Ton Extrusion Press, & `FURN-01` Vacuum Carburizing Furnace.
* **Bay 3 (Robotics & Metrology Bay)**: `ROBOT-01` 6-DOF Robotic Deburring Arm & `LASER-01` Dual Laser Triangulation Arch.
* **Bay 4 (Assembly Line Bay)**: `CONV-01` Avionics Assembly Line Conveyor with enclosed laser QC tunnel.
* **Logistics Fleet**: `AGV-01` & `AGV-02` AMRs with 3D LiDAR sensors, floor spotlights, and safety beacons.

#### 4. Dual Executive Cleanroom Light & Cyberpunk Dark Themes
* **Light Cleanroom**: Crisp daylight, polished white epoxy slab (`#f3f4f6`), high-contrast dark typography, frosted glass HUD.
* **Cyberpunk Dark**: Reflective obsidian floor, neon cyan grid (`0x00f3ff`), vehicle headlights, streetlamps, and atmospheric dust motes.
* **Adaptive SCADA & Oscilloscope**: Dynamic dual-channel oscilloscope trace and theme synchronization.

#### 5. 100% Pure ML & Self-Contained Offline Architecture
* **2021 PHM Challenge Winner TCN**: 1D Dilated Causal Temporal Convolutional Network ($d = 1, 2, 4, 8$) trained locally without external cloud APIs.
* **Zero Feature Leakage**: Strictly observable sensors (`vibration_rms`, `temperature_c`, $\Delta\text{vib}$, $\Delta\text{temp}$).
* **15% Asymmetric Safety Buffer**: $\text{RUL}_{\text{safe}} = 0.85 \times \text{RUL}_{\text{pred}}$ preventing catastrophic spindle tool crashes.
* **Zero Node/NPM build overhead & zero API keys required**.

#### 6. Teammate Master Guide & Architectural Deep-Dive (`About.md`)
* Added comprehensive, beginner-friendly **`About.md`** covering elevator pitch, digital twin mechanics, SimPy telemetry generation, TCN model mechanics, ISO 10816 vibration classification, executive FAQ (ROI, air-gapped security, brownfield retrofit, alarm fatigue), file-by-file directory tour, local demo guide, and presentation pitch script.

---

### 🧪 Verification
* **Test Suite**: `./venv/bin/python -m unittest discover -s tests -p "test_*.py"` &rarr; **16 tests passing (100%)**.
* **JavaScript Syntax Validation**: `node --check web/js/*.js` &rarr; **0 errors**.
* **Live API Endpoints**:
  * `GET /health` &rarr; `{"status": "ok", "mode": "100% Pure ML (Zero API Keys)", "rul_backend": "tcn_2021"}`
  * `GET /fleet` &rarr; Returns all 8 machines with live telemetry and TCN RUL scores.
  * `GET /pipeline/flow` &rarr; Returns 10 stages and 6-step AI reasoning trace.
* **Screenshots**: Multi-angle 1080p captures verified in `docs/screenshots/`.
