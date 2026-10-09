/**
 * Procedural Industrial 3D Machinery Models (Titan Aerospace Precision Fab)
 * =========================================================================
 * Full Darkvex RTS Aerospace Complex (Strategy-Game Aesthetic):
 * - Reflective Dark Epoxy Floor with Rectangular Navigation Corridor
 * - Perimeter High-Bay Pallet Storage Racks (ASRS) with Barcodes
 * - Dynamically Traversable Overhead Yellow Gantry Crane (Dual Runway)
 * - CNC-01: DMG MORI Style Enclosed 5-Axis Turbine Mill (Tool Carousel, Chip Auger, Coolant Mist)
 * - PRESS-01: 1000-Ton Forging Press (Accumulators, Reservoir Tank, Safety Light Curtains, Shockwave)
 * - CONV-01: Dual-Rail Conveyor with Emergency E-Stop & Enclosed Laser QC Tunnel (Digital HUD)
 * - AGV-01: Armored AMR Rover with 3D LiDAR Cone, Dynamic Driving Headlights & Cargo
 */

// Materials Palette
const MAT = {
  // Factory Architecture
  floorEpoxy: new THREE.MeshStandardMaterial({ color: 0x090d15, roughness: 0.35, metalness: 0.35 }),
  floorRim: new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.85, metalness: 0.1 }),
  foundationPad: new THREE.MeshStandardMaterial({ color: 0x121822, roughness: 0.5, metalness: 0.3 }),
  hazardYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.2 }),
  hazardDark: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 }),
  structuralSteel: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.85 }),
  craneYellow: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35, metalness: 0.35 }),
  safetyRail: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.5 }),

  // High-Bay Warehouse Racking (ASRS)
  rackBlue: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4, metalness: 0.6 }),
  rackOrange: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35, metalness: 0.4 }),
  woodPallet: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85, metalness: 0.05 }),

  // Machinery Chassis & Enclosures
  machineChassis: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.65 }),
  machineDark: new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.45, metalness: 0.6 }),
  machineAccentCyan: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.85 }),
  pressBody: new THREE.MeshStandardMaterial({ color: 0x1e2638, roughness: 0.45, metalness: 0.55 }),
  pressSafetyOrange: new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.3, metalness: 0.6 }),
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
  conveyorBelt: new THREE.MeshStandardMaterial({ color: 0x080c14, roughness: 0.85, metalness: 0.1 }),

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
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.65,
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
    opacity: 0.35,
    wireframe: true,
    blending: THREE.AdditiveBlending,
  }),
  terminalScreen: new THREE.MeshBasicMaterial({ color: 0x10b981 }),
  strobeAmber: new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
  ledGreen: new THREE.MeshBasicMaterial({ color: 0x10b981 }),
  ledRed: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  trackCyan: new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  }),
};

/**
 * 1. FACTORY FLOOR & ENVIRONMENT (High-Bay Racks, Dynamic Gantry, Corridor)
 */
export function createFactoryFloor(scene) {
  const group = new THREE.Group();

  // Main ground slab (Dark reflective epoxy)
  const floorGeo = new THREE.BoxGeometry(48, 0.8, 38);
  const floorMesh = new THREE.Mesh(floorGeo, MAT.floorEpoxy);
  floorMesh.position.y = -0.4;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Outer border rim
  const rimGeo = new THREE.BoxGeometry(49, 0.4, 39);
  const rimMesh = new THREE.Mesh(rimGeo, MAT.floorRim);
  rimMesh.position.y = -0.7;
  group.add(rimMesh);

  // Subtle tactical floor grid helper
  const grid = new THREE.GridHelper(44, 44, 0x00e5ff, 0x141f30);
  grid.position.y = 0.01;
  group.add(grid);

  // ZONED MACHINE FOUNDATION PADS WITH HAZARD STRIPING
  const padsConfig = [
    { x: -8, z: -4, w: 9.6, d: 8.6, tag: "BAY-01 • CNC MILL" },
    { x: 8, z: -4, w: 9.6, d: 8.6, tag: "BAY-02 • 1000T FORGE" },
    { x: 0, z: 6, w: 25.0, d: 6.0, tag: "BAY-03 • ASSEMBLY & QC" },
  ];

  padsConfig.forEach(pad => {
    // Concrete raised pad
    const padGeo = new THREE.BoxGeometry(pad.w, 0.15, pad.d);
    const padMesh = new THREE.Mesh(padGeo, MAT.foundationPad);
    padMesh.position.set(pad.x, 0.075, pad.z);
    padMesh.receiveShadow = true;
    group.add(padMesh);

    // Hazard yellow/black chevron border strip
    const borderGeo = new THREE.BoxGeometry(pad.w + 0.35, 0.05, pad.d + 0.35);
    const borderMesh = new THREE.Mesh(borderGeo, MAT.hazardYellow);
    borderMesh.position.set(pad.x, 0.025, pad.z);
    group.add(borderMesh);
  });

  // STRUCTURAL STEEL I-BEAMS & PERIMETER COLUMNS
  const colGeo = new THREE.BoxGeometry(0.9, 15, 0.9);
  const columnPositions = [
    [-22, 7.5, -16],
    [22, 7.5, -16],
    [-22, 7.5, 16],
    [22, 7.5, 16],
    [-22, 7.5, 0],
    [22, 7.5, 0],
    [0, 7.5, -16],
  ];

  columnPositions.forEach(([cx, cy, cz]) => {
    const col = new THREE.Mesh(colGeo, MAT.structuralSteel);
    col.position.set(cx, cy, cz);
    col.castShadow = true;
    group.add(col);

    // Foot mounting bracket
    const footGeo = new THREE.BoxGeometry(1.5, 0.3, 1.5);
    const foot = new THREE.Mesh(footGeo, MAT.structuralSteel);
    foot.position.set(cx, 0.15, cz);
    group.add(foot);
  });

  // HIGH-BAY WAREHOUSE PALLET STORAGE RACKS (ASRS) ALONG REAR WALL
  createWarehouseRack(group, -15, -14); // Left Storage Rack
  createWarehouseRack(group, 15, -14);  // Right Storage Rack

  // RECTANGULAR AMR NAVIGATION CORRIDOR (Matching Waypoints: -14,-10 -> 14,-10 -> 14,11 -> -14,11)
  createCorridorPath(group);

  // OVERHEAD HEAVY INDUSTRIAL GANTRY CRANE (Dual Runway with Traveling Bridge)
  const gantryGroup = createTraversingGantryCrane(group);
  group.gantryCrane = gantryGroup;

  scene.add(group);
  return group;
}

