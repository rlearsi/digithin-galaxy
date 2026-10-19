/* ================================================
   DIGITHIN GALAXY — js/updater.js
   App update engine and cache refresh
   ================================================ */
'use strict';

// ============================================================
// APP UPDATE ENGINE & CACHE REFRESH (v1.6)
// ============================================================
function isNewerVersion(remote, current) {
  if (!remote) return false;
  if (!current) return true;
  if (remote === current) return false;
  const rParts = String(remote).split('.').map(n => parseInt(n, 10) || 0);
  const cParts = String(current).split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(rParts.length, cParts.length);
  for (let i = 0; i < len; i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

function showUpdateNotification() {
  const btn = document.getElementById('btn-update-available');
  if (!btn) return;
  const descEl = document.getElementById('update-btn-version-desc');
  if (descEl) {
    descEl.textContent = typeof t === 'function' ? t('update_available_sub') : 'Clique para atualizar o cache e carregar a versão mais recente';
  }
  btn.classList.remove('hidden');
}

async function checkForAppUpdate(interactive = false) {
  const statusBtn = document.getElementById('btn-settings-check-update');
  const statusLbl = document.getElementById('settings-update-status-label');
  if (interactive && statusLbl) {
    statusLbl.textContent = '...';
  }

  try {
    const res = await fetch(`./version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    if (!res.ok) {
      if (interactive && statusLbl) {
        statusLbl.textContent = typeof t === 'function' ? t('settings_btn_check_update') : 'Verificar';
      }
      return;
    }
    const data = await res.json();
    const remoteVer = data && data.version ? String(data.version) : null;
    const currentVer = String(window.APP_VERSION || (typeof getInstalledAppVersion === 'function' ? getInstalledAppVersion() : ''));

    if (remoteVer && isNewerVersion(remoteVer, currentVer)) {
      window.AVAILABLE_UPDATE_VERSION = remoteVer;
      showUpdateNotification();
      if (statusBtn && statusLbl) {
        statusBtn.classList.add('has-update');
        statusLbl.textContent = typeof t === 'function' ? t('update_btn_action') : 'Atualizar';
        statusBtn.onclick = applyAppUpdate;
      }
    } else {
      if (remoteVer && !window.APP_VERSION) {
        window.APP_VERSION = remoteVer;
        if (typeof setInstalledAppVersion === 'function') {
          setInstalledAppVersion(remoteVer);
        }
      }
      if (interactive && statusLbl) {
        statusLbl.textContent = typeof t === 'function' ? t('settings_update_latest') : 'Atualizado';
        setTimeout(() => {
          if (statusLbl) statusLbl.textContent = typeof t === 'function' ? t('settings_btn_check_update') : 'Verificar';
        }, 2500);
      }
    }
  } catch (err) {
    console.warn('[UpdateCheck] Could not fetch version.json:', err);
    if (interactive && statusLbl) {
      statusLbl.textContent = typeof t === 'function' ? t('settings_btn_check_update') : 'Verificar';
    }
  }
}

async function applyAppUpdate() {
  const btn = document.getElementById('btn-update-available');
  if (btn) {
    btn.classList.add('updating');
    const titleEl = btn.querySelector('.update-btn-title');
    if (titleEl) {
      titleEl.textContent = typeof t === 'function' ? t('update_applying') : 'Atualizando...';
    }
  }

  const settingsCheckBtn = document.getElementById('btn-settings-check-update');
  if (settingsCheckBtn) {
    settingsCheckBtn.classList.add('updating');
    const statusLbl = document.getElementById('settings-update-status-label');
    if (statusLbl) {
      statusLbl.textContent = typeof t === 'function' ? t('update_applying') : 'Atualizando...';
    }
  }

  if (typeof playSound === 'function') {
    try { playSound('level_up'); } catch (_) {}
  }

  // 1. Record the newly acknowledged version
  const targetVer = window.AVAILABLE_UPDATE_VERSION;
  if (targetVer && typeof setInstalledAppVersion === 'function') {
    setInstalledAppVersion(targetVer);
    window.APP_VERSION = targetVer;
  }

  // 2. Purge CacheStorage (Service Worker / PWA caches)
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) {
      console.warn('[Update] Could not clear CacheStorage:', e);
    }
  }

  // 2. Unregister any active service workers
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    } catch (e) {
      console.warn('[Update] Could not unregister ServiceWorker:', e);
    }
  }

  // 3. Clear non-persistent session storage (DO NOT TOUCH localStorage!)
  try {
    sessionStorage.clear();
  } catch (_) {}

  // 4. Force browser to reload index.html and scripts by navigating with timestamp
  const url = new URL(window.location.href);
  url.searchParams.delete('v');
  url.searchParams.set('_t', Date.now().toString());

  setTimeout(() => {
    window.location.replace(url.toString());
  }, 350);
}

// Development and test helper (sem numeração na interface)
function simulateUpdateAvailable() {
  window.AVAILABLE_UPDATE_VERSION = 'new';
  showUpdateNotification();
  const statusBtn = document.getElementById('btn-settings-check-update');
  const statusLbl = document.getElementById('settings-update-status-label');
  if (statusBtn && statusLbl) {
    statusBtn.classList.add('has-update');
    statusLbl.textContent = typeof t === 'function' ? t('update_btn_action') : 'Atualizar';
    statusBtn.onclick = applyAppUpdate;
  }
}

// Expose globally
window.checkForAppUpdate = checkForAppUpdate;
window.applyAppUpdate = applyAppUpdate;
window.simulateUpdateAvailable = simulateUpdateAvailable;

// Trigger check on load and attach proactive update listeners
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => { checkForAppUpdate(); }, 800);
    });
  } else {
    setTimeout(() => { checkForAppUpdate(); }, 800);
  }

  // Check whenever user focuses the tab or switches back to it
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForAppUpdate();
    }
  });
  window.addEventListener('focus', () => {
    checkForAppUpdate();
  });

  // Background heartbeat every 30s on the home screen
  setInterval(() => {
    const screenStart = document.getElementById('screen-start');
    if (screenStart && screenStart.classList.contains('active')) {
      checkForAppUpdate();
    }
  }, 30000);
}
