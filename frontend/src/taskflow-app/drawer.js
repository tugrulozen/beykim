/**
 * Görev kartı ayrıntısı (sağdan açılan panel; mobilde tam ekran):
 *   başlık + durum · izinli eylemler · atama (en müsait çalışan önerisi) · ERP bağlamı · zaman çizelgesi · tartışma (canlı)
 * Adres: herhangi bir sayfada ?job=<id>  → bildirimden / bağlantıdan doğrudan açılır.
 */
import api from '../core/api.js';
import Auth from '../core/auth.js';
import { showToast } from '../components/toast.js';
import { formDialog, promptDialog } from '../components/dialog.js';
import { on, emit, status } from './live.js';
import { STATE, ACTION, PRIORITY, avatar, fdate, ftime, ago, hours, dueChip, empty, spinner, esc } from './ui.js';

let openEl = null;

/** Eylemi çalıştırır; gerekçe / adet gerekiyorsa sorar. true = başarılı */
export async function runAction(job, action) {
  let body = {};
  if (action === 'complete') {
    const v = await formDialog({ title: `${job.jobNo} tamamla`, icon: 'ph-paper-plane-tilt', confirmLabel: 'Onaya gönder',
      message: 'İş, biriminizin sorumlusuna "Onay bekliyor" olarak gider.',
      fields: [{ name: 'qty', label: 'Üretilen adet', type: 'number', value: job.plannedQty, half: true, required: true }, { name: 'scrap', label: 'Fire', type: 'number', value: job.scrapQty || 0, half: true }],
      validate: (x) => (!(x.qty > 0) ? 'Adet girin.' : x.scrap > x.qty ? 'Fire adetten büyük olamaz.' : null) });
    if (!v) return false; body = { qty: v.qty, scrap: v.scrap || 0 };
  }
  if (['reject', 'block', 'cancel'].includes(action)) {
    const reason = await promptDialog({ title: { reject: 'Revize gerekçesi', block: 'Engel nedeni', cancel: 'İptal gerekçesi' }[action], label: 'Açıklama', multiline: true, required: true,
      placeholder: { reject: 'Örn. Kaynak dikişinde gözenek var', block: 'Örn. Malzeme bekleniyor', cancel: 'Örn. Sipariş iptal edildi' }[action], confirmLabel: ACTION[action].label });
    if (!reason) return false; body = { reason };
  }
  try { const r = await api.post(`/jt/flow/jobs/${encodeURIComponent(job.id)}/${action}`, body); showToast(r.message, 'success'); return true; }
  catch (e) { showToast(e.message, 'error'); return false; }
}

export function closeDrawer() {
  if (!openEl) return;
  openEl.classList.add('closing');
  const el = openEl; openEl = null;
  document.body.classList.remove('tf-lock');
  setTimeout(() => { el.remove(); emit('drawer-closed'); }, 160);
  const u = new URL(location.href);
  if (/[?&]job=/.test(u.hash)) history.replaceState(null, '', u.hash.replace(/([?&])job=[^&]*&?/, '$1').replace(/[?&]$/, ''));
}

