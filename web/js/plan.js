/**
 * Plain-language machine status
 * =============================
 * One status ladder for the whole UI, so nobody has to reconcile wear %,
 * ISO zones and remaining-life cycles in their head:
 *
 *   Healthy → Watch → Service soon → Service now → Down      (+ In service)
 *
 * Each status carries a deadline in clock time ("service by 15:40"),
 * derived from the model's remaining-life prediction, the scheduler's 15%
 * safety margin, and the machine's current cycle time. Engineering detail
 * (cycles, zones, wear) stays in the drawer's detail tabs.
 */

import { RUL_PLATEAU } from './standards.js';

export const SAFETY_FACTOR = 0.85;      // same as agents/scheduler_agent.py
export const SERVICE_NOW_CYCLES = 30;   // same as agents/scheduler_agent.py
export const SERVICE_SOON_CYCLES = 60;

export const PLAN = {
  down:    { key: 'down',    label: 'Down',         rank: 5, color: 'var(--color-rose)',    hex: 0xdc2626 },
  now:     { key: 'now',     label: 'Service now',  rank: 4, color: 'var(--color-rose)',    hex: 0xef4444 },
  soon:    { key: 'soon',    label: 'Service soon', rank: 3, color: 'var(--color-amber)',   hex: 0xf59e0b },
  watch:   { key: 'watch',   label: 'Watch',        rank: 2, color: 'var(--plan-watch)',    hex: 0xeab308 },
  service: { key: 'service', label: 'In service',   rank: 1, color: 'var(--color-cyan)',    hex: 0x0284c7 },
  healthy: { key: 'healthy', label: 'Healthy',      rank: 0, color: 'var(--color-emerald)', hex: 0x059669 },
};

/** What usually wears out, per machine type (mirrors the diagnosis agent's SOP mapping). */
export const LIKELY_CAUSE = {
  // IDs and steps match the procedure documents in rag/documents/.
  CNC_MILL: { part: 'spindle bearing', fix: 'Service the spindle bearings', sop: 'SOP-CNC-014',
    steps: ['Finish the current part, park the spindle, lock out', 'Check spindle runout with a dial indicator (limit 0.003 mm)',
      'Inspect and re-grease bearings; replace the set if out of limit', 'Warm-up cycle: confirm vibration back in zone A'] },
  HYDRAULIC_PRESS: { part: 'ram seals', fix: 'Replace ram seals and check the fluid', sop: 'SOP-PRESS-022',
    steps: ['Retract the ram, block the platen, bleed pressure', 'Replace ram seals and wipers; inspect the rod',
      'Check fluid level and temperature; change the filter if needed', 'Cycle under load: pressure holds, vibration in zone A'] },
  FURNACE: { part: 'heating elements', fix: 'Service elements and thermocouples', sop: 'SOP-FRN-003',
    steps: ['Let the batch finish; cool under vacuum; lock out', 'Inspect elements; measure their resistance',
      'Check thermocouples against a reference probe', 'Run a uniformity survey before release'] },
  ROBOT_ARM: { part: 'joint gearbox', fix: 'Re-grease joints and check backlash', sop: 'SOP-ROB-005',
    steps: ['Move to the service pose; lock out the cell', 'Purge and re-grease each joint gearbox',
      'Measure backlash on axes 1-3', 'Recalibrate; confirm repeatability'] },
  CONVEYOR: { part: 'drive belt and rollers', fix: 'Re-tension the belt, replace worn rollers', sop: 'SOP-CONV-007',
    steps: ['Stop at a part gap; lock out the drive', 'Re-tension the belt; replace it if cracked',
      'Spin each roller; replace any that grind', 'Run empty, then loaded; check tracking'] },
  METROLOGY: { part: 'scan head optics', fix: 'Clean the optics and recalibrate', sop: 'SOP-QC-002',
    steps: ['Park the stage; cap the laser; lock out', 'Clean the scan head window and mirrors',
      'Check stage bearings; lubricate guides', 'Measure the reference artefact; re-check recent parts'] },
};

