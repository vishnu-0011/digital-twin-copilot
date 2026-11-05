/**
 * Tour Diagrams — animated, narration-synced SVG explainers
 * ==========================================================
 * Every diagram is plain inline SVG styled by guide.css tokens, so it follows
 * the light / dark theme automatically. Parts carry `class="cue" data-c="N"`
 * and light up when the narrator reaches the matching {N} marker in the
 * script. Diagrams can also react to cues in code (e.g. the ISO gauge needle).
 *
 * The numbers drawn here come from the codebase itself:
 *   simulator.py (signal formulas), anomaly_detector.py (200 trees, healthy envelope),
 *   tcn_model.py (dilations 1-2-4-8, kernel 3, Chomp1d), scheduler_agent.py
 *   (0.85 safety factor, RUL < 30 escalation), knowledge_base.py (filter →
 *   TF-IDF → cosine), api/main.py (2 Hz WebSocket push), app.js (1.8 s HTTP
 *   fallback, 3 s reconnect, 15 s heartbeat), scene.js (machine coordinates).
 */

let uidCounter = 0;

/* ---------- tiny SVG helpers ---------- */
import { ISO_ZONE_LIMITS, ISO_GAUGE_MAX } from '../standards.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(text, maxChars) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  words.forEach(w => {
    if ((line + ' ' + w).trim().length > maxChars && line) { lines.push(line); line = w; }
    else line = (line + ' ' + w).trim();
  });
  if (line) lines.push(line);
  return lines;
}

function textBlock(x, y, text, { cls = 'dg-s', max = 24, lh = 12, anchor = 'middle' } = {}) {
  return wrap(text, max).map((l, i) =>
    `<text class="${cls}" x="${x}" y="${y + i * lh}" text-anchor="${anchor}">${esc(l)}</text>`).join('');
}

function node(x, y, w, h, title, sub, { c = 0, tone = '', sub2 = '' } = {}) {
  const cx = x + w / 2;
  return `<g class="cue dg-node ${tone}" data-c="${c}">
    <rect class="dg-box" x="${x}" y="${y}" width="${w}" height="${h}" rx="9"/>
    <text class="dg-t" x="${cx}" y="${y + (sub ? h / 2 - 2 : h / 2 + 4)}" text-anchor="middle">${esc(title)}</text>
    ${sub ? `<text class="dg-s" x="${cx}" y="${y + h / 2 + 12}" text-anchor="middle">${esc(sub)}</text>` : ''}
    ${sub2 ? `<text class="dg-s" x="${cx}" y="${y + h / 2 + 23}" text-anchor="middle">${esc(sub2)}</text>` : ''}
  </g>`;
}

function edge(d, { c = 0, tone = '', flow = true, arrow = true, id = '' } = {}) {
  return `<path ${id ? `id="${id}"` : ''} class="cue dg-edge ${flow ? 'dg-flow' : ''} ${tone}" data-c="${c}" d="${d}" ${arrow ? 'marker-end="url(#ARROW)"' : ''}/>`;
}

function packets(pathId, { n = 3, dur = 3, tone = '', r = 3.6, c = 0 } = {}) {
  let out = `<g class="cue" data-c="${c}">`;
  for (let i = 0; i < n; i++) {
    out += `<circle class="dg-pkt ${tone}" r="${r}"><animateMotion dur="${dur}s" begin="${-(dur / n) * i}s" repeatCount="indefinite" rotate="auto"><mpath xlink:href="#${pathId}"/></animateMotion></circle>`;
  }
  return out + '</g>';
}

function defs() {
  return `<defs>
    <marker id="ARROW" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path class="dg-arrowhead" d="M0,1 L9,5 L0,9 z"/>
    </marker>
    <pattern id="HATCH" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="6" class="dg-hatch"/>
    </pattern>
  </defs>`;
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" role="img">${defs()}${body}</svg>`;
}

/* Deterministic pseudo-random (so diagrams look identical every run) */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function gauss(r) { return Math.sqrt(-2 * Math.log(r() || 1e-6)) * Math.cos(2 * Math.PI * r()); }

/* ============================================================
   DIAGRAM DEFINITIONS
   ============================================================ */
const DIAGRAMS = {};

/* 1 · The problem ------------------------------------------------------ */
DIAGRAMS.problem = {
  title: 'Why this exists',
  caption: 'What one surprise failure costs an aerospace machine shop',
  build() {
    const card = (x, c, tone, big, line, glyph) => `
      <g class="cue ${tone}" data-c="${c}">
        <rect class="dg-box dg-card" x="${x}" y="18" width="118" height="150" rx="12"/>
        <text class="dg-glyph" x="${x + 59}" y="56" text-anchor="middle">${glyph}</text>
        <text class="dg-big" x="${x + 59}" y="96" text-anchor="middle">${big}</text>
        ${textBlock(x + 59, 118, line, { max: 18 })}
      </g>`;
    return svg(400, 250, `
      ${card(8, 1, 'tone-rose', 'Stops', 'one broken machine idles the line behind it', '⏱')}
      ${card(141, 2, 'tone-amber', 'Scrap', 'a snapped tool can ruin a costly titanium part', '💥')}
      ${card(274, 3, 'tone-purple', 'Noise', 'cryptic alarms, so operators hit mute', '🔕')}
      <g class="cue tone-emerald" data-c="4">
        <rect class="dg-box dg-goal" x="8" y="186" width="384" height="52" rx="12"/>
        <text class="dg-t" x="200" y="207" text-anchor="middle">Goal: warn 30–50 cycles early</text>
        <text class="dg-s" x="200" y="224" text-anchor="middle">…and tell the operator exactly what to do about it</text>
      </g>`);
  }
};

