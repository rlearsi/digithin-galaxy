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
// PROCEDURAL RETRO 8-BIT / 16-BIT MUSIC SUITE
// - 6 Distinct Dramatic / Suspense / Action Boss Themes
// - 1 Calming, Ethereal Ambient Space Theme for Normal Match
// ============================================================
let _normalBgmPlaying = false;
let _normalBgmPaused = false;
let _normalBgmTimer = null;
let _normalBgmGain = null;
let _normalBgmNextTime = 0;
let _normalBgmStep = 0;

let _bossBgmPlaying = false;
let _bossBgmPaused = false;
let _bossBgmTimer = null;
let _bossBgmGain = null;
let _bossBgmNextTime = 0;
let _bossBgmStep = 0;
let _activeBossTrackKey = 'alien_kragthor';

// Complete note frequency table
const NOTE_FREQS = {
  // Octaves 1 & 2 (Bass)
  'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'Bb1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50,
  'G2': 98.00, 'G#2': 103.83, 'Ab2': 103.83, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
  // Octaves 3 & 4 (Mid / Harmony)
  'C3': 130.81, 'C#3': 138.59, 'Db3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00,
  'G3': 196.00, 'G#3': 207.65, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99,
  'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  // Octaves 5 & 6 (Lead & Chimes)
  'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99,
  'G5': 783.99, 'G#5': 830.61, 'Ab5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'Eb6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98
};

// Cached noise buffer for 8-bit & 16-bit snares and cosmic shimmer
let _noiseBuf = null;
function getNoiseBuffer(ctx) {
  if (!_noiseBuf) {
    const len = Math.floor(ctx.sampleRate * 0.20);
    _noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = _noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
  }
  return _noiseBuf;
}

