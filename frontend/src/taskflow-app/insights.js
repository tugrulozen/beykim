/**
 * Ekip & Performans (performans kartları ve göstergeler), Yönetici Paneli (darboğaz, akış, ERP sipariş riski)
 * ve Birimler (ERP süreçleri ve deposuna bağlı birim hiyerarşisi: ekle / düzenle / sil).
 */
import api from '../core/api.js';
import router from '../core/router.js';
import Auth from '../core/auth.js';
import { showToast } from '../components/toast.js';
import { htmlDialog, formDialog, choiceDialog, confirmDialog } from '../components/dialog.js';
import { exportTable, exportButton } from '../core/exportTable.js';
import { on } from './live.js';
import { openDrawer } from './drawer.js';
import { STATE, LEVEL, avatar, ring, bar, donut, stacked, fdate, hours, empty, spinner, esc } from './ui.js';

const badges = (list) => (list || []).map((b) => `<span class="tf-badge" title="${esc(b.hint)}"><i class="ph ${b.icon}"></i>${esc(b.label)}</span>`).join('');
const levelTag = (lv) => (lv ? `<span class="tf-level" style="--lc:${LEVEL[lv][1]}">${LEVEL[lv][0]}</span>` : '');

async function personDialog(id) {
  try {
    const p = (await api.get(`/jt/flow/performance/${id}?days=90`)).data;
    const trend = stacked(p.trend.map((w) => ({ label: fdate(w.week), values: [w.onTime, Math.max(0, w.done - w.onTime - w.rework), w.rework] })), [{ label: 'Zamanında', color: '#22A06B' }, { label: 'Geç', color: '#E0A526' }, { label: 'Revizeli', color: '#E11D48' }], 120);
    await htmlDialog({ title: p.name, icon: 'ph-user-circle', html: `
      <div class="tf-pd"><div class="tf-pd-head">${ring(p.score, 92, 9, p.level)}<div><b>${esc(p.title || '')}</b><small>${esc(p.unit ? p.unit.name : '')}</small>${levelTag(p.level)}<div class="tf-badges">${badges(p.badges)}</div></div></div>
      <div class="tf-metrics">${bar('Zamanında teslim (%35)', p.metrics.onTimePct)}${bar('İlk seferde onay (%25)', p.metrics.firstPassPct)}${bar('Hız / standart süre (%20)', p.metrics.speedPct)}${bar('İş hacmi (%10)', p.metrics.volumePct)}${bar('Düşük fire (%10)', p.metrics.scrapPct == null ? null : Math.max(0, Math.round(100 - p.metrics.scrapPct * 10)), `fire %${p.metrics.scrapPct}`)}</div>
      <h4>Son 8 hafta</h4>${trend}
      <h4>Son işler</h4><ul class="tf-pd-jobs">${p.recent.map((j) => `<li><span class="tf-dot ${STATE[j.flowState]?.tone || 'slate'}"></span>${esc(j.jobNo)} · ${esc(j.title)}<small>${fdate(j.submittedAt)}${j.reworkCount ? ' · revizeli' : ''}</small></li>`).join('')}</ul></div>` });
  } catch (e) { showToast(e.message, 'error'); }
}

