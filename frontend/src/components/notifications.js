/**
 * Bildirimler: iş atandığında ilgili kişi görür.
 * - Arka planda 30 sn'de bir (ve uygulama öne gelince / bağlantı dönünce) kontrol eder
 * - Yeni bildirim gelince toast gösterir; izin verilmişse ve sekme arka plandaysa tarayıcı bildirimi de açar
 * - Çan simgesi (masaüstü üst çubuk, mobil alt menü) okunmamış sayısını gösterir
 */
import api from '../core/api.js';
import Auth from '../core/auth.js';
import router from '../core/router.js';
import { showToast } from './toast.js';
import { esc } from '../core/html.js';
import { onReconnect } from '../core/net.js';

const state = { items: [], unread: 0, seen: null, timer: null, started: false };

const ago = (iso) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'şimdi';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} sa önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};
const ICON = { job_assigned: 'ph-user-plus', job_done: 'ph-check-circle' };

function paintBadges() {
  document.querySelectorAll('[data-notif-badge]').forEach((b) => {
    b.textContent = state.unread > 99 ? '99+' : String(state.unread);
    b.hidden = state.unread === 0;
  });
}

async function poll() {
  if (!Auth.isLoggedIn() || document.hidden) return;
  try {
    const res = await api.get('/notifications');
    if (!res.success) return;
    const items = res.data.items || [];
    const maxId = items.reduce((m, n) => Math.max(m, n.id), 0);
    if (state.seen === null) state.seen = maxId; // ilk yüklemede eskiler için toast gösterme
    const fresh = items.filter((n) => n.id > state.seen && !n.readAt);
    state.seen = Math.max(state.seen, maxId);
    state.items = items;
    state.unread = res.data.unread || 0;
    paintBadges();
    if (panelEl) renderPanel();
    fresh.slice(0, 3).forEach((n) => {
      showToast(`${n.title}`, 'info');
      if ('Notification' in window && Notification.permission === 'granted') {
        try { new Notification(n.title, { body: n.body, icon: undefined, tag: 'wms-' + n.id }); } catch (_e) { /* desteklenmiyor */ }
      }
    });
  } catch (_e) { /* çevrimdışı: sessiz */ }
}

export function startNotifications() {
  if (state.started) return;
  state.started = true;
  poll();
  state.timer = setInterval(poll, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  onReconnect(poll);
  window.addEventListener('storage', () => poll());
}
export function resetNotifications() {
  state.items = []; state.unread = 0; state.seen = null;
  paintBadges();
}

// ---- panel ----
let panelEl = null;

async function markRead(id) {
  try { await api.post('/notifications/read', id ? { id } : {}); } catch (_e) { /* yeniden denenir */ }
  await poll();
}

function renderPanel() {
  if (!panelEl) return;
  const canAsk = 'Notification' in window && Notification.permission === 'default';
  panelEl.querySelector('.np-body').innerHTML = `
    ${canAsk ? '<button type="button" class="np-ask" data-act="ask"><i class="ph ph-bell-ringing"></i> Bildirimleri bu cihazda aç</button>' : ''}
    ${state.items.length ? state.items.map((n) => `
      <button type="button" class="np-item ${n.readAt ? '' : 'unread'}" data-id="${n.id}" data-link="${esc(n.link || '')}">
        <span class="np-ico"><i class="ph ${ICON[n.type] || 'ph-bell'}"></i></span>
        <span class="np-text"><b>${esc(n.title)}</b><small>${esc(n.body)}</small><em>${esc(ago(n.createdAt))}</em></span>
      </button>`).join('') : '<div class="np-empty"><i class="ph ph-bell-slash"></i>Henüz bildirim yok</div>'}`;
  panelEl.querySelector('[data-act="all"]').hidden = state.unread === 0;
}

export function toggleNotifications() {
  if (panelEl) return closePanel();
  panelEl = document.createElement('div');
  panelEl.className = 'np-wrap';
  panelEl.innerHTML = `
    <div class="np-bg"></div>
    <div class="np-panel" role="dialog" aria-label="Bildirimler">
      <div class="np-head"><b>Bildirimler</b>
        <button type="button" class="np-link" data-act="all">Tümünü okundu yap</button>
        <button type="button" class="np-x" data-act="close" aria-label="Kapat"><i class="ph ph-x"></i></button></div>
      <div class="np-body"></div>
    </div>`;
  document.body.appendChild(panelEl);
  renderPanel();
  poll();
  panelEl.addEventListener('click', async (e) => {
    if (e.target.classList.contains('np-bg')) return closePanel();
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'close') return closePanel();
    if (act === 'all') return markRead();
    if (act === 'ask') { await Notification.requestPermission(); return renderPanel(); }
    const item = e.target.closest('.np-item');
    if (item) {
      const link = item.dataset.link;
      await markRead(Number(item.dataset.id));
      closePanel();
      if (link) router.navigate(link.split('&job=')[0]);
    }
  });
  document.addEventListener('keydown', escClose);
}
const escClose = (e) => { if (e.key === 'Escape') closePanel(); };
function closePanel() {
  document.removeEventListener('keydown', escClose);
  panelEl?.remove();
  panelEl = null;
}
