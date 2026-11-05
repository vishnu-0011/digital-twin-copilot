/**
 * Forecast dock: scrub the plant into the future
 * ===============================================
 * Asks the backend to fast-forward a copy of the live twin (GET /forecast),
 * then lets you drag a slider through the next hours. Each slider position is
 * rendered through the same path as live telemetry, so the 3D status rings,
 * badges, KPIs and the inspection drawer all show the future plant.
 *
 * Two futures come back from one request: "Do nothing" (machines run until
 * they break) and "With copilot" (the scheduler's service rule). Toggling
 * between them is instant.
 */

import { setTourBeacon } from './scene.js';
import { addLogMessage } from './hud.js';
import { playClick } from './audio.js';

const HORIZON_H = 8;
const SAMPLES = 97;

let deps = null;          // { renderFleet, getLiveFleet, selectMachine }
let data = null;          // last /forecast response
let policy = 'run_to_failure';
let index = 0;
let active = false;
let playTimer = null;
let openedAt = 0;         // wall clock the forecast is anchored to
let liveSimTime = 0;

const $ = (id) => document.getElementById(id);

export function isForecastActive() { return active; }

/* ---------------- time helpers ---------------- */

function fmtOffset(s) {
  if (s < 60) return 'now';
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `+${h}h ${String(m).padStart(2, '0')}m` : `+${m} min`;
}

function fmtIn(s) {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function shiftName(d) {
  const h = d.getHours();
  if (h >= 6 && h < 14) return '1st shift';
  if (h >= 14 && h < 22) return '2nd shift';
  return '3rd shift';
}

function clockAt(s) {
  const d = new Date(openedAt + s * 1000);
  const day = d.toLocaleDateString('en-US', { weekday: 'short' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return { text: `${day} ${time}`, shift: shiftName(d) };
}

/* ---------------- DOM ---------------- */

function buildDock() {
  if ($('forecast-dock')) return;
  const dock = document.createElement('section');
  dock.id = 'forecast-dock';
  dock.className = 'forecast-dock';
  dock.setAttribute('aria-label', 'Forecast');
  dock.hidden = true;
  dock.innerHTML = `
    <header class="fc-head">
      <div class="fc-title">
        <span class="fc-kicker">FORECAST</span>
        <strong>What happens over the next ${HORIZON_H} hours</strong>
      </div>
      <div class="fc-policy" role="radiogroup" aria-label="Scenario">
        <button class="fc-pill active" data-policy="run_to_failure" role="radio" aria-checked="true">Do nothing</button>
        <button class="fc-pill" data-policy="copilot" role="radio" aria-checked="false">With copilot</button>
      </div>
      <div class="fc-actions">
        <button id="fc-rerun" class="fc-icon" title="Re-run from the live plant">↻</button>
        <button id="fc-close" class="fc-icon" title="Back to live (Esc)">✕</button>
      </div>
    </header>

    <div class="fc-scrub">
      <button id="fc-play" class="fc-play" title="Play">▶</button>
      <div class="fc-track-wrap">
        <div id="fc-events" class="fc-events" aria-hidden="true"></div>
        <input id="fc-slider" class="fc-slider" type="range" min="0" max="${SAMPLES - 1}" value="0" step="1" aria-label="Time into the future">
        <div class="fc-scale"><span>now</span><span>+${HORIZON_H / 4}h</span><span>+${HORIZON_H / 2}h</span><span>+${(3 * HORIZON_H) / 4}h</span><span>+${HORIZON_H}h</span></div>
      </div>
      <div class="fc-clock">
        <strong id="fc-offset">now</strong>
        <span id="fc-wall">--</span>
      </div>
    </div>

    <div class="fc-body">
      <div id="fc-next" class="fc-next"></div>
      <div class="fc-compare">
        <div class="fc-card fc-bad" data-policy="run_to_failure">
          <span class="fc-card-k">Do nothing</span>
          <span class="fc-card-v"><b id="fc-rtf-break">–</b> breakdowns</span>
          <span class="fc-card-s"><span id="fc-rtf-down">–</span> h down · <span id="fc-rtf-parts">–</span> parts</span>
        </div>
        <div class="fc-card fc-good" data-policy="copilot">
          <span class="fc-card-k">With copilot</span>
          <span class="fc-card-v"><b id="fc-cop-break">–</b> breakdowns</span>
          <span class="fc-card-s"><span id="fc-cop-down">–</span> h down · <span id="fc-cop-parts">–</span> parts</span>
        </div>
        <div class="fc-gain">
          <b id="fc-gain-parts">–</b>
          <span>more parts</span>
          <span class="fc-gain-s" id="fc-gain-down">–</span>
        </div>
      </div>
    </div>
    <footer class="fc-foot" id="fc-foot">Simulated from the live plant state. A breakdown is assumed to take 3× as long to fix as a planned service.</footer>
  `;
  document.body.appendChild(dock);

  const watermark = document.createElement('div');
  watermark.id = 'forecast-watermark';
  watermark.className = 'forecast-watermark';
  watermark.setAttribute('aria-hidden', 'true');
  document.body.appendChild(watermark);

  dock.querySelectorAll('.fc-pill').forEach(b => b.addEventListener('click', () => { playClick(); setPolicy(b.dataset.policy); }));
  dock.querySelectorAll('.fc-card').forEach(c => c.addEventListener('click', () => { playClick(); setPolicy(c.dataset.policy); }));
  $('fc-slider').addEventListener('input', (e) => { stopPlay(); setIndex(Number(e.target.value)); });
  $('fc-play').addEventListener('click', () => { playClick(); playTimer ? stopPlay() : startPlay(); });
  $('fc-close').addEventListener('click', () => { playClick(); closeForecast(); });
  $('fc-rerun').addEventListener('click', () => { playClick(); load(); });
  $('fc-next').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-goto]');
    if (!btn) return;
    playClick();
    stopPlay();
    setIndex(Number(btn.dataset.goto));
    if (btn.dataset.machine) { deps.selectMachine(btn.dataset.machine); setIndex(index); }
  });
}

