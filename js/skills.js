/* ================================================
   DIGITHIN GALAXY — js/skills.js
   Periodic skills, Roguelike Perks, XP & Level-Up,
   Skill queueing, Screen blasts & cosmic effects
   ================================================ */
'use strict';

// ============================================================
// 1. XP & ROGUELIKE LEVEL-UP SYSTEM
// ============================================================

function addPlayerXp(amount) {
  if (!state || state.gameMode === 'training') return;
  const xpGain = Math.max(0, Math.floor(amount || 0));
  if (xpGain <= 0) return;

  state.currentXp = (state.currentXp || 0) + xpGain;

  // Check Level-Up threshold (can level up multiple times if huge XP gained)
  if (state.currentXp >= state.xpRequired) {
    state.currentXp -= state.xpRequired;
    state.level = (state.level || 1) + 1;
    state.xpRequired = getRequiredXpForLevel(state.level);

    triggerLevelUp();
  }

  updateHUD();
}

function triggerLevelUp() {
  state.paused = true;
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  clearTimeout(state.spawnTimer);
  state.spawnTimer = null;

  if (typeof playSound === 'function') {
    playSound('level_up');
  }

  const lvlMsg = typeof t === 'function' ? t('fb_levelup', { level: state.level }) : `LEVEL ${state.level}! CHOOSE A SKILL!`;
  showFeedback(lvlMsg, 'special');

  // Build pool of eligible level-up skills:
  // Exclude skills that have reached their maxLevel
  const eligibleSkills = SKILLS_LIST.filter(s => {
    const curLvl = state.runPerks?.[s.id] || 0;
    if (s.maxLevel && curLvl >= s.maxLevel) {
      return false;
    }
    return true;
  });

  const choices = shuffle(eligibleSkills).slice(0, 3);
  if (typeof showLevelUpModal === 'function') {
    showLevelUpModal(choices, (chosenSkill) => {
      applyChosenLevelUpSkill(chosenSkill.id);
    });
  }
}

function applyChosenLevelUpSkill(skillId) {
  if (!state.runPerks) state.runPerks = {};
  state.runPerks[skillId] = (state.runPerks[skillId] || 0) + 1;

  const def = SKILLS_CONFIG[skillId];
  const curLevel = state.runPerks[skillId];

  // For periodic skills, if acquiring for the first time, give quick first-trigger in 3s so the player enjoys it immediately!
  if (def?.type === 'periodic' && state.skillCooldowns[skillId] === undefined) {
    state.skillCooldowns[skillId] = 3000;
  }

  if (skillId === 'dilation') {
    const maxMultiplier = Math.min(5, 1 + curLevel);
    const msg = typeof t === 'function' ? t('fb_dilation_upgraded', { max: maxMultiplier }) : `Spacing upgraded up to ${maxMultiplier}!`;
    showFeedback(msg, 'special');
  } else if (skillId === 'shield') {
    const dur = [10, 20, 30, 40, 50][Math.min(5, Math.max(1, curLevel)) - 1];
    const msg = typeof t === 'function'
      ? t('fb_shield_upgraded', { dur, level: curLevel })
      : `🛡️ Escudo de Plasma Nv. ${curLevel} (${dur}s)!`;
    showFeedback(msg, 'special');
  } else if (skillId === 'bomb') {
    const isMax = curLevel >= 5;
    const msg = typeof t === 'function'
      ? t('fb_bomb_upgraded', { level: curLevel })
      : (isMax ? `💣 Bomba Estelar Nv. ${curLevel} (MÁX)!` : `💣 Bomba Estelar Nv. ${curLevel}!`);
    showFeedback(msg, 'special');
  } else if (skillId === 'decoder') {
    const msg = typeof t === 'function'
      ? t('fb_decoder_upgraded', { level: curLevel })
      : `🔍 Decodificador Cósmico Nv. ${curLevel}!`;
    showFeedback(msg, 'special');
  } else if (def?.durationByLevel) {
    const dur = Math.round(getSkillDuration(skillId, curLevel) / 1000);
    const isMax = curLevel >= (def.maxLevel || 5);
    const upgKey = `fb_${skillId}_upgraded`;
    const skillName = (typeof t === 'function' && t(`skill_name_${skillId}`) !== `skill_name_${skillId}`)
      ? t(`skill_name_${skillId}`)
      : (def?.name || skillId);
    const msg = (typeof t === 'function' && t(upgKey, { dur, level: curLevel }) !== upgKey)
      ? t(upgKey, { dur, level: curLevel })
      : `⚡ ${skillName} Nv. ${curLevel} (${dur}s)${isMax ? ' (MÁX)' : ''}!`;
    showFeedback(msg, 'special');
  } else {
    const skillName = (typeof t === 'function' && t(`skill_name_${skillId}`) !== `skill_name_${skillId}`)
      ? t(`skill_name_${skillId}`)
      : (def?.name || skillId);
    const msg = `⚡ ${skillName}!`;
    showFeedback(msg, 'special');
  }

  if (typeof playSound === 'function') {
    playSound('skill');
  }

  if (typeof renderRunPerks === 'function') {
    renderRunPerks();
  }

  // Resume gameplay
  state.paused = false;
  state.lastTs = null;
  state.rafId = requestAnimationFrame(gameLoop);
  if (typeof scheduleSpawn === 'function') {
    scheduleSpawn();
  }
  updateHUD();

  // If excess XP carries over to trigger consecutive level-ups
  if (state.currentXp >= state.xpRequired) {
    state.currentXp -= state.xpRequired;
    state.level = (state.level || 1) + 1;
    state.xpRequired = getRequiredXpForLevel(state.level);
    triggerLevelUp();
  } else {
    // Sorteio do Alien Boss entre uma fase e outra após completar o XP do level
    if (typeof checkBossSpawnOnLevelComplete === 'function') {
      checkBossSpawnOnLevelComplete();
    }
  }
}