// ============================================================
// 1. THE 6 PROCEDURAL BOSS THEMES (DRAMATIC, SUSPENSE & ACTION)
// ============================================================
const BOSS_TRACKS = {
  // Kragthor: Warlord — Frenetic Alien Military Action (Doom / Contra 16-bit)
  'alien_kragthor': {
    bpm: 144,
    bassType: 'sawtooth',
    leadType: 'sawtooth',
    filterFreq: 420,
    bassPattern: [
      'E2', 'E2', 'E3', 'E2',  'E2', 'E3', 'E2', 'G2',   'E2', 'E2', 'F2', 'E2',   'E2', 'E3', 'Bb2', 'A2',
      'C2', 'C2', 'C3', 'C2',  'C2', 'C3', 'C2', 'E2',   'C2', 'C2', 'D2', 'C2',   'C2', 'C3', 'G2', 'F2',
      'A1', 'A1', 'A2', 'A1',  'A1', 'A2', 'A1', 'C2',   'A1', 'A1', 'B1', 'A1',   'A1', 'A2', 'E2', 'D2',
      'B1', 'B1', 'B2', 'B1',  'B1', 'D#2', 'B1', 'F#2', 'B1', 'B1', 'A2', 'G2',   'F#2', 'G2', 'F#2', 'D#2'
    ],
    leadPattern: [
      'E5', null, 'G5', null,  'F#5', null, 'E5', null,  'Bb5', null, 'A5', null,  'G5', 'F#5', 'E5', null,
      'C5', null, 'E5', null,  'G5', null, 'C6', null,   'B5', null, 'A5', null,   'G5', 'A5', 'G5', null,
      'A5', null, 'C6', null,  'E6', null, 'D6', null,   'C6', null, 'B5', null,   'A5', 'B5', 'A5', null,
      'B5', null, 'D#5', null, 'F#5', null, 'A5', null,  'G5', 'F#5', 'E5', 'D#5', 'E5', null, null, null
    ],
    chords: [
      ['E4', 'G4', 'B4', 'E5'],
      ['C4', 'E4', 'G4', 'C5'],
      ['A3', 'C4', 'E4', 'A4'],
      ['B3', 'D#4', 'F#4', 'B4']
    ],
    drumStyle: 'heavy_assault'
  },

  // Vespera: Psionic — Pure Cosmic Suspense & Alien Dread (Super Metroid / Castlevania)
  'alien_vespera': {
    bpm: 124,
    bassType: 'triangle',
    leadType: 'square',
    filterFreq: 280,
    bassPattern: [
      'C2', null, 'C2', 'Db2', null, 'C2', null, 'G2',   'C2', null, 'Db2', null, 'F2', null, 'Db2', null,
      'Db2', null, 'Db2', 'Eb2', null, 'Db2', null, 'Ab2', 'Db2', null, 'Eb2', null, 'Gb2', null, 'Eb2', null,
      'F1', null, 'F1', 'Ab1', null, 'F1', null, 'C2',   'F1', null, 'Ab1', null, 'Db2', null, 'C2', null,
      'G1', null, 'G1', 'Db2', null, 'G1', null, 'Eb2',  'G1', null, 'Db2', null, 'C2', null, 'B1', null
    ],
    leadPattern: [
      'C5', null, 'Db5', null, 'Eb5', null, 'G5', null,  'F#5', null, 'Eb5', null, 'Db5', null, 'C5', null,
      'Db5', null, 'F5', null, 'Ab5', null, 'C6', null,  'Bb5', null, 'Ab5', null, 'F5', null, 'Eb5', null,
      'Ab5', null, 'G5', null, 'F5', null, 'Eb5', null,  'Db5', null, 'C5', null, 'Bb4', null, 'C5', null,
      'Db5', null, 'Eb5', null, 'G5', null, 'F#5', null, 'Eb5', null, 'Db5', null, 'C5', null, null, null
    ],
    chords: [
      ['C4', 'Eb4', 'G4', 'C5'],
      ['Db4', 'F4', 'Ab4', 'Db5'],
      ['F3', 'Ab3', 'C4', 'F4'],
      ['G3', 'Bb3', 'Db4', 'G4']
    ],
    drumStyle: 'psionic_creeping'
  },

  // Xylarion: Dreadnought — Heavy Industrial Titanium Confrontation
  'alien_xylarion': {
    bpm: 134,
    bassType: 'sawtooth',
    leadType: 'square',
    filterFreq: 380,
    bassPattern: [
      'D2', 'D2', null, 'D2',  'F2', null, 'G2', null,   'D2', 'D2', null, 'D2',  'Ab2', 'G2', 'F2', 'D2',
      'G1', 'G1', null, 'G1',  'Bb1', null, 'C2', null,  'G1', 'G1', null, 'G1',  'Db2', 'C2', 'Bb1', 'G1',
      'F1', 'F1', null, 'F1',  'A1', null, 'C2', null,   'F1', 'F1', null, 'F1',  'B1', 'Bb1', 'A1', 'F1',
      'Bb1', 'Bb1', null, 'Bb1','D2', null, 'F2', null,  'A1', null, 'C#2', null, 'D2', null, 'E2', null
    ],
    leadPattern: [
      'D5', null, 'F5', 'G5',  'Ab5', 'G5', 'F5', 'D5',  'C5', 'D5', 'F5', 'G5',  'A5', 'C6', 'D6', null,
      'G5', null, 'Bb5', 'C6', 'Db6', 'C6', 'Bb5', 'G5', 'F5', 'G5', 'Bb5', 'C6', 'D6', 'F6', 'G6', null,
      'F5', null, 'A5', 'C6',  'E6', 'D6', 'C6', 'A5',   'G5', 'A5', 'C6', 'D6',  'C6', 'Bb5', 'A5', null,
      'Bb5', null, 'D6', null, 'F6', null, 'E6', null,  'C#6', null, 'A5', null, 'D6', null, null, null
    ],
    chords: [
      ['D4', 'F4', 'A4', 'D5'],
      ['G3', 'B3', 'D4', 'G4'],
      ['F3', 'A3', 'C4', 'F4'],
      ['Bb3', 'D4', 'F4', 'Bb4']
    ],
    drumStyle: 'industrial_march'
  },

  // Zorkon: Reptilian Swarm — Rapid Extraterrestrial Chaos & Hive Alert
  'alien_zorkon': {
    bpm: 140,
    bassType: 'sawtooth',
    leadType: 'square',
    filterFreq: 450,
    bassPattern: [
      'A1', 'A1', 'C2', 'A1',  'Eb2', 'D2', 'C2', 'A1',  'A1', 'A1', 'F2', 'E2',  'D2', 'C2', 'B1', 'C2',
      'D2', 'D2', 'F2', 'D2',  'Ab2', 'G2', 'F2', 'D2',  'D2', 'D2', 'Bb2', 'A2', 'G2', 'F2', 'E2', 'F2',
      'F1', 'F1', 'A1', 'F1',  'C2', 'B1', 'A1', 'F1',   'F1', 'F1', 'D2', 'C2',  'B1', 'A1', 'G#1', 'A1',
      'E1', 'E1', 'G#1', 'E1', 'B1', 'A1', 'G#1', 'E1',  'E1', 'E1', 'D2', 'C2',  'B1', 'C2', 'B1', 'G#1'
    ],
    leadPattern: [
      'A5', 'C6', 'B5', 'Bb5', 'A5', 'G#5', 'A5', 'E5', 'F5', 'E5', 'Eb5', 'D5', 'C5', 'B4', 'A4', 'C5',
      'D5', 'F5', 'E5', 'Eb5', 'D5', 'C#5', 'D5', 'A5', 'Bb5', 'A5', 'Ab5', 'G5', 'F5', 'E5', 'D5', 'F5',
      'C6', 'B5', 'A5', 'G#5', 'A5', 'E5', 'F5', 'A5',  'D6', 'C6', 'B5', 'A5',  'G#5', 'A5', 'B5', 'D6',
      'E6', null, 'D6', null,  'C6', null, 'B5', null,  'G#5', null, 'B5', null, 'A5', null, null, null
    ],
    chords: [
      ['A3', 'C4', 'E4', 'A4'],
      ['D4', 'F4', 'A4', 'D5'],
      ['F3', 'A3', 'C4', 'F4'],
      ['E3', 'G#3', 'B3', 'E4']
    ],
    drumStyle: 'swarm_pulse'
  },

  // Nebulor: Dark Matter — Abyssal Cosmic Void & Gravitational Singularity
  'alien_nebulor': {
    bpm: 120,
    bassType: 'triangle',
    leadType: 'sawtooth',
    filterFreq: 260,
    bassPattern: [
      'B1', null, 'B1', null,  'F2', null, 'E2', null,   'B1', null, 'D2', null,  'C2', null, 'B1', null,
      'G1', null, 'G1', null,  'Db2', null, 'C2', null,  'G1', null, 'Bb1', null, 'Ab1', null, 'G1', null,
      'E1', null, 'E1', null,  'Bb1', null, 'A1', null,  'E1', null, 'G1', null,  'F1', null, 'E1', null,
      'F#1', null, 'F#1', null,'C2', null, 'B1', null,   'F#1', null, 'A1', null, 'G1', null, 'F#1', null
    ],
    leadPattern: [
      'B4', null, 'D5', null,  'F5', null, 'E5', null,   'G5', null, 'F5', null,  'D5', null, 'C#5', null,
      'G4', null, 'Bb4', null, 'Db5', null, 'C5', null,  'Eb5', null, 'Db5', null, 'Bb4', null, 'A4', null,
      'E4', null, 'G4', null,  'Bb4', null, 'A4', null,  'C5', null, 'Bb4', null, 'G4', null, 'F#4', null,
      'F#4', null, 'A4', null, 'C5', null, 'B4', null,   'D#5', null, 'C5', null, 'B4', null, null, null
    ],
    chords: [
      ['B3', 'D4', 'F4', 'B4'],
      ['G3', 'Bb3', 'Db4', 'G4'],
      ['E3', 'G3', 'Bb3', 'E4'],
      ['F#3', 'A3', 'C4', 'F#4']
    ],
    drumStyle: 'dark_abyss'
  },

  // Xenor: Galactic Mothership — Climax Imperial Confrontation
  'alien_xenor': {
    bpm: 140,
    bassType: 'sawtooth',
    leadType: 'square',
    filterFreq: 400,
    bassPattern: [
      'G1', 'G1', 'G2', 'G1',  'Bb1', 'Bb1', 'Bb2', 'Bb1', 'Eb2', 'Eb2', 'Eb3', 'Eb2', 'D2', 'D2', 'F#2', 'D2',
      'C2', 'C2', 'C3', 'C2',  'Eb2', 'Eb2', 'Eb3', 'Eb2', 'Ab2', 'Ab2', 'Ab3', 'Ab2', 'G2', 'G2', 'B2', 'G2',
      'Eb2', 'Eb2', 'Eb3', 'Eb2','G2', 'G2', 'G3', 'G2',   'Bb2', 'Bb2', 'Bb3', 'Bb2', 'A2', 'A2', 'C3', 'A2',
      'D2', 'D2', 'D3', 'D2',  'F#2', 'F#2', 'F#3', 'F#2', 'A2', 'A2', 'A3', 'A2',    'D3', 'C3', 'Bb2', 'A2'
    ],
    leadPattern: [
      'G5', null, 'Bb5', 'A5', 'G5', 'D6', 'C6', 'Bb5', 'A5', 'Bb5', 'C6', 'D6', 'Eb6', 'D6', 'C6', 'Bb5',
      'C5', null, 'Eb5', 'D5', 'C5', 'G5', 'F5', 'Eb5', 'D5', 'Eb5', 'F5', 'G5', 'Ab5', 'G5', 'F5', 'Eb5',
      'Eb5', null, 'G5', 'F5', 'Eb5', 'Bb5', 'Ab5', 'G5', 'F5', 'G5', 'Ab5', 'Bb5', 'C6', 'Bb5', 'A5', 'G5',
      'D6', null, 'F#6', null, 'A6', null, 'G6', null,  'F#6', 'E6', 'D6', 'C6', 'Bb5', 'A5', 'G5', null
    ],
    chords: [
      ['G3', 'Bb3', 'D4', 'G4'],
      ['C4', 'Eb4', 'G4', 'C5'],
      ['Eb3', 'G3', 'Bb3', 'Eb4'],
      ['D4', 'F#4', 'A4', 'D5']
    ],
    drumStyle: 'imperial_march'
  }
};

