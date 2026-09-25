/**
 * Etiket yerleşimi + çıktı üreticiler.
 *
 *  layoutLabel(spec)  → ölçüleri mm olan çizim listesi (dikdörtgen + yazı)
 *  toSvg(layout)      → önizleme ve tarayıcı yazdırma için vektör çıktı
 *  toBitmap(layout,d) → yazıcı dili (ZPL/TSPL) için 1-bit görüntü (d = nokta/inç)
 * Tüm çizim tek bir listeden üretildiği için önizleme, sürücüyle yazdırma ve ham yazdırma birebir aynı görünür.
 */
import { encode } from './encoders.js';

/** Hazır etiket ölçüleri (mm). kind: roll = tek tek etiket (termal rulo), sheet = A4 etiket yaprağı */
export const SIZES = [
  { id: '25x15', label: '25 × 15 mm', w: 25, h: 15, kind: 'roll', note: 'Küçük ürün / takı' },
  { id: '30x20', label: '30 × 20 mm', w: 30, h: 20, kind: 'roll', note: 'Küçük ürün' },
  { id: '40x20', label: '40 × 20 mm', w: 40, h: 20, kind: 'roll', note: 'Standart raf / ürün' },
  { id: '40x30', label: '40 × 30 mm', w: 40, h: 30, kind: 'roll', note: 'Standart ürün' },
  { id: '50x25', label: '50 × 25 mm', w: 50, h: 25, kind: 'roll', note: 'Standart ürün' },
  { id: '50x30', label: '50 × 30 mm', w: 50, h: 30, kind: 'roll', note: 'En yaygın' },
  { id: '60x40', label: '60 × 40 mm', w: 60, h: 40, kind: 'roll', note: 'Koli / kutu' },
  { id: '80x50', label: '80 × 50 mm', w: 80, h: 50, kind: 'roll', note: 'Koli' },
  { id: '100x50', label: '100 × 50 mm', w: 100, h: 50, kind: 'roll', note: 'Büyük koli' },
  { id: '100x70', label: '100 × 70 mm', w: 100, h: 70, kind: 'roll', note: 'Palet / koli' },
  { id: '100x100', label: '100 × 100 mm', w: 100, h: 100, kind: 'roll', note: 'Palet' },
  { id: '100x150', label: '100 × 150 mm', w: 100, h: 150, kind: 'roll', note: 'Sevkiyat / palet' },
  { id: 'A4-24', label: 'A4 yaprak · 24’lü (3×8)', w: 70, h: 37, kind: 'sheet', page: { w: 210, h: 297 }, cols: 3, rows: 8, ml: 0, mt: 0, gx: 0, gy: 0, note: '70 × 37 mm' },
  { id: 'A4-65', label: 'A4 yaprak · 65’li (5×13)', w: 38, h: 21.2, kind: 'sheet', page: { w: 210, h: 297 }, cols: 5, rows: 13, ml: 10, mt: 10.7, gx: 2.5, gy: 0, note: '38 × 21,2 mm' },
  { id: 'A4-12', label: 'A4 yaprak · 12’li (2×6)', w: 99, h: 42, kind: 'sheet', page: { w: 210, h: 297 }, cols: 2, rows: 6, ml: 6, mt: 21, gx: 0, gy: 0, note: '99 × 42 mm' },
];

