/* ======================================================
   DIGITHIN GALAXY — js/ambient.js
   Deep Space Galaxy & Black Hole Canvas Engine.
   Renders a lightweight, clean, stylized outer space:
   - Deep obsidian space background (#000003)
   - Twinkling multi-hued starfield & cosmic stardust
   - Stylized non-realistic Black Hole with event horizon,
     photon sphere ring, relativistic lensing & accretion disk
   - Low resource consumption (native Canvas 2D, 60fps)
   ====================================================== */
'use strict';

(function() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let animationId = null;

  // Planetary defense impact pulse triggered when debris touches Earth's atmosphere
  let blackHolePulse = 0;
  window.triggerBlackHolePulse = function() {
    blackHolePulse = 1.0;
    const earth = document.getElementById('earth-horizon') || document.getElementById('black-hole-vortex');
    if (earth) {
      earth.classList.remove('pulse');
      void earth.offsetWidth; // Force CSS reflow
      earth.classList.add('pulse');
      setTimeout(() => {
        earth.classList.remove('pulse');
      }, 420);
    }
    const shield = document.getElementById('earth-shield-barrier');
    if (shield) {
      shield.classList.remove('damaged');
      void shield.offsetWidth;
      shield.classList.add('damaged');
      setTimeout(() => {
        shield.classList.remove('damaged');
      }, 550);
    }
  };

  // Pre-allocated star collection
  const STAR_COUNT = 200;
  let stars = [];

  // Star color palettes (clean, non-neon, realistic cosmic hues)
  const STAR_COLORS = [
    (a) => `rgba(255, 255, 255, ${a})`,          // Crisp white
    (a) => `rgba(186, 230, 253, ${a * 0.95})`,   // Celestial cyan (B-type star)
    (a) => `rgba(221, 214, 254, ${a * 0.90})`,   // Soft lilac (O-type star)
    (a) => `rgba(254, 240, 138, ${a * 0.85})`,   // Warm solar gold (G-type star)
    (a) => `rgba(254, 202, 202, ${a * 0.80})`,   // Soft red giant (M-type star)
  ];

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        xRatio: Math.random(),
        yRatio: Math.random(),
        radius: 0.6 + Math.random() * 1.5,
        baseAlpha: 0.25 + Math.random() * 0.70,
        twinkleSpeed: 0.0012 + Math.random() * 0.0035,
        twinklePhase: Math.random() * Math.PI * 2,
        colorIdx: Math.floor(Math.random() * STAR_COLORS.length),
      });
    }
  }

  function resize() {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if (stars.length === 0) initStars();
  }
  window.addEventListener('resize', resize);
  resize();

  // Occasional shooting star across deep space
  let shootingStar = null;
  let nextShootingStarTime = 4000;

  function updateShootingStar(time) {
    if (!shootingStar && time > nextShootingStarTime) {
      const startX = width * (0.1 + Math.random() * 0.7);
      const startY = height * (0.05 + Math.random() * 0.4);
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const speed = 7 + Math.random() * 5;
      shootingStar = {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 60 + Math.random() * 50,
        life: 1.0,
        decay: 0.035 + Math.random() * 0.02,
      };
      nextShootingStarTime = time + 7000 + Math.random() * 8000;
    }

    if (shootingStar) {
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;
      shootingStar.life -= shootingStar.decay;

      if (shootingStar.life <= 0 || shootingStar.x > width || shootingStar.y > height) {
        shootingStar = null;
      } else {
        const tailX = shootingStar.x - shootingStar.vx * (shootingStar.len / 10);
        const tailY = shootingStar.y - shootingStar.vy * (shootingStar.len / 10);
        const grad = ctx.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.life * 0.9})`);
        grad.addColorStop(0.3, `rgba(186, 230, 253, ${shootingStar.life * 0.6})`);
        grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    }
  }

  function render(time) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // 1. Base Deep Space Void
    if (isLight) {
      // Light Mode: Ethereal Cosmic Daylight (Soft stellar sky with dark stars/nebula)
      const lightGrad = ctx.createLinearGradient(0, 0, 0, height);
      lightGrad.addColorStop(0, '#E0F2FE');
      lightGrad.addColorStop(0.5, '#EDE9FE');
      lightGrad.addColorStop(1, '#FCE7F3');
      ctx.fillStyle = lightGrad;
    } else {
      // Dark Mode (Default): Deep Obsidian Cosmic Black
      const darkGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.75, 100,
        width * 0.5, height * 0.5, Math.max(width, height)
      );
      darkGrad.addColorStop(0, '#030712');   // Very faint horizon radiance
      darkGrad.addColorStop(0.45, '#010206'); // Deep nocturnal void
      darkGrad.addColorStop(1, '#000002');   // Absolute deep space black
      ctx.fillStyle = darkGrad;
    }
    ctx.fillRect(0, 0, width, height);

    // 2. Starfield with Twinkling Light Points
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const sx = s.xRatio * width;
      const sy = s.yRatio * height;

      // Twinkle fluctuation using sine oscillation
      const twinkle = 0.55 + 0.45 * Math.sin(time * s.twinkleSpeed + s.twinklePhase);
      const alpha = isLight ? (s.baseAlpha * twinkle * 0.6) : (s.baseAlpha * twinkle);

      ctx.fillStyle = STAR_COLORS[s.colorIdx](alpha);
      ctx.beginPath();
      ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Occasional Shooting Star
    updateShootingStar(time);

    animationId = requestAnimationFrame(render);
  }

  animationId = requestAnimationFrame(render);
})();