// ============================================================
// 2. THE CALM AMBIENT SPACE THEME (NORMAL GAMEPLAY WITHOUT BOSS)
// ============================================================
const NORMAL_SPACE_TRACK = {
  bpm: 82,
  bassPattern: [
    'F1', null, null, null,  'F2', null, null, null,  'C2', null, null, null,  'C3', null, null, null,
    'D2', null, null, null,  'D3', null, null, null,  'A1', null, null, null,  'A2', null, null, null,
    'Bb1', null, null, null, 'Bb2', null, null, null, 'F1', null, null, null,  'F2', null, null, null,
    'G1', null, null, null,  'G2', null, null, null,  'C2', null, null, null,  'E2', null, null, null
  ],
  padChords: [
    ['F4', 'A4', 'C5', 'E5'],  // Fmaj7
    ['C4', 'E4', 'G4', 'B4'],  // Cmaj7
    ['D4', 'F4', 'A4', 'C5'],  // Dm7
    ['A3', 'C4', 'E4', 'G4'],  // Am7
    ['Bb3', 'D4', 'F4', 'A4'], // Bbmaj7
    ['F3', 'A3', 'C4', 'E4'],  // Fmaj7
    ['G3', 'Bb3', 'D4', 'F4'], // Gm7
    ['C4', 'E4', 'G4', 'D5']   // Cadd9
  ],
  chimesPattern: [
    'C6', null, null, 'E5', null, null, 'A5', null,  'G5', null, null, 'C5', null, null, 'E5', null,
    'F5', null, null, 'A5', null, null, 'C6', null,  'E5', null, null, 'G5', null, null, 'B5', null,
    'D5', null, null, 'F5', null, null, 'A5', null,  'C5', null, null, 'E5', null, null, 'G5', null,
    'G5', null, null, 'B5', null, null, 'D6', null,  'C6', null, null, 'E6', null, null, null, null
  ]
};

