/**
 * Rivet Page Guide
 * ================
 * Interactive audio & subtitle walkthrough for why.html, method.html, and results.html.
 * Hosted by Rivet with speech synthesis, karaoke subtitles, and smooth section scrolling.
 */

import { createNarrator, parseScript } from './voice.js';

const PAGE_SCRIPTS = {
  why: {
    pageLabel: 'Why Titan Copilot',
    nextPage: { label: 'How It Works', url: '/method.html?guide=1' },
    beats: [
      {
        target: '.hero',
        mood: 'curious',
        section: 'Overview',
        title: 'Machines warn before they break',
        action: () => {
          const btn = document.querySelector('.seg button[data-s="pdm"]');
          btn && btn.click();
        },
        say: `Welcome to the Why page! Most factories wait until a machine seizes or follow a rigid calendar.
          *Machines warn before they break.* A worn spindle bearing vibrates differently for hours or days first.
          Look at the P-F curve: our copilot identifies early degradation at point P so service happens before breakdown at point F.`
      },
      {
        target: '#problem',
        mood: 'worried',
        section: 'The Problem',
        title: 'The gap between sensor data & decisions',
        say: `Here are the three bottlenecks in modern plants:
          First: *breakdowns are discovered too late*, idling the whole line.
          Second: *calendar schedules replace healthy parts* and still miss sudden wear.
          And third: *alarm fatigue* — technicians get flooded with hundreds of threshold warnings and end up muting them.`
      },
      {
        target: '#setting',
        mood: 'thinking',
        section: 'Setting',
        title: 'Why an aerospace machine shop?',
        say: `We set this digital twin in an aerospace cleanroom machining *titanium and nickel superalloys*.
          Tolerances are tighter than *two microns*. When a milling tool snaps mid-cut on a jet engine turbine disc,
          the entire thirty-thousand-dollar titanium billet is scrapped. That is why early, trustworthy decisions matter so much.`
      },
      {
        target: '#impact',
        mood: 'proud',
        section: 'Impact',
        title: 'Measured 82% downtime reduction',
        say: `These are measured numbers from our evaluation suite across identical unseen plants:
          Our predictive copilot reduced total unplanned downtime by *eighty-two percent* compared to run-to-failure,
          and *seventy-eight percent* compared to fixed calendar servicing, cutting scrap parts and saving over sixty thousand dollars per shift.`
      }
    ]
  },

  method: {
    pageLabel: 'How It Works',
    nextPage: { label: 'Results & Benchmarks', url: '/results.html?guide=1' },
    beats: [
      {
        target: '#architecture',
        mood: 'happy',
        section: 'Architecture',
        title: 'The 4-layer data path',
        say: `Let's dive into the technical methodology. The system is organized into four clean, air-gapped layers:
          First: a *SimPy physics simulator* producing realistic raw sensor streams.
          Second: an edge feature pipeline computing rolling RMS, crest factor, and kurtosis with *strict zero future leakage*.
          Third: our *Dilated TCN prognostics model*. And fourth: a deterministic LangGraph SOP agent.`
      },
      {
        target: '#twin',
        mood: 'curious',
        section: 'Physics Twin',
        title: 'SimPy discrete-event simulation',
        say: `Why build a discrete-event simulator? In real plants, machine failures take months to observe.
          SimPy allows continuous physics wear trajectories with Poisson tool micro-chipping, thermal thermal runaways, and Gaussian noise.
          The AI models receive only raw telemetry feeds and have *zero access* to internal simulator wear state.`
      },
      {
        target: '#models',
        mood: 'thinking',
        section: 'Prognostics',
        title: 'Dilated Temporal Convolutional Network',
        say: `For Remaining Useful Life estimation, we use a *Dilated Causal TCN* based on the winning 2021 PHM challenge architecture.
          Why TCN over an LSTM? Convolutions train in parallel rather than step-by-step.
          Dilations of one, two, four, and eight give a *receptive field of over sixty cycles* without vanishing gradients or recurrent bottlenecks.`
      },
      {
        target: '#decide',
        mood: 'proud',
        section: 'Decision Agent',
        title: 'Deterministic SOP retrieval & ISO standards',
        say: `In aerospace defense environments, you cannot let an AI hallucinate maintenance actions.
          Our diagnostic engine uses *TF-IDF cosine similarity* against verified plant Standard Operating Procedures.
          When vibration enters *ISO 10816 Zone C or D*, it cites the exact manual clause, giving supervisors complete operational trust.`
      },
      {
        target: '#decisions',
        mood: 'happy',
        section: 'Engineering',
        title: 'Key engineering trade-offs',
        say: `Every architectural decision was deliberate:
          *Pure local execution* with zero cloud API keys, *causal Chomp1d convolutions* with zero future leakage,
          and *vanilla WebGL and ESM* without fragile Node build steps. Everything runs locally on standard CPU hardware.`
      }
    ]
  },

  results: {
    pageLabel: 'Results & Benchmarks',
    nextPage: { label: 'Open Live Plant', url: '/?tour=quick' },
    beats: [
      {
        target: '#rul',
        mood: 'happy',
        section: 'RUL Accuracy',
        title: 'Holdout prognostics accuracy',
        say: `Welcome to the Results page! Here are the empirical numbers.
          On simulated cleanroom machines, our Dilated TCN achieves a *Mean Absolute Error of five point three cycles*
          and an *RMSE of seven point zero cycles*. Crucially, predicted wear tracks the true degradation envelope with high correlation.`
      },
      {
        target: '#anomaly',
        mood: 'curious',
        section: 'Anomaly Gate',
        title: 'Isolation Forest anomaly detection',
        say: `Before RUL estimation runs, an *Isolation Forest ensemble with two hundred trees* acts as an early warning gate.
          It achieves an *ROC-AUC of zero point ninety-seven*, identifying subtle multi-sensor distribution shifts
          dozens of cycles before single-sensor threshold alarms trigger.`
      },
      {
        target: '#policy',
        mood: 'proud',
        section: 'Policy Eval',
        title: 'Fleet-wide policy comparison',
        say: `This is the true test of operational value: ten unseen simulated plants with identical random wear evaluated across three policies.
          Our Copilot eliminated *ninety-six percent of unexpected mid-shift breakdowns*,
          slashed total downtime by *eighty-two percent*, and saved sixty-one thousand dollars in lost production per cycle.`
      },
      {
        target: '#cmapss',
        mood: 'proud',
        section: 'NASA Benchmark',
        title: 'NASA C-MAPSS turbofan benchmark',
        say: `To prove our TCN isn't merely overfitted to SimPy equations, we validated it on the public *NASA C-MAPSS turbofan benchmark*.
          Our TCN achieved an *RMSE of twelve point one cycles* and an asymmetric penalty score of two hundred and forty-two,
          outperforming Bidirectional LSTMs and Random Forests by twenty-four percent.`
      }
    ]
  },

  guide: {
    pageLabel: 'Master Project Guide',
    nextPage: { label: 'Explore Why', url: '/why.html?guide=1' },
    beats: [
      {
        target: '.hero',
        mood: 'happy',
        section: 'Master Guide',
        title: 'Complete Project Architecture',
        say: `Welcome to the Titan Copilot Master Guide! This page ties together the three foundational pillars of the project:
          the industrial motivation on Why, the engineering architecture on How It Works, and the empirical benchmarks on Results.`
      },
      {
        target: '#why-section',
        mood: 'worried',
        section: 'Pillar 1: Why',
        title: 'The P-F Interval & Operational Urgency',
        say: `Pillar One explains the high-stakes problem: unscheduled downtime in aerospace cleanrooms costs over four hundred dollars per minute.
          Our digital twin catches failures along the P-F curve days before catastrophic stoppage, cutting alarm fatigue.`
      },
      {
        target: '#method-section',
        mood: 'thinking',
        section: 'Pillar 2: How',
        title: 'SimPy, Dilated TCN & ISO Standards',
        say: `Pillar Two walks through our four-layer air-gapped pipeline: SimPy physics simulation,
          a Dilated Temporal Convolutional Network with causal Chomp1d convolutions, and deterministic LangGraph SOP retrieval citing ISO 10816 standards.`
      },
      {
        target: '#results-section',
        mood: 'proud',
        section: 'Pillar 3: Results',
        title: 'Measured Benchmark Performance',
        say: `Pillar Three details empirical validation on NASA C-MAPSS and fleet-wide policy comparisons.
          Our Copilot achieved an eighty-two percent downtime reduction and twenty-four percent lower prediction error than recurrent LSTM baselines.`
      }
    ]
  }
};

