/* ================================================
   DIGITHIN GALAXY — js/data.js
   Game configuration, pools, and definitions
   ================================================ */
'use strict';

const CFG = {
  baseSpeed: 52,
  speedBonusLetter: 0,      // Não aumenta mais ao acertar letra/item
  speedBonusSyl: 0,         // Não aumenta mais ao acertar sílaba
  speedBonusWord: 0,        // Não aumenta mais ao acertar palavra
  speedTimerInterval: 5.0,  // Intervalo em segundos para aumento progressivo
  speedTimerIncrement: 0.01,// Aumento de +0.01x a cada 5 segundos
  speedMaxIncrease: 2.0,    // Limite máximo de aumento (+2.0x sobre a velocidade inicial)
  speedErrorPenalty: 0,     // Não aumenta mais ao errar
  maxSpeedMult: 4.0,
  spawnBase: 2100,
  spawnMin: 500,
  spawnVariance: 650,
  freezerMaxItems: 3, // Limite máximo de rúnicos simultâneos na tela com Freezer ativo
  hasteSpeedBonus: 0.5, // Aumento relativo (+0.5) de velocidade com a habilidade Pontos em Dobro
  padX: 14,
  progressPenalty: 1,
  startLives: 3,
  wordsPerPhase: 3,
  wordSkillChance: 0.06,  // Rare on words — primary source is the shop
  wildcardChance: 0.04,  // Chance of spawning a wildcard word
  shopEvery: 3,     // Shop appears every N completed phases
  shopPriceFactor: 1.45,  // Exponential price escalation
  shopRerollPrice: 25,    // Preço por reroll de ofertas na loja
  wordsPerCoinFarm: 10,   // A cada 10 palavras completadas ganha +1 moeda farmada
  queueSize: 6,     // Items previewed in the bottom queue
  phaseBaseCoins: 5,        // Moedas base ao concluir uma fase
  phaseCoinIncrement: 1,    // Acréscimo de +1 moeda a cada nova fase concluída
  phaseMaxCoins: 50,        // Teto máximo de moedas por fase concluída (atingido na fase 50)
  perfectAccuracyCoins: 35, // Bônus de 100% de precisão (0 erros)
};

// ================================================
// DIFFICULTY PRESETS & CONFIGURATION
// ================================================
const DIFFICULTY_CONFIG = {
  easy: {
    id: 'easy',
    name: 'easy',
    initialSpeed: 0.5,
    speedErrorPenalty: 0,
    progressErrorPenalty: 0,
    startLives: 5,
  },
  normal: {
    id: 'normal',
    name: 'normal',
    initialSpeed: 1.0,
    speedErrorPenalty: 0,
    progressErrorPenalty: 1,
    startLives: 3,
  },
  hard: {
    id: 'hard',
    name: 'hard',
    initialSpeed: 1.5,
    speedErrorPenalty: 0,
    progressErrorPenalty: 1,
    startLives: 3,
  },
};

// Limites e filtros de tamanho de palavras por dificuldade
function getMaxWordLengthForDifficulty(difficulty) {
  const diff = difficulty || (typeof state !== 'undefined' && state.difficulty) || 'normal';
  if (diff === 'easy') return 4;   // Fácil: palavras de no máximo 4 letras
  if (diff === 'normal') return 6; // Normal: palavras de até 6 letras
  return Infinity;                 // Difícil: sem limite de tamanho (palavras complexas e longas)
}

function getWordPoolForDifficulty(pool, difficulty) {
  const p = pool || (typeof WORD_POOL !== 'undefined' ? WORD_POOL : []);
  const maxLen = getMaxWordLengthForDifficulty(difficulty);
  if (!isFinite(maxLen)) return p;
  return p.filter(w => (w.text || '').length <= maxLen);
}

// Phase goal: Phase 1 = 10, Phase 2 = 20, Phase 3 = 30, Phase 4 = 40, Phase 5 = 50, Phase 6 = 60... (+10 per phase)
function calcPhaseGoal(phase) {
  const p = Math.max(1, parseInt(phase, 10) || 1);
  return p * 10;
}

// Phase completion coins: Base 5 + 1 per completed phase, capped at 50 coins (Fase 1 = 6, Fase 2 = 7, Fase 3 = 8 ... máx 50 na Fase 50)
function calcPhaseCompletionCoins(phase) {
  const p = Math.max(1, parseInt(phase, 10) || 1);
  const base = (typeof CFG !== 'undefined' && CFG.phaseBaseCoins !== undefined) ? CFG.phaseBaseCoins : 5;
  const inc = (typeof CFG !== 'undefined' && CFG.phaseCoinIncrement !== undefined) ? CFG.phaseCoinIncrement : 1;
  const max = (typeof CFG !== 'undefined' && CFG.phaseMaxCoins !== undefined) ? CFG.phaseMaxCoins : 50;
  return Math.min(max, base + (p * inc));
}

