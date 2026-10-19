/* ================================================
   DIGITHIN GALAXY — js/boss-ui.js
   Boss battle UI: sprites, alien invader, HUD, meaning slots and reward modal
   ================================================ */
'use strict';

// ============================================================
// BOSS BATTLE UI RENDERING (MONSTER / ROBOT WITH LIVES: |||)
// ============================================================
function getBossSpriteSvg(boss) {
  const bId = boss?.id || '';
  const type = boss?.type || '';
  const species = boss?.species || '';

  // 1. Zorkon — Alien Lagarto Menta/Esmeralda (Verde fofo com olhão expressivo)
  if (bId === 'alien_zorkon' || type === 'alien_hive' || species === 'reptilian_lizard' || type === 'beast') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <g fill="#064E3B">
          <rect x="6" y="3" width="2" height="3" />
          <rect x="14" y="3" width="2" height="3" />
          <rect x="7" y="5" width="8" height="1" />
          <rect x="5" y="6" width="2" height="1" />
          <rect x="15" y="6" width="2" height="1" />
          <rect x="4" y="7" width="1" height="9" />
          <rect x="17" y="7" width="1" height="3" />
          <rect x="18" y="10" width="1" height="5" />
          <rect x="19" y="12" width="1" height="2" />
          <rect x="5" y="16" width="1" height="1" />
          <rect x="17" y="15" width="1" height="1" />
          <rect x="6" y="16" width="11" height="1" />
          <rect x="5" y="17" width="1" height="4" />
          <rect x="17" y="17" width="1" height="4" />
          <rect x="6" y="21" width="11" height="1" />
        </g>
        <g fill="#22C55E">
          <rect x="5" y="13" width="1" height="3" />
          <rect x="6" y="15" width="11" height="1" />
          <rect x="16" y="13" width="2" height="2" />
        </g>
        <g fill="#4ADE80">
          <rect x="6" y="4" width="2" height="2" />
          <rect x="14" y="4" width="2" height="2" />
          <rect x="7" y="6" width="8" height="1" />
          <rect x="5" y="7" width="12" height="3" />
          <rect x="5" y="10" width="13" height="3" />
          <rect x="6" y="13" width="10" height="2" />
          <rect x="18" y="12" width="1" height="2" />
        </g>
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#0F172A" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="11" width="1" height="1" fill="#064E3B" />
        <rect x="14" y="14" width="2" height="1" fill="#064E3B" />
        <rect x="6" y="17" width="11" height="4" fill="#64748B" />
        <rect x="8" y="18" width="7" height="2" fill="#94A3B8" />
        <rect x="11" y="18" width="1" height="2" fill="#38BDF8" />
      </svg>
    `;
  }

  // 2. Vespera — Alien Lagarto Lavanda/Roxo com Chifrinho no Nariz
  if (bId === 'alien_vespera' || type === 'alien_psionic' || type === 'mythology') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <g fill="#2E1065">
          <rect x="4" y="5" width="2" height="2" />
          <rect x="3" y="7" width="2" height="2" />
          <rect x="2" y="9" width="2" height="2" />
          <rect x="7" y="4" width="6" height="1" />
          <rect x="6" y="5" width="1" height="1" />
          <rect x="13" y="5" width="2" height="1" />
          <rect x="15" y="6" width="1" height="3" />
          <rect x="16" y="8" width="1" height="2" />
          <rect x="4" y="11" width="1" height="5" />
          <rect x="19" y="10" width="1" height="2" />
          <rect x="18" y="12" width="1" height="2" />
          <rect x="17" y="14" width="1" height="2" />
          <rect x="5" y="16" width="12" height="1" />
          <rect x="4" y="17" width="1" height="4" />
          <rect x="17" y="17" width="1" height="4" />
          <rect x="5" y="21" width="12" height="1" />
        </g>
        <rect x="5" y="6" width="1" height="1" fill="#DDD6FE" />
        <rect x="4" y="8" width="1" height="1" fill="#DDD6FE" />
        <rect x="3" y="10" width="1" height="1" fill="#DDD6FE" />
        <g fill="#A78BFA">
          <rect x="7" y="5" width="6" height="1" />
          <rect x="6" y="6" width="9" height="3" />
          <rect x="5" y="9" width="11" height="4" />
          <rect x="5" y="13" width="12" height="2" />
          <rect x="6" y="15" width="10" height="1" />
        </g>
        <g fill="#7C3AED">
          <rect x="5" y="11" width="1" height="4" />
          <rect x="6" y="15" width="10" height="1" />
        </g>
        <rect x="17" y="10" width="2" height="2" fill="#F5F3FF" />
        <rect x="19" y="10" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="12" width="1" height="1" fill="#C7D2FE" />
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#3B0764" />
        <rect x="8" y="7" width="5" height="1" fill="#2E1065" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="14" y="14" width="2" height="1" fill="#2E1065" />
        <rect x="5" y="17" width="12" height="4" fill="#DB2777" />
        <rect x="7" y="18" width="8" height="2" fill="#F472B6" />
      </svg>
    `;
  }

  // 3. Xylarion — Alien Lagarto Azul Celeste com Cachecol Vermelho
  if (bId === 'alien_xylarion' || type === 'alien_dreadnought' || type === 'robot') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <g fill="#082F49">
          <rect x="7" y="3" width="2" height="2" />
          <rect x="10" y="3" width="2" height="2" />
          <rect x="13" y="4" width="2" height="2" />
          <rect x="5" y="5" width="2" height="2" />
          <rect x="15" y="5" width="2" height="2" />
          <rect x="4" y="7" width="1" height="8" />
          <rect x="17" y="7" width="1" height="3" />
          <rect x="18" y="10" width="1" height="4" />
          <rect x="17" y="14" width="1" height="2" />
          <rect x="5" y="15" width="12" height="1" />
        </g>
        <rect x="7" y="4" width="2" height="1" fill="#BAE6FD" />
        <rect x="10" y="4" width="2" height="1" fill="#BAE6FD" />
        <rect x="13" y="5" width="2" height="1" fill="#BAE6FD" />
        <g fill="#38BDF8">
          <rect x="6" y="5" width="9" height="2" />
          <rect x="5" y="7" width="12" height="3" />
          <rect x="5" y="10" width="13" height="4" />
          <rect x="6" y="14" width="11" height="1" />
        </g>
        <g fill="#0284C7">
          <rect x="5" y="12" width="1" height="3" />
          <rect x="6" y="14" width="11" height="1" />
        </g>
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#0F172A" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="11" width="1" height="1" fill="#082F49" />
        <rect x="14" y="13" width="2" height="1" fill="#082F49" />
        <g fill="#082F49">
          <rect x="4" y="16" width="1" height="5" />
          <rect x="17" y="16" width="1" height="5" />
          <rect x="5" y="21" width="12" height="1" />
        </g>
        <rect x="5" y="16" width="12" height="5" fill="#EF4444" />
        <rect x="7" y="18" width="8" height="2" fill="#DC2626" />
        <rect x="9" y="19" width="4" height="2" fill="#B91C1C" />
      </svg>
    `;
  }

  // 4. Kragthor — Alien Lagarto Coral/Vermelho com Chifrinhos Amarelos
  if (bId === 'alien_kragthor' || type === 'alien_warlord' || type === 'volcano') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <rect x="6" y="2" width="2" height="3" fill="#FDE047" />
        <rect x="14" y="2" width="2" height="3" fill="#FDE047" />
        <g fill="#4C0519">
          <rect x="6" y="1" width="2" height="1" />
          <rect x="14" y="1" width="2" height="1" />
          <rect x="8" y="4" width="6" height="1" />
          <rect x="5" y="5" width="2" height="1" />
          <rect x="15" y="5" width="2" height="1" />
          <rect x="4" y="6" width="1" height="10" />
          <rect x="17" y="6" width="1" height="4" />
          <rect x="18" y="10" width="1" height="4" />
          <rect x="17" y="14" width="1" height="2" />
          <rect x="5" y="16" width="12" height="1" />
          <rect x="4" y="17" width="1" height="4" />
          <rect x="17" y="17" width="1" height="4" />
          <rect x="5" y="21" width="12" height="1" />
        </g>
        <g fill="#FB7185">
          <rect x="7" y="5" width="8" height="1" />
          <rect x="5" y="6" width="12" height="4" />
          <rect x="5" y="10" width="13" height="4" />
          <rect x="6" y="14" width="11" height="2" />
        </g>
        <g fill="#E11D48">
          <rect x="5" y="12" width="1" height="4" />
          <rect x="6" y="15" width="11" height="1" />
        </g>
        <rect x="6" y="12" width="2" height="1" fill="#FDA4AF" />
        <rect x="15" y="12" width="2" height="1" fill="#FDA4AF" />
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#4C0519" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="11" width="1" height="1" fill="#4C0519" />
        <rect x="14" y="13" width="2" height="1" fill="#4C0519" />
        <rect x="5" y="17" width="12" height="4" fill="#475569" />
        <rect x="7" y="18" width="8" height="2" fill="#64748B" />
        <rect x="10" y="18" width="2" height="2" fill="#FDE047" />
      </svg>
    `;
  }

  // 5. Nebulor — Alien Lagarto Índigo Estelar
  if (bId === 'alien_nebulor' || type === 'alien_darkmatter' || type === 'ocean') {
    return `
      <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
        <rect x="8" y="3" width="1" height="2" fill="#FDE047" />
        <rect x="13" y="3" width="1" height="2" fill="#FDE047" />
        <g fill="#1E1B4B">
          <rect x="7" y="4" width="8" height="1" />
          <rect x="5" y="5" width="2" height="2" />
          <rect x="15" y="5" width="2" height="2" />
          <rect x="4" y="7" width="1" height="9" />
          <rect x="17" y="7" width="1" height="3" />
          <rect x="18" y="10" width="1" height="4" />
          <rect x="17" y="14" width="1" height="2" />
          <rect x="5" y="16" width="12" height="1" />
          <rect x="4" y="17" width="1" height="4" />
          <rect x="17" y="17" width="1" height="4" />
          <rect x="5" y="21" width="12" height="1" />
        </g>
        <g fill="#818CF8">
          <rect x="7" y="5" width="8" height="2" />
          <rect x="5" y="7" width="12" height="3" />
          <rect x="5" y="10" width="13" height="4" />
          <rect x="6" y="14" width="11" height="2" />
        </g>
        <g fill="#4F46E5">
          <rect x="5" y="12" width="1" height="4" />
          <rect x="6" y="15" width="11" height="1" />
        </g>
        <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
        <rect x="9" y="9" width="4" height="4" fill="#0F172A" />
        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
        <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
        <rect x="17" y="11" width="1" height="1" fill="#1E1B4B" />
        <rect x="14" y="13" width="2" height="1" fill="#1E1B4B" />
        <rect x="5" y="17" width="12" height="4" fill="#22D3EE" />
        <rect x="7" y="18" width="8" height="2" fill="#06B6D4" />
      </svg>
    `;
  }

  // 6. Xenor / Padrão — Alien Lagarto Dourado Solar
  return `
    <svg class="boss-pixel-avatar-svg" viewBox="0 0 24 24" width="100%" height="100%" shape-rendering="crispEdges" style="background:transparent;display:block;">
      <rect x="7" y="3" width="2" height="2" fill="#FEF08A" />
      <rect x="10" y="2" width="2" height="3" fill="#FEF08A" />
      <rect x="13" y="3" width="2" height="2" fill="#FEF08A" />
      <g fill="#451A03">
        <rect x="6" y="4" width="1" height="1" />
        <rect x="15" y="4" width="1" height="1" />
        <rect x="5" y="5" width="1" height="2" />
        <rect x="16" y="5" width="1" height="2" />
        <rect x="4" y="7" width="1" height="9" />
        <rect x="17" y="7" width="1" height="3" />
        <rect x="18" y="10" width="1" height="4" />
        <rect x="17" y="14" width="1" height="2" />
        <rect x="5" y="16" width="12" height="1" />
        <rect x="4" y="17" width="1" height="4" />
        <rect x="17" y="17" width="1" height="4" />
        <rect x="5" y="21" width="12" height="1" />
      </g>
      <g fill="#FBBF24">
        <rect x="6" y="5" width="10" height="2" />
        <rect x="5" y="7" width="12" height="3" />
        <rect x="5" y="10" width="13" height="4" />
        <rect x="6" y="14" width="11" height="2" />
      </g>
      <g fill="#D97706">
        <rect x="5" y="12" width="1" height="4" />
        <rect x="6" y="15" width="11" height="1" />
      </g>
      <rect x="8" y="8" width="5" height="5" fill="#FFFFFF" />
      <rect x="9" y="9" width="4" height="4" fill="#451A03" />
      <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
      <rect x="11" y="11" width="1" height="1" fill="#FFFFFF" />
      <rect x="17" y="11" width="1" height="1" fill="#451A03" />
      <rect x="14" y="13" width="2" height="1" fill="#451A03" />
      <rect x="5" y="17" width="12" height="4" fill="#7C3AED" />
      <rect x="7" y="18" width="8" height="2" fill="#A78BFA" />
    </svg>
  `;
}

