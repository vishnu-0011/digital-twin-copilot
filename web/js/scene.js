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
  createFactoryBuildingShell,
  createTownEnvironment,
  updateTrafficVehicles,
  setFactoryTheme
} from './models.js';

let scene, camera, renderer, controls;
let containerEl;
let ambientLight, dirLight, fillLight, hemiLight;
let dustParticles = null;
const dustCount = 200;
let factoryFloor;
let factoryBuilding = null;
let townEnvironment = null;
let skyDome = null;

/** Gradient sky: the horizon matches the fog colour, so ground and sky meet seamlessly. */
function buildSkyDome() {
  const geo = new THREE.SphereGeometry(450, 48, 24);
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3), 3));
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false });
  const dome = new THREE.Mesh(geo, mat);
  dome.renderOrder = -1;
  return dome;
}

function paintSky(topHex, horizonHex) {
  if (!skyDome) return;
  const pos = skyDome.geometry.attributes.position;
  const col = skyDome.geometry.attributes.color;
  const top = new THREE.Color(topHex), hor = new THREE.Color(horizonHex), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const k = Math.pow(Math.max(0, pos.getY(i) / 450), 0.55);
    c.copy(hor).lerp(top, k);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
}
let isInteriorMode = false;
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
const defaultCamPos = new THREE.Vector3(32, 24, 30);
const defaultLookAt = new THREE.Vector3(0, 2, 0);

// Campus / Town Overview Camera
const campusCamPos = new THREE.Vector3(76, 52, 76);
const campusLookAt = new THREE.Vector3(0, 2, 8);

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
  const width = container.clientWidth || window.innerWidth || 1200;
  const height = container.clientHeight || window.innerHeight || 800;

  // 1. Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1f5f9); // Cleanroom daylight default
  scene.fog = new THREE.FogExp2(0xf1f5f9, 0.005);

  // 2. Camera: starts in Campus / Town overview so user sees the building and bustling town
  camera = new THREE.PerspectiveCamera(38, Math.max(0.1, width / Math.max(1, height)), 0.5, 600);
  camera.position.copy(campusCamPos);

  // 3. Renderer with robust fallback and high-precision depth buffer
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "default",
      logarithmicDepthBuffer: true
    });
  } catch (err) {
    console.warn("Standard WebGLRenderer with logarithmicDepthBuffer failed, trying standard fallback:", err);
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "default" });
    } catch (fallbackErr) {
      console.warn("Standard WebGLRenderer failed, trying minimal fallback:", fallbackErr);
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
      } catch (fatalErr) {
        console.error("WebGL completely unavailable:", fatalErr);
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'webgl-fallback-notice';
        fallbackDiv.innerHTML = `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: var(--text-main); font-family: var(--font-sans); padding: 28px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-hud); max-width: 520px; z-index: 5;">
            <h3 style="margin-bottom: 8px; color: var(--color-amber);">⚠️ 3D WebGL Acceleration Not Active</h3>
            <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted); margin-bottom: 12px;">WebGL context could not be created in this browser profile. The 2D Operations Dashboard, Live Telemetry Stream, Predictive Health Analytics, and Standard Operating Procedures remain fully operational.</p>
            <p style="font-size: 12px; color: var(--text-dim);">To enable 3D: Ensure hardware acceleration is enabled in Chrome Settings &gt; System.</p>
          </div>
        `;
        container.appendChild(fallbackDiv);
        return { scene: null, camera: null, renderer: null, controls: null, machines: new Map() };
      }
    }
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 4. Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.copy(campusLookAt);
  controls.maxPolarAngle = Math.PI / 2.05;
  controls.minDistance = 12;
  controls.maxDistance = 180;
  controls.addEventListener('start', () => {
    agv1FollowMode = false;
    agv2FollowMode = false;
  });

  // 5. Lighting Setup
  setupLighting();

  // 6. Build Factory Assets (Floor & 8 Workcells)
  factoryFloor = createFactoryFloor(scene);

  // Build Surrounding Town & Campus (Roads, Vehicles, Parking, Pedestrian Corridor, Skyline)
  townEnvironment = createTownEnvironment();
  scene.add(townEnvironment.townGroup);

  // Ground that runs to the horizon and dissolves into the fog, so the campus
  // sits in a landscape instead of on a slab floating in a void.
  const lawn = townEnvironment.townGroup.children[0].material;
  const horizonGround = new THREE.Mesh(new THREE.CircleGeometry(440, 72), lawn);
  horizonGround.rotation.x = -Math.PI / 2;
  horizonGround.position.y = -0.41;
  horizonGround.receiveShadow = true;
  townEnvironment.townGroup.add(horizonGround);
  skyDome = buildSkyDome();
  scene.add(skyDome);

  // Build Factory Architectural Building Shell (Walls, Entrance Canopy, Dollhouse Roof)
  factoryBuilding = createFactoryBuildingShell();
  scene.add(factoryBuilding.buildingGroup);

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

  // Enable realistic contact shadows and depth across all equipment and architecture
  const rootGroups = [
    factoryFloor,
    townEnvironment.townGroup,
    factoryBuilding.buildingGroup,
    cnc1, cnc2, press1, press2, furn1, robot1, laser1, conv1,
    agvRobot1, agvRobot2
  ];

  rootGroups.forEach(grp => {
    if (!grp) return;
    grp.traverse(child => {
      if (child.isMesh) {
        const mat = child.material;
        const isTransparent = mat && (mat.transparent || (mat.opacity !== undefined && mat.opacity < 0.9));
        const isBasic = mat instanceof THREE.MeshBasicMaterial;
        if (!isTransparent && !isBasic) {
          child.castShadow = true;
          child.receiveShadow = true;
        } else {
          child.receiveShadow = true;
        }
      }
    });
  });

  // 7. Radar Scanner Plane
  setupRadarScanner();

  // 8. Atmospheric Industrial Dust Particles (Cyberpunk dark mode)
  setupAtmosphericDustMotes();

  // 9. Event Listeners
  window.addEventListener('resize', onWindowResize);

  // 10. Start Animation Loop
  animate(0);

  return { scene, camera, renderer, controls, machines };
}