/* 2 · Digital twin loop ------------------------------------------------ */
DIAGRAMS.twin = {
  title: 'What is a digital twin?',
  caption: 'A living software copy that mirrors the plant and talks back',
  build(u) {
    return svg(400, 250, `
      <g class="cue" data-c="1">
        <rect class="dg-box" x="10" y="30" width="135" height="170" rx="12"/>
        <text class="dg-t" x="77" y="52" text-anchor="middle">PHYSICAL PLANT</text>
        <g class="dg-icon" transform="translate(77,105)">
          <circle r="26" class="dg-ring"/><circle r="8" class="dg-fillc"/>
          ${[0, 60, 120, 180, 240, 300].map(a => `<rect x="-4" y="-34" width="8" height="10" rx="2" class="dg-fillc" transform="rotate(${a})"/>`).join('')}
          <animateTransform attributeName="transform" type="rotate" from="0 77 105" to="360 77 105" dur="8s" repeatCount="indefinite" additive="sum"/>
        </g>
        ${textBlock(77, 160, 'spindles · presses · furnace · robots', { max: 20 })}
      </g>
      <g class="cue tone-cyan" data-c="3">
        <rect class="dg-box" x="255" y="30" width="135" height="170" rx="12"/>
        <text class="dg-t" x="322" y="52" text-anchor="middle">DIGITAL TWIN</text>
        <g transform="translate(322,105)" class="dg-wire">
          <path d="M0,-28 L26,-14 L26,14 L0,28 L-26,14 L-26,-14 Z"/>
          <path d="M0,-28 L0,0 M0,0 L26,14 M0,0 L-26,14"/>
        </g>
        ${textBlock(322, 160, '3D replica · wear forecast · agent decisions', { max: 20 })}
      </g>
      ${edge('M150,85 C200,70 205,70 250,85', { c: 2, id: `${u}-up`, tone: 'tone-cyan' })}
      ${packets(`${u}-up`, { c: 2, dur: 2.4, tone: 'tone-cyan' })}
      <text class="dg-s cue" data-c="2" x="200" y="62" text-anchor="middle">telemetry →</text>
      ${edge('M250,150 C205,165 200,165 150,150', { c: 4, id: `${u}-down`, tone: 'tone-emerald' })}
      ${packets(`${u}-down`, { c: 4, dur: 2.4, tone: 'tone-emerald' })}
      <text class="dg-s cue" data-c="4" x="200" y="182" text-anchor="middle">← work orders</text>
      <g class="cue tone-amber" data-c="5">
        <rect class="dg-callout" x="6" y="206" width="388" height="38" rx="10"/>
        <text class="dg-t" x="200" y="222" text-anchor="middle">Here, a SimPy physics simulator plays the plant</text>
        <text class="dg-s" x="200" y="236" text-anchor="middle">same data schema as real sensors → swap it for the real factory later</text>
      </g>`);
  }
};

/* 3 · Floor plan (real scene.js coordinates) --------------------------- */
const X = x => 200 + x * 7.15;
const Y = z => 150 + z * 7.0;
const FLOOR_MACHINES = [
  ['CNC-01', -16, -10, 'bay1'], ['CNC-02', -6, -10, 'bay1'],
  ['PRESS-01', 7, -11, 'bay2'], ['PRESS-02', 19, -11, 'bay2'], ['FURN-01', 13, -2, 'bay2'],
  ['ROBOT-01', -16, 8, 'bay3'], ['LASER-01', -6, 8, 'bay3'],
  ['CONV-01', 13, 8, 'bay4'],
];
const BAYS = [
  ['bay1', 'BAY 1 · MACHINING', -23, -17, -1, -4],
  ['bay2', 'BAY 2 · FORGING & HEAT', 1, -17, 23, 1],
  ['bay3', 'BAY 3 · ROBOTICS & QC', -23, 3, -1, 17],
  ['bay4', 'BAY 4 · ASSEMBLY', 1, 3, 23, 17],
];
DIAGRAMS.floorplan = {
  title: 'Floor plan · top-down',
  caption: 'Same coordinates as the 3D scene — 4 bays, 8 workcells, 2 AMRs',
  build(u) {
    const bays = BAYS.map(([id, label, x1, z1, x2, z2]) => `
      <g class="fp-bay" data-bay="${id}">
        <rect class="dg-bay" x="${X(x1)}" y="${Y(z1)}" width="${X(x2) - X(x1)}" height="${Y(z2) - Y(z1)}" rx="6"/>
        <text class="dg-s fp-baylabel" x="${X(x1) + 6}" y="${Y(z1) + 12}">${label}</text>
      </g>`).join('');
    const mach = FLOOR_MACHINES.map(([id, x, z, bay]) => `
      <g class="fp-m" data-bay="${bay}" data-id="${id}">
        <circle class="fp-halo" cx="${X(x)}" cy="${Y(z)}" r="13"/>
        <rect class="fp-dot" x="${X(x) - 7}" y="${Y(z) - 7}" width="14" height="14" rx="3"/>
        <text class="dg-s fp-label" x="${X(x)}" y="${Y(z) + 21}" text-anchor="middle">${id}</text>
      </g>`).join('');
    const loop1 = `M${X(-22)},${Y(-16)} H${X(22)} V${Y(16)} H${X(-22)} Z`;
    const loop2 = `M${X(0)},${Y(-12)} V${Y(12)} H${X(-10)} V${Y(-12)} Z`;
    return svg(400, 300, `
      <rect class="dg-building" x="${X(-24.5)}" y="${Y(-18.5)}" width="${X(24.5) - X(-24.5)}" height="${Y(18.5) - Y(-18.5)}" rx="8"/>
      ${bays}
      <g class="fp-amr">
        <path id="${u}-l1" class="dg-amrloop" d="${loop1}"/>
        <path id="${u}-l2" class="dg-amrloop" d="${loop2}"/>
        <circle class="fp-agv" r="5"><animateMotion dur="26s" repeatCount="indefinite"><mpath xlink:href="#${u}-l1"/></animateMotion></circle>
        <circle class="fp-agv" r="5"><animateMotion dur="14s" repeatCount="indefinite"><mpath xlink:href="#${u}-l2"/></animateMotion></circle>
        <text class="dg-s fp-amrlabel" x="${X(22) - 4}" y="${Y(16) - 5}" text-anchor="end">AGV-01 outer loop</text>
        <text class="dg-s fp-amrlabel" x="${X(-5)}" y="${Y(0)}" text-anchor="middle">AGV-02</text>
      </g>
      ${mach}
      <text class="dg-s" x="${X(0)}" y="${Y(18.5) + 12}" text-anchor="middle">▲ main entrance</text>`);
  },
  update(root, opts = {}) {
    const f = opts.focus || 'all';
    root.querySelectorAll('.fp-bay, .fp-m').forEach(el => {
      const on = f === 'all' || el.dataset.bay === f;
      el.classList.toggle('dim', !on && f !== 'amr');
      el.classList.toggle('hot', f !== 'all' && f !== 'amr' && el.dataset.bay === f);
    });
    root.querySelectorAll('.fp-m').forEach(el => el.classList.toggle('target', el.dataset.id === opts.machine));
    const amr = root.querySelector('.fp-amr');
    if (amr) amr.classList.toggle('hot', f === 'amr');
    if (f === 'amr') root.querySelectorAll('.fp-bay, .fp-m').forEach(el => el.classList.add('dim'));
  }
};

