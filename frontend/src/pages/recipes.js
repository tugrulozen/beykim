import api from '../core/api.js';
import { createHeader } from '../components/header.js';
import { esc } from '../components/shell.js';

export default function RecipesPage() {
  const container = document.createElement('div');
  container.className = 'page-container';

  const header = createHeader({
    title: 'Ürün Reçeteleri',
    showBack: true,
    gradientClass: 'gradient-sales'
  });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';
  
  content.innerHTML = `
    <div id="recipes-list" class="list-container">
      <div class="loading-spinner"></div>
    </div>
  `;
  container.appendChild(content);

  const listContainer = content.querySelector('#recipes-list');

  const loadData = async () => {
    const res = await api.getRecipes();
    const rawRes = await api.getRawMaterials();
    
    if (res.success && rawRes.success) {
      renderList(res.data, rawRes.data);
    } else {
      listContainer.innerHTML = `<div class="empty-state">Veri yüklenemedi.</div>`;
    }
  };

  const renderList = (recipes, rawMaterials) => {
    if (recipes.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">Reçete bulunamadı.</div>`;
      return;
    }

    listContainer.innerHTML = recipes.map((recipe, i) => {
      const materialsHtml = recipe.materials.map(mat => {
        const rm = rawMaterials.find(r => r.id === mat.rawMaterialId);
        return `
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:4px; padding-bottom:4px; border-bottom:1px solid var(--border-light);">
            <span style="color:var(--text-secondary)"><i class="ph ph-flask"></i> ${esc(rm ? rm.name : 'Bilinmeyen')}</span>
            <span style="font-weight:500;">${mat.quantity} ${esc(rm ? rm.unit : '')}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="list-item animate-fade-in-up stagger-${(i % 5) + 1}" style="flex-direction:column; align-items:stretch;">
          <div style="display:flex; align-items:center; margin-bottom: 12px;">
            <div class="list-icon" style="background: rgba(255, 193, 7, 0.1); color: #ffc107;">
              <i class="ph ph-book-open"></i>
            </div>
            <div class="list-content" style="margin-left:12px;">
              <div class="list-title">${esc(recipe.name)}</div>
              <div class="list-subtitle">Ürün ID: ${esc(recipe.productId)}</div>
            </div>
          </div>
          <div style="background:var(--bg-card); padding:10px; border-radius:8px; border:1px solid var(--border-color);">
            <div style="font-size:11px; font-weight:600; color:var(--primary); margin-bottom:8px; text-transform:uppercase;">Reçete İçeriği (1 Birim İçin)</div>
            ${materialsHtml}
          </div>
        </div>
      `;
    }).join('');
  };

  setTimeout(loadData, 0);

  return container;
}
