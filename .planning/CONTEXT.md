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
- **Unified Pipeline Ribbon:** Dockable/collapsible ribbon with two selectable tabs: `[🏭 Physical Production Flow]` and `[🧠 AI Inference Trace]`.
- **Camera Director Bar:** Floating sleek glassmorphic pill bar offering instant 1-click camera transitions (`Global`, `CNC-01`, `PRESS-01`, `CONV-01`, `AGV-01 Follow`).
- **Tabbed SCADA Drawer:** Inspection drawer partitioned into:
  - Tab 1: **Telemetry & Dual Oscilloscope** (Vibration RMS + Temperature thermal curve).
  - Tab 2: **2021 TCN Prognostics** (Cycle forecast, hours remaining, 15% safety buffer breakdown).
  - Tab 3: **Aerospace SOP Protocol** (Grounded ISO 10816 root-cause steps with checkboxes).
- **Zero API Keys & Zero Build Tools:** 100% offline, pure Python/PyTorch/FastAPI backend, vanilla Three.js + ES6 frontend.

## Verification & Backpressure Seams
- Automated test command: `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`
- Live API response checks: `GET /fleet`, `GET /pipeline/flow`, `POST /simulate`, `POST /maintenance/trigger`.
- Visual validation: WebGL scene rendering at 60 FPS without console errors.
