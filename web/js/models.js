/**
 * Procedural Industrial 3D Machinery Models (Titan Aerospace Precision Fab)
 * =========================================================================
 * Full Executive Cleanroom Mega-Factory (8 Workcells across 4 Zoned Bays + 2 AMRs):
 * - Bay 1 (Machining): CNC-01 (Roughing Mill) + CNC-02 (Airfoil Finishing Center)
 * - Bay 2 (Forming & Thermal): PRESS-01 (1000T Forging Press) + PRESS-02 (500T Extrusion Press) + FURN-01 (Vacuum Carburizing Furnace)
 * - Bay 3 (Robotics & Metrology): ROBOT-01 (6-DOF Robotic Deburring Cell) + LASER-01 (Dual Laser Triangulation QC Arch)
 * - Bay 4 (Assembly): CONV-01 (Dual-Rail Avionics Assembly Line)
 * - Logistics Fleet: AGV-01 (Patrol AMR) + AGV-02 (Transit AMR)
 * - Dual Theme Architecture: Daylight Cleanroom Epoxy (Default) & Dark Sci-Fi Grid
 */

// Shared Materials Palette
export const MAT = {
  // Factory Architecture
  floorEpoxy: new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.22, metalness: 0.2 }),
  floorRim: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8, metalness: 0.1 }),
  foundationPad: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45, metalness: 0.25 }),
  hazardYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.2 }),
  hazardDark: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 }),
  structuralSteel: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.75 }),
  safetyRail: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.5 }),
  portalArch: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.8 }),
  portalWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.2 }),
  portalGlass: new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    transmission: 0.85,
    roughness: 0.05,
    metalness: 0.15,
  }),
  portalBeaconGreen: new THREE.MeshBasicMaterial({ color: 0x10b981 }),
  portalGlowCyan: new THREE.MeshBasicMaterial({ color: 0x00f3ff }),

  // High-Bay Warehouse Racking (ASRS)
  rackBlue: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4, metalness: 0.6 }),
  rackOrange: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35, metalness: 0.4 }),
  woodPallet: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85, metalness: 0.05 }),

  // Machinery Chassis & Enclosures
  machineChassis: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.65 }),
  machineDark: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.6 }),
  machineLight: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.5 }),
  machineAccentCyan: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.85 }),
  pressBody: new THREE.MeshStandardMaterial({ color: 0x1e2638, roughness: 0.45, metalness: 0.55 }),
  pressSafetyOrange: new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.3, metalness: 0.6 }),
  furnaceInsulation: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.4 }),
  robotYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.5 }),
  graniteBase: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15, metalness: 0.3 }),
  steelChrome: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.08, metalness: 0.98 }),
  aluminumExtrusion: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 }),

  // Aerospace Workpieces & Components
  workpieceAlloy: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.18, metalness: 0.9 }),
  hotBillet: new THREE.MeshStandardMaterial({
    color: 0xff3b00,
    emissive: 0xff2200,
    emissiveIntensity: 0.9,
    roughness: 0.3,
  }),
  cargoPallet: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.45, metalness: 0.4 }),
  conveyorBelt: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.1 }),

  // Glass, Optics & Enclosures
  glassChamber: new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
    transmission: 0.88,
    roughness: 0.05,
    metalness: 0.1,
  }),
  doorFrame: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 }),

  // Glowing Lasers, Safety Curtains & Decals
  laserCyan: new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }),
  laserScannerPlane: new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }),
  lightCurtainBeam: new THREE.MeshBasicMaterial({
    color: 0xff0044,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }),
  coolantMist: new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.3,
    wireframe: true,
    blending: THREE.AdditiveBlending,
  }),
  terminalScreen: new THREE.MeshBasicMaterial({ color: 0x059669 }),
  strobeAmber: new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
  ledGreen: new THREE.MeshBasicMaterial({ color: 0x10b981 }),
  ledRed: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  trackCyan: new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
  }),

  // Town & Urban Infrastructure
  asphalt: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.1 }),
  roadMarking: new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.75, metalness: 0.1 }),
  grassLawn: new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.9, metalness: 0.05 }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 }),
  treeFoliage: new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.8 }),
  streetlampPole: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.8 }),
  streetlampGlow: new THREE.MeshBasicMaterial({ color: 0xfef08a }),
  parkingStripe: new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
  guardhouseWall: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.6 }),
  barrierArm: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 }),

  // Building Exterior & Roof (Dollhouse Cutaway)
  buildingWall: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.25 }),
  buildingWallDark: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 }),
  buildingRibbonGlass: new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    transmission: 0.8,
    roughness: 0.08,
    metalness: 0.2,
  }),
  buildingRoof: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.65, metalness: 0.25 }),
  buildingTrim: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 }),
  rooftopHvac: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6 }),
  solarPanel: new THREE.MeshStandardMaterial({ color: 0x0a1128, roughness: 0.15, metalness: 0.9 }),

  // City Skyline Towers
  skylineTower: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.4 }),
  skylineGlass: new THREE.MeshBasicMaterial({ color: 0xfef9c3 }),

  // Vehicles
  carRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.7 }),
  carBlue: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.25, metalness: 0.7 }),
  carWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.6 }),
  carSilver: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.85 }),
  carBlack: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 }),
  carHeadlight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  carTaillight: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
};

let gridHelperLight = null;
let gridHelperDark = null;

/**
 * Dynamically toggles material colors between Executive Cleanroom (light) and Cyberpunk (dark)
 */
export function setFactoryTheme(isLight) {
  if (gridHelperLight && gridHelperDark) {
    gridHelperLight.visible = isLight;
    gridHelperDark.visible = !isLight;
  }

  if (isLight) {
    MAT.floorEpoxy.color.setHex(0xf3f4f6);
    MAT.floorEpoxy.roughness = 0.22;
    MAT.floorRim.color.setHex(0xcbd5e1);
    MAT.foundationPad.color.setHex(0xe2e8f0);
    MAT.structuralSteel.color.setHex(0x475569);
    MAT.machineChassis.color.setHex(0x1e293b);
    MAT.conveyorBelt.color.setHex(0x334155);
    MAT.trackCyan.color.setHex(0x0284c7);
    MAT.laserCyan.color.setHex(0x0284c7);

    // Urban & Town Daylight
    MAT.asphalt.color.setHex(0x334155);
    MAT.sidewalk.color.setHex(0xd1d5db);
    MAT.grassLawn.color.setHex(0x2e6f40);
    MAT.buildingWall.color.setHex(0xe2e8f0);
    MAT.buildingRoof.color.setHex(0x64748b);
    MAT.skylineTower.color.setHex(0x475569);
    MAT.skylineGlass.color.setHex(0xfef9c3);
    MAT.streetlampGlow.color.setHex(0xfef08a);
  } else {
    // AUTHENTIC CYBERPUNK STRATEGY PALETTE
    MAT.floorEpoxy.color.setHex(0x090d15);
    MAT.floorEpoxy.roughness = 0.35;
    MAT.floorRim.color.setHex(0x05070c);
    MAT.foundationPad.color.setHex(0x121822);
    MAT.structuralSteel.color.setHex(0x334155);
    MAT.machineChassis.color.setHex(0x1e293b);
    MAT.conveyorBelt.color.setHex(0x080c14);
    MAT.trackCyan.color.setHex(0x00f3ff);
    MAT.laserCyan.color.setHex(0x00f3ff);

    // Urban & Town Cyberpunk Night
    MAT.asphalt.color.setHex(0x0a0e17);
    MAT.sidewalk.color.setHex(0x161f2e);
    MAT.grassLawn.color.setHex(0x064e3b);
    MAT.buildingWall.color.setHex(0x0f172a);
    MAT.buildingRoof.color.setHex(0x090d15);
    MAT.skylineTower.color.setHex(0x0b101b);
    MAT.skylineGlass.color.setHex(0x00f3ff);
    MAT.streetlampGlow.color.setHex(0x00f3ff);
  }
}

/**
 * 1. FACTORY FLOOR & ENVIRONMENT (64m x 48m with 4 Bays, ASRS Racks, Dual AMRs)
 */
export function createFactoryFloor(scene) {
  const group = new THREE.Group();

  // Main ground slab (64m x 48m)
  const floorGeo = new THREE.BoxGeometry(64, 0.8, 48);
  const floorMesh = new THREE.Mesh(floorGeo, MAT.floorEpoxy);
  floorMesh.position.y = -0.4;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Outer border rim
  const rimGeo = new THREE.BoxGeometry(65.5, 0.4, 49.5);
  const rimMesh = new THREE.Mesh(rimGeo, MAT.floorRim);
  rimMesh.position.y = -0.7;
  group.add(rimMesh);

  // Tactical Floor Grids: Light Mode (Subtle Slate/Cobalt) and Dark Mode (Electric Neon Cyan / Deep Slate)
  gridHelperLight = new THREE.GridHelper(60, 60, 0x0284c7, 0x94a3b8);
  gridHelperLight.position.y = 0.01;
  gridHelperLight.visible = true;
  group.add(gridHelperLight);

  gridHelperDark = new THREE.GridHelper(60, 60, 0x00f3ff, 0x1e293b);
  gridHelperDark.position.y = 0.01;
  gridHelperDark.visible = false;
  group.add(gridHelperDark);

  // 4 ZONED FOUNDATION PADS
  const padsConfig = [
    // Bay 1: Machining Bay (CNC-01 & CNC-02)
    { x: -11, z: -10, w: 22, d: 11, tag: "BAY 1: CNC MACHINING" },
    // Bay 2: Heavy Forming & Thermal (PRESS-01, PRESS-02, FURN-01)
    { x: 13, z: -10, w: 25, d: 13, tag: "BAY 2: FORMING & HEAT" },
    // Bay 3: Robotics & Metrology (ROBOT-01, LASER-01)
    { x: -11, z: 9, w: 22, d: 11, tag: "BAY 3: ROBOTICS & QC" },
    // Bay 4: Assembly Line (CONV-01)
    { x: 13, z: 9, w: 25, d: 11, tag: "BAY 4: AVIONICS ASSEMBLY" },
  ];

  padsConfig.forEach(pad => {
    const padGeo = new THREE.BoxGeometry(pad.w, 0.14, pad.d);
    const padMesh = new THREE.Mesh(padGeo, MAT.foundationPad);
    padMesh.position.set(pad.x, 0.07, pad.z);
    padMesh.receiveShadow = true;
    group.add(padMesh);

    // Hazard border strip
    const borderGeo = new THREE.BoxGeometry(pad.w + 0.3, 0.04, pad.d + 0.3);
    const borderMesh = new THREE.Mesh(borderGeo, MAT.hazardYellow);
    borderMesh.position.set(pad.x, 0.02, pad.z);
    group.add(borderMesh);
  });

  // EXECUTIVE CLEANROOM ENTRANCE PORTAL & BRANDING (TITAN AEROSPACE)
  createCleanroomEntrancePortal(group);

  // HIGH-BAY WAREHOUSE PALLET STORAGE RACKS (ASRS)
  createWarehouseRack(group, -22, -18);
  createWarehouseRack(group, 22, -18);
  createWarehouseRack(group, -22, 18);
  createWarehouseRack(group, 22, 18);

  // DUAL AMR NAVIGATION CORRIDORS
  createDualCorridorPaths(group);

  scene.add(group);
  return group;
}

