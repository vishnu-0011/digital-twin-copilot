/**
 * Page guide: Rivet reads the project pages with you
 * ==================================================
 * A narrated walkthrough for why.html, method.html, results.html and
 * guide.html. Rivet (the same 3D orb as the plant tour) floats on a card,
 * a spotlight follows the exact element being explained, and the narration
 * drives the page: it switches the P-F chart's strategies, steps through the
 * five-stage loop, and so on.
 *
 * Every number Rivet says is read from /data/results.json at run time, the
 * same file the pages render from, so the narration can never disagree with
 * the charts. If the file is missing, those beats fall back to wording that
 * quotes no numbers.
 *
 * Start it from the header button, or arrive with ?guide=1 (the previous
 * page's "Continue" link). Keys: Space play/pause, ← → step, V voice, Esc close.
 */

import { createNarrator, parseScript } from './voice.js';
import { createMascot } from './mascot.js';

/* ------------------------------------------------------------------ */
/* Numbers from the evaluation suite                                   */
/* ------------------------------------------------------------------ */

const f1 = n => Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });
const f2 = n => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const pct = n => Math.round(Number(n) * 100);

function facts(d) {
  if (!d || !d.policy || !d.rul || !d.anomaly) return null;
  const pol = d.policy.policies;
  const fixedKey = Object.keys(pol).find(k => k.startsWith('Fixed schedule'));
  const kMatch = fixedKey && fixedKey.match(/(\d+)%/);
  const sweep = d.policy.fixed_interval_sweep || [];
  const cliff = sweep.find(s => s.k >= 1.0) || sweep[sweep.length - 1];
  const sens = d.policy.repair_time_sensitivity || [];
  const rul = d.rul.table;
  const an = d.anomaly.models;
  const ifo = an[Object.keys(an).find(k => k.startsWith('Isolation'))];
  const iso = an[Object.keys(an).find(k => k.startsWith('ISO'))];
  const rtf = pol['Run to failure'];
  const cop = pol['Copilot (TCN)'];
  const fix = pol[fixedKey];
  return {
    plants: d.policy.seeds.length,
    hours: d.policy.horizon_h,
    rtfB: f1(rtf.breakdowns.mean), rtfD: f1(rtf.downtime_h.mean),
    copB: f1(cop.breakdowns.mean), copD: f1(cop.downtime_h.mean),
    fixD: f2(fix.downtime_h.mean), copD2: f2(cop.downtime_h.mean),
    fixK: kMatch ? kMatch[1] : '95',
    cut: pct(1 - cop.downtime_h.mean / rtf.downtime_h.mean),
    cliffB: cliff ? f1(cliff.breakdowns) : null,
    cliffD: cliff ? f1(cliff.downtime_h) : null,
    sensLo: sens.length ? f1(sens[0].run_to_failure_h) : null,
    sensHi: sens.length ? f1(sens[sens.length - 1].run_to_failure_h) : null,
    sensLoM: sens.length ? sens[0].multiplier : null,
    sensHiM: sens.length ? sens[sens.length - 1].multiplier : null,
    sensCop: sens.length ? f1(sens[sens.length - 1].copilot_h) : null,
    tcnMae: f1(rul[0].mae), gbMae: f1(rul[1].mae), baseMae: f1(rul[2].mae),
    cover: pct(d.rul.band.coverage_of_pm_mae), late: pct(d.rul.band.late_share),
    p90: f1(d.rul.band.p90_abs_error),
    lead: Math.round(ifo.median_lead_cycles), isoLead: Math.round(iso.median_lead_cycles),
    prec: f2(ifo.precision), rec: f2(ifo.recall), isoRec: f2(iso.recall),
    fa: pct(ifo.false_alarm_rate_healthy),
    lives: d.training.run_to_failure_lives,
    cm: d.cmapss || null,
  };
}

/* ------------------------------------------------------------------ */
/* Scripts                                                             */
/*   target  element to spotlight (string or list; first match wins)  */
/*   say     narration, or (facts) => narration. *word* = keyword,    */
/*           {n} = cue that fires cues[n] when the voice reaches it   */
/*   alt     narration when results.json is unavailable              */
/* ------------------------------------------------------------------ */

const pfShow = s => () => document.querySelector(`.seg button[data-s="${s}"]`)?.click();