// ================================================
// MULTI-LANGUAGE DATA AGGREGATION
// Modularly loaded from locales/{lang}.json by js/i18n.js
// ================================================
const SYLLABLE_POOLS = {};
const WORD_POOLS = {};
// Central Single Source of Truth for Boss Thematic Vocabulary partitions (15 indices each referencing WORD_POOLS)
const BOSS_THEMATIC_INDICES = {
  alien_dreadnought: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 23, 24, 25, 26, 27],
  alien_hive:        [2, 14, 15, 23, 24, 25, 26, 27, 28, 29, 30, 31, 68, 70, 44],
  alien_psionic:     [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 64, 65, 48],
  alien_warlord:     [39, 40, 41, 42, 43, 44, 45, 46, 47, 62, 63, 66, 67, 72, 74],
  alien_darkmatter:  [52, 53, 54, 58, 59, 60, 61, 50, 51, 23, 27, 28, 64, 65, 68],
  alien_mothership:  [45, 46, 47, 69, 71, 72, 73, 74, 32, 33, 34, 35, 36, 37, 38],
  robot:             [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 71, 73],
  beast:             [2, 23, 24, 25, 26, 27, 28, 29, 30, 31, 68, 70, 13, 14, 15],
  mythology:         [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17],
  volcano:           [6, 17, 25, 26, 27, 28, 29, 58, 59, 65, 2, 23, 30, 31, 68],
  ocean:             [5, 13, 16, 18, 21, 22, 10, 24, 28, 32, 33, 43, 47, 74, 1],
  cosmos:            [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 60, 61, 64, 65, 0]
};

const BOSS_WORDS_BY_TYPE = {
  alien_dreadnought: {},
  alien_hive: {},
  alien_psionic: {},
  alien_warlord: {},
  alien_darkmatter: {},
  alien_mothership: {},
  robot: {},
  beast: {},
  mythology: {},
  ocean: {},
  cosmos: {},
  volcano: {}
};
const TRAINING_WORLDS_DATA = {};

function initGameLanguageData() {
  const wordsObj = (typeof window !== 'undefined' && window.GAME_DATA_WORDS) ? window.GAME_DATA_WORDS : {};
  const supported = (typeof SUPPORTED_LANGUAGES !== 'undefined') ? SUPPORTED_LANGUAGES : ['en', 'pt', 'fr', 'de', 'ja', 'ko', 'zh'];

  supported.forEach(lang => {
    const data = wordsObj[lang] || {};
    if (data.syllables) {
      SYLLABLE_POOLS[lang] = data.syllables;
    } else if (wordsObj.en && wordsObj.en.syllables) {
      SYLLABLE_POOLS[lang] = wordsObj.en.syllables;
    }

    if (data.words) {
      WORD_POOLS[lang] = data.words;
    } else if (wordsObj.en && wordsObj.en.words) {
      WORD_POOLS[lang] = wordsObj.en.words;
    }

    // Resolve boss words (indices referencing WORD_POOLS, asset strings, or legacy objects)
    const pool = WORD_POOLS[lang] || (wordsObj.en && wordsObj.en.words) || [];
    const bossMap = (data.bossWords && Object.keys(data.bossWords).length > 0) ? data.bossWords : BOSS_THEMATIC_INDICES;

    if (bossMap && typeof bossMap === 'object') {
      Object.keys(bossMap).forEach(type => {
        if (!BOSS_WORDS_BY_TYPE[type]) BOSS_WORDS_BY_TYPE[type] = {};
        const entries = bossMap[type];
        if (Array.isArray(entries)) {
          BOSS_WORDS_BY_TYPE[type][lang] = entries.map(item => {
            if (typeof item === 'number') {
              return pool[item] || null;
            }
            if (typeof item === 'string') {
              const lower = item.toLowerCase();
              return pool.find(w => (w.asset && w.asset.toLowerCase() === lower) || (w.text && w.text.toLowerCase() === lower)) || null;
            }
            return item; // Legacy object format { text, meaning, type, asset }
          }).filter(Boolean);
        } else {
          BOSS_WORDS_BY_TYPE[type][lang] = [];
        }
      });
    }

    // Synchronize window.GAME_DATA_WORDS[lang].bossWords with the resolved objects for complete parity
    if (wordsObj[lang]) {
      if (!wordsObj[lang].bossWords || typeof wordsObj[lang].bossWords !== 'object') {
        wordsObj[lang].bossWords = {};
      }
      Object.keys(BOSS_WORDS_BY_TYPE).forEach(type => {
        wordsObj[lang].bossWords[type] = BOSS_WORDS_BY_TYPE[type][lang] || [];
      });
    }

    if (data.trainingWorlds) {
      TRAINING_WORLDS_DATA[lang] = data.trainingWorlds;
    }
  });

  // Ensure default fallback for training worlds
  if (!TRAINING_WORLDS_DATA.en && wordsObj.en && wordsObj.en.trainingWorlds) {
    TRAINING_WORLDS_DATA.en = wordsObj.en.trainingWorlds;
  }
}
initGameLanguageData();

// Initial setup from active language
const initLang = (typeof getLanguage === 'function') ? getLanguage() : 'en';
let WORD_POOL = WORD_POOLS[initLang] || WORD_POOLS.en || [];
let ALL_SYLLABLES = SYLLABLE_POOLS[initLang] || SYLLABLE_POOLS.en || [];

function getTrainingWorlds(lang) {
  const curLang = lang || ((typeof getLanguage === 'function') ? getLanguage() : 'en');
  const d = TRAINING_WORLDS_DATA[curLang];
  if (d && !Array.isArray(d) && Object.keys(d).length > 0) return d;
  return TRAINING_WORLDS_DATA.en || {};
}