function createWarehouseRack(parentGroup, posX, posZ) {
  const rackGroup = new THREE.Group();
  rackGroup.position.set(posX, 0, posZ);

  const rackWidth = 8.0;
  const rackDepth = 2.2;
  const rackHeight = 8.5;

  const postGeo = new THREE.BoxGeometry(0.2, rackHeight, 0.2);
  [-rackWidth / 2, rackWidth / 2].forEach(x => {
    [-rackDepth / 2, rackDepth / 2].forEach(z => {
      const post = new THREE.Mesh(postGeo, MAT.rackBlue);
      post.position.set(x, rackHeight / 2, z);
      post.castShadow = true;
      rackGroup.add(post);
    });
  });

  const tierY = [1.4, 4.0, 6.6];
  tierY.forEach(y => {
    const beamGeo = new THREE.BoxGeometry(rackWidth, 0.25, 0.12);
    [-rackDepth / 2, rackDepth / 2].forEach(z => {
      const beam = new THREE.Mesh(beamGeo, MAT.rackOrange);
      beam.position.set(0, y, z);
      rackGroup.add(beam);
    });

    [-2.4, 0, 2.4].forEach(px => {
      const palGeo = new THREE.BoxGeometry(1.9, 0.18, 1.8);
      const pal = new THREE.Mesh(palGeo, MAT.woodPallet);
      pal.position.set(px, y + 0.1, 0);
      rackGroup.add(pal);

      const crateGeo = new THREE.BoxGeometry(1.4, 1.1, 1.4);
      const crate = new THREE.Mesh(crateGeo, MAT.workpieceAlloy);
      crate.position.set(px, y + 0.74, 0);
      crate.castShadow = true;
      rackGroup.add(crate);
    });
  });

  parentGroup.add(rackGroup);
}

function createDualCorridorPaths(parentGroup) {
  const corridorGroup = new THREE.Group();

  // Outer AGV-01 Loop: (-22,-16) -> (22,-16) -> (22,16) -> (-22,16)
  const outerSegs = [
    { x: 0, z: -16, w: 44, d: 0.15 },
    { x: 0, z: 16, w: 44, d: 0.15 },
    { x: -22, z: 0, w: 0.15, d: 32 },
    { x: 22, z: 0, w: 0.15, d: 32 },
  ];
  outerSegs.forEach(s => {
    const line = new THREE.Mesh(new THREE.BoxGeometry(s.w, 0.02, s.d), MAT.trackCyan);
    line.position.set(s.x, 0.025, s.z);
    corridorGroup.add(line);
  });

  // Inner AGV-02 Loop: (0,-12) -> (0,12) -> (-10,12) -> (-10,-12)
  const innerSegs = [
    { x: -5, z: -12, w: 10, d: 0.15 },
    { x: -5, z: 12, w: 10, d: 0.15 },
    { x: 0, z: 0, w: 0.15, d: 24 },
    { x: -10, z: 0, w: 0.15, d: 24 },
  ];
  innerSegs.forEach(s => {
    const line = new THREE.Mesh(new THREE.BoxGeometry(s.w, 0.02, s.d), MAT.trackCyan);
    line.position.set(s.x, 0.025, s.z);
    corridorGroup.add(line);
  });

  parentGroup.add(corridorGroup);
}

/**
 * Procedural Dynamic Signage Canvas Textures
 */
function createSignboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Background gradient: Aerospace carbon slate
  const grad = ctx.createLinearGradient(0, 0, 2048, 512);
  grad.addColorStop(0, '#030712');
  grad.addColorStop(0.5, '#0b1329');
  grad.addColorStop(1, '#030712');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 512);

  // High-tech subtle grid pattern
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 2048; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // Neon Cyan Outer Border with double-stroke
  ctx.strokeStyle = '#00f3ff';
  ctx.lineWidth = 10;
  ctx.strokeRect(16, 16, 2016, 480);
  ctx.strokeStyle = 'rgba(2, 132, 199, 0.6)';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 1984, 448);

  // Top Accent Header Bar
  ctx.fillStyle = '#00f3ff';
  ctx.fillRect(80, 48, 1888, 6);

  // Top Tagline
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px "Segoe UI", -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A E R O S P A C E   D I G I T A L   T W I N   F A C I L I T Y', 1024, 90);

  // Logo Chevron & Company Main Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 128px "Segoe UI", Inter, sans-serif';
  ctx.shadowColor = '#00f3ff';
  ctx.shadowBlur = 24;
  ctx.fillText('▲  TITAN AEROSPACE', 1024, 210);

  // Reset shadow
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 44px "Segoe UI", sans-serif';
  ctx.fillText('PRECISION PROPULSION & AIRFRAME ADVANCED MANUFACTURING', 1024, 305);

  // Bottom Status Indicators Bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(60, 365, 1928, 90);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 365, 1928, 90);

  // Pill 1: Cleanroom Spec
  ctx.fillStyle = '#10b981';
  ctx.fillRect(90, 385, 360, 50);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('ISO CLASS 6 CLEANROOM', 270, 410);

  // Pill 2: Airlock Status
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(490, 385, 420, 50);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('MAIN AIRLOCK • BAYS 01-04', 700, 410);

  // Pill 3: Access Mode
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(950, 385, 420, 50);
  ctx.fillStyle = '#0f172a';
  ctx.fillText('AUTOMATED ACCESS ACTIVE', 1160, 410);

  // Pill 4: Badge ID
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(1410, 385, 540, 50);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('AUTHORIZED PERSONNEL ONLY', 1680, 410);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

function createThresholdMatTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Cleanroom tacky mat blue
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 1024, 512);

  // Hazard border
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 16;
  ctx.strokeRect(10, 10, 1004, 492);

  // Diagonal hazard stripes on borders
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 1024; i += 60) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 30, 0);
    ctx.lineTo(i + 10, 30);
    ctx.lineTo(i - 20, 30);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(i, 482);
    ctx.lineTo(i + 30, 482);
    ctx.lineTo(i + 10, 512);
    ctx.lineTo(i - 20, 512);
    ctx.fill();
  }

  // Inner box
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(40, 50, 944, 412);

  // Center Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px "Segoe UI", Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('▲  TITAN AEROSPACE  ▲', 512, 170);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px "Segoe UI", sans-serif';
  ctx.fillText('CLEANROOM ENTRY THRESHOLD', 512, 240);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('DECONTAMINATION AIRLOCK • ISO-14644 CLASS 6', 512, 310);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '22px sans-serif';
  ctx.fillText('STEP ON TACKY MAT PRIOR TO ENTERING PRODUCTION FLOOR', 512, 375);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

/**
 * 1. EXECUTIVE CLEANROOM ENTRANCE PORTAL & BRANDING (TITAN AEROSPACE)
 */