function setupLighting() {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.45);
  hemiLight.position.set(0, 40, 0);
  scene.add(hemiLight);

  dirLight = new THREE.DirectionalLight(0xffffff, 1.45);
  dirLight.position.set(32, 54, 32);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 240;
  dirLight.shadow.camera.left = -75;
  dirLight.shadow.camera.right = 75;
  dirLight.shadow.camera.top = 70;
  dirLight.shadow.camera.bottom = -70;
  dirLight.shadow.bias = -0.0004;
  scene.add(dirLight);

  fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.7);
  fillLight.position.set(-36, 24, -30);
  scene.add(fillLight);
}

function setupAtmosphericDustMotes() {
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 60;
    dustPositions[i * 3 + 1] = 0.5 + Math.random() * 12;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 44;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.18,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
  });
  dustParticles = new THREE.Points(dustGeo, dustMat);
  dustParticles.visible = false;
  scene.add(dustParticles);
}

export function setSceneTheme(themeName) {
  const isLight = themeName !== 'dark';
  setFactoryTheme(isLight);

  if (!scene || !ambientLight) return;

  if (isLight) {
    scene.background.setHex(0xf1f5f9);
    scene.fog.color.setHex(0xf1f5f9);
    paintSky(0xbfd6ec, 0xf1f5f9);
    ambientLight.color.setHex(0xffffff);
    ambientLight.intensity = 0.75;
    if (hemiLight) {
      hemiLight.color.setHex(0xffffff);
      hemiLight.groundColor.setHex(0x94a3b8);
      hemiLight.intensity = 0.45;
    }
    dirLight.color.setHex(0xffffff);
    dirLight.intensity = 1.45;
    fillLight.color.setHex(0xe2e8f0);
    fillLight.intensity = 0.7;
    if (dustParticles) dustParticles.visible = false;
    if (radarMesh) radarMesh.material.color.setHex(0x0284c7);
  } else {
    // AUTHENTIC CYBERPUNK STRATEGY DARK THEME
    scene.background.setHex(0x0b1019);
    scene.fog.color.setHex(0x0b1019);
    paintSky(0x02040a, 0x0b1019);
    ambientLight.color.setHex(0x182436);
    ambientLight.intensity = 1.4;
    if (hemiLight) {
      hemiLight.color.setHex(0x38bdf8);
      hemiLight.groundColor.setHex(0x070a10);
      hemiLight.intensity = 0.75;
    }
    dirLight.color.setHex(0xffffff);
    dirLight.intensity = 2.2;
    fillLight.color.setHex(0x00f3ff);
    fillLight.intensity = 0.35;
    if (dustParticles) dustParticles.visible = true;
    if (radarMesh) radarMesh.material.color.setHex(0x00f3ff);
  }

  // Dynamic AGV spotlight & laser beam adaptation
  [agvRobot1, agvRobot2].forEach(agv => {
    if (agv) {
      if (agv.driveLight) {
        agv.driveLight.color.setHex(isLight ? 0x0284c7 : 0x00f3ff);
        agv.driveLight.intensity = isLight ? 2.0 : 3.5;
      }
      if (agv.lidarCone) {
        agv.lidarCone.material.color.setHex(isLight ? 0x0284c7 : 0x00f3ff);
      }
    }
  });
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

let modeChangeHandler = null;

export function registerModeChangeHandler(fn) {
  modeChangeHandler = fn;
}

export function setInteriorMode(enable, shouldTween = true) {
  isInteriorMode = enable;
  if (factoryBuilding) {
    if (factoryBuilding.roofGroup) factoryBuilding.roofGroup.visible = !enable;
    if (factoryBuilding.upperWallsGroup) factoryBuilding.upperWallsGroup.visible = !enable;
  }
  if (shouldTween) {
    if (enable) {
      targetCamPos = defaultCamPos.clone();
      targetLookAt = defaultLookAt.clone();
    } else {
      targetCamPos = campusCamPos.clone();
      targetLookAt = campusLookAt.clone();
    }
  }
  if (modeChangeHandler) {
    modeChangeHandler(isInteriorMode);
  }
}

export function getInteriorMode() {
  return isInteriorMode;
}

export function setCameraPreset(presetName, immediate = false) {
  agv1FollowMode = false;
  agv2FollowMode = false;

  switch (presetName) {
    case 'campus':
      setInteriorMode(false);
      break;
    case 'global':
    case 'interior':
      setInteriorMode(true, true);
      break;
    case 'bay1': // Machining Bay (CNC-01 & CNC-02)
      setInteriorMode(true, false);
      targetCamPos = new THREE.Vector3(-11, 13, 0);
      targetLookAt = new THREE.Vector3(-11, 2.2, -10);
      break;
    case 'bay2': // Forming & Heat (PRESS-01, PRESS-02, FURN-01)
      setInteriorMode(true, false);
      targetCamPos = new THREE.Vector3(13, 15, 2);
      targetLookAt = new THREE.Vector3(13, 3, -8);
      break;
    case 'bay3': // Robotics & QC (ROBOT-01, LASER-01)
      setInteriorMode(true, false);
      targetCamPos = new THREE.Vector3(-11, 13, 17);
      targetLookAt = new THREE.Vector3(-11, 2.2, 8);
      break;
    case 'bay4': // Assembly Line (CONV-01)
      setInteriorMode(true, false);
      targetCamPos = new THREE.Vector3(13, 13, 17);
      targetLookAt = new THREE.Vector3(13, 2, 8);
      break;
    case 'agv1':
      setInteriorMode(true, false);
      agv1FollowMode = true;
      break;
    case 'agv2':
      setInteriorMode(true, false);
      agv2FollowMode = true;
      break;
    case 'parking': // Company Parking Lot & Guardhouse
      if (factoryBuilding) {
        if (factoryBuilding.roofGroup) factoryBuilding.roofGroup.visible = true;
        if (factoryBuilding.upperWallsGroup) factoryBuilding.upperWallsGroup.visible = true;
      }
      isInteriorMode = false;
      targetCamPos = new THREE.Vector3(-34, 15, 48);
      targetLookAt = new THREE.Vector3(-24, 2, 32);
      break;
    case 'entrance': // Main Entrance & Covered Walkway Corridor
      if (factoryBuilding) {
        if (factoryBuilding.roofGroup) factoryBuilding.roofGroup.visible = true;
        if (factoryBuilding.upperWallsGroup) factoryBuilding.upperWallsGroup.visible = true;
      }
      isInteriorMode = false;
      targetCamPos = new THREE.Vector3(-14, 11, 42.0);
      targetLookAt = new THREE.Vector3(-4, 3.6, 25.0);
      break;
    default:
      // Focus on specific machine ID with close-up dramatic angle
      setInteriorMode(true, false);
      if (machines.has(presetName)) {
        const m = machines.get(presetName);
        targetCamPos = new THREE.Vector3(m.position.x + 6.2, m.position.y + 5.2, m.position.z + 6.2);
        targetLookAt = new THREE.Vector3(m.position.x, m.position.y + 1.8, m.position.z);
      }
      break;
  }

  if (immediate && targetCamPos && targetLookAt) {
    camera.position.copy(targetCamPos);
    controls.target.copy(targetLookAt);
    controls.update();
    targetCamPos = null;
    targetLookAt = null;
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
      plan: m.plan || null,
    };

    if (group && group.statusRing) {
      const stat = (m.status || "HEALTHY").toUpperCase();
      let col = 0x059669; // Emerald green
      if (m.plan) col = m.plan.hex; // One status ladder: same colours as badges and lists
      else if (stat === "CRITICAL" || stat === "FAILED") col = 0xdc2626;
      else if (stat === "WARNING" || stat === "DEGRADING") col = 0xd97706;
      else if (stat === "IN_MAINTENANCE") col = 0x0284c7; // Service blue
      // Attention mode: healthy machines go quiet so problems stand out.
      group.statusRing.visible = !(attentionMode && m.plan && m.plan.rank < 2);

      group.statusRing.material.color.setHex(col);

      if (group.beaconLight) {
        group.beaconLight.material.color.setHex(col);
      }
    }
    const rank = m.plan ? m.plan.rank : 0;
    setAlertHalo(id, rank >= 3 ? (rank >= 4 ? 0xef4444 : 0xf59e0b) : null, rank >= 4);
  });
}

