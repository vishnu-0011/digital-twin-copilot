/**
 * Guided Presentation Tour Engine (Titan Aerospace Operations Center)
 * ====================================================================
 * Orchestrates a 7-beat automated presentation walkthrough:
 *   1. Campus Overview (Exterior town roads, traffic, company parking)
 *   2. Dollhouse Cleanroom Interior (8 workcells, 2 AMRs, 10-stage line)
 *   3. Simulated Spindle Anomaly on CNC-01 (Vibration spike & alert)
 *   4. Factory Radar Scan & LangGraph Anomaly Detection
 *   5. Holographic SCADA Drawer (Telemetry -> 2021 TCN RUL -> Titan SOP)
 *   6. Closed-Loop Maintenance Dispatch & Nominal Restoration
 *   7. Tour Wrap-up & Free Exploration Handoff
 */

import {
  setCameraPreset,
  focusOnMachine,
  triggerRadarScan
} from './scene.js';

import {
  closeDrawer,
  addLogMessage
} from './hud.js';

import {
  playClick,
  playScan,
  playAlarm,
  playRepairSuccess
} from './audio.js';

let deps = {
  selectMachine: (id) => (window.selectMachine ? window.selectMachine(id) : null),
  dispatchAction: async (action, payload) => (window.dispatchAction ? window.dispatchAction(action, payload) : null)
};

let isRunning = false;
let currentStepIndex = 0;
let stepTimeoutId = null;
let progressIntervalId = null;

const TOUR_STEPS = [
  {
    step: 1,
    title: "1/7: Facility Campus Overview",
    desc: "Titan Aerospace precision manufacturing campus: exterior grounds, logistics corridors, and cleanroom production complex.",
    duration: 6500,
    action: async () => {
      closeDrawer();
      setCameraPreset('campus');
      playClick();
      updateDirectorButtons('campus');
      addLogMessage("Tour [1/7]: Viewing exterior facility campus and access logistics.", "TOUR");
    }
  },
  {
    step: 2,
    title: "2/7: Production Cleanroom Interior",
    desc: "Live isometric view of 8 aerospace workcells, autonomous mobile robots (AMRs), and active production line telemetry.",
    duration: 6500,
    action: async () => {
      setCameraPreset('global');
      playClick();
      updateDirectorButtons('global');
      addLogMessage("Tour [2/7]: Entering cleanroom production floor with active telemetry.", "TOUR");
    }
  },
  {
    step: 3,
    title: "3/7: Anomaly Simulation (CNC-01)",
    desc: "Simulating spindle bearing degradation. Vibration telemetry increases above nominal operational limits (ISO 10816 Zone C/D).",
    duration: 7000,
    action: async () => {
      focusOnMachine('CNC-01');
      playAlarm();
      await deps.dispatchAction('inject_fault', { machine_id: 'CNC-01', wear_level: 0.86, status: 'critical' });
      addLogMessage("Tour [3/7]: Spindle bearing degradation simulated on CNC-01. Vibration warning active.", "ALERT");
    }
  },
  {
    step: 4,
    title: "4/7: Automated Health Diagnostics",
    desc: "Plant-wide telemetry scan isolates the vibration variance and pinpoints anomalous harmonics in the spindle assembly.",
    duration: 6500,
    action: async () => {
      triggerRadarScan();
      playScan();
      await deps.dispatchAction('scan');
      addLogMessage("Tour [4/7]: Diagnostic scan complete. Anomaly isolated to CNC-01.", "SCAN");
    }
  },
  {
    step: 5,
    title: "5/7: Predictive Health & RUL Forecast",
    desc: "Inspection drawer reveals real-time telemetry waveforms, Remaining Useful Life (RUL) trajectory, and standard operating procedures.",
    duration: 8500,
    action: async () => {
      deps.selectMachine('CNC-01');
      playClick();
      addLogMessage("Tour [5/7]: Inspecting CNC-01 telemetry and Remaining Useful Life forecast.", "SCADA");

      // Smoothly cycle drawer tabs for the audience
      setTimeout(() => {
        if (!isRunning) return;
        const tcnTab = document.querySelector('.drawer-tab[data-tab="tcn"]');
        if (tcnTab) {
          tcnTab.click();
          playClick();
        }
      }, 2800);

      setTimeout(() => {
        if (!isRunning) return;
        const sopTab = document.querySelector('.drawer-tab[data-tab="sop"]');
        if (sopTab) {
          sopTab.click();
          playClick();
        }
      }, 5800);
    }
  },
  {
    step: 6,
    title: "6/7: Corrective Maintenance Dispatch",
    desc: "Executing automated maintenance procedure. Bearing serviced, wear cleared to nominal 0.0, and machine restored to service.",
    duration: 6500,
    action: async () => {
      await deps.dispatchAction('repair', { machine_id: 'CNC-01' });
      playRepairSuccess();
      addLogMessage("Tour [6/7]: Maintenance completed. CNC-01 tooling restored to nominal baseline.", "SUCCESS");
    }
  },
  {
    step: 7,
    title: "7/7: Nominal Operations Restored",
    desc: "Production line restored to 98.4% balance. The digital twin operations center is now unlocked for interactive exploration.",
    duration: 4500,
    action: async () => {
      closeDrawer();
      setCameraPreset('global');
      updateDirectorButtons('global');
      playClick();
      addLogMessage("Tour [7/7]: Walkthrough complete. Operations center unlocked for interactive exploration.", "READY");
    }
  }
];

