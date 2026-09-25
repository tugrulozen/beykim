/**
 * Kanban panosu (sürükle-bırak) ve "Görevlerim".
 * Sütunlar durum makinesinin durumlarıdır; kartı başka sütuna bırakmak ilgili EYLEMİ çalıştırır (backend doğrular):
 *   Yapılacak/Revize → Devam: start · Devam → Onay: complete · Onay → Onaylandı: approve · Onay → Revize: reject · → Engelli: block · Engelli → Devam: unblock
 * Geçersiz bırakma kartı geri koyar. Aynı sütun içinde sıralama sunucuda saklanır. Tüm istemciler SSE ile anında güncellenir.
 */
import api from '../core/api.js';
import router from '../core/router.js';
import Auth from '../core/auth.js';
import { showToast } from '../components/toast.js';
import { on, status } from './live.js';
import { openDrawer, runAction } from './drawer.js';
import { STATE, PRIORITY, avatar, dueChip, ring, LEVEL, empty, spinner, esc } from './ui.js';

const COLUMNS = ['todo', 'in_progress', 'blocked', 'rework', 'review', 'approved'];
const DROP = { // [from][to] → eylem
  todo: { in_progress: 'start', blocked: 'block' },
  rework: { in_progress: 'start', review: 'complete', blocked: 'block' },
  in_progress: { review: 'complete', blocked: 'block' },
  blocked: { in_progress: 'unblock' },
  review: { approved: 'approve', rework: 'reject' },
};
const view = { unitId: '', mine: false, q: '' };

export function card(c, me) {
  const pr = PRIORITY[c.priority] || PRIORITY.medium;
  const drag = !!DROP[c.flowState];
  return `<article class="tf-card ${c.overdue ? 'late' : ''} ${c.mine ? 'mine' : ''}" data-id="${esc(c.id)}" data-state="${c.flowState}" draggable="${drag}" tabindex="0" style="--pc:${c.processColor || '#64748B'}">
    <header><span class="tf-proc"><i class="ph ${c.processIcon || 'ph-gear'}"></i> ${esc(c.processName || '')}</span><span class="tf-no">${esc(c.jobNo)}</span></header>
    <h3>${esc(c.title)}</h3>
    ${c.orderNo ? `<p class="tf-order"><i class="ph ph-receipt"></i> ${esc(c.orderNo)} · ${esc(c.customerName || '')}</p>` : ''}
    ${c.flowState === 'in_progress' || c.flowState === 'rework' ? `<div class="tf-prog sm"><i style="width:${c.progress}%"></i></div>` : ''}
    ${c.flowState === 'blocked' && c.blockedReason ? `<p class="tf-block"><i class="ph ph-prohibit"></i> ${esc(c.blockedReason)}</p>` : ''}
    <footer>
      ${c.assigneeId ? avatar(c.assigneeId, c.assigneeName, 26, status.online.has(c.assigneeId)) : '<span class="tf-av empty" title="Atanmamış"><i class="ph ph-user-plus"></i></span>'}
      ${dueChip(c)}
      ${c.priority === 'urgent' || c.priority === 'high' ? `<span class="tf-chip ${pr[1]}">${pr[0]}</span>` : ''}
      ${c.reworkCount ? `<span class="tf-chip amber" title="Revize sayısı"><i class="ph ph-arrow-u-up-left"></i>${c.reworkCount}</span>` : ''}
      <span class="tf-grow"></span>
      ${c.msgCount ? `<span class="tf-msgc ${c.unread ? 'new' : ''}"><i class="ph ph-chat-circle-dots"></i>${c.unread || c.msgCount}</span>` : ''}
      ${c.flowState === 'review' && c.canReview ? '<span class="tf-chip violet solid">Onayınız</span>' : ''}
    </footer>
  </article>`;
}

async function withDrawer(q, reload) { if (q.job) openDrawer(q.job, { onChange: reload }); }