/* 4 · End-to-end data flow -------------------------------------------- */
DIAGRAMS.dataflow = {
  title: 'How data flows',
  caption: 'From spinning spindle to pixels on your screen',
  build(u) {
    const W = 86, H = 50;
    const r1 = [[8, 'Physics twin', 'SimPy, 8 units', 1], [106, 'Sensors', 'vib, temp, cycles', 2], [204, 'Features', 'Δ, rolling μ σ', 3], [302, 'ML models', 'iForest + TCN', 4]];
    const r2 = [[302, 'Agents', 'LangGraph', 5], [204, 'FastAPI', 'REST + WS', 6], [106, 'Live push', '2 Hz snapshot', 6], [8, 'Browser', 'Three.js twin', 7]];
    let body = '';
    body += `<path id="${u}-p" class="dg-rail" d="M51,55 H345 V175 H51"/>`;
    r1.forEach(([x, t, s, c]) => { body += node(x, 30, W, H, t, s, { c }); });
    r2.forEach(([x, t, s, c]) => { body += node(x, 150, W, H, t, s, { c }); });
    // connectors
    [[94, 106, 2], [192, 204, 3], [290, 302, 4]].forEach(([a, b, c]) => { body += edge(`M${a},55 H${b - 2}`, { c }); });
    body += edge('M345,80 V148', { c: 5 });
    [[302, 290, 6], [204, 192, 6], [106, 94, 7]].forEach(([a, b, c]) => { body += edge(`M${a},175 H${b + 2}`, { c }); });
    body += packets(`${u}-p`, { n: 4, dur: 6, c: 1 });
    body += `<g class="cue tone-rose" data-c="2">
      <rect class="dg-chip" x="98" y="92" width="102" height="22" rx="11"/>
      <text class="dg-s dg-strong" x="149" y="107" text-anchor="middle">wear_level ✕ hidden</text></g>`;
    body += `<g class="cue" data-c="7">
      <text class="dg-s" x="200" y="232" text-anchor="middle">No wear sensor exists in a real spindle, so the models never see wear.</text>
      <text class="dg-s" x="200" y="246" text-anchor="middle">They learn it only from what a real sensor can measure.</text></g>`;
    return svg(400, 255, body);
  }
};

/* 5 · Sensor physics curves ------------------------------------------- */
DIAGRAMS.signals = {
  title: 'What the sensors feel',
  caption: 'Signal formulas straight from digital_twin/simulator.py',
  build() {
    const px = w => 50 + w * 330, py = n => 200 - n * 160;
    const curve = f => Array.from({ length: 41 }, (_, i) => { const w = i / 40; return `${i ? 'L' : 'M'}${px(w).toFixed(1)},${py(f(w)).toFixed(1)}`; }).join(' ');
    const r = rng(7);
    const noisy = Array.from({ length: 60 }, (_, i) => { const w = i / 59; const n = Math.pow(w, 1.8) + gauss(r) * 0.025; return `<circle class="dg-sample" cx="${px(w).toFixed(1)}" cy="${py(Math.max(0, n)).toFixed(1)}" r="1.6"/>`; }).join('');
    return svg(400, 262, `
      <line class="dg-axis" x1="50" y1="200" x2="385" y2="200"/><line class="dg-axis" x1="50" y1="200" x2="50" y2="28"/>
      <text class="dg-s" x="215" y="218" text-anchor="middle">tool wear 0 → 1 (hidden from the models)</text>
      <text class="dg-s" x="40" y="114" text-anchor="middle" transform="rotate(-90 40 114)">signal (normalised)</text>
      <g class="cue tone-rose" data-c="3"><rect class="dg-zone" x="${px(0.6)}" y="28" width="${px(1) - px(0.6)}" height="172"/>
        <text class="dg-s dg-strong" x="${px(0.8)}" y="42" text-anchor="middle">degradation knee</text></g>
      <g class="cue" data-c="3"><text class="dg-s" x="${px(0.28)}" y="186" text-anchor="middle">healthy plateau</text></g>
      <g class="cue tone-cyan" data-c="1">${noisy}<path class="dg-curve draw" d="${curve(w => Math.pow(w, 1.8))}"/></g>
      <g class="cue tone-amber" data-c="2"><path class="dg-curve draw" d="${curve(w => Math.pow(w, 1.5))}"/></g>
      <g class="cue tone-cyan" data-c="1"><circle cx="62" cy="236" r="4" class="dg-fillc"/><text class="dg-s dg-mono" x="72" y="240">vibration = 0.5 + 4·wear^1.8 + noise</text></g>
      <g class="cue tone-amber" data-c="2"><circle cx="62" cy="252" r="4" class="dg-fillc"/><text class="dg-s dg-mono" x="72" y="256">temperature = 38 + 35·wear^1.5 + noise</text></g>`);
  }
};

