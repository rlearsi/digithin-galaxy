/* ================================================
   DIGITHIN GALAXY — js/state.js
   State management and random generators
   ================================================ */
'use strict';

let state = null;

// ================================================
// DIFFICULTY PERSISTENCE & HELPERS
// ================================================
function getDifficulty() {
  try {
    const saved = localStorage.getItem('digithin_galaxy_difficulty');
    if (saved && (saved === 'easy' || saved === 'normal' || saved === 'hard')) {
      return saved;
    }
  } catch (_) {}
  return 'normal';
}

function getDifficultyConfig(diffKey) {
  const key = diffKey || (state && state.difficulty) || getDifficulty();
  return (typeof DIFFICULTY_CONFIG !== 'undefined' && DIFFICULTY_CONFIG[key])
    ? DIFFICULTY_CONFIG[key]
    : { id: 'normal', name: 'normal', initialSpeed: 1.0, speedErrorPenalty: 0, progressErrorPenalty: 3, startLives: 3 };
}

function isMatchInProgress() {
  const sg = typeof screenGame !== 'undefined' ? screenGame : document.getElementById('screen-game');
  const mg = typeof modalGameover !== 'undefined' ? modalGameover : document.getElementById('modal-gameover');
  const isGameOver = !!(mg && !mg.classList.contains('hidden'));
  return !!(sg && sg.classList.contains('active') && !isGameOver);
}

function setDifficulty(diff) {
  if (isMatchInProgress()) {
    console.warn('[DigithinGalaxy] Cannot change difficulty during an active match.');
    return;
  }
  const valid = (diff === 'easy' || diff === 'hard') ? diff : 'normal';
  try {
    localStorage.setItem('digithin_galaxy_difficulty', valid);
  } catch (_) {}
  if (state) {
    const oldDiff = state.difficulty;
    state.difficulty = valid;
    const cfg = getDifficultyConfig(valid);
    if (state.gameMode === 'classic' || state.gameMode === 'timeattack') {
      const oldCfg = getDifficultyConfig(oldDiff);
      if (state.lives === (oldCfg?.startLives || 3)) {
        state.lives = cfg.startLives;
      }
      state.maxLives = cfg.startLives;
    }
  }
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof updateSettingsUI === 'function') updateSettingsUI();
}

function changeDifficulty(diff) {
  if (isMatchInProgress()) {
    console.warn('[DigithinGalaxy] Cannot change difficulty during an active match.');
    return;
  }
  setDifficulty(diff);
}

function defaultState() {
  const diffKey = getDifficulty();
  const diffCfg = getDifficultyConfig(diffKey);
  const sharedCoins = (typeof getSharedCoins === 'function') ? getSharedCoins() : 0;
  return {
    difficulty:        diffKey,
    phase:             1,
    phasePts:          0,       // Points accumulated in the current phase
    totalScore:        0,       // Banked points from previous phases (run score)
    coins:             sharedCoins, // Player starts with shared coins bank across matches
    totalCoinsEarned:  0,       // Total coins accumulated across this run
    flawlessStreak:    0,       // Consecutive phases completed without errors
    errorsPhase:       0,       // Errors made in the current phase
    totalErrors:       0,       // Total errors made in this run
    lives:             diffCfg.startLives,
    maxLives:          diffCfg.startLives,
    progress:          0,
    hitsPhase:         0,
    totalHits:         0,
    currentAccuracy:   0,       // Real-time accuracy % for the current phase/match
    speedMultiplier:   diffCfg.initialSpeed,     // Resets to initial speed each phase
    speedAccum:        0,                        // Accumulator for 5s progressive speed increment
    typedBuffer:       '',
    activeItems:       [],
    spawnQueue:        [],
    spawnTimer:        null,
    rafId:             null,
    lastTs:            null,
    paused:            false,
    escPaused:         false,
    libPaused:         false,
    phaseComplete:     false,
    unlockedWords:     [],      // Words unlocked by player
    wordStats:         {},      // { [text]: { count: N } }
    skillSlots:        [],      // [{ id, count }] up to 4 distinct skill types
    activeTimers:      {},      // { freezer: ms, bomb: ms, shield: ms, vortex: ms, slowdown: ms, haste: ms }
    vortexAccum:       0,       // Tracks 2-second interval for vortex effect
    shopPurchaseCount: 0,
    currentShopPurchases: 0,
    selectedShopIndex: -1,
    currentShopItems:  [],
    selectedBossRewardIndex: 0,
    currentBossRewardSkills: [],
    onPickBossReward:        null,
    idCounter:         0,
    combo:             0,       // Consecutive correct hits streak
    maxCombo:          0,       // Best streak in the match
    maxComboPhase:     0,       // Best streak in current phase
    continues:         0,       // Available continues purchased from shop
    gameMode:          'classic', // 'classic' | 'zen' | 'timeattack' | 'training'
    timeAttackSecs:    60,
    trainingWorld:     1,       // 1 (Home Row), 2 (Top Row), 3 (Bottom Row), 4 (Accents & Punctuation)
    trainingLesson:    1,
    startTime:         null,    // Timestamp when phase/run started
    charsTyped:        0,       // Total characters correctly typed
    defeatedBossTypes: [],      // Boss types defeated during this run for randomized variety
    pendingBoss:       null,    // Randomly selected candidate boss for the upcoming boss phase
    pendingBossPhase:  null,    // Phase number for which pendingBoss was selected
    bossBattle: {
      active:          false,
      boss:            null,
      pool:            [],
      solvedWords:     [],
      attemptedWords:  [],
      lastDroppedWord: null,
      solvedCount:     0,
      currentWord:     null,
      boxItem:         null,
      damageCount:     0,
    },
  };
}

