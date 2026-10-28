# Phase Context: 1-Click Guided Presentation Tour & Anomaly Injection Engine

## Problem & User Intent
The user asked to implement the 1st suggestion: **1-Click Guided Presentation Tour / Story Mode ("Walkthrough Mode")**.
During a viva or live project evaluation, manually clicking through camera angles, navigating menus, injecting anomalies, and explaining ML concepts simultaneously can feel rushed or awkward. A 1-click guided demo allows anyone (including teammates who did not write the code) to run an automated, high-impact demonstration showcasing the entire digital twin and AI copilot pipeline from start to finish with zero presentation fumbles.

## Mental Model & Core Abstractions
- **Tour Director Engine (`web/js/tour.js`):** A state machine orchestrating timed beats, camera transitions, fault injection, radar scan, drawer inspection, tab cycling, and closed-loop repair.
- **Cinematic Subtitle Overlay (`#tour-banner`):** A floating glassmorphic presentation prompter providing clear, professional narration subtitles for the audience or professor at every stage of the tour.
- **Fault Injection Seam (`POST /fault/inject` & WebSocket `inject_fault`):** Allows deterministic fault simulation (spindle bearing degradation, thermal elevation) on any workcell, broadcasting state instantly to all subscribers.
- **Interruptible Lifecycle:** The presenter can click `⏹ Stop Tour` or interact manually at any time to halt the tour without breaking the 3D scene or simulation state.

## Locked Architectural Decisions
1. **Endpoint & Protocol:** Expose `POST /fault/inject` taking `machine_id`, `wear_level`, `status`, and WebSocket action `inject_fault`.
2. **Audio & Visual Synchronization:** Tour steps trigger appropriate sound effects (`playClick`, `playScan`, `playAlarm`, `playRepairSuccess`) and visual states (camera glide, radar sweep plane, vibration aura, drawer tabs).
3. **Pacing:** Each beat is paced at ~6-7 seconds to allow evaluators to read the subtitle and absorb the visual change (~40-45s total tour time).
4. **Git Identity:** Strictly repo-local personal identity (`Yashwant00CR7` / `10a19yashwant@gmail.com`) via `github-personal`.

## Verification & Backpressure Seams
- Unit tests: `tests/test_api_web.py` & `tests/test_websocket.py` asserting `/fault/inject` and `inject_fault`.
- Full test discovery: `python -m unittest discover tests`.
- Frontend syntax check: `node --check web/js/*.js`.