/* 6 · ISO 10816 severity gauge ---------------------------------------- */
// Zone limits come from the shared standards module (same numbers as the
// drawer and the diagnosis agent).
const ISO_STEPS = [
  [0.6, 'A', 'good'], [0.6, 'A', 'good'], [0.6, 'A', 'good'],
  [2.1, 'B', 'acceptable'], [3.45, 'C', 'plan corrective action'],
];
DIAGRAMS.iso = {
  title: 'ISO 10816-3 vibration severity',
  caption: 'Group 2 machines (15–300 kW), rigid foundation · velocity RMS',
  build() {
    const cx = 200, cy = 190, R = 140;
    const f = v => Math.min(1, v / ISO_GAUGE_MAX);
    const pt = (v, r = R) => { const a = Math.PI * (1 - f(v)); return [cx + Math.cos(a) * r, cy - Math.sin(a) * r]; };
    const arc = (v1, v2, tone, label, sub) => {
      const [x1, y1] = pt(v1), [x2, y2] = pt(v2), [lx, ly] = pt((v1 + v2) / 2, R - 34);
      return `<g class="${tone}"><path class="dg-gauge" d="M${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2}"/>
        <text class="dg-t" x="${lx}" y="${ly}" text-anchor="middle">${label}</text>
        <text class="dg-s" x="${lx}" y="${ly + 12}" text-anchor="middle">${sub}</text></g>`;
    };
    const [ab, bc, cd] = ISO_ZONE_LIMITS;
    const ticks = ISO_ZONE_LIMITS.map(v => { const [x, y] = pt(v, R + 16); return `<text class="dg-s dg-mono" x="${x}" y="${y}" text-anchor="middle">${v.toFixed(1)}</text>`; }).join('');
    return svg(400, 250, `
      ${arc(0, ab, 'tone-emerald', 'A', 'good')}
      ${arc(ab, bc, 'tone-cyan', 'B', 'acceptable')}
      ${arc(bc, cd, 'tone-amber', 'C', 'plan repair')}
      ${arc(cd, ISO_GAUGE_MAX, 'tone-rose', 'D', 'damage')}
      ${ticks}
      <g class="iso-needle" style="transform-origin:${cx}px ${cy}px; transform: rotate(${-(1 - f(0.6)) * 180}deg)">
        <line class="dg-needle" x1="${cx}" y1="${cy}" x2="${cx + R - 22}" y2="${cy}"/>
      </g>
      <circle class="dg-hub" cx="${cx}" cy="${cy}" r="9"/>
      <text class="dg-big iso-val" x="${cx}" y="${cy + 38}" text-anchor="middle">0.60 mm/s</text>
      <text class="dg-s iso-zone" x="${cx}" y="${cy + 54}" text-anchor="middle">CNC-01 · Zone A · good</text>`);
  },
  onCue(root, n) {
    const [v, zone, label] = ISO_STEPS[Math.min(n, ISO_STEPS.length - 1)];
    const needle = root.querySelector('.iso-needle');
    if (needle) needle.style.transform = `rotate(${-(1 - Math.min(1, v / ISO_GAUGE_MAX)) * 180}deg)`;
    const val = root.querySelector('.iso-val');
    const zoneEl = root.querySelector('.iso-zone');
    if (val) val.textContent = `${v.toFixed(2)} mm/s`;
    if (zoneEl) zoneEl.textContent = `CNC-01 · Zone ${zone} · ${label}`;
    root.classList.toggle('iso-danger', zone === 'C' || zone === 'D');
  }
};

/* 7 · Isolation Forest ------------------------------------------------ */
DIAGRAMS.iforest = {
  title: 'How we find the odd one out',
  caption: 'Isolation Forest · 200 random trees · trained on healthy readings',
  build() {
    const r = rng(42);
    let pts = '';
    for (let i = 0; i < 46; i++) {
      const x = 105 + gauss(r) * 26, y = 160 + gauss(r) * 22;
      pts += `<circle class="if-pt ${i === 5 ? 'if-normal' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 5 ? 4.5 : 3.2}"/>`;
    }
    const cut = (x1, y1, x2, y2, d, n) => `<line class="if-cut" style="animation-delay:${d}s" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="dg-s if-cutn" style="animation-delay:${d}s" x="${(x1 + x2) / 2 + 4}" y="${Math.min(y1, y2) + 12}">${n}</text>`;
    return svg(400, 260, `
      <rect class="dg-plot" x="10" y="16" width="240" height="228" rx="8"/>
      <text class="dg-s" x="130" y="256" text-anchor="middle">vibration →</text>
      <text class="dg-s" x="4" y="130" text-anchor="middle" transform="rotate(-90 4 130)">temperature →</text>
      <g class="cue" data-c="1">${pts}<circle class="if-out" cx="214" cy="52" r="6"/>
        <text class="dg-s dg-strong tone-rose" x="214" y="38" text-anchor="middle">CNC-01</text></g>
      <g class="cue if-cuts tone-rose" data-c="2">
        ${cut(180, 16, 180, 244, 0, '1')}
        ${cut(180, 92, 250, 92, 0.7, '2')}
        ${cut(236, 16, 236, 92, 1.4, '3')}
      </g>
      <g class="cue tone-rose" data-c="3"><rect class="dg-zone" x="180" y="16" width="56" height="76"/></g>
      <g class="cue" data-c="4">
        <text class="dg-t" x="262" y="40">Cuts needed to isolate</text>
        <g class="tone-rose"><rect class="dg-bar" x="262" y="56" width="${3 * 13}" height="16" rx="4"/>
          <text class="dg-s" x="${268 + 39}" y="68">3 · anomaly</text></g>
        <g class="tone-emerald"><rect class="dg-bar" x="262" y="84" width="${9 * 13}" height="16" rx="4"/>
          <text class="dg-s dg-onbar" x="268" y="96">~9 · normal</text></g>
        ${textBlock(262, 128, 'Short path through the random trees means a high anomaly score.', { max: 22, anchor: 'start' })}
        ${textBlock(262, 186, 'No labels needed: it learns "normal" from history alone.', { max: 22, anchor: 'start' })}
      </g>`);
  }
};

