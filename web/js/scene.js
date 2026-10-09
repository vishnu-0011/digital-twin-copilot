/**
 * 3D Isometric Factory Scene Engine
 * ===================================
 * Manages Three.js WebGL scene, lighting, isometric camera,
 * machine models, animation loops, raycasting, and radar sweep.
 */

import {
  createFactoryFloor,
  createCNCMill,
  createHydraulicPress,
  createConveyorLine,
  createAGVRobot
} from './models.js';

let scene, camera, renderer, controls;
let containerEl;
let factoryFloor, cncMill, hydraulicPress, conveyorLine, agvRobot;
const machines = new Map(); // id -> THREE.Group

// Radar sweep state
let radarMesh = null;
let radarScanning = false;
let radarProgress = 0;

// Camera tween state
let targetCamPos = null;
let targetLookAt = null;
let defaultCamPos = new THREE.Vector3(26, 22, 26);
let defaultLookAt = new THREE.Vector3(0, 2, 0);

// AGV Waypoint path
const agvWaypoints = [
  new THREE.Vector3(-14, 0, -10),
  new THREE.Vector3(14, 0, -10),
  new THREE.Vector3(14, 0, 11),
  new THREE.Vector3(-14, 0, 11),
];
let agvCurrentWp = 0;
let agvSpeed = 0.08;

// Machine live telemetry state cache
const telemetryState = {
  "CNC-01": { status: "HEALTHY", wear: 0.1, vibration: 0.15, rpm: 1200 },
  "PRESS-01": { status: "HEALTHY", wear: 0.15, pressure: 210 },
  "CONV-01": { status: "HEALTHY", wear: 0.05, speed: 1.0 }
};

export function initScene(container) {
  containerEl = container;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // 1. Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090c12);
  scene.fog = new THREE.FogExp2(0x090c12, 0.012);

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
  controls.maxPolarAngle = Math.PI / 2.05; // Prevent going beneath floor
  controls.minDistance = 10;
  controls.maxDistance = 75;

  // 5. Lighting
  setupLighting();

  // 6. Build Factory Assets
  factoryFloor = createFactoryFloor(scene);

  cncMill = createCNCMill({ x: -8, y: 0, z: -4 });
  scene.add(cncMill);
  machines.set("CNC-01", cncMill);

  hydraulicPress = createHydraulicPress({ x: 8, y: 0, z: -4 });
  scene.add(hydraulicPress);
  machines.set("PRESS-01", hydraulicPress);

  conveyorLine = createConveyorLine({ x: 0, y: 0, z: 6 });
  scene.add(conveyorLine);
  machines.set("CONV-01", conveyorLine);

  agvRobot = createAGVRobot();
  agvRobot.position.copy(agvWaypoints[0]);
  scene.add(agvRobot);

  // 7. Radar Scanner Plane
  setupRadarScanner();

  // 8. Event Listeners
  window.addEventListener('resize', onWindowResize);

  // 9. Start Animation Loop
  animate(0);

  return { scene, camera, renderer, controls, machines };
}

function setupLighting() {
  // Industrial Ambient Light
  const ambientLight = new THREE.AmbientLight(0x182436, 1.4);
  scene.add(ambientLight);

  // Hemisphere Light (Sky cyan / Ground charcoal)
  const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x070a10, 0.7);
  hemiLight.position.set(0, 30, 0);
  scene.add(hemiLight);

  // Main Factory Key Floodlight
  const dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
  dirLight.position.set(24, 34, 18);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 80;
  const d = 22;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  // Cyan and Orange Strategy Accent Lights
  const cyanPoint = new THREE.PointLight(0x00f3ff, 2.5, 25);
  cyanPoint.position.set(-8, 5, -3);
  scene.add(cyanPoint);

  const orangePoint = new THREE.PointLight(0xff6b2b, 2.5, 25);
  orangePoint.position.set(8, 6, -3);
  scene.add(orangePoint);

  const greenPoint = new THREE.PointLight(0x10b981, 1.8, 25);
  greenPoint.position.set(0, 4, 7);
  scene.add(greenPoint);
}

function setupRadarScanner() {
  const radarGeo = new THREE.PlaneGeometry(36, 1.2);
  const radarMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  radarMesh = new THREE.Mesh(radarGeo, radarMat);
  radarMesh.rotation.x = -Math.PI / 2;
  radarMesh.position.set(0, 0.05, -16);
  scene.add(radarMesh);
}

export function triggerRadarScan() {
  radarScanning = true;
  radarProgress = 0;
  if (radarMesh) {
    radarMesh.material.opacity = 0.85;
  }
}

export function focusOnMachine(machineId) {
  const machine = machines.get(machineId);
  if (!machine) return;

  const mPos = machine.position;
  // Offset camera for comfortable isometric inspection angle
  targetCamPos = new THREE.Vector3(mPos.x + 10, mPos.y + 9, mPos.z + 10);
  targetLookAt = new THREE.Vector3(mPos.x, mPos.y + 2.5, mPos.z);
}

export function resetCamera() {
  targetCamPos = defaultCamPos.clone();
  targetLookAt = defaultLookAt.clone();
}

