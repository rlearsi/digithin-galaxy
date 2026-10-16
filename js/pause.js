/* ================================================
   DIGITHIN GALAXY — js/pause.js
   Pause / resume state, 3-2-1 countdown & exit confirm
   ================================================ */
'use strict';

function isPauseConfirmOpen() {
  const confirmView = $('pause-confirm-view');
  return confirmView && !confirmView.classList.contains('hidden');
}

function cancelExitConfirm() {
  const mainView = $('pause-main-view');
  const confirmView = $('pause-confirm-view');
  if (mainView && confirmView) {
    confirmView.classList.add('hidden');
    mainView.classList.remove('hidden');
    if (typeof playSound === 'function') playSound('click');
  }
}

function confirmGoToMainMenu() {
  const mainView = $('pause-main-view');
  const confirmView = $('pause-confirm-view');
  if (mainView && confirmView) {
    mainView.classList.add('hidden');
    confirmView.classList.remove('hidden');
    if (typeof playSound === 'function') playSound('click');
  } else {
    goToMainMenu();
  }
}

function executeExitToMainMenu() {
  cancelExitConfirm();
  if (typeof saveGameProgress === 'function') saveGameProgress();
  goToMainMenu();
}

function pauseGame() {
  const screenGame = $('screen-game');
  if (!screenGame?.classList.contains('active')) return;
  if (state.phaseComplete) return;
  if (modalGameover && !modalGameover.classList.contains('hidden')) return;

  const pauseOverlay = $('pause-overlay');

  if (typeof countdownActive !== 'undefined' && countdownActive) {
    cancelResumeCountdown();
    state.escPaused = true;
    state.paused    = true;
    if (typeof resetPauseView === 'function') resetPauseView();
    if (pauseOverlay) pauseOverlay.classList.remove('hidden');
    cancelAnimationFrame(state.rafId);
    clearTimeout(state.spawnTimer);
    return;
  }

  if (state.paused) return;

  state.escPaused = true;
  state.paused    = true;
  if (typeof resetPauseView === 'function') resetPauseView();
  if (pauseOverlay) pauseOverlay.classList.remove('hidden');
  cancelAnimationFrame(state.rafId);
  clearTimeout(state.spawnTimer);
}

function resumeGame() {
  const screenGame = $('screen-game');
  if (!screenGame?.classList.contains('active')) return;
  if (state.phaseComplete) return;

  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
  state.escPaused = false;

  // Run 3, 2, 1 countdown before resuming gameplay!
  runResumeCountdown(() => {
    state.paused = false;
    state.lastTs = null;
    state.rafId  = requestAnimationFrame(gameLoop);
    if (!state.bossBattle || !state.bossBattle.active) {
      scheduleSpawn();
    } else {
      if (state.activeItems.length === 0 && !state.bossBattle.boxItem && (state.bossBattle.boss?.lives || 0) > 0) {
        spawnBossMeaningBox();
      }
    }
    if (typeof focusGameInput === 'function') {
      focusGameInput();
    } else {
      hiddenInput?.focus();
    }
  });
}

function togglePause() {
  // If exit confirmation view is open inside pause, ESC cancels it back to main pause options
  if (isPauseConfirmOpen()) {
    cancelExitConfirm();
    return;
  }

  // If inside the settings view or modal, ESC navigates back / closes it
  if (typeof isSettingsOpen === 'function' && isSettingsOpen()) {
    closeSettings();
    return;
  }
  if (typeof isPauseSettingsOpen === 'function' && isPauseSettingsOpen()) {
    closePauseSettings();
    return;
  }

  // Check other modals that might be open
  const modalTraining = $('modal-training');
  if (modalTraining && !modalTraining.classList.contains('hidden')) {
    if (typeof closeTrainingModal === 'function') closeTrainingModal();
    return;
  }
  const modalLib = $('modal-biblioteca');
  if (modalLib && !modalLib.classList.contains('hidden')) {
    if (typeof closeBiblioteca === 'function') closeBiblioteca();
    return;
  }
  const modalConquistas = $('modal-conquistas');
  if (modalConquistas && !modalConquistas.classList.contains('hidden')) {
    if (typeof closeConquistas === 'function') closeConquistas();
    return;
  }
  const modalPhaseEl = $('modal-phase');
  if (modalPhaseEl && !modalPhaseEl.classList.contains('hidden')) {
    if (typeof isPhaseConfirmOpen === 'function' && isPhaseConfirmOpen()) {
      if (typeof cancelPhaseExitConfirm === 'function') cancelPhaseExitConfirm();
    } else if (typeof showPhaseExitConfirm === 'function') {
      showPhaseExitConfirm();
    }
    return;
  }
  const modalShopEl = $('modal-shop');
  if (modalShopEl && !modalShopEl.classList.contains('hidden')) {
    if (typeof isShopConfirmOpen === 'function' && isShopConfirmOpen()) {
      if (typeof cancelShopExitConfirm === 'function') cancelShopExitConfirm();
    } else if (typeof showShopExitConfirm === 'function') {
      showShopExitConfirm();
    }
    return;
  }

  // Only toggle pause during active gameplay screen
  if (!screenGame?.classList.contains('active')) return;
  if (state.phaseComplete) return;

  if (typeof countdownActive !== 'undefined' && countdownActive) {
    pauseGame();
    return;
  }

  if (state.escPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}
