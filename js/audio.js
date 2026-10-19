/* ================================================
   DIGITHIN GALAXY — js/audio.js
   Web Audio API sound engine & sound effects
   ================================================ */
'use strict';

let _actx = null;
function actx() {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
  if (_actx.state === 'suspended') _actx.resume();
  return _actx;
}

let soundEnabled = true;
try {
  const savedSound = localStorage.getItem('digithin_galaxy_sound');
  if (savedSound !== null) soundEnabled = savedSound === 'true';
} catch (_) {}

function isSoundEnabled() {
  return soundEnabled;
}

function setSoundEnabled(val) {
  soundEnabled = !!val;
  try {
    localStorage.setItem('digithin_galaxy_sound', String(soundEnabled));
  } catch (_) {}
  if (typeof updateSoundUI === 'function') updateSoundUI();
  if (typeof updateBossBgmVolume === 'function') updateBossBgmVolume();
}

function toggleSound() {
  setSoundEnabled(!soundEnabled);
  if (soundEnabled) playSound('hit');
  return soundEnabled;
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = actx();
    const t   = ctx.currentTime;
    const osc = (freq, kind = 'sine', delay = 0, dur = 0.16, vol = 0.14) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = kind; o.frequency.value = freq;
      g.gain.setValueAtTime(0.001, t + delay);
      g.gain.linearRampToValueAtTime(vol,   t + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      o.start(t + delay); o.stop(t + delay + dur + 0.02);
    };

    switch (type) {
      case 'hit':
        osc(800, 'triangle', 0, 0.09, 0.13);
        break;

      case 'syllable':
        osc(523, 'sine', 0, 0.12);
        osc(659, 'sine', 0.065, 0.12);
        break;

      case 'word':
        [523, 659, 784, 1047].forEach((f, i) => osc(f, 'sine', i * 0.065, 0.2));
        break;

      case 'wildcard':
        [220, 440, 880, 1760].forEach((f, i) => osc(f, 'sawtooth', i * 0.055, 0.22, 0.18));
        break;

      case 'bomb': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(140, t);
        o.frequency.exponentialRampToValueAtTime(35, t + 0.35);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
        o.start(t); o.stop(t + 0.4);
        break;
      }

      case 'skill':
        [659, 784, 988, 1319, 1568].forEach((f, i) => osc(f, 'sine', i * 0.05, 0.2, 0.1));
        break;

      case 'buy':
        [440, 550, 660].forEach((f, i) => osc(f, 'sine', i * 0.055, 0.18, 0.12));
        break;

      case 'coin': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(987.77, t);
        o.frequency.setValueAtTime(1318.51, t + 0.035);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.11, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
        o.start(t); o.stop(t + 0.12);
        break;
      }

      case 'error': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(200, t);
        o.frequency.linearRampToValueAtTime(100, t + 0.18);
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t); o.stop(t + 0.23);
        break;
      }

      case 'fall': {
        // Gravitational singularity plunge / black hole swallow sound
        const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = 'sawtooth';
        f.type = 'lowpass';
        f.frequency.setValueAtTime(340, t);
        f.frequency.exponentialRampToValueAtTime(38, t + 0.32);
        o.frequency.setValueAtTime(180, t);
        o.frequency.exponentialRampToValueAtTime(28, t + 0.30);
        g.gain.setValueAtTime(0.32, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        o.connect(f); f.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.33);
        break;
      }

      case 'life': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(380, t);
        o.frequency.linearRampToValueAtTime(110, t + 0.45);
        g.gain.setValueAtTime(0.22, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        o.start(t); o.stop(t + 0.5);
        break;
      }

      case 'firework': {
        const playSoftPop = (delay, baseFreq = 95) => {
          const st = t + delay;
          // 1. Low warm thump (sine wave, gentle curve)
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(baseFreq, st);
          o.frequency.exponentialRampToValueAtTime(32, st + 0.32);
          g.gain.setValueAtTime(0.001, st);
          g.gain.linearRampToValueAtTime(0.09, st + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, st + 0.35);
          o.start(st);
          o.stop(st + 0.38);

          // 2. Soft filtered noise shimmer tail
          const len = Math.floor(ctx.sampleRate * 0.32);
          const buf = ctx.createBuffer(1, len, ctx.sampleRate);
          const d   = buf.getChannelData(0);
          for (let i = 0; i < len; i++) {
            d[i] = (Math.random() * 2 - 1) * (1 - i / len);
          }
          const noise  = ctx.createBufferSource();
          noise.buffer = buf;
          const filter = ctx.createBiquadFilter();
          filter.type  = 'lowpass';
          filter.frequency.setValueAtTime(500, st);
          filter.frequency.exponentialRampToValueAtTime(160, st + 0.3);
          const ng = ctx.createGain();
          ng.gain.setValueAtTime(0.001, st);
          ng.gain.linearRampToValueAtTime(0.045, st + 0.03);
          ng.gain.exponentialRampToValueAtTime(0.001, st + 0.32);
          noise.connect(filter);
          filter.connect(ng);
          ng.connect(ctx.destination);
          noise.start(st);
          noise.stop(st + 0.33);
        };

        playSoftPop(0, 100);
        playSoftPop(0.18, 88);
        playSoftPop(0.38, 110);
        break;
      }

      case 'countdown':
        osc(523, 'sine', 0, 0.08, 0.15);
        break;

      case 'countdownGo':
        osc(659, 'sine', 0, 0.18, 0.18);
        osc(880, 'sine', 0.04, 0.22, 0.16);
        osc(1318, 'sine', 0.08, 0.28, 0.14);
        break;

      case 'combo':
        osc(587, 'triangle', 0, 0.1, 0.12);
        osc(880, 'sine', 0.05, 0.14, 0.15);
        break;

      case 'fury':
        [523, 659, 784, 1046, 1318].forEach((f, i) => osc(f, 'sine', i * 0.04, 0.3, 0.15));
        break;

      case 'continue':
        [392, 523, 659, 784, 1046].forEach((f, i) => osc(f, 'triangle', i * 0.06, 0.25, 0.16));
        break;

      case 'achievement':
        [523, 659, 784, 1046].forEach((f, i) => osc(f, 'sine', i * 0.07, 0.35, 0.16));
        break;

      case 'bossSpawn':
        [130, 164, 196, 261, 392].forEach((f, i) => osc(f, 'sawtooth', i * 0.09, 0.45, 0.16));
        break;

      case 'bossHit': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(260, t);
        o.frequency.exponentialRampToValueAtTime(45, t + 0.28);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.start(t); o.stop(t + 0.32);
        [880, 1174, 1760].forEach((f, i) => osc(f, 'sine', i * 0.04, 0.15, 0.12));
        break;
      }

      case 'bossDefeat':
        [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => osc(f, 'sine', i * 0.08, 0.4, 0.16));
        break;
    }
  } catch (_) { /* silent on audio policy restrictions */ }
}

