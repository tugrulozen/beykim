/**
 * DEPO TAKİP - Bağlantı durumu
 *
 * Depo içinde sinyal kesilmesi olağandır. Bu modül:
 *   - cihaz çevrimdışı olduğunda ekranın üstünde bir şerit gösterir,
 *   - bağlantı geri geldiğinde açık sayfayı tazeler,
 *   - sunucuya ulaşılamadığında anlaşılır bir mesaj verir.
 */

const listeners = new Set();
let bar = null;
let lastState = 'online';

export const isOffline = () => navigator.onLine === false;

/** Bağlantı geri geldiğinde çağrılacak işlev; kaldırmak için dönen işlevi çağırın */
export function onReconnect(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function ensureBar() {
  if (bar) return bar;
  bar = document.createElement('div');
  bar.className = 'net-bar';
  bar.setAttribute('role', 'status');
  document.body.appendChild(bar);
  return bar;
}

/** state: 'offline' | 'server' | 'online' */
export function setNetState(state, detail = '') {
  if (state === lastState && state !== 'server') return;
  const el = ensureBar();
  if (state === 'online') {
    if (lastState !== 'online') {
      el.className = 'net-bar show ok';
      el.innerHTML = '<i class="ph ph-wifi-high"></i> Bağlantı geri geldi';
      setTimeout(() => { el.className = 'net-bar'; }, 2500);
      listeners.forEach((fn) => { try { fn(); } catch (_e) { /* sayfa kapanmış olabilir */ } });
    }
  } else if (state === 'offline') {
    el.className = 'net-bar show';
    el.innerHTML = '<i class="ph ph-wifi-slash"></i> Çevrimdışısınız — kayıtlar gönderilemez';
  } else if (state === 'server') {
    el.className = 'net-bar show warn';
    el.innerHTML = `<i class="ph ph-plugs"></i> Sunucuya ulaşılamıyor${detail ? ` — ${detail}` : ''}`;
    clearTimeout(setNetState._t);
    setNetState._t = setTimeout(() => { if (lastState === 'server') { el.className = 'net-bar'; lastState = 'online'; } }, 6000);
  }
  lastState = state;
}

export function initNetworkWatch() {
  window.addEventListener('offline', () => setNetState('offline'));
  window.addEventListener('online', () => setNetState('online'));
  if (isOffline()) setNetState('offline');
}