let TRAINING_WORLDS = getTrainingWorlds(initLang);

function updateWordPoolLanguage(lang) {
  if (typeof window !== 'undefined' && window.GAME_DATA_WORDS && window.GAME_DATA_WORDS[lang]) {
    initGameLanguageData();
  }
  WORD_POOL = WORD_POOLS[lang] || WORD_POOLS.en || [];
  ALL_SYLLABLES = SYLLABLE_POOLS[lang] || SYLLABLE_POOLS.en || [];
  TRAINING_WORLDS = getTrainingWorlds(lang);
}

// ================================================
// MULTI-LANGUAGE VOCABULARY MIGRATION & RECOVERY
// Enables seamless word switching when changing language or resuming saves
// ================================================

/**
 * Finds the canonical concept index of any word across ALL supported languages.
 * Returns { category: 'normal' | 'boss', index: number, bossType?: string } or null.
 */
function findWordConcept(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.trim().toLowerCase();

  // 1. Check active & all registered WORD_POOLS
  if (typeof WORD_POOLS !== 'undefined') {
    for (const lang in WORD_POOLS) {
      const pool = WORD_POOLS[lang];
      if (Array.isArray(pool)) {
        const idx = pool.findIndex(w => w && w.text && w.text.toLowerCase() === lower);
        if (idx !== -1) {
          return { category: 'normal', index: idx };
        }
      }
    }
  }

  // 2. Check window.GAME_DATA_WORDS fallback in case WORD_POOLS was not yet populated
  if (typeof window !== 'undefined' && window.GAME_DATA_WORDS) {
    for (const lang in window.GAME_DATA_WORDS) {
      const words = window.GAME_DATA_WORDS[lang]?.words;
      if (Array.isArray(words)) {
        const idx = words.findIndex(w => w && w.text && w.text.toLowerCase() === lower);
        if (idx !== -1) {
          return { category: 'normal', index: idx };
        }
      }
    }
  }

  // 3. Check thematic boss vocabulary across all boss archetypes and languages
  const bossTypes = (typeof BOSS_WORDS_BY_TYPE !== 'undefined') ? Object.keys(BOSS_WORDS_BY_TYPE) : [];
  if (typeof BOSS_WORDS_BY_TYPE !== 'undefined') {
    for (const bType of bossTypes) {
      const dict = BOSS_WORDS_BY_TYPE[bType];
      if (dict) {
        for (const lang in dict) {
          const list = dict[lang];
          if (Array.isArray(list)) {
            const idx = list.findIndex(w => w && w.text && w.text.toLowerCase() === lower);
            if (idx !== -1) {
              return { category: 'boss', index: idx, bossType: bType };
            }
          }
        }
      }
    }
  }

  return null;
}

/**
 * Retrieves the localized word object for a concept in the requested target language.
 */
function getWordForLanguage(concept, targetLang) {
  if (!concept) return null;
  const lang = targetLang || (typeof getLanguage === 'function' ? getLanguage() : 'en');
  const fallbackLang = 'en';

  if (concept.category === 'normal') {
    const pool = (typeof WORD_POOLS !== 'undefined' && WORD_POOLS[lang])
      ? WORD_POOLS[lang]
      : ((typeof window !== 'undefined' && window.GAME_DATA_WORDS?.[lang]?.words) || WORD_POOLS?.[fallbackLang] || []);
    return pool[concept.index] || null;
  }

  if (concept.category === 'boss' && concept.bossType) {
    const bossPool = (typeof BOSS_WORDS_BY_TYPE !== 'undefined' && BOSS_WORDS_BY_TYPE[concept.bossType]?.[lang])
      ? BOSS_WORDS_BY_TYPE[concept.bossType][lang]
      : (typeof BOSS_WORDS_BY_TYPE !== 'undefined' && BOSS_WORDS_BY_TYPE[concept.bossType]?.[fallbackLang]) || [];
    return bossPool[concept.index] || null;
  }

  return null;
}

/**
 * Migrates a single word object to the target language while strictly preserving game progression (phase, etc.).
 */
function migrateWordToLanguage(wordObj, targetLang) {
  if (!wordObj || !wordObj.text) return wordObj;
  const lang = targetLang || (typeof getLanguage === 'function' ? getLanguage() : 'en');

  let concept = null;
  if (wordObj.conceptIndex !== undefined && wordObj.conceptIndex !== null && wordObj.conceptIndex >= 0) {
    concept = {
      category: wordObj.conceptCategory || 'normal',
      index: wordObj.conceptIndex,
      bossType: wordObj.bossType
    };
  } else {
    concept = findWordConcept(wordObj.text);
  }

  if (!concept) {
    return wordObj;
  }

  const localized = getWordForLanguage(concept, lang);
  if (!localized || !localized.text) {
    return wordObj;
  }

  return {
    ...wordObj,
    text: localized.text,
    meaning: localized.meaning || wordObj.meaning || '',
    type: localized.type || wordObj.type || '',
    category: localized.type || wordObj.category || '',
    phase: wordObj.phase || 1,
    conceptIndex: concept.index,
    conceptCategory: concept.category,
    bossType: concept.bossType
  };
}

