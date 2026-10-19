/* ================================================
   DIGITHIN GALAXY — js/slots-ui.js
   Save slots and start screen profile UI
   ================================================ */
'use strict';

// ============================================================
// SAVE SLOTS & START SCREEN PROFILE UI
// ============================================================
function updateStartScreenUI() {
  const btnStart = $('btn-start');
  const btnContinue = $('btn-continue');

  if (btnStart) btnStart.classList.remove('hidden');
  if (btnContinue) btnContinue.classList.add('hidden');

  const startRecordVal = $('start-record-val');
  if (startRecordVal) {
    const best = typeof getHighScore === 'function' ? getHighScore() : 0;
    const formatted = typeof formatScore === 'function' ? formatScore(best) : String(best).padStart(10, '0');
    startRecordVal.textContent = formatted;
  }

  if (window.AVAILABLE_UPDATE_VERSION && typeof showUpdateNotification === 'function') {
    showUpdateNotification();
  } else if (typeof checkForAppUpdate === 'function') {
    checkForAppUpdate();
  }
}

function openSlotsModal() {
  renderSlotsModal();
  const modal = $('modal-slots');
  if (modal) modal.classList.remove('hidden');
  if (typeof playSound === 'function') playSound('click');
}

function closeSlotsModal() {
  const modal = $('modal-slots');
  if (modal) modal.classList.add('hidden');
}

function renderSlotsModal() {
  const grid = $('slots-modal-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const slots = typeof getAllSaveSlots === 'function' ? getAllSaveSlots() : [];

  slots.forEach(slot => {
    const card = document.createElement('div');
    card.className = 'slot-card' + (slot.data ? ' slot-card-occupied' : ' slot-card-empty');
    if (slot.isActive) card.classList.add('slot-card-active');

    const slotTitle = typeof t === 'function' ? t('slot_number', { slot: slot.slotId }) : `Slot ${slot.slotId}`;

    let contentHtml = '';
    if (slot.data) {
      const diffKey = slot.data.difficulty || 'normal';
      const diffName = typeof t === 'function' ? t(`diff_${diffKey}`) : diffKey.toUpperCase();
      const diffClass = `slot-diff-${diffKey}`;

      const scoreStr = Number(slot.data.totalScore || 0).toLocaleString();
      const phaseNum = slot.data.phase || 1;
      const shieldsNum = slot.data.shields !== undefined ? slot.data.shields : (slot.data.lives || 3);
      const phaseLbl = typeof t === 'function' ? t('hud_phase') : 'FASE';
      const scoreLbl = typeof t === 'function' ? t('modal_stat_score') : 'PONTOS';
      const shieldsLbl = typeof t === 'function' ? (t('hud_shields') || t('hud_lives')) : 'ESCUDOS';
      const dateStr = slot.data.savedAt
        ? new Date(slot.data.savedAt).toLocaleDateString(typeof getLanguage === 'function' ? getLanguage() : undefined, {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
          })
        : '';
      const dateLabel = typeof t === 'function' ? t('slot_date_fmt', { date: dateStr }) : `Salvo: ${dateStr}`;

      const btnContinueLbl = typeof t === 'function' ? t('slot_btn_continue') : 'Continuar';
      const btnDeleteLbl = typeof t === 'function' ? t('slot_btn_delete') : 'Excluir';

      contentHtml = `
        <div class="slot-card-head">
          <div class="slot-card-title">${slotTitle}</div>
          <span class="slot-diff-badge ${diffClass}">${diffName}</span>
        </div>
        <div class="slot-score-row">
          <span class="slot-score-lbl">${scoreLbl}:</span>
          <span class="slot-score-val text-emerald">${scoreStr}</span>
        </div>
        <div class="slot-stats-grid slot-stats-2col">
          <div class="slot-stat-row">
            <span class="slot-stat-lbl">${phaseLbl}</span>
            <span class="slot-stat-val text-cyan">${phaseNum}</span>
          </div>
          <div class="slot-stat-row">
            <span class="slot-stat-lbl">${shieldsLbl}</span>
            <span class="slot-stat-val text-cyan" style="display:inline-flex;align-items:center;justify-content:center;gap:3px;">
              ${shieldsNum}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#38BDF8" stroke="#38BDF8" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </span>
          </div>
        </div>
        <div class="slot-date-text">${dateLabel}</div>
        <div class="slot-card-actions slot-actions-row">
          <button class="btn-slot-action btn-slot-continue" onclick="continueSlot(${slot.slotId})">
            <svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>${btnContinueLbl}</span>
          </button>
          <button class="btn-slot-delete-square" onclick="deleteSlot(${slot.slotId})" title="${btnDeleteLbl}" aria-label="${btnDeleteLbl}">
            <svg class="btn-svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;
    } else {
      const btnNewLbl = typeof t === 'function' ? t('slot_btn_new') : 'Novo Jogo';

      contentHtml = `
        <div class="slot-card-head">
          <div class="slot-card-title">${slotTitle}</div>
        </div>
        <div class="slot-empty-spacer"></div>
        <div class="slot-card-actions">
          <button class="btn-slot-action btn-slot-start" onclick="newGameInSlot(${slot.slotId})">
            <svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span>${btnNewLbl}</span>
          </button>
        </div>
      `;
    }

    card.innerHTML = contentHtml;
    grid.appendChild(card);
  });
}

function continueSlot(slotId) {
  closeSlotsModal();
  if (typeof resumeSavedGame === 'function') {
    resumeSavedGame(slotId);
  }
}

function newGameInSlot(slotId) {
  const hasActive = typeof hasActiveSave === 'function' ? hasActiveSave(slotId) : false;
  if (hasActive) {
    const confirmMsg = typeof t === 'function' ? t('slot_confirm_overwrite', { slot: slotId }) : `Sobrescrever o Slot ${slotId}?`;
    if (!window.confirm(confirmMsg)) return;
  }
  closeSlotsModal();
  if (typeof startGame === 'function') {
    startGame('classic', slotId);
  }
}

function deleteSlot(slotId) {
  const confirmMsg = typeof t === 'function' ? t('slot_confirm_delete', { slot: slotId }) : `Excluir a partida salva no Slot ${slotId}?`;
  if (!window.confirm(confirmMsg)) return;
  if (typeof deleteSaveSlot === 'function') deleteSaveSlot(slotId);
  renderSlotsModal();
  updateStartScreenUI();
  if (typeof playSound === 'function') playSound('click');
}