// Satisfying mechanical keyboard click (tactile switch pop with ascending pitch per letter)
function playMechanicalClick(step = 1) {
  if (!soundEnabled) return;
  try {
    const ctx = actx();
    const t   = ctx.currentTime;

    // 1. Subtle tactile clack (micro noise burst)
    const len = Math.floor(ctx.sampleRate * 0.018);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.25));
    }
    const noise  = ctx.createBufferSource();
    noise.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type  = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.value = 1.4;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.09, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
    noise.connect(filter);
    filter.connect(ng);
    ng.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.02);

    // 2. Rising musical tone (pentatonic scale ascending per letter)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const freq  = scale[(step - 1) % scale.length];
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.start(t);
    o.stop(t + 0.08);
  } catch (_) {}
}

document.addEventListener('keydown', () => actx(), { once: true });
document.addEventListener('click',   () => actx(), { once: true });

// ============================================================
// CHIPTUNE 8-BIT / 16-BIT PROCEDURAL BOSS BATTLE BGM ENGINE
// ============================================================
let _bossBgmPlaying = false;
let _bossBgmPaused = false;
let _bossBgmTimer = null;
let _bossBgmGain = null;
let _bossBgmNextStepTime = 0;
let _bossBgmStep = 0;

const CHIPTUNE_BPM = 138;
const SECONDS_PER_BEAT = 60 / CHIPTUNE_BPM;
const SECONDS_PER_16TH = SECONDS_PER_BEAT / 4; // ~0.1087s
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_TIME = 0.12;

