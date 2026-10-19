/* ================================================
   DIGITHIN GALAXY — js/hud.js
   HUD: PPM, phase goal, animated score/coins, side panels and discovered words
   ================================================ */
'use strict';

// Global PPM (Words Per Minute / Palavras por Minuto) Calculator
function calcPPM() {
  if (!state || !state.startTime) return 0;
  const elapsedMin = Math.max(0.08, (Date.now() - state.startTime) / 60000);
  return Math.round(((state.charsTyped || 0) / 5) / elapsedMin) || 0;
}

// Phase goal calculator (Fase 1 = 10, Fase 2 = 20, Fase 3 = 30...; Treinamento = 10 / 15 / 20)
function phaseGoal() {
  if (state && state.gameMode === 'training') {
    const lesson = state.phase || 1;
    if (lesson === 1) return 10;
    if (lesson === 2) return 15;
    return 20; // Lição 3: Desafio de Maestria
  }
  return calcPhaseGoal(state.phase);
}

// Animated Score Logic
let hudDisplayedScore = 0;
let hudTargetScore = 0;
let hudScoreAnimInterval = null;

function resetHUDScore() {
  if (hudScoreAnimInterval) {
    clearInterval(hudScoreAnimInterval);
    hudScoreAnimInterval = null;
  }
  hudDisplayedScore = 0;
  hudTargetScore = 0;
  if (hudTotal) {
    hudTotal.textContent = formatScore(0);
    hudTotal.classList.remove('score-counting');
  }
}

function syncHUDScoreDisplays(val) {
  if (hudTotal) hudTotal.textContent = formatScore(val);
  const mobileScore = $('hms-score-val');
  if (mobileScore) mobileScore.textContent = Number(val || 0).toLocaleString();
}

function animateHUDScore(targetVal) {
  if (!hudTotal) return;
  targetVal = Math.max(0, Math.floor(targetVal || 0));

  // Reset or drop in score: snap immediately without animation
  if (targetVal < hudDisplayedScore) {
    if (hudScoreAnimInterval) {
      clearInterval(hudScoreAnimInterval);
      hudScoreAnimInterval = null;
    }
    hudDisplayedScore = targetVal;
    hudTargetScore = targetVal;
    syncHUDScoreDisplays(targetVal);
    hudTotal.classList.remove('score-counting');
    return;
  }

  // Already displaying target and no animation running
  if (targetVal === hudDisplayedScore && !hudScoreAnimInterval) {
    syncHUDScoreDisplays(targetVal);
    return;
  }

  hudTargetScore = targetVal;
  hudTotal.classList.add('score-counting');

  if (hudScoreAnimInterval) {
    // An ongoing interval will dynamically target hudTargetScore
    return;
  }

  const tickInterval = 20; // 50 updates per second
  hudScoreAnimInterval = setInterval(() => {
    const diff = hudTargetScore - hudDisplayedScore;
    if (diff <= 0) {
      clearInterval(hudScoreAnimInterval);
      hudScoreAnimInterval = null;
      hudDisplayedScore = hudTargetScore;
      syncHUDScoreDisplays(hudDisplayedScore);
      hudTotal.classList.remove('score-counting');
      return;
    }

    // Dynamic ease-out: larger jumps start quickly and decelerate smoothly into target
    const step = Math.max(1, Math.ceil(diff / 8));
    hudDisplayedScore = Math.min(hudTargetScore, hudDisplayedScore + step);
    syncHUDScoreDisplays(hudDisplayedScore);

    if (hudDisplayedScore >= hudTargetScore) {
      clearInterval(hudScoreAnimInterval);
      hudScoreAnimInterval = null;
      hudDisplayedScore = hudTargetScore;
      syncHUDScoreDisplays(hudDisplayedScore);
      hudTotal.classList.remove('score-counting');
    }
  }, tickInterval);
}

function cancelScoreElementAnimation(el) {
  if (!el) return;
  if (el._scoreAnimTimer) {
    clearInterval(el._scoreAnimTimer);
    el._scoreAnimTimer = null;
  }
  if (el._scoreAnimTimeout) {
    clearTimeout(el._scoreAnimTimeout);
    el._scoreAnimTimeout = null;
  }
  el.classList.remove('score-counting');
}

