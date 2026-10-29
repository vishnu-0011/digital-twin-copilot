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

  // Machinery Chassis & Enclosures (Authentic industrial powder-coated finishes)
  machineChassis: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.38, metalness: 0.45 }),
  machineDark: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.42, metalness: 0.4 }),
  machineLight: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.35 }),
  machineAccentCyan: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.28, metalness: 0.65 }),
  pressBody: new THREE.MeshStandardMaterial({ color: 0x242e42, roughness: 0.42, metalness: 0.45 }),
  pressSafetyOrange: new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.32, metalness: 0.45 }),
  furnaceInsulation: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.55, metalness: 0.35 }),
  robotYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.32, metalness: 0.45 }),
  graniteBase: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.18, metalness: 0.25 }),
  steelChrome: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.28, metalness: 0.65 }),
  aluminumExtrusion: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.32, metalness: 0.65 }),

  // Aerospace Workpieces & Components
  workpieceAlloy: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.65 }),
  hotBillet: new THREE.MeshStandardMaterial({
    color: 0xff4500,
    emissive: 0xff2a00,
    emissiveIntensity: 0.95,
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
    color: 0xff3b30,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
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

  // High-Gloss Automotive Metallic Lacquer Finishes (Physical Clearcoat Materials)
  carRed: new THREE.MeshPhysicalMaterial({ color: 0xdc2626, metalness: 0.85, roughness: 0.16, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
  carBlue: new THREE.MeshPhysicalMaterial({ color: 0x1d4ed8, metalness: 0.88, roughness: 0.14, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
  carWhite: new THREE.MeshPhysicalMaterial({ color: 0xf8fafc, metalness: 0.35, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.03 }),
  carSilver: new THREE.MeshPhysicalMaterial({ color: 0xcbd5e1, metalness: 0.92, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
  carBlack: new THREE.MeshPhysicalMaterial({ color: 0x090d16, metalness: 0.75, roughness: 0.18, clearcoat: 1.0, clearcoatRoughness: 0.05 }),
  carYellow: new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, metalness: 0.78, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
  carEmerald: new THREE.MeshPhysicalMaterial({ color: 0x047857, metalness: 0.85, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
  carNavy: new THREE.MeshPhysicalMaterial({ color: 0x1e3a8a, metalness: 0.88, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
  carOrange: new THREE.MeshPhysicalMaterial({ color: 0xea580c, metalness: 0.85, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.04 }),
  carWindow: new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    roughness: 0.04,
    metalness: 0.85,
    transmission: 0.4,
    transparent: true,
    opacity: 0.75,
    clearcoat: 1.0
  }),
  carHeadlight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  carTaillight: new THREE.MeshBasicMaterial({ color: 0xef4444 }),

  // High-Fidelity Industrial Equipment & Shop-Floor Detailing
  toolChestBlue: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35, metalness: 0.55 }),
  toolChestDark: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 }),
  toolChestHandle: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.1, metalness: 0.95 }),
  rubberMat: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9, metalness: 0.05 }),
  extinguisherRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.5 }),
  extinguisherBrass: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.85 }),
  andonRed: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.1, emissive: 0x7f1d1d, emissiveIntensity: 0.4 }),
  andonAmber: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.1, emissive: 0x78350f, emissiveIntensity: 0.4 }),
  andonGreen: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.1, emissive: 0x064e3b, emissiveIntensity: 0.7 }),
  eStopYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.2 }),
  eStopRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2, metalness: 0.3 }),
  cableCarrier: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7, metalness: 0.2 }),
  coolantBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.3 }),
  coolantOrange: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35, metalness: 0.3 }),
  walkwayGreen: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.45, metalness: 0.1 }),
  craneYellow: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35, metalness: 0.6 }),
  dockBumper: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9, metalness: 0.1 }),
  safetyBollard: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.5 }),
  bulkTankWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.4 }),
  evPedestal: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.7 }),
  evGlow: new THREE.MeshBasicMaterial({ color: 0x10b981 }),

  // High-Fidelity Mechanical & Hardware Materials
  bellowsBlack: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85, metalness: 0.1 }),
  bellowsArmor: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 }),
  hydraulicHose: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.3 }),
  brassFitting: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.85 }),
  wireMesh: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.7, wireframe: true }),
  heatSinkBlue: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.8 }),
  workLightLed: new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
  tireRubber: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.05 }),
  wheelRim: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 }),
};

let gridHelperLight = null;
let gridHelperDark = null;
export let factoryFloorSurfacePlane = null;

/**
 * Dynamically toggles material colors between Executive Cleanroom (light) and Cyberpunk (dark)
 */
export function setFactoryTheme(isLight) {
  // Procedural high-resolution epoxy floor texture handles crisp 2m expansion seams directly
  if (gridHelperLight && gridHelperDark) {
    gridHelperLight.visible = false;
    gridHelperDark.visible = false;
  }

  if (factoryFloorSurfacePlane) {
    factoryFloorSurfacePlane.material.map = getFactoryFloorTexture(isLight);
    factoryFloorSurfacePlane.material.roughness = isLight ? 0.22 : 0.35;
    factoryFloorSurfacePlane.material.needsUpdate = true;
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
    MAT.walkwayGreen.color.setHex(0x15803d);
    MAT.craneYellow.color.setHex(0xeab308);

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
    MAT.walkwayGreen.color.setHex(0x064e3b);
    MAT.craneYellow.color.setHex(0xb45309);

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

// =========================================================================
// HIGH-FIDELITY PROCEDURAL TEXTURE GENERATORS (Canvas PBR Maps)
// =========================================================================

let _floorTexLight = null;
let _floorTexDark = null;

/**
 * Generates an ultra-crisp 2048x1536 cleanroom epoxy floor texture mapping 64m x 48m:
 * - 2m x 2m expansion seams with beveled highlights
 * - 4 Zoned bays with black/yellow hazard perimeter hatching, equipment footprint boxes & stencils
 * - Central high-visibility safety green pedestrian arterial highway with ISO walking man pictograms,
 *   zebra crosswalks, speed limit circles (5 km/h), and forklift hazard diamonds
 * - Dual AMR magnetic navigation tracks with directional chevrons & transit warning text
 * - Cleanroom entrance corporate portal placard
 */
export function getFactoryFloorTexture(isLight = true) {
  if (isLight && _floorTexLight) return _floorTexLight;
  if (!isLight && _floorTexDark) return _floorTexDark;

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1536;
  const ctx = canvas.getContext('2d');

  // Math mapping: World (wx: -32..32, wz: -24..24) -> Canvas (cx: 0..2048, cy: 0..1536)
  const toCx = (wx) => ((wx + 32) / 64) * 2048;
  const toCy = (wz) => ((wz + 24) / 48) * 1536;
  const toCw = (w) => (w / 64) * 2048;
  const toCh = (d) => (d / 48) * 1536;

  // 1. Base High-Gloss Cleanroom Epoxy Ground
  ctx.fillStyle = isLight ? '#f1f5f9' : '#0a0f19';
  ctx.fillRect(0, 0, 2048, 1536);

  // 2. 2m x 2m Expansion Joints & Tile Bevels
  ctx.strokeStyle = isLight ? '#cbd5e1' : '#1e293b';
  ctx.lineWidth = 1.5;
  for (let wx = -32; wx <= 32; wx += 2) {
    const cx = toCx(wx);
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, 1536);
    ctx.stroke();
  }
  for (let wz = -24; wz <= 24; wz += 2) {
    const cy = toCy(wz);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(2048, cy);
    ctx.stroke();
  }

  // Soft specular bevel highlight on expansion joints
  ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1.0;
  for (let wx = -32; wx <= 32; wx += 2) {
    const cx = toCx(wx) + 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, 1536);
    ctx.stroke();
  }
  for (let wz = -24; wz <= 24; wz += 2) {
    const cy = toCy(wz) + 1.0;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(2048, cy);
    ctx.stroke();
  }

  // 3. Four Manufacturing Bay Foundation Zones
  const bays = [
    {
      id: "BAY 01",
      name: "5-AXIS PRECISION CNC MACHINING & TURNING",
      spec: "MIL-STD-1530D • TOLERANCE ±0.002mm • AIRFOIL PROFILES",
      x: -24, z: -17, w: 22, d: 13,
      fill: isLight ? '#e2e8f0' : '#0f172a',
      accent: isLight ? '#0284c7' : '#00f3ff',
      machines: [
        { id: "CNC-01", name: "5-AXIS ROUGHING MILL", x: -16, z: -10, w: 7.2, d: 6.4 },
        { id: "CNC-02", name: "AIRFOIL FINISHING CTR", x: -6, z: -10, w: 6.8, d: 6.0 },
      ]
    },
    {
      id: "BAY 02",
      name: "HEAVY HYDRAULIC BULKHEAD FORMING & THERMAL",
      spec: "AMS-4928 TITANIUM FORGING • HOT-WORK SAFETY ENCLOSURE",
      x: 2, z: -17, w: 24, d: 13,
      fill: isLight ? '#e5e7eb' : '#111827',
      accent: isLight ? '#ea580c' : '#f97316',
      machines: [
        { id: "PRESS-01", name: "1000T BULKHEAD FORGE", x: 7, z: -11, w: 7.4, d: 6.6 },
        { id: "PRESS-02", name: "500T EXTRUSION PRESS", x: 19, z: -11, w: 10.0, d: 4.6 },
        { id: "FURN-01", name: "VACUUM CARBURIZING", x: 13, z: -2, w: 8.0, d: 5.0 },
      ]
    },
    {
      id: "BAY 03",
      name: "6-AXIS ARTICULATED ROBOTICS & LASER QC",
      spec: "ISO CLASS 7 CLEANROOM • OPTICAL METROLOGY CMM",
      x: -24, z: 3, w: 22, d: 13,
      fill: isLight ? '#e0f2fe' : '#091e36',
      accent: isLight ? '#0284c7' : '#00f3ff',
      machines: [
        { id: "ROBOT-01", name: "6-DOF DEBURRING CELL", x: -16, z: 8, w: 6.6, d: 6.6 },
        { id: "LASER-01", name: "TRIANGULATION QC ARCH", x: -6, z: 8, w: 6.6, d: 5.4 },
      ]
    },
    {
      id: "BAY 04",
      name: "CONTINUOUS AVIONICS SMT LINE & PACKOUT",
      spec: "ESD SAFE ZONE • MIL-STD-1686C FLIGHT CERTIFIED",
      x: 2, z: 3, w: 24, d: 13,
      fill: isLight ? '#ecfdf5' : '#042217',
      accent: isLight ? '#059669' : '#10b981',
      machines: [
        { id: "CONV-01", name: "AVIONICS ASSEMBLY LINE", x: 13, z: 8, w: 22.8, d: 3.6 },
      ]
    }
  ];

  bays.forEach(bay => {
    const bx = toCx(bay.x);
    const by = toCy(bay.z);
    const bw = toCw(bay.w);
    const bh = toCh(bay.d);

    // Bay foundation fill
    ctx.fillStyle = bay.fill;
    ctx.fillRect(bx, by, bw, bh);

    // 45-degree hazard perimeter stripe along top and bottom edges
    const hatchW = 12;
    ctx.fillStyle = isLight ? '#facc15' : '#eab308';
    ctx.fillRect(bx, by, bw, hatchW);
    ctx.fillRect(bx, by + bh - hatchW, bw, hatchW);

    ctx.fillStyle = isLight ? '#0f172a' : '#000000';
    for (let hx = bx; hx < bx + bw; hx += 24) {
      // Top hazard border
      ctx.beginPath();
      ctx.moveTo(hx, by);
      ctx.lineTo(hx + 12, by);
      ctx.lineTo(hx + 24, by + hatchW);
      ctx.lineTo(hx + 12, by + hatchW);
      ctx.closePath();
      ctx.fill();

      // Bottom hazard border
      ctx.beginPath();
      ctx.moveTo(hx, by + bh - hatchW);
      ctx.lineTo(hx + 12, by + bh - hatchW);
      ctx.lineTo(hx + 24, by + bh);
      ctx.lineTo(hx + 12, by + bh);
      ctx.closePath();
      ctx.fill();
    }

    // Border outline
    ctx.strokeStyle = bay.accent;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(bx, by, bw, bh);

    // Bay Header Stencil Typography
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
    ctx.fillText(`${bay.id} • ${bay.name}`, bx + 18, by + 34);
    ctx.font = '13px monospace';
    ctx.fillStyle = isLight ? '#475569' : '#94a3b8';
    ctx.fillText(bay.spec, bx + 18, by + 52);

    // Machine Footprint Boxes with corner brackets & tags
    bay.machines.forEach(m => {
      const mx = toCx(m.x - m.w / 2);
      const my = toCy(m.z - m.d / 2);
      const mw = toCw(m.w);
      const mh = toCh(m.d);

      ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.4)' : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(mx, my, mw, mh);
      ctx.setLineDash([]);

      // Corner L-brackets
      const cl = 14;
      ctx.strokeStyle = bay.accent;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(mx, my + cl); ctx.lineTo(mx, my); ctx.lineTo(mx + cl, my); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx + mw - cl, my); ctx.lineTo(mx + mw, my); ctx.lineTo(mx + mw, my + cl); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx, my + mh - cl); ctx.lineTo(mx, my + mh); ctx.lineTo(mx + cl, my + mh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx + mw - cl, my + mh); ctx.lineTo(mx + mw, my + mh); ctx.lineTo(mx + mw, my + mh - cl); ctx.stroke();

      // Machine tag label
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = bay.accent;
      ctx.fillText(`[${m.id}] ${m.name}`, mx + 8, my + mh - 8);
    });
  });

  // 4. Central High-Traffic Safety Pedestrian Highway (X: -1.6 to +1.6, Z: -22 to +22)
  const pwX = toCx(-1.6);
  const pwW = toCw(3.2);
  const pwY = toCy(-22);
  const pwH = toCh(44);

  ctx.fillStyle = isLight ? '#15803d' : '#064e3b';
  ctx.fillRect(pwX, pwY, pwW, pwH);

  // Yellow Highway Guide Borders
  ctx.fillStyle = isLight ? '#facc15' : '#eab308';
  ctx.fillRect(pwX - 4, pwY, 4, pwH);
  ctx.fillRect(pwX + pwW, pwY, 4, pwH);

  // Cross-aisle pedestrian connector arms at Z = 0
  const cWalkY = toCy(-1.2);
  const cWalkH = toCh(2.4);
  const wArmX = toCx(-24);
  const wArmW = toCw(22.4);
  ctx.fillStyle = isLight ? '#15803d' : '#064e3b';
  ctx.fillRect(wArmX, cWalkY, wArmW, cWalkH);
  ctx.fillStyle = isLight ? '#facc15' : '#eab308';
  ctx.fillRect(wArmX, cWalkY - 3, wArmW, 3);
  ctx.fillRect(wArmX, cWalkY + cWalkH, wArmW, 3);

  const eArmX = toCx(1.6);
  const eArmW = toCw(24.4);
  ctx.fillStyle = isLight ? '#15803d' : '#064e3b';
  ctx.fillRect(eArmX, cWalkY, eArmW, cWalkH);
  ctx.fillStyle = isLight ? '#facc15' : '#eab308';
  ctx.fillRect(eArmX, cWalkY - 3, eArmW, 3);
  ctx.fillRect(eArmX, cWalkY + cWalkH, eArmW, 3);

  // Zebra Crossing Bars at Central Hub
  ctx.fillStyle = '#ffffff';
  for (let zx = pwX + 8; zx < pwX + pwW - 12; zx += 20) {
    ctx.fillRect(zx, cWalkY + 4, 12, cWalkH - 8);
  }

  // ISO 7010-M024 Walking Person Silhouette
  function drawWalkingPerson(px, py, scale = 1.0, color = '#ffffff') {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    // Head
    ctx.beginPath();
    ctx.arc(0, -22, 6, 0, Math.PI * 2);
    ctx.fill();
    // Torso
    ctx.beginPath();
    ctx.moveTo(-5, -14);
    ctx.lineTo(5, -14);
    ctx.lineTo(3, 2);
    ctx.lineTo(-3, 2);
    ctx.closePath();
    ctx.fill();
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.lineTo(-10, 20);
    ctx.lineTo(-6, 22);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(1, 2);
    ctx.lineTo(9, 18);
    ctx.lineTo(13, 17);
    ctx.lineTo(4, 3);
    ctx.closePath();
    ctx.fill();
    // Arms
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(-4, -10);
    ctx.lineTo(-12, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, -10);
    ctx.lineTo(10, -2);
    ctx.lineTo(14, 4);
    ctx.stroke();
    ctx.restore();
  }

  [-16, -8, 8, 16].forEach(wz => {
    drawWalkingPerson(toCx(0), toCy(wz), 0.8, isLight ? '#ffffff' : '#38bdf8');
  });

  // Forklift / AMR Caution Diamond
  function drawForkliftCaution(px, py) {
    ctx.save();
    ctx.translate(px, py);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(22, 0);
    ctx.lineTo(0, 22);
    ctx.lineTo(-22, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2.5, -12, 5, 14);
    ctx.beginPath();
    ctx.arc(0, 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  drawForkliftCaution(toCx(0), toCy(-3.5));
  drawForkliftCaution(toCx(0), toCy(3.5));

  // Speed Limit Circle (MAX 5 KM/H)
  function drawSpeedLimit(px, py) {
    ctx.save();
    ctx.translate(px, py);
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('5', 0, -4);
    ctx.font = 'bold 8px monospace';
    ctx.fillText('KM/H', 0, 8);
    ctx.restore();
  }
  drawSpeedLimit(toCx(0), toCy(-12));
  drawSpeedLimit(toCx(0), toCy(12));

  // 5. Dual AMR Magnetic Guidance Tracks
  const trackColor = isLight ? '#0284c7' : '#00f3ff';
  ctx.save();
  ctx.strokeStyle = trackColor;
  ctx.lineWidth = 3.5;
  ctx.setLineDash([14, 8]);

  const oLeft = toCx(-22);
  const oRight = toCx(22);
  const oTop = toCy(-16);
  const oBottom = toCy(16);
  ctx.strokeRect(oLeft, oTop, oRight - oLeft, oBottom - oTop);

  const iLeft = toCx(-10);
  const iRight = toCx(0);
  const iTop = toCy(-12);
  const iBottom = toCy(12);
  ctx.strokeRect(iLeft, iTop, iRight - iLeft, iBottom - iTop);
  ctx.setLineDash([]);

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = trackColor;
  ctx.textAlign = 'center';
  ctx.fillText('◄◄ AMR NAVIGATION TRACK 01 — AUTOMATIC AGV RIGHT-OF-WAY — KEEP CLEAR ◄◄', toCx(0), oTop - 8);
  ctx.fillText('►► AMR NAVIGATION TRACK 01 — RECIRCULATION RETURN LOOP ►►', toCx(0), oBottom + 16);
  ctx.restore();

  // 6. South Main Cleanroom Entrance Portal Placard
  const entX = toCx(0);
  const entY = toCy(22.2);
  ctx.save();
  ctx.fillStyle = isLight ? '#0f172a' : '#1e293b';
  ctx.fillRect(entX - 280, entY - 24, 560, 48);
  ctx.strokeStyle = isLight ? '#0284c7' : '#00f3ff';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(entX - 280, entY - 24, 560, 48);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TITAN AEROSPACE ADVANCED PROPULSION & AVIONICS — ZERO DEFECTS', entX, entY);
  ctx.font = '11px monospace';
  ctx.fillStyle = isLight ? '#38bdf8' : '#00f3ff';
  ctx.fillText('AUTONOMOUS DIGITAL TWIN OPERATIONS CENTER • AS9100D REV D CERTIFIED', entX, entY + 16);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;

  if (isLight) _floorTexLight = tex;
  else _floorTexDark = tex;

  return tex;
}

let _diamondPlateTex = null;
export function getDiamondPlateTexture() {
  if (_diamondPlateTex) return _diamondPlateTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 32) {
    for (let x = 0; x < 256; x += 32) {
      // First diamond
      ctx.save();
      ctx.translate(x + 16, y + 16);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(1, 1, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(-1, -1, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Second diamond perpendicular
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(1, 1, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(-1, -1, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _diamondPlateTex = new THREE.CanvasTexture(canvas);
  _diamondPlateTex.wrapS = THREE.RepeatWrapping;
  _diamondPlateTex.wrapT = THREE.RepeatWrapping;
  _diamondPlateTex.repeat.set(4, 4);
  return _diamondPlateTex;
}

let _circuitTex = null;
export function getCircuitBoardTexture() {
  if (_circuitTex) return _circuitTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep matte green soldermask
  ctx.fillStyle = '#0a3818';
  ctx.fillRect(0, 0, 512, 512);

  // Gold ENIG Traces
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2.5;

  for (let y = 40; y < 480; y += 40) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(160, y);
    ctx.lineTo(200, y + 20);
    ctx.lineTo(340, y + 20);
    ctx.lineTo(380, y);
    ctx.lineTo(480, y);
    ctx.stroke();
  }

  for (let x = 60; x < 460; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 30);
    ctx.lineTo(x, 150);
    ctx.lineTo(x + 15, 165);
    ctx.lineTo(x + 15, 360);
    ctx.stroke();
  }

  // Silver Solder Pads & Vias
  ctx.fillStyle = '#cbd5e1';
  for (let vy = 30; vy < 500; vy += 25) {
    for (let vx = 30; vx < 500; vx += 35) {
      ctx.beginPath();
      ctx.arc(vx, vy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Gold Edge Connector Fingers along bottom
  ctx.fillStyle = '#f59e0b';
  for (let fx = 40; fx < 470; fx += 14) {
    ctx.fillRect(fx, 470, 8, 38);
  }

  // IC Footprint 1: 64-Pin Quad Flat Package (QFP) Processor
  ctx.fillStyle = '#111827';
  ctx.fillRect(180, 180, 150, 150);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(180, 180, 150, 150);

  // Pin pads around QFP
  ctx.fillStyle = '#d4af37';
  for (let p = 190; p <= 320; p += 10) {
    ctx.fillRect(p, 168, 5, 10);
    ctx.fillRect(p, 332, 5, 10);
    ctx.fillRect(168, p, 10, 5);
    ctx.fillRect(332, p, 10, 5);
  }

  // Laser Etched Processor Logo
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TITAN-X1', 255, 240);
  ctx.font = '10px monospace';
  ctx.fillText('AVIONICS SOC', 255, 258);
  ctx.fillText('MIL-STD-810H', 255, 274);

  // SMD Resistor / Capacitor Arrays
  ctx.fillStyle = '#0f172a';
  for (let sy = 70; sy <= 130; sy += 18) {
    for (let sx = 80; sx <= 160; sx += 22) {
      ctx.fillRect(sx, sy, 12, 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(sx, sy, 2, 6);
      ctx.fillRect(sx + 10, sy, 2, 6);
      ctx.fillStyle = '#0f172a';
    }
  }

  // White Silkscreen Markings & Barcode
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TITAN AVIONICS FC-900 REV.D', 40, 50);
  ctx.font = '9px monospace';
  ctx.fillText('S/N: 2026-X8842-FLIGHT', 40, 64);
  ctx.fillText('ESD SENSITIVE — CLASS 3B', 40, 78);

  // Data Matrix QR code mockup
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(410, 40, 50, 50);
  ctx.fillStyle = '#0a3818';
  for (let qy = 44; qy < 86; qy += 7) {
    for (let qx = 414; qx < 456; qx += 7) {
      if ((qx + qy) % 14 === 0 || (qx * qy) % 21 === 0) {
        ctx.fillRect(qx, qy, 5, 5);
      }
    }
  }

  _circuitTex = new THREE.CanvasTexture(canvas);
  return _circuitTex;
}

let _bolsterTex = null;
export function getBolsterPlateTexture() {
  if (_bolsterTex) return _bolsterTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 512, 512);

  // Machined surface grinding circular swirls
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let r = 20; r < 350; r += 12) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // T-Slot Clamping Channels
  const slotW = 16;
  const slotSpacing = 64;
  for (let x = slotSpacing; x < 512; x += slotSpacing) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - slotW / 2, 0, slotW, 512);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - slotW / 2, 0); ctx.lineTo(x - slotW / 2, 512);
    ctx.moveTo(x + slotW / 2, 0); ctx.lineTo(x + slotW / 2, 512);
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - slotW / 4, 0, slotW / 2, 512);
  }

  // Bolster Mounting Stud Holes
  for (let y = slotSpacing; y < 512; y += slotSpacing) {
    for (let x = slotSpacing / 2; x < 512; x += slotSpacing) {
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  _bolsterTex = new THREE.CanvasTexture(canvas);
  return _bolsterTex;
}

let _hotForgingTex = null;
export function getHotForgingTexture() {
  if (_hotForgingTex) return _hotForgingTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Radial thermal gradient for forged billet: 1150°C glowing titanium
  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
  grad.addColorStop(0, '#ffffff');    // White-hot core
  grad.addColorStop(0.25, '#fef08a'); // Radiant yellow
  grad.addColorStop(0.55, '#f97316'); // Bright incandescent orange 1050°C
  grad.addColorStop(0.8, '#dc2626');  // Deep cherry red 900°C
  grad.addColorStop(0.95, '#7f1d1d'); // Cooling flank
  grad.addColorStop(1.0, '#360909');  // Dark oxidized crust

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = 'rgba(30, 10, 10, 0.25)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    const dist = Math.hypot(rx - 256, ry - 256);
    if (dist > 90) {
      ctx.beginPath();
      ctx.arc(rx, ry, Math.random() * 8 + 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _hotForgingTex = new THREE.CanvasTexture(canvas);
  return _hotForgingTex;
}

const _decalCache = new Map();
export function getEquipmentDecalTexture(type = 'danger', line1 = 'HIGH VOLTAGE', line2 = '480 VAC 3-PHASE') {
  const key = `${type}_${line1}_${line2}`;
  if (_decalCache.has(key)) return _decalCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (type === 'danger') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(4, 4, 248, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DANGER', 128, 29);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(35, 110); ctx.lineTo(55, 60); ctx.lineTo(75, 110);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('!', 55, 105);
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(line1, 85, 78);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#334155';
    ctx.fillText(line2, 85, 102);
  } else if (type === 'caution') {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, 4, 248, 36);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAUTION', 128, 29);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(line1, 128, 75);
    ctx.font = '12px monospace';
    ctx.fillText(line2, 128, 100);
  } else {
    // Manufacturer badge (silver brushed / corporate dark)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 120);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(line1, 128, 55);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText(line2, 128, 85);
  }

  const tex = new THREE.CanvasTexture(canvas);
  _decalCache.set(key, tex);
  return tex;
}

const _placardCache = new Map();
export function getBarcodePlacardTexture(code = 'RACK A-01-01', desc = 'AERO SPARS') {
  const key = `${code}_${desc}`;
  if (_placardCache.has(key)) return _placardCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 120);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(code, 128, 36);

  // Barcode simulation lines
  ctx.fillStyle = '#000000';
  let bx = 30;
  while (bx < 226) {
    const barW = (bx % 7 === 0 || bx % 11 === 0) ? 4 : 2;
    ctx.fillRect(bx, 48, barW, 46);
    bx += barW + ((bx % 5 === 0) ? 4 : 2);
  }

  ctx.fillStyle = '#475569';
  ctx.font = '11px monospace';
  ctx.fillText(desc, 128, 112);

  const tex = new THREE.CanvasTexture(canvas);
  _placardCache.set(key, tex);
  return tex;
}

/**
 * Creates pleated accordion way cover (bellows) for machine slide axes
 */
export function createAccordionBellows(width = 1.0, height = 0.6, depth = 0.8, folds = 6, isVertical = false) {
  const group = new THREE.Group();
  const foldStep = depth / folds;
  for (let i = 0; i < folds; i++) {
    const z = -depth / 2 + i * foldStep + foldStep / 2;
    const pleatGeo = new THREE.BoxGeometry(width, height, foldStep * 0.7);
    const pleat = new THREE.Mesh(pleatGeo, MAT.bellowsBlack);
    pleat.position.set(0, 0, z);
    group.add(pleat);

    const armorGeo = new THREE.BoxGeometry(width + 0.04, height + 0.04, 0.02);
    const armor = new THREE.Mesh(armorGeo, MAT.bellowsArmor);
    armor.position.set(0, 0, z + foldStep * 0.35);
    group.add(armor);
  }
  if (isVertical) {
    group.rotation.x = Math.PI / 2;
  }
  return group;
}

/**
 * Creates sculpted 5-axis aerospace titanium blisk (bladed disk) workpiece
 */
export function createBliskWorkpiece() {
  const bliskGroup = new THREE.Group();

  // Central Turned Titanium Hub
  const hubGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.35, 24);
  const hub = new THREE.Mesh(hubGeo, MAT.workpieceAlloy);
  bliskGroup.add(hub);

  // Clamping Arbor Stud with Hex Nut
  const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.55, 12), MAT.steelChrome);
  stud.position.y = 0.15;
  bliskGroup.add(stud);

  const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 6), MAT.hazardDark);
  nut.position.y = 0.35;
  bliskGroup.add(nut);

  // 8 Aerodynamic Curved Titanium Blades with Individual 3D Twist Angles
  const bladeCount = 8;
  for (let b = 0; b < bladeCount; b++) {
    const angle = (b / bladeCount) * Math.PI * 2;
    const bladeArm = new THREE.Group();
    bladeArm.rotation.y = angle;

    const bladeGeo = new THREE.BoxGeometry(0.08, 0.65, 0.36);
    const bladeMesh = new THREE.Mesh(bladeGeo, MAT.workpieceAlloy);
    bladeMesh.position.set(0.68, 0.1, 0);
    bladeMesh.rotation.z = -0.35;
    bladeMesh.rotation.x = 0.45;
    bladeArm.add(bladeMesh);

    bliskGroup.add(bladeArm);
  }
  bliskGroup.castShadow = true;
  return bliskGroup;
}

