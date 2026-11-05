/**
 * Guided Tour Engine (Titan Aerospace Operations Center)
 * =======================================================
 * A narrated walkthrough hosted by "Rivet", a small 3D guide orb. Every beat in
 * ./guide/script.js is spoken (Web Speech API, with a silent fallback) while
 * the stage reacts in sync:
 *
 *   • camera flies to the bay / machine being discussed
 *   • a pulsing 3D beacon + leader line + label marks the exact asset
 *   • an animated SVG diagram explains the mechanism, lighting up part by
 *     part as the matching words are spoken
 *   • live backend actions run on cue (fault injection, scan, repair)
 *
 * Controls: ◀ / ▶ (or arrow keys), pause (Space), voice (V), speed, exit (Esc),
 * and the chapter rail to jump anywhere. Append ?tour=1 to auto-start.
 */

import { setCameraPreset, setCameraShot, triggerRadarScan, setTourBeacon, projectTourTarget } from './scene.js';
import { closeDrawer, addLogMessage } from './hud.js';
import { playClick, playScan, playAlarm, playRepairSuccess } from './audio.js';
import { createMascot } from './guide/mascot.js';
import { createNarrator, parseScript } from './guide/voice.js';
import { mountDiagram } from './guide/diagrams.js';
import { BEATS as ALL_BEATS, CHAPTERS, TARGET_LABELS } from './guide/script.js';

// The active beat list: the full tour, or the quick one (beats marked quick).
let BEATS = ALL_BEATS;
import { forecastControls } from './forecast.js';

let deps = {
  selectMachine: (id) => (window.selectMachine ? window.selectMachine(id) : null),
  dispatchAction: async (action, payload) => (window.dispatchAction ? window.dispatchAction(action, payload) : null)
};

const RATES = [1, 1.2, 1.4, 0.85];

/* Tour framings: wider than the manual director presets so a whole bay
   (and the beacon on the floor) fits next to the diagram panel. */
const SHOTS = {
  bay1:     { pos: [-4, 21, 13],  look: [-12, 1.5, -10], preset: 'bay1' },
  bay2:     { pos: [22, 23, 15],  look: [12, 2, -7],     preset: 'bay2' },
  bay3:     { pos: [-4, 21, 30],  look: [-12, 1.5, 8],   preset: 'bay3' },
  'CNC-01': { pos: [-5, 13, 3],   look: [-15, 2.2, -10], preset: 'bay1' },
};

const state = {
  running: false,
  playing: true,
  index: 0,
  beatToken: 0,
  parsed: null,
  diagram: null,
  mascot: null,
  narrator: null,
  advanceTimer: null,
  rafId: null,
  rateIdx: 0,
};

const $ = (id) => document.getElementById(id);

/* ------------------------------------------------------------------ */
/* Stage helpers                                                       */
/* ------------------------------------------------------------------ */

function syncDirector(camera) {
  const bayOf = {
    'CNC-01': 'bay1', 'CNC-02': 'bay1', 'PRESS-01': 'bay2', 'PRESS-02': 'bay2', 'FURN-01': 'bay2',
    'ROBOT-01': 'bay3', 'LASER-01': 'bay3', 'CONV-01': 'bay4'
  };
  const preset = bayOf[camera] || camera;
  document.querySelectorAll('.btn-director').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-preset') === preset);
  });
}

function setRibbon(mode) {
  const ribbon = $('pipeline-ribbon');
  if (!ribbon) return;
  if (mode === 'prod' || mode === 'ai') {
    ribbon.classList.remove('collapsed');
    const tab = $(mode === 'prod' ? 'tab-pipe-prod' : 'tab-pipe-ai');
    if (tab) tab.click();
  } else {
    ribbon.classList.add('collapsed');
  }
}

function setDrawer(spec) {
  if (!spec || spec === 'close') { closeDrawer(); return; }
  deps.selectMachine(spec.machine);
  if (spec.tab) {
    const tab = document.querySelector(`.drawer-tab[data-tab="${spec.tab}"]`);
    if (tab) tab.click();
  }
}

