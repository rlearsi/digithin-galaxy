/* ================================================
   DIGITHIN GALAXY — js/skills.js
   Skill actions, activations, timers, bombs & effects
   ================================================ */
'use strict';

function wildcardExplode(wildcardItem) {
  playSound('wildcard');
  showFeedback(typeof t === 'function' ? t('fb_wildcard_clean') : '💥 WILDCARD! TOTAL CLEAR!', 'special');

  let totalPts = 10;
  let destroyedChars = 0;
  state.activeItems.forEach(other => {
    if (other.id === wildcardItem.id) return;
    const pts = other.type === 'letter' ? 1 : other.type === 'syllable' ? 3 : wordPts(other.text);
    totalPts += pts;
    destroyedChars += (other.text?.length || 1);
    other.removing = true;
    other.el.classList.add('shattered');
    if (typeof spawnCelestialExplosion === 'function') {
      spawnCelestialExplosion(other.el, other.text);
    } else {
      spawnParticles(other.el, 3);
    }
    setTimeout(() => other.el?.parentNode?.removeChild(other.el), 280);
  });

  state.activeItems = [];
  if ((state.activeTimers?.haste || 0) > 0) totalPts = Math.floor(totalPts * 2);
  state.phasePts += totalPts;
  state.totalScore = (state.totalScore || 0) + totalPts;
  state.progress = Math.min(phaseGoal(), (state.progress || 0) + destroyedChars);

  document.body.style.animation = 'screenShake .4s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 420);

  updateHUD();
  checkPhaseComplete();
}

function gainSkill(skillId) {
  if (state.gameMode === 'training') return;
  // Only activatable skills can occupy slots (items like wordpack/extralife/continue are handled directly)
  if (typeof SKILLS_CONFIG !== 'undefined' && !SKILLS_CONFIG[skillId]) return;

  playSound('skill');
  const slot = state.skillSlots.find(s => s.id === skillId);
  if (slot) {
    slot.count++;
    slot.droppedCount = (slot.droppedCount || 0) + 1;
  } else if (state.skillSlots.length < 8) {
    state.skillSlots.push({ id: skillId, count: 1, droppedCount: 1, permanentCount: 0 });
  }
  const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[skillId]) || SKILLS_ALL.find(s => s.id === skillId);
  const skillName = (typeof t === 'function' && t(`skill_name_${skillId}`) !== `skill_name_${skillId}`)
    ? t(`skill_name_${skillId}`)
    : (def?.name || '');
  const skillMsg = typeof t === 'function' ? t('fb_skill_acquired', { skill: skillName }) : `⚡ Skill: ${skillName}!`;
  showFeedback(skillMsg, 'special');
  updateHUD();
}

function activateSkill(idx) {
  if (state.gameMode === 'training') return;
  const slot = state.skillSlots[idx];
  if (!slot || slot.count <= 0) return;

  slot.count--;
  const skillId = slot.id;

  // Consome primeiro os drops da sessão; se não houver drops, consome do permanente
  if ((slot.droppedCount || 0) > 0) {
    slot.droppedCount--;
  } else {
    if (typeof deductPermanentSkill === 'function') {
      deductPermanentSkill(skillId, 1);
    }
    if ((slot.permanentCount || 0) > 0) {
      slot.permanentCount--;
    }
  }

  const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[skillId]) || SKILLS_ALL.find(s => s.id === skillId);
  const dur = (def && def.duration) ? def.duration : 10000;

  playSound('skill');

  state.activeTimers[skillId] = (state.activeTimers[skillId] || 0) + dur;

  // Centralized onActivate handler
  if (def && typeof def.onActivate === 'function') {
    def.onActivate(state);
  }

  // Localized feedback
  const durSec = Math.round(dur / 1000);
  const activateMsgKey = `fb_${skillId}_activated`;
  const msg = (typeof t === 'function' && t(activateMsgKey) !== activateMsgKey)
    ? t(activateMsgKey)
    : (def?.activateMsg || `⚡ ${def?.name || skillId} (${durSec}s)!`);

  showFeedback(msg, 'special');
  updateHUD();
}

