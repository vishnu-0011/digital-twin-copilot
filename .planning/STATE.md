# GSD Project State: Titan Aerospace Digital Twin Copilot

**Active Milestone:** v6.0 - Real-Time WebSockets (`/ws/telemetry`)
**Current Phase:** Phase 8 - Bi-Directional WebSocket Telemetry Streaming & Instant SCADA Dispatch
**Status:** In Progress (Ralph Loop Execution)
**Last Updated:** 2026-10-28 18:55:00
**Active Workstream:** feat/websocket-telemetry

## Active Decisions & Constraints
- **Endpoint Specification:** Dedicated WebSocket endpoint at `/ws/telemetry` for live 60Hz/sub-second broadcast of fleet states and pipeline metrics.
- **Bi-Directional Action Protocol:** Support real-time command dispatch (`step`, `repair`, `reset`, `scan`, `ping`) over WebSocket with sub-millisecond roundtrip response.
- **Graceful Fallback & Resilience:** Frontend automatically degrades to HTTP polling (`GET /fleet`, `GET /pipeline/flow`) if WebSocket connection drops or is blocked, with automatic exponential/fixed reconnect.
- **HUD Live Indicator:** Visual status badge in Top HUD showing real-time WebSocket connection state (`WS: LIVE` in emerald green vs `WS: HTTP FALLBACK` in amber).
- **Strict Zero-API-Key Policy:** Offline, self-contained architecture preserved with zero external cloud dependencies.
- **Git Identity:** Repo-local personal identity (`Yashwant00CR7` / `10a19yashwant@gmail.com`) via `github-personal`.

## Current Position
- Phase: 08-websocket-telemetry
- Total Waves: 3
- Completed Waves: 0
- Next Action: Execute Wave 1 Tracer Slice