function setDiagram(beat) {
  const panel = $('guide-diagram');
  const body = $('guide-diagram-body');
  if (!panel || !body) return;
  if (!beat.diagram) {
    panel.classList.remove('show');
    state.diagram = null;
    return;
  }
  // Same diagram as the previous beat → keep it and just refocus (smooth continuity).
  if (state.diagram && state.diagram.id === beat.diagram) {
    state.diagram.update(beat.diagramOpts);
    state.diagram.setCue(0);
  } else {
    panel.classList.remove('show');
    state.diagram = mountDiagram(body, beat.diagram, beat.diagramOpts || {});
    if (state.diagram) {
      $('guide-diagram-title').textContent = state.diagram.title;
      $('guide-diagram-caption').textContent = state.diagram.caption;
    }
    // restart the panel's entrance animation
    void panel.offsetWidth;
  }
  if (state.diagram) panel.classList.add('show');
}

function renderRail() {
  const rail = $('guide-rail');
  if (!rail) return;
  rail.innerHTML = '';
  CHAPTERS.filter(ch => BEATS.some(b => b.ch === ch.id)).forEach((ch, ci) => {
    const beats = BEATS.map((b, i) => ({ b, i })).filter(x => x.b.ch === ch.id);
    const btn = document.createElement('button');
    btn.className = 'guide-rail-ch';
    btn.dataset.ch = ch.id;
    btn.title = `Jump to: ${ch.label}`;
    btn.innerHTML = `<span class="guide-rail-num">${String(ci + 1).padStart(2, '0')}</span><span class="guide-rail-label">${ch.label}</span>
      <span class="guide-rail-track">${beats.map(x => `<i data-beat="${x.i}"></i>`).join('')}</span>`;
    btn.addEventListener('click', () => { playClick(); goTo(beats[0].i); });
    rail.appendChild(btn);
  });
}

function updateRail() {
  const beat = BEATS[state.index];
  const chIdx = CHAPTERS.filter(ch => BEATS.some(b => b.ch === ch.id)).findIndex(c => c.id === beat.ch);
  document.querySelectorAll('.guide-rail-ch').forEach((el, i) => {
    el.classList.toggle('active', i === chIdx);
    el.classList.toggle('done', i < chIdx);
  });
  document.querySelectorAll('.guide-rail-track i').forEach(el => {
    const bi = Number(el.dataset.beat);
    el.className = bi < state.index ? 'done' : (bi === state.index ? 'now' : '');
  });
}

function renderSubtitle(parsed) {
  const el = $('guide-text');
  if (!el) return;
  el.innerHTML = '';
  parsed.words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'gw' + (w.kw ? ' kw' : '');
    span.textContent = w.text;
    span.dataset.i = i;
    el.appendChild(span);
    el.appendChild(document.createTextNode(' '));
  });
  el.scrollTop = 0;
}

function onWord(i, word) {
  const el = $('guide-text');
  if (el) {
    const spans = el.children;
    for (let k = 0; k < spans.length; k++) {
      spans[k].classList.toggle('said', k < i);
      spans[k].classList.toggle('now', k === i);
    }
    const cur = spans[i];
    if (cur && cur.offsetTop + cur.offsetHeight > el.scrollTop + el.clientHeight - 4) {
      el.scrollTop = cur.offsetTop - el.clientHeight / 3;
    }
  }
  // Lip-sync kick: more vowels → wider mouth
  if (state.mascot && word) {
    const vowels = (word.text.match(/[aeiouy]/gi) || []).length;
    state.mascot.pulse(0.45 + Math.min(0.55, vowels * 0.14));
  }
  // Diagram cues
  if (state.diagram && state.parsed) {
    let cue = 0;
    state.parsed.cues.forEach(c => { if (c.word <= i) cue = Math.max(cue, c.cue); });
    state.diagram.setCue(cue);
  }
  const fill = $('guide-beat-fill');
  if (fill && state.parsed) fill.style.width = `${((i + 1) / state.parsed.words.length) * 100}%`;
}

function onNarrationDone() {
  // Reveal everything that belongs to this beat, then auto-advance.
  if (state.diagram) state.diagram.revealAll();
  const el = $('guide-text');
  if (el) [...el.children].forEach(s => { s.classList.add('said'); s.classList.remove('now'); });
  if (!state.running || !state.playing) return;
  clearTimeout(state.advanceTimer);
  state.advanceTimer = setTimeout(() => {
    if (!state.running || !state.playing) return;
    if (state.index < BEATS.length - 1) goTo(state.index + 1);
    else finishTour();
  }, 1400);
}