// ============================================================
// 3. STEP SCHEDULERS (BOSS ACTION & NORMAL SPACE AMBIENCE)
// ============================================================

function scheduleBossBattleStep(track, stepIndex, time, ctx, masterGain) {
  if (!masterGain || !track) return;
  const sec16th = (60 / track.bpm) / 4;
  const stepInMeasure = stepIndex % 16;
  const measureIndex = Math.floor(stepIndex / 16) % 4;

  // 1. DRUMS (Dynamic 16-bit action percussion)
  const isKick = (stepInMeasure === 0 || stepInMeasure === 8 || (track.drumStyle === 'heavy_assault' && (stepInMeasure === 6 || stepInMeasure === 10)));
  if (isKick) {
    const kOsc = ctx.createOscillator();
    const kGain = ctx.createGain();
    kOsc.type = 'triangle';
    kOsc.frequency.setValueAtTime(140, time);
    kOsc.frequency.exponentialRampToValueAtTime(30, time + 0.08);
    kGain.gain.setValueAtTime(0.25, time);
    kGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    kOsc.connect(kGain);
    kGain.connect(masterGain);
    kOsc.start(time);
    kOsc.stop(time + 0.10);
  }

  const isSnare = (stepInMeasure === 4 || stepInMeasure === 12 || (measureIndex === 3 && stepInMeasure === 14));
  if (isSnare) {
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.value = 1.3;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.18, time);
    nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.085);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(masterGain);
    noise.start(time);
    noise.stop(time + 0.095);
  }

  if (stepInMeasure % 2 === 0 && !isSnare) {
    const hat = ctx.createBufferSource();
    hat.buffer = getNoiseBuffer(ctx);
    const hFilter = ctx.createBiquadFilter();
    hFilter.type = 'highpass';
    hFilter.frequency.setValueAtTime(6500, time);
    const hGain = ctx.createGain();
    hGain.gain.setValueAtTime(0.045, time);
    hGain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
    hat.connect(hFilter);
    hFilter.connect(hGain);
    hGain.connect(masterGain);
    hat.start(time);
    hat.stop(time + 0.03);
  }

  // 2. BASSLINE (Punchy and driving)
  const bassNote = track.bassPattern[stepIndex % track.bassPattern.length];
  if (bassNote && NOTE_FREQS[bassNote]) {
    const bOsc = ctx.createOscillator();
    const bGain = ctx.createGain();
    bOsc.type = track.bassType || 'sawtooth';
    bOsc.frequency.setValueAtTime(NOTE_FREQS[bassNote], time);

    const bFilter = ctx.createBiquadFilter();
    bFilter.type = 'lowpass';
    bFilter.frequency.setValueAtTime(track.filterFreq || 350, time);

    bGain.gain.setValueAtTime(0.20, time);
    bGain.gain.exponentialRampToValueAtTime(0.001, time + sec16th * 1.5);
    bOsc.connect(bFilter);
    bFilter.connect(bGain);
    bGain.connect(masterGain);
    bOsc.start(time);
    bOsc.stop(time + sec16th * 1.6);
  }

  // 3. ARPEGGIATOR (Fast tense 16th-note chords)
  const chordNotes = track.chords[measureIndex];
  if (chordNotes && chordNotes.length > 0) {
    const arpNote = chordNotes[stepInMeasure % chordNotes.length];
    if (arpNote && NOTE_FREQS[arpNote]) {
      const aOsc = ctx.createOscillator();
      const aGain = ctx.createGain();
      aOsc.type = 'square';
      aOsc.frequency.setValueAtTime(NOTE_FREQS[arpNote], time);
      aGain.gain.setValueAtTime(0.045, time);
      aGain.gain.exponentialRampToValueAtTime(0.001, time + sec16th * 0.82);
      aOsc.connect(aGain);
      aGain.connect(masterGain);
      aOsc.start(time);
      aOsc.stop(time + sec16th * 0.90);
    }
  }

  // 4. DRAMATIC LEAD MELODY
  const leadNote = track.leadPattern[stepIndex % track.leadPattern.length];
  if (leadNote && NOTE_FREQS[leadNote]) {
    const lOsc = ctx.createOscillator();
    const lGain = ctx.createGain();
    lOsc.type = track.leadType || 'square';
    lOsc.frequency.setValueAtTime(NOTE_FREQS[leadNote], time);
    lGain.gain.setValueAtTime(0.001, time);
    lGain.gain.linearRampToValueAtTime(0.095, time + 0.008);
    lGain.gain.exponentialRampToValueAtTime(0.001, time + sec16th * 1.6);
    lOsc.connect(lGain);
    lGain.connect(masterGain);
    lOsc.start(time);
    lOsc.stop(time + sec16th * 1.7);
  }
}

