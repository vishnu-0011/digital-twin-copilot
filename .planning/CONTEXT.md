# Phase Context: End-to-End Pipeline & SCADA UI Refinement

## Problem & User Intent
The user requested an end-to-end monitoring pipeline of the entire manufacturing process to make it effortless to understand and present, anchored by a mock aerospace company ("Titan Aerospace Precision Fab"). In addition, the user specified UI refinements:
1. Adding an interactive **End-to-End Pipeline & Flow Bar** representing real-time part movement across stages and the live AI reasoning chain.
2. Adding one-click **Camera Preset Director** buttons (Overview, CNC-01 Focus, Press Focus, Conveyor Focus, and dynamic AGV Follow Cam).
3. Upgrading the **Machine Inspection Drawer** with larger interactive sensor plots, tabs, and clearer failure diagnosis breakdown.
4. Reducing AI slop throughout by strictly aligning with the tactile game feel and micro-interactions of the reference video (`darkvex.ai`).

## Mental Model & Core Abstractions
1. **Mock Enterprise Metaphor:** "Titan Aerospace Precision Fab" — specialized in mission-critical aircraft turbine blades (Inconel 718) and titanium structural bulkheads.
2. **Manufacturing Pipeline Stages:**
   - **Stage 1: Raw Billet Ingestion** (Raw material staging)
   - **Stage 2: CNC Milling Center (`CNC-01`)** (5-axis high-speed turbine blade machining)
   - **Stage 3: 1000-Ton Hydraulic Forging Press (`PRESS-01`)** (Bulkhead forging & stamping)
   - **Stage 4: Automated Assembly Conveyor (`CONV-01`)** (Inline laser QC & avionics integration)
   - **Stage 5: Autonomous Patrol AGV (`AGV-01`)** (Final transit to cleanroom depot)
3. **AI Reasoning Pipeline Trace:**
   - Sensors (60Hz Raw) → Feature Extractor (Zero Leakage) → 2021 Dilated TCN (RUL Prognostics) → Isolation Forest (Anomalies) → ChromaDB SOP RAG (Diagnosis) → Asymmetric Scheduler (15% Safety Buffer) → Physical Twin Interruption.
4. **Cinematic Director Mode:** Camera smooth-glides between presets and can latch on to the mobile AGV rover in dynamic follow-cam mode.

## Locked Architectural Decisions
- **Visual Design:** Full Darkvex RTS Aerospace Complex (`darkvex.ai`):
  - **Environment & Warehouse:** Multi-tier High-Bay Storage Racking (ASRS) along perimeter walls stocked with aerospace palletized crates and glowing barcoded waypoints; continuous gliding overhead yellow industrial gantry crane spanning the facility; rectangular hazard-striped floor runway corridor matching AMR navigation path.
  - **CNC-01 Milling Center:** DMG MORI style enclosed 5-axis aerodynamic machining center with dual sliding safety glass doors, internal swarf chip auger chute with scrap bin, side tool carousel magazine with collet holders, coolant spray nozzles, translating X/Z toolhead carriage, and interior cyan worklight.
  - **PRESS-01 1000-Ton Forging Press:** Overhead hydraulic fluid reservoir tank with fluid sight gauge, dual nitrogen accumulators, manifold block with braided stainless hoses, infrared photoelectric safety light curtains (glowing ruby beams), polished chrome ram, and hot titanium billet with stamping impact shockwaves.
  - **CONV-01 Assembly & QC Tunnel:** Extruded aluminum dual-rail conveyor with emergency E-stop pull cords, enclosed Laser QC Inspection Tunnel arch with overhead digital HUD readout and pulsing vertical laser triangulation plane, and palletized avionics/blade fixtures.
  - **AGV-01 AMR Autonomous Rover:** Low-profile industrial AMR with side hazard chevron skirts, rotating 3D LiDAR cone beam, forward LED driving headlights that cast light on the floor, flashing amber safety beacon, and cargo pallet payload.
  - **Atmospheric FX:** Subtle floating industrial dust motes particle cloud, dynamic roving spotlight following the AMR, and machine interior worklights.
- **Unified Pipeline Ribbon:** Dockable/collapsible ribbon with two selectable tabs: `[🏭 Physical Production Flow]` and `[🧠 AI Inference Trace]`.
- **Camera Director Bar:** Floating sleek glassmorphic pill bar offering instant 1-click camera transitions (`Global`, `CNC-01`, `PRESS-01`, `CONV-01`, `AGV-01 Follow`).
- **Tabbed SCADA Drawer:** Telemetry oscilloscope, 2021 TCN RUL breakdown, and ISO 10816 SOP protocol.
- **Zero External Downloads / Zero Build Tools:** 100% offline procedural Three.js WebGL geometry, zero external glTF/OBJ downloads, 60 FPS performance.

## Verification & Backpressure Seams
- Automated test command: `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`
- JavaScript syntax check: `node --check web/js/*.js`
- Live API response checks: `GET /fleet`, `GET /pipeline/flow`, `POST /simulate`
- WebGL scene rendering at 60 FPS without console errors.