// ============================================================
// 2. PERIODIC SKILLS TICKING & QUEUE MANAGEMENT
// ============================================================

function updatePeriodicSkills(dt) {
  if (!state || state.paused || state.phaseComplete || state.gameMode === 'training') return;
  if (!state.runPerks) return;

  // 1. Tick cooldowns for periodic skills
  for (const skillId in state.runPerks) {
    const def = SKILLS_CONFIG[skillId];
    if (!def || def.type !== 'periodic') continue;

    // A habilidade "bomb" fica estritamente desabilitada durante todo o confronto com o Boss
    if (skillId === 'bomb' && state.bossBattle && state.bossBattle.active) {
      continue;
    }

    // If currently running active effect:
    if ((state.activeTimers?.[skillId] || 0) > 0) {
      if (skillId === 'autodestroy') {
        updateEcoTargetingIndicator();
        state.autodestroyAccum = (state.autodestroyAccum || 0) + dt;
        if (state.autodestroyAccum >= 1.8) {
          state.autodestroyAccum = 0;
          triggerAutodestroyLearnedWord();
        }
      }
      continue;
    }

    // Tick cooldown
    if (state.skillCooldowns[skillId] === undefined) {
      state.skillCooldowns[skillId] = def.interval || 60000;
    }
    state.skillCooldowns[skillId] -= dt * 1000;

    if (state.skillCooldowns[skillId] <= 0) {
      state.skillCooldowns[skillId] = def.interval || 60000;

      // Queue rule: if another skill is active, queue it up!
      if (state.activeSkill) {
        if (!state.skillQueue.includes(skillId)) {
          state.skillQueue.push(skillId);
          if (typeof renderRunPerks === 'function') renderRunPerks();
        }
      } else {
        firePeriodicSkill(skillId);
      }
    }
  }

  // 2. Tick current active skill duration
  if (state.activeSkill) {
    const activeId = state.activeSkill;
    if (state.activeTimers[activeId] > 0) {
      state.activeTimers[activeId] -= dt * 1000;
      if (state.activeTimers[activeId] <= 0) {
        state.activeTimers[activeId] = 0;
        state.activeSkill = null;
        onSkillExpired(activeId);

        // Next queued skill fires immediately!
        if (state.skillQueue && state.skillQueue.length > 0) {
          const nextSkill = state.skillQueue.shift();
          firePeriodicSkill(nextSkill);
        }
      }
    }
  }
}

