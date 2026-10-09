/**
 * HUD & SCADA Overlay Management
 * ================================
 * Manages top KPI bar, 3D floating holographic labels,
 * inspection drawer panels, and live vibration waveform canvas.
 */

import { playClick } from './audio.js';

let badgeContainer = null;
const badgeElements = new Map(); // id -> HTMLElement
let selectedMachineId = null;

// Vibration waveform history buffer
const vibrationBuffer = new Array(60).fill(0.1);
let waveformAnimId = null;

export function initHUD(onSelectMachine) {
  badgeContainer = document.getElementById('floating-badges-layer');

  // Initialize vibration canvas
  startWaveformRenderer();
}

/**
 * Updates or creates floating 3D labels tracking machines on screen
 */
export function updateFloatingBadges(projectedPositions, onSelectMachine) {
  if (!badgeContainer) return;

  projectedPositions.forEach(item => {
    let el = badgeElements.get(item.id);

    if (!el) {
      el = document.createElement('div');
      el.className = 'float-badge';
      el.innerHTML = `
        <div class="badge-card">
          <span class="badge-status-dot"></span>
          <span class="badge-id">${item.id}</span>
          <span class="badge-rul">RUL --</span>
        </div>
        <div class="badge-pin"></div>
      `;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        playClick();
        if (onSelectMachine) onSelectMachine(item.id);
      });
      badgeContainer.appendChild(el);
      badgeElements.set(item.id, el);
    }

    if (!item.visible) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'flex';
    el.style.left = `${item.x}px`;
    el.style.top = `${item.y}px`;

    if (item.state) {
      el.setAttribute('data-status', item.state.status || 'HEALTHY');
      const rulEl = el.querySelector('.badge-rul');
      if (rulEl) {
        if (item.state.rul != null) {
          rulEl.textContent = `RUL ${item.state.rul}c`;
        } else {
          rulEl.textContent = item.state.status || 'RUN';
        }
      }
    }
  });
}

/**
 * Updates top bar production KPIs
 */
export function updateTopKPIs(fleetData) {
  if (!fleetData || !Array.isArray(fleetData)) return;

  const total = fleetData.length;
  let healthyCount = 0;
  let totalWear = 0;
  let minRul = 9999;

  fleetData.forEach(m => {
    if (m.status === 'HEALTHY') healthyCount++;
    totalWear += (m.wear_level || 0);
    if (m.rul_cycles != null && m.rul_cycles < minRul) {
      minRul = m.rul_cycles;
    }
  });

  const avgWear = total > 0 ? (totalWear / total) : 0;
  const healthPercent = Math.max(0, Math.round((1 - avgWear) * 100));

  const kpiHealth = document.getElementById('kpi-health');
  if (kpiHealth) kpiHealth.textContent = `${healthPercent}%`;

  const kpiUnits = document.getElementById('kpi-units');
  if (kpiUnits) kpiUnits.textContent = `${healthyCount}/${total}`;

  const kpiMinRul = document.getElementById('kpi-min-rul');
  if (kpiMinRul) kpiMinRul.textContent = minRul === 9999 ? '--' : `${minRul} cyc`;
}

/**
 * Updates inspection drawer with machine telemetry & SOP recommendations
 */