function createCleanroomEntrancePortal(parentGroup) {
  const portalRoot = new THREE.Group();
  portalRoot.position.set(0, 0, 23.0);

  // 1. FLOOR TACKY MAT & THRESHOLD RAMP
  const matGeo = new THREE.PlaneGeometry(10.0, 3.2);
  const matTex = createThresholdMatTexture();
  const matMat = new THREE.MeshStandardMaterial({
    map: matTex,
    roughness: 0.4,
    metalness: 0.1,
  });
  const matMesh = new THREE.Mesh(matGeo, matMat);
  matMesh.rotation.x = -Math.PI / 2;
  matMesh.position.set(0, 0.025, -0.6);
  matMesh.receiveShadow = true;
  portalRoot.add(matMesh);

  // 2. ARCHITECTURAL PORTAL PYLONS (LEFT & RIGHT)
  const pylonGeo = new THREE.BoxGeometry(1.2, 5.4, 1.6);
  const leftPylon = new THREE.Mesh(pylonGeo, MAT.portalArch);
  leftPylon.position.set(-5.6, 2.7, 0);
  leftPylon.castShadow = true;
  portalRoot.add(leftPylon);

  const rightPylon = new THREE.Mesh(pylonGeo, MAT.portalArch);
  rightPylon.position.set(5.6, 2.7, 0);
  rightPylon.castShadow = true;
  portalRoot.add(rightPylon);

  // Pylon Decorative White Cleanroom Fascia Inserts
  const pylonFasciaGeo = new THREE.BoxGeometry(0.9, 5.0, 0.1);
  const leftFascia = new THREE.Mesh(pylonFasciaGeo, MAT.portalWhite);
  leftFascia.position.set(-5.6, 2.7, 0.82);
  portalRoot.add(leftFascia);

  const rightFascia = new THREE.Mesh(pylonFasciaGeo, MAT.portalWhite);
  rightFascia.position.set(5.6, 2.7, 0.82);
  portalRoot.add(rightFascia);

  // 3. OVERHEAD CANOPY LINTEL / FASCIA
  const lintelGeo = new THREE.BoxGeometry(12.4, 1.4, 2.0);
  const lintel = new THREE.Mesh(lintelGeo, MAT.portalArch);
  lintel.position.set(0, 5.5, 0);
  lintel.castShadow = true;
  portalRoot.add(lintel);

  // 4. ILLUMINATED TITAN AEROSPACE COMPANY SIGNBOARD (SOUTH FACE & NORTH FACE)
  const signTex = createSignboardTexture();
  const signMat = new THREE.MeshStandardMaterial({
    map: signTex,
    roughness: 0.2,
    metalness: 0.3,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
  });

  const signGeo = new THREE.PlaneGeometry(10.8, 1.3);

  // South Face (facing approaching camera / entrance exterior)
  const signSouth = new THREE.Mesh(signGeo, signMat);
  signSouth.position.set(0, 5.5, 1.02);
  portalRoot.add(signSouth);

  // North Face (facing into factory floor)
  const signNorth = new THREE.Mesh(signGeo, signMat);
  signNorth.position.set(0, 5.5, -1.02);
  signNorth.rotation.y = Math.PI;
  portalRoot.add(signNorth);

  // Glowing Cyan Accent Strip Under Signboard
  const stripGeo = new THREE.BoxGeometry(11.2, 0.08, 0.08);
  const stripSouth = new THREE.Mesh(stripGeo, MAT.portalGlowCyan);
  stripSouth.position.set(0, 4.75, 1.03);
  portalRoot.add(stripSouth);

  const stripNorth = new THREE.Mesh(stripGeo, MAT.portalGlowCyan);
  stripNorth.position.set(0, 4.75, -1.03);
  portalRoot.add(stripNorth);

  // 5. AIRLOCK HEADER BEACON (EMERALD GREEN "NOMINAL" STRIP)
  const beaconGeo = new THREE.BoxGeometry(7.0, 0.12, 0.12);
  const beacon = new THREE.Mesh(beaconGeo, MAT.portalBeaconGreen);
  beacon.position.set(0, 4.65, 0);
  portalRoot.add(beacon);

  // 6. DUAL SLIDING GLASS AIRLOCK DOORS
  const doorGeo = new THREE.BoxGeometry(2.35, 4.2, 0.08);

  // Left Glass Door
  const leftDoor = new THREE.Mesh(doorGeo, MAT.portalGlass);
  leftDoor.position.set(-1.3, 2.2, 0);
  portalRoot.add(leftDoor);

  // Right Glass Door
  const rightDoor = new THREE.Mesh(doorGeo, MAT.portalGlass);
  rightDoor.position.set(1.3, 2.2, 0);
  portalRoot.add(rightDoor);

  // Door Metal Frames & Push-Pull Handles
  const frameGeo = new THREE.BoxGeometry(0.12, 4.2, 0.12);
  [-2.45, -0.15, 0.15, 2.45].forEach(fx => {
    const frame = new THREE.Mesh(frameGeo, MAT.steelChrome);
    frame.position.set(fx, 2.2, 0);
    portalRoot.add(frame);
  });

  const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.8);
  const leftHandle = new THREE.Mesh(handleGeo, MAT.steelChrome);
  leftHandle.position.set(-0.35, 1.8, 0.1);
  portalRoot.add(leftHandle);

  const rightHandle = new THREE.Mesh(handleGeo, MAT.steelChrome);
  rightHandle.position.set(0.35, 1.8, 0.1);
  portalRoot.add(rightHandle);

  // Frosted manifestation horizontal decals on glass
  const decalGeo = new THREE.BoxGeometry(2.2, 0.06, 0.09);
  [1.4, 1.7, 2.0].forEach(dy => {
    const dL = new THREE.Mesh(decalGeo, MAT.portalWhite);
    dL.position.set(-1.3, dy, 0);
    portalRoot.add(dL);

    const dR = new THREE.Mesh(decalGeo, MAT.portalWhite);
    dR.position.set(1.3, dy, 0);
    portalRoot.add(dR);
  });

  // 7. SECURITY BADGE ACCESS PEDESTALS (TURNSTILE / TERMINAL)
  [-4.2, 4.2].forEach(px => {
    const pedestalGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4);
    const ped = new THREE.Mesh(pedestalGeo, MAT.machineDark);
    ped.position.set(px, 0.6, 0.5);
    portalRoot.add(ped);

    // Screen scanner
    const screenGeo = new THREE.BoxGeometry(0.25, 0.3, 0.02);
    const screen = new THREE.Mesh(screenGeo, MAT.portalGlowCyan);
    screen.position.set(px, 1.1, 0.71);
    screen.rotation.x = -Math.PI / 8;
    portalRoot.add(screen);
  });

  parentGroup.add(portalRoot);
  return portalRoot;
}

/**
 * 2. CNC-01: 5-AXIS INCONEL TURBINE ROUGHING MILL (DMG MORI Enclosed Style)
 */
export function createCNCMill(position = { x: -16, y: 0, z: -10 }) {
  const group = new THREE.Group();
  group.userData = { id: "CNC-01", type: "CNC_MILL", name: "5-Axis Heavy Roughing Mill" };

  const baseGeo = new THREE.BoxGeometry(6.6, 1.2, 5.8);
  const base = new THREE.Mesh(baseGeo, MAT.machineChassis);
  base.position.y = 0.6;
  base.castShadow = true;
  group.add(base);

  const uprightGeo = new THREE.BoxGeometry(1.2, 5.4, 4.0);
  const leftCol = new THREE.Mesh(uprightGeo, MAT.machineChassis);
  leftCol.position.set(-2.5, 3.5, 0);
  group.add(leftCol);

  const rightCol = new THREE.Mesh(uprightGeo, MAT.machineChassis);
  rightCol.position.set(2.5, 3.5, 0);
  group.add(rightCol);

  const beamGeo = new THREE.BoxGeometry(6.2, 1.4, 2.2);
  const crossbeam = new THREE.Mesh(beamGeo, MAT.machineAccentCyan);
  crossbeam.position.set(0, 5.3, 0.4);
  group.add(crossbeam);

  const carriageGroup = new THREE.Group();
  carriageGroup.position.set(0, 4.5, 0.8);
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 1.4), MAT.machineDark);
  carriageGroup.add(saddle);

  const ramSlide = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.0), MAT.structuralSteel);
  ramSlide.position.set(0, -0.6, 0.3);
  carriageGroup.add(ramSlide);

  const spindleChuck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 20), MAT.steelChrome);
  spindleChuck.position.set(0, -1.8, 0.3);
  carriageGroup.add(spindleChuck);

  const toolBit = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.02, 0.9, 16), MAT.steelChrome);
  toolBit.position.set(0, -2.4, 0.3);
  carriageGroup.add(toolBit);

  group.add(carriageGroup);
  group.toolCarriage = carriageGroup;
  group.spindleTool = toolBit;

  // Trunnion Table & Blade
  const trunnionBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.5, 24), MAT.steelChrome);
  trunnionBase.position.set(0, 1.4, 0.6);
  group.add(trunnionBase);

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.3, 0.8), MAT.workpieceAlloy);
  blade.position.set(0, 2.0, 0.6);
  group.add(blade);
  group.turbineBlade = blade;

  // Coolant Mist
  const mistMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), MAT.coolantMist);
  mistMesh.position.set(0, 1.9, 0.6);
  group.add(mistMesh);
  group.coolantMist = mistMesh;

  // Tool Carousel
  const magHousing = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 24), MAT.machineDark);
  magHousing.rotation.z = Math.PI / 2;
  magHousing.position.set(-3.2, 3.8, 0);
  group.add(magHousing);

  // Enclosure Glass Doors
  const doorL = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.6, 0.08), MAT.glassChamber);
  doorL.position.set(-1.4, 3.2, 2.5);
  group.add(doorL);

  const doorR = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.6, 0.08), MAT.glassChamber);
  doorR.position.set(1.4, 3.2, 2.5);
  group.add(doorR);

  // Status Beacon
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.35, 16), new THREE.MeshBasicMaterial({ color: 0x059669 }));
  beacon.position.set(-2.8, 7.5, -1.8);
  group.add(beacon);
  group.beaconLight = beacon;

  // Ground Status Halo
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.0, 32), new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 3. CNC-02: 5-AXIS HIGH-SPEED AIRFOIL FINISHING CENTER (Portal Gantry with Granite Bed)
 */
export function createAirfoilFinishingCenter(position = { x: -6, y: 0, z: -10 }) {
  const group = new THREE.Group();
  group.userData = { id: "CNC-02", type: "CNC_MILL", name: "5-Axis Airfoil Finishing Center" };

  // Granite Surface Bed
  const bed = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.2, 5.4), MAT.graniteBase);
  bed.position.y = 0.6;
  bed.castShadow = true;
  group.add(bed);

  // Dual Portal Columns (Light Cleanroom White Panels)
  [-2.4, 2.4].forEach(x => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.1, 5.0, 3.6), MAT.machineLight);
    col.position.set(x, 3.4, 0);
    col.castShadow = true;
    group.add(col);
  });

  // Top Bridge Beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.2, 2.0), MAT.machineAccentCyan);
  beam.position.set(0, 5.1, 0.2);
  group.add(beam);

  // High-Speed Spindle Head (Carriage)
  const carriage = new THREE.Group();
  carriage.position.set(0, 4.2, 0.6);

  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.2), MAT.machineDark);
  carriage.add(headMesh);

  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 20), MAT.steelChrome);
  spindle.position.set(0, -1.2, 0.2);
  carriage.add(spindle);

  const microTool = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.01, 0.8, 16), MAT.steelChrome);
  microTool.position.set(0, -1.8, 0.2);
  carriage.add(microTool);

  group.add(carriage);
  group.toolCarriage = carriage;
  group.spindleTool = microTool;

  // High-Precision Trunnion Table & Finished Airfoil Blade
  const trunnion = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.45, 24), MAT.steelChrome);
  trunnion.position.set(0, 1.35, 0.5);
  group.add(trunnion);

  const airfoil = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.7), MAT.workpieceAlloy);
  airfoil.position.set(0, 1.9, 0.5);
  airfoil.rotation.y = 0.6;
  group.add(airfoil);
  group.turbineBlade = airfoil;

  // External Mist Extraction Filter Unit on Roof
  const mistFilter = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.4, 16), MAT.machineDark);
  mistFilter.position.set(2.0, 6.4, -0.8);
  group.add(mistFilter);

  // Siemens 840D Operator Console
  const consoleMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.25), MAT.machineDark);
  consoleMesh.position.set(3.2, 2.4, 1.8);
  consoleMesh.rotation.y = -0.4;
  group.add(consoleMesh);

  const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.05), MAT.terminalScreen);
  screenMesh.position.set(3.2, 2.4, 1.95);
  screenMesh.rotation.y = -0.4;
  group.add(screenMesh);

  // Status Beacon
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.35, 16), new THREE.MeshBasicMaterial({ color: 0x059669 }));
  beacon.position.set(-2.5, 6.8, -1.2);
  group.add(beacon);
  group.beaconLight = beacon;

  // Status Halo
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.8, 32), new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 4. PRESS-01: 1000-TON HYDRAULIC FORGING PRESS
 */