/**
 * Creates sculpted turbine airfoil blade with fir-tree dovetail root and aerodynamic cambered twist
 */
export function createAirfoilBlade() {
  const bladeGroup = new THREE.Group();

  // 1. Dovetail / Fir-Tree Root Mount (stepped clamping base)
  const rootBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.44), MAT.structuralSteel);
  bladeGroup.add(rootBase);

  // Stepped root serrations
  [-0.1, 0.0, 0.1].forEach((sy, i) => {
    const serration = new THREE.Mesh(new THREE.BoxGeometry(0.38 - i * 0.04, 0.06, 0.44), MAT.hazardDark);
    serration.position.y = sy;
    bladeGroup.add(serration);
  });

  // 2. Transition Platform / Collar
  const platform = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.58), MAT.steelChrome);
  platform.position.y = 0.18;
  bladeGroup.add(platform);

  // 3. Aerodynamic Twisted Airfoil Blade Sections (3 stacked lofted sections with progressive twist)
  const foilSections = [
    { y: 0.45, w: 0.14, h: 0.45, d: 0.48, rotY: 0.0, rotX: 0.1 },
    { y: 0.85, w: 0.10, h: 0.45, d: 0.42, rotY: 0.25, rotX: 0.15 },
    { y: 1.25, w: 0.06, h: 0.45, d: 0.36, rotY: 0.45, rotX: 0.2 },
  ];

  foilSections.forEach(s => {
    const foil = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), MAT.workpieceAlloy);
    foil.position.y = s.y;
    foil.rotation.y = s.rotY;
    foil.rotation.x = s.rotX;
    bladeGroup.add(foil);

    // Bullnose leading edge
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(s.w * 0.5, s.w * 0.5, s.h, 12), MAT.steelChrome);
    edge.position.set(0, s.y, s.d * 0.48);
    edge.rotation.y = s.rotY;
    bladeGroup.add(edge);
  });

  // 4. Shrouded Blade Tip Cap
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.38), MAT.workpieceAlloy);
  tip.position.y = 1.5;
  bladeGroup.add(tip);

  bladeGroup.castShadow = true;
  return bladeGroup;
}

/**
 * Creates sculpted aerospace structural bulkhead forging workpiece.
 * MUST return a THREE.Mesh with MAT.hotBillet so scene.js can animate press1.hotBillet.material.emissiveIntensity.
 */
export function createBulkheadForging() {
  // Main Bulkhead Flange Base Plate (Mesh with MAT.hotBillet)
  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 1.8), MAT.hotBillet);
  baseMesh.castShadow = true;

  // Center Machined Boss Ring
  const centerBoss = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.35, 24), MAT.hotBillet);
  centerBoss.position.y = 0.15;
  baseMesh.add(centerBoss);

  // Longitudinal Center Rib
  const longRib = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.28, 0.16), MAT.hotBillet);
  longRib.position.y = 0.15;
  baseMesh.add(longRib);

  // Transverse Cross Rib
  const crossRib = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 1.7), MAT.hotBillet);
  crossRib.position.y = 0.15;
  baseMesh.add(crossRib);

  // 4 Stiffener Pocket Framing Edges
  [-1.1, 1.1].forEach(px => {
    const edgeRibX = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.25, 1.7), MAT.hotBillet);
    edgeRibX.position.set(px, 0.14, 0);
    baseMesh.add(edgeRibX);
  });
  [-0.8, 0.8].forEach(pz => {
    const edgeRibZ = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 0.14), MAT.hotBillet);
    edgeRibZ.position.set(0, 0.14, pz);
    baseMesh.add(edgeRibZ);
  });

  return baseMesh;
}

let _metrologyHUDTex = null;
export function getMetrologyHUDTexture() {
  if (_metrologyHUDTex) return _metrologyHUDTex;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  // Dark slate HUD background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 512, 384);

  // Top header bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 42);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 512, 42);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('ZEISS METROTOM 1500 // 3D LASER PROFILER', 16, 26);

  // Status Badge: CPK 1.67 PASS
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(360, 8, 136, 26);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(360, 8, 136, 26);
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('CPK 1.67 PASS', 374, 25);

  // 3D Point-Cloud Deviation Heatmap Simulation Box
  ctx.fillStyle = '#030712';
  ctx.fillRect(16, 56, 280, 220);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(16, 56, 280, 220);

  // Grid lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;
  for (let x = 16; x < 296; x += 28) {
    ctx.beginPath(); ctx.moveTo(x, 56); ctx.lineTo(x, 276); ctx.stroke();
  }
  for (let y = 56; y < 276; y += 22) {
    ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(296, y); ctx.stroke();
  }

  // Draw 3D Airfoil contour deviation heatmap
  const grad = ctx.createLinearGradient(40, 70, 260, 250);
  grad.addColorStop(0, '#0284c7');    // -0.015 mm
  grad.addColorStop(0.3, '#10b981');  // 0.000 mm nominal
  grad.addColorStop(0.6, '#34d399');  // +0.002 mm nominal
  grad.addColorStop(0.85, '#eab308'); // +0.008 mm
  grad.addColorStop(1.0, '#ef4444');  // +0.018 mm out of tol

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(156, 166, 100, 48, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Colorbar legend on side of heatmap
  const legGrad = ctx.createLinearGradient(0, 66, 0, 266);
  legGrad.addColorStop(0, '#ef4444');
  legGrad.addColorStop(0.25, '#eab308');
  legGrad.addColorStop(0.5, '#10b981');
  legGrad.addColorStop(0.75, '#06b6d4');
  legGrad.addColorStop(1.0, '#0284c7');
  ctx.fillStyle = legGrad;
  ctx.fillRect(276, 66, 10, 200);

  // Measurement Metrics Dashboard on Right Side
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(310, 56, 186, 220);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(310, 56, 186, 220);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText('FEATURE INSPECTION', 324, 78);

  const metrics = [
    { label: 'Chord Length', val: '142.503 mm', pass: true },
    { label: 'Camber Angle', val: '28.42 deg', pass: true },
    { label: 'Max Deviation', val: '+0.003 mm', pass: true },
    { label: 'Root Stepping', val: '18.001 mm', pass: true },
    { label: 'Surface Ra', val: '0.42 um', pass: true },
    { label: 'Scan Pts', val: '2,480,192', pass: true }
  ];

  metrics.forEach((m, i) => {
    const my = 104 + i * 26;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText(m.label, 324, my);
    ctx.fillStyle = m.pass ? '#38bdf8' : '#f87171';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(m.val, 324, my + 13);
  });

  // Bottom Tolerance Gaussian Bell Curve / Histogram
  ctx.fillStyle = '#030712';
  ctx.fillRect(16, 290, 480, 80);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(16, 290, 480, 80);

  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  ctx.fillText('PROCESS DISTRIBUTION (3-SIGMA TOLERANCE BAND +/- 0.010 mm)', 28, 308);

  // Bell curve
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const x = 40 + i * 4.3;
    const norm = (i - 50) / 16;
    const y = 360 - Math.exp(-0.5 * norm * norm) * 45;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Nominal center mark
  ctx.strokeStyle = '#10b981';
  ctx.beginPath(); ctx.moveTo(255, 312); ctx.lineTo(255, 362); ctx.stroke();
  ctx.fillStyle = '#10b981';
  ctx.font = '9px monospace';
  ctx.fillText('NOMINAL', 236, 322);

  const tex = new THREE.CanvasTexture(canvas);
  _metrologyHUDTex = tex;
  return tex;
}

const _amrScreenCache = new Map();
export function getAMRScreenTexture(amrId = 'AGV-01') {
  if (_amrScreenCache.has(amrId)) return _amrScreenCache.get(amrId);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 256, 160);

  // Header
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 256, 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`OTTO 1500 // ${amrId}`, 12, 19);

  // Battery bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(12, 40, 232, 22);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(14, 42, 218, 18);
  ctx.fillStyle = '#090d16';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('BATTERY: 94% [CHARGING OPTIMAL]', 24, 55);

  // Status metrics
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';
  ctx.fillText('NAV MODE: SLAM AUTO', 14, 86);
  ctx.fillText('SPEED:    0.85 m/s', 14, 106);
  ctx.fillText('MISSION:  AERO TRAY ROUTE 4', 14, 126);
  ctx.fillText('SAFETY:   360 LIDAR ACTIVE', 14, 146);

  const tex = new THREE.CanvasTexture(canvas);
  _amrScreenCache.set(amrId, tex);
  return tex;
}

// Texture singletons
let _hazardTex = null;
export function getHazardStripeTexture() {
  if (_hazardTex) return _hazardTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#0f172a';
  const sw = 32;
  for (let x = -256; x < 512; x += sw * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + sw, 0);
    ctx.lineTo(x + sw + 256, 256);
    ctx.lineTo(x + 256, 256);
    ctx.closePath();
    ctx.fill();
  }
  _hazardTex = new THREE.CanvasTexture(canvas);
  _hazardTex.wrapS = THREE.RepeatWrapping;
  _hazardTex.wrapT = THREE.RepeatWrapping;
  _hazardTex.repeat.set(6, 1);
  return _hazardTex;
}

let _gaugeTex = null;
export function getGaugeTexture() {
  if (_gaugeTex) return _gaugeTex;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Tick marks
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  for (let a = Math.PI * 0.75; a <= Math.PI * 2.25; a += (Math.PI * 1.5) / 10) {
    const x1 = 128 + Math.cos(a) * 90;
    const y1 = 128 + Math.sin(a) * 90;
    const x2 = 128 + Math.cos(a) * 112;
    const y2 = 128 + Math.sin(a) * 112;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BAR x10', 128, 175);
  // Pointer needle (pointing at ~240 bar)
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  const needleAngle = Math.PI * 1.65;
  ctx.lineTo(128 + Math.cos(needleAngle) * 92, 128 + Math.sin(needleAngle) * 92);
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(128, 128, 10, 0, Math.PI * 2);
  ctx.fill();

  _gaugeTex = new THREE.CanvasTexture(canvas);
  return _gaugeTex;
}

export function createDROTexture(machineId, programName = "O0142_TITAN_AERO", rpm = "14,200", feed = "3,200") {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 512, 38);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`FANUC 31i-B5 • ${machineId} • RUNNING`, 14, 26);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '16px monospace';
  ctx.fillText(`PRG: ${programName}.NC`, 14, 68);

  ctx.fillStyle = '#00f3ff';
  ctx.font = 'bold 26px monospace';
  ctx.fillText('X  -142.302 mm', 14, 108);
  ctx.fillText('Y  +088.415 mm', 14, 142);
  ctx.fillText('Z  -012.000 mm', 14, 176);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`S: ${rpm} RPM   F: ${feed} mm/min`, 14, 218);
  ctx.fillStyle = '#10b981';
  ctx.fillText('FEED: 100%   LOAD: 78%   COOLANT: OK', 14, 244);

  return new THREE.CanvasTexture(canvas);
}

