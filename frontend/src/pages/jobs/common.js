/**
 * İş & Durum Takip modülü - ortak yardımcılar
 * Yetki bilgisi backend'den (/jt/me) gelir; arayüz yalnızca izinli düğmeleri gösterir,
 * asıl kontrol her zaman backend'dedir.
 */
import api from '../../core/api.js';
import { esc } from '../../core/html.js';
import { showToast } from '../../components/toast.js';
import { exportTable, exportButton } from '../../core/exportTable.js';

export { api, esc, showToast, exportTable, exportButton };

// ---------- oturum bağlamı ----------
export const state = { me: null, perms: [], meta: null, alertCounts: { critical: 0, warning: 0, info: 0 } };
export const can = (p) => state.perms.includes(p);

export async function ensureContext(force = false) {
  if (state.me && state.meta && !force) return state;
  const me = await api.get('/jt/me');
  state.me = me.data.user;
  state.perms = me.data.permissions || [];
  const meta = await api.get('/jt/meta');
  state.meta = meta.data;
  return state;
}

// ---------- biçimlendirme ----------
export const fmt = (n) => (n == null || Number.isNaN(Number(n)) ? '—' : Number(n).toLocaleString('tr-TR'));
const parseD = (s) => (s ? new Date(String(s).length <= 10 ? `${s}T00:00:00` : s) : null);
export const fmtDate = (s) => { const d = parseD(s); return d ? d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '—'; };
export const fmtDateFull = (s) => { const d = parseD(s); return d ? d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; };
export const fmtDateTime = (s) => { const d = parseD(s); return d ? d.toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'; };
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export function daysLeft(dueDate) {
  const end = new Date(`${dueDate}T23:59:59`).getTime();
  return Math.ceil((end - Date.now()) / 86400000);
}
export function dueLabel(dueDate, closed = false) {
  if (closed) return `<span class="jt-due">${fmtDate(dueDate)}</span>`;
  const d = daysLeft(dueDate);
  if (d < 0) return `<span class="jt-due late"><i class="ph ph-warning"></i> ${fmtDate(dueDate)} · ${-d} gün gecikti</span>`;
  if (d === 0) return `<span class="jt-due soon"><i class="ph ph-clock-countdown"></i> ${fmtDate(dueDate)} · bugün</span>`;
  return `<span class="jt-due ${d <= 3 ? 'soon' : ''}">${fmtDate(dueDate)} · ${d} gün kaldı</span>`;
}

// ---------- etiketler ----------
export const STATUS = {
  planned: { label: 'Planlandı', cls: 'planned', icon: 'ph-clock' },
  in_progress: { label: 'Devam ediyor', cls: 'progress', icon: 'ph-play-circle' },
  blocked: { label: 'Engelli', cls: 'blocked', icon: 'ph-hand-palm' },
  done: { label: 'Tamamlandı', cls: 'done', icon: 'ph-check-circle' },
  cancelled: { label: 'İptal', cls: 'cancelled', icon: 'ph-prohibit' },
};
export const PRIORITY = { low: 'Düşük', medium: 'Normal', high: 'Yüksek', urgent: 'Acil' };
export const PROJECT_STATUS = { active: 'Aktif', planned: 'Planlanıyor', on_hold: 'Beklemede', completed: 'Tamamlandı', cancelled: 'İptal' };
export const ORDER_STATE = { open: 'Bekliyor', in_production: 'Üretimde', partially_shipped: 'Kısmen sevk', shipped: 'Sevk edildi', cancelled: 'İptal' };
export const ROLE_ICON = { admin: 'ph-shield-star', manager: 'ph-briefcase', planner: 'ph-calendar-check', supervisor: 'ph-hard-hat', operator: 'ph-wrench', quality: 'ph-seal-check', logistics: 'ph-truck', viewer: 'ph-eye' };

export function statusBadge(j) {
  if (j.overdue) return `<span class="jt-badge late"><i class="ph ph-warning"></i> ${j.overdueDays} gün gecikti</span>`;
  const s = STATUS[j.status] || STATUS.planned;
  const extra = j.status === 'done' && j.onTime === false ? ` · ${j.delayDays} gün geç` : '';
  return `<span class="jt-badge ${s.cls}"><i class="ph ${s.icon}"></i> ${s.label}${extra}</span>`;
}
export const pill = (label, cls = '') => `<span class="jt-badge ${cls}">${esc(label)}</span>`;

export function bar(pct, cls = '') {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  return `<div class="jt-bar ${cls}"><i style="width:${p}%"></i></div>`;
}
/** Sipariş / giden miktarı yan yana */
export function dualBar(ordered, shipped) {
  const p = ordered ? Math.min(100, Math.round((shipped / ordered) * 100)) : 0;
  return `<div class="jt-dual"><div class="jt-bar ship"><i style="width:${p}%"></i></div><small>${fmt(shipped)} / ${fmt(ordered)} <b>%${p}</b></small></div>`;
}

export function avatar(name, size = 32) {
  const initials = String(name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr');
  let h = 0; for (const c of String(name || '')) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `<span class="jt-avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px;background:hsl(${h} 45% 42%)">${esc(initials)}</span>`;
}
export const person = (name, sub = '') => `<span class="jt-person">${avatar(name, 30)}<span><b>${esc(name || 'Atanmamış')}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></span>`;

/** Performans skoru halkası */
export function ring(score, size = 54) {
  if (score == null) return `<span class="jt-ring empty" style="width:${size}px;height:${size}px">—</span>`;
  const r = 20, c = 2 * Math.PI * r;
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)';
  return `<span class="jt-ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="${r}" class="bg"/><circle cx="24" cy="24" r="${r}" stroke="${color}" stroke-dasharray="${(score / 100) * c} ${c}" transform="rotate(-90 24 24)"/></svg><b>${score}</b></span>`;
}

export const empty = (icon, text) => `<div class="jt-empty"><i class="ph ${icon}"></i><p>${esc(text)}</p></div>`;
export const errorBox = (e) => `<div class="jt-empty error"><i class="ph ph-plugs"></i><p>${esc(e?.message || 'Veri alınamadı')}</p></div>`;
export const loading = () => '<div class="jt-loading"><div class="loading-spinner"></div></div>';

// ---------- alt sayfa (sheet) ----------
let openSheets = 0;
export function sheet({ title, subtitle = '', body = '', wide = false, onClose }) {
  const el = document.createElement('div');
  el.className = 'jt-sheet-wrap';
  el.innerHTML = `
    <div class="jt-sheet-bg"></div>
    <section class="jt-sheet ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <header><div><h3>${esc(title)}</h3>${subtitle ? `<p>${subtitle}</p>` : ''}</div><button class="jt-x" aria-label="Kapat"><i class="ph ph-x"></i></button></header>
      <div class="jt-sheet-body">${body}</div>
    </section>`;
  document.body.appendChild(el);
  document.body.classList.add('jt-lock');
  openSheets++;
  const close = () => {
    if (!el.isConnected) return;
    el.classList.add('closing');
    setTimeout(() => { el.remove(); if (--openSheets <= 0) { openSheets = 0; document.body.classList.remove('jt-lock'); } }, 200);
    onClose?.();
  };
  el.querySelector('.jt-sheet-bg').addEventListener('click', close);
  el.querySelector('.jt-x').addEventListener('click', close);
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  return { el, body: el.querySelector('.jt-sheet-body'), close, setTitle: (t) => { el.querySelector('h3').textContent = t; } };
}

/** Düğme çalışırken kilitle, hata olursa toast göster */
export async function guard(btn, fn) {
  if (btn) btn.disabled = true;
  try { return await fn(); }
  catch (e) { showToast(e.message || 'İşlem başarısız', 'error'); }
  finally { if (btn) btn.disabled = false; }
}

export const options = (items, selected, blank) => `${blank ? `<option value="">${esc(blank)}</option>` : ''}${items.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(selected) ? 'selected' : ''}>${esc(l)}</option>`).join('')}`;
export const field = (label, control, hint = '') => `<label class="jt-field"><span>${esc(label)}${hint ? ` <small>${esc(hint)}</small>` : ''}</span>${control}</label>`;