export function createHydraulicPress(position = { x: 7, y: 0, z: -11 }) {
  const group = new THREE.Group();
  group.userData = { id: "PRESS-01", type: "HYDRAULIC_PRESS", name: "1000T Bulkhead Forging Press" };

  const baseGeo = new THREE.BoxGeometry(6.8, 1.6, 6.0);
  const base = new THREE.Mesh(baseGeo, MAT.pressBody);
  base.position.y = 0.8;
  base.castShadow = true;
  group.add(base);

  const pillarCoords = [[-2.5, 2.3], [2.5, 2.3], [-2.5, -2.3], [2.5, -2.3]];
  pillarCoords.forEach(([px, pz]) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 8.0, 24), MAT.steelChrome);
    p.position.set(px, 4.8, pz);
    group.add(p);

    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.45, 6), MAT.hazardDark);
    nut.position.set(px, 9.0, pz);
    group.add(nut);
  });

  const crown = new THREE.Mesh(new THREE.BoxGeometry(7.0, 2.0, 6.2), MAT.pressSafetyOrange);
  crown.position.y = 9.0;
  crown.castShadow = true;
  group.add(crown);

  const tank = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 2.2), MAT.machineDark);
  tank.position.set(0, 10.7, -1.2);
  group.add(tank);

  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.8, 24), MAT.steelChrome);
  cyl.position.set(0, 11.0, 0.6);
  group.add(cyl);

  const ram = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.4, 4.6), MAT.pressBody);
  ram.position.set(0, 5.4, 0);
  ram.castShadow = true;
  group.add(ram);
  group.ramMesh = ram;

  const die = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 2.6), MAT.steelChrome);
  die.position.set(0, -0.8, 0);
  ram.add(die);

  const billet = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.38, 2.0), MAT.hotBillet);
  billet.position.set(0, 1.8, 0);
  group.add(billet);
  group.hotBillet = billet;

  // Status Halo
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.8, 4.2, 32), new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 5. PRESS-02: 500-TON HYDRAULIC EXTRUSION PRESS (Horizontal Spar Extrusion)
 */
export function createExtrusionPress(position = { x: 19, y: 0, z: -11 }) {
  const group = new THREE.Group();
  group.userData = { id: "PRESS-02", type: "HYDRAULIC_PRESS", name: "500T Hydraulic Extrusion Press" };

  // Main Cast Base Frame (Longitudinal)
  const bed = new THREE.Mesh(new THREE.BoxGeometry(9.4, 1.2, 4.2), MAT.machineChassis);
  bed.position.y = 0.6;
  bed.castShadow = true;
  group.add(bed);

  // 4 Horizontal Heavy Chrome Tie-Bars
  [[-1.6, 1.4], [1.6, 1.4], [-1.6, 2.6], [1.6, 2.6]].forEach(([pz, py]) => {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 8.4, 16), MAT.steelChrome);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, py, pz);
    group.add(rod);
  });

  // Rear Hydraulic Ram Cylinder
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.2, 20), MAT.pressSafetyOrange);
  cyl.rotation.z = Math.PI / 2;
  cyl.position.set(-3.2, 2.0, 0);
  group.add(cyl);

  // Translating Extrusion Ram Plunger
  const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 3.0, 16), MAT.steelChrome);
  ram.rotation.z = Math.PI / 2;
  ram.position.set(-1.0, 2.0, 0);
  group.add(ram);
  group.extrusionRam = ram;

  // Billet Container Chamber (Heated)
  const chamber = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), MAT.machineDark);
  chamber.position.set(1.4, 2.0, 0);
  group.add(chamber);

  // Forward Runoff Roller Table carrying Extruded Titanium Profile
  const table = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 1.4), MAT.structuralSteel);
  table.position.set(5.0, 1.4, 0);
  group.add(table);

  // Rollers on Runoff Table
  for (let rx = 3.2; rx <= 7.0; rx += 0.8) {
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 12), MAT.steelChrome);
    roller.rotation.x = Math.PI / 2;
    roller.position.set(rx, 1.7, 0);
    group.add(roller);
  }

  // Extruded Spar Part
  const spar = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 0.6), MAT.workpieceAlloy);
  spar.position.set(5.2, 1.85, 0);
  group.add(spar);

  // Status Halo
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.0, 32), new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 6. FURN-01: VACUUM HEAT TREATMENT CARBURIZING FURNACE (Cylindrical Vessel with Heat Port)
 */
export function createVacuumFurnace(position = { x: 13, y: 0, z: -2 }) {
  const group = new THREE.Group();
  group.userData = { id: "FURN-01", type: "FURNACE", name: "Vacuum Carburizing Furnace" };

  // Foundation Support Cradle
  [-2.2, 2.2].forEach(x => {
    const cradle = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 4.4), MAT.structuralSteel);
    cradle.position.set(x, 0.8, 0);
    cradle.castShadow = true;
    group.add(cradle);
  });

  // Main Horizontal Cylindrical Vacuum Vessel
  const vessel = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 6.4, 28), MAT.furnaceInsulation);
  vessel.rotation.z = Math.PI / 2;
  vessel.position.set(0, 2.6, 0);
  vessel.castShadow = true;
  group.add(vessel);

  // Front Heavy Hinged Vacuum Door with Clamping Ring
  const door = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.35, 0.6, 28), MAT.machineDark);
  door.rotation.z = Math.PI / 2;
  door.position.set(3.4, 2.6, 0);
  group.add(door);

  // Glowing Quartz Observation Viewport (Radiant Orange Heat)
  const windowFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.15, 20), MAT.steelChrome);
  windowFrame.rotation.z = Math.PI / 2;
  windowFrame.position.set(3.75, 2.6, 0);
  group.add(windowFrame);

  const glowPort = new THREE.Mesh(new THREE.CircleGeometry(0.45, 20), new THREE.MeshBasicMaterial({
    color: 0xff4500,
    side: THREE.DoubleSide,
  }));
  glowPort.rotation.y = Math.PI / 2;
  glowPort.position.set(3.85, 2.6, 0);
  group.add(glowPort);
  group.glowPort = glowPort;

  // Rear Pumping Skid & High-Vacuum Turbo Pump
  const pumpSkid = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 2.4), MAT.machineDark);
  pumpSkid.position.set(-3.8, 1.0, 0);
  group.add(pumpSkid);

  const turboPump = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 1.8, 16), MAT.steelChrome);
  turboPump.position.set(-3.8, 2.2, 0);
  group.add(turboPump);

  // Overhead Nitrogen Quench Tanks
  [-1.0, 1.0].forEach(x => {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.2, 16), MAT.machineAccentCyan);
    tank.position.set(x, 5.5, 0);
    group.add(tank);
  });

  // Exhaust Stack Pipe
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.8), MAT.structuralSteel);
  stack.position.set(0, 6.2, 0);
  group.add(stack);

  // Digital Temperature Controller Display (980°C)
  const display = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.1), MAT.terminalScreen);
  display.position.set(2.8, 3.8, 2.1);
  group.add(display);

  // Status Halo
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.0, 32), new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 7. ROBOT-01: 6-DOF ROBOTIC DEBURRING & POLISHING WORKCELL
 */
export function createRoboticCell(position = { x: -16, y: 0, z: 8 }) {
  const group = new THREE.Group();
  group.userData = { id: "ROBOT-01", type: "ROBOT_ARM", name: "6-DOF Robotic Deburring Cell" };

  // Workcell Perimeter Yellow Safety Fence with Polycarbonate Windows
  const fenceSize = 6.4;
  const fenceH = 2.8;
  const postGeo = new THREE.BoxGeometry(0.12, fenceH, 0.12);
  const railGeoX = new THREE.BoxGeometry(fenceSize, 0.1, 0.1);
  const railGeoZ = new THREE.BoxGeometry(0.1, 0.1, fenceSize);

  // Perimeter Rails
  [0, fenceH].forEach(y => {
    const rx = new THREE.Mesh(railGeoX, MAT.hazardYellow);
    rx.position.set(0, y, -fenceSize / 2);
    group.add(rx);

    const rz = new THREE.Mesh(railGeoZ, MAT.hazardYellow);
    rz.position.set(-fenceSize / 2, y, 0);
    group.add(rz);
  });

  // Base Pedestal
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 1.4, 20), MAT.machineDark);
  pedestal.position.y = 0.7;
  pedestal.castShadow = true;
  group.add(pedestal);

  // 6-DOF Industrial Robot Arm Hierarchy
  const robotRoot = new THREE.Group();
  robotRoot.position.set(0, 1.4, 0);

  // Joint 1: Base Turntable
  const j1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 16), MAT.robotYellow);
  robotRoot.add(j1);

  // Joint 2: Lower Boom
  const j2Pivot = new THREE.Group();
  j2Pivot.position.set(0, 0.35, 0);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.4, 0.45), MAT.robotYellow);
  boom.position.set(0, 1.1, 0);
  boom.rotation.z = 0.25;
  j2Pivot.add(boom);

  // Joint 3: Upper Arm
  const j3Pivot = new THREE.Group();
  j3Pivot.position.set(0.4, 2.1, 0);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 2.0, 0.38), MAT.robotYellow);
  arm.position.set(0, 0.9, 0);
  arm.rotation.z = -0.55;
  j3Pivot.add(arm);

  // Joint 4/5/6: Wrist & Deburring Spindle Tool
  const wrist = new THREE.Group();
  wrist.position.set(-0.8, 1.8, 0);

  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.7, 16), MAT.steelChrome);
  wrist.add(spindle);

  const burr = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 12), MAT.steelChrome);
  burr.position.set(0, -0.45, 0);
  wrist.add(burr);

  j3Pivot.add(wrist);
  j2Pivot.add(j3Pivot);
  robotRoot.add(j2Pivot);
  group.add(robotRoot);

  group.robotRoot = robotRoot;
  group.robotJ2 = j2Pivot;
  group.robotJ3 = j3Pivot;

  // Workpiece Fixture Rotary Table
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 1.1, 20), MAT.steelChrome);
  table.position.set(1.8, 0.55, 0);
  group.add(table);

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 0.6), MAT.workpieceAlloy);
  blade.position.set(1.8, 1.6, 0);
  group.add(blade);

  // Status Halo
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.8, 32), new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 8. LASER-01: DUAL LASER TRIANGULATION QC METROLOGY ARCH
 */
