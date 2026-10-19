/* ================================================
   DIGITHIN GALAXY — js/ui.js
   DOM cache, theme, settings, privacy/rules modals, queue bar and resume countdown
   (HUD, skills, effects, boss UI, level-up, slots and updater live in their own modules)
   ================================================ */
'use strict';

const $ = id => document.getElementById(id);

// DOM Cache
const screenStart    = $('screen-start');
const screenGame     = $('screen-game');
const gameArea       = $('game-area');
const hiddenInput    = $('hidden-input');
const feedbackEl     = $('feedback-msg');
const hudPhasePts    = $('hud-phase-pts');
const hudTotal       = $('hud-total');
const hudCoins       = $('hud-coins');
const phaseNumEl     = $('phase-num');
const progressFill   = $('progress-fill');
const progressText   = $('progress-text');
const livesRow       = $('lives-row');
const speedDisplay   = $('speed-display');
const hitsDisplay    = $('hits-display');
const errorsDisplay  = $('errors-display');
const wordsList      = $('words-list');
const skillsCont     = $('skills-container');
const queueItemsEl   = $('queue-items');
const modalPhase     = $('modal-phase');
const modalShop      = $('modal-shop');
const modalGameover  = $('modal-gameover');
const btnGoRestart   = $('btn-go-restart');
const modalLib         = $('modal-biblioteca');
const modalConquistas  = $('modal-conquistas');
const modalSettings    = $('modal-settings');
const modalRules       = $('modal-rules');

function openRulesModal() {
  const m = modalRules || $('modal-rules');
  if (m) m.classList.remove('hidden');
}

function closeRulesModal() {
  const m = modalRules || $('modal-rules');
  if (m) m.classList.add('hidden');
}

let privacyOpenedFromPause = false;
let privacyOpenedFromSettings = false;
let privacyPaused = false;

function openPrivacyModal() {
  if (typeof state !== 'undefined' && state && screenGame?.classList.contains('active') && !state.paused && !state.phaseComplete) {
    privacyPaused = true;
    state.paused   = true;
    cancelAnimationFrame(state.rafId);
    clearTimeout(state.spawnTimer);
  }

  const pOverlay = $('pause-overlay');
  if (pOverlay && !pOverlay.classList.contains('hidden')) {
    privacyOpenedFromPause = true;
    pOverlay.classList.add('hidden');
  } else {
    privacyOpenedFromPause = false;
  }

  const mSettings = $('modal-settings');
  if (mSettings && !mSettings.classList.contains('hidden')) {
    privacyOpenedFromSettings = true;
    mSettings.classList.add('hidden');
  } else {
    privacyOpenedFromSettings = false;
  }

  const m = $('modal-privacy');
  if (m) m.classList.remove('hidden');
  if (typeof playSound === 'function') playSound('click');
}

function closePrivacyModal() {
  const m = $('modal-privacy');
  if (m) m.classList.add('hidden');

  if (privacyOpenedFromSettings) {
    privacyOpenedFromSettings = false;
    const mSettings = $('modal-settings');
    if (mSettings) mSettings.classList.remove('hidden');
    return;
  }

  if (privacyOpenedFromPause) {
    privacyOpenedFromPause = false;
    const pOverlay = $('pause-overlay');
    if (pOverlay) pOverlay.classList.remove('hidden');
    return;
  }

  if (privacyPaused) {
    privacyPaused = false;
    if (typeof state !== 'undefined' && state && !state.escPaused && !state.phaseComplete) {
      state.paused = false;
      state.lastTs = null;
      if (typeof gameLoop === 'function') state.rafId = requestAnimationFrame(gameLoop);
      if (!state.bossBattle || !state.bossBattle.active) {
        if (typeof scheduleNextSpawn === 'function') state.spawnTimer = setTimeout(scheduleNextSpawn, 1000);
      }
    }
  }
}
const achievementsGrid = $('achievements-grid');
const pauseOverlay     = $('pause-overlay');
const bossHud          = $('boss-hud');
const bossAvatar       = $('boss-avatar');
const bossName         = $('boss-name');
const bossDesc         = $('boss-desc');
const bossHearts       = $('boss-hearts');
const modalBossReward  = $('modal-boss-reward');
const bossSkillsGrid   = $('boss-skills-grid');

// ============================================================
// THEME MANAGEMENT (Foco 100% no Universo e Tema Escuro)
// ============================================================
function initTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
  try {
    localStorage.setItem('digithin_galaxy_theme', 'dark');
  } catch (_) {}
}

function setTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
  try {
    localStorage.setItem('digithin_galaxy_theme', 'dark');
  } catch (_) {}
}

function toggleTheme() {
  // Tema fixado no universo e modo escuro
  setTheme();
}

initTheme();

// ============================================================
// MODAL: ARSENAL DE HABILIDADES (Permanent Skills Inventory)
// ============================================================
let skillsInventoryOpenedFromPause = false;

function openSkillsInventory() {
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay && !pauseOverlay.classList.contains('hidden')) {
    skillsInventoryOpenedFromPause = true;
    pauseOverlay.classList.add('hidden');
  } else {
    skillsInventoryOpenedFromPause = false;
  }

  if (typeof closeSettings === 'function') closeSettings();
  if (typeof closeBiblioteca === 'function') closeBiblioteca();
  if (typeof closeConquistas === 'function') closeConquistas();

  renderSkillsInventoryModal();
  const modal = $('modal-skills-inventory');
  if (modal) modal.classList.remove('hidden');
  if (typeof playSound === 'function') playSound('click');
}

function closeSkillsInventory() {
  const modal = $('modal-skills-inventory');
  if (modal) modal.classList.add('hidden');

  if (skillsInventoryOpenedFromPause) {
    skillsInventoryOpenedFromPause = false;
    const pauseOverlay = $('pause-overlay');
    if (pauseOverlay) pauseOverlay.classList.remove('hidden');
  }
}

