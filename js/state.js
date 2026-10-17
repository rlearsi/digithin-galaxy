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

function getRequiredXpForLevel(lvl) {
  const l = Math.max(1, parseInt(lvl, 10) || 1);
  return Math.round(35 + Math.pow(l, 1.55) * 15);
}

function defaultState() {
  const diffKey = getDifficulty();
  const diffCfg = getDifficultyConfig(diffKey);
  const sharedCoins = (typeof getSharedCoins === 'function') ? getSharedCoins() : 0;
  const permWords = (typeof getPermanentUnlockedWords === 'function') ? getPermanentUnlockedWords() : [];
  const permStats = (typeof getPermanentWordStats === 'function') ? getPermanentWordStats() : {};

  // Initial unlocked words fallback: se estiver vazio, carrega palavras da dificuldade
  let initialWords = [...permWords];
  if (initialWords.length === 0 && typeof WORD_POOL !== 'undefined' && WORD_POOL.length > 0) {
    const basePool = (typeof getWordPoolForDifficulty === 'function')
      ? getWordPoolForDifficulty(WORD_POOL, diffKey)
      : WORD_POOL;
    initialWords = basePool.slice(0, 10);
    if (typeof savePermanentUnlockedWords === 'function') {
      savePermanentUnlockedWords(initialWords);
    }
  }

  return {
    difficulty:        diffKey,
    phase:             1,
    level:             1,
    currentXp:         0,
    xpRequired:        getRequiredXpForLevel(1),
    runPerks:          {},      // { [skillId]: level } - Roguelike perks for this run
    skillQueue:        [],      // FIFO queue when multiple periodic skills trigger
    activeSkill:       null,    // Current periodic skill running its active effect
    skillCooldowns:    {},      // { [skillId]: msRemaining }
    levelUpChoices:    [],
    selectedLevelUpIndex: 0,
    onPickLevelUp:     null,
    phasePts:          0,       // Points accumulated in the current run
    totalScore:        0,       // Banked points (run score)
    coins:             sharedCoins, // Player starts with shared coins bank across matches
    totalCoinsEarned:  0,       // Total coins accumulated across this run
    flawlessStreak:    0,
    errorsPhase:       0,
    totalErrors:       0,
    lives:             diffCfg.startLives,
    maxLives:          diffCfg.startLives,
    progress:          0,
    wordsDestroyedForCoin: 0,
    totalWordsCompletedMatch: 0,
    spawnedItemsCount: 0,       // Contador de itens gerados na corrida para progressão letra->sílaba->palavra
    initialLettersTarget: Math.floor(Math.random() * 5) + 8, // 8 a 12 letras antes de intercalar sílabas
    hitsPhase:         0,
    totalHits:         0,
    currentAccuracy:   0,
    speedMultiplier:   diffCfg.initialSpeed,
    speedAccum:        0,
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
    unlockedWords:     initialWords,
    wordStats:         { ...permStats },
    runWordsLearned:   new Set(), // Palavras completadas nesta run (utilizado para Palavra Nova vs Aprendida e Eco Cósmico)
    skillSlots:        [],
    activeTimers:      {},
    vortexAccum:       0,
    autodestroyAccum:  0,
    shopPurchaseCount: 0,
    currentShopPurchases: 0,
    selectedShopIndex: -1,
    currentShopItems:  [],
    selectedBossRewardIndex: 0,
    currentBossRewardSkills: [],
    onPickBossReward:        null,
    idCounter:         0,
    combo:             0,
    maxCombo:          0,
    maxComboPhase:     0,
    continues:         0,
    gameMode:          'classic',
    timeAttackSecs:    60,
    trainingWorld:     1,
    trainingLesson:    1,
    startTime:         null,
    charsTyped:        0,
    defeatedBossTypes: [],
    pendingBoss:       null,
    pendingBossPhase:  null,
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

// Sem batalhas de chefões na fase infinita
function isBossPhase() {
  return false;
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
// PERMANENT SKILLS ARSENAL (Purchased in Shop)
// ================================================
function getPermanentSkills() {
  try {
    const raw = localStorage.getItem('digithin_galaxy_permanent_skills');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function savePermanentSkills(skills) {
  try {
    const valid = Array.isArray(skills) ? skills.filter(s => s && s.id && s.count > 0) : [];
    localStorage.setItem('digithin_galaxy_permanent_skills', JSON.stringify(valid));
  } catch (_) {}
}

function addPermanentSkill(skillId, count = 1) {
  if (!skillId) return getPermanentSkills();
  const current = getPermanentSkills();
  const existing = current.find(s => s.id === skillId);
  if (existing) {
    existing.count = (existing.count || 0) + count;
  } else {
    current.push({ id: skillId, count });
  }
  savePermanentSkills(current);
  return current;
}

function deductPermanentSkill(skillId, count = 1) {
  if (!skillId) return getPermanentSkills();
  const current = getPermanentSkills();
  const existing = current.find(s => s.id === skillId);
  if (existing) {
    existing.count = Math.max(0, (existing.count || 0) - count);
    if (existing.count <= 0) {
      const idx = current.indexOf(existing);
      current.splice(idx, 1);
    }
    savePermanentSkills(current);
  }
  return current;
}

function getPermanentSkillCount(skillId) {
  const current = getPermanentSkills();
  const existing = current.find(s => s.id === skillId);
  return existing ? (existing.count || 0) : 0;
}

// ================================================
// PERMANENT VOCABULARY LIBRARY (Learned Words)
// ================================================
function getPermanentUnlockedWords() {
  try {
    const raw = localStorage.getItem('digithin_galaxy_unlocked_words');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function savePermanentUnlockedWords(words) {
  try {
    if (!Array.isArray(words)) return;
    localStorage.setItem('digithin_galaxy_unlocked_words', JSON.stringify(words));
  } catch (_) {}
}

function addPermanentUnlockedWord(wordObj) {
  if (!wordObj || !wordObj.text) return;
  const current = getPermanentUnlockedWords();
  const lower = wordObj.text.toLowerCase();
  if (!current.some(w => (w.text || '').toLowerCase() === lower)) {
    current.push(wordObj);
    savePermanentUnlockedWords(current);
  }
}

function getPermanentWordStats() {
  try {
    const raw = localStorage.getItem('digithin_galaxy_word_stats');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (_) {
    return {};
  }
}

function savePermanentWordStats(stats) {
  try {
    if (!stats || typeof stats !== 'object') return;
    localStorage.setItem('digithin_galaxy_word_stats', JSON.stringify(stats));
  } catch (_) {}
}

// ================================================
// ARCADE DIRECT START (Slots removed)
// ================================================
const MAX_SAVE_SLOTS = 3;

function getActiveSlot() {
  return 1;
}

function setActiveSlot() {
  return 1;
}

function getSaveSlot() {
  return null;
}

function hasActiveSave() {
  // Roguelike arcade: sem salvamento no meio da partida. Jogador entra direto!
  return false;
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

function saveGameProgress() {
  if (!state) return false;
  if (state.coins !== undefined) {
    setSharedCoins(state.coins);
  }
  if (Array.isArray(state.unlockedWords)) {
    savePermanentUnlockedWords(state.unlockedWords);
  }
  if (state.wordStats) {
    savePermanentWordStats(state.wordStats);
  }
  return true;
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
  state.runWordsLearned = new Set(Array.isArray(save.runWordsLearned) ? save.runWordsLearned : []);
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

function isWordNewInRun(wordText) {
  if (!state || state.gameMode === 'training') return false;
  if (!wordText) return false;
  const key = String(wordText).trim().toLowerCase();
  if (!state.runWordsLearned) state.runWordsLearned = new Set();
  return !state.runWordsLearned.has(key);
}

if (typeof window !== 'undefined') {
  window.isWordNewInRun = isWordNewInRun;
}
