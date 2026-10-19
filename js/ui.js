/* ================================================
   DIGITHIN GALAXY — js/ui.js
   DOM elements, HUD, particles, queue, and visual effects
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

// ============================================================
// VISUAL FINGER GUIDE (MINI MAPA SUTIL DE DIGITAÇÃO)
// ============================================================
function getFingerGuideSetting() {
  try {
    const saved = localStorage.getItem('digithin_galaxy_finger_guide');
    if (saved && (saved === 'always' || saved === 'off' || saved === 'training')) {
      return saved;
    }
  } catch (_) {}
  return 'always'; // Ativado por padrão (Sempre Ativo)
}

function changeFingerGuideSetting(mode) {
  const valid = (mode === 'training' || mode === 'off') ? mode : 'always';
  try {
    localStorage.setItem('digithin_galaxy_finger_guide', valid);
  } catch (_) {}
  if (typeof updateFingerGuideVisibility === 'function') {
    updateFingerGuideVisibility();
  }
}

function isFingerGuideActive() {
  // Regra Estrita: Se o teclado virtual estiver ativo no celular/jogo, o guia de dedos é SEMPRE desativado
  if (typeof isVirtualKeyboardActive === 'function' && isVirtualKeyboardActive()) {
    return false;
  }
  const mode = getFingerGuideSetting();
  if (mode === 'off') return false;
  if (mode === 'always') return true;
  // 'training': ativo estritamente no modo treinamento
  return typeof state !== 'undefined' && state && state.gameMode === 'training';
}

function updateFingerGuideVisibility() {
  const guideEl = $('finger-guide');
  const gameCol = $('game-column');
  const inMatch = typeof isMatchInProgress === 'function' ? isMatchInProgress() : false;
  const vkActive = typeof isVirtualKeyboardActive === 'function' && isVirtualKeyboardActive();
  const active = inMatch && !vkActive && isFingerGuideActive();

  if (guideEl) {
    guideEl.classList.toggle('hidden', !active);
  }
  if (gameCol) {
    gameCol.classList.toggle('has-finger-guide', active);
  }
  if (active) {
    updateFingerGuide();
  } else {
    lastFgChar = undefined;
  }
}

// ============================================================
// ON-SCREEN VIRTUAL KEYBOARD (TECLADO VIRTUAL MOBILE)
// ============================================================
function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const hasTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
  const isSmallScreen = window.innerWidth <= 880;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
  return Boolean(isCoarse || (hasTouch && isSmallScreen) || isMobileUA);
}

function getVirtualKeyboardSetting() {
  return 'auto'; // Sempre automático e exclusivo no mobile
}

function changeVirtualKeyboardSetting(mode) {
  if (typeof updateVirtualKeyboardVisibility === 'function') {
    updateVirtualKeyboardVisibility();
  }
  if (typeof updateFingerGuideVisibility === 'function') {
    updateFingerGuideVisibility();
  }
  if (typeof applyMobileInputRestrictions === 'function') {
    applyMobileInputRestrictions();
  }
}

function isVirtualKeyboardActive() {
  // No mobile, o teclado virtual customizado é estritamente e sempre ativo
  return typeof isMobileDevice === 'function' ? isMobileDevice() : false;
}

function applyMobileInputRestrictions() {
  if (!hiddenInput) return;
  const isMobile = (typeof isMobileDevice === 'function' && isMobileDevice()) ||
                   (typeof isVirtualKeyboardActive === 'function' && isVirtualKeyboardActive());
  if (isMobile) {
    hiddenInput.setAttribute('inputmode', 'none');
    hiddenInput.setAttribute('readonly', 'readonly');
    hiddenInput.setAttribute('tabindex', '-1');
    hiddenInput.disabled = true;
    if (document.activeElement === hiddenInput) {
      hiddenInput.blur();
    }
  } else {
    hiddenInput.removeAttribute('disabled');
    hiddenInput.removeAttribute('readonly');
    hiddenInput.removeAttribute('inputmode');
  }
}

function focusGameInput() {
  // Se estiver no mobile ou com teclado virtual ativo, o teclado nativo do sistema Android/iOS NUNCA deve ser invocado
  if ((typeof isMobileDevice === 'function' && isMobileDevice()) ||
      (typeof isVirtualKeyboardActive === 'function' && isVirtualKeyboardActive())) {
    if (hiddenInput && document.activeElement === hiddenInput) {
      hiddenInput.blur();
    }
    return;
  }
  try {
    hiddenInput?.focus({ preventScroll: true });
  } catch (_) {
    hiddenInput?.focus();
  }
}

function updateVirtualKeyboardVisibility() {
  const vkEl = $('virtual-keyboard');
  const gameCol = $('game-column');
  const inMatch = typeof isMatchInProgress === 'function' ? isMatchInProgress() : false;
  const active = inMatch && isVirtualKeyboardActive();

  if (vkEl) {
    vkEl.classList.toggle('hidden', !active);
  }
  if (gameCol) {
    gameCol.classList.toggle('has-virtual-keyboard', active);
  }

  // Com teclado virtual ativo, o guia visual de dedos é SEMPRE removido
  if (typeof updateFingerGuideVisibility === 'function') {
    updateFingerGuideVisibility();
  }

  applyMobileInputRestrictions();
}

function triggerVirtualKey(rawKey, keyBtn) {
  if (!rawKey) return;

  // Feedback visual luminoso (Zero deslocamento vertical / transform)
  if (keyBtn) {
    keyBtn.classList.add('vk-pressed');
    setTimeout(() => keyBtn.classList.remove('vk-pressed'), 120);
  }

  // Se o jogo estiver pausado ou fase concluída, não processa
  if (typeof state !== 'undefined' && state && (state.paused || state.phaseComplete)) {
    return;
  }

  // Tecla BACKSPACE
  if (rawKey === 'BACKSPACE') {
    if (typeof playSound === 'function') playSound('click');
    if (typeof state !== 'undefined' && state) {
      if (state.bossBattle && state.bossBattle.active) {
        if (state.typedBuffer && state.typedBuffer.length > 0) {
          state.typedBuffer = state.typedBuffer.slice(0, -1);
          if (state.bossBattle.boxItem?.el && state.bossBattle.currentWord && typeof renderBossMeaningSlots === 'function') {
            renderBossMeaningSlots(state.bossBattle.boxItem.el, state.bossBattle.currentWord.text.toUpperCase(), state.typedBuffer);
          }
        }
        return;
      }
      state.typedBuffer = '';
      if (typeof clearHighlight === 'function') clearHighlight();
    }
    return;
  }

  // Teclas normais (Letras, Pontuação, Espaço)
  let charToSend = rawKey.toUpperCase();

  // Smart Accent Mapping: se o próximo caractere do alvo for uma versão acentuada da tecla (ex: 'Á', 'Ã' para 'A'), envia a letra correta
  if (typeof state !== 'undefined' && state && typeof getActiveTargetChar === 'function') {
    const nextChar = getActiveTargetChar();
    if (nextChar) {
      const deaccented = nextChar.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (deaccented === charToSend) {
        charToSend = nextChar;
      }
    }
  }

  if (typeof handleLetterTyped === 'function') {
    handleLetterTyped(charToSend);
  }
}

let vkInitialized = false;
function initVirtualKeyboard() {
  if (vkInitialized) return;
  const vkEl = $('virtual-keyboard');
  if (!vkEl) return;
  vkInitialized = true;

  // Previne que qualquer foco acidental no hiddenInput abra o teclado nativo do Android
  if (hiddenInput) {
    hiddenInput.addEventListener('focus', () => {
      if ((typeof isMobileDevice === 'function' && isMobileDevice()) ||
          (typeof isVirtualKeyboardActive === 'function' && isVirtualKeyboardActive())) {
        hiddenInput.blur();
      }
    });
  }

  // Uso de pointerdown para resposta ultra-rápida sem delay de clique ou rolagem no celular
  vkEl.addEventListener('pointerdown', (e) => {
    const keyBtn = e.target.closest('.vk-key');
    if (!keyBtn) return;
    e.preventDefault();
    e.stopPropagation();

    const key = keyBtn.getAttribute('data-key');
    triggerVirtualKey(key, keyBtn);
  });
}

const FINGER_MAP = {
  // Mão Esquerda: Mindinho
  'Q': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  'A': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  'Z': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  '1': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  '!': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  '`': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  '~': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  'Á': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  'À': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  'Â': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  'Ã': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },
  'Ä': { id: 'fg-finger-l-pinky', handKey: 'hand_left', nameKey: 'finger_l_pinky' },

  // Mão Esquerda: Anelar
  'W': { id: 'fg-finger-l-ring', handKey: 'hand_left', nameKey: 'finger_l_ring' },
  'S': { id: 'fg-finger-l-ring', handKey: 'hand_left', nameKey: 'finger_l_ring' },
  'X': { id: 'fg-finger-l-ring', handKey: 'hand_left', nameKey: 'finger_l_ring' },
  '2': { id: 'fg-finger-l-ring', handKey: 'hand_left', nameKey: 'finger_l_ring' },
  '@': { id: 'fg-finger-l-ring', handKey: 'hand_left', nameKey: 'finger_l_ring' },

  // Mão Esquerda: Médio
  'E': { id: 'fg-finger-l-middle', handKey: 'hand_left', nameKey: 'finger_l_middle' },
  'D': { id: 'fg-finger-l-middle', handKey: 'hand_left', nameKey: 'finger_l_middle' },
  'C': { id: 'fg-finger-l-middle', handKey: 'hand_left', nameKey: 'finger_l_middle' },
  '3': { id: 'fg-finger-l-middle', handKey: 'hand_left', nameKey: 'finger_l_middle' },
  '#': { id: 'fg-finger-l-middle', handKey: 'hand_left', nameKey: 'finger_l_middle' },
  'É': { id: 'fg-finger-l-middle', handKey: 'hand_left', nameKey: 'finger_l_middle' },
  'È': { id: 'fg-finger-l-middle', handKey: 'hand_left', nameKey: 'finger_l_middle' },
  'Ê': { id: 'fg-finger-l-middle', handKey: 'hand_left', nameKey: 'finger_l_middle' },

  // Mão Esquerda: Indicador
  'R': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },
  'T': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },
  'F': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },
  'G': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },
  'V': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },
  'B': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },
  '4': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },
  '5': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },
  '$': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },
  '%': { id: 'fg-finger-l-index', handKey: 'hand_left', nameKey: 'finger_l_index' },

  // Polegares (Barra de Espaço)
  ' ': { id: ['fg-finger-l-thumb', 'fg-finger-r-thumb'], handKey: 'hand_both', nameKey: 'finger_thumb' },

  // Mão Direita: Indicador
  'Y': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  'U': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  'H': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  'J': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  'N': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  'M': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  '6': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  '7': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  '&': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  'Ú': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  'Ù': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },
  'Ü': { id: 'fg-finger-r-index', handKey: 'hand_right', nameKey: 'finger_r_index' },

  // Mão Direita: Médio
  'I': { id: 'fg-finger-r-middle', handKey: 'hand_right', nameKey: 'finger_r_middle' },
  'K': { id: 'fg-finger-r-middle', handKey: 'hand_right', nameKey: 'finger_r_middle' },
  ',': { id: 'fg-finger-r-middle', handKey: 'hand_right', nameKey: 'finger_r_middle' },
  '<': { id: 'fg-finger-r-middle', handKey: 'hand_right', nameKey: 'finger_r_middle' },
  '8': { id: 'fg-finger-r-middle', handKey: 'hand_right', nameKey: 'finger_r_middle' },
  '*': { id: 'fg-finger-r-middle', handKey: 'hand_right', nameKey: 'finger_r_middle' },
  'Í': { id: 'fg-finger-r-middle', handKey: 'hand_right', nameKey: 'finger_r_middle' },
  'Ì': { id: 'fg-finger-r-middle', handKey: 'hand_right', nameKey: 'finger_r_middle' },
  'Î': { id: 'fg-finger-r-middle', handKey: 'hand_right', nameKey: 'finger_r_middle' },

  // Mão Direita: Anelar
  'O': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  'L': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  '.': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  '>': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  '9': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  '(': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  'Ó': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  'Ò': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  'Ô': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  'Õ': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },
  'Ö': { id: 'fg-finger-r-ring', handKey: 'hand_right', nameKey: 'finger_r_ring' },

  // Mão Direita: Mindinho
  'P': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  'Ç': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '0': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  ')': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '-': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '_': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '=': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '+': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '[': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '{': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  ']': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '}': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  ';': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  ':': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '\'': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '"': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '/': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '?': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '\\': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
  '|': { id: 'fg-finger-r-pinky', handKey: 'hand_right', nameKey: 'finger_r_pinky' },
};

function getFingerInfo(rawChar) {
  if (!rawChar) return null;
  const upper = rawChar.toUpperCase();
  if (FINGER_MAP[upper]) return FINGER_MAP[upper];
  const deaccented = upper.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (FINGER_MAP[deaccented]) return FINGER_MAP[deaccented];
  return null;
}

function getActiveTargetChar() {
  if (typeof state === 'undefined' || !state) return null;

  // 1. Boss battle
  if (state.bossBattle && state.bossBattle.active) {
    if (state.bossBattle.currentWord) {
      const targetWord = (state.bossBattle.currentWord.text || '').toUpperCase();
      const buf = (state.typedBuffer || '').toUpperCase();
      if (targetWord.startsWith(buf) && buf.length < targetWord.length) {
        return targetWord[buf.length];
      }
      return targetWord[0] || null;
    }
    return null;
  }

  // 2. Active falling items no tabuleiro
  const activeTokens = (state.activeItems || []).filter(item => !item.removing);
  if (activeTokens.length > 0) {
    const buf = (state.typedBuffer || '').toUpperCase();
    if (buf.length > 0) {
      const matching = activeTokens.filter(item => (item.text || '').toUpperCase().startsWith(buf));
      if (matching.length > 0) {
        const target = matching.reduce((lowest, item) => item.y > lowest.y ? item : lowest);
        const upperText = (target.text || '').toUpperCase();
        if (upperText.length > buf.length) {
          return upperText[buf.length];
        }
      }
    }
    // Rúnico mais próximo do fundo é o perigo iminente
    const target = activeTokens.reduce((lowest, item) => item.y > lowest.y ? item : lowest);
    const upperText = (target.text || '').toUpperCase();
    return upperText[0] || null;
  }

  // 3. Fallback para próximo elemento na esteira
  if (state.spawnQueue && state.spawnQueue.length > 0) {
    const nextItem = state.spawnQueue[0];
    if (nextItem && nextItem.text) {
      return (nextItem.text[0] || '').toUpperCase() || null;
    }
  }

  return null;
}

let lastFgChar = undefined;

function updateFingerGuide() {
  const guideEl = $('finger-guide');
  if (!guideEl || guideEl.classList.contains('hidden')) return;

  const targetChar = getActiveTargetChar();
  if (targetChar === lastFgChar) return;
  lastFgChar = targetChar;

  const keyCap = $('fg-key-cap');
  const fingerName = $('fg-finger-name');
  const handSub = $('fg-hand-sub');

  // Limpa dedos ativos anteriores
  const allFingers = guideEl.querySelectorAll('.fg-finger');
  allFingers.forEach(f => f.classList.remove('fg-active'));

  if (!targetChar) {
    if (keyCap) {
      keyCap.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8"/></svg>`;
      keyCap.classList.remove('active');
    }
    if (fingerName) fingerName.textContent = typeof t === 'function' ? t('finger_ready') : 'Resting Position';
    if (handSub) handSub.textContent = typeof t === 'function' ? t('finger_guide_title') : 'Finger Guide';
    return;
  }

  const info = getFingerInfo(targetChar);
  if (keyCap) {
    keyCap.textContent = targetChar === ' ' ? (typeof t === 'function' ? t('finger_space_bar') : 'Space') : targetChar;
    keyCap.classList.add('active');
  }

  if (info) {
    if (Array.isArray(info.id)) {
      info.id.forEach(id => {
        const el = $(id);
        if (el) el.classList.add('fg-active');
      });
    } else {
      const el = $(info.id);
      if (el) el.classList.add('fg-active');
    }

    if (fingerName) {
      fingerName.textContent = typeof t === 'function' ? t(info.nameKey) : info.nameKey;
    }
    if (handSub) {
      handSub.textContent = typeof t === 'function' ? t(info.handKey) : info.handKey;
    }
  } else {
    if (fingerName) fingerName.textContent = targetChar;
    if (handSub) handSub.textContent = typeof t === 'function' ? t('finger_guide_title') : 'Finger Guide';
  }
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

  // Render unlocked words in side panel (misteriosamente aparece a partir da Fase 3)
  if (wordsList) {
    wordsList.innerHTML = '';
    if (state.phase >= 3 && state.unlockedWords && state.unlockedWords.length > 0) {
      state.unlockedWords.forEach(w => {
        const completed = state.wordStats[w.text.toLowerCase()]?.count || 0;
        const d = document.createElement('div');
        d.className = 'word-tag';
        d.innerHTML = `<span>${w.text.toUpperCase()}</span><span class="wt-pts">${completed > 0 ? `✓×${completed}` : `+${wordPts(w.text)}`}</span>`;
        wordsList.appendChild(d);
      });
    }
  }

  renderSkills();
  if (typeof updateFingerGuideVisibility === 'function') {
    updateFingerGuideVisibility();
  }
}

// Vector SVG Icons for Mobile Skills (Rule 11: 100% SVG, strictly no emojis)
function getSkillSvgIcon(skillId) {
  switch (skillId) {
    case 'freezer':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/></svg>`;
    case 'bomb':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="8"/><path d="m17 7 3-3M19 4h2M20 7V5"/></svg>`;
    case 'shield':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'vortex':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7a5 5 0 1 0 5 5"/></svg>`;
    case 'slowdown':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/></svg>`;
    case 'haste':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    case 'dilation':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l4 4"/><circle cx="12" cy="12" r="2"/></svg>`;
    case 'speedlock':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    case 'autodestroy':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-2 2.5h3L11 8"/><circle cx="12" cy="14" r="7"/><path d="m10 14 4 4m0-4-4 4"/></svg>`;
    case 'extralife':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'continue':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m10 15 5-3-5-3v6z"/></svg>`;
    case 'coins_100':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 9v6"/></svg>`;
    default:
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
}

// Render active run perks in the sidebar
function renderRunPerks() {
  const container = document.getElementById('run-perks-container');
  if (!container) return;

  const perks = state.runPerks || {};
  const perkIds = Object.keys(perks);

  if (perkIds.length === 0) {
    const emptyHint = typeof t === 'function' ? t('hud_perks_empty') : 'Nenhuma habilidade adquirida ainda.<br/>Suba de nível para desbloquear!';
    if (container.dataset.emptyState !== 'true') {
      container.innerHTML = `<div class="empty-hint">${emptyHint}</div>`;
      container.dataset.emptyState = 'true';
      container.dataset.perksKey = '';
    }
    return;
  }
  container.dataset.emptyState = 'false';

  const currentKey = perkIds.map(id => `${id}:${perks[id]}`).join('|');
  const needsRebuild = (container.dataset.perksKey !== currentKey);

  if (needsRebuild) {
    container.innerHTML = '';
    container.dataset.perksKey = currentKey;
  }

  // Pre-defined SVG icons for statuses (Rule 11: 100% SVG, strictly NO emojis!)
  const svgPassive = `<svg class="perk-badge-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.267-8-12.362-8-5.096 0-5.096 8 0 8 5.095 0 7.267-8 12.362-8z"/></svg>`;
  const svgRunning = `<svg class="perk-badge-svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.5 3.5 3 6.5 3 10a6 6 0 1 1-12 0c0-3.5 2.5-6.5 3-10 1 2 2.5 3.5 3 4.5 1-1 2-2.5 3-4.5z"/></svg>`;
  const svgQueued = `<svg class="perk-badge-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14M5 2h14m-2 20v-5l-5-5 5-5V2M7 2v5l5 5-5 5v5"/></svg>`;
  const svgCd = `<svg class="perk-badge-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/></svg>`;

  perkIds.forEach(id => {
    const def = SKILLS_CONFIG[id];
    if (!def) return;
    const lvl = perks[id];
    const sName = (typeof t === 'function' && t('skill_name_' + id) !== ('skill_name_' + id))
      ? t('skill_name_' + id)
      : (def.name || id);

    const isPassive = (def.type === 'passive');
    const isRunning = !isPassive && (state.activeTimers && (state.activeTimers[id] || 0) > 0);
    const isQueued = !isPassive && !isRunning && (state.skillQueue && state.skillQueue.includes(id));
    const timerSec = isRunning ? Math.ceil(state.activeTimers[id] / 1000) : 0;
    const cdSec = Math.max(0, Math.ceil((state.skillCooldowns?.[id] || 0) / 1000));

    // Dynamic classes: Passives ALWAYS get highlighted active color! Duration skills get active highlight while running!
    const cardClass = 'run-perk-card' +
      (isPassive ? ' perk-always-active' :
       isRunning ? ' perk-active' :
       isQueued ? ' perk-queued' : ' perk-cooldown');

    const isMaxLvl = Boolean(def.maxLevel && lvl >= def.maxLevel);
    const lvlPrefix = isMaxLvl
      ? ((typeof t === 'function' && t('hud_perk_lvl_max', { lvl: lvl }) !== 'hud_perk_lvl_max')
          ? t('hud_perk_lvl_max', { lvl: lvl })
          : `Nv. ${lvl} (MÁX)`)
      : ((typeof t === 'function' && t('hud_perk_lvl', { lvl: lvl }) !== 'hud_perk_lvl')
          ? t('hud_perk_lvl', { lvl: lvl })
          : `Nv. ${lvl}`);
    let subTypeTxt = '';
    let statusBadgeHtml = '';

    if (isPassive) {
      subTypeTxt = typeof t === 'function' ? t('hud_perk_passive') : 'Passiva';
      const maxMult = Math.min(5, 1 + lvl);
      statusBadgeHtml = `<span class="perk-status-badge perk-status-passive">${svgPassive}+${maxMult}×</span>`;
    } else if (isRunning) {
      subTypeTxt = typeof t === 'function' ? t('hud_perk_active_label') : 'Ativa';
      statusBadgeHtml = `<span class="perk-status-badge perk-status-running">${svgRunning}${timerSec}s</span>`;
    } else if (isQueued) {
      subTypeTxt = typeof t === 'function' ? t('hud_perk_queue') : 'Fila';
      statusBadgeHtml = `<span class="perk-status-badge perk-status-queued">${svgQueued}<span>${subTypeTxt}</span></span>`;
    } else {
      subTypeTxt = typeof t === 'function' ? t('hud_perk_recharging') : 'Recarga';
      statusBadgeHtml = `<span class="perk-status-badge perk-status-cd">${svgCd}${cdSec}s</span>`;
    }

    const metaTxt = `${lvlPrefix} • ${subTypeTxt}`;

    if (needsRebuild) {
      const card = document.createElement('div');
      card.className = cardClass;
      card.setAttribute('data-perk-id', id);
      card.style.setProperty('--perk-clr', def.color || 'var(--accent-primary)');

      card.innerHTML = `
        <div class="perk-card-left">
          <div class="perk-icon-wrap" style="--perk-clr: ${def.color || 'var(--accent-primary)'}">
            <img class="perk-img" src="${def.image || `assets/skills/${id}.webp`}" alt="${sName}" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
            <span class="perk-svg-fallback" style="display:none; color:${def.color || 'var(--accent-primary)'}">${getSkillSvgIcon(id)}</span>
          </div>
          <div class="perk-card-info">
            <span class="perk-card-name" title="${sName}">${sName}</span>
            <span class="perk-card-meta">${metaTxt}</span>
          </div>
        </div>
        <div class="perk-card-right">
          ${statusBadgeHtml}
        </div>
      `;
      container.appendChild(card);
    } else {
      // Smart DOM update for high performance
      const card = container.querySelector(`[data-perk-id="${id}"]`);
      if (card) {
        if (card.className !== cardClass) card.className = cardClass;
        const metaEl = card.querySelector('.perk-card-meta');
        if (metaEl && metaEl.textContent !== metaTxt) metaEl.textContent = metaTxt;
        const rightEl = card.querySelector('.perk-card-right');
        if (rightEl && rightEl.innerHTML !== statusBadgeHtml) rightEl.innerHTML = statusBadgeHtml;
      }
    }
  });
}

// Render skill slots cleanly (Desktop Sidebar & Mobile Quick-Cast Bar)
function renderSkills() {
  if (typeof state === 'undefined' || !state || !Array.isArray(state.skillSlots)) return;
  renderDesktopSkills();
  renderMobileSkills();
}

function renderDesktopSkills() {
  if (!skillsCont) return;

  if (state.skillSlots.length === 0) {
    const emptyHint = typeof t === 'function' ? t('hud_skills_empty_hint') : 'Buy in the shop<br/>or complete words <strong>⚡</strong>';
    skillsCont.innerHTML = `<div class="empty-hint">${emptyHint}</div>`;
    return;
  }

  // Remove empty hint if present
  if (skillsCont.querySelector('.empty-hint')) {
    skillsCont.innerHTML = '';
  }

  const existingPills = Array.from(skillsCont.querySelectorAll('.skill-pill'));
  const needsRebuild = existingPills.length !== state.skillSlots.length ||
    existingPills.some((p, i) => p.dataset.skillId !== state.skillSlots[i].id);

  if (needsRebuild) {
    skillsCont.innerHTML = '';
    state.skillSlots.forEach((slot, idx) => {
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      const pill = createSkillPill(slot, idx, def);
      skillsCont.appendChild(pill);
    });
  } else {
    state.skillSlots.forEach((slot, idx) => {
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      updateSkillPill(existingPills[idx], slot, idx, def);
    });
  }
}

function renderMobileSkills() {
  const mBar = $('mobile-skills-bar');
  const mList = $('mobile-skills-list');
  const gameCol = $('game-column');
  if (!mBar || !mList) return;

  const validSlots = (state.skillSlots || []).filter(s => s && (s.count > 0 || (state.activeTimers && state.activeTimers[s.id] > 0)));

  if (validSlots.length === 0) {
    mBar.classList.add('hidden');
    mList.innerHTML = '';
    if (gameCol) gameCol.classList.remove('has-mobile-skills');
    return;
  }

  mBar.classList.remove('hidden');
  if (gameCol) gameCol.classList.add('has-mobile-skills');

  const existingPills = Array.from(mList.querySelectorAll('.msb-pill'));
  const needsRebuild = existingPills.length !== validSlots.length ||
    existingPills.some((p, i) => p.dataset.skillId !== validSlots[i].id);

  if (needsRebuild) {
    mList.innerHTML = '';
    validSlots.forEach((slot) => {
      const realIdx = state.skillSlots.indexOf(slot);
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      const pill = createMobileSkillPill(slot, realIdx, def);
      mList.appendChild(pill);
    });
  } else {
    validSlots.forEach((slot, idx) => {
      const realIdx = state.skillSlots.indexOf(slot);
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      updateMobileSkillPill(existingPills[idx], slot, realIdx, def);
    });
  }
}

function createMobileSkillPill(slot, realIdx, def) {
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'msb-pill';
  pill.dataset.skillId = slot.id;

  const sName = (typeof t === 'function' && t('skill_name_' + slot.id) !== ('skill_name_' + slot.id))
    ? t('skill_name_' + slot.id)
    : (def.name || slot.id);
  const sDesc = (typeof t === 'function' && t('skill_desc_' + slot.id) !== ('skill_desc_' + slot.id))
    ? t('skill_desc_' + slot.id)
    : (def.desc || '');

  pill.title = `${sName}: ${sDesc}`;
  pill.setAttribute('aria-label', sName);

  pill.innerHTML = `
    <span class="msb-icon" style="color:${def.color || 'var(--accent-cyan)'}">${getSkillSvgIcon(slot.id)}</span>
    <span class="msb-label">${sName}</span>
    <span class="msb-badge">×${slot.count}</span>
    <div class="msb-dur-track"><div class="msb-dur-fill"></div></div>
  `;

  updateMobileSkillPill(pill, slot, realIdx, def);
  return pill;
}

function updateMobileSkillPill(pill, slot, realIdx, def) {
  const timer = (state.activeTimers && state.activeTimers[slot.id]) || 0;
  const isActive = timer > 0;
  const totalDur = def.duration || 10000;
  const pct = Math.min(100, Math.max(0, (timer / totalDur) * 100));

  pill.classList.toggle('msb-is-active', isActive);

  if (slot.count > 0) {
    pill.onclick = (e) => {
      e.preventDefault();
      activateSkill(realIdx);
    };
    pill.classList.remove('msb-disabled');
  } else {
    pill.onclick = null;
    pill.classList.toggle('msb-disabled', !isActive);
  }

  const badge = pill.querySelector('.msb-badge');
  if (badge) {
    if (isActive) {
      badge.textContent = `${(timer / 1000).toFixed(1)}s`;
    } else {
      badge.textContent = `×${slot.count}`;
    }
  }

  const track = pill.querySelector('.msb-dur-track');
  const fill = pill.querySelector('.msb-dur-fill');
  if (track && fill) {
    track.style.display = isActive ? 'block' : 'none';
    if (isActive) {
      fill.style.width = pct.toFixed(1) + '%';
      if (def.color) {
        fill.style.background = def.color;
      }
    }
  }
}

function createSkillPill(slot, idx, def) {
  const pill = document.createElement('div');
  pill.className = 'skill-pill';
  pill.dataset.skillId = slot.id;
  const sName = (typeof t === 'function' && t('skill_name_' + slot.id) !== ('skill_name_' + slot.id))
    ? t('skill_name_' + slot.id)
    : (def.name || '');
  const sDesc = (typeof t === 'function' && t('skill_desc_' + slot.id) !== ('skill_desc_' + slot.id))
    ? t('skill_desc_' + slot.id)
    : (def.desc || '');
  pill.title = sDesc;

  pill.innerHTML = `
    <kbd class="sp-key-badge">${idx + 1}</kbd>
    <div class="sp-main">
      <span class="sp-icon">${def.image ? `<img src="${def.image}" class="sp-icon-img" alt="" draggable="false" />` : def.icon}</span>
      <div class="sp-info">
        <span class="sp-name">${sName}</span>
        <span class="sp-dur-text"></span>
      </div>
    </div>
    <div class="sp-badges">
      <span class="sp-count-badge"></span>
    </div>
    <div class="sp-active-bar-track">
      <div class="sp-active-bar"></div>
    </div>
  `;

  updateSkillPill(pill, slot, idx, def);
  return pill;
}

function updateSkillPill(pill, slot, idx, def) {
  const timer = state.activeTimers[slot.id] || 0;
  const isActive = timer > 0;
  const totalDur = def.duration || 10000;
  const pct = Math.min(100, Math.max(0, (timer / totalDur) * 100));

  pill.classList.toggle('sp-is-active', isActive);

  if (slot.count > 0) {
    pill.onclick = () => activateSkill(idx);
    pill.style.cursor = 'pointer';
  } else {
    pill.onclick = null;
    pill.style.cursor = 'default';
  }

  const activeLabel = typeof t === 'function' ? t('hud_active') : 'ATIVO';

  const durText = pill.querySelector('.sp-dur-text');
  if (durText) {
    if (isActive) {
      durText.className = 'sp-dur-text sp-dur';
      durText.textContent = `${(timer / 1000).toFixed(1)}s ${activeLabel.toLowerCase()}`;
    } else {
      durText.className = 'sp-dur-text sp-dur-hint';
      durText.textContent = def.desc.split(' ').slice(0, 3).join(' ');
    }
  }

  const keyBadge = pill.querySelector('.sp-key-badge');
  if (keyBadge) {
    keyBadge.textContent = idx + 1;
    const keyLabel = (typeof t === 'function' && t('hud_key_label') !== 'hud_key_label') ? t('hud_key_label') : 'Tecla';
    keyBadge.title = `${keyLabel} [${idx + 1}]`;
    keyBadge.style.opacity = '1';
    keyBadge.classList.toggle('sp-key-empty', slot.count === 0 && !isActive);
  }

  const countBadge = pill.querySelector('.sp-count-badge');
  if (countBadge) {
    if (isActive && slot.count === 0) {
      countBadge.className = 'sp-count-badge sp-active-badge';
      countBadge.textContent = activeLabel.toUpperCase();
    } else {
      countBadge.className = 'sp-count-badge';
      countBadge.textContent = `×${slot.count}`;
    }
  }

  const track = pill.querySelector('.sp-active-bar-track');
  const bar = pill.querySelector('.sp-active-bar');
  if (track && bar) {
    track.style.display = isActive ? 'block' : 'none';
    if (isActive) {
      bar.style.width = pct.toFixed(1) + '%';
      if (def.color) {
        bar.style.background = def.color;
        bar.style.boxShadow = `0 0 8px ${def.color}`;
      }
    }
  }
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

// ============================================================
// MOBILE VIRTUAL KEYBOARD AUTO-ADAPTATION (window.visualViewport)
// ============================================================
function updateMobileViewport() {
  const vv = window.visualViewport;
  const layout = $('layout');
  const screenGame = $('screen-game');
  const hud = $('hud');

  if (!vv) return;

  const vh = vv.height;
  const vw = vv.width;
  const fullH = window.innerHeight;
  const diff = fullH - vh;
  // Android and iOS virtual keyboards typically occupy 120px to 450px
  const isKeyboardOpen = diff > 100;

  document.documentElement.style.setProperty('--visual-viewport-height', `${vh}px`);
  document.documentElement.style.setProperty('--visual-viewport-width', `${vw}px`);
  document.documentElement.style.setProperty('--keyboard-height', `${Math.max(0, diff)}px`);

  if (isKeyboardOpen) {
    document.body.classList.add('keyboard-active');

    if (screenGame) {
      screenGame.style.height = `${vh}px`;
      screenGame.style.maxHeight = `${vh}px`;
      screenGame.style.bottom = 'auto';
    }

    const hudH = hud?.offsetHeight || 50;
    if (layout) {
      layout.style.maxHeight = `${Math.max(140, vh - hudH - 8)}px`;
    }

    // Safety reposition: prevent falling items from being clipped or unfairly falling out of view
    if (typeof state !== 'undefined' && state?.activeItems && typeof gameArea !== 'undefined' && gameArea) {
      const boardH = gameArea.clientHeight;
      if (boardH > 80) {
        state.activeItems.forEach(item => {
          if (!item.removing && item.y > boardH - 45) {
            item.y = Math.max(10, boardH - 65);
            if (item.el) item.el.style.top = `${item.y}px`;
          }
        });
      }
    }

    window.scrollTo(0, 0);
  } else {
    document.body.classList.remove('keyboard-active');

    if (screenGame) {
      screenGame.style.height = '';
      screenGame.style.maxHeight = '';
      screenGame.style.bottom = '';
    }

    if (layout) {
      layout.style.maxHeight = '';
    }
  }
}

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateMobileViewport);
  window.visualViewport.addEventListener('scroll', () => {
    if (document.body.classList.contains('keyboard-active')) {
      window.scrollTo(0, 0);
    }
    updateMobileViewport();
  });
}
window.addEventListener('resize', () => {
  updateMobileViewport();
  if (typeof updateVirtualKeyboardVisibility === 'function') updateVirtualKeyboardVisibility();
  if (typeof applyMobileInputRestrictions === 'function') applyMobileInputRestrictions();
});
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    updateMobileViewport();
    if (typeof updateVirtualKeyboardVisibility === 'function') updateVirtualKeyboardVisibility();
    if (typeof applyMobileInputRestrictions === 'function') applyMobileInputRestrictions();
  }, 250);
});

// Initial call
updateMobileViewport();
if (typeof initVirtualKeyboard === 'function') initVirtualKeyboard();
if (typeof updateVirtualKeyboardVisibility === 'function') updateVirtualKeyboardVisibility();
if (typeof applyMobileInputRestrictions === 'function') applyMobileInputRestrictions();

// ============================================================
// BOSS BATTLE UI RENDERING (MONSTER / ROBOT WITH LIVES: |||)
// ============================================================
function getBossSpriteSvg(boss) {
  const bId = boss?.id || '';
  const type = boss?.type || '';
  const species = boss?.species || '';

  // 1. Zorkon — Alien Lagarto Menta/Esmeralda (Verde fofo com olhão expressivo)
  if (bId === 'alien_zorkon' || type === 'alien_hive' || species === 'reptilian_lizard' || type === 'beast') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <g fill="#064E3B">
          <rect x="6" y="3" width="2" height="3" />
          <rect x="14" y="3" width="2" height="3" />
          <rect x="7" y="5" width="8" height="1" />
          <rect x="5" y="6" width="2" height="1" />
          <rect x="15" y="6" width="2" height="1" />
          <rect x="4" y="7" width="1" height="9" />
          <rect x="17" y="7" width="1" height="3" />
          <rect x="18" y="10" width="1" height="5" />
          <rect x="19" y="12" width="1" height="2" />
          <rect x="5" y="16" width="1" height="1" />
          <rect x="17" y="15" width="1" height="1" />
          <rect x="6" y="16" width="11" height="1" />
          <rect x="5" y="17" width="1" height="4" />
          <rect x="17" y="17" width="1" height="4" />
          <rect x="6" y="21" width="11" height="1" />
        </g>
        <g fill="#22C55E">
          <rect x="5" y="13" width="1" height="3" />
          <rect x="6" y="15" width="11" height="1" />
          <rect x="16" y="13" width="2" height="2" />
        </g>
        <g fill="#4ADE80">
          <rect x="6" y="4" width="2" height="2" />
          <rect x="14" y="4" width="2" height="2" />
          <rect x="7" y="6" width="8" height="1" />
          <rect x="5" y="7" width="12" height="3" />
          <rect x="5" y="10" width="13" height="3" />
          <rect x="6" y="13" width="10" height="2" />
          <rect x="18" y="12" width="1" height="2" />
        </g>
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#0F172A" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="11" width="1" height="1" fill="#064E3B" />
        <rect x="14" y="14" width="2" height="1" fill="#064E3B" />
        <rect x="6" y="17" width="11" height="4" fill="#64748B" />
        <rect x="8" y="18" width="7" height="2" fill="#94A3B8" />
        <rect x="11" y="18" width="1" height="2" fill="#38BDF8" />
      </svg>
    `;
  }

  // 2. Vespera — Alien Lagarto Lavanda/Roxo com Chifrinho no Nariz
  if (bId === 'alien_vespera' || type === 'alien_psionic' || type === 'mythology') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <g fill="#2E1065">
          <rect x="4" y="5" width="2" height="2" />
          <rect x="3" y="7" width="2" height="2" />
          <rect x="2" y="9" width="2" height="2" />
          <rect x="7" y="4" width="6" height="1" />
          <rect x="6" y="5" width="1" height="1" />
          <rect x="13" y="5" width="2" height="1" />
          <rect x="15" y="6" width="1" height="3" />
          <rect x="16" y="8" width="1" height="2" />
          <rect x="4" y="11" width="1" height="5" />
          <rect x="19" y="10" width="1" height="2" />
          <rect x="18" y="12" width="1" height="2" />
          <rect x="17" y="14" width="1" height="2" />
          <rect x="5" y="16" width="12" height="1" />
          <rect x="4" y="17" width="1" height="4" />
          <rect x="17" y="17" width="1" height="4" />
          <rect x="5" y="21" width="12" height="1" />
        </g>
        <rect x="5" y="6" width="1" height="1" fill="#DDD6FE" />
        <rect x="4" y="8" width="1" height="1" fill="#DDD6FE" />
        <rect x="3" y="10" width="1" height="1" fill="#DDD6FE" />
        <g fill="#A78BFA">
          <rect x="7" y="5" width="6" height="1" />
          <rect x="6" y="6" width="9" height="3" />
          <rect x="5" y="9" width="11" height="4" />
          <rect x="5" y="13" width="12" height="2" />
          <rect x="6" y="15" width="10" height="1" />
        </g>
        <g fill="#7C3AED">
          <rect x="5" y="11" width="1" height="4" />
          <rect x="6" y="15" width="10" height="1" />
        </g>
        <rect x="17" y="10" width="2" height="2" fill="#F5F3FF" />
        <rect x="19" y="10" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="12" width="1" height="1" fill="#C7D2FE" />
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#3B0764" />
        <rect x="8" y="7" width="5" height="1" fill="#2E1065" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="14" y="14" width="2" height="1" fill="#2E1065" />
        <rect x="5" y="17" width="12" height="4" fill="#DB2777" />
        <rect x="7" y="18" width="8" height="2" fill="#F472B6" />
      </svg>
    `;
  }

  // 3. Xylarion — Alien Lagarto Azul Celeste com Cachecol Vermelho
  if (bId === 'alien_xylarion' || type === 'alien_dreadnought' || type === 'robot') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <g fill="#082F49">
          <rect x="7" y="3" width="2" height="2" />
          <rect x="10" y="3" width="2" height="2" />
          <rect x="13" y="4" width="2" height="2" />
          <rect x="5" y="5" width="2" height="2" />
          <rect x="15" y="5" width="2" height="2" />
          <rect x="4" y="7" width="1" height="8" />
          <rect x="17" y="7" width="1" height="3" />
          <rect x="18" y="10" width="1" height="4" />
          <rect x="17" y="14" width="1" height="2" />
          <rect x="5" y="15" width="12" height="1" />
        </g>
        <rect x="7" y="4" width="2" height="1" fill="#BAE6FD" />
        <rect x="10" y="4" width="2" height="1" fill="#BAE6FD" />
        <rect x="13" y="5" width="2" height="1" fill="#BAE6FD" />
        <g fill="#38BDF8">
          <rect x="6" y="5" width="9" height="2" />
          <rect x="5" y="7" width="12" height="3" />
          <rect x="5" y="10" width="13" height="4" />
          <rect x="6" y="14" width="11" height="1" />
        </g>
        <g fill="#0284C7">
          <rect x="5" y="12" width="1" height="3" />
          <rect x="6" y="14" width="11" height="1" />
        </g>
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#0F172A" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="11" width="1" height="1" fill="#082F49" />
        <rect x="14" y="13" width="2" height="1" fill="#082F49" />
        <g fill="#082F49">
          <rect x="4" y="16" width="1" height="5" />
          <rect x="17" y="16" width="1" height="5" />
          <rect x="5" y="21" width="12" height="1" />
        </g>
        <rect x="5" y="16" width="12" height="5" fill="#EF4444" />
        <rect x="7" y="18" width="8" height="2" fill="#DC2626" />
        <rect x="9" y="19" width="4" height="2" fill="#B91C1C" />
      </svg>
    `;
  }

  // 4. Kragthor — Alien Lagarto Coral/Vermelho com Chifrinhos Amarelos
  if (bId === 'alien_kragthor' || type === 'alien_warlord' || type === 'volcano') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <rect x="6" y="2" width="2" height="3" fill="#FDE047" />
        <rect x="14" y="2" width="2" height="3" fill="#FDE047" />
        <g fill="#4C0519">
          <rect x="6" y="1" width="2" height="1" />
          <rect x="14" y="1" width="2" height="1" />
          <rect x="8" y="4" width="6" height="1" />
          <rect x="5" y="5" width="2" height="1" />
          <rect x="15" y="5" width="2" height="1" />
          <rect x="4" y="6" width="1" height="10" />
          <rect x="17" y="6" width="1" height="4" />
          <rect x="18" y="10" width="1" height="4" />
          <rect x="17" y="14" width="1" height="2" />
          <rect x="5" y="16" width="12" height="1" />
          <rect x="4" y="17" width="1" height="4" />
          <rect x="17" y="17" width="1" height="4" />
          <rect x="5" y="21" width="12" height="1" />
        </g>
        <g fill="#FB7185">
          <rect x="7" y="5" width="8" height="1" />
          <rect x="5" y="6" width="12" height="4" />
          <rect x="5" y="10" width="13" height="4" />
          <rect x="6" y="14" width="11" height="2" />
        </g>
        <g fill="#E11D48">
          <rect x="5" y="12" width="1" height="4" />
          <rect x="6" y="15" width="11" height="1" />
        </g>
        <rect x="6" y="12" width="2" height="1" fill="#FDA4AF" />
        <rect x="15" y="12" width="2" height="1" fill="#FDA4AF" />
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#4C0519" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="11" width="1" height="1" fill="#4C0519" />
        <rect x="14" y="13" width="2" height="1" fill="#4C0519" />
        <rect x="5" y="17" width="12" height="4" fill="#475569" />
        <rect x="7" y="18" width="8" height="2" fill="#64748B" />
        <rect x="10" y="18" width="2" height="2" fill="#FDE047" />
      </svg>
    `;
  }

  // 5. Nebulor — Alien Lagarto Índigo Estelar
  if (bId === 'alien_nebulor' || type === 'alien_darkmatter' || type === 'ocean') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <rect x="8" y="3" width="1" height="2" fill="#FDE047" />
        <rect x="13" y="3" width="1" height="2" fill="#FDE047" />
        <g fill="#1E1B4B">
          <rect x="7" y="4" width="8" height="1" />
          <rect x="5" y="5" width="2" height="2" />
          <rect x="15" y="5" width="2" height="2" />
          <rect x="4" y="7" width="1" height="9" />
          <rect x="17" y="7" width="1" height="3" />
          <rect x="18" y="10" width="1" height="4" />
          <rect x="17" y="14" width="1" height="2" />
          <rect x="5" y="16" width="12" height="1" />
          <rect x="4" y="17" width="1" height="4" />
          <rect x="17" y="17" width="1" height="4" />
          <rect x="5" y="21" width="12" height="1" />
        </g>
        <g fill="#818CF8">
          <rect x="7" y="5" width="8" height="2" />
          <rect x="5" y="7" width="12" height="3" />
          <rect x="5" y="10" width="13" height="4" />
          <rect x="6" y="14" width="11" height="2" />
        </g>
        <g fill="#4F46E5">
          <rect x="5" y="12" width="1" height="4" />
          <rect x="6" y="15" width="11" height="1" />
        </g>
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#0F172A" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="11" width="1" height="1" fill="#1E1B4B" />
        <rect x="14" y="13" width="2" height="1" fill="#1E1B4B" />
        <rect x="5" y="17" width="12" height="4" fill="#22D3EE" />
        <rect x="7" y="18" width="8" height="2" fill="#06B6D4" />
      </svg>
    `;
  }

  // 6. Xenor / Padrão — Alien Lagarto Dourado Solar
  return `
    <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
      <rect x="7" y="3" width="2" height="2" fill="#FEF08A" />
      <rect x="10" y="2" width="2" height="3" fill="#FEF08A" />
      <rect x="13" y="3" width="2" height="2" fill="#FEF08A" />
      <g fill="#451A03">
        <rect x="6" y="4" width="1" height="1" />
        <rect x="15" y="4" width="1" height="1" />
        <rect x="5" y="5" width="1" height="2" />
        <rect x="16" y="5" width="1" height="2" />
        <rect x="4" y="7" width="1" height="9" />
        <rect x="17" y="7" width="1" height="3" />
        <rect x="18" y="10" width="1" height="4" />
        <rect x="17" y="14" width="1" height="2" />
        <rect x="5" y="16" width="12" height="1" />
        <rect x="4" y="17" width="1" height="4" />
        <rect x="17" y="17" width="1" height="4" />
        <rect x="5" y="21" width="12" height="1" />
      </g>
      <g fill="#FBBF24">
        <rect x="6" y="5" width="10" height="2" />
        <rect x="5" y="7" width="12" height="3" />
        <rect x="5" y="10" width="13" height="4" />
        <rect x="6" y="14" width="11" height="2" />
      </g>
      <g fill="#D97706">
        <rect x="5" y="12" width="1" height="4" />
        <rect x="6" y="15" width="11" height="1" />
      </g>
      <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
      <rect x="9" y="9" width="4" height="4" fill="#451A03" />
      <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
      <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
      <rect x="17" y="11" width="1" height="1" fill="#451A03" />
      <rect x="14" y="13" width="2" height="1" fill="#451A03" />
      <rect x="5" y="17" width="12" height="4" fill="#7C3AED" />
      <rect x="7" y="18" width="8" height="2" fill="#A78BFA" />
    </svg>
  `;
}

// ============================================================
// ALIEN SPACE INVADER VISUAL MANAGEMENT
// ============================================================
// ALIEN SPACE INVADER VISUAL MANAGEMENT (CLEAN SINGLE MOB)
// ============================================================
function renderBossHearts(remainingLives = 3, maxLives = 3) {
  const container = $('alien-space-hearts');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < maxLives; i++) {
    const isAlive = i < remainingLives;
    const heartWrap = document.createElement('span');
    heartWrap.className = `alien-heart-icon ${isAlive ? 'alive' : 'lost'}`;
    heartWrap.setAttribute('title', isAlive ? 'HP' : 'Lost');
    heartWrap.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;
    container.appendChild(heartWrap);
  }
}

function showAlienSpaceInvader(boss, remainingLives = 3, maxLives = 3) {
  const invader = $('alien-space-invader');
  const sprite = $('alien-space-sprite');
  const titleEl = $('alien-space-title');
  if (!invader) return;

  // 1. Título do boss acima do ícone ao centro
  if (titleEl && boss) {
    const lang = (typeof getLanguage === 'function') ? getLanguage() : 'en';
    const isPt = lang === 'pt';
    const name = (typeof t === 'function' && boss.nameKey && t(boss.nameKey) !== boss.nameKey)
      ? boss.name
      : (isPt ? (boss.namePt || boss.name) : (boss.name || boss.namePt));
    titleEl.textContent = name || 'Alien Invader';
  }

  // 2. Apenas 1 desenho do boss na tela (ícone pixel art ao centro)
  if (sprite && boss) {
    sprite.innerHTML = getBossSpriteSvg(boss);
  }

  // 3. Barra de vida com 3 corações abaixo do boss
  renderBossHearts(remainingLives, maxLives);

  const clr = boss?.color || '#06B6D4';
  invader.style.setProperty('--alien-theme-color', clr);

  invader.classList.remove('hidden', 'alien-throw', 'alien-damaged', 'alien-retreat');
  void invader.offsetWidth;
  invader.classList.add('alien-surge');

  // Oculta a barra de próximos para manter a tela limpa
  const queueBar = $('queue-bar');
  if (queueBar) queueBar.classList.add('hidden');
}

function hideAlienSpaceInvader() {
  if (typeof stopBossBgm === 'function') {
    stopBossBgm(true);
  }
  const invader = $('alien-space-invader');
  if (!invader) return;
  invader.classList.add('alien-retreat');
  setTimeout(() => {
    invader.classList.add('hidden');
    invader.classList.remove('alien-surge', 'alien-throw', 'alien-damaged', 'alien-retreat');
  }, 450);

  // Restaura a barra de próximos
  const queueBar = $('queue-bar');
  if (queueBar) queueBar.classList.remove('hidden');
}

function animateAlienThrow() {
  const invader = $('alien-space-invader');
  if (!invader || invader.classList.contains('hidden')) return;
  invader.classList.remove('alien-throw');
  void invader.offsetWidth;
  invader.classList.add('alien-throw');
  setTimeout(() => invader.classList.remove('alien-throw'), 650);
}

function animateAlienDamaged() {
  const invader = $('alien-space-invader');
  if (!invader || invader.classList.contains('hidden')) return;
  invader.classList.add('alien-damaged');
  setTimeout(() => invader.classList.remove('alien-damaged'), 500);
}

/**
 * Destrói o boss em partículas cósmicas (exatamente como os objetos caindo),
 * ocultando elementos de interface e executando o callback após a dispersão dos fragmentos.
 */