/* --------------------------------------------------------------------------
   Alert halos: a pulsing ring (and a light column for urgent ones) on every
   machine that needs service, so problems are visible from any camera angle.
   -------------------------------------------------------------------------- */
let attentionMode = false;
const alertHalos = new Map(); // id -> { group, urgent }

export function setAttentionMode(on) {
  attentionMode = !!on;
  Object.keys(telemetryState).forEach(id => {
    const g = machines.get(id);
    const plan = telemetryState[id] && telemetryState[id].plan;
    if (g && g.statusRing) g.statusRing.visible = !(attentionMode && plan && plan.rank < 2);
  });
  alertHalos.forEach(h => { h.group.visible = h.color != null; });
}

export function getAttentionMode() { return attentionMode; }

function setAlertHalo(id, color, urgent) {
  if (!scene) return;
  let h = alertHalos.get(id);
  if (color == null) {
    if (h) { h.group.visible = false; h.color = null; }
    return;
  }
  if (!h) {
    const group = buildTourBeacon();
    group.name = `AlertHalo-${id}`;
    h = { group, color: null, urgent: false };
    alertHalos.set(id, h);
  }
  const { ring, pulse, beam } = h.group.userData;
  if (h.color !== color) {
    ring.material.color.setHex(color);
    pulse.material.color.setHex(color);
    beam.material.color.setHex(color);
    h.color = color;
  }
  h.urgent = urgent;
  beam.visible = urgent;
  const obj = machines.get(id);
  if (obj) {
    const p = new THREE.Vector3();
    obj.getWorldPosition(p);
    h.group.position.set(p.x, 0, p.z);
  }
  h.group.visible = isInteriorMode;
}