/**
 * Migrates an entire array of unlocked words into the target language without loss or duplication.
 */
function migrateUnlockedWordsToActiveLanguage(unlockedWordsList, targetLang) {
  if (!Array.isArray(unlockedWordsList)) return [];
  const lang = targetLang || (typeof getLanguage === 'function' ? getLanguage() : 'en');

  const seenTexts = new Set();
  const migratedList = [];

  for (const w of unlockedWordsList) {
    if (!w) continue;
    const migrated = migrateWordToLanguage(w, lang);
    const key = (migrated.text || '').toLowerCase();
    if (!seenTexts.has(key)) {
      seenTexts.add(key);
      migratedList.push(migrated);
    }
  }

  return migratedList;
}

/**
 * Migrates wordStats dictionary keys to match target language vocabulary.
 */
function migrateWordStatsToLanguage(statsObj, targetLang) {
  if (!statsObj || typeof statsObj !== 'object') return {};
  const lang = targetLang || (typeof getLanguage === 'function' ? getLanguage() : 'en');
  const migrated = {};

  for (const key in statsObj) {
    const concept = findWordConcept(key);
    if (concept) {
      const loc = getWordForLanguage(concept, lang);
      const newKey = loc && loc.text ? loc.text.toLowerCase() : key;
      migrated[newKey] = statsObj[key];
    } else {
      migrated[key] = statsObj[key];
    }
  }

  return migrated;
}

// ================================================
// BOSS SYSTEM: SCENARIOS, UNIQUE TYPES & THEMATIC ENIGMAS
// ================================================
// 6 authentic boss archetypes appearing randomly at phase multiples of 10:
// - robot:     Cybernetic Metropolis (Technological & Cybernetic meanings)
// - beast:     Primordial Savanna (Fauna, Apex Predators & Pack meanings)
// - mythology: Mystic Pantheon & Delphi (Mythology, Gods & Legendary beings)
// - ocean:     Pelagic Trench & Deep Abyss (Marine biology & Ocean depths)
// - cosmos:    Stellar Nebula & Cosmic Void (Astrophysics, Stars & Gravity)
// - volcano:   Volcanic Caldera & Igneous Core (Magma, Lava & Geology)

const BossPrototype = {
  get name() {
    const base = (typeof t === 'function' && this.nameKey) ? t(this.nameKey) : '';
    if (this.level && this.level > 1 && typeof t === 'function') {
      const tag = t('boss_level_tag', { level: this.level });
      return `${base}${tag}`;
    }
    return base;
  },
  get namePt() { return this.name; },
  get title() { return (typeof t === 'function' && this.titleKey) ? t(this.titleKey) : ''; },
  get titlePt() { return this.title; },
  get scenario() { return (typeof t === 'function' && this.scenarioKey) ? t(this.scenarioKey) : ''; },
  get scenarioPt() { return this.scenario; },
  get scenarioDesc() { return (typeof t === 'function' && this.scenarioDescKey) ? t(this.scenarioDescKey) : ''; },
  get scenarioDescPt() { return this.scenarioDesc; },
  get badgeText() { return (typeof t === 'function' && this.badgeKey) ? t(this.badgeKey) : ''; },
  get badgeTextPt() { return this.badgeText; },
  get lore() { return (typeof t === 'function' && this.loreKey) ? t(this.loreKey) : ''; },
  get lorePt() { return this.lore; }
};