/**
 * @param m    machine payload from /fleet or the telemetry stream
 * @param ctx  { speed, wallNow, mae }  plant speed, wall clock (ms), model error (cycles)
 */
export function planStatus(m, ctx = {}) {
  const speed = ctx.speed || 1;
  const wallNow = ctx.wallNow || Date.now();
  const mae = ctx.mae || null;
  const status = (m.status || 'healthy').toLowerCase();
  const wear = m.wear_level || 0;
  const cycleTime = (m.nominal_cycle_time_s || 10) * (1 + 0.4 * wear);
  const rul = m.predicted_rul_cycles != null ? m.predicted_rul_cycles : null;
  const trending = rul != null && rul < RUL_PLATEAU;
  const safe = trending ? Math.max(0, rul * SAFETY_FACTOR) : null;

  let p;
  if (status === 'failed') p = PLAN.down;
  else if (status === 'in_maintenance') p = PLAN.service;
  else if (status === 'critical' || (safe != null && safe < SERVICE_NOW_CYCLES)) p = PLAN.now;
  else if (status === 'warning' || (safe != null && safe < SERVICE_SOON_CYCLES)) p = PLAN.soon;
  else if (status === 'degrading' || trending) p = PLAN.watch;
  else p = PLAN.healthy;

  const toWall = (plantSeconds) => wallNow + (plantSeconds / speed) * 1000;
  const out = { ...p, cycleTime, rul, safe, trending, mae };

  if (p.key === 'service' && m.service_ends_s != null && m.sim_time_s != null) {
    const left = Math.max(0, m.service_ends_s - m.sim_time_s);
    out.untilSeconds = left;
    out.untilWall = toWall(left);
  }
  if (safe != null && (p.key === 'now' || p.key === 'soon' || p.key === 'watch')) {
    const s = safe * cycleTime;
    out.deadlineSeconds = s;
    out.deadlineWall = toWall(s);
    if (mae != null) {
      out.failLow = toWall(Math.max(0, rul - mae) * cycleTime);
      out.failHigh = toWall((rul + mae) * cycleTime);
    }
  }
  out.cause = LIKELY_CAUSE[m.machine_type] || { part: 'wear parts', fix: 'Inspect and service', sop: 'General procedure', steps: [] };
  return out;
}

/* ---------------- formatting ---------------- */

export function fmtClock(ms) {
  return new Date(ms).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function fmtDay(ms) {
  const d = new Date(ms);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return '';
  return d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ';
}

export function fmtIn(seconds) {
  const s = Math.max(0, seconds);
  if (s < 60) return 'under a minute';
  if (s < 3600) return `${Math.round(s / 60)} min`;
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function shiftName(ms) {
  const h = new Date(ms).getHours();
  if (h >= 6 && h < 14) return '1st shift';
  if (h >= 14 && h < 22) return '2nd shift';
  return '3rd shift';
}

/** Next shift changeover (06:00, 14:00, 22:00) after `ms`. */
export function nextChangeover(ms) {
  const d = new Date(ms);
  for (const h of [6, 14, 22, 30]) {
    const c = new Date(d);
    c.setHours(h % 24, 0, 0, 0);
    if (h >= 24) c.setDate(c.getDate() + 1);
    if (c.getTime() > ms + 60000) return c.getTime();
  }
  return ms + 8 * 3600 * 1000;
}

/** Short badge / list text: "Service by 15:40" etc. */
export function planShort(p) {
  if (p.key === 'down') return 'Down';
  if (p.key === 'service') return p.untilWall ? `In service · back ${fmtClock(p.untilWall)}` : 'In service';
  if ((p.key === 'now' || p.key === 'soon') && p.deadlineWall) return `${p.label} · by ${fmtDay(p.deadlineWall)}${fmtClock(p.deadlineWall)}`;
  return p.label;
}
