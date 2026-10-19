/* ================================================
   DIGITHIN GALAXY — js/levelup-ui.js
   Level-up modal UI and selection logic
   ================================================ */
'use strict';

// ============================================================
// LEVEL UP MODAL UI & SELECTION LOGIC
// ============================================================
function showLevelUpModal(choices, onPick) {
  const modal = document.getElementById('modal-levelup');
  const grid = document.getElementById('levelup-skills-grid');
  const subEl = document.getElementById('levelup-sub-text') || (modal && modal.querySelector('.levelup-sub'));
  if (!modal || !grid) return;

  grid.innerHTML = '';
  state.levelUpChoices = choices;
  state.onPickLevelUp = onPick;
  state.selectedLevelUpIndex = 0;

  if (subEl) {
    const displayLvl = (state && state.level) ? state.level : 1;
    subEl.textContent = typeof t === 'function' ? t('levelup_sub', { level: displayLvl }) : `You reached Level ${displayLvl}!`;
  }

  choices.forEach((skill, index) => {
    const curLevel = state.runPerks?.[skill.id] || 0;
    const isUpgrade = curLevel > 0;
    const nextLevel = curLevel + 1;

    const sName = (typeof t === 'function' && t('skill_name_' + skill.id) !== ('skill_name_' + skill.id))
      ? t('skill_name_' + skill.id)
      : (skill.name || skill.id);

    let sDesc = '';
    if (skill.id === 'dilation') {
      const maxMultiplier = Math.min(5, 1 + nextLevel);
      sDesc = typeof t === 'function' ? t(skill.descKey, { max: maxMultiplier }) : `Spacing up to ${maxMultiplier}`;
    } else if (skill.id === 'bomb') {
      sDesc = typeof t === 'function' ? t(skill.descKey, { level: nextLevel, max: 5 }) : `Explosion radius level ${nextLevel}`;
    } else if (skill.id === 'decoder') {
      const lvlKey = `skill_desc_decoder_lvl${nextLevel}`;
      sDesc = (typeof t === 'function' && t(lvlKey) !== lvlKey)
        ? t(lvlKey)
        : (nextLevel === 1 ? 'Efeito exclusivo no Chefão: decifra e revela a 1ª letra da palavra.' : 'Efeito exclusivo no Chefão: decifra e revela a 1ª letra e mais uma letra aleatória da palavra.');
    } else if (skill.durationByLevel) {
      const dur = Math.round(getSkillDuration(skill.id, nextLevel) / 1000);
      sDesc = typeof t === 'function'
        ? t(skill.descKey, { duration: dur, level: nextLevel, max: skill.maxLevel || 5 })
        : (skill.desc || `${dur}s`);
    } else {
      sDesc = (typeof t === 'function' && t(skill.descKey) !== skill.descKey)
        ? t(skill.descKey)
        : (skill.desc || '');
    }

    const card = document.createElement('div');
    const isSelected = (index === state.selectedLevelUpIndex);
    card.className = 'levelup-skill-card' + (isSelected ? ' levelup-skill-card-selected' : '');
    card.setAttribute('data-choice-index', String(index));
    card.style.setProperty('--item-clr', skill.color || 'var(--accent-primary)');

    const pickTxt = typeof t === 'function' && t('levelup_btn_pick') ? t('levelup_btn_pick') : 'Choose';
    const isMax = (nextLevel >= (skill.maxLevel || 99));
    const lvlStr = typeof t === 'function' && t('hud_perk_lvl', { lvl: nextLevel }) !== 'hud_perk_lvl'
      ? t('hud_perk_lvl', { lvl: nextLevel })
      : `Nv. ${nextLevel}`;
    const maxStr = typeof t === 'function' && t('hud_perk_max') !== 'hud_perk_max' ? t('hud_perk_max') : 'MÁX';
    const upStr = typeof t === 'function' && t('hud_perk_upgrade') !== 'hud_perk_upgrade' ? t('hud_perk_upgrade') : 'Upgrade';
    const newStr = typeof t === 'function' && t('hud_perk_new') !== 'hud_perk_new' ? t('hud_perk_new') : 'NOVA';
    const tagTxt = isUpgrade ? `${lvlStr} (${isMax ? maxStr : upStr})` : newStr;

    card.innerHTML = `
      <kbd class="card-key-hint" aria-hidden="true">${index + 1}</kbd>
      <div class="levelup-card-badge">${tagTxt}</div>
      <div class="levelup-skill-icon-wrap" style="--item-clr: ${skill.color || 'var(--accent-primary)'}">
        <img class="levelup-skill-img" src="${skill.image || `assets/skills/${skill.id}.webp`}" alt="${sName}" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
        <span class="levelup-skill-svg-fallback" style="display:none; color:${skill.color || 'var(--accent-primary)'}">${getSkillSvgIcon(skill.id) || skill.icon}</span>
      </div>
      <div class="levelup-skill-name">${sName}</div>
      <div class="levelup-skill-desc">${sDesc}</div>
      <button class="levelup-skill-pick-btn" type="button">${pickTxt}</button>
    `;

    card.addEventListener('mouseenter', () => {
      state.selectedLevelUpIndex = index;
      updateLevelUpSelectionVisual();
    });
    card.addEventListener('click', (e) => {
      if (e.target.closest('.levelup-skill-pick-btn')) return;
      selectLevelUpIndex(index);
    });
    const btn = card.querySelector('.levelup-skill-pick-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLevelUpModal();
        if (typeof onPick === 'function') onPick(skill);
      });
    }
    grid.appendChild(card);
  });

  modal.classList.remove('hidden');
}

function selectLevelUpIndex(index) {
  state.selectedLevelUpIndex = index;
  updateLevelUpSelectionVisual();
  const choice = state.levelUpChoices?.[index];
  if (choice && typeof state.onPickLevelUp === 'function') {
    const cb = state.onPickLevelUp;
    closeLevelUpModal();
    cb(choice);
  }
}

function pickLevelUpSkillByIndex(index) {
  selectLevelUpIndex(index);
}

function pickSelectedLevelUpSkill() {
  const idx = state.selectedLevelUpIndex || 0;
  selectLevelUpIndex(idx);
}

function navigateLevelUp(dir) {
  if (!state.levelUpChoices || state.levelUpChoices.length === 0) return;
  const count = state.levelUpChoices.length;
  if (dir === 'next') {
    state.selectedLevelUpIndex = (state.selectedLevelUpIndex + 1) % count;
  } else {
    state.selectedLevelUpIndex = (state.selectedLevelUpIndex - 1 + count) % count;
  }
  updateLevelUpSelectionVisual();
}

function updateLevelUpSelectionVisual() {
  const cards = document.querySelectorAll('.levelup-skill-card');
  cards.forEach((c, idx) => {
    c.classList.toggle('levelup-skill-card-selected', idx === state.selectedLevelUpIndex);
  });
}

function closeLevelUpModal() {
  const modal = document.getElementById('modal-levelup');
  if (modal) modal.classList.add('hidden');
  state.levelUpChoices = null;
  state.onPickLevelUp = null;
  state.selectedLevelUpIndex = 0;
}

window.showLevelUpModal = showLevelUpModal;
window.closeLevelUpModal = closeLevelUpModal;
window.pickLevelUpSkillByIndex = pickLevelUpSkillByIndex;
window.pickSelectedLevelUpSkill = pickSelectedLevelUpSkill;
window.navigateLevelUp = navigateLevelUp;
window.renderRunPerks = renderRunPerks;
