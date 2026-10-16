/* ================================================
   DIGITHIN GALAXY — js/spawner.js
   Spawning mechanics, item generation, conveyor queue & layout
   ================================================ */
'use strict';

function decideSpawnType() {
  const p = state.phase;
  // Requirement 7: Early phases are fast — NO complete words in phase 1 and 2!
  if (p === 1) {
    return 'letter'; // Phase 1: fast single letters
  }
  if (p === 2) {
    return Math.random() < 0.5 ? 'syllable' : 'letter'; // Phase 2: snappy 1-2 char letters/syllables
  }

  // Phase 3+: full words unlocked, syllables, and letters
  const wordW = Math.min(0.48, 0.20 + (p - 3) * 0.05);
  const sylW  = Math.min(0.38, 0.25 + (p - 3) * 0.02);
  const r = Math.random();
  if (r < wordW && state.unlockedWords.length > 0) return 'word';
  if (r < wordW + sylW) return 'syllable';
  return 'letter';
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
    // Phase 3+ only: Wildcard words & regular words
    if (state.phase >= 3 && state.unlockedWords.length >= 3 && Math.random() < CFG.wildcardChance) {
      return { text: pick(WILDCARD_WORDS), type: 'wildcard', skill: null };
    }
    if (state.unlockedWords.length === 0) {
      text = randLetter();
      return { text, type: 'letter', skill: null };
    }
    const maxLen = (typeof getMaxWordLengthForDifficulty === 'function')
      ? getMaxWordLengthForDifficulty(state.difficulty)
      : Infinity;
    const eligibleWords = state.unlockedWords.filter(w => (w.text || '').length <= maxLen);
    const candidatePool = eligibleWords.length > 0 ? eligibleWords : state.unlockedWords;
    text = pick(candidatePool).text.toUpperCase();
    // Rare chance to contain skill
    if (Math.random() < CFG.wordSkillChance) {
      const avail = SKILLS_ALL.filter(s => !s.isItem && s.id !== 'extralife');
      if (avail.length > 0) skill = pick(avail);
    }
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
  if ((state.activeTimers?.haste || 0) > 0) {
    multVal += (typeof CFG !== 'undefined' && CFG.hasteSpeedBonus) ? CFG.hasteSpeedBonus : 0.5;
  }
  if ((state.activeTimers?.slowdown || 0) > 0) {
    multVal *= 0.4;
  }
  let base       = Math.max(CFG.spawnMin, CFG.spawnBase / multVal);
  if ((state.activeTimers?.dilation || 0) > 0) {
    base *= 1.8; // Dilates spacing between runics
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
  if (typeof animateQueueShift === 'function') {
    animateQueueShift();
  } else {
    renderQueue();
  }

  const boardW = gameArea.clientWidth || 420;
  const el     = document.createElement('div');

  let cls = `falling-item ${next.type}`;
  if (next.skill) cls += ' has-skill';
  el.className   = cls;
  el.textContent = next.text;

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
