/* ================================================
   DIGITHIN GALAXY — game.js
   Core gameplay engine, match lifecycle, loop & matching
   ================================================ */
'use strict';

// ============================================================
// 1. GAME LIFECYCLE
// ============================================================
function startGame(mode = 'classic') {
  if (typeof isLocaleReady !== 'undefined' && !isLocaleReady) return;
  if (typeof closeSettings === 'function') closeSettings();
  if (typeof closeSkillsInventory === 'function') closeSkillsInventory();
  if (typeof closeSlotsModal === 'function') closeSlotsModal();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');

  if (typeof resetHUDScore === 'function') resetHUDScore();
  state = defaultState();
  state.gameMode = mode;
  state.startTime = Date.now();

  const diffCfg = typeof getDifficultyConfig === 'function' ? getDifficultyConfig() : { startLives: 3, initialSpeed: 1.0 };
  if (mode === 'zen' || mode === 'training') {
    state.shields = 999;
    state.maxShields = 999;
    state.lives = 999;
    state.maxLives = 999;
  } else {
    state.shields = diffCfg.startLives || 3;
    state.maxShields = diffCfg.startLives || 3;
    state.lives = state.shields;
    state.maxLives = state.maxShields;
  }
  if (mode === 'timeattack') {
    state.timeAttackSecs = 60;
  }
  state.speedMultiplier = diffCfg.initialSpeed;
  state.speedAccum = 0;
  screenStart.classList.remove('active');
  screenGame.classList.add('active');
  if (typeof updateVirtualKeyboardVisibility === 'function') updateVirtualKeyboardVisibility();
  if (typeof updateFingerGuideVisibility === 'function') updateFingerGuideVisibility();
  if (typeof focusGameInput === 'function') {
    focusGameInput();
  } else {
    hiddenInput?.focus();
  }
  refillQueue();
  updateHUD();
  beginPhase();
  if (typeof startNormalBgm === 'function') startNormalBgm();
  if (typeof saveGameProgress === 'function') saveGameProgress();
}

function resumeSavedGame() {
  startGame('classic');
}

function promptOrStartNewGame() {
  startGame('classic');
}

function startTrainingWorld(worldId = 1) {
  if (typeof isLocaleReady !== 'undefined' && !isLocaleReady) return;
  if (typeof closeSettings === 'function') closeSettings();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');

  if (typeof resetHUDScore === 'function') resetHUDScore();
  state = defaultState();
  state.gameMode = 'training';
  state.trainingWorld = parseInt(worldId, 10) || 1;
  state.trainingLesson = 1;
  state.phase = 1;
  state.lives = 999;
  state.maxLives = 999;
  state.startTime = Date.now();
  state.spawnQueue = [];

  if (typeof closeTrainingModal === 'function') closeTrainingModal();

  screenStart.classList.remove('active');
  screenGame.classList.add('active');
  if (typeof updateVirtualKeyboardVisibility === 'function') updateVirtualKeyboardVisibility();
  if (typeof updateFingerGuideVisibility === 'function') updateFingerGuideVisibility();
  if (typeof focusGameInput === 'function') {
    focusGameInput();
  } else {
    hiddenInput?.focus();
  }
  refillQueue();
  updateHUD();
  beginPhase();

  const worldData = (typeof TRAINING_WORLDS !== 'undefined' && TRAINING_WORLDS[state.trainingWorld]) || { name: 'Mundo 1' };
  const lesson1Name = typeof t === 'function' ? t('training_lesson_1_name') : 'Home Keys';
  const lessonLbl = typeof t === 'function' ? t('hud_training_lesson') : 'Lesson';
  showFeedback(`${worldData.name} — ${lessonLbl} 1/3 (${lesson1Name})`, 'special');
}

function restartGame() {
  if (typeof cancelScoreElementAnimation === 'function') cancelScoreElementAnimation($('go-score'));
  const newRecTag = $('go-new-record-tag');
  if (newRecTag) newRecTag.classList.add('hidden');
  modalGameover.classList.add('hidden');
  clearArea();
  cancelAnimationFrame(state.rafId);
  clearTimeout(state.spawnTimer);
  if (typeof hideBossHud === 'function') hideBossHud();
  if (state.bossBattle) state.bossBattle.active = false;
  if (state.gameMode === 'training') {
    startTrainingWorld(state.trainingWorld || 1);
  } else {
    const activeSlot = (typeof getActiveSlot === 'function') ? getActiveSlot() : 1;
    startGame(state.gameMode || 'classic', activeSlot);
  }
}