export async function openDrawer(jobId, { onChange } = {}) {
  closeDrawer();
  const me = Auth.getUser() || {};
  const el = document.createElement('div');
  el.className = 'tf-drawer-wrap';
  el.innerHTML = `<div class="tf-drawer-bg"></div><aside class="tf-drawer" role="dialog" aria-modal="true">${spinner()}</aside>`;
  document.body.appendChild(el);
  document.body.classList.add('tf-lock'); // arka plan kaymaz, pano yeniden çizilmez
  openEl = el;
  if (!/[?&]job=/.test(location.hash)) history.replaceState(null, '', `${location.hash}${location.hash.includes('?') ? '&' : '?'}job=${encodeURIComponent(jobId)}`);
  const panel = el.querySelector('.tf-drawer');
  let job = null, msgs = [], lastId = 0, cand = null, typingT = null;
  const offs = [];

  async function load() {
    try { job = (await api.get(`/jt/flow/jobs/${encodeURIComponent(jobId)}`)).data; }
    catch (e) { panel.innerHTML = `<div class="tf-drawer-head"><button class="fa-ibtn" data-x><i class="ph ph-x"></i></button></div>${empty(e.message, 'ph-warning')}`; return; }
    render();
    loadMessages(true);
  }

  function erpHtml() {
    const e = job.erp || {};
    const rows = [];
    if (e.order) rows.push(`<div class="tf-kv"><span>Sipariş</span><b>${esc(e.order.orderNo)} · ${esc(e.order.customerName || '')}</b><small>teslim ${fdate(e.order.dueDate)}${e.shipped != null ? ` · sevk edilen ${e.shipped}` : ''}</small></div>`);
    if (e.product) rows.push(`<div class="tf-kv"><span>Ürün</span><b>${esc(e.product.code || '')} ${esc(e.product.name)}</b><small>toplam stok ${e.product.stock} ${esc(e.product.unit || '')} · mamul deposu ${e.fgStock ?? 0}</small></div>`);
    if (e.materials && e.materials.length) {
      const miss = e.materials.filter((m) => !m.ok);
      rows.push(`<div class="tf-kv"><span>Reçete malzemesi</span><b class="${miss.length ? 'bad' : 'good'}">${miss.length ? `${miss.length} malzeme yetersiz` : 'Kalan iş için yeterli'}</b>
        <small>${e.materials.map((m) => `<span class="tf-mat ${m.ok ? '' : 'bad'}" title="gereken ${m.need} · stok ${m.stock}">${esc(m.name)}</span>`).join('')}</small></div>`);
    }
    if (e.posting) rows.push(`<div class="tf-erp-note"><i class="ph ph-plugs-connected"></i> ${e.posting === 'production' ? 'Onaylandığında ERP\'ye <b>üretim girişi</b> yapılır: reçeteye göre hammadde düşer, Mamul Ürün Deposu stoğu artar.' : 'Onaylandığında ERP\'ye <b>sevk / satış kaydı</b> açılır: stok düşer, müşteri bakiyesi artar.'}${job.erpRef ? `<br><code>${esc(job.erpRef)}</code>` : ''}</div>`);
    return rows.length ? `<section class="tf-sec"><h4><i class="ph ph-database"></i> ERP bağlantısı</h4>${rows.join('')}</section>` : '';
  }

  function timelineHtml() {
    const lbl = { start: 'başladı', block: 'engel bildirdi', unblock: 'engeli kaldırdı', complete: 'onaya gönderdi', approve: 'onayladı', reject: 'revize istedi', cancel: 'iptal etti', assign: 'atama yaptı' };
    return `<section class="tf-sec"><h4><i class="ph ph-clock-counter-clockwise"></i> Akış geçmişi</h4><ol class="tf-timeline">${job.events.slice(-12).reverse().map((e) => `<li class="t-${e.action}"><i></i><div><b>${esc(e.actorName || 'Sistem')}</b> ${lbl[e.action] || e.action}${e.reason ? ` — <em>${esc(e.reason)}</em>` : ''}${e.erpRef ? ` <code>${esc(e.erpRef)}</code>` : ''}<small>${ago(e.createdAt)}</small></div></li>`).join('') || '<li><div><small>Kayıt yok</small></div></li>'}</ol></section>`;
  }

  function assignHtml() {
    if (!job.canAssign) return '';
    return `<section class="tf-sec"><h4><i class="ph ph-user-switch"></i> Atama <button class="tf-link" data-cands>${cand ? 'Yenile' : 'En müsait çalışanları göster'}</button></h4>
      ${cand ? `<div class="tf-cands">${cand.candidates.map((c) => `<button class="tf-cand ${c.recommended ? 'rec' : ''} ${c.id === job.assigneeId ? 'cur' : ''}" data-assign="${c.id}">
        ${avatar(c.id, c.name, 32, c.online)}<span><b>${esc(c.name)}</b><small>${c.open} açık iş${c.overdue ? ` · ${c.overdue} gecikmiş` : ''}${c.score != null ? ` · skor ${c.score}` : ''}</small></span>
        <span class="tf-load"><i style="width:${Math.min(100, c.load * 8)}%"></i><em>${c.load} gün</em></span>${c.recommended ? '<span class="tf-chip green">En müsait</span>' : ''}${c.id === job.assigneeId ? '<span class="tf-chip slate">Mevcut</span>' : ''}</button>`).join('') || '<p class="hint">Birimde çalışan yok.</p>'}</div>` : ''}</section>`;
  }

  function render() {
    const st = STATE[job.flowState] || STATE.todo;
    const pr = PRIORITY[job.priority] || PRIORITY.medium;
    panel.innerHTML = `
      <div class="tf-drawer-head" style="--pc:${job.processColor || '#64748B'}">
        <div class="tf-dh-top"><span class="tf-chip ${st.tone}"><i class="ph ${st.icon}"></i> ${st.label}</span><span class="tf-chip ${pr[1]}">${pr[0]}</span>${job.reworkCount ? `<span class="tf-chip amber"><i class="ph ph-arrow-u-up-left"></i> ${job.reworkCount}. revize</span>` : ''}
          <button class="fa-ibtn" data-x aria-label="Kapat"><i class="ph ph-x"></i></button></div>
        <small class="tf-proc"><i class="ph ${job.processIcon || 'ph-gear'}"></i> ${esc(job.processName || '')} · ${esc(job.jobNo)}</small>
        <h2>${esc(job.title)}</h2>
        <div class="tf-dh-meta">
          <span>${job.assigneeId ? `${avatar(job.assigneeId, job.assigneeName, 24, status.online.has(job.assigneeId))} ${esc(job.assigneeName)}` : '<em>Atanmamış</em>'}</span>
          ${job.reviewerId ? `<span><i class="ph ph-arrow-right"></i> onay: ${avatar(job.reviewerId, job.reviewerName, 24, status.online.has(job.reviewerId))} ${esc(job.reviewerName)}</span>` : ''}
          ${dueChip(job)}
        </div>
        <div class="tf-prog"><i style="width:${job.progress}%"></i></div><small class="tf-prog-t">${job.doneQty || 0} / ${job.plannedQty} adet${job.scrapQty ? ` · fire ${job.scrapQty}` : ''} · plan ${fdate(job.plannedStart)} – ${fdate(job.plannedEnd)}</small>
        ${job.blockedReason && job.flowState === 'blocked' ? `<div class="tf-alert red"><i class="ph ph-prohibit"></i> ${esc(job.blockedReason)}</div>` : ''}
        <div class="tf-actions">${job.allowed.map((a) => `<button class="btn btn-sm ${ACTION[a].cls}" data-act="${a}"><i class="ph ${ACTION[a].icon}"></i> ${ACTION[a].label}</button>`).join('')}</div>
      </div>
      <div class="tf-drawer-body">
        <div class="tf-drawer-info">${assignHtml()}${erpHtml()}${timelineHtml()}</div>
        <section class="tf-thread">
          <h4><i class="ph ph-chats-circle"></i> Tartışma <span class="tf-live ${status.live ? 'on' : ''}" title="${status.live ? 'Canlı bağlantı açık' : 'Yeniden bağlanıyor…'}"><i></i>${status.live ? 'canlı' : 'bağlanıyor'}</span></h4>
          <div class="tf-msgs" aria-live="polite"></div>
          <div class="tf-typing" hidden></div>
          <form class="tf-compose" autocomplete="off"><div class="tf-reply" hidden></div><textarea rows="1" maxlength="2000" placeholder="Mesaj yazın… (@kullanici.adi ile birini anın)"></textarea><button class="fa-ibtn tf-send" aria-label="Gönder"><i class="ph ph-paper-plane-right"></i></button></form>
        </section>
      </div>`;
    renderMessages();
  }

  let replyTo = null;
  function renderMessages() {
    const box = panel.querySelector('.tf-msgs');
    if (!box) return;
    let prevUser = null, prevDay = null;
    box.innerHTML = msgs.length ? msgs.map((m) => {
      const day = m.createdAt.slice(0, 10);
      const sep = day !== prevDay ? `<div class="tf-day"><span>${new Date(m.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span></div>` : '';
      prevDay = day;
      if (m.kind === 'system') { prevUser = null; return `${sep}<div class="tf-sys"><i class="ph ph-lightning"></i> <b>${esc(m.userName || '')}</b> · ${esc(m.body)} <small>${ftime(m.createdAt)}</small></div>`; }
      const mine = m.userId === me.id, grouped = prevUser === m.userId && !sep; prevUser = m.userId;
      const reply = m.replyTo ? msgs.find((x) => x.id === m.replyTo) : null;
      const body = esc(m.body).replace(/@([a-z0-9._-]{3,40})/gi, '<span class="tf-mention">@$1</span>');
      return `${sep}<div class="tf-msg ${mine ? 'mine' : ''} ${grouped ? 'grp' : ''}" data-mid="${m.id}">${mine || grouped ? '<span class="tf-av-sp"></span>' : avatar(m.userId, m.userName, 30, status.online.has(m.userId))}
        <div class="tf-bub">${!mine && !grouped ? `<b>${esc(m.userName || '')}</b>` : ''}${reply ? `<blockquote>${esc((reply.userName || '') + ': ' + reply.body.slice(0, 80))}</blockquote>` : ''}<p>${body}</p><small>${ftime(m.createdAt)}<button class="tf-rep" data-reply="${m.id}" title="Yanıtla"><i class="ph ph-arrow-bend-up-left"></i></button></small></div></div>`;
    }).join('') : `<div class="tf-empty sm"><i class="ph ph-chat-teardrop-dots"></i><p>İlk mesajı siz yazın. Sorular, fotoğraf açıklamaları, ölçüm notları…</p></div>`;
    box.scrollTop = box.scrollHeight;
  }

  async function loadMessages(full) {
    try {
      const rows = (await api.get(`/jt/flow/jobs/${encodeURIComponent(jobId)}/messages?after=${full ? 0 : lastId}`)).data;
      if (full) msgs = rows; else msgs = msgs.concat(rows.filter((r) => !msgs.some((m) => m.id === r.id)));
      if (msgs.length) lastId = msgs[msgs.length - 1].id;
      renderMessages();
    } catch (_e) { /* */ }
  }

  async function send() {
    const ta = panel.querySelector('.tf-compose textarea');
    const text = ta.value.trim(); if (!text) return;
    ta.value = ''; ta.style.height = '';
    // iyimser gösterim: sunucu onayı gelene kadar soluk
    const temp = { id: -Date.now(), userId: me.id, userName: me.name, body: text, replyTo, kind: 'text', createdAt: new Date().toISOString() };
    msgs.push(temp); renderMessages();
    panel.querySelector(`[data-mid="${temp.id}"]`)?.classList.add('pending');
    const rt = replyTo; replyTo = null; panel.querySelector('.tf-reply').hidden = true;
    try { await api.post(`/jt/flow/jobs/${encodeURIComponent(jobId)}/messages`, { body: text, replyTo: rt }); msgs = msgs.filter((m) => m.id !== temp.id); await loadMessages(false); }
    catch (e) { msgs = msgs.filter((m) => m.id !== temp.id); renderMessages(); ta.value = text; showToast(e.message, 'error'); }
  }

  panel.addEventListener('click', async (e) => {
    if (e.target.closest('[data-x]')) return closeDrawer();
    const act = e.target.closest('[data-act]');
    if (act) { act.disabled = true; if (await runAction(job, act.dataset.act)) { await load(); onChange && onChange(); } else act.disabled = false; return; }
    if (e.target.closest('[data-cands]')) { try { cand = (await api.get(`/jt/flow/jobs/${encodeURIComponent(jobId)}/candidates`)).data; render(); } catch (err) { showToast(err.message, 'error'); } return; }
    const as = e.target.closest('[data-assign]');
    if (as) { try { const r = await api.post(`/jt/flow/jobs/${encodeURIComponent(jobId)}/assign`, { userId: Number(as.dataset.assign) }); showToast(r.message, 'success'); cand = null; await load(); onChange && onChange(); } catch (err) { showToast(err.message, 'error'); } return; }
    const rep = e.target.closest('[data-reply]');
    if (rep) { const m = msgs.find((x) => x.id === Number(rep.dataset.reply)); replyTo = m.id; const r = panel.querySelector('.tf-reply'); r.hidden = false; r.innerHTML = `<span>↪ ${esc(m.userName)}: ${esc(m.body.slice(0, 60))}</span><button type="button" data-noreply>×</button>`; panel.querySelector('.tf-compose textarea').focus(); return; }
    if (e.target.closest('[data-noreply]')) { replyTo = null; panel.querySelector('.tf-reply').hidden = true; }
  });
  panel.addEventListener('submit', (e) => { e.preventDefault(); send(); });
  panel.addEventListener('keydown', (e) => {
    if (e.target.matches('.tf-compose textarea') && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    if (e.key === 'Escape') closeDrawer();
  });
  panel.addEventListener('input', (e) => {
    if (!e.target.matches('.tf-compose textarea')) return;
    e.target.style.height = ''; e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`;
    api.post(`/jt/flow/jobs/${encodeURIComponent(jobId)}/typing`, {}).catch(() => {});
  });
  el.querySelector('.tf-drawer-bg').addEventListener('click', closeDrawer);

  // canlı olaylar: yeni mesaj, "yazıyor…", iş durumu değişimi
  offs.push(on('message', (d) => { if (d.jobId === jobId) loadMessages(false); }));
  offs.push(on('typing', (d) => {
    if (d.jobId !== jobId || d.userId === me.id) return;
    const t = panel.querySelector('.tf-typing'); if (!t) return;
    t.hidden = false; t.innerHTML = `<span class="tf-dots"><i></i><i></i><i></i></span> ${esc(d.name)} yazıyor…`;
    clearTimeout(typingT); typingT = setTimeout(() => { t.hidden = true; }, 3500);
  }));
  offs.push(on('job', (d) => { if (d.id === jobId && d.by !== me.id && d.action !== 'message') load(); }));
  offs.push(on('status', () => { const l = panel.querySelector('.tf-live'); if (l) { l.classList.toggle('on', status.live); l.lastChild.textContent = status.live ? 'canlı' : 'bağlanıyor'; } }));
  const mo = new MutationObserver(() => { if (!el.isConnected) { offs.forEach((f) => f()); mo.disconnect(); } });
  mo.observe(document.body, { childList: true });
  load();
}
