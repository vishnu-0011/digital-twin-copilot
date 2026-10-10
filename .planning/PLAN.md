---
phase: 07-town-campus-dollhouse-ui
plan: 01
type: execute
tracer_first: true
---

# Plan: Town Campus, Company Parking, Pedestrian Corridor & Dollhouse Exterior/Interior UI

## Objective
Transform the standalone factory slab into a bustling, realistic urban company campus with surrounding roads, animated traffic, company parking lot, pedestrian corridor, skyline buildings, and a clickable architectural factory building with smooth dollhouse exterior-to-interior cutaway transitions.

## Requirements Addressed
- REQ-01, REQ-02, REQ-03, REQ-04, REQ-05, REQ-06, REQ-07

## Execution Waves

### Wave 1: Tracer Slice (End-to-End Vertical Seam)
<!-- Minimal end-to-end flow: Building exterior shell + click-to-enter camera transition + roof fade + Director bar Campus toggle -->
#### Task 1.1: Factory Exterior Building Shell & Dollhouse Cutaway Controller
- **Objective:** Build procedural factory exterior walls, industrial ribbon windows, entrance facade, and roof structure with HVAC units. Implement `setInteriorMode(isInterior)` in `scene.js` that smoothly fades the roof/upper cutaway walls and flies the camera.
- **Target Files:** `web/js/models.js`, `web/js/scene.js`, `web/js/app.js`
- **Acceptance Criteria:** From outside, the building has solid/detailed exterior walls and roof; clicking the building or calling `setInteriorMode(true)` flies the camera inside and fades the roof/walls to reveal the 8 machines.
- **Verification:** `node --check web/js/*.js`

#### Task 1.2: Camera Director Integration & Context-Aware HUD
- **Objective:** Add `🏢 Campus` preset button to the floating Director bar in `index.html` and `hud.js`. Connect it so clicking `🏢 Campus` smoothly flies out to the city view and restores the exterior roof. In Campus view, hide the 8 individual machine badges and show the Campus overview badge.
- **Target Files:** `web/index.html`, `web/js/hud.js`, `web/js/scene.js`, `web/js/app.js`
- **Acceptance Criteria:** Clicking `🏢 Campus` zooms out to city view with roof intact; clicking building flies inside with badges visible.
- **Verification:** `node --check web/js/*.js`, browser visual check.

---

### Wave 2: Expansion & Bustling Town Components
<!-- Full urban campus: roads, animated vehicle loops, parking lot, pedestrian corridor, trees, streetlamps, background skyline -->
#### Task 2.1: Surrounding Road Grid & Animated Traffic Fleet
- **Objective:** Build dual-lane perimeter asphalt roads with dashed lane markings, crosswalks, and curbs. Implement an animated traffic system with cars, delivery trucks, and vans looping continuously along road waypoints with rotating wheels and front/rear lights.
- **Target Files:** `web/js/models.js`, `web/js/scene.js`
- **Acceptance Criteria:** Vehicles drive smoothly in realistic closed-loop paths around the campus with proper headings and speeds.
- **Verification:** `node --check web/js/*.js`

#### Task 2.2: Company Parking Area, Pedestrian Corridor & Guardhouse
- **Objective:** Construct a dedicated company parking lot with painted parking bays, parked cars, EV charging pedestals, and a security guardhouse with barrier gate. Add an architectural pedestrian canopy/walkway corridor connecting the parking lot directly to the factory entrance airlock.
- **Target Files:** `web/js/models.js`, `web/js/scene.js`
- **Acceptance Criteria:** Parking lot and pedestrian corridor are clearly visible on the south/west perimeter and connect seamlessly to the entrance.
- **Verification:** `node --check web/js/*.js`

#### Task 2.3: Urban Streetscapes, Streetlamps, Landscaping & Background Skyline
- **Objective:** Add sidewalks with curbs, modern LED streetlamps (with light-up cones for night mode), green trees, manicured grass patches, and background mid/high-rise corporate skyline buildings.
- **Target Files:** `web/js/models.js`, `web/js/scene.js`
- **Acceptance Criteria:** Campus feels embedded in a bustling modern high-tech city with depth and skyline.
- **Verification:** `node --check web/js/*.js`

---

### Wave 3: Integration, Dual-Theme Polish & Hardening
#### Task 3.1: Dual-Theme Adaptation & Lighting Tuning
- **Objective:** Ensure all new components (roads, vehicles, parking lot, corridor, building exterior, streetlamps, skyline) look stunning in both Executive Cleanroom (daylight) and Cyberpunk (dark mode with glowing headlights, neon signage, lit windows).
- **Target Files:** `web/js/models.js`, `web/js/scene.js`, `web/css/style.css`
- **Acceptance Criteria:** Toggling Light/Dark mode transitions all town and building materials seamlessly.
- **Verification:** `node --check web/js/*.js`

#### Task 3.2: Automated Tests, Screenshots, Video & Documentation Updates
- **Objective:** Run the full 16-test suite, capture new multi-angle screenshots with the town & dollhouse view, update `README.md` and `About.md` with the new architecture, and push clean commits.
- **Target Files:** `tests/`, `capture_screenshots.py`, `README.md`, `About.md`, `pr_body.md`
- **Acceptance Criteria:** 16/16 tests pass, 0 lint/syntax errors, screenshots and docs updated.
- **Verification:** `./venv/bin/python -m unittest discover -s tests -p "test_*.py"`