// Frequencies for musical notes (4-measure battle sequence)
const NOTE_FREQS = {
  // Bass Octaves (1 & 2)
  'A1': 55.00, 'Bb1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
  // Mid Octaves (3 & 4)
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  // High Octaves (5 & 6)
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51
};

// 4-measure pattern (64 sixteenth steps, 16 steps per measure)
// Measure 1: Dm, Measure 2: Bb, Measure 3: C, Measure 4: A7/Dm turnaround
const BASS_PATTERN = [
  // Measure 1 (Dm)
  'D2', null, 'D2', null, 'D3', null, 'D2', null, 'D2', null, 'F2', null, 'D3', null, 'D2', null,
  // Measure 2 (Bb)
  'Bb1', null, 'Bb1', null, 'Bb2', null, 'Bb1', null, 'Bb1', null, 'D2', null, 'Bb2', null, 'Bb1', null,
  // Measure 3 (C)
  'C2', null, 'C2', null, 'C3', null, 'C2', null, 'C2', null, 'E2', null, 'C3', null, 'C2', null,
  // Measure 4 (A7 / Dm turnaround)
  'A1', null, 'A1', null, 'A2', null, 'A1', null, 'C#2', null, 'E2', null, 'A2', null, 'G2', null,
];

// Lead Melody (Square wave, energetic fast retro pulse)
const LEAD_PATTERN = [
  // Measure 1
  'D5', null, 'D5', null, 'F5', null, 'A5', null, 'D6', null, 'C6', null, 'A5', null, 'F5', null,
  // Measure 2
  'Bb5', null, 'D5', null, 'F5', null, 'Bb5', null, 'A5', null, 'F5', null, 'D5', null, 'F5', null,
  // Measure 3
  'G5', null, 'C5', null, 'E5', null, 'G5', null, 'Bb5', null, 'A5', null, 'G5', null, 'E5', null,
  // Measure 4
  'A5', null, 'G5', null, 'F5', null, 'E5', null, 'F5', null, 'E5', null, 'C#5', null, 'E5', null,
];

// Arpeggio Chords (Square wave, classic rapid chiptune arpeggios on every 16th step)
const CHORD_TABLE = [
  // Measure 1: Dm [D4, F4, A4, D5]
  ['D4', 'F4', 'A4', 'D5'],
  // Measure 2: Bb [Bb3, D4, F4, Bb4]
  ['Bb3', 'D4', 'F4', 'Bb4'],
  // Measure 3: C [C4, E4, G4, C5]
  ['C4', 'E4', 'G4', 'C5'],
  // Measure 4: A [A3, C#4, E4, A4]
  ['A3', 'C#4', 'E4', 'A4'],
];

// Noise buffer cache for crisp 8-bit snare and hi-hats
let _chiptuneNoiseBuffer = null;
function getChiptuneNoiseBuffer(ctx) {
  if (!_chiptuneNoiseBuffer) {
    const len = Math.floor(ctx.sampleRate * 0.15);
    _chiptuneNoiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = _chiptuneNoiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
  }
  return _chiptuneNoiseBuffer;
}

