/* ================================================
   DIGITHIN GALAXY — js/progress-ui.js
   Achievements and training worlds modals
   ================================================ */
'use strict';

// ============================================================
// ACHIEVEMENTS SYSTEM
// ============================================================
function showAchievementToast(ach) {
  const toast = $('achievement-toast');
  if (!toast) return;
  const icon = $('at-icon');
  const name = $('at-name');
  const desc = $('at-desc');
  if (icon) icon.textContent = ach.icon || '🏆';
  if (name) {
    const achName = (typeof t === 'function' && t('ach_' + ach.id + '_name') !== ('ach_' + ach.id + '_name'))
      ? t('ach_' + ach.id + '_name')
      : (ach.name || '');
    name.textContent = achName;
  }
  if (desc) {
    const achDesc = (typeof t === 'function' && t('ach_' + ach.id + '_desc') !== ('ach_' + ach.id + '_desc'))
      ? t('ach_' + ach.id + '_desc')
      : (ach.desc || '');
    desc.textContent = achDesc;
  }

  toast.classList.remove('hidden');
  playSound('achievement');
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => toast.classList.add('hidden'), 4000);
}

function unlockAchievement(id) {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem('digithin_galaxy_achievements') || '{}');
  } catch (_) {}
  if (saved[id]) return;
  saved[id] = Date.now();
  try {
    localStorage.setItem('digithin_galaxy_achievements', JSON.stringify(saved));
  } catch (_) {}
  const def = (typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : []).find(a => a.id === id);
  if (def) showAchievementToast(def);
}

let achPaused = false;
let achOpenedFromPause = false;

function showConquistas() {
  // If pause overlay is currently visible, hide it while conquistas modal is open
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay && !pauseOverlay.classList.contains('hidden')) {
    achOpenedFromPause = true;
    pauseOverlay.classList.add('hidden');
  } else {
    achOpenedFromPause = false;
  }

  if (screenGame?.classList.contains('active') && !state.paused && !state.phaseComplete) {
    achPaused    = true;
    state.paused = true;
    cancelAnimationFrame(state.rafId);
    clearTimeout(state.spawnTimer);
  }

  // Pre-check retroactive unlock for Colecionador
  if (state.unlockedWords && state.unlockedWords.length >= (typeof WORD_POOL !== 'undefined' ? WORD_POOL.length : 30)) {
    unlockAchievement('colecionador');
  }

  renderConquistasModal();

  const modal = $('modal-conquistas');
  if (modal) modal.classList.remove('hidden');
}

function closeConquistas() {
  const modal = $('modal-conquistas');
  if (modal) modal.classList.add('hidden');

  // If opened from pause menu, restore pause menu
  if (achOpenedFromPause) {
    achOpenedFromPause = false;
    const pauseOverlay = $('pause-overlay');
    if (pauseOverlay) pauseOverlay.classList.remove('hidden');
    return;
  }

  if (achPaused) {
    achPaused = false;
    if (!state.escPaused && !state.phaseComplete) {
      state.paused = false;
      state.lastTs = null;
      state.rafId  = requestAnimationFrame(gameLoop);
      if (!state.bossBattle || !state.bossBattle.active) {
        scheduleSpawn();
      }
      focusGameInput();
    }
  }
}

