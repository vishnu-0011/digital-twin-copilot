/**
 * HUD & SCADA Overlay Management (Titan Aerospace)
 * ===================================================
 * Manages top KPI bar, 3D floating holographic labels,
 * tabbed inspection drawer, dual-channel oscilloscope,
 * theme toggle, and the 10-Stage Process Pipeline Ribbon.
 */

import { playClick } from './audio.js';

let badgeContainer = null;
const badgeElements = new Map(); // id -> HTMLElement
let selectedMachineId = null;
let machineSelectCallback = null;

// Oscilloscope dual buffers
const vibrationBuffer = new Array(70).fill(0.12);
const tempBuffer = new Array(70).fill(42.0);
let waveformAnimId = null;

export function initHUD(onSelectMachine, onToggleTheme) {
  badgeContainer = document.getElementById('floating-badges-layer');
  machineSelectCallback = onSelectMachine;

  // Initialize dual oscilloscope canvas
  startWaveformRenderer();

  // Setup Inspection Drawer Tabs
  setupDrawerTabs();

  // Setup Pipeline Ribbon Tabs & Collapsible behavior
  setupPipelineRibbon();

  // Setup Theme Switcher
  setupThemeToggle(onToggleTheme);
}

/**
 * Handles Light/Dark Mode Switcher
 */
function setupThemeToggle(onToggleTheme) {
  const themeBtn = document.getElementById('btn-theme');
  if (!themeBtn) return;

  // Default is Executive Cleanroom Light Theme
  let currentTheme = localStorage.getItem('titan_theme') || 'light';
  document.body.setAttribute('data-theme', currentTheme);
  themeBtn.textContent = currentTheme === 'light' ? '☀️ Light' : '🌙 Dark';

  themeBtn.addEventListener('click', () => {
    playClick();
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('titan_theme', currentTheme);
    themeBtn.textContent = currentTheme === 'light' ? '☀️ Light' : '🌙 Dark';

    if (onToggleTheme) {
      onToggleTheme(currentTheme);
    }
  });
}

/**
 * Updates or creates floating 3D labels tracking machines or campus on screen
 */
export function updateFloatingBadges(projectedPositions, onSelectMachine) {
  if (!badgeContainer) return;

  const activeIds = new Set(projectedPositions.map(p => p.id));

  // Hide any badges not present in the current projection frame
  badgeElements.forEach((el, id) => {
    if (!activeIds.has(id)) {
      el.style.display = 'none';
    }
  });

  projectedPositions.forEach(item => {
    let el = badgeElements.get(item.id);

    if (!el) {
      el = document.createElement('div');
      el.className = 'float-badge';
      if (item.isCampus) {
        el.innerHTML = `
          <div class="badge-card campus-badge-card" style="background: rgba(15, 23, 42, 0.88); border: 1.5px solid var(--color-cyan); padding: 8px 14px; border-radius: 8px; backdrop-filter: blur(8px); cursor: pointer; box-shadow: 0 4px 16px rgba(0, 243, 255, 0.25);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; color: var(--color-cyan); font-size: 13px;">
              <span class="badge-status-dot" style="background: var(--color-emerald)"></span>
              <span>TITAN AEROSPACE CAMPUS</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">8 Workcells Active &bull; <span style="color: #38bdf8; font-weight: 600;">Click to Enter &rarr;</span></div>
          </div>
          <div class="badge-pin" style="height: 12px; border-left: 2px dashed var(--color-cyan);"></div>
        `;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          playClick();
          if (onSelectMachine) onSelectMachine("ENTER_FACTORY");
        });
      } else {
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
      }
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
      el.setAttribute('data-status', (item.state.status || 'HEALTHY').toUpperCase());
      const rulEl = el.querySelector('.badge-rul');
      if (rulEl) {
        if (item.state.rul != null) {
          rulEl.textContent = `RUL ${item.state.rul}c`;
        } else {
          rulEl.textContent = (item.state.status || 'RUN').toUpperCase();
        }
      }
    }
  });
}

/**
 * Updates top bar production KPIs across the 8-machine fleet
 */
