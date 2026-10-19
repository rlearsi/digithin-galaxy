/* ================================================
   DIGITHIN GALAXY — js/i18n.js
   Internationalization (i18n) & Dynamic Language Pack Engine
   Supported: en (Default), pt, fr, de, ja, ko, zh
   Single-file language packs located in: locales/{lang}.json
   ================================================ */
'use strict';

function getInstalledAppVersion() {
  try {
    return localStorage.getItem('digithin_galaxy_app_version') || '';
  } catch (_) {
    return '';
  }
}

function setInstalledAppVersion(ver) {
  try {
    if (ver) localStorage.setItem('digithin_galaxy_app_version', String(ver));
  } catch (_) {}
}

window.getInstalledAppVersion = getInstalledAppVersion;
window.setInstalledAppVersion = setInstalledAppVersion;
window.APP_VERSION = window.APP_VERSION || getInstalledAppVersion();

const SUPPORTED_LANGUAGES = ['en', 'pt', 'fr', 'de', 'ja', 'ko', 'zh'];

// Aggregated dictionaries loaded from locales/{lang}.json
const TRANSLATIONS = window.TRANSLATIONS = window.TRANSLATIONS || {};
window.GAME_DATA_WORDS = window.GAME_DATA_WORDS || {};

const LOADED_LOCALES = {};
let isLocaleReady = false;

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem('digithin_galaxy_language');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch (_) {}

  // Auto-detect browser language for first-time visitors
  const navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (navLang.startsWith('pt')) return 'pt';
  if (navLang.startsWith('fr')) return 'fr';
  if (navLang.startsWith('de')) return 'de';
  if (navLang.startsWith('ja')) return 'ja';
  if (navLang.startsWith('ko')) return 'ko';
  if (navLang.startsWith('zh')) return 'zh';
  return 'en'; // English is default
}

let currentLanguage = detectInitialLanguage();

function getLanguage() {
  return currentLanguage;
}

