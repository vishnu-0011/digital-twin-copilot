/**
 * Narrator — speech synthesis with word-level timing
 * ===================================================
 * Speaks a beat sentence-by-sentence (Chrome silently drops long single
 * utterances) and reports which word is currently being said. That word index
 * drives three things in the tour: the subtitle reveal, the mascot's mouth,
 * and the diagram cue markers embedded in the script.
 *
 * Word timing uses `onboundary` events when the voice provides them and
 * falls back to a rate-based estimate when it doesn't (many network voices
 * never fire boundaries). With voice off, the same timer runs silently, so
 * the tour paces identically with or without sound.
 */

const BASE_WPM = 160;
const STORE_KEY = 'tour.voice';

/* Voices ranked by how human they sound. Neural/"Natural" voices (Edge,
   Windows) and Apple's downloadable Premium/Enhanced voices are far ahead
   of the compact defaults; macOS novelty voices are never chosen. */
const NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Eddy|Flo|Fred|Good News|Grandma|Grandpa|Jester|Junior|Kathy|Organ|Princess|Ralph|Reed|Rocko|Sandy|Shelley|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;
const HUMAN_NAMES = /\b(Samantha|Ava|Zoe|Allison|Susan|Evan|Nathan|Joelle|Noelle|Tom|Serena|Kate|Oliver|Jamie|Matilda|Lee|Aria|Jenny|Guy|Libby|Sonia|Ryan|Emma|Brian|Andrew)\b/i;

function voiceScore(v) {
  if (!/^en(-|_|$)/i.test(v.lang) || NOVELTY.test(v.name)) return -1;
  let s = 10;
  if (/Natural|Neural/i.test(v.name)) s = 100;
  else if (/Premium/i.test(v.name)) s = 92;
  else if (/Enhanced/i.test(v.name)) s = 84;
  else if (/Siri/i.test(v.name)) s = 78;
  else if (/Google US English/i.test(v.name)) s = 64;
  else if (/Google UK English/i.test(v.name)) s = 60;
  else if (HUMAN_NAMES.test(v.name)) s = 52;
  else if (/\b(Daniel|Karen|Moira|Tessa|Rishi|Aman|Tara|Veena|Fiona)\b/i.test(v.name)) s = 42;
  else if (v.localService) s = 20;
  if (/^en[-_]US/i.test(v.lang)) s += 4;
  else if (/^en[-_]GB/i.test(v.lang)) s += 2;
  return s;
}

/** Short display name: "Microsoft Aria Online (Natural) - English (United States)" → "Aria (natural)". */
export function voiceLabel(v) {
  let n = v.name.replace(/^Microsoft\s+/i, '').replace(/\s*-\s*English.*$/i, '')
    .replace(/\s*\(English[^)]*\)\)?/i, '').replace(/\bOnline\s*/i, '');
  n = n.replace(/\((Natural|Neural|Premium|Enhanced)\)/i, (_, q) => `(${q.toLowerCase()})`);
  return n.replace(/Google (US|UK) English/i, 'Google $1').trim();
}

function rankedVoices() {
  if (!('speechSynthesis' in window)) return [];
  const seen = new Set();
  return (window.speechSynthesis.getVoices() || [])
    .map(v => ({ v, s: voiceScore(v) }))
    .filter(x => x.s >= 0 && !seen.has(x.v.name) && seen.add(x.v.name))
    .sort((a, b) => b.s - a.s)
    .map(x => x.v);
}

function pickVoice() {
  const ranked = rankedVoices();
  let saved = null;
  try { saved = localStorage.getItem(STORE_KEY); } catch (_) { /* storage blocked */ }
  return ranked.find(v => v.name === saved) || ranked[0] || null;
}

/* How the narration should be *said*, as opposed to how it is shown.
   Subtitles keep "CNC-01"; the voice says "C N C oh one". */
const DIGITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const SAY_AS = [
  [/^([A-Z]{2,5})-0(\d)('s)?$/, (_, a, n, s = '') => `${a.split('').join(' ')} oh ${DIGITS[n]}${s}`],
  [/^([A-Z]{2,5})-(\d+)('s)?$/, (_, a, n, s = '') => `${a.split('').join(' ')} ${n}${s}`],
  [/^TF-IDF$/, () => 'T F I D F'],
  [/^OPC-UA$/, () => 'O P C U A'],
  [/^SimPy$/, () => 'Sim Pie'],
  [/^FastAPI$/, () => 'Fast A P I'],
  [/^LangGraph$/, () => 'Lang Graph'],
  [/^WebSocket$/, () => 'web socket'],
  [/^(TCN|PHM|MQTT|HTTP|CPU|QC|ISO|AGV|CNC|RUL)$/, (m) => m.split('').join(' ')],
  [/^10816$/, () => 'ten eight sixteen'],
  [/^3D$/, () => 'three D'],
];

function sayAs(tok) {
  const m = tok.match(/^([("'‘“]*)(.*?)([.,;:!?)"'’”]*)$/);
  const [, pre, core, post] = m || [null, '', tok, ''];
  for (const [re, fn] of SAY_AS) {
    if (re.test(core)) return pre + core.replace(re, fn) + post;
  }
  return tok;
}

export function parseScript(src) {
  const words = [];
  const cues = [];            // { word, cue }
  let inKw = false;
  let spoken = '';
  const lines = src.trim().split(/\n/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
  for (const raw of line.split(/\s+/)) {
    const cueMatch = raw.match(/^\{(\d+)\}$/);
    if (cueMatch) { cues.push({ word: words.length, cue: Number(cueMatch[1]) }); continue; }
    let tok = raw;
    let kw = inKw;
    if (tok.startsWith('*')) { kw = true; inKw = true; tok = tok.slice(1); }
    let closes = false;
    if (/\*[.,;:!?)'"’]*$/.test(tok)) { closes = true; tok = tok.replace(/\*([.,;:!?)'"’]*)$/, '$1'); }
    const say = sayAs(tok);
    const start = spoken.length ? spoken.length + 1 : 0;
    spoken += (spoken.length ? ' ' : '') + say;
    words.push({ text: tok, say, kw, start });
    if (closes) inKw = false;
  }
  if (words.length) words[words.length - 1].para = true;   // a line break in the script = a breath
  }
  // Sentence boundaries
  const sentences = [];
  let first = 0;
  words.forEach((w, i) => {
    if (/[.!?]["')’]*$/.test(w.text) || i === words.length - 1) {
      const text = words.slice(first, i + 1).map(x => x.say).join(' ');
      sentences.push({ first, last: i, text, charStart: words[first].start, para: !!w.para });
      first = i + 1;
    }
  });
  return { words, cues, sentences, spoken };
}

export function createNarrator({ onWord = () => {}, onDone = () => {}, onSpeakingChange = () => {}, onVoiceUnavailable = () => {}, onVoicesChanged = () => {} } = {}) {
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voice = pickVoice();
  if (synth && typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', () => { voice = pickVoice(); onVoicesChanged(); });
  }

  let voiceOn = !!synth;
  let rate = 1.0;
  let parsed = null;
  let wordIdx = -1;
  let gen = 0;
  let timers = [];
  let playing = false;

  const msPerWord = () => 60000 / (BASE_WPM * rate);

  /* A person breathes between sentences and pauses longer between ideas.
     The engine's own gap is short and uniform, so add a little. */
  function gapAfter(s) {
    const end = parsed.words[s.last].text;
    let ms = /\?["')’]*$/.test(end) ? 380 : 230;
    if (s.para) ms += 320;
    return ms / rate;
  }
  /* Tiny pace changes sentence to sentence; a fixed tempo is what sounds robotic. */
  const SWAY = [0, 0.025, -0.02, 0.01, -0.03, 0.02];
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

  function emitWord(i) {
    if (!parsed || i <= wordIdx || i >= parsed.words.length) return;
    wordIdx = i;
    onWord(i, parsed.words[i]);
  }

  function wordWeight(w) {
    // Longer words and punctuation pauses take longer.
    let k = 0.75 + Math.min(w.text.length, 12) * 0.05;
    if (/[,;:]$/.test(w.text)) k += 0.45;
    if (/[.!?]$/.test(w.text)) k += 0.8;
    return k;
  }

  /** Reveal words first..last on an estimated schedule; resolves when done. */
  function scheduleWords(first, last, myGen, done) {
    let acc = 0;
    for (let i = first; i <= last; i++) {
      const at = acc;
      later(() => { if (myGen === gen) emitWord(i); }, at);
      acc += msPerWord() * wordWeight(parsed.words[i]);
    }
    if (done) later(() => { if (myGen === gen) done(); }, acc);
    return acc;
  }

  function finish(myGen) {
    if (myGen !== gen) return;
    playing = false;
    onSpeakingChange(false);
    clearTimers();
    later(() => { if (myGen === gen) onDone(); }, 450);
  }

  function speakSentence(si, myGen, fromWord) {
    if (myGen !== gen) return;
    if (si >= parsed.sentences.length) { finish(myGen); return; }
    const s = parsed.sentences[si];
    const startWord = Math.max(s.first, fromWord);

    if (!voiceOn || !synth) {
      onSpeakingChange(true);
      scheduleWords(startWord, s.last, myGen, () => later(() => speakSentence(si + 1, myGen, s.last + 1), gapAfter(s)));
      return;
    }

    const text = parsed.words.slice(startWord, s.last + 1).map(w => w.say).join(' ');
    const u = new SpeechSynthesisUtterance(text);
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    u.rate = rate * 0.97 * (1 + SWAY[si % SWAY.length]);
    u.pitch = 1;
    u.volume = 1;
    const offset = parsed.words[startWord].start;
    let gotBoundary = false;
    let ended = false;
    const estimate = parsed.words.slice(startWord, s.last + 1)
      .reduce((a, w) => a + msPerWord() * wordWeight(w), 0);

    const end = () => {
      if (ended || myGen !== gen) return;
      ended = true;
      for (let i = startWord; i <= s.last; i++) emitWord(i);
      later(() => speakSentence(si + 1, myGen, s.last + 1), gapAfter(s));
    };

    // Some engines accept the utterance but never start it (no voices installed,
    // headless, autoplay policy). Don't hang: continue silently.
    let started = false;
    later(() => {
      if (started || ended || myGen !== gen) return;
      ended = true;
      voiceOn = false;
      synth.cancel();
      onVoiceUnavailable();
      onSpeakingChange(true);
      scheduleWords(startWord, s.last, myGen, () => speakSentence(si + 1, myGen, s.last + 1));
    }, 3000);

    u.onstart = () => {
      if (myGen !== gen) return;
      started = true;
      onSpeakingChange(true);
      emitWord(startWord);
      // Estimated reveal, overridden by real boundaries if they arrive.
      let acc = 0;
      for (let i = startWord + 1; i <= s.last; i++) {
        acc += msPerWord() * wordWeight(parsed.words[i - 1]) * 0.98;
        const at = acc;
        later(() => { if (myGen === gen && !gotBoundary && !ended) emitWord(i); }, at);
      }
      // Watchdog for engines that never fire onend.
      later(end, estimate * 2.2 + 2500);
    };
    u.onboundary = (ev) => {
      if (myGen !== gen || ev.name === 'sentence') return;
      gotBoundary = true;
      const abs = offset + ev.charIndex;
      let i = startWord;
      while (i + 1 <= s.last && parsed.words[i + 1].start <= abs) i++;
      emitWord(i);
    };
    u.onend = end;
    u.onerror = (ev) => {
      if (myGen !== gen) return;
      if (ev && (ev.error === 'interrupted' || ev.error === 'canceled')) return;
      // Engine refused (e.g. autoplay policy): continue silently.
      if (ended) return;
      voiceOn = false;
      ended = true;
      onVoiceUnavailable();
      scheduleWords(startWord, s.last, myGen, () => speakSentence(si + 1, myGen, s.last + 1));
    };
    synth.speak(u);
  }

  function play(fromWord = 0) {
    if (!parsed) return;
    gen++;
    const myGen = gen;
    clearTimers();
    if (synth) synth.cancel();
    playing = true;
    wordIdx = Math.min(wordIdx, fromWord - 1);
    let si = parsed.sentences.findIndex(s => s.last >= fromWord);
    if (si < 0) { finish(myGen); return; }
    // Restart the whole sentence when resuming with voice (sounds natural).
    const startAt = voiceOn ? parsed.sentences[si].first : fromWord;
    // Chrome needs a beat between cancel() and speak().
    later(() => speakSentence(si, myGen, startAt), synth ? 80 : 0);
  }

  return {
    load(parsedBeat) {
      this.stop();
      parsed = parsedBeat;
      wordIdx = -1;
    },
    play(fromWord) { play(fromWord == null ? Math.max(0, wordIdx + 1) : fromWord); },
    pause() {
      gen++;
      clearTimers();
      if (synth) synth.cancel();
      playing = false;
      onSpeakingChange(false);
    },
    stop() {
      gen++;
      clearTimers();
      if (synth) synth.cancel();
      playing = false;
      onSpeakingChange(false);
    },
    isPlaying: () => playing,
    hasVoice: () => !!synth,
    isVoiceOn: () => voiceOn && !!synth,
    setVoiceOn(on) {
      const was = voiceOn;
      voiceOn = !!on && !!synth;
      if (playing && was !== voiceOn) play(Math.max(0, wordIdx));
      return voiceOn;
    },
    getRate: () => rate,
    /** Human-sounding voices available here, best first. */
    voices: () => rankedVoices().map(v => ({ name: v.name, label: voiceLabel(v), local: v.localService })),
    voiceName: () => (voice ? voice.name : null),
    setVoice(name) {
      const v = rankedVoices().find(x => x.name === name);
      if (!v) return;
      voice = v;
      try { localStorage.setItem(STORE_KEY, name); } catch (_) { /* storage blocked */ }
      if (playing && voiceOn) play(Math.max(0, wordIdx));
    },
    setRate(r) {
      rate = r;
      if (playing) play(Math.max(0, wordIdx));
    },
    currentWord: () => wordIdx,
  };
}