/* ---------------- data → scene ---------------- */

function fleetAt(i) {
  const run = data.policies[policy];
  const t = data.times_s[i];
  return Object.entries(run.machines).map(([id, m]) => ({
    machine_id: id,
    status: m.status[i],
    wear_level: m.wear[i],
    vibration_rms: m.vibration_rms[i],
    temperature_c: m.temperature_c[i],
    predicted_rul_cycles: m.rul_cycles[i],
    throughput_units: m.parts[i],
    sim_time_s: liveSimTime + t,
    nominal_cycle_time_s: data.machine_meta[id]?.nominal_cycle_time_s,
    machine_type: data.machine_meta[id]?.machine_type,
    service_duration_s: data.machine_meta[id]?.service_duration_s,
    forecast_offset_s: t,
    forecast: true,
  }));
}

function setIndex(i) {
  if (!data) return;
  index = Math.max(0, Math.min(data.times_s.length - 1, i));
  const t = data.times_s[index];
  $('fc-slider').value = String(index);
  $('fc-slider').style.setProperty('--fc-pct', `${(100 * index) / (data.times_s.length - 1)}%`);
  const clock = clockAt(t);
  $('fc-offset').textContent = fmtOffset(t);
  $('fc-wall').textContent = `${clock.text} · ${clock.shift}`;
  const wm = $('forecast-watermark');
  if (wm) wm.innerHTML = `<b>${t < 60 ? 'NOW' : fmtOffset(t)}</b><span>${policy === 'copilot' ? 'with copilot' : 'if nobody acts'}</span>`;

  deps.renderFleet(fleetAt(index));
  renderNext(t);
}

