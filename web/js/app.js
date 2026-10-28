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
  setInteriorMode,
  getInteriorMode,
  registerModeChangeHandler,
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
let telemetryWs = null;
let isWsConnected = false;
let wsReconnectTimer = null;

function updateWsBadge(status) {
  const badge = document.getElementById('ws-badge');
  if (!badge) return;
  badge.className = 'ws-badge';
  if (status === 'live') {
    badge.classList.add('ws-live');
    badge.textContent = 'WS: LIVE';
    badge.title = 'Real-Time WebSocket Telemetry Stream (Active)';
  } else if (status === 'connecting') {
    badge.classList.add('ws-connecting');
    badge.textContent = 'WS: CONNECTING';
    badge.title = 'Connecting to WebSocket Telemetry Stream...';
  } else {
    badge.classList.add('ws-fallback');
    badge.textContent = 'WS: HTTP FALLBACK';
    badge.title = 'WebSocket Disconnected — Operating via HTTP Polling';
  }
}

function applyTelemetryData(machinesList, pipelineData) {
  if (machinesList && Array.isArray(machinesList)) {
    fleetCache = machinesList;
    updateMachineStates(machinesList);
    updateTopKPIs(machinesList);

    const currentSelected = getSelectedMachineId();
    if (currentSelected) {
      const selectedObj = machinesList.find(m => m.machine_id === currentSelected);
      if (selectedObj) {
        populateDrawer(selectedObj);
      }
    }
  }

  if (pipelineData) {
    renderPipelineFlow(pipelineData);
  }
}

function processScanOutcome(res) {
  if (res && res.status === 'SUCCESS' && res.anomalies_detected > 0) {
    playAlarm();
    addLogMessage(`⚠️ Anomaly detected: ${res.anomalies_detected} unit(s) requiring attention!`, "ALERT");
  } else {
    addLogMessage("Radar sweep complete: All units within normal vibration parameters.", "NOMINAL");
  }
}

function initWebSocketClient() {
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
    wsReconnectTimer = null;
  }

  updateWsBadge('connecting');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;

  try {
    telemetryWs = new WebSocket(wsUrl);
  } catch (err) {
    console.warn("WebSocket creation failed, engaging HTTP fallback:", err);
    engageHttpFallback();
    return;
  }

  telemetryWs.onopen = () => {
    isWsConnected = true;
    updateWsBadge('live');
    addLogMessage("WebSocket telemetry connection established. Real-time stream live.", "WS");

    // Once WebSocket is live, throttle HTTP polling to passive 15s health heartbeat
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = setInterval(passiveHeartbeat, 15000);
    }
  };

  telemetryWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'telemetry') {
        applyTelemetryData(data.machines, data.pipeline);
      } else if (data.type === 'scan_result') {
        processScanOutcome(data.result);
      } else if (data.type === 'action_result') {
        if (data.action === 'step') {
          addLogMessage(`Simulation step complete (+${data.advanced_s}s via WebSocket).`, "TWIN");
        } else if (data.action === 'repair' && data.status === 'ok') {
          playRepairSuccess();
          addLogMessage(`✓ Maintenance successful on ${data.machine_id}. Tool wear reset.`, "SUCCESS");
        } else if (data.action === 'reset' && data.status === 'ok') {
          playRepairSuccess();
          addLogMessage("Shift reset complete via WebSocket. All workcells nominal.", "SUCCESS");
        }
      }
    } catch (err) {
      console.error("Error parsing WebSocket packet:", err);
    }
  };

  telemetryWs.onclose = () => {
    if (isWsConnected) {
      addLogMessage("WebSocket connection lost. Falling back to HTTP polling.", "WS_WARN");
    }
    isWsConnected = false;
    updateWsBadge('fallback');
    engageHttpFallback();

    // Reconnect attempt in 3s
    wsReconnectTimer = setTimeout(() => {
      initWebSocketClient();
    }, 3000);
  };

  telemetryWs.onerror = (err) => {
    console.warn("WebSocket stream error:", err);
    isWsConnected = false;
    updateWsBadge('fallback');
  };
}

function engageHttpFallback() {
  if (!pollIntervalId) {
    fetchAllData();
    pollIntervalId = setInterval(fetchAllData, 1800);
  }
}

function passiveHeartbeat() {
  if (!isWsConnected) {
    engageHttpFallback();
  }
}

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
  window.selectMachine = selectMachine;
  window.getInteriorMode = getInteriorMode;

  // Listen for automatic zoom-out to Campus View from scene
  registerModeChangeHandler((isInterior) => {
    if (!isInterior) {
      const directorButtons = document.querySelectorAll('.btn-director');
      directorButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-preset') === 'campus');
      });
      addLogMessage("Camera zoomed out of company — switched to Campus View.", "CAMPUS");
    }
  });

  // 3. Setup UI Event Listeners (Controls & Camera Director)
  setupControls(container);

  // 4. Start Real-Time WebSocket Telemetry Stream (with automatic HTTP fallback)
  fetchAllData();
  initWebSocketClient();

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

      if (preset === 'campus') {
        addLogMessage("Camera set to Titan Aerospace City Campus & Town Traffic overview.", "CAMPUS");
      } else if (preset === 'global') {
        addLogMessage("Camera entered tactical factory cleanroom interior.", "INTERIOR");
      } else if (preset === 'agv1' || preset === 'agv2') {
        addLogMessage(`Engaged dynamic ${preset.toUpperCase()} Chase Cam tracking logistics rover.`, "CHASE");
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

      if (isWsConnected && telemetryWs && telemetryWs.readyState === WebSocket.OPEN) {
        telemetryWs.send(JSON.stringify({ action: "scan" }));
      } else {
        try {
          const resp = await fetch('/monitor/check', { method: 'POST' });
          const res = await resp.json();
          processScanOutcome(res);
          await fetchAllData();
        } catch (err) {
          console.error("Monitor check failed:", err);
          addLogMessage("Radar telemetry check completed.", "SCAN");
        }
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

      if (isWsConnected && telemetryWs && telemetryWs.readyState === WebSocket.OPEN) {
        telemetryWs.send(JSON.stringify({ action: "step", duration_s: 1800 }));
        stepBtn.disabled = false;
      } else {
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

      if (isWsConnected && telemetryWs && telemetryWs.readyState === WebSocket.OPEN) {
        telemetryWs.send(JSON.stringify({ action: "reset" }));
        resetFleetBtn.disabled = false;
      } else {
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

      if (isWsConnected && telemetryWs && telemetryWs.readyState === WebSocket.OPEN) {
        telemetryWs.send(JSON.stringify({ action: "repair", machine_id: mId }));
        repairBtn.disabled = false;
        repairBtn.textContent = "🔧 Trigger Maintenance & Reset Wear";
      } else {
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
      }
    });
  }
}

/**
 * Focuses camera and opens inspection drawer for the given machine ID
 */
export function selectMachine(machineId) {
  if (machineId === "ENTER_FACTORY") {
    setInteriorMode(true);
    addLogMessage("Entering Titan Aerospace Factory Cleanroom Interior.", "ENTER");
    const directorButtons = document.querySelectorAll('.btn-director');
    directorButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-preset') === 'global');
    });
    return;
  }

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
    applyTelemetryData(machinesList, null);
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