// ============================================================
// ALIEN SPACE INVADER VISUAL MANAGEMENT
// ============================================================
// ALIEN SPACE INVADER VISUAL MANAGEMENT (CLEAN SINGLE MOB)
// ============================================================
function renderBossHearts(remainingLives = 3, maxLives = 3) {
  const container = $('alien-space-hearts');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < maxLives; i++) {
    const isAlive = i < remainingLives;
    const heartWrap = document.createElement('span');
    heartWrap.className = `alien-heart-icon ${isAlive ? 'alive' : 'lost'}`;
    heartWrap.setAttribute('title', isAlive ? 'HP' : 'Lost');
    heartWrap.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;
    container.appendChild(heartWrap);
  }
}

function showAlienSpaceInvader(boss, remainingLives = 3, maxLives = 3) {
  const invader = $('alien-space-invader');
  const sprite = $('alien-space-sprite');
  const titleEl = $('alien-space-title');
  if (!invader) return;

  // 1. Título do boss acima do ícone ao centro
  if (titleEl && boss) {
    const lang = (typeof getLanguage === 'function') ? getLanguage() : 'en';
    const isPt = lang === 'pt';
    const name = (typeof t === 'function' && boss.nameKey && t(boss.nameKey) !== boss.nameKey)
      ? boss.name
      : (isPt ? (boss.namePt || boss.name) : (boss.name || boss.namePt));
    titleEl.textContent = name || 'Alien Invader';
  }

  // 2. Apenas 1 desenho do boss na tela (ícone pixel art ao centro)
  if (sprite && boss) {
    sprite.innerHTML = getBossSpriteSvg(boss);
  }

  // 3. Barra de vida com 3 corações abaixo do boss
  renderBossHearts(remainingLives, maxLives);

  const clr = boss?.color || '#06B6D4';
  invader.style.setProperty('--alien-theme-color', clr);

  invader.classList.remove('hidden', 'alien-throw', 'alien-damaged', 'alien-retreat');
  void invader.offsetWidth;
  invader.classList.add('alien-surge');

  // Oculta a barra de próximos para manter a tela limpa
  const queueBar = $('queue-bar');
  if (queueBar) queueBar.classList.add('hidden');
}

