/**
 * 3D Isometric Factory Scene Engine
 * Titan Aerospace Precision Fab
 * ===================================
 * Manages Three.js WebGL scene, lighting, isometric camera,
 * 8 distinct machine models across 4 zoned bays + 2 roving AMRs,
 * animation loops, raycasting, and theme switching.
 */

import {
  createFactoryFloor,
  createCNCMill,
  createAirfoilFinishingCenter,
  createHydraulicPress,
  createExtrusionPress,
  createVacuumFurnace,
  createRoboticCell,
  createLaserQCArch,
  createConveyorLine,
  createAGVRobot,
  setFactoryTheme
} from './models.js';

let scene, camera, renderer, controls;
let containerEl;
let ambientLight, dirLight, fillLight;
let factoryFloor;
const machines = new Map(); // id -> THREE.Group

// AGV Logistics Fleet
let agvRobot1, agvRobot2;
let agv1FollowMode = false;
let agv2FollowMode = false;

// AGV-01 Outer Loop Waypoints
const agv1Waypoints = [
  new THREE.Vector3(-22, 0, -16),
  new THREE.Vector3(22, 0, -16),
  new THREE.Vector3(22, 0, 16),
  new THREE.Vector3(-22, 0, 16),
];
let agv1CurrentWp = 0;
let agv1Speed = 0.08;

// AGV-02 Inner Cross-Bay Loop Waypoints
const agv2Waypoints = [
  new THREE.Vector3(0, 0, -12),
  new THREE.Vector3(0, 0, 12),
  new THREE.Vector3(-10, 0, 12),
  new THREE.Vector3(-10, 0, -12),
];
let agv2CurrentWp = 0;
let agv2Speed = 0.07;

// Radar sweep state
let radarMesh = null;
let radarScanning = false;
let radarProgress = 0;

// Camera tween state
let targetCamPos = null;
let targetLookAt = null;
const defaultCamPos = new THREE.Vector3(38, 32, 38);
const defaultLookAt = new THREE.Vector3(0, 2, 0);

// Machine live telemetry state cache across all 8 machines
const telemetryState = {
  "CNC-01": { status: "HEALTHY", wear: 0.05, vibration: 0.16, rpm: 1200 },
  "CNC-02": { status: "HEALTHY", wear: 0.05, vibration: 0.14, rpm: 1800 },
  "PRESS-01": { status: "HEALTHY", wear: 0.08, vibration: 0.22, pressure: 210 },
  "PRESS-02": { status: "HEALTHY", wear: 0.06, vibration: 0.18, pressure: 160 },
  "FURN-01": { status: "HEALTHY", wear: 0.04, vibration: 0.11, temp: 980 },
  "ROBOT-01": { status: "HEALTHY", wear: 0.05, vibration: 0.15, load: 0.65 },
  "LASER-01": { status: "HEALTHY", wear: 0.03, vibration: 0.08, accuracy: 0.999 },
  "CONV-01": { status: "HEALTHY", wear: 0.04, vibration: 0.12, speed: 1.0 },
};