function explodeAlienBoss(onComplete) {
  const invader = $('alien-space-invader');
  const craft = invader?.querySelector('.alien-space-craft') || invader;
  const hearts = $('alien-space-hearts');
  const title = $('alien-space-title');

  if (hearts) hearts.style.display = 'none';
  if (title) title.style.display = 'none';

  if (craft) {
    // Toca efeito sonoro de impacto e destruição
    if (typeof playSound === 'function') {
      playSound('hit');
    }

    // Detona explosões densas de partículas celestes usando a paleta exata de pixels do boss
    if (typeof spawnCelestialExplosion === 'function') {
      spawnCelestialExplosion(craft, 'ALIEN_BOSS_DEFEAT');
      setTimeout(() => {
        if (craft) spawnCelestialExplosion(craft, 'ALIEN_BOSS_DEFEAT');
      }, 70);
      setTimeout(() => {
        if (craft) spawnCelestialExplosion(craft, 'ALIEN_BOSS_DEFEAT');
      }, 140);
    }

    craft.style.opacity = '0';
    craft.style.transform = 'scale(0.15)';
    craft.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
  }

  // Após alguns milissegundos de partículas caindo e explodindo na tela, conclui a sequência
  setTimeout(() => {
    if (invader) {
      invader.classList.add('hidden');
      if (craft) {
        craft.style.opacity = '';
        craft.style.transform = '';
        craft.style.transition = '';
      }
      if (hearts) hearts.style.display = '';
      if (title) title.style.display = '';
    }
    if (typeof onComplete === 'function') {
      onComplete();
    }
  }, 700);
}