export function populateDrawer(machineData) {
  if (!machineData) return;

  selectedMachineId = machineData.machine_id;

  const drawer = document.getElementById('machine-drawer');
  if (!drawer) return;

  // Title & Subtitle
  const titleEl = document.getElementById('drawer-m-id');
  const typeEl = document.getElementById('drawer-m-type');
  if (titleEl) titleEl.textContent = machineData.machine_id;
  if (typeEl) typeEl.textContent = machineData.type || 'INDUSTRIAL WORKCELL';

  // Status Badge
  const statusEl = document.getElementById('drawer-m-status');
  if (statusEl) {
    statusEl.textContent = machineData.status || 'HEALTHY';
    statusEl.style.color =
      machineData.status === 'CRITICAL' ? 'var(--color-rose)' :
      machineData.status === 'WARNING' ? 'var(--color-amber)' : 'var(--color-emerald)';
  }

  // Wear Bar
  const wear = machineData.wear_level || 0;
  const wearPct = Math.min(100, Math.round(wear * 100));
  const wearValEl = document.getElementById('drawer-wear-val');
  const wearFillEl = document.getElementById('drawer-wear-fill');
  if (wearValEl) wearValEl.textContent = `${wearPct}%`;
  if (wearFillEl) {
    wearFillEl.style.width = `${wearPct}%`;
    wearFillEl.style.backgroundColor =
      wearPct > 70 ? 'var(--color-rose)' :
      wearPct > 40 ? 'var(--color-amber)' : 'var(--color-emerald)';
  }

  // TCN RUL
  const rulCycles = machineData.predicted_rul_cycles != null ? Math.round(machineData.predicted_rul_cycles) : (machineData.rul_cycles != null ? machineData.rul_cycles : '--');
  const rulCyclesEl = document.getElementById('drawer-rul-cycles');
  const rulHoursEl = document.getElementById('drawer-rul-hours');
  if (rulCyclesEl) rulCyclesEl.textContent = rulCycles;
  if (rulHoursEl) {
    const hours = rulCycles !== '--' ? (rulCycles * 0.45).toFixed(1) : '--';
    rulHoursEl.textContent = `≈ ${hours} operating hrs (incl. 15% safety buffer)`;
  }

  // Telemetry Cells
  const vibEl = document.getElementById('drawer-vib-val');
  const tempEl = document.getElementById('drawer-temp-val');
  const loadEl = document.getElementById('drawer-load-val');
  if (vibEl) vibEl.textContent = machineData.vibration_rms ? `${machineData.vibration_rms.toFixed(3)} mm/s` : '--';
  const temp = machineData.temperature_c != null ? machineData.temperature_c : machineData.temperature;
  if (tempEl) tempEl.textContent = temp ? `${temp.toFixed(1)} °C` : '--';
  if (loadEl) loadEl.textContent = machineData.load_factor ? `${(machineData.load_factor * 100).toFixed(0)}%` : '--';

  // Update vibration buffer for canvas
  if (machineData.vibration_rms != null) {
    pushVibrationSample(machineData.vibration_rms);
  }

  // SOP Diagnosis Card
  const sopBox = document.getElementById('drawer-sop-content');
  if (sopBox) {
    if (machineData.status === 'CRITICAL' || machineData.status === 'WARNING') {
      sopBox.innerHTML = `
        <div class="sop-title">⚠️ SOP-04: Spindle Bearing & Thermal Mitigation</div>
        <div class="sop-cause">Harmonic vibration spikes detected along Z-axis. Risk of catastrophic thermal seizure.</div>
        <ul class="sop-actions">
          <li>Reduce feed rate by 35% immediately</li>
          <li>Apply synthetic lithium grease to main spindle races</li>
          <li>Schedule tool replacement before cycle limit</li>
        </ul>
      `;
    } else {
      sopBox.innerHTML = `
        <div class="sop-title" style="color: var(--color-emerald)">✓ SOP-01: Standard Nominal Operation</div>
        <div class="sop-cause">Telemetry within normal ISO 10816 vibration tolerance limits. All axes nominal.</div>
        <ul class="sop-actions">
          <li>Routine visual inspection scheduled for next shift</li>
          <li>Maintain continuous digital twin telemetry streaming</li>
        </ul>
      `;
    }
  }

  // Open drawer
  drawer.classList.add('open');
}

export function closeDrawer() {
  const drawer = document.getElementById('machine-drawer');
  if (drawer) drawer.classList.remove('open');
  selectedMachineId = null;
}

export function getSelectedMachineId() {
  return selectedMachineId;
}

/**
 * Appends a message to the bottom ticker
 */
export function addLogMessage(msg, tag = 'SYSTEM') {
  const tagEl = document.getElementById('feed-tag');
  const msgEl = document.getElementById('feed-msg');
  const timeEl = document.getElementById('feed-time');

  if (tagEl) tagEl.textContent = tag;
  if (msgEl) msgEl.textContent = msg;
  if (timeEl) {
    const d = new Date();
    timeEl.textContent = d.toTimeString().split(' ')[0];
  }
}

/**
 * Live oscilloscope vibration waveform canvas renderer
 */
function pushVibrationSample(val) {
  vibrationBuffer.push(val);
  if (vibrationBuffer.length > 80) {
    vibrationBuffer.shift();
  }
}

function startWaveformRenderer() {
  const canvas = document.getElementById('vibration-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function renderWaveform() {
    waveformAnimId = requestAnimationFrame(renderWaveform);
    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    // Subtle grid background lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h);
    ctx.moveTo(0, h / 4);
    ctx.lineTo(w, h / 4);
    ctx.moveTo(0, 3 * h / 4);
    ctx.lineTo(w, 3 * h / 4);
    ctx.stroke();

    // Waveform line
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 243, 255, 0.5)';
    ctx.shadowBlur = 6;
    ctx.beginPath();

    const step = w / (vibrationBuffer.length - 1);
    const maxVal = 1.0;

    vibrationBuffer.forEach((val, i) => {
      // Add subtle synthetic high-frequency noise for oscilloscope feel
      const jitter = (Math.random() - 0.5) * 0.04;
      const normalized = Math.min(1.0, (val + jitter) / maxVal);
      const y = h - (normalized * (h - 8)) - 4;
      const x = i * step;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  renderWaveform();
}