export function createLaserQCArch(position = { x: -6, y: 0, z: 8 }) {
  const group = new THREE.Group();
  group.userData = { id: "LASER-01", type: "METROLOGY", name: "Laser Triangulation QC Arch" };

  // Precision Black Granite Surface Plate
  const granite = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.1, 4.4), MAT.graniteBase);
  granite.position.y = 0.55;
  granite.castShadow = true;
  group.add(granite);

  // Carbon-Fiber Inverted-U Metrology Gantry Arch
  const colGeo = new THREE.BoxGeometry(0.6, 4.2, 0.8);
  [-2.2, 2.2].forEach(x => {
    const col = new THREE.Mesh(colGeo, MAT.machineDark);
    col.position.set(x, 2.7, 0);
    group.add(col);
  });

  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.8, 0.9), MAT.machineDark);
  archBeam.position.set(0, 4.6, 0);
  group.add(archBeam);

  // Dual Laser Displacement Sensor Heads
  [-1.1, 1.1].forEach(lx => {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.6), MAT.machineAccentCyan);
    head.position.set(lx, 4.0, 0);
    group.add(head);

    const laserEmitter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2), MAT.steelChrome);
    laserEmitter.position.set(lx, 3.6, 0);
    group.add(laserEmitter);
  });

  // Sweeping Vertical Planar Laser Sheet
  const laserPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), MAT.laserScannerPlane);
  laserPlane.position.set(0, 2.4, 0);
  laserPlane.rotation.x = 0;
  group.add(laserPlane);
  group.laserPlane = laserPlane;

  // Clamped Airfoil Component being inspected
  const part = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.8), MAT.workpieceAlloy);
  part.position.set(0, 1.7, 0);
  group.add(part);

  // Digital Micrometer HUD Column
  const readout = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.1), MAT.terminalScreen);
  readout.position.set(2.4, 3.2, 0.5);
  group.add(readout);

  // Status Halo
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.6, 32), new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 9. CONV-01: MODULAR DUAL-RAIL AVIONICS ASSEMBLY LINE
 */
export function createConveyorLine(position = { x: 13, y: 0, z: 8 }) {
  const group = new THREE.Group();
  group.userData = { id: "CONV-01", type: "CONVEYOR", name: "Avionics Assembly Line" };

  const length = 22.0;
  const width = 2.8;

  const frame = new THREE.Mesh(new THREE.BoxGeometry(length, 0.7, width), MAT.aluminumExtrusion);
  frame.position.y = 1.35;
  frame.castShadow = true;
  group.add(frame);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(length - 0.2, 0.1, width - 0.5), MAT.conveyorBelt);
  belt.position.y = 1.72;
  group.add(belt);

  // E-Stop Cords
  const cordGeo = new THREE.CylinderGeometry(0.02, 0.02, length - 0.4);
  cordGeo.rotateZ(Math.PI / 2);
  [-width / 2 - 0.1, width / 2 + 0.1].forEach(ez => {
    const cord = new THREE.Mesh(cordGeo, MAT.ledRed);
    cord.position.set(0, 1.6, ez);
    group.add(cord);
  });

  // Support Legs
  const legGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.4);
  for (let x = -9.0; x <= 9.0; x += 4.5) {
    [-1.1, 1.1].forEach(z => {
      const leg = new THREE.Mesh(legGeo, MAT.structuralSteel);
      leg.position.set(x, 0.7, z);
      group.add(leg);
    });
  }

  // Laser QC Inspection Tunnel Arch at Midpoint
  const tunnelGroup = new THREE.Group();
  tunnelGroup.position.set(0, 1.7, 0);

  const tunnelArch = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.5, width + 0.5), MAT.machineDark);
  tunnelArch.position.y = 1.25;
  tunnelGroup.add(tunnelArch);

  const tunnelChamber = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.7, width - 0.2), MAT.floorEpoxy);
  tunnelChamber.position.y = 0.85;
  tunnelGroup.add(tunnelChamber);

  const tunnelLaser = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 1.7), MAT.laserScannerPlane);
  tunnelLaser.position.set(0, 0.85, 0);
  tunnelLaser.rotation.y = Math.PI / 2;
  tunnelGroup.add(tunnelLaser);
  group.tunnelLaser = tunnelLaser;

  group.add(tunnelGroup);

  // Moving Pallets
  group.crates = [];
  for (let i = 0; i < 5; i++) {
    const palletGroup = new THREE.Group();
    palletGroup.position.set(-9.0 + i * 4.5, 2.0, 0);

    const palBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 1.4), MAT.cargoPallet);
    palletGroup.add(palBase);

    const part = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.65), MAT.workpieceAlloy);
    part.position.y = 0.48;
    palletGroup.add(part);

    palletGroup.castShadow = true;
    group.add(palletGroup);
    group.crates.push(palletGroup);
  }

  // Status Halo
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.0, 32), new THREE.MeshBasicMaterial({ color: 0x059669, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 10. AGV-01 & AGV-02: AUTONOMOUS MOBILE ROBOT FLEET
 */
export function createAGVRobot(id = "AGV-01", cargoType = "pallet") {
  const group = new THREE.Group();
  group.userData = { id, type: "AGV", name: id === "AGV-01" ? "Patrol Logistics AMR" : "Transit Cargo AMR" };

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.65, 1.7), MAT.machineChassis);
  body.position.y = 0.45;
  body.castShadow = true;
  group.add(body);

  [-0.87, 0.87].forEach(z => {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.15, 0.1), MAT.hazardYellow);
    skirt.position.set(0, 0.35, z);
    group.add(skirt);
  });

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 1.5), MAT.machineDark);
  bumper.position.set(1.2, 0.4, 0);
  group.add(bumper);

  const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 1.2), MAT.laserCyan);
  headlight.position.set(1.32, 0.4, 0);
  group.add(headlight);

  const driveLight = new THREE.SpotLight(0x0284c7, 2.5, 14, Math.PI / 4, 0.4, 1.0);
  driveLight.position.set(1.3, 0.5, 0);
  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(5.0, 0, 0);
  group.add(driveLight);
  group.add(lightTarget);
  driveLight.target = lightTarget;
  group.driveLight = driveLight;

  // 3D Rotating LiDAR Puck
  const lidarPuck = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.3, 20), MAT.steelChrome);
  lidarPuck.position.set(0.65, 0.95, 0);
  group.add(lidarPuck);
  group.lidarPuck = lidarPuck;

  // LiDAR Scan Cone
  const coneGeo = new THREE.ConeGeometry(2.2, 3.8, 16, 1, true);
  coneGeo.rotateX(Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const lidarCone = new THREE.Mesh(coneGeo, coneMat);
  lidarCone.position.set(2.4, 0.6, 0);
  group.add(lidarCone);
  group.lidarCone = lidarCone;

  // Flashing Amber Beacon
  const strobe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.24, 16), MAT.strobeAmber);
  strobe.position.set(-0.85, 1.15, 0);
  group.add(strobe);
  group.strobeBeacon = strobe;

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.22, 20);
  wheelGeo.rotateZ(Math.PI / 2);
  group.wheels = [];
  [[-0.7, 0.26, 0.9], [0.7, 0.26, 0.9], [-0.7, 0.26, -0.9], [0.7, 0.26, -0.9]].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(wheelGeo, MAT.machineDark);
    w.position.set(x, y, z);
    group.add(w);
    group.wheels.push(w);
  });

  // Cargo Payload
  const cargoGroup = new THREE.Group();
  cargoGroup.position.set(-0.1, 0.85, 0);
  const cargoPallet = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.15, 1.2), MAT.cargoPallet);
  cargoGroup.add(cargoPallet);

  const partCrate = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.85), MAT.workpieceAlloy);
  partCrate.position.y = 0.35;
  cargoGroup.add(partCrate);
  group.add(cargoGroup);

  group.position.set(0, 0, 0);
  return group;
}

/**
 * 11. FACTORY BUILDING SHELL (Architectural Walls & Dollhouse Cutaway Roof)
 * Dimensions: 64m (X) x 48m (Z) x 10m (Y)
 * Supports smooth dollhouse cutaway transitions into interior mode.
 */
