/* ================================================
   DIGITHIN GALAXY — js/library.js
   Word library (bestiary) modal & stats
   ================================================ */
'use strict';

let libOpenedFromPause = false;

function showBiblioteca() {
  // If pause overlay is currently visible, hide it while library is open
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay && !pauseOverlay.classList.contains('hidden')) {
    libOpenedFromPause = true;
    pauseOverlay.classList.add('hidden');
  } else {
    libOpenedFromPause = false;
  }

  // Pause the game if currently running
  if (screenGame?.classList.contains('active') && !state.paused && !state.phaseComplete) {
    state.libPaused = true;
    state.paused    = true;
    cancelAnimationFrame(state.rafId);
    clearTimeout(state.spawnTimer);
  }

  const grid  = $('lib-words-grid');
  const badge = $('lib-counter-badge');
  if (!grid || !badge) return;
  grid.innerHTML = '';

  const unlockedMap = {};
  state.unlockedWords?.forEach(w => {
    unlockedMap[w.text.toLowerCase()] = w;
  });

  const totalWords    = WORD_POOL.length;
  const unlockedCount = Object.keys(unlockedMap).length;
  const discLbl       = typeof t === 'function' ? t('lib_discovered') : 'Discovered';
  badge.textContent   = `${unlockedCount} / ${totalWords} ${discLbl}`;

  const lang = typeof getLanguage === 'function' ? getLanguage() : 'en';

  WORD_POOL.forEach(w => {
    const isUnlocked = !!unlockedMap[w.text.toLowerCase()];
    const count      = state.wordStats?.[w.text.toLowerCase()]?.count || 0;
    const pts        = wordPts(w.text);

    const card = document.createElement('div');
    card.className = 'lib-word-card' + (isUnlocked ? (count > 0 ? ' lwc-completed' : ' lwc-unlocked') : ' lwc-locked');

    const lockedTxt = typeof t === 'function' ? t('lib_locked') : 'Locked';
    const typedTxt = count > 0
      ? (typeof t === 'function' ? '✓ ' + t('lib_typed').replace('{count}', count) : `✓ typed ${count}×`)
      : (typeof t === 'function' ? '○ ' + t('lib_not_typed') : '○ not typed yet');

    if (isUnlocked) {
      card.innerHTML = `
        <div class="lwc-word">${w.text.toUpperCase()}</div>
        <div class="lwc-meta">
          <span>${w.type}</span>
          <span class="lwc-pts">+${pts}pts</span>
        </div>
        ${w.meaning ? `<div class="lwc-meaning">"${w.meaning}"</div>` : ''}
        <div class="lwc-count">${typedTxt}</div>
      `;
    } else {
      card.innerHTML = `
        <div class="lwc-word">
          <svg class="lwc-lock-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:text-bottom;margin-right:5px;opacity:0.85;">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          ???
        </div>
        <div class="lwc-meta">
          <span>${w.type}</span>
          <span class="lwc-pts">??? pts</span>
        </div>
        <div class="lwc-locked-badge">
          <svg class="btn-svg-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:3px;">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          ${lockedTxt}
        </div>
      `;
    }

    grid.appendChild(card);
  });

  modalLib?.classList.remove('hidden');
}

function renderBibliotecaModal() {
  if (modalLib && !modalLib.classList.contains('hidden')) {
    showBiblioteca();
  }
}

function closeBiblioteca() {
  modalLib?.classList.add('hidden');

  // If opened from pause menu, restore pause menu
  if (libOpenedFromPause) {
    libOpenedFromPause = false;
    const pauseOverlay = $('pause-overlay');
    if (pauseOverlay) pauseOverlay.classList.remove('hidden');
    return;
  }

  // Resume game if it was paused specifically by the library
  if (state.libPaused) {
    state.libPaused = false;
    if (!state.escPaused && !state.phaseComplete) {
      state.paused = false;
      state.lastTs = null;
      state.rafId  = requestAnimationFrame(gameLoop);
      if (!state.bossBattle || !state.bossBattle.active) {
        scheduleSpawn();
      }
      if (typeof focusGameInput === 'function') {
        focusGameInput();
      } else {
        hiddenInput?.focus();
      }
    }
  }
}
