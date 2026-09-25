import api from '../core/api.js';
import { createHeader } from '../components/header.js';
import { esc } from '../components/shell.js';
import { showToast } from '../components/toast.js';

export default function RawMaterialsPage() {
  const container = document.createElement('div');
  container.className = 'page-container';

  const header = createHeader({
    title: 'Hammadde Takibi',
    showBack: true,
    gradientClass: 'gradient-stock'
  });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  
  content.innerHTML = `
    <div class="search-bar animate-fade-in-down" style="margin-bottom: 15px;">
      <div class="input-field">
        <span class="input-icon"><i class="ph ph-magnifying-glass"></i></span>
        <input type="text" id="rm-search" placeholder="Hammadde ara..." />
      </div>
    </div>
    <div id="rm-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `;
  container.appendChild(content);

  const listContainer = content.querySelector('#rm-list');
  const searchInput = content.querySelector('#rm-search');
  let rawMaterials = [];

  const loadData = async () => {
    const res = await api.getRawMaterials();
    if (res.success) {
      rawMaterials = res.data;
      renderList(rawMaterials);
    } else {
      listContainer.innerHTML = `<div class="empty-state">Veri yüklenemedi.</div>`;
    }
  };

  const renderList = (data) => {
    if (data.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">Hammadde bulunamadı.</div>`;
      return;
    }

    listContainer.innerHTML = data.map((rm, i) => {
      const percent = Math.min(100, Math.round((rm.stock / rm.minStock) * 100));
      const isLow = rm.stock <= rm.minStock;
      const statusColor = isLow ? 'var(--error)' : 'var(--success)';
      
      return `
        <div class="list-item animate-fade-in-up stagger-${(i % 5) + 1}">
          <div class="list-icon" style="background: rgba(139, 195, 74, 0.1); color: #8bc34a;">
            <i class="ph ph-flask"></i>
          </div>
          <div class="list-content">
            <div class="list-title">${esc(rm.name)}</div>
            <div class="list-subtitle">${esc(rm.code)}</div>
            
            <div style="margin-top: 8px;">
              <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                <span style="color:var(--text-secondary)">Stok Durumu</span>
                <span style="color:${statusColor}; font-weight:600;">${rm.stock} ${esc(rm.unit)}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-value" style="width: ${percent > 100 ? 100 : percent}%; background: ${statusColor};"></div>
              </div>
            </div>
          </div>
          <button class="icon-btn rm-adjust-btn" data-id="${rm.id}" data-name="${esc(rm.name)}" title="Stok Düzenle" style="background:#f4f5f7; border-radius:6px; padding:8px;">
            <i class="ph ph-plus-minus" style="font-size:18px; color:var(--primary);"></i>
          </button>
        </div>
      `;
    }).join('');

    // Stok düzenleme butonu olayları
    listContainer.querySelectorAll('.rm-adjust-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        showAdjustModal(btn.dataset.id, btn.dataset.name);
      });
    });
  };

  const showAdjustModal = (id, name) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; align-items:center; justify-content:center;';
    
    overlay.innerHTML = `
      <div class="card animate-fade-in-up" style="width:90%; max-width:400px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
        <h3 style="margin:0 0 16px; font-size:16px;">Hammadde Stok Hareketi</h3>
        <div style="font-weight:600; color:var(--primary); margin-bottom:12px;">${name}</div>
        
        <div class="form-group" style="margin-bottom:12px;">
          <label>İşlem Türü</label>
          <select id="adj-type" class="input-element">
            <option value="IN">Stok Girişi (Artır)</option>
            <option value="OUT">Stok Çıkışı (Azalt / Fire)</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label>Miktar</label>
          <input type="number" id="adj-qty" class="input-element" min="0.01" step="0.01" placeholder="0.00" />
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label>Not / Açıklama</label>
          <input type="text" id="adj-note" class="input-element" placeholder="Sebebi belirtin..." />
        </div>
        
        <div style="display:flex; gap:10px; justify-content:flex-end;">
          <button class="btn btn-outline" id="adj-cancel">İptal</button>
          <button class="btn btn-primary" id="adj-save">Kaydet</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);

    overlay.querySelector('#adj-cancel').addEventListener('click', () => overlay.remove());
    
    overlay.querySelector('#adj-save').addEventListener('click', async () => {
      const type = overlay.querySelector('#adj-type').value;
      const qty = parseFloat(overlay.querySelector('#adj-qty').value);
      const note = overlay.querySelector('#adj-note').value.trim();

      if (!qty || qty <= 0) return showToast('Lütfen geçerli bir miktar girin.', 'warning');
      
      const saveBtn = overlay.querySelector('#adj-save');
      saveBtn.disabled = true;
      saveBtn.innerHTML = 'Kaydediliyor...';
      
      try {
        const r = await api.post('/raw-materials/adjust', { rawMaterialId: id, type, quantity: qty, note });
        if (r.success) {
          overlay.remove();
          loadData(); // Yenile
        } else {
          showToast(r.message || 'Kayıt yapılamadı', 'error');
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Kaydet';
        }
      } catch (err) {
        showToast(err.message || 'Sunucu hatası', 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Kaydet';
      }
    });
  };

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = rawMaterials.filter(r => r.name.toLowerCase().includes(term) || r.code.toLowerCase().includes(term));
    renderList(filtered);
  });

  // Init
  setTimeout(loadData, 0);

  return container;
}
