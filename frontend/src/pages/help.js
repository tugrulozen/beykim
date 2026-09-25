import AppConfig from '../core/config.js';
import { createHeader } from '../components/header.js';

export default function HelpPage() {
  const container = document.createElement('div');
  container.className = 'page-container';

  const header = createHeader({ title: 'Yardım & Destek' });
  container.appendChild(header);

  const content = document.createElement('div');
  content.className = 'content-area';

  const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const support = AppConfig.support;
  const contact = [
    support.phone && { icon: 'ph-phone', text: support.phone, href: `tel:${support.phone.replace(/\s/g, '')}` },
    support.email && { icon: 'ph-envelope-simple', text: support.email, href: `mailto:${support.email}` },
    support.website && { icon: 'ph-globe', text: support.website, href: /^https?:/.test(support.website) ? support.website : `https://${support.website}` },
  ].filter(Boolean);
  const contactLinks = contact.map((c) => `
      <a href="${esc(c.href)}" target="_blank" rel="noopener noreferrer" class="card" style="display:flex; align-items:center; gap:10px; padding:12px 14px; color:var(--text-primary); text-decoration:none;">
        <i class="ph ${c.icon}" style="font-size:20px; color:var(--primary);"></i><span>${esc(c.text)}</span>
      </a>`).join('');
  content.innerHTML = `
    <div class="card animate-fade-in-up" style="padding: 24px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px; color: var(--primary);"><i class="ph ph-lifebuoy"></i></div>
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">${esc(support.title)}</h2>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        ${esc(support.text)}
      </p>
      ${contactLinks ? `<div style="display:flex; flex-direction:column; gap:8px; max-width:300px; margin:0 auto 16px; text-align:left;">${contactLinks}</div>` : ''}
      
      <div style="display: flex; flex-direction: column; gap: 12px; align-items: stretch; max-width: 300px; margin: 0 auto;">
        ${AppConfig.modules.copilot?.enabled ? `<button class="btn btn-primary" data-help="copilot" style="background: var(--primary);">
          <i class="ph ph-sparkle"></i> CoPilot'a Sor
        </button>` : ''}
        <button class="btn btn-outline" data-help="back">
          Geri Dön
        </button>
      </div>
    </div>
  `;

  // CSP satır içi olay işleyicilerine izin vermez: tıklamalar burada bağlanır
  content.addEventListener('click', (e) => {
    const action = e.target.closest('[data-help]')?.dataset.help;
    if (action === 'copilot') window.location.hash = '#/copilot';
    if (action === 'back') window.history.back();
  });

  container.appendChild(content);
  return container;
}