function hideAlienSpaceInvader() {
  const invader = $('alien-space-invader');
  if (!invader) return;
  invader.classList.add('alien-retreat');
  setTimeout(() => {
    invader.classList.add('hidden');
    invader.classList.remove('alien-surge', 'alien-throw', 'alien-damaged', 'alien-retreat');
  }, 450);

  // Restaura a barra de próximos
  const queueBar = $('queue-bar');
  if (queueBar) queueBar.classList.remove('hidden');
}

function animateAlienThrow() {
  const invader = $('alien-space-invader');
  if (!invader || invader.classList.contains('hidden')) return;
  invader.classList.remove('alien-throw');
  void invader.offsetWidth;
  invader.classList.add('alien-throw');
  setTimeout(() => invader.classList.remove('alien-throw'), 650);
}

function animateAlienDamaged() {
  const invader = $('alien-space-invader');
  if (!invader || invader.classList.contains('hidden')) return;
  invader.classList.add('alien-damaged');
  setTimeout(() => invader.classList.remove('alien-damaged'), 500);
}

/**
 * Destrói o boss em partículas cósmicas (exatamente como os objetos caindo),
 * ocultando elementos de interface e executando o callback após a dispersão dos fragmentos.
 */
function explodeAlienBoss(onComplete) {
  const invader = $('alien-space-invader');
  const craft = invader?.querySelector('.alien-space-craft') || invader;
  const hearts = $('alien-space-hearts');
  const title = $('alien-space-title');

  if (hearts) hearts.style.display = 'none';
  if (title) title.style.display = 'none';

  if (craft) {
    // Toca efeito sonoro de impacto e destruição
    if (typeof playSound === 'function') {
      playSound('hit');
    }

    // Detona explosões densas de partículas celestes usando a paleta exata de pixels do boss
    if (typeof spawnCelestialExplosion === 'function') {
      spawnCelestialExplosion(craft, 'ALIEN_BOSS_DEFEAT');
      setTimeout(() => {
        if (craft) spawnCelestialExplosion(craft, 'ALIEN_BOSS_DEFEAT');
      }, 70);
      setTimeout(() => {
        if (craft) spawnCelestialExplosion(craft, 'ALIEN_BOSS_DEFEAT');
      }, 140);
    }

    craft.style.opacity = '0';
    craft.style.transform = 'scale(0.15)';
    craft.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
  }

  // Após alguns milissegundos de partículas caindo e explodindo na tela, conclui a sequência
  setTimeout(() => {
    if (invader) {
      invader.classList.add('hidden');
      if (craft) {
        craft.style.opacity = '';
        craft.style.transform = '';
        craft.style.transition = '';
      }
      if (hearts) hearts.style.display = '';
      if (title) title.style.display = '';
    }
    if (typeof onComplete === 'function') {
      onComplete();
    }
  }, 700);
}

