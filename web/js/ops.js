/**
 * Operations panel
 * ================
 * The supervisor's home screen: a ranked "Needs attention" list with plain
 * reasons, clock-time deadlines and one-click actions, plus the shift plan
 * (from the forecast), an audit log, and the impact of the copilot so far.
 *
 * Views: Supervisor (act), Manager (impact and plan), Technician (my jobs).
 */

import { PLAN, planShort, fmtClock, fmtDay, fmtIn, nextChangeover } from './plan.js';
import { playAlarm, playClick, playRepairSuccess } from './audio.js';
import { setAttentionMode } from './scene.js';

const NAMES = {
  'CNC-01': 'Roughing mill', 'CNC-02': 'Finishing mill', 'PRESS-01': 'Forging press',
  'PRESS-02': 'Extrusion press', 'FURN-01': 'Heat-treat furnace', 'ROBOT-01': 'Deburring robot',
  'LASER-01': 'Laser QC gauge', 'CONV-01': 'Assembly conveyor',
};
const VIEW_LABEL = { supervisor: 'Supervisor', manager: 'Manager', technician: 'Technician' };
const LOG_ICON = {
  work_order: '📝', repair: '🔧', auto_service: '🤖', breakdown: '⛔', back_in_service: '✅',
  alert: '⚠️', fault: '🧪', reset: '↺', step: '⏩', start: '▶',
};

let deps = null;     // { dispatch, selectMachine, openForecast }
let fleet = [];
let plant = null;
let logEntries = [];
let view = 'supervisor';
let pane = 'attention';
let forecast = null;
let forecastAt = 0;
const prevRank = new Map();
const fresh = new Set();          // ids that just escalated and are not acknowledged
let snoozed = {};                 // id -> { until, rank }
let firstRender = true;

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* private mode */ } }

export function getView() { return view; }

/* ---------------- actions ---------------- */

export function approve(id) {
  const m = fleet.find(x => x.machine_id === id);
  if (!m || !deps) return;
  fresh.delete(id);
  delete snoozed[id]; save('titan_snoozed', snoozed);
  const by = VIEW_LABEL[view] || 'Supervisor';
  deps.dispatch('work_order', { machine_id: id, by });
  playRepairSuccess();
  const mins = Math.round((m.service_duration_s || 600) / 60);
  toast(`Work order approved for <b>${id}</b>. In service for about ${mins} min.`, 'ok');
  setTimeout(() => refreshForecast(true), 1500);
}

export function plantChanged() { setTimeout(() => refreshForecast(true), 1200); }

export function snooze(id) {
  const m = fleet.find(x => x.machine_id === id);
  if (!m) return;
  const until = nextChangeover(Date.now());
  snoozed[id] = { until, rank: (m.plan || PLAN.healthy).rank };
  save('titan_snoozed', snoozed);
  fresh.delete(id);
  toast(`<b>${id}</b> snoozed until the ${fmtClock(until)} changeover. It comes back sooner if it gets worse.`, 'info');
  render();
}

function isSnoozed(m) {
  const s = snoozed[m.machine_id];
  if (!s) return false;
  const rank = (m.plan || PLAN.healthy).rank;
  if (Date.now() > s.until || rank > s.rank) { delete snoozed[m.machine_id]; save('titan_snoozed', snoozed); return false; }
  return true;
}

/* ---------------- toasts & alarms ---------------- */