export function updateTopKPIs(fleetData) {
  if (!fleetData || !Array.isArray(fleetData)) return;

  const total = fleetData.length;
  let healthyCount = 0;
  let totalWear = 0;
  let minRul = 9999;
  let totalParts = 0;

  fleetData.forEach(m => {
    const stat = (m.status || '').toLowerCase();
    if (stat === 'healthy') healthyCount++;
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
  const ribbon = document.getElementById('process-pipeline-ribbon');

  if (tabProd && tabAi && viewProd && viewAi) {
    tabProd.addEventListener('click', () => {
      playClick();
      tabProd.classList.add('active');
      tabAi.classList.remove('active');
      viewProd.style.display = 'flex';
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
 * Renders end-to-end 10-stage pipeline data fetched from /pipeline/flow
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

  // 2. Manufacturing Stages Flow across 10 stages
  const prodContainer = document.getElementById('pipeline-view-prod');
  if (prodContainer && Array.isArray(data.manufacturing_stages)) {
    prodContainer.innerHTML = data.manufacturing_stages.map(st => {
      const isWarn = st.status === 'WARNING' || st.status === 'CRITICAL' || st.status === 'FAILED';
      const pillClass = st.status === 'NOMINAL' || st.status === 'HEALTHY' ? 'nominal' :
                        st.status === 'WARNING' ? 'warning' : 'critical';

      return `
        <div class="pipe-node ${isWarn ? 'bottleneck' : ''}" data-workcell="${st.workcell_id || ''}" title="Click to inspect ${st.name}">
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

    // Attach click listeners to pipe nodes to select machine
    prodContainer.querySelectorAll('.pipe-node').forEach(node => {
      const wId = node.getAttribute('data-workcell');
      if (wId) {
        node.addEventListener('click', () => {
          playClick();
          if (machineSelectCallback) machineSelectCallback(wId);
        });
      }
    });
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

  // Title & Machine Taxonomy for all 8 machines
  const titleEl = document.getElementById('drawer-m-id');
  const typeEl = document.getElementById('drawer-m-type');
  if (titleEl) titleEl.textContent = machineData.machine_id;

  const taxonomy = {
    "CNC-01": "5-Axis Heavy Roughing Mill (Inconel Billets)",
    "CNC-02": "5-Axis High-Speed Airfoil Finishing Center",
    "PRESS-01": "1000-Ton Airframe Bulkhead Forging Press",
    "PRESS-02": "500-Ton Hydraulic Extrusion Press",
    "FURN-01": "Vacuum Carburizing Heat Treatment Furnace",
    "ROBOT-01": "6-DOF Robotic Deburring & Polishing Workcell",
    "LASER-01": "Dual Laser Triangulation QC Metrology Arch",
    "CONV-01": "Modular Dual-Rail Avionics Assembly Line",
  };

  const friendlyType = taxonomy[machineData.machine_id] || "Titan Aerospace Precision Workcell";
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
        <div class="sop-title">⚠️ SOP-AERO-04: High-Harmonic Vibration Mitigation</div>
        <div class="sop-cause">Harmonic vibration peaks detected along rotational axis. Risk of micro-fractures in aerospace components.</div>
        <ul class="sop-actions">
          <li><input type="checkbox" checked disabled> Immediate 30% feed-rate derating applied by copilot</li>
          <li><input type="checkbox" checked disabled> Lubrication pressure verification: Nominal 4.2 bar</li>
          <li><input type="checkbox"> Inspect spindle runout with dial gauge (&lt; 0.003mm)</li>
          <li><input type="checkbox"> Execute automated wear reset & tooling swap</li>
        </ul>
      `;
    } else {
      sopBox.innerHTML = `
        <div class="sop-title" style="color: var(--color-emerald)">✓ SOP-AERO-01: Standard Aerospace Operating Protocol</div>
        <div class="sop-cause">Telemetry within ISO 10816 Zone A tolerance limits. Tooling profile nominal.</div>
        <ul class="sop-actions">
          <li><input type="checkbox" checked disabled> Continuous 60Hz SimPy telemetry stream active</li>
          <li><input type="checkbox" checked disabled> Zero-leakage observable physics model verified</li>
          <li><input type="checkbox"> Routine surface laser inspection scheduled at shift change</li>
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

    const isDark = document.body.getAttribute('data-theme') === 'dark';

    // Grid lines
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
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
    ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.75)' : '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    tempBuffer.forEach((tempVal, i) => {
      const normTemp = Math.max(0, Math.min(1.0, (tempVal - 30) / 60));
      const y = h - (normTemp * (h - 10)) - 5;
      const x = i * step;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Channel 1: Vibration RMS (Cobalt / Cyan foreground waveform)
    ctx.strokeStyle = isDark ? '#00f3ff' : '#0284c7';
    ctx.lineWidth = 2;
    if (isDark) {
      ctx.shadowColor = 'rgba(0, 243, 255, 0.6)';
      ctx.shadowBlur = 6;
    }
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
