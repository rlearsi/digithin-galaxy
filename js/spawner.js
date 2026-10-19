/* ================================================
   DIGITHIN GALAXY — js/spawner.js
   Spawning mechanics, item generation, conveyor queue & layout
   ================================================ */
'use strict';

function decideSpawnType() {
  if (state.gameMode === 'training') {
    return 'letter';
  }

  state.spawnedItemsCount = (state.spawnedItemsCount || 0) + 1;
  const count = state.spawnedItemsCount;
  const letterLimit = state.initialLettersTarget || 10; // 8 a 12 letras

  // 1. Início: exibe de 8 a 12 letras
  if (count <= letterLimit) {
    return 'letter';
  }

  // 2. Depois: começa a intercalar com sílabas até 20 vocábulos
  if (count <= 20) {
    return Math.random() < 0.50 ? 'syllable' : 'letter';
  }

  // 3. Após 20 vocábulos: começa a exibir palavras completas, intercalando com algumas letras e sílabas
  // A frequência de palavras aumenta organicamente conforme o nível roguelike do jogador sobe
  const r = Math.random();
  const lvl = (typeof state !== 'undefined' && state?.level) ? state.level : 1;
  const wordChance = Math.min(0.75, 0.55 + (lvl - 1) * 0.03); // Nv 1: 55%, Nv 3: 61%, Nv 5: 67%, Nv 7+: 73%
  if (r < wordChance && state.unlockedWords && state.unlockedWords.length > 0) {
    return 'word';
  }
  if (r < (wordChance + 0.20)) {
    return 'syllable';
  }
  return 'letter';
}

/**
 * Seleciona palavras ponderadas pelo nível Roguelike do jogador,
 * priorizando termos mais acessíveis no início e termos complexos em níveis avançados,
 * além de evitar repetições imediatas do mesmo vocábulo na esteira.
 */
function pickWeightedWordByLevel(pool, level = 1, lastWordText = '') {
  if (!pool || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];

  // Anti-repetição imediata: se possível, não repete a mesma palavra duas vezes seguidas
  let filtered = pool;
  if (lastWordText && pool.length > 1) {
    const cleanLast = String(lastWordText).toUpperCase();
    const withoutLast = pool.filter(w => (w.text || '').toUpperCase() !== cleanLast);
    if (withoutLast.length > 0) filtered = withoutLast;
  }

  const lvl = Math.max(1, parseInt(level || 1, 10));

  // Tiers de palavras e seus pesos dinâmicos de acordo com o nível Roguelike
  let weights;
  if (lvl <= 2) {
    weights = { 1: 85, 2: 15, 3: 0, 4: 0, 5: 0 };
  } else if (lvl <= 4) {
    weights = { 1: 30, 2: 55, 3: 15, 4: 0, 5: 0 };
  } else if (lvl <= 6) {
    weights = { 1: 15, 2: 35, 3: 35, 4: 15, 5: 0 };
  } else if (lvl <= 8) {
    weights = { 1: 10, 2: 20, 3: 35, 4: 25, 5: 10 };
  } else {
    weights = { 1: 5, 2: 15, 3: 25, 4: 30, 5: 25 };
  }

  let totalWeight = 0;
  const weightedList = filtered.map(w => {
    const tier = (typeof getWordDifficultyTier === 'function') ? getWordDifficultyTier(w.text) : 1;
    const wgt = weights[tier] !== undefined ? weights[tier] : 10;
    totalWeight += wgt;
    return { word: w, weight: wgt };
  });

  if (totalWeight <= 0) return pick(filtered);

  let rnd = Math.random() * totalWeight;
  for (const item of weightedList) {
    rnd -= item.weight;
    if (rnd <= 0) {
      return item.word;
    }
  }

  return weightedList[weightedList.length - 1].word;
}