// Nova habilidade Eco Cósmico (autodestroy): a cada 5s destrói palavras aprendidas
function triggerAutodestroyLearnedWord() {
  if (!state || state.paused || (state.activeTimers?.autodestroy || 0) <= 0) return;

  const learnedTexts = new Set((state.unlockedWords || []).map(w => (w.text || '').toUpperCase()));
  if (state.wordStats) {
    Object.keys(state.wordStats).forEach(k => {
      if ((state.wordStats[k]?.count || 0) > 0) {
        learnedTexts.add(k.toUpperCase());
      }
    });
  }

  const candidates = state.activeItems.filter(item =>
    !item.removing &&
    item.type === 'word' &&
    learnedTexts.has((item.text || '').toUpperCase())
  );

  if (candidates.length === 0) return;

  // Escolhe a palavra aprendida mais urgente (mais próxima do fundo)
  const victim = candidates.reduce((lowest, item) => item.y > lowest.y ? item : lowest);
  victim.removing = true;
  victim.el.classList.add('shattered');
  playSound('skill');

  if (typeof spawnCelestialExplosion === 'function') {
    spawnCelestialExplosion(victim.el, victim.text);
  } else {
    spawnParticles(victim.el, victim.text.length * 2);
  }

  let pts = wordPts(victim.text);
  if (state.activeTimers?.haste > 0) pts = Math.floor(pts * 2);

  state.phasePts += pts;
  state.totalScore = (state.totalScore || 0) + pts;

  // Farm de moedas: a cada 10 palavras completadas ganha 1 moeda
  state.wordsDestroyedForCoin = (state.wordsDestroyedForCoin || 0) + 1;
  state.totalWordsCompletedMatch = (state.totalWordsCompletedMatch || 0) + 1;
  if (state.wordsDestroyedForCoin >= 10) {
    state.wordsDestroyedForCoin = 0;
    if (typeof addSharedCoins === 'function') addSharedCoins(1);
    state.coins = (typeof getSharedCoins === 'function') ? getSharedCoins() : (state.coins || 0) + 1;
    state.totalCoinsEarned = (state.totalCoinsEarned || 0) + 1;
    if (typeof playSound === 'function') playSound('buy');
    const coinMsg = typeof t === 'function' ? t('fb_coin_farmed') : '+1 Coin farmed! 🪙';
    showFeedback(coinMsg, 'success');
  }

  const shatterMsg = typeof t === 'function'
    ? t('fb_autodestroy_shattered', { word: victim.text, pts })
    : `⚡ Auto-shattered: ${victim.text}! +${pts}`;
  showFeedback(shatterMsg, 'special');

  setTimeout(() => {
    victim.el?.parentNode?.removeChild(victim.el);
    state.activeItems = state.activeItems.filter(i => i.id !== victim.id);
  }, 240);

  updateHUD();
}