function renderSkillsInventoryModal() {
  const grid = $('skills-inventory-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const permSkills = typeof getPermanentSkills === 'function' ? getPermanentSkills() : [];
  if (permSkills.length === 0) {
    const emptyCard = document.createElement('div');
    emptyCard.className = 'skills-empty-card';
    const emptyTxt = typeof t === 'function' ? t('skills_inventory_empty') : 'No skills acquired yet. Visit the Cosmic Shop to stock your arsenal!';
    const shopBtnTxt = typeof t === 'function' ? t('btn_shop') : 'Cosmic Shop';
    emptyCard.innerHTML = `
      <div class="skills-empty-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
      <p class="skills-empty-text">${emptyTxt}</p>
      <button class="btn-primary" onclick="closeSkillsInventory(); openShopFromMenu();">
        <svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
        <span>${shopBtnTxt}</span>
      </button>
    `;
    grid.appendChild(emptyCard);
    return;
  }

  permSkills.forEach(slot => {
    const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || (typeof SKILLS_ALL !== 'undefined' ? SKILLS_ALL.find(s => s.id === slot.id) : null);
    if (!def) return;
    const loc = typeof getLocalizedItem === 'function' ? getLocalizedItem(def) : { name: def.name, desc: def.desc };
    const durSec = Math.round((def.duration || 10000) / 1000);
    const stockTxt = typeof t === 'function' ? t('skills_inventory_stock', { count: slot.count }) : `×${slot.count}`;

    const card = document.createElement('div');
    card.className = 'skills-inventory-card';
    card.innerHTML = `
      <div class="skills-card-icon" style="--item-clr: ${def.color || 'var(--accent-primary)'}">
        ${def.image ? `<img src="${def.image}" class="skill-pixel-img" alt="" draggable="false" />` : `<span>${def.icon || '⚡'}</span>`}
      </div>
      <div class="skills-card-body">
        <div class="skills-card-header">
          <h4 class="skills-card-name">${loc.name}</h4>
          <span class="skills-card-badge">${stockTxt}</span>
        </div>
        <p class="skills-card-desc">${loc.desc}</p>
        <div class="skills-card-footer">
          <span class="skills-card-duration">
            <svg class="rule-svg-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${durSec}s
          </span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ============================================================
// QUEUE POSITION MANAGEMENT (Top [default] / Bottom)
// ============================================================
function initQueuePosition() {
  const saved = localStorage.getItem('digithin_galaxy_queue_pos');
  const initial = saved === 'bottom' ? 'bottom' : 'top'; // Top is default
  setQueuePosition(initial);
}

function setQueuePosition(pos) {
  const gameCol = $('game-column');
  const isTop = pos !== 'bottom';
  const finalPos = isTop ? 'top' : 'bottom';

  if (gameCol) {
    gameCol.classList.toggle('queue-pos-top', isTop);
    gameCol.classList.toggle('queue-pos-bottom', !isTop);
    gameCol.setAttribute('data-queue-pos', finalPos);
  }

  localStorage.setItem('digithin_galaxy_queue_pos', finalPos);

  if (typeof updateSettingsUI === 'function') {
    updateSettingsUI();
  }
}

function toggleQueuePosition() {
  const current = localStorage.getItem('digithin_galaxy_queue_pos') === 'bottom' ? 'bottom' : 'top';
  const next = current === 'top' ? 'bottom' : 'top';
  setQueuePosition(next);
}

initQueuePosition();

// ============================================================
// PAUSE SETTINGS VIEW MANAGEMENT
// ============================================================
function updateSoundUI() {
  const isEnabled = typeof isSoundEnabled === 'function' ? isSoundEnabled() : true;
  const soundVal = $('settings-sound-val');
  if (soundVal) {
    const iconSvg = isEnabled
      ? `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`
      : `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
    const label = isEnabled
      ? (typeof t === 'function' ? t('settings_sound_on') : 'On')
      : (typeof t === 'function' ? t('settings_sound_off') : 'Mute');
    soundVal.innerHTML = `${iconSvg} <span>${label}</span>`;
  }
  const soundBtn = $('settings-sound-btn');
  if (soundBtn) {
    soundBtn.classList.toggle('is-muted', !isEnabled);
  }
}

function updateSettingsUI() {
  updateSoundUI();
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const settingsThemeVal = $('settings-theme-val');
  if (settingsThemeVal) {
    const iconSvg = theme === 'dark'
      ? `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
      : `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    const label = theme === 'dark'
      ? (typeof t === 'function' ? t('settings_theme_dark') : 'Dark')
      : (typeof t === 'function' ? t('settings_theme_light') : 'Light');
    settingsThemeVal.innerHTML = `${iconSvg} <span>${label}</span>`;
  }
  const isTop = (localStorage.getItem('digithin_galaxy_queue_pos') || 'top') !== 'bottom';
  const settingsQueueVal = $('settings-queue-val');
  if (settingsQueueVal) {
    const iconSvg = isTop
      ? `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`
      : `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
    const label = isTop
      ? (typeof t === 'function' ? t('settings_queue_top') : 'Top')
      : (typeof t === 'function' ? t('settings_queue_bottom') : 'Bottom');
    settingsQueueVal.innerHTML = `${iconSvg} <span>${label}</span>`;
  }

  const langSelect = $('settings-lang-select');
  if (langSelect && typeof getLanguage === 'function') {
    langSelect.value = getLanguage();
  }

  const inMatch = typeof isMatchInProgress === 'function' ? isMatchInProgress() : false;
  const diffSelect = $('settings-difficulty-select');
  if (diffSelect) {
    if (typeof getDifficulty === 'function') {
      diffSelect.value = getDifficulty();
    }
    diffSelect.disabled = inMatch;
    if (inMatch) {
      diffSelect.title = typeof t === 'function' ? t('settings_diff_locked_match') : '';
    } else {
      diffSelect.title = '';
    }
  }

  const fingerSelect = $('settings-finger-guide-select');
  if (fingerSelect && typeof getFingerGuideSetting === 'function') {
    fingerSelect.value = getFingerGuideSetting();
  }
}

function isBossBattlesEnabled() {
  return true;
}


let settingsPaused = false;
let settingsOpenedFromPause = false;

function isSettingsOpen() {
  const modal = $('modal-settings');
  return !!(modal && !modal.classList.contains('hidden'));
}

function isPauseSettingsOpen() {
  return isSettingsOpen();
}

function openSettings(fromStart = false) {
  // If game is actively playing, pause it
  if (screenGame?.classList.contains('active') && !state.paused && !state.phaseComplete) {
    settingsPaused = true;
    state.paused   = true;
    cancelAnimationFrame(state.rafId);
    clearTimeout(state.spawnTimer);
  }

  // Check if pause overlay is currently visible
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay && !pauseOverlay.classList.contains('hidden')) {
    settingsOpenedFromPause = true;
    pauseOverlay.classList.add('hidden');
  } else {
    settingsOpenedFromPause = false;
  }

  updateSettingsUI();
  const modal = $('modal-settings');
  if (modal) modal.classList.remove('hidden');
}

function openPauseSettings() {
  openSettings(false);
}

function closeSettings() {
  const modal = $('modal-settings');
  if (modal) modal.classList.add('hidden');

  // If opened from pause menu, restore pause menu
  if (settingsOpenedFromPause) {
    settingsOpenedFromPause = false;
    const pauseOverlay = $('pause-overlay');
    if (pauseOverlay) pauseOverlay.classList.remove('hidden');
    return;
  }

  // If paused specifically by opening settings during active gameplay, resume
  if (settingsPaused) {
    settingsPaused = false;
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

function closePauseSettings() {
  closeSettings();
}

function resetPauseView() {
  if (typeof cancelExitConfirm === 'function') cancelExitConfirm();
  closeSettings();
  const btnPauseTraining = $('btn-pause-back-training');
  if (btnPauseTraining) {
    if (typeof state !== 'undefined' && state.gameMode === 'training') {
      btnPauseTraining.classList.remove('hidden');
      btnPauseTraining.style.display = '';
    } else {
      btnPauseTraining.classList.add('hidden');
      btnPauseTraining.style.display = 'none';
    }
  }
}

// Close settings if clicking backdrop
if (modalSettings) {
  modalSettings.addEventListener('click', (e) => {
    if (e.target === modalSettings) closeSettings();
  });
}

// Initial sound UI sync
updateSoundUI();

// Slow-motion screen ring
const slowRing = document.createElement('div');
slowRing.id = 'slow-ring';
document.body.appendChild(slowRing);

// Clear falling item area
function clearArea() {
  if (gameArea) {
    const tokens = gameArea.querySelectorAll('.falling-item, .token, .bomb-ring, .laser-particle, .boss-meaning-box');
    tokens.forEach(t => t.remove());
  }
  if (feedbackEl && gameArea && !gameArea.contains(feedbackEl)) {
    gameArea.appendChild(feedbackEl);
  }
  const earthEl = document.getElementById('earth-horizon') || document.getElementById('black-hole-vortex');
  if (earthEl && gameArea && !gameArea.contains(earthEl)) {
    gameArea.appendChild(earthEl);
  }
  if (state) state.activeItems = [];
}

let queueShiftTimer = null;

// Render upcoming queue bar
function renderQueue() {
  if (queueShiftTimer) {
    clearTimeout(queueShiftTimer);
    queueShiftTimer = null;
  }
  if (!queueItemsEl) return;
  queueItemsEl.innerHTML = '';
  const queueBar = $('queue-bar');
  if (state.bossBattle && state.bossBattle.active) {
    if (queueBar) queueBar.classList.add('hidden');
    return;
  }
  if (queueBar) queueBar.classList.remove('hidden');
  const show = Math.min(state.spawnQueue.length, 6);
  for (let i = 0; i < show; i++) {
    const qi = state.spawnQueue[i];
    const el = document.createElement('div');
    let cls = `qi ${qi.type}`;
    if (qi.skill) cls += ' has-skill-q';
    if (qi.type === 'word' && typeof isWordNewInRun === 'function' && isWordNewInRun(qi.text)) {
      cls += ' qi-new-word';
    }
    el.className = cls;
    const objPath = (typeof getCelestialObjectForItem === 'function')
      ? getCelestialObjectForItem(qi.text, qi.type)
      : 'objects/comet';
    const assetSrc = objPath.includes('/') ? `assets/${objPath}.webp` : `assets/objects/${objPath}.webp`;
    el.innerHTML = `<img src="${assetSrc}" alt="" class="qi-object-icon" draggable="false" /><span>${qi.text}</span>`;
    queueItemsEl.appendChild(el);
  }
}

// Animate smooth leftward shift when an item leaves the upcoming queue
function animateQueueShift() {
  if (!queueItemsEl) return;

  if (queueShiftTimer) {
    clearTimeout(queueShiftTimer);
    queueShiftTimer = null;
  }
  const prevLeaving = queueItemsEl.querySelector('.qi-leaving');
  if (prevLeaving) {
    prevLeaving.remove();
  }

  // If in boss battle, empty queue, or boss indicator is showing, fallback to normal render
  if ((state.bossBattle && state.bossBattle.active) || !queueItemsEl.firstElementChild || queueItemsEl.querySelector('.queue-boss-indicator')) {
    renderQueue();
    return;
  }

  const firstEl = queueItemsEl.firstElementChild;
  const firstWidth = firstEl.offsetWidth || 28;
  const shiftWidth = firstWidth + 6; // item box width + 6px flex gap

  firstEl.classList.add('qi-leaving');
  firstEl.style.marginLeft = `-${shiftWidth}px`;

  queueShiftTimer = setTimeout(() => {
    queueShiftTimer = null;
    if (firstEl && firstEl.parentNode === queueItemsEl) {
      firstEl.remove();
    }

    // After moving, append the next upcoming vocable at the end of the queue (if applicable)
    const maxVisible = 6;
    if (state.spawnQueue && state.spawnQueue.length >= maxVisible) {
      const qi = state.spawnQueue[maxVisible - 1];
      if (qi && queueItemsEl.children.length < maxVisible) {
        const newEl = document.createElement('div');
        let cls = `qi ${qi.type} qi-entering`;
        if (qi.skill) cls += ' has-skill-q';
        if (qi.type === 'word' && typeof isWordNewInRun === 'function' && isWordNewInRun(qi.text)) {
          cls += ' qi-new-word';
        }
        newEl.className = cls;
        const objPath = (typeof getCelestialObjectForItem === 'function')
          ? getCelestialObjectForItem(qi.text, qi.type)
          : 'objects/comet';
        const assetSrc = objPath.includes('/') ? `assets/${objPath}.webp` : `assets/objects/${objPath}.webp`;
        newEl.innerHTML = `<img src="${assetSrc}" alt="" class="qi-object-icon" draggable="false" /><span>${qi.text}</span>`;
        queueItemsEl.appendChild(newEl);
        setTimeout(() => {
          if (newEl.parentNode) newEl.classList.remove('qi-entering');
        }, 240);
      }
    }
  }, 240);
}

// Temporary feedback message in game board
function showFeedback(msg, type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = msg;
  feedbackEl.className   = '';
  void feedbackEl.offsetWidth;
  feedbackEl.className =
    type === 'success' ? 'fb-success' :
    type === 'special' ? 'fb-special' : 'fb-error';
}

// Animated background letters on start screen
(function initStartBg() {
  const deco = $('bg-deco');
  if (!deco) return;
  const items = ['A','B','C','DE','CA','MA','GATO','CASA','NO','PE','TO','VI','RE','LA','LUA','SOL'];
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:absolute;
      font-family:'Plus Jakarta Sans','Inter',sans-serif; font-weight:700;
      font-size:${0.85 + Math.random() * 1.1}rem;
      color:rgba(255,255,255,0.85);
      background:rgba(99,102,241,${0.08 + Math.random() * 0.12});
      border-radius:10px;
      padding:${6 + Math.random() * 6}px ${10 + Math.random() * 10}px;
      left:${Math.random() * 90}%;
      top:${Math.random() * 90}%;
      transform:rotate(${(Math.random() - 0.5) * 24}deg);
      animation:decoF ${4 + Math.random() * 5}s ease-in-out ${Math.random() * 4}s infinite alternate;
      border:none;
    `;
    el.textContent = items[Math.floor(Math.random() * items.length)];
    deco.appendChild(el);
  }

  const s = document.createElement('style');
  s.textContent = `@keyframes decoF{from{transform:translateY(0) rotate(var(--r,0deg))}to{transform:translateY(-16px) rotate(var(--r,0deg))}}`;
  document.head.appendChild(s);
})();

// ============================================================
// PAUSE COUNTDOWN ("3, 2, 1, VAI!")
// ============================================================
let countdownActive  = false;
let countdownTimerId = null;

function runResumeCountdown(onComplete) {
  const overlay = $('countdown-overlay');
  const numEl   = $('countdown-num');
  if (!overlay || !numEl) {
    onComplete();
    return;
  }

  countdownActive = true;
  overlay.classList.remove('hidden');

  let count = 3;
  numEl.textContent = String(count);
  numEl.style.animation = 'none';
  void numEl.offsetWidth;
  numEl.style.animation = '';
  playSound('countdown');

  const tick = () => {
    count--;
    if (count > 0) {
      numEl.textContent = String(count);
      numEl.style.animation = 'none';
      void numEl.offsetWidth;
      numEl.style.animation = '';
      playSound('countdown');
      countdownTimerId = setTimeout(tick, 700);
    } else if (count === 0) {
      numEl.textContent = typeof t === 'function' ? t('countdown_go') : 'GO!';
      numEl.style.animation = 'none';
      void numEl.offsetWidth;
      numEl.style.animation = '';
      playSound('countdownGo');
      countdownTimerId = setTimeout(() => {
        overlay.classList.add('hidden');
        countdownActive = false;
        onComplete();
      }, 400);
    }
  };
  countdownTimerId = setTimeout(tick, 700);
}

function cancelResumeCountdown() {
  if (countdownTimerId) clearTimeout(countdownTimerId);
  countdownActive = false;
  const overlay = $('countdown-overlay');
  if (overlay) overlay.classList.add('hidden');
}