export function createFurnacePIDTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 248, 248);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('EUROTHERM 3504', 16, 36);
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 50px monospace';
  ctx.fillText('980°C', 16, 105);
  ctx.fillStyle = '#64748b';
  ctx.font = '13px monospace';
  ctx.fillText('PV (PROCESS VALUE)', 16, 128);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 44px monospace';
  ctx.fillText('980°C', 16, 185);
  ctx.fillStyle = '#64748b';
  ctx.font = '13px monospace';
  ctx.fillText('SP (VACUUM SOAK)', 16, 208);
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 15px monospace';
  ctx.fillText('VAC: 2.4e-5 mbar', 16, 240);

  return new THREE.CanvasTexture(canvas);
}

export function createAndonTower(height = 1.0) {
  const tower = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, height, 12), MAT.steelChrome);
  pole.position.y = height / 2;
  tower.add(pole);

  const redLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), MAT.andonRed);
  redLens.position.y = height + 0.55;
  tower.add(redLens);

  const amberLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), MAT.andonAmber);
  amberLens.position.y = height + 0.32;
  tower.add(amberLens);

  const greenLens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), MAT.andonGreen);
  greenLens.position.y = height + 0.10;
  tower.add(greenLens);

  return tower;
}

export function createEStopStation() {
  const estop = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.18), MAT.eStopYellow);
  estop.add(box);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), MAT.hazardDark);
  ring.rotation.x = Math.PI / 2;
  ring.position.z = 0.1;
  estop.add(ring);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.08, 16), MAT.eStopRed);
  btn.rotation.x = Math.PI / 2;
  btn.position.z = 0.15;
  estop.add(btn);
  return estop;
}

export function createLocLineCoolant(tipTarget = { x: -0.3, y: -1.2, z: 0.3 }) {
  const group = new THREE.Group();
  // Manifold base mount
  const baseFitting = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12), MAT.structuralSteel);
  baseFitting.position.set(0, 0.05, 0);
  group.add(baseFitting);

  const segments = 8;
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const px = THREE.MathUtils.lerp(0, tipTarget.x, t);
    const py = -Math.pow(t, 1.15) * Math.abs(tipTarget.y);
    const pz = Math.sin(t * Math.PI * 0.75) * 0.28 + t * tipTarget.z;

    const isBlue = i % 2 === 0;
    const seg = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 12, 12),
      isBlue ? MAT.coolantBlue : MAT.coolantOrange
    );
    seg.position.set(px, py, pz);
    group.add(seg);
  }

  // Angled Brass Flat-Fan Spray Nozzle
  const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 12), MAT.extinguisherBrass);
  nozzle.rotation.x = Math.PI / 4;
  nozzle.rotation.y = -Math.PI / 6;
  nozzle.position.set(tipTarget.x, tipTarget.y - 0.06, tipTarget.z + 0.08);
  group.add(nozzle);
  return group;
}

export function createCableDragChain(len = 2.4, isX = true) {
  const chainGroup = new THREE.Group();
  const linkCount = 14;
  const linkStep = len / linkCount;
  for (let i = 0; i < linkCount; i++) {
    const link = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.22), MAT.cableCarrier);
    if (isX) {
      link.position.set((i - linkCount / 2) * linkStep, 0, 0);
    } else {
      link.position.set(0, 0, (i - linkCount / 2) * linkStep);
    }
    chainGroup.add(link);
  }
  return chainGroup;
}

export function createToolChest(x, z, rotY = 0) {
  const chest = new THREE.Group();
  chest.position.set(x, 0, z);
  chest.rotation.y = rotY;

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.9), MAT.toolChestBlue);
  body.position.y = 0.85;
  body.castShadow = true;
  chest.add(body);

  const topMat = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.06, 0.94), MAT.rubberMat);
  topMat.position.y = 1.58;
  chest.add(topMat);

  for (let d = 0; d < 6; d++) {
    const drawerY = 0.32 + d * 0.21;
    const drawerFace = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.18, 0.03), MAT.toolChestDark);
    drawerFace.position.set(0, drawerY, 0.46);
    chest.add(drawerFace);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.04), MAT.toolChestHandle);
    handle.position.set(0, drawerY, 0.49);
    chest.add(handle);
  }

  [-0.65, 0.65].forEach(cx => {
    [-0.32, 0.32].forEach(cz => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12), MAT.hazardDark);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(cx, 0.08, cz);
      chest.add(wheel);
    });
  });

  const wrench = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), MAT.steelChrome);
  wrench.rotation.z = Math.PI / 2;
  wrench.position.set(-0.25, 1.62, 0.1);
  chest.add(wrench);

  const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.01, 0.12), MAT.steelChrome);
  caliper.position.set(0.35, 1.62, -0.1);
  chest.add(caliper);

  return chest;
}

export function createSwarfDumpster(x, z, rotY = 0) {
  const dumpster = new THREE.Group();
  dumpster.position.set(x, 0, z);
  dumpster.rotation.y = rotY;

  const hopper = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.2), MAT.toolChestBlue);
  hopper.position.y = 0.75;
  hopper.castShadow = true;
  dumpster.add(hopper);

  [-0.35, 0.35].forEach(fx => {
    const tube = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 1.3), MAT.structuralSteel);
    tube.position.set(fx, 0.12, 0);
    dumpster.add(tube);
  });

  const swarf = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), MAT.steelChrome);
  swarf.scale.set(1.0, 0.3, 0.8);
  swarf.position.set(0, 1.2, 0);
  dumpster.add(swarf);

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), MAT.structuralSteel);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, 1.25, -0.65);
  dumpster.add(handle);

  return dumpster;
}

export function createFireExtinguisherUnit(x, z, rotY = 0) {
  const unit = new THREE.Group();
  unit.position.set(x, 0, z);
  unit.rotation.y = rotY;

  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.04), MAT.extinguisherRed);
  sign.position.set(0, 2.5, 0);
  unit.add(sign);

  const whiteStripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.05), MAT.portalWhite);
  whiteStripe.position.set(0, 2.75, 0);
  unit.add(whiteStripe);

  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16), MAT.extinguisherRed);
  cyl.position.set(0, 1.6, 0.22);
  cyl.castShadow = true;
  unit.add(cyl);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), MAT.extinguisherRed);
  dome.position.set(0, 2.05, 0.22);
  unit.add(dome);

  const valve = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.12), MAT.extinguisherBrass);
  valve.position.set(0, 2.22, 0.22);
  unit.add(valve);

  const hose = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), MAT.hazardDark);
  hose.position.set(0.16, 1.7, 0.22);
  unit.add(hose);

  return unit;
}

export function createEmergencyEyeWashStation(x, z, rotY = 0) {
  const station = new THREE.Group();
  station.position.set(x, 0, z);
  station.rotation.y = rotY;

  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.04), MAT.walkwayGreen);
  sign.position.set(0, 2.6, 0);
  station.add(sign);

  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 12), MAT.steelChrome);
  pipe.position.set(0, 1.1, 0.3);
  station.add(pipe);

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.25, 16), MAT.hazardYellow);
  bowl.position.set(0, 1.3, 0.3);
  station.add(bowl);

  const showerPipe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.7), MAT.steelChrome);
  showerPipe.position.set(0, 2.5, 0.65);
  station.add(showerPipe);

  const showerHead = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.14, 16), MAT.hazardYellow);
  showerHead.position.set(0, 2.45, 0.95);
  station.add(showerHead);

  return station;
}

export function createHazardBorder(width, depth) {
  const tex = getHazardStripeTexture();
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
  const borderGroup = new THREE.Group();

  const thickness = 0.35;
  [-depth / 2, depth / 2].forEach(z => {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(width + thickness * 2, thickness), mat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(0, 0.025, z);
    borderGroup.add(strip);
  });
  [-width / 2, width / 2].forEach(x => {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(thickness, depth), mat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(x, 0.025, 0);
    borderGroup.add(strip);
  });

  return borderGroup;
}

export function createOverheadCraneSystem(parentGroup) {
  const craneGroup = new THREE.Group();

  // 1. High-Bay Runway Beams mounted along ceiling perimeter columns (Y = 13.0)
  [-23.5, 23.5].forEach(z => {
    // Structural steel runway I-beam
    const runway = new THREE.Mesh(new THREE.BoxGeometry(62.8, 0.55, 0.45), MAT.structuralSteel);
    runway.position.set(0, 13.0, z);
    craneGroup.add(runway);

    // Hardened steel crane rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(62.8, 0.1, 0.12), MAT.steelChrome);
    rail.position.set(0, 13.32, z);
    craneGroup.add(rail);

    // Column support brackets
    for (let bx = -28; bx <= 28; bx += 14) {
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.6), MAT.structuralSteel);
      bracket.position.set(bx, 12.5, z);
      craneGroup.add(bracket);
    }
  });

  // 2. Parked Overhead Double-Girder Crane Bridge (Parked at X = -25.0 over Bay 1 rear storage zone)
  // Completely frees all central and foreground views of workcells!
  const bridgeX = -25.0;

  // End-truck wheel carriages resting on the rails
  [-23.5, 23.5].forEach(z => {
    const endTruck = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.5, 0.6), MAT.craneYellow);
    endTruck.position.set(bridgeX, 13.6, z);
    craneGroup.add(endTruck);

    [-1.2, 1.2].forEach(wx => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 16), MAT.steelChrome);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(bridgeX + wx, 13.4, z);
      craneGroup.add(wheel);
    });
  });

  // Twin Box Girders spanning across the plant
  [-0.7, 0.7].forEach(dx => {
    const girder = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.0, 46.4), MAT.craneYellow);
    girder.position.set(bridgeX + dx, 13.9, 0);
    craneGroup.add(girder);

    if (dx < 0) {
      const catwalk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 46.0), MAT.structuralSteel);
      catwalk.position.set(bridgeX + dx - 0.65, 14.1, 0);
      craneGroup.add(catwalk);
    }
  });

  // Hoist Trolley
  const trolleyZ = -4.0;
  const trolley = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 2.0), MAT.machineDark);
  trolley.position.set(bridgeX, 14.6, trolleyZ);
  craneGroup.add(trolley);

  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.4, 16), MAT.machineAccentCyan);
  motor.rotation.z = Math.PI / 2;
  motor.position.set(bridgeX, 15.0, trolleyZ);
  craneGroup.add(motor);

  // Steel wire ropes dropping to 25T hook block
  [-0.35, 0.35].forEach(rx => {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 5.4, 8), MAT.steelChrome);
    rope.position.set(bridgeX + rx, 11.6, trolleyZ);
    craneGroup.add(rope);
  });

  // 25-Ton Forged Hook Block
  const hookBlock = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.6, 0.6), MAT.craneYellow);
  hookBlock.position.set(bridgeX, 8.8, trolleyZ);
  craneGroup.add(hookBlock);

  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 12, 24, Math.PI * 1.5), MAT.structuralSteel);
  hook.position.set(bridgeX, 8.35, trolleyZ);
  hook.rotation.z = Math.PI / 2;
  craneGroup.add(hook);

  parentGroup.add(craneGroup);
}

export function createHighBayLighting(parentGroup) {
  const lightGroup = new THREE.Group();
  const bayCenters = [
    { x: -11, z: -10 },
    { x: 13, z: -10 },
    { x: -11, z: 9 },
    { x: 13, z: 9 }
  ];

  bayCenters.forEach(bay => {
    [-3.5, 3.5].forEach(dx => {
      [-2.5, 2.5].forEach(dz => {
        const fixture = new THREE.Group();
        fixture.position.set(bay.x + dx, 9.4, bay.z + dz);

        const housing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.6), MAT.aluminumExtrusion);
        fixture.add(housing);

        const diffuserMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const diffuser = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 0.45), diffuserMat);
        diffuser.position.y = -0.1;
        fixture.add(diffuser);

        [-1.0, 1.0].forEach(wx => {
          const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.6, 6), MAT.structuralSteel);
          wire.position.set(wx, 0.35, 0);
          fixture.add(wire);
        });

        lightGroup.add(fixture);
      });
    });
  });

  parentGroup.add(lightGroup);
}

export function createPedestrianWalkways(parentGroup) {
  const walkGroup = new THREE.Group();

  // 3D Physical Safety Hardware along the pedestrian highway
  // Corner Safety Bollards at the central crossroads (X = ±1.8, Z = ±1.5)
  [[-1.8, -1.5], [1.8, -1.5], [-1.8, 1.5], [1.8, 1.5]].forEach(([bx, bz]) => {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 16), MAT.safetyBollard);
    bollard.position.set(bx, 0.55, bz);
    bollard.castShadow = true;
    walkGroup.add(bollard);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), MAT.hazardDark);
    cap.position.set(bx, 1.1, bz);
    walkGroup.add(cap);
  });

  // Industrial Yellow Steel Safety Handrails at crosswalk corners
  const railConfigs = [
    { x: -2.0, z: -4.5, l: 5.0, rotY: 0 },
    { x: 2.0, z: -4.5, l: 5.0, rotY: 0 },
    { x: -2.0, z: 4.5, l: 5.0, rotY: 0 },
    { x: 2.0, z: 4.5, l: 5.0, rotY: 0 },
  ];

  railConfigs.forEach(rc => {
    // Top Rail (Y = 1.05)
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, rc.l), MAT.hazardYellow);
    topRail.position.set(rc.x, 1.05, rc.z);
    walkGroup.add(topRail);

    // Mid Rail (Y = 0.55)
    const midRail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, rc.l), MAT.hazardYellow);
    midRail.position.set(rc.x, 0.55, rc.z);
    walkGroup.add(midRail);

    // Toe Kick Plate (Y = 0.08)
    const kickPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, rc.l), MAT.hazardDark);
    kickPlate.position.set(rc.x, 0.08, rc.z);
    walkGroup.add(kickPlate);

    // Upright Stanchions
    for (let pz = rc.z - rc.l / 2; pz <= rc.z + rc.l / 2; pz += rc.l / 2) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 10), MAT.hazardYellow);
      post.position.set(rc.x, 0.525, pz);
      walkGroup.add(post);

      const footPlate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.16), MAT.structuralSteel);
      footPlate.position.set(rc.x, 0.015, pz);
      walkGroup.add(footPlate);
    }
  });

  parentGroup.add(walkGroup);
}

/**
 * 1. FACTORY FLOOR & ENVIRONMENT (64m x 48m with 4 Bays, ASRS Racks, Dual AMRs)
 */
export function createFactoryFloor(scene) {
  const group = new THREE.Group();

  // 1. Structural Concrete Sub-Slab (64m x 48m x 0.8m)
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

  // 2. High-Fidelity Textured Cleanroom Epoxy Floor Surface Plane
  const floorPlaneGeo = new THREE.PlaneGeometry(64, 48);
  const floorTex = getFactoryFloorTexture(true); // Default Executive Cleanroom Daylight
  const floorPlaneMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.22,
    metalness: 0.15,
  });
  factoryFloorSurfacePlane = new THREE.Mesh(floorPlaneGeo, floorPlaneMat);
  factoryFloorSurfacePlane.rotation.x = -Math.PI / 2;
  factoryFloorSurfacePlane.position.y = 0.005;
  factoryFloorSurfacePlane.receiveShadow = true;
  group.add(factoryFloorSurfacePlane);

  // GridHelpers (disabled to showcase procedural cleanroom texture graphics)
  gridHelperLight = new THREE.GridHelper(60, 60, 0x0284c7, 0x94a3b8);
  gridHelperLight.position.y = 0.01;
  gridHelperLight.visible = false;
  group.add(gridHelperLight);

  gridHelperDark = new THREE.GridHelper(60, 60, 0x00f3ff, 0x1e293b);
  gridHelperDark.position.y = 0.01;
  gridHelperDark.visible = false;
  group.add(gridHelperDark);

  // 3. Precision Machined Steel Inertia Sole Plates under heavy machinery
  const machineFootprints = [
    { x: -16, z: -10, w: 7.2, d: 6.4 }, // CNC-01
    { x: -6, z: -10, w: 6.8, d: 6.0 },  // CNC-02
    { x: 7, z: -11, w: 7.4, d: 6.6 },   // PRESS-01
    { x: 19, z: -11, w: 10.0, d: 4.6 }, // PRESS-02
    { x: 13, z: -2, w: 8.0, d: 5.0 },   // FURN-01
    { x: -16, z: 8, w: 6.6, d: 6.6 },   // ROBOT-01
    { x: -6, z: 8, w: 6.6, d: 5.4 },    // LASER-01
    { x: 13, z: 8, w: 22.8, d: 3.6 },   // CONV-01
  ];

  machineFootprints.forEach(fp => {
    const soleGeo = new THREE.BoxGeometry(fp.w, 0.02, fp.d);
    const soleMesh = new THREE.Mesh(soleGeo, MAT.structuralSteel);
    soleMesh.position.set(fp.x, 0.01, fp.z);
    soleMesh.receiveShadow = true;
    group.add(soleMesh);
  });

  // EXECUTIVE CLEANROOM ENTRANCE PORTAL & BRANDING (TITAN AEROSPACE)
  createCleanroomEntrancePortal(group);

  // HIGH-BAY WAREHOUSE PALLET STORAGE RACKS (ASRS)
  createWarehouseRack(group, -22, -18);
  createWarehouseRack(group, 22, -18);
  createWarehouseRack(group, -22, 18);
  createWarehouseRack(group, 22, 18);

  // DUAL AMR NAVIGATION CORRIDORS & OPTICAL WAYPOINT DISCS
  createDualCorridorPaths(group);

  // HIGH-VISIBILITY PEDESTRIAN SAFETY HARDWARE & BOLLARDS
  createPedestrianWalkways(group);

  // INDUSTRIAL SHOP-FLOOR FURNITURE & SAFETY STATIONS
  // 1. Mobile Tool Chests at workstations
  group.add(createToolChest(-21, -8, Math.PI / 2));
  group.add(createToolChest(-3, -8, -Math.PI / 2));
  group.add(createToolChest(4, -8, Math.PI / 2));
  group.add(createToolChest(-21, 11, Math.PI / 2));

  // 2. Swarf & Chip Collection Dumpsters near CNC mills
  group.add(createSwarfDumpster(-13.5, -6.8, 0));
  group.add(createSwarfDumpster(-3.5, -6.8, 0));

  // 3. Heavy Factory Structural Columns with Collision Bollards & Safety Stations
  createStructuralColumns(group);

  // OVERHEAD TRAVELING BRIDGE CRANE & HOIST SYSTEM
  createOverheadCraneSystem(group);

  // OVERHEAD HIGH-BAY LED TROFFER LIGHTING
  createHighBayLighting(group);

  scene.add(group);
  return group;
}

export function createStructuralColumns(parentGroup) {
  const colGroup = new THREE.Group();
  const colCoords = [
    { x: -24, z: -16, bay: "BAY 01" },
    { x: 0,   z: -16, bay: "CENTRAL" },
    { x: 24,  z: -16, bay: "BAY 02" },
    { x: -24, z: 16,  bay: "BAY 03" },
    { x: 0,   z: 16,  bay: "CENTRAL" },
    { x: 24,  z: 16,  bay: "BAY 04" }
  ];

  colCoords.forEach(c => {
    // 1. Heavy Structural Steel Column
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.7, 14.0, 0.7), MAT.structuralSteel);
    col.position.set(c.x, 7.0, c.z);
    col.castShadow = true;
    colGroup.add(col);

    // 2. Heavy Yellow Forklift/AMR Collision Bollard Wrap
    const bollardWrap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 1.0), MAT.safetyBollard);
    bollardWrap.position.set(c.x, 0.7, c.z);
    bollardWrap.castShadow = true;
    colGroup.add(bollardWrap);

    // 3. Hazard Stripe Band around the bollard
    const hazardRing = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.25, 1.02), MAT.hazardDark);
    hazardRing.position.set(c.x, 0.7, c.z);
    colGroup.add(hazardRing);

    // 4. Mount Fire Extinguishers on side columns
    if (c.x !== 0) {
      colGroup.add(createFireExtinguisherUnit(c.x + (c.x > 0 ? -0.42 : 0.42), c.z, c.x > 0 ? -Math.PI / 2 : Math.PI / 2));
    }
  });

  // Central Column: Mount Emergency EyeWash & Safety Shower Station
  colGroup.add(createEmergencyEyeWashStation(0, -15.5, 0));

  parentGroup.add(colGroup);
}