/** EKİP & PERFORMANS */
export function TeamPage() {
  const el = document.createElement('div');
  el.className = 'tf-page tf-team';
  let days = 90, data = null;
  el.innerHTML = spinner();
  async function load() {
    try { data = (await api.get(`/jt/flow/performance?days=${days}`)).data; } catch (e) { el.innerHTML = empty(e.message, 'ph-warning'); return; }
    el.innerHTML = `
      <div class="tf-toolbar"><div class="tf-chips">${[30, 90, 180].map((d) => `<button class="tf-pill ${d === days ? 'on' : ''}" data-days="${d}">Son ${d} gün</button>`).join('')}</div>
        <button class="tf-link" data-how><i class="ph ph-info"></i> Skor nasıl hesaplanıyor?</button>${exportButton('tf-perf-export')}</div>
      <div class="tf-pcards">${data.rows.map((r) => `<button class="tf-pcard" data-person="${r.id}">
        <div class="tf-pc-head">${ring(r.score, 58, 6, r.level)}<div><b>${esc(r.name)}</b><small>${esc(r.title || '')}</small>${levelTag(r.level)}</div>${r.rank ? `<span class="tf-rank">${r.rank}. sıra</span>` : ''}</div>
        <div class="tf-pc-stats"><span><b>${r.n}</b>iş</span><span><b>${r.metrics.onTimePct ?? '–'}${r.metrics.onTimePct != null ? '%' : ''}</b>zamanında</span><span><b>${r.metrics.firstPassPct ?? '–'}${r.metrics.firstPassPct != null ? '%' : ''}</b>ilk onay</span><span><b>${r.load ? r.load.open : 0}</b>açık</span></div>
        <div class="tf-badges">${badges(r.badges) || '<small class="hint">Belirgin gösterge yok</small>'}</div></button>`).join('') || empty('Bu dönemde tamamlanan iş yok.')}</div>`;
  }
  el.addEventListener('click', async (e) => {
    const d = e.target.closest('[data-days]'); if (d) { days = Number(d.dataset.days); return load(); }
    const p = e.target.closest('[data-person]'); if (p) return personDialog(p.dataset.person);
    if (e.target.closest('[data-how]')) return htmlDialog({ title: 'Performans skoru', icon: 'ph-function', html: `<p>Skor 0–100 arasıdır ve seçilen dönemde onaya gönderilen işlerden hesaplanır:</p>
      <ul class="tf-how"><li><b>%35 Zamanında teslim</b>: planlanan bitişten önce onaya gönderilen işlerin oranı</li><li><b>%25 İlk seferde onay</b>: revize almadan onaylanan işlerin oranı</li>
      <li><b>%20 Hız</b>: süreç standart süresi ÷ gerçek süre (1,5 katı hız = tam puan)</li><li><b>%10 İş hacmi</b>: birimdeki en yüksek iş hacmine oran</li><li><b>%10 Fire</b>: 100 − fire% × 10</li></ul>
      <p>Az iş yapanların skoru uç değer almasın diye ortalamaya (70) doğru yumuşatılır. Performans düzeyleri: Mükemmel 90+, Yüksek 80+, Beklenen 65+, Gelişmeli 65 altı.</p>` });
    if (e.target.closest('#tf-perf-export') && data) exportTable(`Performans ${days} gün`, [['Çalışan', 'name'], ['Birim', (r) => (r.unit ? r.unit.name : '')], ['Skor', 'score'], ['Performans düzeyi', (r) => (r.level ? LEVEL[r.level][0] : '')], ['Tamamlanan', 'n'], ['Zamanında %', (r) => r.metrics.onTimePct], ['İlk seferde onay %', (r) => r.metrics.firstPassPct], ['Hız %', (r) => r.metrics.speedPct], ['Fire %', (r) => r.metrics.scrapPct], ['Revize', 'rejected'], ['Göstergeler', (r) => r.badges.map((b) => b.label).join(', ')]], data.rows);
  });
  load();
  return el;
}