function scheduleChiptuneStep(stepIndex, time, ctx, masterGain) {
  if (!masterGain) return;
  const stepInMeasure = stepIndex % 16;
  const measureIndex = Math.floor(stepIndex / 16) % 4;

  // 1. DRUMS (8-bit kick & snare & hi-hat)
  // Kick on beats 1 and 3 (steps 0, 8, and syncopation on step 10)
  if (stepInMeasure === 0 || stepInMeasure === 8 || stepInMeasure === 10) {
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kickOsc.type = 'triangle';
    kickOsc.frequency.setValueAtTime(125, time);
    kickOsc.frequency.exponentialRampToValueAtTime(32, time + 0.08);
    kickGain.gain.setValueAtTime(0.24, time);
    kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    kickOsc.connect(kickGain);
    kickGain.connect(masterGain);
    kickOsc.start(time);
    kickOsc.stop(time + 0.10);
  }

  // Snare on beats 2 and 4 (steps 4, 12, with roll on step 14 in measure 4)
  const isSnare = (stepInMeasure === 4 || stepInMeasure === 12 || (measureIndex === 3 && stepInMeasure === 14));
  if (isSnare) {
    const noise = ctx.createBufferSource();
    noise.buffer = getChiptuneNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.Q.value = 1.2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.16, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(time);
    noise.stop(time + 0.10);
  }

  // Hi-hat on offbeats (steps 2, 6, 10, 14)
  if (stepInMeasure % 2 === 0 && !isSnare) {
    const hat = ctx.createBufferSource();
    hat.buffer = getChiptuneNoiseBuffer(ctx);
    const hFilter = ctx.createBiquadFilter();
    hFilter.type = 'highpass';
    hFilter.frequency.setValueAtTime(7000, time);
    const hGain = ctx.createGain();
    hGain.gain.setValueAtTime(0.05, time);
    hGain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
    hat.connect(hFilter);
    hFilter.connect(hGain);
    hGain.connect(masterGain);
    hat.start(time);
    hat.stop(time + 0.03);
  }

  // 2. BASS (Punchy triangle / sawtooth 8-bit bass)
  const bassNote = BASS_PATTERN[stepIndex % BASS_PATTERN.length];
  if (bassNote && NOTE_FREQS[bassNote]) {
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(NOTE_FREQS[bassNote], time);
    // Lowpass filter for smooth 16-bit arcade warmth
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(320, time);

    bassGain.gain.setValueAtTime(0.18, time);
    bassGain.gain.exponentialRampToValueAtTime(0.001, time + SECONDS_PER_16TH * 1.6);
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(masterGain);
    bassOsc.start(time);
    bassOsc.stop(time + SECONDS_PER_16TH * 1.8);
  }

  // 3. ARPEGGIO CHORD (Fast 16th-note chiptune arp)
  const chordNotes = CHORD_TABLE[measureIndex];
  if (chordNotes && chordNotes.length > 0) {
    const arpNote = chordNotes[stepInMeasure % chordNotes.length];
    if (arpNote && NOTE_FREQS[arpNote]) {
      const arpOsc = ctx.createOscillator();
      const arpGain = ctx.createGain();
      arpOsc.type = 'square';
      arpOsc.frequency.setValueAtTime(NOTE_FREQS[arpNote], time);
      arpGain.gain.setValueAtTime(0.045, time);
      arpGain.gain.exponentialRampToValueAtTime(0.001, time + SECONDS_PER_16TH * 0.85);
      arpOsc.connect(arpGain);
      arpGain.connect(masterGain);
      arpOsc.start(time);
      arpOsc.stop(time + SECONDS_PER_16TH * 0.95);
    }
  }

  // 4. LEAD MELODY (Square wave with vibrant arcade attack)
  const leadNote = LEAD_PATTERN[stepIndex % LEAD_PATTERN.length];
  if (leadNote && NOTE_FREQS[leadNote]) {
    const leadOsc = ctx.createOscillator();
    const leadGain = ctx.createGain();
    leadOsc.type = 'square';
    leadOsc.frequency.setValueAtTime(NOTE_FREQS[leadNote], time);
    leadGain.gain.setValueAtTime(0.001, time);
    leadGain.gain.linearRampToValueAtTime(0.095, time + 0.008);
    leadGain.gain.exponentialRampToValueAtTime(0.001, time + SECONDS_PER_16TH * 1.7);
    leadOsc.connect(leadGain);
    leadGain.connect(masterGain);
    leadOsc.start(time);
    leadOsc.stop(time + SECONDS_PER_16TH * 1.8);
  }
}