function animateScoreElement(el, targetVal, durationMs = 750, onComplete = null) {
  if (!el) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }
  targetVal = Math.max(0, Math.floor(targetVal || 0));
  cancelScoreElementAnimation(el);
  el.textContent = formatScore(0);

  if (targetVal <= 0) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  el.classList.add('score-counting');

  // Small delay so the player sees the modal appear before the counter rolls
  el._scoreAnimTimeout = setTimeout(() => {
    let currentVal = 0;
    const isSmallScore = targetVal < 8;
    const totalTicks = isSmallScore ? targetVal : Math.min(36, Math.max(16, Math.floor(durationMs / 25)));
    const tickInterval = isSmallScore ? Math.max(100, Math.floor(durationMs / totalTicks)) : Math.max(20, Math.floor(durationMs / totalTicks));
    let lastSoundTime = 0;

    el._scoreAnimTimer = setInterval(() => {
      if (isSmallScore) {
        currentVal++;
      } else {
        // Dynamic ease-out deceleration curve: starts fast, then smoothly glides to target
        const remaining = targetVal - currentVal;
        const step = Math.max(1, Math.ceil(remaining / 5));
        currentVal = Math.min(targetVal, currentVal + step);
      }

      el.textContent = formatScore(currentVal);

      // Play arcade tick sound throttled to ~55ms
      const now = Date.now();
      if (now - lastSoundTime >= 55) {
        if (typeof playSound === 'function') playSound('coin');
        lastSoundTime = now;
      }

      if (currentVal >= targetVal) {
        cancelScoreElementAnimation(el);
        el.textContent = formatScore(targetVal);

        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    }, tickInterval);
  }, 120);
}

function animateCoinsElement(el, targetVal, durationMs = 600) {
  if (!el) return;
  targetVal = Math.max(0, Math.floor(targetVal || 0));
  if (targetVal <= 0) {
    el.textContent = '+0';
    return;
  }
  let currentVal = 0;
  el.textContent = '+0';
  const totalTicks = Math.min(25, targetVal);
  const step = Math.max(1, Math.ceil(targetVal / totalTicks));
  const tickInterval = Math.max(25, Math.floor(durationMs / totalTicks));
  const timer = setInterval(() => {
    currentVal = Math.min(targetVal, currentVal + step);
    el.textContent = `+${currentVal}`;
    if (currentVal >= targetVal) {
      clearInterval(timer);
      el.textContent = `+${targetVal}`;
    }
  }, tickInterval);
}