function renderBossHud(boss, remainingLives = 3, maxLives = 3) {
  // O retângulo horizontal do topo foi removido permanentemente
  if (bossHud) bossHud.classList.add('hidden');

  // Atualiza diretamente o único alien central no céu com título e 3 corações
  showAlienSpaceInvader(boss, remainingLives, maxLives);
}

function hideBossHud() {
  if (bossHud) bossHud.classList.add('hidden');
  hideAlienSpaceInvader();
}

function flashBossDamage() {
  if (typeof animateAlienDamaged === 'function') {
    animateAlienDamaged();
  }
}

function renderBossMeaningSlots(boxEl, targetWord, typedBuffer) {
  if (!boxEl) return;
  const slotsCont = boxEl.querySelector('.bmb-slots');
  if (!slotsCont) return;
  slotsCont.innerHTML = '';

  const revealed = state.bossBattle?.revealedIndices || [];
  const chars = targetWord.split('');
  for (let i = 0; i < chars.length; i++) {
    const slot = document.createElement('span');
    if (i < typedBuffer.length) {
      slot.className = 'bmb-slot filled';
      slot.textContent = typedBuffer[i];
    } else if (revealed.includes(i)) {
      slot.className = 'bmb-slot revealed';
      slot.textContent = chars[i];
    } else {
      slot.className = 'bmb-slot empty';
      slot.textContent = '_';
    }
    slotsCont.appendChild(slot);
  }
}

