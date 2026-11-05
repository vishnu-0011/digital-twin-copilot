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

const BASE_WPM = 165;
const PREFERRED_VOICES = [
  /Samantha/i, /Google US English/i, /Microsoft Aria/i, /Microsoft Jenny/i,
  /Ava/i, /Allison/i, /Karen/i, /Daniel/i, /Google UK English Female/i
];

function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const english = voices.filter(v => /^en(-|_|$)/i.test(v.lang));
  for (const re of PREFERRED_VOICES) {
    const v = english.find(x => re.test(x.name));
    if (v) return v;
  }
  return english.find(v => v.localService) || english[0] || null;
}

/**
 * Parses the tour mini-markup into words, sentences and cue points.
 *   *keyword phrase*   → highlighted in the subtitle
 *   {3}                → diagram cue 3 fires when the next word is spoken
 */
export function parseScript(src) {
  const tokens = src.trim().split(/\s+/);
  const words = [];
  const cues = [];            // { word, cue }
  let inKw = false;
  let spoken = '';
  for (const raw of tokens) {
    const cueMatch = raw.match(/^\{(\d+)\}$/);
    if (cueMatch) { cues.push({ word: words.length, cue: Number(cueMatch[1]) }); continue; }
    let tok = raw;
    let kw = inKw;
    if (tok.startsWith('*')) { kw = true; inKw = true; tok = tok.slice(1); }
    let closes = false;
    if (/\*[.,;:!?)'"’]*$/.test(tok)) { closes = true; tok = tok.replace(/\*([.,;:!?)'"’]*)$/, '$1'); }
    const start = spoken.length ? spoken.length + 1 : 0;
    spoken += (spoken.length ? ' ' : '') + tok;
    words.push({ text: tok, kw, start });
    if (closes) inKw = false;
  }
  // Sentence boundaries
  const sentences = [];
  let first = 0;
  words.forEach((w, i) => {
    if (/[.!?]["')’]*$/.test(w.text) || i === words.length - 1) {
      const text = words.slice(first, i + 1).map(x => x.text).join(' ');
      sentences.push({ first, last: i, text, charStart: words[first].start });
      first = i + 1;
    }
  });
  return { words, cues, sentences, spoken };
}

export function createNarrator({ onWord = () => {}, onDone = () => {}, onSpeakingChange = () => {}, onVoiceUnavailable = () => {} } = {}) {
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voice = pickVoice();
  if (synth && typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', () => { voice = pickVoice(); });
  }

  let voiceOn = !!synth;
  let rate = 1.0;
  let parsed = null;
  let wordIdx = -1;
  let gen = 0;
  let timers = [];
  let playing = false;

  const msPerWord = () => 60000 / (BASE_WPM * rate);
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
      scheduleWords(startWord, s.last, myGen, () => speakSentence(si + 1, myGen, s.last + 1));
      return;
    }

    const text = parsed.words.slice(startWord, s.last + 1).map(w => w.text).join(' ');
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = 1.08;
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
      speakSentence(si + 1, myGen, s.last + 1);
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
    setRate(r) {
      rate = r;
      if (playing) play(Math.max(0, wordIdx));
    },
    currentWord: () => wordIdx,
  };
}