function createWarehouseRack(parentGroup, posX, posZ) {
  const rackGroup = new THREE.Group();
  rackGroup.position.set(posX, 0, posZ);

  const rackWidth = 8.0;
  const rackDepth = 2.2;
  const rackHeight = 8.5;

  // 4 Main Upright Posts with Teardrop Blue Enamel Finish
  const postGeo = new THREE.BoxGeometry(0.2, rackHeight, 0.2);
  [-rackWidth / 2, rackWidth / 2].forEach(x => {
    [-rackDepth / 2, rackDepth / 2].forEach(z => {
      const post = new THREE.Mesh(postGeo, MAT.rackBlue);
      post.position.set(x, rackHeight / 2, z);
      post.castShadow = true;
      rackGroup.add(post);

      // Floor Anchor Base Plate
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.35), MAT.structuralSteel);
      foot.position.set(x, 0.02, z);
      rackGroup.add(foot);
    });

    // Diagonal Cross-Bracing Trusses between front and rear uprights
    for (let ty = 1.0; ty < rackHeight - 1.5; ty += 2.4) {
      const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, rackDepth * 1.25, 8), MAT.structuralSteel);
      brace.rotation.x = Math.PI / 4;
      brace.position.set(x, ty + 1.0, 0);
      rackGroup.add(brace);
    }
  });

  const tierY = [1.4, 4.0, 6.6];
  tierY.forEach((y, tIdx) => {
    // Heavy Orange Step Beams (Front & Back)
    const beamGeo = new THREE.BoxGeometry(rackWidth, 0.25, 0.12);
    [-rackDepth / 2, rackDepth / 2].forEach(z => {
      const beam = new THREE.Mesh(beamGeo, MAT.rackOrange);
      beam.position.set(0, y, z);
      rackGroup.add(beam);
    });

    // Wire Mesh Deck Panels on the shelf
    const deckGeo = new THREE.BoxGeometry(rackWidth - 0.2, 0.04, rackDepth - 0.2);
    const deck = new THREE.Mesh(deckGeo, MAT.wireMesh);
    deck.position.set(0, y + 0.14, 0);
    rackGroup.add(deck);

    // Barcode Shelf Location Placards on Front Beam
    const bayCode = `BAY ${posX > 0 ? 'B' : 'A'}-0${tIdx + 1}`;
    const placardTex = getBarcodePlacardTexture(bayCode, 'AERO INVENTORY');
    const placard = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.2), new THREE.MeshBasicMaterial({ map: placardTex }));
    placard.position.set(0, y, rackDepth / 2 + 0.07);
    rackGroup.add(placard);

    // Diverse Palletized Inventory Loads across 3 positions
    [-2.4, 0, 2.4].forEach((px, pIdx) => {
      const palGroup = new THREE.Group();
      palGroup.position.set(px, y + 0.16, 0);

      // Authentic Euro-Pallet (3 runners + 5 top deck boards)
      [-0.7, 0, 0.7].forEach(rx => {
        const runner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.8), MAT.woodPallet);
        runner.position.set(rx, 0.06, 0);
        palGroup.add(runner);
      });
      for (let bz = -0.8; bz <= 0.8; bz += 0.4) {
        const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.03, 0.24), MAT.woodPallet);
        board.position.set(0, 0.135, bz);
        palGroup.add(board);
      }

      // Diverse Cargo Types:
      if ((tIdx + pIdx) % 3 === 0) {
        // Shrink-wrapped corrugated cartons with shipping label
        const carton = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.4), MAT.woodPallet);
        carton.position.set(0, 0.7, 0);
        carton.castShadow = true;
        palGroup.add(carton);

        const labelTex = getBarcodePlacardTexture('LOT #9842', 'INCONEL-718 BLANKS');
        const label = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshBasicMaterial({ map: labelTex }));
        label.position.set(0, 0.7, 0.71);
        palGroup.add(label);
      } else if ((tIdx + pIdx) % 3 === 1) {
        // Heavy Wire Stillage Metal Tote filled with alloy components
        const stillageFrame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 1.3), MAT.wireMesh);
        stillageFrame.position.set(0, 0.6, 0);
        stillageFrame.castShadow = true;
        palGroup.add(stillageFrame);

        const stillageRim = new THREE.Mesh(new THREE.BoxGeometry(1.54, 0.08, 1.34), MAT.structuralSteel);
        stillageRim.position.set(0, 1.05, 0);
        palGroup.add(stillageRim);

        // Machined billet stock inside tote
        [-0.3, 0.3].forEach(bx => {
          const billetStock = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.8, 12), MAT.workpieceAlloy);
          billetStock.rotation.z = Math.PI / 2;
          billetStock.position.set(0, 0.4, bx);
          palGroup.add(billetStock);
        });
      } else {
        // Aerospace Flight Hardware Shipping Crate
        const crate = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 1.4), MAT.machineDark);
        crate.position.set(0, 0.65, 0);
        crate.castShadow = true;
        palGroup.add(crate);

        // Aluminum Corner Reinforcement Brackets
        [-0.7, 0.7].forEach(cx => {
          [-0.7, 0.7].forEach(cz => {
            const edgeAngle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), MAT.aluminumExtrusion);
            edgeAngle.position.set(cx, 0.65, cz);
            palGroup.add(edgeAngle);
          });
        });

        const decalTex = getEquipmentDecalTexture('mfg', 'TITAN AERO', 'CRITICAL HARDWARE');
        const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshBasicMaterial({ map: decalTex }));
        decal.position.set(0, 0.65, 0.71);
        palGroup.add(decal);
      }

      rackGroup.add(palGroup);
    });
  });

  parentGroup.add(rackGroup);
}