function t(key, params) {
  const enDict = TRANSLATIONS.en || {};
  const dict = TRANSLATIONS[currentLanguage] || enDict;
  let str = dict[key] || enDict[key] || key;
  if (params && typeof params === 'object') {
    Object.keys(params).forEach(p => {
      str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
  }
  return str;
}

/**
 * Loads a single language pack JSON file from locales/{lang}.json
 */
async function loadLocale(lang) {
  if (LOADED_LOCALES[lang]) {
    return LOADED_LOCALES[lang];
  }

  try {
    const vParam = window.APP_VERSION ? `?v=${window.APP_VERSION}` : '';
    const response = await fetch(`./locales/${lang}.json${vParam}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} loading locales/${lang}.json`);
    }
    const data = await response.json();
    LOADED_LOCALES[lang] = data;

    // Register UI strings
    TRANSLATIONS[lang] = data.ui || {};

    // Register vocabulary, syllables, boss words and training worlds
    window.GAME_DATA_WORDS[lang] = {
      syllables: data.syllables || [],
      words: data.words || [],
      bossWords: data.bossWords || {},
      trainingWorlds: data.trainingWorlds || {}
    };

    return data;
  } catch (err) {
    console.error(`[i18n] Error loading language pack '${lang}':`, err);
    if (lang !== 'en' && !LOADED_LOCALES.en) {
      return await loadLocale('en');
    }
    return null;
  }
}

/**
 * Sets the active game language and reloads data if necessary
 */
async function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) lang = 'en';
  currentLanguage = lang;
  try {
    localStorage.setItem('digithin_galaxy_language', lang);
  } catch (_) {}

  // Ensure this language pack is loaded
  await loadLocale(lang);

  // Update active word pool, syllables and training worlds
  if (typeof updateWordPoolLanguage === 'function') {
    updateWordPoolLanguage(lang);
  }

  // Migra dinamicamente o estado da partida em andamento para o novo idioma
  if (typeof state !== 'undefined' && state) {
    state.language = lang;

    // 1. Migra palavras desbloqueadas para o novo idioma
    if (Array.isArray(state.unlockedWords) && state.unlockedWords.length > 0 && typeof migrateUnlockedWordsToActiveLanguage === 'function') {
      state.unlockedWords = migrateUnlockedWordsToActiveLanguage(state.unlockedWords, lang);
    }

    // 2. Migra estatísticas de palavras digitadas
    if (state.wordStats && typeof migrateWordStatsToLanguage === 'function') {
      state.wordStats = migrateWordStatsToLanguage(state.wordStats, lang);
    }

    // 2.1 Migra palavras descobertas na corrida atual
    if (Array.isArray(state.runDiscoveredWords) && state.runDiscoveredWords.length > 0 && typeof migrateWordToLanguage === 'function') {
      state.runDiscoveredWords = state.runDiscoveredWords.map(wKey => {
        const mig = migrateWordToLanguage({ text: wKey }, lang);
        return mig && mig.text ? mig.text.toLowerCase() : wKey;
      });
    }

    // 3. Migra itens na fila da esteira (spawnQueue)
    if (Array.isArray(state.spawnQueue) && state.spawnQueue.length > 0) {
      state.spawnQueue = state.spawnQueue.map(item => {
        if (!item) return item;
        if (item.type === 'word' && typeof migrateWordToLanguage === 'function') {
          const mig = migrateWordToLanguage({ text: item.text }, lang);
          return { ...item, text: (mig?.text || item.text).toUpperCase() };
        }
        if (item.type === 'syllable' && typeof ALL_SYLLABLES !== 'undefined' && Array.isArray(ALL_SYLLABLES) && ALL_SYLLABLES.length > 0) {
          const freshSyl = (typeof pick === 'function') ? pick(ALL_SYLLABLES) : ALL_SYLLABLES[0];
          return { ...item, text: freshSyl.toUpperCase() };
        }
        return item;
      });
      if (typeof renderQueue === 'function') {
        renderQueue();
      }
    }

    // 4. Migra palavras ativas atualmente em queda na tela
    if (Array.isArray(state.activeItems) && state.activeItems.length > 0) {
      state.activeItems.forEach(item => {
        if (!item || item.removing) return;
        if (item.type === 'word' && typeof migrateWordToLanguage === 'function') {
          const mig = migrateWordToLanguage({ text: item.text }, lang);
          if (mig && mig.text) {
            item.text = mig.text.toUpperCase();
            if (item.el) {
              item.el.textContent = item.text;
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
            }
          }
        }
      });
      if (state.typedBuffer) {
        state.typedBuffer = '';
        if (typeof clearHighlight === 'function') clearHighlight();
      }
    }

    // 5. Migra batalha de chefão caso esteja em curso
    if (state.bossBattle && state.bossBattle.active && typeof updateBossLanguage === 'function') {
      updateBossLanguage(lang);
    }

    // 6. Atualiza salvamento do slot ativo se a partida estiver em curso
    if (typeof isMatchInProgress === 'function' && isMatchInProgress() && state.gameMode === 'classic') {
      if (typeof saveGameProgress === 'function') {
        saveGameProgress();
      }
    }
  }

  applyTranslations();
}

const SUPPORTED_LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English (US)' },
  { code: 'pt', label: 'Português (BR)' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '简体中文' }
];

async function changeLanguage(lang) {
  await setLanguage(lang);
}

async function stepLanguage(direction = 1) {
  const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'pt';
  const currentIndex = SUPPORTED_LANGUAGE_OPTIONS.findIndex(item => item.code === currentLang);
  const safeIndex = currentIndex >= 0 ? currentIndex : 1;
  const nextIndex = (safeIndex + direction + SUPPORTED_LANGUAGE_OPTIONS.length) % SUPPORTED_LANGUAGE_OPTIONS.length;
  const nextLang = SUPPORTED_LANGUAGE_OPTIONS[nextIndex].code;
  if (typeof playSound === 'function') {
    try { playSound('click'); } catch (_) {}
  }
  await changeLanguage(nextLang);
}

window.SUPPORTED_LANGUAGE_OPTIONS = SUPPORTED_LANGUAGE_OPTIONS;
window.stepLanguage = stepLanguage;

