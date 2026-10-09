---
phase: 05-cleanroom-entrance-declutter
plan: 01
type: execute
tracer_first: true
---

# Plan: Cleanroom Perimeter Declutter, Architectural Entrance & Motion Video

## Objective
Remove all perimeter vertical pillars, construct an executive architectural entrance with illuminated "TITAN AEROSPACE" branding in Three.js, record a 3-second motion loop video/GIF of the factory, embed it in the README, and push to GitHub.

## Requirements Addressed
- REQ-DECLUTTER-01, REQ-ENTRANCE-01, REQ-SIGNAGE-02, REQ-PORTAL-03, REQ-VIDEO-01, REQ-DOCS-01, REQ-GIT-01

## Execution Waves

### Wave 1: 3D Declutter & Architectural Entrance Creation (Tracer Slice)
- Task 1.1: Remove the 12 perimeter structural steel columns from `web/js/models.js`.
- Task 1.2: Implement `createCleanroomEntrancePortal(parentGroup)` in `web/js/models.js`:
  - Canvas texture generation for illuminated "TITAN AEROSPACE" signage with cyan/gold accents.
  - Airlock glass doors, stainless steel framing, air shower canopy, green status beacon, and threshold graphics.
- Task 1.3: Add Director camera preset for "Entrance" or update overview camera framing in `web/js/scene.js`.

### Wave 2: Verification & High-Res Media Capture
- Task 2.1: Validate JS syntax with `node --check` across `web/js/*.js`.
- Task 2.2: Develop `record_video.py` to record Playwright `.webm` and generate smooth 3-second animated `.gif`.
- Task 2.3: Re-run `capture_screenshots.py` for updated 1080p screenshots showcasing the new entrance and open perimeter.

### Wave 3: Documentation & Shipping
- Task 3.1: Update `README.md` embedding the animated GIF and video links.
- Task 3.2: Update `pr_body.md` with new features and media.
- Task 3.3: Pre-push verification (`10a19yashwant@gmail.com` via `github-personal`), git commit, and push to PR branch.