function renderBossHud(boss, remainingLives = 3, maxLives = 3) {
  // O retângulo horizontal do topo foi removido permanentemente
  if (bossHud) bossHud.classList.add('hidden');

  // Atualiza diretamente o único alien central no céu com título e 3 corações
  showAlienSpaceInvader(boss, remainingLives, maxLives);
}

function hideBossHud() {
  if (bossHud) bossHud.classList.add('hidden');
  hideAlienSpaceInvader();
}

function flashBossDamage() {
  if (typeof animateAlienDamaged === 'function') {
    animateAlienDamaged();
  }
}

function renderBossMeaningSlots(boxEl, targetWord, typedBuffer) {
  if (!boxEl) return;
  const slotsCont = boxEl.querySelector('.bmb-slots');
  if (!slotsCont) return;
  slotsCont.innerHTML = '';

  const chars = targetWord.split('');
  for (let i = 0; i < chars.length; i++) {
    const slot = document.createElement('span');
    if (i < typedBuffer.length) {
      slot.className = 'bmb-slot filled';
      slot.textContent = typedBuffer[i];
    } else {
      slot.className = 'bmb-slot empty';
      slot.textContent = '_';
    }
    slotsCont.appendChild(slot);
  }
}

function animateCoinsList(containerEl, coinRowsData, onComplete) {
  if (!containerEl) return;
  containerEl.innerHTML = '';
  if (!state._coinAnimTimers) state._coinAnimTimers = [];

  function runRowSequence(index) {
    if (index >= coinRowsData.length) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }
    const rowInfo = coinRowsData[index];

    const rowDiv = document.createElement('div');
    rowDiv.className = 'go-row go-row-pop';
    rowDiv.style.setProperty('--row-delay', '0ms');

    const labelSpan = document.createElement('span');
    labelSpan.textContent = rowInfo.label;

    const valStrong = document.createElement('strong');
    valStrong.style.color = rowInfo.color;
    valStrong.style.fontVariantNumeric = 'tabular-nums';
    if (rowInfo.isTotal) {
      valStrong.style.fontSize = '1.05rem';
    }
    valStrong.textContent = '+0';

    rowDiv.appendChild(labelSpan);
    rowDiv.appendChild(valStrong);
    containerEl.appendChild(rowDiv);

    const startTimeout = setTimeout(() => {
      let currentVal = 0;
      const targetVal = rowInfo.target;
      if (targetVal <= 0) {
        valStrong.textContent = '+0';
        runRowSequence(index + 1);
        return;
      }

      const totalTicks = Math.min(35, targetVal);
      const step = Math.max(1, Math.ceil(targetVal / totalTicks));
      const tickInterval = Math.max(18, Math.min(38, Math.round(850 / totalTicks)));

      const intervalId = setInterval(() => {
        currentVal = Math.min(targetVal, currentVal + step);
        valStrong.textContent = `+${currentVal}`;
        if (typeof playSound === 'function') playSound('coin');

        if (currentVal >= targetVal) {
          clearInterval(intervalId);
          const nextTimeout = setTimeout(() => {
            runRowSequence(index + 1);
          }, 220);
          state._coinAnimTimers.push(nextTimeout);
        }
      }, tickInterval);

      state._coinAnimTimers.push(intervalId);
    }, 120);

    state._coinAnimTimers.push(startTimeout);
  }

  const initTimeout = setTimeout(() => {
    runRowSequence(0);
  }, 120);
  state._coinAnimTimers.push(initTimeout);
}

