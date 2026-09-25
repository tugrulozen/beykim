/**
 * TEDARİKÇİLER — ayrı menü (tenant.json › modules.suppliers).
 * Kart listesi, kategori / durum filtresi, açık sipariş sayısı, ekle / düzenle / pasife al.
 * Liste ve form Satın Alma modülüyle ortaktır (purchaseModule.renderSuppliers).
 */
import { pageTitle } from '../core/config.js';
import { createHeader } from '../components/header.js';
import { renderSuppliers } from './purchaseModule.js';

export default function SuppliersPage() {
  const container = document.createElement('div');
  container.className = 'page-purchase-module page-suppliers page-container';
  container.appendChild(createHeader({ title: pageTitle('suppliers', 'Tedarikçiler'), gradientClass: 'gradient-purchase' }));
  const content = document.createElement('div');
  content.className = 'content-area';
  const panel = document.createElement('div');
  content.appendChild(panel);
  container.appendChild(content);
  setTimeout(() => renderSuppliers(panel), 0);
  return container;
}
