import api from '../core/api.js';
import { createHeader } from '../components/header.js';
import { showToast } from '../components/toast.js';
import { esc } from '../components/shell.js';

export default function ProductionPage() {
  const container = document.createElement('div');
  container.className = 'page-container';

  const header = createHeader({
    title: 'Üretim İşlemi',
    showBack: true,
    gradientClass: 'gradient-transfer'
  });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  
  content.innerHTML = `
    <div class="transfer-info-card animate-fade-in-down" style="margin-bottom: 20px;">
      <div class="info-icon" style="background: rgba(233, 30, 99, 0.1); color: #e91e63;"><i class="ph ph-factory"></i></div>
      <div>
        <div style="font-weight: 600; color: var(--text-primary);">Üretim Fişi</div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">Reçeteye bağlı üretim yapın. Hammaddeler düşülecek, ürün stoğa eklenecektir.</div>
      </div>
    </div>

    <div class="card animate-fade-in-up stagger-1">
      <div class="input-group">
        <label>Üretilecek Ürün</label>
        <div class="input-field">
          <span class="select-icon"><i class="ph ph-package"></i></span>
          <select id="prod-product" class="select-input">
            <option value="">Yükleniyor...</option>
          </select>
          <span class="select-arrow"><i class="ph ph-caret-down"></i></span>
        </div>
      </div>

      <div class="input-group" style="margin-top: 15px;">
        <label>Miktar</label>
        <div class="input-field">
          <span class="input-icon"><i class="ph ph-hash"></i></span>
          <input type="number" id="prod-quantity" placeholder="Örn: 10" min="1" value="1" />
        </div>
      </div>

      <div id="recipe-preview" style="margin-top: 15px; display:none;">
        <div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Harcayacağınız Hammaddeler (Tahmini)</div>
        <div id="recipe-preview-content" style="background:var(--bg-card); padding:10px; border-radius:8px; border:1px solid var(--border-color);"></div>
      </div>

      <button class="btn btn-primary btn-block btn-lg" id="prod-btn" style="margin-top: 20px; background: #e91e63;">
        <i class="ph ph-play"></i> Üretimi Başlat
      </button>
    </div>
  `;
  container.appendChild(content);

  const productSelect = content.querySelector('#prod-product');
  const qtyInput = content.querySelector('#prod-quantity');
  const previewDiv = content.querySelector('#recipe-preview');
  const previewContent = content.querySelector('#recipe-preview-content');
  const prodBtn = content.querySelector('#prod-btn');

  let recipes = [];
  let rawMaterials = [];

  const loadData = async () => {
    const res = await api.getRecipes();
    const rawRes = await api.getRawMaterials();
    
    if (res.success && rawRes.success) {
      recipes = res.data;
      rawMaterials = rawRes.data;
      
      productSelect.innerHTML = '<option value="">Ürün Seçiniz...</option>' + 
        recipes.map(r => `<option value="${esc(r.productId)}">${esc(r.name.replace(' Reçetesi', ''))}</option>`).join('');
    } else {
      productSelect.innerHTML = '<option value="">Hata oluştu</option>';
    }
  };

  const updatePreview = () => {
    const productId = productSelect.value;
    const qty = parseInt(qtyInput.value) || 0;
    
    if (!productId || qty <= 0) {
      previewDiv.style.display = 'none';
      return;
    }

    const recipe = recipes.find(r => r.productId === productId);
    if (!recipe) {
      previewDiv.style.display = 'none';
      return;
    }

    previewContent.innerHTML = recipe.materials.map(mat => {
      const rm = rawMaterials.find(r => r.id === mat.rawMaterialId);
      const needed = mat.quantity * qty;
      const isEnough = rm && rm.stock >= needed;
      const color = isEnough ? 'var(--success)' : 'var(--error)';
      
      return `
        <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:4px; padding-bottom:4px; border-bottom:1px solid var(--border-light);">
          <span style="color:var(--text-secondary)"><i class="ph ph-flask"></i> ${esc(rm ? rm.name : 'Bilinmeyen')}</span>
          <span style="font-weight:600; color:${color};">${needed.toFixed(2)} ${esc(rm ? rm.unit : '')}</span>
        </div>
      `;
    }).join('');
    
    previewDiv.style.display = 'block';
  };

  productSelect.addEventListener('change', updatePreview);
  qtyInput.addEventListener('input', updatePreview);

  prodBtn.addEventListener('click', async () => {
    const productId = productSelect.value;
    const qty = parseInt(qtyInput.value) || 0;

    if (!productId) return showToast('Ürün seçmediniz', 'warning');
    if (qty <= 0) return showToast('Geçerli bir miktar girin', 'warning');

    prodBtn.disabled = true;
    prodBtn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-color:#fff;border-top-color:transparent;"></div>';

    const res = await api.produceItem(productId, qty);
    
    prodBtn.disabled = false;
    prodBtn.innerHTML = '<i class="ph ph-play"></i> Üretimi Başlat';

    if (res.success) {
      showToast(res.message, 'success');
      qtyInput.value = 1;
      productSelect.value = '';
      previewDiv.style.display = 'none';
      
      // Update raw materials state
      api.getRawMaterials().then(r => { if (r.success) rawMaterials = r.data; });
    } else {
      showToast(res.message, 'error');
    }
  });

  setTimeout(loadData, 0);

  return container;
}
