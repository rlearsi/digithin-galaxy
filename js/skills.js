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
  // Exclude 'dilation' if already at maxLevel (4)
  const eligibleSkills = SKILLS_LIST.filter(s => {
    if (s.id === 'dilation') {
      const curLvl = state.runPerks?.dilation || 0;
      return curLvl < (s.maxLevel || 4);
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

  if (skillId === 'dilation') {
    const curLevel = state.runPerks.dilation;
    const maxMultiplier = Math.min(5, 1 + curLevel);
    const msg = typeof t === 'function' ? t('fb_dilation_upgraded', { max: maxMultiplier }) : `Spacing upgraded up to ${maxMultiplier}!`;
    showFeedback(msg, 'special');
  } else {
    // For periodic skills:
    // If acquiring for the first time, give quick first-trigger in 3s so the player enjoys it immediately!
    if (state.skillCooldowns[skillId] === undefined) {
      state.skillCooldowns[skillId] = 3000;
    }
    const skillName = (typeof t === 'function' && t(`skill_name_${skillId}`) !== `skill_name_${skillId}`)
      ? t(`skill_name_${skillId}`)
      : (def?.name || skillId);
    const msg = typeof t === 'function' ? `⚡ ${skillName}!` : `⚡ ${skillName}!`;
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
  const def = SKILLS_CONFIG[skillId];
  if (!def) return;

  state.activeSkill = skillId;
  state.activeTimers[skillId] = def.duration || 10000;

  if (typeof def.onActivate === 'function') {
    def.onActivate(state);
  }

  if (skillId === 'bomb') {
    if (typeof playSound === 'function') playSound('bomb');
  } else {
    if (typeof playSound === 'function') playSound('skill');
  }

  const skillName = (typeof t === 'function' && t(`skill_name_${skillId}`) !== `skill_name_${skillId}`)
    ? t(`skill_name_${skillId}`)
    : (def.name || skillId);
  const durSec = Math.round((def.duration || 10000) / 1000);
  const activateMsgKey = `fb_${skillId}_activated`;
  const msg = (typeof t === 'function' && t(activateMsgKey) !== activateMsgKey)
    ? t(activateMsgKey)
    : `⚡ ${skillName} (${durSec}s)!`;

  showFeedback(msg, 'special');
  updateHUD();
  if (typeof renderRunPerks === 'function') renderRunPerks();
}

function onSkillExpired(skillId) {
  const def = SKILLS_CONFIG[skillId];
  if (def && typeof def.onExpire === 'function') {
    def.onExpire(state);
  }

  const expireMsgKey = `fb_${skillId}_expired`;
  const msg = (typeof t === 'function' && t(expireMsgKey) !== expireMsgKey)
    ? t(expireMsgKey)
    : `${def?.name || skillId} finished`;

  if (skillId === 'autodestroy') {
    clearEcoTargetingIndicator();
  }

  showFeedback(msg, 'special');
  updateHUD();
  if (typeof renderRunPerks === 'function') renderRunPerks();
}

// ============================================================
// 3. SCREEN BLASTS & COSMIC ABILITY EFFECTS
// ============================================================

function triggerScreenBombExplosion() {
  if (!gameArea) return;
  playSound('bomb');

  const gRect = gameArea.getBoundingClientRect();
  const cx = gRect.width / 2;
  const cy = gRect.height / 2;
  const radius = Math.max(cx, cy) * 1.5;

  if (typeof createExplosionRing === 'function') {
    createExplosionRing(cx, cy, radius, true);
  }

  let extraPts = 0;
  let totalChars = 0;

  state.activeItems.forEach(item => {
    if (item.removing) return;
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

  state.activeItems = [];

  if (extraPts > 0) {
    if ((state.activeTimers?.haste || 0) > 0) extraPts = Math.floor(extraPts * 2);
    state.phasePts += extraPts;
    state.totalScore = (state.totalScore || 0) + extraPts;
    addPlayerXp(Math.max(10, totalChars * 2));
    const msg = typeof t === 'function' ? t('fb_bomb_explosion', { lines: 5, pts: extraPts }) : `💥 Cosmic Blast! +${extraPts}`;
    showFeedback(msg, 'special');
  }

  document.body.style.animation = 'screenShake .4s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 420);
  updateHUD();
}

function triggerVortexScreenSuck() {
  if (!gameArea) return;
  playSound('skill');

  let extraPts = 0;
  let totalChars = 0;

  state.activeItems.forEach(item => {
    if (item.removing) return;
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