/** KANBAN PANOSU */
export function BoardPage() {
  const el = document.createElement('div');
  el.className = 'tf-page tf-board-page';
  const me = Auth.getUser() || {};
  let data = null, units = [], dragId = null;
  const q = router.getQueryParams();
  if (q.unit) view.unitId = q.unit;

  el.innerHTML = `
    <div class="tf-toolbar">
      <div class="tf-chips" data-units></div>
      <label class="tf-toggle"><input type="checkbox" data-mine ${view.mine ? 'checked' : ''}><i></i> Yalnız benimkiler</label>
      <label class="tf-search"><i class="ph ph-magnifying-glass"></i><input type="search" placeholder="İş, sipariş, müşteri ara" value="${esc(view.q)}"></label>
    </div>
    <div class="tf-board" data-board>${spinner()}</div>`;

  async function load() {
    const p = new URLSearchParams(); if (view.unitId) p.set('unitId', view.unitId); if (view.mine) p.set('mine', '1'); if (view.q) p.set('q', view.q);
    try {
      [data, units] = await Promise.all([api.get(`/jt/flow/board?${p}`).then((r) => r.data), units.length ? units : api.get('/jt/flow/units').then((r) => r.data)]);
      render();
    } catch (e) { el.querySelector('[data-board]').innerHTML = empty(e.message, 'ph-warning'); }
  }
  function render() {
    el.querySelector('[data-units]').innerHTML = `<button class="tf-pill ${!view.unitId ? 'on' : ''}" data-unit="">Tümü</button>${units.filter((u) => u.processIds.length).map((u) => `<button class="tf-pill ${view.unitId === u.id ? 'on' : ''}" data-unit="${u.id}" style="--uc:${u.color}"><i class="ph ${u.icon}"></i> ${esc(u.name)}</button>`).join('')}`;
    const cols = COLUMNS.map((s) => {
      const list = data.cards.filter((c) => c.flowState === s);
      return `<section class="tf-col" data-col="${s}"><header><span class="tf-dot ${STATE[s].tone}"></span><b>${STATE[s].label}</b><span class="tf-count">${list.length}</span></header>
        <div class="tf-col-body" data-drop="${s}">${list.map((c) => card(c, me)).join('') || '<div class="tf-col-empty">Boş</div>'}</div></section>`;
    }).join('');
    el.querySelector('[data-board]').innerHTML = cols;
  }

  // ---- sürükle-bırak (masaüstü; dokunmatikte kart tıklanır, eylem panelden seçilir) ----
  el.addEventListener('dragstart', (e) => {
    const c = e.target.closest('.tf-card'); if (!c) return;
    dragId = c.dataset.id; c.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId);
    const from = c.dataset.state;
    el.querySelectorAll('[data-drop]').forEach((z) => z.classList.toggle('can', z.dataset.drop === from || !!(DROP[from] || {})[z.dataset.drop]));
  });
  el.addEventListener('dragend', () => { el.querySelectorAll('.dragging, .can, .over').forEach((x) => x.classList.remove('dragging', 'can', 'over')); dragId = null; });
  el.addEventListener('dragover', (e) => { const z = e.target.closest('[data-drop].can'); if (!z) return; e.preventDefault(); el.querySelectorAll('.over').forEach((x) => x !== z && x.classList.remove('over')); z.classList.add('over'); });
  el.addEventListener('drop', async (e) => {
    const z = e.target.closest('[data-drop]'); if (!z || !dragId) return;
    e.preventDefault();
    const c = data.cards.find((x) => x.id === dragId); const to = z.dataset.drop;
    if (!c) return;
    if (to === c.flowState) { // sütun içi sıralama
      const after = [...z.querySelectorAll('.tf-card')].find((n) => e.clientY < n.getBoundingClientRect().top + n.offsetHeight / 2);
      const list = data.cards.filter((x) => x.flowState === to && x.id !== c.id);
      const idx = after ? list.findIndex((x) => x.id === after.dataset.id) : list.length;
      const prev = list[idx - 1], next = list[idx];
      const pos = prev && next ? (prev.boardOrder + next.boardOrder) / 2 : prev ? (prev.boardOrder || 0) + 1 : next ? (next.boardOrder || 0) - 1 : 0;
      c.boardOrder = pos; data.cards.sort((a, b) => (a.boardOrder || 0) - (b.boardOrder || 0)); render();
      api.put(`/jt/flow/jobs/${encodeURIComponent(c.id)}/order`, { boardOrder: pos }).catch((err) => showToast(err.message, 'error'));
      return;
    }
    const action = (DROP[c.flowState] || {})[to];
    if (!action) { showToast(`"${STATE[c.flowState].label}" → "${STATE[to].label}" geçişi yapılamaz.`, 'warning'); return; }
    // iyimser taşıma; başarısızsa geri alınır
    const prevState = c.flowState; c.flowState = to; render();
    const ok = await runAction({ ...c, flowState: prevState }, action);
    if (!ok) { c.flowState = prevState; render(); } else load();
  });

  el.addEventListener('click', (e) => {
    const u = e.target.closest('[data-unit]'); if (u) { view.unitId = u.dataset.unit; load(); return; }
    const c = e.target.closest('.tf-card'); if (c) openDrawer(c.dataset.id, { onChange: load });
  });
  el.addEventListener('keydown', (e) => { const c = e.target.closest('.tf-card'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openDrawer(c.dataset.id, { onChange: load }); } });
  el.addEventListener('change', (e) => { if (e.target.matches('[data-mine]')) { view.mine = e.target.checked; load(); } });
  let tq; el.addEventListener('input', (e) => { if (e.target.type === 'search') { view.q = e.target.value; clearTimeout(tq); tq = setTimeout(load, 300); } });

  liveReload(el, load);
  load().then(() => withDrawer(q, load));
  return el;
}