/* 8 · LangGraph agents ------------------------------------------------ */
DIAGRAMS.agents = {
  title: 'The copilot’s agent graph',
  caption: 'agents/orchestrator.py: a LangGraph StateGraph',
  build(u) {
    return svg(400, 250, `
      <path id="${u}-tok" class="dg-rail" d="M75,53 H325 V153 H75 V212"/>
      ${node(20, 30, 110, 46, 'Monitor', 'iForest + TCN', { c: 1 })}
      <g class="cue" data-c="2"><path class="dg-box" d="M200,28 L228,53 L200,78 L172,53 Z"/>
        <text class="dg-s dg-strong" x="200" y="57" text-anchor="middle">flagged?</text></g>
      ${node(270, 30, 110, 46, 'Diagnosis', 'RAG SOPs + ISO 10816', { c: 3 })}
      ${node(270, 130, 110, 46, 'Scheduler', 'urgency → action', { c: 4 })}
      ${node(20, 130, 110, 46, 'Report', 'decision trace', { c: 5 })}
      ${edge('M130,53 H170', { c: 2 })}${edge('M228,53 H268', { c: 3 })}
      <text class="dg-s cue" data-c="3" x="248" y="46" text-anchor="middle">yes</text>
      ${edge('M325,76 V128', { c: 4 })}
      ${edge('M270,153 H132', { c: 5 })}
      ${edge('M200,78 V150', { c: 6, tone: 'tone-dim', flow: false, arrow: false })}
      <text class="dg-s cue" data-c="6" x="207" y="118">no → straight to report</text>
      ${edge('M75,176 V206', { c: 5 })}
      <g class="cue tone-emerald" data-c="5"><rect class="dg-chip" x="22" y="208" width="106" height="24" rx="12"/>
        <text class="dg-s dg-strong" x="75" y="224" text-anchor="middle">END → UI trace</text></g>
      ${packets(`${u}-tok`, { n: 1, dur: 5, r: 6, tone: 'tone-amber', c: 1 })}`);
  }
};

/* 9 · Temporal Convolutional Network ---------------------------------- */
DIAGRAMS.tcn = {
  title: 'Predicting Remaining Useful Life',
  caption: 'Dilated causal TCN · kernel 3 · dilation 1 → 2 → 4 → 8',
  build() {
    const N = 16, x = t => 40 + t * 20;
    const rows = [['input', 240], ['d = 1', 195], ['d = 2', 150], ['d = 4', 105], ['d = 8', 60]];
    const dil = [0, 1, 2, 4, 8];
    // dependency tree of the newest output
    const active = rows.map(() => new Set());
    active[4].add(N - 1);
    const lines = [];
    for (let L = 4; L >= 1; L--) {
      active[L].forEach(t => {
        [0, 1, 2].forEach(k => {
          const s = t - k * dil[L];
          if (s >= 0) { active[L - 1].add(s); lines.push([L, t, s]); }
        });
      });
    }
    let body = `<g class="cue tone-dim" data-c="3"><rect x="350" y="44" width="44" height="210" rx="8" fill="url(#HATCH)" class="dg-future"/>
      <text class="dg-s dg-strong" x="372" y="148" text-anchor="middle" transform="rotate(-90 372 148)">FUTURE · never seen (Chomp1d)</text></g>`;
    rows.forEach(([label, y], L) => {
      body += `<text class="dg-s dg-mono" x="6" y="${y + 4}">${label}</text>`;
      for (let t = 0; t < N; t++) {
        body += `<circle class="tcn-n ${active[L].has(t) ? 'cue on-active' : ''}" data-c="${L === 0 ? 1 : 2}" cx="${x(t)}" cy="${y}" r="${active[L].has(t) ? 5 : 3.5}"/>`;
      }
    });
    lines.forEach(([L, t, s], i) => {
      body += `<line class="cue tcn-l" data-c="2" style="animation-delay:${(4 - L) * 0.35}s" x1="${x(t)}" y1="${rows[L][1]}" x2="${x(s)}" y2="${rows[L - 1][1]}"/>`;
    });
    body += `<g class="cue tone-emerald" data-c="4">
      <line class="dg-edge" x1="${x(N - 1)}" y1="54" x2="${x(N - 1)}" y2="36" marker-end="url(#ARROW)"/>
      <rect class="dg-chip" x="232" y="6" width="150" height="26" rx="13"/>
      <text class="dg-s dg-strong" x="307" y="23" text-anchor="middle">RUL = 34 cycles left</text></g>`;
    body += `<g class="cue" data-c="2"><text class="dg-s" x="40" y="22">4 layers see 31 steps back</text>
      <text class="dg-s" x="40" y="35">with only 3 taps per layer</text></g>`;
    return svg(400, 256, body);
  }
};

