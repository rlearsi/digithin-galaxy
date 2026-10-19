/* ================================================
   DIGITHIN GALAXY — js/skills-hud.js
   Skill icons, run perks sidebar and skill slots (desktop and mobile)
   ================================================ */
'use strict';

// Vector SVG Icons for Mobile Skills (Rule 11: 100% SVG, strictly no emojis)
function getSkillSvgIcon(skillId) {
  switch (skillId) {
    case 'freezer':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/></svg>`;
    case 'bomb':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="8"/><path d="m17 7 3-3M19 4h2M20 7V5"/></svg>`;
    case 'shield':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'vortex':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7a5 5 0 1 0 5 5"/></svg>`;
    case 'slowdown':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/></svg>`;
    case 'haste':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    case 'dilation':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l4 4"/><circle cx="12" cy="12" r="2"/></svg>`;
    case 'speedlock':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    case 'autodestroy':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-2 2.5h3L11 8"/><circle cx="12" cy="14" r="7"/><path d="m10 14 4 4m0-4-4 4"/></svg>`;
    case 'decoder':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20"/><circle cx="12" cy="12" r="3"/></svg>`;
    case 'extralife':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'continue':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m10 15 5-3-5-3v6z"/></svg>`;
    case 'coins_100':
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 9v6"/></svg>`;
    default:
      return `<svg class="msb-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
}

// Render active run perks in the sidebar
function renderRunPerks() {
  const container = document.getElementById('run-perks-container');
  if (!container) return;

  const perks = state.runPerks || {};
  const perkIds = Object.keys(perks);

  if (perkIds.length === 0) {
    const emptyHint = typeof t === 'function' ? t('hud_perks_empty') : 'Nenhuma habilidade adquirida ainda.<br/>Suba de nível para desbloquear!';
    if (container.dataset.emptyState !== 'true') {
      container.innerHTML = `<div class="empty-hint">${emptyHint}</div>`;
      container.dataset.emptyState = 'true';
      container.dataset.perksKey = '';
    }
    return;
  }
  container.dataset.emptyState = 'false';

  const bossStateStr = (state.bossBattle && state.bossBattle.active) ? 'boss:1' : 'boss:0';
  const currentKey = `${bossStateStr}|` + perkIds.map(id => `${id}:${perks[id]}`).join('|');
  const needsRebuild = (container.dataset.perksKey !== currentKey);

  if (needsRebuild) {
    container.innerHTML = '';
    container.dataset.perksKey = currentKey;
  }

  // Pre-defined SVG icons for statuses (Rule 11: 100% SVG, strictly NO emojis!)
  const svgPassive = `<svg class="perk-badge-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.267-8-12.362-8-5.096 0-5.096 8 0 8 5.095 0 7.267-8 12.362-8z"/></svg>`;
  const svgRunning = `<svg class="perk-badge-svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.5 3.5 3 6.5 3 10a6 6 0 1 1-12 0c0-3.5 2.5-6.5 3-10 1 2 2.5 3.5 3 4.5 1-1 2-2.5 3-4.5z"/></svg>`;
  const svgQueued = `<svg class="perk-badge-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14M5 2h14m-2 20v-5l-5-5 5-5V2M7 2v5l5 5-5 5v5"/></svg>`;
  const svgCd = `<svg class="perk-badge-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/></svg>`;

  perkIds.forEach(id => {
    const def = SKILLS_CONFIG[id];
    if (!def) return;
    const lvl = perks[id];
    const sName = (typeof t === 'function' && t('skill_name_' + id) !== ('skill_name_' + id))
      ? t('skill_name_' + id)
      : (def.name || id);

    const isBossDisabled = (id === 'bomb' && state.bossBattle && state.bossBattle.active);
    const isPassive = (def.type === 'passive');
    const isRunning = !isPassive && !isBossDisabled && (state.activeTimers && (state.activeTimers[id] || 0) > 0);
    const isQueued = !isPassive && !isBossDisabled && !isRunning && (state.skillQueue && state.skillQueue.includes(id));
    const timerSec = isRunning ? Math.ceil(state.activeTimers[id] / 1000) : 0;
    const cdSec = Math.max(0, Math.ceil((state.skillCooldowns?.[id] || 0) / 1000));

    // Dynamic classes: Passives ALWAYS get highlighted active color! Duration skills get active highlight while running!
    const cardClass = 'run-perk-card' +
      (isBossDisabled ? ' perk-boss-disabled' :
       isPassive ? ' perk-always-active' :
       isRunning ? ' perk-active' :
       isQueued ? ' perk-queued' : ' perk-cooldown');

    const isMaxLvl = Boolean(def.maxLevel && lvl >= def.maxLevel);
    const lvlPrefix = isMaxLvl
      ? ((typeof t === 'function' && t('hud_perk_lvl_max', { lvl: lvl }) !== 'hud_perk_lvl_max')
          ? t('hud_perk_lvl_max', { lvl: lvl })
          : `Nv. ${lvl} (MÁX)`)
      : ((typeof t === 'function' && t('hud_perk_lvl', { lvl: lvl }) !== 'hud_perk_lvl')
          ? t('hud_perk_lvl', { lvl: lvl })
          : `Nv. ${lvl}`);
    let subTypeTxt = '';
    let statusBadgeHtml = '';

    if (isBossDisabled) {
      subTypeTxt = typeof t === 'function' ? t('hud_perk_disabled_boss') : 'Inativa no Boss';
      statusBadgeHtml = `<span class="perk-status-badge perk-status-disabled">${svgCd}<span>${subTypeTxt}</span></span>`;
    } else if (isPassive) {
      subTypeTxt = typeof t === 'function' ? t('hud_perk_passive') : 'Passiva';
      if (id === 'decoder') {
        const badgeKey = `hud_perk_decoder_badge_${lvl}`;
        const badgeTxt = (typeof t === 'function' && t(badgeKey) !== badgeKey)
          ? t(badgeKey)
          : (lvl === 1 ? '1 Letra' : '2 Letras');
        statusBadgeHtml = `<span class="perk-status-badge perk-status-passive">${svgPassive}${badgeTxt}</span>`;
      } else {
        const maxMult = Math.min(5, 1 + lvl);
        statusBadgeHtml = `<span class="perk-status-badge perk-status-passive">${svgPassive}+${maxMult}×</span>`;
      }
    } else if (isRunning) {
      subTypeTxt = typeof t === 'function' ? t('hud_perk_active_label') : 'Ativa';
      statusBadgeHtml = `<span class="perk-status-badge perk-status-running">${svgRunning}${timerSec}s</span>`;
    } else if (isQueued) {
      subTypeTxt = typeof t === 'function' ? t('hud_perk_queue') : 'Fila';
      statusBadgeHtml = `<span class="perk-status-badge perk-status-queued">${svgQueued}<span>${subTypeTxt}</span></span>`;
    } else {
      subTypeTxt = typeof t === 'function' ? t('hud_perk_recharging') : 'Recarga';
      statusBadgeHtml = `<span class="perk-status-badge perk-status-cd">${svgCd}${cdSec}s</span>`;
    }

    const metaTxt = `${lvlPrefix} • ${subTypeTxt}`;

    if (needsRebuild) {
      const card = document.createElement('div');
      card.className = cardClass;
      card.setAttribute('data-perk-id', id);
      card.style.setProperty('--perk-clr', def.color || 'var(--accent-primary)');

      card.innerHTML = `
        <div class="perk-card-left">
          <div class="perk-icon-wrap" style="--perk-clr: ${def.color || 'var(--accent-primary)'}">
            <img class="perk-img" src="${def.image || `assets/skills/${id}.webp`}" alt="${sName}" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
            <span class="perk-svg-fallback" style="display:none; color:${def.color || 'var(--accent-primary)'}">${getSkillSvgIcon(id)}</span>
          </div>
          <div class="perk-card-info">
            <span class="perk-card-name" title="${sName}">${sName}</span>
            <span class="perk-card-meta">${metaTxt}</span>
          </div>
        </div>
        <div class="perk-card-right">
          ${statusBadgeHtml}
        </div>
      `;
      container.appendChild(card);
    } else {
      // Smart DOM update for high performance
      const card = container.querySelector(`[data-perk-id="${id}"]`);
      if (card) {
        if (card.className !== cardClass) card.className = cardClass;
        const metaEl = card.querySelector('.perk-card-meta');
        if (metaEl && metaEl.textContent !== metaTxt) metaEl.textContent = metaTxt;
        const rightEl = card.querySelector('.perk-card-right');
        if (rightEl && rightEl.innerHTML !== statusBadgeHtml) rightEl.innerHTML = statusBadgeHtml;
      }
    }
  });
}

// Render skill slots cleanly (Desktop Sidebar & Mobile Quick-Cast Bar)
function renderSkills() {
  if (typeof state === 'undefined' || !state || !Array.isArray(state.skillSlots)) return;
  renderDesktopSkills();
  renderMobileSkills();
}

function renderDesktopSkills() {
  if (!skillsCont) return;

  if (state.skillSlots.length === 0) {
    const emptyHint = typeof t === 'function' ? t('hud_skills_empty_hint') : 'Buy in the shop<br/>or complete words <strong>⚡</strong>';
    skillsCont.innerHTML = `<div class="empty-hint">${emptyHint}</div>`;
    return;
  }

  // Remove empty hint if present
  if (skillsCont.querySelector('.empty-hint')) {
    skillsCont.innerHTML = '';
  }

  const existingPills = Array.from(skillsCont.querySelectorAll('.skill-pill'));
  const needsRebuild = existingPills.length !== state.skillSlots.length ||
    existingPills.some((p, i) => p.dataset.skillId !== state.skillSlots[i].id);

  if (needsRebuild) {
    skillsCont.innerHTML = '';
    state.skillSlots.forEach((slot, idx) => {
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      const pill = createSkillPill(slot, idx, def);
      skillsCont.appendChild(pill);
    });
  } else {
    state.skillSlots.forEach((slot, idx) => {
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      updateSkillPill(existingPills[idx], slot, idx, def);
    });
  }
}

function renderMobileSkills() {
  const mBar = $('mobile-skills-bar');
  const mList = $('mobile-skills-list');
  const gameCol = $('game-column');
  if (!mBar || !mList) return;

  const validSlots = (state.skillSlots || []).filter(s => s && (s.count > 0 || (state.activeTimers && state.activeTimers[s.id] > 0)));

  if (validSlots.length === 0) {
    mBar.classList.add('hidden');
    mList.innerHTML = '';
    if (gameCol) gameCol.classList.remove('has-mobile-skills');
    return;
  }

  mBar.classList.remove('hidden');
  if (gameCol) gameCol.classList.add('has-mobile-skills');

  const existingPills = Array.from(mList.querySelectorAll('.msb-pill'));
  const needsRebuild = existingPills.length !== validSlots.length ||
    existingPills.some((p, i) => p.dataset.skillId !== validSlots[i].id);

  if (needsRebuild) {
    mList.innerHTML = '';
    validSlots.forEach((slot) => {
      const realIdx = state.skillSlots.indexOf(slot);
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      const pill = createMobileSkillPill(slot, realIdx, def);
      mList.appendChild(pill);
    });
  } else {
    validSlots.forEach((slot, idx) => {
      const realIdx = state.skillSlots.indexOf(slot);
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      updateMobileSkillPill(existingPills[idx], slot, realIdx, def);
    });
  }
}

function createMobileSkillPill(slot, realIdx, def) {
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'msb-pill';
  pill.dataset.skillId = slot.id;

  const sName = (typeof t === 'function' && t('skill_name_' + slot.id) !== ('skill_name_' + slot.id))
    ? t('skill_name_' + slot.id)
    : (def.name || slot.id);
  const sDesc = (typeof t === 'function' && t('skill_desc_' + slot.id) !== ('skill_desc_' + slot.id))
    ? t('skill_desc_' + slot.id)
    : (def.desc || '');

  pill.title = `${sName}: ${sDesc}`;
  pill.setAttribute('aria-label', sName);

  pill.innerHTML = `
    <span class="msb-icon" style="color:${def.color || 'var(--accent-cyan)'}">${getSkillSvgIcon(slot.id)}</span>
    <span class="msb-label">${sName}</span>
    <span class="msb-badge">×${slot.count}</span>
    <div class="msb-dur-track"><div class="msb-dur-fill"></div></div>
  `;

  updateMobileSkillPill(pill, slot, realIdx, def);
  return pill;
}

function updateMobileSkillPill(pill, slot, realIdx, def) {
  const timer = (state.activeTimers && state.activeTimers[slot.id]) || 0;
  const isActive = timer > 0;
  const totalDur = def.duration || 10000;
  const pct = Math.min(100, Math.max(0, (timer / totalDur) * 100));

  pill.classList.toggle('msb-is-active', isActive);

  if (slot.count > 0) {
    pill.onclick = (e) => {
      e.preventDefault();
      activateSkill(realIdx);
    };
    pill.classList.remove('msb-disabled');
  } else {
    pill.onclick = null;
    pill.classList.toggle('msb-disabled', !isActive);
  }

  const badge = pill.querySelector('.msb-badge');
  if (badge) {
    if (isActive) {
      badge.textContent = `${(timer / 1000).toFixed(1)}s`;
    } else {
      badge.textContent = `×${slot.count}`;
    }
  }

  const track = pill.querySelector('.msb-dur-track');
  const fill = pill.querySelector('.msb-dur-fill');
  if (track && fill) {
    track.style.display = isActive ? 'block' : 'none';
    if (isActive) {
      fill.style.width = pct.toFixed(1) + '%';
      if (def.color) {
        fill.style.background = def.color;
      }
    }
  }
}

function createSkillPill(slot, idx, def) {
  const pill = document.createElement('div');
  pill.className = 'skill-pill';
  pill.dataset.skillId = slot.id;
  const sName = (typeof t === 'function' && t('skill_name_' + slot.id) !== ('skill_name_' + slot.id))
    ? t('skill_name_' + slot.id)
    : (def.name || '');
  const sDesc = (typeof t === 'function' && t('skill_desc_' + slot.id) !== ('skill_desc_' + slot.id))
    ? t('skill_desc_' + slot.id)
    : (def.desc || '');
  pill.title = sDesc;

  pill.innerHTML = `
    <kbd class="sp-key-badge">${idx + 1}</kbd>
    <div class="sp-main">
      <span class="sp-icon">${def.image ? `<img src="${def.image}" class="sp-icon-img" alt="" draggable="false" />` : def.icon}</span>
      <div class="sp-info">
        <span class="sp-name">${sName}</span>
        <span class="sp-dur-text"></span>
      </div>
    </div>
    <div class="sp-badges">
      <span class="sp-count-badge"></span>
    </div>
    <div class="sp-active-bar-track">
      <div class="sp-active-bar"></div>
    </div>
  `;

  updateSkillPill(pill, slot, idx, def);
  return pill;
}

function updateSkillPill(pill, slot, idx, def) {
  const timer = state.activeTimers[slot.id] || 0;
  const isActive = timer > 0;
  const totalDur = def.duration || 10000;
  const pct = Math.min(100, Math.max(0, (timer / totalDur) * 100));

  pill.classList.toggle('sp-is-active', isActive);

  if (slot.count > 0) {
    pill.onclick = () => activateSkill(idx);
    pill.style.cursor = 'pointer';
  } else {
    pill.onclick = null;
    pill.style.cursor = 'default';
  }

  const activeLabel = typeof t === 'function' ? t('hud_active') : 'ATIVO';

  const durText = pill.querySelector('.sp-dur-text');
  if (durText) {
    if (isActive) {
      durText.className = 'sp-dur-text sp-dur';
      durText.textContent = `${(timer / 1000).toFixed(1)}s ${activeLabel.toLowerCase()}`;
    } else {
      durText.className = 'sp-dur-text sp-dur-hint';
      durText.textContent = def.desc.split(' ').slice(0, 3).join(' ');
    }
  }

  const keyBadge = pill.querySelector('.sp-key-badge');
  if (keyBadge) {
    keyBadge.textContent = idx + 1;
    const keyLabel = (typeof t === 'function' && t('hud_key_label') !== 'hud_key_label') ? t('hud_key_label') : 'Tecla';
    keyBadge.title = `${keyLabel} [${idx + 1}]`;
    keyBadge.style.opacity = '1';
    keyBadge.classList.toggle('sp-key-empty', slot.count === 0 && !isActive);
  }

  const countBadge = pill.querySelector('.sp-count-badge');
  if (countBadge) {
    if (isActive && slot.count === 0) {
      countBadge.className = 'sp-count-badge sp-active-badge';
      countBadge.textContent = activeLabel.toUpperCase();
    } else {
      countBadge.className = 'sp-count-badge';
      countBadge.textContent = `×${slot.count}`;
    }
  }

  const track = pill.querySelector('.sp-active-bar-track');
  const bar = pill.querySelector('.sp-active-bar');
  if (track && bar) {
    track.style.display = isActive ? 'block' : 'none';
    if (isActive) {
      bar.style.width = pct.toFixed(1) + '%';
      if (def.color) {
        bar.style.background = def.color;
        bar.style.boxShadow = `0 0 8px ${def.color}`;
      }
    }
  }
}