function goToMainMenu() {
  if (typeof cancelScoreElementAnimation === 'function') cancelScoreElementAnimation($('go-score'));
  const newRecTag = $('go-new-record-tag');
  if (newRecTag) newRecTag.classList.add('hidden');
  if (typeof cancelResumeCountdown === 'function') cancelResumeCountdown();
  if (typeof resetHUDScore === 'function') resetHUDScore();
  if (state.rafId) cancelAnimationFrame(state.rafId);
  if (state.spawnTimer) clearTimeout(state.spawnTimer);
  if (state.timeAttackTimerId) clearInterval(state.timeAttackTimerId);

  clearArea();
  state.paused = true;
  state.escPaused = false;
  state.phaseComplete = false;
  state.activeTimers = {};
  if (typeof hideBossHud === 'function') hideBossHud();
  if (state.bossBattle) state.bossBattle.active = false;
  if (typeof stopAllBgm === 'function') stopAllBgm();

  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
  if (typeof resetPauseView === 'function') resetPauseView();
  if (typeof closeSettings === 'function') closeSettings();
  if (typeof closeBiblioteca === 'function') closeBiblioteca();
  if (typeof closeConquistas === 'function') closeConquistas();
  if (typeof closeTrainingModal === 'function') closeTrainingModal();
  if (typeof cancelShopExitConfirm === 'function') cancelShopExitConfirm();

  const cdOverlay = $('countdown-overlay');
  if (cdOverlay) cdOverlay.classList.add('hidden');

  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));

  const screenGame = $('screen-game');
  const screenStart = $('screen-start');
  if (screenGame) screenGame.classList.remove('active');
  if (screenStart) screenStart.classList.add('active');

  if (hiddenInput && typeof hiddenInput.blur === 'function') {
    hiddenInput.blur();
  }

  state = defaultState();
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof updateVirtualKeyboardVisibility === 'function') updateVirtualKeyboardVisibility();
  if (typeof updateFingerGuideVisibility === 'function') updateFingerGuideVisibility();

  if (typeof updateStartScreenUI === 'function') updateStartScreenUI();
  if (typeof checkForAppUpdate === 'function') checkForAppUpdate();
  if (typeof playSound === 'function') playSound('click');
}

// ============================================================
// 2. HEALTH & GAME OVER
// ============================================================
function loseShield() {
  // Shield immunity protects shields
  if ((state.activeTimers?.shield || 0) > 0) {
    playSound('skill');
    const msg = typeof t === 'function' ? t('fb_shield_blocked') : '🛡️ Dano bloqueado pela Imunidade!';
    showFeedback(msg, 'special');
    return;
  }

  // Training Mode: No shield loss! Only accuracy and PPM reduction
  if (state.gameMode === 'training') {
    state.errorsPhase++;
    state.totalErrors++;
    state.combo = 0;
    playSound('fall');
    showFeedback(typeof t === 'function' ? t('fb_runic_dropped_zen') : '⚠️ Runic dropped (-accuracy)', 'error');
    updateHUD();
    return;
  }

  // Zen Mode: No shield loss (silent and clean, info is permanently displayed on HUD)
  if (state.gameMode === 'zen') {
    playSound('fall');
    state.combo = 0;
    updateHUD();
    return;
  }

  // Combo breaks on shield loss
  if (state.combo > 0) {
    state.combo = 0;
    showFeedback(typeof t === 'function' ? t('fb_combo_broken') : 'Combo broken!', 'error');
  }

  state.shields = Math.max(0, (state.shields !== undefined ? state.shields : (state.lives || 3)) - 1);
  state.lives = state.shields;
  playSound('life');
  showFeedback(typeof t === 'function' ? t('fb_runic_dropped') : '🛡️ Runic dropped! Shield damaged!', 'error');

  // Trigger shield damage flash on Earth shield barrier
  const shieldEl = document.getElementById('earth-shield-barrier');
  if (shieldEl) {
    shieldEl.classList.remove('damaged');
    void shieldEl.offsetWidth;
    shieldEl.classList.add('damaged');
    setTimeout(() => {
      if (shieldEl) shieldEl.classList.remove('damaged');
    }, 550);
  }

  // Flash border
  document.body.style.animation = 'screenShake .28s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 300);

  updateHUD();

  if (state.shields <= 0) {
    gameOver();
  }
}
const loseLife = loseShield;