function isBossRewardOpen() {
  const modal = $('modal-boss-reward');
  return modal && !modal.classList.contains('hidden');
}

function selectBossRewardIndex(index) {
  if (!state.currentBossRewardSkills || !state.currentBossRewardSkills[index]) return;
  state.selectedBossRewardIndex = index;
  if (typeof playSound === 'function') playSound('click');
  updateBossRewardSelectionVisual();
}

function navigateBossReward(direction) {
  const total = state.currentBossRewardSkills ? state.currentBossRewardSkills.length : 3;
  if (total === 0) return;
  if (state.selectedBossRewardIndex === undefined || state.selectedBossRewardIndex === null || state.selectedBossRewardIndex < 0) {
    state.selectedBossRewardIndex = 0;
  } else if (direction === 'next' || direction === 'down' || direction === 'right') {
    state.selectedBossRewardIndex = (state.selectedBossRewardIndex + 1) % total;
  } else if (direction === 'prev' || direction === 'up' || direction === 'left') {
    state.selectedBossRewardIndex = (state.selectedBossRewardIndex - 1 + total) % total;
  }
  if (typeof playSound === 'function') playSound('click');
  updateBossRewardSelectionVisual();
}

function updateBossRewardSelectionVisual() {
  const cards = document.querySelectorAll('#boss-skills-grid .boss-skill-card');
  cards.forEach((card, idx) => {
    if (idx === state.selectedBossRewardIndex) {
      card.classList.add('boss-skill-card-selected');
    } else {
      card.classList.remove('boss-skill-card-selected');
    }
  });
}