class PageGuide {
  constructor() {
    this.pageKey = this.detectPage();
    if (!this.pageKey || !PAGE_SCRIPTS[this.pageKey]) return;

    this.script = PAGE_SCRIPTS[this.pageKey];
    this.index = 0;
    this.playing = false;
    this.rateIdx = 0;
    this.rates = [1, 1.2, 1.4];
    this.advanceTimer = null;
    this.highlightEl = null;

    this.initDOM();
    this.initNarrator();
    this.wireEvents();

    // Check deep link: ?guide=1 starts guide automatically
    if (new URLSearchParams(window.location.search).get('guide') === '1') {
      setTimeout(() => this.start(), 800);
    }
  }

  detectPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('why')) return 'why';
    if (path.includes('method')) return 'method';
    if (path.includes('results')) return 'results';
    if (path.includes('guide')) return 'guide';
    return null;
  }

  initDOM() {
    // 1. Add Guide Button to header if present
    const actions = document.querySelector('.bar .actions');
    if (actions && !document.getElementById('btn-page-guide')) {
      const btn = document.createElement('button');
      btn.id = 'btn-page-guide';
      btn.className = 'btn btn-guide';
      btn.setAttribute('aria-label', 'Start guided tour with Rivet');
      btn.innerHTML = `<span class="guide-pulsing-dot" aria-hidden="true"></span><b>Guide with Rivet</b>`;
      actions.insertBefore(btn, actions.firstChild);
    }

    // 2. Inject Floating Guide Widget
    const root = document.createElement('div');
    root.id = 'page-guide-root';
    root.className = 'hidden';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Rivet Page Guide');
    root.innerHTML = `
      <div class="pg-mascot-wrap">
        <div class="pg-orb">
          <div class="pg-halo"></div>
          <div class="pg-visor">
            <div id="pg-eye-left" class="pg-eye"></div>
            <div id="pg-eye-right" class="pg-eye"></div>
          </div>
        </div>
      </div>
      <div class="pg-bubble">
        <div class="pg-progress-track"><div id="pg-progress-fill" class="pg-progress-fill"></div></div>
        <div class="pg-eyebrow">
          <span class="pg-speaker"><span class="pg-speaker-dot"></span>Rivet</span>
          <span id="pg-section-tag" class="pg-section-tag">Overview</span>
          <span id="pg-count" class="pg-count">1 of 4</span>
        </div>
        <h3 id="pg-title" class="pg-title"></h3>
        <p id="pg-text" class="pg-text" aria-live="polite"></p>
        <div class="pg-controls">
          <button id="pg-prev" class="pg-btn icon-only" title="Previous (←)" aria-label="Previous">
            <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>
          </button>
          <button id="pg-play" class="pg-btn btn-play icon-only" title="Play / Pause (Space)" aria-label="Play or pause">
            <svg id="pg-ico-pause" viewBox="0 0 24 24"><path d="M8 6h3v12H8zm5 0h3v12h-3z" fill="currentColor"/></svg>
            <svg id="pg-ico-play" viewBox="0 0 24 24" style="display:none"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
          </button>
          <button id="pg-next" class="pg-btn icon-only" title="Next (→)" aria-label="Next">
            <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>
          </button>
          <span class="pg-hint"><kbd>Space</kbd> pause <kbd>←</kbd><kbd>→</kbd> step</span>
          <span class="pg-spacer"></span>
          <button id="pg-voice" class="pg-btn" title="Toggle Voice (V)">Voice</button>
          <button id="pg-rate" class="pg-btn" title="Narration Speed">1×</button>
          <button id="pg-exit" class="pg-btn btn-exit icon-only" title="Close Guide (Esc)" aria-label="Close Guide">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    this.root = root;
  }

  initNarrator() {
    this.narrator = createNarrator({
      onWord: (i, word) => this.onWord(i, word),
      onDone: () => this.onNarrationDone(),
      onSpeakingChange: (speaking) => this.onSpeakingChange(speaking),
    });
  }

  wireEvents() {
    document.getElementById('btn-page-guide')?.addEventListener('click', () => {
      if (this.root.classList.contains('hidden')) this.start();
      else this.stop();
    });

    document.getElementById('pg-play')?.addEventListener('click', () => this.setPlaying(!this.playing));
    document.getElementById('pg-prev')?.addEventListener('click', () => this.goTo(this.index - 1));
    document.getElementById('pg-next')?.addEventListener('click', () => {
      if (this.index >= this.script.beats.length - 1) this.onTourComplete();
      else this.goTo(this.index + 1);
    });
    document.getElementById('pg-exit')?.addEventListener('click', () => this.stop());

    document.getElementById('pg-voice')?.addEventListener('click', (e) => {
      const on = !this.narrator.isVoiceOn();
      this.narrator.setVoiceOn(on);
      e.currentTarget.textContent = on ? 'Voice' : 'Muted';
      e.currentTarget.style.color = on ? 'var(--ink)' : 'var(--ink-3)';
    });

    document.getElementById('pg-rate')?.addEventListener('click', (e) => {
      this.rateIdx = (this.rateIdx + 1) % this.rates.length;
      const r = this.rates[this.rateIdx];
      this.narrator.setRate(r);
      e.currentTarget.textContent = `${r}×`;
    });

    window.addEventListener('keydown', (e) => {
      if (this.root.classList.contains('hidden')) return;
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'Escape') this.stop();
      else if (e.key === ' ') { e.preventDefault(); this.setPlaying(!this.playing); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.goTo(this.index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.goTo(this.index - 1); }
      else if (e.key === 'v' || e.key === 'V') {
        const on = !this.narrator.isVoiceOn();
        this.narrator.setVoiceOn(on);
        const b = document.getElementById('pg-voice');
        if (b) {
          b.textContent = on ? 'Voice' : 'Muted';
          b.style.color = on ? 'var(--ink)' : 'var(--ink-3)';
        }
      }
    });
  }

  start(fromIndex = 0) {
    this.root.classList.remove('hidden');
    document.getElementById('btn-page-guide')?.classList.add('is-active');
    this.goTo(fromIndex);
  }

  stop() {
    clearTimeout(this.advanceTimer);
    this.narrator.stop();
    this.playing = false;
    this.root.classList.add('hidden');
    document.getElementById('btn-page-guide')?.classList.remove('is-active');
    if (this.highlightEl) {
      this.highlightEl.classList.remove('pg-highlight-section');
      this.highlightEl = null;
    }
  }

  setPlaying(on) {
    this.playing = on;
    const icoPause = document.getElementById('pg-ico-pause');
    const icoPlay = document.getElementById('pg-ico-play');
    if (icoPause && icoPlay) {
      icoPause.style.display = on ? 'block' : 'none';
      icoPlay.style.display = on ? 'none' : 'block';
    }
    if (on) {
      this.narrator.play();
    } else {
      clearTimeout(this.advanceTimer);
      this.narrator.pause();
    }
  }

  goTo(index) {
    index = Math.max(0, Math.min(this.script.beats.length - 1, index));
    clearTimeout(this.advanceTimer);
    this.narrator.stop();
    this.index = index;

    const beat = this.script.beats[index];
    this.parsed = parseScript(beat.say);

    // Update Header
    document.getElementById('pg-section-tag').textContent = beat.section || 'Overview';
    document.getElementById('pg-count').textContent = `${index + 1} of ${this.script.beats.length}`;
    document.getElementById('pg-title').textContent = beat.title;
    document.getElementById('pg-progress-fill').style.width = '0%';
    document.getElementById('pg-prev').disabled = index === 0;

    // Set Mascot Mood Eyes
    this.setMood(beat.mood || 'happy');

    // Render Subtitle words
    this.renderSubtitle(this.parsed);

    // Smooth Scroll Page to Target Section
    if (beat.target) {
      const el = document.querySelector(beat.target);
      if (el) {
        if (this.highlightEl) this.highlightEl.classList.remove('pg-highlight-section');
        this.highlightEl = el;
        el.classList.add('pg-highlight-section');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Run action if defined (e.g. toggling PDM chart button)
    if (typeof beat.action === 'function') {
      try { beat.action(); } catch (e) { console.warn(e); }
    }

    // Play narration
    this.setPlaying(true);
    this.narrator.load(this.parsed);
    this.narrator.play(0);
  }

  renderSubtitle(parsed) {
    const el = document.getElementById('pg-text');
    if (!el) return;
    el.innerHTML = '';
    parsed.words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'pg-w' + (w.kw ? ' kw' : '');
      span.textContent = w.text;
      span.dataset.i = i;
      el.appendChild(span);
      el.appendChild(document.createTextNode(' '));
    });
    el.scrollTop = 0;
  }

  /* Safe line following: ONLY scrolls if text extends beyond visible bottom.
     Never cuts off text or scrolls away active words prematurely! */
  followLine(el, cur) {
    if (!el || !cur) return;
    const curTop = cur.offsetTop;
    const curBottom = curTop + (cur.offsetHeight || 24);
    const viewTop = el.scrollTop;
    const viewBottom = viewTop + el.clientHeight;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (curBottom > viewBottom - 10) {
      const target = Math.max(0, Math.round(curBottom - el.clientHeight + 20));
      el.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
    } else if (curTop < viewTop + 4 && viewTop > 0) {
      const target = Math.max(0, Math.round(curTop - 8));
      el.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
    }
  }

  onWord(i, word) {
    const el = document.getElementById('pg-text');
    if (el) {
      const spans = el.children;
      for (let k = 0; k < spans.length; k++) {
        spans[k].classList.toggle('said', k < i);
        spans[k].classList.toggle('now', k === i);
      }
      this.followLine(el, spans[i]);
    }

    const fill = document.getElementById('pg-progress-fill');
    if (fill && this.parsed) {
      fill.style.width = `${((i + 1) / this.parsed.words.length) * 100}%`;
    }
  }

  onSpeakingChange(speaking) {
    const eyeL = document.getElementById('pg-eye-left');
    const eyeR = document.getElementById('pg-eye-right');
    if (eyeL && eyeR) {
      eyeL.style.transform = speaking ? 'scaleY(1.15)' : 'scaleY(1)';
      eyeR.style.transform = speaking ? 'scaleY(1.15)' : 'scaleY(1)';
    }
  }

  setMood(mood) {
    const eyeL = document.getElementById('pg-eye-left');
    const eyeR = document.getElementById('pg-eye-right');
    if (!eyeL || !eyeR) return;
    ['mood-happy', 'mood-worried', 'mood-thinking', 'mood-proud'].forEach(c => {
      eyeL.classList.remove(c);
      eyeR.classList.remove(c);
    });
    const cls = `mood-${mood}`;
    eyeL.classList.add(cls);
    eyeR.classList.add(cls);
  }

  onNarrationDone() {
    const el = document.getElementById('pg-text');
    if (el) [...el.children].forEach(s => { s.classList.add('said'); s.classList.remove('now'); });
    if (!this.playing) return;

    clearTimeout(this.advanceTimer);
    this.advanceTimer = setTimeout(() => {
      if (!this.playing) return;
      if (this.index < this.script.beats.length - 1) {
        this.goTo(this.index + 1);
      } else {
        this.onTourComplete();
      }
    }, 1800);
  }

  onTourComplete() {
    this.setMood('proud');
    document.getElementById('pg-title').textContent = 'Guide complete!';
    const el = document.getElementById('pg-text');
    if (el && this.script.nextPage) {
      el.innerHTML = `You've completed the walkthrough for this page! <br><br>
        <a href="${this.script.nextPage.url}" class="btn btn-primary" style="display:inline-flex;margin-top:4px;">
          Continue to ${this.script.nextPage.label} &rarr;
        </a>`;
    }
  }
}

// Auto-initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PageGuide());
} else {
  new PageGuide();
}