function gameOver() {
  state.paused = true;
  cancelAnimationFrame(state.rafId);
  clearTimeout(state.spawnTimer);
  if (typeof stopAllBgm === 'function') stopAllBgm();

  // Close any open overlays or settings dialogs so they never bleed into Game Over
  if (typeof closeSettings === 'function') closeSettings();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
  const modalLib = $('modal-biblioteca');
  if (modalLib) modalLib.classList.add('hidden');
  const modalConquistas = $('modal-conquistas');
  if (modalConquistas) modalConquistas.classList.add('hidden');
  const modalTraining = $('modal-training');
  if (modalTraining) modalTraining.classList.add('hidden');

  // Populate modern game over arcade dashboard
  const currentScore = state.totalScore || 0;
  const recordResult = typeof updateHighScore === 'function' ? updateHighScore(currentScore) : { best: currentScore, isNew: false, previous: currentScore };
  const sessionCoins = state.totalCoinsEarned || 0;
  if (typeof updateHighCoins === 'function') updateHighCoins(sessionCoins);
  if (typeof clearActiveSlotRun === 'function') clearActiveSlotRun();
  if (typeof updateStartScreenUI === 'function') updateStartScreenUI();
  if (typeof checkForAppUpdate === 'function') checkForAppUpdate();

  // Requisito 7: jogador mantém moedas ganhas e habilidades compradas na loja
  // (perde apenas as habilidades dropadas temporariamente durante a partida)
  if (Array.isArray(state.skillSlots)) {
    const permanentLeft = state.skillSlots
      .filter(s => (s.permanentCount || 0) > 0)
      .map(s => ({ id: s.id, count: s.permanentCount }));
    if (typeof savePermanentSkills === 'function') {
      savePermanentSkills(permanentLeft);
    }
  }

  // Calculate overall match accuracy
  const totalHits = state.totalHits || 0;
  const totalErrors = state.totalErrors || 0;
  const totalAttempts = totalHits + totalErrors;
  const matchAccuracy = totalAttempts > 0 ? Math.round((totalHits / totalAttempts) * 100) : 0;

  const accEl = $('go-accuracy');
  if (accEl) {
    accEl.textContent = `${matchAccuracy}%`;
  }

  const coinsEl = $('go-coins');
  if (coinsEl) {
    if (typeof animateCoinsElement === 'function' && sessionCoins > 0) {
      animateCoinsElement(coinsEl, sessionCoins, 650);
    } else {
      coinsEl.textContent = `+${sessionCoins}`;
    }
  }

  if ($('go-hits')) $('go-hits').textContent = totalHits;
  if ($('go-errors')) $('go-errors').textContent = totalErrors;
  if ($('go-phase')) $('go-phase').textContent = state.phase || 1;
  if ($('go-words')) $('go-words').textContent = `${(state.unlockedWords || []).length} / ${(typeof WORD_POOL !== 'undefined' ? WORD_POOL.length : 42)}`;

  const btnContinue = $('btn-go-continue');
  const countEl = $('go-continue-count');
  if (btnContinue && countEl) {
    if (state.continues > 0) {
      countEl.textContent = state.continues;
      btnContinue.classList.remove('hidden');
    } else {
      btnContinue.classList.add('hidden');
    }
  }

  // Decoupled Record Badge & Match Score handling
  const newRecordTag = $('go-new-record-tag');
  const goScoreEl = $('go-score');

  if (newRecordTag) {
    newRecordTag.classList.add('hidden');
  }

  // Open Game Over screen
  modalGameover.classList.remove('hidden');

  // Trigger smooth score roll-up animation with arcade sounds & glowing feedback
  if (typeof animateScoreElement === 'function') {
    animateScoreElement(goScoreEl, currentScore, 750, () => {
      if (recordResult.isNew) {
        if (newRecordTag) {
          newRecordTag.classList.remove('hidden');
        }
        if (typeof playSound === 'function') {
          playSound('wildcard');
        }
      }
    });
  } else {
    if (goScoreEl) goScoreEl.textContent = formatScore(currentScore);
    if (newRecordTag) newRecordTag.classList.toggle('hidden', !recordResult.isNew);
  }
}

function useContinue() {
  if (state.continues <= 0) return;
  if (typeof cancelScoreElementAnimation === 'function') cancelScoreElementAnimation($('go-score'));
  const newRecTag = $('go-new-record-tag');
  if (newRecTag) newRecTag.classList.add('hidden');
  state.continues--;
  playSound('continue');
  const diffCfg = typeof getDifficultyConfig === 'function' ? getDifficultyConfig() : { startLives: 3, initialSpeed: 1.0 };
  state.shields = diffCfg.startLives || 3;
  state.maxShields = diffCfg.startLives || 3;
  state.lives = state.shields;
  state.maxLives = state.maxShields;
  state.progress = 0;
  state.speedMultiplier = diffCfg.initialSpeed;
  state.speedAccum = 0;
  state.activeItems.forEach(i => i.el?.parentNode?.removeChild(i.el));
  state.activeItems = [];
  modalGameover.classList.add('hidden');
  showFeedback(typeof t === 'function' ? t('fb_continue_used') : '🪙 Continue used! Resuming phase...', 'special');
  beginPhase();
}