const BOSS_DEFS = [
  {
    id: 'alien_xylarion',
    type: 'alien_dreadnought',
    icon: '🛸',
    image: 'assets/bosses/alien_xylarion.webp',
    color: '#06B6D4',
    lives: 3,
    maxLives: 3,
    nameKey: 'boss_alien_xylarion_name',
    titleKey: 'boss_alien_xylarion_title',
    scenarioKey: 'boss_alien_xylarion_scenario',
    scenarioDescKey: 'boss_alien_xylarion_scenario_desc',
    badgeKey: 'boss_alien_xylarion_badge',
    loreKey: 'boss_alien_xylarion_lore'
  },
  {
    id: 'alien_zorkon',
    type: 'alien_hive',
    icon: '🦎',
    species: 'reptilian_lizard',
    image: 'assets/bosses/alien_zorkon.webp',
    color: '#10B981',
    lives: 3,
    maxLives: 3,
    nameKey: 'boss_alien_zorkon_name',
    titleKey: 'boss_alien_zorkon_title',
    scenarioKey: 'boss_alien_zorkon_scenario',
    scenarioDescKey: 'boss_alien_zorkon_scenario_desc',
    badgeKey: 'boss_alien_zorkon_badge',
    loreKey: 'boss_alien_zorkon_lore'
  },
  {
    id: 'alien_vespera',
    type: 'alien_psionic',
    icon: '🔮',
    image: 'assets/bosses/alien_vespera.webp',
    color: '#A855F7',
    lives: 3,
    maxLives: 3,
    nameKey: 'boss_alien_vespera_name',
    titleKey: 'boss_alien_vespera_title',
    scenarioKey: 'boss_alien_vespera_scenario',
    scenarioDescKey: 'boss_alien_vespera_scenario_desc',
    badgeKey: 'boss_alien_vespera_badge',
    loreKey: 'boss_alien_vespera_lore'
  },
  {
    id: 'alien_kragthor',
    type: 'alien_warlord',
    icon: '⚔️',
    image: 'assets/bosses/alien_kragthor.webp',
    color: '#EF4444',
    lives: 3,
    maxLives: 3,
    nameKey: 'boss_alien_kragthor_name',
    titleKey: 'boss_alien_kragthor_title',
    scenarioKey: 'boss_alien_kragthor_scenario',
    scenarioDescKey: 'boss_alien_kragthor_scenario_desc',
    badgeKey: 'boss_alien_kragthor_badge',
    loreKey: 'boss_alien_kragthor_lore'
  },
  {
    id: 'alien_nebulor',
    type: 'alien_darkmatter',
    icon: '🌌',
    image: 'assets/bosses/alien_nebulor.webp',
    color: '#6366F1',
    lives: 3,
    maxLives: 3,
    nameKey: 'boss_alien_nebulor_name',
    titleKey: 'boss_alien_nebulor_title',
    scenarioKey: 'boss_alien_nebulor_scenario',
    scenarioDescKey: 'boss_alien_nebulor_scenario_desc',
    badgeKey: 'boss_alien_nebulor_badge',
    loreKey: 'boss_alien_nebulor_lore'
  },
  {
    id: 'alien_xenor',
    type: 'alien_mothership',
    icon: '👑',
    image: 'assets/bosses/alien_xenor.webp',
    color: '#F59E0B',
    lives: 3,
    maxLives: 3,
    nameKey: 'boss_alien_xenor_name',
    titleKey: 'boss_alien_xenor_title',
    scenarioKey: 'boss_alien_xenor_scenario',
    scenarioDescKey: 'boss_alien_xenor_scenario_desc',
    badgeKey: 'boss_alien_xenor_badge',
    loreKey: 'boss_alien_xenor_lore'
  }
];

BOSS_DEFS.forEach(b => Object.setPrototypeOf(b, BossPrototype));

function createBossInstance(base, level = 1) {
  const boss = Object.create(base);
  boss.level = level;
  boss.lives = 3;
  boss.maxLives = 3;
  return boss;
}

function getRandomBoss(level = 1, excludeTypes = []) {
  let pool = BOSS_DEFS;
  if (Array.isArray(excludeTypes) && excludeTypes.length > 0 && excludeTypes.length < BOSS_DEFS.length) {
    const filtered = BOSS_DEFS.filter(b => !excludeTypes.includes(b.type));
    if (filtered.length > 0) pool = filtered;
  }
  const base = pool[Math.floor(Math.random() * pool.length)];
  return createBossInstance(base, level);
}

function getBossByType(bossType, level = 1) {
  const base = BOSS_DEFS.find(b => b.type === bossType || b.id === bossType) || BOSS_DEFS[0];
  return createBossInstance(base, level);
}

// ------------------------------------------------
// DETERMINISTIC BOSS SCHEDULE
// An Alien Boss appears every BOSS_PHASE_INTERVAL phases (8, 16, 24, ...) following a fixed fleet invasion order.
// ------------------------------------------------
const BOSS_PHASE_INTERVAL = 8;
const BOSS_WORDS_PER_CYCLE = 3;
const BOSS_ORDER = ['alien_dreadnought', 'alien_hive', 'alien_psionic', 'alien_warlord', 'alien_darkmatter', 'alien_mothership'];

// 1-based cycle number of a phase (phases 1-8 = cycle 1, 9-16 = cycle 2, ...)
function getBossCycleNumber(phase) {
  const p = Math.max(1, parseInt(phase, 10) || 1);
  return Math.ceil(p / BOSS_PHASE_INTERVAL);
}

// Boss phase that closes the cycle containing the given phase (>= phase)
function getBossCyclePhase(phase) {
  return getBossCycleNumber(phase) * BOSS_PHASE_INTERVAL;
}

function getBossTypeForPhase(phase) {
  const cycle = getBossCycleNumber(phase);
  return BOSS_ORDER[(cycle - 1) % BOSS_ORDER.length];
}

function createBossForPhase(phase) {
  const cycle = getBossCycleNumber(phase);
  // Level goes up each time the full roster has been completed
  const level = Math.floor((cycle - 1) / BOSS_ORDER.length) + 1;
  return getBossByType(getBossTypeForPhase(phase), level);
}

function getBossForPhase(phase) {
  const p = parseInt(phase, 10) || BOSS_PHASE_INTERVAL;

  // If active game state has a pending boss already chosen for this phase, preserve it
  if (typeof state !== 'undefined' && state && state.pendingBoss && state.pendingBossPhase === p) {
    return state.pendingBoss;
  }
  return createBossForPhase(p);
}

// ================================================
// THEMATIC VOCABULARY & ENIGMA MEANINGS BY BOSS TYPE
// ================================================
function getThemedWordsForBoss(bossType, lang = 'en') {
  const typeWords = BOSS_WORDS_BY_TYPE[bossType] || BOSS_WORDS_BY_TYPE.robot;
  const langWords = typeWords[lang] || typeWords.en || typeWords.pt;
  return langWords || [];
}

