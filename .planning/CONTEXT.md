# Phase Context: Cleanroom Perimeter Declutter & Executive Entrance Portal

## Problem & User Intent
The user requested:
1. **Remove side pillars**: Eliminate all perimeter structural columns in the 3D scene to create an expansive, modern, unencumbered cleanroom vista.
2. **Company Name & Factory Entrance in 3D Rendering**: Build an architectural entrance structure directly in Three.js featuring the company name **"TITAN AEROSPACE"** (Front South Portal aligned with user selection: executive glass airlock entrance, illuminated cyan/gold signage, automated sliding doors, and ISO-Class cleanroom floor threshold markings).
3. **Record a 3-second Video**: Capture motion of the live operations center, save video/GIF artifacts, embed them into `README.md`, and commit/push the update to the PR branch.

## Mental Model & Core Abstractions
- **Architectural Cleanroom Esthetic**: ISO Class 6 aerospace manufacturing facility without heavy ceiling trusses or obscuring perimeter posts. Polished white epoxy floor seamlessly transitions into a high-tech entrance portal.
- **Front South Portal (`ENTRANCE-01`)**:
  - Located at $X = 0, Z = 24$, greeting personnel entering the facility.
  - Features an architectural portal arch with illuminated cyan/gold backlit signage rendered via dynamic HTML5 canvas texture: **"TITAN AEROSPACE"** with subtitle **"PRECISION FABRICATION • CLEANROOM ACCESS • BAYS 01-04"**.
  - Dual automated frameless glass airlock doors with brushed stainless headers.
  - Air-shower decontamination arch with perimeter LED status lighting (green nominal).
  - High-visibility floor threshold warning stripes and stenciled entry typography: **"AUTHORIZED PERSONNEL ONLY • ISO CLASS 6"**.
- **Perimeter Unobstructed View**:
  - Removal of the 12 perimeter structural steel columns eliminates all camera line-of-sight clipping, giving a pure strategy-game isometric presentation.

## Verification & Backpressure Seams
- **JavaScript Syntax**: `node --check web/js/*.js` (0 errors).
- **Backend Tests**: `./venv/bin/python -m unittest tests/test_api_web.py` (all tests passing).
- **Video & GIF Generation**: `record_video.py` producing `docs/videos/factory_tour.webm` and `docs/videos/factory_tour.gif`.
- **Git Compliance**: Repo-local personal identity (`Yashwant00CR7` / `10a19yashwant@gmail.com`) via `github-personal`.
