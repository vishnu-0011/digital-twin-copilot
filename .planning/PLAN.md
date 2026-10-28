---
phase: 09-guided-demo-tour
plan: 01
type: execute
tracer_first: true
---

# Plan: 1-Click Guided Presentation Tour & Anomaly Injection Engine

## Objective
Build an orchestrated, high-impact 1-Click Guided Presentation Tour (`🎬 Guided Demo`) and backend fault injection mechanism, allowing presenters and teammates to deliver an automated, viva-ready demonstration of the digital twin, ML prognostics, and closed-loop agent repair.

## Requirements Addressed
- REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06

## Execution Waves

### Wave 1: Tracer Slice (Backend Fault Injection API & WebSocket Action)
#### Task 1.1: Fault Injection Endpoint & WebSocket Action (TDD)
- **Type:** tdd
- **Objective:** Add `POST /fault/inject` and WebSocket action `inject_fault` in `api/main.py`.
- **Target Files:** `api/main.py`, `tests/test_api_web.py`, `tests/test_websocket.py`
- **Acceptance Criteria:** Invoking `/fault/inject` or `inject_fault` updates machine wear to specified value (e.g., 0.85), marks status warning/critical, and broadcasts state.
- **Verification Command:** `./venv/bin/python -m unittest tests/test_api_web.py tests/test_websocket.py`

### Wave 2: Frontend Tour Engine, Cinematic Banner & SCADA Cycling
#### Task 2.1: Tour Director Engine & HUD Presentation Banner (Auto)
- **Type:** auto
- **Objective:** Create `web/js/tour.js` orchestrating the 7 presentation beats with animated camera glides, fault injection, radar scan, drawer inspection, tab cycling, and closed-loop maintenance. Add `#tour-banner` overlay and HUD `🎬 Guided Demo` button.
- **Target Files:** `web/js/tour.js`, `web/js/app.js`, `web/index.html`, `web/css/style.css`
- **Acceptance Criteria:** Clicking `🎬 Guided Demo` starts the cinematic tour with subtitles and audio cues; clicking `⏹ Stop Tour` gracefully halts the tour.
- **Verification Command:** `node --check web/js/*.js`

### Wave 3: Integration, Regression Verification & Atomic Commit
#### Task 3.1: Full Regression Pass & Documentation Update (Auto)
- **Type:** auto
- **Objective:** Run full test suite (`python -m unittest discover tests`), verify all tests pass, update `README.md`, `About.md`, and write `VERIFICATION.md`.
- **Target Files:** `README.md`, `About.md`, `.planning/VERIFICATION.md`, `.planning/STATE.md`
- **Acceptance Criteria:** 100% test pass rate (22+ tests), clean git working tree, pushed to `main`.
- **Verification Command:** `./venv/bin/python -m unittest discover tests`