// Wildcard words — destroy all items on screen when typed
const WILDCARD_WORDS = ['BOOM', 'BANG', 'NOVA', 'WARP', 'CHAOS'];

// ================================================
// CENTRAL SOURCE OF TRUTH: SKILLS & SHOP ITEMS
// ================================================

// 1. ACTIVATABLE RUNIC SKILLS (8 total — bound to keys 1–8)
// Names and descriptions live in locale files: skill_name_{id} / skill_desc_{id}
// Activation/expiry messages live in locale files: fb_{id}_activated / fb_{id}_expired
const SKILLS_CONFIG = {
  freezer: {
    id: 'freezer',
    icon: '❄️',
    image: 'assets/skills/freezer.webp',
    nameKey: 'skill_name_freezer',
    descKey: 'skill_desc_freezer',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() {
      const lvl = (typeof state !== 'undefined' && state?.runPerks?.freezer) ? state.runPerks.freezer : 1;
      const dur = [5, 10, 15, 20, 25][Math.min(5, Math.max(1, lvl)) - 1];
      return (typeof t === 'function') ? t(this.descKey, { duration: dur, level: lvl, max: 5 }) : '';
    },
    duration: 5000,
    durationByLevel: [5000, 10000, 15000, 20000, 25000],
    interval: 120000, // 2 minutes
    maxLevel: 5,
    color: '#06B6D4',
    type: 'periodic',
    category: 'skill',
    onActivate: (st) => {
      st.activeItems.forEach(i => i.el?.classList.add('frozen'));
    },
    onExpire: (st) => {
      st.activeItems.forEach(i => i.el?.classList.remove('frozen'));
    }
  },
  bomb: {
    id: 'bomb',
    icon: '💣',
    image: 'assets/skills/bomb.webp',
    nameKey: 'skill_name_bomb',
    descKey: 'skill_desc_bomb',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() {
      const lvl = (typeof state !== 'undefined' && state?.runPerks?.bomb) ? state.runPerks.bomb : 1;
      return (typeof t === 'function') ? t(this.descKey, { level: lvl, max: 5 }) : '';
    },
    duration: 2500,
    interval: 90000, // 1.5 minutes
    maxLevel: 5,
    color: '#FF4757',
    type: 'periodic',
    category: 'skill',
    onActivate: () => {
      if (typeof triggerScreenBombExplosion === 'function') {
        triggerScreenBombExplosion();
      }
    },
    onExpire: () => {}
  },
  shield: {
    id: 'shield',
    icon: '🛡️',
    image: 'assets/skills/shield.webp',
    nameKey: 'skill_name_shield',
    descKey: 'skill_desc_shield',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() {
      const lvl = (typeof state !== 'undefined' && state?.runPerks?.shield) ? state.runPerks.shield : 1;
      const dur = [10, 20, 30, 40, 50][Math.min(5, Math.max(1, lvl)) - 1];
      return (typeof t === 'function') ? t(this.descKey, { duration: dur, level: lvl, max: 5 }) : '';
    },
    duration: 10000,
    durationByLevel: [10000, 20000, 30000, 40000, 50000],
    interval: 180000, // 3 minutes
    maxLevel: 5,
    color: '#A855F7',
    type: 'periodic',
    category: 'skill',
    onActivate: () => {
      const shield = document.getElementById('earth-shield-barrier');
      if (shield) shield.classList.add('immunity-active');
    },
    onExpire: () => {
      const shield = document.getElementById('earth-shield-barrier');
      if (shield) shield.classList.remove('immunity-active');
    }
  },
  vortex: {
    id: 'vortex',
    icon: '🌀',
    image: 'assets/skills/vortex.webp',
    nameKey: 'skill_name_vortex',
    descKey: 'skill_desc_vortex',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : ''; },
    duration: 2500,
    interval: 60000, // 1 minute (conforme documentação)
    maxLevel: 1,
    color: '#8B5CF6',
    type: 'periodic',
    category: 'skill',
    onActivate: () => {
      if (typeof triggerVortexScreenSuck === 'function') {
        triggerVortexScreenSuck();
      }
    },
    onExpire: () => {}
  },
  slowdown: {
    id: 'slowdown',
    icon: '⏱️',
    image: 'assets/skills/slowdown.webp',
    nameKey: 'skill_name_slowdown',
    descKey: 'skill_desc_slowdown',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() {
      const lvl = (typeof state !== 'undefined' && state?.runPerks?.slowdown) ? state.runPerks.slowdown : 1;
      const dur = [5, 10, 15, 20, 25][Math.min(5, Math.max(1, lvl)) - 1];
      return (typeof t === 'function') ? t(this.descKey, { duration: dur, level: lvl, max: 5 }) : '';
    },
    duration: 5000,
    durationByLevel: [5000, 10000, 15000, 20000, 25000],
    interval: 60000, // 1 minute
    maxLevel: 5,
    color: '#3B82F6',
    type: 'periodic',
    category: 'skill',
    onActivate: () => {
      const ring = typeof slowRing !== 'undefined' ? slowRing : document.getElementById('slow-ring');
      ring?.classList.add('active');
    },
    onExpire: () => {
      const ring = typeof slowRing !== 'undefined' ? slowRing : document.getElementById('slow-ring');
      ring?.classList.remove('active');
    }
  },
  haste: {
    id: 'haste',
    icon: '⚡',
    image: 'assets/skills/haste.webp',
    nameKey: 'skill_name_haste',
    descKey: 'skill_desc_haste',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() {
      const lvl = (typeof state !== 'undefined' && state?.runPerks?.haste) ? state.runPerks.haste : 1;
      const dur = [10, 20, 30, 45, 60][Math.min(5, Math.max(1, lvl)) - 1];
      return (typeof t === 'function') ? t(this.descKey, { duration: dur, level: lvl, max: 5 }) : '';
    },
    duration: 10000,
    durationByLevel: [10000, 20000, 30000, 45000, 60000],
    interval: 300000, // 5 minutes (conforme documentação)
    maxLevel: 5,
    speedBonus: 0,
    color: '#FF9F1A',
    type: 'periodic',
    category: 'skill',
    onActivate: () => {},
    onExpire: () => {}
  },
  dilation: {
    id: 'dilation',
    icon: '🌌',
    image: 'assets/skills/dilation.webp',
    nameKey: 'skill_name_dilation',
    descKey: 'skill_desc_dilation',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() {
      const lvl = (typeof state !== 'undefined' && state?.runPerks?.dilation) ? state.runPerks.dilation : 1;
      const maxMultiplier = Math.min(5, 1 + lvl);
      return (typeof t === 'function') ? t(this.descKey, { max: maxMultiplier }) : `Spacing up to ${maxMultiplier}`;
    },
    maxLevel: 4,
    color: '#A855F7',
    type: 'passive',
    category: 'skill',
    onActivate: () => {},
    onExpire: () => {}
  },
  autodestroy: {
    id: 'autodestroy',
    icon: '⚡',
    image: 'assets/skills/autodestroy.webp',
    nameKey: 'skill_name_autodestroy',
    descKey: 'skill_desc_autodestroy',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() {
      const lvl = (typeof state !== 'undefined' && state?.runPerks?.autodestroy) ? state.runPerks.autodestroy : 1;
      const dur = [3, 7, 15, 27, 35][Math.min(5, Math.max(1, lvl)) - 1];
      return (typeof t === 'function') ? t(this.descKey, { duration: dur, level: lvl, max: 5 }) : '';
    },
    duration: 3000,
    durationByLevel: [3000, 7000, 15000, 27000, 35000],
    interval: 60000, // 1 minute
    maxLevel: 5,
    color: '#F59E0B',
    type: 'periodic',
    category: 'skill',
    onActivate: (st) => {
      st.autodestroyAccum = 0;
    },
    onExpire: () => {}
  },
  decoder: {
    id: 'decoder',
    icon: '🔍',
    image: 'assets/skills/decoder.webp',
    nameKey: 'skill_name_decoder',
    descKey: 'skill_desc_decoder',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : 'Decodificador Cósmico'; },
    get desc() {
      const lvl = (typeof state !== 'undefined' && state?.runPerks?.decoder) ? state.runPerks.decoder : 1;
      const key = `skill_desc_decoder_lvl${lvl}`;
      return (typeof t === 'function' && t(key) !== key)
        ? t(key)
        : (typeof t === 'function' ? t(this.descKey, { level: lvl, max: 2 }) : '');
    },
    maxLevel: 2,
    color: '#06B6D4',
    type: 'passive',
    category: 'skill',
    onActivate: () => {},
    onExpire: () => {}
  }
};

