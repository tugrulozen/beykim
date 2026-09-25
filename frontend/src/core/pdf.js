/**
 * DEPO TAKİP - Listeleri PDF'e aktarma
 *
 * Dış kütüphane yok. Sayfalar tuvale (canvas) çizilip JPEG olarak PDF'e gömülür; böylece
 * yazı tipi gömmek gerekmez ve Türkçe karakterler (ğ ü ş ı ö ç İ) her cihazda doğru çıkar.
 * Sayfa dikey/yatay otomatik seçilir, başlık satırı her sayfada tekrarlanır.
 */

const S = 2.5; // tuval ölçeği (pt -> px), yazdırmada da net görünsün
const MARGIN = 28;
const FONT = '"Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const BODY = 8, LINE = 10.5, PADX = 4, PADY = 3.5;

const fmtCell = (v) => {
  if (v == null) return '';
  if (typeof v === 'number' && Number.isFinite(v)) return v.toLocaleString('tr-TR', { maximumFractionDigits: 3 });
  return String(v).replace(/\s+/g, ' ').trim();
};

function wrap(ctx, text, maxW) {
  if (!text) return [''];
  const lines = [];
  let cur = '';
  const push = () => { lines.push(cur); cur = ''; };
  for (const word of text.split(' ')) {
    const t = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(t).width <= maxW) { cur = t; continue; }
    if (cur) push();
    if (ctx.measureText(word).width <= maxW) { cur = word; continue; }
    for (const ch of word) { // sığmayan uzun sözcük: harf harf böl
      if (ctx.measureText(cur + ch).width > maxW && cur) push();
      cur += ch;
    }
  }
  if (cur || !lines.length) lines.push(cur);
  return lines;
}

const u8 = (s) => new TextEncoder().encode(s);

