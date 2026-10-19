/* ================================================
   DIGITHIN GALAXY — js/keyboard.js
   Finger guide, on-screen virtual keyboard and mobile viewport adaptation
   ================================================ */
'use strict';

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