// Update HUD & Side Panels
function updateHUD() {
  if (typeof state === 'undefined' || !state) return;
  animateHUDScore(state.totalScore);
  const coinsStr = String(state.coins || 0);
  if (hudCoins) hudCoins.textContent = coinsStr;
  const hmsCoins = $('hms-coins-val');
  if (hmsCoins) hmsCoins.textContent = coinsStr;
  if (typeof updateShopBalanceDisplay === 'function') updateShopBalanceDisplay();

  const phaseTag = document.querySelector('.phase-tag');
  if (phaseTag) {
    if (state.gameMode === 'training') {
      phaseTag.style.display = '';
      const lessonLbl = typeof t === 'function' ? t('hud_training_lesson').toUpperCase() : 'LESSON';
      if (phaseNumEl) phaseNumEl.textContent = `M${state.trainingWorld || 1} • ${lessonLbl} ${state.phase} / 3`;
    } else if (state.gameMode === 'timeattack') {
      phaseTag.style.display = '';
      if (phaseNumEl) phaseNumEl.textContent = `⏱️ ${state.timeAttackSecs}s`;
    } else if (state.gameMode === 'zen') {
      phaseTag.style.display = '';
      if (phaseNumEl) phaseNumEl.textContent = `ZEN`;
    } else {
      // Modo clássico/arcade: oculta a tag de fase
      phaseTag.style.display = 'none';
      if (phaseNumEl) phaseNumEl.textContent = '';
    }
  }

  if (hitsDisplay)   hitsDisplay.textContent   = state.hitsPhase;
  if (errorsDisplay) errorsDisplay.textContent = state.errorsPhase;

  // Real-time WPM (PPM)
  const wpmDisplay = $('wpm-display');
  if (wpmDisplay) {
    if (state.startTime) {
      const wpm = calcPPM();
      state.currentWpm = wpm;
      wpmDisplay.textContent = `${wpm}`;
      try {
        const curBest = parseInt(localStorage.getItem('digithin_galaxy_best_wpm') || '0', 10);
        if (wpm > curBest) localStorage.setItem('digithin_galaxy_best_wpm', String(wpm));
      } catch (_) {}
      if (wpm >= 60) unlockAchievement('dedo_veloz');
    } else {
      wpmDisplay.textContent = '0';
    }
  }

  // Real-time Accuracy % (acompanha a fase/partida atual: inicia em 0% e recalcula com acertos e erros da fase)
  const accuracyDisplay = $('accuracy-display');
  if (accuracyDisplay) {
    const totalAttempts = (state.hitsPhase || 0) + (state.errorsPhase || 0);
    const acc = totalAttempts > 0 ? Math.round(((state.hitsPhase || 0) / totalAttempts) * 100) : 0;
    state.currentAccuracy = acc;
    accuracyDisplay.textContent = `${acc}%`;
  }

  // Combo Streak & Modo Fúria
  const comboDisplay = $('combo-display');
  const comboVal = state.combo || 0;
  if (comboDisplay) {
    comboDisplay.textContent = `${comboVal}×`;
    comboDisplay.className = 'smb-val ' + (comboVal >= 15 ? 'text-amber' : comboVal >= 5 ? 'text-sky' : '');
  }
  const gameCol = $('game-column');
  if (gameCol) {
    gameCol.classList.toggle('fury-mode', comboVal >= 15);
  }

  if (state.gameMode === 'training') {
    const goal = phaseGoal();
    const pct  = Math.min(100, Math.max(0, (state.progress / goal) * 100));
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressText) {
      const lesson = state.phase || 1;
      const lessonName = typeof t === 'function' ? t(`training_lesson_${lesson}_name`) : (lesson === 1 ? 'Home Keys' : lesson === 2 ? 'Alternation' : 'Final Challenge');
      const lessonLbl = typeof t === 'function' ? t('hud_training_lesson') : 'Lesson';
      progressText.textContent = `${state.progress} / ${goal} • ${lessonLbl} ${lesson}/3: ${lessonName}`;
    }
  } else {
    // Sistema de XP e Level: barra no topo representa o XP ganho
    const curXp = state.currentXp || 0;
    const reqXp = state.xpRequired || 10;
    const pct = Math.min(100, Math.max(0, (curXp / reqXp) * 100));
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressText) {
      progressText.textContent = `${curXp} / ${reqXp} XP`;
    }
    const phaseNumEl = $('phase-num');
    const phaseTagLbl = document.getElementById('hud-level-tag-label');
    if (phaseTagLbl) {
      phaseTagLbl.textContent = typeof t === 'function' ? t('hud_level') : 'LEVEL';
    }
    if (phaseNumEl) {
      phaseNumEl.textContent = state.level || 1;
    }
  }

  let mult = state.speedMultiplier || 1.0;
  if ((state.activeTimers?.slowdown || 0) > 0) {
    mult *= 0.5;
  }
  mult = Math.round(mult * 100) / 100;
  const sx = (Math.abs(Math.round(mult * 100) - Math.round(mult * 10) * 10) > 0)
    ? mult.toFixed(2)
    : mult.toFixed(1);
  if (speedDisplay) speedDisplay.textContent = sx + '×';

  if (typeof renderRunPerks === 'function') {
    renderRunPerks();
  }



  // Zen / Training Mode fixed indicator toggle in HUD
  const zenFixedBadge = $('zen-fixed-badge');
  if (zenFixedBadge) {
    if (state.gameMode === 'zen') {
      zenFixedBadge.textContent = typeof t === 'function' ? t('hud_zen_badge') : 'Zen';
      zenFixedBadge.classList.remove('hidden');
    } else if (state.gameMode === 'training') {
      const tw = typeof TRAINING_WORLDS !== 'undefined' ? TRAINING_WORLDS[state.trainingWorld || 1] : null;
      const lessonLabel = typeof t === 'function' ? t('hud_training_lesson') : 'Lesson';
      zenFixedBadge.textContent = tw ? `${tw.name} (${lessonLabel} ${state.phase}/3)` : (typeof t === 'function' ? t('hud_training_badge') : 'Training');
      zenFixedBadge.classList.remove('hidden');
    } else {
      zenFixedBadge.classList.add('hidden');
    }
  }

  // Render shields (vector SVG shields, 100% no emojis)
  if (livesRow) {
    livesRow.innerHTML = '';
    const livesLbl = $('hud-lives-lbl');
    const livesCountText = $('lives-count-text');
    if (state.gameMode === 'zen') {
      const zenPill = typeof t === 'function' ? t('hud_zen_pill') : 'Unlimited shields';
      const zenTitle = typeof t === 'function' ? t('hud_zen_pill_title') : '';
      livesRow.innerHTML = `<span class="zen-lives-pill" title="${zenTitle}">${zenPill}</span>`;
      if (livesLbl) livesLbl.textContent = typeof t === 'function' ? t('hud_zen_lbl') : 'ZEN MODE';
      if (livesCountText) {
        livesCountText.textContent = '∞';
        livesCountText.className = 'stat-lives-count';
      }
    } else if (state.gameMode === 'training') {
      const trainingTitle = typeof t === 'function' ? t('hud_training_pill_title') : '';
      const trainingLbl = typeof t === 'function' ? t('hud_training_lbl') : 'TRAINING';
      const freeLbl = typeof t === 'function' ? t('hud_free') : 'Free';
      livesRow.innerHTML = `<span class="zen-lives-pill" title="${trainingTitle}">${trainingLbl}</span>`;
      if (livesLbl) livesLbl.textContent = typeof t === 'function' ? t('hud_training_lbl') : 'TRAINING';
      if (livesCountText) {
        livesCountText.textContent = freeLbl;
        livesCountText.className = 'stat-lives-count';
      }
    } else {
      if (livesLbl) livesLbl.textContent = typeof t === 'function' ? (t('hud_shields') || t('hud_lives')) : 'SHIELDS';
      const max = Math.min(10, state.maxShields || state.maxLives || CFG.startLives || 3);
      const cur = Math.max(0, state.shields !== undefined ? state.shields : (state.lives !== undefined ? state.lives : 3));
      if (livesCountText) {
        livesCountText.textContent = `${cur} / ${max}`;
        livesCountText.className = 'stat-lives-count' + (cur <= 1 ? ' danger' : cur === 2 ? ' warn' : '');
      }
      for (let i = 0; i < max; i++) {
        const isLost = i >= cur;
        const s = document.createElement('span');
        s.className = 'shield-hud-icon' + (isLost ? ' lost' : '');
        s.setAttribute('title', isLost ? 'Shield Offline' : 'Shield Active');
        s.innerHTML = `<svg class="shield-hud-svg" width="20" height="20" viewBox="0 0 24 24" fill="${isLost ? 'none' : 'currentColor'}" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
        livesRow.appendChild(s);
      }
    }
    const mobileLives = $('hud-mobile-lives');
    if (mobileLives) {
      mobileLives.innerHTML = livesRow.innerHTML;
    }
    const earthShield = document.getElementById('earth-shield-barrier');
    if (earthShield) {
      const curShields = (state.gameMode === 'zen' || state.gameMode === 'training') ? 3 : (state.shields !== undefined ? state.shields : (state.lives || 3));
      earthShield.classList.toggle('depleted', curShields <= 0);
      earthShield.classList.toggle('immunity-active', (state.activeTimers?.shield || 0) > 0);
    }
  }

  // Render discovered words in HUD side panel
  renderDiscoveredWordsHUD();

  renderSkills();
  if (typeof updateFingerGuideVisibility === 'function') {
    updateFingerGuideVisibility();
  }
}

/**
 * Renders the Discovered Words HUD list for the current run, showing emerging words,
 * their localized meanings, points, and times typed in this run (with total in tooltip).
 */
function renderDiscoveredWordsHUD() {
  const listEl = wordsList || document.getElementById('words-list');
  if (!listEl) return;
  if (!state) {
    listEl.innerHTML = '';
    return;
  }

  if (!state.runWordsSeen) state.runWordsSeen = new Set();
  if (!state.runDiscoveredWords) state.runDiscoveredWords = [];
  if (!state.runWordStats) state.runWordStats = {};

  const discovered = state.runDiscoveredWords;

  // Empty state: keep completely empty without any unnecessary box or text
  if (!discovered || discovered.length === 0) {
    listEl.innerHTML = '';
    return;
  }

  const curLang = typeof getLanguage === 'function' ? getLanguage() : 'en';

  listEl.innerHTML = '';

  discovered.forEach(wordKey => {
    const wordObj = (typeof getWordObject === 'function')
      ? getWordObject(wordKey, curLang)
      : { text: wordKey.toUpperCase(), type: 'cosmos', meaning: '' };

    const textUpper = (wordObj?.text || wordKey).toUpperCase();
    const runCount = state.runWordStats[wordKey] || 0;
    const totalCount = state.wordStats?.[wordKey]?.count || 0;
    const meaning = wordObj?.meaning || '';

    const tooltip = typeof t === 'function'
      ? t('hud_typed_run_title', { run: runCount, total: totalCount })
      : `Typed ${runCount}× in this run • ${totalCount}× total`;

    const card = document.createElement('div');
    card.className = 'hud-word-card';
    card.setAttribute('data-word', wordKey);

    card.innerHTML = `
      <div class="hwc-header">
        <span class="hwc-word-text">${textUpper}</span>
        <span class="hwc-count" title="${tooltip}">×${runCount}</span>
      </div>
      ${meaning ? `<div class="hwc-meaning">${meaning}</div>` : ''}
    `;

    listEl.appendChild(card);
  });
}

/**
 * Registers a cosmic word when successfully typed in the run and updates HUD.
 */
function registerRunDiscoveredWord(wordText) {
  if (!state || !wordText) return;
  const key = String(wordText).trim().toLowerCase();
  if (!state.runWordsSeen) state.runWordsSeen = new Set();
  state.runWordsSeen.add(key);

  if (!state.runDiscoveredWords) state.runDiscoveredWords = [];
  if (!state.runDiscoveredWords.includes(key)) {
    state.runDiscoveredWords.unshift(key);
  }

  renderDiscoveredWordsHUD();
}

if (typeof window !== 'undefined') {
  window.renderDiscoveredWordsHUD = renderDiscoveredWordsHUD;
  window.registerRunDiscoveredWord = registerRunDiscoveredWord;
}
