/**
 * Derin bağlantı: backend her olay/satırda { target: { route, params } } döner; arayüz bunu hash adresine çevirir.
 * Örn. { route: 'finance', params: { tab: 'loans', loan: 'LN-1', inst: 'FI-3' } } → #/finance?tab=loans&loan=LN-1&inst=FI-3
 */
import router from '../core/router.js';

export const toHash = (target) => {
  if (!target || !target.route) return '';
  const q = Object.entries(target.params || {}).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  return q ? `${target.route}?${q}` : target.route;
};

/** Hedefe git; aynı adresteyse sayfayı yeniden çiz (hashchange tetiklenmez) */
export function openTarget(target) {
  const h = toHash(target);
  if (!h) return;
  if (window.location.hash === `#/${h}`) router._handleRoute();
  else router.navigate(h);
}

// ---- ortak biçimlendirme ----
export const money = (n, cur = 'TRY') => { try { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(Number(n) || 0); } catch (_e) { return `${Number(n) || 0} ${cur}`; } };
export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (s, n) => { const d = new Date(`${s}T00:00:00`); d.setDate(d.getDate() + n); return ymd(d); };
export const fdate = (s) => (s ? new Date(`${String(s).slice(0, 10)}T00:00:00`).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

/** Takvim olay türleri: renk sınıfı + etiket (a/b/c gereksinimleri ayrı renklerde) */
export const EVENT_KIND = {
  loan_overdue: { cls: 'ev-late', icon: 'ph-warning-octagon', label: 'Vadesi geçmiş kredi' },
  loan_upcoming: { cls: 'ev-loan', icon: 'ph-bank', label: 'Yaklaşan kredi ödemesi' },
  loan_paid: { cls: 'ev-done', icon: 'ph-check-circle', label: 'Ödenmiş taksit' },
  receivable: { cls: 'ev-recv', icon: 'ph-hand-coins', label: 'Müşteri tahsilatı' },
  receivable_overdue: { cls: 'ev-recv-late', icon: 'ph-hand-coins', label: 'Gecikmiş tahsilat' },
  other: { cls: 'ev-other', icon: 'ph-note', label: 'Çek/senet · tedarikçi · planlı' },
};
export function kindOf(e) {
  if (e.type === 'loan') return e.status === 'paid' ? 'loan_paid' : e.status === 'overdue' ? 'loan_overdue' : 'loan_upcoming';
  if (e.type === 'receivable') return e.status === 'overdue' ? 'receivable_overdue' : 'receivable';
  return 'other';
}