export function initScene(container) {
  containerEl = container;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // 1. Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f5f9); // Cleanroom daylight default
  scene.fog = new THREE.FogExp2(0xf1f5f9, 0.008);

  // 2. Camera (Isometric Perspective with low FOV for RTS strategy feel)
  camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
  camera.position.copy(defaultCamPos);

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 4. Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.copy(defaultLookAt);
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.minDistance = 12;
  controls.maxDistance = 90;
  controls.addEventListener('start', () => {
    agv1FollowMode = false;
    agv2FollowMode = false;
  });

  // 5. Lighting Setup
  setupLighting();

  // 6. Build Factory Assets (Floor & 8 Workcells)
  factoryFloor = createFactoryFloor(scene);

  // Bay 1: Machining Bay
  const cnc1 = createCNCMill({ x: -16, y: 0, z: -10 });
  scene.add(cnc1);
  machines.set("CNC-01", cnc1);

  const cnc2 = createAirfoilFinishingCenter({ x: -6, y: 0, z: -10 });
  scene.add(cnc2);
  machines.set("CNC-02", cnc2);

  // Bay 2: Heavy Forming & Thermal Bay
  const press1 = createHydraulicPress({ x: 7, y: 0, z: -11 });
  scene.add(press1);
  machines.set("PRESS-01", press1);

  const press2 = createExtrusionPress({ x: 19, y: 0, z: -11 });
  scene.add(press2);
  machines.set("PRESS-02", press2);

  const furn1 = createVacuumFurnace({ x: 13, y: 0, z: -2 });
  scene.add(furn1);
  machines.set("FURN-01", furn1);

  // Bay 3: Robotics & Metrology Bay
  const robot1 = createRoboticCell({ x: -16, y: 0, z: 8 });
  scene.add(robot1);
  machines.set("ROBOT-01", robot1);

  const laser1 = createLaserQCArch({ x: -6, y: 0, z: 8 });
  scene.add(laser1);
  machines.set("LASER-01", laser1);

  // Bay 4: Assembly Line Bay
  const conv1 = createConveyorLine({ x: 13, y: 0, z: 8 });
  scene.add(conv1);
  machines.set("CONV-01", conv1);

  // Logistics Fleet: Dual AMRs
  agvRobot1 = createAGVRobot("AGV-01", "turbine");
  agvRobot1.position.copy(agv1Waypoints[0]);
  scene.add(agvRobot1);

  agvRobot2 = createAGVRobot("AGV-02", "avionics");
  agvRobot2.position.copy(agv2Waypoints[0]);
  scene.add(agvRobot2);

  // 7. Radar Scanner Plane
  setupRadarScanner();

  // 8. Event Listeners
  window.addEventListener('resize', onWindowResize);

  // 9. Start Animation Loop
  animate(0);

  return { scene, camera, renderer, controls, machines };
}

function setupLighting() {
  ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
  scene.add(ambientLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 1.35);
  dirLight.position.set(24, 38, 24);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 120;
  dirLight.shadow.camera.left = -34;
  dirLight.shadow.camera.right = 34;
  dirLight.shadow.camera.top = 28;
  dirLight.shadow.camera.bottom = -28;
  dirLight.shadow.bias = -0.0004;
  scene.add(dirLight);

  fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.6);
  fillLight.position.set(-24, 20, -20);
  scene.add(fillLight);
}

export function setSceneTheme(themeName) {
  const isLight = themeName !== 'dark';
  setFactoryTheme(isLight);

  if (isLight) {
    scene.background.setHex(0xf1f5f9);
    scene.fog.color.setHex(0xf1f5f9);
    ambientLight.color.setHex(0xffffff);
    ambientLight.intensity = 1.25;
    dirLight.color.setHex(0xffffff);
    dirLight.intensity = 1.35;
    fillLight.color.setHex(0xe2e8f0);
    fillLight.intensity = 0.6;
  } else {
    scene.background.setHex(0x090c12);
    scene.fog.color.setHex(0x090c12);
    ambientLight.color.setHex(0x64748b);
    ambientLight.intensity = 0.65;
    dirLight.color.setHex(0x00f3ff);
    dirLight.intensity = 1.2;
    fillLight.color.setHex(0x1e293b);
    fillLight.intensity = 0.4;
  }
}

function setupRadarScanner() {
  const radarGeo = new THREE.PlaneGeometry(62, 4);
  const radarMat = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  radarMesh = new THREE.Mesh(radarGeo, radarMat);
  radarMesh.rotation.x = -Math.PI / 2;
  radarMesh.position.set(0, 0.08, -20);
  scene.add(radarMesh);
}

export function triggerRadarSweep() {
  radarScanning = true;
  radarProgress = 0;
}