function updateAlertHalos(t) {
  alertHalos.forEach(h => {
    if (h.color == null) return;
    h.group.visible = isInteriorMode;
    const { ring, pulse, beam } = h.group.userData;
    const speed = h.urgent ? 1.1 : 0.55;
    const k = (t * speed) % 1;
    const big = attentionMode ? 1.15 : 1.0;
    ring.scale.setScalar(big * (1 + Math.sin(t * 3) * 0.03));
    pulse.scale.setScalar(big * (1 + k * (h.urgent ? 1.1 : 0.6)));
    pulse.material.opacity = (h.urgent ? 0.85 : 0.55) * (1 - k);
    ring.material.opacity = h.urgent ? 0.9 : 0.6;
    beam.material.opacity = 0.07 + Math.sin(t * 2.2) * 0.03;
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

      // Physically coupled zero-slip wheel rotation
      if (typeof agvRobot1.rollWheels === 'function') {
        agvRobot1.rollWheels(agv1Speed);
      } else if (agvRobot1.wheels) {
        agvRobot1.wheels.forEach(w => { w.rotation.z -= agv1Speed / 0.28; });
      }
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

      // Physically coupled zero-slip wheel rotation
      if (typeof agvRobot2.rollWheels === 'function') {
        agvRobot2.rollWheels(agv2Speed);
      } else if (agvRobot2.wheels) {
        agvRobot2.wheels.forEach(w => { w.rotation.z -= agv2Speed / 0.28; });
      }
    }

    if (agv2FollowMode) {
      camera.position.set(agvRobot2.position.x + 6, agvRobot2.position.y + 6, agvRobot2.position.z + 6);
      controls.target.set(agvRobot2.position.x, agvRobot2.position.y + 1, agvRobot2.position.z);
    }
  }
}