function getSkillDuration(skillId, level = 1) {
  const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[skillId]) || null;
  if (!def) return 10000;
  if (Array.isArray(def.durationByLevel)) {
    const idx = Math.min(Math.max(1, level), def.durationByLevel.length) - 1;
    return def.durationByLevel[idx];
  }
  return def.duration || 10000;
}
window.getSkillDuration = getSkillDuration;

// 2. BOSS SPECIAL REWARDS (Choose 1 among 3 upon defeating a boss)
const BOSS_REWARDS_CONFIG = {
  extralife: {
    id: 'extralife',
    icon: '🛡️',
    nameKey: 'boss_reward_extralife',
    descKey: 'boss_reward_extralife_desc',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : '+1 Shield'; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : 'Recovers or adds 1 shield for the current run'; },
    color: '#0EA5E9',
    category: 'boss_reward'
  },
  continue: {
    id: 'continue',
    icon: '🪙',
    nameKey: 'boss_reward_continue',
    descKey: 'boss_reward_continue_desc',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : 'Continue Token'; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : 'Allows instant revival if all lives are lost'; },
    color: '#EAB308',
    category: 'boss_reward'
  },
  coins_100: {
    id: 'coins_100',
    icon: '💰',
    nameKey: 'boss_reward_coins_100',
    descKey: 'boss_reward_coins_100_desc',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : '+100 Coins'; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : 'Receive +100 cosmic coins directly into your bank'; },
    color: '#10B981',
    category: 'boss_reward'
  }
};

const SKILLS_LIST = Object.values(SKILLS_CONFIG);
const BOSS_REWARDS_LIST = Object.values(BOSS_REWARDS_CONFIG);
const SKILLS_ALL = [...SKILLS_LIST];