function renderNext(t) {
  const run = data.policies[policy];
  const el = $('fc-next');
  const evType = policy === 'copilot' ? 'service' : 'breakdown';
  const failedNow = Object.entries(run.machines).filter(([, m]) => m.status[index] === 'failed').map(([id]) => id);
  const next = run.events.find(e => e.type === evType && e.t >= t - 1);
  // Land on the first sample at or after the event, so the scene shows it happening.
  const idxOf = (s) => Math.min(data.times_s.length - 1, Math.ceil((s / data.horizon_s) * (data.times_s.length - 1)));

  let html = '';
  if (failedNow.length) {
    html += `<div class="fc-line fc-alert"><span class="fc-dot"></span><b>${failedNow.join(', ')}</b> ${failedNow.length > 1 ? 'are' : 'is'} broken down at this point</div>`;
  }
  if (next) {
    const c = clockAt(next.t);
    const verb = evType === 'breakdown' ? 'breaks down' : 'gets a planned service';
    html += `<button class="fc-line fc-link ${evType === 'breakdown' ? 'fc-warn' : 'fc-ok'}" data-goto="${idxOf(next.t)}" data-machine="${next.machine_id}">
      <span class="fc-dot"></span><b>${next.machine_id}</b> ${verb} in ${fmtIn(Math.max(0, next.t - t))}
      <span class="fc-when">${c.text}, ${c.shift}</span><span class="fc-go">Show me →</span></button>`;
    setTourBeacon(next.machine_id);
  } else {
    html += `<div class="fc-line fc-ok"><span class="fc-dot"></span>No ${evType === 'breakdown' ? 'breakdowns' : 'services'} left in this window</div>`;
    setTourBeacon(failedNow[0] || null);
  }
  el.innerHTML = html;
}

function renderSummary() {
  const r = data.policies.run_to_failure.summary;
  const c = data.policies.copilot.summary;
  const fmt = (n) => Number(n).toLocaleString('en-US');
  $('fc-rtf-break').textContent = r.breakdowns;
  $('fc-rtf-down').textContent = r.downtime_h.toFixed(1);
  $('fc-rtf-parts').textContent = fmt(r.parts);
  $('fc-cop-break').textContent = c.breakdowns;
  $('fc-cop-down').textContent = c.downtime_h.toFixed(1);
  $('fc-cop-parts').textContent = fmt(c.parts);
  const gain = c.parts - r.parts;
  const pct = r.parts ? Math.round((100 * gain) / r.parts) : 0;
  $('fc-gain-parts').textContent = `${gain >= 0 ? '+' : ''}${fmt(gain)}`;
  $('fc-gain-down').textContent = `${pct >= 0 ? '+' : ''}${pct}% output · ${(r.downtime_h - c.downtime_h).toFixed(1)} h less downtime`;
  const a = data.assumptions || {};
  $('fc-foot').innerHTML = `Simulated from the live plant state (seed ${a.seed}). Copilot rule: ${a.copilot_rule}; this preview assumes its remaining-life estimate is exact. A breakdown takes ${a.unplanned_repair_multiplier}× a planned service. <a href="/results.html#policy" target="_blank" rel="noopener">Measured with the real model →</a>`;
}

function renderEventTicks() {
  const wrap = $('fc-events');
  const run = data.policies[policy];
  const type = policy === 'copilot' ? 'service' : 'breakdown';
  wrap.innerHTML = run.events
    .filter(e => e.type === type)
    .map(e => `<i class="fc-tick ${type}" style="left:${(100 * e.t) / data.horizon_s}%" title="${e.machine_id} ${type} · ${fmtOffset(e.t)}"></i>`)
    .join('');
}

function setPolicy(p) {
  policy = p;
  document.querySelectorAll('#forecast-dock .fc-pill').forEach(b => {
    const on = b.dataset.policy === p;
    b.classList.toggle('active', on);
    b.setAttribute('aria-checked', String(on));
  });
  document.querySelectorAll('#forecast-dock .fc-card').forEach(c => c.classList.toggle('active', c.dataset.policy === p));
  document.body.dataset.forecastPolicy = p;
  if (data) { renderEventTicks(); setIndex(index); }
}

/* ---------------- playback ---------------- */

function startPlay() {
  if (!data) return;
  if (index >= data.times_s.length - 1) setIndex(0);
  $('fc-play').textContent = '❚❚';
  $('fc-play').title = 'Pause';
  playTimer = setInterval(() => {
    if (index >= data.times_s.length - 1) { stopPlay(); return; }
    setIndex(index + 1);
  }, 140);
}

function stopPlay() {
  if (playTimer) clearInterval(playTimer);
  playTimer = null;
  const b = $('fc-play');
  if (b) { b.textContent = '▶'; b.title = 'Play'; }
}

/* ---------------- lifecycle ---------------- */