function genQueueItem() {
  // Training Mode: didactic queue using strictly the active world's key progression
  if (state.gameMode === 'training') {
    const worldData = (typeof TRAINING_WORLDS !== 'undefined' && TRAINING_WORLDS[state.trainingWorld]) || TRAINING_WORLDS[1];
    const chars = worldData?.chars || ['A', 'S', 'D', 'F'];
    const words = worldData?.words || [];

    // Lição 1: 100% teclas isoladas da linha para fixação de posição e memória muscular
    if (state.phase === 1 || words.length === 0) {
      return { text: pick(chars).toUpperCase(), type: 'letter', skill: null };
    }
    // Lição 2: 50% letras, 50% palavras/sílabas curtas da linha (treino de alternância)
    if (state.phase === 2) {
      if (Math.random() < 0.50) {
        return { text: pick(words).toUpperCase(), type: 'word', skill: null };
      }
      return { text: pick(chars).toUpperCase(), type: 'letter', skill: null };
    }
    // Lição 3 (Desafio Final): 80% palavras da linha, 20% letras para consolidação de fluidez
    if (Math.random() < 0.80) {
      return { text: pick(words).toUpperCase(), type: 'word', skill: null };
    }
    return { text: pick(chars).toUpperCase(), type: 'letter', skill: null };
  }

  const type = decideSpawnType();
  let text, skill = null;

  if (type === 'letter') {
    text = randLetter();
  } else if (type === 'syllable') {
    text = pick(ALL_SYLLABLES).toUpperCase();
  } else {
    // Após 20 vocábulos: palavras raras / wildcard e palavras regulares
    if (state.spawnedItemsCount > 20 && state.unlockedWords.length >= 3 && Math.random() < CFG.wildcardChance) {
      return { text: pick(WILDCARD_WORDS), type: 'wildcard', skill: null };
    }
    if (state.unlockedWords.length === 0) {
      text = randLetter();
      return { text, type: 'letter', skill: null };
    }
    const candidatePool = (typeof getWordPoolForDifficulty === 'function')
      ? getWordPoolForDifficulty(state.unlockedWords, state.difficulty, state.level)
      : state.unlockedWords;
    const pool = candidatePool.length > 0 ? candidatePool : state.unlockedWords;
    const chosenWord = pickWeightedWordByLevel(pool, state.level, state.lastSpawnedWordText);
    if (chosenWord && chosenWord.text) {
      state.lastSpawnedWordText = chosenWord.text;
      text = chosenWord.text.toUpperCase();
      const meaning = chosenWord.meaning || '';
      // Rare chance to contain bonus XP surge
      if (Math.random() < CFG.wordSkillChance) {
        skill = { id: 'bonus_xp', name: '+25 XP' };
      }
      return { text, type, skill, meaning };
    }
    text = randLetter();
    return { text, type: 'letter', skill: null };
  }
  return { text, type, skill };
}

function refillQueue() {
  while (state.spawnQueue.length < CFG.queueSize) {
    state.spawnQueue.push(genQueueItem());
  }
}

function scheduleSpawn() {
  if (state.paused || state.phaseComplete || (state.bossBattle && state.bossBattle.active)) return;
  let multVal  = state.speedMultiplier || 1.0;
  if ((state.activeTimers?.slowdown || 0) > 0) {
    multVal *= 0.5; // Reduz velocidade em 50%
  }
  let base = Math.max(CFG.spawnMin, CFG.spawnBase / multVal);

  // Espaçamento (dilation): passiva contínua da run (aumenta espaçamento em até 2, 3, 4 ou 5)
  const dilationLevel = state.runPerks?.dilation || 0;
  if (dilationLevel >= 1) {
    const spacingMult = Math.min(5, 1 + dilationLevel);
    base *= spacingMult;
  }
  const interval = base + (Math.random() - 0.5) * CFG.spawnVariance;
  state.spawnTimer = setTimeout(() => {
    if (!state.paused && !state.phaseComplete && (!state.bossBattle || !state.bossBattle.active)) {
      spawnItem();
      scheduleSpawn();
    }
  }, Math.max(450, interval));
}