function animate(time) {
  requestAnimationFrame(animate);
  if (!renderer || !scene || !camera || !controls) return;
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

  // Automatic transition to Campus View when zooming far out of the plant
  if (isInteriorMode && !targetCamPos && !agv1FollowMode && !agv2FollowMode) {
    const camDist = camera.position.distanceTo(controls.target);
    if (camDist >= 145.0) {
      setInteriorMode(false, false);
    }
  }

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

  // 13. Atmospheric Dust Particles Gentle Drift (Dark Mode)
  if (dustParticles && dustParticles.visible) {
    dustParticles.rotation.y = time * 0.00003;
    const pos = dustParticles.geometry.attributes.position.array;
    for (let i = 1; i < dustCount * 3; i += 3) {
      pos[i] += Math.sin(time * 0.001 + i) * 0.003;
    }
    dustParticles.geometry.attributes.position.needsUpdate = true;
  }

  // 14. Town Traffic Animation
  if (townEnvironment && townEnvironment.trafficVehicles) {
    updateTrafficVehicles(townEnvironment.trafficVehicles, 0.016);
  }

  // 15. Rooftop HVAC Chiller Fan Blades Animation
  if (factoryBuilding && factoryBuilding.rooftopFans) {
    factoryBuilding.rooftopFans.forEach(f => {
      f.rotation.y += 0.25;
    });
  }

  // 16. Guided-tour beacon (pulsing floor ring + light column on the explained asset)
  updateTourBeacon(t);
  updateAlertHalos(t);
  applyViewInset();

  // Render Scene
  renderer.render(scene, camera);
}

/* --------------------------------------------------------------------------
   View inset: side panels cover part of the canvas, so the camera's optical
   centre is shifted to the middle of the area that is actually visible.
   Projection, picking and badge placement all follow automatically.
   -------------------------------------------------------------------------- */
let viewInsetTarget = 0;   // px: positive moves the picture right
let viewInsetCur = 0;

export function setViewInset(leftPx = 0, rightPx = 0) {
  viewInsetTarget = (leftPx - rightPx) / 2;
}

function applyViewInset() {
  if (!camera || !containerEl) return;
  const diff = viewInsetTarget - viewInsetCur;
  if (Math.abs(diff) < 0.5 && viewInsetCur === viewInsetTarget) return;
  viewInsetCur = Math.abs(diff) < 0.5 ? viewInsetTarget : viewInsetCur + diff * 0.12;
  const w = containerEl.clientWidth, h = containerEl.clientHeight;
  if (Math.abs(viewInsetCur) < 0.5) camera.clearViewOffset();
  else camera.setViewOffset(w, h, -viewInsetCur, 0, w, h);
}