function pickBossSkillByIndex(index) {
  if (!state.currentBossRewardSkills || !state.currentBossRewardSkills[index]) return;
  state.selectedBossRewardIndex = index;
  updateBossRewardSelectionVisual();
  const skill = state.currentBossRewardSkills[index];
  const onPick = state.onPickBossReward;
  closeBossRewardModal();
  if (typeof onPick === 'function') {
    onPick(skill);
  }
}

function pickSelectedBossSkill() {
  const idx = (state.selectedBossRewardIndex !== undefined && state.selectedBossRewardIndex >= 0)
    ? state.selectedBossRewardIndex
    : 0;
  pickBossSkillByIndex(idx);
}

function showBossRewardModal(skills, onPick) {
  if (!modalBossReward || !bossSkillsGrid) return;
  bossSkillsGrid.innerHTML = '';
  state.currentBossRewardSkills = skills;
  state.onPickBossReward = onPick;
  state.selectedBossRewardIndex = 0;

  const bossCoinsRowsList = $('boss-coins-rows-list');
  if (bossCoinsRowsList) {
    const bossBonusLbl     = typeof t === 'function' ? t('modal_boss_bonus') : 'Boss Bonus';
    const coinsPreciseLbl  = typeof t === 'function' ? t('modal_coins_precision') : '100% Accuracy Bonus';
    const coinsPhaseTotLbl = typeof t === 'function' ? t('modal_coins_phase_total') : 'Total Coins Added';

    const bossBonusCoins = 350;
    const isPerfectAcc = (state.errorsPhase === 0);
    const precisionCoins = isPerfectAcc ? 35 : 0;
    const totalBossCoins = bossBonusCoins + precisionCoins;

    const coinRowsData = [
      { label: bossBonusLbl, target: bossBonusCoins, color: '#FBBF24' }
    ];
    if (isPerfectAcc && precisionCoins > 0) {
      coinRowsData.push({ label: coinsPreciseLbl, target: precisionCoins, color: '#10B981' });
    }
    coinRowsData.push({ label: coinsPhaseTotLbl, target: totalBossCoins, color: '#FBBF24', isTotal: true });

    animateCoinsList(bossCoinsRowsList, coinRowsData);
  }

  skills.forEach((skill, index) => {
    const sName = (typeof t === 'function' && skill.nameKey && t(skill.nameKey) !== skill.nameKey)
      ? t(skill.nameKey)
      : (skill.name || '');
    const sDesc = (typeof t === 'function' && skill.descKey && t(skill.descKey) !== skill.descKey)
      ? t(skill.descKey)
      : (skill.desc || '');

    const pickTxt = typeof t === 'function' && t('boss_btn_pick') ? t('boss_btn_pick') : 'Obtain';
    const card = document.createElement('div');
    const isSelected = (index === state.selectedBossRewardIndex);
    card.className = 'boss-skill-card' + (isSelected ? ' boss-skill-card-selected' : '');
    card.setAttribute('data-boss-index', String(index));
    card.innerHTML = `
      <kbd class="card-key-hint" aria-hidden="true">${index + 1}</kbd>
      <div class="boss-skill-icon-wrap" style="--item-clr: ${skill.color || 'var(--accent-primary)'}">
        <span>${getSkillSvgIcon(skill.id) || skill.icon}</span>
      </div>
      <div class="boss-skill-name">${sName}</div>
      <div class="boss-skill-desc">${sDesc}</div>
      <button class="boss-skill-pick-btn" type="button">${pickTxt}</button>
    `;
    card.addEventListener('mouseenter', () => {
      state.selectedBossRewardIndex = index;
      updateBossRewardSelectionVisual();
    });
    card.addEventListener('click', (e) => {
      if (e.target.closest('.boss-skill-pick-btn')) return;
      selectBossRewardIndex(index);
    });
    const btn = card.querySelector('.boss-skill-pick-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeBossRewardModal();
        if (typeof onPick === 'function') onPick(skill);
      });
    }
    bossSkillsGrid.appendChild(card);
  });

  modalBossReward.classList.remove('hidden');
}