export function toast(html, tone = 'info', action = null) {
  const stack = $('toast-stack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = `toast toast-${tone}`;
  el.innerHTML = `<span>${html}</span>`;
  if (action) {
    const b = document.createElement('button');
    b.textContent = action.label;
    b.addEventListener('click', () => { action.run(); el.remove(); });
    el.appendChild(b);
  }
  stack.appendChild(el);
  setTimeout(() => el.classList.add('out'), tone === 'alert' ? 9000 : 4500);
  setTimeout(() => el.remove(), tone === 'alert' ? 9600 : 5100);
}

function checkEscalations() {
  fleet.forEach(m => {
    const p = m.plan || PLAN.healthy;
    const before = prevRank.get(m.machine_id);
    prevRank.set(m.machine_id, p.rank);
    if (p.rank >= PLAN.now.rank && (before == null || before < PLAN.now.rank)) {
      fresh.add(m.machine_id);
      if (!firstRender && !isSnoozed(m) && !document.body.classList.contains('tour-mode')) {
        playAlarm();
        toast(`<b>${m.machine_id}</b> ${p.key === 'down' ? 'has broken down' : `needs service now${p.deadlineWall ? `, by ${fmtClock(p.deadlineWall)}` : ''}`}.`, 'alert',
          { label: 'View', run: () => deps.selectMachine(m.machine_id) });
      }
    }
    if (p.rank < PLAN.soon.rank) fresh.delete(m.machine_id);
  });
  firstRender = false;
}

/* ---------------- render: attention ---------------- */

function cardText(m, p) {
  const part = p.cause.part;
  const zone = m.iso_zone && (m.iso_zone === 'C' || m.iso_zone === 'D') ? ` Vibration in zone ${m.iso_zone}.` : '';
  if (p.key === 'down') return 'Broken down. The line behind it is waiting.';
  if (p.key === 'now') return `${cap(part)} close to failing.${zone}`;
  if (p.key === 'soon') return `${cap(part)} wearing out. Plan it this shift.${zone}`;
  if (p.key === 'watch') return `Early wear on the ${part}. Nothing to do yet.`;
  if (p.key === 'service') return `${p.cause.fix}.`;
  return 'Running normally.';
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function whenText(p) {
  if (p.key === 'down') return '<span class="att-when urgent">now</span>';
  if (p.deadlineWall && (p.key === 'now' || p.key === 'soon')) {
    return `<span class="att-when" title="${fmtIn(p.deadlineSeconds)} from now">by ${fmtDay(p.deadlineWall)}${fmtClock(p.deadlineWall)}</span>`;
  }
  if (p.key === 'service' && p.untilWall) return `<span class="att-when">back ${fmtClock(p.untilWall)}</span>`;
  return '';
}

function card(m, { actions = true, compact = false } = {}) {
  const p = m.plan || PLAN.healthy;
  const mins = Math.round((m.service_duration_s || 600) / 60);
  const isNew = fresh.has(m.machine_id);
  let actionsHtml = '';
  if (actions && ['down', 'now', 'soon'].includes(p.key)) {
    actionsHtml = `<div class="att-actions">
      <button class="att-approve" data-act="approve" data-id="${m.machine_id}">${view === 'technician' ? 'Start job' : p.key === 'down' ? 'Approve repair' : 'Approve work order'}</button>
      ${p.key !== 'down' ? `<button data-act="snooze" data-id="${m.machine_id}" title="Hide until the next shift changeover">Snooze</button>` : ''}
      <button data-act="why" data-id="${m.machine_id}">Why?</button></div>`;
  } else if (actions) {
    actionsHtml = `<div class="att-actions"><button data-act="why" data-id="${m.machine_id}">Details</button></div>`;
  }
  let progress = '';
  if (p.key === 'service' && p.untilSeconds != null) {
    const total = m.service_duration_s || 600;
    const pct = Math.max(0, Math.min(100, 100 * (1 - p.untilSeconds / total)));
    progress = `<div class="att-progress"><i style="width:${pct.toFixed(0)}%"></i></div>`;
  }
  return `<article class="att-card ${compact ? 'compact' : ''} ${isNew ? 'is-new' : ''}" data-plan="${p.key}" data-id="${m.machine_id}" tabindex="0">
    <header><span class="att-dot"></span><b>${m.machine_id}</b><span class="att-name">${NAMES[m.machine_id] || ''}</span>${whenText(p)}</header>
    ${compact ? '' : `<p>${cardText(m, p)}</p>`}
    ${!compact && ['down', 'now', 'soon'].includes(p.key) ? `<div class="att-fix">${p.cause.fix} · ~${mins} min stop</div>` : ''}
    ${progress}
    ${actionsHtml}
  </article>`;
}

function renderAttention() {
  const el = $('ops-pane-attention');
  if (!el) return;
  const byRank = [...fleet].sort((a, b) => (b.plan?.rank || 0) - (a.plan?.rank || 0) || (a.plan?.deadlineWall || 9e15) - (b.plan?.deadlineWall || 9e15));
  const urgent = byRank.filter(m => (m.plan?.rank || 0) >= PLAN.soon.rank && !isSnoozed(m));
  const snoozedList = byRank.filter(m => (m.plan?.rank || 0) >= PLAN.soon.rank && isSnoozed(m));
  const inService = byRank.filter(m => m.plan?.key === 'service');
  const watch = byRank.filter(m => m.plan?.key === 'watch');
  const healthy = byRank.filter(m => m.plan?.key === 'healthy');

  let html = '';
  if (view === 'technician') {
    html += `<h4 class="att-h">My jobs</h4>`;
    html += inService.length ? inService.map(m => card(m)).join('') : '<p class="att-empty">No jobs in progress.</p>';
    html += `<h4 class="att-h">Up next</h4>`;
    html += urgent.length ? urgent.map(m => card(m, { actions: true })).join('') : '<p class="att-empty">Nothing waiting for approval.</p>';
  } else if (view === 'manager') {
    html += urgent.length
      ? `<p class="att-summary"><b>${urgent.length}</b> machine${urgent.length > 1 ? 's' : ''} need${urgent.length > 1 ? '' : 's'} a decision. Your supervisor sees the details.</p>` + urgent.map(m => card(m, { actions: false, compact: true })).join('')
      : '<p class="att-allgood">✓ Nothing needs a decision right now.</p>';
  } else {
    html += urgent.length ? urgent.map(m => card(m)).join('') : '<p class="att-allgood">✓ Nothing needs you right now. The copilot is watching all 8 machines.</p>';
    if (inService.length) html += `<h4 class="att-h">In service</h4>` + inService.map(m => card(m, { actions: false })).join('');
  }
  if (snoozedList.length && view !== 'manager') {
    html += `<details class="att-group"><summary>Snoozed (${snoozedList.length})</summary>${snoozedList.map(m => card(m, { compact: true })).join('')}</details>`;
  }
  if (watch.length && view !== 'manager') {
    html += `<details class="att-group"><summary>Watching (${watch.length})</summary>${watch.map(m => card(m, { actions: false, compact: true })).join('')}</details>`;
  }
  html += `<p class="att-healthy">✓ ${healthy.length} machine${healthy.length === 1 ? '' : 's'} healthy</p>`;
  html += `<label class="att-quiet"><input type="checkbox" id="att-quiet" ${document.body.classList.contains('attention-mode') ? 'checked' : ''}> Highlight only problems in 3D</label>`;
  el.innerHTML = html;

  const count = urgent.length;
  $('ops-count').textContent = count;
  $('ops-count').dataset.level = urgent.some(m => m.plan.rank >= PLAN.now.rank) ? 'now' : count ? 'soon' : 'ok';
  const reopen = $('ops-reopen-count');
  if (reopen) reopen.textContent = count;
  $('ops-tab-attention-label').textContent = view === 'technician' ? 'My jobs' : 'Needs attention';
}

/* ---------------- render: shift plan ---------------- */

async function refreshForecast(force = false) {
  if (!force && forecast && Date.now() - forecastAt < 120000) return;
  try {
    const res = await fetch('/forecast?horizon_h=8&samples=2');
    if (!res.ok) return;
    forecast = await res.json();
    forecastAt = Date.now();
    renderPlan();
    renderImpact();
  } catch { /* backend offline */ }
}

function renderPlan() {
  const el = $('ops-pane-plan');
  if (!el) return;
  if (!forecast) { el.innerHTML = '<p class="att-empty">Simulating the next 8 hours…</p>'; return; }
  const speed = plant?.speed || 1;
  const t0 = forecastAt;
  const toWall = (s) => t0 + (s / speed) * 1000;
  const H = forecast.horizon_s;
  const cop = forecast.policies.copilot;
  const rtf = forecast.policies.run_to_failure;
  const services = cop.events.filter(e => e.type === 'service');
  const firstBreak = rtf.events.find(e => e.type === 'breakdown');
  const ids = Object.keys(cop.machines);

  // Mini Gantt: one lane per machine, planned services as blocks, changeovers as lines.
  const W = 300, rowH = 13, top = 16, Ht = top + ids.length * rowH + 4;
  let gantt = '';
  for (let h = 0; h <= 8; h += 2) {
    const x = (h / 8) * W;
    gantt += `<text x="${Math.min(W - 10, x + 2)}" y="10" class="g-axis">${fmtClock(toWall(h * 3600))}</text><line x1="${x}" y1="13" x2="${x}" y2="${Ht}" class="g-grid"/>`;
  }
  let c = nextChangeover(t0);
  while (c < toWall(H)) {
    const x = ((c - t0) / 1000 * speed / H) * W;
    gantt += `<line x1="${x}" y1="13" x2="${x}" y2="${Ht}" class="g-change"/><text x="${x + 2}" y="${Ht + 9}" class="g-axis g-change-t">changeover</text>`;
    c = nextChangeover(c);
  }
  ids.forEach((id, i) => {
    const y = top + i * rowH;
    gantt += `<text x="-4" y="${y + 9}" text-anchor="end" class="g-id">${id}</text><rect x="0" y="${y + 2}" width="${W}" height="${rowH - 4}" class="g-lane"/>`;
    services.filter(e => e.machine_id === id).forEach(e => {
      const x = (e.t / H) * W, w = Math.max(3, ((e.duration_s || 600) / H) * W);
      gantt += `<rect x="${x}" y="${y + 2}" width="${w}" height="${rowH - 4}" rx="2" class="g-svc"><title>${id} service at ${fmtClock(toWall(e.t))}</title></rect>`;
    });
  });

  const next = services.slice(0, 6).map(e => `<li><span class="pl-time">${fmtClock(toWall(e.t))}</span><b>${e.machine_id}</b><span>${Math.round((e.duration_s || 600) / 60)} min service</span></li>`).join('');
  el.innerHTML = `
    <p class="pl-sum">Next 8 hours <b>with the copilot</b>: ${cop.summary.planned_services} planned services, <b class="ok">${cop.summary.breakdowns} breakdowns</b>.</p>
    <p class="pl-sum muted">If nobody acts: <b class="bad">${rtf.summary.breakdowns} breakdowns</b>${firstBreak ? `, the first at ${fmtClock(toWall(firstBreak.t))} (${firstBreak.machine_id})` : ''}.</p>
    <svg class="pl-gantt" viewBox="-58 0 ${W + 62} ${Ht + 12}" role="img" aria-label="Planned services over the next 8 hours">${gantt}</svg>
    <ol class="pl-list">${next || '<li>No services needed in this window.</li>'}</ol>
    <button class="pl-open" id="pl-open">Open the forecast →</button>
    <p class="pl-note">Simulated from the live plant. Times assume the line keeps running at its current pace.</p>`;
  $('pl-open')?.addEventListener('click', () => { playClick(); deps.openForecast(); });
}

/* ---------------- render: log ---------------- */

function renderLog() {
  const el = $('ops-pane-log');
  if (!el) return;
  if (!logEntries.length) { el.innerHTML = '<p class="att-empty">Nothing logged yet.</p>'; return; }
  el.innerHTML = `<ol class="log-list">${[...logEntries].reverse().map(e => `
    <li data-kind="${e.kind}"><span class="log-time">${fmtClock(e.ts * 1000)}</span>
      <span class="log-icon">${LOG_ICON[e.kind] || '•'}</span>
      <span class="log-text">${esc(e.text)}<em>${esc(e.by)}</em></span></li>`).join('')}</ol>`;
}

/* ---------------- render: impact ---------------- */

function renderImpact() {
  const el = $('impact-card');
  if (!el) return;
  const imp = plant?.impact || { failures_prevented: 0, downtime_avoided_h: 0, unplanned_repair_multiplier: 3 };
  const parts = fleet.reduce((a, m) => a + (m.throughput_units || 0), 0);
  let teaser = '';
  if (forecast) {
    const r = forecast.policies.run_to_failure.summary, c = forecast.policies.copilot.summary;
    const pct = r.parts ? Math.round(100 * (c.parts - r.parts) / r.parts) : 0;
    teaser = `<button class="imp-teaser" id="imp-teaser"><span>Next 8 h</span> copilot avoids <b>${r.breakdowns - c.breakdowns}</b> breakdowns · <b>${pct >= 0 ? '+' : ''}${pct}%</b> parts →</button>`;
  }
  el.innerHTML = `
    <div class="imp-head"><span>THIS SHIFT</span><span class="imp-note" title="A prevented failure is a service done while the machine was in warning or worse. Downtime avoided assumes a breakdown takes ${imp.unplanned_repair_multiplier}× as long to fix as a planned service.">how is this counted?</span></div>
    <div class="imp-grid">
      <div><b>${imp.failures_prevented}</b><span>failures prevented</span></div>
      <div><b>${imp.downtime_avoided_h.toFixed(1)} h</b><span>downtime avoided</span></div>
      <div><b>${parts.toLocaleString('en-US')}</b><span>parts made</span></div>
    </div>${teaser}`;
  $('imp-teaser')?.addEventListener('click', () => { playClick(); deps.openForecast(); });
}

/* ---------------- main render ---------------- */

function render() {
  renderAttention();
  if (pane === 'plan') renderPlan();
  if (pane === 'log') renderLog();
  renderImpact();
}

/** Called with every live snapshot (not while scrubbing the forecast). */
export function updateOps(machines, plantInfo, log) {
  fleet = machines || [];
  if (plantInfo) plant = plantInfo;
  if (Array.isArray(log)) logEntries = log;
  checkEscalations();
  render();
  refreshForecast();
}

function setPane(p) {
  pane = p;
  document.querySelectorAll('.ops-tab').forEach(t => t.classList.toggle('active', t.dataset.pane === p));
  document.querySelectorAll('.ops-pane').forEach(el => el.classList.toggle('active', el.id === `ops-pane-${p}`));
  if (p === 'plan') { renderPlan(); refreshForecast(); }
  if (p === 'log') renderLog();
}

function setView(v) {
  view = v;
  document.body.dataset.view = v;
  save('titan_view', v);
  document.querySelectorAll('.ops-view-seg button').forEach(b => {
    const on = b.dataset.view === v;
    b.classList.toggle('active', on);
    b.setAttribute('aria-checked', String(on));
  });
  setPane(v === 'manager' ? 'plan' : 'attention');
  render();
}

function setCollapsed(on) {
  document.body.classList.toggle('ops-collapsed', on);
  $('ops-reopen').hidden = !on;
  save('titan_ops_collapsed', on);
}

export function showAttention() {
  setCollapsed(false);
  setPane('attention');
}

export function initOps(d) {
  deps = d;
  snoozed = load('titan_snoozed', {});
  document.querySelectorAll('.ops-tab').forEach(t => t.addEventListener('click', () => { playClick(); setPane(t.dataset.pane); }));
  document.querySelectorAll('.ops-view-seg button').forEach(b => b.addEventListener('click', () => { playClick(); setView(b.dataset.view); }));
  $('ops-collapse')?.addEventListener('click', () => { playClick(); setCollapsed(true); });
  $('ops-reopen')?.addEventListener('click', () => { playClick(); setCollapsed(false); });
  $('kpi-attention-btn')?.addEventListener('click', () => { playClick(); showAttention(); });

  $('ops-panel')?.addEventListener('click', (e) => {
    const quiet = e.target.closest('#att-quiet');
    if (quiet) {
      document.body.classList.toggle('attention-mode', quiet.checked);
      setAttentionMode(quiet.checked);
      return;
    }
    const btn = e.target.closest('[data-act]');
    const cardEl = e.target.closest('.att-card');
    if (btn) {
      e.stopPropagation();
      playClick();
      const id = btn.dataset.id;
      if (btn.dataset.act === 'approve') approve(id);
      else if (btn.dataset.act === 'snooze') snooze(id);
      else { fresh.delete(id); deps.selectMachine(id); }
    } else if (cardEl) {
      playClick();
      fresh.delete(cardEl.dataset.id);
      deps.selectMachine(cardEl.dataset.id);
    }
  });

  $('btn-approve')?.addEventListener('click', () => { const id = d.getSelected(); if (id) approve(id); });
  $('btn-snooze')?.addEventListener('click', () => { const id = d.getSelected(); if (id) snooze(id); });

  const narrow = window.matchMedia('(max-width: 900px)').matches;
  setCollapsed(load('titan_ops_collapsed', narrow));
  setView(load('titan_view', 'supervisor'));
}
