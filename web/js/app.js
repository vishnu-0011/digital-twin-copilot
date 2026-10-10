/**
 * Application Main Controller (Titan Aerospace Precision Fab)
 * ============================================================
 * Connects Three.js 3D isometric scene, Camera Director,
 * Process Pipeline Flow Bar, SCADA Inspection Drawer,
 * Web Audio sound effects, and FastAPI backend endpoints.
 */

import {
  initScene,
  updateMachineStates,
  triggerRadarScan,
  focusOnMachine,
  resetCamera,
  setCameraPreset,
  setSceneTheme,
  pickMachine,
  getMachineScreenPositions
} from './scene.js';

import {
  initHUD,
  updateFloatingBadges,
  updateTopKPIs,
  populateDrawer,
  closeDrawer,
  getSelectedMachineId,
  renderPipelineFlow,
  addLogMessage
} from './hud.js';

import {
  playClick,
  playScan,
  playAlarm,
  playRepairSuccess,
  toggleMute,
  isMuted
} from './audio.js';

let fleetCache = [];
let pollIntervalId = null;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  // 1. Initialize 3D WebGL Scene
  initScene(container);

  // Apply default theme to Three.js scene
  const initialTheme = localStorage.getItem('titan_theme') || 'light';
  setSceneTheme(initialTheme);

  // 2. Initialize HUD, Badges & Pipeline UI
  initHUD(selectMachine, (theme) => setSceneTheme(theme));

  // 3. Setup UI Event Listeners (Controls & Camera Director)
  setupControls(container);

  // 4. Start Telemetry & Pipeline Polling
  fetchAllData();
  pollIntervalId = setInterval(fetchAllData, 1800);

  // 5. Keep floating badges synchronized on each animation tick
  function syncBadges() {
    requestAnimationFrame(syncBadges);
    updateFloatingBadges(getMachineScreenPositions(), selectMachine);
  }
  syncBadges();

  addLogMessage("Titan Aerospace Precision Fab operations center online. 2021 TCN engine active.", "READY");
});

function setupControls(canvasContainer) {
  // Raycast click detection on 3D machines
  canvasContainer.addEventListener('pointerdown', (e) => {
    // Only handle primary left click
    if (e.button !== 0) return;

    const hitMachineId = pickMachine(e.clientX, e.clientY);
    if (hitMachineId) {
      playClick();
      selectMachine(hitMachineId);
    }
  });

  // Camera Director Bar Presets
  const directorButtons = document.querySelectorAll('.btn-director');
  directorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      directorButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.getAttribute('data-preset');
      setCameraPreset(preset);

      if (preset === 'global') {
        addLogMessage("Camera reset to tactical isometric overview.", "VIEW");
      } else if (preset === 'agv') {
        addLogMessage("Engaged dynamic AGV Chase Cam tracking logistics rover.", "CHASE");
      } else {
        addLogMessage(`Camera director focused on ${preset.toUpperCase()} workcell.`, "FOCUS");
      }
    });
  });

  // "⚡ Scan Factory" Radar button
  const radarBtn = document.getElementById('btn-radar');
  if (radarBtn) {
    radarBtn.addEventListener('click', async () => {
      playClick();
      playScan();
      triggerRadarScan();
      addLogMessage("Initiating factory laser radar sweep & anomaly detection...", "SCAN");

      try {
        const resp = await fetch('/monitor/check', { method: 'POST' });
        const res = await resp.json();

        if (res.status === 'SUCCESS' && res.anomalies_detected > 0) {
          playAlarm();
          addLogMessage(`⚠️ Anomaly detected: ${res.anomalies_detected} unit(s) requiring attention!`, "ALERT");
        } else {
          addLogMessage("Radar sweep complete: All units within normal vibration parameters.", "NOMINAL");
        }
        await fetchAllData();
      } catch (err) {
        console.error("Monitor check failed:", err);
        addLogMessage("Radar telemetry check completed.", "SCAN");
      }
    });
  }

  // "▶ Step Twin" Simulation button
  const stepBtn = document.getElementById('btn-step');
  if (stepBtn) {
    stepBtn.addEventListener('click', async () => {
      playClick();
      stepBtn.disabled = true;
      addLogMessage("Stepping physical twin +1800s forward...", "TWIN");

      try {
        await fetch('/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration_s: 1800 })
        });
        await fetchAllData();
        addLogMessage("Simulation step complete (+1800s). Telemetry updated.", "TWIN");
      } catch (err) {
        console.error("Simulation step failed:", err);
      } finally {
        stepBtn.disabled = false;
      }
    });
  }

  // "⟲ Reset Shift" Fleet button
  const resetFleetBtn = document.getElementById('btn-reset-fleet');
  if (resetFleetBtn) {
    resetFleetBtn.addEventListener('click', async () => {
      playClick();
      resetFleetBtn.disabled = true;
      addLogMessage("Resetting shift: Restoring all workcells to nominal status...", "SHIFT");

      try {
        await fetch('/fleet/reset', { method: 'POST' });
        playRepairSuccess();
        await fetchAllData();
        addLogMessage("Shift reset complete. All workcells operating at nominal wear.", "SUCCESS");
      } catch (err) {
        console.error("Fleet reset failed:", err);
      } finally {
        resetFleetBtn.disabled = false;
      }
    });
  }

  // "⟲ Reset View" button
  const resetBtn = document.getElementById('btn-reset-cam');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      playClick();
      setCameraPreset('global');
      directorButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-preset') === 'global');
      });
      closeDrawer();
      addLogMessage("Camera reset to tactical isometric overview.", "VIEW");
    });
  }

  // "🔊 Audio" toggle button
  const audioBtn = document.getElementById('btn-audio');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const muted = toggleMute();
      audioBtn.textContent = muted ? "🔇 Muted" : "🔊 Audio";
      playClick();
    });
  }

  // Inspection Drawer close button
  const closeBtn = document.getElementById('btn-drawer-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      playClick();
      closeDrawer();
    });
  }

  // "🔧 Trigger Maintenance" button
  const repairBtn = document.getElementById('btn-repair');
  if (repairBtn) {
    repairBtn.addEventListener('click', async () => {
      const mId = getSelectedMachineId();
      if (!mId) return;

      playClick();
      repairBtn.disabled = true;
      repairBtn.textContent = "⏳ Executing Maintenance...";
      addLogMessage(`Triggering maintenance procedure on ${mId}...`, "MAINT");

      try {
        const resp = await fetch('/maintenance/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ machine_id: mId })
        });
        const res = await resp.json();

        if (res.status === 'SUCCESS') {
          playRepairSuccess();
          addLogMessage(`✓ Maintenance successful on ${mId}. Tool wear reset to 0.0.`, "SUCCESS");
        } else {
          addLogMessage(`Maintenance action note: ${res.message}`, "MAINT");
        }

        await fetchAllData();
      } catch (err) {
        console.error("Maintenance failed:", err);
        addLogMessage(`Maintenance request error on ${mId}`, "ERROR");
      } finally {
        repairBtn.disabled = false;
        repairBtn.textContent = "🔧 Trigger Maintenance & Reset Wear";
      }
    });
  }
}

