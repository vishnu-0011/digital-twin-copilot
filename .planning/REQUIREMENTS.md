# Project Requirements: Titan Aerospace 3D Digital Twin Operations Center

## Requirements Matrix

### Enterprise Identity & Manufacturing Model
- **REQ-01**: Rename and rebrand all frontend and backend telemetry contexts to "Titan Aerospace Precision Fab", specifying aerospace parts (Inconel 718 Turbine Blades, Titanium Airframe Ribs, Avionics Modules).
- **REQ-02**: Provide enterprise business telemetry metrics in top KPI strip: Parts Completed, Line Balance / OEE %, and Cost of Unplanned Downtime Prevented ($/hr).

### End-to-End Pipeline & Flow Bar
- **REQ-03**: Implement `/pipeline/flow` backend endpoint returning real-time manufacturing stage statistics, WIP inventory, and AI inference latency trace.
- **REQ-04**: Build an interactive, collapsible bottom/docked **Process Pipeline Ribbon** featuring dual view modes:
  - **Physical Production Line Mode**: Ingot Staging → CNC Milling → Hydraulic Forge → Conveyor QC → AGV Dispatch, with animated WIP part tokens.
  - **AI Reasoning Chain Mode**: 60Hz Telemetry → Zero-Leakage Features → 2021 TCN Prognostics → Isolation Forest Anomaly Gate → ChromaDB SOP Matcher → Asymmetric Scheduler.

### Camera Director Presets
- **REQ-05**: Implement a sleek floating **Camera Preset Director Bar** with instant buttons:
  - `🌐 Global Overview` (Standard 45° isometric overview)
  - `⚙️ CNC Mill` (Tight framing on CNC work chamber)
  - `🔨 Hydraulic Press` (Framing on 1000T hydraulic ram)
  - `📦 Conveyor Line` (Framing on assembly conveyor)
  - `🤖 AGV Follow Cam` (Dynamic continuous camera tracking following the roaming AGV)

### Refined SCADA Inspection Drawer
- **REQ-06**: Restructure the inspection drawer into an interactive tabbed layout (`Telemetry & Oscilloscope`, `TCN Prognostics`, `Titan SOP Protocols`).
- **REQ-07**: Implement dual-channel oscilloscope canvas rendering high-frequency vibration waveforms and thermal gradient simultaneously.
- **REQ-08**: Enhance SOP protocol with interactive diagnostic checkmarks, ISO 10816 vibration severity band indicator, and prominent closed-loop maintenance execution.

### Non-Functional & Verification
- **REQ-09**: Zero external API keys, zero node/npm build dependencies, 100% offline self-containment.
- **REQ-10**: Full automated test coverage passing `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`.

### 3D Models Refactor & Darkvex RTS Strategy Aesthetic
- **REQ-11**: Procedural High-Bay Storage Racking (ASRS) along perimeter walls with multi-tier steel shelves, stacked aerospace pallets, and barcode indicator beacons.
- **REQ-12**: Dynamic traversing overhead yellow industrial gantry crane with motorized winch cable and hoist trolley slowly traveling across the facility bay.
- **REQ-13**: DMG MORI style enclosed 5-axis CNC-01 milling center with dual sliding safety glass doors, internal swarf chip auger chute with scrap bin, side tool carousel magazine with collets, coolant spray nozzles, translating carriage, and interior cyan worklight.
- **REQ-14**: PRESS-01 1000-Ton hydraulic forging press with overhead oil reservoir, nitrogen accumulators, manifold with braided hoses, infrared photoelectric safety light curtains, polished chrome ram, and stamping shockwave ring + hot billet thermal radiation.
- **REQ-15**: CONV-01 modular dual-rail conveyor with emergency E-stop pull cords, enclosed Laser QC Inspection Tunnel with digital HUD readout and vertical laser triangulation scan sheet, passing aerospace turbine pallets.
- **REQ-16**: AGV-01 AMR autonomous rover with rotating 3D LiDAR cone, roving forward driving headlights casting light on the floor, flashing amber safety beacon, and subtle floating industrial dust motes particle cloud.

### Milestone v4.0: Executive Cleanroom Mega-Factory & Expanded Fleet
- **REQ-17**: Mega-Factory physics scaling: SimPy simulation with 8 distinct aerospace machine configurations (CNC-01, CNC-02, PRESS-01, PRESS-02, FURN-01, ROBOT-01, CONV-01, LASER-01) with realistic cycle times, wear increments, and 10-stage manufacturing pipeline.
- **REQ-18**: Executive Cleanroom Light Theme: Default architectural light cleanroom styling (`data-theme="light"`), polished white epoxy floor, dark slate typography (`#0f172a`), translucent frosted HUD, daylight lighting, and interactive `☀️ Light / 🌙 Dark` toggle.
- **REQ-19**: 8 Distinct Procedural Machinery Workcells in 3D across 4 zoned bays:
  - Bay 1: Machining (CNC-01 Roughing Mill + CNC-02 Airfoil Finishing Center)
  - Bay 2: Heavy Forming & Thermal (PRESS-01 1000T Forging Press + PRESS-02 500T Extrusion Press + FURN-01 Vacuum Carburizing Furnace)
  - Bay 3: Robotics & Metrology (ROBOT-01 6-DOF Robotic Arm Cell + LASER-01 Dual Laser Triangulation QC Arch)
  - Bay 4: Assembly Line (CONV-01 Dual-rail line)
  - Logistics Fleet: Dual roving AMRs (AGV-01 and AGV-02) with independent coordinated routes and payloads.
- **REQ-20**: Zero AI slop: Concrete industrial engineering metrics (ISO 10816 vibration zones A/B/C/D, real cycle times, OEE calculation, WIP counts, physics-driven wear).

