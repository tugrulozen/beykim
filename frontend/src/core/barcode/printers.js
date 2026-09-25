/**
 * Yazıcı komutları ve bağlantı yolları.
 *
 * Yazıcı dilleri (etiket, 1-bit görüntü olarak gönderilir; böylece her barkod türü, Türkçe karakter ve
 * her ölçü birebir önizlemedeki gibi çıkar):
 *   zpl   → Zebra ve uyumlular
 *   tspl  → TSC, Xprinter, Gprinter, Godex (TSPL modu) ve benzeri
 * Bağlantı yolları:
 *   browser → yüklü herhangi bir yazıcı (sürücü) — @page ile tam etiket ölçüsünde
 *   serial  → Web Serial (USB-seri / Bluetooth SPP; Chrome & Edge)
 *   agent   → bilgisayarda çalışan yerel yazdırma ajanı (ağ 9100, Windows/Linux/Mac yazıcı adı)
 */
import { toBitmap, buildPrintHtml } from './label.js';

const enc = new TextEncoder();
const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0));
  let o = 0;
  parts.forEach((p) => { out.set(p, o); o += p.length; });
  return out;
};

const HEX = '0123456789ABCDEF';
function toHex(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += HEX[bytes[i] >> 4] + HEX[bytes[i] & 15];
  return s;
}

/** ZPL II — ^GFA ile görüntü. media: gap | continuous | mark */
export function zplFromBitmap(bmp, { copies = 1, media = 'gap', darkness = 0 } = {}) {
  const total = bmp.data.length;
  const mn = media === 'continuous' ? 'N' : media === 'mark' ? 'M' : 'Y';
  const cmd = `^XA^CI28^MN${mn}^PW${bmp.wPx}^LL${bmp.hPx}^LH0,0${darkness ? `~SD${darkness}` : ''}^FO0,0^GFA,${total},${total},${bmp.rowBytes},${toHex(bmp.data)}^FS^PQ${Math.max(1, copies | 0)},0,1,N^XZ`;
  return enc.encode(cmd);
}

/** TSPL2 — BITMAP (TSPL'de 0 = siyah nokta olduğundan bitler ters çevrilir) */
export function tsplFromBitmap(bmp, { copies = 1, wMm, hMm, gapMm = 3, direction = 1, speed = 4, density = 8, media = 'gap' } = {}) {
  const inv = new Uint8Array(bmp.data.length);
  for (let i = 0; i < inv.length; i++) inv[i] = ~bmp.data[i] & 0xff;
  const gapLine = media === 'continuous' ? 'GAP 0 mm,0 mm' : media === 'mark' ? `BLINE ${gapMm} mm,0 mm` : `GAP ${gapMm} mm,0 mm`;
  const head = enc.encode(`SIZE ${wMm} mm,${hMm} mm\r\n${gapLine}\r\nSPEED ${speed}\r\nDENSITY ${density}\r\nDIRECTION ${direction}\r\nREFERENCE 0,0\r\nCLS\r\nBITMAP 0,0,${bmp.rowBytes},${bmp.hPx},0,`);
  const tail = enc.encode(`\r\nPRINT ${Math.max(1, copies | 0)},1\r\n`);
  return concat(head, inv, tail);
}

/** Bir etiketin yazıcı komut baytları */
export function buildRaw(layout, settings, copies) {
  const bmp = toBitmap(layout, settings.dpi || 203);
  if (settings.language === 'tspl') {
    return tsplFromBitmap(bmp, { copies, wMm: layout.w, hMm: layout.h, gapMm: settings.gap ?? 3, direction: settings.direction ?? 1, media: settings.media || 'gap' });
  }
  return zplFromBitmap(bmp, { copies, media: settings.media || 'gap' });
}

// ---------- ayarlar (cihaza özel) ----------
const defaults = { mode: 'browser', language: 'zpl', dpi: 203, media: 'gap', gap: 3, direction: 1, baud: 115200, agentUrl: 'http://127.0.0.1:9101', agentTarget: 'tcp', agentHost: '', agentPort: 9100, agentPrinter: '' };
export function loadPrinterSettings(storageKey, tenantDefaults = {}) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (_e) { /* boş */ }
  return { ...defaults, ...tenantDefaults, ...saved };
}
export function savePrinterSettings(storageKey, s) {
  try { localStorage.setItem(storageKey, JSON.stringify(s)); } catch (_e) { /* özel pencere */ }
}

