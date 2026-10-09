/**
 * Procedural Industrial 3D Machinery Models
 * ==========================================
 * Creates detailed PBR 3D models for:
 * - Factory Floor & Zone Markings
 * - CNC-01 (Milling Center with rotating spindle and enclosure)
 * - PRESS-01 (Hydraulic Stamping Press with moving ram)
 * - CONV-01 (Automated Conveyor with moving cargo pallets)
 * - AGV-01 (Autonomous Logistics Rover navigating waypoints)
 */

// Materials Palette
const MAT = {
  floor: new THREE.MeshStandardMaterial({ color: 0x0f131a, roughness: 0.8, metalness: 0.2 }),
  subFloor: new THREE.MeshStandardMaterial({ color: 0x090c10, roughness: 0.9, metalness: 0.1 }),
  machineBody: new THREE.MeshStandardMaterial({ color: 0x1b2230, roughness: 0.4, metalness: 0.6 }),
  machineAccent: new THREE.MeshStandardMaterial({ color: 0x00d2ff, roughness: 0.3, metalness: 0.8 }),
  pressBody: new THREE.MeshStandardMaterial({ color: 0x222a3a, roughness: 0.5, metalness: 0.5 }),
  pressAccent: new THREE.MeshStandardMaterial({ color: 0xff6b2b, roughness: 0.3, metalness: 0.7 }),
  conveyorMetal: new THREE.MeshStandardMaterial({ color: 0x2a3342, roughness: 0.4, metalness: 0.7 }),
  conveyorBelt: new THREE.MeshStandardMaterial({ color: 0x12151c, roughness: 0.9, metalness: 0.1 }),
  cargoBox: new THREE.MeshStandardMaterial({ color: 0x3d70b2, roughness: 0.6, metalness: 0.3 }),
  steelChrome: new THREE.MeshStandardMaterial({ color: 0xd8e3e8, roughness: 0.1, metalness: 0.95 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x64d2ff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.8,
  }),
  hazardYellow: new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.5, metalness: 0.3 }),
  hazardDark: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }),
  agvBody: new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.4, metalness: 0.6 }),
  agvGlow: new THREE.MeshBasicMaterial({ color: 0x00f3ff }),
};

export function createFactoryFloor(scene) {
  const group = new THREE.Group();

  // Main ground slab
  const floorGeo = new THREE.BoxGeometry(42, 0.6, 32);
  const floorMesh = new THREE.Mesh(floorGeo, MAT.floor);
  floorMesh.position.y = -0.3;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Outer border rim
  const rimGeo = new THREE.BoxGeometry(43, 0.3, 33);
  const rimMesh = new THREE.Mesh(rimGeo, MAT.subFloor);
  rimMesh.position.y = -0.5;
  group.add(rimMesh);

  // Floor grid helper
  const grid = new THREE.GridHelper(36, 36, 0x00e5ff, 0x1a2638);
  grid.position.y = 0.01;
  group.add(grid);

  // AGV Navigation Floor Track (glowing yellow/cyan dashed lines)
  const trackMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.4 });
  const trackGeo = new THREE.RingGeometry(8, 8.2, 48);
  const trackMesh = new THREE.Mesh(trackGeo, trackMat);
  trackMesh.rotation.x = -Math.PI / 2;
  trackMesh.position.set(0, 0.02, 1);
  group.add(trackMesh);

  scene.add(group);
  return group;
}