/* ------------------------------------------------------------------ */
/* Beat sequencing                                                     */
/* ------------------------------------------------------------------ */

function goTo(index) {
  if (!state.running) return;
  index = Math.max(0, Math.min(BEATS.length - 1, index));
  clearTimeout(state.advanceTimer);
  state.narrator.stop();
  state.index = index;
  const token = ++state.beatToken;
  const beat = BEATS[index];

  // Text
  state.parsed = parseScript(beat.say);
  $('guide-beat-title').textContent = beat.title;
  $('guide-beat-count').textContent = `${index + 1} of ${BEATS.length}`;
  const chapter = CHAPTERS.find(c => c.id === beat.ch);
  $('guide-chapter').textContent = chapter ? chapter.label : '';
  $('guide-beat-fill').style.width = '0%';
  renderSubtitle(state.parsed);
  updateRail();
  $('guide-prev').disabled = index === 0;

  // Stage
  setRibbon(beat.ribbon);
  // Drawer first: selectMachine() moves the camera itself, so the tour shot must win afterwards.
  setDrawer(beat.drawer);
  if (beat.camera) {
    const shot = typeof beat.camera === 'string' ? SHOTS[beat.camera] : beat.camera;
    if (shot) setCameraShot(shot.pos, shot.look);
    else setCameraPreset(beat.camera);
    syncDirector(shot && shot.preset ? shot.preset : beat.camera);
  }
  if (!beat.forecast && forecastControls.isOpen()) forecastControls.close();
  document.body.classList.toggle('tour-show-ops', !!beat.ops);
  setTourBeacon(beat.focus || null);
  setDiagram(beat);

  // Mascot performance
  const m = state.mascot;
  if (m) {
    m.setMood(beat.mood || 'happy');
    m.gesture(beat.gesture || 'none');
    if (beat.celebrate) setTimeout(() => { if (token === state.beatToken) m.celebrate(); }, 600);
  }
  const mood = $('guide-root');
  if (mood) mood.dataset.mood = beat.mood || 'happy';

  // Sound cue
  if (beat.sound === 'alarm') playAlarm();
  else if (beat.sound === 'scan') playScan();
  else if (beat.sound === 'repair') setTimeout(() => { if (token === state.beatToken) playRepairSuccess(); }, 5400);
  else playClick();

  // Live action against the backend (cancelled if the user moves on)
  if (beat.action) {
    const ctx = {
      alive: () => token === state.beatToken && state.running,
      wait: (ms) => new Promise(r => setTimeout(r, ms)),
      dispatch: async (action, payload) => {
        if (token !== state.beatToken || !state.running) return null;
        return deps.dispatchAction(action, payload);
      },
      radar: () => { if (token === state.beatToken) triggerRadarScan(); },
      forecast: async (method, arg) => {
        if (token !== state.beatToken || !state.running) return null;
        return forecastControls[method](arg);
      },
    };
    beat.action(ctx).catch(err => console.error('Tour action failed:', err));
  }

  addLogMessage(`Tour ${index + 1}/${BEATS.length}: ${beat.title}`, 'TOUR');

  // Narration
  state.narrator.load(state.parsed);
  if (state.playing) state.narrator.play(0);
  else onWord(-1);
}

function setPlaying(on) {
  state.playing = on;
  const btn = $('guide-play');
  if (btn) {
    btn.classList.toggle('is-paused', !on);
    btn.title = on ? 'Pause (Space)' : 'Play (Space)';
    btn.setAttribute('aria-label', btn.title);
  }
  $('guide-root')?.classList.toggle('paused', !on);
  if (on) {
    const w = state.narrator.currentWord();
    if (state.parsed && w >= state.parsed.words.length - 1) onNarrationDone();
    else state.narrator.play();
  } else {
    clearTimeout(state.advanceTimer);
    state.narrator.pause();
  }
}

function updateVoiceButton() {
  const btn = $('guide-voice');
  if (!btn) return;
  const has = state.narrator.hasVoice();
  const on = state.narrator.isVoiceOn();
  const label = btn.querySelector('.guide-voice-label');
  if (label) label.textContent = has ? 'Voice' : 'No voice';
  btn.classList.toggle('is-on', has && on);
  btn.setAttribute('aria-pressed', String(has && on));
  btn.disabled = !has;
  btn.classList.toggle('off', !on);
  btn.title = has ? 'Toggle narration voice (V)' : 'Speech synthesis is not available in this browser';
}

