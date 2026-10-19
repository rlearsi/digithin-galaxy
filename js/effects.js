/* ================================================
   DIGITHIN GALAXY — js/effects.js
   Particles, celestial debris canvas engine, explosions and confetti
   ================================================ */
'use strict';

// Particle explosion (fallback)
function spawnParticles(el, pts) {
  const r    = el.getBoundingClientRect();
  const cx   = r.left + r.width  / 2;
  const cy   = r.top  + r.height / 2;
  const cols = ['#6366f1','#38bdf8','#f59e0b','#22c55e','#f472b6','#a78bfa','#e879f9'];
  const cnt  = Math.min(pts + 3, 14);

  for (let i = 0; i < cnt; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const sz    = rand(4, 9);
    const angle = rand(0, Math.PI * 2);
    const dist  = rand(20, 65);
    p.style.cssText = `width:${sz}px;height:${sz}px;background:${pick(cols)};left:${cx}px;top:${cy}px;--tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist}px;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

// ============================================================
// REALISTIC CELESTIAL DEBRIS ENGINE (CANVAS 60FPS PHYSICS)
// Destroços cósmicos caindo fluidamente até o final da tela,
// desfazendo-se e soltando faíscas estelares durante a descida
// ============================================================
let debrisParticles = [];
let microSparks = [];
let debrisCanvas = null;
let debrisCtx = null;
let debrisRafId = null;
let lastDebrisTime = 0;

function initDebrisCanvas() {
  debrisCanvas = document.getElementById('debris-canvas');
  if (debrisCanvas) {
    debrisCtx = debrisCanvas.getContext('2d');
  }
}

function syncDebrisCanvasSize() {
  if (!debrisCanvas) initDebrisCanvas();
  if (!debrisCanvas) return false;
  const gameAreaEl = document.getElementById('game-area');
  if (!gameAreaEl) return false;
  const w = gameAreaEl.clientWidth || 300;
  const h = gameAreaEl.clientHeight || 600;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const targetW = Math.floor(w * dpr);
  const targetH = Math.floor(h * dpr);
  if (debrisCanvas.width !== targetW || debrisCanvas.height !== targetH) {
    debrisCanvas.width = targetW;
    debrisCanvas.height = targetH;
    debrisCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  return true;
}

// Paletas fallback fiéis aos pixel arts dos assets básicos caso o sprite ainda não tenha carregado
const FALLBACK_SPRITE_PALETTES = {
  'rocks/rock1': ['#94A3B8', '#475569', '#E2E8F0', '#1E293B', '#CBD5E1'],
  'rocks/rock2': ['#C084FC', '#1E293B', '#F8FAFC', '#9333EA', '#7C3AED'],
  'rocks/rock3': ['#00E5FF', '#38BDF8', '#1E142D', '#0284C7', '#E0F2FE'],
  'rocks/rock4': ['#C084FC', '#475569', '#E2D4F0', '#6B21A8', '#94A3B8'],
  'rocks/rock5': ['#D97706', '#9A3412', '#FEF08A', '#78350F', '#F59E0B'],
  'objects/wildcard_bomb': ['#EF4444', '#F59E0B', '#FEE2E2', '#7F1D1D', '#F97316']
};

const spritePaletteCache = new Map();
let spriteExtractCanvas = null;
let spriteExtractCtx = null;

function getPaletteForFallingObject(el) {
  if (!el) return ['#94A3B8', '#475569', '#38BDF8', '#E2E8F0'];

  const imgEl = el.querySelector('img.falling-object-img') || el.querySelector('img');
  const dataObj = el.getAttribute('data-object') || '';

  // 1. Checa cache pelo src da imagem ou data-object
  const src = imgEl ? (imgEl.currentSrc || imgEl.src) : '';
  if (src && spritePaletteCache.has(src)) {
    return spritePaletteCache.get(src);
  }
  if (dataObj && spritePaletteCache.has(dataObj)) {
    return spritePaletteCache.get(dataObj);
  }

  // 1.1 Extrai paleta nativa de pixel art caso seja SVG inline (ex: Chefões Alienígenas)
  const svgRects = el.querySelectorAll('svg rect[fill]');
  if (svgRects && svgRects.length > 0) {
    const fills = new Set();
    svgRects.forEach(r => {
      const f = r.getAttribute('fill');
      if (f && f !== 'none' && f !== 'transparent') fills.add(f.toUpperCase());
    });
    if (fills.size > 0) {
      const extractedSvgColors = Array.from(fills);
      return extractedSvgColors;
    }
  }

  // 2. Extrai paleta real dos pixels desenhados no sprite pixel art
  if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
    try {
      if (!spriteExtractCanvas) {
        spriteExtractCanvas = document.createElement('canvas');
        spriteExtractCtx = spriteExtractCanvas.getContext('2d', { willReadFrequently: true });
      }
      const w = imgEl.naturalWidth;
      const h = imgEl.naturalHeight;
      spriteExtractCanvas.width = w;
      spriteExtractCanvas.height = h;
      spriteExtractCtx.clearRect(0, 0, w, h);
      spriteExtractCtx.drawImage(imgEl, 0, 0, w, h);

      const imgData = spriteExtractCtx.getImageData(0, 0, w, h).data;
      const colorCounts = new Map();

      for (let i = 0; i < imgData.length; i += 4) {
        const a = imgData[i + 3];
        if (a < 50) continue; // ignora pixels transparentes
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
      }

      if (colorCounts.size > 0) {
        // Ordena pelas cores mais presentes no pixel art
        const sorted = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]);
        const extracted = sorted.map(e => e[0]);
        if (src) spritePaletteCache.set(src, extracted);
        if (dataObj) spritePaletteCache.set(dataObj, extracted);
        return extracted;
      }
    } catch (e) {
      // Ignora erro de leitura em caso de restrição e segue para fallback
    }
  }

  // 3. Fallbacks tabelados por data-object (ex: 'rock1', 'rocks/rock1')
  if (dataObj) {
    if (FALLBACK_SPRITE_PALETTES[dataObj]) return FALLBACK_SPRITE_PALETTES[dataObj];
    if (FALLBACK_SPRITE_PALETTES['rocks/' + dataObj]) return FALLBACK_SPRITE_PALETTES['rocks/' + dataObj];
    if (FALLBACK_SPRITE_PALETTES['objects/' + dataObj]) return FALLBACK_SPRITE_PALETTES['objects/' + dataObj];
  }

  // 4. Fallback padrão cósmico sóbrio mineral
  return ['#94A3B8', '#475569', '#38BDF8', '#64748B', '#E2E8F0', '#1E293B'];
}

function spawnCelestialExplosion(el, text) {
  if (!el) return;
  const gameAreaEl = document.getElementById('game-area');
  if (!gameAreaEl) return;
  if (!syncDebrisCanvasSize()) return;

  const gRect = gameAreaEl.getBoundingClientRect();
  const r = el.getBoundingClientRect();

  // Origem relativa ao tabuleiro (#game-area)
  const cx = (r.left + r.width / 2) - gRect.left;
  const cy = (r.top + r.height / 2) - gRect.top;

  const cleanText = (typeof text === 'string' ? text : (el.textContent || '')).trim();
  const len = cleanText.length || 4;
  const isLetter = el.classList?.contains('letter') || len <= 1;
  const isSyllable = el.classList?.contains('syllable') || (!isLetter && len <= 3);
  const isWildcard = el.classList?.contains('wildcard');

  // Quantidade de destroços e micro-faíscas calibrada de acordo com o tamanho do vocábulo
  let count;
  let sparkCount;
  let baseSize;

  if (isWildcard) {
    count = 34 + Math.floor(Math.random() * 6);
    sparkCount = 18 + Math.floor(Math.random() * 5);
    baseSize = 4.5;
  } else if (isLetter) {
    // Letra única: poucos destroços (5 a 7) para manter foco limpo e compacto
    count = 5 + Math.floor(Math.random() * 3);
    sparkCount = 4 + Math.floor(Math.random() * 3);
    baseSize = 3.2;
  } else if (isSyllable) {
    // Sílabas (2 ou 3 letras): destroços moderados (8 a 11)
    count = 8 + Math.floor(Math.random() * 4);
    sparkCount = 6 + Math.floor(Math.random() * 3);
    baseSize = 3.8;
  } else {
    // Palavras: escala progressiva aumentando à medida que o vocábulo for maior
    const scaledCount = Math.round(10 + len * 1.8);
    count = Math.min(36, Math.max(14, scaledCount + (Math.floor(Math.random() * 5) - 2)));
    sparkCount = Math.min(20, Math.max(8, Math.round(6 + len * 1.1)));
    baseSize = 4.5;
  }

  // Paleta de cores extraída fielmente dos pixels reais do sprite pixel art do objeto
  const colors = getPaletteForFallingObject(el);
  const shapes = ['shard', 'rect', 'diamond', 'chip', 'orb'];

  for (let i = 0; i < count; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const sz = shape === 'orb'
      ? (baseSize * 0.8 + Math.random() * 2.5)
      : (baseSize + Math.random() * (isLetter ? 3.0 : 4.5));

    // Dispersão inicial ao longo da largura da palavra
    const xOffset = (Math.random() - 0.5) * (r.width * 0.9);
    const startX = cx + xOffset;
    const startY = cy + (Math.random() - 0.5) * 14;

    // Explosão em arco: impulso inicial para cima e para os lados (-150 a -30 graus)
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
    const speed = (isLetter ? 60 : 70) + Math.random() * (isLetter ? 120 : 160);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed * 0.75 - 35;

    debrisParticles.push({
      x: startX,
      y: startY,
      startY: startY,
      vx,
      vy,
      gravity: 540 + Math.random() * 320, // Gravidade constante que puxa até o fundo da tela
      color,
      size: sz,
      aspect: 1.2 + Math.random() * 1.6,
      shape,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 14,
      pitch: Math.random() * Math.PI * 2,
      vPitch: (Math.random() - 0.5) * 16,
      alpha: 1.0,
      sparkTimer: Math.random() * 0.05
    });
  }

  // Anel de micro-faíscas cósmicas no centro da detonação
  for (let s = 0; s < sparkCount; s++) {
    const sparkAngle = Math.random() * Math.PI * 2;
    const sparkSpd = (isLetter ? 40 : 50) + Math.random() * (isLetter ? 70 : 120);
    microSparks.push({
      x: cx,
      y: cy,
      vx: Math.cos(sparkAngle) * sparkSpd,
      vy: Math.sin(sparkAngle) * sparkSpd,
      size: (isLetter ? 1.5 : 2.0) + Math.random() * (isLetter ? 1.8 : 2.4),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1.0,
      decay: 2.6 + Math.random() * 2.4
    });
  }

  if (!debrisRafId) {
    lastDebrisTime = performance.now();
    debrisRafId = requestAnimationFrame(runDebrisLoop);
  }
}

function runDebrisLoop(timestamp) {
  if (!lastDebrisTime) lastDebrisTime = timestamp;
  const dt = Math.min((timestamp - lastDebrisTime) / 1000, 0.05);
  lastDebrisTime = timestamp;

  const gameAreaEl = document.getElementById('game-area');
  if (!gameAreaEl || !debrisCtx) {
    debrisRafId = null;
    return;
  }

  const w = gameAreaEl.clientWidth || 300;
  const h = gameAreaEl.clientHeight || 600;

  debrisCtx.clearRect(0, 0, w, h);

  // Atualização & Renderização dos Destroços Celestes (caindo até o final da tela)
  for (let i = debrisParticles.length - 1; i >= 0; i--) {
    const p = debrisParticles[i];

    // Física Contínua 60 FPS (sem travamentos nem paradas)
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= (1 - 0.30 * dt); // Suave resistência do ar
    p.rot += p.vRot * dt;
    p.pitch += p.vPitch * dt;

    // Distância de descida percorrida até o fundo da tela
    const totalDescent = Math.max(100, h - p.startY);
    const descentProgress = Math.max(0, (p.y - p.startY) / totalDescent);

    // Desfazendo-se continuamente enquanto vai descendo
    // Permanece brilhante no topo e vai sumindo de forma suave até o fundo
    p.alpha = Math.max(0, 1.0 - Math.pow(descentProgress, 1.35));

    // Desfazendo-se: Solta micro-faíscas/poeira estelar durante a queda
    p.sparkTimer += dt;
    if (p.sparkTimer > 0.038 && p.alpha > 0.12 && Math.random() < 0.65) {
      p.sparkTimer = 0;
      microSparks.push({
        x: p.x + (Math.random() - 0.5) * 4,
        y: p.y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 20,
        vy: 20 + Math.random() * 45,
        size: 1.5 + Math.random() * 2.2,
        color: p.color,
        alpha: p.alpha * 0.9,
        decay: 1.8 + Math.random() * 2.2
      });
    }

    // Encolhimento sutil conforme se desfaz
    const currentSize = Math.max(1.5, p.size * (1 - descentProgress * 0.40));

    // Desenha fragmento com rotação e tombo 3D fluido
    debrisCtx.save();
    debrisCtx.translate(p.x, p.y);
    debrisCtx.rotate(p.rot);
    debrisCtx.scale(1, Math.cos(p.pitch)); // Efeito 3D de flip/tombo
    debrisCtx.globalAlpha = p.alpha;
    debrisCtx.fillStyle = p.color;

    if (p.shape === 'rect' || p.shape === 'shard') {
      debrisCtx.fillRect(-currentSize / 2, -(currentSize * p.aspect) / 2, currentSize, currentSize * p.aspect);
    } else if (p.shape === 'diamond') {
      debrisCtx.beginPath();
      debrisCtx.moveTo(0, -currentSize * 1.2);
      debrisCtx.lineTo(currentSize * 0.8, 0);
      debrisCtx.lineTo(0, currentSize * 1.2);
      debrisCtx.lineTo(-currentSize * 0.8, 0);
      debrisCtx.closePath();
      debrisCtx.fill();
    } else if (p.shape === 'chip') {
      debrisCtx.beginPath();
      debrisCtx.moveTo(-currentSize / 2, currentSize / 2);
      debrisCtx.lineTo(0, -currentSize * 0.9);
      debrisCtx.lineTo(currentSize / 2, currentSize * 0.7);
      debrisCtx.closePath();
      debrisCtx.fill();
    } else {
      debrisCtx.beginPath();
      debrisCtx.arc(0, 0, currentSize * 0.55, 0, Math.PI * 2);
      debrisCtx.fill();
    }
    debrisCtx.restore();

    // Remove apenas após alcançar o final da tela (#game-area) ou sumir completamente
    if (p.y >= h + 20 || p.alpha <= 0.01) {
      debrisParticles.splice(i, 1);
    }
  }

  // Atualização & Renderização das Micro-Faíscas (poeira estelar)
  for (let s = microSparks.length - 1; s >= 0; s--) {
    const sp = microSparks[s];
    if (sp.vx) sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    sp.alpha -= sp.decay * dt;

    if (sp.alpha <= 0 || sp.y >= h + 20) {
      microSparks.splice(s, 1);
      continue;
    }

    debrisCtx.save();
    debrisCtx.globalAlpha = Math.max(0, sp.alpha);
    debrisCtx.fillStyle = sp.color;
    debrisCtx.fillRect(sp.x - sp.size / 2, sp.y - sp.size / 2, sp.size, sp.size);
    debrisCtx.restore();
  }

  // Mantém loop ativo enquanto houver partículas caindo
  if (debrisParticles.length > 0 || microSparks.length > 0) {
    debrisRafId = requestAnimationFrame(runDebrisLoop);
  } else {
    debrisCtx.clearRect(0, 0, w, h);
    debrisRafId = null;
    lastDebrisTime = 0;
  }
}

// Shockwave ring for bomb area explosion
function createExplosionRing(cx, cy, radius, isBig) {
  const ring = document.createElement('div');
  ring.className    = isBig ? 'bomb-ring bomb-ring-big' : 'bomb-ring';
  ring.style.left   = (cx - radius) + 'px';
  ring.style.top    = (cy - radius) + 'px';
  ring.style.width  = (radius * 2) + 'px';
  ring.style.height = (radius * 2) + 'px';
  gameArea.appendChild(ring);
  setTimeout(() => ring.remove(), 520);
}

// ============================================================
// CELEBRATORY CONFETTI FOR PHASE COMPLETION
// ============================================================
let confettiRaf = null;
let confettiParticles = [];

function launchConfetti() {
  const canvas = $('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = (canvas.width  = window.innerWidth);
  const h = (canvas.height = window.innerHeight);

  const colors = [
    '#4F46E5', '#0284C7', '#10B981', '#EA580C',
    '#FF4757', '#8B5CF6', '#F59E0B', '#EC4899', '#38BDF8'
  ];

  confettiParticles = [];
  const count = 160;

  for (let i = 0; i < count; i++) {
    let originX, originY, angle, speed;

    if (i < 45) {
      // Cannon Left: blasts towards center/top-right
      originX = w * 0.12;
      originY = h * 0.85;
      angle   = -Math.PI * 0.42 + (Math.random() - 0.5) * 0.6;
      speed   = 14 + Math.random() * 16;
    } else if (i < 90) {
      // Cannon Right: blasts towards center/top-left
      originX = w * 0.88;
      originY = h * 0.85;
      angle   = -Math.PI * 0.58 + (Math.random() - 0.5) * 0.6;
      speed   = 14 + Math.random() * 16;
    } else if (i < 125) {
      // Center burst: blasts upwards
      originX = w * 0.5 + (Math.random() - 0.5) * (w * 0.3);
      originY = h * 0.7;
      angle   = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.8;
      speed   = 12 + Math.random() * 14;
    } else {
      // Top shower: floats down gracefully
      originX = Math.random() * w;
      originY = -20 - Math.random() * 100;
      angle   = Math.PI * 0.5 + (Math.random() - 0.5) * 0.4;
      speed   = 2 + Math.random() * 4;
    }

    confettiParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 9 + Math.random() * 8,
      color: pick(colors),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.22,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.07 + Math.random() * 0.08,
      isCircle: Math.random() < 0.25,
      opacity: 1,
      drag: 0.978 + Math.random() * 0.012,
      gravity: 0.32 + Math.random() * 0.12,
    });
  }

  if (confettiRaf) cancelAnimationFrame(confettiRaf);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeCount = 0;

    for (let i = 0; i < confettiParticles.length; i++) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.rotation += p.rotationSpeed;
      p.wobble   += p.wobbleSpeed;

      if (p.vy > 1.5) {
        p.opacity = Math.max(0, p.opacity - 0.005);
      }

      if (p.opacity > 0 && p.y < h + 30) {
        activeCount++;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const scaleX = Math.cos(p.wobble);
        ctx.scale(scaleX, 1);

        ctx.fillStyle = p.color;
        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size * 0.5, -p.size * 0.3, p.size, p.size * 0.6);
        }
        ctx.restore();
      }
    }

    if (activeCount > 0) {
      confettiRaf = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiRaf = null;
      canvas.style.display = 'none';
    }
  }

  confettiRaf = requestAnimationFrame(render);
}

function stopConfetti() {
  if (confettiRaf) {
    cancelAnimationFrame(confettiRaf);
    confettiRaf = null;
  }
  const canvas = $('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
  }
}