function onWindowResize() {
  if (!containerEl || !camera || !renderer) return;
  const w = containerEl.clientWidth;
  const h = containerEl.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  viewInsetCur = viewInsetCur + 0.01; // force re-apply at the new size
  applyViewInset();
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

  // If in Campus view: clicking on the building exterior or roof triggers "ENTER_FACTORY"
  if (!isInteriorMode) {
    if (factoryBuilding && factoryBuilding.exteriorInteractables) {
      const hits = raycaster.intersectObjects(factoryBuilding.exteriorInteractables, false);
      if (hits.length > 0) {
        setInteriorMode(true);
        return "ENTER_FACTORY";
      }
    }
  }

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

  // In Campus view: Project a single prominent Campus Badge over the building roof!
  if (!isInteriorMode) {
    const campusWorldPos = new THREE.Vector3(0, 13.5, 12.0);
    const ndc = campusWorldPos.project(camera);
    if (ndc.z < 1) {
      const screenX = (ndc.x * widthHalf) + widthHalf + rect.left;
      const screenY = -(ndc.y * heightHalf) + heightHalf + rect.top;
      result.push({
        id: "CAMPUS-PORTAL",
        x: screenX,
        y: screenY,
        visible: true,
        isCampus: true,
        name: "TITAN AEROSPACE CAMPUS",
        desc: "8 Workcells Active • Click to Enter"
      });
    }
    return result;
  }

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
export function focusOnMachine(machineId, immediate = false) { setCameraPreset(machineId, immediate); }
/** Opening shot: start high and far out over the campus, then let the next
 *  camera preset ease in (the roofless building reveals the live floor). */
export function startFlyIn() {
  if (!camera) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  camera.position.set(210, 150, 250);
  if (controls) controls.target.set(0, 0, 0);
}

export function resetCamera() { setCameraPreset(isInteriorMode ? 'global' : 'campus'); }

/* ==========================================================================
   GUIDED TOUR SUPPORT
   A pulsing floor ring + translucent light column that marks whatever the
   tour guide is currently talking about, and a projector that converts any
   tour target (machine or AMR) into screen coordinates for the leader line.
   ========================================================================== */
let tourBeacon = null;
let tourBeaconTarget = null;

function getTourTargetObject(id) {
  if (!id) return null;
  if (id === 'AGV-01' || id === 'agv1') return agvRobot1;
  if (id === 'AGV-02' || id === 'agv2') return agvRobot2;
  return machines.get(id) || null;
}

function buildTourBeacon() {
  const group = new THREE.Group();
  group.name = 'TourBeacon';

  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.0, 3.25, 64), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.06;
  group.add(ring);

  const pulseMat = ringMat.clone();
  const pulse = new THREE.Mesh(new THREE.RingGeometry(3.0, 3.12, 64), pulseMat);
  pulse.rotation.x = -Math.PI / 2;
  pulse.position.y = 0.07;
  group.add(pulse);

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9, transparent: true, opacity: 0.12, side: THREE.DoubleSide,
    depthWrite: false, blending: THREE.AdditiveBlending
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, 14, 48, 1, true), beamMat);
  beam.position.y = 7;
  group.add(beam);

  group.userData = { ring, pulse, beam };
  group.visible = false;
  scene.add(group);
  return group;
}

export function setTourBeacon(id) {
  if (!scene) return;
  if (!tourBeacon) tourBeacon = buildTourBeacon();
  tourBeaconTarget = id || null;
  tourBeacon.visible = !!getTourTargetObject(tourBeaconTarget);
}

function updateTourBeacon(t) {
  if (!tourBeacon || !tourBeacon.visible) return;
  const obj = getTourTargetObject(tourBeaconTarget);
  if (!obj) { tourBeacon.visible = false; return; }
  const p = new THREE.Vector3();
  obj.getWorldPosition(p);
  tourBeacon.position.set(p.x, 0, p.z);
  const small = obj === agvRobot1 || obj === agvRobot2;
  const base = small ? 0.55 : 1.0;
  const { ring, pulse, beam } = tourBeacon.userData;
  ring.scale.setScalar(base * (1 + Math.sin(t * 3) * 0.03));
  const k = (t * 0.7) % 1;
  pulse.scale.setScalar(base * (1 + k * 0.9));
  pulse.material.opacity = 0.8 * (1 - k);
  beam.scale.set(base, 1, base);
  beam.material.opacity = 0.09 + Math.sin(t * 2.2) * 0.03;
}

/** Fly the camera to an explicit shot (tour framing), with the roof cut away. */
export function setCameraShot(pos, look) {
  if (!camera || !controls) return;
  agv1FollowMode = false;
  agv2FollowMode = false;
  setInteriorMode(true, false);
  targetCamPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
  targetLookAt = new THREE.Vector3(look[0], look[1], look[2]);
}

/** Project a tour target (machine id, 'AGV-01', 'AGV-02') to client-space pixels. */
export function projectTourTarget(id, yOffset = 3.2) {
  const obj = getTourTargetObject(id);
  if (!obj || !camera || !containerEl) return null;
  const p = new THREE.Vector3();
  obj.getWorldPosition(p);
  p.y += yOffset;
  const ndc = p.project(camera);
  if (ndc.z >= 1 || Math.abs(ndc.x) > 1.2 || Math.abs(ndc.y) > 1.2) return null;
  const rect = containerEl.getBoundingClientRect();
  return {
    x: (ndc.x * 0.5 + 0.5) * rect.width + rect.left,
    y: (-ndc.y * 0.5 + 0.5) * rect.height + rect.top
  };
}
