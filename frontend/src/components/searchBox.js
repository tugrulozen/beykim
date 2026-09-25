/**
 * Uygulama içi arama kutusu: modülleri VE alt menüleri (satış türleri, raporlar, iş takip sekmeleri,
 * stok yönetimi, ayarlar ...) arar. Ok tuşları + Enter ile gezilir; dışarı tıklayınca kapanır.
 */
import router from '../core/router.js';
import { search } from '../core/searchIndex.js';
import { esc } from './shell.js';

const iconHtml = (i) => (String(i).trim().startsWith('<') ? i : `<i class="ph ${esc(i)}"></i>`);

export function mountSearch(input, { host = input.parentElement, onPick } = {}) {
  host.classList.add('has-search-results');
  const box = document.createElement('div');
  box.className = 'search-results';
  box.hidden = true;
  box.setAttribute('role', 'listbox');
  host.appendChild(box);

  let hits = [];
  let active = 0;

  const close = () => { box.hidden = true; };
  const paint = () => {
    box.querySelectorAll('.sr-item').forEach((el, i) => el.classList.toggle('on', i === active));
    box.querySelector('.sr-item.on')?.scrollIntoView({ block: 'nearest' });
  };
  const open = (i) => {
    const it = hits[i];
    if (!it) return;
    close();
    input.value = '';
    input.blur();
    onPick?.(it);
    router.navigate(it.route);
  };

  const render = () => {
    const q = input.value.trim();
    if (!q) return close();
    hits = search(q, 9);
    active = 0;
    if (!hits.length) {
      box.innerHTML = '<div class="sr-empty"><i class="ph ph-magnifying-glass"></i> Sonuç bulunamadı</div>';
      box.hidden = false;
      return;
    }
    let lastGroup = '';
    box.innerHTML = hits.map((it, i) => {
      const head = it.group !== lastGroup ? `<div class="sr-group">${esc(it.group)}</div>` : '';
      lastGroup = it.group;
      return `${head}<button type="button" class="sr-item" role="option" data-i="${i}">
        <span class="sr-ico">${iconHtml(it.icon)}</span>
        <span class="sr-text"><b>${esc(it.label)}</b><small>${esc(it.hint)}</small></span>
        <i class="ph ph-arrow-elbow-down-left sr-go"></i>
      </button>`;
    }).join('');
    box.hidden = false;
    paint();
  };

  input.addEventListener('input', render);
  input.addEventListener('focus', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); input.blur(); return; }
    if (box.hidden || !hits.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % hits.length; paint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + hits.length) % hits.length; paint(); }
    else if (e.key === 'Enter') { e.preventDefault(); open(active); }
  });
  // mousedown: input blur olmadan tıklama yakalansın
  box.addEventListener('mousedown', (e) => {
    const b = e.target.closest('.sr-item');
    if (b) { e.preventDefault(); open(Number(b.dataset.i)); }
  });
  box.addEventListener('click', (e) => { // dokunmatik
    const b = e.target.closest('.sr-item');
    if (b) open(Number(b.dataset.i));
  });
  document.addEventListener('click', (e) => { if (!host.contains(e.target)) close(); });
}
