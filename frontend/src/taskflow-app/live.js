/**
 * Gerçek zamanlı bağlantı: Server-Sent Events (GET /api/jt/flow/stream).
 * EventSource Authorization başlığı gönderemediği için akış fetch + ReadableStream ile okunur (jeton URL'ye yazılmaz).
 * Bağlantı koparsa artan beklemeyle yeniden bağlanır; akış hiç kurulamıyorsa 8 sn'lik yoklamaya (polling) düşer.
 * Olaylar: job · message · typing · presence · units   →  on(event, fn) ile dinlenir.
 */
import api from '../core/api.js';
import AppConfig from '../core/config.js';

const handlers = new Map();
let ctrl = null, retry = 0, pollTimer = null, stopped = false;
export const status = { live: false, online: new Set() };

export function on(event, fn) {
  if (!handlers.has(event)) handlers.set(event, new Set());
  handlers.get(event).add(fn);
  return () => handlers.get(event)?.delete(fn);
}
export function emit(event, data) { (handlers.get(event) || []).forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } }); }

function parse(chunk, state) {
  state.buf += chunk;
  let i;
  while ((i = state.buf.indexOf('\n\n')) >= 0) {
    const block = state.buf.slice(0, i); state.buf = state.buf.slice(i + 2);
    let ev = 'message', data = '';
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) ev = line.slice(6).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
    }
    if (!data) continue;
    try { const d = JSON.parse(data); if (ev === 'presence' || ev === 'hello') { status.online = new Set(d.online || []); emit('presence', d); } else emit(ev, d); } catch (_e) { /* */ }
  }
}

export async function connect() {
  stopped = false;
  if (ctrl) return;
  ctrl = new AbortController();
  const token = localStorage.getItem(AppConfig.storageKeys.token);
  try {
    const res = await fetch(`${api.baseUrl}/jt/flow/stream`, { headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream', ...(api.tenantId ? { 'X-Tenant-Id': api.tenantId } : {}) }, signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok || !res.body) throw new Error(`akış ${res.status}`);
    status.live = true; retry = 0; stopPolling(); emit('status', { live: true });
    const rd = res.body.getReader(); const dec = new TextDecoder(); const st = { buf: '' };
    for (;;) { const { value, done } = await rd.read(); if (done) break; parse(dec.decode(value, { stream: true }), st); }
    throw new Error('akış kapandı');
  } catch (_e) {
    ctrl = null; status.live = false; emit('status', { live: false });
    if (stopped) return;
    retry++;
    if (retry >= 3) startPolling(); // vekil sunucu akışı tamponluyorsa en azından yoklama ile güncel kalınır
    setTimeout(connect, Math.min(30000, 1500 * 2 ** Math.min(retry, 4)));
  }
}
export function disconnect() { stopped = true; if (ctrl) ctrl.abort(); ctrl = null; stopPolling(); }
function startPolling() { if (!pollTimer) pollTimer = setInterval(() => emit('job', { id: null, action: 'poll' }), 8000); }
function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }
