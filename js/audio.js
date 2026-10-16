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