function runChiptuneScheduler() {
  if (!_bossBgmPlaying || _bossBgmPaused) return;
  try {
    const ctx = actx();
    while (_bossBgmNextStepTime < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
      scheduleChiptuneStep(_bossBgmStep, _bossBgmNextStepTime, ctx, _bossBgmGain);
      _bossBgmNextStepTime += SECONDS_PER_16TH;
      _bossBgmStep = (_bossBgmStep + 1) % 64;
    }
  } catch (_) {}
  _bossBgmTimer = setTimeout(runChiptuneScheduler, LOOKAHEAD_MS);
}

function startBossBgm() {
  if (_bossBgmPlaying && !_bossBgmPaused) return;
  try {
    const ctx = actx();
    if (!_bossBgmGain) {
      _bossBgmGain = ctx.createGain();
      _bossBgmGain.connect(ctx.destination);
    }
    const targetVol = isSoundEnabled() ? 0.85 : 0.001;
    _bossBgmGain.gain.cancelScheduledValues(ctx.currentTime);
    _bossBgmGain.gain.setValueAtTime(0.001, ctx.currentTime);
    _bossBgmGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.35);

    _bossBgmPlaying = true;
    _bossBgmPaused = false;
    _bossBgmStep = 0;
    _bossBgmNextStepTime = ctx.currentTime + 0.05;

    clearTimeout(_bossBgmTimer);
    runChiptuneScheduler();
  } catch (_) {}
}

function stopBossBgm(fade = true) {
  if (!_bossBgmPlaying) return;
  try {
    const ctx = actx();
    if (_bossBgmGain) {
      if (fade) {
        _bossBgmGain.gain.cancelScheduledValues(ctx.currentTime);
        _bossBgmGain.gain.setValueAtTime(_bossBgmGain.gain.value, ctx.currentTime);
        _bossBgmGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      } else {
        _bossBgmGain.gain.setValueAtTime(0.001, ctx.currentTime);
      }
    }
  } catch (_) {}
  setTimeout(() => {
    _bossBgmPlaying = false;
    _bossBgmPaused = false;
    clearTimeout(_bossBgmTimer);
    _bossBgmTimer = null;
  }, fade ? 480 : 20);
}

function pauseBossBgm() {
  if (!_bossBgmPlaying || _bossBgmPaused) return;
  _bossBgmPaused = true;
  clearTimeout(_bossBgmTimer);
  _bossBgmTimer = null;
  if (_bossBgmGain) {
    try {
      const ctx = actx();
      _bossBgmGain.gain.setValueAtTime(0.001, ctx.currentTime);
    } catch (_) {}
  }
}

function resumeBossBgm() {
  if (!_bossBgmPlaying || !_bossBgmPaused) return;
  try {
    const ctx = actx();
    _bossBgmPaused = false;
    const targetVol = isSoundEnabled() ? 0.85 : 0.001;
    if (_bossBgmGain) {
      _bossBgmGain.gain.cancelScheduledValues(ctx.currentTime);
      _bossBgmGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.2);
    }
    _bossBgmNextStepTime = ctx.currentTime + 0.05;
    runChiptuneScheduler();
  } catch (_) {}
}

function updateBossBgmVolume() {
  if (!_bossBgmGain) return;
  try {
    const ctx = actx();
    const targetVol = (_bossBgmPlaying && !_bossBgmPaused && isSoundEnabled()) ? 0.85 : 0.001;
    _bossBgmGain.gain.cancelScheduledValues(ctx.currentTime);
    _bossBgmGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.1);
  } catch (_) {}
}