export function setCameraPreset(presetName) {
  agv1FollowMode = false;
  agv2FollowMode = false;

  switch (presetName) {
    case 'global':
      targetCamPos = defaultCamPos.clone();
      targetLookAt = defaultLookAt.clone();
      break;
    case 'bay1': // Machining Bay (CNC-01 & CNC-02)
      targetCamPos = new THREE.Vector3(-11, 16, 2);
      targetLookAt = new THREE.Vector3(-11, 2, -10);
      break;
    case 'bay2': // Forming & Heat (PRESS-01, PRESS-02, FURN-01)
      targetCamPos = new THREE.Vector3(13, 18, 5);
      targetLookAt = new THREE.Vector3(13, 3, -8);
      break;
    case 'bay3': // Robotics & QC (ROBOT-01, LASER-01)
      targetCamPos = new THREE.Vector3(-11, 16, 20);
      targetLookAt = new THREE.Vector3(-11, 2, 8);
      break;
    case 'bay4': // Assembly Line (CONV-01)
      targetCamPos = new THREE.Vector3(13, 16, 20);
      targetLookAt = new THREE.Vector3(13, 2, 8);
      break;
    case 'agv1':
      agv1FollowMode = true;
      break;
    case 'agv2':
      agv2FollowMode = true;
      break;
    case 'entrance': // Main Entrance (TITAN AEROSPACE Portal)
      targetCamPos = new THREE.Vector3(0, 7.5, 36.0);
      targetLookAt = new THREE.Vector3(0, 3.6, 23.0);
      break;
    default:
      // Focus on specific machine ID
      if (machines.has(presetName)) {
        const m = machines.get(presetName);
        targetCamPos = new THREE.Vector3(m.position.x + 8, m.position.y + 7, m.position.z + 8);
        targetLookAt = new THREE.Vector3(m.position.x, m.position.y + 2, m.position.z);
      }
      break;
  }
}

export function updateFleetTelemetry(fleetData) {
  if (!fleetData || !Array.isArray(fleetData)) return;

  fleetData.forEach(m => {
    const id = m.machine_id;
    const group = machines.get(id);

    telemetryState[id] = {
      status: m.status || "HEALTHY",
      wear: m.wear_level || 0,
      vibration: m.vibration_rms || 0.15,
      temp: m.temperature_c || 42.0,
      rul: m.predicted_rul_cycles != null ? Math.round(m.predicted_rul_cycles) : m.rul_cycles,
      throughput: m.throughput_units || 0,
    };

    if (group && group.statusRing) {
      const stat = (m.status || "HEALTHY").toUpperCase();
      let col = 0x059669; // Emerald green
      if (stat === "CRITICAL" || stat === "FAILED") col = 0xdc2626;
      else if (stat === "WARNING" || stat === "DEGRADING") col = 0xd97706;

      group.statusRing.material.color.setHex(col);

      if (group.beaconLight) {
        group.beaconLight.material.color.setHex(col);
      }
    }
  });
}

function updateAGVNavigation() {
  // Update AGV-01 (Outer Loop)
  if (agvRobot1) {
    const target = agv1Waypoints[agv1CurrentWp];
    const dx = target.x - agvRobot1.position.x;
    const dz = target.z - agvRobot1.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.5) {
      agv1CurrentWp = (agv1CurrentWp + 1) % agv1Waypoints.length;
    } else {
      const angle = Math.atan2(dz, dx);
      agvRobot1.position.x += Math.cos(angle) * agv1Speed;
      agvRobot1.position.z += Math.sin(angle) * agv1Speed;
      agvRobot1.rotation.y = -angle;
    }

    if (agv1FollowMode) {
      camera.position.set(agvRobot1.position.x + 6, agvRobot1.position.y + 6, agvRobot1.position.z + 6);
      controls.target.set(agvRobot1.position.x, agvRobot1.position.y + 1, agvRobot1.position.z);
    }
  }

  // Update AGV-02 (Inner Cross-Bay Loop)
  if (agvRobot2) {
    const target = agv2Waypoints[agv2CurrentWp];
    const dx = target.x - agvRobot2.position.x;
    const dz = target.z - agvRobot2.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 0.5) {
      agv2CurrentWp = (agv2CurrentWp + 1) % agv2Waypoints.length;
    } else {
      const angle = Math.atan2(dz, dx);
      agvRobot2.position.x += Math.cos(angle) * agv2Speed;
      agvRobot2.position.z += Math.sin(angle) * agv2Speed;
      agvRobot2.rotation.y = -angle;
    }

    if (agv2FollowMode) {
      camera.position.set(agvRobot2.position.x + 6, agvRobot2.position.y + 6, agvRobot2.position.z + 6);
      controls.target.set(agvRobot2.position.x, agvRobot2.position.y + 1, agvRobot2.position.z);
    }
  }
}

