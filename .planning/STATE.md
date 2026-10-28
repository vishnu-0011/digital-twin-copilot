# GSD Project State: Titan Aerospace Digital Twin Copilot

**Active Milestone:** v7.0 - 1-Click Guided Presentation Tour & Anomaly Injection Engine
**Current Phase:** Phase 9 - Automated 1-Click Presentation Tour & Fault Injection
**Status:** In Progress (Ralph Loop Execution)
**Last Updated:** 2026-10-28 20:07:00
**Active Workstream:** feat/guided-demo-tour

## Active Decisions & Constraints
- **1-Click Guided Tour Experience:** Orchestrated cinematic walkthrough stepping through:
  1. Campus Exterior & Town Traffic (intro overview)
  2. Dollhouse Cutaway into Cleanroom Interior
  3. Spindle Bearing Anomaly Injected into `CNC-01` with vibration spike & alert aura
  4. LangGraph Radar Scan & Isolation Forest Anomaly Detection
  5. Holographic SCADA Drawer inspection stepping across Telemetry -> TCN Prognostics -> Titan SOP
  6. Closed-Loop Maintenance dispatch resetting wear back to nominal green
  7. Return to Overview ready for free interactive exploration.
- **Cinematic Subtitle Banner:** Top overlay presenting real-time presentation subtitles, progress step dots, and an easy `⏹ Stop Tour` button.
- **Backend Fault Injection:** Endpoint `POST /fault/inject` and WebSocket action `inject_fault` to set critical wear, elevate vibration, and trigger anomaly detectors deterministically.
- **Strict Zero-API-Key Policy:** Offline, self-contained architecture preserved.
- **Git Identity:** Repo-local personal identity (`Yashwant00CR7` / `10a19yashwant@gmail.com`) via `github-personal`.

## Current Position
- Phase: 09-guided-demo-tour
- Total Waves: 3
- Completed Waves: 0
- Next Action: Execute Wave 1 Backend Fault Injection Seam