/**
 * Creates multi-tier high-bay pallet racking stocked with aerospace parts
 */
function createWarehouseRack(parentGroup, posX, posZ) {
  const rackGroup = new THREE.Group();
  rackGroup.position.set(posX, 0, posZ);

  const rackWidth = 8.4;
  const rackDepth = 2.4;
  const rackHeight = 8.5;

  // 4 Upright Steel Channels
  const postGeo = new THREE.BoxGeometry(0.2, rackHeight, 0.2);
  [-rackWidth / 2, rackWidth / 2].forEach(x => {
    [-rackDepth / 2, rackDepth / 2].forEach(z => {
      const post = new THREE.Mesh(postGeo, MAT.rackBlue);
      post.position.set(x, rackHeight / 2, z);
      post.castShadow = true;
      rackGroup.add(post);
    });
  });

  // 3 Shelf Tiers
  const tierY = [1.4, 4.0, 6.6];
  tierY.forEach(y => {
    // Front and Rear Orange Load Beams
    const beamGeo = new THREE.BoxGeometry(rackWidth, 0.25, 0.12);
    [-rackDepth / 2, rackDepth / 2].forEach(z => {
      const beam = new THREE.Mesh(beamGeo, MAT.rackOrange);
      beam.position.set(0, y, z);
      rackGroup.add(beam);
    });

    // Wire Mesh / Pallet Decking
    const deckGeo = new THREE.BoxGeometry(rackWidth - 0.2, 0.08, rackDepth - 0.2);
    const deck = new THREE.Mesh(deckGeo, MAT.aluminumExtrusion);
    deck.position.set(0, y - 0.05, 0);
    rackGroup.add(deck);

    // Stored Pallets with Aerospace Crates
    [-2.2, 2.2].forEach(px => {
      const palGroup = new THREE.Group();
      palGroup.position.set(px, y + 0.1, 0);

      const palletGeo = new THREE.BoxGeometry(1.8, 0.18, 1.4);
      const pallet = new THREE.Mesh(palletGeo, MAT.woodPallet);
      palGroup.add(pallet);

      const crateGeo = new THREE.BoxGeometry(1.4, 0.8, 1.1);
      const crate = new THREE.Mesh(crateGeo, MAT.workpieceAlloy);
      crate.position.y = 0.5;
      crate.castShadow = true;
      palGroup.add(crate);

      // Glowing RFID / Barcode Badge on crate front
      const tagGeo = new THREE.BoxGeometry(0.3, 0.15, 0.05);
      const tag = new THREE.Mesh(tagGeo, MAT.ledGreen);
      tag.position.set(0, 0.5, 0.58);
      palGroup.add(tag);

      rackGroup.add(palGroup);
    });
  });

  // Base Crash Protection Guard Bollards (Yellow)
  const bollardGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.1, 16);
  [-rackWidth / 2 - 0.3, rackWidth / 2 + 0.3].forEach(bx => {
    const bollard = new THREE.Mesh(bollardGeo, MAT.hazardYellow);
    bollard.position.set(bx, 0.55, rackDepth / 2 + 0.3);
    rackGroup.add(bollard);
  });

  parentGroup.add(rackGroup);
}

/**
 * Creates the glowing rectangular AMR navigation floor corridor
 */