function animateCoinsList(containerEl, coinRowsData, onComplete) {
  if (!containerEl) return;
  containerEl.innerHTML = '';
  if (!state._coinAnimTimers) state._coinAnimTimers = [];

  function runRowSequence(index) {
    if (index >= coinRowsData.length) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }
    const rowInfo = coinRowsData[index];

    const rowDiv = document.createElement('div');
    rowDiv.className = 'go-row go-row-pop';
    rowDiv.style.setProperty('--row-delay', '0ms');

    const labelSpan = document.createElement('span');
    labelSpan.textContent = rowInfo.label;

    const valStrong = document.createElement('strong');
    valStrong.style.color = rowInfo.color;
    valStrong.style.fontVariantNumeric = 'tabular-nums';
    if (rowInfo.isTotal) {
      valStrong.style.fontSize = '1.05rem';
    }
    valStrong.textContent = '+0';

    rowDiv.appendChild(labelSpan);
    rowDiv.appendChild(valStrong);
    containerEl.appendChild(rowDiv);

    const startTimeout = setTimeout(() => {
      let currentVal = 0;
      const targetVal = rowInfo.target;
      if (targetVal <= 0) {
        valStrong.textContent = '+0';
        runRowSequence(index + 1);
        return;
      }

      const totalTicks = Math.min(35, targetVal);
      const step = Math.max(1, Math.ceil(targetVal / totalTicks));
      const tickInterval = Math.max(18, Math.min(38, Math.round(850 / totalTicks)));

      const intervalId = setInterval(() => {
        currentVal = Math.min(targetVal, currentVal + step);
        valStrong.textContent = `+${currentVal}`;
        if (typeof playSound === 'function') playSound('coin');

        if (currentVal >= targetVal) {
          clearInterval(intervalId);
          const nextTimeout = setTimeout(() => {
            runRowSequence(index + 1);
          }, 220);
          state._coinAnimTimers.push(nextTimeout);
        }
      }, tickInterval);

      state._coinAnimTimers.push(intervalId);
    }, 120);

    state._coinAnimTimers.push(startTimeout);
  }

  const initTimeout = setTimeout(() => {
    runRowSequence(0);
  }, 120);
  state._coinAnimTimers.push(initTimeout);
}

function isBossRewardOpen() {
  const modal = $('modal-boss-reward');
  return modal && !modal.classList.contains('hidden');
}

function selectBossRewardIndex(index) {
  if (!state.currentBossRewardSkills || !state.currentBossRewardSkills[index]) return;
  state.selectedBossRewardIndex = index;
  if (typeof playSound === 'function') playSound('click');
  updateBossRewardSelectionVisual();
}

function navigateBossReward(direction) {
  const total = state.currentBossRewardSkills ? state.currentBossRewardSkills.length : 3;
  if (total === 0) return;
  if (state.selectedBossRewardIndex === undefined || state.selectedBossRewardIndex === null || state.selectedBossRewardIndex < 0) {
    state.selectedBossRewardIndex = 0;
  } else if (direction === 'next' || direction === 'down' || direction === 'right') {
    state.selectedBossRewardIndex = (state.selectedBossRewardIndex + 1) % total;
  } else if (direction === 'prev' || direction === 'up' || direction === 'left') {
    state.selectedBossRewardIndex = (state.selectedBossRewardIndex - 1 + total) % total;
  }
  if (typeof playSound === 'function') playSound('click');
  updateBossRewardSelectionVisual();
}

function updateBossRewardSelectionVisual() {
  const cards = document.querySelectorAll('#boss-skills-grid .boss-skill-card');
  cards.forEach((card, idx) => {
    if (idx === state.selectedBossRewardIndex) {
      card.classList.add('boss-skill-card-selected');
    } else {
      card.classList.remove('boss-skill-card-selected');
    }
  });
}

function pickBossSkillByIndex(index) {
  if (!state.currentBossRewardSkills || !state.currentBossRewardSkills[index]) return;
  state.selectedBossRewardIndex = index;
  updateBossRewardSelectionVisual();
  const skill = state.currentBossRewardSkills[index];
  const onPick = state.onPickBossReward;
  closeBossRewardModal();
  if (typeof onPick === 'function') {
    onPick(skill);
  }
}

