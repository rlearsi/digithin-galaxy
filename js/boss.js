/* ================================================
   DIGITHIN GALAXY — js/boss.js
   Boss battles, thematic vocabulary, enigma trial & victory
   ================================================ */
'use strict';

function getLearnedWords() {
  if (!state) return [];

  const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'en';
  const activePool = (typeof WORD_POOLS !== 'undefined' && WORD_POOLS[currentLang])
    ? WORD_POOLS[currentLang]
    : (typeof WORD_POOL !== 'undefined' ? WORD_POOL : []);

  const poolMap = new Map();
  activePool.forEach(w => {
    if (w && w.text) poolMap.set(w.text.toLowerCase(), w);
  });

  const learnedMap = new Map();

  // 1. Words that have been unlocked and completed / typed at least once
  if (Array.isArray(state.unlockedWords)) {
    state.unlockedWords.forEach(uw => {
      if (!uw || !uw.text) return;
      const key = uw.text.toLowerCase();
      const typedCount = state.wordStats?.[key]?.count || 0;
      if (typedCount > 0) {
        const localized = poolMap.get(key) || uw;
        if (localized && localized.meaning) {
          learnedMap.set(key, { ...localized, phase: uw.phase || state.phase });
        }
      }
    });
  }

  // 2. Also include any words in wordStats that exist in activePool
  if (state.wordStats) {
    Object.keys(state.wordStats).forEach(key => {
      if (learnedMap.has(key)) return;
      const count = state.wordStats[key]?.count || 0;
      if (count > 0 && poolMap.has(key)) {
        const localized = poolMap.get(key);
        if (localized && localized.meaning) {
          learnedMap.set(key, { ...localized, phase: state.phase });
        }
      }
    });
  }

  return Array.from(learnedMap.values());
}

