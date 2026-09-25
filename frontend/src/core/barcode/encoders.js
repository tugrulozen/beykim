/**
 * Barkod kodlayıcılar (bağımlılıksız; QR için MIT lisanslı qrcode-generator çekirdeği).
 *
 *  ean13, ean8   → perakende ürün barkodları (kontrol hanesi otomatik)
 *  code128       → herhangi bir ASCII metin (sayı dizilerinde otomatik Set C ile kısa)
 *  code39        → büyük harf, rakam ve  - . $ / + % boşluk
 *  qr            → her metin (Türkçe karakterler UTF-8)
 *
 * encode() şu şekilde döner:
 *   { kind: 'linear', bits: [1,0,1,...], text }        // 1 = koyu modül
 *   { kind: 'matrix', size, cell(x, y) => boolean }
 */
import qrcode from './qrcode.js';

export const FORMATS = {
  ean13: { label: 'EAN-13', hint: '12 rakam girin, 13. hane (kontrol) otomatik eklenir', linear: true },
  ean8: { label: 'EAN-8', hint: '7 rakam girin, 8. hane (kontrol) otomatik eklenir', linear: true },
  code128: { label: 'Code 128', hint: 'Harf, rakam ve işaret (Türkçe karakter hariç)', linear: true },
  code39: { label: 'Code 39', hint: 'Büyük harf, rakam ve - . $ / + % boşluk', linear: true },
  qr: { label: 'QR Kod', hint: 'Her türlü metin; Türkçe karakter kullanılabilir', linear: false },
};

// ---------- EAN ----------
const EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const EAN_R = EAN_L.map((p) => [...p].map((b) => (b === '0' ? '1' : '0')).join(''));
const EAN_G = EAN_R.map((p) => [...p].reverse().join(''));
const EAN13_PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

export function eanCheckDigit(digits) {
  // digits: kontrol hanesiz dizi. Sağdan sola 3,1,3,1...
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[digits.length - 1 - i]);
    sum += d * (i % 2 === 0 ? 3 : 1);
  }
  return String((10 - (sum % 10)) % 10);
}

// ---------- Code 128 ----------
// Her desen 6 (stop için 7) sayı: bar, boşluk, bar, ... genlikleri (modül)
const C128 = ['212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412', '211214', '211232', '2331112'];
const C128_START_B = 104; const C128_START_C = 105; const C128_CODE_B = 100; const C128_CODE_C = 99; const C128_STOP = 106;

function patternBits(p) {
  const out = [];
  [...p].forEach((n, i) => { for (let k = 0; k < Number(n); k++) out.push(i % 2 === 0 ? 1 : 0); });
  return out;
}

function code128Codes(value) {
  const v = String(value);
  const isDigit = (i) => v.charCodeAt(i) >= 48 && v.charCodeAt(i) <= 57;
  const runAt = (i) => { let n = 0; while (i + n < v.length && isDigit(i + n)) n++; return n; };
  const codes = [];
  let mode = null;
  let i = 0;
  while (i < v.length) {
    const n = runAt(i);
    if (mode === null) {
      if (n === v.length && n >= 2) { mode = 'C'; codes.push(C128_START_C); } else if (n >= 4) { mode = 'C'; codes.push(C128_START_C); } else { mode = 'B'; codes.push(C128_START_B); }
    } else if (mode === 'B' && (n >= 6 || (n >= 4 && i + n === v.length))) { mode = 'C'; codes.push(C128_CODE_C); } else if (mode === 'C' && n < 2) { mode = 'B'; codes.push(C128_CODE_B); }
    if (mode === 'C') { codes.push(Number(v.slice(i, i + 2))); i += 2; } else { codes.push(v.charCodeAt(i) - 32); i += 1; }
  }
  let sum = codes[0];
  for (let k = 1; k < codes.length; k++) sum += codes[k] * k;
  codes.push(sum % 103, C128_STOP);
  return codes;
}

// ---------- Code 39 ----------
const C39 = {
  0: 'nnnwwnwnn', 1: 'wnnwnnnnw', 2: 'nnwwnnnnw', 3: 'wnwwnnnnn', 4: 'nnnwwnnnw', 5: 'wnnwwnnnn', 6: 'nnwwwnnnn', 7: 'nnnwnnwnw', 8: 'wnnwnnwnn', 9: 'nnwwnnwnn',
  A: 'wnnnnwnnw', B: 'nnwnnwnnw', C: 'wnwnnwnnn', D: 'nnnnwwnnw', E: 'wnnnwwnnn', F: 'nnwnwwnnn', G: 'nnnnnwwnw', H: 'wnnnnwwnn', I: 'nnwnnwwnn', J: 'nnnnwwwnn',
  K: 'wnnnnnnww', L: 'nnwnnnnww', M: 'wnwnnnnwn', N: 'nnnnwnnww', O: 'wnnnwnnwn', P: 'nnwnwnnwn', Q: 'nnnnnnwww', R: 'wnnnnnwwn', S: 'nnwnnnwwn', T: 'nnnnwnwwn',
  U: 'wwnnnnnnw', V: 'nwwnnnnnw', W: 'wwwnnnnnn', X: 'nwnnwnnnw', Y: 'wwnnwnnnn', Z: 'nwwnwnnnn', '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '*': 'nwnnwnwnn',
  $: 'nwnwnwnnn', '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn',
};