function pickSelectedBossSkill() {
  const idx = (state.selectedBossRewardIndex !== undefined && state.selectedBossRewardIndex >= 0)
    ? state.selectedBossRewardIndex
    : 0;
  pickBossSkillByIndex(idx);
}

function showBossRewardModal(skills, onPick) {
  if (!modalBossReward || !bossSkillsGrid) return;
  bossSkillsGrid.innerHTML = '';
  state.currentBossRewardSkills = skills;
  state.onPickBossReward = onPick;
  state.selectedBossRewardIndex = 0;

  const bossCoinsRowsList = $('boss-coins-rows-list');
  if (bossCoinsRowsList) {
    const bossBonusLbl     = typeof t === 'function' ? t('modal_boss_bonus') : 'Boss Bonus';
    const coinsPreciseLbl  = typeof t === 'function' ? t('modal_coins_precision') : '100% Accuracy Bonus';
    const coinsPhaseTotLbl = typeof t === 'function' ? t('modal_coins_phase_total') : 'Total Coins Added';

    const bossBonusCoins = 350;
    const isPerfectAcc = (state.errorsPhase === 0);
    const precisionCoins = isPerfectAcc ? 35 : 0;
    const totalBossCoins = bossBonusCoins + precisionCoins;

    const coinRowsData = [
      { label: bossBonusLbl, target: bossBonusCoins, color: '#FBBF24' }
    ];
    if (isPerfectAcc && precisionCoins > 0) {
      coinRowsData.push({ label: coinsPreciseLbl, target: precisionCoins, color: '#10B981' });
    }
    coinRowsData.push({ label: coinsPhaseTotLbl, target: totalBossCoins, color: '#FBBF24', isTotal: true });

    animateCoinsList(bossCoinsRowsList, coinRowsData);
  }

  skills.forEach((skill, index) => {
    const sName = (typeof t === 'function' && skill.nameKey && t(skill.nameKey) !== skill.nameKey)
      ? t(skill.nameKey)
      : (skill.name || '');
    const sDesc = (typeof t === 'function' && skill.descKey && t(skill.descKey) !== skill.descKey)
      ? t(skill.descKey)
      : (skill.desc || '');

    const pickTxt = typeof t === 'function' && t('boss_btn_pick') ? t('boss_btn_pick') : 'Obtain';
    const card = document.createElement('div');
    const isSelected = (index === state.selectedBossRewardIndex);
    card.className = 'boss-skill-card' + (isSelected ? ' boss-skill-card-selected' : '');
    card.setAttribute('data-boss-index', String(index));
    card.innerHTML = `
      <kbd class="card-key-hint" aria-hidden="true">${index + 1}</kbd>
      <div class="boss-skill-icon-wrap" style="--item-clr: ${skill.color || 'var(--accent-primary)'}">
        <span>${getSkillSvgIcon(skill.id) || skill.icon}</span>
      </div>
      <div class="boss-skill-name">${sName}</div>
      <div class="boss-skill-desc">${sDesc}</div>
      <button class="boss-skill-pick-btn" type="button">${pickTxt}</button>
    `;
    card.addEventListener('mouseenter', () => {
      state.selectedBossRewardIndex = index;
      updateBossRewardSelectionVisual();
    });
    card.addEventListener('click', (e) => {
      if (e.target.closest('.boss-skill-pick-btn')) return;
      selectBossRewardIndex(index);
    });
    const btn = card.querySelector('.boss-skill-pick-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeBossRewardModal();
        if (typeof onPick === 'function') onPick(skill);
      });
    }
    bossSkillsGrid.appendChild(card);
  });

  modalBossReward.classList.remove('hidden');
}

function closeBossRewardModal() {
  if (state._coinAnimTimers && Array.isArray(state._coinAnimTimers)) {
    state._coinAnimTimers.forEach(id => {
      clearInterval(id);
      clearTimeout(id);
    });
    state._coinAnimTimers = [];
  }
  state.currentBossRewardSkills = null;
  state.onPickBossReward = null;
  state.selectedBossRewardIndex = 0;
  if (modalBossReward) modalBossReward.classList.add('hidden');
}
