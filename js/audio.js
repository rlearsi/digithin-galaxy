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

      // 1. CRIOSTASE SIDERAL (Gelo estalando e cristalizando)
      case 'skill_freezer': {
        const iceFreqs = [3200, 2400, 3800, 1900, 4200];
        iceFreqs.forEach((f, i) => {
          const delay = i * 0.032;
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(f, t + delay);
          o.frequency.exponentialRampToValueAtTime(f * 0.55, t + delay + 0.07);
          g.gain.setValueAtTime(0.001, t + delay);
          g.gain.linearRampToValueAtTime(0.19, t + delay + 0.003);
          g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);
          o.connect(g); g.connect(ctx.destination);
          o.start(t + delay); o.stop(t + delay + 0.09);
        });
        const oSub = ctx.createOscillator(), gSub = ctx.createGain();
        oSub.type = 'sine';
        oSub.frequency.setValueAtTime(380, t);
        oSub.frequency.linearRampToValueAtTime(140, t + 0.26);
        gSub.gain.setValueAtTime(0.12, t);
        gSub.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
        oSub.connect(gSub); gSub.connect(ctx.destination);
        oSub.start(t); oSub.stop(t + 0.28);
        break;
      }

      // 2. XP EM DOBRO (Arpejo duplo ascendente dourado e ressonante)
      case 'skill_haste': {
        const xpNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        xpNotes.forEach((f, i) => {
          const delay = i * 0.04;
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(f, t + delay);
          g.gain.setValueAtTime(0.001, t + delay);
          g.gain.linearRampToValueAtTime(0.16, t + delay + 0.006);
          g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.22);
          o.connect(g); g.connect(ctx.destination);
          o.start(t + delay); o.stop(t + delay + 0.24);
        });
        const oShine = ctx.createOscillator(), gShine = ctx.createGain();
        oShine.type = 'triangle';
        oShine.frequency.setValueAtTime(2093.0, t + 0.22);
        gShine.gain.setValueAtTime(0.001, t + 0.22);
        gShine.gain.linearRampToValueAtTime(0.14, t + 0.23);
        gShine.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        oShine.connect(gShine); gShine.connect(ctx.destination);
        oShine.start(t + 0.22); oShine.stop(t + 0.46);
        break;
      }

      // 3. DILAÇÃO ESPACIAL (Som elástico de algo se esticando / warp cósmico)
      case 'skill_dilation': {
        const o = ctx.createOscillator(), g = ctx.createGain(), filter = ctx.createBiquadFilter();
        o.type = 'sawtooth';
        filter.type = 'bandpass';
        filter.Q.value = 3.5;
        o.frequency.setValueAtTime(130, t);
        o.frequency.exponentialRampToValueAtTime(90, t + 0.1);
        o.frequency.exponentialRampToValueAtTime(480, t + 0.42);
        filter.frequency.setValueAtTime(260, t);
        filter.frequency.exponentialRampToValueAtTime(1250, t + 0.42);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.24, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        o.connect(filter); filter.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.46);
        break;
      }

      // 4. VÓRTICE CÓSMICO (Vórtice / furacão gravitacional rotativo se abrindo)
      case 'skill_vortex': {
        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
        const g = ctx.createGain(), f = ctx.createBiquadFilter();
        o1.type = 'sawtooth';
        o2.type = 'triangle';
        f.type = 'lowpass';
        o1.frequency.setValueAtTime(340, t);
        o1.frequency.exponentialRampToValueAtTime(60, t + 0.46);
        o2.frequency.setValueAtTime(348, t);
        o2.frequency.exponentialRampToValueAtTime(65, t + 0.46);
        f.frequency.setValueAtTime(950, t);
        f.frequency.exponentialRampToValueAtTime(150, t + 0.48);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.28, t + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
        o1.connect(f); o2.connect(f);
        f.connect(g); g.connect(ctx.destination);
        o1.start(t); o2.start(t);
        o1.stop(t + 0.5); o2.stop(t + 0.5);
        break;
      }

      // 5. ESCUDO DE PLASMA (Barreira energética defletora se erguendo)
      case 'skill_shield': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(220, t);
        o.frequency.linearRampToValueAtTime(440, t + 0.1);
        o.frequency.setValueAtTime(660, t + 0.16);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.22, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.38);
        break;
      }

      // 6. DESACELERAÇÃO (Distorção temporal desacelerando em pitch sweep)
      case 'skill_slowdown': {
        const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = 'sine';
        f.type = 'lowpass';
        o.frequency.setValueAtTime(780, t);
        o.frequency.exponentialRampToValueAtTime(180, t + 0.4);
        f.frequency.setValueAtTime(850, t);
        f.frequency.linearRampToValueAtTime(210, t + 0.4);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.22, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
        o.connect(f); f.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.44);
        break;
      }

      // 7. ECO CÓSMICO (Sonar astronômico / pulso de mira de autodestruição)
      case 'skill_autodestroy': {
        const pings = [1174.66, 1479.98, 1760.0];
        pings.forEach((f, i) => {
          const delay = i * 0.07;
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(f, t + delay);
          g.gain.setValueAtTime(0.001, t + delay);
          g.gain.linearRampToValueAtTime(0.18, t + delay + 0.008);
          g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.13);
          o.connect(g); g.connect(ctx.destination);
          o.start(t + delay); o.stop(t + delay + 0.15);
        });
        break;
      }

      // 8. DECODIFICADOR CÓSMICO (Bipe digital de decodificação de dados)
      case 'skill_decoder': {
        const bleeps = [1318.5, 1661.2, 1975.5, 2637.0];
        bleeps.forEach((f, i) => {
          const delay = i * 0.045;
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(f, t + delay);
          g.gain.setValueAtTime(0.001, t + delay);
          g.gain.linearRampToValueAtTime(0.12, t + delay + 0.004);
          g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.06);
          o.connect(g); g.connect(ctx.destination);
          o.start(t + delay); o.stop(t + delay + 0.07);
        });
        break;
      }

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