// All 6 Achievements (including the new Typography Master!)
const ACHIEVEMENTS = [
  {
    id: 'dedo_veloz',
    icon: '⚡',
    nameKey: 'ach_dedo_veloz_name',
    descKey: 'ach_dedo_veloz_desc',
    target: 60,
    unitKey: 'hud_wpm',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : ''; }
  },
  {
    id: 'cirurgico',
    icon: '🎯',
    nameKey: 'ach_cirurgico_name',
    descKey: 'ach_cirurgico_desc',
    target: 100,
    unit: '%',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : ''; }
  },
  {
    id: 'colecionador',
    icon: '📖',
    nameKey: 'ach_colecionador_name',
    descKey: 'ach_colecionador_desc',
    target: 30,
    unitKey: 'ach_unit_words',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : ''; }
  },
  {
    id: 'mestre_combo',
    icon: '🔥',
    nameKey: 'ach_mestre_combo_name',
    descKey: 'ach_mestre_combo_desc',
    target: 30,
    unitKey: 'ach_unit_streak',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : ''; }
  },
  {
    id: 'modo_furia',
    icon: '💥',
    nameKey: 'ach_modo_furia_name',
    descKey: 'ach_modo_furia_desc',
    target: 15,
    unitKey: 'ach_unit_combo',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : ''; }
  },
  {
    id: 'mestre_tipo',
    icon: '✍️',
    nameKey: 'ach_mestre_tipo_name',
    descKey: 'ach_mestre_tipo_desc',
    target: 100,
    unitKey: 'ach_unit_words',
    get name() { return (typeof t === 'function') ? t(this.nameKey) : ''; },
    get desc() { return (typeof t === 'function') ? t(this.descKey) : ''; }
  },
];

function wordPts(text) {
  return (text || '').length * 3;
}

// ================================================
// CELESTIAL FALLING OBJECTS CATALOG & MAPPING
// ================================================
// CELESTIAL OBJECT RESOLUTION (Cobalt Core Retro Pixel Art)
// Letters and syllables -> tiny rock fragments (assets/rocks/rock1..rock5.webp)
// Words -> 75 concrete celestial objects (assets/objects/<key>.webp)
// ================================================
const CELESTIAL_WORD_ASSETS = [
  'sun', 'moon', 'rock', 'mercury', 'venus', 'vesta', 'mars', 'jupiter', 'saturn', 'uranus',
  'neptune', 'pluto', 'ceres', 'titan', 'phobos', 'deimos', 'europa', 'io', 'triton', 'callisto',
  'charon', 'enceladus', 'ganymede', 'asteroid', 'comet', 'meteor', 'meteorite', 'bolide', 'fragment', 'aerolite',
  'meteoroid', 'boulder', 'satellite', 'probe', 'telescope', 'hubble', 'webb', 'voyager', 'sputnik', 'rocket',
  'capsule', 'module', 'rover', 'ship', 'drone', 'starship', 'space_shuttle', 'space_station', 'star', 'galaxy',
  'nebula', 'supernova', 'pulsar', 'quasar', 'magnetar', 'exoplanet', 'andromeda', 'milky_way', 'radiation', 'antimatter',
  'black_hole', 'wormhole', 'astronaut', 'cosmonaut', 'white_dwarf', 'red_giant', 'solar_probe', 'lunar_module', 'giant_asteroid', 'orbital_station',
  'trojan_asteroid', 'orbital_telescope', 'space_capsule', 'rover_vehicle', 'freighter'
];

function getCelestialObjectForItem(text, type) {
  if (!text) return 'rocks/rock1';
  const clean = String(text).trim().toLowerCase();

  // 1. Letters and syllables -> Micro rock fragments
  if (type === 'letter' || type === 'syllable') {
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash * 31 + clean.charCodeAt(i)) & 0xffffffff;
    }
    const rockNum = (Math.abs(hash) % 5) + 1;
    return `rocks/rock${rockNum}`;
  }

  // 2. Wildcard emergency bomb items (BOOM, BANG, NOVA, WARP, CHAOS) -> Detonation Plasma Bomb!
  if (type === 'wildcard' || clean === 'bang' || clean === 'boom' || clean === 'nova' || clean === 'warp' || clean === 'chaos') {
    return 'objects/wildcard_bomb';
  }

  // 3. Direct lookup in canonical word pools (returns word.asset)
  if (typeof findWordConcept === 'function') {
    const concept = findWordConcept(clean);
    if (concept && typeof concept.index === 'number' && concept.index >= 0 && concept.index < CELESTIAL_WORD_ASSETS.length) {
      return `objects/${CELESTIAL_WORD_ASSETS[concept.index]}`;
    }
  }

  // 3. Check active WORD_POOL or window.GAME_DATA_WORDS
  if (typeof WORD_POOL !== 'undefined' && Array.isArray(WORD_POOL)) {
    const found = WORD_POOL.find(w => w && w.text && w.text.toLowerCase() === clean);
    if (found && found.asset) return `objects/${found.asset}`;
  }

  // 4. Fallback hash across the 75 concrete objects
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) & 0xffffffff;
  }
  const idx = Math.abs(hash) % CELESTIAL_WORD_ASSETS.length;
  return `objects/${CELESTIAL_WORD_ASSETS[idx]}`;
}