function animate(time) {
  requestAnimationFrame(animate);
  const t = time * 0.001;

  // 1. Camera Tween
  if (targetCamPos && targetLookAt && !agv1FollowMode && !agv2FollowMode) {
    camera.position.lerp(targetCamPos, 0.06);
    controls.target.lerp(targetLookAt, 0.06);
    if (camera.position.distanceTo(targetCamPos) < 0.1) {
      targetCamPos = null;
      targetLookAt = null;
    }
  }
  controls.update();

  // 2. CNC-01 Animation
  const cnc1 = machines.get("CNC-01");
  if (cnc1 && cnc1.toolCarriage) {
    cnc1.toolCarriage.position.x = Math.sin(t * 2.2) * 0.8;
    if (cnc1.spindleTool) cnc1.spindleTool.rotation.y += 0.45;
  }

  // 4. CNC-02 Animation
  const cnc2 = machines.get("CNC-02");
  if (cnc2 && cnc2.toolCarriage) {
    cnc2.toolCarriage.position.x = Math.cos(t * 2.8) * 0.7;
    if (cnc2.spindleTool) cnc2.spindleTool.rotation.y += 0.6;
    if (cnc2.turbineBlade) cnc2.turbineBlade.rotation.z = Math.sin(t * 1.5) * 0.2;
  }

  // 5. PRESS-01 Animation (Forging Press)
  const press1 = machines.get("PRESS-01");
  if (press1 && press1.ramMesh) {
    const stroke = (Math.sin(t * 1.8) + 1) * 0.5; // 0 to 1
    press1.ramMesh.position.y = 5.4 - stroke * 2.2;
    if (stroke > 0.95 && press1.hotBillet) {
      press1.hotBillet.material.emissiveIntensity = 1.0;
    } else if (press1.hotBillet) {
      press1.hotBillet.material.emissiveIntensity = 0.5;
    }
  }

  // 6. PRESS-02 Animation (Extrusion Press)
  const press2 = machines.get("PRESS-02");
  if (press2 && press2.extrusionRam) {
    press2.extrusionRam.position.x = -1.0 + Math.sin(t * 1.2) * 0.7;
  }

  // 7. FURN-01 Animation (Carburizing Furnace Glow)
  const furn1 = machines.get("FURN-01");
  if (furn1 && furn1.glowPort) {
    const pulse = 0.7 + Math.sin(t * 3.0) * 0.3;
    furn1.glowPort.material.opacity = pulse;
  }

  // 8. ROBOT-01 Animation (6-DOF Arm Kinematics)
  const robot1 = machines.get("ROBOT-01");
  if (robot1) {
    if (robot1.robotRoot) robot1.robotRoot.rotation.y = Math.sin(t * 0.9) * 0.4;
    if (robot1.robotJ2) robot1.robotJ2.rotation.z = Math.sin(t * 1.4) * 0.15;
    if (robot1.robotJ3) robot1.robotJ3.rotation.z = -Math.cos(t * 1.4) * 0.15;
  }

  // 9. LASER-01 Animation (Metrology Scan Plane)
  const laser1 = machines.get("LASER-01");
  if (laser1 && laser1.laserPlane) {
    laser1.laserPlane.position.x = Math.sin(t * 2.5) * 1.2;
  }

  // 10. CONV-01 Animation (Conveyor Pallets & Laser QC)
  const conv1 = machines.get("CONV-01");
  if (conv1 && conv1.crates) {
    conv1.crates.forEach(crate => {
      crate.position.x += 0.045;
      if (crate.position.x > 10.0) crate.position.x = -10.0;
    });
    if (conv1.tunnelLaser) {
      conv1.tunnelLaser.position.x = Math.sin(t * 3.5) * 0.45;
    }
  }

  // 11. AGV Navigation & Sensor Animation
  updateAGVNavigation();

  [agvRobot1, agvRobot2].forEach(agv => {
    if (agv) {
      if (agv.wheels) agv.wheels.forEach(w => { w.rotation.x += 0.15; });
      if (agv.lidarPuck) agv.lidarPuck.rotation.y += 0.2;
      if (agv.lidarCone) agv.lidarCone.material.opacity = 0.15 + Math.sin(t * 6.0) * 0.06;
      if (agv.strobeBeacon) agv.strobeBeacon.material.opacity = (Math.sin(t * 12.0) > 0) ? 1.0 : 0.2;
    }
  });

  // 12. Radar Scan Sweep
  if (radarScanning && radarMesh) {
    radarProgress += 0.015;
    radarMesh.position.z = -20 + radarProgress * 40;
    radarMesh.material.opacity = Math.sin(radarProgress * Math.PI) * 0.8;
    if (radarProgress >= 1.0) {
      radarScanning = false;
      radarMesh.material.opacity = 0;
      radarMesh.position.z = -20;
    }
  }

  // Render Scene
  renderer.render(scene, camera);
}