export function createCNCMill(position = { x: -8, y: 0, z: -4 }) {
  const group = new THREE.Group();
  group.userData = { id: "CNC-01", type: "CNC_MILL", name: "CNC Milling Center" };

  // Base Pedestal
  const baseGeo = new THREE.BoxGeometry(5.2, 1.2, 4.6);
  const base = new THREE.Mesh(baseGeo, MAT.machineBody);
  base.position.y = 0.6;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Main Frame / Column
  const colGeo = new THREE.BoxGeometry(4.8, 4.5, 4.0);
  const column = new THREE.Mesh(colGeo, MAT.machineBody);
  column.position.set(0, 3.2, -0.2);
  column.castShadow = true;
  group.add(column);

  // Work Chamber Cutout / Interior
  const tableGeo = new THREE.BoxGeometry(3.4, 0.4, 2.6);
  const table = new THREE.Mesh(tableGeo, MAT.steelChrome);
  table.position.set(0, 1.4, 0.4);
  group.add(table);

  // Spindle Head Housing
  const spindleHeadGeo = new THREE.BoxGeometry(1.6, 2.0, 1.6);
  const spindleHead = new THREE.Mesh(spindleHeadGeo, MAT.machineAccent);
  spindleHead.position.set(0, 3.8, 0.5);
  group.add(spindleHead);

  // Rotating Spindle Tool (Drill/Mill Tool)
  const toolGeo = new THREE.CylinderGeometry(0.12, 0.04, 1.0, 16);
  const tool = new THREE.Mesh(toolGeo, MAT.steelChrome);
  tool.position.set(0, 2.4, 0.5);
  group.add(tool);
  group.spindleTool = tool;

  // Front Enclosure Safety Glass
  const glassGeo = new THREE.BoxGeometry(4.4, 3.0, 0.1);
  const glass = new THREE.Mesh(glassGeo, MAT.glass);
  glass.position.set(0, 2.8, 1.8);
  group.add(glass);

  // 3-Tier Beacon Tower (Stack Light)
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2);
  const pole = new THREE.Mesh(poleGeo, MAT.steelChrome);
  pole.position.set(2.2, 5.8, -1.6);
  group.add(pole);

  const beaconGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.25, 16);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(2.2, 6.4, -1.6);
  group.add(beacon);
  group.beaconLight = beacon;

  // Ground Status Halo
  const ringGeo = new THREE.RingGeometry(3.2, 3.6, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  // Heat Aura Sphere (Visible when overheating / high wear)
  const heatGeo = new THREE.SphereGeometry(1.8, 16, 16);
  const heatMat = new THREE.MeshBasicMaterial({
    color: 0xff3300,
    transparent: true,
    opacity: 0.0,
    wireframe: true,
  });
  const heatAura = new THREE.Mesh(heatGeo, heatMat);
  heatAura.position.set(0, 3.2, 0.5);
  group.add(heatAura);
  group.heatAura = heatAura;

  group.position.set(position.x, position.y, position.z);
  return group;
}

export function createHydraulicPress(position = { x: 8, y: 0, z: -4 }) {
  const group = new THREE.Group();
  group.userData = { id: "PRESS-01", type: "HYDRAULIC_PRESS", name: "Hydraulic Stamping Press" };

  // Heavy Bottom Bolster Bed
  const baseGeo = new THREE.BoxGeometry(5.6, 1.4, 5.0);
  const base = new THREE.Mesh(baseGeo, MAT.pressBody);
  base.position.y = 0.7;
  base.castShadow = true;
  group.add(base);

  // Four Massive Support Columns
  const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 6.5, 24);
  const pillars = [
    [-2.2, 2.0],
    [2.2, 2.0],
    [-2.2, -2.0],
    [2.2, -2.0],
  ];
  pillars.forEach(([px, pz]) => {
    const p = new THREE.Mesh(pillarGeo, MAT.steelChrome);
    p.position.set(px, 3.9, pz);
    p.castShadow = true;
    group.add(p);
  });

  // Top Hydraulic Crown Manifold
  const crownGeo = new THREE.BoxGeometry(5.8, 1.8, 5.2);
  const crown = new THREE.Mesh(crownGeo, MAT.pressAccent);
  crown.position.y = 7.4;
  crown.castShadow = true;
  group.add(crown);

  // Overhead Cylinder
  const cylGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 24);
  const cyl = new THREE.Mesh(cylGeo, MAT.steelChrome);
  cyl.position.set(0, 8.8, 0);
  group.add(cyl);

  // Moving Ram / Stamping Platen
  const ramGeo = new THREE.BoxGeometry(4.2, 1.2, 3.8);
  const ram = new THREE.Mesh(ramGeo, MAT.pressBody);
  ram.position.set(0, 4.5, 0);
  ram.castShadow = true;
  group.add(ram);
  group.ramMesh = ram;

  // Stamping Die / Tool
  const dieGeo = new THREE.BoxGeometry(2.4, 0.4, 2.0);
  const die = new THREE.Mesh(dieGeo, MAT.steelChrome);
  die.position.set(0, -0.7, 0);
  ram.add(die);

  // Ground Status Halo
  const ringGeo = new THREE.RingGeometry(3.5, 3.9, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  // Heat Aura Sphere
  const heatGeo = new THREE.SphereGeometry(2.2, 16, 16);
  const heatMat = new THREE.MeshBasicMaterial({
    color: 0xff4400,
    transparent: true,
    opacity: 0.0,
    wireframe: true,
  });
  const heatAura = new THREE.Mesh(heatGeo, heatMat);
  heatAura.position.set(0, 5.5, 0);
  group.add(heatAura);
  group.heatAura = heatAura;

  group.position.set(position.x, position.y, position.z);
  return group;
}