/* 10 · RUL target, safety buffer, threshold --------------------------- */
DIAGRAMS.rul = {
  title: 'Making the forecast safe',
  caption: 'features.py cap at 100 · scheduler_agent.py ×0.85 and the 30-cycle line',
  build() {
    const px = c => 50 + (c / 200) * 330, py = r => 210 - (r / 120) * 180;
    const target = c => Math.min(100, 200 - c);
    const r = rng(3);
    const pred = Array.from({ length: 81 }, (_, i) => { const c = i * 2.5; return [c, Math.max(0, target(c) + Math.sin(c / 9) * 3 + gauss(r) * 1.8)]; });
    const path = (arr, f = v => v) => arr.map(([c, v], i) => `${i ? 'L' : 'M'}${px(c).toFixed(1)},${py(f(v)).toFixed(1)}`).join(' ');
    const band = `${path(pred)} ${pred.slice().reverse().map(([c, v]) => `L${px(c).toFixed(1)},${py(v * 0.85).toFixed(1)}`).join(' ')} Z`;
    const cross = 200 - 30 / 0.85;
    return svg(400, 250, `
      <line class="dg-axis" x1="50" y1="210" x2="385" y2="210"/><line class="dg-axis" x1="50" y1="210" x2="50" y2="22"/>
      <text class="dg-s" x="215" y="228" text-anchor="middle">operating cycles →</text>
      <text class="dg-s" x="38" y="116" text-anchor="middle" transform="rotate(-90 38 116)">remaining life (cycles)</text>
      <g class="cue tone-dim" data-c="1"><path class="dg-curve dg-dashed" d="M${px(0)},${py(100)} H${px(100)} L${px(200)},${py(0)}"/>
        <text class="dg-s dg-strong" x="${px(48)}" y="${py(100) - 8}" text-anchor="middle">training target capped at 100</text></g>
      <g class="cue tone-amber" data-c="3"><path class="dg-band" d="${band}"/></g>
      <g class="cue tone-cyan" data-c="2"><path class="dg-curve draw" d="${path(pred)}"/>
        <text class="dg-s dg-strong" x="${px(128)}" y="${py(82)}">TCN prediction</text></g>
      <g class="cue tone-amber" data-c="3"><path class="dg-curve dg-dashed" d="${path(pred, v => v * 0.85)}"/>
        <text class="dg-s dg-strong" x="${px(112)}" y="${py(50)}">safe = 0.85 × prediction</text></g>
      <g class="cue tone-rose" data-c="4"><line class="dg-thresh" x1="50" y1="${py(30)}" x2="385" y2="${py(30)}"/>
        <text class="dg-s dg-strong" x="56" y="${py(30) - 6}">safe RUL &lt; 30 → draft work order</text>
        <circle class="dg-fillc" cx="${px(cross)}" cy="${py(30)}" r="5"/>
        <text class="dg-s" x="${px(cross) - 6}" y="${py(30) + 18}" text-anchor="end">alarm fires ~5 cycles sooner</text></g>`);
  }
};

/* 11 · RAG retrieval -------------------------------------------------- */
DIAGRAMS.rag = {
  title: 'How the right procedure is found',
  caption: 'rag/knowledge_base.py: ChromaDB, filter first, then rank',
  build() {
    const doc = (x, name, ok) => `<g class="${ok ? 'tone-emerald' : 'tone-dim rag-out'}">
      <rect class="dg-chip" x="${x}" y="78" width="124" height="24" rx="6"/>
      <text class="dg-s dg-strong" x="${x + 62}" y="94" text-anchor="middle">${ok ? '✓' : '✕'} ${name}</text></g>`;
    const vec = (y, label, seed) => { const r = rng(seed); return `<text class="dg-s" x="10" y="${y + 9}">${label}</text>` + Array.from({ length: 22 }, (_, i) => { const h = Math.round(r() * r() * 16) + 2; return `<rect class="dg-vbar" x="${92 + i * 13}" y="${y + 12 - h}" width="8" height="${h}" rx="1.5"/>`; }).join(''); };
    const rank = (y, label, score, best) => `<g class="${best ? 'tone-emerald' : 'tone-dim'}">
      <text class="dg-s" x="10" y="${y + 11}">${label}</text>
      <rect class="dg-bar" x="230" y="${y + 1}" width="${score * 130}" height="13" rx="3"/>
      <text class="dg-s dg-mono" x="${236 + score * 130}" y="${y + 11}">${score.toFixed(2)}</text></g>`;
    return svg(400, 290, `
      <g class="cue tone-cyan" data-c="1"><rect class="dg-box" x="8" y="6" width="384" height="44" rx="10"/>
        <text class="dg-t" x="20" y="24">Query from Diagnosis agent</text>
        <text class="dg-s dg-mono" x="20" y="40">machine_type=CNC_MILL · "vibration high, temperature rising"</text></g>
      <g class="cue" data-c="2"><text class="dg-s dg-strong" x="10" y="70">① metadata filter first: only this machine’s manual survives</text>
        ${doc(8, 'cnc_mill_sop', true)}${doc(138, 'hydraulic_press', false)}${doc(268, 'conveyor_sop', false)}</g>
      <g class="cue" data-c="3"><text class="dg-s dg-strong" x="10" y="122">② TF-IDF vectors (512 terms, fully offline)</text>
        <g class="tone-cyan">${vec(128, 'query', 11)}</g><g class="tone-dim">${vec(146, 'chunk', 12)}</g></g>
      <g class="cue" data-c="4"><text class="dg-s dg-strong" x="10" y="184">③ cosine similarity ranks the chunks → top-k</text>
        ${rank(190, 'Elevated vibration RMS', 0.82, true)}
        ${rank(207, 'Maintenance procedure summary', 0.41, false)}
        ${rank(224, 'Temp rise w/o vibration', 0.18, false)}
        <text class="dg-s" x="392" y="184" text-anchor="end">illustrative scores</text></g>
      <g class="cue tone-emerald" data-c="5"><rect class="dg-goal" x="8" y="246" width="384" height="38" rx="10"/>
        <text class="dg-t" x="20" y="262">SOP-CNC-014 · wear &gt; 0.85 ⇒ schedule immediately</text>
        <text class="dg-s" x="20" y="277">"Do not increase feed rate to compensate" · ~600 s service</text></g>`);
  }
};