function createDualCorridorPaths(parentGroup) {
  const corridorGroup = new THREE.Group();

  // Optical Floor RFID Navigation Transponder Discs at Loop Waypoints
  const rfidGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16);
  const waypoints = [
    [-22, -16], [0, -16], [22, -16],
    [22, 0], [22, 16], [0, 16],
    [-22, 16], [-22, 0],
    [-10, -12], [0, -12], [0, 12], [-10, 12]
  ];

  waypoints.forEach(([wx, wz]) => {
    const disc = new THREE.Mesh(rfidGeo, MAT.steelChrome);
    disc.position.set(wx, 0.015, wz);
    corridorGroup.add(disc);

    const centerGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 12), MAT.portalGlowCyan);
    centerGlow.position.set(wx, 0.018, wz);
    corridorGroup.add(centerGlow);
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

  // Foundation Hazard Safety Perimeter
  group.add(createHazardBorder(7.4, 6.6));

  // Base machine casting
  const baseGeo = new THREE.BoxGeometry(6.6, 1.2, 5.8);
  const base = new THREE.Mesh(baseGeo, MAT.machineChassis);
  base.position.y = 0.6;
  base.castShadow = true;
  group.add(base);

  // Vibration Damper Foot Mounts with Hex Leveling Studs
  [-2.8, 2.8].forEach(fx => {
    [-2.4, 2.4].forEach(fz => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.16, 12), MAT.structuralSteel);
      pad.position.set(fx, 0.08, fz);
      group.add(pad);

      const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.35, 8), MAT.steelChrome);
      stud.position.set(fx, 0.25, fz);
      group.add(stud);
    });
  });

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

  // Telescopic Way Cover Bellows along crossbeam (Left & Right of carriage)
  const bellowsL = createAccordionBellows(1.4, 1.2, 1.2, 5);
  bellowsL.position.set(-1.25, 4.5, 0.4);
  group.add(bellowsL);

  const bellowsR = createAccordionBellows(1.4, 1.2, 1.2, 5);
  bellowsR.position.set(1.25, 4.5, 0.4);
  group.add(bellowsR);

  // Slanted Chip Enclosure Top Canopy Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, 2.6), MAT.machineDark);
  hood.position.set(0, 6.4, 1.3);
  hood.rotation.x = 0.22;
  group.add(hood);

  // Interior Cool-White LED Work Light Bar
  const workLight = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.14), MAT.workLightLed);
  workLight.position.set(0, 5.8, 1.5);
  group.add(workLight);

  // Chip Auger & Swarf Chute extending to dumpster
  const chute = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 2.0), MAT.machineDark);
  chute.position.set(1.6, 0.5, 3.2);
  chute.rotation.x = -0.32;
  group.add(chute);

  const augerScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.0, 8), MAT.steelChrome);
  augerScrew.rotation.x = Math.PI / 2 - 0.32;
  augerScrew.position.set(1.6, 0.5, 3.2);
  group.add(augerScrew);

  // Articulated Cable Drag Chain along crossbeam
  const dragChain = createCableDragChain(4.6, true);
  dragChain.position.set(0, 6.0, 0.4);
  group.add(dragChain);

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

  // Dual Loc-Line Coolant Supply Hoses Aimed at Spindle
  const coolantNozzle = createLocLineCoolant({ x: 0, y: -1.6, z: 0.1 });
  coolantNozzle.position.set(0.35, -0.7, 0.3);
  carriageGroup.add(coolantNozzle);

  const toolBit = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.02, 0.9, 16), MAT.steelChrome);
  toolBit.position.set(0, -2.4, 0.3);
  carriageGroup.add(toolBit);

  group.add(carriageGroup);
  group.toolCarriage = carriageGroup;
  group.spindleTool = toolBit;

  // Trunnion Table & Clamping Vise
  const trunnionBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.5, 24), MAT.steelChrome);
  trunnionBase.position.set(0, 1.4, 0.6);
  group.add(trunnionBase);

  // Sculpted 5-Axis Aerospace Titanium Blisk Workpiece
  const blisk = createBliskWorkpiece();
  blisk.position.set(0, 1.85, 0.6);
  group.add(blisk);
  group.turbineBlade = blisk;

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

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const th = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8), MAT.steelChrome);
    th.rotation.x = Math.PI / 2;
    th.position.set(-3.2, 3.8 + Math.sin(a) * 0.95, Math.cos(a) * 0.95);
    group.add(th);
  }

  // Enclosure Glass Doors with Anodized Frames & Door Pull Handles
  const doorL = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.6, 0.08), MAT.glassChamber);
  doorL.position.set(-1.4, 3.2, 2.5);
  group.add(doorL);

  const doorR = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.6, 0.08), MAT.glassChamber);
  doorR.position.set(1.4, 3.2, 2.5);
  group.add(doorR);

  // Brushed Stainless Door Pull Handles
  [-0.2, 0.2].forEach(hx => {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.08), MAT.steelChrome);
    handle.position.set(hx, 3.2, 2.58);
    group.add(handle);
  });

  // Industrial Manufacturer Decal Badge & Warning Placards
  const dmgDecalTex = getEquipmentDecalTexture('mfg', 'DMG MORI', 'NMV 5000 5-AXIS');
  const dmgDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.32), new THREE.MeshBasicMaterial({ map: dmgDecalTex }));
  dmgDecal.position.set(-2.5, 5.6, 2.02);
  group.add(dmgDecal);

  const hvDecalTex = getEquipmentDecalTexture('danger', 'HIGH VOLTAGE', '480 VAC 3-PHASE');
  const hvDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshBasicMaterial({ map: hvDecalTex }));
  hvDecal.position.set(2.5, 3.5, 2.02);
  group.add(hvDecal);

  // Articulating Operator Console Arm & Display (DRO)
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), MAT.structuralSteel);
  arm1.rotation.z = -Math.PI / 4;
  arm1.position.set(3.4, 3.2, 1.8);
  group.add(arm1);

  const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.2), MAT.machineDark);
  consoleBox.position.set(3.8, 3.6, 2.4);
  consoleBox.rotation.y = -0.3;
  group.add(consoleBox);

  const droTex = createDROTexture("CNC-01", "O0142_TITAN_ROUGH", "14,200", "3,200");
  const droMat = new THREE.MeshBasicMaterial({ map: droTex });
  const droScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), droMat);
  droScreen.position.set(3.8, 3.6, 2.51);
  droScreen.rotation.y = -0.3;
  group.add(droScreen);

  // E-Stop button on console
  const estop = createEStopStation();
  estop.position.set(3.3, 3.2, 2.4);
  estop.rotation.y = -0.3;
  group.add(estop);

  // 3-Tier Andon Status Tower on Right Column
  const andon = createAndonTower(1.2);
  andon.position.set(2.8, 6.2, -1.6);
  group.add(andon);

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

  // Foundation Hazard Safety Perimeter
  group.add(createHazardBorder(7.0, 6.2));

  // Precision Granite Surface Bed
  const bed = new THREE.Mesh(new THREE.BoxGeometry(6.2, 1.2, 5.4), MAT.graniteBase);
  bed.position.y = 0.6;
  bed.castShadow = true;
  group.add(bed);

  // Heidenhain Optical Linear Glass Scale Reader Encoders on Granite Bed
  [-2.2, 2.2].forEach(gx => {
    const scaleRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 4.6), MAT.steelChrome);
    scaleRail.position.set(gx, 1.24, 0);
    group.add(scaleRail);

    const readerHead = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.25), MAT.machineDark);
    readerHead.position.set(gx, 1.28, 0.5);
    group.add(readerHead);

    const ledDot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.04), MAT.ledGreen);
    ledDot.position.set(gx + (gx > 0 ? 0.08 : -0.08), 1.28, 0.5);
    group.add(ledDot);
  });

  // Precision Leveling Feet under granite bed
  [-2.6, 2.6].forEach(fx => {
    [-2.2, 2.2].forEach(fz => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.16, 12), MAT.steelChrome);
      foot.position.set(fx, 0.08, fz);
      group.add(foot);
    });
  });

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

  // Accordion Bellows on Portal X-axis
  const bellows1 = createAccordionBellows(1.2, 1.0, 1.2, 5);
  bellows1.position.set(-1.1, 4.2, 0.4);
  group.add(bellows1);

  const bellows2 = createAccordionBellows(1.2, 1.0, 1.2, 5);
  bellows2.position.set(1.1, 4.2, 0.4);
  group.add(bellows2);

  // Articulated Cable Drag Chain along Top Bridge Beam
  const dragChain = createCableDragChain(4.2, true);
  dragChain.position.set(0, 5.8, 0.2);
  group.add(dragChain);

  // High-Speed Spindle Head (Carriage)
  const carriage = new THREE.Group();
  carriage.position.set(0, 4.2, 0.6);

  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.2), MAT.machineDark);
  carriage.add(headMesh);

  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 20), MAT.steelChrome);
  spindle.position.set(0, -1.2, 0.2);
  carriage.add(spindle);

  // Loc-Line Micro-Coolant Nozzle on Spindle
  const coolant = createLocLineCoolant({ x: 0, y: -1.3, z: 0.1 });
  coolant.position.set(0.3, -0.6, 0.2);
  carriage.add(coolant);

  const microTool = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.01, 0.8, 16), MAT.steelChrome);
  microTool.position.set(0, -1.8, 0.2);
  carriage.add(microTool);

  group.add(carriage);
  group.toolCarriage = carriage;
  group.spindleTool = microTool;

  // High-Precision Trunnion Table & Clamping Chuck
  const trunnion = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.45, 24), MAT.steelChrome);
  trunnion.position.set(0, 1.35, 0.5);
  group.add(trunnion);

  // Precision 4-Jaw Collet Chuck
  const chuckGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.25, 16);
  const chuck = new THREE.Mesh(chuckGeo, MAT.hazardDark);
  chuck.position.set(0, 1.65, 0.5);
  group.add(chuck);

  // Finished Aerodynamic Airfoil Blade Workpiece
  const airfoil = createAirfoilBlade();
  airfoil.position.set(0, 1.75, 0.5);
  airfoil.rotation.y = 0.6;
  group.add(airfoil);
  group.turbineBlade = airfoil;

  // External Mist Extraction Filter Unit on Roof
  const mistFilter = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.4, 16), MAT.machineDark);
  mistFilter.position.set(2.0, 6.4, -0.8);
  group.add(mistFilter);

  // Flexible Spiral Duct Hose from filter down to chamber
  const ductHose = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 12), MAT.aluminumExtrusion);
  ductHose.rotation.z = Math.PI / 4;
  ductHose.position.set(1.2, 5.7, -0.4);
  group.add(ductHose);

  // Mikron / DMG Decal Plate
  const mikronDecalTex = getEquipmentDecalTexture('mfg', 'MIKRON HSM 600U', 'TOLERANCE ±0.001mm');
  const mikronDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshBasicMaterial({ map: mikronDecalTex }));
  mikronDecal.position.set(-2.4, 4.8, 1.81);
  group.add(mikronDecal);

  // Siemens Sinumerik Operator Console with High-Res DRO Canvas Texture
  const consoleMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.2), MAT.machineDark);
  consoleMesh.position.set(3.2, 2.4, 1.8);
  consoleMesh.rotation.y = -0.4;
  group.add(consoleMesh);

  const droTex = createDROTexture("CNC-02", "O0291_AIRFOIL_FINISH", "24,000", "4,800");
  const droMat = new THREE.MeshBasicMaterial({ map: droTex });
  const droScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), droMat);
  droScreen.position.set(3.2, 2.4, 1.91);
  droScreen.rotation.y = -0.4;
  group.add(droScreen);

  // E-Stop button on console
  const estop = createEStopStation();
  estop.position.set(2.8, 2.0, 1.9);
  estop.rotation.y = -0.4;
  group.add(estop);

  // 3-Tier Andon Status Tower on Left Column
  const andon = createAndonTower(1.2);
  andon.position.set(-2.4, 5.9, -1.2);
  group.add(andon);

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

  // Foundation Hazard Safety Perimeter
  group.add(createHazardBorder(7.6, 6.8));

  const baseGeo = new THREE.BoxGeometry(6.8, 1.6, 6.0);
  const base = new THREE.Mesh(baseGeo, MAT.pressBody);
  base.position.y = 0.8;
  base.castShadow = true;
  group.add(base);

  // Oil Drip Catch Basin
  const basin = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.2, 4.0), MAT.machineDark);
  basin.position.set(0, 1.62, 0);
  group.add(basin);

  // Precision T-Slotted Machined Bolster Bed Plate
  const bolsterMat = new THREE.MeshStandardMaterial({
    map: getBolsterPlateTexture(),
    roughness: 0.35,
    metalness: 0.6,
  });
  const bolster = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 3.8), bolsterMat);
  bolster.position.set(0, 1.74, 0);
  bolster.receiveShadow = true;
  group.add(bolster);

  const pillarCoords = [[-2.5, 2.3], [2.5, 2.3], [-2.5, -2.3], [2.5, -2.3]];
  pillarCoords.forEach(([px, pz]) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 8.0, 24), MAT.steelChrome);
    p.position.set(px, 4.8, pz);
    group.add(p);

    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.45, 6), MAT.hazardDark);
    nut.position.set(px, 9.0, pz);
    group.add(nut);
  });

  // Safety Palm Buttons (Anti-tie-down operator safety control on front pillars)
  [[-2.5, 2.65], [2.5, 2.65]].forEach(([px, pz]) => {
    const pbBox = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.18), MAT.eStopYellow);
    pbBox.position.set(px, 2.8, pz);
    group.add(pbBox);

    const pbBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.06, 16), MAT.extinguisherRed);
    pbBtn.rotation.x = Math.PI / 2;
    pbBtn.position.set(px, 2.8, pz + 0.1);
    group.add(pbBtn);
  });

  // Safety Light Curtains: Keyence-style Dual Yellow Extruded Optical Sensor Pylons
  [-2.8, 2.8].forEach(lx => {
    const sensorPost = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.8, 0.18), MAT.hazardYellow);
    sensorPost.position.set(lx, 3.7, 2.4);
    group.add(sensorPost);

    for (let ly = -1.6; ly <= 1.6; ly += 0.4) {
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), MAT.extinguisherRed);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(lx, 3.7 + ly, 2.49);
      group.add(lens);
    }
  });

  // Fine Red Laser Safety Grid Lines across opening
  [-1.2, -0.4, 0.4, 1.2].forEach(dy => {
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 5.5, 6), MAT.lightCurtainBeam);
    beam.rotation.z = Math.PI / 2;
    beam.position.set(0, 3.7 + dy, 2.4);
    group.add(beam);
  });

  const crown = new THREE.Mesh(new THREE.BoxGeometry(7.0, 2.0, 6.2), MAT.pressSafetyOrange);
  crown.position.y = 9.0;
  crown.castShadow = true;
  group.add(crown);

  const tank = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 2.2), MAT.machineDark);
  tank.position.set(0, 10.7, -1.2);
  group.add(tank);

  // Hydraulic Accumulator Bottles on Top Crown
  [-1.2, 1.2].forEach(ax => {
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16), MAT.machineDark);
    bottle.position.set(ax, 11.2, 1.8);
    group.add(bottle);
  });

  // Hydraulic High-Pressure Manifold Lines
  const pipeMat = MAT.structuralSteel;
  const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), pipeMat);
  p1.position.set(1.4, 10.2, 0.2);
  group.add(p1);

  // Analog Pressure Gauges on Crown
  [-0.6, 0.6].forEach(gx => {
    const gaugeBack = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 20), MAT.steelChrome);
    gaugeBack.rotation.x = Math.PI / 2;
    gaugeBack.position.set(gx, 9.4, 3.15);
    group.add(gaugeBack);

    const gTex = getGaugeTexture();
    const gMat = new THREE.MeshBasicMaterial({ map: gTex });
    const gaugeFace = new THREE.Mesh(new THREE.CircleGeometry(0.24, 20), gMat);
    gaugeFace.position.set(gx, 9.4, 3.2);
    group.add(gaugeFace);
  });

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

  // 4 Precision Hardened Tool Steel Die Guide Pillars with Bronze Bushings
  const guideCoords = [[-1.5, 1.2], [1.5, 1.2], [-1.5, -1.2], [1.5, -1.2]];
  guideCoords.forEach(([gx, gz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.0, 16), MAT.steelChrome);
    post.position.set(gx, 2.6, gz);
    group.add(post);

    const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.4, 16), MAT.extinguisherBrass);
    bushing.position.set(gx, -0.6, gz);
    ram.add(bushing);
  });

  // Dedicated Heavy Hydraulic Power Unit (HPU) on Floor
  const hpuGroup = new THREE.Group();
  hpuGroup.position.set(4.4, 0, 0);

  const hpuSkid = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.16, 3.4), MAT.structuralSteel);
  hpuSkid.position.y = 0.08;
  hpuGroup.add(hpuSkid);

  const hpuTank = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 2.6), MAT.machineDark);
  hpuTank.position.set(0, 0.71, 0);
  hpuGroup.add(hpuTank);

  // TEFC Electric Drive Motor with Cooling Fins
  const hpuMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.1, 16), MAT.machineAccentCyan);
  hpuMotor.rotation.x = Math.PI / 2;
  hpuMotor.position.set(0, 1.5, -0.5);
  hpuGroup.add(hpuMotor);

  for (let f = -0.4; f <= 0.4; f += 0.12) {
    const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 16), MAT.structuralSteel);
    fin.rotation.x = Math.PI / 2;
    fin.position.set(0, 1.5, -0.5 + f);
    hpuGroup.add(fin);
  }

  // Axial Piston Pump & Valve Manifold
  const hpuPump = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.7, 16), MAT.steelChrome);
  hpuPump.rotation.x = Math.PI / 2;
  hpuPump.position.set(0, 1.5, 0.45);
  hpuGroup.add(hpuPump);

  const hpuManifold = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.9), MAT.steelChrome);
  hpuManifold.position.set(0, 1.5, 1.1);
  hpuGroup.add(hpuManifold);

  for (let sc = -0.3; sc <= 0.3; sc += 0.2) {
    const coil = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.16), MAT.hazardDark);
    coil.position.set(0.32, 1.55, 0.9 + sc);
    hpuGroup.add(coil);
  }

  group.add(hpuGroup);

  // Sculpted Aerospace Structural Bulkhead Forged Component
  const billet = createBulkheadForging();
  billet.position.set(0, 1.82, 0);
  group.add(billet);
  group.hotBillet = billet;

  // Schuler 1000T Manufacturer Plaque Decal
  const schulerTex = getEquipmentDecalTexture('mfg', 'SCHULER 1000T', 'TITANIUM FORGING');
  const schulerDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.4), new THREE.MeshBasicMaterial({ map: schulerTex }));
  schulerDecal.position.set(0, 9.8, 3.12);
  group.add(schulerDecal);

  // 3-Tier Andon Status Tower on Crown
  const andon = createAndonTower(1.2);
  andon.position.set(-3.1, 10.0, -2.6);
  group.add(andon);

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

  // Foundation Hazard Safety Perimeter
  group.add(createHazardBorder(10.2, 4.8));

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

    const nut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 6), MAT.hazardDark);
    nut1.rotation.z = Math.PI / 2;
    nut1.position.set(-4.2, py, pz);
    group.add(nut1);
  });

  // Rear Hydraulic Ram Cylinder
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.2, 20), MAT.pressSafetyOrange);
  cyl.rotation.z = Math.PI / 2;
  cyl.position.set(-3.2, 2.0, 0);
  group.add(cyl);

  // Pressure Gauge on Rear Cylinder
  const gTex = getGaugeTexture();
  const gMat = new THREE.MeshBasicMaterial({ map: gTex });
  const gaugeFace = new THREE.Mesh(new THREE.CircleGeometry(0.24, 20), gMat);
  gaugeFace.position.set(-3.2, 3.3, 0.8);
  group.add(gaugeFace);

  // Translating Extrusion Ram Plunger
  const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 3.0, 16), MAT.steelChrome);
  ram.rotation.z = Math.PI / 2;
  ram.position.set(-1.0, 2.0, 0);
  group.add(ram);
  group.extrusionRam = ram;

  // Billet Container Chamber (Heated) with Ceramic Induction Bands
  const chamber = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), MAT.machineDark);
  chamber.position.set(1.4, 2.0, 0);
  group.add(chamber);

  [-0.6, 0.6].forEach(hx => {
    const heatBand = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.2, 20), MAT.hazardYellow);
    heatBand.rotation.z = Math.PI / 2;
    heatBand.position.set(1.4 + hx, 2.0, 0);
    group.add(heatBand);
  });

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

  // Quench Water Spray Manifold with Brass Mist Nozzles
  const quenchPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), MAT.structuralSteel);
  quenchPipe.position.set(3.4, 2.4, 0);
  group.add(quenchPipe);
  [-0.4, -0.13, 0.13, 0.4].forEach(nz => {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6), MAT.brassFitting);
    nozzle.position.set(3.4, 2.32, nz);
    group.add(nozzle);
  });

  // Operator Safety Polycarbonate Shield Screen
  const shieldFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 0.08), MAT.glassChamber);
  shieldFrame.position.set(1.4, 2.8, 1.6);
  group.add(shieldFrame);

  // Extruded Aircraft Titanium Spar (I-Beam Flanged Profile)
  const sparGroup = new THREE.Group();
  sparGroup.position.set(5.2, 1.85, 0);

  const topFlange = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 0.55), MAT.workpieceAlloy);
  topFlange.position.y = 0.15;
  sparGroup.add(topFlange);

  const web = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 0.06), MAT.workpieceAlloy);
  sparGroup.add(web);

  const botFlange = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.05, 0.55), MAT.workpieceAlloy);
  botFlange.position.y = -0.15;
  sparGroup.add(botFlange);

  group.add(sparGroup);

  // Extrusion Press Nameplate
  const pressDecalTex = getEquipmentDecalTexture('mfg', 'SMS MEER 500T', 'AERO SPAR EXTRUSION');
  const pressDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.38), new THREE.MeshBasicMaterial({ map: pressDecalTex }));
  pressDecal.position.set(-1.0, 3.4, 1.65);
  group.add(pressDecal);

  // 3-Tier Andon Status Tower
  const andon = createAndonTower(1.0);
  andon.position.set(-4.2, 3.4, -1.6);
  group.add(andon);

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

  // Foundation Hazard Safety Perimeter
  group.add(createHazardBorder(8.2, 5.2));

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

  // Water Cooling Jacket Pipes with Brass Shutoff Valves
  const jacketPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.6, 12), MAT.steelChrome);
  jacketPipe.rotation.z = Math.PI / 2;
  jacketPipe.position.set(0, 4.85, 0.8);
  group.add(jacketPipe);

  [-2.0, 2.0].forEach(vx => {
    const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 8), MAT.brassFitting);
    valve.position.set(vx, 4.95, 0.8);
    group.add(valve);
  });

  // Front Heavy Hinged Vacuum Door with Clamping Flange Ring
  const door = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.35, 0.6, 28), MAT.machineDark);
  door.rotation.z = Math.PI / 2;
  door.position.set(3.4, 2.6, 0);
  group.add(door);

  // 12 Circumferential Heavy Hex Bolts around Door Flange
  for (let b = 0; b < Math.PI * 2; b += Math.PI / 6) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 6), MAT.steelChrome);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(3.72, 2.6 + Math.sin(b) * 2.1, Math.cos(b) * 2.1);
    group.add(bolt);
  }

  // 8 Heavy Wedge Door Locking Lugs around Door Perimeter
  for (let b = 0; b < Math.PI * 2; b += Math.PI / 4) {
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.3), MAT.structuralSteel);
    lug.position.set(3.4, 2.6 + Math.sin(b) * 2.42, Math.cos(b) * 2.42);
    lug.rotation.x = b;
    group.add(lug);
  }

  // Heavy Counterweight Door Hinge Arm
  const hingeArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.4), MAT.structuralSteel);
  hingeArm.position.set(3.3, 2.6, 2.3);
  group.add(hingeArm);

  const counterweight = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16), MAT.machineDark);
  counterweight.position.set(3.3, 4.4, 2.3);
  group.add(counterweight);

  // Glowing Quartz Observation Viewport
  const windowFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.18, 24), MAT.steelChrome);
  windowFrame.rotation.z = Math.PI / 2;
  windowFrame.position.set(3.72, 2.6, 0);
  group.add(windowFrame);

  for (let sb = 0; sb < Math.PI * 2; sb += Math.PI / 3) {
    const sBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 6), MAT.hazardDark);
    sBolt.rotation.z = Math.PI / 2;
    sBolt.position.set(3.82, 2.6 + Math.sin(sb) * 0.54, Math.cos(sb) * 0.54);
    group.add(sBolt);
  }

  const quartzGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 24), new THREE.MeshPhysicalMaterial({
    color: 0xff8800,
    transparent: true,
    opacity: 0.85,
    roughness: 0.12,
    transmission: 0.5,
    emissive: 0xff5500,
    emissiveIntensity: 0.65
  }));
  quartzGlass.rotation.z = Math.PI / 2;
  quartzGlass.position.set(3.74, 2.6, 0);
  group.add(quartzGlass);
  group.glowPort = quartzGlass;

  // Heavy Industrial Vacuum Pumping Station Skid beside furnace
  const vacSkid = new THREE.Group();
  vacSkid.position.set(0, 0, -2.6);

  const skidBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 1.8), MAT.structuralSteel);
  skidBase.position.y = 0.08;
  vacSkid.add(skidBase);

  // Roots Blower Vacuum Booster
  const rootsBooster = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.2, 16), MAT.machineDark);
  rootsBooster.rotation.z = Math.PI / 2;
  rootsBooster.position.set(-0.8, 0.75, 0);
  vacSkid.add(rootsBooster);

  // Rotary Vane Mechanical Backing Pump
  const roughingPump = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.0, 16), MAT.machineAccentCyan);
  roughingPump.rotation.z = Math.PI / 2;
  roughingPump.position.set(0.8, 0.55, 0);
  vacSkid.add(roughingPump);

  // Stainless Steel Vacuum Manifold Pipe to Furnace
  const vacPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 12), MAT.steelChrome);
  vacPipe.position.set(-0.8, 1.7, 0.8);
  vacPipe.rotation.x = Math.PI / 4;
  vacSkid.add(vacPipe);

  group.add(vacSkid);

  // Water-Cooling Distribution Manifold (Blue = Inlet, Red = Outlet)
  const blueHose = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.8, 12), MAT.coolantBlue);
  blueHose.rotation.z = Math.PI / 2;
  blueHose.position.set(0, 4.2, 1.8);
  group.add(blueHose);

  const redHose = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4.8, 12), MAT.extinguisherRed);
  redHose.rotation.z = Math.PI / 2;
  redHose.position.set(0, 4.0, 1.8);
  group.add(redHose);

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

  // Stainless Steel Exhaust Stack with Damper Actuator
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.8), MAT.steelChrome);
  stack.position.set(0, 6.2, 0);
  group.add(stack);

  const damper = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.3), MAT.machineDark);
  damper.position.set(0, 5.6, 0.3);
  group.add(damper);

  // Eurotherm PID Digital Temperature Controller Panel with Canvas Texture
  const displayBox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.2), MAT.machineDark);
  displayBox.position.set(2.8, 3.8, 2.1);
  displayBox.rotation.y = -0.3;
  group.add(displayBox);

  const pidTex = createFurnacePIDTexture();
  const pidMat = new THREE.MeshBasicMaterial({ map: pidTex });
  const pidScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), pidMat);
  pidScreen.position.set(2.8, 3.8, 2.21);
  pidScreen.rotation.y = -0.3;
  group.add(pidScreen);

  // 3-Tier Andon Tower
  const andon = createAndonTower(1.0);
  andon.position.set(3.2, 5.2, -1.8);
  group.add(andon);

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

  // Foundation Hazard Safety Perimeter
  group.add(createHazardBorder(6.8, 6.8));

  // Vibration isolation sole plates under cell corners
  const fenceSize = 6.4;
  const halfF = fenceSize / 2;
  const fenceH = 2.8;

  // Workcell Perimeter 4-Sided Yellow Safety Fence with Polycarbonate & Wire Mesh Guarding
  // Corner and intermediate vertical stanchions with anchor foot plates
  const stanchionPositions = [
    [-halfF, -halfF], [0, -halfF], [halfF, -halfF],
    [-halfF, halfF], [0, halfF], [halfF, halfF],
    [-halfF, 0], [halfF, 0]
  ];

  stanchionPositions.forEach(([cx, cz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, fenceH, 0.12), MAT.hazardYellow);
    post.position.set(cx, fenceH / 2, cz);
    group.add(post);

    const anchorPlate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.24), MAT.structuralSteel);
    anchorPlate.position.set(cx, 0.02, cz);
    group.add(anchorPlate);

    // Anchor bolt heads
    [-0.08, 0.08].forEach(bx => {
      [-0.08, 0.08].forEach(bz => {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.06, 6), MAT.steelChrome);
        bolt.position.set(cx + bx, 0.05, cz + bz);
        group.add(bolt);
      });
    });
  });

  // Perimeter Rails (North, South, West framing channels)
  [0.15, 1.35, fenceH - 0.1].forEach(y => {
    // North rail
    const rN = new THREE.Mesh(new THREE.BoxGeometry(fenceSize, 0.06, 0.06), MAT.hazardYellow);
    rN.position.set(0, y, -halfF);
    group.add(rN);

    // South rail
    const rS = new THREE.Mesh(new THREE.BoxGeometry(fenceSize, 0.06, 0.06), MAT.hazardYellow);
    rS.position.set(0, y, halfF);
    group.add(rS);

    // West rail
    const rW = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, fenceSize), MAT.hazardYellow);
    rW.position.set(-halfF, y, 0);
    group.add(rW);
  });

  // Lower Section: Heavy Stainless Steel Wire Mesh Panels (North, South, West)
  const meshH = 1.15;
  const meshY = 0.75;
  const wireMeshN = new THREE.Mesh(new THREE.BoxGeometry(fenceSize - 0.2, meshH, 0.02), MAT.wireMesh);
  wireMeshN.position.set(0, meshY, -halfF);
  group.add(wireMeshN);

  const wireMeshS = new THREE.Mesh(new THREE.BoxGeometry(fenceSize - 0.2, meshH, 0.02), MAT.wireMesh);
  wireMeshS.position.set(0, meshY, halfF);
  group.add(wireMeshS);

  const wireMeshW = new THREE.Mesh(new THREE.BoxGeometry(0.02, meshH, fenceSize - 0.2), MAT.wireMesh);
  wireMeshW.position.set(-halfF, meshY, 0);
  group.add(wireMeshW);

  // Upper Section: Optical Clear Polycarbonate Impact Safety Guard Windows
  const glassH = fenceH - 1.5;
  const glassY = 2.05;
  const winNorth = new THREE.Mesh(new THREE.BoxGeometry(fenceSize - 0.2, glassH, 0.03), MAT.glassChamber);
  winNorth.position.set(0, glassY, -halfF);
  group.add(winNorth);

  const winSouth = new THREE.Mesh(new THREE.BoxGeometry(fenceSize - 0.2, glassH, 0.03), MAT.glassChamber);
  winSouth.position.set(0, glassY, halfF);
  group.add(winSouth);

  const winWest = new THREE.Mesh(new THREE.BoxGeometry(0.03, glassH, fenceSize - 0.2), MAT.glassChamber);
  winWest.position.set(-halfF, glassY, 0);
  group.add(winWest);

  // East Side (Operator Entry Face): Fixed panel + Interlocked Safety Swing Gate
  const winEastFixed = new THREE.Mesh(new THREE.BoxGeometry(0.03, fenceH - 0.35, 3.2), MAT.glassChamber);
  winEastFixed.position.set(halfF, fenceH / 2, -1.3);
  group.add(winEastFixed);

  // Interlocked Safety Access Gate Frame with magnetic safety interlock & lever handle
  const gateFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 1.7), MAT.hazardYellow);
  gateFrame.position.set(halfF, 1.25, 1.3);
  group.add(gateFrame);

  const gateMesh = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.1, 1.5), MAT.glassChamber);
  gateMesh.position.set(halfF, 1.25, 1.3);
  group.add(gateMesh);

  // Tubular Stainless Lever Handle
  const gateHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 12), MAT.steelChrome);
  gateHandle.position.set(halfF + 0.06, 1.2, 2.0);
  group.add(gateHandle);

  // Schmersal-style Safety Interlock Switch with Green OK LED
  const gateSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.12), MAT.eStopYellow);
  gateSwitch.position.set(halfF, 1.55, 2.12);
  group.add(gateSwitch);

  const switchLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), MAT.ledGreen);
  switchLed.position.set(halfF + 0.06, 1.6, 2.12);
  group.add(switchLed);

  // DANGER ROBOT CELL Placard on Gate
  const robotDecalTex = getEquipmentDecalTexture('danger', 'ROBOT CELL', 'STAY CLEAR');
  const robotDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.32), new THREE.MeshBasicMaterial({ map: robotDecalTex }));
  robotDecal.position.set(halfF + 0.03, 1.7, 1.3);
  robotDecal.rotation.y = Math.PI / 2;
  group.add(robotDecal);

  // Cast Iron Base Pedestal with Radial Anchor Studs & Grounding Strap
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.85, 1.4, 24), MAT.machineDark);
  pedestal.position.y = 0.7;
  pedestal.castShadow = true;
  group.add(pedestal);

  // Precision machined mounting flange ring
  const flangeRing = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.12, 24), MAT.structuralSteel);
  flangeRing.position.y = 1.38;
  group.add(flangeRing);

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 6), MAT.steelChrome);
    bolt.position.set(Math.cos(a) * 0.72, 1.44, Math.sin(a) * 0.72);
    group.add(bolt);
  }

  // Copper Grounding Strap
  const groundStrap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.02), MAT.brassFitting);
  groundStrap.position.set(0.72, 0.65, 0);
  group.add(groundStrap);

  // 6-DOF Industrial Robot Arm Hierarchy (FANUC M-710iC Inspired)
  const robotRoot = new THREE.Group();
  robotRoot.position.set(0, 1.44, 0);

  // Joint 1: Base Turntable & J1 Servo Motor
  const j1Turntable = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.62, 0.45, 24), MAT.robotYellow);
  j1Turntable.position.y = 0.22;
  robotRoot.add(j1Turntable);

  // Rotary slewing bearing ring
  const slewRing = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 12, 32), MAT.steelChrome);
  slewRing.rotation.x = Math.PI / 2;
  slewRing.position.y = 0.02;
  robotRoot.add(slewRing);

  // J1 Servo Motor Housing with cooling fins
  const j1Motor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 16), MAT.machineDark);
  j1Motor.position.set(-0.35, 0.25, 0.35);
  robotRoot.add(j1Motor);

  const j1Resolver = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16), MAT.eStopYellow);
  j1Resolver.position.set(-0.35, 0.5, 0.35);
  robotRoot.add(j1Resolver);

  // Joint 2: Shoulder Pivot & Lower Boom Casting
  const j2Pivot = new THREE.Group();
  j2Pivot.position.set(0, 0.45, 0);

  // Dual-flange cast shoulder fork
  [-0.26, 0.26].forEach(fz => {
    const shoulderFork = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.65, 0.14), MAT.robotYellow);
    shoulderFork.position.set(0, 0.25, fz);
    j2Pivot.add(shoulderFork);

    const shoulderCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.18, 16), MAT.machineDark);
    shoulderCap.rotation.x = Math.PI / 2;
    shoulderCap.position.set(0, 0.3, fz + (fz > 0 ? 0.06 : -0.06));
    j2Pivot.add(shoulderCap);
  });

  // Lower Boom Arm: Sculpted tapered arm casting
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.3, 0.42), MAT.robotYellow);
  boom.position.set(0, 1.25, 0);
  boom.rotation.z = 0.25;
  boom.castShadow = true;
  j2Pivot.add(boom);

  // Mechanical Counterbalance Strut Cylinder
  const balancerCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 16), MAT.machineDark);
  balancerCyl.position.set(-0.35, 0.85, 0);
  balancerCyl.rotation.z = 0.15;
  j2Pivot.add(balancerCyl);

  const balancerRod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 12), MAT.steelChrome);
  balancerRod.position.set(-0.3, 1.5, 0);
  balancerRod.rotation.z = 0.15;
  j2Pivot.add(balancerRod);

  // J2 Servo Motor with Ribs
  const j2Motor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.45, 16), MAT.machineDark);
  j2Motor.rotation.x = Math.PI / 2;
  j2Motor.position.set(-0.1, 0.4, -0.42);
  j2Pivot.add(j2Motor);

  // Joint 3: Elbow Pivot & Forearm Casting
  const j3Pivot = new THREE.Group();
  j3Pivot.position.set(0.42, 2.25, 0);

  // Elbow casting with bearing retainers
  const elbowHub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.48, 20), MAT.steelChrome);
  elbowHub.rotation.x = Math.PI / 2;
  j3Pivot.add(elbowHub);

  // J3 Servo Motor
  const j3Motor = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 16), MAT.machineDark);
  j3Motor.rotation.x = Math.PI / 2;
  j3Motor.position.set(-0.15, 0.1, 0.38);
  j3Pivot.add(j3Motor);

  // Forearm Structure
  const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.9, 0.34), MAT.robotYellow);
  forearm.position.set(0, 0.85, 0);
  forearm.rotation.z = -0.55;
  forearm.castShadow = true;
  j3Pivot.add(forearm);

  // Corrugated Cable Dress-Pack Conduit along Arm with Stainless Stand-Off Clamps
  const dressPack = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 16), MAT.cableCarrier);
  dressPack.position.set(0.22, 0.95, 0.24);
  dressPack.rotation.z = -0.55;
  j3Pivot.add(dressPack);

  [0.3, 0.9, 1.5].forEach(dy => {
    const clampMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.12), MAT.steelChrome);
    clampMesh.position.set(0.22 - (dy - 0.9) * 0.3, dy, 0.24);
    j3Pivot.add(clampMesh);
  });

  // Joint 4/5/6: Precision 3-Axis Spherical Wrist
  const wrist = new THREE.Group();
  wrist.position.set(-0.85, 1.78, 0);

  const wristCasting = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.32, 20), MAT.steelChrome);
  wristCasting.rotation.z = Math.PI / 2;
  wrist.add(wristCasting);

  // Pneumatic Compliance Floating Head for Constant-Force Edge Deburring
  const compHousing = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), MAT.aluminumExtrusion);
  compHousing.position.set(0, -0.22, 0);
  wrist.add(compHousing);

  // High-Speed 40,000 RPM Electric Deburring Spindle
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.55, 20), MAT.steelChrome);
  spindle.position.set(0, -0.55, 0);
  wrist.add(spindle);

  // Precision Collet Nut holding Carbide Rotary Burr
  const collet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 16), MAT.hazardDark);
  collet.position.set(0, -0.85, 0);
  wrist.add(collet);

  const burr = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.25, 12), MAT.steelChrome);
  burr.position.set(0, -1.0, 0);
  wrist.add(burr);

  // Dual Spindle Nose Work Lights (Angled LED spots on burr contact zone)
  [-0.14, 0.14].forEach(lx => {
    const ledSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 12), MAT.workLightLed);
    ledSpot.position.set(lx, -0.75, 0);
    ledSpot.rotation.z = (lx > 0 ? -0.3 : 0.3);
    wrist.add(ledSpot);
  });

  j3Pivot.add(wrist);
  j2Pivot.add(j3Pivot);
  robotRoot.add(j2Pivot);
  group.add(robotRoot);

  group.robotRoot = robotRoot;
  group.robotJ2 = j2Pivot;
  group.robotJ3 = j3Pivot;

  // Dual-Station Rotary Indexing Table & Workpiece Fixturing (Station A deburring, Station B finished)
  const indexTableGroup = new THREE.Group();
  indexTableGroup.position.set(1.9, 0, 0);

  // Diamond plate drip tray base
  const dripPlateTex = getDiamondPlateTexture();
  const dripPlateMat = new THREE.MeshStandardMaterial({ map: dripPlateTex, roughness: 0.3, metalness: 0.7 });
  const dripPan = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.45, 0.12, 24), dripPlateMat);
  dripPan.position.y = 0.06;
  indexTableGroup.add(dripPan);

  // Raised lip around drip pan
  const dripLip = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.04, 8, 32), MAT.structuralSteel);
  dripLip.rotation.x = Math.PI / 2;
  dripLip.position.y = 0.12;
  indexTableGroup.add(dripLip);

  // Heavy Indexing Turntable Body
  const indexBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.75, 24), MAT.structuralSteel);
  indexBase.position.y = 0.48;
  indexTableGroup.add(indexBase);

  // Precision Ground Stainless Steel Indexing Platter
  const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.18, 24), MAT.steelChrome);
  platter.position.y = 0.92;
  indexTableGroup.add(platter);

  // Station A Fixture (holding blade currently being deburred by the robot)
  const fixtureA = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.75), MAT.machineDark);
  fixtureA.position.set(-0.35, 1.12, 0);
  indexTableGroup.add(fixtureA);

  // Pneumatic toggle clamp arms
  [-0.22, 0.22].forEach(cz => {
    const clampArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.12), MAT.brassFitting);
    clampArm.position.set(-0.35, 1.32, cz);
    indexTableGroup.add(clampArm);
  });

  // Authentic Aerospace Turbine Blade clamped at Station A
  const bladeA = createAirfoilBlade();
  bladeA.position.set(-0.35, 1.25, 0);
  bladeA.rotation.y = 0.25;
  indexTableGroup.add(bladeA);

  // Station B Fixture (holding finished deburred blade waiting for operator unload)
  const fixtureB = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.75), MAT.machineDark);
  fixtureB.position.set(0.35, 1.12, 0);
  indexTableGroup.add(fixtureB);

  const bladeB = createAirfoilBlade();
  bladeB.position.set(0.35, 1.25, 0);
  bladeB.rotation.y = Math.PI + 0.25;
  indexTableGroup.add(bladeB);

  // Green QA inspection dot on finished Station B blade
  const qaDot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), MAT.ledGreen);
  qaDot.position.set(0.35, 2.3, 0.2);
  indexTableGroup.add(qaDot);

  group.add(indexTableGroup);

  // 4-Station Automatic End-Effector Tool Changing Rack (ATC)
  const toolRack = new THREE.Group();
  toolRack.position.set(1.9, 0, 2.1);

  const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.0, 1.2), MAT.structuralSteel);
  rackFrame.position.y = 0.5;
  toolRack.add(rackFrame);

  const rackPlate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 1.3), MAT.steelChrome);
  rackPlate.position.y = 1.02;
  toolRack.add(rackPlate);

  // 4 HSK-E32 Tool Holders (carbide burr, nylon cup brush, diamond mounted point, Scotch-Brite flap wheel)
  [-0.45, -0.15, 0.15, 0.45].forEach((rz, idx) => {
    // HSK taper shank
    const hsk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.14, 16), MAT.steelChrome);
    hsk.position.set(0, 1.12, rz);
    toolRack.add(hsk);

    // Tool head
    if (idx === 0) {
      // Cylindrical burr
      const toolHead = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 12), MAT.steelChrome);
      toolHead.position.set(0, 1.24, rz);
      toolRack.add(toolHead);
    } else if (idx === 1) {
      // Cup brush
      const brush = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.04, 0.12, 16), MAT.hazardDark);
      brush.position.set(0, 1.22, rz);
      toolRack.add(brush);
    } else if (idx === 2) {
      // Diamond ball point
      const diamond = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), MAT.machineAccentCyan);
      diamond.position.set(0, 1.22, rz);
      toolRack.add(diamond);
    } else {
      // Abrasive flap wheel
      const flap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16), MAT.woodPallet);
      flap.position.set(0, 1.21, rz);
      toolRack.add(flap);
    }
  });

  group.add(toolRack);

  // Yellow Handheld Robot Teach Pendant Docked in Holster on Exterior Fence
  const pendantCradle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.36), MAT.machineDark);
  pendantCradle.position.set(halfF, 1.6, -1.2);
  group.add(pendantCradle);

  const pendant = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.3), MAT.hazardYellow);
  pendant.position.set(halfF + 0.05, 1.6, -1.2);
  group.add(pendant);

  // Pendant Color LCD Screen
  const pendantScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.28), MAT.terminalScreen);
  pendantScreen.position.set(halfF + 0.085, 1.62, -1.2);
  pendantScreen.rotation.y = Math.PI / 2;
  group.add(pendantScreen);

  // Pendant Emergency Stop Button
  const pendantEstop = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 12), MAT.ledRed);
  pendantEstop.rotation.z = Math.PI / 2;
  pendantEstop.position.set(halfF + 0.085, 1.78, -1.28);
  group.add(pendantEstop);

  // Robot Controller Cabinet (FANUC R-30iB style)
  const ctrlCabinet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.9, 0.9), MAT.machineLight);
  ctrlCabinet.position.set(-2.8, 0.95, 3.4);
  ctrlCabinet.castShadow = true;
  group.add(ctrlCabinet);

  // Main Isolator Disconnect Switch with LOTO Padlock
  const ctrlIsolator = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16), MAT.eStopYellow);
  ctrlIsolator.rotation.x = Math.PI / 2;
  ctrlIsolator.position.set(-2.8, 1.45, 3.86);
  group.add(ctrlIsolator);

  // Fan intake louver grills on cabinet
  [-0.3, 0.3].forEach(lx => {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.02), MAT.machineDark);
    louver.position.set(-2.8 + lx, 0.5, 3.86);
    group.add(louver);
  });

  // High Voltage Warning Sign on Controller Cabinet
  const hvDecalTex = getEquipmentDecalTexture('danger', 'HIGH VOLTAGE', '480 VAC 3-PHASE');
  const hvDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshBasicMaterial({ map: hvDecalTex }));
  hvDecal.position.set(-2.8, 1.75, 3.86);
  group.add(hvDecal);

  // 3-Tier Andon Status Tower on Fence Corner Post
  const andon = createAndonTower(1.0);
  andon.position.set(-halfF, fenceH, -halfF);
  group.add(andon);

  // Status Halo Ring
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

  // Foundation Hazard Safety Perimeter
  group.add(createHazardBorder(6.4, 5.0));

  // Precision Grade 00 Black Granite Surface Plate (5.8m x 4.4m x 1.0m)
  const granite = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.0, 4.4), MAT.graniteBase);
  granite.position.y = 0.55;
  granite.castShadow = true;
  group.add(granite);

  // Polished Granite Chamfer Top Edges
  [-2.2, 2.2].forEach(fx => {
    const chamferX = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 4.3), MAT.steelChrome);
    chamferX.position.set(fx, 1.06, 0);
    group.add(chamferX);
  });

  // 6 Pneumatic Active Vibration-Isolation Air Spring Dampers with Pressure Dial Gauges
  [-2.4, 0, 2.4].forEach(fx => {
    [-1.8, 1.8].forEach(fz => {
      const damper = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.18, 16), MAT.hazardDark);
      damper.position.set(fx, 0.09, fz);
      group.add(damper);

      const airRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 16), MAT.steelChrome);
      airRing.rotation.x = Math.PI / 2;
      airRing.position.set(fx, 0.12, fz);
      group.add(airRing);

      // Pressure Dial Gauge on corner dampers
      if (Math.abs(fx) > 1.0) {
        const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), MAT.extinguisherBrass);
        gauge.position.set(fx + (fx > 0 ? 0.28 : -0.28), 0.14, fz);
        group.add(gauge);
      }
    });
  });

  // Carbon-Fiber Inverted-U Metrology Gantry Arch
  const colGeo = new THREE.BoxGeometry(0.65, 4.2, 0.85);
  [-2.2, 2.2].forEach(x => {
    const col = new THREE.Mesh(colGeo, MAT.machineDark);
    col.position.set(x, 2.7, 0);
    col.castShadow = true;
    group.add(col);

    // Linear guide rails along column vertical face
    const guideRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.8, 0.08), MAT.steelChrome);
    guideRail.position.set(x + (x > 0 ? -0.34 : 0.34), 2.7, 0);
    group.add(guideRail);
  });

  const archBeam = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.85, 0.95), MAT.machineDark);
  archBeam.position.set(0, 4.65, 0);
  archBeam.castShadow = true;
  group.add(archBeam);

  // Precision Horizontal Dual Guide Rails across the Arch
  [-0.2, 0.2].forEach(ry => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.06, 0.06), MAT.steelChrome);
    rail.position.set(0, 4.65 + ry, 0.49);
    group.add(rail);
  });

  // Dual Laser Displacement Sensor Profiler Heads (Keyence LJ-X8000 Series Inspired)
  [-1.1, 1.1].forEach(lx => {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.65), MAT.machineAccentCyan);
    head.position.set(lx, 4.0, 0);
    head.castShadow = true;
    group.add(head);

    // Heatsink cooling fins on sensor head
    [-0.15, 0, 0.15].forEach(fy => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.02, 0.6), MAT.machineDark);
      fin.position.set(lx, 4.0 + fy, 0);
      group.add(fin);
    });

    // Optical Laser Emitter Slit
    const laserEmitter = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.18, 16), MAT.steelChrome);
    laserEmitter.position.set(lx, 3.55, 0);
    group.add(laserEmitter);

    const emitterLens = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), MAT.laserCyan);
    emitterLens.position.set(lx, 3.45, 0);
    group.add(emitterLens);

    // Vernier Micrometer Fine-Pitch Adjuster Screw
    const microScrew = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 16), MAT.brassFitting);
    microScrew.rotation.z = Math.PI / 2;
    microScrew.position.set(lx + (lx > 0 ? 0.32 : -0.32), 4.0, 0);
    group.add(microScrew);
  });

  // Sweeping Vertical Planar Laser Sheet
  const laserPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.5), MAT.laserScannerPlane);
  laserPlane.position.set(0, 2.35, 0);
  laserPlane.rotation.x = 0;
  group.add(laserPlane);
  group.laserPlane = laserPlane;

  // Blue Projected Laser Scan Line on granite
  const laserLine = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.02, 0.04), MAT.laserCyan);
  laserLine.position.set(0, 1.06, 0);
  group.add(laserLine);

  // Precision 3-2-1 Kinematic Workpiece Staging Fixture
  const fixtureBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.8), MAT.structuralSteel);
  fixtureBase.position.set(0, 1.13, 0);
  group.add(fixtureBase);

  // 3 Spherical Carbide Kinematic Locators
  [[-0.45, -0.25], [-0.45, 0.25], [0.45, 0]].forEach(([kx, kz]) => {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), MAT.steelChrome);
    ball.position.set(kx, 1.22, kz);
    group.add(ball);
  });

  // Clamped Airfoil Turbine Blade Component being inspected
  const part = createAirfoilBlade();
  part.position.set(0, 1.25, 0);
  part.rotation.y = 0.4;
  group.add(part);

  // Velvet-Lined Wooden Box with Grade K Precision Steel Gauge Blocks
  const boxWood = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.45), MAT.woodPallet);
  boxWood.position.set(-1.8, 1.12, 1.4);
  group.add(boxWood);

  // Velvet interior lining
  const velvet = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.04, 0.39), MAT.hazardDark);
  velvet.position.set(-1.8, 1.18, 1.4);
  group.add(velvet);

  // Gauge blocks of varying lengths (10mm, 25mm, 50mm, 100mm)
  [-0.2, -0.07, 0.07, 0.2].forEach((gx, idx) => {
    const bH = 0.06 + idx * 0.03;
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.07, bH, 0.26), MAT.steelChrome);
    block.position.set(-1.8 + gx, 1.2 + bH / 2, 1.4);
    group.add(block);
  });

  // Ceramic Master Optical Calibration Sphere on Magnetic Base
  const calBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 16), MAT.structuralSteel);
  calBase.position.set(1.8, 1.1, 1.4);
  group.add(calBase);

  const calStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 12), MAT.steelChrome);
  calStem.position.set(1.8, 1.24, 1.4);
  group.add(calStem);

  const calSphere = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 24), MAT.bulkTankWhite);
  calSphere.position.set(1.8, 1.42, 1.4);
  group.add(calSphere);

  // High-Resolution Touchscreen Metrology HUD Terminal on Articulated Monitor Arm
  const armSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12), MAT.steelChrome);
  armSupport.position.set(2.4, 2.6, 0.5);
  group.add(armSupport);

  const armJoint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), MAT.machineDark);
  armJoint.position.set(2.4, 3.2, 0.5);
  group.add(armJoint);

  const screenBezel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.1), MAT.machineDark);
  screenBezel.position.set(2.2, 3.2, 0.6);
  screenBezel.rotation.y = -0.3;
  group.add(screenBezel);

  // Metrology HUD Texture showing 3D point cloud deviation colormap & Cpk 1.67 badge
  const hudTex = getMetrologyHUDTexture();
  const hudScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.82), new THREE.MeshBasicMaterial({ map: hudTex }));
  hudScreen.position.set(2.2, 3.2, 0.66);
  hudScreen.rotation.y = -0.3;
  group.add(hudScreen);

  // 3-Tier Andon Status Tower on Arch Column
  const andon = createAndonTower(1.0);
  andon.position.set(-2.2, 4.95, 0);
  group.add(andon);

  // Status Halo Ring
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

  // Foundation Hazard Safety Perimeter
  group.add(createHazardBorder(length + 1.2, width + 1.2));

  // Anti-Fatigue Ergonomic Workstation Floor Mat on Operator Side (Z > 0)
  const matGeo = new THREE.BoxGeometry(length, 0.03, 1.2);
  const fatigueMat = new THREE.Mesh(matGeo, MAT.rubberMat);
  fatigueMat.position.set(0, 0.02, width / 2 + 0.8);
  group.add(fatigueMat);

  // Hazard yellow bevel edge on operator fatigue mat
  const matBorder = new THREE.Mesh(new THREE.BoxGeometry(length, 0.04, 0.08), MAT.hazardYellow);
  matBorder.position.set(0, 0.025, width / 2 + 1.4);
  group.add(matBorder);

  // Main Conveyor Frame: Heavy Industrial Anodized Aluminum Extrusion with T-Slots
  const frame = new THREE.Mesh(new THREE.BoxGeometry(length, 0.65, width), MAT.aluminumExtrusion);
  frame.position.y = 1.35;
  frame.castShadow = true;
  group.add(frame);

  // Longitudinal T-Slot grooves along exterior sides
  [-width / 2 - 0.01, width / 2 + 0.01].forEach(fz => {
    [-0.15, 0.15].forEach(gy => {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(length - 0.2, 0.04, 0.02), MAT.machineDark);
      slot.position.set(0, 1.35 + gy, fz);
      group.add(slot);
    });
  });

  // Dual Anti-Static UHMW Polyurethane Conveyor Belts
  [-0.65, 0.65].forEach(bz => {
    const belt = new THREE.Mesh(new THREE.BoxGeometry(length - 0.2, 0.08, 0.9), MAT.conveyorBelt);
    belt.position.set(0, 1.72, bz);
    group.add(belt);
  });

  // Center Stainless Steel Divider / Cable Raceway
  const centerRaceway = new THREE.Mesh(new THREE.BoxGeometry(length - 0.2, 0.12, 0.25), MAT.steelChrome);
  centerRaceway.position.set(0, 1.74, 0);
  group.add(centerRaceway);

  // Stainless Steel Guide Fences along both sides with Delrin Low-Friction Wear Strips
  [-width / 2 + 0.15, width / 2 - 0.15].forEach(gz => {
    const fence = new THREE.Mesh(new THREE.BoxGeometry(length - 0.4, 0.2, 0.04), MAT.steelChrome);
    fence.position.set(0, 1.85, gz);
    group.add(fence);

    const wearStrip = new THREE.Mesh(new THREE.BoxGeometry(length - 0.4, 0.06, 0.02), MAT.hazardDark);
    wearStrip.position.set(0, 1.85, gz + (gz > 0 ? -0.025 : 0.025));
    group.add(wearStrip);
  });

  // Helical Bevel Gearmotor Drive Unit at Drive End (+X)
  const driveMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.1, 16), MAT.machineAccentCyan);
  driveMotor.rotation.z = Math.PI / 2;
  driveMotor.position.set(length / 2 + 0.6, 1.35, 0);
  group.add(driveMotor);

  const gearBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.85), MAT.machineDark);
  gearBox.position.set(length / 2, 1.35, 0);
  group.add(gearBox);

  // Motor Terminal Junction Box
  const juncBox = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.2), MAT.machineLight);
  juncBox.position.set(length / 2 + 0.6, 1.75, 0.25);
  group.add(juncBox);

  // Emergency Pull-Cord Safety Cables along entire length (Red vinyl coated with tension springs)
  const cordGeo = new THREE.CylinderGeometry(0.018, 0.018, length - 0.4);
  cordGeo.rotateZ(Math.PI / 2);
  [-width / 2 - 0.12, width / 2 + 0.12].forEach(ez => {
    const cord = new THREE.Mesh(cordGeo, MAT.ledRed);
    cord.position.set(0, 1.6, ez);
    group.add(cord);

    // E-stop pull switches at both ends
    [-length / 2 + 0.3, length / 2 - 0.3].forEach(ex => {
      const pSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.14), MAT.eStopYellow);
      pSwitch.position.set(ex, 1.6, ez);
      group.add(pSwitch);
    });
  });

  // Heavy Structural Steel Support Legs with Leveling Anchor Foot Plates
  const legGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.4, 16);
  for (let x = -9.0; x <= 9.0; x += 4.5) {
    [-1.15, 1.15].forEach(z => {
      const leg = new THREE.Mesh(legGeo, MAT.structuralSteel);
      leg.position.set(x, 0.7, z);
      leg.castShadow = true;
      group.add(leg);

      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12), MAT.steelChrome);
      foot.position.set(x, 0.025, z);
      group.add(foot);
    });
  }

  // Pneumatic Pallet Stop Gates & Photo-Eye Sensors along line
  [-6.75, -2.25, 2.25, 6.75].forEach(sx => {
    // Pneumatic lift-and-locate cylinder
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16), MAT.steelChrome);
    cyl.position.set(sx, 1.55, 0);
    group.add(cyl);

    const snubber = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.4), MAT.rubberMat);
    snubber.position.set(sx, 1.75, 0);
    group.add(snubber);

    // Retroreflective photoelectric sensor bracket with red emitter LED
    [-width / 2 + 0.08, width / 2 - 0.08].forEach(pz => {
      const sensorBracket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), MAT.aluminumExtrusion);
      sensorBracket.position.set(sx, 1.85, pz);
      group.add(sensorBracket);

      const sensorLed = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), MAT.ledRed);
      sensorLed.position.set(sx, 1.88, pz + (pz > 0 ? -0.035 : 0.035));
      group.add(sensorLed);
    });
  });

  // Automated Optical Inspection (AOI) / Laser QC Inspection Tunnel Arch at Midpoint (x = 0)
  const tunnelGroup = new THREE.Group();
  tunnelGroup.position.set(0, 1.7, 0);

  const tunnelArch = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.6, width + 0.6), MAT.machineDark);
  tunnelArch.position.y = 1.3;
  tunnelArch.castShadow = true;
  tunnelGroup.add(tunnelArch);

  // Bright white inspection tunnel interior chamber
  const tunnelChamber = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1.8, width - 0.2), MAT.floorEpoxy);
  tunnelChamber.position.y = 0.9;
  tunnelGroup.add(tunnelChamber);

  // Top Down Vision Camera Unit
  const aoiCamera = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), MAT.machineAccentCyan);
  aoiCamera.position.set(0, 2.1, 0);
  tunnelGroup.add(aoiCamera);

  const aoiLens = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 16), MAT.steelChrome);
  aoiLens.position.set(0, 1.8, 0);
  tunnelGroup.add(aoiLens);

  // Laser Sheet inside Tunnel
  const tunnelLaser = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 1.8), MAT.laserScannerPlane);
  tunnelLaser.position.set(0, 0.9, 0);
  tunnelLaser.rotation.y = Math.PI / 2;
  tunnelGroup.add(tunnelLaser);
  group.tunnelLaser = tunnelLaser;

  group.add(tunnelGroup);

  // Moving Pallets with Detailed Electronics (Avionics Flight Computers with Procedural PCB Canvas Textures)
  const pcbTex = getCircuitBoardTexture();
  const pcbMat = new THREE.MeshStandardMaterial({
    map: pcbTex,
    roughness: 0.35,
    metalness: 0.4
  });

  group.crates = [];
  for (let i = 0; i < 5; i++) {
    const palletGroup = new THREE.Group();
    palletGroup.position.set(-9.0 + i * 4.5, 2.0, 0);

    // ESD-Safe Composite Pallet Carrier Base with Metal Guide Bushings
    const palBase = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.22, 1.45), MAT.cargoPallet);
    palletGroup.add(palBase);

    // Pallet Location / Barcode Placard
    const palPlacardTex = getBarcodePlacardTexture(`PAL-AV-0${i + 1}`, 'FLIGHT COMPUTER TRAY');
    const palPlacard = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.18), new THREE.MeshBasicMaterial({ map: palPlacardTex }));
    palPlacard.position.set(0, 0, 0.73);
    palletGroup.add(palPlacard);

    // Corner Locator Bushings
    [-0.75, 0.75].forEach(bx => {
      [-0.65, 0.65].forEach(bz => {
        const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.24, 12), MAT.steelChrome);
        bush.position.set(bx, 0.02, bz);
        palletGroup.add(bush);
      });
    });

    // High-Resolution Procedural Green Soldermask Avionics PCB with Gold Traces & SoC
    const pcb = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.04, 1.15), pcbMat);
    pcb.position.y = 0.13;
    palletGroup.add(pcb);

    // 64-Pin Ceramic QFP Flight SoC Processor (Center)
    const soc = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.35), MAT.machineDark);
    soc.position.set(-0.25, 0.17, 0);
    palletGroup.add(soc);

    // Blue Anodized Aluminum Multi-Fin Heat Sink Tower
    const heatSinkTower = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.42), MAT.heatSinkBlue);
    heatSinkTower.position.set(0.32, 0.33, -0.2);
    palletGroup.add(heatSinkTower);

    // Individual Heatsink Fins
    [-0.15, -0.05, 0.05, 0.15].forEach(fy => {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.02, 0.44), MAT.heatSinkBlue);
      fin.position.set(0.32, 0.33 + fy, -0.2);
      palletGroup.add(fin);
    });

    // Gold Pin Connector Headers (Hirose avionics bus)
    const conn1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.75), MAT.brassFitting);
    conn1.position.set(0.55, 0.22, 0.15);
    palletGroup.add(conn1);

    const conn2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.18, 0.12), MAT.brassFitting);
    conn2.position.set(-0.25, 0.22, 0.45);
    palletGroup.add(conn2);

    // Surface-mount electrolytic capacitors
    [-0.35, -0.45].forEach(cx => {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 12), MAT.aluminumExtrusion);
      cap.position.set(cx, 0.19, -0.35);
      palletGroup.add(cap);
    });

    palletGroup.castShadow = true;
    group.add(palletGroup);
    group.crates.push(palletGroup);
  }

  // 3-Tier Andon Status Tower at End of Conveyor
  const andon = createAndonTower(1.2);
  andon.position.set(length / 2 - 0.5, 2.0, width / 2);
  group.add(andon);

  // Status Halo Ring
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

  // Sculpted Low-Profile AMR Chassis (MiR / OTTO 1500 Style)
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.62, 1.7), MAT.machineChassis);
  body.position.y = 0.46;
  body.castShadow = true;
  group.add(body);

  // Beveled Front & Rear Bumper Skirts in Hazard Striping
  [-0.88, 0.88].forEach(z => {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.16, 0.08), MAT.hazardYellow);
    skirt.position.set(0, 0.36, z);
    group.add(skirt);
  });

  // Front Bumper Wedge with Optical Safety Contact Bumper
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 1.55), MAT.machineDark);
  frontBumper.position.set(1.22, 0.4, 0);
  group.add(frontBumper);

  // 360-Degree Perimeter Safety LED Light Ribbon along chassis waist
  [-0.86, 0.86].forEach(z => {
    const ribbonSide = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 0.03), MAT.laserCyan);
    ribbonSide.position.set(0, 0.55, z);
    group.add(ribbonSide);
  });
  const ribbonFront = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 1.5), MAT.laserCyan);
  ribbonFront.position.set(1.16, 0.55, 0);
  group.add(ribbonFront);

  // Front Headlight Cluster
  const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 1.25), MAT.carHeadlight);
  headlight.position.set(1.33, 0.42, 0);
  group.add(headlight);

  // Forward Directional LED Spot Light
  const driveLight = new THREE.SpotLight(0x0284c7, 2.5, 14, Math.PI / 4, 0.4, 1.0);
  driveLight.position.set(1.3, 0.5, 0);
  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(5.0, 0, 0);
  group.add(driveLight);
  group.add(lightTarget);
  driveLight.target = lightTarget;
  group.driveLight = driveLight;

  // Diagonally Opposed Dual SICK MicroScan3 Safety LiDAR Scanners (Front-Right & Rear-Left for 360° Safety)
  const scannerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.16, 16);
  const frontScanner = new THREE.Mesh(scannerGeo, MAT.machineDark);
  frontScanner.position.set(1.08, 0.28, 0.78);
  group.add(frontScanner);

  const rearScanner = new THREE.Mesh(scannerGeo, MAT.machineDark);
  rearScanner.position.set(-1.08, 0.28, -0.78);
  group.add(rearScanner);

  // Dual Recessed Emergency Stop Pushbuttons with Yellow Shroud Rings
  [ [1.05, -0.78], [-1.05, 0.78] ].forEach(([ex, ez]) => {
    const shroud = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), MAT.eStopYellow);
    shroud.position.set(ex, 0.78, ez);
    group.add(shroud);

    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12), MAT.ledRed);
    btn.position.set(ex, 0.81, ez);
    group.add(btn);
  });

  // Top Mast with 3D Rotating LiDAR Puck (Velodyne VLP-16 Style)
  const lidarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 16), MAT.structuralSteel);
  lidarMast.position.set(0.65, 0.85, 0);
  group.add(lidarMast);

  const lidarPuck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.28, 24), MAT.steelChrome);
  lidarPuck.position.set(0.65, 1.05, 0);
  group.add(lidarPuck);
  group.lidarPuck = lidarPuck;

  // Tinted Optical Window on LiDAR Puck
  const puckWindow = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.12, 24), MAT.portalGlass);
  puckWindow.position.set(0.65, 1.05, 0);
  group.add(puckWindow);

  // LiDAR 3D Forward Scan Volume Cone
  const coneGeo = new THREE.ConeGeometry(2.4, 4.0, 16, 1, true);
  coneGeo.rotateX(Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const lidarCone = new THREE.Mesh(coneGeo, coneMat);
  lidarCone.position.set(2.5, 0.7, 0);
  group.add(lidarCone);
  group.lidarCone = lidarCone;

  // High-Visibility Xenon Flashing Amber Beacon
  const strobeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.15, 12), MAT.machineDark);
  strobeBase.position.set(-0.85, 0.85, 0);
  group.add(strobeBase);

  const strobe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), MAT.strobeAmber);
  strobe.position.set(-0.85, 1.02, 0);
  group.add(strobe);
  group.strobeBeacon = strobe;

  // Rear 7-Inch Interactive Digital Status Touchscreen Display
  const screenTex = getAMRScreenTexture(id);
  const screenPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.35), new THREE.MeshBasicMaterial({ map: screenTex }));
  screenPlane.position.set(-1.16, 0.58, 0);
  screenPlane.rotation.y = -Math.PI / 2;
  group.add(screenPlane);

  // Wheels: Differential Center Drive Wheels with Alloy Hubs & Polyurethane Tires + 4 Caster Wheels
  const tireGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 24);
  tireGeo.rotateX(Math.PI / 2);

  group.wheels = [];
  [[-0.65, 0.88], [0.65, 0.88], [-0.65, -0.88], [0.65, -0.88]].forEach(([x, z]) => {
    // Unified rotating wheel assembly mounted on Z-axle
    const wheelAssembly = new THREE.Group();
    wheelAssembly.position.set(x, 0.28, z);

    // Tread Rubber Tire
    const tire = new THREE.Mesh(tireGeo, MAT.tireRubber);
    wheelAssembly.add(tire);

    // Machined Aluminum Alloy Wheel Hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 16), MAT.wheelRim);
    hub.rotation.x = Math.PI / 2;
    wheelAssembly.add(hub);

    // Chrome Center Axle Stud
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 12), MAT.steelChrome);
    cap.rotation.x = Math.PI / 2;
    wheelAssembly.add(cap);

    group.add(wheelAssembly);
    group.wheels.push(wheelAssembly);
  });

  // Physical zero-slip wheel rotation coupled to travel distance (radius = 0.28m)
  group.rollWheels = function(dist) {
    const deltaRoll = dist / 0.28;
    this.wheels.forEach(w => {
      w.rotation.z -= deltaRoll;
    });
  };

  // Authentic Cargo Payload
  const cargoGroup = new THREE.Group();
  cargoGroup.position.set(-0.05, 0.85, 0);

  if (id === "AGV-01") {
    // AGV-01: Logistics AMR transporting Military/Aerospace Sealed Flight Hardware Case (Pelican-Hardigg style)
    const cargoPallet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 1.2), MAT.cargoPallet);
    cargoGroup.add(cargoPallet);

    // Sealed Transit Case in Tactical Olive/Charcoal
    const caseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.65, 0.95), MAT.machineDark);
    caseMesh.position.y = 0.42;
    caseMesh.castShadow = true;
    cargoGroup.add(caseMesh);

    // Aluminum Reinforcement Corner Edges & Ribs
    [-0.56, 0.56].forEach(cx => {
      const edgeX = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.62, 0.93), MAT.aluminumExtrusion);
      edgeX.position.set(cx, 0.42, 0);
      cargoGroup.add(edgeX);
    });

    // Stainless Butterfly Twist Latches
    [-0.3, 0.3].forEach(lx => {
      const latch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), MAT.steelChrome);
      latch.position.set(lx, 0.42, 0.49);
      cargoGroup.add(latch);
    });

    // Decal on Transit Case: CRITICAL FLIGHT HARDWARE
    const decalTex = getEquipmentDecalTexture('caution', 'FLIGHT HARDWARE', 'FRAGILE - CLASS 1');
    const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.32), new THREE.MeshBasicMaterial({ map: decalTex }));
    decal.position.set(0, 0.46, 0.49);
    cargoGroup.add(decal);
  } else {
    // AGV-02: Hot Billet & Titanium Forging Transfer AMR
    const cradle = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 1.3), MAT.structuralSteel);
    cargoGroup.add(cradle);

    // Insulated ceramic refractory staging blocks
    [-0.45, 0.45].forEach(bx => {
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 1.1), MAT.graniteBase);
      block.position.set(bx, 0.18, 0);
      cargoGroup.add(block);
    });

    // Sculpted Titanium Bulkhead Forging clamped on the AMR
    const forging = createBulkheadForging();
    forging.position.set(0, 0.35, 0);
    forging.scale.set(0.55, 0.55, 0.55);
    cargoGroup.add(forging);
  }

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

  // 2 Commercial Loading Dock Bay Doors on North Wall
  [-12, 12].forEach(dx => {
    const dockSeal = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.4, 0.4), MAT.buildingTrim);
    dockSeal.position.set(dx, 3.4, -24.2);
    upperWallsGroup.add(dockSeal);

    const rollDoor = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.8, 0.1), MAT.structuralSteel);
    rollDoor.position.set(dx, 3.2, -24.1);
    upperWallsGroup.add(rollDoor);

    [-2.2, 2.2].forEach(bx => {
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.3), MAT.dockBumper);
      bumper.position.set(dx + bx, 1.2, -24.4);
      buildingGroup.add(bumper);
    });

    [-2.6, 2.6].forEach(bx => {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 12), MAT.safetyBollard);
      bollard.position.set(dx + bx, 0.55, -24.8);
      buildingGroup.add(bollard);
    });

    const dockCanopy = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 1.4), MAT.buildingTrim);
    dockCanopy.position.set(dx, 5.7, -24.7);
    upperWallsGroup.add(dockCanopy);
  });

  // Outdoor Bulk Cryogenic Liquid Nitrogen Storage Vessel on East Exterior Grounds
  const cryoPad = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.2, 6.4), MAT.foundationPad);
  cryoPad.position.set(38, 0.1, -12);
  buildingGroup.add(cryoPad);

  const cryoTank = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 7.2, 24), MAT.bulkTankWhite);
  cryoTank.position.set(38, 3.8, -12);
  buildingGroup.add(cryoTank);

  const cryoDome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.bulkTankWhite);
  cryoDome.position.set(38, 7.4, -12);
  buildingGroup.add(cryoDome);

  [-1.8, 1.8].forEach(vx => {
    const vap = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.2, 0.6), MAT.aluminumExtrusion);
    vap.position.set(38 + vx, 2.2, -9.8);
    buildingGroup.add(vap);
  });

  [-2.8, 2.8].forEach(bx => {
    [-2.8, 2.8].forEach(bz => {
      const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 12), MAT.safetyBollard);
      bollard.position.set(38 + bx, 0.55, -12 + bz);
      buildingGroup.add(bollard);
    });
  });

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

  // Parked Employee & Executive Vehicles in Stalls (High-Gloss Clearcoat Finishes)
  const parkedCarsConfig = [
    { x: -36.1, z: 29, rot: 0, mat: MAT.carNavy },
    { x: -32.3, z: 29, rot: 0, mat: MAT.carWhite },
    { x: -28.5, z: 29, rot: 0, mat: MAT.carSilver },
    { x: -20.9, z: 29, rot: 0, mat: MAT.carRed },
    { x: -36.1, z: 39, rot: Math.PI, mat: MAT.carBlack },
    { x: -32.3, z: 39, rot: Math.PI, mat: MAT.carEmerald },
    { x: -24.7, z: 39, rot: Math.PI, mat: MAT.carOrange },
    { x: -17.1, z: 39, rot: Math.PI, mat: MAT.carYellow },
  ];

  parkedCarsConfig.forEach(cfg => {
    const car = createDetailedVehicleMesh(cfg.mat, false);
    car.position.set(cfg.x, -0.22, cfg.z);
    car.rotation.y = cfg.rot;
    townGroup.add(car);
  });

  // High-Fidelity EV Charging Pedestals with Glowing Status LEDs
  [-36.1, -32.3, -28.5, -24.7].forEach(evX => {
    const charger = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.4, 0.4), MAT.evPedestal);
    charger.position.set(evX, 0.45, 26.2);
    townGroup.add(charger);

    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.4), MAT.machineDark);
    screen.position.set(evX, 0.8, 26.41);
    townGroup.add(screen);

    const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.42), MAT.evGlow);
    led.position.set(evX, 0.45, 26.2);
    townGroup.add(led);

    // Yellow safety bollard guarding each EV charger
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 12), MAT.safetyBollard);
    bollard.position.set(evX, 0.2, 27.0);
    townGroup.add(bollard);
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
    { type: 'car', mat: MAT.carRed, speed: 0.14, startProg: 0.04 },
    { type: 'car', mat: MAT.carEmerald, speed: 0.12, startProg: 0.20 },
    { type: 'van', mat: MAT.carWhite, speed: 0.10, startProg: 0.38 },
    { type: 'car', mat: MAT.carNavy, speed: 0.13, startProg: 0.55 },
    { type: 'truck', mat: MAT.carSilver, speed: 0.09, startProg: 0.72 },
    { type: 'car', mat: MAT.carYellow, speed: 0.15, startProg: 0.88 },
  ];

  vehicleConfigs.forEach((vc, idx) => {
    const mesh = createDetailedVehicleMesh(vc.mat, true, vc.type);
    townGroup.add(mesh);
    trafficVehicles.push({
      mesh,
      speed: vc.speed,
      progress: vc.startProg,
      distance: vc.startProg * 357.699,
      waypoints: perimeterWaypoints,
      type: vc.type
    });
  });

  return { townGroup, trafficVehicles, animatedFans };
}

