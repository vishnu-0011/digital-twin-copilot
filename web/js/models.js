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
};

let factoryGridHelper = null;

/**
 * Dynamically toggles material colors between Executive Cleanroom (light) and Cyberpunk (dark)
 */
export function setFactoryTheme(isLight) {
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
  } else {
    MAT.floorEpoxy.color.setHex(0x090d15);
    MAT.floorEpoxy.roughness = 0.35;
    MAT.floorRim.color.setHex(0x05070c);
    MAT.foundationPad.color.setHex(0x121822);
    MAT.structuralSteel.color.setHex(0x334155);
    MAT.machineChassis.color.setHex(0x1e293b);
    MAT.conveyorBelt.color.setHex(0x080c14);
    MAT.trackCyan.color.setHex(0x00f3ff);
    MAT.laserCyan.color.setHex(0x00f3ff);
  }
}

/**
 * 1. FACTORY FLOOR & ENVIRONMENT (64m x 48m with 4 Bays, ASRS Racks, Crane, Dual AMRs)
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

  // Tactical Floor Grid
  factoryGridHelper = new THREE.GridHelper(60, 60, 0x0284c7, 0x94a3b8);
  factoryGridHelper.position.y = 0.01;
  group.add(factoryGridHelper);

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