function scheduleNormalSpaceStep(stepIndex, time, ctx, masterGain) {
  if (!masterGain) return;
  const sec16th = (60 / NORMAL_SPACE_TRACK.bpm) / 4; // ~0.183s
  const stepInMeasure = stepIndex % 8;
  const measureIdx = Math.floor(stepIndex / 8) % NORMAL_SPACE_TRACK.padChords.length;

  // 1. WARM SINE BASS (Deep cosmic floor, soft and rounded)
  const bassNote = NORMAL_SPACE_TRACK.bassPattern[stepIndex % NORMAL_SPACE_TRACK.bassPattern.length];
  if (bassNote && NOTE_FREQS[bassNote]) {
    const bOsc = ctx.createOscillator();
    const bGain = ctx.createGain();
    bOsc.type = 'sine';
    bOsc.frequency.setValueAtTime(NOTE_FREQS[bassNote], time);
    bGain.gain.setValueAtTime(0.001, time);
    bGain.gain.linearRampToValueAtTime(0.14, time + 0.05);
    bGain.gain.exponentialRampToValueAtTime(0.001, time + sec16th * 3.8);
    bOsc.connect(bGain);
    bGain.connect(masterGain);
    bOsc.start(time);
    bOsc.stop(time + sec16th * 4.0);
  }

  // 2. ETHEREAL PAD CHORDS (Velvety smooth cosmic harmony)
  if (stepInMeasure === 0) {
    const chord = NORMAL_SPACE_TRACK.padChords[measureIdx];
    if (chord) {
      chord.forEach((note, nIdx) => {
        if (!NOTE_FREQS[note]) return;
        const pOsc = ctx.createOscillator();
        const pGain = ctx.createGain();
        pOsc.type = 'sine';
        pOsc.frequency.setValueAtTime(NOTE_FREQS[note], time);
        pGain.gain.setValueAtTime(0.001, time);
        pGain.gain.linearRampToValueAtTime(0.022, time + 0.25);
        pGain.gain.exponentialRampToValueAtTime(0.001, time + sec16th * 7.5);
        pOsc.connect(pGain);
        pGain.connect(masterGain);
        pOsc.start(time);
        pOsc.stop(time + sec16th * 7.8);
      });
    }
  }

  // 3. TWINKLING SPACE CHIMES (Soft triangle notes like gentle stardust)
  const chimeNote = NORMAL_SPACE_TRACK.chimesPattern[stepIndex % NORMAL_SPACE_TRACK.chimesPattern.length];
  if (chimeNote && NOTE_FREQS[chimeNote]) {
    const cOsc = ctx.createOscillator();
    const cGain = ctx.createGain();
    cOsc.type = 'triangle';
    cOsc.frequency.setValueAtTime(NOTE_FREQS[chimeNote], time);
    cGain.gain.setValueAtTime(0.001, time);
    cGain.gain.linearRampToValueAtTime(0.038, time + 0.015);
    cGain.gain.exponentialRampToValueAtTime(0.001, time + sec16th * 2.2);
    cOsc.connect(cGain);
    cGain.connect(masterGain);
    cOsc.start(time);
    cOsc.stop(time + sec16th * 2.4);
  }
}

