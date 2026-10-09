# GSD Project State: Titan Aerospace Digital Twin Copilot

**Active Milestone:** v2.0 - End-to-End Pipeline & SCADA Polish
**Current Phase:** Phase 1 - End-to-End Pipeline & SCADA UI Refinement
**Status:** Planning Complete
**Last Updated:** 2026-10-09 12:38:00
**Active Workstream:** main

## Active Decisions & Constraints
- **Company Identity:** "Titan Aerospace Precision Fab" — High-precision turbine & avionics component manufacturing.
- **Manufacturing Flow:** Raw Ingot Billet → CNC Milling (Turbine Blades) → 1000T Hydraulic Press (Bulkhead Forging) → Assembly Conveyor (QC Inspection Gate) → AGV Rover (Hangar Dispatch).
- **Dual Pipeline View:** Unified interactive flow bar showing both (1) Physical Production Line Flow (work-in-progress, cycle times, throughput) and (2) AI Reasoning Trace (60Hz Sensors → Zero-Leakage Features → 2021 Dilated TCN → Isolation Forest → ChromaDB SOP → Risk-Aware Scheduler → Closed-Loop Twin).
- **Camera Director Mode:** One-click cinematic camera director presets (Overview, CNC-01, Press, Conveyor, AGV Follow Cam) with smooth lerping.
- **High-Fidelity SCADA Drawer:** Dual-trace oscilloscope (vibration RMS + thermal gradient), probability curve, and actionable SOP checkmarks.
- **Zero API Keys & Zero Build Overhead:** 100% offline, zero npm/node runtime dependencies, served by FastAPI.

## Current Position
- Phase: 01-pipeline-scada-refinement
- Total Plans: 5
- Completed Plans: 0
- Next Action: Execute Plan 01 (Tracer: Pipeline Data Model & API Endpoints)