function applyTranslations() {
  const lang = getLanguage();
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    // Never overwrite with key name if translation failed to find a valid string
    if (translation && translation !== key) {
      if (el.tagName === 'INPUT' && el.type === 'placeholder') {
        el.placeholder = translation;
      } else {
        el.innerHTML = translation;
      }
    }
  });

  // Translate dynamic aria-labels and titles
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    const translation = t(key);
    if (translation && translation !== key) {
      el.setAttribute('aria-label', translation);
      el.setAttribute('title', translation);
    }
  });

  // Sync settings language stepper
  const langObj = SUPPORTED_LANGUAGE_OPTIONS.find(l => l.code === lang) || SUPPORTED_LANGUAGE_OPTIONS[1];
  document.querySelectorAll('#settings-lang-val, .settings-lang-val').forEach(el => {
    el.textContent = langObj.label;
  });

  // Sync settings dropdown
  const langSelect = document.getElementById('settings-lang-select');
  if (langSelect) {
    langSelect.value = lang;
  }

  // Sync settings app version
  const versionEl = document.getElementById('settings-app-version');
  if (versionEl) {
    const currentVer = window.APP_VERSION || (typeof getInstalledAppVersion === 'function' ? getInstalledAppVersion() : '');
    versionEl.textContent = currentVer ? `v${currentVer}` : '';
  }

  const inMatch = typeof isMatchInProgress === 'function' ? isMatchInProgress() : false;
  const diffSelect = document.getElementById('settings-difficulty-select');
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

  // Update settings labels with dynamic states & modern SVGs
  if (typeof updateSettingsUI === 'function') {
    try { updateSettingsUI(); } catch (e) { console.warn('[i18n] updateSettingsUI error:', e); }
  }

  // Update Training modal if rendered
  if (typeof renderTrainingWorlds === 'function') {
    try { renderTrainingWorlds(); } catch (e) { console.warn('[i18n] renderTrainingWorlds error:', e); }
  }
  // Update Achievements modal if rendered
  if (typeof renderConquistasModal === 'function') {
    try { renderConquistasModal(); } catch (e) { console.warn('[i18n] renderConquistasModal error:', e); }
  }
  // Update Shop modal if rendered
  if (typeof renderShopModal === 'function') {
    try { renderShopModal(); } catch (e) { console.warn('[i18n] renderShopModal error:', e); }
  }
  // Update Library modal if rendered
  if (typeof renderBibliotecaModal === 'function') {
    try { renderBibliotecaModal(); } catch (e) { console.warn('[i18n] renderBibliotecaModal error:', e); }
  }
  // Update Start Screen UI & Save Slots if rendered
  if (typeof updateStartScreenUI === 'function') {
    try { updateStartScreenUI(); } catch (e) { console.warn('[i18n] updateStartScreenUI error:', e); }
  }

  // Update HUD ONLY IF game match is currently in progress
  if (typeof isMatchInProgress === 'function' && isMatchInProgress() && typeof updateHUD === 'function') {
    try { updateHUD(); } catch (e) { console.warn('[i18n] updateHUD error:', e); }
  } else if (typeof renderDiscoveredWordsHUD === 'function') {
    try { renderDiscoveredWordsHUD(); } catch (_) {}
  }
}

/**
 * Fades out and safely removes the initial loading screen
 */
function hideAppLoadingScreen() {
  const loader = document.getElementById('app-loading-screen');
  if (loader && !loader.classList.contains('fade-out')) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 450);
  }
}

/**
 * Bootstraps the i18n system and preloads initial locale
 */
async function initLocaleSystem() {
  const initial = detectInitialLanguage();
  currentLanguage = initial;

  // Carrega todos os pacotes de idiomas em paralelo para permitir migração instantânea de vocabulário
  try {
    await Promise.all(SUPPORTED_LANGUAGES.map(lang => loadLocale(lang)));
  } catch (err) {
    console.error('[i18n] Error during initial locale bootstrap:', err);
    // Garantia de fallback para inglês e idioma ativo
    try {
      if (!LOADED_LOCALES.en) await loadLocale('en');
      if (!LOADED_LOCALES[initial]) await loadLocale(initial);
    } catch (_) {}
  }

  // Re-sync game data structures
  try {
    if (typeof initGameLanguageData === 'function') {
      initGameLanguageData();
    }
    if (typeof updateWordPoolLanguage === 'function') {
      updateWordPoolLanguage(initial);
    }
  } catch (err) {
    console.error('[i18n] Error during game data sync:', err);
  }

  isLocaleReady = true;

  try {
    applyTranslations();
  } catch (err) {
    console.error('[i18n] Error in applyTranslations:', err);
  } finally {
    // ALWAYS dismiss the loading screen, even if an unexpected error occurs
    hideAppLoadingScreen();
  }
}

// Safety timeout: ensure loading screen NEVER blocks forever
if (typeof setTimeout === 'function') {
  setTimeout(() => {
    hideAppLoadingScreen();
  }, 2000);
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocaleSystem);
  } else {
    initLocaleSystem();
  }
}
