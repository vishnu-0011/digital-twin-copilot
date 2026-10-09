# Phase Context: Restoring Authentic Cyberpunk Dark Mode (Preserving Light Mode as Default)

## User Decision & Mental Model
- **User Confirmation:** "use light mode as default but change the dark mode to how was it before".
- **Default State:** Executive Cleanroom Light Mode remains the out-of-the-box default (`data-theme="light"`).
- **Dark Mode Requirement:** When toggled to Dark Mode (via `☀️ Light / 🌙 Dark` or stored theme), the 3D scene and HUD must match the authentic dark strategy aesthetic from before commit `2b9156d`:
  - Deep dark atmospheric lighting: Slate-blue ambient (`0x182436`), cyan-to-charcoal hemisphere light (`0x38bdf8 / 0x070a10`), and crisp high-contrast key floodlight (`0xffffff`).
  - Atmospheric dust motes floating in 3D air (`dustParticles`) with additive cyan blending.
  - Electric cyan floor grid (`0x00f3ff` / `0x1e293b`) and dark obsidian metallic epoxy (`0x090d15`).
  - High-intensity electric cyan AGV headlights and sweeping LiDAR scan cones (`0x00f3ff`).
  - Glowing glassmorphic HUD with cyber cyan borders, pulsing bottleneck alerts, and high-contrast dark SCADA telemetry.
  - The newly added "TITAN AEROSPACE" entrance portal glowing brightly with neon cyan framing and emerald access beacon against the dark ambient factory floor.

## Verification & Seams
- **JavaScript Syntax:** `node --check web/js/*.js` (0 errors).
- **Backend Tests:** `./venv/bin/python -m unittest tests/test_api_web.py` (100% passing).
- **Screenshots:** Recapture `09_dark_mode_cyberpunk_view.png` with the restored authentic dark mode.
- **Git Remote:** Personal git identity (`Yashwant00CR7` / `10a19yashwant@gmail.com`) via `github-personal`.
