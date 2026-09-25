/** İş Akışı arayüzü — ortak biçimlendirme ve küçük bileşenler (SVG grafikler kütüphanesiz, CSP uyumlu) */
import { esc } from '../core/html.js';

export const STATE = {
  todo: { label: 'Yapılacak', icon: 'ph-circle-dashed', tone: 'slate' },
  in_progress: { label: 'Devam ediyor', icon: 'ph-spinner-gap', tone: 'blue' },
  blocked: { label: 'Engelli', icon: 'ph-prohibit', tone: 'red' },
  rework: { label: 'Revize', icon: 'ph-arrow-u-up-left', tone: 'amber' },
  review: { label: 'Onay bekliyor', icon: 'ph-hourglass-medium', tone: 'violet' },
  approved: { label: 'Onaylandı', icon: 'ph-seal-check', tone: 'green' },
  cancelled: { label: 'İptal', icon: 'ph-x-circle', tone: 'slate' },
};
export const ACTION = {
  start: { label: 'Başla', icon: 'ph-play', cls: 'btn-primary' },
  complete: { label: 'Tamamla → onaya gönder', icon: 'ph-paper-plane-tilt', cls: 'btn-primary' },
  approve: { label: 'Onayla', icon: 'ph-check-circle', cls: 'btn-success' },
  reject: { label: 'Revize iste', icon: 'ph-arrow-u-up-left', cls: 'btn-warn' },
  block: { label: 'Engel bildir', icon: 'ph-prohibit', cls: 'btn-secondary' },
  unblock: { label: 'Engeli kaldır', icon: 'ph-lock-open', cls: 'btn-secondary' },
  cancel: { label: 'İptal et', icon: 'ph-x', cls: 'btn-ghost-danger' },
};
export const PRIORITY = { urgent: ['Acil', 'red'], high: ['Yüksek', 'amber'], medium: ['Normal', 'slate'], low: ['Düşük', 'slate'] };
/** Performans düzeyi (skor 90+ / 80+ / 65+ / altı) */
export const LEVEL = { platinum: ['Mükemmel', '#15803D'], gold: ['Yüksek', '#2563EB'], silver: ['Beklenen', '#64748B'], bronze: ['Gelişmeli', '#B45309'] };

const PALETTE = ['#6366F1', '#0EA5E9', '#F97316', '#22A06B', '#E11D48', '#A16207', '#7C3AED', '#0891B2'];
export const colorOf = (id) => PALETTE[Math.abs(Number(id) || 0) % PALETTE.length];
export const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toLocaleUpperCase('tr');
export const avatar = (id, name, size = 28, online = false) => `<span class="tf-av${online ? ' on' : ''}" style="--s:${size}px;background:${colorOf(id)}" title="${esc(name || '')}">${esc(initials(name))}</span>`;

export const fdate = (s) => (s ? new Date(String(s).length <= 10 ? `${s}T00:00:00` : s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '—');
export const ftime = (s) => (s ? new Date(s).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '');
export function ago(s) {
  if (!s) return '';
  const m = Math.round((Date.now() - new Date(s).getTime()) / 60000);
  if (m < 1) return 'şimdi'; if (m < 60) return `${m} dk önce`;
  const h = Math.round(m / 60); if (h < 24) return `${h} sa önce`;
  const d = Math.round(h / 24); return d < 30 ? `${d} gün önce` : fdate(s);
}
export const hours = (h) => (h == null ? '' : h < 1 ? `${Math.round(h * 60)} dk` : h < 48 ? `${Math.round(h)} sa` : `${Math.round(h / 24)} gün`);

export function dueChip(c) {
  if (c.flowState === 'approved') return `<span class="tf-chip green"><i class="ph ph-seal-check"></i> ${fdate(c.approvedAt)}</span>`;
  if (c.flowState === 'review') return `<span class="tf-chip violet"><i class="ph ph-hourglass-medium"></i> ${hours(c.waitingHours)}</span>`;
  if (c.overdue) return `<span class="tf-chip red"><i class="ph ph-warning"></i> ${c.overdueDays} gün gecikti</span>`;
  const d = Math.ceil((new Date(`${c.plannedEnd}T23:59:59`) - Date.now()) / 86400000);
  return `<span class="tf-chip ${d <= 1 ? 'amber' : 'slate'}"><i class="ph ph-calendar-blank"></i> ${d <= 0 ? 'Bugün' : d === 1 ? 'Yarın' : fdate(c.plannedEnd)}</span>`;
}

/** Skor halkası (0–100) */
export function ring(score, size = 64, stroke = 7, level = null) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = score == null ? 0 : score;
  const col = level ? LEVEL[level][1] : v >= 80 ? '#22A06B' : v >= 65 ? '#E0A526' : '#E11D48';
  return `<svg class="tf-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Skor ${score ?? '-'}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--tf-track)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(c * v) / 100} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${size * 0.3}" font-weight="700" fill="currentColor">${score ?? '–'}</text></svg>`;
}

/** Yatay metrik çubuğu */
export const bar = (label, pct, hint = '') => `<div class="tf-metric"><span>${esc(label)}</span><b>${pct == null ? '–' : `%${pct}`}</b><i><em style="width:${clampPct(pct)}%;background:${pct >= 80 ? '#22A06B' : pct >= 60 ? '#E0A526' : '#E11D48'}"></em></i>${hint ? `<small>${esc(hint)}</small>` : ''}</div>`;
const clampPct = (p) => Math.max(0, Math.min(100, Number(p) || 0));

/** Halka (donut) grafik: [{label, value, color}] */
export function donut(parts, size = 150) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const r = size / 2 - 14, c = 2 * Math.PI * r;
  let off = 0;
  const segs = parts.filter((p) => p.value > 0).map((p) => { const len = (p.value / total) * c; const s = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${p.color}" stroke-width="22" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size / 2} ${size / 2})"><title>${esc(p.label)}: ${p.value}</title></circle>`; off += len; return s; }).join('');
  return `<svg class="tf-donut" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${segs}<text x="50%" y="46%" text-anchor="middle" font-size="26" font-weight="700" fill="currentColor">${total}</text><text x="50%" y="62%" text-anchor="middle" font-size="11" fill="var(--text-secondary)">aktif iş</text></svg>`;
}

/** Yığılmış sütun grafik: rows [{label, values:[..]}], series [{label,color}] */
export function stacked(rows, series, height = 160) {
  const max = Math.max(1, ...rows.map((r) => r.values.reduce((a, b) => a + b, 0)));
  return `<div class="tf-stack" style="--h:${height}px">${rows.map((r) => `<div class="tf-stack-col" title="${esc(r.label + ' · ' + series.map((s, i) => `${s.label}: ${r.values[i]}`).join(' · '))}">
    <div class="tf-stack-bars">${r.values.map((v, i) => (v ? `<i style="height:${(v / max) * 100}%;background:${series[i].color}"></i>` : '')).join('')}</div><small>${esc(r.label)}</small></div>`).join('')}</div>
    <div class="tf-legend">${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.label)}</span>`).join('')}</div>`;
}

export const empty = (text, icon = 'ph-tray') => `<div class="tf-empty"><i class="ph ${icon}"></i><p>${esc(text)}</p></div>`;
export const spinner = () => '<div class="loading-spinner"></div>';
export { esc };
