---
phase: 08-websocket-telemetry
plan: 01
type: execute
tracer_first: true
---

# Plan: Real-Time WebSockets Telemetry & Bi-Directional SCADA Stream

## Objective
Implement a high-performance, real-time WebSocket communication layer (`/ws/telemetry`) in the FastAPI digital twin backend and Three.js frontend, transforming the polling-based operations center into an industrial-grade event-driven telemetry stream with bi-directional command dispatch and automatic HTTP fallback.

## Requirements Addressed
- REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07

## Execution Waves

### Wave 1: Tracer Slice (WebSocket Backend Core & Endpoint)
#### Task 1.1: WebSocket Connection Manager & Broadcast Infrastructure (TDD)
- **Type:** tdd
- **Objective:** Create `ConnectionManager` class in `api/main.py` with connect/disconnect/broadcast capabilities, background broadcaster task in `lifespan`, and `@app.websocket("/ws/telemetry")` route.
- **Target Files:** `api/main.py`, `tests/test_websocket.py`
- **Acceptance Criteria:** `TestClient.websocket_connect("/ws/telemetry")` establishes connection and receives initial telemetry frame containing fleet and pipeline data.
- **Verification Command:** `./venv/bin/python -m unittest tests/test_websocket.py`

### Wave 2: Bi-Directional Command Handling & Frontend Stream Client
#### Task 2.1: Bi-Directional Action Dispatch in Backend (TDD)
- **Type:** tdd
- **Objective:** Implement action handler in WebSocket loop for `ping`, `step`, `repair`, `reset`, and `scan`.
- **Target Files:** `api/main.py`, `tests/test_websocket.py`
- **Acceptance Criteria:** Sending `{"action": "step", "duration_s": 1800}` advances simulation and receives confirmation; sending `repair` resets machine wear.
- **Verification Command:** `./venv/bin/python -m unittest tests/test_websocket.py`

#### Task 2.2: Frontend WebSocket Client, HUD Badge & Seamless Fallback (Auto)
- **Type:** auto
- **Objective:** Integrate WebSocket in `web/js/app.js` with auto-reconnect, fallback to HTTP polling, bi-directional button actions, HUD connection badge in `web/index.html` and styles in `web/css/style.css`.
- **Target Files:** `web/js/app.js`, `web/index.html`, `web/css/style.css`
- **Acceptance Criteria:** UI connects to WebSocket stream, displays `WS: LIVE` badge, updates 3D scene and KPIs without HTTP polling, and falls back to HTTP polling if disconnected.
- **Verification Command:** `node --check web/js/app.js`

### Wave 3: Integration, Regression Verification & Atomic Commit
#### Task 3.1: Full Test Suite Verification & Code Review
- **Type:** auto
- **Objective:** Run full test suite (`unittest discover tests`) ensuring all existing and new tests pass with 100% success rate. Conduct code review and write `VERIFICATION.md`.
- **Target Files:** `.planning/VERIFICATION.md`, `.planning/STATE.md`
- **Acceptance Criteria:** 100% tests passing, zero regression, clean git status.
- **Verification Command:** `./venv/bin/python -m unittest discover tests`
