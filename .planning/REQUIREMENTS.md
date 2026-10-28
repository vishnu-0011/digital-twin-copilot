# Requirements: 1-Click Guided Presentation Tour & Anomaly Injection Engine

- [ ] **REQ-01: Fault Injection Endpoint & Protocol**: Add `POST /fault/inject` REST endpoint and WebSocket action `inject_fault` to dynamically simulate bearing degradation or thermal elevation on a specified machine.
- [ ] **REQ-02: Guided Tour Orchestrator Engine**: Implement `web/js/tour.js` managing timed beats: Campus Overview -> Cleanroom Interior -> CNC-01 Focus & Fault Injection -> LangGraph Radar Scan -> SCADA Drawer & TCN/SOP Inspection -> Closed-Loop Repair -> Overview Reset.
- [ ] **REQ-03: Cinematic Presentation Banner Overlay**: Render a stylish glassmorphic presentation prompter with viva-ready explanation subtitles, progress stepper pills, and a stop button.
- [ ] **REQ-04: Audio & Camera Integration**: Synchronize camera glides, radar sweeps, warning alarms, and repair chimes with tour beats.
- [ ] **REQ-05: Interruptibility & Safe Abort**: Presenter can click `🎬 Guided Demo` to start or `⏹ Stop Tour` / press Escape to abort gracefully without leaving the scene or simulation in an inconsistent state.
- [ ] **REQ-06: Automated Test Verification**: Add test cases covering `POST /fault/inject` and WebSocket action `inject_fault`, ensuring 100% test pass rate across the full test suite.