// ============================================================
// 4. GAME LOOP
// ============================================================
function gameLoop(ts) {
  if (state.paused || state.phaseComplete) return;

  if (!state.lastTs) state.lastTs = ts;
  const dt = Math.min((ts - state.lastTs) / 1000, 0.1);
  state.lastTs = ts;

  // Update periodic skills and queue
  if (typeof updatePeriodicSkills === 'function') {
    updatePeriodicSkills(dt);
  }

  // Time Attack mode timer countdown
  if (state.gameMode === 'timeattack') {
    state.timeAttackAccum = (state.timeAttackAccum || 0) + dt;
    if (state.timeAttackAccum >= 1.0) {
      state.timeAttackAccum -= 1.0;
      state.timeAttackSecs = Math.max(0, (state.timeAttackSecs || 60) - 1);
      updateHUD();
      if (state.timeAttackSecs <= 0) {
        gameOver();
        showFeedback(typeof t === 'function' ? t('fb_time_up') : "⏱️ Time's Up!", 'special');
        return;
      }
    }
  }

  // Progressive speed increase: a cada 5 segundos aumenta +0.01x (limite até velocidade inicial + 2.0x)
  if (state.gameMode !== 'training' && (!state.bossBattle || !state.bossBattle.active)) {
    state.speedAccum = (state.speedAccum || 0) + dt;
    const interval = (typeof CFG !== 'undefined' && CFG.speedTimerInterval) ? CFG.speedTimerInterval : 5.0;
    if (state.speedAccum >= interval) {
      state.speedAccum -= interval;
      const diffCfg = typeof getDifficultyConfig === 'function' ? getDifficultyConfig() : { initialSpeed: 1.0 };
      const baseSpeed = (typeof diffCfg.initialSpeed === 'number') ? diffCfg.initialSpeed : 1.0;
      const maxAllowed = Math.round((baseSpeed + ((typeof CFG !== 'undefined' && CFG.speedMaxIncrease) ? CFG.speedMaxIncrease : 2.0)) * 100) / 100;
      const curSpeed = (typeof state.speedMultiplier === 'number') ? state.speedMultiplier : baseSpeed;
      const step = (typeof CFG !== 'undefined' && CFG.speedTimerIncrement) ? CFG.speedTimerIncrement : 0.01;
      if (curSpeed < maxAllowed) {
        state.speedMultiplier = Math.min(maxAllowed, Math.round((curSpeed + step) * 100) / 100);
        updateHUD();
      }
    }
  }

  // Multipliers & effective speed
  const isFrozen = (state.activeTimers?.freezer || 0) > 0;
  let effectiveSpeed = state.speedMultiplier || 1.0;
  if (state.bossBattle && state.bossBattle.active) {
    state.speedMultiplier = 0.5;
    effectiveSpeed = 0.5;
  } else {
    if ((state.activeTimers?.slowdown || 0) > 0) {
      effectiveSpeed *= 0.5; // Reduz velocidade de queda em 50%
    }
  }

  // Freezer auto-cancel check
  if (typeof checkFreezerAutoCancel === 'function') checkFreezerAutoCancel();

  const boardH = gameArea.clientHeight || 500;
  const boardW = gameArea.clientWidth || 360;
  const items = state.activeItems;

  const earthShield = document.getElementById('earth-shield-barrier');
  const isImmunityActive = (state.activeTimers?.shield || 0) > 0;
  if (earthShield) {
    earthShield.classList.toggle('immunity-active', isImmunityActive);
  }

  // Boss Battle safety: strictly no loose runics or words during boss confrontations
  if (state.bossBattle && state.bossBattle.active) {
    for (let i = items.length - 1; i >= 0; i--) {
      if (!items[i].isBossMeaning) {
        items[i].el?.parentNode?.removeChild(items[i].el);
        items.splice(i, 1);
      }
    }
  }

  // Training Mode: hold everything while an item rests at the bottom
  const trainingHold = state.gameMode === 'training' && items.some(it => it.landed && !it.removing);
  state.trainingHold = trainingHold;
  gameArea.classList.toggle('training-hold', trainingHold);
  document.body.classList.toggle('training-hold-active', trainingHold);

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.removing) continue;

    if (item.landed) {
      item.el.classList.add('training-landed');
      continue;
    }

    // Black Hole Event Horizon Suction & Gravitational Slowdown & Progressive Spaghettification
    const h = item.el.offsetHeight || 36;
    const itemW = item.el.offsetWidth || 60;
    // O buraco negro começa a exercer atração gravitacional e distorção a partir de ~78-80% da altura da tela
    const suctionStart = boardH * 0.78;
    const swallowY = boardH - 42;      // Ponto de consumo na singularidade

    // Geometria da Barreira de Escudo Planetário (raio r=408, centro Y = boardH + 308)
    const itemCenterX = (item.x !== undefined ? item.x : item.el.offsetLeft) + (itemW / 2);
    const boardCenterDx = itemCenterX - (boardW / 2);
    const shieldR = 408;
    const shieldCenterY = boardH + 308;
    const underSqrt = Math.max(0, shieldR * shieldR - boardCenterDx * boardCenterDx);
    const shieldBarrierY = shieldCenterY - Math.sqrt(underSqrt);

    // Quando a Imunidade estiver ativa: destrói os objetos assim que tocar na barreira da imunidade
    if (isImmunityActive && (item.y + h >= shieldBarrierY)) {
      item.removing = true;
      item.el.classList.remove('danger', 'in-black-hole-pull', 'typing-target', 'eco-target');
      item.el.classList.add('shattered', 'shield-vaporized');
      item.el.querySelectorAll('.skill-badge, .wildcard-badge, .eco-target-badge, .new-word-badge').forEach(b => b.remove());

      playSound('skill');

      if (typeof spawnCelestialExplosion === 'function') {
        spawnCelestialExplosion(item.el, item.text);
      } else if (typeof spawnParticles === 'function') {
        spawnParticles(item.el, (item.text?.length || 3) * 2);
      }

      // Flash de absorção cósmica na barreira de escudo
      if (earthShield) {
        earthShield.classList.remove('shield-absorb');
        void earthShield.offsetWidth;
        earthShield.classList.add('shield-absorb');
        setTimeout(() => {
          if (earthShield) earthShield.classList.remove('shield-absorb');
        }, 300);
      }

      const blockMsg = typeof t === 'function' ? t('fb_shield_blocked') : '🛡️ Dano bloqueado pela Imunidade!';
      showFeedback(blockMsg, 'special');

      if (item.isBossMeaning) {
        if (state.bossBattle?.currentWord) {
          state.bossBattle.lastDroppedWord = state.bossBattle.currentWord.text.toLowerCase();
        }
        state.typedBuffer = '';
        state.speedMultiplier = 1.0;
        setTimeout(() => {
          item.el?.parentNode?.removeChild(item.el);
          if (state.bossBattle?.active && !state.paused && state.lives > 0) {
            if (typeof spawnBossMeaningBox === 'function') spawnBossMeaningBox();
          }
        }, 260);
      } else {
        setTimeout(() => item.el?.parentNode?.removeChild(item.el), 260);
      }

      // Se o buffer pertencia a este item e ele era único, limpa o buffer
      if (state.typedBuffer && item.text && item.text.startsWith(state.typedBuffer)) {
        const remaining = items.filter(it => !it.removing && it.id !== item.id && it.text.startsWith(state.typedBuffer));
        if (remaining.length === 0) {
          state.typedBuffer = '';
          clearHighlight();
        }
      }

      items.splice(i, 1);
      continue;
    }

    // Movimentação dos objetos (com dilatação gravitacional e espaguetificação estritamente fora do treinamento)
    if (!isFrozen && !trainingHold) {
      const spd = item.baseSpeed || CFG.baseSpeed;
      let gravFactor = 1.0;
      if (state.gameMode !== 'training' && (item.y + h >= suctionStart)) {
        // Progresso normalizado de entrada no poço gravitacional (0.0 no início dos 80% até 1.0 na boca)
        const pullProgress = Math.min(1, Math.max(0, (item.y + h - suctionStart) / (swallowY - suctionStart)));

        // A velocidade vai se reduzindo progressivamente até quase parar (cai suavemente até ~0.08x)
        gravFactor = Math.max(0.08, 1.0 - Math.pow(pullProgress, 0.72) * 0.92);

        // Espaguetificação suave e contínua: começa a esticar a partir de 80% e já fica bem distorcido ao chegar no fundo
        const sx = 1.0 - (pullProgress * 0.62); // 1.0 -> 0.38 (afinamento horizontal)
        const sy = 1.0 + (Math.pow(pullProgress, 0.85) * 1.35); // 1.0 -> 2.35 (alongamento vertical)
        item.el.style.transformOrigin = '50% 85%';
        item.el.style.transform = `scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
      } else {
        item.el.style.transform = '';
      }
      item.y += spd * effectiveSpeed * gravFactor * dt;
      item.el.style.top = item.y + 'px';
    }

    // Sinalizador de perigo e aura de sucção gravitacional (apenas fora do treinamento)
    if (state.gameMode !== 'training') {
      if (item.y + h >= suctionStart + 15) {
        item.el.classList.add('danger');
      } else {
        item.el.classList.remove('danger');
      }

      if (item.y + h >= suctionStart) {
        item.el.classList.add('in-black-hole-pull');
      } else {
        item.el.classList.remove('in-black-hole-pull');
      }
    } else {
      item.el.classList.remove('danger', 'in-black-hole-pull');
    }

    // Modo Treinamento: trava ao tocar na linha do escudo azul sem destruir
    if (state.gameMode === 'training' && (item.y + h >= shieldBarrierY)) {
      item.y = shieldBarrierY - h;
      item.el.style.top = item.y + 'px';
      item.el.style.transform = '';
      item.landed = true;
      item.el.classList.remove('danger', 'in-black-hole-pull');
      item.el.classList.add('training-landed');
      playSound('fall');
      continue;
    }

    // Fall into the Black Hole Event Horizon (Gravitational Spaghettification Swallowing) - apenas fora do treinamento
    const swallowThreshold = item.isBossMeaning ? (boardH - 35) : (boardH - 45);
    if (state.gameMode !== 'training' && (item.y + h >= swallowThreshold)) {
      item.removing = true;
      item.el.classList.remove('danger', 'in-black-hole-pull', 'typing-target');
      item.el.classList.add('swallowing');
      playSound('fall');
      loseLife();

      if (typeof window.triggerBlackHolePulse === 'function') {
        window.triggerBlackHolePulse();
      }

      if (item.isBossMeaning) {
        showFeedback(typeof t === 'function' ? t('fb_boss_enigma_dropped') : '💥 The enigma dropped! The Boss attacked!', 'error');
        if (typeof flashBossDamage === 'function') flashBossDamage();
        // Regra 2: Salva o significado que caiu para não repeti-lo imediatamente no próximo sorteio
        if (state.bossBattle?.currentWord) {
          state.bossBattle.lastDroppedWord = state.bossBattle.currentWord.text.toLowerCase();
        }
        state.typedBuffer = '';
        state.speedMultiplier = 1.0; // Garante velocidade fixa em 1.0x
        setTimeout(() => {
          item.el?.parentNode?.removeChild(item.el);
          if (state.bossBattle?.active && !state.paused && state.lives > 0) {
            if (typeof spawnBossMeaningBox === 'function') spawnBossMeaningBox();
          }
        }, 440);
      } else {
        setTimeout(() => item.el?.parentNode?.removeChild(item.el), 440);
      }

      items.splice(i, 1);
      continue;
    }
  }

  if (typeof updateFingerGuide === 'function' && typeof isFingerGuideActive === 'function' && isFingerGuideActive()) {
    updateFingerGuide();
  }

  state.rafId = requestAnimationFrame(gameLoop);
}

// ============================================================
// 5. MATCHING & COMPLETION
// ============================================================
function handleLetterTyped(char) {
  if (state.paused || state.phaseComplete || (typeof isShopOpen === 'function' && isShopOpen())) {
    state.typedBuffer = '';
    return;
  }
  // Boss Battle dedicated typing logic
  if (state.bossBattle && state.bossBattle.active) {
    if (typeof handleBossLetterTyped === 'function') handleBossLetterTyped(char);
    return;
  }

  // Trava de proteção: Não pune o jogador se o campo/tabuleiro estiver sem rúnicos ativos!
  const activeTokens = state.activeItems.filter(item => !item.removing);
  if (activeTokens.length === 0) {
    state.typedBuffer = '';
    return;
  }

  // Normalize space and hyphen interchangeability for compound cosmic terms (e.g. BURACO-NEGRO)
  let effectiveChar = char;
  const currentLen = state.typedBuffer.length;
  const candidates = activeTokens.filter(item => {
    if (item.text.startsWith(state.typedBuffer)) {
      const nextChar = item.text[currentLen];
      if (nextChar === char) return true;
      if ((char === ' ' || char === '-') && (nextChar === '-' || nextChar === ' ')) return true;
    }
    return false;
  });

  if (candidates.length > 0) {
    effectiveChar = candidates[0].text[currentLen];
  }

  const nextBuf = state.typedBuffer + effectiveChar;

  const matching = activeTokens.filter(item =>
    item.text.startsWith(nextBuf)
  );

  if (matching.length > 0) {
    state.typedBuffer = nextBuf;
    state.hitsPhase++;
    state.totalHits++;
    state.charsTyped = (state.charsTyped || 0) + 1;
    if (typeof playMechanicalClick === 'function') playMechanicalClick(state.typedBuffer.length);

    const target = matching.reduce((lowest, item) => item.y > lowest.y ? item : lowest);

    if (target.text === state.typedBuffer) {
      completeItem(target);
      state.typedBuffer = '';
      clearHighlight();
    } else {
      playSound('hit');
      highlightBuffer();
    }
  } else {
    // Check if char starts another item (also normalizing space/hyphen)
    const newMatching = activeTokens.filter(item => {
      const first = item.text[0];
      return first === char || ((char === ' ' || char === '-') && (first === '-' || first === ' '));
    });

    if (newMatching.length > 0) {
      state.typedBuffer = char;
      state.hitsPhase++;
      state.totalHits++;
      state.charsTyped = (state.charsTyped || 0) + 1;
      if (typeof playMechanicalClick === 'function') playMechanicalClick(1);

      const target = newMatching.reduce((lowest, item) => item.y > lowest.y ? item : lowest);
      if (target.text === char) {
        completeItem(target);
        state.typedBuffer = '';
        clearHighlight();
      } else {
        playSound('hit');
        highlightBuffer();
      }
    } else {
      // Check if Shield protects against error penalty
      if ((state.activeTimers?.shield || 0) > 0) {
        state.typedBuffer = '';
        clearHighlight();
        playSound('skill');
        const msg = typeof t === 'function' ? t('fb_shield_error_protected') : '🛡️ Error protected by Shield!';
        showFeedback(msg, 'special');
        return;
      }

      // Combo breaks on error
      if (state.combo > 0) {
        state.combo = 0;
        showFeedback(typeof t === 'function' ? t('fb_combo_broken') : 'Combo broken!', 'error');
      }

      // Typo: -1 penalty at phase end + 1 point deduction from progress bar (sem penalidade de velocidade)
      state.errorsPhase++;
      state.totalErrors++;
      const diffCfg = typeof getDifficultyConfig === 'function' ? getDifficultyConfig() : { speedErrorPenalty: 0, progressErrorPenalty: 1 };
      if (state.gameMode !== 'training' && diffCfg.progressErrorPenalty > 0) {
        state.progress = Math.max(0, (state.progress || 0) - diffCfg.progressErrorPenalty);
      }

      if (progressFill && diffCfg.progressErrorPenalty > 0) {
        progressFill.classList.add('err-flash');
        setTimeout(() => progressFill.classList.remove('err-flash'), 320);
      }

      state.typedBuffer = '';
      clearHighlight();
      playSound('error');
      const errLbl = typeof t === 'function' ? t('fb_error') : '❌ Error';
      showFeedback(errLbl, 'error');
      updateHUD();
    }
  }

  if (typeof updateFingerGuide === 'function' && typeof isFingerGuideActive === 'function' && isFingerGuideActive()) {
    updateFingerGuide();
  }
}

function attachItemBadges(item) {
  if (!item || !item.el) return;
  // Previne duplicação removendo badges existentes antes de recolocá-los
  item.el.querySelectorAll('.skill-badge, .wildcard-badge, .eco-target-badge, .new-word-badge').forEach(el => el.remove());

  if (item.skill) {
    const b = document.createElement('div');
    b.className = 'skill-badge'; b.textContent = '⚡';
    item.el.appendChild(b);
  }
  if (item.type === 'wildcard') {
    const b = document.createElement('div');
    b.className = 'wildcard-badge'; b.textContent = '💥';
    item.el.appendChild(b);
  }
  if (item.el.classList.contains('eco-target')) {
    const b = document.createElement('div');
    b.className = 'eco-target-badge';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="22"/></svg>';
    b.title = typeof t === 'function' ? t('skill_name_autodestroy') : 'Eco Target';
    item.el.appendChild(b);
  }
  // Micro-badge de Palavra Nova na Partida (Game UX: Padrão da Indústria)
  if (item.type === 'word' && typeof isWordNewInRun === 'function' && isWordNewInRun(item.text)) {
    const b = document.createElement('div');
    b.className = 'new-word-badge';
    b.title = typeof t === 'function' ? t('badge_new_word') : 'Nova palavra na partida';
    const label = typeof t === 'function' ? t('badge_new_label') : 'NOVO';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg><span>' + label + '</span>';
    item.el.appendChild(b);
  }
}

function highlightBuffer() {
  state.activeItems.forEach(item => {
    if (item.removing) return;
    if (item.text.startsWith(state.typedBuffer)) {
      item.el.classList.add('typing-target');
      if (item.el.classList.contains('eco-target')) {
        item.el.classList.remove('eco-target');
        item.el.querySelector('.eco-target-badge')?.remove();
      }
      const matched = state.typedBuffer;
      const rest = item.text.slice(matched.length);
      const textSpan = item.el.querySelector('.falling-text');
      if (textSpan) {
        textSpan.innerHTML = `<span class="m">${matched}</span>${rest}`;
      } else {
        item.el.innerHTML = `<span class="m">${matched}</span>${rest}`;
      }
      attachItemBadges(item);
    } else {
      item.el.classList.remove('typing-target');
    }
  });
  if (typeof updateEcoTargetingIndicator === 'function') {
    updateEcoTargetingIndicator();
  }
}

function clearHighlight() {
  state.activeItems.forEach(item => {
    if (item.removing) return;
    item.el.classList.remove('typing-target');
    const textSpan = item.el.querySelector('.falling-text');
    if (textSpan) {
      textSpan.textContent = item.text;
    } else {
      item.el.textContent = item.text;
    }
    attachItemBadges(item);
  });
  if (typeof updateEcoTargetingIndicator === 'function') {
    updateEcoTargetingIndicator();
  }
}

function completeItem(item) {
  item.removing = true;
  item.el.style.transform = '';
  item.el.classList.remove('typing-target');
  item.el.classList.add('shattered');
  if (typeof spawnCelestialExplosion === 'function') {
    spawnCelestialExplosion(item.el, item.text);
  } else {
    spawnParticles(item.el, item.text.length * 2);
  }

  // Velocidade NÃO aumenta ao acertar elementos (progressão controlada a cada 5s pelo gameLoop)

  // Handle Wildcard
  if (item.type === 'wildcard') {
    if (typeof wildcardExplode === 'function') wildcardExplode(item);
    return;
  }

  // Regra de Combo:
  // Letra e Sílaba: dão pontos com multiplicador do combo atual, mas NÃO aumentam combo.
  // Palavra completa: +1 combo.
  const isWord = (item.type === 'word');

  if (isWord) {
    state.combo = (state.combo || 0) + 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.maxComboPhase = Math.max(state.maxComboPhase || 0, state.combo);
    try {
      const curBest = parseInt(localStorage.getItem('digithin_galaxy_best_combo') || '0', 10);
      if (state.maxCombo > curBest) localStorage.setItem('digithin_galaxy_best_combo', String(state.maxCombo));
    } catch (_) { }
    if (state.combo >= 30) {
      unlockAchievement('mestre_combo');
    }

    // Check Modo Fúria
    if (state.combo === 15) {
      playSound('fury');
      showFeedback(typeof t === 'function' ? t('fb_fury_activated') : 'FURY MODE ACTIVATED! DOUBLE POINTS!', 'special');
      unlockAchievement('modo_furia');
    } else if (state.combo > 1) {
      playSound('combo');
    }
  }

  // Multiplier calculation (estilo Tetris: combo escala o multiplicador de pontos):
  const isFury = (state.combo || 0) >= 15;
  let comboMult = 1;
  if (state.combo >= 15) comboMult = 4;
  else if (state.combo >= 10) comboMult = 3;
  else if (state.combo >= 5) comboMult = 2;
  else if (state.combo >= 2) comboMult = 1.5;

  // In Modo Fúria, point multiplier doubles:
  if (isFury) {
    comboMult *= 2;
  }

  // Points & XP
  let basePts = item.type === 'letter' ? 1 : item.type === 'syllable' ? 3 : wordPts(item.text);
  if ((state.activeTimers?.haste || 0) > 0) basePts = Math.floor(basePts * 2);

  const pts = basePts * comboMult;
  state.phasePts += pts;
  state.totalScore = (state.totalScore || 0) + pts;

  // XP progression
  if (state.gameMode === 'training') {
    const charsCompleted = (item.text || '').length || 1;
    state.progress = Math.min(phaseGoal(), (state.progress || 0) + charsCompleted);
  } else {
    const charLen = (item.text || '').length || 1;
    const baseXp = item.type === 'letter' ? 1 : item.type === 'syllable' ? 3 : Math.max(5, charLen * 2);
    const bonusXp = (item.skill?.id === 'bonus_xp') ? 25 : 0;
    if (typeof addPlayerXp === 'function') {
      addPlayerXp(baseXp + bonusXp);
    }
    state.progress = state.currentXp || 0;
  }
  updateHUD();

  if (progressFill) {
    progressFill.classList.add('hit-flash');
    setTimeout(() => progressFill.classList.remove('hit-flash'), 220);
  }

  if (item.type === 'letter') playSound('hit');
  else if (item.type === 'syllable') playSound('syllable');
  else playSound('word');

  showFeedback(comboMult > 1 ? `+${pts} (${comboMult}× Combo!)` : `+${pts}`, 'success');

  // Track discovered word stats & farm coins every 10 words
  if (item.type === 'word') {
    const key = item.text.toLowerCase();
    if (!state.runWordsLearned) state.runWordsLearned = new Set();
    state.runWordsLearned.add(key);
    if (!state.runWordsSeen) state.runWordsSeen = new Set();
    state.runWordsSeen.add(key);

    // Remove micro-badge de palavra nova de quaisquer outras instâncias ativas desse termo
    state.activeItems.forEach(otherItem => {
      if (otherItem.type === 'word' && (otherItem.text || '').toLowerCase() === key) {
        otherItem.el.querySelector('.new-word-badge')?.remove();
      }
    });
    // Atualiza a esteira de fila de próximos vocábulos
    if (typeof renderQueue === 'function') {
      renderQueue();
    }

    if (!state.wordStats[key]) state.wordStats[key] = { count: 0 };
    state.wordStats[key].count++;

    // Salva na biblioteca cósmica permanente
    if (typeof addPermanentUnlockedWord === 'function') {
      addPermanentUnlockedWord({ text: item.text, meaning: item.meaning || '', phase: 1 });
    }
    if (typeof savePermanentWordStats === 'function') {
      savePermanentWordStats(state.wordStats);
    }

    // Requisito 10: a cada 10 palavras destruídas o jogador recebe +1 moeda
    if (state.gameMode !== 'training') {
      state.wordsDestroyedForCoin = (state.wordsDestroyedForCoin || 0) + 1;
      state.totalWordsCompletedMatch = (state.totalWordsCompletedMatch || 0) + 1;
      state.progress = state.wordsDestroyedForCoin;
      if (state.wordsDestroyedForCoin >= 10) {
        state.wordsDestroyedForCoin = 0;
        state.progress = 0;
        if (typeof addSharedCoins === 'function') addSharedCoins(1);
        state.coins = (typeof getSharedCoins === 'function') ? getSharedCoins() : (state.coins || 0) + 1;
        state.totalCoinsEarned = (state.totalCoinsEarned || 0) + 1;
        if (typeof playSound === 'function') playSound('buy');
        const coinMsg = typeof t === 'function' ? t('fb_coin_farmed') : '+1 Coin farmed! 🪙';
        showFeedback(coinMsg, 'success');
      }
    }

    // Requisito 2: Surgimento aleatório de Alien Boss vindo do espaço para atacar a Terra
    if (state.gameMode !== 'training' && (!state.bossBattle || !state.bossBattle.active)) {
      const passedCount = Math.max(state.runWordsLearned?.size || 0, state.runWordsSeen?.size || 0);
      if (passedCount >= 3) {
        if (typeof state.alienInvasionCountdown === 'undefined' || state.alienInvasionCountdown === null) {
          state.alienInvasionCountdown = 16 + Math.floor(Math.random() * 8);
        }
        state.alienInvasionCountdown--;
        if (state.alienInvasionCountdown <= 0 && typeof triggerAlienBossInvasion === 'function') {
          triggerAlienBossInvasion();
        }
      }
    }

    // Track total words completed for achievement 'mestre_tipo' (100 Palavras Completas)
    try {
      let statsCount = 0;
      for (const k in state.wordStats) {
        statsCount += state.wordStats[k].count || 0;
      }
      const stored = parseInt(localStorage.getItem('digithin_galaxy_words_completed') || '0', 10) || 0;
      const totalWords = Math.max(stored + 1, statsCount);
      localStorage.setItem('digithin_galaxy_words_completed', String(totalWords));
      if (totalWords >= 100) {
        unlockAchievement('mestre_tipo');
      }
    } catch (_) { }
  }

  // Attached skill
  if (item.skill) {
    if (typeof gainSkill === 'function') gainSkill(item.skill.id);
  }

  // Active Bomb effect
  if (state.activeTimers.bomb > 0) {
    if (typeof triggerBombAreaExplosion === 'function') triggerBombAreaExplosion(item);
  }

  setTimeout(() => {
    item.el?.parentNode?.removeChild(item.el);
    state.activeItems = state.activeItems.filter(i => i.id !== item.id);
    if (typeof checkFreezerAutoCancel === 'function') checkFreezerAutoCancel();
  }, 240);

  updateHUD();
  checkPhaseComplete();
}

// Auto-save on page unload if match is in progress
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (typeof isMatchInProgress === 'function' && isMatchInProgress()) {
      if (typeof saveGameProgress === 'function') {
        saveGameProgress();
      }
    }
  });

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (typeof updateStartScreenUI === 'function') updateStartScreenUI();
      });
    } else {
      if (typeof updateStartScreenUI === 'function') updateStartScreenUI();
    }
  }
}