function firePeriodicSkill(skillId) {
  // A habilidade "bomb" não pode ser disparada durante o Boss
  if (skillId === 'bomb' && state.bossBattle && state.bossBattle.active) return;

  const def = SKILLS_CONFIG[skillId];
  if (!def) return;

  state.activeSkill = skillId;
  const curLvl = state.runPerks?.[skillId] || 1;
  const duration = (typeof getSkillDuration === 'function')
    ? getSkillDuration(skillId, curLvl)
    : (def.duration || 10000);
  state.activeTimers[skillId] = duration;

  if (typeof def.onActivate === 'function') {
    def.onActivate(state);
  }

  if (skillId !== 'bomb') {
    if (typeof playSound === 'function') playSound('skill');

    const skillName = (typeof t === 'function' && t(`skill_name_${skillId}`) !== `skill_name_${skillId}`)
      ? t(`skill_name_${skillId}`)
      : (def.name || skillId);
    const durSec = Math.round(duration / 1000);
    const activateMsgKey = `fb_${skillId}_activated`;
    const msg = (typeof t === 'function' && t(activateMsgKey, { dur: durSec }) !== activateMsgKey)
      ? t(activateMsgKey, { dur: durSec })
      : `⚡ ${skillName} (${durSec}s)!`;

    showFeedback(msg, 'special');
  }

  updateHUD();
  if (typeof renderRunPerks === 'function') renderRunPerks();
}

function onSkillExpired(skillId) {
  const def = SKILLS_CONFIG[skillId];
  if (def && typeof def.onExpire === 'function') {
    def.onExpire(state);
  }

  if (skillId === 'autodestroy') {
    clearEcoTargetingIndicator();
  }

  // Habilidade instantânea (bomb) já exibiu seu feedback de impacto e não precisa de mensagem de expiração
  if (skillId !== 'bomb') {
    const expireMsgKey = `fb_${skillId}_expired`;
    const msg = (typeof t === 'function' && t(expireMsgKey) !== expireMsgKey)
      ? t(expireMsgKey)
      : `${def?.name || skillId} finished`;
    showFeedback(msg, 'special');
  }

  updateHUD();
  if (typeof renderRunPerks === 'function') renderRunPerks();
}

// ============================================================
// 3. SCREEN BLASTS & COSMIC ABILITY EFFECTS
// ============================================================

function triggerScreenBombExplosion() {
  if (!gameArea || (state.bossBattle && state.bossBattle.active)) return;
  playSound('bomb');

  const gRect = gameArea.getBoundingClientRect();
  const cx = gRect.width / 2;
  const cy = gRect.height / 2;
  const bombLvl = Math.min(5, Math.max(1, state.runPerks?.bomb || 1));
  const isFullScreen = (bombLvl >= 5);

  let radius;
  if (isFullScreen) {
    radius = Math.max(cx, cy) * 1.5;
  } else {
    // Escala progressiva do raio de Nv 1 a Nv 4:
    // Nv 1: raio compacto central (~25% da diagonal do tabuleiro)
    // Nv 2: raio intermediário (~44%)
    // Nv 3: raio amplo (~63%)
    // Nv 4: quase a tela toda (~82%)
    // Nv 5: tela toda (100%+)
    const baseRadius = Math.hypot(cx, cy);
    const fraction = 0.25 + (bombLvl - 1) * 0.19;
    radius = Math.round(baseRadius * fraction);
  }

  if (typeof createExplosionRing === 'function') {
    createExplosionRing(cx, cy, radius, isFullScreen);
  }

  let extraPts = 0;
  let totalChars = 0;
  const hitItems = [];
  const remainingItems = [];

  state.activeItems.forEach(item => {
    if (item.removing || item.isBossMeaning) return;

    let isHit = false;
    if (isFullScreen) {
      isHit = true;
    } else {
      let itemX = item.x;
      let itemY = item.y;
      let itemW = 60;
      let itemH = 36;
      if (item.el) {
        const iRect = item.el.getBoundingClientRect();
        itemX = (iRect.left - gRect.left) + iRect.width / 2;
        itemY = (iRect.top - gRect.top) + iRect.height / 2;
        itemW = iRect.width;
        itemH = iRect.height;
      }
      const dist = Math.hypot(itemX - cx, itemY - cy);
      if (dist <= (radius + Math.max(itemW, itemH) / 2)) {
        isHit = true;
      }
    }

    if (isHit) {
      hitItems.push(item);
    } else {
      remainingItems.push(item);
    }
  });

  state.activeItems = remainingItems;

  hitItems.forEach(item => {
    item.removing = true;
    item.el?.classList.add('shattered');
    const pts = item.type === 'letter' ? 1 : item.type === 'syllable' ? 3 : wordPts(item.text);
    extraPts += pts;
    totalChars += (item.text?.length || 1);
    if (typeof spawnCelestialExplosion === 'function') {
      spawnCelestialExplosion(item.el, item.text);
    } else if (typeof spawnParticles === 'function') {
      spawnParticles(item.el, 4);
    }
    setTimeout(() => item.el?.parentNode?.removeChild(item.el), 280);
  });

  // Limpa buffer de digitação se o alvo digitado foi destruído e não há outro equivalente
  if (state.typedBuffer && hitItems.some(it => it.text && it.text.startsWith(state.typedBuffer))) {
    const stillHasPrefix = state.activeItems.some(it => !it.removing && it.text && it.text.startsWith(state.typedBuffer));
    if (!stillHasPrefix) {
      state.typedBuffer = '';
      if (typeof clearHighlight === 'function') clearHighlight();
    }
  }

  if (extraPts > 0) {
    if ((state.activeTimers?.haste || 0) > 0) extraPts = Math.floor(extraPts * 2);
    state.phasePts += extraPts;
    state.totalScore = (state.totalScore || 0) + extraPts;
    addPlayerXp(Math.max(10, totalChars * 2));
    const msg = typeof t === 'function'
      ? t('fb_bomb_explosion', { lines: hitItems.length, pts: extraPts, lvl: bombLvl })
      : `💥 Cosmic Blast! +${extraPts}`;
    showFeedback(msg, 'special');
  } else if (!isFullScreen) {
    const shockwaveKey = 'fb_bomb_shockwave';
    const msg = typeof t === 'function' && t(shockwaveKey, { lvl: bombLvl }) !== shockwaveKey
      ? t(shockwaveKey, { lvl: bombLvl })
      : `💥 Onda de Choque Nv. ${bombLvl}!`;
    showFeedback(msg, 'special');
  }

  document.body.style.animation = 'screenShake .4s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 420);
  updateHUD();
}