const PAGES = {
  why: {
    label: 'Why this project',
    ask: 'Shall I walk you through why we built this?',
    next: { label: 'How it works', href: '/method.html?guide=1' },
    beats: [
      {
        ch: 'The idea', title: 'Machines warn before they break',
        target: '.hero .chart-card', mood: 'curious', enter: pfShow('pdm'),
        say: `This page answers one question: why build this at all?
          Start with the chart. After a fault begins, a machine still looks fine for a while.
          {1} At point *P* the fault becomes detectable: vibration starts to rise.
          {2} At point *F* it breaks. The time between them is the *warning window*.`,
        cues: { 1: ctx => ctx.spot('#pf'), 2: ctx => ctx.spot('#pf') },
      },
      {
        ch: 'The idea', title: 'Three ways to respond',
        target: '.hero .chart-card', mood: 'thinking',
        say: `Plants respond in one of three ways.
          {1} *Run to failure* waits for F. The repair is unplanned, and the part being cut can be scrapped.
          {2} A *fixed schedule* services on the calendar. Healthy parts get replaced, and a fast-wearing machine can still break between visits.
          {3} *Predictive* maintenance acts inside the window, at a time that suits the shift. That's what the copilot does.`,
        cues: { 1: pfShow('rtf'), 2: pfShow('cal'), 3: pfShow('pdm') },
      },
      {
        ch: 'The problem', title: 'A reading is not a decision',
        target: ['#problem .grid3', '#problem'], mood: 'worried',
        say: `So what goes wrong today? Three things.
          {1} Breakdowns are found *too late*, after the line has stopped.
          {2} Calendars *don't know the machine*: wear depends on load and material, not the date.
          {3} And raw data isn't a decision. A number like "vibration 3.1" means little to a busy supervisor, and floods of alarms get muted.`,
        cues: {
          1: ctx => ctx.spot('#problem .grid3 > :nth-child(1)'),
          2: ctx => ctx.spot('#problem .grid3 > :nth-child(2)'),
          3: ctx => ctx.spot('#problem .grid3 > :nth-child(3)'),
        },
      },
      {
        ch: 'The problem', title: 'The real problem',
        target: ['#problem .quote', '#problem'], mood: 'thinking',
        say: `That leads to the sentence this project is built on.
          The hard part isn't predicting failure. It's getting the *right person to act on it in time*, with enough trust to stop a running machine.
          Every design choice on the next page comes back to this.`,
      },
      {
        ch: 'The setting', title: 'Why an aerospace machine shop',
        target: ['#setting .grid4', '#setting'], mood: 'curious',
        say: `We set the twin in a shop that machines jet-engine and airframe parts, because every part of the problem is sharper there.
          {1} *Titanium and nickel alloys* wear tools fast. {2} Parts take *hours* to cut, so a failure mid-cut is expensive.
          {3} Key machines often have *no spare*. {4} And every fix follows a *written procedure* with sign-off, so the copilot must cite it and leave approval to a person.`,
        cues: {
          1: ctx => ctx.spot('#setting .grid4 > :nth-child(1)'),
          2: ctx => ctx.spot('#setting .grid4 > :nth-child(2)'),
          3: ctx => ctx.spot('#setting .grid4 > :nth-child(3)'),
          4: ctx => ctx.spot('#setting .grid4 > :nth-child(4)'),
        },
      },
      {
        ch: 'Our goals', title: 'Why we took it on',
        target: ['#why .grid2', '#why'], mood: 'happy',
        say: `Predictive maintenance isn't new. What's rare is a system that goes all the way to an approved repair, explains itself, and can be tested honestly.
          So we set four goals: {1} close the *whole loop*, {2} *earn trust* by showing uncertainty and keeping a person in charge,
          {3} *test the claim* instead of quoting it, {4} and make it *readable* by the people who use it.`,
        cues: {
          1: ctx => ctx.spot('#why .grid2 > :nth-child(1)'),
          2: ctx => ctx.spot('#why .grid2 > :nth-child(2)'),
          3: ctx => ctx.spot('#why .grid2 > :nth-child(3)'),
          4: ctx => ctx.spot('#why .grid2 > :nth-child(4)'),
        },
      },
      {
        ch: 'What we built', title: 'One loop, five steps',
        target: ['#built .loop', '#built'], mood: 'happy',
        say: `Here's what we built.
          {1} *Sense*: a digital twin of eight machines streams a reading every cycle.
          {2} *Detect*: an Isolation Forest flags readings outside the healthy range.
          {3} *Predict*: a neural network estimates how many cycles are left.
          {4} *Decide*: rule-based agents find the cause, the procedure and a deadline.
          {5} *Fix*: a supervisor approves, and the machine is serviced.`,
        cues: Object.fromEntries([1, 2, 3, 4, 5].map(n => [n, ctx => ctx.spot(`#built .loop > :nth-child(${n})`)])),
      },
      {
        ch: 'What changes', title: 'Measured on unseen plants',
        target: ['#impact .versus3', '#impact'], mood: 'proud',
        say: f => `Does it help? This was measured on ${f.plants} simulated plants the models never saw, one ${f.hours}-hour shift each.
          {1} Running to failure: about *${f.rtfB} breakdowns* and *${f.rtfD} machine-hours* lost.
          {2} With the copilot: *no breakdowns*, and *${f.copD} hours*. That's ${f.cut} percent less downtime.
          {3} To be fair, the best fixed schedule does about as well, at ${f.fixD} hours. But it had to be tuned on these same plants, and one step further it starts breaking machines. The Results page shows that.`,
        alt: `Does it help? The evaluation suite runs the same simulated plants under each policy and counts breakdowns and lost hours.
          Run it once with one command and these three columns fill in.`,
        cues: {
          1: ctx => ctx.spot('#impact .versus3 > :nth-child(1)'),
          2: ctx => ctx.spot('#impact .versus3 > :nth-child(3)'),
          3: ctx => ctx.spot('#impact .versus3 > :nth-child(2)'),
        },
      },
      {
        ch: 'What changes', title: 'Industry figures, clearly labelled',
        target: ['#impact .industry', '#impact'], mood: 'thinking',
        say: `These three figures are not ours. They're best cases for predictive maintenance programs, from the *US Department of Energy*.
          They show why the problem is worth solving. Our own numbers are the ones above.`,
      },
      {
        ch: 'Limits', title: 'What this is, and what it isn\'t',
        target: ['#limits .limits', '#limits'], mood: 'happy',
        say: `And the limits, stated up front. The plant is *simulated*. The models are trained on the simulator, so accuracy on a real machine is *unknown*.
          And the copilot *never acts alone*: it drafts the work order, and a person approves it.
          Next, how it works.`,
      },
    ],
  },

  method: {
    label: 'How it works',
    ask: 'Shall I walk you through how it works?',
    next: { label: 'Results', href: '/results.html?guide=1' },
    beats: [
      {
        ch: 'Architecture', title: 'Five layers, one loop',
        target: ['#architecture .arch', '#architecture'], mood: 'happy',
        say: `This page explains how the copilot works, layer by layer.
          {1} At the bottom, the *plant*: a SimPy digital twin, streaming readings over a WebSocket.
          {2} Above it, *two models*. {3} Then four *rule-based agents*. {4} And at the top, *people*: a supervisor approves, a technician follows the procedure.
          When a work order is approved, the simulated machine is serviced and its readings return to normal, so the loop really closes.`,
        cues: { 1: ctx => ctx.spot('#architecture .arch'), 4: ctx => ctx.spot('#architecture .arch') },
      },
      {
        ch: 'The data', title: 'A plant we can break safely',
        target: ['#twin .eq', '#twin'], mood: 'curious',
        say: `We can't run real machines to failure, so we simulate them.
          Each machine *wears a little every cycle*. Vibration and temperature respond to that wear, with noise, and at wear one it breaks.
          The key rule: the models *never see the wear*. Only what a real plant could measure.`,
      },
      {
        ch: 'The data', title: 'Eight machines, one assumption',
        target: ['#twin .table-wrap', '#twin'], mood: 'thinking',
        say: `The eight machines have different cycle times and lifetimes.
          One assumption matters: a breakdown takes *three times* as long to repair as a planned service. The Results page tests what happens if that's wrong.`,
      },
      {
        ch: 'The models', title: 'Has wear started?',
        target: ['#models .spec > :nth-child(1)', '#models'], mood: 'curious',
        say: `Two questions, two models. The first asks: has wear started?
          An *Isolation Forest* learns what a healthy machine looks like, from the first eighty cycles after each service, and flags anything outside it.
          It needs *no failure labels*, which real plants rarely have.`,
      },
      {
        ch: 'The models', title: 'How long is left?',
        target: ['#models .spec > :nth-child(2)', '#models'], mood: 'thinking',
        say: f => `The second asks: how long is left? A *temporal convolutional network* reads the recent history of the current part and predicts cycles to failure.
          Four dilated layers let it look *sixty-one readings* back. It's trained on ${f.lives} simulated lives, in about two minutes on a laptop.`,
        alt: `The second asks: how long is left? A *temporal convolutional network* reads the recent history of the current part and predicts cycles to failure.
          Four dilated layers let it look *sixty-one readings* back, and it trains in about two minutes on a laptop.`,
      },
      {
        ch: 'The decision', title: 'Remaining life becomes a clock time',
        target: ['#decide .rule', '#decide'], mood: 'proud',
        say: `A late prediction is far worse than an early one, so the scheduler trusts only *eighty-five percent* of it.
          When that safe life falls below *thirty cycles*, it drafts a work order with a *deadline in clock time*.
          Nothing happens until a person approves it.`,
      },
      {
        ch: 'Design choices', title: 'What we chose against',
        target: ['#decisions .table-wrap', '#decisions'], mood: 'thinking',
        say: `This table is worth reading before any review: each decision, the alternatives, and why.
          Two examples. The model sees the *part's age since service*, not a lifetime counter, so a fresh part never looks old.
          And the agents are *rules, not a language model*, so every decision can be traced and tested.`,
      },
      {
        ch: 'Design choices', title: 'Offline, tested, referenced',
        target: ['#stack', '#references'], mood: 'happy',
        say: `Everything runs *offline on one laptop*, with forty-eight automated tests, and each method is referenced to published work.
          Next, the question that matters: does it actually work?`,
      },
    ],
  },

  results: {
    label: 'Results',
    ask: 'Shall I walk you through the results?',
    next: { label: 'Open the live plant', href: '/?nowelcome' },
    alt: { label: 'Take the 3-minute tour', href: '/?tour=quick' },
    beats: [
      {
        ch: 'Overview', title: 'Measured, not claimed',
        target: ['#kpis', '.hero'], mood: 'happy',
        say: `Every number on this page comes from *one command*, scored on simulated plants the models never saw.
          Where something doesn't win, the page says so. Let's go through it.`,
      },
      {
        ch: 'Remaining life', title: 'How far off is the prediction?',
        target: ['#ch-rul', '#rul'], mood: 'curious',
        say: f => `The remaining-life model is off by *${f.tcnMae} cycles* on average.
          A model that reads a single reading, gradient boosting, manages ${f.gbMae}. Using no sensors at all gives ${f.baseMae}.
          So both the sensors and the history help.`,
        alt: `This chart compares the remaining-life model with two simpler baselines: one that reads a single reading, and one that uses no sensors at all. Lower is better.`,
      },
      {
        ch: 'Remaining life', title: 'Error you can see',
        target: ['#ch-scatter', '#rul'], mood: 'thinking',
        say: f => `Each dot is one prediction against the truth. The band is plus or minus ${f.tcnMae} cycles, the range the app shows next to every prediction.
          About *${f.cover} percent* of predictions fall inside it, and *${f.late} percent are late*. That's why the scheduler keeps a safety margin.`,
        alt: `Each dot is one prediction against the truth; on the diagonal is exact. The band is the error range the app shows next to every prediction.`,
      },
      {
        ch: 'Anomalies', title: 'How early does it notice wear?',
        target: ['#anomaly .grid2c', '#anomaly'], mood: 'curious',
        say: f => `The detector's first alert comes a median of *${f.lead} cycles* before failure. A fixed ISO vibration limit gives ${f.isoLead}.
          The cost is false alarms: about *${f.fa} percent* of healthy readings get flagged. That's why an alert alone never stops a machine; the remaining-life model decides.`,
        alt: `This compares the detector with a fixed ISO vibration limit: how early each first warns, and how many healthy readings it flags by mistake.`,
      },
      {
        ch: 'The decision', title: 'Downtime per shift',
        target: ['#ch-policy', '#policy'], mood: 'proud',
        say: f => `Now the whole loop: same plants, same wear, one shift each.
          Running to failure loses *${f.rtfD} machine-hours*. The copilot loses *${f.copD}*, with no breakdowns, using the real trained model.`,
        alt: `Now the whole loop: the same plants and the same wear, run under each policy for one shift, with the real trained model making the calls.`,
      },
      {
        ch: 'The decision', title: 'The honest comparison',
        target: ['#tb-sweep', '#policy'], mood: 'thinking',
        say: f => `The strongest baseline is a fixed schedule. Tuned on these same plants, servicing at ${f.fixK} percent of average life, it slightly beats the copilot: ${f.fixD} hours against ${f.copD2}.
          {1} But look at the last row. At one hundred percent it collapses to about *${f.cliffB} breakdowns*.
          A real plant can't tune on its own future. The copilot gets there *without tuning*.`,
        cues: { 1: ctx => ctx.spot('#tb-sweep tbody tr:last-child') },
        alt: `The strongest baseline is a fixed schedule, so we sweep its interval and compare the copilot with the best one. Watch the last row: one step too far and machines start to break.`,
      },
      {
        ch: 'The decision', title: 'If repairs take longer',
        target: ['#ch-sens', '#policy'], mood: 'curious',
        say: f => `We assumed a breakdown takes three times a planned service. If it's ${f.sensLoM} times instead, running to failure loses ${f.sensLo} hours; at ${f.sensHiM} times, ${f.sensHi}.
          The copilot stays at about *${f.sensCop}*, because it avoids breakdowns. The conclusion doesn't hinge on the assumption.`,
        alt: `We assumed a breakdown takes three times a planned service. This chart changes that assumption and shows how each policy responds.`,
      },
      {
        ch: 'Real data', title: 'NASA C-MAPSS benchmark',
        target: ['#cmapss .sec-head', '#cmapss'], mood: 'thinking',
        say: f => f.cm
          ? `Finally, real data. The same network was tested on NASA's public *C-MAPSS* turbofan benchmark and compared with published models in this chart.`
          : `Finally, real data. The NASA *C-MAPSS* turbofan benchmark is built in, to test the same network on public data. It takes about forty minutes, so it runs separately with one flag.`,
        alt: `Finally, real data. The NASA *C-MAPSS* turbofan benchmark is built in, to test the same network on public data. It runs separately with one flag.`,
      },
      {
        ch: 'Reproduce', title: 'Check it yourself',
        target: ['#reproduce .cmd', '#reproduce'], mood: 'happy',
        say: `Two commands reproduce everything on this page: the tests, and the evaluation.
          {1} And these are the limits to keep in mind when reading it.
          That's the project. Open the live plant to see it running.`,
        cues: { 1: ctx => ctx.spot('#reproduce .limits') },
      },
    ],
  },

  guide: {
    label: 'Project guide',
    ask: 'Shall I walk you through this guide?',
    next: { label: 'Why this project', href: '/why.html?guide=1' },
    beats: [
      {
        ch: 'Overview', title: 'Three pages, one argument',
        target: ['.hero', 'main'], mood: 'happy',
        say: `This page is a map of the project. Three pages make one argument:
          *why* the problem matters, *how* the copilot works, and whether the *results* hold up.`,
      },
      {
        ch: 'Why', title: 'The problem',
        target: ['#why-section', 'main'], mood: 'worried',
        say: `The Why page starts from the warning window between a detectable fault and a breakdown, and argues that the hard part is turning a reading into a decision someone trusts.`,
      },
      {
        ch: 'How', title: 'The method',
        target: ['#method-section', 'main'], mood: 'thinking',
        say: `The How page walks the loop: a simulated plant, two models, rule-based agents, and a person who approves the fix. It also lists the choices we rejected, and why.`,
      },
      {
        ch: 'Results', title: 'The evidence',
        target: ['#results-section', 'main'], mood: 'proud',
        say: f => `The Results page measures all of it on unseen plants. The headline: ${f.cut} percent less downtime than running to failure, and an honest comparison with a tuned fixed schedule.`,
        alt: `The Results page measures all of it on unseen plants, against simpler baselines, including an honest comparison with a tuned fixed schedule.`,
      },
      {
        ch: 'Overview', title: 'Where to start',
        target: ['main section:last-of-type', 'main'], mood: 'happy',
        say: `This table maps each page to its code and tests. Start with Why, and I'll walk you through each page in turn.`,
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const first = sel => {
  for (const s of [].concat(sel || [])) {
    const el = document.querySelector(s);
    if (el) return el;
  }
  return null;
};
const pageKey = () => {
  const p = location.pathname.toLowerCase();
  return ['why', 'method', 'results', 'guide'].find(k => p.endsWith(`/${k}.html`) || p.endsWith(`/${k}`)) || null;
};

let threeLoading = null;
function ensureThree() {
  if (typeof THREE !== 'undefined') return Promise.resolve(true);
  if (!threeLoading) {
    threeLoading = new Promise(res => {
      const s = document.createElement('script');
      s.src = '/vendor/three.min.js?v=2.9';
      s.onload = () => res(true);
      s.onerror = () => res(false);
      document.head.appendChild(s);
    });
  }
  return threeLoading;
}

const ICON = {
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M8 5.5v13l10.5-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M7.5 5.5h3v13h-3zM13.5 5.5h3v13h-3z"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7L7 17M7 7l10 10"/></svg>',
  voice: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/></svg>',
  mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 108-8 8 8 0 00-6 2.7M4 4v4h4"/></svg>',
};

/* ------------------------------------------------------------------ */
/* Guide                                                               */
/* ------------------------------------------------------------------ */

class PageGuide {
  constructor(key) {
    this.key = key;
    this.page = PAGES[key];
    this.facts = null;
    this.index = 0;
    this.playing = false;
    this.open = false;
    this.done = false;
    this.rates = [1, 1.2, 1.4];
    this.rateIdx = 0;
    this.spotEl = null;
    this.fired = new Set();
    this.raf = 0;

    this.dataReady = fetch('/data/results.json')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { this.facts = facts(d); })
      .catch(() => { this.facts = null; });

    this.buildButton();
    this.buildDom();
    this.narrator = createNarrator({
      onWord: (i, w) => this.onWord(i, w),
      onDone: () => this.onNarrationDone(),
      onSpeakingChange: on => this.mascot && this.mascot.setSpeaking(on),
      onVoiceUnavailable: () => this.syncVoice(),
    });
    try {
      if (localStorage.getItem('titan_guide_voice') === 'off') this.narrator.setVoiceOn(false);
    } catch (e) { /* storage blocked */ }
    this.syncVoice();
    this.wire();

    if (new URLSearchParams(location.search).get('guide') === '1') {
      // Arriving from the previous page's "Continue". Browsers only allow
      // speech after a click on this page, so wait for one press of Start.
      this.dataReady.then(() => this.show({ ready: true }));
    }
  }

  /* ---------- DOM ---------- */

  buildButton() {
    let btn = document.getElementById('btn-page-guide');
    const actions = document.querySelector('.bar .actions');
    if (!btn && actions) {
      btn = document.createElement('button');
      btn.id = 'btn-page-guide';
      actions.insertBefore(btn, actions.firstChild);
    }
    if (!btn) return;
    btn.className = 'btn btn-guide';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Walk me through this page with Rivet');
    btn.innerHTML = '<i class="pg-orb-dot" aria-hidden="true"></i><span>Walk me through</span>';
    this.btn = btn;
  }

  buildDom() {
    const n = this.page.beats.length;
    const root = document.createElement('div');
    root.className = 'pg';
    root.hidden = true;
    root.innerHTML = `
      <div class="pg-spot" aria-hidden="true"></div>
      <section class="pg-card" role="dialog" aria-modal="false" aria-labelledby="pg-title">
        <div class="pg-orb"><canvas aria-hidden="true"></canvas><i class="pg-orb-fallback"></i></div>
        <div class="pg-head">
          <h3 class="pg-title" id="pg-title"></h3>
          <div class="pg-eyebrow"><span class="pg-ch"></span><span class="pg-count"></span></div>
          <button class="pg-icon pg-close" type="button" aria-label="Close the guide (Esc)" title="Close (Esc)">${ICON.close}</button>
        </div>
        <p class="pg-text" aria-live="polite"></p>
        <div class="pg-end" hidden></div>
        <div class="pg-ctrl">
          <button class="pg-icon pg-prev" type="button" aria-label="Previous step (←)" title="Previous (←)">${ICON.prev}</button>
          <button class="pg-play" type="button" aria-label="Pause (Space)" title="Play / pause (Space)">${ICON.pause}</button>
          <button class="pg-icon pg-next" type="button" aria-label="Next step (→)" title="Next (→)">${ICON.next}</button>
          <nav class="pg-rail" aria-label="Steps">
            ${this.page.beats.map((b, i) => `<button type="button" data-i="${i}" title="${b.title.replace(/"/g, '&quot;')}" aria-label="Step ${i + 1} of ${n}: ${b.title.replace(/"/g, '&quot;')}"><i></i></button>`).join('')}
          </nav>
          <span class="pg-keys" aria-hidden="true"><kbd>Space</kbd> <kbd>←</kbd><kbd>→</kbd></span>
          <button class="pg-icon pg-voice" type="button"></button>
          <button class="pg-rate" type="button" aria-label="Narration speed" title="Speed">1×</button>
        </div>
      </section>`;
    document.body.appendChild(root);
    this.root = root;
    const q = s => root.querySelector(s);
    this.el = {
      spot: q('.pg-spot'), card: q('.pg-card'), canvas: q('.pg-orb canvas'), orb: q('.pg-orb'),
      ch: q('.pg-ch'), count: q('.pg-count'), title: q('.pg-title'), text: q('.pg-text'),
      end: q('.pg-end'), rail: q('.pg-rail'), play: q('.pg-play'), prev: q('.pg-prev'),
      next: q('.pg-next'), voice: q('.pg-voice'), rate: q('.pg-rate'), close: q('.pg-close'),
      ctrl: q('.pg-ctrl'),
    };
  }

  wire() {
    this.btn && this.btn.addEventListener('click', () => (this.open ? this.close() : this.show()));
    this.el.close.addEventListener('click', () => this.close());
    this.el.play.addEventListener('click', () => {
      if (this.done) { this.goTo(0); return; }
      if (this.ready) { this.ready = false; this.goTo(this.index); return; }
      this.setPlaying(!this.playing);
    });
    this.el.prev.addEventListener('click', () => this.goTo(this.index - (this.done ? 0 : 1)));
    this.el.next.addEventListener('click', () => this.step(1));
    this.el.rail.addEventListener('click', e => {
      const b = e.target.closest('button[data-i]');
      if (b) this.goTo(Number(b.dataset.i));
    });
    this.el.voice.addEventListener('click', () => this.toggleVoice());
    this.el.rate.addEventListener('click', () => {
      this.rateIdx = (this.rateIdx + 1) % this.rates.length;
      const r = this.rates[this.rateIdx];
      this.narrator.setRate(r);
      this.el.rate.textContent = `${r}×`;
    });
    window.addEventListener('keydown', e => {
      if (!this.open) return;
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') this.close();
      else if (e.key === ' ' && !(e.target && e.target.closest && e.target.closest('button, a'))) { e.preventDefault(); this.el.play.click(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.goTo(this.index - (this.done ? 0 : 1)); }
      else if (e.key === 'v' || e.key === 'V') this.toggleVoice();
    });
    window.addEventListener('resize', () => this.mascot && this.mascot.resize());
    document.addEventListener('visibilitychange', () => {
      if (!this.mascot || !this.open) return;
      if (document.hidden) this.mascot.stop(); else this.mascot.start();
    });
  }

  /* ---------- open / close ---------- */

  async show({ ready = false } = {}) {
    this.open = true;
    this.root.hidden = false;
    document.documentElement.classList.add('pg-on');
    requestAnimationFrame(() => this.root.classList.add('in'));
    if (this.btn) {
      this.btn.classList.add('is-on');
      this.btn.querySelector('span').textContent = 'End guide';
    }
    this.loop();
    this.initMascot();
    await this.dataReady;
    if (ready) this.showReady();
    else this.goTo(0);
  }

  close() {
    this.open = false;
    this.ready = false;
    clearTimeout(this.advanceTimer);
    this.narrator.stop();
    this.playing = false;
    this.root.classList.remove('in');
    document.documentElement.classList.remove('pg-on');
    cancelAnimationFrame(this.raf);
    if (this.mascot) this.mascot.stop();
    setTimeout(() => { if (!this.open) this.root.hidden = true; }, 260);
    if (this.btn) {
      this.btn.classList.remove('is-on');
      this.btn.querySelector('span').textContent = 'Walk me through';
      this.btn.focus({ preventScroll: true });
    }
  }

  async initMascot() {
    if (this.mascotTried) { if (this.mascot) { this.mascot.resize(); this.mascot.start(); } return; }
    this.mascotTried = true;
    const ok = await ensureThree();
    this.mascot = ok ? createMascot(this.el.canvas) : null;
    if (!this.mascot) { this.el.orb.classList.add('no-webgl'); return; }
    this.mascot.resize();
    if (this.open) this.mascot.start();
    this.mascot.gesture('wave');
    const beat = this.page.beats[this.index];
    this.mascot.setMood(beat ? beat.mood || 'happy' : 'happy');
  }

  showReady() {
    this.ready = true;
    this.done = false;
    this.index = 0;
    const words = this.page.beats.reduce((a, b) => a + this.sayFor(b).split(/\s+/).length, 0);
    const mins = Math.max(1, Math.round(words / 150));
    this.el.ch.textContent = this.page.label;
    this.el.count.textContent = `${this.page.beats.length} steps · ${mins} min`;
    this.el.title.textContent = this.page.ask;
    this.el.text.textContent = 'Press play and I\'ll read it with you, highlighting each part as we go. You can pause or skip at any time.';
    this.el.text.hidden = false;
    this.el.end.hidden = true;
    this.setPlayIcon(false, 'Start');
    this.el.play.classList.add('pulse');
    this.paintRail(-1);
    this.setSpot(null);
    this.el.play.focus({ preventScroll: true });
  }

  /* ---------- stepping ---------- */

  sayFor(beat) {
    if (typeof beat.say === 'function') return this.facts ? beat.say(this.facts) : (beat.alt || '');
    return beat.say;
  }

  step(dir) {
    if (this.done) return;
    if (this.index + dir >= this.page.beats.length) { this.finish(); return; }
    this.goTo(this.index + dir);
  }

  goTo(i) {
    const n = this.page.beats.length;
    i = Math.max(0, Math.min(n - 1, i));
    clearTimeout(this.advanceTimer);
    this.narrator.stop();
    this.ready = false;
    this.done = false;
    this.index = i;
    this.fired = new Set();
    const beat = this.page.beats[i];

    this.el.play.classList.remove('pulse');
    this.el.end.hidden = true;
    this.el.text.hidden = false;
    this.el.ch.textContent = beat.ch;
    this.el.count.textContent = `${i + 1} of ${n}`;
    this.el.title.textContent = beat.title;
    this.el.prev.disabled = i === 0;
    this.el.next.disabled = false;
    this.paintRail(i, 0);

    if (this.mascot) this.mascot.setMood(beat.mood || 'happy');

    this.target = first(beat.target);
    this.scrollTo(this.target);
    this.setSpot(this.target);
    if (typeof beat.enter === 'function') { try { beat.enter(this.ctx()); } catch (e) { console.warn(e); } }

    this.parsed = parseScript(this.sayFor(beat));
    this.renderText(this.parsed);
    this.narrator.load(this.parsed);
    this.setPlaying(true, true);
  }

  finish() {
    clearTimeout(this.advanceTimer);
    this.narrator.stop();
    this.playing = false;
    this.done = true;
    const p = this.page;
    this.el.ch.textContent = p.label;
    this.el.count.textContent = 'Done';
    this.el.title.textContent = p.next.href.includes('?guide=1') ? `Up next: ${p.next.label}` : 'That\'s the whole story';
    this.el.text.hidden = true;
    this.el.end.hidden = false;
    this.el.end.innerHTML = `
      <a class="pg-go" href="${p.next.href}">${p.next.label}<span aria-hidden="true">→</span></a>
      ${p.alt ? `<a class="pg-alt" href="${p.alt.href}">${p.alt.label}</a>` : ''}
      <button class="pg-alt pg-replay" type="button">${ICON.replay}Replay</button>`;
    this.el.end.querySelector('.pg-replay').addEventListener('click', () => this.goTo(0));
    this.setPlayIcon(false, 'Replay');
    this.el.next.disabled = true;
    this.paintRail(p.beats.length);
    this.setSpot(null);
    if (this.mascot) { this.mascot.setMood('proud'); this.mascot.celebrate(); }
    this.el.end.querySelector('.pg-go').focus({ preventScroll: true });
  }

  ctx() {
    return {
      spot: sel => {
        const el = first(sel);
        if (!el) return;
        this.target = el;
        this.scrollTo(el, true);
        this.setSpot(el);
      },
    };
  }

  /* ---------- narration ---------- */

  setPlayIcon(playing, label) {
    this.el.play.innerHTML = playing ? ICON.pause : ICON.play;
    this.el.play.setAttribute('aria-label', label || (playing ? 'Pause (Space)' : 'Play (Space)'));
    this.el.play.classList.toggle('is-paused', !playing);
  }

  setPlaying(on, fromStart = false) {
    this.playing = on;
    this.setPlayIcon(on);
    clearTimeout(this.advanceTimer);
    if (on) this.narrator.play(fromStart ? 0 : undefined);
    else this.narrator.pause();
  }

  renderText(parsed) {
    const el = this.el.text;
    el.textContent = '';
    parsed.words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w' + (w.kw ? ' kw' : '');
      s.textContent = w.text;
      s.dataset.i = i;
      el.appendChild(s);
      el.appendChild(document.createTextNode(' '));
    });
    el.scrollTop = 0;
  }

  onWord(i, word) {
    const spans = this.el.text.children;
    for (let k = 0; k < spans.length; k++) {
      spans[k].classList.toggle('said', k < i);
      spans[k].classList.toggle('now', k === i);
    }
    const cur = spans[i];
    if (cur) {
      const el = this.el.text;
      // Keep the spoken line as the last visible line, scrolling by whole lines.
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 24;
      const lines = Math.max(1, Math.round(el.clientHeight / lh));
      if (cur.offsetTop + lh > el.scrollTop + el.clientHeight + 2) {
        el.scrollTo({ top: Math.round(cur.offsetTop / lh - (lines - 1)) * lh, behavior: reduceMotion() ? 'auto' : 'smooth' });
      }
    }
    if (this.parsed) this.paintRail(this.index, (i + 1) / this.parsed.words.length);
    if (this.mascot && word) {
      const vowels = (word.text.match(/[aeiouy]/gi) || []).length;
      this.mascot.pulse(0.45 + Math.min(0.55, vowels * 0.14));
    }
    this.fireCues(i);
  }

  fireCues(upTo) {
    const beat = this.page.beats[this.index];
    if (!beat.cues || !this.parsed) return;
    for (const c of this.parsed.cues) {
      if (c.word <= upTo && !this.fired.has(c.cue)) {
        this.fired.add(c.cue);
        const fn = beat.cues[c.cue];
        if (fn) { try { fn(this.ctx()); } catch (e) { console.warn(e); } }
      }
    }
  }

  onNarrationDone() {
    [...this.el.text.children].forEach(s => { s.classList.add('said'); s.classList.remove('now'); });
    this.fireCues(Infinity);
    this.paintRail(this.index, 1);
    if (!this.playing) return;
    this.advanceTimer = setTimeout(() => { if (this.playing && this.open) this.step(1); }, 1400);
  }

  toggleVoice() {
    const on = !this.narrator.isVoiceOn();
    this.narrator.setVoiceOn(on);
    try { localStorage.setItem('titan_guide_voice', on ? 'on' : 'off'); } catch (e) { /* ignore */ }
    this.syncVoice();
  }

  syncVoice() {
    const on = this.narrator.isVoiceOn();
    this.el.voice.innerHTML = on ? ICON.voice : ICON.mute;
    this.el.voice.setAttribute('aria-label', on ? 'Mute voice (V)' : 'Turn voice on (V)');
    this.el.voice.title = on ? 'Voice on (V)' : 'Subtitles only (V)';
    this.el.voice.classList.toggle('is-off', !on);
  }

  paintRail(active, progress = 0) {
    [...this.el.rail.children].forEach((b, k) => {
      b.classList.toggle('done', k < active);
      b.classList.toggle('on', k === active);
      b.querySelector('i').style.transform = `scaleX(${k < active ? 1 : k === active ? progress : 0})`;
      if (k === active) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }

  /* ---------- spotlight ---------- */

  topInset() {
    const bar = document.querySelector('.bar');
    return (bar ? bar.getBoundingClientRect().bottom : 0) + 18;
  }

  bottomInset() {
    // The card is a caption bar along the bottom: frame targets in the space above it.
    return this.el.card.getBoundingClientRect().height + 36;
  }

  scrollTo(el, gentle = false) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = this.topInset();
    const bottom = window.innerHeight - this.bottomInset();
    const room = bottom - top;
    if (gentle && r.top >= top - 4 && r.bottom <= bottom + 4) return;   // already in view
    const y = r.height <= room
      ? window.scrollY + r.top - top - (room - r.height) / 2
      : window.scrollY + r.top - top;
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion() ? 'auto' : 'smooth' });
  }

  setSpot(el) {
    if (el === this.spotEl) return;
    this.spotEl = el;
    // Glide between targets; track the page 1:1 otherwise, so scrolling never lags.
    const s = this.el.spot;
    s.classList.add('glide');
    clearTimeout(this.glideTimer);
    this.glideTimer = setTimeout(() => s.classList.remove('glide'), 900);
  }

  loop() {
    cancelAnimationFrame(this.raf);
    const tick = () => {
      if (!this.open) return;
      this.paintSpot();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  paintSpot() {
    const s = this.el.spot;
    const el = this.spotEl;
    if (!el) { s.classList.remove('on'); if (this.mascot) this.mascot.lookAtScreen(null, null); return; }
    const r = el.getBoundingClientRect();
    const pad = 10;
    const top = Math.max(this.topInset() - 8, r.top - pad);
    const bottom = Math.min(this.el.card.getBoundingClientRect().top - 12, r.bottom + pad);
    const visible = bottom - top > 40 && r.right > 0 && r.left < window.innerWidth;
    s.classList.toggle('on', visible);
    if (!visible) return;
    const left = Math.max(8, r.left - pad);
    const right = Math.min(window.innerWidth - 8, r.right + pad);
    s.style.transform = `translate(${left}px, ${top}px)`;
    s.style.width = `${right - left}px`;
    s.style.height = `${bottom - top}px`;
    if (this.mascot) this.mascot.lookAtScreen((left + right) / 2, (top + bottom) / 2);
  }
}

/* ------------------------------------------------------------------ */

function boot() {
  const key = pageKey();
  if (key && PAGES[key]) window.__pageGuide = new PageGuide(key);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
