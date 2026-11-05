/**
 * HUD & SCADA Overlay Management (Titan Aerospace)
 * ===================================================
 * Manages top KPI bar, 3D floating holographic labels,
 * tabbed inspection drawer, dual-channel oscilloscope,
 * theme toggle, and the 10-Stage Process Pipeline Ribbon.
 */

import { playClick } from './audio.js';
import { isoZone, ISO_ZONES, ISO_ZONE_LIMITS, formatRul, RUL_PLATEAU } from './standards.js';
import { planShort, fmtClock as wallClock, fmtDay, fmtIn, PLAN } from './plan.js';
import { getHistory } from './history.js';

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
          <div class="badge-card campus-badge-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 7px 12px; border-radius: 8px; backdrop-filter: blur(12px); cursor: pointer; box-shadow: var(--shadow-hud);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600; color: var(--text-main); font-size: 12px;">
              <span class="badge-status-dot" style="background: var(--color-emerald)"></span>
              <span>Production Complex</span>
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">8 Workcells &bull; <span style="color: var(--color-cyan); font-weight: 500;">Enter Floor &rarr;</span></div>
          </div>
          <div class="badge-pin" style="height: 10px; border-left: 1px solid var(--color-cyan);"></div>
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
            <span class="badge-rul"></span>
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
      const plan = item.state.plan;
      el.setAttribute('data-plan', plan ? plan.key : 'healthy');
      const rulEl = el.querySelector('.badge-rul');
      if (rulEl) rulEl.textContent = plan ? planShort(plan) : '';
      el.title = plan ? `${item.id}: ${planShort(plan)}` : item.id;
    }
  });
}

/**
 * Updates top bar production KPIs across the 8-machine fleet
 */