export function createFactoryBuildingShell() {
  const buildingGroup = new THREE.Group();
  const roofGroup = new THREE.Group();
  const upperWallsGroup = new THREE.Group();
  const exteriorInteractables = [];
  const rooftopFans = [];

  // --- A. BASE PERIMETER WALLS (Low 1.2m concrete sill that stays visible inside) ---
  const baseMat = MAT.machineDark;

  // North Base (Z = -24)
  const nBase = new THREE.Mesh(new THREE.BoxGeometry(64.4, 1.2, 0.6), baseMat);
  nBase.position.set(0, 0.6, -24);
  buildingGroup.add(nBase);

  // East Base (X = 32)
  const eBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 48.4), baseMat);
  eBase.position.set(32, 0.6, 0);
  buildingGroup.add(eBase);

  // West Base (X = -32)
  const wBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 48.4), baseMat);
  wBase.position.set(-32, 0.6, 0);
  buildingGroup.add(wBase);

  // South Base (Z = 24) - Left & Right of Entrance (central 12m open for entrance airlock)
  const sBaseLeft = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 0.6), baseMat);
  sBaseLeft.position.set(-19, 0.6, 24);
  buildingGroup.add(sBaseLeft);

  const sBaseRight = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 0.6), baseMat);
  sBaseRight.position.set(19, 0.6, 24);
  buildingGroup.add(sBaseRight);


  // --- B. UPPER CUTAWAY WALLS (1.2m to 9.8m high; fades/hides in interior dollhouse mode) ---

  // North Upper Wall (Industrial Cladding + Clerestory Ribbon Windows)
  const nUpperWall = new THREE.Mesh(new THREE.BoxGeometry(64.4, 6.2, 0.6), MAT.buildingWall);
  nUpperWall.position.set(0, 4.3, -24);
  nUpperWall.userData.isFactoryExterior = true;
  upperWallsGroup.add(nUpperWall);
  exteriorInteractables.push(nUpperWall);

  // North Ribbon Windows (Clerestory)
  const nWindow = new THREE.Mesh(new THREE.BoxGeometry(60, 2.2, 0.7), MAT.buildingRibbonGlass);
  nWindow.position.set(0, 8.5, -24);
  nWindow.userData.isFactoryExterior = true;
  upperWallsGroup.add(nWindow);
  exteriorInteractables.push(nWindow);

  // East Upper Wall (Louvers & Cladding)
  const eUpperWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6.2, 48.4), MAT.buildingWall);
  eUpperWall.position.set(32, 4.3, 0);
  eUpperWall.userData.isFactoryExterior = true;
  upperWallsGroup.add(eUpperWall);
  exteriorInteractables.push(eUpperWall);

  const eWindow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 44), MAT.buildingRibbonGlass);
  eWindow.position.set(32, 8.5, 0);
  eWindow.userData.isFactoryExterior = true;
  upperWallsGroup.add(eWindow);
  exteriorInteractables.push(eWindow);

  // West Upper Wall
  const wUpperWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6.2, 48.4), MAT.buildingWall);
  wUpperWall.position.set(-32, 4.3, 0);
  wUpperWall.userData.isFactoryExterior = true;
  upperWallsGroup.add(wUpperWall);
  exteriorInteractables.push(wUpperWall);

  const wWindow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 44), MAT.buildingRibbonGlass);
  wWindow.position.set(-32, 8.5, 0);
  wWindow.userData.isFactoryExterior = true;
  upperWallsGroup.add(wWindow);
  exteriorInteractables.push(wWindow);

  // South Upper Wall: Modern Architectural Glass Curtain Wall
  const sUpperLeft = new THREE.Mesh(new THREE.BoxGeometry(26, 8.5, 0.5), MAT.buildingRibbonGlass);
  sUpperLeft.position.set(-19, 5.45, 24);
  sUpperLeft.userData.isFactoryExterior = true;
  upperWallsGroup.add(sUpperLeft);
  exteriorInteractables.push(sUpperLeft);

  const sUpperRight = new THREE.Mesh(new THREE.BoxGeometry(26, 8.5, 0.5), MAT.buildingRibbonGlass);
  sUpperRight.position.set(19, 5.45, 24);
  sUpperRight.userData.isFactoryExterior = true;
  upperWallsGroup.add(sUpperRight);
  exteriorInteractables.push(sUpperRight);

  // Entrance Header Beam across Z = 24
  const sHeader = new THREE.Mesh(new THREE.BoxGeometry(64.8, 1.4, 1.2), MAT.buildingTrim);
  sHeader.position.set(0, 9.2, 24);
  sHeader.userData.isFactoryExterior = true;
  upperWallsGroup.add(sHeader);
  exteriorInteractables.push(sHeader);

  // Entrance Architectural Canopy extending out
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(16, 0.35, 5), MAT.buildingTrim);
  canopy.position.set(0, 4.8, 26.5);
  canopy.userData.isFactoryExterior = true;
  upperWallsGroup.add(canopy);
  exteriorInteractables.push(canopy);

  // Canopy Glass Under-Panel
  const canopyGlass = new THREE.Mesh(new THREE.BoxGeometry(15, 0.1, 4.5), MAT.portalGlass);
  canopyGlass.position.set(0, 4.6, 26.5);
  upperWallsGroup.add(canopyGlass);

  // Front Facade Glowing Company Signage above Entrance
  const facadeSignGeo = new THREE.BoxGeometry(14, 1.0, 0.2);
  const facadeSignMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const facadeSign = new THREE.Mesh(facadeSignGeo, facadeSignMat);
  facadeSign.position.set(0, 6.2, 24.3);
  upperWallsGroup.add(facadeSign);

  buildingGroup.add(upperWallsGroup);


  // --- C. ROOF STRUCTURE & ROOFTOP INDUSTRIAL EQUIPMENT (Hides in dollhouse mode) ---

  // Main Roof Slab (64.8m x 48.8m x 0.5m)
  const roofSlabGeo = new THREE.BoxGeometry(64.8, 0.5, 48.8);
  const roofSlab = new THREE.Mesh(roofSlabGeo, MAT.buildingRoof);
  roofSlab.position.set(0, 9.9, 0);
  roofSlab.userData.isFactoryExterior = true;
  roofGroup.add(roofSlab);
  exteriorInteractables.push(roofSlab);

  // Parapet Edges (4 rims around perimeter)
  const parapetNorth = new THREE.Mesh(new THREE.BoxGeometry(65.4, 0.9, 0.6), MAT.buildingTrim);
  parapetNorth.position.set(0, 10.4, -24.4);
  parapetNorth.userData.isFactoryExterior = true;
  roofGroup.add(parapetNorth);
  exteriorInteractables.push(parapetNorth);

  const parapetSouth = new THREE.Mesh(new THREE.BoxGeometry(65.4, 0.9, 0.6), MAT.buildingTrim);
  parapetSouth.position.set(0, 10.4, 24.4);
  parapetSouth.userData.isFactoryExterior = true;
  roofGroup.add(parapetSouth);
  exteriorInteractables.push(parapetSouth);

  const parapetEast = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 49.4), MAT.buildingTrim);
  parapetEast.position.set(32.4, 10.4, 0);
  parapetEast.userData.isFactoryExterior = true;
  roofGroup.add(parapetEast);
  exteriorInteractables.push(parapetEast);

  const parapetWest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 49.4), MAT.buildingTrim);
  parapetWest.position.set(-32.4, 10.4, 0);
  parapetWest.userData.isFactoryExterior = true;
  roofGroup.add(parapetWest);
  exteriorInteractables.push(parapetWest);

  // 4 Architectural Glass Skylight Lanterns (illuminating the 4 bays below)
  const skylightPads = [
    { x: -14, z: -11, w: 16, d: 9 },
    { x: 14, z: -11, w: 16, d: 9 },
    { x: -14, z: 11, w: 16, d: 9 },
    { x: 14, z: 11, w: 16, d: 9 },
  ];

  skylightPads.forEach(s => {
    // Skylight curb
    const curb = new THREE.Mesh(new THREE.BoxGeometry(s.w + 0.4, 0.5, s.d + 0.4), MAT.buildingTrim);
    curb.position.set(s.x, 10.3, s.z);
    curb.userData.isFactoryExterior = true;
    roofGroup.add(curb);
    exteriorInteractables.push(curb);

    // Skylight Glass Prism
    const glass = new THREE.Mesh(new THREE.BoxGeometry(s.w, 0.35, s.d), MAT.buildingRibbonGlass);
    glass.position.set(s.x, 10.6, s.z);
    glass.userData.isFactoryExterior = true;
    roofGroup.add(glass);
    exteriorInteractables.push(glass);
  });

  // 3 Industrial HVAC Rooftop Chiller Skids with spinning fan blades
  const hvacPositions = [
    { x: 0, z: -16 },
    { x: 0, z: 0 },
    { x: 0, z: 16 }
  ];

  hvacPositions.forEach(pos => {
    const hvac = new THREE.Group();
    hvac.position.set(pos.x, 10.15, pos.z);

    // Chiller enclosure
    const box = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.6, 2.8), MAT.rooftopHvac);
    box.position.y = 0.8;
    hvac.add(box);

    // Dual extraction fans on top
    [-1.3, 1.3].forEach(fx => {
      const fanHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.3, 16), MAT.buildingTrim);
      fanHousing.position.set(fx, 1.7, 0);
      hvac.add(fanHousing);

      // Fan blades
      const bladeGeo = new THREE.BoxGeometry(1.4, 0.05, 0.22);
      const fanBlade = new THREE.Mesh(bladeGeo, MAT.steelChrome);
      fanBlade.position.set(fx, 1.8, 0);
      hvac.add(fanBlade);
      rooftopFans.push(fanBlade);
    });

    roofGroup.add(hvac);
  });

  // 2 Photovoltaic Solar Panel Arrays
  [-22, 22].forEach(ax => {
    const arrayGroup = new THREE.Group();
    arrayGroup.position.set(ax, 10.15, 0);
    for (let r = 0; r < 4; r++) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.1, 1.8), MAT.solarPanel);
      panel.position.set(0, 0.3 + r * 0.08, -6 + r * 3.8);
      panel.rotation.x = -0.15; // angled toward sun
      arrayGroup.add(panel);
    }
    roofGroup.add(arrayGroup);
  });

  // Large Elevated Rooftop Signboard: "TITAN AEROSPACE"
  const roofSignBoard = new THREE.Mesh(new THREE.BoxGeometry(22, 1.8, 0.4), MAT.portalArch);
  roofSignBoard.position.set(0, 11.8, 22.5);
  roofGroup.add(roofSignBoard);

  const roofSignGlow = new THREE.Mesh(new THREE.BoxGeometry(20, 0.9, 0.45), MAT.portalGlowCyan);
  roofSignGlow.position.set(0, 11.8, 22.55);
  roofGroup.add(roofSignGlow);

  buildingGroup.add(roofGroup);

  return { buildingGroup, roofGroup, upperWallsGroup, exteriorInteractables, rooftopFans };
}

