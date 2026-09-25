/**
 * DEPO TAKİP - Stok Yönetimi (Stok Detay sayfasının ikinci sekmesi)
 * Firmadaki tüm ürünlerin depo bazlı stoğunu görür; artırır, azaltır, sayıma göre ayarlar; ürünü siler.
 */
import api from '../core/api.js';
import { showToast } from '../components/toast.js';
import { confirmDialog } from '../components/dialog.js';
import { esc } from '../components/shell.js';

const fmt = (n) => Number(n || 0).toLocaleString('tr-TR');

export async function mountStockManager(area) {
  area.innerHTML = '<div style="display:flex;justify-content:center;padding:40px;"><div class="loading-spinner"></div></div>';

  let products = [];
  let warehouses = [];
  let balances = [];
  let query = '';
  let whFilter = '';
  let onlyStocked = false;
  const busy = new Set();

  async function load() {
    const [p, w, b] = await Promise.all([api.get('/products'), api.get('/warehouses'), api.get('/warehouse-balances')]);
    products = p.success ? p.data : [];
    warehouses = w.success ? w.data : [];
    balances = b.success ? b.data : [];
  }

  try { await load(); } catch (e) {
    area.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="ph ph-warning"></i></div><div class="empty-text">${esc(e.message)}</div></div>`;
    return;
  }

  area.innerHTML = `
    <div class="sm-toolbar">
      <div class="input-field sm-search">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="search" id="sm-q" placeholder="Ürün adı, kod veya barkod ara..." autocomplete="off" />
      </div>
      <div class="input-field sm-wh">
        <span class="input-icon"><i class="ph ph-warehouse"></i></span>
        <select id="sm-wh" class="input-element">
          <option value="">Tüm depolar</option>
          ${warehouses.map((w) => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
        </select>
      </div>
      <label class="sm-check"><input type="checkbox" id="sm-stocked" /> Yalnızca stoklu ürünler</label>
    </div>
    <div class="sm-summary" id="sm-summary"></div>
    <div id="sm-list"></div>`;

  const list = area.querySelector('#sm-list');
  const summary = area.querySelector('#sm-summary');

  const qtyOf = (pid, wid) => balances.find((b) => b.productId === pid && b.warehouseId === wid)?.qty || 0;
  const rowsFor = (p) => {
    if (whFilter) return [warehouses.find((w) => w.id === whFilter)].filter(Boolean);
    return warehouses.filter((w) => qtyOf(p.id, w.id) > 0);
  };

  function stepperRow(p, w) {
    const qty = qtyOf(p.id, w.id);
    return `
      <div class="sm-row" data-wid="${esc(w.id)}">
        <span class="sm-wh-name"><i class="ph ph-warehouse"></i> ${esc(w.name)}</span>
        <div class="sm-stepper">
          <button type="button" data-act="dec" aria-label="Azalt" ${qty <= 0 ? 'disabled' : ''}><i class="ph ph-minus"></i></button>
          <input type="number" min="0" step="1" value="${qty}" data-role="qty" inputmode="numeric" aria-label="Depodaki miktar" />
          <button type="button" data-act="inc" aria-label="Artır"><i class="ph ph-plus"></i></button>
        </div>
      </div>`;
  }

  function render() {
    const q = query.toLocaleLowerCase('tr');
    let shown = products.filter((p) => !q || [p.name, p.code, p.barcode].some((v) => String(v || '').toLocaleLowerCase('tr').includes(q)));
    if (onlyStocked) shown = shown.filter((p) => p.stock > 0);
    const totalUnits = shown.reduce((a, p) => a + (p.stock || 0), 0);
    summary.innerHTML = `<b>${fmt(shown.length)}</b> ürün · toplam <b>${fmt(totalUnits)}</b> adet stok`;

    if (!shown.length) {
      list.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="ph ph-package"></i></div><div class="empty-text">Ürün bulunamadı</div></div>';
      return;
    }
    list.innerHTML = shown.map((p) => {
      const rows = rowsFor(p);
      const addable = warehouses.filter((w) => !rows.some((r) => r.id === w.id));
      return `
      <div class="sm-card" data-pid="${esc(p.id)}">
        <div class="sm-head">
          <div class="sm-title">
            <div class="sm-name">${esc(p.name)}</div>
            <div class="sm-meta">${esc(p.code || '')}${p.barcode ? ' · ' + esc(p.barcode) : ''}${p.category ? ' · ' + esc(p.category) : ''}</div>
          </div>
          <div class="sm-total ${p.stock <= 0 ? 'zero' : ''}"><b>${fmt(p.stock)}</b><span>${esc(p.unit || 'Adet')}</span></div>
          <button type="button" class="sm-del" data-act="delete" title="Ürünü sil" aria-label="Ürünü sil"><i class="ph ph-trash"></i></button>
        </div>
        ${rows.length ? rows.map((w) => stepperRow(p, w)).join('') : '<div class="sm-empty">Hiçbir depoda stok yok.</div>'}
        ${addable.length ? `
        <div class="sm-add">
          <select data-role="add-wh" aria-label="Depo seç">
            <option value="">Başka depoya stok ekle…</option>
            ${addable.map((w) => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
          </select>
          <input type="number" data-role="add-qty" min="1" step="1" placeholder="Adet" inputmode="numeric" />
          <button type="button" class="btn btn-secondary" data-act="add"><i class="ph ph-plus"></i> Ekle</button>
        </div>` : ''}
      </div>`;
    }).join('');
  }

  async function adjust(pid, wid, body) {
    const key = pid + '|' + wid;
    if (busy.has(key)) return;
    busy.add(key);
    try {
      const res = await api.post('/stock-adjust', { productId: pid, warehouseId: wid, ...body });
      if (!res.success) throw new Error(res.message || 'Güncellenemedi');
      const { before, after } = res.data;
      const p = products.find((x) => x.id === pid);
      if (p) p.stock = Math.max(0, (p.stock || 0) + (after - before));
      const b = balances.find((x) => x.productId === pid && x.warehouseId === wid);
      if (b) b.qty = after;
      else balances.push({ productId: pid, warehouseId: wid, qty: after });
      showToast(res.message, 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      busy.delete(key);
      render();
    }
  }

  list.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const card = btn.closest('.sm-card');
    const pid = card.dataset.pid;
    const p = products.find((x) => x.id === pid);
    const act = btn.dataset.act;

    if (act === 'inc' || act === 'dec') {
      adjust(pid, btn.closest('.sm-row').dataset.wid, { delta: act === 'inc' ? 1 : -1 });
    } else if (act === 'add') {
      const wid = card.querySelector('[data-role="add-wh"]').value;
      const qty = parseInt(card.querySelector('[data-role="add-qty"]').value, 10);
      if (!wid) return showToast('Depo seçin', 'warning');
      if (!(qty > 0)) return showToast('Geçerli bir adet girin', 'warning');
      adjust(pid, wid, { delta: qty });
    } else if (act === 'delete') {
      const hasStock = (p.stock || 0) > 0;
      const ok = await confirmDialog({
        title: 'Ürün silinsin mi?',
        message: hasStock
          ? `"${p.name}" ürününde ${fmt(p.stock)} adet stok var. Silerseniz stok kaydı da silinir. Bu işlem geri alınamaz.`
          : `"${p.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
        confirmLabel: 'Sil', danger: true,
      });
      if (!ok) return;
      try {
        const res = await api.delete(`/products/${encodeURIComponent(pid)}${hasStock ? '?force=1' : ''}`);
        if (!res.success) throw new Error(res.message);
        products = products.filter((x) => x.id !== pid);
        balances = balances.filter((b) => b.productId !== pid);
        showToast(res.message, 'success');
        render();
      } catch (err) { showToast(err.message, 'error'); }
    }
  });

  // Miktar kutusuna doğrudan sayı yazınca sayıma göre ayarla
  list.addEventListener('change', (e) => {
    const inp = e.target.closest('[data-role="qty"]');
    if (!inp) return;
    const pid = inp.closest('.sm-card').dataset.pid;
    const wid = inp.closest('.sm-row').dataset.wid;
    const v = parseInt(inp.value, 10);
    if (!(v >= 0)) { showToast('Geçerli bir miktar girin', 'warning'); return render(); }
    if (v === qtyOf(pid, wid)) return;
    adjust(pid, wid, { setTo: v, reason: 'Elle düzeltme' });
  });
  list.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); e.target.blur(); } });

  let t;
  area.querySelector('#sm-q').addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { query = e.target.value.trim(); render(); }, 150); });
  area.querySelector('#sm-wh').addEventListener('change', (e) => { whFilter = e.target.value; render(); });
  area.querySelector('#sm-stocked').addEventListener('change', (e) => { onlyStocked = e.target.checked; render(); });

  render();
}