/* 12 · Scheduler decision --------------------------------------------- */
DIAGRAMS.scheduler = {
  title: 'Deciding what to do',
  caption: 'scheduler_agent.py: deterministic rules, not prompts',
  build(u) {
    const lane = (y, label, action, tone) => `<g class="${tone}">
      <rect class="dg-box" x="256" y="${y}" width="136" height="40" rx="8"/>
      <text class="dg-t" x="324" y="${y + 17}" text-anchor="middle">${label}</text>
      <text class="dg-s dg-mono" x="324" y="${y + 31}" text-anchor="middle">${action}</text></g>`;
    return svg(400, 250, `
      <g class="cue tone-amber" data-c="1"><rect class="dg-box" x="8" y="20" width="110" height="74" rx="10"/>
        <text class="dg-t" x="63" y="42" text-anchor="middle">CNC-01</text>
        <text class="dg-s" x="63" y="58" text-anchor="middle">urgency: high</text>
        <text class="dg-s dg-mono" x="63" y="74" text-anchor="middle">zone C · critical</text></g>
      <g class="cue" data-c="2"><rect class="dg-box" x="134" y="20" width="106" height="74" rx="10"/>
        <text class="dg-s dg-mono" x="187" y="42" text-anchor="middle">safe = 0.85×RUL</text>
        <text class="dg-s dg-mono" x="187" y="58" text-anchor="middle">safe &lt; 30 or</text>
        <text class="dg-s dg-mono" x="187" y="74" text-anchor="middle">urgency = high</text>
        <text class="dg-s dg-strong" x="187" y="88" text-anchor="middle">⇒ HIGH</text></g>
      ${edge('M118,57 H132', { c: 2 })}
      <g class="cue" data-c="3">
        ${lane(14, 'high', 'draft work order', 'tone-rose')}
        ${lane(62, 'medium', 'recommend_next_cycle', 'tone-amber')}
        ${lane(110, 'low', 'log_only', 'tone-dim')}
        <path id="${u}-t" class="dg-edge dg-flow tone-rose" d="M240,57 C250,57 248,34 254,34" marker-end="url(#ARROW)"/>
        <path class="dg-edge tone-dim" d="M240,57 C250,57 248,82 254,82"/><path class="dg-edge tone-dim" d="M240,57 C250,57 248,130 254,130"/>
      </g>
      <g class="cue tone-emerald" data-c="4"><rect class="dg-goal" x="8" y="168" width="384" height="70" rx="12"/>
        <text class="dg-glyph" x="38" y="214" text-anchor="middle">👷</text>
        <text class="dg-t" x="66" y="194">Human in the loop</text>
        ${textBlock(66, 210, 'The copilot advises and pre-fills the work order. A supervisor approves with one click and can always override.', { max: 52, anchor: 'start' })}</g>`);
  }
};

/* 13 · Optimisations -------------------------------------------------- */
DIAGRAMS.optimize = {
  title: 'How it’s optimised',
  caption: 'Six engineering choices that make it fast, safe and portable',
  build() {
    const tiles = [
      ['🙈', 'Zero feature leakage', 'Models see only vibration & temperature, never hidden wear.', 'tone-rose'],
      ['🧱', 'Causal dilated TCN', 'Long memory, few weights, CPU-only, no GPU needed.', 'tone-cyan'],
      ['🎯', 'Honest training target', 'RUL capped at 100 + 15% asymmetric safety margin.', 'tone-amber'],
      ['🗂️', 'Filter, then rank', 'Metadata filter before TF-IDF search: no wrong-manual hits.', 'tone-emerald'],
      ['📏', 'Deterministic scheduler', 'Plain rules, not prompts: auditable and repeatable.', 'tone-purple'],
      ['📦', 'Zero build, offline', 'Vendored Three.js, no npm, no cloud keys, runs air-gapped.', 'tone-cyan'],
    ];
    return svg(400, 290, tiles.map(([g, t, d, tone], i) => {
      const x = 8 + (i % 2) * 196, y = 6 + Math.floor(i / 2) * 94;
      return `<g class="cue ${tone}" data-c="${i + 1}">
        <rect class="dg-box dg-card" x="${x}" y="${y}" width="188" height="86" rx="12"/>
        <text class="dg-glyph-s" x="${x + 22}" y="${y + 32}" text-anchor="middle">${g}</text>
        <text class="dg-t" x="${x + 40}" y="${y + 28}">${esc(t)}</text>
        ${textBlock(x + 14, y + 50, d, { max: 32, anchor: 'start' })}</g>`;
    }).join(''));
  }
};

/* 14 · Transport & render budget -------------------------------------- */
DIAGRAMS.transport = {
  title: 'Push, don’t poll',
  caption: 'api/main.py broadcaster + app.js fallback logic',
  build() {
    const tx = s => 92 + (s / 6) * 290;
    const ticks = (y, step, tone) => { let o = `<g class="${tone}">`; for (let s = 0; s <= 6.001; s += step) o += `<circle class="dg-fillc" cx="${tx(s).toFixed(1)}" cy="${y}" r="4"/>`; return o + '</g>'; };
    return svg(400, 262, `
      ${[0, 1, 2, 3, 4, 5, 6].map(s => `<text class="dg-s dg-mono" x="${tx(s)}" y="18" text-anchor="middle">${s}s</text><line class="dg-grid" x1="${tx(s)}" y1="24" x2="${tx(s)}" y2="138"/>`).join('')}
      <g class="cue" data-c="1"><text class="dg-t" x="8" y="48">WebSocket</text><text class="dg-s" x="8" y="61">push · 2 Hz</text>
        <line class="dg-lane tone-cyan" x1="92" y1="52" x2="382" y2="52"/>${ticks(52, 0.5, 'tone-cyan')}</g>
      <g class="cue" data-c="2"><text class="dg-t" x="8" y="94">HTTP poll</text><text class="dg-s" x="8" y="107">fallback · 1.8 s</text>
        <line class="dg-lane tone-amber" x1="92" y1="98" x2="382" y2="98"/>${ticks(98, 1.8, 'tone-amber')}</g>
      <g class="cue" data-c="3"><text class="dg-s" x="92" y="132">WS drops → poll instantly, retry WS every 3 s · live WS → 15 s heartbeat only</text></g>
      <rect class="dg-cursor" x="92" y="28" width="2" height="108"/>
      <g class="cue tone-purple" data-c="4"><rect class="dg-box" x="8" y="150" width="384" height="104" rx="12"/>
        <text class="dg-t" x="22" y="172">Render budget</text>
        <text class="dg-s" x="22" y="192">• pixel ratio capped at 2: crisp on Retina without 9× the pixels</text>
        <text class="dg-s" x="22" y="208">• shadows only on opaque meshes; glass and glow stay cheap</text>
        <text class="dg-s" x="22" y="224">• all textures procedural (canvas-drawn): zero image downloads</text>
        <text class="dg-s" x="22" y="240">• this guide renders in its own tiny canvas, only while visible</text></g>`);
  }
};