function triggerBombAreaExplosion(sourceItem) {
  playSound('bomb');

  const r     = sourceItem.el.getBoundingClientRect();
  const gRect = gameArea.getBoundingClientRect();
  const cx    = (r.left + r.width  / 2) - gRect.left;
  const cy    = (r.top  + r.height / 2) - gRect.top;

  // Quanto mais letras tem o vocábulo, maior é o raio da explosão.
  // 1 letra destrói 1 linha, 5 letras destroem 5 linhas, 10 letras destroem 10 linhas, etc.
  const numLetters = Math.max(1, (sourceItem.text || '').length);
  const LINE_HEIGHT = 45; // Altura média vertical de uma linha de rúnicos
  const radius = Math.max(55, numLetters * LINE_HEIGHT);

  createExplosionRing(cx, cy, radius, sourceItem.type === 'word' || numLetters >= 4);

  let extraPts = 0;
  let destroyedChars = 0;
  state.activeItems.forEach(other => {
    if (other.id === sourceItem.id || other.removing) return;
    const or   = other.el.getBoundingClientRect();
    const ox   = (or.left + or.width  / 2) - gRect.left;
    const oy   = (or.top  + or.height / 2) - gRect.top;
    const dist = Math.sqrt((ox - cx) ** 2 + (oy - cy) ** 2);
    const vertDist = Math.abs(oy - cy);

    // Destrói dentro do raio expansivo ou dentro da faixa vertical de linhas correspondente
    if (dist <= radius || vertDist <= (numLetters * LINE_HEIGHT / 2)) {
      extraPts += other.type === 'letter' ? 1 : other.type === 'syllable' ? 3 : wordPts(other.text);
      destroyedChars += (other.text?.length || 1);
      other.removing = true;
      other.el.classList.add('shattered');
      if (typeof spawnCelestialExplosion === 'function') {
        spawnCelestialExplosion(other.el, other.text);
      } else {
        spawnParticles(other.el, 3);
      }
      setTimeout(() => other.el?.parentNode?.removeChild(other.el), 260);
    }
  });

  state.activeItems = state.activeItems.filter(i => !i.removing);

  if (extraPts > 0) {
    if (state.activeTimers.haste > 0) extraPts = Math.floor(extraPts * 2);
    state.phasePts += extraPts;
    state.progress = Math.min(phaseGoal(), (state.progress || 0) + destroyedChars);
    const msg = (typeof t === 'function')
      ? t('fb_bomb_explosion', { lines: numLetters, pts: extraPts })
      : `💥 Explosion (${numLetters} lines)! +${extraPts}`;
    showFeedback(msg, 'special');
  }
}

// Vortex effect: devours 1 non-targeted token
function triggerVortexDevour() {
  const candidates = state.activeItems.filter(item =>
    !item.removing && (!state.typedBuffer || !item.text.startsWith(state.typedBuffer))
  );

  if (candidates.length === 0) return;

  // Pick lowest candidate (most urgent)
  const victim = candidates.reduce((lowest, item) => item.y > lowest.y ? item : lowest);
  victim.removing = true;
  victim.el.classList.add('swallowing');
  playSound('skill');
  setTimeout(() => victim.el?.parentNode?.removeChild(victim.el), 440);

  let pts = victim.type === 'letter' ? 1 : victim.type === 'syllable' ? 3 : wordPts(victim.text);
  if (state.activeTimers.haste > 0) pts = Math.floor(pts * 2);

  state.phasePts += pts;
  state.progress = Math.min(phaseGoal(), (state.progress || 0) + (victim.text?.length || 1));

  const vortexMsg = typeof t === 'function'
    ? t('fb_vortex_devour', { text: victim.text, pts })
    : `🌀 Vortex devoured ${victim.text}! +${pts}`;
  showFeedback(vortexMsg, 'special');

  setTimeout(() => {
    victim.el?.parentNode?.removeChild(victim.el);
    state.activeItems = state.activeItems.filter(i => i.id !== victim.id);
    checkFreezerAutoCancel();
  }, 240);

  updateHUD();
  checkPhaseComplete();
}

function checkFreezerAutoCancel() {
  if (state.activeTimers.freezer > 0 && state.activeItems.length === 0 && !state.bossBattle?.active) {
    state.activeTimers.freezer = 0;
    state.skillSlots = state.skillSlots.filter(s => !(s.id === 'freezer' && s.count <= 0));
    showFeedback(typeof t === 'function' ? t('fb_ice_cleared') : '❄️ Screen cleared — Freeze deactivated!', 'special');
    updateHUD();
  }
}

function onSkillExpired(skillId) {
  const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[skillId]) || SKILLS_ALL.find(s => s.id === skillId);

  // Centralized onExpire callback
  if (def && typeof def.onExpire === 'function') {
    def.onExpire(state);
  }

  // Localized feedback
  const expireMsgKey = `fb_${skillId}_expired`;
  const msg = (typeof t === 'function' && t(expireMsgKey) !== expireMsgKey)
    ? t(expireMsgKey)
    : (def?.expireMsg || `${def?.name || skillId} expired`);

  showFeedback(msg, 'special');

  // Remove skill slot from state.skillSlots only when duration has expired and count is 0
  state.skillSlots = state.skillSlots.filter(s => !(s.id === skillId && s.count <= 0));

  updateHUD();
}