/** PATRON PANELİ */
export function BossPage() {
  const el = document.createElement('div');
  el.className = 'tf-page tf-boss';
  el.innerHTML = spinner();
  async function load() {
    let d;
    try { d = (await api.get('/jt/flow/boss')).data; } catch (e) { el.innerHTML = empty(e.message, 'ph-lock-key'); return; }
    const k = d.kpi;
    const kpi = (label, v, icon, tone, sub = '') => `<div class="tf-kpi ${tone}"><i class="ph ${icon}"></i><div><small>${label}</small><b>${v}</b>${sub ? `<em>${sub}</em>` : ''}</div></div>`;
    const bn = d.units.filter((u) => u.bottleneck);
    el.innerHTML = `
      <div class="tf-kpis">
        ${kpi('Aktif iş', k.open, 'ph-stack', 'blue')}${kpi('Onay bekleyen', k.review, 'ph-hourglass-medium', 'violet')}${kpi('Geciken', k.overdue, 'ph-warning', 'red')}
        ${kpi('Engelli / Revize', `${k.blocked} / ${k.rework}`, 'ph-prohibit', 'amber')}${kpi('Bu hafta onaylanan', k.approvedWeek, 'ph-seal-check', 'green', `revize oranı %${k.rejectRate}`)}${kpi('Ortalama performans', k.avgScore ?? '–', 'ph-gauge', 'gold', `${k.online} kişi çevrimiçi`)}
      </div>
      ${bn.length ? `<div class="tf-alert red big"><i class="ph ph-funnel"></i><div><b>Darboğaz: ${bn.map((u) => esc(u.name)).join(', ')}</b><small>${bn.map((u) => `${esc(u.name)}: kişi başı ${u.perMember} açık iş, ${u.overdue} geciken, ${u.reviewQueue} onay bekleyen${u.avgReviewWaitH ? ` (ort. ${hours(u.avgReviewWaitH)})` : ''}`).join(' · ')}</small></div></div>` : ''}
      <div class="tf-grid">
        <section class="card tf-panel"><h3><i class="ph ph-chart-donut"></i> Anlık durum</h3><div class="tf-donut-wrap">${donut(['todo', 'in_progress', 'blocked', 'rework', 'review'].map((s) => ({ label: STATE[s].label, value: d.counts[s] || 0, color: { todo: '#94A3B8', in_progress: '#3B82F6', blocked: '#E11D48', rework: '#F59E0B', review: '#8B5CF6' }[s] })))}
          <ul class="tf-dl">${['todo', 'in_progress', 'blocked', 'rework', 'review'].map((s) => `<li><span class="tf-dot ${STATE[s].tone}"></span>${STATE[s].label}<b>${d.counts[s] || 0}</b></li>`).join('')}</ul></div></section>
        <section class="card tf-panel wide"><h3><i class="ph ph-chart-bar"></i> Son 14 gün akış</h3>${stacked(d.flow.map((f) => ({ label: fdate(f.day), values: [f.completed, f.approved, f.rejected] })), [{ label: 'Onaya gönderilen', color: '#8B5CF6' }, { label: 'Onaylanan', color: '#22A06B' }, { label: 'Revize', color: '#E11D48' }], 150)}</section>
      </div>
      <section class="card tf-panel"><h3><i class="ph ph-funnel"></i> Birim yükü ve darboğazlar</h3>
        <div class="tf-units">${d.units.map((u) => `<button class="tf-unitrow ${u.bottleneck ? 'bn' : ''}" data-unit="${u.id}"><span class="tf-uname"><i class="ph ${u.icon}" style="color:${u.color}"></i><b>${esc(u.name)}</b><small>${esc(u.manager || '')} · ${u.members} kişi</small></span>
          <span class="tf-press"><i style="width:${u.pressurePct}%;background:${u.bottleneck ? '#E11D48' : u.pressurePct > 60 ? '#F59E0B' : '#22A06B'}"></i></span>
          <span class="tf-ustats"><span title="Açık iş"><i class="ph ph-stack"></i>${u.wip}</span><span title="Kişi başı"><i class="ph ph-user"></i>${u.perMember}</span><span class="${u.overdue ? 'bad' : ''}" title="Geciken"><i class="ph ph-warning"></i>${u.overdue}</span><span title="Onay kuyruğu"><i class="ph ph-hourglass-medium"></i>${u.reviewQueue}</span><span title="Bu hafta onaylanan"><i class="ph ph-seal-check"></i>${u.throughput}</span></span>
          ${u.bottleneck ? '<span class="tf-chip red solid">Darboğaz</span>' : ''}</button>`).join('')}</div></section>
      <div class="tf-grid">
        <section class="card tf-panel"><h3><i class="ph ph-chart-line-up"></i> En yüksek performans (30 gün)</h3>${d.top.map((r, i) => `<button class="tf-lrow" data-person="${r.id}"><span class="tf-rankno">${i + 1}</span>${avatar(r.id, r.name, 30)}<span><b>${esc(r.name)}</b><small>${esc(r.unit ? r.unit.name : '')}</small></span><span class="tf-badges sm">${badges(r.badges.slice(0, 2))}</span><b class="tf-score">${r.score}</b></button>`).join('') || empty('Veri yok')}
          ${d.bottom.length ? `<h4 class="tf-sub">Gelişim alanı olanlar</h4>${d.bottom.map((r) => `<button class="tf-lrow" data-person="${r.id}">${avatar(r.id, r.name, 30)}<span><b>${esc(r.name)}</b><small>zamanında %${r.metrics.onTimePct ?? '–'} · revize ${r.rejected}</small></span><b class="tf-score low">${r.score}</b></button>`).join('')}` : ''}</section>
        <section class="card tf-panel"><h3><i class="ph ph-hourglass-medium"></i> En uzun bekleyen onaylar</h3>${d.waitingLong.map((j) => `<button class="tf-lrow" data-job="${esc(j.id)}"><span class="tf-dot violet"></span><span><b>${esc(j.jobNo)} · ${esc(j.title)}</b><small>${esc(j.assigneeName || '')} → ${esc(j.reviewerName || '')}</small></span><b class="tf-wait">${hours(j.waitingHours)}</b></button>`).join('') || empty('Bekleyen onay yok', 'ph-seal-check')}</section>
      </div>
      <section class="card tf-panel"><h3><i class="ph ph-receipt"></i> ERP siparişleri · teslim riski</h3>
        <div class="fin-tablewrap"><table class="fin-table"><thead><tr><th>Sipariş</th><th>Müşteri</th><th>Teslim</th><th>İlerleme</th><th>Geciken iş</th><th>Risk</th></tr></thead><tbody>
        ${d.orders.map((o) => `<tr><td><b>${esc(o.orderNo)}</b></td><td>${esc(o.customerName || '')}</td><td>${fdate(o.dueDate)} <small>(${o.daysLeft < 0 ? `${-o.daysLeft} gün geçti` : `${o.daysLeft} gün`})</small></td><td><div class="tf-prog sm inline"><i style="width:${o.progress}%"></i></div> %${o.progress}</td><td>${o.late || '—'}</td><td><span class="tf-chip ${o.risk === 'high' ? 'red' : o.risk === 'medium' ? 'amber' : 'green'}">${o.risk === 'high' ? 'Yüksek' : o.risk === 'medium' ? 'Orta' : 'Düşük'}</span></td></tr>`).join('') || '<tr><td colspan="6" class="hint">Açık sipariş yok</td></tr>'}</tbody></table></div></section>`;
  }
  el.addEventListener('click', (e) => {
    const p = e.target.closest('[data-person]'); if (p) return personDialog(p.dataset.person);
    const j = e.target.closest('[data-job]'); if (j) return openDrawer(j.dataset.job, { onChange: load });
    const u = e.target.closest('[data-unit]'); if (u) router.navigate(`board?unit=${u.dataset.unit}`);
  });
  let t; const off = on('job', () => { clearTimeout(t); t = setTimeout(() => (el.isConnected ? load() : off()), 1500); });
  load();
  return el;
}