/**
 * Canlı güncelleme: başka biri bir işi değiştirince liste sessizce yenilenir.
 * Arka arkaya gelen olaylar birleştirilir; görev paneli açıkken yenileme ertelenir (panel kapanınca bir kez yapılır),
 * mesaj / sıralama olayları listeyi yeniden çizmez.
 */
function liveReload(el, load) {
  let t, pending = false;
  const run = () => { if (!el.isConnected) return; if (document.querySelector('.tf-drawer-wrap')) { pending = true; return; } pending = false; load(); };
  const offs = [on('job', (d) => { if (d && (d.action === 'message' || d.action === 'order')) return; clearTimeout(t); t = setTimeout(run, 600); }),
    on('drawer-closed', () => { if (pending) run(); })];
  const mo = new MutationObserver(() => { if (!el.isConnected) { offs.forEach((f) => f()); mo.disconnect(); } });
  setTimeout(() => mo.observe(document.getElementById('app'), { childList: true, subtree: false }), 0);
}

/** GÖREVLERİM: kişisel özet + kendi işleri + onayımı bekleyenler (mobil öncelikli) */
export function MyPage() {
  const el = document.createElement('div');
  el.className = 'tf-page tf-my';
  const me = Auth.getUser() || {};
  const q = router.getQueryParams();
  el.innerHTML = spinner();

  async function load() {
    try {
      const [b, p] = await Promise.all([api.get('/jt/flow/board?mine=1').then((r) => r.data), api.get(`/jt/flow/performance/${me.id}?days=90`).then((r) => r.data).catch(() => null)]);
      const mine = b.cards.filter((c) => c.assigneeId === me.id);
      const toReview = b.cards.filter((c) => c.flowState === 'review' && c.canReview && c.assigneeId !== me.id);
      const group = (states) => mine.filter((c) => states.includes(c.flowState));
      const sec = (title, icon, list, hint) => `<section class="tf-my-sec"><h3><i class="ph ${icon}"></i> ${title} <span class="tf-count">${list.length}</span></h3>${list.length ? `<div class="tf-my-list">${list.map((c) => card(c, me)).join('')}</div>` : `<p class="hint">${hint}</p>`}</section>`;
      const lv = p && p.level ? LEVEL[p.level] : null;
      el.innerHTML = `
        <div class="tf-hero">
          <div class="tf-hero-main">${ring(p ? p.score : null, 84, 8, p && p.level)}<div><small>Performans skorunuz · son 90 gün</small><h2>${esc(me.name || '')}</h2>
            ${lv ? `<span class="tf-level" style="--lc:${lv[1]}">Performans düzeyi: ${lv[0]}</span>` : ''}
            <div class="tf-badges">${(p && p.badges || []).map((bd) => `<span class="tf-badge" title="${esc(bd.hint)}"><i class="ph ${bd.icon}"></i>${esc(bd.label)}</span>`).join('')}</div></div></div>
          <div class="tf-hero-stats">
            <div><b>${group(['todo', 'in_progress', 'rework', 'blocked']).length}</b><small>Açık iş</small></div>
            <div><b>${p ? p.n : 0}</b><small>Tamamlanan</small></div>
            <div><b>${p && p.metrics.onTimePct != null ? `%${p.metrics.onTimePct}` : '–'}</b><small>Zamanında</small></div>
            <div><b>${p && p.metrics.firstPassPct != null ? `%${p.metrics.firstPassPct}` : '–'}</b><small>İlk seferde onay</small></div>
          </div>
        </div>
        ${toReview.length ? sec('Onayımı bekleyenler', 'ph-hourglass-medium', toReview, '') : ''}
        ${sec('Revize istenenler', 'ph-arrow-u-up-left', group(['rework']), 'Revize istenen işiniz yok.')}
        ${sec('Devam eden', 'ph-spinner-gap', group(['in_progress', 'blocked']), 'Devam eden işiniz yok.')}
        ${sec('Sıradaki işler', 'ph-circle-dashed', group(['todo']), 'Yeni iş atandığında burada görünür.')}
        ${sec('Onaya gönderdiklerim', 'ph-paper-plane-tilt', group(['review']), 'Onay bekleyen işiniz yok.')}`;
    } catch (e) { el.innerHTML = empty(e.message, 'ph-warning'); }
  }
  el.addEventListener('click', (e) => { const c = e.target.closest('.tf-card'); if (c) openDrawer(c.dataset.id, { onChange: load }); });
  liveReload(el, load);
  load().then(() => withDrawer(q, load));
  return el;
}

