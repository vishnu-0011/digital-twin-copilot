# Phase Context: Real-Time WebSockets (`/ws/telemetry`)

## Problem & User Intent
The user requested implementing the 5th suggestion: **Real-Time WebSockets (`/ws/telemetry`)** using the autonomous Ralph Loop without grilling (leveraging existing codebase context). 

Currently, the 3D SCADA operations center polls `/fleet` and `/pipeline/flow` over HTTP polling every 1.8 seconds. While functional, HTTP polling introduces latency, unnecessary HTTP request overhead, and does not match the real-time event-driven nature of modern industrial IoT (IIoT) SCADA platforms.

## Mental Model & Core Abstractions
- **Event-Driven Telemetry Broadcaster (`ConnectionManager`):** Manages connected browser sessions, broadcasts unified telemetry frames (`machines` + `pipeline`) at high frequency (~2Hz loop or immediately upon physics state mutation).
- **Bi-Directional Command Channel:** Instead of separate HTTP POST endpoints for actions (`/simulate`, `/maintenance/trigger`, `/fleet/reset`, `/monitor/check`), the WebSocket accepts structured action payloads (`step`, `repair`, `reset`, `scan`, `ping`) and responds with immediate action confirmations.
- **Fail-Safe Client Architecture:** The client treats WebSockets as the primary high-speed conduit and HTTP polling as a resilient fallback. If the WebSocket disconnects, HTTP polling engages seamlessly with zero disruption to 3D rendering or user interactions.

## Locked Architectural Decisions
1. **Endpoint Seam:** `api/main.py` defines `@app.websocket("/ws/telemetry")` with async lifespan task handling continuous broadcasts.
2. **Backward Compatibility:** All existing HTTP REST endpoints (`/fleet`, `/simulate`, `/pipeline/flow`, `/maintenance/trigger`, `/fleet/reset`) remain 100% functional and intact.
3. **Payload Structure:**
   ```json
   {
     "type": "telemetry",
     "timestamp": 1729000000.0,
     "machines": [ ... ],
     "pipeline": { ... }
   }
   ```
4. **Client-Side Resilience:** `web/js/app.js` initializes `WebSocket`, manages reconnection timer (3s), throttles HTTP polling to passive heartbeat while WS is alive, and resumes active polling upon disconnect.
5. **HUD Status Display:** `web/index.html` and `web/css/style.css` display an animated connection status pill (`WS: LIVE` / `WS: HTTP FALLBACK`).

## Verification & Backpressure Seams
- Unit & Integration Tests: `python -m unittest discover tests`
- New Dedicated Test: `tests/test_websocket.py` covering WebSocket connect, telemetry reception, bi-directional commands (`step`, `repair`, `reset`, `scan`), and disconnect resilience.
- Code Review Gate: Dual-axis Standards & Spec check.