/**
 * 12. TOWN ENVIRONMENT & URBAN CAMPUS (Roads, Traffic, Parking, Corridor, Streetlamps & Skyline)
 * Spans 170m x 150m surrounding the central facility.
 */
export function createTownEnvironment() {
  const townGroup = new THREE.Group();
  const trafficVehicles = [];
  const animatedFans = [];

  // --- A. URBAN GROUND TERRAIN ---
  const terrainGeo = new THREE.BoxGeometry(175, 0.4, 155);
  const terrainMesh = new THREE.Mesh(terrainGeo, MAT.grassLawn);
  terrainMesh.position.y = -0.6;
  terrainMesh.receiveShadow = true;
  townGroup.add(terrainMesh);

  // --- B. SURROUNDING ROAD NETWORK (Two-lane 8m wide asphalt ring) ---
  // South Road (Z = 36)
  const roadSouth = new THREE.Mesh(new THREE.BoxGeometry(140, 0.12, 10), MAT.asphalt);
  roadSouth.position.set(0, -0.34, 36);
  roadSouth.receiveShadow = true;
  townGroup.add(roadSouth);

  // North Road (Z = -36)
  const roadNorth = new THREE.Mesh(new THREE.BoxGeometry(140, 0.12, 10), MAT.asphalt);
  roadNorth.position.set(0, -0.34, -36);
  roadNorth.receiveShadow = true;
  townGroup.add(roadNorth);

  // West Road (X = -52)
  const roadWest = new THREE.Mesh(new THREE.BoxGeometry(10, 0.12, 82), MAT.asphalt);
  roadWest.position.set(-52, -0.34, 0);
  roadWest.receiveShadow = true;
  townGroup.add(roadWest);

  // East Road (X = 52)
  const roadEast = new THREE.Mesh(new THREE.BoxGeometry(10, 0.12, 82), MAT.asphalt);
  roadEast.position.set(52, -0.34, 0);
  roadEast.receiveShadow = true;
  townGroup.add(roadEast);

  // Road Markings: Dashed Centerlines
  for (let x = -60; x <= 60; x += 6) {
    const dashS = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.02, 0.3), MAT.roadMarking);
    dashS.position.set(x, -0.27, 36);
    townGroup.add(dashS);

    const dashN = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.02, 0.3), MAT.roadMarking);
    dashN.position.set(x, -0.27, -36);
    townGroup.add(dashN);
  }

  for (let z = -32; z <= 32; z += 6) {
    const dashW = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 3.5), MAT.roadMarking);
    dashW.position.set(-52, -0.27, z);
    townGroup.add(dashW);

    const dashE = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 3.5), MAT.roadMarking);
    dashE.position.set(52, -0.27, z);
    townGroup.add(dashE);
  }

  // Crosswalk Zebra Stripes at South Entrance
  for (let cz = 32; cz <= 40; cz += 1.2) {
    const zebra = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.02, 0.6), MAT.roadMarking);
    zebra.position.set(0, -0.27, cz);
    townGroup.add(zebra);
  }


  // --- C. COMPANY PARKING LOT (South-West: X = -38 to -12, Z = 25 to 44) ---
  const parkingLot = new THREE.Mesh(new THREE.BoxGeometry(28, 0.14, 18), MAT.asphalt);
  parkingLot.position.set(-26, -0.33, 34);
  parkingLot.receiveShadow = true;
  townGroup.add(parkingLot);

  // Parking Island Curbs
  const curbGeo = new THREE.BoxGeometry(29, 0.22, 0.8);
  const curbNorth = new THREE.Mesh(curbGeo, MAT.sidewalk);
  curbNorth.position.set(-26, -0.25, 24.6);
  townGroup.add(curbNorth);

  // Painted Parking Stall Stripes
  for (let i = 0; i < 7; i++) {
    const px = -38 + i * 3.8;
    // Row 1
    const pStripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 5.0), MAT.parkingStripe);
    pStripe1.position.set(px, -0.25, 29);
    townGroup.add(pStripe1);

    // Row 2
    const pStripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 5.0), MAT.parkingStripe);
    pStripe2.position.set(px, -0.25, 39);
    townGroup.add(pStripe2);
  }

  // Parked Employee & Executive Vehicles in Stalls
  const carColors = [MAT.carRed, MAT.carBlue, MAT.carWhite, MAT.carSilver, MAT.carBlack];
  const parkedCarsConfig = [
    { x: -36.1, z: 29, rot: 0, mat: MAT.carBlue },
    { x: -32.3, z: 29, rot: 0, mat: MAT.carWhite },
    { x: -28.5, z: 29, rot: 0, mat: MAT.carSilver },
    { x: -20.9, z: 29, rot: 0, mat: MAT.carRed },
    { x: -36.1, z: 39, rot: Math.PI, mat: MAT.carBlack },
    { x: -32.3, z: 39, rot: Math.PI, mat: MAT.carSilver },
    { x: -24.7, z: 39, rot: Math.PI, mat: MAT.carBlue },
    { x: -17.1, z: 39, rot: Math.PI, mat: MAT.carWhite },
  ];

  parkedCarsConfig.forEach(cfg => {
    const car = createDetailedVehicleMesh(cfg.mat, false);
    car.position.set(cfg.x, -0.22, cfg.z);
    car.rotation.y = cfg.rot;
    townGroup.add(car);
  });

  // EV Charging Pedestals with glowing green LED strips
  [-17.1, -13.3].forEach(evX => {
    const charger = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.3, 0.5), MAT.machineDark);
    charger.position.set(evX, 0.4, 26.5);
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.52), MAT.ledGreen);
    led.position.set(evX, 0.4, 26.5);
    townGroup.add(charger);
    townGroup.add(led);
  });

  // Security Guardhouse Booth & Boom Barrier Gate at Parking Entrance
  const guardhouse = new THREE.Group();
  guardhouse.position.set(-11.5, -0.25, 36);

  const ghBuilding = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 2.4), MAT.guardhouseWall);
  ghBuilding.position.y = 1.3;
  guardhouse.add(ghBuilding);

  const ghRoof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.3, 3.0), MAT.buildingTrim);
  ghRoof.position.y = 2.65;
  guardhouse.add(ghRoof);

  const ghGlass = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.0, 2.5), MAT.buildingRibbonGlass);
  ghGlass.position.y = 1.5;
  guardhouse.add(ghGlass);

  // Red/White Boom Barrier Arm
  const barrierPost = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.1, 16), MAT.buildingTrim);
  barrierPost.position.set(-1.8, 0.55, 1.6);
  guardhouse.add(barrierPost);

  const barrierArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3.2), MAT.barrierArm);
  barrierArm.position.set(-1.8, 0.95, 3.1);
  guardhouse.add(barrierArm);

  townGroup.add(guardhouse);


  // --- D. COVERED PEDESTRIAN TRANSIT CORRIDOR ---
  // Connects parking lot (X = -12, Z = 28) across to factory entrance (X = -2, Z = 24.5)
  const corridorGroup = new THREE.Group();

  // Paved walkway path
  const walkGeo = new THREE.BoxGeometry(14, 0.14, 3.0);
  const walkway = new THREE.Mesh(walkGeo, MAT.sidewalk);
  walkway.position.set(-7, -0.28, 26);
  walkway.rotation.y = 0.25;
  corridorGroup.add(walkway);

  // Overhead Glass & Steel Canopy
  const canopyGeo = new THREE.BoxGeometry(14, 0.2, 3.4);
  const canopyRoof = new THREE.Mesh(canopyGeo, MAT.buildingTrim);
  canopyRoof.position.set(-7, 3.2, 26);
  canopyRoof.rotation.y = 0.25;
  corridorGroup.add(canopyRoof);

  const canopyGlassMesh = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.08, 3.2), MAT.portalGlass);
  canopyGlassMesh.position.set(-7, 3.1, 26);
  canopyGlassMesh.rotation.y = 0.25;
  corridorGroup.add(canopyGlassMesh);

  // Support Columns along corridor
  for (let c = -13; c <= -1; c += 3.5) {
    const colLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 12), MAT.structuralSteel);
    colLeft.position.set(c, 1.4, 24.7);
    corridorGroup.add(colLeft);

    const colRight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 12), MAT.structuralSteel);
    colRight.position.set(c, 1.4, 27.3);
    corridorGroup.add(colRight);
  }

  // Floor LED guide lights
  for (let c = -12; c <= -2; c += 2.0) {
    const led = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 8), MAT.portalGlowCyan);
    led.position.set(c, -0.15, 26);
    corridorGroup.add(led);
  }

  townGroup.add(corridorGroup);


  // --- E. STREETLAMPS & URBAN LANDSCAPING (Trees, shrubs & sidewalks) ---
  const streetlampPositions = [
    { x: -44, z: 31 }, { x: -20, z: 31 }, { x: 20, z: 31 }, { x: 44, z: 31 },
    { x: -44, z: -31 }, { x: -20, z: -31 }, { x: 20, z: -31 }, { x: 44, z: -31 },
    { x: -47, z: -15 }, { x: -47, z: 15 }, { x: 47, z: -15 }, { x: 47, z: 15 },
  ];

  streetlampPositions.forEach(sl => {
    const lamp = createModernStreetlamp();
    lamp.position.set(sl.x, -0.3, sl.z);
    townGroup.add(lamp);
  });

  // Street Trees & Planters
  const treePositions = [
    { x: -45, z: 25 }, { x: -35, z: 22 }, { x: 25, z: 26 }, { x: 38, z: 26 },
    { x: -45, z: -25 }, { x: -35, z: -25 }, { x: 25, z: -25 }, { x: 38, z: -25 },
    { x: -47, z: 0 }, { x: 47, z: 0 }, { x: -14, z: 22 }, { x: 14, z: 22 },
  ];

  treePositions.forEach(tp => {
    const tree = createStreetTree();
    tree.position.set(tp.x, -0.3, tp.z);
    townGroup.add(tree);
  });


  // --- F. BACKGROUND TOWN SKYLINE (Corporate Office Towers & Tech Centers) ---
  const skylineTowers = [
    // North Horizon
    { x: -45, z: -55, w: 18, d: 16, h: 32 },
    { x: -20, z: -58, w: 22, d: 18, h: 44 },
    { x: 10, z: -56, w: 16, d: 14, h: 28 },
    { x: 38, z: -55, w: 20, d: 18, h: 38 },
    // West Horizon
    { x: -70, z: -20, w: 16, d: 24, h: 36 },
    { x: -72, z: 15, w: 18, d: 22, h: 42 },
    // East Horizon
    { x: 70, z: -15, w: 18, d: 22, h: 30 },
    { x: 72, z: 20, w: 20, d: 26, h: 46 },
    // South Distant
    { x: -30, z: 58, w: 18, d: 16, h: 26 },
    { x: 25, z: 60, w: 22, d: 18, h: 34 },
  ];

  skylineTowers.forEach(t => {
    const tower = createSkylineBuilding(t.w, t.d, t.h);
    tower.position.set(t.x, -0.3, t.z);
    townGroup.add(tower);
  });


  // --- G. ANIMATED TRAFFIC FLEET (6 vehicles circulating the perimeter loop) ---
  // Waypoints around the 4-sided perimeter ring road:
  // South (Z=36): (-46, 36) -> (46, 36)
  // East (X=46):  (46, 36) -> (46, -36)
  // North (Z=-36): (46, -36) -> (-46, -36)
  // West (X=-46): (-46, -36) -> (-46, 36)
  const perimeterWaypoints = [
    new THREE.Vector3(46, -0.22, 36),
    new THREE.Vector3(46, -0.22, -36),
    new THREE.Vector3(-46, -0.22, -36),
    new THREE.Vector3(-46, -0.22, 36),
  ];

  const vehicleConfigs = [
    { type: 'car', mat: MAT.carRed, speed: 0.14, startProg: 0.05 },
    { type: 'car', mat: MAT.carWhite, speed: 0.12, startProg: 0.22 },
    { type: 'van', mat: MAT.carWhite, speed: 0.10, startProg: 0.42 },
    { type: 'car', mat: MAT.carBlue, speed: 0.13, startProg: 0.58 },
    { type: 'truck', mat: MAT.carSilver, speed: 0.09, startProg: 0.75 },
    { type: 'car', mat: MAT.carSilver, speed: 0.15, startProg: 0.90 },
  ];

  vehicleConfigs.forEach((vc, idx) => {
    const mesh = createDetailedVehicleMesh(vc.mat, true, vc.type);
    townGroup.add(mesh);
    trafficVehicles.push({
      mesh,
      speed: vc.speed,
      progress: vc.startProg,
      waypoints: perimeterWaypoints,
      type: vc.type
    });
  });

  return { townGroup, trafficVehicles, animatedFans };
}