/* 15 · Real-world deployment ------------------------------------------ */
DIAGRAMS.realworld = {
  title: 'Taking it to a real plant',
  caption: 'Swap the simulator for real sensors; nothing else changes',
  build(u) {
    return svg(400, 270, `
      <g class="cue tone-dim" data-c="5"><g class="rw-cloud"><path class="dg-box" d="M150,40 a18,18 0 0 1 30,-16 a22,22 0 0 1 40,4 a16,16 0 0 1 14,28 h-80 a14,14 0 0 1 -4,-16 z"/>
        <line class="dg-x" x1="160" y1="16" x2="240" y2="64"/><line class="dg-x" x1="240" y1="16" x2="160" y2="64"/></g>
        <text class="dg-s dg-strong" x="290" y="38">no cloud · air-gapped</text><text class="dg-s" x="290" y="52">ITAR / AS9100 friendly</text></g>
      ${node(6, 92, 88, 70, 'Legacy CNC', '+ vibration puck', { c: 1, sub2: '+ thermocouple' })}
      ${node(110, 92, 86, 70, 'Gateway', 'OPC-UA · MQTT', { c: 2, sub2: 'Modbus TCP' })}
      ${node(212, 92, 86, 70, 'On-prem PC', 'this copilot', { c: 3, sub2: 'CPU only' })}
      ${node(314, 92, 80, 70, 'Operator', 'SOP checklist', { c: 4, sub2: '1-click order' })}
      <path id="${u}-w" class="dg-rail" d="M50,127 H354"/>
      ${edge('M94,127 H108', { c: 2 })}${edge('M196,127 H210', { c: 3 })}${edge('M298,127 H312', { c: 4 })}
      ${packets(`${u}-w`, { n: 3, dur: 3.5, c: 2 })}
      <g class="cue tone-amber" data-c="1"><text class="dg-s dg-strong" x="50" y="180" text-anchor="middle">&lt; $500 / machine</text></g>
      <g class="cue tone-emerald" data-c="6">
        <rect class="dg-goal" x="6" y="200" width="388" height="62" rx="12"/>
        <text class="dg-big-s" x="70" y="230" text-anchor="middle">≤ 75%</text><text class="dg-s" x="70" y="246" text-anchor="middle">fewer breakdowns</text>
        <text class="dg-big-s" x="200" y="230" text-anchor="middle">≤ 45%</text><text class="dg-s" x="200" y="246" text-anchor="middle">less downtime</text>
        <text class="dg-big-s" x="330" y="230" text-anchor="middle">≤ 30%</text><text class="dg-s" x="330" y="246" text-anchor="middle">lower maint. cost</text>
        <text class="dg-s" x="392" y="196" text-anchor="end">best-case industry figures · US DOE FEMP O&amp;M guide (2010)</text></g>`);
  }
};

/* 16 · The full loop -------------------------------------------------- */
DIAGRAMS.loop = {
  title: 'The whole loop',
  caption: 'Sense → Detect → Predict → Decide → Fix, every cycle',
  build(u) {
    const cx = 200, cy = 128, R = 92;
    const steps = [['Sense', 'twin + sensors', 'tone-cyan'], ['Detect', 'Isolation Forest', 'tone-rose'], ['Predict', 'TCN → RUL', 'tone-purple'], ['Decide', 'agents + SOPs', 'tone-amber'], ['Fix', 'human-approved', 'tone-emerald']];
    let body = `<circle id="${u}-c" class="dg-rail" cx="${cx}" cy="${cy}" r="${R}"/>
      <path id="${u}-cp" d="M${cx},${cy - R} a${R},${R} 0 1 1 -0.01,0" fill="none"/>
      <text class="dg-t" x="${cx}" y="${cy - 2}" text-anchor="middle">Titan Digital Twin</text>
      <text class="dg-s" x="${cx}" y="${cy + 14}" text-anchor="middle">closed-loop copilot</text>`;
    steps.forEach(([t, s, tone], i) => {
      const a = -Math.PI / 2 + i * (2 * Math.PI / 5);
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      body += `<g class="cue ${tone}" data-c="${i + 1}"><circle class="dg-orb" cx="${x}" cy="${y}" r="27"/>
        <text class="dg-t" x="${x}" y="${y + 1}" text-anchor="middle">${t}</text>
        <text class="dg-s" x="${x}" y="${y + 13}" text-anchor="middle">${s}</text></g>`;
    });
    body += `<circle class="dg-pkt tone-amber" r="6"><animateMotion dur="7s" repeatCount="indefinite"><mpath xlink:href="#${u}-cp"/></animateMotion></circle>`;
    return svg(400, 256, body);
  }
};

/* ============================================================
   MOUNTING
   ============================================================ */
export function hasDiagram(id) { return !!DIAGRAMS[id]; }

/**
 * Renders diagram `id` into `container`. Returns a controller with
 *   setCue(n)    light up cue parts ≤ n (part == n gets the "now" accent)
 *   update(opts) diagram-specific refresh without re-rendering (e.g. floor focus)
 */
export function mountDiagram(container, id, opts = {}) {
  const def = DIAGRAMS[id];
  if (!def || !container) return null;
  const u = `dg${++uidCounter}`;
  // ids inside defs must be unique per mount
  const html = def.build(u, opts).replace(/id="ARROW"/g, `id="${u}-ARROW"`).replace(/url\(#ARROW\)/g, `url(#${u}-ARROW)`)
    .replace(/id="HATCH"/g, `id="${u}-HATCH"`).replace(/url\(#HATCH\)/g, `url(#${u}-HATCH)`);
  container.innerHTML = html;
  const root = container.querySelector('svg');
  let cue = -1;
  const ctl = {
    id,
    title: def.title,
    caption: def.caption,
    setCue(n) {
      if (n === cue) return;
      cue = n;
      root.querySelectorAll('.cue').forEach(el => {
        const c = Number(el.getAttribute('data-c') || 0);
        el.classList.toggle('on', c <= n);
        el.classList.toggle('now', c === n && n > 0);
      });
      if (def.onCue) def.onCue(root, n);
    },
    update(o) { if (def.update) def.update(root, o || {}); },
    revealAll() { ctl.setCue(99); },
  };
  ctl.setCue(0);
  ctl.update(opts);
  return ctl;
}
