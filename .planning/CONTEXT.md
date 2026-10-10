# Phase Context: Town Campus, Company Parking, Pedestrian Corridor & Dollhouse Exterior/Interior UI

## Problem & User Intent
The user requested a major visual and architectural enhancement:
1. **Building Exterior & Interior Transition:** The factory building should be enclosed with architectural walls and a roof from the outside. When clicking inside the building, the camera should glide inside and reveal the busy factory interior (dollhouse cutaway style).
2. **Outside Environment & Town:** The facility should sit inside a bustling, realistic town with:
   - Surrounding two-way road network with continuous animated vehicle traffic (cars, delivery trucks, vans).
   - Dedicated company parking lot with marked stalls, parked cars, EV charging bays, and a security guardhouse.
   - A dedicated pedestrian walkway/corridor connecting the parking lot directly to the factory entrance portal.
   - Street furniture, sidewalks, trees/landscaping, modern streetlights, and background commercial skyline buildings.
3. **Reference Style:** darkvex.ai / SimCity / Anno high-density tactical isometric strategy aesthetic (per user reference: `https://www.instagram.com/reel/DeG2mQszTrc/`).

## Locked Architectural Decisions
1. **Interactive Dollhouse Transition:**
   - Building group contains modular exterior walls, windows, and roof structure with rooftop HVAC chillers, solar panels, and "TITAN AEROSPACE" exterior building facade.
   - In Exterior/Campus view, roof & upper walls are opaque/visible.
   - Clicking the building (or clicking "Enter Factory" or machine presets) triggers a smooth camera fly-in, fades the roof and upper walls to 0 opacity / invisible, revealing the 8 workcells, AMRs, conveyor, and telemetry badges.
   - A `🏢 Campus` button in the floating Camera Director bar allows smoothly flying back out to the city view and restoring the exterior roof/walls.
2. **Town Campus Infrastructure:**
   - Roads: Dark asphalt grid wrapping around the facility with painted lane divider dashes, crosswalks, and curbs.
   - Animated Traffic: Continuous loop system of vehicles moving along the road network with rotating wheels, headlights, and taillights.
   - Parking Area: Located adjacent to the south/west perimeter with angled/perpendicular parking spaces, multiple car models, EV charging pedestals, and barrier gate guardhouse.
   - Pedestrian Corridor: Paved walkway with overhead canopy/lighting connecting the parking lot to the entrance portal airlock.
   - Town Skyline: Mid-rise and high-rise commercial buildings in the perimeter distance with lit windows and architectural crowns to establish urban scale.
3. **Context-Aware HUD:**
   - In Campus View, interior workcell floating badges are hidden to prevent clutter; a single floating Campus Badge ("🏢 TITAN AEROSPACE MEGA-FAB - 8 WORKCELLS NOMINAL - CLICK TO ENTER") invites the user to enter.
   - Inside the factory, individual 3D machine badges and the SCADA drawer work exactly as before.
4. **Zero-Build & Performance:**
   - Procedural Three.js geometries and instanced/reusable meshes—no heavy external GLTF assets, preserving 60 FPS WebGL rendering and instant load times.
   - Both Light Mode (crisp executive daytime cleanroom) and Dark Mode (cyberpunk night with glowing headlights, neon signs, and streetlamps).

## Verification & Backpressure Seams
- **Tests:** `./venv/bin/python -m unittest discover -s tests -p "test_*.py"` (16/16 pass)
- **Syntax:** `node --check web/js/*.js`
- **Visual Capture:** Multi-angle Playwright screenshots of both exterior town view and interior dollhouse view.