// ============================================================
// 4. BGM SCHEDULERS & ENGINE RUNNERS
// ============================================================

function runNormalBgmScheduler() {
  if (!_normalBgmPlaying || _normalBgmPaused) return;
  try {
    const ctx = actx();
    const sec16th = (60 / NORMAL_SPACE_TRACK.bpm) / 4;
    while (_normalBgmNextTime < ctx.currentTime + 0.14) {
      scheduleNormalSpaceStep(_normalBgmStep, _normalBgmNextTime, ctx, _normalBgmGain);
      _normalBgmNextTime += sec16th;
      _normalBgmStep = (_normalBgmStep + 1) % 64;
    }
  } catch (_) {}
  _normalBgmTimer = setTimeout(runNormalBgmScheduler, 28);
}

function runBossBgmScheduler() {
  if (!_bossBgmPlaying || _bossBgmPaused) return;
  try {
    const ctx = actx();
    const track = BOSS_TRACKS[_activeBossTrackKey] || BOSS_TRACKS['alien_kragthor'];
    const sec16th = (60 / track.bpm) / 4;
    while (_bossBgmNextTime < ctx.currentTime + 0.14) {
      scheduleBossBattleStep(track, _bossBgmStep, _bossBgmNextTime, ctx, _bossBgmGain);
      _bossBgmNextTime += sec16th;
      _bossBgmStep = (_bossBgmStep + 1) % 64;
    }
  } catch (_) {}
  _bossBgmTimer = setTimeout(runBossBgmScheduler, 25);
}