/**
 * Creates a procedural vehicle mesh (car, delivery van, or cargo truck)
 */
function createDetailedVehicleMesh(colorMat, hasLights = true, type = 'car') {
  const vGroup = new THREE.Group();

  let bodyLength = 3.6;
  let bodyWidth = 1.6;
  let bodyHeight = 0.8;
  let cabinLength = 2.0;
  let cabinHeight = 0.65;

  if (type === 'van') {
    bodyLength = 4.4;
    bodyWidth = 1.7;
    bodyHeight = 1.2;
    cabinLength = 3.2;
    cabinHeight = 0.7;
  } else if (type === 'truck') {
    bodyLength = 5.2;
    bodyWidth = 1.85;
    bodyHeight = 1.4;
    cabinLength = 1.6;
    cabinHeight = 1.0;
  }

  // Lower Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(bodyLength, bodyHeight, bodyWidth), colorMat);
  chassis.position.y = bodyHeight / 2 + 0.2;
  vGroup.add(chassis);

  // Cabin / Greenhouse
  const cabinMat = (type === 'truck') ? MAT.carWhite : (type === 'van' ? colorMat : MAT.buildingTrim);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinLength, cabinHeight, bodyWidth * 0.9), cabinMat);
  cabin.position.set((type === 'truck' ? 1.4 : -0.2), bodyHeight + cabinHeight / 2 + 0.2, 0);
  vGroup.add(cabin);

  // Tinted Windshields
  const glass = new THREE.Mesh(new THREE.BoxGeometry(cabinLength * 0.95, cabinHeight * 0.85, bodyWidth * 0.95), MAT.portalGlass);
  glass.position.copy(cabin.position);
  vGroup.add(glass);

  // If cargo truck, add large cargo box in the back
  if (type === 'truck') {
    const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, bodyWidth), MAT.machineLight);
    cargoBox.position.set(-0.9, 1.3, 0);
    vGroup.add(cargoBox);
  }

  // 4 Rotating Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 16);
  wheelGeo.rotateX(Math.PI / 2);
  vGroup.wheels = [];

  const wOffsets = [
    [-bodyLength * 0.35, bodyWidth * 0.52],
    [bodyLength * 0.35, bodyWidth * 0.52],
    [-bodyLength * 0.35, -bodyWidth * 0.52],
    [bodyLength * 0.35, -bodyWidth * 0.52],
  ];

  wOffsets.forEach(([wx, wz]) => {
    const w = new THREE.Mesh(wheelGeo, MAT.machineDark);
    w.position.set(wx, 0.28, wz);
    vGroup.add(w);
    vGroup.wheels.push(w);
  });

  // Headlights & Taillights
  if (hasLights) {
    // Front headlights (pointing +X forward)
    [-0.55, 0.55].forEach(hz => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.28), MAT.carHeadlight);
      hl.position.set(bodyLength / 2 + 0.02, 0.45, hz);
      vGroup.add(hl);
    });

    // Rear taillights (pointing -X backward)
    [-0.55, 0.55].forEach(tz => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.28), MAT.carTaillight);
      tl.position.set(-bodyLength / 2 - 0.02, 0.45, tz);
      vGroup.add(tl);
    });
  }

  return vGroup;
}

/**
 * Creates modern urban streetlamp
 */
function createModernStreetlamp() {
  const lamp = new THREE.Group();

  // Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.5, 12), MAT.streetlampPole);
  pole.position.y = 2.25;
  lamp.add(pole);

  // Angled arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), MAT.streetlampPole);
  arm.position.set(0.5, 4.5, 0);
  arm.rotation.z = -0.15;
  lamp.add(arm);

  // Light fixture head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.24), MAT.streetlampGlow);
  head.position.set(1.0, 4.4, 0);
  lamp.add(head);

  return lamp;
}

/**
 * Creates procedural street tree with trunk and organic canopy
 */
function createStreetTree() {
  const tree = new THREE.Group();

  // Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.4, 8), MAT.treeTrunk);
  trunk.position.y = 1.2;
  tree.add(trunk);

  // Foliage Canopy (geometric octahedron / sphere layers)
  const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), MAT.treeFoliage);
  canopy1.position.y = 2.8;
  tree.add(canopy1);

  const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), MAT.treeFoliage);
  canopy2.position.set(0.2, 3.8, -0.1);
  tree.add(canopy2);

  return tree;
}

/**
 * Creates modern corporate skyline tower
 */
function createSkylineBuilding(w, d, h) {
  const building = new THREE.Group();

  // Main tower body
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), MAT.skylineTower);
  body.position.y = h / 2;
  building.add(body);

  // Roof crown / architectural plant room
  const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 3.5, d * 0.7), MAT.buildingTrim);
  crown.position.y = h + 1.75;
  building.add(crown);

  // Glowing window grids on front and side facades
  const numFloors = Math.floor(h / 3.5);
  for (let f = 1; f < numFloors; f++) {
    const wy = f * 3.5;
    // Window strip
    const winStrip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 1.2, d + 0.15), MAT.skylineGlass);
    winStrip.position.y = wy;
    building.add(winStrip);
  }

  return building;
}

/**
 * Updates traffic vehicle positions along closed-loop road waypoints
 */
export function updateTrafficVehicles(trafficFleet, delta = 0.016) {
  if (!trafficFleet || !Array.isArray(trafficFleet)) return;

  // Waypoints define a rectangular loop:
  // Leg 0: (46, 36) -> (46, -36)   [Moving North along East road, dir: -Z]
  // Leg 1: (46, -36) -> (-46, -36) [Moving West along North road, dir: -X]
  // Leg 2: (-46, -36) -> (-46, 36) [Moving South along West road, dir: +Z]
  // Leg 3: (-46, 36) -> (46, 36)   [Moving East along South road, dir: +X]
  const perimeter = (72 * 2) + (92 * 2); // 328m total loop length

  trafficFleet.forEach(v => {
    v.progress = (v.progress + (v.speed * 1.5 * delta) / (perimeter * 0.1)) % 1.0;

    const totalDist = v.progress * perimeter;
    let x = 0, z = 0, angle = 0;

    if (totalDist < 72) {
      // East road moving North (-Z)
      const t = totalDist / 72;
      x = 48.0;
      z = 36.0 - t * 72.0;
      angle = -Math.PI / 2;
    } else if (totalDist < 72 + 92) {
      // North road moving West (-X)
      const t = (totalDist - 72) / 92;
      x = 46.0 - t * 92.0;
      z = -36.0;
      angle = Math.PI;
    } else if (totalDist < 72 + 92 + 72) {
      // West road moving South (+Z)
      const t = (totalDist - (72 + 92)) / 72;
      x = -48.0;
      z = -36.0 + t * 72.0;
      angle = Math.PI / 2;
    } else {
      // South road moving East (+X)
      const t = (totalDist - (72 + 92 + 72)) / 92;
      x = -46.0 + t * 92.0;
      z = 36.0;
      angle = 0;
    }

    v.mesh.position.set(x, -0.22, z);
    v.mesh.rotation.y = angle;

    // Rotate vehicle wheels
    if (v.mesh.wheels) {
      v.mesh.wheels.forEach(w => {
        w.rotation.x += v.speed * 1.5;
      });
    }
  });
}
