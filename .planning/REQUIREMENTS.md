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