// ============================================================
// 5. PUBLIC API: TRANSITIONS & PLAYBACK CONTROLS
// ============================================================

function getBossTrackKey(boss) {
  if (!boss) return 'alien_kragthor';
  const id = boss.id || '';
  if (BOSS_TRACKS[id]) return id;
  const match = Object.keys(BOSS_TRACKS).find(k => id.includes(k.replace('alien_', '')) || (boss.nameKey && boss.nameKey.includes(k.replace('alien_', ''))));
  return match || 'alien_kragthor';
}

function startNormalBgm() {
  if (_bossBgmPlaying) return; // Não toca se o boss estiver em andamento
  if (_normalBgmPlaying && !_normalBgmPaused) return;
  try {
    const ctx = actx();
    if (!_normalBgmGain) {
      _normalBgmGain = ctx.createGain();
      _normalBgmGain.connect(ctx.destination);
    }
    const targetVol = isSoundEnabled() ? 0.75 : 0.001;
    _normalBgmGain.gain.cancelScheduledValues(ctx.currentTime);
    _normalBgmGain.gain.setValueAtTime(0.001, ctx.currentTime);
    _normalBgmGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.6);

    _normalBgmPlaying = true;
    _normalBgmPaused = false;
    _normalBgmStep = 0;
    _normalBgmNextTime = ctx.currentTime + 0.05;

    clearTimeout(_normalBgmTimer);
    runNormalBgmScheduler();
  } catch (_) {}
}

function stopNormalBgm(fade = true) {
  if (!_normalBgmPlaying) return;
  try {
    const ctx = actx();
    if (_normalBgmGain) {
      if (fade) {
        _normalBgmGain.gain.cancelScheduledValues(ctx.currentTime);
        _normalBgmGain.gain.setValueAtTime(_normalBgmGain.gain.value, ctx.currentTime);
        _normalBgmGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      } else {
        _normalBgmGain.gain.setValueAtTime(0.001, ctx.currentTime);
      }
    }
  } catch (_) {}
  setTimeout(() => {
    _normalBgmPlaying = false;
    _normalBgmPaused = false;
    clearTimeout(_normalBgmTimer);
    _normalBgmTimer = null;
  }, fade ? 480 : 20);
}

