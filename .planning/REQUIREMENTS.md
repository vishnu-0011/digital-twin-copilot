# Requirements: Real-Time WebSockets (`/ws/telemetry`)

- [ ] **REQ-01: FastAPI WebSocket Telemetry Endpoint**: Expose `@app.websocket("/ws/telemetry")` supporting connection lifecycle, broadcasting real-time fleet machine states and 10-stage pipeline flow summaries.
- [ ] **REQ-02: Asynchronous Telemetry Broadcaster**: Implement a background broadcaster loop in FastAPI lifespan that pushes updates to all active WebSocket clients with graceful disconnect pruning.
- [ ] **REQ-03: Bi-Directional Action Protocol**: Support incoming JSON actions over WebSocket (`ping`, `step`, `repair`, `reset`, `scan`), mutating the digital twin state and immediately broadcasting the resulting telemetry.
- [ ] **REQ-04: Client-Side WebSocket Integration & Reconnection**: Implement WebSocket management in `web/js/app.js` with automatic reconnection, passing telemetry to 3D scene engine and SCADA drawer.
- [ ] **REQ-05: Resilient HTTP Fallback**: Ensure smooth fallback to HTTP polling if WebSocket is unavailable or disconnected without errors in the UI.
- [ ] **REQ-06: HUD Connection Badge**: Provide visual indicator in the top HUD reflecting WebSocket status (`WS: LIVE` in emerald green vs `WS: HTTP FALLBACK` in amber).
- [ ] **REQ-07: Automated Test Coverage**: Create `tests/test_websocket.py` to test WebSocket connection, broadcasting, and bi-directional commands via FastAPI `TestClient.websocket_connect`. All test suite passes with 100% success rate.
