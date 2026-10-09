---
phase: 06-restore-authentic-dark-mode
plan: 01
type: execute
tracer_first: true
---

# Plan: Authentic Cyberpunk Dark Mode Restoration

## Objective
Preserve Executive Cleanroom Light Mode as the default while restoring the authentic cyberpunk strategy dark theme to its original visual glory (atmospheric lighting, floating dust particles, electric cyan floor grid, neon headlights, and dark sci-fi glassmorphic HUD).

## Execution Waves

### Wave 1: 3D Scene Dark Mode Lighting & Particle Physics (Tracer)
- Task 1.1: In `web/js/scene.js`, restore hemisphere lighting, ambient slate-blue, key floodlight, and atmospheric dust motes (`dustParticles`) active during dark mode.
- Task 1.2: In `web/js/models.js`, update `setFactoryTheme(isLight)` to swap the floor grid helper colors dynamically (`0x00f3ff`/`0x1e293b` for dark, `0x0284c7`/`0x94a3b8` for light), and set electric cyan materials for tracks, lasers, and AGVs.

### Wave 2: CSS Cyberpunk Polish & UI Contrast
- Task 2.1: Polish `body[data-theme="dark"]` in `web/css/style.css` for floating badges, bottom ribbon, header, and SCADA drawer.
- Task 2.2: Verify JavaScript syntax (`node --check web/js/*.js`).

### Wave 3: Verification, Screenshot Recapture & Shipping
- Task 3.1: Run Playwright to recapture `docs/screenshots/09_dark_mode_cyberpunk_view.png`.
- Task 3.2: Verify backend test suite (`python -m unittest tests/test_api_web.py`).
- Task 3.3: Pre-push verification (`10a19yashwant@gmail.com` via `github-personal`), git commit, and push.