export function updateTopKPIs(fleetData) {
  if (!fleetData || !Array.isArray(fleetData)) return;
  const total = fleetData.length;
  const plans = fleetData.map(m => ({ id: m.machine_id, p: m.plan || PLAN.healthy }));
  const attention = plans.filter(x => x.p.rank >= PLAN.soon.rank);
  const running = plans.filter(x => x.p.key !== 'down' && x.p.key !== 'service').length;
  const parts = fleetData.reduce((a, m) => a + (m.throughput_units || 0), 0);

  const att = document.getElementById('kpi-attention');
  if (att) {
    att.textContent = attention.length ? `${attention.length}` : 'None';
    const worst = attention.reduce((a, x) => Math.max(a, x.p.rank), 0);
    att.style.color = worst >= PLAN.now.rank ? 'var(--color-rose)' : worst >= PLAN.soon.rank ? 'var(--color-amber)' : 'var(--color-emerald)';
  }
  const run = document.getElementById('kpi-units');
  if (run) {
    run.textContent = `${running}/${total}`;
    run.style.color = running < total ? 'var(--color-amber)' : '';
  }
  const next = document.getElementById('kpi-min-rul');
  if (next) {
    const due = plans.filter(x => x.p.deadlineWall).sort((a, b) => a.p.deadlineWall - b.p.deadlineWall)[0];
    const down = plans.find(x => x.p.key === 'down');
    if (down) { next.textContent = `${down.id} now`; next.style.color = 'var(--color-rose)'; }
    else if (due) { next.textContent = `${wallClock(due.p.deadlineWall)} · ${due.id}`; next.style.color = due.p.color; }
    else { next.textContent = 'None due'; next.style.color = 'var(--color-emerald)'; }
  }
  const partsEl = document.getElementById('kpi-throughput');
  if (partsEl) partsEl.textContent = parts.toLocaleString('en-US');
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
  const ribbon = document.getElementById('pipeline-ribbon') || document.getElementById('process-pipeline-ribbon');

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
    toggleBtn.innerHTML = ribbon.classList.contains('collapsed') ? '&#9650;' : '&#9660;';
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
    if (balEl) balEl.textContent = `${data.company.failures_prevented || 0}`;
    if (savingsEl) savingsEl.textContent = `${(data.company.downtime_avoided_h || 0).toFixed(1)} h`;
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

// Per-asset setpoints. Live values (feed derate, power, tool life, run time)
// are derived from the twin's state in populateDrawer.
const MACHINE_SPECS = {
  "CNC-01":   { asset: "TA-CNC-2024-X8", rpm: "14,200 RPM", feed: 3200, feedUnit: "mm/min", coolant: "4.2 bar (18 L/min)", powerKw: 18.4, tool: "T14: 4-Flute Carbide End Mill (Ø12 mm)", lifeTotal: 12, lifeUnit: "hrs" },
  "CNC-02":   { asset: "TA-CNC-2024-F4", rpm: "24,000 RPM", feed: 4800, feedUnit: "mm/min", coolant: "5.0 bar (22 L/min)", powerKw: 14.2, tool: "T08: Diamond Micro-Ball Finishing (Ø4 mm)", lifeTotal: 8, lifeUnit: "hrs" },
  "PRESS-01": { asset: "TA-PRS-1000-01", rpm: "28 strokes/min", feed: 120, feedUnit: "mm/s ram", coolant: "Hydraulic 280 bar, ISO VG46", powerKw: 75.0, tool: "DIE-B7: Ti-6Al-4V Bulkhead Cavity Die", lifeTotal: 5000, lifeUnit: "cycles" },
  "PRESS-02": { asset: "TA-EXT-0500-02", rpm: "18 strokes/min", feed: 45, feedUnit: "mm/s ram", coolant: "Hydraulic 210 bar, ISO VG46", powerKw: 45.0, tool: "EXT-S02: Wing Spar Profile Die", lifeTotal: 3000, lifeUnit: "cycles" },
  "FURN-01":  { asset: "TA-FRN-2023-V1", rpm: "Vacuum 2.4×10⁻⁵ mbar", feed: 8.5, feedUnit: "°C/min ramp", coolant: "Closed-loop water (2.8 bar)", powerKw: 92.0, tool: "Inconel 718 refractory retort", lifeTotal: 1200, lifeUnit: "thermal cycles" },
  "ROBOT-01": { asset: "TA-ROB-06AX-01", rpm: "18,000 RPM spindle", feed: 1250, feedUnit: "mm/s TCP", coolant: "Pneumatic mist (6.0 bar)", powerKw: 8.6, tool: "BURR-03: Tungsten Conical Rotary File", lifeTotal: 40, lifeUnit: "hrs" },
  "LASER-01": { asset: "TA-MTR-LSR-01", rpm: "120 Hz line scan", feed: 0.2, feedUnit: "µm resolution", coolant: "Chilled optics (20.0 °C)", powerKw: 2.8, tool: "OPTIC-D2: Blue Triangulation Head (405 nm)", lifeTotal: 10000, lifeUnit: "hrs" },
  "CONV-01":  { asset: "TA-ASY-CNV-01", rpm: "Belt 0.85 m/s", feed: 48, feedUnit: "s/pallet takt", coolant: "Air lube (4.0 bar)", powerKw: 5.5, tool: "ESD dual-rail avionics carrier", lifeTotal: 20000, lifeUnit: "hrs" },
};

function fmtNum(n, digits = 0) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtClock(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}h ${pad(Math.floor((s % 3600) / 60))}m ${pad(s % 60)}s`;
}

function fmtDuration(seconds) {
  if (seconds < 90) return `${Math.round(seconds)} s`;
  if (seconds < 5400) return `${Math.round(seconds / 60)} min`;
  return `${(seconds / 3600).toFixed(1)} h`;
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

  // Live readings
  const vib = machineData.vibration_rms != null ? machineData.vibration_rms : 0;
  const temp = machineData.temperature_c != null ? machineData.temperature_c : (machineData.temperature || 42.0);
  const wear = machineData.wear_level || 0;
  const zone = machineData.iso_zone || isoZone(vib);
  const zoneInfo = ISO_ZONES[zone];
  const rawStatus = (machineData.status || 'healthy').toLowerCase();

  // Status badge: the twin's own status, plus the ISO zone it sits in.
  const plan = machineData.plan || PLAN.healthy;
  const statusEl = document.getElementById('drawer-m-status');
  if (statusEl) {
    statusEl.textContent = machineData.forecast ? `${plan.label} (forecast)` : plan.label;
    statusEl.style.color = plan.color;
  }
  renderVerdict(machineData, plan, zone, vib);

  // Wear Bar
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

  // Cycle time stretches with wear (friction and slop), exactly as the simulator models it.
  const nominalCycle = machineData.nominal_cycle_time_s || 10;
  const cycleTime = nominalCycle * (1 + 0.4 * wear);

  // TCN RUL
  const rul = machineData.predicted_rul_cycles != null ? machineData.predicted_rul_cycles : machineData.rul_cycles;
  const rulCyclesEl = document.getElementById('drawer-rul-cycles');
  const rulHoursEl = document.getElementById('drawer-rul-hours');
  if (rulCyclesEl) rulCyclesEl.textContent = formatRul(rul);
  if (rulHoursEl) {
    if (rul == null) {
      rulHoursEl.textContent = '--';
    } else if (rul >= RUL_PLATEAU) {
      rulHoursEl.textContent = 'No degradation trend yet (healthy life is capped at 100 cycles in training)';
    } else {
      const safe = Math.max(0, rul * 0.85);
      rulHoursEl.textContent = `Plan within ${Math.round(safe)} cycles (15% safety margin) ≈ ${fmtDuration(safe * cycleTime)} at ${cycleTime.toFixed(1)} s/cycle`;
    }
  }

  // Telemetry Cells
  const vibEl = document.getElementById('drawer-vib-val');
  const tempEl = document.getElementById('drawer-temp-val');
  const loadEl = document.getElementById('drawer-load-val');
  const isoEl = document.getElementById('drawer-iso-val');

  if (vibEl) vibEl.textContent = `${vib.toFixed(2)} mm/s`;
  if (tempEl) tempEl.textContent = `${temp.toFixed(1)} °C`;
  if (loadEl) {
    loadEl.textContent = `${cycleTime.toFixed(1)} s`;
    loadEl.title = `Nominal ${nominalCycle.toFixed(1)} s; wear stretches each cycle by up to 40%`;
  }
  if (isoEl) {
    isoEl.textContent = `Zone ${zone} (${zoneInfo.label})`;
    isoEl.style.color = zoneInfo.color;
  }

  // Machine State & Tooling: fixed setpoints per asset, live values derived from the twin.
  const spec = MACHINE_SPECS[machineData.machine_id] || MACHINE_SPECS["CNC-01"];
  const derated = rawStatus === 'warning' || rawStatus === 'critical';
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setText('drawer-asset-tag', `ASSET # ${spec.asset}`);
  setText('drawer-rpm-val', spec.rpm);
  setText('drawer-feed-val', derated
    ? `${fmtNum(spec.feed * 0.7)} ${spec.feedUnit} (−30%)`
    : `${fmtNum(spec.feed)} ${spec.feedUnit}`);
  setText('drawer-coolant-val', spec.coolant);
  // Worn bearings and dull tools draw more power for the same cut.
  setText('drawer-power-val', `${(spec.powerKw * (1 + 0.25 * wear)).toFixed(1)} kW`);
  setText('drawer-tool-val', spec.tool);
  setText('drawer-toollife-val', `${fmtNum(Math.min(1, wear) * spec.lifeTotal, spec.lifeTotal < 100 ? 1 : 0)} / ${fmtNum(spec.lifeTotal)} ${spec.lifeUnit}`);
  setText('drawer-runtime-val', fmtClock(machineData.sim_time_s || 0));

  // Bearing defect bands, modeled from wear: they rise as the bearing degrades.
  const bands = [
    ['drawer-fft-1x', 0.45, 0.0],
    ['drawer-fft-bpfo', 0.06, 0.55],
    ['drawer-fft-bpfi', 0.04, 0.22],
    ['drawer-fft-bsf', 0.03, 0.12],
  ];
  bands.forEach(([id, base, growth]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const amp = vib * (base + growth * wear * wear);
    el.textContent = `${amp.toFixed(2)} mm/s`;
    el.style.color = amp >= 1.2 ? 'var(--color-rose)' : amp >= 0.5 ? 'var(--color-amber)' : 'var(--color-emerald)';
  });

  // Push samples to dual oscilloscope buffer
  pushDualSample(vib, temp);

  // SOP Diagnosis Card
  const sopBox = document.getElementById('drawer-sop-content');
  if (sopBox) {
    const isDegraded = ['warning', 'critical', 'failed'].includes(rawStatus) || zone === 'C' || zone === 'D';
    if (isDegraded) {
      sopBox.innerHTML = `
        <div class="sop-title">⚠️ SOP-AERO-04: High-Harmonic Vibration Mitigation</div>
        <div class="sop-cause">Vibration ${vib.toFixed(2)} mm/s is in ISO 10816-3 zone ${zone} (${zoneInfo.label}). Bearing defect bands are rising.</div>
        <ul class="sop-actions">
          <li><input type="checkbox" checked disabled> 30% feed-rate derate applied</li>
          <li><input type="checkbox" checked disabled> Coolant / lubrication supply verified: ${spec.coolant}</li>
          <li><input type="checkbox"> Inspect spindle runout with dial gauge (&lt; 0.003 mm)</li>
          <li><input type="checkbox"> Replace bearing set and reset wear</li>
        </ul>
      `;
    } else {
      sopBox.innerHTML = `
        <div class="sop-title" style="color: var(--color-emerald)">✓ SOP-AERO-01: Standard Operating Protocol</div>
        <div class="sop-cause">Vibration ${vib.toFixed(2)} mm/s is in ISO 10816-3 zone ${zone} (${zoneInfo.label}). No action needed.</div>
        <ul class="sop-actions">
          <li><input type="checkbox" checked disabled> Telemetry stream live</li>
          <li><input type="checkbox" checked disabled> Vibration and temperature inside limits</li>
          <li><input type="checkbox"> Visual inspection at shift changeover</li>
        </ul>
      `;
    }
  }

  // Open drawer
  drawer.classList.add('open');
}