// ============================================================
// LEVEL UP MODAL UI & SELECTION LOGIC
// ============================================================
function showLevelUpModal(choices, onPick) {
  const modal = document.getElementById('modal-levelup');
  const grid = document.getElementById('levelup-skills-grid');
  const subEl = document.getElementById('levelup-sub-text');
  if (!modal || !grid) return;

  grid.innerHTML = '';
  state.levelUpChoices = choices;
  state.onPickLevelUp = onPick;
  state.selectedLevelUpIndex = 0;

  if (subEl) {
    subEl.textContent = typeof t === 'function' ? t('levelup_sub', { level: state.level }) : `You reached Level ${state.level}!`;
  }

  choices.forEach((skill, index) => {
    const curLevel = state.runPerks?.[skill.id] || 0;
    const isUpgrade = curLevel > 0;
    const nextLevel = curLevel + 1;

    const sName = (typeof t === 'function' && t('skill_name_' + skill.id) !== ('skill_name_' + skill.id))
      ? t('skill_name_' + skill.id)
      : (skill.name || skill.id);

    let sDesc = '';
    if (skill.id === 'dilation') {
      const maxMultiplier = Math.min(5, 1 + nextLevel);
      sDesc = typeof t === 'function' ? t(skill.descKey, { max: maxMultiplier }) : `Spacing up to ${maxMultiplier}`;
    } else if (skill.id === 'shield') {
      const dur = Math.min(5, nextLevel) * 10;
      sDesc = typeof t === 'function' ? t(skill.descKey, { duration: dur, level: nextLevel, max: 5 }) : `Immunity for ${dur}s`;
    } else if (skill.id === 'bomb') {
      sDesc = typeof t === 'function' ? t(skill.descKey, { level: nextLevel, max: 5 }) : `Explosion radius level ${nextLevel}`;
    } else {
      sDesc = (typeof t === 'function' && t(skill.descKey) !== skill.descKey)
        ? t(skill.descKey)
        : (skill.desc || '');
    }

    const card = document.createElement('div');
    const isSelected = (index === state.selectedLevelUpIndex);
    card.className = 'levelup-skill-card' + (isSelected ? ' levelup-skill-card-selected' : '');
    card.setAttribute('data-choice-index', String(index));
    card.style.setProperty('--item-clr', skill.color || 'var(--accent-primary)');

    const pickTxt = typeof t === 'function' && t('levelup_btn_pick') ? t('levelup_btn_pick') : 'Choose';
    const isMax = (nextLevel >= (skill.maxLevel || 99));
    const lvlStr = typeof t === 'function' && t('hud_perk_lvl', { lvl: nextLevel }) !== 'hud_perk_lvl'
      ? t('hud_perk_lvl', { lvl: nextLevel })
      : `Nv. ${nextLevel}`;
    const maxStr = typeof t === 'function' && t('hud_perk_max') !== 'hud_perk_max' ? t('hud_perk_max') : 'MÁX';
    const upStr = typeof t === 'function' && t('hud_perk_upgrade') !== 'hud_perk_upgrade' ? t('hud_perk_upgrade') : 'Upgrade';
    const newStr = typeof t === 'function' && t('hud_perk_new') !== 'hud_perk_new' ? t('hud_perk_new') : 'NOVA';
    const tagTxt = isUpgrade ? `${lvlStr} (${isMax ? maxStr : upStr})` : newStr;

    card.innerHTML = `
      <kbd class="card-key-hint" aria-hidden="true">${index + 1}</kbd>
      <div class="levelup-card-badge">${tagTxt}</div>
      <div class="levelup-skill-icon-wrap" style="--item-clr: ${skill.color || 'var(--accent-primary)'}">
        <img class="levelup-skill-img" src="${skill.image || `assets/skills/${skill.id}.webp`}" alt="${sName}" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
        <span class="levelup-skill-svg-fallback" style="display:none; color:${skill.color || 'var(--accent-primary)'}">${getSkillSvgIcon(skill.id) || skill.icon}</span>
      </div>
      <div class="levelup-skill-name">${sName}</div>
      <div class="levelup-skill-desc">${sDesc}</div>
      <button class="levelup-skill-pick-btn" type="button">${pickTxt}</button>
    `;

    card.addEventListener('mouseenter', () => {
      state.selectedLevelUpIndex = index;
      updateLevelUpSelectionVisual();
    });
    card.addEventListener('click', (e) => {
      if (e.target.closest('.levelup-skill-pick-btn')) return;
      selectLevelUpIndex(index);
    });
    const btn = card.querySelector('.levelup-skill-pick-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLevelUpModal();
        if (typeof onPick === 'function') onPick(skill);
      });
    }
    grid.appendChild(card);
  });

  modal.classList.remove('hidden');
}

