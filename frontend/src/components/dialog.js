/**
 * DEPO TAKİP - Uygulama diyalogları
 *
 * Tarayıcının alert() / confirm() / prompt() pencereleri yerine, uygulamanın
 * tasarımıyla uyumlu ve mobilde düzgün görünen diyaloglar.
 * Hepsi Promise döner:  if (await confirmDialog({...})) { ... }
 */

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Açık diyalog yokken sayfa kaydırması serbest kalsın diye sayaç tutulur */
let openCount = 0;

function baseDialog({ title, message = '', body = '', icon = '', tone = '', actions, wide = false, onMount = null }) {
  return new Promise((resolve) => {
    const prevFocus = document.activeElement;
    const el = document.createElement('div');
    el.className = 'app-dialog-wrap';
    el.innerHTML = `
      <div class="app-dialog-bg"></div>
      <div class="app-dialog ${tone}${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
        ${icon ? `<span class="app-dialog-icon"><i class="ph ${esc(icon)}"></i></span>` : ''}
        <h3 id="dlg-title">${esc(title)}</h3>
        ${message ? `<p>${esc(message)}</p>` : ''}
        ${body}
        <div class="app-dialog-actions">
          ${actions.map((a, i) => `<button type="button" class="btn ${a.cls || 'btn-secondary'}" data-i="${i}">${a.icon ? `<i class="ph ${esc(a.icon)}"></i> ` : ''}${esc(a.label)}</button>`).join('')}
        </div>
      </div>`;

    // Doğrudan body'ye eklenir: #modal-container yalnızca .active sınıfıyla görünür olduğu için uygun değil
    document.body.appendChild(el);
    document.body.classList.add('jt-lock');
    openCount++;

    const close = (value) => {
      if (!el.isConnected) return;
      el.classList.add('closing');
      setTimeout(() => {
        el.remove();
        if (--openCount <= 0) { openCount = 0; document.body.classList.remove('jt-lock'); }
        if (prevFocus && prevFocus.focus) prevFocus.focus();
      }, 180);
      document.removeEventListener('keydown', onKey, true);
      resolve(value);
    };

    function onKey(e) {
      if (!el.isConnected) return;
      if (e.key === 'Escape') { e.preventDefault(); close(actions.find((a) => a.cancel)?.value ?? null); }
      if (e.key === 'Tab') {
        // Odak diyalogun içinde kalsın
        const items = [...el.querySelectorAll('button, input, select, textarea')].filter((x) => !x.disabled);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey, true);

    el.querySelector('.app-dialog-bg').addEventListener('click', () => close(actions.find((a) => a.cancel)?.value ?? null));
    el.querySelectorAll('[data-i]').forEach((btn) => btn.addEventListener('click', () => {
      const a = actions[Number(btn.dataset.i)];
      if (a.onBefore) { const v = a.onBefore(el); if (v === false) return; close(v === undefined ? a.value : v); return; }
      close(a.value);
    }));

    // İlk odak: metin alanı varsa ona, yoksa onay düğmesine
    if (onMount) onMount(el);
    setTimeout(() => (el.querySelector('input, textarea, select') || el.querySelector('.btn-primary, .btn-danger') || el.querySelector('button'))?.focus(), 60);
  });
}

/** Bilgi penceresi. alert() yerine. */
export function alertDialog({ title, message, icon = 'ph-info', okLabel = 'Tamam', tone = '' }) {
  return baseDialog({ title, message, icon, tone, actions: [{ label: okLabel, cls: 'btn-primary', value: true, cancel: true }] });
}

/** Seçenek penceresi. options: [{ label, value, icon }]; seçilen value veya null (vazgeçildi) döner. */
export function choiceDialog({ title, message = '', options, icon = 'ph-download-simple', cancelLabel = 'Vazgeç' }) {
  return baseDialog({
    title, message, icon,
    actions: [
      { label: cancelLabel, cls: 'btn-secondary', value: null, cancel: true },
      ...options.map((o, i) => ({ label: o.label, icon: o.icon, cls: i === 0 ? 'btn-primary' : 'btn-secondary', value: o.value })),
    ],
  });
}

/** Onay penceresi. confirm() yerine. true / false döner. */
export function confirmDialog({ title, message = '', confirmLabel = 'Evet', cancelLabel = 'Vazgeç', danger = false, icon }) {
  return baseDialog({
    title,
    message,
    icon: icon || (danger ? 'ph-warning' : 'ph-question'),
    tone: danger ? 'danger' : '',
    actions: [
      { label: cancelLabel, cls: 'btn-secondary', value: false, cancel: true },
      { label: confirmLabel, cls: danger ? 'btn-danger' : 'btn-primary', value: true },
    ],
  });
}

/**
 * Metin isteyen pencere. prompt() yerine. Değer veya null döner.
 * required: boş bırakılırsa uyarı gösterir ve kapanmaz.
 */
export function promptDialog({ title, message = '', label = '', value = '', placeholder = '', multiline = false, required = false, confirmLabel = 'Kaydet', maxlength = 300 }) {
  const input = multiline
    ? `<textarea id="dlg-input" rows="3" maxlength="${maxlength}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
    : `<input id="dlg-input" type="text" maxlength="${maxlength}" value="${esc(value)}" placeholder="${esc(placeholder)}" />`;
  return baseDialog({
    title,
    message,
    icon: 'ph-pencil-simple',
    body: `<label class="app-dialog-field">${label ? `<span>${esc(label)}</span>` : ''}${input}<em class="app-dialog-err" hidden>Bu alan boş bırakılamaz.</em></label>`,
    actions: [
      { label: 'Vazgeç', cls: 'btn-secondary', value: null, cancel: true },
      {
        label: confirmLabel,
        cls: 'btn-primary',
        onBefore: (el) => {
          const v = el.querySelector('#dlg-input').value.trim();
          if (required && !v) {
            el.querySelector('.app-dialog-err').hidden = false;
            el.querySelector('#dlg-input').focus();
            return false;
          }
          return v;
        },
      },
    ],
  });
}

/**
 * Yazarak onaylama (silme / arşivleme gibi geri alınamaz işlemler).
 * Kullanıcı verilen metni birebir yazmadan onay düğmesi çalışmaz.
 */
export function confirmTypedDialog({ title, message, expected, confirmLabel = 'Onayla', hint = '' }) {
  return baseDialog({
    title,
    message,
    icon: 'ph-warning',
    tone: 'danger',
    body: `<label class="app-dialog-field"><span>Onaylamak için <b>${esc(expected)}</b> yazın${hint ? ` <small>${esc(hint)}</small>` : ''}</span><input id="dlg-input" type="text" autocomplete="off" /><em class="app-dialog-err" hidden>Yazdığınız metin eşleşmiyor.</em></label>`,
    actions: [
      { label: 'Vazgeç', cls: 'btn-secondary', value: false, cancel: true },
      {
        label: confirmLabel,
        cls: 'btn-danger',
        onBefore: (el) => {
          if (el.querySelector('#dlg-input').value.trim() !== expected) {
            el.querySelector('.app-dialog-err').hidden = false;
            el.querySelector('#dlg-input').focus();
            return false;
          }
          return true;
        },
      },
    ],
  });
}

/**
 * Çok alanlı form penceresi. Değerler nesne olarak döner (vazgeçilirse null).
 * fields: [{ name, label, type: 'text'|'number'|'date'|'select'|'textarea', value, options: [[değer, etiket]], required, hint, placeholder, step, half }]
 * validate(values) -> hata metni döndürürse pencere kapanmaz. onMount(el) ile ek davranış (örn. canlı önizleme) eklenebilir.
 */
export function formDialog({ title, message = '', fields, confirmLabel = 'Kaydet', icon = 'ph-pencil-simple', validate, onMount, wide = false, footerHtml = '' }) {
  const control = (f) => {
    const id = `df-${f.name}`;
    if (f.type === 'select') return `<select id="${id}">${(f.options || []).map(([v, l]) => `<option value="${esc(v)}" ${String(f.value ?? '') === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    if (f.type === 'textarea') return `<textarea id="${id}" rows="2" maxlength="${f.maxlength || 300}" placeholder="${esc(f.placeholder || '')}">${esc(f.value ?? '')}</textarea>`;
    const t = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'password' ? 'password' : 'text';
    return `<input id="${id}" type="${t}" ${t === 'number' ? `inputmode="decimal" step="${f.step || 'any'}" min="${f.min ?? ''}"` : ''} maxlength="${f.maxlength || 120}" value="${esc(f.value ?? '')}" placeholder="${esc(f.placeholder || '')}" autocomplete="off" />`;
  };
  const body = `<div class="app-form">${fields.map((f) => `<label class="app-dialog-field ${f.half ? 'half' : ''}"><span>${esc(f.label)}${f.required ? ' *' : ''}${f.hint ? ` <small>${esc(f.hint)}</small>` : ''}</span>${control(f)}</label>`).join('')}</div>${footerHtml}<em class="app-dialog-err" id="df-err" hidden></em>`;
  return baseDialog({
    title, message, icon, wide, onMount, body,
    actions: [
      { label: 'Vazgeç', cls: 'btn-secondary', value: null, cancel: true },
      {
        label: confirmLabel, cls: 'btn-primary',
        onBefore: (el) => {
          const out = {};
          const err = el.querySelector('#df-err');
          for (const f of fields) {
            const v = el.querySelector(`#df-${f.name}`).value.trim();
            if (f.required && !v) { err.textContent = `${f.label} boş bırakılamaz.`; err.hidden = false; el.querySelector(`#df-${f.name}`).focus(); return false; }
            out[f.name] = f.type === 'number' && v !== '' ? Number(String(v).replace(',', '.')) : v;
          }
          const msg = validate && validate(out);
          if (msg) { err.textContent = msg; err.hidden = false; return false; }
          return out;
        },
      },
    ],
  });
}

/** Salt okunur içerik penceresi (ekstre, taksit planı ...). html güvenilir, çağıran kaçışlar. */
export function htmlDialog({ title, html, okLabel = 'Kapat', icon = 'ph-list-bullets', extra = [] }) {
  return baseDialog({
    title, icon, wide: true, body: html,
    actions: [...extra, { label: okLabel, cls: 'btn-primary', value: true, cancel: true }],
  });
}