function onWindowResize() {
  if (!containerEl || !camera || !renderer) return;
  const w = containerEl.clientWidth;
  const h = containerEl.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

// Raycasting to pick machines by clicking
const raycaster = new THREE.Raycaster();
const mouseVec = new THREE.Vector2();

export function pickMachine(clientX, clientY) {
  if (!containerEl) return null;
  const rect = containerEl.getBoundingClientRect();
  mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouseVec, camera);

  const interactables = [];
  machines.forEach(group => {
    group.traverse(child => {
      if (child.isMesh) {
        child.userData.rootMachineId = group.userData.id;
        interactables.push(child);
      }
    });
  });

  const intersects = raycaster.intersectObjects(interactables, false);
  if (intersects.length > 0) {
    return intersects[0].object.userData.rootMachineId;
  }
  return null;
}

// Coordinate projection helper: 3D world to 2D screen coordinates
export function getMachineScreenPositions() {
  const result = [];
  if (!containerEl || !camera) return result;

  const rect = containerEl.getBoundingClientRect();
  const widthHalf = rect.width / 2;
  const heightHalf = rect.height / 2;

  machines.forEach((group, id) => {
    const worldPos = new THREE.Vector3();
    group.getWorldPosition(worldPos);

    let yOffset = 5.2;
    if (id === "PRESS-01") yOffset = 8.5;
    else if (id === "PRESS-02") yOffset = 3.6;
    else if (id === "FURN-01") yOffset = 4.8;
    else if (id === "ROBOT-01") yOffset = 4.2;
    else if (id === "LASER-01") yOffset = 4.6;
    else if (id === "CONV-01") yOffset = 3.2;

    worldPos.y += yOffset;
    const ndc = worldPos.clone().project(camera);
    const isVisible = ndc.z < 1;

    const screenX = (ndc.x * widthHalf) + widthHalf + rect.left;
    const screenY = -(ndc.y * heightHalf) + heightHalf + rect.top;

    result.push({
      id,
      x: screenX,
      y: screenY,
      visible: isVisible,
      state: telemetryState[id]
    });
  });

  return result;
}

export function getMachines() {
  return machines;
}

export const updateMachineStates = updateFleetTelemetry;
export const triggerRadarScan = triggerRadarSweep;
export function focusOnMachine(machineId) { setCameraPreset(machineId); }
export function resetCamera() { setCameraPreset('global'); }