/**
 * Focuses camera and opens inspection drawer for the given machine ID
 */
export function selectMachine(machineId) {
  focusOnMachine(machineId);

  // Sync director buttons
  const directorButtons = document.querySelectorAll('.btn-director');
  directorButtons.forEach(b => {
    let preset = 'global';
    if (machineId === 'CNC-01' || machineId === 'CNC-02') preset = 'bay1';
    else if (machineId === 'PRESS-01' || machineId === 'PRESS-02' || machineId === 'FURN-01') preset = 'bay2';
    else if (machineId === 'ROBOT-01' || machineId === 'LASER-01') preset = 'bay3';
    else if (machineId === 'CONV-01') preset = 'bay4';
    b.classList.toggle('active', b.getAttribute('data-preset') === preset);
  });

  const machineData = fleetCache.find(m => m.machine_id === machineId);
  if (machineData) {
    populateDrawer(machineData);
    addLogMessage(`Inspecting workcell ${machineId} (${machineData.type || 'CNC'}).`, "SELECT");
  } else {
    populateDrawer({ machine_id: machineId, status: "HEALTHY", wear_level: 0.1, rul_cycles: 150 });
  }
}

/**
 * Polls /fleet and /pipeline/flow from backend
 */
async function fetchAllData() {
  await Promise.all([
    fetchFleetData(),
    fetchPipelineFlowData()
  ]);
}

async function fetchFleetData() {
  try {
    const res = await fetch('/fleet');
    if (!res.ok) return;

    const data = await res.json();
    const machinesList = Array.isArray(data) ? data : (data.machines || []);
    fleetCache = machinesList;

    // Update 3D scene representations (auras, halos, speed)
    updateMachineStates(machinesList);

    // Update Top KPIs
    updateTopKPIs(machinesList);

    // Update active drawer if open
    const currentSelected = getSelectedMachineId();
    if (currentSelected) {
      const selectedObj = machinesList.find(m => m.machine_id === currentSelected);
      if (selectedObj) {
        populateDrawer(selectedObj);
      }
    }
  } catch (err) {
    console.warn("Could not fetch /fleet:", err.message);
  }
}

async function fetchPipelineFlowData() {
  try {
    const res = await fetch('/pipeline/flow');
    if (!res.ok) return;

    const data = await res.json();
    renderPipelineFlow(data);
  } catch (err) {
    console.warn("Could not fetch /pipeline/flow:", err.message);
  }
}