// ------------------------------------------------------------
// 2b. SELECTABLE CALM AMBIENT TRACKS (NORMAL GAMEPLAY WITHOUT BOSS)
// Each track: 8 chords x 16 steps (16th notes) = 128-step loop with a
// through-composed melody (no repeated 4-bar phrase), layered bass,
// pad, arpeggio and lead voices; optional echo bus / soft percussion.
// Tokens: note name (e.g. C5), '.' = rest. Bass tokens: r=root f=fifth o=octave.
// ------------------------------------------------------------
function noteFreq(name) {
  if (NOTE_FREQS[name]) return NOTE_FREQS[name];
  const m = /^([A-G])([#b]?)(\d)$/.exec(name || '');
  if (!m) return 0;
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
  const acc = m[2] === '#' ? 1 : (m[2] === 'b' ? -1 : 0);
  const midi = 12 * (parseInt(m[3], 10) + 1) + base + acc;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function _seq(str) {
  return str.trim().split(/\s+/).map(tok => (tok === '.' ? null : tok));
}

function _buildAmbientTrack(def) {
  return {
    bpm: def.bpm,
    bass: def.bass,
    pad: def.pad,
    lead: def.lead,
    arp: def.arp || null,
    echo: def.echo || null,
    perc: def.perc || null,
    prog: def.prog.map(p => ({ root: p[0], notes: p[1].trim().split(/\s+/) })),
    bassPat: _seq(def.bassPat),
    arpPat: def.arpPat ? _seq(def.arpPat) : null,
    melody: _seq(def.melody)
  };
}

const AMBIENT_TRACKS = {
  // Aurora Lullaby — C major music-box over a gentle harp arpeggio
  aurora_lullaby: _buildAmbientTrack({
    bpm: 68,
    bass: { wave: 'sine', vol: 0.13, dur: 7 },
    pad: { wave: 'sine', vol: 0.02, att: 0.4 },
    lead: { wave: 'triangle', vol: 0.05, dur: 3.5, att: 0.01, lp: 3200 },
    arp: { wave: 'sine', vol: 0.02, dur: 2.5 },
    echo: { time: 0.44, fb: 0.3, wet: 0.25 },
    prog: [
      ['C2', 'C4 E4 G4 B4'], ['A1', 'A3 C4 E4 G4'], ['F1', 'F3 A3 C4 E4'], ['G1', 'G3 B3 D4 E4'],
      ['E2', 'E3 G3 B3 D4'], ['A1', 'A3 C4 E4 G4'], ['D2', 'D3 F3 A3 C4'], ['G1', 'G3 C4 D4 F4']
    ],
    bassPat: 'r . . . . . . . f . . . . . o .',
    arpPat: '0 . 1 . 2 . 3 . 2 . 1 . 0 . 1 .',
    melody: [
      'E5 . . G5 . . B5 . . C6 . B5 . G5 . .',
      'A5 . . G5 . E5 . . C5 . E5 . . G5 . .',
      'F5 . A5 . . C6 . A5 . . G5 . F5 . E5 .',
      'D5 . . G5 . . B5 . . E6 . D6 . . B5 .',
      'G5 . B5 . . D6 . B5 . . G5 . E5 . G5 .',
      'E5 . . A5 . . C6 . E6 . . D6 . C6 . .',
      'D6 . C6 . A5 . . F5 . A5 . . C6 . D6 .',
      'C6 . . . D6 . . . B5 . . . G5 . . .'
    ].join(' ')
  }),

  // Lunar Garden — A minor, slow breathing flute over deep sine bass
  lunar_garden: _buildAmbientTrack({
    bpm: 62,
    bass: { wave: 'sine', vol: 0.14, dur: 9 },
    pad: { wave: 'sine', vol: 0.022, att: 0.5 },
    lead: { wave: 'square', vol: 0.026, dur: 4, att: 0.05, lp: 1400 },
    echo: { time: 0.5, fb: 0.35, wet: 0.3 },
    prog: [
      ['A1', 'A3 C4 E4 B4'], ['F1', 'F3 A3 C4 E4'], ['C2', 'C4 E4 G4 D5'], ['G1', 'G3 B3 D4 A4'],
      ['A1', 'A3 C4 E4 B4'], ['D2', 'D3 F3 A3 E4'], ['F1', 'F3 A3 C4 E4'], ['E2', 'E3 A3 B3 D4']
    ],
    bassPat: 'r . . . . . . . . . . . f . . .',
    melody: [
      'E5 . . . A5 . . C6 . . B5 . A5 . . .',
      'C6 . . A5 . . . F5 . . A5 . C6 . . .',
      'E5 . G5 . . . C6 . . D6 . C6 . . G5 .',
      'B5 . . D6 . . . A5 . . G5 . . B5 . .',
      'A5 . . . E6 . . . D6 . C6 . B5 . A5 .',
      'F5 . A5 . . E6 . D6 . . A5 . F5 . . .',
      'A5 . C6 . E6 . . C6 . . A5 . . G5 . .',
      'B5 . . . D6 . . . E6 . . . . . . .'
    ].join(' ')
  }),

  // Twilight Station — E-flat major, warm pulsing bass, soft square lead
  twilight_station: _buildAmbientTrack({
    bpm: 76,
    bass: { wave: 'triangle', vol: 0.16, dur: 3 },
    pad: { wave: 'triangle', vol: 0.028, att: 0.3, lp: 1800 },
    lead: { wave: 'square', vol: 0.03, dur: 3, att: 0.02, lp: 2200 },
    arp: { wave: 'triangle', vol: 0.02, dur: 2 },
    echo: { time: 0.4, fb: 0.2, wet: 0.15 },
    prog: [
      ['Eb2', 'Eb4 G4 Bb4 D5'], ['C2', 'C4 Eb4 G4 Bb4'], ['Ab1', 'Ab3 C4 Eb4 G4'], ['Bb1', 'Bb3 D4 F4 A4'],
      ['G1', 'G3 Bb3 D4 F4'], ['C2', 'C4 Eb4 G4 Bb4'], ['F1', 'F3 Ab3 C4 Eb4'], ['Bb1', 'Bb3 D4 F4 Ab4']
    ],
    bassPat: 'r . . . . . o . . . . . r . . .',
    arpPat: '. . 2 . . . 3 . . . 2 . . . 1 .',
    melody: [
      'G5 . Bb5 . . . D6 . C6 . Bb5 . . . G5 .',
      'Eb5 . G5 . Bb5 . . G5 . . C6 . Bb5 . . .',
      'Ab5 . . C6 . Eb6 . . D6 . C6 . Ab5 . . .',
      'D6 . . F6 . . D6 . C6 . Bb5 . . A5 . .',
      'Bb5 . D6 . . F6 . . Eb6 . D6 . Bb5 . G5 .',
      'G5 . . Bb5 . C6 . . Eb6 . . D6 . C6 . Bb5',
      'Ab5 . C6 . . Eb6 . C6 . . Ab5 . F5 . . .',
      'D6 . . . F6 . . . Ab5 . . . Bb5 . . .'
    ].join(' ')
  }),

  // Crystal Cavern — E minor, glassy bells with long echoes
  crystal_cavern: _buildAmbientTrack({
    bpm: 60,
    bass: { wave: 'sine', vol: 0.12, dur: 10 },
    pad: { wave: 'sine', vol: 0.02, att: 0.6 },
    lead: { wave: 'triangle', vol: 0.06, dur: 4, att: 0.005, lp: 4200 },
    arp: { wave: 'triangle', vol: 0.035, dur: 2 },
    echo: { time: 0.5, fb: 0.45, wet: 0.4 },
    prog: [
      ['E2', 'E3 G3 B3 F#4'], ['C2', 'C4 E4 G4 B4'], ['G1', 'G3 B3 D4 A4'], ['D2', 'D4 F#4 A4 B4'],
      ['E2', 'E3 G3 B3 F#4'], ['A1', 'A3 C4 E4 B4'], ['C2', 'C4 E4 G4 B4'], ['B1', 'B3 E4 F#4 A4']
    ],
    bassPat: 'r . . . . . . . . . . . . . . .',
    arpPat: '0 . 2 . 3 . 2 . 1 . 2 . 3 . 2 .',
    melody: [
      'B5 . E6 . . B5 . G5 . B5 . . F#5 . . .',
      'G5 . C6 . E6 . . C6 . . B5 . G5 . . .',
      'D6 . B5 . G5 . . B5 . D6 . . A5 . . .',
      'F#5 . A5 . B5 . . D6 . . B5 . A5 . F#5 .',
      'E6 . . B5 . G5 . E5 . G5 . B5 . . E6 .',
      'E5 . A5 . C6 . . E6 . . D6 . C6 . B5 .',
      'E6 . D6 . C6 . . B5 . G5 . . E5 . . .',
      'F#5 . . . A5 . . . B5 . . . . . . .'
    ].join(' ')
  }),

  // Nebula Sunrise — G major, warm filtered strings with a feather-soft pulse
  nebula_sunrise: _buildAmbientTrack({
    bpm: 74,
    bass: { wave: 'triangle', vol: 0.15, dur: 5 },
    pad: { wave: 'sawtooth', vol: 0.014, att: 0.5, lp: 900 },
    lead: { wave: 'triangle', vol: 0.06, dur: 3.5, att: 0.015, lp: 3500 },
    arp: { wave: 'triangle', vol: 0.02, dur: 2.5 },
    echo: { time: 0.4, fb: 0.25, wet: 0.2 },
    perc: { kick: 0.12, hat: 0.012 },
    prog: [
      ['G1', 'G3 B3 D4 F#4'], ['E2', 'E3 G3 B3 D4'], ['C2', 'C4 E4 G4 B4'], ['D2', 'D4 F#4 A4 C5'],
      ['B1', 'B3 D4 F#4 A4'], ['E2', 'E3 G3 B3 D4'], ['A1', 'A3 C4 E4 G4'], ['D2', 'D3 G3 A3 C4']
    ],
    bassPat: 'r . . . r . . . f . . . r . o .',
    arpPat: '. . 1 . . . 2 . . . 3 . . . 2 .',
    melody: [
      'B5 . . D6 . . G6 . . D6 . B5 . . A5 .',
      'G5 . B5 . . E6 . . D6 . B5 . G5 . . .',
      'E6 . . D6 . C6 . . B5 . G5 . . C6 . .',
      'A5 . C6 . D6 . . F#6 . . E6 . D6 . C6 .',
      'D6 . F#5 . A5 . . D6 . . B5 . A5 . F#5 .',
      'G5 . B5 . D6 . . E6 . . G6 . E6 . D6 .',
      'C6 . E6 . . A5 . C6 . . E6 . D6 . C6 .',
      'A5 . . . C6 . . . D6 . . . . . . .'
    ].join(' ')
  }),

  // Silent Void — D minor/Phrygian drone, long silences, lonely distant notes
  silent_void: _buildAmbientTrack({
    bpm: 54,
    bass: { wave: 'sine', vol: 0.12, dur: 14 },
    pad: { wave: 'triangle', vol: 0.03, att: 1.2, lp: 700 },
    lead: { wave: 'sine', vol: 0.06, dur: 10, att: 0.15, lp: 2500 },
    arp: { wave: 'sine', vol: 0.012, dur: 6 },
    echo: { time: 0.62, fb: 0.55, wet: 0.5 },
    prog: [
      ['D2', 'D3 A3 D4 E4'], ['D2', 'D3 A3 Eb4 A4'], ['Bb1', 'Bb3 F4 A4 D5'], ['A1', 'A3 E4 G4 B4'],
      ['D2', 'D3 A3 D4 E4'], ['F1', 'F3 C4 E4 G4'], ['Eb2', 'Eb3 Bb3 D4 G4'], ['A1', 'A3 D4 E4 G4']
    ],
    bassPat: 'r . . . . . . . . . . . . . . .',
    arpPat: '. . . . . . . . . . . . . . 3 .',
    melody: [
      'A5 . . . . . . . . . . . . . . .',
      '. . . . . . . . E6 . . . . . . .',
      'D6 . . . . . . . . . F5 . . . . .',
      '. . . . . . . . . . . . . . . .',
      '. . A5 . . . . . . . . . . . . .',
      '. . . . . . G5 . . . . . . . . .',
      'Bb5 . . . . . . . . . . . . . . .',
      '. . . . . . . . . . D6 . . . . .'
    ].join(' ')
  })
};

// Ordered list of selectable ambient themes ('cosmic_drift' = original theme)
const BGM_TRACK_KEYS = ['cosmic_drift', 'aurora_lullaby', 'lunar_garden', 'twilight_station', 'crystal_cavern', 'nebula_sunrise', 'silent_void'];
let _normalBgmKey = 'cosmic_drift';
let _bgmTrackSetting = 'cosmic_drift';
try {
  const savedTrack = localStorage.getItem('digithin_galaxy_bgm_track');
  if (savedTrack && BGM_TRACK_KEYS.includes(savedTrack)) _bgmTrackSetting = savedTrack;
} catch (_) {}
_normalBgmKey = _bgmTrackSetting;

let _normalEcho = null;
function _disposeNormalEcho() {
  if (!_normalEcho) return;
  try {
    ['send', 'delay', 'fb', 'wet'].forEach(k => { if (_normalEcho[k]) _normalEcho[k].disconnect(); });
  } catch (_) {}
  _normalEcho = null;
}

function _ensureNormalEcho(track, ctx, master) {
  if (_normalEcho && _normalEcho.key === _normalBgmKey) return _normalEcho.send;
  _disposeNormalEcho();
  _normalEcho = { key: _normalBgmKey, send: null };
  if (track.echo) {
    const send = ctx.createGain();
    const delay = ctx.createDelay(1.5);
    const fb = ctx.createGain();
    const wet = ctx.createGain();
    delay.delayTime.value = track.echo.time;
    fb.gain.value = track.echo.fb;
    wet.gain.value = track.echo.wet;
    send.connect(delay);
    delay.connect(fb); fb.connect(delay);
    delay.connect(wet); wet.connect(master);
    _normalEcho = { key: _normalBgmKey, send, delay, fb, wet };
  }
  return _normalEcho.send;
}

function _ambientVoice(ctx, master, echoSend, wave, freq, time, dur, vol, att, lp) {
  if (!freq) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = wave;
  o.frequency.setValueAtTime(freq, time);
  if (lp) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(lp, time);
    o.connect(f); f.connect(g);
  } else {
    o.connect(g);
  }
  g.gain.setValueAtTime(0.001, time);
  g.gain.linearRampToValueAtTime(vol, time + att);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  g.connect(master);
  if (echoSend) g.connect(echoSend);
  o.start(time);
  o.stop(time + dur + 0.05);
}

function scheduleAmbientStep(track, stepIndex, time, ctx, master) {
  if (!master || !track) return;
  const echoSend = _ensureNormalEcho(track, ctx, master);
  const sec16 = (60 / track.bpm) / 4;
  const s = stepIndex % track.melody.length;
  const chord = track.prog[Math.floor(s / 16) % track.prog.length];
  const sc = s % 16;

  // Bass
  const bTok = track.bassPat[sc];
  if (bTok) {
    const ratio = bTok === 'f' ? 1.5 : (bTok === 'o' ? 2 : 1);
    _ambientVoice(ctx, master, null, track.bass.wave, noteFreq(chord.root) * ratio, time, sec16 * track.bass.dur, track.bass.vol, 0.04, 0);
  }

  // Pad (one swelling chord per bar)
  if (sc === 0) {
    chord.notes.forEach(n => {
      _ambientVoice(ctx, master, null, track.pad.wave, noteFreq(n), time, sec16 * 15.5, track.pad.vol, track.pad.att, track.pad.lp || 0);
    });
  }

  // Arpeggio
  if (track.arp && track.arpPat) {
    const aTok = track.arpPat[sc];
    if (aTok !== null && aTok !== undefined) {
      _ambientVoice(ctx, master, echoSend, track.arp.wave, noteFreq(chord.notes[parseInt(aTok, 10)]), time, sec16 * track.arp.dur, track.arp.vol, 0.01, 0);
    }
  }

  // Lead melody
  const lTok = track.melody[s];
  if (lTok) {
    _ambientVoice(ctx, master, echoSend, track.lead.wave, noteFreq(lTok), time, sec16 * track.lead.dur, track.lead.vol, track.lead.att, track.lead.lp || 0);
  }

  // Feather-soft percussion (optional)
  if (track.perc) {
    if (sc === 0 || sc === 10) {
      const kOsc = ctx.createOscillator();
      const kGain = ctx.createGain();
      kOsc.type = 'sine';
      kOsc.frequency.setValueAtTime(110, time);
      kOsc.frequency.exponentialRampToValueAtTime(42, time + 0.14);
      kGain.gain.setValueAtTime(track.perc.kick, time);
      kGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
      kOsc.connect(kGain); kGain.connect(master);
      kOsc.start(time); kOsc.stop(time + 0.2);
    }
    if (sc % 4 === 2) {
      const hat = ctx.createBufferSource();
      hat.buffer = getNoiseBuffer(ctx);
      const hf = ctx.createBiquadFilter();
      hf.type = 'highpass';
      hf.frequency.setValueAtTime(7000, time);
      const hg = ctx.createGain();
      hg.gain.setValueAtTime(track.perc.hat, time);
      hg.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      hat.connect(hf); hf.connect(hg); hg.connect(master);
      hat.start(time); hat.stop(time + 0.035);
    }
  }
}

function getBgmTrackKey() {
  return _bgmTrackSetting;
}

let _bgmPreviewTimer = null;

function setBgmTrack(key, preview = false) {
  if (!BGM_TRACK_KEYS.includes(key)) return;
  _bgmTrackSetting = key;
  try { localStorage.setItem('digithin_galaxy_bgm_track', key); } catch (_) {}

  const gameActive = !!document.getElementById('screen-game')?.classList.contains('active');
  clearTimeout(_bgmPreviewTimer);

  if (_normalBgmPlaying && !_normalBgmPaused) {
    // Switch seamlessly mid-match
    stopNormalBgm(false);
    startNormalBgm();
  } else if (_normalBgmPlaying && _normalBgmPaused) {
    // Paused match: next resume uses the new track from its beginning
    _normalBgmKey = key;
    _normalBgmStep = 0;
    _disposeNormalEcho();
  } else if (preview && !gameActive && !_bossBgmPlaying && isSoundEnabled()) {
    // Menu preview (short audition)
    startNormalBgm();
    _bgmPreviewTimer = setTimeout(() => {
      const inGame = !!document.getElementById('screen-game')?.classList.contains('active');
      if (!inGame) stopNormalBgm(true);
    }, 8000);
  }
}

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
    const ambient = AMBIENT_TRACKS[_normalBgmKey];
    const bpm = ambient ? ambient.bpm : NORMAL_SPACE_TRACK.bpm;
    const loopLen = ambient ? ambient.melody.length : 64;
    const sec16th = (60 / bpm) / 4;
    while (_normalBgmNextTime < ctx.currentTime + 0.14) {
      if (ambient) {
        scheduleAmbientStep(ambient, _normalBgmStep, _normalBgmNextTime, ctx, _normalBgmGain);
      } else {
        scheduleNormalSpaceStep(_normalBgmStep, _normalBgmNextTime, ctx, _normalBgmGain);
      }
      _normalBgmNextTime += sec16th;
      _normalBgmStep = (_normalBgmStep + 1) % loopLen;
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
    _normalBgmKey = _bgmTrackSetting;
    _disposeNormalEcho();
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
  clearTimeout(_normalBgmTimer);
  _normalBgmTimer = null;

  try {
    const ctx = actx();
    if (_normalBgmGain) {
      if (fade) {
        _normalBgmGain.gain.cancelScheduledValues(ctx.currentTime);
        _normalBgmGain.gain.setValueAtTime(_normalBgmGain.gain.value, ctx.currentTime);
        _normalBgmGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      } else {
        _normalBgmGain.gain.cancelScheduledValues(ctx.currentTime);
        _normalBgmGain.gain.setValueAtTime(0.001, ctx.currentTime);
      }
    }
  } catch (_) {}

  if (!fade) {
    _normalBgmPlaying = false;
    _normalBgmPaused = false;
    _disposeNormalEcho();
    return;
  }

  setTimeout(() => {
    _normalBgmPlaying = false;
    _normalBgmPaused = false;
    clearTimeout(_normalBgmTimer);
    _normalBgmTimer = null;
    _disposeNormalEcho();
  }, 480);
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
  clearTimeout(_bossBgmTimer);
  _bossBgmTimer = null;

  try {
    const ctx = actx();
    if (_bossBgmGain) {
      if (fade) {
        _bossBgmGain.gain.cancelScheduledValues(ctx.currentTime);
        _bossBgmGain.gain.setValueAtTime(_bossBgmGain.gain.value, ctx.currentTime);
        _bossBgmGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      } else {
        _bossBgmGain.gain.cancelScheduledValues(ctx.currentTime);
        _bossBgmGain.gain.setValueAtTime(0.001, ctx.currentTime);
      }
    }
  } catch (_) {}

  if (!fade) {
    _bossBgmPlaying = false;
    _bossBgmPaused = false;
    return;
  }

  setTimeout(() => {
    _bossBgmPlaying = false;
    _bossBgmPaused = false;
    clearTimeout(_bossBgmTimer);
    _bossBgmTimer = null;

    // Retoma suavemente a trilha normal espacial se a partida continuar ativa
    const screenGame = document.getElementById('screen-game');
    const isGameActive = screenGame?.classList.contains('active') && (typeof state === 'undefined' || !state?.gameOver);
    if (isGameActive && (typeof state === 'undefined' || !state?.bossBattle || !state.bossBattle.active)) {
      startNormalBgm();
    }
  }, 480);
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

window.BGM_TRACK_KEYS = BGM_TRACK_KEYS;
window.getBgmTrackKey = getBgmTrackKey;
window.setBgmTrack = setBgmTrack;
window.startNormalBgm = startNormalBgm;

// Autostart the saved ambient track on page load (menu ambience).
// Browsers keep the AudioContext suspended until a user gesture, so the
// music is also (re)triggered on the first interaction.
function autoStartSavedBgm() {
  if (_normalBgmPlaying || _bossBgmPlaying) return;
  const inGame = !!document.getElementById('screen-game')?.classList.contains('active');
  if (inGame) return;
  startNormalBgm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoStartSavedBgm, { once: true });
} else {
  autoStartSavedBgm();
}
['pointerdown', 'keydown', 'click'].forEach(evt => {
  document.addEventListener(evt, () => { actx(); autoStartSavedBgm(); }, { once: true });
});
window.stopNormalBgm = stopNormalBgm;
window.startBossBgm = startBossBgm;
window.stopBossBgm = stopBossBgm;
window.pauseBossBgm = pauseBossBgm;
window.resumeBossBgm = resumeBossBgm;
window.stopAllBgm = stopAllBgm;
window.pauseAllBgm = pauseAllBgm;
window.resumeActiveBgm = resumeActiveBgm;
window.updateAllBgmVolume = updateAllBgmVolume;
