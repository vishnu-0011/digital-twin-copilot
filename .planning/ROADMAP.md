# Roadmap: Titan Aerospace Digital Twin Copilot

## Milestone v2.0: End-to-End Pipeline & SCADA Refinement

### Phase 1: Pipeline Data Model & API Endpoints (Tracer)
- **Goal**: Implement backend telemetry endpoints `/pipeline/flow` and enterprise branding models.
- **Deliverables**: Updated `api/main.py`, `digital_twin/models.py`, `tests/test_api_web.py`.
- **Status**: Ready for execution.

### Phase 2: Camera Preset Director & Dynamic AGV Follow Cam
- **Goal**: Implement 1-click camera transitions and real-time AGV tracking in Three.js scene engine.
- **Deliverables**: Updated `web/js/scene.js`, camera director controls in `web/index.html`.
- **Status**: Planned.

### Phase 3: Interactive End-to-End Pipeline & Flow Bar UI
- **Goal**: Build the dual-mode process pipeline ribbon (Manufacturing Stages + AI Inference Chain).
- **Deliverables**: Updated `web/js/hud.js`, `web/css/style.css`, `web/index.html`.
- **Status**: Planned.

### Phase 4: Refined SCADA Inspection Drawer & Dual Oscilloscope
- **Goal**: Upgrade inspection drawer with tabbed layout, dual-trace oscilloscope canvas, and Titan SOPs.
- **Deliverables**: Updated `web/js/hud.js`, `web/css/style.css`, `web/js/app.js`.
- **Status**: Planned.

### Phase 5: Verification, Audio Polish & Packaging
- **Goal**: Validate end-to-end flow with automated test suite, verify audio micro-interactions, commit atomically.
- **Deliverables**: Passing test suite, updated README, atomic git commit.
- **Status**: Planned.