function selectLevelUpIndex(index) {
  state.selectedLevelUpIndex = index;
  updateLevelUpSelectionVisual();
  const choice = state.levelUpChoices?.[index];
  if (choice && typeof state.onPickLevelUp === 'function') {
    const cb = state.onPickLevelUp;
    closeLevelUpModal();
    cb(choice);
  }
}

function pickLevelUpSkillByIndex(index) {
  selectLevelUpIndex(index);
}

function pickSelectedLevelUpSkill() {
  const idx = state.selectedLevelUpIndex || 0;
  selectLevelUpIndex(idx);
}

function navigateLevelUp(dir) {
  if (!state.levelUpChoices || state.levelUpChoices.length === 0) return;
  const count = state.levelUpChoices.length;
  if (dir === 'next') {
    state.selectedLevelUpIndex = (state.selectedLevelUpIndex + 1) % count;
  } else {
    state.selectedLevelUpIndex = (state.selectedLevelUpIndex - 1 + count) % count;
  }
  updateLevelUpSelectionVisual();
}

function updateLevelUpSelectionVisual() {
  const cards = document.querySelectorAll('.levelup-skill-card');
  cards.forEach((c, idx) => {
    c.classList.toggle('levelup-skill-card-selected', idx === state.selectedLevelUpIndex);
  });
}

function closeLevelUpModal() {
  const modal = document.getElementById('modal-levelup');
  if (modal) modal.classList.add('hidden');
  state.levelUpChoices = null;
  state.onPickLevelUp = null;
  state.selectedLevelUpIndex = 0;
}

window.showLevelUpModal = showLevelUpModal;
window.closeLevelUpModal = closeLevelUpModal;
window.pickLevelUpSkillByIndex = pickLevelUpSkillByIndex;
window.pickSelectedLevelUpSkill = pickSelectedLevelUpSkill;
window.navigateLevelUp = navigateLevelUp;
window.renderRunPerks = renderRunPerks;

function closeBossRewardModal() {
  if (state._coinAnimTimers && Array.isArray(state._coinAnimTimers)) {
    state._coinAnimTimers.forEach(id => {
      clearInterval(id);
      clearTimeout(id);
    });
    state._coinAnimTimers = [];
  }
  state.currentBossRewardSkills = null;
  state.onPickBossReward = null;
  state.selectedBossRewardIndex = 0;
  if (modalBossReward) modalBossReward.classList.add('hidden');
}

// ============================================================
// SAVE SLOTS & START SCREEN PROFILE UI
// ============================================================
function updateStartScreenUI() {
  const btnStart = $('btn-start');
  const btnContinue = $('btn-continue');

  if (btnStart) btnStart.classList.remove('hidden');
  if (btnContinue) btnContinue.classList.add('hidden');

  const startRecordVal = $('start-record-val');
  if (startRecordVal) {
    const best = typeof getHighScore === 'function' ? getHighScore() : 0;
    const formatted = typeof formatScore === 'function' ? formatScore(best) : String(best).padStart(10, '0');
    startRecordVal.textContent = formatted;
  }

  if (window.AVAILABLE_UPDATE_VERSION && typeof showUpdateNotification === 'function') {
    showUpdateNotification();
  } else if (typeof checkForAppUpdate === 'function') {
    checkForAppUpdate();
  }
}

function openSlotsModal() {
  renderSlotsModal();
  const modal = $('modal-slots');
  if (modal) modal.classList.remove('hidden');
  if (typeof playSound === 'function') playSound('click');
}

function closeSlotsModal() {
  const modal = $('modal-slots');
  if (modal) modal.classList.add('hidden');
}