/** ONAYLARIM: bana düşen onay kuyruğu, bekleme süresine göre */
export function ReviewsPage() {
  const el = document.createElement('div');
  el.className = 'tf-page tf-reviews';
  const me = Auth.getUser() || {};
  el.innerHTML = spinner();
  async function load() {
    try {
      const b = (await api.get('/jt/flow/board')).data;
      const list = b.cards.filter((c) => c.flowState === 'review' && c.canReview).sort((a, bb) => (bb.waitingHours || 0) - (a.waitingHours || 0));
      el.innerHTML = `<p class="tf-lead">Biriminizden onaya gönderilen işler. Onayladığınızda gerekiyorsa ERP kaydı (üretim girişi / sevk) aynı anda yapılır; revize istediğinizde iş gerekçenizle birlikte çalışana döner.</p>
        ${list.length ? `<div class="tf-review-list">${list.map((c) => `<div class="tf-review">${card(c, me)}<div class="tf-review-acts"><button class="btn btn-sm btn-success" data-quick="approve" data-id="${esc(c.id)}"><i class="ph ph-check-circle"></i> Onayla</button><button class="btn btn-sm btn-warn" data-quick="reject" data-id="${esc(c.id)}"><i class="ph ph-arrow-u-up-left"></i> Revize</button></div></div>`).join('')}</div>` : empty('Onayınızı bekleyen iş yok.', 'ph-seal-check')}`;
      this_list = list;
    } catch (e) { el.innerHTML = empty(e.message, 'ph-warning'); }
  }
  let this_list = [];
  el.addEventListener('click', async (e) => {
    const qb = e.target.closest('[data-quick]');
    if (qb) { e.stopPropagation(); const c = this_list.find((x) => x.id === qb.dataset.id); qb.disabled = true; if (await runAction(c, qb.dataset.quick)) load(); else qb.disabled = false; return; }
    const c = e.target.closest('.tf-card'); if (c) openDrawer(c.dataset.id, { onChange: load });
  });
  liveReload(el, load);
  load();
  return el;
}