/* ---------------- Verdict: answer first ---------------- */

function verdictText(m, p) {
  const part = p.cause.part;
  const at = (ms) => `${fmtDay(ms)}${wallClock(ms)}`;
  switch (p.key) {
    case 'down': return `Broken down: the ${part} failed and the line behind it is waiting. Repair it now.`;
    case 'service': return `Being serviced (${p.cause.fix.toLowerCase()}).${p.untilWall ? ` Back in production around ${wallClock(p.untilWall)}.` : ''}`;
    case 'now': return `The ${part} is close to failing. Service it${p.deadlineWall ? ` before ${at(p.deadlineWall)}` : ' now'} to avoid a breakdown.`;
    case 'soon': return `The ${part} is wearing out. Plan a service this shift${p.deadlineWall ? `, before ${at(p.deadlineWall)}` : ''}.`;
    case 'watch': return `Early wear on the ${part}. Nothing to do yet; the copilot will flag it when a service is due.`;
    default: return 'Running normally. No wear trend, so there is nothing to plan.';
  }
}

function renderVerdict(m, p, zone, vib) {
  const box = document.getElementById('drawer-verdict');
  if (!box) return;
  box.dataset.plan = p.key;
  box.classList.toggle('is-forecast', !!m.forecast);
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  set('verdict-label', p.label);
  let when = '';
  if (p.deadlineSeconds != null && (p.key === 'now' || p.key === 'soon')) when = ` · by ${fmtDay(p.deadlineWall)}${wallClock(p.deadlineWall)} <span class="muted">(in ${fmtIn(p.deadlineSeconds)})</span>`;
  else if (p.key === 'service' && p.untilWall) when = ` · back ${wallClock(p.untilWall)}`;
  set('verdict-when', when);
  set('verdict-text', verdictText(m, p));

  // Confidence: show the model's real error instead of a falsely precise number.
  let conf = '';
  if (p.key === 'service') {
    conf = '';
  } else if (p.trending && p.rul != null) {
    const err = p.mae != null ? ` ± ${Math.round(p.mae)}` : '';
    conf = `Predicted remaining life <b>${Math.round(p.rul)}${err} cycles</b>`;
    if (p.failLow && p.failHigh) conf += ` · likely failure between <b>${wallClock(p.failLow)}</b> and <b>${wallClock(p.failHigh)}</b>`;
    if (p.mae != null) conf += `<span class="muted"> (± is the model's typical error on unseen data)</span>`;
  } else if (p.key !== 'down' && p.key !== 'service') {
    conf = 'No degradation trend in the last 20 cycles.';
  }
  set('verdict-conf', conf);

  const showFix = ['down', 'now', 'soon', 'watch'].includes(p.key);
  const mins = Math.round((m.service_duration_s || 600) / 60);
  set('verdict-fix', showFix ? `<b>Fix:</b> ${p.cause.fix} · ${p.cause.sop} · ~${mins} min planned stop` : '');

  const approve = document.getElementById('btn-approve');
  const snooze = document.getElementById('btn-snooze');
  const actionable = !m.forecast && ['down', 'now', 'soon', 'watch'].includes(p.key);
  if (approve) {
    approve.hidden = !actionable;
    approve.textContent = p.key === 'down' ? 'Approve repair' : 'Approve work order';
    approve.classList.toggle('secondary', p.key === 'watch');
  }
  if (snooze) snooze.hidden = !actionable || p.key === 'down';

  // Trend sparkline with ISO zone bands
  const hist = m.forecast ? [] : getHistory(m.machine_id);
  const svgEl = document.getElementById('verdict-spark');
  const n = document.getElementById('verdict-n');
  if (n) n.textContent = hist.length;
  if (svgEl) svgEl.innerHTML = sparkline(hist.map(h => h.vib));
  const trendEl = document.getElementById('verdict-trend');
  if (trendEl) {
    if (hist.length >= 10) {
      const a = hist.slice(-10, -5).reduce((x, h) => x + h.vib, 0) / 5;
      const b = hist.slice(-5).reduce((x, h) => x + h.vib, 0) / 5;
      const d = b - a;
      trendEl.textContent = `now ${vib.toFixed(2)} mm/s · zone ${zone} · ${Math.abs(d) < 0.03 ? 'steady' : d > 0 ? 'rising' : 'falling'}`;
    } else trendEl.textContent = `now ${vib.toFixed(2)} mm/s · zone ${zone}`;
  }
}