function renderSlotsModal() {
  const grid = $('slots-modal-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const slots = typeof getAllSaveSlots === 'function' ? getAllSaveSlots() : [];

  slots.forEach(slot => {
    const card = document.createElement('div');
    card.className = 'slot-card' + (slot.data ? ' slot-card-occupied' : ' slot-card-empty');
    if (slot.isActive) card.classList.add('slot-card-active');

    const slotTitle = typeof t === 'function' ? t('slot_number', { slot: slot.slotId }) : `Slot ${slot.slotId}`;

    let contentHtml = '';
    if (slot.data) {
      const diffKey = slot.data.difficulty || 'normal';
      const diffName = typeof t === 'function' ? t(`diff_${diffKey}`) : diffKey.toUpperCase();
      const diffClass = `slot-diff-${diffKey}`;

      const scoreStr = Number(slot.data.totalScore || 0).toLocaleString();
      const phaseNum = slot.data.phase || 1;
      const shieldsNum = slot.data.shields !== undefined ? slot.data.shields : (slot.data.lives || 3);
      const phaseLbl = typeof t === 'function' ? t('hud_phase') : 'FASE';
      const scoreLbl = typeof t === 'function' ? t('modal_stat_score') : 'PONTOS';
      const shieldsLbl = typeof t === 'function' ? (t('hud_shields') || t('hud_lives')) : 'ESCUDOS';
      const dateStr = slot.data.savedAt
        ? new Date(slot.data.savedAt).toLocaleDateString(typeof getLanguage === 'function' ? getLanguage() : undefined, {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
          })
        : '';
      const dateLabel = typeof t === 'function' ? t('slot_date_fmt', { date: dateStr }) : `Salvo: ${dateStr}`;

      const btnContinueLbl = typeof t === 'function' ? t('slot_btn_continue') : 'Continuar';
      const btnDeleteLbl = typeof t === 'function' ? t('slot_btn_delete') : 'Excluir';

      contentHtml = `
        <div class="slot-card-head">
          <div class="slot-card-title">${slotTitle}</div>
          <span class="slot-diff-badge ${diffClass}">${diffName}</span>
        </div>
        <div class="slot-score-row">
          <span class="slot-score-lbl">${scoreLbl}:</span>
          <span class="slot-score-val text-emerald">${scoreStr}</span>
        </div>
        <div class="slot-stats-grid slot-stats-2col">
          <div class="slot-stat-row">
            <span class="slot-stat-lbl">${phaseLbl}</span>
            <span class="slot-stat-val text-cyan">${phaseNum}</span>
          </div>
          <div class="slot-stat-row">
            <span class="slot-stat-lbl">${shieldsLbl}</span>
            <span class="slot-stat-val text-cyan" style="display:inline-flex;align-items:center;justify-content:center;gap:3px;">
              ${shieldsNum}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#38BDF8" stroke="#38BDF8" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
          </div>
        </div>
        <div class="slot-date-text">${dateLabel}</div>
        <div class="slot-card-actions slot-actions-row">
          <button class="btn-slot-action btn-slot-continue" onclick="continueSlot(${slot.slotId})">
            <svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>${btnContinueLbl}</span>
          </button>
          <button class="btn-slot-delete-square" onclick="deleteSlot(${slot.slotId})" title="${btnDeleteLbl}" aria-label="${btnDeleteLbl}">
            <svg class="btn-svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;
    } else {
      const btnNewLbl = typeof t === 'function' ? t('slot_btn_new') : 'Novo Jogo';

      contentHtml = `
        <div class="slot-card-head">
          <div class="slot-card-title">${slotTitle}</div>
        </div>
        <div class="slot-empty-spacer"></div>
        <div class="slot-card-actions">
          <button class="btn-slot-action btn-slot-start" onclick="newGameInSlot(${slot.slotId})">
            <svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>${btnNewLbl}</span>
          </button>
        </div>
      `;
    }

    card.innerHTML = contentHtml;
    grid.appendChild(card);
  });
}

function continueSlot(slotId) {
  closeSlotsModal();
  if (typeof resumeSavedGame === 'function') {
    resumeSavedGame(slotId);
  }
}

function newGameInSlot(slotId) {
  const hasActive = typeof hasActiveSave === 'function' ? hasActiveSave(slotId) : false;
  if (hasActive) {
    const confirmMsg = typeof t === 'function' ? t('slot_confirm_overwrite', { slot: slotId }) : `Sobrescrever o Slot ${slotId}?`;
    if (!window.confirm(confirmMsg)) return;
  }
  closeSlotsModal();
  if (typeof startGame === 'function') {
    startGame('classic', slotId);
  }
}

function deleteSlot(slotId) {
  const confirmMsg = typeof t === 'function' ? t('slot_confirm_delete', { slot: slotId }) : `Excluir a partida salva no Slot ${slotId}?`;
  if (!window.confirm(confirmMsg)) return;
  if (typeof deleteSaveSlot === 'function') deleteSaveSlot(slotId);
  renderSlotsModal();
  updateStartScreenUI();
  if (typeof playSound === 'function') playSound('click');
}

// ============================================================
// APP UPDATE ENGINE & CACHE REFRESH (v1.6)
// ============================================================
function isNewerVersion(remote, current) {
  if (!remote) return false;
  if (!current) return true;
  if (remote === current) return false;
  const rParts = String(remote).split('.').map(n => parseInt(n, 10) || 0);
  const cParts = String(current).split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(rParts.length, cParts.length);
  for (let i = 0; i < len; i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

function showUpdateNotification() {
  const btn = document.getElementById('btn-update-available');
  if (!btn) return;
  const descEl = document.getElementById('update-btn-version-desc');
  if (descEl) {
    descEl.textContent = typeof t === 'function' ? t('update_available_sub') : 'Clique para atualizar o cache e carregar a versão mais recente';
  }
  btn.classList.remove('hidden');
}

async function checkForAppUpdate(interactive = false) {
  const statusBtn = document.getElementById('btn-settings-check-update');
  const statusLbl = document.getElementById('settings-update-status-label');
  if (interactive && statusLbl) {
    statusLbl.textContent = '...';
  }

  try {
    const res = await fetch(`./version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    if (!res.ok) {
      if (interactive && statusLbl) {
        statusLbl.textContent = typeof t === 'function' ? t('settings_btn_check_update') : 'Verificar';
      }
      return;
    }
    const data = await res.json();
    const remoteVer = data && data.version ? String(data.version) : null;
    const currentVer = String(window.APP_VERSION || (typeof getInstalledAppVersion === 'function' ? getInstalledAppVersion() : ''));

    if (remoteVer && isNewerVersion(remoteVer, currentVer)) {
      window.AVAILABLE_UPDATE_VERSION = remoteVer;
      showUpdateNotification();
      if (statusBtn && statusLbl) {
        statusBtn.classList.add('has-update');
        statusLbl.textContent = typeof t === 'function' ? t('update_btn_action') : 'Atualizar';
        statusBtn.onclick = applyAppUpdate;
      }
    } else {
      if (remoteVer && !window.APP_VERSION) {
        window.APP_VERSION = remoteVer;
        if (typeof setInstalledAppVersion === 'function') {
          setInstalledAppVersion(remoteVer);
        }
      }
      if (interactive && statusLbl) {
        statusLbl.textContent = typeof t === 'function' ? t('settings_update_latest') : 'Atualizado';
        setTimeout(() => {
          if (statusLbl) statusLbl.textContent = typeof t === 'function' ? t('settings_btn_check_update') : 'Verificar';
        }, 2500);
      }
    }
  } catch (err) {
    console.warn('[UpdateCheck] Could not fetch version.json:', err);
    if (interactive && statusLbl) {
      statusLbl.textContent = typeof t === 'function' ? t('settings_btn_check_update') : 'Verificar';
    }
  }
}

async function applyAppUpdate() {
  const btn = document.getElementById('btn-update-available');
  if (btn) {
    btn.classList.add('updating');
    const titleEl = btn.querySelector('.update-btn-title');
    if (titleEl) {
      titleEl.textContent = typeof t === 'function' ? t('update_applying') : 'Atualizando...';
    }
  }

  const settingsCheckBtn = document.getElementById('btn-settings-check-update');
  if (settingsCheckBtn) {
    settingsCheckBtn.classList.add('updating');
    const statusLbl = document.getElementById('settings-update-status-label');
    if (statusLbl) {
      statusLbl.textContent = typeof t === 'function' ? t('update_applying') : 'Atualizando...';
    }
  }

  if (typeof playSound === 'function') {
    try { playSound('level_up'); } catch (_) {}
  }

  // 1. Record the newly acknowledged version
  const targetVer = window.AVAILABLE_UPDATE_VERSION;
  if (targetVer && typeof setInstalledAppVersion === 'function') {
    setInstalledAppVersion(targetVer);
    window.APP_VERSION = targetVer;
  }

  // 2. Purge CacheStorage (Service Worker / PWA caches)
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) {
      console.warn('[Update] Could not clear CacheStorage:', e);
    }
  }

  // 2. Unregister any active service workers
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    } catch (e) {
      console.warn('[Update] Could not unregister ServiceWorker:', e);
    }
  }

  // 3. Clear non-persistent session storage (DO NOT TOUCH localStorage!)
  try {
    sessionStorage.clear();
  } catch (_) {}

  // 4. Force browser to reload index.html and scripts by navigating with timestamp
  const url = new URL(window.location.href);
  url.searchParams.delete('v');
  url.searchParams.set('_t', Date.now().toString());

  setTimeout(() => {
    window.location.replace(url.toString());
  }, 350);
}

// Development and test helper (sem numeração na interface)
function simulateUpdateAvailable() {
  window.AVAILABLE_UPDATE_VERSION = 'new';
  showUpdateNotification();
  const statusBtn = document.getElementById('btn-settings-check-update');
  const statusLbl = document.getElementById('settings-update-status-label');
  if (statusBtn && statusLbl) {
    statusBtn.classList.add('has-update');
    statusLbl.textContent = typeof t === 'function' ? t('update_btn_action') : 'Atualizar';
    statusBtn.onclick = applyAppUpdate;
  }
}

// Expose globally
window.checkForAppUpdate = checkForAppUpdate;
window.applyAppUpdate = applyAppUpdate;
window.simulateUpdateAvailable = simulateUpdateAvailable;

// Trigger check on load and attach proactive update listeners
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => { checkForAppUpdate(); }, 800);
    });
  } else {
    setTimeout(() => { checkForAppUpdate(); }, 800);
  }

  // Check whenever user focuses the tab or switches back to it
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForAppUpdate();
    }
  });
  window.addEventListener('focus', () => {
    checkForAppUpdate();
  });

  // Background heartbeat every 30s on the home screen
  setInterval(() => {
    const screenStart = document.getElementById('screen-start');
    if (screenStart && screenStart.classList.contains('active')) {
      checkForAppUpdate();
    }
  }, 30000);
}