export function createConveyorLine(position = { x: 0, y: 0, z: 6 }) {
  const group = new THREE.Group();
  group.userData = { id: "CONV-01", type: "CONVEYOR", name: "High-Speed Assembly Conveyor" };

  const length = 20.0;
  const width = 2.4;

  // Longitudinal Frame Rails
  const frameGeo = new THREE.BoxGeometry(length, 0.6, width);
  const frame = new THREE.Mesh(frameGeo, MAT.conveyorMetal);
  frame.position.y = 1.3;
  frame.castShadow = true;
  group.add(frame);

  // Conveyor Belt Surface
  const beltGeo = new THREE.BoxGeometry(length - 0.2, 0.1, width - 0.4);
  const belt = new THREE.Mesh(beltGeo, MAT.conveyorBelt);
  belt.position.y = 1.65;
  group.add(belt);

  // Support Legs
  const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.3);
  for (let x = -8; x <= 8; x += 4) {
    [-0.9, 0.9].forEach(z => {
      const leg = new THREE.Mesh(legGeo, MAT.steelChrome);
      leg.position.set(x, 0.65, z);
      leg.castShadow = true;
      group.add(leg);
    });
  }

  // Moving Pallets / Crates
  group.crates = [];
  const crateGeo = new THREE.BoxGeometry(1.2, 0.8, 1.2);
  for (let i = 0; i < 5; i++) {
    const crate = new THREE.Mesh(crateGeo, MAT.cargoBox);
    crate.position.set(-8 + i * 4, 2.1, 0);
    crate.castShadow = true;
    group.add(crate);
    group.crates.push(crate);
  }

  // Ground Status Halo
  const ringGeo = new THREE.RingGeometry(3.0, 3.4, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
  group.statusRing = ring;

  group.position.set(position.x, position.y, position.z);
  return group;
}

export function createAGVRobot() {
  const group = new THREE.Group();
  group.userData = { id: "AGV-01", type: "AGV", name: "Patrol Transport Robot" };

  // Main Rover Body
  const bodyGeo = new THREE.BoxGeometry(1.8, 0.6, 1.3);
  const body = new THREE.Mesh(bodyGeo, MAT.agvBody);
  body.position.y = 0.4;
  body.castShadow = true;
  group.add(body);

  // Rotating LIDAR Sensor Dome
  const lidarGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
  const lidar = new THREE.Mesh(lidarGeo, MAT.steelChrome);
  lidar.position.set(0.6, 0.85, 0);
  group.add(lidar);

  // Glowing Front LED Strip
  const lightGeo = new THREE.BoxGeometry(0.1, 0.15, 1.0);
  const light = new THREE.Mesh(lightGeo, MAT.agvGlow);
  light.position.set(0.9, 0.4, 0);
  group.add(light);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelPositions = [
    [-0.5, 0.2, 0.7],
    [0.5, 0.2, 0.7],
    [-0.5, 0.2, -0.7],
    [0.5, 0.2, -0.7],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const w = new THREE.Mesh(wheelGeo, MAT.conveyorBelt);
    w.position.set(x, y, z);
    group.add(w);
  });

  group.position.set(0, 0, 0);
  return group;
}