function sparkline(values) {
  const W = 320, H = 74, MAXV = 6;
  const y = v => H - (Math.min(v, MAXV) / MAXV) * H;
  const [ab, bc, cd] = ISO_ZONE_LIMITS;
  const bands = [
    [0, ab, 'var(--color-emerald)'], [ab, bc, 'var(--color-cyan)'],
    [bc, cd, 'var(--color-amber)'], [cd, MAXV, 'var(--color-rose)'],
  ].map(([lo, hi, c]) => `<rect x="0" y="${y(hi)}" width="${W}" height="${y(lo) - y(hi)}" fill="${c}" opacity="0.10"/>`).join('');
  const labels = [['A', ab / 2], ['B', (ab + bc) / 2], ['C', (bc + cd) / 2], ['D', (cd + MAXV) / 2]]
    .map(([t, v]) => `<text x="${W - 4}" y="${y(v) + 3}" text-anchor="end" class="spark-zone">${t}</text>`).join('');
  if (values.length < 2) return bands + labels + `<text x="8" y="${H / 2}" class="spark-empty">Collecting readings…</text>`;
  const step = W / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = values[values.length - 1];
  return bands + labels + `<polyline points="${pts}" fill="none" stroke="var(--text-main)" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
    <circle cx="${W - 1}" cy="${y(last)}" r="3" fill="var(--text-main)"/>`;
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

    // Harmonic frequency markers (1X Rotational & 2X Harmonic)
    ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(w * 0.32, 0); ctx.lineTo(w * 0.32, h);
    ctx.moveTo(w * 0.64, 0); ctx.lineTo(w * 0.64, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.65)' : 'rgba(2, 132, 199, 0.65)';
    ctx.font = '9px monospace';
    ctx.fillText('1X ROTOR', w * 0.32 + 3, 11);
    ctx.fillText('2X HARM', w * 0.64 + 3, 11);

    const latestVib = vibrationBuffer[vibrationBuffer.length - 1] || 0.15;
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.5)';
    ctx.fillText(`Vpp: ${(latestVib * 2.8).toFixed(2)} mm/s`, 6, h - 6);
  }

  renderWaveform();
}