function updateDirectorButtons(preset) {
  const directorButtons = document.querySelectorAll('.btn-director');
  directorButtons.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-preset') === preset);
  });
}

function updateStepperDots(activeIndex) {
  const stepper = document.getElementById('tour-stepper');
  if (!stepper) return;
  stepper.innerHTML = '';
  TOUR_STEPS.forEach((_, idx) => {
    const dot = document.createElement('span');
    dot.className = 'tour-step-dot' + (idx === activeIndex ? ' active' : (idx < activeIndex ? ' done' : ''));
    dot.title = `Step ${idx + 1}: ${TOUR_STEPS[idx].title}`;
    stepper.appendChild(dot);
  });
}

function animateProgressBar(durationMs) {
  const fill = document.getElementById('tour-progress-fill');
  if (!fill) return;

  if (progressIntervalId) clearInterval(progressIntervalId);
  const startTime = performance.now();
  fill.style.width = '0%';

  progressIntervalId = setInterval(() => {
    if (!isRunning) {
      clearInterval(progressIntervalId);
      return;
    }
    const elapsed = performance.now() - startTime;
    const pct = Math.min(100, (elapsed / durationMs) * 100);
    fill.style.width = `${pct}%`;
    if (pct >= 100) {
      clearInterval(progressIntervalId);
    }
  }, 50);
}

async function runStep(index) {
  if (!isRunning) return;

  if (index >= TOUR_STEPS.length) {
    stopGuidedTour();
    return;
  }

  currentStepIndex = index;
  const step = TOUR_STEPS[index];

  // Update UI Elements
  const banner = document.getElementById('tour-banner');
  const titleEl = document.getElementById('tour-title');
  const descEl = document.getElementById('tour-desc');

  if (banner) banner.classList.remove('hidden');
  if (titleEl) titleEl.textContent = step.title;
  if (descEl) descEl.textContent = step.desc;

  updateStepperDots(index);
  animateProgressBar(step.duration);

  // Execute Step Action
  try {
    await step.action();
  } catch (err) {
    console.error("Error executing tour step action:", err);
  }

  // Schedule Next Step
  stepTimeoutId = setTimeout(() => {
    if (isRunning) {
      runStep(index + 1);
    }
  }, step.duration);
}

export function startGuidedTour() {
  if (isRunning) return;
  isRunning = true;
  currentStepIndex = 0;

  const btnTour = document.getElementById('btn-tour');
  if (btnTour) {
    btnTour.classList.add('tour-active');
    btnTour.innerHTML = '⏹ Stop Tour';
  }

  const banner = document.getElementById('tour-banner');
  if (banner) banner.classList.remove('hidden');

  runStep(0);
}

export function stopGuidedTour() {
  if (!isRunning) return;
  isRunning = false;

  if (stepTimeoutId) {
    clearTimeout(stepTimeoutId);
    stepTimeoutId = null;
  }
  if (progressIntervalId) {
    clearInterval(progressIntervalId);
    progressIntervalId = null;
  }

  const btnTour = document.getElementById('btn-tour');
  if (btnTour) {
    btnTour.classList.remove('tour-active');
    btnTour.innerHTML = '🎬 Guided Demo';
  }

  const banner = document.getElementById('tour-banner');
  if (banner) banner.classList.add('hidden');

  addLogMessage("Guided Presentation Tour stopped.", "TOUR");
}

export function isTourRunning() {
  return isRunning;
}

export function initTourUI(injected = {}) {
  deps = { ...deps, ...injected };

  const btnTour = document.getElementById('btn-tour');
  if (btnTour) {
    btnTour.addEventListener('click', () => {
      playClick();
      if (isRunning) {
        stopGuidedTour();
      } else {
        startGuidedTour();
      }
    });
  }

  const btnTourClose = document.getElementById('btn-tour-close');
  if (btnTourClose) {
    btnTourClose.addEventListener('click', () => {
      playClick();
      stopGuidedTour();
    });
  }

  // Keyboard shortcut: Escape exits tour
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isRunning) {
      stopGuidedTour();
    }
  });
}