// ---------- tarayıcı (sürücü) ----------
export function printInBrowser(items, size, opts) {
  return new Promise((resolve) => {
    const html = buildPrintHtml(items, size, opts);
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(frame);
    const doc = frame.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
    const go = () => {
      try { frame.contentWindow.focus(); frame.contentWindow.print(); } finally {
        setTimeout(() => { frame.remove(); resolve(); }, 1500);
      }
    };
    setTimeout(go, 250);
  });
}

// ---------- Web Serial ----------
export const serialSupported = () => typeof navigator !== 'undefined' && 'serial' in navigator;
export async function serialSend(bytes, { baud = 115200 } = {}) {
  if (!serialSupported()) throw new Error('Bu tarayıcı Web Serial desteklemiyor (Chrome/Edge kullanın).');
  let port = (await navigator.serial.getPorts())[0];
  if (!port) port = await navigator.serial.requestPort();
  await port.open({ baudRate: baud });
  try {
    const writer = port.writable.getWriter();
    try {
      for (let i = 0; i < bytes.length; i += 4096) await writer.write(bytes.subarray(i, i + 4096));
    } finally { writer.releaseLock(); }
  } finally { await port.close(); }
}
export async function serialForget() {
  if (!serialSupported()) return;
  for (const p of await navigator.serial.getPorts()) { try { await p.forget(); } catch (_e) { /* eski sürüm */ } }
}

// ---------- yerel yazdırma ajanı ----------
const b64 = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };

function agentTarget(s) {
  return s.agentTarget === 'printer' ? { type: 'printer', name: s.agentPrinter } : { type: 'tcp', host: s.agentHost, port: Number(s.agentPort) || 9100 };
}
export async function agentHealth(s) {
  const r = await fetch(`${s.agentUrl}/health`, { signal: AbortSignal.timeout(2500) });
  return r.json();
}
export async function agentPrinters(s) {
  const r = await fetch(`${s.agentUrl}/printers`, { signal: AbortSignal.timeout(6000) });
  return (await r.json()).printers || [];
}
export async function agentSend(bytes, s, jobName = 'Etiket') {
  let r;
  try {
    r = await fetch(`${s.agentUrl}/print`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: agentTarget(s), data: b64(bytes), jobName }),
      signal: AbortSignal.timeout(20000),
    });
  } catch (_e) {
    throw new Error('Yazdırma ajanına ulaşılamadı. Ajanın bu bilgisayarda çalıştığından ve adresin doğru olduğundan emin olun.');
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) throw new Error(j.message || `Ajan hatası (${r.status})`);
}

/**
 * Tek giriş noktası: items = [{ layout, copies }]
 * mode 'browser' ise sürücüyle, aksi halde ham komutla gönderir.
 */
export async function printLabels(items, size, settings, { startCell = 0 } = {}) {
  if (settings.mode === 'browser' || size.kind === 'sheet') {
    if (settings.mode !== 'browser' && size.kind === 'sheet') throw new Error('A4 yaprak etiketler yalnızca “Tarayıcı / sürücü” ile yazdırılır.');
    return printInBrowser(items, size, { startCell });
  }
  for (const it of items) {
    const bytes = buildRaw(it.layout, settings, Math.max(1, it.copies | 0));
    if (settings.mode === 'serial') await serialSend(bytes, { baud: settings.baud });
    else if (settings.mode === 'agent') await agentSend(bytes, settings, size.label);
    else throw new Error('Bilinmeyen yazıcı bağlantısı.');
  }
}

/** Ham komutu dosya olarak indirir (yazıcıya başka bir araçla göndermek için) */
export function downloadRaw(layout, settings, copies, name = 'etiket') {
  const bytes = buildRaw(layout, settings, copies);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
  a.download = `${name}.${settings.language === 'tspl' ? 'tspl' : 'zpl'}`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