function renderConquistasModal() {
  const grid  = $('achievements-grid');
  const badge = $('achievements-counter-badge');
  if (!grid || !badge) return;
  grid.innerHTML = '';

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem('digithin_galaxy_achievements') || '{}');
  } catch (_) {}

  const bestWpm    = Math.max(state.currentWpm || 0, parseInt(localStorage.getItem('digithin_galaxy_best_wpm') || '0', 10));
  const bestCombo  = Math.max(state.maxCombo || 0, parseInt(localStorage.getItem('digithin_galaxy_best_combo') || '0', 10));
  const wordsCount = state.unlockedWords ? state.unlockedWords.length : 0;

  const total = (typeof ACHIEVEMENTS !== 'undefined') ? ACHIEVEMENTS.length : 6;
  const list  = (typeof ACHIEVEMENTS !== 'undefined') ? ACHIEVEMENTS : [];
  const unlockedCount = list.filter(a => !!saved[a.id]).length;
  badge.textContent = (typeof t === 'function')
    ? t('ach_counter', { unlocked: unlockedCount, total: total })
    : `${unlockedCount} / ${total} Unlocked`;

  list.forEach(ach => {
    const isUnlocked = !!saved[ach.id];
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'ach-unlocked' : 'ach-locked'}`;

    let curVal = 0;
    const target = ach.target || 1;
    let progressTxt = '';

    if (ach.id === 'dedo_veloz') {
      curVal = Math.min(target, bestWpm);
      progressTxt = isUnlocked ? (t('ach_goal_reached') + ' (60+ ' + t('hud_wpm') + ')') : `Record: ${curVal} / ${target} ${t('hud_wpm')}`;
    } else if (ach.id === 'cirurgico') {
      curVal = isUnlocked ? 100 : (state.currentAccuracy ? Math.round(state.currentAccuracy) : 0);
      const accLabel = typeof t === 'function' ? t('hud_accuracy') : 'ACCURACY';
      progressTxt = isUnlocked ? `${t('ach_goal_reached')} (100% ${accLabel})` : `100% ${accLabel}`;
    } else if (ach.id === 'colecionador') {
      curVal = Math.min(target, wordsCount);
      progressTxt = isUnlocked ? (t('ach_goal_reached') + ` (${target} ${t('ach_unit_words')})`) : `${curVal} / ${target} ${t('ach_unit_words')}`;
    } else if (ach.id === 'mestre_combo') {
      curVal = Math.min(target, bestCombo);
      progressTxt = isUnlocked ? (t('ach_goal_reached') + ' (30+ combo)') : `${curVal} / ${target} ${t('ach_unit_streak')}`;
    } else if (ach.id === 'modo_furia') {
      curVal = Math.min(target, bestCombo);
      progressTxt = isUnlocked ? (t('ach_goal_reached') + ' (15+ combo)') : `${curVal} / ${target} ${t('ach_unit_combo')}`;
    } else if (ach.id === 'mestre_tipo') {
      let curWords = 0;
      try {
        curWords = parseInt(localStorage.getItem('digithin_galaxy_words_completed') || '0', 10);
      } catch (_) {}
      curVal = Math.min(target, curWords);
      const unitTxt = typeof t === 'function' ? t('ach_unit_words') : 'words';
      progressTxt = isUnlocked
        ? ((typeof t === 'function' ? t('ach_goal_reached') : 'Goal reached') + ` (100+ ${unitTxt})`)
        : `${curVal} / ${target} ${unitTxt}`;
    }

    const pct = isUnlocked ? 100 : Math.min(100, Math.max(0, Math.round((curVal / target) * 100)));

    let dateStr = '';
    if (isUnlocked && saved[ach.id]) {
      try {
        const d = new Date(saved[ach.id]);
        dateStr = d.toLocaleDateString();
      } catch (_) {}
    }

    const statusTxt = isUnlocked
      ? (typeof t === 'function' ? t('ach_status_unlocked') : '✓ Unlocked')
      : (typeof t === 'function' ? t('ach_status_locked') : 'Locked');

    const achName = (typeof t === 'function' && t('ach_' + ach.id + '_name') !== ('ach_' + ach.id + '_name')) ? t('ach_' + ach.id + '_name') : ach.name;
    const achDesc = (typeof t === 'function' && t('ach_' + ach.id + '_desc') !== ('ach_' + ach.id + '_desc')) ? t('ach_' + ach.id + '_desc') : ach.desc;

    const lockSvg = `<svg class="ach-lock-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;opacity:0.8;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

    card.innerHTML = `
      <div class="ach-icon-seal">
        <span>${isUnlocked ? ach.icon : lockSvg}</span>
      </div>
      <div class="ach-details">
        <div class="ach-title-row">
          <span class="ach-name">${achName}</span>
          <span class="ach-status-badge">${statusTxt}</span>
        </div>
        <p class="ach-desc">${achDesc}</p>
        <div class="ach-progress-wrap">
          <div class="ach-progress-bar">
            <div class="ach-progress-fill" style="width: ${pct}%"></div>
          </div>
          <span class="ach-progress-text">${progressTxt}${dateStr ? ` <span class="ach-date-text">&bull; ${dateStr}</span>` : ''}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ============================================================
// TRAINING MODE MODAL (KEYBOARD ROW PROGRESSION)
// ============================================================
function openTrainingModal() {
  renderTrainingWorlds();
  const modal = $('modal-training');
  if (modal) modal.classList.remove('hidden');
}

function closeTrainingModal() {
  const modal = $('modal-training');
  if (modal) modal.classList.add('hidden');
}

function renderTrainingWorlds() {
  const grid = $('training-worlds-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const worlds = typeof getTrainingWorlds === 'function' ? getTrainingWorlds() : (typeof TRAINING_WORLDS !== 'undefined' ? TRAINING_WORLDS : {});

  Object.values(worlds).forEach(w => {
    let isCompleted = false;
    let bestAcc = null;
    try {
      isCompleted = localStorage.getItem(`digithin_galaxy_training_world_${w.id}`) === 'completed';
      const savedPrec = localStorage.getItem(`digithin_galaxy_training_precision_${w.id}`);
      if (savedPrec !== null) {
        bestAcc = parseFloat(savedPrec).toFixed(1);
      } else if (isCompleted) {
        // Baseline for completed world prior to precision logging
        bestAcc = '100.0';
      }
    } catch (_) {}

    const card = document.createElement('div');
    card.className = 'training-world-card' + (isCompleted ? ' twc-completed' : '');
    card.style.setProperty('--card-color', w.color || 'var(--accent-cyan)');

    const keysHtml = w.chars.map(c => `<span class="twc-key-badge">${c}</span>`).join('');
    const statusCompleted = typeof t === 'function' ? t('training_completed') : '🏅 Completed (Mastery)';
    const statusPending   = typeof t === 'function' ? t('training_pending') : '🎯 3 Lessons';
    const statusBadge = isCompleted
      ? `<span class="twc-status-badge">${statusCompleted}</span>`
      : `<span class="twc-status-badge twc-status-pending">${statusPending}</span>`;

    const recordLabel = typeof t === 'function' && bestAcc !== null
      ? t('training_record_acc', { acc: bestAcc })
      : `🎯 Record: ${bestAcc || '100.0'}% Precision`;
    const recordBadge = (isCompleted && bestAcc !== null)
      ? `<span class="twc-record-badge" title="${bestAcc}% Precision Record">${recordLabel}</span>`
      : '';

    const btnAgain = typeof t === 'function' ? t('training_btn_again') : 'Train Again 🔄';
    const btnStart = typeof t === 'function' ? t('training_btn_start') : 'Start Training (3 Lessons) →';

    card.innerHTML = `
      <div class="twc-head">
        <div class="twc-icon-wrap" style="color: ${w.color || 'inherit'}">
          <span>${w.icon}</span>
        </div>
        <div class="twc-title-col">
          <div class="twc-name">${w.name}</div>
          <div class="twc-meta-row">
            ${statusBadge}
            ${recordBadge}
          </div>
        </div>
      </div>
      <p class="twc-desc">${w.desc}</p>
      <div class="twc-keys-preview">
        ${keysHtml}
      </div>
      <button class="twc-start-btn" type="button" onclick="startTrainingWorld(${w.id})">
        ${isCompleted ? btnAgain : btnStart}
      </button>
    `;

    grid.appendChild(card);
  });
}