state = defaultState();

// Check if a phase is a Boss Battle (every 8 phases: 8, 16, 24, ...)
function isBossPhase(phase) {
  const p = parseInt(phase, 10) || 0;
  const interval = (typeof BOSS_PHASE_INTERVAL !== 'undefined') ? BOSS_PHASE_INTERVAL : 8;
  return p > 0 && p % interval === 0;
}

// Random helpers
function rand(a, b)   { return Math.random() * (b - a) + a; }
function pick(arr)    { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function uid()        { return ++state.idCounter; }
function randLetter() { return 'ABCDEFGHIJKLMNOPRSTUVZ'[Math.floor(Math.random() * 22)]; }

// Format score with 10 digits (e.g. 0000098120)
function formatScore(val) {
  const num = Math.max(0, Math.floor(val || 0));
  return String(num).padStart(10, '0');
}

// High score persistence & tracking
function getHighScore() {
  try {
    const val = localStorage.getItem('digithin_galaxy_highscore');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch (_) {
    return 0;
  }
}

function updateHighScore(score) {
  const currentBest = getHighScore();
  const numScore = Math.max(0, Math.floor(score || 0));
  const isNew = numScore > currentBest && numScore > 0;
  const best = isNew ? numScore : currentBest;
  if (isNew) {
    try {
      localStorage.setItem('digithin_galaxy_highscore', String(numScore));
    } catch (_) {}
  }
  return { best, isNew, previous: currentBest };
}

/**
 * Calculates flawless streak coin bonus:
 * 3 consecutive phases -> +10 coins
 * 6 consecutive phases -> +20 coins
 * 10 consecutive phases -> +40 coins
 * and so on (+10 at 13, +20 at 16, +40 at 20, ...)
 */
function getFlawlessStreakCoins(streak) {
  if (!streak || streak <= 0) return 0;
  if (streak % 10 === 0) {
    return (streak / 10) * 40;
  }
  const rem = streak % 10;
  const baseDecade = Math.floor(streak / 10) * 40;
  if (rem === 3) return baseDecade + 10;
  if (rem === 6) return baseDecade + 20;
  return 0;
}

// ================================================
// HIGH COINS & SHARED COINS PERSISTENCE
// ================================================
function getHighCoins() {
  try {
    const val = localStorage.getItem('digithin_galaxy_highcoins');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch (_) {
    return 0;
  }
}

function updateHighCoins(coins) {
  const currentBest = getHighCoins();
  const numCoins = Math.max(0, Math.floor(coins || 0));
  const isNew = numCoins > currentBest && numCoins > 0;
  const best = isNew ? numCoins : currentBest;
  if (isNew) {
    try {
      localStorage.setItem('digithin_galaxy_highcoins', String(numCoins));
    } catch (_) {}
  }
  return { best, isNew, previous: currentBest };
}

function getSharedCoins() {
  try {
    const val = localStorage.getItem('digithin_galaxy_shared_coins');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch (_) {
    return 0;
  }
}

function setSharedCoins(val) {
  const num = Math.max(0, Math.floor(val || 0));
  try {
    localStorage.setItem('digithin_galaxy_shared_coins', String(num));
  } catch (_) {}
  return num;
}

function addSharedCoins(amount) {
  const num = Math.max(0, Math.floor(amount || 0));
  if (num <= 0) return getSharedCoins();
  const updated = getSharedCoins() + num;
  setSharedCoins(updated);
  return updated;
}

function deductSharedCoins(amount) {
  const num = Math.max(0, Math.floor(amount || 0));
  if (num <= 0) return getSharedCoins();
  const updated = Math.max(0, getSharedCoins() - num);
  setSharedCoins(updated);
  return updated;
}

// ================================================
// SAVE SLOTS PROGRESS MANAGEMENT
// ================================================
const MAX_SAVE_SLOTS = 3;

function getActiveSlot() {
  try {
    const s = parseInt(localStorage.getItem('digithin_galaxy_active_slot') || '1', 10);
    return (s >= 1 && s <= MAX_SAVE_SLOTS) ? s : 1;
  } catch (_) {
    return 1;
  }
}

function setActiveSlot(slotId) {
  const id = (slotId >= 1 && slotId <= MAX_SAVE_SLOTS) ? slotId : 1;
  try {
    localStorage.setItem('digithin_galaxy_active_slot', String(id));
  } catch (_) {}
  return id;
}

function getSaveSlot(slotId) {
  const id = (slotId !== undefined && slotId !== null) ? slotId : getActiveSlot();
  try {
    const raw = localStorage.getItem(`digithin_galaxy_save_slot_${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed && parsed.phase && !parsed.isFinished) ? parsed : null;
  } catch (_) {
    return null;
  }
}

function hasActiveSave(slotId) {
  const save = getSaveSlot(slotId);
  return !!(save && save.phase && !save.isFinished);
}

function getAllSaveSlots() {
  const currentActive = getActiveSlot();
  const slots = [];
  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    slots.push({
      slotId: i,
      data: getSaveSlot(i),
      isActive: i === currentActive
    });
  }
  return slots;
}

function getLatestSaveSlot() {
  let latest = null;
  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    const s = getSaveSlot(i);
    if (s && s.phase && !s.isFinished) {
      if (!latest || (s.savedAt || 0) > (latest.savedAt || 0)) {
        latest = s;
      }
    }
  }
  return latest;
}

function saveGameProgress(slotId) {
  if (!state) return false;
  // Slots de salvamento operam exclusivamente no modo clássico
  if (state.gameMode !== 'classic') return false;
  // If lives are depleted, match is finished — do not record as active in-flight save
  if (state.lives <= 0) return false;

  const id = (slotId !== undefined && slotId !== null) ? slotId : getActiveSlot();
  const payload = {
    slotId: id,
    version: 1,
    savedAt: Date.now(),
    isFinished: false,
    gameMode: state.gameMode || 'classic',
    difficulty: state.difficulty || 'normal',
    phase: state.phase || 1,
    phasePts: state.phasePts || 0,
    totalScore: state.totalScore || 0,
    speedMultiplier: (typeof state.speedMultiplier === 'number' && !isNaN(state.speedMultiplier))
      ? Number(state.speedMultiplier.toFixed(2))
      : 1.0,
    coins: getSharedCoins(), // Moedas são compartilhadas entre todos os slots (banco global)
    totalCoinsEarned: state.totalCoinsEarned || 0,
    lives: state.lives,
    maxLives: state.maxLives,
    flawlessStreak: state.flawlessStreak || 0,
    totalErrors: state.totalErrors || 0,
    totalHits: state.totalHits || 0,
    currentAccuracy: state.currentAccuracy || 0,
    maxCombo: state.maxCombo || 0,
    continues: state.continues || 0,
    trainingWorld: state.trainingWorld || 1,
    trainingLesson: state.trainingLesson || 1,
    saveLanguage: (typeof getLanguage === 'function') ? getLanguage() : 'en',
    unlockedWords: (state.unlockedWords || []).map(w => {
      const concept = (w.conceptIndex !== undefined && w.conceptIndex !== null && w.conceptIndex >= 0)
        ? { index: w.conceptIndex, category: w.conceptCategory || 'normal', bossType: w.bossType }
        : (typeof findWordConcept === 'function' ? findWordConcept(w.text) : null);
      return {
        text: w.text,
        meaning: w.meaning || '',
        category: w.category || '',
        phase: w.phase || 1,
        conceptIndex: concept ? concept.index : undefined,
        conceptCategory: concept ? concept.category : 'normal',
        bossType: concept ? concept.bossType : undefined
      };
    }),
    wordStats: state.wordStats ? { ...state.wordStats } : {},
    skillSlots: (state.skillSlots || []).map(s => ({ id: s.id, count: s.count })),
    defeatedBossTypes: Array.isArray(state.defeatedBossTypes) ? [...state.defeatedBossTypes] : [],
    charsTyped: state.charsTyped || 0
  };

  try {
    localStorage.setItem(`digithin_galaxy_save_slot_${id}`, JSON.stringify(payload));
    setActiveSlot(id);
    return true;
  } catch (err) {
    console.warn('[DigithinGalaxy] Error saving progress in slot', id, err);
    return false;
  }
}

function deleteSaveSlot(slotId) {
  const id = (slotId !== undefined && slotId !== null) ? slotId : getActiveSlot();
  try {
    localStorage.removeItem(`digithin_galaxy_save_slot_${id}`);
    return true;
  } catch (_) {
    return false;
  }
}

function clearActiveSlotRun() {
  const id = getActiveSlot();
  deleteSaveSlot(id);
}

function loadSaveDataIntoState(save) {
  if (!save || !save.phase) return false;
  state = defaultState();
  state.gameMode = save.gameMode || 'classic';
  state.difficulty = save.difficulty || 'normal';
  state.phase = save.phase || 1;
  state.phasePts = save.phasePts || 0;
  state.totalScore = save.totalScore || 0;
  // Moedas compartilhadas: o saldo vem sempre do banco global, nunca do slot
  state.coins = getSharedCoins();
  state.totalCoinsEarned = save.totalCoinsEarned || 0;
  state.lives = (save.lives !== undefined) ? save.lives : 3;
  state.maxLives = save.maxLives || 3;
  state.flawlessStreak = save.flawlessStreak || 0;
  state.totalErrors = save.totalErrors || 0;
  state.totalHits = save.totalHits || 0;
  state.currentAccuracy = save.currentAccuracy || 0;
  state.maxCombo = save.maxCombo || 0;
  state.continues = save.continues || 0;
  state.trainingWorld = save.trainingWorld || 1;
  state.trainingLesson = save.trainingLesson || 1;

  // Sincroniza e migra rigorosamente para o idioma ativo selecionado pelo jogador
  const curLang = typeof getLanguage === 'function' ? getLanguage() : 'en';
  state.language = curLang;

  if (Array.isArray(save.unlockedWords) && typeof migrateUnlockedWordsToActiveLanguage === 'function') {
    state.unlockedWords = migrateUnlockedWordsToActiveLanguage(save.unlockedWords, curLang);
  } else {
    state.unlockedWords = Array.isArray(save.unlockedWords) ? [...save.unlockedWords] : [];
  }

  if (save.wordStats && typeof migrateWordStatsToLanguage === 'function') {
    state.wordStats = migrateWordStatsToLanguage(save.wordStats, curLang);
  } else {
    state.wordStats = save.wordStats ? { ...save.wordStats } : {};
  }

  state.skillSlots = Array.isArray(save.skillSlots) ? [...save.skillSlots] : [];
  state.defeatedBossTypes = Array.isArray(save.defeatedBossTypes) ? [...save.defeatedBossTypes] : [];
  state.charsTyped = save.charsTyped || 0;
  state.startTime = Date.now();

  const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig(state.difficulty) : { initialSpeed: 1.0 };
  if (save.speedMultiplier !== undefined && save.speedMultiplier !== null && !isNaN(save.speedMultiplier)) {
    state.speedMultiplier = Number(save.speedMultiplier);
    state._resumedFromSave = true;
  } else {
    state.speedMultiplier = diffCfg.initialSpeed;
  }
  return true;
}

// Migração única: saldos antigos por slot -> banco global compartilhado (mantém o maior saldo existente)
(function migrateSlotCoinsToShared() {
  try {
    if (localStorage.getItem('digithin_galaxy_coins_unified') === '1') return;
    let best = getSharedCoins();
    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
      const raw = localStorage.getItem(`digithin_galaxy_save_slot_${i}`);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const c = Math.max(0, Math.floor(parsed?.coins || 0));
      if (c > best) best = c;
    }
    setSharedCoins(best);
    localStorage.setItem('digithin_galaxy_coins_unified', '1');
    if (state) state.coins = best;
  } catch (_) {}
})();