function startBossBgm(boss) {
  // 1. Fade out suave da música normal da partida
  stopNormalBgm(true);

  _activeBossTrackKey = getBossTrackKey(boss);

  try {
    const ctx = actx();
    if (!_bossBgmGain) {
      _bossBgmGain = ctx.createGain();
      _bossBgmGain.connect(ctx.destination);
    }
    const targetVol = isSoundEnabled() ? 0.90 : 0.001;
    _bossBgmGain.gain.cancelScheduledValues(ctx.currentTime);
    _bossBgmGain.gain.setValueAtTime(0.001, ctx.currentTime);
    _bossBgmGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.35);

    _bossBgmPlaying = true;
    _bossBgmPaused = false;
    _bossBgmStep = 0;
    _bossBgmNextTime = ctx.currentTime + 0.05;

    clearTimeout(_bossBgmTimer);
    runBossBgmScheduler();
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

    // Retoma suavemente a trilha normal espacial se a partida continuar ativa
    if (typeof state !== 'undefined' && state && !state.paused && !state.phaseComplete) {
      startNormalBgm();
    }
  }, fade ? 480 : 20);
}

function pauseBossBgm() {
  pauseAllBgm();
}

function resumeBossBgm() {
  resumeActiveBgm();
}

function pauseAllBgm() {
  if (_bossBgmPlaying) {
    _bossBgmPaused = true;
    clearTimeout(_bossBgmTimer);
    if (_bossBgmGain) {
      try { _bossBgmGain.gain.setValueAtTime(0.001, actx().currentTime); } catch (_) {}
    }
  }
  if (_normalBgmPlaying) {
    _normalBgmPaused = true;
    clearTimeout(_normalBgmTimer);
    if (_normalBgmGain) {
      try { _normalBgmGain.gain.setValueAtTime(0.001, actx().currentTime); } catch (_) {}
    }
  }
}

function resumeActiveBgm() {
  const isMuted = !isSoundEnabled();
  if (_bossBgmPlaying && _bossBgmPaused) {
    try {
      const ctx = actx();
      _bossBgmPaused = false;
      if (_bossBgmGain) {
        _bossBgmGain.gain.cancelScheduledValues(ctx.currentTime);
        _bossBgmGain.gain.linearRampToValueAtTime(isMuted ? 0.001 : 0.90, ctx.currentTime + 0.2);
      }
      _bossBgmNextTime = ctx.currentTime + 0.05;
      runBossBgmScheduler();
    } catch (_) {}
  } else if (_normalBgmPlaying && _normalBgmPaused) {
    try {
      const ctx = actx();
      _normalBgmPaused = false;
      if (_normalBgmGain) {
        _normalBgmGain.gain.cancelScheduledValues(ctx.currentTime);
        _normalBgmGain.gain.linearRampToValueAtTime(isMuted ? 0.001 : 0.75, ctx.currentTime + 0.2);
      }
      _normalBgmNextTime = ctx.currentTime + 0.05;
      runNormalBgmScheduler();
    } catch (_) {}
  } else if (!_bossBgmPlaying && !_normalBgmPlaying && typeof state !== 'undefined' && state && !state.paused && !state.phaseComplete) {
    startNormalBgm();
  }
}

function stopAllBgm() {
  stopBossBgm(false);
  stopNormalBgm(false);
}

function updateBossBgmVolume() {
  updateAllBgmVolume();
}

function updateAllBgmVolume() {
  const isMuted = !isSoundEnabled();
  try {
    const ctx = actx();
    if (_bossBgmGain) {
      const target = (_bossBgmPlaying && !_bossBgmPaused && !isMuted) ? 0.90 : 0.001;
      _bossBgmGain.gain.cancelScheduledValues(ctx.currentTime);
      _bossBgmGain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.08);
    }
    if (_normalBgmGain) {
      const target = (_normalBgmPlaying && !_normalBgmPaused && !isMuted) ? 0.75 : 0.001;
      _normalBgmGain.gain.cancelScheduledValues(ctx.currentTime);
      _normalBgmGain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.08);
    }
  } catch (_) {}
}