/**
 * Creates a procedural vehicle mesh (car, delivery van, or cargo truck) with realistic mechanical detailing,
 * physical clearcoat paint, zero-coplanar glass geometry, and active steering front wheel assemblies.
 */
function createDetailedVehicleMesh(colorMat, hasLights = true, type = 'car') {
  const vGroup = new THREE.Group();

  let bodyLength = 3.9;
  let bodyWidth = 1.7;
  let bodyHeight = 0.72;
  let cabinLength = 2.2;
  let cabinHeight = 0.65;
  let cabinX = -0.15;

  if (type === 'van') {
    bodyLength = 4.7;
    bodyWidth = 1.8;
    bodyHeight = 1.25;
    cabinLength = 3.5;
    cabinHeight = 0.75;
    cabinX = 0.2;
  } else if (type === 'truck') {
    bodyLength = 5.8;
    bodyWidth = 2.0;
    bodyHeight = 1.45;
    cabinLength = 1.75;
    cabinHeight = 1.15;
    cabinX = 1.55;
  }

  // 1. Lower Chassis Frame & Underbody (aerodynamic floor)
  const underbody = new THREE.Mesh(new THREE.BoxGeometry(bodyLength * 0.94, 0.16, bodyWidth * 0.86), MAT.machineDark);
  underbody.position.y = 0.22;
  vGroup.add(underbody);

  // 2. Sculpted Outer Body Shell (High-Gloss Automotive Clearcoat)
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(bodyLength, bodyHeight, bodyWidth), colorMat);
  chassis.position.y = bodyHeight / 2 + 0.22;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  vGroup.add(chassis);

  // Front & Rear Aerodynamic Bumper Trim Strips (eliminates flat box look)
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, bodyHeight * 0.45, bodyWidth * 0.96), MAT.machineDark);
  frontBumper.position.set(bodyLength / 2 + 0.05, 0.35, 0);
  vGroup.add(frontBumper);

  const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(0.12, bodyHeight * 0.40, bodyWidth * 0.94), MAT.carbonFiber);
  rearDiffuser.position.set(-bodyLength / 2 - 0.05, 0.34, 0);
  vGroup.add(rearDiffuser);

  // 3. Cabin / Greenhouse Structure (Engineered with non-coplanar clearance)
  const cabinBaseY = bodyHeight + 0.22;
  const cabinMidY = cabinBaseY + cabinHeight / 2;

  // Dark Interior Cavity (simulates tinted automotive interior depth)
  const cabinInterior = new THREE.Mesh(
    new THREE.BoxGeometry(cabinLength * 0.90, cabinHeight * 0.92, bodyWidth * 0.84),
    MAT.machineDark
  );
  cabinInterior.position.set(cabinX, cabinMidY, 0);
  vGroup.add(cabinInterior);

  // Structural Roof Cap / Panoramic Panel
  const roofMat = (type === 'van') ? colorMat : (type === 'truck' ? MAT.carWhite : MAT.carBlack);
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(cabinLength * 0.92, 0.06, bodyWidth * 0.88),
    roofMat
  );
  roof.position.set(cabinX, cabinBaseY + cabinHeight - 0.03, 0);
  roof.castShadow = true;
  vGroup.add(roof);

  // Aerodynamically Raked Windshield (angled forward, distinct non-overlapping plane)
  const wsLength = cabinHeight * 1.15;
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, wsLength, bodyWidth * 0.82),
    MAT.carWindow
  );
  windshield.rotation.z = -0.38;
  windshield.position.set(cabinX + cabinLength / 2 * 0.88, cabinMidY, 0);
  vGroup.add(windshield);

  // Fastback Rear Window
  const rwLength = cabinHeight * 1.08;
  const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, rwLength, bodyWidth * 0.82),
    MAT.carWindow
  );
  rearWindow.rotation.z = 0.32;
  rearWindow.position.set(cabinX - cabinLength / 2 * 0.88, cabinMidY, 0);
  vGroup.add(rearWindow);

  // Flush Inset Side Windows (offset 0.015m outside interior cavity to eliminate z-fighting)
  const sideWinWidth = bodyWidth * 0.44;
  [-sideWinWidth, sideWinWidth].forEach(sz => {
    const sideGlass = new THREE.Mesh(
      new THREE.BoxGeometry(cabinLength * 0.80, cabinHeight * 0.78, 0.02),
      MAT.carWindow
    );
    sideGlass.position.set(cabinX, cabinMidY, sz);
    vGroup.add(sideGlass);

    // Slim Vertical B-Pillar Divider
    const bPillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, cabinHeight * 0.82, 0.025),
      colorMat
    );
    bPillar.position.set(cabinX, cabinMidY, sz * 1.01);
    vGroup.add(bPillar);
  });

  // 4. Type-Specific Details
  if (type === 'car') {
    // Front Radiator Grille
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, bodyWidth * 0.7), MAT.machineDark);
    grille.position.set(bodyLength / 2 + 0.02, 0.45, 0);
    vGroup.add(grille);

    // Side Mirrors
    [-bodyWidth / 2 - 0.1, bodyWidth / 2 + 0.1].forEach(mz => {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.15), MAT.machineDark);
      mirror.position.set(0.6, bodyHeight + 0.35, mz);
      vGroup.add(mirror);

      const mirrorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.12), MAT.steelChrome);
      mirrorGlass.position.set(0.55, bodyHeight + 0.35, mz);
      vGroup.add(mirrorGlass);
    });

    // Rear Dual Exhaust Pipes
    [-0.45, 0.45].forEach(ez => {
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 12), MAT.steelChrome);
      exhaust.rotation.z = Math.PI / 2;
      exhaust.position.set(-bodyLength / 2 - 0.05, 0.28, ez);
      vGroup.add(exhaust);
    });
  } else if (type === 'van') {
    // Rear split cargo doors seam & latch
    const doorSeam = new THREE.Mesh(new THREE.BoxGeometry(0.02, bodyHeight + cabinHeight - 0.2, 0.04), MAT.machineDark);
    doorSeam.position.set(-bodyLength / 2 - 0.01, (bodyHeight + cabinHeight) / 2 + 0.2, 0);
    vGroup.add(doorSeam);

    const doorLatch = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.08), MAT.steelChrome);
    doorLatch.position.set(-bodyLength / 2 - 0.02, 0.9, 0.12);
    vGroup.add(doorLatch);

    // Roof A/C Ventilation Unit
    const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.6), MAT.buildingTrim);
    acUnit.position.set(-0.6, bodyHeight + cabinHeight + 0.3, 0);
    vGroup.add(acUnit);
  } else if (type === 'truck') {
    // Heavy Freight Box Container with Corrugated Ribs
    const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, bodyWidth * 1.05), MAT.machineLight);
    cargoBox.position.set(-0.85, 1.45, 0);
    cargoBox.castShadow = true;
    vGroup.add(cargoBox);

    // Horizontal corrugated ribs along cargo box
    [-0.5, 0, 0.5].forEach(ry => {
      [-bodyWidth * 0.53, bodyWidth * 0.53].forEach(rz => {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.04, 0.02), MAT.structuralSteel);
        rib.position.set(-0.85, 1.45 + ry, rz);
        vGroup.add(rib);
      });
    });

    // Twin Vertical Chrome Exhaust Stacks
    [-bodyWidth * 0.45, bodyWidth * 0.45].forEach(sz => {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 16), MAT.steelChrome);
      stack.position.set(0.65, 1.8, sz);
      vGroup.add(stack);
    });

    // Cylindrical Aluminum Diesel Fuel Tanks under Chassis
    [-bodyWidth * 0.48, bodyWidth * 0.48].forEach(tz => {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.4, 16), MAT.aluminumExtrusion);
      tank.rotation.z = Math.PI / 2;
      tank.position.set(-0.8, 0.38, tz);
      vGroup.add(tank);
    });
  }

  // 5. Rotating Wheels with Active Front Steering Pivots & Brake Assemblies
  const tireGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 24);
  tireGeo.rotateX(Math.PI / 2); // Transverse axle oriented along Z-axis

  vGroup.wheels = [];
  vGroup.frontSteerPivots = [];

  const wheelPositions = [
    { x: bodyLength * 0.33, z: bodyWidth * 0.52, isFront: true },   // Front Left
    { x: bodyLength * 0.33, z: -bodyWidth * 0.52, isFront: true },  // Front Right
    { x: -bodyLength * 0.33, z: bodyWidth * 0.52, isFront: false }, // Rear Left
    { x: -bodyLength * 0.33, z: -bodyWidth * 0.52, isFront: false },// Rear Right
  ];

  wheelPositions.forEach(wp => {
    // Wheel assembly group that rotates smoothly around transverse Z-axis
    const wheelAssembly = new THREE.Group();

    // Tread Rubber Tire
    const tire = new THREE.Mesh(tireGeo, MAT.tireRubber);
    wheelAssembly.add(tire);

    // Multi-Spoke Machined Alloy Wheel Rim
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.23, 18), MAT.wheelRim);
    rim.rotation.x = Math.PI / 2;
    wheelAssembly.add(rim);

    // Chrome Center Hub Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.24, 12), MAT.steelChrome);
    cap.rotation.x = Math.PI / 2;
    wheelAssembly.add(cap);

    if (wp.isFront) {
      // Front active steering pivot group (rotates around Y-axis)
      const steerPivot = new THREE.Group();
      steerPivot.position.set(wp.x, 0.28, wp.z);

      // Ventilated Brake Disc Rotor (stationary inside wheel hub)
      const brakeRotor = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.02, 16), MAT.steelChrome);
      brakeRotor.rotation.x = Math.PI / 2;
      brakeRotor.position.set(0, 0, wp.z > 0 ? -0.06 : 0.06);
      steerPivot.add(brakeRotor);

      // Red Brembo High-Performance Brake Caliper
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.05), MAT.carRed);
      caliper.position.set(-0.11, 0.08, wp.z > 0 ? -0.06 : 0.06);
      steerPivot.add(caliper);

      steerPivot.add(wheelAssembly);
      vGroup.add(steerPivot);
      vGroup.frontSteerPivots.push(steerPivot);
    } else {
      // Rear fixed axle mount
      wheelAssembly.position.set(wp.x, 0.28, wp.z);

      // Rear Brake Rotor & Caliper
      const brakeRotor = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.02, 16), MAT.steelChrome);
      brakeRotor.rotation.x = Math.PI / 2;
      brakeRotor.position.set(wp.x, 0.28, wp.z + (wp.z > 0 ? -0.06 : 0.06));
      vGroup.add(brakeRotor);

      vGroup.add(wheelAssembly);
    }

    vGroup.wheels.push(wheelAssembly);
  });

  // Physically Coupled Zero-Slip Wheel Rolling & Active Steering Helper
  vGroup.rollWheels = function(distMoved, steerAngle = 0) {
    const dTheta = distMoved / 0.28; // delta Theta = ground distance / tire radius
    this.wheels.forEach(w => {
      w.rotation.z -= dTheta; // rolls forward around transverse Z-axis
    });
    if (this.frontSteerPivots) {
      this.frontSteerPivots.forEach(pivot => {
        pivot.rotation.y = steerAngle; // turns wheels into corners
      });
    }
  };

  // 6. High-Visibility Headlights, Taillights & Signals
  if (hasLights) {
    // Front LED Headlights (pointing +X forward)
    [-0.55, 0.55].forEach(hz => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.28), MAT.carHeadlight);
      hl.position.set(bodyLength / 2 + 0.02, 0.46, hz);
      vGroup.add(hl);

      // Amber turn signal strip
      const turnSignal = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.28), MAT.strobeAmber);
      turnSignal.position.set(bodyLength / 2 + 0.02, 0.36, hz);
      vGroup.add(turnSignal);
    });

    // Rear LED Taillights (pointing -X backward)
    [-0.55, 0.55].forEach(tz => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.28), MAT.carTaillight);
      tl.position.set(-bodyLength / 2 - 0.02, 0.46, tz);
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

  // Flanged Base Anchor
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.12, 12), MAT.structuralSteel);
  base.position.y = 0.06;
  lamp.add(base);

  // Vertical Tubular Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.5, 16), MAT.streetlampPole);
  pole.position.y = 2.25;
  lamp.add(pole);

  // Angled Cantilever Arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), MAT.streetlampPole);
  arm.position.set(0.5, 4.5, 0);
  arm.rotation.z = -0.15;
  lamp.add(arm);

  // Luminaire LED Fixture Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.26), MAT.streetlampGlow);
  head.position.set(1.0, 4.4, 0);
  lamp.add(head);

  return lamp;
}