export function sizeById(id, custom) {
  if (id === 'custom') {
    const w = Math.min(200, Math.max(10, Number(custom && custom.w) || 50));
    const h = Math.min(300, Math.max(8, Number(custom && custom.h) || 30));
    return { id: 'custom', label: `Özel ${w} × ${h} mm`, w, h, kind: 'roll' };
  }
  return SIZES.find((s) => s.id === id) || SIZES.find((s) => s.id === '50x30');
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Arial benzeri yazı tipi için yaklaşık genişlik (mm) */
function textWidth(text, size, bold) {
  let w = 0;
  for (const c of String(text)) w += /[A-ZÇĞİÖŞÜ0-9%@#&MW]/.test(c) ? 0.64 : /[il.,:;'|! ]/.test(c) ? 0.27 : /[mw]/.test(c) ? 0.8 : 0.52;
  return w * size * (bold ? 1.06 : 1);
}
function fitText(text, size, maxW, bold) {
  const s = String(text || '');
  if (textWidth(s, size, bold) <= maxW) return s;
  let out = s;
  while (out.length > 1 && textWidth(out + '…', size, bold) > maxW) out = out.slice(0, -1);
  return out.trimEnd() + '…';
}
/** Kelime kelime satırlara böler (en fazla `lines` satır, sığmazsa … ile keser) */
function wrapText(text, size, maxW, lines, bold) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const out = [];
  let cur = '';
  for (const wd of words) {
    const next = cur ? `${cur} ${wd}` : wd;
    if (textWidth(next, size, bold) <= maxW) cur = next;
    else {
      if (cur) out.push(cur);
      cur = wd;
      if (out.length === lines - 1) break;
    }
  }
  if (cur && out.length < lines) out.push(cur);
  const consumed = out.join(' ').length;
  if (consumed < words.join(' ').length && out.length) out[out.length - 1] = fitText(out[out.length - 1] + '…', size, maxW, bold);
  return out.map((l) => fitText(l, size, maxW, bold));
}

const fmtPrice = (p, cur) => (p == null || p === '' || Number.isNaN(Number(p)) ? '' : `${Number(p).toLocaleString('tr-TR', { minimumFractionDigits: Number(p) % 1 ? 2 : 0, maximumFractionDigits: 2 })} ${cur || '₺'}`);

/**
 * spec: { wMm, hMm, format, value, name, price, currency, code, company, show:{name,price,code,company,text} }
 * opts: { dpi } → verilirse barkod modül genişliği tam nokta sayısına yuvarlanır (ham yazdırmada net çıktı)
 */
export function layoutLabel(spec, opts = {}) {
  const w = Number(spec.wMm); const h = Number(spec.hMm);
  const show = { name: true, price: true, code: true, company: false, text: true, ...(spec.show || {}) };
  const enc = encode(spec.format, spec.value);
  const ops = []; const warnings = [];
  const dpi = opts.dpi || 0;
  const dotMm = dpi ? 25.4 / dpi : 0;
  const snap = (mm) => (dotMm ? Math.round(mm / dotMm) * dotMm : mm);

  const m = clamp(Math.min(w, h) * 0.07, 1, 3);
  const innerW = w - 2 * m; const innerH = h - 2 * m;
  const fs = clamp(h * 0.1, 1.7, 4.2);
  const price = show.price ? fmtPrice(spec.price, spec.currency) : '';
  const codeText = show.code ? (spec.code || '') : '';

  const rect = (x, y, rw, rh) => ops.push({ t: 'r', x, y, w: rw, h: rh });
  const text = (x, y, s, size, a = 'l', b = false) => ops.push({ t: 't', x, y, s: size, text: s, a, b });

  // ---------- QR ----------
  if (enc.kind === 'matrix') {
    const q = 3; const total = enc.size + 2 * q;
    const wide = w >= 1.45 * h;
    const drawQr = (x0, y0, side) => {
      let mod = side / total;
      if (dotMm) mod = Math.max(1, Math.floor(mod / dotMm)) * dotMm;
      const used = mod * total;
      const ox = snap(x0 + (side - used) / 2 + q * mod); const oy = snap(y0 + (side - used) / 2 + q * mod);
      if (mod < 0.25 && !dotMm) warnings.push('QR kod bu boyutta çok küçük; okunmayabilir.');
      for (let y = 0; y < enc.size; y++) {
        let x = 0;
        while (x < enc.size) {
          if (!enc.cell(x, y)) { x++; continue; }
          let run = 1;
          while (x + run < enc.size && enc.cell(x + run, y)) run++;
          rect(ox + x * mod, oy + y * mod, run * mod, mod);
          x += run;
        }
      }
      return mod;
    };
    if (wide) {
      const side = innerH;
      const mod = drawQr(m, m, side);
      if (mod < 0.25 && dotMm) warnings.push('QR kod bu çözünürlükte çok küçük; okunmayabilir.');
      const x0 = m + side + m; const tw = w - x0 - m;
      const lines = [];
      if (show.company && spec.company) lines.push({ s: fitText(spec.company, fs * 0.75, tw), size: fs * 0.75, b: false });
      if (show.name && spec.name) wrapText(spec.name, fs, tw, h >= 30 ? 3 : 2, true).forEach((l) => lines.push({ s: l, size: fs, b: true }));
      if (price) lines.push({ s: price, size: fs * 1.3, b: true });
      if (codeText) lines.push({ s: fitText(codeText, fs * 0.8, tw), size: fs * 0.8, b: false });
      const tot = lines.reduce((a, l) => a + l.size * 1.2, 0);
      let y = m + (innerH - tot) / 2;
      lines.forEach((l) => { y += l.size * 1.05; text(x0, y, l.s, l.size, 'l', l.b); y += l.size * 0.15; });
    } else {
      const head = [];
      if (show.company && spec.company && h >= 30) head.push({ s: fitText(spec.company, fs * 0.75, innerW), size: fs * 0.75, b: false });
      if (show.name && spec.name) wrapText(spec.name, fs, innerW, h >= 45 ? 2 : 1, true).forEach((l) => head.push({ s: l, size: fs, b: true }));
      if (price) head.push({ s: price, size: fs * 1.25, b: true });
      const foot = codeText ? [{ s: fitText(codeText, fs * 0.8, innerW), size: fs * 0.8 }] : [];
      const headH = head.reduce((a, l) => a + l.size * 1.2, 0); const footH = foot.reduce((a, l) => a + l.size * 1.2, 0);
      const side = Math.min(innerW, innerH - headH - footH);
      let y = m;
      head.forEach((l) => { y += l.size * 1.05; text(w / 2, y, l.s, l.size, 'm', l.b); y += l.size * 0.15; });
      if (side < 8) warnings.push('Etiket QR kod için fazla küçük.');
      drawQr(m + (innerW - side) / 2, y + 0.3, side);
      y += side + 0.3;
      foot.forEach((l) => { y += l.size * 1.05; text(w / 2, y, l.s, l.size, 'm'); });
    }
    return { w, h, ops, warnings, enc };
  }

  // ---------- çizgisel barkodlar ----------
  const M = enc.bits.length; const QZ = 10;
  const gap = 0.5;
  const humanSize = fs * 0.9;
  const minBar = Math.max(6, h * 0.26);

  const build = (drop) => {
    const rows = [];
    if (show.company && spec.company && h >= 25 && !drop.company) rows.push({ k: 'company', h: fs * 0.75 * 1.2 });
    const nameLines = h >= 42 ? 2 : 1;
    const priceInline = price && !drop.price && w >= 35 && show.name && spec.name;
    if (show.name && spec.name && !drop.name) rows.push({ k: 'name', h: fs * 1.2 * (drop.oneLine ? 1 : nameLines), lines: drop.oneLine ? 1 : nameLines, inline: priceInline });
    if (price && !drop.price && !priceInline) rows.push({ k: 'price', h: fs * 1.3 * 1.2 });
    const humanRow = show.text && !drop.human ? humanSize * 1.25 : 0;
    const codeRow = codeText && !drop.code && codeText !== enc.text ? fs * 0.8 * 1.2 : 0;
    const used = rows.reduce((a, r) => a + r.h + gap, 0) + humanRow + codeRow;
    return { rows, humanRow, codeRow, barH: innerH - used - gap * 0, priceInline };
  };
  const steps = [{}, { company: true }, { company: true, oneLine: true }, { company: true, oneLine: true, code: true }, { company: true, oneLine: true, code: true, price: true }, { company: true, name: true, code: true, price: true }, { company: true, name: true, code: true, price: true, human: true }];
  let plan = build(steps[0]);
  for (const s of steps) { plan = build(s); if (plan.barH >= minBar) break; }
  if (plan.barH < 4) { plan.barH = Math.max(3, plan.barH); warnings.push('Etiket bu içerik için fazla küçük; barkod yüksekliği yetersiz.'); }

  let xdim = innerW / (M + 2 * QZ);
  xdim = Math.min(xdim, 0.7);
  if (dotMm) {
    const dots = Math.floor(xdim / dotMm);
    if (dots < 1) { warnings.push('Barkod bu genişlikte yazıcı çözünürlüğüne sığmıyor.'); xdim = dotMm; } else xdim = dots * dotMm;
  } else xdim = Math.floor(xdim * 100) / 100;
  if (xdim < 0.19) warnings.push(`Barkod çizgileri çok ince (${xdim.toFixed(2)} mm); okuyucu zorlanabilir. Daha büyük etiket veya daha kısa değer seçin.`);
  const bw = M * xdim;
  const barH = Math.min(plan.barH, Math.max(bw * 0.6, minBar), 40);

  const contentH = plan.rows.reduce((a, r) => a + r.h + gap, 0) + barH + gap + plan.humanRow + plan.codeRow;
  let y = m + Math.max(0, (innerH - contentH) / 2);
  plan.rows.forEach((r) => {
    if (r.k === 'company') { y += fs * 0.75 * 1.05; text(w / 2, y, fitText(spec.company, fs * 0.75, innerW), fs * 0.75, 'm'); y += fs * 0.75 * 0.15 + gap; }
    if (r.k === 'name') {
      const pw = r.inline ? textWidth(price, fs * 1.15, true) + 1 : 0;
      const lines = wrapText(spec.name, fs, innerW - pw, r.lines, true);
      lines.forEach((l, i) => {
        y += fs * 1.05;
        text(m, y, l, fs, 'l', true);
        if (r.inline && i === 0) text(w - m, y, price, fs * 1.15, 'r', true);
        y += fs * 0.15;
      });
      y += gap;
    }
    if (r.k === 'price') { y += fs * 1.3 * 1.05; text(w - m, y, price, fs * 1.3, 'r', true); y += fs * 1.3 * 0.15 + gap; }
  });
  const startX = snap(m + (innerW - bw) / 2);
  const by = snap(y);
  for (let i = 0; i < M;) {
    if (!enc.bits[i]) { i++; continue; }
    let run = 1;
    while (i + run < M && enc.bits[i + run]) run++;
    rect(startX + i * xdim, by, run * xdim, snap(barH));
    i += run;
  }
  y = by + snap(barH) + gap;
  if (plan.humanRow) {
    y += humanSize * 1.0;
    const t = enc.ean ? (enc.ean.lead ? `${enc.ean.lead}  ${enc.ean.left}  ${enc.ean.right}` : `${enc.ean.left}  ${enc.ean.right}`) : enc.text;
    text(w / 2, y, fitText(t, humanSize, innerW), humanSize, 'm');
    y += humanSize * 0.25;
  }
  if (plan.codeRow) { y += fs * 0.8 * 1.05; text(w / 2, y, fitText(codeText, fs * 0.8, innerW), fs * 0.8, 'm'); }
  return { w, h, ops, warnings, enc, xdim };
}

// ---------- SVG ----------
export function toSvg(layout, { border = false } = {}) {
  const { w, h, ops } = layout;
  const f = (n) => Math.round(n * 1000) / 1000;
  let body = '';
  for (const o of ops) {
    if (o.t === 'r') body += `<rect x="${f(o.x)}" y="${f(o.y)}" width="${f(o.w)}" height="${f(o.h)}"/>`;
    else body += `<text x="${f(o.x)}" y="${f(o.y)}" font-size="${f(o.s)}" text-anchor="${o.a === 'm' ? 'middle' : o.a === 'r' ? 'end' : 'start'}"${o.b ? ' font-weight="700"' : ''}>${esc(o.text)}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}mm" height="${h}mm" fill="#000" font-family="Arial, Helvetica, sans-serif" shape-rendering="crispEdges" text-rendering="geometricPrecision">` +
    `<rect x="0" y="0" width="${w}" height="${h}" fill="#fff"${border ? ' stroke="#bbb" stroke-width="0.2"' : ''}/>${body}</svg>`;
}

// ---------- 1-bit görüntü (ham yazdırma) ----------
/** @returns {{wPx:number,hPx:number,rowBytes:number,data:Uint8Array}} data: 1 = siyah nokta, satır başına rowBytes bayt */
export function toBitmap(layout, dpi) {
  const s = dpi / 25.4;
  const wPx = Math.round(layout.w * s); const hPx = Math.round(layout.h * s);
  const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(wPx, hPx) : Object.assign(document.createElement('canvas'), { width: wPx, height: hPx });
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, wPx, hPx);
  ctx.fillStyle = '#000';
  for (const o of layout.ops) {
    if (o.t === 'r') {
      const x0 = Math.round(o.x * s); const x1 = Math.round((o.x + o.w) * s);
      const y0 = Math.round(o.y * s); const y1 = Math.round((o.y + o.h) * s);
      ctx.fillRect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0));
    } else {
      ctx.font = `${o.b ? '700 ' : ''}${Math.max(6, o.s * s)}px Arial, Helvetica, sans-serif`;
      ctx.textAlign = o.a === 'm' ? 'center' : o.a === 'r' ? 'right' : 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(o.text, o.x * s, o.y * s);
    }
  }
  const img = ctx.getImageData(0, 0, wPx, hPx).data;
  const rowBytes = Math.ceil(wPx / 8);
  const data = new Uint8Array(rowBytes * hPx);
  for (let y = 0; y < hPx; y++) {
    for (let x = 0; x < wPx; x++) {
      const i = (y * wPx + x) * 4;
      const lum = 0.299 * img[i] + 0.587 * img[i + 1] + 0.114 * img[i + 2];
      if (lum < 150) data[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return { wPx, hPx, rowBytes, data };
}

// ---------- tarayıcı yazdırma HTML'i ----------
/**
 * items: [{ layout, copies }]. Rulo: her etiket ayrı sayfa (@page = etiket ölçüsü). Yaprak: A4 ızgarasında ardışık hücreler.
 * startCell: yaprakta kullanılmış hücreleri atlamak için (0 tabanlı)
 */
export function buildPrintHtml(items, size, { startCell = 0 } = {}) {
  const list = [];
  items.forEach((it) => { for (let i = 0; i < Math.max(1, it.copies | 0); i++) list.push(toSvg(it.layout)); });
  const base = 'html,body{margin:0;padding:0;background:#fff}svg{display:block}';
  if (size.kind === 'sheet') {
    const per = size.cols * size.rows;
    const pages = [];
    const cells = Array(startCell).fill('').concat(list);
    for (let i = 0; i < cells.length; i += per) pages.push(cells.slice(i, i + per));
    const html = pages.map((pg) => `<div class="pg">${pg.map((svg, i) => {
      if (!svg) return '';
      const c = i % size.cols; const r = Math.floor(i / size.cols);
      const x = size.ml + c * (size.w + size.gx); const y = size.mt + r * (size.h + size.gy);
      return `<div class="cell" style="left:${x}mm;top:${y}mm">${svg}</div>`;
    }).join('')}</div>`).join('');
    return `<!doctype html><meta charset="utf-8"><title>Etiketler</title><style>@page{size:${size.page.w}mm ${size.page.h}mm;margin:0}${base}` +
      `.pg{position:relative;width:${size.page.w}mm;height:${size.page.h}mm;page-break-after:always;overflow:hidden}.cell{position:absolute;width:${size.w}mm;height:${size.h}mm;overflow:hidden}</style>${html}`;
  }
  return `<!doctype html><meta charset="utf-8"><title>Etiketler</title><style>@page{size:${size.w}mm ${size.h}mm;margin:0}${base}` +
    `.l{width:${size.w}mm;height:${size.h}mm;overflow:hidden;page-break-after:always;break-after:page}.l:last-child{page-break-after:auto;break-after:auto}</style>` +
    list.map((svg) => `<div class="l">${svg}</div>`).join('');
}