function createCorridorPath(parentGroup) {
  const corridorGroup = new THREE.Group();

  // 4 Straight Line Segments connecting the waypoints (-14,-10 -> 14,-10 -> 14,11 -> -14,11)
  const segs = [
    { x: 0, z: -10, w: 28, d: 0.15 }, // Top horizontal
    { x: 0, z: 11, w: 28, d: 0.15 },  // Bottom horizontal
    { x: -14, z: 0.5, w: 0.15, d: 21 }, // Left vertical
    { x: 14, z: 0.5, w: 0.15, d: 21 },  // Right vertical
  ];

  segs.forEach(s => {
    const geo = new THREE.BoxGeometry(s.w, 0.02, s.d);
    const line = new THREE.Mesh(geo, MAT.trackCyan);
    line.position.set(s.x, 0.025, s.z);
    corridorGroup.add(line);
  });

  // 4 Corner Target Waypoint Circles
  const corners = [
    [-14, -10],
    [14, -10],
    [14, 11],
    [-14, 11],
  ];

  const ringGeo = new THREE.RingGeometry(0.6, 0.85, 24);
  corners.forEach(([cx, cz]) => {
    const ring = new THREE.Mesh(ringGeo, MAT.trackCyan);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(cx, 0.03, cz);
    corridorGroup.add(ring);

    const centerGeo = new THREE.CircleGeometry(0.2, 16);
    const center = new THREE.Mesh(centerGeo, MAT.ledGreen);
    center.rotation.x = -Math.PI / 2;
    center.position.set(cx, 0.031, cz);
    corridorGroup.add(center);
  });

  parentGroup.add(corridorGroup);
}

/**
 * Creates the Traversing Overhead Gantry Crane spanning both walls
 */
function createTraversingGantryCrane(parentGroup) {
  const gantryRoot = new THREE.Group();

  // Dual Runway Beams along Rear and Front walls (Y = 12.5)
  const runwayGeo = new THREE.BoxGeometry(45, 0.8, 0.8);
  const rearRunway = new THREE.Mesh(runwayGeo, MAT.craneYellow);
  rearRunway.position.set(0, 12.5, -15.2);
  rearRunway.castShadow = true;
  gantryRoot.add(rearRunway);

  const frontRunway = new THREE.Mesh(runwayGeo, MAT.craneYellow);
  frontRunway.position.set(0, 12.5, 15.2);
  frontRunway.castShadow = true;
  gantryRoot.add(frontRunway);

  // Traveling Gantry Bridge (Spans across Z: -15.2 to +15.2)
  const bridge = new THREE.Group();
  bridge.position.set(0, 12.8, 0);

  // Dual Yellow Box Girders
  const girderGeo = new THREE.BoxGeometry(0.8, 1.0, 31.0);
  const girder1 = new THREE.Mesh(girderGeo, MAT.craneYellow);
  girder1.position.x = -0.7;
  girder1.castShadow = true;
  bridge.add(girder1);

  const girder2 = new THREE.Mesh(girderGeo, MAT.craneYellow);
  girder2.position.x = 0.7;
  girder2.castShadow = true;
  bridge.add(girder2);

  // End-Trucks with Steel Wheels (Riding on runway rails)
  const truckGeo = new THREE.BoxGeometry(2.4, 0.6, 1.4);
  [-15.2, 15.2].forEach(tz => {
    const truck = new THREE.Mesh(truckGeo, MAT.machineDark);
    truck.position.set(0, 0, tz);
    bridge.add(truck);
  });

  // Hoist Trolley & Motorized Winch (Moves along Z on bridge)
  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.set(0, 0.8, -4);

  const hoistGeo = new THREE.BoxGeometry(2.0, 1.2, 2.0);
  const hoist = new THREE.Mesh(hoistGeo, MAT.machineDark);
  trolleyGroup.add(hoist);

  // Blinking Amber Strobe on Trolley
  const strobeGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.25, 16);
  const strobe = new THREE.Mesh(strobeGeo, MAT.strobeAmber);
  strobe.position.set(0, 0.75, 0);
  trolleyGroup.add(strobe);
  trolleyGroup.strobe = strobe;

  // Hanging Steel Wire Rope Cable
  const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, 4.2);
  const cable = new THREE.Mesh(cableGeo, MAT.steelChrome);
  cable.position.set(0, -2.6, 0);
  trolleyGroup.add(cable);

  // Pulley Block & Heavy Crane Hook
  const hookGeo = new THREE.TorusGeometry(0.35, 0.12, 8, 16, Math.PI * 1.5);
  const hook = new THREE.Mesh(hookGeo, MAT.hazardYellow);
  hook.rotation.z = Math.PI;
  hook.position.set(0, -4.8, 0);
  trolleyGroup.add(hook);

  // Suspended Turbofan Turbine Casing Payload Ring
  const ringGeo = new THREE.TorusGeometry(1.2, 0.22, 12, 32);
  const ringPayload = new THREE.Mesh(ringGeo, MAT.workpieceAlloy);
  ringPayload.rotation.x = Math.PI / 2;
  ringPayload.position.set(0, -5.6, 0);
  ringPayload.castShadow = true;
  trolleyGroup.add(ringPayload);

  bridge.add(trolleyGroup);
  gantryRoot.add(bridge);

  gantryRoot.bridge = bridge;
  gantryRoot.trolley = trolleyGroup;
  parentGroup.add(gantryRoot);

  return gantryRoot;
}