function triggerVortexScreenSuck() {
  if (!gameArea || (state.bossBattle && state.bossBattle.active)) return;
  playSound('skill');

  let extraPts = 0;
  let totalChars = 0;

  state.activeItems.forEach(item => {
    if (item.removing || item.isBossMeaning) return;
    item.removing = true;
    item.el?.classList.add('swallowing');
    const pts = item.type === 'letter' ? 1 : item.type === 'syllable' ? 3 : wordPts(item.text);
    extraPts += pts;
    totalChars += (item.text?.length || 1);
    setTimeout(() => item.el?.parentNode?.removeChild(item.el), 400);
  });

  state.activeItems = [];

  if (extraPts > 0) {
    if ((state.activeTimers?.haste || 0) > 0) extraPts = Math.floor(extraPts * 2);
    state.phasePts += extraPts;
    state.totalScore = (state.totalScore || 0) + extraPts;
    addPlayerXp(Math.max(10, totalChars * 2));
    const msg = typeof t === 'function' ? `🌀 Vortex devoured screen! +${extraPts}` : `🌀 Vortex devoured screen! +${extraPts}`;
    showFeedback(msg, 'special');
  }

  document.body.style.animation = 'screenShake .35s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 380);
  updateHUD();
}

function triggerAutodestroyLearnedWord() {
  if (!state || state.paused || (state.activeTimers?.autodestroy || 0) <= 0) return;

  const runLearned = state.runWordsLearned || new Set();
  if (runLearned.size === 0) return;

  const candidates = state.activeItems.filter(item =>
    !item.removing &&
    item.type === 'word' &&
    runLearned.has((item.text || '').toLowerCase())
  );

  if (candidates.length === 0) return;

  // SMART TARGETING: Proteção de buffer (nunca destrói a palavra que o jogador está ativamente digitando)
  const unpickedCandidates = candidates.filter(item => !item.el?.classList.contains('typing-target'));
  if (unpickedCandidates.length === 0) {
    // Todas as palavras aprendidas na tela estão em digitação ativa pelo jogador; aguarda o próximo ciclo
    return;
  }

  const victim = unpickedCandidates.reduce((lowest, item) => item.y > lowest.y ? item : lowest);
  victim.removing = true;
  victim.el.classList.remove('eco-target');
  victim.el.querySelector('.eco-target-badge')?.remove();
  victim.el.classList.add('shattered');
  playSound('skill');

  if (typeof spawnCelestialExplosion === 'function') {
    spawnCelestialExplosion(victim.el, victim.text);
  } else if (typeof spawnParticles === 'function') {
    spawnParticles(victim.el, victim.text.length * 2);
  }

  let pts = wordPts(victim.text);
  if (state.activeTimers?.haste > 0) pts = Math.floor(pts * 2);

  state.phasePts += pts;
  state.totalScore = (state.totalScore || 0) + pts;
  addPlayerXp(Math.max(5, (victim.text?.length || 1) * 2));

  const shatterMsg = typeof t === 'function'
    ? t('fb_autodestroy_shattered', { word: victim.text, pts })
    : `⚡ Auto-shattered: ${victim.text}! +${pts}`;
  showFeedback(shatterMsg, 'special');

  setTimeout(() => {
    victim.el?.parentNode?.removeChild(victim.el);
    state.activeItems = state.activeItems.filter(i => i.id !== victim.id);
    updateEcoTargetingIndicator();
  }, 240);

  updateHUD();
}