function spawnItem() {
  if (state.bossBattle && state.bossBattle.active) return false;
  if (state.gameMode === 'training' && state.trainingHold) return false;
  const isFrozen = (state.activeTimers?.freezer || 0) > 0;
  if (isFrozen) {
    const activeCount = state.activeItems.filter(i => !i.removing).length;
    const maxFrozen = (typeof CFG !== 'undefined' && CFG.freezerMaxItems) ? CFG.freezerMaxItems : 3;
    if (activeCount >= maxFrozen) {
      return false;
    }
  }

  refillQueue();
  const next = state.spawnQueue.shift();
  refillQueue();

  // Registra palavras que surgiram e passaram na tela na partida atual
  if (next && (next.type === 'word' || next.type === 'wildcard') && next.text) {
    if (!state.runWordsSeen) state.runWordsSeen = new Set();
    state.runWordsSeen.add(next.text.toLowerCase());
  }

  if (typeof animateQueueShift === 'function') {
    animateQueueShift();
  } else {
    renderQueue();
  }

  const boardW = gameArea.clientWidth || 420;
  const el     = document.createElement('div');

  let cls = `falling-item ${next.type}`;
  if (next.skill) cls += ' has-skill';
  el.className = cls;

  // 1. Determine celestial falling object (micro rocks for letters/syllables, concrete objects for words)
  const objPath = (typeof getCelestialObjectForItem === 'function')
    ? getCelestialObjectForItem(next.text, next.type)
    : 'objects/comet';
  const assetSrc = objPath.includes('/') ? `assets/${objPath}.webp` : `assets/objects/${objPath}.webp`;
  el.setAttribute('data-object', objPath.replace(/^(rocks|objects)\//, ''));

  // 2. Sprite visual on top (Cobalt Core style pixel art)
  const spriteWrap = document.createElement('div');
  spriteWrap.className = 'falling-object-sprite';
  const spriteImg = document.createElement('img');
  spriteImg.className = 'falling-object-img';
  spriteImg.src = assetSrc;
  spriteImg.alt = next.text || '';
  spriteImg.draggable = false;
  spriteWrap.appendChild(spriteImg);
  el.appendChild(spriteWrap);

  // 3. Name label attached directly underneath (colado no objeto, thinner font, smaller size)
  const labelWrap = document.createElement('div');
  labelWrap.className = 'falling-label';
  const textSpan = document.createElement('span');
  textSpan.className = 'falling-text';
  textSpan.textContent = next.text;
  labelWrap.appendChild(textSpan);
  el.appendChild(labelWrap);

  // Attached badges
  if (next.skill) {
    const b = document.createElement('div');
    b.className   = 'skill-badge';
    b.textContent = '⚡';
    b.title       = next.skill.name;
    el.appendChild(b);
  }
  if (next.type === 'wildcard') {
    const b = document.createElement('div');
    b.className   = 'wildcard-badge';
    b.textContent = '💥';
    el.appendChild(b);
  }
  if (next.type === 'word' && typeof isWordNewInRun === 'function' && isWordNewInRun(next.text)) {
    const b = document.createElement('div');
    b.className   = 'new-word-badge';
    b.title       = typeof t === 'function' ? t('badge_new_word') : 'Nova palavra na partida';
    const label   = typeof t === 'function' ? t('badge_new_label') : 'NOVO';
    b.innerHTML   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg><span>' + label + '</span>';
    el.appendChild(b);
  }

  // Freezer status
  if (state.activeTimers.freezer > 0) {
    el.classList.add('frozen');
  }

  // Freezer / visibility fix: items spawn directly visible at y = 0
  const initialY = 0;
  el.style.top  = initialY + 'px';
  el.style.left = '0px';
  gameArea.appendChild(el);

  // Position horizontally within padding
  const itemW = el.offsetWidth || 60;
  const minX  = CFG.padX;
  const maxX  = Math.max(minX, boardW - itemW - CFG.padX);
  let posX    = rand(minX, maxX);

  // Evita sobreposição horizontal com itens próximos ao topo (ex.: congelados em y = 0)
  const nearTopItems = state.activeItems.filter(i => !i.removing && i.y < 50);
  if (nearTopItems.length > 0) {
    let bestX = posX;
    let bestMinDist = -1;
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidateX = rand(minX, maxX);
      let minDist = Infinity;
      for (const other of nearTopItems) {
        const d = Math.abs(candidateX - other.x);
        if (d < minDist) minDist = d;
      }
      if (minDist >= itemW + 12) {
        bestX = candidateX;
        break;
      }
      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestX = candidateX;
      }
    }
    posX = bestX;
  }

  el.style.left = posX + 'px';

  const itemObj = {
    id:        uid(),
    el,
    text:      next.text,
    type:      next.type,
    skill:     next.skill,
    y:         initialY,
    x:         posX,
    baseSpeed: CFG.baseSpeed + (Math.random() - 0.5) * 4,
    removing:  false,
  };

  state.activeItems.push(itemObj);
  return true;
}