/**
 * BİRİMLER (yalnız Genel Müdür): hiyerarşi + ERP bağlantısı
 *   - birim ERP üretim süreçlerine (jt_processes) bağlanır; o süreçlerin işleri bu birimin panosuna ve onayına düşer
 *   - birim deposu ERP depolarından (warehouses) seçilir; birim kodu masraf merkezi olarak kullanılır
 *   - yeni üretim süreci birimle birlikte tanımlanabilir (ERP iş emirlerinde seçilebilir hale gelir)
 */
export function UnitsPage() {
  const el = document.createElement('div');
  el.className = 'tf-page tf-unitspage';
  el.innerHTML = spinner();
  let units = [], refs = null;
  async function load() {
    try { [units, refs] = await Promise.all([api.get('/jt/flow/units').then((r) => r.data), api.get('/jt/flow/erp-refs').then((r) => r.data)]); }
    catch (e) { el.innerHTML = empty(e.message, 'ph-lock-key'); return; }
    const node = (u) => `<li><button class="tf-unode" data-edit="${u.id}" style="--uc:${u.color || '#64748B'}"><i class="ph ${u.icon || 'ph-users-three'}"></i>
      <span><b>${esc(u.name)}${u.code ? ` <small>· ${esc(u.code)}</small>` : ''}</b><small>Sorumlu: ${esc(u.managerName || 'atanmamış')} · ${u.members.length} kişi · ${u.openJobs} açık iş</small>
        <span class="tf-erp">${u.processes.map((p) => `<span title="ERP üretim süreci">${esc(p.code)} · ${esc(p.name)}</span>`).join('')}${u.warehouse ? `<span title="ERP deposu">Depo: ${esc(u.warehouse.name)}</span>` : ''}</span></span>
      <span class="tf-avs">${u.members.slice(0, 5).map((m) => avatar(m.id, m.name, 24)).join('')}</span><i class="ph ph-pencil-simple"></i></button>
      ${units.some((c) => c.parentId === u.id) ? `<ul>${units.filter((c) => c.parentId === u.id).map(node).join('')}</ul>` : ''}</li>`;
    el.innerHTML = `<div class="tf-units-head"><p class="tf-lead">Tamamlanan iş, işin bağlı olduğu birimin <b>sorumlusuna</b> onaya gider. İşi yapan kişi sorumlunun kendisiyse bir <b>üst birimin</b> sorumlusuna, en sonda Genel Müdür'e çıkar. Birimler ERP üretim süreçlerine ve depolarına bağlıdır.</p>
      <button class="btn btn-primary btn-sm" data-new><i class="ph ph-plus"></i> Yeni birim</button></div>
      <ul class="tf-tree">${units.filter((u) => !u.parentId).map(node).join('')}</ul>`;
  }

  async function unitDialog(u) {
    const others = units.filter((x) => !u || x.id !== u.id);
    const procHtml = refs.processes.map((p) => {
      const mine = u && u.processIds.includes(p.id);
      return `<label><input type="checkbox" name="proc" value="${esc(p.id)}" ${mine ? 'checked' : ''}><span><b>${esc(p.code)} · ${esc(p.name)}</b><small>standart ${p.stdDays} gün${p.unitName && !mine ? ` · şu an: ${esc(p.unitName)}` : ''}</small></span></label>`;
    }).join('');
    const memHtml = refs.users.map((x) => `<label><input type="checkbox" name="mem" value="${x.id}" ${u && u.members.some((m) => m.id === x.id) ? 'checked' : ''}><span>${esc(x.name)}<small>${esc(x.title || x.roleLabel || '')}</small></span></label>`).join('');
    let dlg = null;
    const v = await formDialog({ title: u ? `${u.name} birimi` : 'Yeni birim', icon: 'ph-tree-structure', wide: true, confirmLabel: u ? 'Kaydet' : 'Birimi oluştur',
      fields: [
        { name: 'name', label: 'Birim adı', value: u ? u.name : '', required: true, half: true },
        { name: 'code', label: 'Birim kodu (masraf merkezi)', value: u ? u.code || '' : '', half: true, placeholder: 'Örn. KAL-01' },
        { name: 'parentId', label: 'Üst birim', type: 'select', options: (u && !u.parentId ? [['', '— (en üst birim)']] : []).concat(others.map((x) => [x.id, x.name])), value: u ? u.parentId || '' : (units.find((x) => !x.parentId) || {}).id, half: true },
        { name: 'managerId', label: 'Sorumlu (onaylayan)', type: 'select', options: [['', '—']].concat(refs.users.map((x) => [x.id, `${x.name} · ${x.title || x.roleLabel || ''}`])), value: u ? u.managerId || '' : '', half: true },
        { name: 'warehouseId', label: 'ERP deposu', type: 'select', options: [['', '—']].concat(refs.warehouses.map((w) => [w.id, `${w.id} · ${w.name}`])), value: u ? u.warehouseId || '' : '' },
      ],
      footerHtml: `<div class="tf-unitform">
        <div><h5>ERP üretim süreçleri</h5><div class="tf-proclist">${procHtml}</div><small class="hint">Başka birime bağlı bir süreç seçilirse o birimden bu birime taşınır.</small></div>
        <div><h5>Yeni üretim süreci (isteğe bağlı)</h5><div class="tf-newproc"><input data-np="name" placeholder="Süreç adı, ör. CNC Boru Kesim" maxlength="80"><input data-np="code" placeholder="Kod" maxlength="12"><input data-np="stdDays" type="number" min="0.5" max="60" step="0.5" placeholder="Std. gün"></div></div>
        <div><h5>Birim üyeleri</h5><div class="tf-memlist">${memHtml}</div></div></div>`,
      onMount: (d) => { dlg = d; },
      validate: () => {
        const np = dlg && dlg.querySelector('[data-np="name"]').value.trim();
        if (np && !(Number(dlg.querySelector('[data-np="stdDays"]').value) > 0)) return 'Yeni süreç için standart süreyi (gün) girin.';
        return null;
      } });
    if (!v) return;
    const pick = (n) => [...dlg.querySelectorAll(`input[name="${n}"]:checked`)].map((i) => i.value);
    const npName = dlg.querySelector('[data-np="name"]').value.trim();
    const body = { ...v, processIds: pick('proc'), memberIds: pick('mem').map(Number),
      newProcess: npName ? { name: npName, code: dlg.querySelector('[data-np="code"]').value.trim(), stdDays: Number(dlg.querySelector('[data-np="stdDays"]').value) } : null };
    try {
      const r = u ? await api.put(`/jt/flow/units/${encodeURIComponent(u.id)}`, body) : await api.post('/jt/flow/units', body);
      showToast(r.message, 'success'); load();
    } catch (err) { showToast(err.message, 'error'); }
  }

  el.addEventListener('click', async (e) => {
    if (e.target.closest('[data-new]')) return unitDialog(null);
    const b = e.target.closest('[data-edit]'); if (!b) return;
    const u = units.find((x) => x.id === b.dataset.edit);
    if (!u.parentId) return unitDialog(u);
    const pick = await choiceDialog({ title: u.name, message: `${u.processes.length} ERP süreci · ${u.members.length} kişi · ${u.openJobs} açık iş`, icon: 'ph-tree-structure',
      options: [{ value: 'edit', label: 'Düzenle', icon: 'ph-pencil-simple' }, { value: 'delete', label: 'Birimi sil', icon: 'ph-trash' }] });
    if (pick === 'edit') return unitDialog(u);
    if (pick === 'delete' && await confirmDialog({ title: 'Birimi sil', message: `"${u.name}" silinecek. Süreçleri ve açık işleri üst birime devredilir.`, confirmLabel: 'Sil', danger: true })) {
      try { showToast((await api.delete(`/jt/flow/units/${encodeURIComponent(u.id)}`)).message, 'success'); load(); } catch (err) { showToast(err.message, 'error'); }
    }
  });
  load();
  return el;
}

export { Auth };