function updateEcoTargetingIndicator() {
  if (!state || state.paused || (state.activeTimers?.autodestroy || 0) <= 0) {
    clearEcoTargetingIndicator();
    return;
  }

  const runLearned = state.runWordsLearned || new Set();
  const candidates = state.activeItems.filter(item =>
    !item.removing &&
    item.type === 'word' &&
    (runLearned.size === 0 || runLearned.has((item.text || '').toLowerCase())) &&
    !item.el?.classList.contains('typing-target')
  );

  const bestTarget = candidates.length > 0
    ? candidates.reduce((lowest, item) => item.y > lowest.y ? item : lowest)
    : null;

  state.activeItems.forEach(item => {
    if (bestTarget && item.id === bestTarget.id) {
      if (!item.el.classList.contains('eco-target')) {
        item.el.classList.add('eco-target');
        let badge = item.el.querySelector('.eco-target-badge');
        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'eco-target-badge';
          badge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="22"/></svg>';
          badge.title = typeof t === 'function' ? t('skill_name_autodestroy') : 'Eco Target';
          item.el.appendChild(badge);
        }
      }
    } else {
      if (item.el && item.el.classList.contains('eco-target')) {
        item.el.classList.remove('eco-target');
        item.el.querySelector('.eco-target-badge')?.remove();
      }
    }
  });
}

function clearEcoTargetingIndicator() {
  if (!state || !state.activeItems) return;
  state.activeItems.forEach(item => {
    if (item.el && item.el.classList.contains('eco-target')) {
      item.el.classList.remove('eco-target');
      item.el.querySelector('.eco-target-badge')?.remove();
    }
  });
}

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
  addPlayerXp(Math.max(10, destroyedChars * 2));

  document.body.style.animation = 'screenShake .4s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 420);

  updateHUD();
}

function checkFreezerAutoCancel() {
  if (state.activeTimers?.freezer > 0 && state.activeItems.length === 0 && !state.bossBattle?.active) {
    state.activeTimers.freezer = 0;
    state.activeSkill = null;
    showFeedback(typeof t === 'function' ? t('fb_ice_cleared') : '❄️ Screen cleared — Freeze deactivated!', 'special');
    updateHUD();
    if (state.skillQueue && state.skillQueue.length > 0) {
      const nextSkill = state.skillQueue.shift();
      firePeriodicSkill(nextSkill);
    }
  }
}

if (typeof window !== 'undefined') {
  window.addPlayerXp = addPlayerXp;
  window.triggerLevelUp = triggerLevelUp;
  window.applyChosenLevelUpSkill = applyChosenLevelUpSkill;
  window.updatePeriodicSkills = updatePeriodicSkills;
  window.firePeriodicSkill = firePeriodicSkill;
  window.triggerScreenBombExplosion = triggerScreenBombExplosion;
  window.triggerVortexScreenSuck = triggerVortexScreenSuck;
  window.triggerAutodestroyLearnedWord = triggerAutodestroyLearnedWord;
  window.wildcardExplode = wildcardExplode;
  window.checkFreezerAutoCancel = checkFreezerAutoCancel;
  window.updateEcoTargetingIndicator = updateEcoTargetingIndicator;
  window.clearEcoTargetingIndicator = clearEcoTargetingIndicator;
}