/** JPEG sayfaları tek PDF dosyasına dizer */
function assemble(pages, pw, ph, title) {
  const parts = [];
  const offsets = [];
  let pos = 0;
  const add = (b) => { const a = typeof b === 'string' ? u8(b) : b; parts.push(a); pos += a.length; };
  const obj = (n, fn) => { offsets[n] = pos; add(`${n} 0 obj\n`); fn(); add('\nendobj\n'); };

  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const n = pages.length;
  // 1 katalog, 2 sayfa ağacı, 3 bilgi, sonra her sayfa için 3 nesne
  obj(1, () => add('<< /Type /Catalog /Pages 2 0 R >>'));
  const kids = pages.map((_, i) => `${4 + i * 3} 0 R`).join(' ');
  obj(2, () => add(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`));
  const hex = [...`﻿${title}`].map((c) => c.charCodeAt(0).toString(16).padStart(4, '0')).join('').toUpperCase();
  obj(3, () => add(`<< /Title <${hex}> /Producer (Depo Takip) >>`));
  pages.forEach((img, i) => {
    const p = 4 + i * 3;
    obj(p, () => add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`));
    const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
    obj(p + 1, () => add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    obj(p + 2, () => {
      add(`<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.data.length} >>\nstream\n`);
      add(img.data);
      add('\nendstream');
    });
  });
  const xref = pos;
  const total = 4 + n * 3;
  add(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let i = 1; i < total; i++) add(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  add(`trailer\n<< /Size ${total} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}

/**
 * @param {string} title
 * @param {Array<[string, Function|string]>} columns
 * @param {Array<Object>} rows
 * @returns {Promise<Blob>}
 */
export async function buildPdf(title, columns, rows) {
  const cv = document.createElement('canvas');
  const ctx = cv.getContext('2d');
  const font = (bold) => `${bold ? '700 ' : ''}${BODY}px ${FONT}`;

  const data = rows.map((r) => columns.map(([, get]) => fmtCell(typeof get === 'function' ? get(r) : r[get])));
  const numeric = columns.map((_, ci) => data.length > 0 && data.every((row) => row[ci] === '' || /^-?[\d.,]+$/.test(row[ci])));

  // İstenen sütun genişlikleri (ilk 300 satırdan ölçülür)
  ctx.font = font(true);
  const want = columns.map(([label]) => ctx.measureText(String(label)).width + PADX * 2 + 4);
  ctx.font = font(false);
  const sample = data.slice(0, 300);
  columns.forEach((_, ci) => {
    for (const row of sample) want[ci] = Math.max(want[ci], Math.min(230, ctx.measureText(row[ci]).width + PADX * 2 + 2));
  });
  const sum = want.reduce((a, b) => a + b, 0);

  const landscape = sum > 595 - MARGIN * 2 && columns.length > 3;
  const pw = landscape ? 842 : 595, ph = landscape ? 595 : 842;
  const avail = pw - MARGIN * 2;
  const widths = want.map((w) => Math.max(34, (w / sum) * avail));
  const fix = avail / widths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < widths.length; i++) widths[i] *= fix;

  // Satırları sar, yükseklikleri hesapla
  ctx.font = font(false);
  const laid = data.map((row) => {
    const cells = row.map((t, ci) => wrap(ctx, t, widths[ci] - PADX * 2));
    return { cells, h: Math.max(...cells.map((c) => c.length)) * LINE + PADY * 2 };
  });
  ctx.font = font(true);
  const head = columns.map(([label], ci) => wrap(ctx, String(label), widths[ci] - PADX * 2));
  const headH = Math.max(...head.map((c) => c.length)) * LINE + PADY * 2 + 2;

  const titleH = 44, footerH = 22;
  const bottom = ph - MARGIN - footerH;
  const pageSets = [];
  let cur = [], y = MARGIN + titleH + headH;
  for (const r of laid) {
    if (y + r.h > bottom && cur.length) { pageSets.push(cur); cur = []; y = MARGIN + headH; }
    cur.push(r); y += r.h;
  }
  pageSets.push(cur);

  cv.width = Math.round(pw * S); cv.height = Math.round(ph * S);
  const stamp = new Date().toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
  const out = [];

  for (let pi = 0; pi < pageSets.length; pi++) {
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, pw, ph);
    ctx.textBaseline = 'top';
    let yy = MARGIN;
    if (pi === 0) {
      ctx.fillStyle = '#1F3A5F'; ctx.font = `700 15px ${FONT}`; ctx.fillText(title, MARGIN, yy);
      ctx.fillStyle = '#6b7280'; ctx.font = `9px ${FONT}`;
      ctx.fillText(`${stamp}  ·  ${rows.length} kayıt`, MARGIN, yy + 21);
      yy += titleH;
    }
    // başlık satırı
    ctx.fillStyle = '#1F3A5F'; ctx.fillRect(MARGIN, yy, avail, headH);
    ctx.fillStyle = '#fff'; ctx.font = font(true);
    let x = MARGIN;
    head.forEach((lines, ci) => {
      lines.forEach((ln, li) => {
        const tx = numeric[ci] ? x + widths[ci] - PADX - ctx.measureText(ln).width : x + PADX;
        ctx.fillText(ln, tx, yy + PADY + 1 + li * LINE);
      });
      x += widths[ci];
    });
    yy += headH;
    // gövde
    ctx.font = font(false);
    pageSets[pi].forEach((r, ri) => {
      if (ri % 2) { ctx.fillStyle = '#f3f5f9'; ctx.fillRect(MARGIN, yy, avail, r.h); }
      ctx.fillStyle = '#111827';
      let cx = MARGIN;
      r.cells.forEach((lines, ci) => {
        lines.forEach((ln, li) => {
          const tx = numeric[ci] ? cx + widths[ci] - PADX - ctx.measureText(ln).width : cx + PADX;
          ctx.fillText(ln, tx, yy + PADY + li * LINE);
        });
        cx += widths[ci];
      });
      ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 0.4;
      ctx.beginPath(); ctx.moveTo(MARGIN, yy + r.h); ctx.lineTo(MARGIN + avail, yy + r.h); ctx.stroke();
      yy += r.h;
    });
    // alt bilgi
    ctx.fillStyle = '#9ca3af'; ctx.font = `8px ${FONT}`;
    const foot = `Sayfa ${pi + 1} / ${pageSets.length}`;
    ctx.fillText(foot, pw - MARGIN - ctx.measureText(foot).width, ph - MARGIN - 8);
    ctx.fillText(title, MARGIN, ph - MARGIN - 8);

    const blob = await new Promise((res) => cv.toBlob(res, 'image/jpeg', 0.9));
    out.push({ w: cv.width, h: cv.height, data: new Uint8Array(await blob.arrayBuffer()) });
  }
  return assemble(out, pw, ph, title);
}