/**
 * Creates procedural architectural landscaped street tree with sculpted woody trunk and organic canopy
 */
function createStreetTree() {
  const tree = new THREE.Group();

  // Root Flare Base
  const rootBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.38, 0.3, 12), MAT.treeTrunk);
  rootBase.position.y = 0.15;
  tree.add(rootBase);

  // Sculpted Woody Trunk with Slight Lean
  const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.8, 12), MAT.treeTrunk);
  trunk1.position.y = 1.05;
  tree.add(trunk1);

  // Upper Branch Split
  const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.4, 10), MAT.treeTrunk);
  trunk2.position.set(0.1, 2.2, 0);
  trunk2.rotation.z = -0.15;
  tree.add(trunk2);

  // Multi-Tiered Clustered Organic Foliage Volumes
  const foliageTiers = [
    { x: 0.0, y: 2.9, z: 0.0, r: 1.45 },
    { x: -0.35, y: 3.6, z: 0.25, r: 1.15 },
    { x: 0.4, y: 3.7, z: -0.2, r: 1.05 },
    { x: 0.1, y: 4.4, z: 0.05, r: 0.85 },
  ];

  foliageTiers.forEach(tier => {
    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(tier.r, 1), MAT.treeFoliage);
    canopy.position.set(tier.x, tier.y, tier.z);
    canopy.castShadow = true;
    tree.add(canopy);
  });

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
 * Updates traffic vehicle positions along closed-loop road perimeter with smooth 6.0m corner fillet arcs,
 * active front steering angle calculations, and physically coupled zero-slip wheel rotation.
 */
export function updateTrafficVehicles(trafficFleet, delta = 0.016) {
  if (!trafficFleet || !Array.isArray(trafficFleet)) return;

  // Closed loop geometry with rounded 6.0m radius fillet corners:
  // - East straight:  length 60m  (46.0,  30.0) -> (46.0, -30.0)   dir: -Z
  // - NE fillet turn: arc 9.425m  center: (40.0, -30.0), R=6.0
  // - North straight: length 80m  (40.0, -36.0) -> (-40.0, -36.0)  dir: -X
  // - NW fillet turn: arc 9.425m  center: (-40.0, -30.0), R=6.0
  // - West straight:  length 60m  (-46.0, -30.0) -> (-46.0, 30.0)  dir: +Z
  // - SW fillet turn: arc 9.425m  center: (-40.0, 30.0), R=6.0
  // - South straight: length 80m  (-40.0, 36.0) -> (40.0, 36.0)    dir: +X
  // - SE fillet turn: arc 9.425m  center: (40.0, 30.0), R=6.0
  const arcLen = 6.0 * (Math.PI / 2); // 9.424778m
  const perimeter = 60.0 + arcLen + 80.0 + arcLen + 60.0 + arcLen + 80.0 + arcLen; // 317.6991m

  trafficFleet.forEach(v => {
    // Ground distance moved this physics step (scaled to realistic 14-22 km/h campus traffic)
    const distMoved = (v.speed || 0.12) * 55.0 * delta;

    if (v.distance === undefined) {
      v.distance = (v.progress !== undefined ? v.progress : 0) * perimeter;
    }
    v.distance = (v.distance + distMoved) % perimeter;
    v.progress = v.distance / perimeter;

    const d = v.distance;
    let x = 0, z = 0, heading = 0, steerAngle = 0;

    if (d < 60.0) {
      // 1. East Road heading North (-Z)
      const u = d;
      x = 46.0;
      z = 30.0 - u;
      heading = -Math.PI / 2;
      steerAngle = 0;
    } else if (d < 60.0 + arcLen) {
      // 2. Corner 1 (NE Fillet Turn: -Z to -X)
      const phi = (d - 60.0) / 6.0;
      x = 40.0 + 6.0 * Math.cos(phi);
      z = -30.0 - 6.0 * Math.sin(phi);
      heading = -Math.PI / 2 - phi;
      steerAngle = 0.36 * Math.sin(phi * 2.0); // smooth turn-in, apex hold, and exit straighten
    } else if (d < 60.0 + arcLen + 80.0) {
      // 3. North Road heading West (-X)
      const u = d - (60.0 + arcLen);
      x = 40.0 - u;
      z = -36.0;
      heading = Math.PI;
      steerAngle = 0;
    } else if (d < 60.0 + arcLen + 80.0 + arcLen) {
      // 4. Corner 2 (NW Fillet Turn: -X to +Z)
      const phi = (d - (60.0 + arcLen + 80.0)) / 6.0;
      x = -40.0 - 6.0 * Math.sin(phi);
      z = -30.0 - 6.0 * Math.cos(phi);
      heading = -Math.PI - phi;
      steerAngle = 0.36 * Math.sin(phi * 2.0);
    } else if (d < 60.0 + 2 * arcLen + 80.0 + 60.0) {
      // 5. West Road heading South (+Z)
      const u = d - (60.0 + 2 * arcLen + 80.0);
      x = -46.0;
      z = -30.0 + u;
      heading = Math.PI / 2;
      steerAngle = 0;
    } else if (d < 60.0 + 3 * arcLen + 140.0) {
      // 6. Corner 3 (SW Fillet Turn: +Z to +X)
      const phi = (d - (60.0 + 2 * arcLen + 140.0)) / 6.0;
      x = -40.0 - 6.0 * Math.cos(phi);
      z = 30.0 + 6.0 * Math.sin(phi);
      heading = Math.PI / 2 - phi;
      steerAngle = 0.36 * Math.sin(phi * 2.0);
    } else if (d < 60.0 + 3 * arcLen + 220.0) {
      // 7. South Road heading East (+X)
      const u = d - (60.0 + 3 * arcLen + 140.0);
      x = -40.0 + u;
      z = 36.0;
      heading = 0;
      steerAngle = 0;
    } else {
      // 8. Corner 4 (SE Fillet Turn: +X to -Z)
      const phi = (d - (60.0 + 3 * arcLen + 220.0)) / 6.0;
      x = 40.0 + 6.0 * Math.sin(phi);
      z = 30.0 + 6.0 * Math.cos(phi);
      heading = -phi;
      steerAngle = 0.36 * Math.sin(phi * 2.0);
    }

    v.mesh.position.set(x, -0.22, z);
    v.mesh.rotation.y = heading;

    // Physically coupled zero-slip wheel rolling (around transverse Z-axle) & active steering
    if (typeof v.mesh.rollWheels === 'function') {
      v.mesh.rollWheels(distMoved, steerAngle);
    } else if (v.mesh.wheels) {
      v.mesh.wheels.forEach(w => {
        w.rotation.z -= distMoved / 0.28;
      });
    }
  });
}