/* ------------------------------------------------------------------ */
/* Leader line + mascot gaze (runs every frame while the tour is open) */
/* ------------------------------------------------------------------ */

function frame() {
  if (!state.running) return;
  state.rafId = requestAnimationFrame(frame);
  const beat = BEATS[state.index];
  const path = $('guide-leader-path');
  const dot = $('guide-leader-dot');
  const ring = $('guide-leader-ring');
  const chip = $('guide-target-chip');
  const canvas = $('guide-mascot');

  // Keep the stage above the ribbon when it is expanded.
  const ribbon = $('pipeline-ribbon');
  const root = $('guide-root');
  if (ribbon && root) {
    const top = ribbon.getBoundingClientRect().top;
    root.style.setProperty('--guide-bottom', `${Math.max(16, window.innerHeight - top + 12)}px`);
  }
  // ...and the chapter rail just under the header, however tall it wraps.
  const hud = $('top-hud');
  if (hud && root) root.style.setProperty('--guide-top', `${Math.round(hud.getBoundingClientRect().bottom + 10)}px`);
  const drawer = $('machine-drawer');
  $('guide-diagram')?.classList.toggle('beside-drawer', !!(drawer && drawer.classList.contains('open')));

  const target = beat && beat.focus ? projectTourTarget(beat.focus, beat.focus.startsWith('AGV') ? 1.6 : 3.4) : null;
  if (state.mascot) state.mascot.lookAtScreen(target ? target.x : null, target ? target.y : null);

  if (!target || !canvas || !path) {
    path?.setAttribute('d', '');
    dot?.setAttribute('opacity', '0');
    ring?.setAttribute('opacity', '0');
    chip?.classList.remove('show');
    return;
  }
  const r = canvas.getBoundingClientRect();
  // Start just outside the orb's halo, on the side facing the target.
  const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
  const ang = Math.atan2(target.y - oy, target.x - ox);
  const ax = ox + Math.cos(ang) * r.width * 0.36, ay = oy + Math.sin(ang) * r.height * 0.36;
  const cx = (ax + target.x) / 2, cy = Math.min(ay, target.y) - 70;
  path.setAttribute('d', `M${ax.toFixed(1)},${ay.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${target.x.toFixed(1)},${target.y.toFixed(1)}`);
  dot.setAttribute('cx', target.x.toFixed(1));
  dot.setAttribute('cy', target.y.toFixed(1));
  dot.setAttribute('opacity', '1');
  if (ring) {
    ring.setAttribute('cx', target.x.toFixed(1));
    ring.setAttribute('cy', target.y.toFixed(1));
    ring.setAttribute('opacity', '1');
  }

  const label = TARGET_LABELS[beat.focus];
  if (chip && label) {
    if (chip.dataset.id !== beat.focus) {
      chip.dataset.id = beat.focus;
      chip.querySelector('strong').textContent = label[0];
      chip.querySelector('span').textContent = label[1];
    }
    chip.style.transform = `translate(${(target.x + 14).toFixed(0)}px, ${(target.y - 46).toFixed(0)}px)`;
    chip.classList.add('show');
  }
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */

function ensureEngine() {
  if (!state.narrator) {
    state.narrator = createNarrator({
      onWord,
      onDone: onNarrationDone,
      onSpeakingChange: (on) => state.mascot && state.mascot.setSpeaking(on),
      onVoiceUnavailable: () => updateVoiceButton(),
    });
  }
  if (!state.mascot) {
    try {
      state.mascot = createMascot($('guide-mascot'));
    } catch (e) {
      console.warn('Mascot failed to initialise:', e);
      state.mascot = null;
    }
    $('guide-root')?.classList.toggle('no-webgl', !state.mascot);
  }
}

export function startGuidedTour(fromIndex = 0, { quick = false } = {}) {
  if (state.running) return;
  BEATS = quick ? ALL_BEATS.filter(b => b.quick) : ALL_BEATS;
  state.quick = quick;
  ensureEngine();
  state.running = true;
  state.playing = true;

  const root = $('guide-root');
  root.classList.remove('hidden', 'leaving');
  root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('tour-mode');

  const btnTour = $('btn-tour');
  if (btnTour) { btnTour.hidden = false; btnTour.classList.add('tour-active'); btnTour.textContent = 'End tour'; }
  const menuBtn = $('btn-tour-menu');
  if (menuBtn) menuBtn.hidden = true;

  renderRail();
  updateVoiceButton();
  state.parsed = null;
  $('guide-play').classList.remove('is-paused');
  root.classList.remove('paused');
  if (state.mascot) { state.mascot.resize(); state.mascot.start(); }
  frame();
  goTo(fromIndex);
}

function finishTour() {
  if (state.mascot) { state.mascot.gesture('wave'); state.mascot.setMood('proud'); }
  setTimeout(() => stopGuidedTour(true), 1600);
}

export function stopGuidedTour(completed = false) {
  if (!state.running) return;
  state.running = false;
  state.beatToken++;
  clearTimeout(state.advanceTimer);
  state.narrator && state.narrator.stop();
  if (state.rafId) cancelAnimationFrame(state.rafId);
  if (forecastControls.isOpen()) forecastControls.close();
  setTourBeacon(null);

  const root = $('guide-root');
  root.classList.add('leaving');
  root.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (state.running) return;
    root.classList.add('hidden');
    root.classList.remove('leaving');
    state.mascot && state.mascot.stop();
  }, 450);
  document.body.classList.remove('tour-mode', 'tour-show-ops');
  $('guide-target-chip')?.classList.remove('show');

  const btnTour = $('btn-tour');
  if (btnTour) { btnTour.classList.remove('tour-active'); btnTour.hidden = true; }
  const menuBtn = $('btn-tour-menu');
  if (menuBtn) menuBtn.hidden = false;

  addLogMessage(completed ? 'Guided tour complete. Controls unlocked: explore freely.' : 'Guided tour stopped.', 'TOUR');
}