/**
 * 2. CNC-01: DMG MORI STYLE ENCLOSED 5-AXIS TURBINE MACHINING CENTER
 */
export function createCNCMill(position = { x: -8, y: 0, z: -4 }) {
  const group = new THREE.Group();
  group.userData = { id: "CNC-01", type: "CNC_MILL", name: "5-Axis High-Speed Turbine Mill" };

  // 1. Heavy Base Cast Bed Bedplate
  const baseGeo = new THREE.BoxGeometry(6.6, 1.2, 5.8);
  const base = new THREE.Mesh(baseGeo, MAT.machineChassis);
  base.position.y = 0.6;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // 2. Dual Gantry Columns (Left & Right Massive Uprights)
  const uprightGeo = new THREE.BoxGeometry(1.2, 5.4, 4.0);
  const leftCol = new THREE.Mesh(uprightGeo, MAT.machineChassis);
  leftCol.position.set(-2.5, 3.5, 0);
  leftCol.castShadow = true;
  group.add(leftCol);

  const rightCol = new THREE.Mesh(uprightGeo, MAT.machineChassis);
  rightCol.position.set(2.5, 3.5, 0);
  rightCol.castShadow = true;
  group.add(rightCol);

  // 3. Gantry Crossbeam (Spanning the uprights)
  const beamGeo = new THREE.BoxGeometry(6.2, 1.4, 2.2);
  const crossbeam = new THREE.Mesh(beamGeo, MAT.machineAccentCyan);
  crossbeam.position.set(0, 5.3, 0.4);
  crossbeam.castShadow = true;
  group.add(crossbeam);

  // Cable Drag Energy Chain along Crossbeam
  const dragChainGeo = new THREE.BoxGeometry(4.4, 0.25, 0.35);
  const dragChain = new THREE.Mesh(dragChainGeo, MAT.hazardDark);
  dragChain.position.set(0, 6.1, 0.4);
  group.add(dragChain);

  // 4. Translating X/Z Toolhead Carriage
  const carriageGroup = new THREE.Group();
  carriageGroup.position.set(0, 4.5, 0.8);

  const saddleGeo = new THREE.BoxGeometry(1.8, 1.6, 1.4);
  const saddle = new THREE.Mesh(saddleGeo, MAT.machineDark);
  carriageGroup.add(saddle);

  // Ram Slide (Z-axis plunge)
  const ramSlideGeo = new THREE.BoxGeometry(1.0, 2.2, 1.0);
  const ramSlide = new THREE.Mesh(ramSlideGeo, MAT.structuralSteel);
  ramSlide.position.set(0, -0.6, 0.3);
  carriageGroup.add(ramSlide);

  // Spindle Chuck & Milling Tool
  const spindleGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 20);
  const spindleChuck = new THREE.Mesh(spindleGeo, MAT.steelChrome);
  spindleChuck.position.set(0, -1.8, 0.3);
  carriageGroup.add(spindleChuck);

  const toolGeo = new THREE.CylinderGeometry(0.08, 0.02, 0.9, 16);
  const toolBit = new THREE.Mesh(toolGeo, MAT.steelChrome);
  toolBit.position.set(0, -2.4, 0.3);
  carriageGroup.add(toolBit);

  // Coolant Delivery Nozzles aimed at cutting zone
  const nozzleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5);
  [-0.25, 0.25].forEach(nx => {
    const nozzle = new THREE.Mesh(nozzleGeo, MAT.steelChrome);
    nozzle.position.set(nx, -1.9, 0.5);
    nozzle.rotation.x = -0.4;
    carriageGroup.add(nozzle);
  });

  group.add(carriageGroup);
  group.toolCarriage = carriageGroup;
  group.spindleTool = toolBit;
  group.spindleChuck = spindleChuck;

  // 5. 5-Axis Rotary Trunnion Table & Inconel Turbine Blade Workpiece
  const trunnionBaseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.5, 24);
  const trunnionBase = new THREE.Mesh(trunnionBaseGeo, MAT.steelChrome);
  trunnionBase.position.set(0, 1.4, 0.6);
  group.add(trunnionBase);

  const bladeGeo = new THREE.BoxGeometry(0.4, 1.3, 0.8);
  const blade = new THREE.Mesh(bladeGeo, MAT.workpieceAlloy);
  blade.position.set(0, 2.0, 0.6);
  blade.rotation.y = 0.4;
  blade.castShadow = true;
  group.add(blade);
  group.turbineBlade = blade;

  // Dynamic Coolant Mist Glow around blade
  const mistGeo = new THREE.SphereGeometry(0.7, 8, 8);
  const mistMesh = new THREE.Mesh(mistGeo, MAT.coolantMist);
  mistMesh.position.set(0, 1.9, 0.6);
  group.add(mistMesh);
  group.coolantMist = mistMesh;

  // 6. Side Tool Carousel Magazine (Left Column)
  const magHousingGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 24);
  const magHousing = new THREE.Mesh(magHousingGeo, MAT.machineDark);
  magHousing.rotation.z = Math.PI / 2;
  magHousing.position.set(-3.2, 3.8, 0);
  group.add(magHousing);

  // 6 Radial Tool Holders on Carousel
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const holderGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12);
    const holder = new THREE.Mesh(holderGeo, MAT.steelChrome);
    holder.position.set(-3.5, 3.8 + Math.cos(angle) * 0.8, Math.sin(angle) * 0.8);
    holder.rotation.z = Math.PI / 2;
    group.add(holder);
  }

  // 7. Swarf Chip Auger Chute & Bin (Right Column)
  const chuteGeo = new THREE.BoxGeometry(0.8, 0.6, 3.2);
  const chute = new THREE.Mesh(chuteGeo, MAT.machineDark);
  chute.rotation.z = -0.3;
  chute.position.set(3.4, 1.2, 0);
  group.add(chute);

  const chipBinGeo = new THREE.BoxGeometry(1.4, 0.9, 1.4);
  const chipBin = new THREE.Mesh(chipBinGeo, MAT.pressSafetyOrange);
  chipBin.position.set(4.2, 0.45, 0);
  chipBin.castShadow = true;
  group.add(chipBin);

  // 8. DMG MORI Enclosure: Dual Sliding Safety Glass Doors
  const doorLGeo = new THREE.BoxGeometry(2.7, 3.6, 0.08);
  const doorL = new THREE.Mesh(doorLGeo, MAT.glassChamber);
  doorL.position.set(-1.4, 3.2, 2.5);
  group.add(doorL);

  const doorRGeo = new THREE.BoxGeometry(2.7, 3.6, 0.08);
  const doorR = new THREE.Mesh(doorRGeo, MAT.glassChamber);
  doorR.position.set(1.4, 3.2, 2.5);
  group.add(doorR);

  // Door Metal Frames & Ergonomic Handles
  const frameGeo = new THREE.BoxGeometry(5.6, 0.15, 0.15);
  const topFrame = new THREE.Mesh(frameGeo, MAT.doorFrame);
  topFrame.position.set(0, 5.0, 2.5);
  group.add(topFrame);

  const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8);
  const handleL = new THREE.Mesh(handleGeo, MAT.steelChrome);
  handleL.position.set(-0.2, 3.2, 2.6);
  group.add(handleL);

  const handleR = new THREE.Mesh(handleGeo, MAT.steelChrome);
  handleR.position.set(0.2, 3.2, 2.6);
  group.add(handleR);

  // 9. Attached CNC Operator Control Console Terminal
  const consoleGroup = new THREE.Group();
  consoleGroup.position.set(3.6, 0, 1.9);

  const pedestalGeo = new THREE.CylinderGeometry(0.14, 0.16, 2.6);
  const pedestal = new THREE.Mesh(pedestalGeo, MAT.steelChrome);
  pedestal.position.y = 1.3;
  consoleGroup.add(pedestal);

  const screenHousingGeo = new THREE.BoxGeometry(1.3, 1.1, 0.35);
  const screenHousing = new THREE.Mesh(screenHousingGeo, MAT.machineDark);
  screenHousing.position.set(0, 2.6, 0);
  screenHousing.rotation.y = -0.55;
  consoleGroup.add(screenHousing);

  const screenFaceGeo = new THREE.BoxGeometry(1.0, 0.8, 0.05);
  const screenFace = new THREE.Mesh(screenFaceGeo, MAT.terminalScreen);
  screenFace.position.set(0, 2.6, 0.18);
  screenFace.rotation.y = -0.55;
  consoleGroup.add(screenFace);
  group.add(consoleGroup);

  // 10. 3-Tier Status Beacon Light Tower
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6);
  const pole = new THREE.Mesh(poleGeo, MAT.steelChrome);
  pole.position.set(-2.8, 6.7, -1.8);
  group.add(pole);

  const beaconGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 16);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(-2.8, 7.5, -1.8);
  group.add(beacon);
  group.beaconLight = beacon;

  // Ground Status Halo
  const ringGeo = new THREE.RingGeometry(3.6, 4.0, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  // Heat Aura Sphere
  const heatGeo = new THREE.SphereGeometry(2.4, 16, 16);
  const heatMat = new THREE.MeshBasicMaterial({
    color: 0xff3300,
    transparent: true,
    opacity: 0.0,
    wireframe: true,
  });
  const heatAura = new THREE.Mesh(heatGeo, heatMat);
  heatAura.position.set(0, 3.5, 0.8);
  group.add(heatAura);
  group.heatAura = heatAura;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 3. PRESS-01: 1000-TON HYDRAULIC FORGING PRESS (Reservoir, Light Curtains, Shockwave)
 */
export function createHydraulicPress(position = { x: 8, y: 0, z: -4 }) {
  const group = new THREE.Group();
  group.userData = { id: "PRESS-01", type: "HYDRAULIC_PRESS", name: "1000T Airframe Forging Press" };

  // 1. Heavy Bottom Bolster & Anvil Bed
  const baseGeo = new THREE.BoxGeometry(6.8, 1.6, 6.0);
  const base = new THREE.Mesh(baseGeo, MAT.pressBody);
  base.position.y = 0.8;
  base.castShadow = true;
  group.add(base);

  // 2. Four Massive Chromed Tie-Rod Columns with Heavy Industrial Nut Caps
  const pillarGeo = new THREE.CylinderGeometry(0.44, 0.44, 8.0, 24);
  const nutGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.45, 6); // Hex tension nuts
  const pillarCoords = [
    [-2.5, 2.3],
    [2.5, 2.3],
    [-2.5, -2.3],
    [2.5, -2.3],
  ];

  pillarCoords.forEach(([px, pz]) => {
    const p = new THREE.Mesh(pillarGeo, MAT.steelChrome);
    p.position.set(px, 4.8, pz);
    p.castShadow = true;
    group.add(p);

    const nut = new THREE.Mesh(nutGeo, MAT.hazardDark);
    nut.position.set(px, 9.0, pz);
    group.add(nut);
  });

  // 3. Top Hydraulic Crown Manifold
  const crownGeo = new THREE.BoxGeometry(7.0, 2.0, 6.2);
  const crown = new THREE.Mesh(crownGeo, MAT.pressSafetyOrange);
  crown.position.y = 9.0;
  crown.castShadow = true;
  group.add(crown);

  // Overhead Hydraulic Fluid Reservoir Tank with Sight Gauge
  const tankGeo = new THREE.BoxGeometry(3.6, 1.4, 2.2);
  const tank = new THREE.Mesh(tankGeo, MAT.machineDark);
  tank.position.set(0, 10.7, -1.2);
  group.add(tank);

  const sightGaugeGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
  const sightGauge = new THREE.Mesh(sightGaugeGeo, MAT.laserCyan);
  sightGauge.position.set(0, 10.7, -0.05);
  group.add(sightGauge);

  // Twin Nitrogen Pressure Accumulator Cylinders
  const accumGeo = new THREE.CylinderGeometry(0.65, 0.65, 2.6, 20);
  [-2.0, 2.0].forEach(ax => {
    const accum = new THREE.Mesh(accumGeo, MAT.machineDark);
    accum.position.set(ax, 11.0, 0.6);
    group.add(accum);
  });

  // Main Central High-Pressure Hydraulic Cylinder
  const cylGeo = new THREE.CylinderGeometry(1.5, 1.5, 2.8, 24);
  const cyl = new THREE.Mesh(cylGeo, MAT.steelChrome);
  cyl.position.set(0, 11.0, 0.6);
  group.add(cyl);

  // Flexible Braided High-Pressure Hydraulic Connecting Pipes
  const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.6);
  const pipe1 = new THREE.Mesh(pipeGeo, MAT.steelChrome);
  pipe1.rotation.z = Math.PI / 2;
  pipe1.position.set(0, 10.1, 0.6);
  group.add(pipe1);

  // 4. Moving Upper Ram / Stamping Platen
  const ramGeo = new THREE.BoxGeometry(5.2, 1.4, 4.6);
  const ram = new THREE.Mesh(ramGeo, MAT.pressBody);
  ram.position.set(0, 5.4, 0);
  ram.castShadow = true;
  group.add(ram);
  group.ramMesh = ram;

  // Stamping Tooling Die attached to Ram
  const dieGeo = new THREE.BoxGeometry(3.2, 0.5, 2.6);
  const die = new THREE.Mesh(dieGeo, MAT.steelChrome);
  die.position.set(0, -0.8, 0);
  ram.add(die);

  // 5. Hot Forged Titanium Bulkhead Billet on Bottom Anvil
  const billetGeo = new THREE.BoxGeometry(2.6, 0.38, 2.0);
  const billet = new THREE.Mesh(billetGeo, MAT.hotBillet);
  billet.position.set(0, 1.8, 0);
  group.add(billet);
  group.hotBillet = billet;

  // 6. Infrared Photoelectric Safety Light Curtains (Front Opening)
  const curtainPostGeo = new THREE.BoxGeometry(0.2, 4.4, 0.2);
  [-2.8, 2.8].forEach(lx => {
    const post = new THREE.Mesh(curtainPostGeo, MAT.hazardYellow);
    post.position.set(lx, 4.0, 2.6);
    group.add(post);
  });

  // Vertical Glowing Ruby Safety Beams
  for (let b = 0; b < 4; b++) {
    const beamY = 2.4 + b * 0.9;
    const beamLineGeo = new THREE.BoxGeometry(5.4, 0.04, 0.04);
    const beamLine = new THREE.Mesh(beamLineGeo, MAT.lightCurtainBeam);
    beamLine.position.set(0, beamY, 2.6);
    group.add(beamLine);
  }

  // 7. Stamping Shockwave Floor Ring on bottom impact
  const shockGeo = new THREE.RingGeometry(3.8, 5.2, 32);
  const shockMat = new THREE.MeshBasicMaterial({
    color: 0xff6b2b,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const shockwave = new THREE.Mesh(shockGeo, shockMat);
  shockwave.rotation.x = -Math.PI / 2;
  shockwave.position.y = 0.03;
  group.add(shockwave);
  group.shockwaveRing = shockwave;

  // Ground Status Halo
  const ringGeo = new THREE.RingGeometry(3.8, 4.2, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  // Heat Aura Sphere
  const heatGeo = new THREE.SphereGeometry(2.8, 16, 16);
  const heatMat = new THREE.MeshBasicMaterial({
    color: 0xff4400,
    transparent: true,
    opacity: 0.0,
    wireframe: true,
  });
  const heatAura = new THREE.Mesh(heatGeo, heatMat);
  heatAura.position.set(0, 5.8, 0);
  group.add(heatAura);
  group.heatAura = heatAura;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 4. CONV-01: DUAL-RAIL ASSEMBLY CONVEYOR WITH ENCLOSED LASER QC TUNNEL
 */
export function createConveyorLine(position = { x: 0, y: 0, z: 6 }) {
  const group = new THREE.Group();
  group.userData = { id: "CONV-01", type: "CONVEYOR", name: "Avionics Assembly & Laser QC Gate" };

  const length = 23.0;
  const width = 2.8;

  // 1. Longitudinal Aluminum Extrusion Truss Rails
  const frameGeo = new THREE.BoxGeometry(length, 0.7, width);
  const frame = new THREE.Mesh(frameGeo, MAT.aluminumExtrusion);
  frame.position.y = 1.35;
  frame.castShadow = true;
  group.add(frame);

  // Dual Conveyor Belt Track
  const beltGeo = new THREE.BoxGeometry(length - 0.2, 0.1, width - 0.5);
  const belt = new THREE.Mesh(beltGeo, MAT.conveyorBelt);
  belt.position.y = 1.72;
  group.add(belt);

  // Emergency Red E-Stop Pull Cords along outer sides
  const eStopCordGeo = new THREE.CylinderGeometry(0.02, 0.02, length - 0.4);
  eStopCordGeo.rotateZ(Math.PI / 2);
  [-width / 2 - 0.1, width / 2 + 0.1].forEach(ez => {
    const cord = new THREE.Mesh(eStopCordGeo, MAT.ledRed);
    cord.position.set(0, 1.6, ez);
    group.add(cord);
  });

  // Heavy Support Leg Stands with Adjustable Leveling Feet
  const legGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.4);
  for (let x = -9.5; x <= 9.5; x += 4.75) {
    [-1.1, 1.1].forEach(z => {
      const leg = new THREE.Mesh(legGeo, MAT.structuralSteel);
      leg.position.set(x, 0.7, z);
      leg.castShadow = true;
      group.add(leg);
    });
  }

  // 2. ENCLOSED LASER QC INSPECTION TUNNEL ARCH (At conveyor midpoint x = 0)
  const tunnelGroup = new THREE.Group();
  tunnelGroup.position.set(0, 1.7, 0);

  // Tunnel Arch Housing
  const archGeo = new THREE.BoxGeometry(3.4, 2.5, width + 0.5);
  const tunnelArch = new THREE.Mesh(archGeo, MAT.machineDark);
  tunnelArch.position.y = 1.25;
  tunnelArch.castShadow = true;
  tunnelGroup.add(tunnelArch);

  // Interior Cutout Chamber
  const tunnelChamberGeo = new THREE.BoxGeometry(3.5, 1.7, width - 0.2);
  const tunnelChamber = new THREE.Mesh(tunnelChamberGeo, MAT.floorEpoxy);
  tunnelChamber.position.y = 0.85;
  tunnelGroup.add(tunnelChamber);

  // Overhead Digital QC Readout HUD Plate
  const hudGeo = new THREE.BoxGeometry(2.4, 0.4, 0.08);
  const hudPlate = new THREE.Mesh(hudGeo, MAT.terminalScreen);
  hudPlate.position.set(0, 2.65, (width + 0.5) / 2 + 0.05);
  tunnelGroup.add(hudPlate);

  // ACTIVE VERTICAL LASER SCANNER PLANE (Sweeps passing parts)
  const laserGeo = new THREE.PlaneGeometry(0.1, 1.7);
  const tunnelLaser = new THREE.Mesh(laserGeo, MAT.laserScannerPlane);
  tunnelLaser.position.set(0, 0.85, 0);
  tunnelLaser.rotation.y = Math.PI / 2;
  tunnelGroup.add(tunnelLaser);
  group.tunnelLaser = tunnelLaser;

  // Emitter Bar on Tunnel Roof
  const emitterGeo = new THREE.BoxGeometry(0.4, 0.2, width);
  const emitter = new THREE.Mesh(emitterGeo, MAT.hazardYellow);
  emitter.position.set(0, 2.2, 0);
  tunnelGroup.add(emitter);

  group.add(tunnelGroup);

  // 3. MOVING AEROSPACE CARGO PALLETS (Fixtures holding turbine blades & avionics)
  group.crates = [];
  for (let i = 0; i < 5; i++) {
    const palletGroup = new THREE.Group();
    palletGroup.position.set(-9.5 + i * 4.75, 2.0, 0);

    const palBaseGeo = new THREE.BoxGeometry(1.7, 0.25, 1.5);
    const palBase = new THREE.Mesh(palBaseGeo, MAT.cargoPallet);
    palletGroup.add(palBase);

    const partGeo = new THREE.BoxGeometry(0.65, 0.75, 0.65);
    const part = new THREE.Mesh(partGeo, MAT.workpieceAlloy);
    part.position.y = 0.48;
    palletGroup.add(part);

    const ledGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const led = new THREE.Mesh(ledGeo, MAT.ledGreen);
    led.position.set(0.7, 0.2, 0.55);
    palletGroup.add(led);

    palletGroup.castShadow = true;
    group.add(palletGroup);
    group.crates.push(palletGroup);
  }

  // Ground Status Halo
  const ringGeo = new THREE.RingGeometry(3.4, 3.8, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

/**
 * 5. AGV-01: ARMORED AMR ROVER WITH 3D LIDAR CONE, DRIVING HEADLIGHTS & CARGO
 */
export function createAGVRobot() {
  const group = new THREE.Group();
  group.userData = { id: "AGV-01", type: "AGV", name: "Autonomous Transport AMR" };

  // 1. Armored Chamfered Rover Chassis
  const bodyGeo = new THREE.BoxGeometry(2.3, 0.65, 1.7);
  const body = new THREE.Mesh(bodyGeo, MAT.machineChassis);
  body.position.y = 0.45;
  body.castShadow = true;
  group.add(body);

  // Side Hazard Protection Skirts
  const skirtGeo = new THREE.BoxGeometry(1.9, 0.15, 0.1);
  [-0.87, 0.87].forEach(z => {
    const skirt = new THREE.Mesh(skirtGeo, MAT.hazardYellow);
    skirt.position.set(0, 0.35, z);
    group.add(skirt);
  });

  // Front Bumper & High-Intensity Driving Headlights Bar
  const bumperGeo = new THREE.BoxGeometry(0.2, 0.3, 1.5);
  const bumper = new THREE.Mesh(bumperGeo, MAT.machineDark);
  bumper.position.set(1.2, 0.4, 0);
  group.add(bumper);

  const headlightGeo = new THREE.BoxGeometry(0.08, 0.12, 1.2);
  const headlight = new THREE.Mesh(headlightGeo, MAT.laserCyan);
  headlight.position.set(1.32, 0.4, 0);
  group.add(headlight);

  // Dynamic SpotLight projecting light onto the floor ahead
  const driveLight = new THREE.SpotLight(0x00f3ff, 2.5, 12, Math.PI / 4, 0.4, 1.0);
  driveLight.position.set(1.3, 0.5, 0);
  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(5.0, 0, 0);
  group.add(driveLight);
  group.add(lightTarget);
  driveLight.target = lightTarget;
  group.driveLight = driveLight;

  // 2. 3D Rotating LiDAR Puck Sensor Dome
  const lidarPuckGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 20);
  const lidarPuck = new THREE.Mesh(lidarPuckGeo, MAT.steelChrome);
  lidarPuck.position.set(0.65, 0.95, 0);
  group.add(lidarPuck);
  group.lidarPuck = lidarPuck;

  // Active Sweeping LiDAR Scan Cone (Semi-transparent cyan forward beam)
  const coneGeo = new THREE.ConeGeometry(2.4, 4.2, 16, 1, true);
  coneGeo.rotateX(Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const lidarCone = new THREE.Mesh(coneGeo, coneMat);
  lidarCone.position.set(2.5, 0.6, 0);
  group.add(lidarCone);
  group.lidarCone = lidarCone;

  // 3. Flashing Amber Safety Strobe Beacon on Rear Mast
  const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6);
  const mast = new THREE.Mesh(mastGeo, MAT.steelChrome);
  mast.position.set(-0.85, 0.8, 0);
  group.add(mast);

  const strobeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.24, 16);
  const strobe = new THREE.Mesh(strobeGeo, MAT.strobeAmber);
  strobe.position.set(-0.85, 1.15, 0);
  group.add(strobe);
  group.strobeBeacon = strobe;

  // 4. Four Industrial Mecanum Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.22, 20);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelPositions = [
    [-0.7, 0.26, 0.9],
    [0.7, 0.26, 0.9],
    [-0.7, 0.26, -0.9],
    [0.7, 0.26, -0.9],
  ];

  group.wheels = [];
  wheelPositions.forEach(([x, y, z]) => {
    const w = new THREE.Mesh(wheelGeo, MAT.machineDark);
    w.position.set(x, y, z);
    group.add(w);
    group.wheels.push(w);
  });

  // 5. Aerospace Cargo Payload Pallet (Secured on Top Deck)
  const cargoGroup = new THREE.Group();
  cargoGroup.position.set(-0.1, 0.85, 0);

  const cargoPalletGeo = new THREE.BoxGeometry(1.3, 0.15, 1.2);
  const cargoPallet = new THREE.Mesh(cargoPalletGeo, MAT.cargoPallet);
  cargoGroup.add(cargoPallet);

  const partCrateGeo = new THREE.BoxGeometry(0.95, 0.55, 0.85);
  const partCrate = new THREE.Mesh(partCrateGeo, MAT.workpieceAlloy);
  partCrate.position.y = 0.35;
  cargoGroup.add(partCrate);
  group.add(cargoGroup);

  group.position.set(0, 0, 0);
  return group;
}