export function updateMachineStates(fleetData) {
  if (!fleetData || !Array.isArray(fleetData)) return;

  fleetData.forEach(item => {
    const id = item.machine_id;
    const machine = machines.get(id);
    if (!machine) return;

    // Cache telemetry
    const rawStatus = (item.status || "HEALTHY").toUpperCase();
    const rulVal = item.predicted_rul_cycles != null ? Math.round(item.predicted_rul_cycles) : (item.rul_cycles != null ? item.rul_cycles : null);
    const tempVal = item.temperature_c != null ? item.temperature_c : (item.temperature || 42.0);

    telemetryState[id] = {
      status: rawStatus,
      wear: item.wear_level || 0,
      rul: rulVal,
      temperature: tempVal,
      vibration: item.vibration_rms || 0.15,
      load: item.load_factor || 0.8
    };

    // Color definitions
    let statusColor = 0x00ff88; // Healthy Green
    if (rawStatus === "WARNING" || rawStatus === "DEGRADING") statusColor = 0xf59e0b; // Amber
    else if (rawStatus === "CRITICAL" || rawStatus === "FAILED") statusColor = 0xef4444; // Red
    else if (rawStatus === "REPAIRING" || rawStatus === "IN_MAINTENANCE") statusColor = 0x00d2ff; // Cyan

    // Update Ground Halo
    if (machine.statusRing) {
      machine.statusRing.material.color.setHex(statusColor);
    }

    // Update Beacon Tower
    if (machine.beaconLight) {
      machine.beaconLight.material.color.setHex(statusColor);
    }

    // Update Heat Aura
    if (machine.heatAura) {
      const wear = item.wear_level || 0;
      // Glow intensifies as wear rises above 0.4
      const opacity = wear > 0.4 ? Math.min(0.65, (wear - 0.3) * 1.2) : 0.0;
      machine.heatAura.material.opacity = opacity;
      if (wear > 0.75) {
        machine.heatAura.material.color.setHex(0xff0033);
      } else {
        machine.heatAura.material.color.setHex(0xff5500);
      }
    }
  });
}

function updateAGVNavigation() {
  if (!agvRobot) return;

  const target = agvWaypoints[agvCurrentWp];
  const dir = new THREE.Vector3().subVectors(target, agvRobot.position);
  dir.y = 0;
  const dist = dir.length();

  if (dist < 0.4) {
    agvCurrentWp = (agvCurrentWp + 1) % agvWaypoints.length;
  } else {
    dir.normalize();
    agvRobot.position.addScaledVector(dir, agvSpeed);
    // Smooth rotation towards travel direction
    const targetAngle = Math.atan2(dir.x, dir.z);
    agvRobot.rotation.y = THREE.MathUtils.lerp(agvRobot.rotation.y, targetAngle, 0.1);
  }
}

function animate(time) {
  requestAnimationFrame(animate);

  const t = time * 0.001;

  // 1. Controls update
  controls.update();

  // 2. Camera transition tweening
  if (targetCamPos && targetLookAt) {
    camera.position.lerp(targetCamPos, 0.05);
    controls.target.lerp(targetLookAt, 0.05);

    if (camera.position.distanceTo(targetCamPos) < 0.1 && controls.target.distanceTo(targetLookAt) < 0.1) {
      targetCamPos = null;
      targetLookAt = null;
    }
  }

  // 3. CNC-01 Spindle & Vibration
  if (cncMill && cncMill.spindleTool) {
    const cncState = telemetryState["CNC-01"];
    const isRunning = cncState && cncState.status !== "CRITICAL";
    if (isRunning) {
      cncMill.spindleTool.rotation.y += 0.35;
    }

    // Dynamic physical wear vibration jitter
    if (cncState && cncState.wear > 0.5) {
      const jitter = (cncState.wear - 0.4) * 0.035;
      cncMill.position.x = -8 + (Math.random() - 0.5) * jitter;
      cncMill.position.z = -4 + (Math.random() - 0.5) * jitter;
    } else {
      cncMill.position.set(-8, 0, -4);
    }
  }

  // 4. PRESS-01 Hydraulic Ram Stamping
  if (hydraulicPress && hydraulicPress.ramMesh) {
    const pressState = telemetryState["PRESS-01"];
    const isRunning = pressState && pressState.status !== "CRITICAL";
    if (isRunning) {
      // Stamping cycle: sinusoidal plunge
      const ramY = 4.5 + Math.sin(t * 3.2) * 1.6;
      hydraulicPress.ramMesh.position.y = ramY;
    }

    // Wear shudder
    if (pressState && pressState.wear > 0.6) {
      const jitter = (pressState.wear - 0.5) * 0.03;
      hydraulicPress.position.x = 8 + (Math.random() - 0.5) * jitter;
      hydraulicPress.position.z = -4 + (Math.random() - 0.5) * jitter;
    } else {
      hydraulicPress.position.set(8, 0, -4);
    }
  }

  // 5. CONV-01 Conveyor looping pallets
  if (conveyorLine && conveyorLine.crates) {
    const convState = telemetryState["CONV-01"];
    const isRunning = convState && convState.status !== "CRITICAL";
    if (isRunning) {
      conveyorLine.crates.forEach(crate => {
        crate.position.x += 0.05;
        if (crate.position.x > 9.5) {
          crate.position.x = -9.5;
        }
      });
    }
  }

  // 6. AGV Autonomous Navigation
  updateAGVNavigation();

  // 7. Radar Scan Sweep
  if (radarScanning && radarMesh) {
    radarProgress += 0.015;
    radarMesh.position.z = -16 + radarProgress * 32;
    radarMesh.material.opacity = Math.sin(radarProgress * Math.PI) * 0.8;

    if (radarProgress >= 1.0) {
      radarScanning = false;
      radarMesh.material.opacity = 0;
      radarMesh.position.z = -16;
    }
  }

  // 8. Render
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
    const rootId = intersects[0].object.userData.rootMachineId;
    return rootId;
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

    // Height offset for floating label above machine top
    let yOffset = 5.2;
    if (id === "PRESS-01") yOffset = 8.5;
    else if (id === "CONV-01") yOffset = 3.2;

    worldPos.y += yOffset;

    // Project to NDC (-1 to +1)
    const ndc = worldPos.clone().project(camera);

    // Check if behind camera
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