const BOSS_THEME_INDICES = {
  robot:     [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
  beast:     [0, 7, 15, 23, 26, 28],
  mythology: [14, 19, 20],
  ocean:     [10, 22, 29],
  cosmos:    [12, 13, 18],
  volcano:   [4, 8, 11, 21],
};

function getWordConceptIndex(text) {
  if (typeof findWordConcept === 'function') {
    const concept = findWordConcept(text);
    return concept ? concept.index : -1;
  }
  if (!text) return -1;
  const lower = text.toLowerCase();
  if (typeof WORD_POOLS !== 'undefined') {
    for (const lang in WORD_POOLS) {
      const pool = WORD_POOLS[lang];
      if (Array.isArray(pool)) {
        const idx = pool.findIndex(w => w && w.text && w.text.toLowerCase() === lower);
        if (idx !== -1) return idx;
      }
    }
  }
  return -1;
}

function isWordThematicallyRelatedToBoss(wordObj, bossType) {
  if (!wordObj || !wordObj.text || !wordObj.meaning) return false;
  // All words in Digitinho Galaxy are celestial/cosmic words and qualify for Alien Boss invasion enigmas
  return true;
}

function getBossWordPool(bossType) {
  const lang = typeof getLanguage === 'function' ? getLanguage() : 'en';
  const basePool = (typeof WORD_POOLS !== 'undefined' && WORD_POOLS[lang])
    ? WORD_POOLS[lang]
    : (typeof WORD_POOL !== 'undefined' ? WORD_POOL : []);

  // Mapeia todas as palavras com seus significados traduzidos no idioma ativo
  const dictMap = new Map();
  basePool.forEach(w => {
    if (w && w.text && w.meaning) dictMap.set(w.text.toLowerCase(), w);
  });

  const passedWords = [];
  const seen = new Set();

  // 1. Palavras que o jogador completou/aprendeu nesta partida específica
  if (state && state.runWordsLearned) {
    state.runWordsLearned.forEach(key => {
      const lower = String(key).toLowerCase();
      if (!seen.has(lower) && dictMap.has(lower)) {
        seen.add(lower);
        passedWords.push(dictMap.get(lower));
      }
    });
  }

  // 2. Palavras que passaram na tela na partida atual (surgiram como objetos caindo)
  if (state && state.runWordsSeen) {
    state.runWordsSeen.forEach(key => {
      const lower = String(key).toLowerCase();
      if (!seen.has(lower) && dictMap.has(lower)) {
        seen.add(lower);
        passedWords.push(dictMap.get(lower));
      }
    });
  }

  return shuffle(passedWords);
}

/**
 * Words of a boss theme (active language) the player has NOT unlocked yet.
 */
function getBossWordCandidates(bossType) {
  const lang = typeof getLanguage === 'function' ? getLanguage() : 'en';
  const basePool = (typeof WORD_POOLS !== 'undefined' && WORD_POOLS[lang])
    ? WORD_POOLS[lang]
    : (typeof WORD_POOL !== 'undefined' ? WORD_POOL : []);
  const dict = (typeof BOSS_WORDS_BY_TYPE !== 'undefined' && BOSS_WORDS_BY_TYPE[bossType]) || {};
  const bossList = dict[lang] || dict.pt || dict.en || [];

  const have = new Set((state.unlockedWords || []).map(w => (w.text || '').toLowerCase()));
  const seen = new Set();
  const out = [];
  [...basePool, ...bossList].forEach(w => {
    if (!w || !w.text || !w.meaning) return;
    const key = w.text.toLowerCase();
    if (have.has(key) || seen.has(key)) return;
    if (!isWordThematicallyRelatedToBoss(w, bossType)) return;
    seen.add(key);
    out.push(w);
  });
  return out;
}

/**
 * Called when a phase is completed. Guarantees that, within each 8-phase cycle, at least
 * BOSS_WORDS_PER_CYCLE words of the cycle's boss are unlocked (and therefore fall in the next phases),
 * spreading them across the cycle. Returns the words unlocked by this guarantee.
 */
function unlockBossCycleWords(phase) {
  const p = parseInt(phase, 10) || 0;
  if (p < 2) return [];
  if (state.gameMode === 'training' || state.gameMode === 'zen') return [];
  if (typeof isBossBattlesEnabled === 'function' && !isBossBattlesEnabled()) return [];

  const bossPhase = getBossCyclePhase(p);
  if (bossPhase <= p) return [];
  const bossType = getBossTypeForPhase(bossPhase);
  const cycleStart = bossPhase - BOSS_PHASE_INTERVAL;

  const inCycle = (state.unlockedWords || []).filter(w => {
    const wp = w.phase || 0;
    return wp > cycleStart && wp <= bossPhase && isWordThematicallyRelatedToBoss(w, bossType);
  });
  const need = BOSS_WORDS_PER_CYCLE - inCycle.length;
  if (need <= 0) return [];

  // Phases left to unlock words in this cycle (p .. bossPhase-1)
  const opportunities = bossPhase - p;
  if (opportunities > need && Math.random() >= need / opportunities) return [];
  const count = Math.max(1, need - opportunities + 1);

  const picked = shuffle(getBossWordCandidates(bossType)).slice(0, count);
  picked.forEach(w => state.unlockedWords.push({ ...w, phase: p }));
  return picked;
}

function canTriggerBossBattle() {
  if (!state || state.gameMode === 'training') return false;
  return Boolean(state.pendingBossInvasion);
}

function getBossForPhase(phase) {
  return getRandomBoss(1);
}

/**
 * Triggers a random Alien Boss invasion from outer space to attack Earth
 */
function triggerAlienBossInvasion(overrideBoss) {
  if (!state || state.bossBattle?.active || state.paused || state.gameMode === 'training') return;
  const pool = getBossWordPool();
  if (pool.length < 3) {
    // Adia a invasão até que o jogador digite e aprenda mais palavras na run atual
    state.alienInvasionCountdown = 10 + Math.floor(Math.random() * 6);
    return;
  }
  state.pendingBossInvasion = false;
  const candidateBoss = overrideBoss || getRandomBoss(1);
  state.pendingBoss = candidateBoss;
  beginBossPhase();
}

function beginBossPhase() {
  clearArea();
  clearTimeout(state.spawnTimer);
  state.spawnTimer = null;

  // Clean any lingering non-boss tokens from DOM and activeItems
  const stray = gameArea?.querySelectorAll('.falling-item, .token');
  stray?.forEach(el => el.parentNode?.removeChild(el));
  state.activeItems = [];

  // Salva a velocidade atual da run antes do chefão (Requisitos 5 e 6)
  if (typeof state.preBossSpeed === 'undefined' || state.preBossSpeed === null) {
    state.preBossSpeed = state.speedMultiplier || 1.0;
  }

  // Chefão alienígena sorteado aleatoriamente
  const candidateBoss = state.pendingBoss || getRandomBoss(1);
  const bossType = candidateBoss?.type || 'robot';

  // Pool temático de vocábulos cósmicos
  const themedMatches = getBossWordPool(bossType);

  if (themedMatches.length === 0) {
    if (typeof hideBossHud === 'function') hideBossHud();
    if (state.bossBattle) state.bossBattle.active = false;
    state.speedMultiplier = state.preBossSpeed || 1.0;
    state.progress        = 0;
    state.hitsPhase       = 0;
    state.errorsPhase     = 0;
    state.phasePts        = 0;
    state.phaseComplete   = false;
    state.paused          = false;
    state.typedBuffer     = '';
    state.activeItems     = [];
    state.spawnQueue      = [];
    clearArea();
    refillQueue();
    renderQueue();
    state.lastTs = null;
    state.rafId = requestAnimationFrame(gameLoop);
    updateHUD();
    scheduleSpawn();
    return;
  }

  state.bossBattle = {
    active:          true,
    boss:            candidateBoss,
    pool:            themedMatches,
    solvedWords:     [],
    attemptedWords:  [],
    lastDroppedWord: null,
    solvedCount:     0,
    currentWord:     null,
    boxItem:         null,
    damageCount:       0,
  };

  state.progress        = 0;
  state.hitsPhase       = 0;
  state.errorsPhase     = 0;
  state.phasePts        = 0;
  // Requisito 5: Velocidade dos significados do boss mais lento (1x fixo)
  state.speedMultiplier = 1.0;
  state.combo           = 0;
  state.phaseComplete   = false;
  state.paused          = false;
  state.typedBuffer     = '';
  state.spawnQueue      = [];

  renderBossHud(state.bossBattle.boss, state.bossBattle.boss.lives, state.bossBattle.boss.maxLives || 3);
  renderQueue();
  playSound('bossSpawn');

  const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'en';
  const bossName = (typeof t === 'function' && state.bossBattle.boss?.nameKey && t(state.bossBattle.boss.nameKey) !== state.bossBattle.boss.nameKey)
    ? state.bossBattle.boss.name
    : ((currentLang === 'pt' && state.bossBattle.boss?.namePt)
      ? state.bossBattle.boss.namePt
      : (state.bossBattle.boss?.name || (typeof t === 'function' ? t('boss_default_name') : 'Boss')));

  const invasionMsg = (typeof t === 'function')
    ? t('fb_boss_invasion', { boss: bossName.toUpperCase() })
    : `⚠️ ALIEN INVASION: ${bossName.toUpperCase()} IS ATTACKING EARTH!`;
  showFeedback(invasionMsg, 'special');

  state.lastTs = null;
  state.rafId  = requestAnimationFrame(gameLoop);
  updateHUD();

  setTimeout(() => {
    if (state.bossBattle?.active && !state.paused) {
      spawnBossMeaningBox();
    }
  }, 950);
}

function pickNextBossWord() {
  if (!state.bossBattle || !state.bossBattle.active) return null;
  const bossType = state.bossBattle.boss?.type || 'robot';

  // Pool temático garantido (>= 3 significados do chefão)
  const themedMatches = getBossWordPool(bossType);
  if (themedMatches.length === 0) return null;


  // 1. Filtrar palavras já resolvidas com sucesso nesta batalha
  const solvedSet = new Set((state.bossBattle.solvedWords || []).map(s => s.toLowerCase()));
  const unsolvedPool = themedMatches.filter(w => !solvedSet.has(w.text.toLowerCase()));
  const availablePool = unsolvedPool.length > 0 ? unsolvedPool : themedMatches;

  // 2. Regra 2: Filtrar palavras que já foram tentadas no ciclo atual
  const attemptedSet = new Set((state.bossBattle.attemptedWords || []).map(s => s.toLowerCase()));
  let candidates = availablePool.filter(w => !attemptedSet.has(w.text.toLowerCase()));

  // 3. Regras 3 e 4: Caso todas as palavras disponíveis tenham sido tentadas (ou o limite seja 3 e esgotou), reinicia o ciclo
  if (candidates.length === 0) {
    state.bossBattle.attemptedWords = [];
    // Evita repetir imediatamente a palavra que acabou de cair se houver outras opções disponíveis
    if (availablePool.length > 1 && state.bossBattle.lastDroppedWord) {
      candidates = availablePool.filter(w => w.text.toLowerCase() !== state.bossBattle.lastDroppedWord.toLowerCase());
    }
    if (!candidates || candidates.length === 0) {
      candidates = availablePool;
    }
  }

  // 4. Sorteia aleatoriamente um novo significado entre as opções elegíveis
  const chosenWord = candidates[Math.floor(Math.random() * candidates.length)];
  if (chosenWord) {
    const key = chosenWord.text.toLowerCase();
    if (!state.bossBattle.attemptedWords) state.bossBattle.attemptedWords = [];
    if (!state.bossBattle.attemptedWords.includes(key)) {
      state.bossBattle.attemptedWords.push(key);
    }
    state.bossBattle.currentWord = chosenWord;
    state.bossBattle.lastDroppedWord = null;
  }
  return chosenWord;
}

function spawnBossMeaningBox() {
  if (!state.bossBattle?.active || state.paused) return;

  const wordObj = pickNextBossWord();
  if (!wordObj) return;

  state.bossBattle.currentWord = wordObj;
  const targetWord = wordObj.text.toUpperCase();
  state.typedBuffer = '';
  // Requisito 5: Velocidade dos significados do boss fixo em 1x
  state.speedMultiplier = 1.0;

  // Animação do alien arremessando o objeto em direção à Terra
  if (typeof animateAlienThrow === 'function') {
    animateAlienThrow();
  }

  const el = document.createElement('div');
  let cls = 'boss-meaning-box';
  if ((state.activeTimers?.freezer || 0) > 0) cls += ' frozen';
  el.className = cls;

  const currentLang = (typeof getLanguage === 'function') ? getLanguage() : 'en';
  const scenarioName = (typeof t === 'function' && state.bossBattle.boss?.scenarioKey && t(state.bossBattle.boss.scenarioKey) !== state.bossBattle.boss.scenarioKey)
    ? state.bossBattle.boss.scenario
    : ((currentLang === 'pt' && state.bossBattle.boss?.scenarioPt)
      ? state.bossBattle.boss.scenarioPt
      : (state.bossBattle.boss?.scenario || 'Scenario'));

  const solvedNum = Math.min(3, (state.bossBattle.solvedCount || 0) + 1);
  const totalEnigmas = state.bossBattle.boss?.maxLives || 3;

  const badgeText = typeof t === 'function'
    ? t('boss_enigma_badge', { num: solvedNum, total: totalEnigmas, scenario: scenarioName.toUpperCase() })
    : `📜 ENIGMA ${solvedNum} / ${totalEnigmas} • ${scenarioName.toUpperCase()}`;
  const lettersText = typeof t === 'function'
    ? t('boss_enigma_letters', { count: targetWord.length })
    : `${targetWord.length} LETTERS`;

  el.innerHTML = `
    <div class="bmb-header">
      <span class="bmb-badge">${badgeText}</span>
      <span class="bmb-length">${lettersText}</span>
    </div>
    <div class="bmb-meaning">"${wordObj.meaning}"</div>
    <div class="bmb-slots"></div>
  `;

  renderBossMeaningSlots(el, targetWord, '');

  clearTimeout(state.spawnTimer);
  state.spawnTimer = null;

  // Purge any stray non-boss tokens from DOM and activeItems
  const stray = gameArea?.querySelectorAll('.falling-item, .token');
  stray?.forEach(tEl => tEl.parentNode?.removeChild(tEl));

  const initialY = 0;
  el.style.top  = initialY + 'px';
  gameArea.appendChild(el);

  const itemObj = {
    id:            uid(),
    el,
    text:          targetWord,
    type:          'boss_meaning',
    isBossMeaning: true,
    y:             initialY,
    x:             0,
    baseSpeed:     28, // Calibrated pace giving adequate reading & typing time
    removing:      false,
  };

  state.activeItems = [itemObj];
  state.bossBattle.boxItem = itemObj;
  renderQueue();
  updateHUD();
}

/**
 * Updates the active boss battle vocabulary and UI when game language changes mid-battle
 */
function updateBossLanguage(lang) {
  if (!state || !state.bossBattle || !state.bossBattle.active) return;
  const currentLang = lang || (typeof getLanguage === 'function' ? getLanguage() : 'en');

  // Re-render boss HUD with localized boss name and scenario
  if (state.bossBattle.boss && typeof renderBossHud === 'function') {
    renderBossHud(state.bossBattle.boss, state.bossBattle.boss.lives, state.bossBattle.boss.maxLives || 3);
  }

  // Migrate pool of remaining words for this boss
  if (Array.isArray(state.bossBattle.pool) && typeof migrateUnlockedWordsToActiveLanguage === 'function') {
    state.bossBattle.pool = migrateUnlockedWordsToActiveLanguage(state.bossBattle.pool, currentLang);
  }

  // Migrate current target word and update meaning box
  if (state.bossBattle.currentWord && typeof migrateWordToLanguage === 'function') {
    state.bossBattle.currentWord = migrateWordToLanguage(state.bossBattle.currentWord, currentLang);
    const targetWord = (state.bossBattle.currentWord.text || '').toUpperCase();

    if (state.bossBattle.boxItem && state.bossBattle.boxItem.el) {
      const el = state.bossBattle.boxItem.el;
      state.bossBattle.boxItem.text = targetWord;

      const scenarioName = (typeof t === 'function' && state.bossBattle.boss?.scenarioKey && t(state.bossBattle.boss.scenarioKey) !== state.bossBattle.boss.scenarioKey)
        ? state.bossBattle.boss.scenario
        : (state.bossBattle.boss?.scenario || 'Scenario');

      const solvedNum = Math.min(3, (state.bossBattle.solvedCount || 0) + 1);
      const totalEnigmas = state.bossBattle.boss?.maxLives || 3;

      const badgeText = typeof t === 'function'
        ? t('boss_enigma_badge', { num: solvedNum, total: totalEnigmas, scenario: scenarioName.toUpperCase() })
        : `📜 ENIGMA ${solvedNum} / ${totalEnigmas} • ${scenarioName.toUpperCase()}`;
      const lettersText = typeof t === 'function'
        ? t('boss_enigma_letters', { count: targetWord.length })
        : `${targetWord.length} LETTERS`;

      const badgeEl = el.querySelector('.bmb-badge');
      if (badgeEl) badgeEl.textContent = badgeText;
      const lenEl = el.querySelector('.bmb-length');
      if (lenEl) lenEl.textContent = lettersText;
      const meaningEl = el.querySelector('.bmb-meaning');
      if (meaningEl) meaningEl.textContent = `"${state.bossBattle.currentWord.meaning}"`;

      state.typedBuffer = '';
      renderBossMeaningSlots(el, targetWord, '');
    }
  }
}

function handleBossLetterTyped(char) {
  if (!state.bossBattle?.active || !state.bossBattle.currentWord || !state.bossBattle.boxItem) return;
  const boxItem = state.bossBattle.boxItem;
  if (boxItem.removing) return;

  const targetWord = state.bossBattle.currentWord.text.toUpperCase();
  let effectiveChar = char;
  const currentLen = state.typedBuffer.length;
  if (currentLen < targetWord.length) {
    const expected = targetWord[currentLen];
    if ((char === ' ' || char === '-') && (expected === '-' || expected === ' ')) {
      effectiveChar = expected;
    }
  }
  const nextBuf = state.typedBuffer + effectiveChar;

  if (targetWord.startsWith(nextBuf)) {
    state.typedBuffer = nextBuf;
    state.hitsPhase++;
    state.totalHits++;
    state.charsTyped = (state.charsTyped || 0) + 1;
    if (typeof playMechanicalClick === 'function') playMechanicalClick(state.typedBuffer.length);

    renderBossMeaningSlots(boxItem.el, targetWord, state.typedBuffer);

    if (state.typedBuffer === targetWord) {
      completeBossMeaning();
      state.typedBuffer = '';
    } else {
      playSound('hit');
    }
  } else {
    // Shield protection
    if ((state.activeTimers?.shield || 0) > 0) {
      playSound('skill');
      showFeedback(typeof t === 'function' ? t('fb_shield_error_protected') : '🛡️ Error protected by Shield!', 'special');
      return;
    }

    // Typo breaks combo
    if (state.combo > 0) {
      state.combo = 0;
      showFeedback(typeof t === 'function' ? t('fb_combo_broken') : 'Combo broken!', 'error');
    }

    state.errorsPhase++;
    state.totalErrors++;
    playSound('error');
    showFeedback(typeof t === 'function' ? t('fb_error_letter') : '❌ Wrong letter!', 'error');

    // Requisito 5: Velocidade é fixa em 1.0x mesmo em caso de erro
    state.speedMultiplier = 1.0;

    if (boxItem.el) {
      boxItem.el.classList.add('bmb-error');
      setTimeout(() => boxItem.el?.classList.remove('bmb-error'), 320);
    }

    state.typedBuffer = '';
    renderBossMeaningSlots(boxItem.el, targetWord, '');
    updateHUD();
  }

  if (typeof updateFingerGuide === 'function' && typeof isFingerGuideActive === 'function' && isFingerGuideActive()) {
    updateFingerGuide();
  }
}

function completeBossMeaning() {
  const boxItem = state.bossBattle?.boxItem;
  if (!boxItem) return;

  const targetWord = (state.bossBattle?.currentWord?.text || boxItem.text || '').toUpperCase();
  boxItem.removing = true;
  boxItem.el.classList.add('shattered');
  if (typeof spawnCelestialExplosion === 'function') {
    spawnCelestialExplosion(boxItem.el, targetWord);
  } else if (typeof spawnParticles === 'function') {
    spawnParticles(boxItem.el, 16);
  }

  // Combo progression
  state.combo    = (state.combo || 0) + 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  state.maxComboPhase = Math.max(state.maxComboPhase || 0, state.combo);
  try {
    const curBest = parseInt(localStorage.getItem('digithin_galaxy_best_combo') || '0', 10);
    if (state.maxCombo > curBest) localStorage.setItem('digithin_galaxy_best_combo', String(state.maxCombo));
  } catch (_) {}
  if (state.combo >= 30) unlockAchievement('mestre_combo');

  const isFury = state.combo >= 15;
  if (state.combo === 15) {
    playSound('fury');
    showFeedback(typeof t === 'function' ? t('fb_fury_activated') : 'FURY MODE ACTIVATED! DOUBLE POINTS!', 'special');
    unlockAchievement('modo_furia');
  } else if (state.combo > 1) {
    playSound('combo');
  }

  let comboMult = state.combo >= 15 ? 4 : state.combo >= 10 ? 3 : state.combo >= 5 ? 2 : 1;
  if (isFury) comboMult *= 2;

  const pts = 300;
  state.phasePts   += pts;
  state.totalScore += pts;

  playSound('bossHit');
  flashBossDamage();
  document.body.style.animation = 'screenShake .35s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 350);

  // Record discovered word stats
  const wordKey = state.bossBattle.currentWord.text.toLowerCase();
  if (!state.bossBattle.solvedWords) state.bossBattle.solvedWords = [];
  if (!state.bossBattle.solvedWords.includes(wordKey)) {
    state.bossBattle.solvedWords.push(wordKey);
  }
  state.bossBattle.solvedCount = (state.bossBattle.solvedCount || 0) + 1;

  if (!state.wordStats[wordKey]) state.wordStats[wordKey] = { count: 0 };
  state.wordStats[wordKey].count++;
  if (!state.unlockedWords.find(w => w.text.toLowerCase() === wordKey)) {
    state.unlockedWords.push({ ...state.bossBattle.currentWord, phase: state.phase });
  }

  // Deduct 1 boss life (Cada significado tira uma vida do boss)
  state.bossBattle.boss.lives--;
  state.bossBattle.damageCount++;

  const enigmaMsg = typeof t === 'function'
    ? t('fb_enigma_solved', { pts })
    : `💥 ENIGMA SOLVED! -1 BOSS HP! (+${pts}pts)`;
  showFeedback(enigmaMsg, 'special');
  renderBossHud(state.bossBattle.boss, state.bossBattle.boss.lives, state.bossBattle.boss.maxLives || 3);
  updateHUD();

  setTimeout(() => {
    boxItem.el?.parentNode?.removeChild(boxItem.el);
    clearTimeout(state.spawnTimer);
    state.spawnTimer = null;
    state.activeItems = [];
    state.bossBattle.boxItem = null;
    const stray = gameArea?.querySelectorAll('.falling-item, .token');
    stray?.forEach(el => el.parentNode?.removeChild(el));

    if (state.bossBattle.boss.lives <= 0) {
      defeatBoss();
    } else {
      state.typedBuffer = '';
      setTimeout(() => {
        if (state.bossBattle?.active && !state.paused) {
          spawnBossMeaningBox();
        }
      }, 700);
    }
  }, 280);
}

function defeatBoss() {
  state.bossBattle.active = false;
  state.phaseComplete = true;
  state.paused = true;
  cancelAnimationFrame(state.rafId);
  clearTimeout(state.spawnTimer);

  // Regra 5: chefão derrotado = +350 moedas (+35 precisão se 0 erros)
  const bossBonusCoins = 350;
  const isPerfectAcc = (state.errorsPhase === 0);
  const precisionCoins = isPerfectAcc ? 35 : 0;
  const totalBossCoins = bossBonusCoins + precisionCoins;
  state.coins = (state.coins || 0) + totalBossCoins;
  state.totalCoinsEarned = (state.totalCoinsEarned || 0) + totalBossCoins;
  if (typeof addSharedCoins === 'function') addSharedCoins(totalBossCoins);
  if (typeof updateHighCoins === 'function') updateHighCoins(state.totalCoinsEarned);
  if (typeof saveGameProgress === 'function') saveGameProgress();

  updateHUD();

  if (state.bossBattle?.boss?.type) {
    if (!state.defeatedBossTypes) state.defeatedBossTypes = [];
    if (!state.defeatedBossTypes.includes(state.bossBattle.boss.type)) {
      state.defeatedBossTypes.push(state.bossBattle.boss.type);
    }
  }
  state.pendingBoss = null;
  state.pendingBossPhase = null;

  const onExplosionComplete = () => {
    playSound('bossDefeat');
    launchConfetti();

    const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'en';
    const bossName = (typeof t === 'function' && state.bossBattle.boss?.nameKey && t(state.bossBattle.boss.nameKey) !== state.bossBattle.boss.nameKey)
      ? state.bossBattle.boss.name
      : ((currentLang === 'pt' && state.bossBattle.boss?.namePt)
        ? state.bossBattle.boss.namePt
        : (state.bossBattle.boss?.name || (typeof t === 'function' ? t('boss_default_name') : 'Boss')));

    const victoryMsg = typeof t === 'function'
      ? t('fb_boss_defeated', { boss: bossName.toUpperCase() })
      : `${bossName.toUpperCase()} DEFEATED! +350 COINS!`;

    showFeedback(victoryMsg, 'special');

    // Ao vencer o boss, jogador escolhe entre as 3 recompensas exclusivas de boss
    const rewardPool = [
      BOSS_REWARDS_CONFIG.extralife,
      BOSS_REWARDS_CONFIG.continue,
      BOSS_REWARDS_CONFIG.coins_100
    ];

    showBossRewardModal(rewardPool, (chosenReward) => {
      stopConfetti();
      grantBossReward(chosenReward);
      continueAfterBossVictory();
    });
  };

  // 1. Destrói o boss em partículas cósmicas (como acontece com os objetos caindo)
  // 2. Após alguns milissegundos de explosão e dispersão de partículas, exibe a mensagem de vitória e as 3 opções
  if (typeof explodeAlienBoss === 'function') {
    explodeAlienBoss(onExplosionComplete);
  } else {
    setTimeout(onExplosionComplete, 650);
  }
}

function grantBossReward(reward) {
  if (reward.id === 'extralife') {
    state.shields = Math.min((state.shields || state.lives || 3) + 1, 6);
    state.maxShields = Math.max(state.maxShields || 3, state.shields);
    state.lives = state.shields;
    state.maxLives = state.maxShields;
    showFeedback(typeof t === 'function' ? t('boss_reward_extralife') + '!' : '+1 Shield!', 'special');
  } else if (reward.id === 'continue') {
    state.continues = (state.continues || 0) + 1;
    showFeedback(typeof t === 'function' ? t('boss_reward_continue') + '!' : '+1 Continue!', 'special');
  } else if (reward.id === 'coins_100') {
    state.coins = (state.coins || 0) + 100;
    state.totalCoinsEarned = (state.totalCoinsEarned || 0) + 100;
    if (typeof addSharedCoins === 'function') addSharedCoins(100);
    showFeedback(typeof t === 'function' ? '+100 ' + t('hud_coins') + '! 🪙' : '+100 Coins!', 'special');
  }
  if (typeof playSound === 'function') playSound('buy');
  updateHUD();
}

function continueAfterBossVictory() {
  hideBossHud();
  if (typeof hideAlienSpaceInvader === 'function') {
    hideAlienSpaceInvader();
  }
  state.pendingBoss = null;
  state.pendingBossPhase = null;
  if (state.bossBattle) {
    state.bossBattle.active = false;
  }
  state.phaseComplete = false;

  // Requisito 6: velocidade volta ao padrão da run anterior ao final
  const diffCfg = (typeof getDifficultyConfig === 'function') ? getDifficultyConfig() : { initialSpeed: 1.0 };
  state.speedMultiplier = state.preBossSpeed || diffCfg.initialSpeed || 1.0;
  state.preBossSpeed = null;

  // Agenda a próxima invasão alienígena aleatória na partida contínua
  state.alienInvasionCountdown = 16 + Math.floor(Math.random() * 10);

  // Retoma o fluxo contínuo normal do jogo sem reiniciar fase
  clearArea();
  refillQueue();
  renderQueue();
  state.typedBuffer = '';
  state.paused = false;
  state.lastTs = null;
  state.rafId = requestAnimationFrame(gameLoop);
  scheduleSpawn();
  updateHUD();
}

let currentBossTestIndex = 0;
const BOSS_TEST_PHASES = [8, 16, 24, 32, 40, 48];

function testBossBattle(phaseOverride) {
  if (typeof closeSettings === 'function') closeSettings();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');

  if (screenStart?.classList.contains('active')) {
    screenStart.classList.remove('active');
    screenGame.classList.add('active');
    if (typeof focusGameInput === 'function') {
      focusGameInput();
    } else {
      hiddenInput?.focus();
    }
  }
  const testIdx = currentBossTestIndex++;
  const testBosses = typeof BOSS_DEFS !== 'undefined' ? BOSS_DEFS : [];
  state.phase = (phaseOverride && isBossPhase(phaseOverride)) ? phaseOverride : BOSS_PHASE_INTERVAL;
  const testBase = testBosses[testIdx % testBosses.length];
  const candidateBoss = testBase ? createBossInstance(testBase, 1) : getBossForPhase(state.phase);
  state.pendingBoss = candidateBoss;
  state.pendingBossPhase = state.phase;
  const bossType = candidateBoss?.type || 'robot';

  // Ensure tester has at least 3 matching learned words for the candidate boss
  const currentLearned = getLearnedWords();
  const matchingThemed = currentLearned.filter(w => isWordThematicallyRelatedToBoss(w, bossType));

  if (matchingThemed.length < 3) {
    const curLang = typeof getLanguage === 'function' ? getLanguage() : 'en';
    const activePool = (typeof WORD_POOLS !== 'undefined' && WORD_POOLS[curLang])
      ? WORD_POOLS[curLang]
      : (typeof WORD_POOL !== 'undefined' ? WORD_POOL : []);
    let matchingInPool = activePool.filter(w => isWordThematicallyRelatedToBoss(w, bossType));
    if (matchingInPool.length < 3 && typeof BOSS_WORDS_BY_TYPE !== 'undefined' && BOSS_WORDS_BY_TYPE[bossType]) {
      const bossList = BOSS_WORDS_BY_TYPE[bossType][curLang] || BOSS_WORDS_BY_TYPE[bossType].pt || BOSS_WORDS_BY_TYPE[bossType].en || [];
      matchingInPool = [...matchingInPool, ...bossList];
    }
    matchingInPool.forEach(w => {
      const key = w.text.toLowerCase();
      if (!state.wordStats[key]) state.wordStats[key] = { count: 1 };
      if (!state.runWordsLearned) state.runWordsLearned = new Set();
      state.runWordsLearned.add(key);
      if (!state.runWordsSeen) state.runWordsSeen = new Set();
      state.runWordsSeen.add(key);
      if (!state.unlockedWords.find(u => u.text.toLowerCase() === key)) {
        state.unlockedWords.push({ ...w, phase: state.phase });
      }
    });
  }

  state.paused = false;
  state.escPaused = false;
  beginBossPhase();
}

function startBossTest() {
  if (typeof closeSettings === 'function') closeSettings();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
  const modalTraining = $('modal-training');
  if (modalTraining) modalTraining.classList.add('hidden');

  state = defaultState();
  state.gameMode = 'classic';
  state.startTime = Date.now();
  state.phase = BOSS_PHASE_INTERVAL;

  const testIdx = currentBossTestIndex++;
  const testBosses = typeof BOSS_DEFS !== 'undefined' ? BOSS_DEFS : [];
  const testBase = testBosses[testIdx % testBosses.length];
  const candidateBoss = testBase ? createBossInstance(testBase, 1) : getBossForPhase(state.phase);
  state.pendingBoss = candidateBoss;
  state.pendingBossPhase = state.phase;
  const bossType = candidateBoss?.type || 'robot';

  const curLang = typeof getLanguage === 'function' ? getLanguage() : 'en';
  const activePool = (typeof WORD_POOLS !== 'undefined' && WORD_POOLS[curLang])
    ? WORD_POOLS[curLang]
    : (typeof WORD_POOL !== 'undefined' ? WORD_POOL : []);
  let matchingInPool = activePool.filter(w => isWordThematicallyRelatedToBoss(w, bossType));
  if (matchingInPool.length < 3 && typeof BOSS_WORDS_BY_TYPE !== 'undefined' && BOSS_WORDS_BY_TYPE[bossType]) {
    const bossWordFallback = BOSS_WORDS_BY_TYPE[bossType][curLang] || BOSS_WORDS_BY_TYPE[bossType].pt || BOSS_WORDS_BY_TYPE[bossType].en || [];
    matchingInPool = [...matchingInPool, ...bossWordFallback];
  }

  matchingInPool.forEach(w => {
    state.unlockedWords.push({ ...w, phase: 1 });
    const key = w.text.toLowerCase();
    if (!state.wordStats[key]) state.wordStats[key] = { count: 1 };
    if (!state.runWordsLearned) state.runWordsLearned = new Set();
    state.runWordsLearned.add(key);
    if (!state.runWordsSeen) state.runWordsSeen = new Set();
    state.runWordsSeen.add(key);
  });

  screenStart.classList.remove('active');
  screenGame.classList.add('active');
  if (typeof focusGameInput === 'function') {
    focusGameInput();
  } else {
    hiddenInput?.focus();
  }
  beginBossPhase();
}