async function load() {
  const dock = $('forecast-dock');
  dock.classList.add('loading');
  try {
    const res = await fetch(`/forecast?horizon_h=${HORIZON_H}&samples=${SAMPLES}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
    openedAt = Date.now();
    const live = deps.getLiveFleet() || [];
    liveSimTime = live.reduce((a, m) => Math.max(a, m.sim_time_s || 0), 0);
    renderSummary();
    renderEventTicks();
    setIndex(0);
    const r = data.policies.run_to_failure;
    const first = r.events.find(e => e.type === 'breakdown');
    addLogMessage(first
      ? `Forecast: ${first.machine_id} breaks down in ${fmtIn(first.t)} if nobody acts. ${r.summary.breakdowns} breakdowns in ${HORIZON_H} h without the copilot, ${data.policies.copilot.summary.breakdowns} with it.`
      : `Forecast: no breakdowns expected in the next ${HORIZON_H} h.`, 'FORECAST');
  } catch (err) {
    $('fc-next').innerHTML = `<div class="fc-line fc-alert"><span class="fc-dot"></span>Forecast unavailable (${err.message}). Is the backend running?</div>`;
  } finally {
    dock.classList.remove('loading');
  }
}

export async function openForecast({ policy: p = 'run_to_failure', at = null } = {}) {
  if (!deps) return;
  buildDock();
  active = true;
  document.body.classList.add('forecast-mode');
  $('forecast-dock').hidden = false;
  syncPlacement();
  $('btn-forecast')?.classList.add('active');
  setPolicy(p);
  await load();
  if (at === 'first-breakdown' && data) {
    const ev = data.policies.run_to_failure.events.find(e => e.type === 'breakdown');
    if (ev) setIndex(Math.ceil((ev.t / data.horizon_s) * (data.times_s.length - 1)));
  }
  return data;
}

export function closeForecast() {
  if (!active) return;
  stopPlay();
  active = false;
  document.body.classList.remove('forecast-mode');
  const dock = $('forecast-dock');
  if (dock) dock.hidden = true;
  $('btn-forecast')?.classList.remove('active');
  setTourBeacon(null);
  const live = deps.getLiveFleet();
  if (live && live.length) deps.renderFleet(live);
}

/** Lets the guided tour drive the dock. */
export const forecastControls = {
  open: openForecast,
  close: closeForecast,
  setPolicy: (p) => setPolicy(p),
  seekToFirst(type = 'breakdown') {
    if (!data) return;
    const run = data.policies[type === 'service' ? 'copilot' : 'run_to_failure'];
    const ev = run.events.find(e => e.type === type);
    if (ev) setIndex(Math.ceil((ev.t / data.horizon_s) * (data.times_s.length - 1)));
  },
  play: () => startPlay(),
  isOpen: () => active,
};

/** Keeps the dock above the pipeline ribbon and beside the inspection drawer. */
function syncPlacement() {
  const dock = $('forecast-dock');
  if (!dock || dock.hidden) return;
  const ribbon = $('pipeline-ribbon');
  const top = ribbon ? ribbon.getBoundingClientRect().top : window.innerHeight;
  dock.style.setProperty('--fc-bottom', `${Math.max(12, window.innerHeight - top + 12)}px`);
  const drawer = $('machine-drawer');
  dock.classList.toggle('beside-drawer', !!(drawer && drawer.classList.contains('open')));
}

export function initForecastUI(d) {
  deps = d;
  const ribbon = $('pipeline-ribbon');
  const drawer = $('machine-drawer');
  const mo = new MutationObserver(() => { syncPlacement(); setTimeout(syncPlacement, 320); });
  if (ribbon) { mo.observe(ribbon, { attributes: true, attributeFilter: ['class'] }); ribbon.addEventListener('transitionend', syncPlacement); }
  if (drawer) mo.observe(drawer, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', syncPlacement);
  const btn = $('btn-forecast');
  if (btn) btn.addEventListener('click', () => { playClick(); active ? closeForecast() : openForecast(); });
  $('btn-tour')?.addEventListener('click', () => { if (active) closeForecast(); }, true);
  window.addEventListener('keydown', (e) => {
    if (!active || document.body.classList.contains('tour-mode')) return;
    if (e.key === 'Escape') closeForecast();
    else if (e.key === 'ArrowRight') { stopPlay(); setIndex(index + 1); }
    else if (e.key === 'ArrowLeft') { stopPlay(); setIndex(index - 1); }
  });
  // ?forecast=1 opens straight into the future (handy for demos and screenshots).
  if (new URLSearchParams(location.search).get('forecast')) setTimeout(() => openForecast(), 1200);
}