export function isTourRunning() {
  return state.running;
}

export function initTourUI(injected = {}) {
  deps = { ...deps, ...injected };

  $('btn-tour')?.addEventListener('click', () => {
    playClick();
    if (state.running) stopGuidedTour();
  });
  $('guide-exit')?.addEventListener('click', () => { playClick(); stopGuidedTour(); });
  $('guide-prev')?.addEventListener('click', () => { playClick(); goTo(state.index - 1); });
  $('guide-next')?.addEventListener('click', () => {
    playClick();
    if (state.index >= BEATS.length - 1) finishTour(); else goTo(state.index + 1);
  });
  $('guide-play')?.addEventListener('click', () => { playClick(); setPlaying(!state.playing); });
  $('guide-voice')?.addEventListener('click', () => {
    playClick();
    state.narrator.setVoiceOn(!state.narrator.isVoiceOn());
    updateVoiceButton();
  });
  $('guide-rate')?.addEventListener('click', (e) => {
    playClick();
    state.rateIdx = (state.rateIdx + 1) % RATES.length;
    const r = RATES[state.rateIdx];
    state.narrator.setRate(r);
    e.currentTarget.textContent = `${r}×`;
  });

  window.addEventListener('keydown', (e) => {
    if (!state.running) return;
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'Escape') { stopGuidedTour(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(state.index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(state.index - 1); }
    else if (e.key === ' ') { e.preventDefault(); setPlaying(!state.playing); }
    else if (e.key === 'v' || e.key === 'V') { state.narrator.setVoiceOn(!state.narrator.isVoiceOn()); updateVoiceButton(); }
  });

  window.addEventListener('resize', () => state.mascot && state.mascot.resize());
  document.addEventListener('visibilitychange', () => {
    if (!state.running || !state.mascot) return;
    if (document.hidden) state.mascot.stop(); else state.mascot.start();
  });

  // Deep link: ?tour=1 (or ?tour=<beat number>) starts the tour automatically.
  const p = new URLSearchParams(window.location.search).get('tour');
  if (p === 'quick') {
    setTimeout(() => startGuidedTour(0, { quick: true }), 1200);
  } else if (p) {
    const n = Math.max(0, (parseInt(p, 10) || 1) - 1);
    setTimeout(() => startGuidedTour(Math.min(n, ALL_BEATS.length - 1)), 1200);
  }
}
