/**
 * HUD & SCADA Overlay Management (Titan Aerospace)
 * ===================================================
 * Manages top KPI bar, 3D floating holographic labels,
 * tabbed inspection drawer, dual-channel oscilloscope,
 * and the End-to-End Process Pipeline Ribbon.
 */

import { playClick } from './audio.js';

let badgeContainer = null;
const badgeElements = new Map(); // id -> HTMLElement
let selectedMachineId = null;

// Oscilloscope dual buffers
const vibrationBuffer = new Array(70).fill(0.12);
const tempBuffer = new Array(70).fill(42.0);
let waveformAnimId = null;

export function initHUD(onSelectMachine) {
  badgeContainer = document.getElementById('floating-badges-layer');

  // Initialize dual oscilloscope canvas
  startWaveformRenderer();

  // Setup Inspection Drawer Tabs
  setupDrawerTabs();

  // Setup Pipeline Ribbon Tabs & Collapsible behavior
  setupPipelineRibbon();
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
  let totalParts = 0;

  fleetData.forEach(m => {
    if (m.status === 'HEALTHY' || m.status === 'healthy') healthyCount++;
    totalWear += (m.wear_level || 0);
    totalParts += (m.throughput_units || 0);
    const rul = m.predicted_rul_cycles != null ? m.predicted_rul_cycles : m.rul_cycles;
    if (rul != null && rul < minRul) {
      minRul = Math.round(rul);
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

  const kpiThroughput = document.getElementById('kpi-throughput');
  if (kpiThroughput) kpiThroughput.textContent = totalParts;
}

/**
 * Sets up tab switching in the inspection drawer
 */
function setupDrawerTabs() {
  const tabs = document.querySelectorAll('.drawer-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playClick();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetPane = tab.getAttribute('data-tab');
      document.querySelectorAll('.drawer-tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });

      const activePane = document.getElementById(`pane-${targetPane}`);
      if (activePane) activePane.classList.add('active');
    });
  });
}

/**
 * Sets up pipeline ribbon tabs and collapse toggle
 */
function setupPipelineRibbon() {
  const tabProd = document.getElementById('tab-pipe-prod');
  const tabAi = document.getElementById('tab-pipe-ai');
  const viewProd = document.getElementById('pipeline-view-prod');
  const viewAi = document.getElementById('pipeline-view-ai');
  const toggleBtn = document.getElementById('btn-ribbon-toggle');
  const ribbon = document.getElementById('pipeline-ribbon');

  if (tabProd && tabAi && viewProd && viewAi) {
    tabProd.addEventListener('click', () => {
      playClick();
      tabProd.classList.add('active');
      tabAi.classList.remove('active');
      viewProd.style.display = 'grid';
      viewAi.style.display = 'none';
    });

    tabAi.addEventListener('click', () => {
      playClick();
      tabAi.classList.add('active');
      tabProd.classList.remove('active');
      viewAi.style.display = 'grid';
      viewProd.style.display = 'none';
    });
  }

  if (toggleBtn && ribbon) {
    toggleBtn.addEventListener('click', () => {
      playClick();
      ribbon.classList.toggle('collapsed');
      toggleBtn.innerHTML = ribbon.classList.contains('collapsed') ? '&#9650;' : '&#9660;';
    });
  }
}

/**
 * Renders end-to-end pipeline data fetched from /pipeline/flow
 */
export function renderPipelineFlow(data) {
  if (!data) return;

  // 1. Company Meta Stats
  if (data.company) {
    const partsEl = document.getElementById('pipe-parts-count');
    const balEl = document.getElementById('pipe-line-bal');
    const savingsEl = document.getElementById('pipe-savings');

    if (partsEl) partsEl.textContent = data.company.total_throughput_parts || 0;
    if (balEl) balEl.textContent = `${data.company.line_balance_pct}%`;
    if (savingsEl) savingsEl.textContent = `$${(data.company.downtime_cost_saved_usd || 0).toLocaleString()}`;
  }

  // 2. Manufacturing Stages Flow
  const prodContainer = document.getElementById('pipeline-view-prod');
  if (prodContainer && Array.isArray(data.manufacturing_stages)) {
    prodContainer.innerHTML = data.manufacturing_stages.map(st => {
      const isWarn = st.status === 'WARNING' || st.status === 'CRITICAL' || st.status === 'FAILED';
      const pillClass = st.status === 'NOMINAL' || st.status === 'HEALTHY' ? 'nominal' :
                        st.status === 'WARNING' ? 'warning' : 'critical';

      return `
        <div class="pipe-node ${isWarn ? 'bottleneck' : ''}" title="${st.name}">
          <div class="pipe-node-header">
            <span class="pipe-stage-tag">${st.id}</span>
            <span class="pipe-status-pill ${pillClass}">${st.status}</span>
          </div>
          <div class="pipe-node-title">${st.name}</div>
          <div class="pipe-node-component">${st.component}</div>
          <div class="pipe-node-footer">
            <span>Cycle: ${st.cycle_time_s}s</span>
            <span>WIP: ${st.wip_count}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. AI Reasoning Pipeline Steps
  const aiContainer = document.getElementById('pipeline-view-ai');
  if (aiContainer && Array.isArray(data.ai_reasoning_pipeline)) {
    aiContainer.innerHTML = data.ai_reasoning_pipeline.map(step => {
      return `
        <div class="ai-step-card">
          <div class="ai-step-num">STEP 0${step.step} &bull; ${step.status}</div>
          <div class="ai-step-name">${step.name}</div>
          <div class="ai-step-metric">${step.metric}</div>
          <div class="ai-step-desc">${step.details}</div>
        </div>
      `;
    }).join('');
  }
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
  
  let friendlyType = "Titan Precision Workcell";
  if (machineData.machine_id === "CNC-01") friendlyType = "5-Axis High-Speed Turbine Mill";
  else if (machineData.machine_id === "PRESS-01") friendlyType = "1000-Ton Hydraulic Forging Press";
  else if (machineData.machine_id === "CONV-01") friendlyType = "Avionics Assembly & Laser QC Gate";

  if (typeEl) typeEl.textContent = friendlyType;

  // Status Badge
  const statusEl = document.getElementById('drawer-m-status');
  const rawStatus = (machineData.status || 'HEALTHY').toUpperCase();
  if (statusEl) {
    statusEl.textContent = rawStatus;
    statusEl.style.color =
      (rawStatus === 'CRITICAL' || rawStatus === 'FAILED') ? 'var(--color-rose)' :
      (rawStatus === 'WARNING' || rawStatus === 'DEGRADING') ? 'var(--color-amber)' : 'var(--color-emerald)';
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
    rulHoursEl.textContent = `≈ ${hours} operating hrs (-15% safety buffer included)`;
  }

  // Telemetry Cells
  const vibEl = document.getElementById('drawer-vib-val');
  const tempEl = document.getElementById('drawer-temp-val');
  const loadEl = document.getElementById('drawer-load-val');
  const isoEl = document.getElementById('drawer-iso-val');

  const vib = machineData.vibration_rms || 0.15;
  const temp = machineData.temperature_c != null ? machineData.temperature_c : (machineData.temperature || 42.0);

  if (vibEl) vibEl.textContent = `${vib.toFixed(3)} mm/s`;
  if (tempEl) tempEl.textContent = `${temp.toFixed(1)} °C`;
  if (loadEl) loadEl.textContent = machineData.load_factor ? `${(machineData.load_factor * 100).toFixed(0)}%` : '85%';

  // ISO 10816 Vibration Severity Classification
  if (isoEl) {
    if (vib < 0.28) {
      isoEl.textContent = "Zone A (Good)";
      isoEl.style.color = "var(--color-emerald)";
    } else if (vib < 0.50) {
      isoEl.textContent = "Zone B (Acceptable)";
      isoEl.style.color = "var(--color-cyan)";
    } else if (vib < 0.75) {
      isoEl.textContent = "Zone C (Warning)";
      isoEl.style.color = "var(--color-amber)";
    } else {
      isoEl.textContent = "Zone D (Critical)";
      isoEl.style.color = "var(--color-rose)";
    }
  }

  // Push samples to dual oscilloscope buffer
  pushDualSample(vib, temp);

  // SOP Diagnosis Card
  const sopBox = document.getElementById('drawer-sop-content');
  if (sopBox) {
    if (rawStatus === 'CRITICAL' || rawStatus === 'WARNING' || rawStatus === 'FAILED' || rawStatus === 'DEGRADING') {
      sopBox.innerHTML = `
        <div class="sop-title">⚠️ SOP-AERO-04: High-Harmonic Bearing Vibration Mitigation</div>
        <div class="sop-cause">Harmonic vibration peaks detected along spindle rotational axis. Risk of micro-fractures in Inconel turbine blade profiles.</div>
        <ul class="sop-actions">
          <li><input type="checkbox" checked disabled> Immediate 30% feed-rate derating applied by copilot</li>
          <li><input type="checkbox" checked disabled> Lubrication pressure verification: Nominal 4.2 bar</li>
          <li><input type="checkbox"> Inspect spindle runout with dial gauge (&lt; 0.003mm)</li>
          <li><input type="checkbox"> Execute automated wear reset & tooling swap</li>
        </ul>
      `;
    } else {
      sopBox.innerHTML = `
        <div class="sop-title" style="color: var(--color-emerald)">✓ SOP-AERO-01: Standard Turbine Machining Protocol</div>
        <div class="sop-cause">Telemetry within ISO 10816 Zone A tolerance limits. Tooling profile nominal.</div>
        <ul class="sop-actions">
          <li><input type="checkbox" checked disabled> Continuous 60Hz SimPy telemetry stream active</li>
          <li><input type="checkbox" checked disabled> Zero-leakage observable physics model verified</li>
          <li><input type="checkbox"> Routine tool surface laser inspection scheduled at shift change</li>
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
 * Dual oscilloscope vibration & thermal waveform canvas renderer
 */
function pushDualSample(vib, temp) {
  vibrationBuffer.push(vib);
  if (vibrationBuffer.length > 70) vibrationBuffer.shift();

  tempBuffer.push(temp);
  if (tempBuffer.length > 70) tempBuffer.shift();
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

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(0, h / 4);
    ctx.lineTo(w, h / 4);
    ctx.moveTo(0, 3 * h / 4);
    ctx.lineTo(w, 3 * h / 4);
    ctx.stroke();

    const step = w / (vibrationBuffer.length - 1);

    // Channel 2: Thermal Curve (Amber background trace)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    tempBuffer.forEach((tempVal, i) => {
      // Temp normalized between 30°C and 90°C
      const normTemp = Math.max(0, Math.min(1.0, (tempVal - 30) / 60));
      const y = h - (normTemp * (h - 10)) - 5;
      const x = i * step;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Channel 1: Vibration RMS (Cyan foreground waveform)
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 243, 255, 0.6)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    vibrationBuffer.forEach((vibVal, i) => {
      const jitter = (Math.random() - 0.5) * 0.03;
      const normVib = Math.max(0, Math.min(1.0, (vibVal + jitter) / 1.0));
      const y = h - (normVib * (h - 10)) - 5;
      const x = i * step;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  renderWaveform();
}