// ---------- doğrulama ----------
/** @returns {{ok:boolean, value?:string, error?:string}} value: kontrol hanesi eklenmiş nihai değer */
export function validate(format, raw) {
  const v = String(raw == null ? '' : raw).trim();
  if (!v) return { ok: false, error: 'Barkod değeri boş.' };
  switch (format) {
    case 'ean13': {
      if (!/^\d{12,13}$/.test(v)) return { ok: false, error: 'EAN-13 için 12 veya 13 rakam girin.' };
      const base = v.slice(0, 12); const cd = eanCheckDigit(base);
      if (v.length === 13 && v[12] !== cd) return { ok: false, error: `Kontrol hanesi hatalı (doğrusu ${cd}). 12 rakam girerseniz otomatik eklenir.` };
      return { ok: true, value: base + cd };
    }
    case 'ean8': {
      if (!/^\d{7,8}$/.test(v)) return { ok: false, error: 'EAN-8 için 7 veya 8 rakam girin.' };
      const base = v.slice(0, 7); const cd = eanCheckDigit(base);
      if (v.length === 8 && v[7] !== cd) return { ok: false, error: `Kontrol hanesi hatalı (doğrusu ${cd}). 7 rakam girerseniz otomatik eklenir.` };
      return { ok: true, value: base + cd };
    }
    case 'code128':
      if (v.length > 48) return { ok: false, error: 'Code 128 için en fazla 48 karakter.' };
      if ([...v].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126)) return { ok: false, error: 'Code 128 Türkçe/özel karakter içeremez. QR Kod kullanın.' };
      return { ok: true, value: v };
    case 'code39': {
      const up = v.toUpperCase();
      if (up.length > 30) return { ok: false, error: 'Code 39 için en fazla 30 karakter.' };
      if ([...up].some((c) => c === '*' || !(c in C39))) return { ok: false, error: 'Code 39 yalnızca A-Z, 0-9 ve - . $ / + % boşluk destekler.' };
      return { ok: true, value: up };
    }
    case 'qr':
      if (v.length > 300) return { ok: false, error: 'QR için en fazla 300 karakter.' };
      return { ok: true, value: v };
    default:
      return { ok: false, error: 'Bilinmeyen barkod türü.' };
  }
}

// ---------- kodlama ----------
export function encode(format, raw) {
  const chk = validate(format, raw);
  if (!chk.ok) throw new Error(chk.error);
  const value = chk.value;

  if (format === 'ean13') {
    const parity = EAN13_PARITY[Number(value[0])];
    let bits = '101';
    for (let i = 1; i <= 6; i++) bits += (parity[i - 1] === 'L' ? EAN_L : EAN_G)[Number(value[i])];
    bits += '01010';
    for (let i = 7; i <= 12; i++) bits += EAN_R[Number(value[i])];
    bits += '101';
    return { kind: 'linear', bits: [...bits].map(Number), text: value, ean: { lead: value[0], left: value.slice(1, 7), right: value.slice(7) } };
  }
  if (format === 'ean8') {
    let bits = '101';
    for (let i = 0; i < 4; i++) bits += EAN_L[Number(value[i])];
    bits += '01010';
    for (let i = 4; i < 8; i++) bits += EAN_R[Number(value[i])];
    bits += '101';
    return { kind: 'linear', bits: [...bits].map(Number), text: value, ean: { lead: '', left: value.slice(0, 4), right: value.slice(4) } };
  }
  if (format === 'code128') {
    const bits = [];
    code128Codes(value).forEach((c) => bits.push(...patternBits(C128[c])));
    return { kind: 'linear', bits, text: value };
  }
  if (format === 'code39') {
    const bits = [];
    const seq = `*${value}*`;
    [...seq].forEach((ch, idx) => {
      [...C39[ch]].forEach((w, i) => { const n = w === 'w' ? 3 : 1; for (let k = 0; k < n; k++) bits.push(i % 2 === 0 ? 1 : 0); });
      if (idx < seq.length - 1) bits.push(0); // karakterler arası dar boşluk
    });
    return { kind: 'linear', bits, text: value };
  }
  // qr
  const qr = qrcode(0, value.length > 120 ? 'L' : 'M');
  qr.addData(value);
  qr.make();
  const size = qr.getModuleCount();
  return { kind: 'matrix', size, cell: (x, y) => qr.isDark(y, x), text: value };
}

/** Sıradaki otomatik değer için önek + sıra numarasından barkod üretir (sunucu ile aynı kural) */
export function buildAuto(format, prefix, seq) {
  const pre = String(prefix || '').replace(/\D/g, '') || '2';
  if (format === 'ean13') { const body = (pre + String(seq).padStart(12 - pre.length, '0')).slice(0, 12); return body + eanCheckDigit(body); }
  if (format === 'ean8') { const body = (pre.slice(0, 1) + String(seq).padStart(6, '0')).slice(0, 7); return body + eanCheckDigit(body); }
  return `P${String(seq).padStart(8, '0')}`;
}
