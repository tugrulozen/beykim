/**
 * DEPO TAKİP - AI CoPilot Sayfası
 */

import AppConfig from '../core/config.js';
import { createHeader } from '../components/header.js';
import api from '../core/api.js';
import Auth from '../core/auth.js';
import { esc } from '../components/shell.js';

/** Sunucudan gelen CoPilot HTML'i: yalnızca güvenli etiket ve özniteliklere izin verilir */
const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'BR', 'P', 'SPAN', 'UL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'SMALL']);
function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(`<body>${String(html ?? '')}</body>`, 'text/html');
  const walk = (node) => {
    [...node.children].forEach((el) => {
      if (!ALLOWED_TAGS.has(el.tagName) && !(el.tagName === 'I' )) { el.replaceWith(document.createTextNode(el.textContent)); return; }
      [...el.attributes].forEach((a) => {
        const ok = a.name === 'class' && /^[\w\s-]*$/.test(a.value) || a.name === 'style' && /^color:\s*#[0-9a-f]{3,8};?$/i.test(a.value);
        if (!ok) el.removeAttribute(a.name);
      });
      walk(el);
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

export default function CopilotPage() {
  const container = document.createElement('div');
  container.className = 'page-copilot page-container';

  const user = Auth.getUser();

  const header = createHeader({
    title: AppConfig.modules.copilot?.label || 'AI CoPilot',
    gradientClass: 'gradient-copilot',
    actions: [{ icon: '<i class="ph ph-arrows-clockwise"></i>', title: 'Yenile', onClick: () => location.reload() }]
  });
  container.appendChild(header);


  // Chat container
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-container';
  chatContainer.id = 'chat-container';
  container.appendChild(chatContainer);

  // Chat input
  const inputArea = document.createElement('div');
  inputArea.className = 'chat-input-area';
  inputArea.innerHTML = `
    <div class="input-field" style="flex: 1;">
      <input type="text" id="chat-input" placeholder="Mesajınızı yazın..." />
    </div>
    <button class="chat-send-btn" id="chat-send-btn"><i class="ph-fill ph-paper-plane-tilt"></i></button>
  `;
  container.appendChild(inputArea);

  // Messages state
  const messages = [];

  let convoContext = {}; // önceki cevabın konusu (ürün/müşteri): "peki depolara göre?" gibi devam soruları için
  let busy = false;

  function addMessage(text, type = 'bot', html = false, suggestions = []) {
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    // eski mesajların önerileri kaldırılır; yalnızca son cevabın çipleri görünür
    messages.forEach((m) => { m.suggestions = []; });
    messages.push({ text, type, time, html, suggestions });
    renderMessages();
  }

  function renderMessages() {
    const chat = container.querySelector('#chat-container');
    chat.innerHTML = messages.map(msg => `
      <div class="chat-message ${msg.type}">
        <div class="chat-avatar">
          ${msg.type === 'user' ? '<i class="ph ph-user"></i>' : '<i class="ph ph-sparkle"></i>'}
        </div>
        <div class="chat-bubble">
          ${msg.typing ? '<div class="typing"><i></i><i></i><i></i></div>' : msg.html ? sanitizeHtml(msg.text) : `<p>${esc(msg.text)}</p>`}
          ${msg.suggestions && msg.suggestions.length ? `<div class="chat-chips">${msg.suggestions.map((x) => `<button type="button" class="chat-chip" data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div>` : ''}
          ${msg.typing ? '' : `<div class="chat-time">${msg.time}</div>`}
        </div>
      </div>
    `).join('');

    // Scroll to bottom
    chat.scrollTop = chat.scrollHeight;
  }

  // Initial message
  setTimeout(() => {
    addMessage(`Merhaba! Ben ${AppConfig.companyName} AI CoPilot. Stok, satış, müşteri, hammadde, satın alma, üretim ve iş takibi hakkında soru sorabilirsiniz; uygulamanın nasıl kullanılacağını da anlatırım.`, 'bot', false,
      ['Stok durumu', 'Bu ay satışlar', 'Azalan ürünler', 'Neler sorabilirim?']);

    const chatInput = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#chat-send-btn');

    async function sendMessage(preset) {
      const text = (typeof preset === 'string' ? preset : chatInput?.value)?.trim();
      if (!text || busy) return;
      busy = true;
      sendBtn?.setAttribute('disabled', '');

      addMessage(text, 'user');
      if (typeof preset !== 'string') chatInput.value = '';

      messages.push({ typing: true, type: 'bot', html: false, text: '', suggestions: [] });
      renderMessages();

      try {
        const res = await api.post('/copilot/chat', { message: text, company: AppConfig.companyName, context: convoContext });
        messages.pop();
        if (res.success) {
          convoContext = res.data.context || {};
          addMessage(res.data.message, 'bot', true, res.data.suggestions || []);
        } else {
          addMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
        }
      } catch (err) {
        messages.pop();
        addMessage(err.message || 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
      } finally {
        busy = false;
        sendBtn?.removeAttribute('disabled');
        chatInput?.focus({ preventScroll: true });
      }
    }

    sendBtn?.addEventListener('click', () => sendMessage());
    chatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendMessage(); }
    });
    container.querySelector('#chat-container').addEventListener('click', (e) => {
      const chip = e.target.closest('.chat-chip');
      if (chip) sendMessage(chip.dataset.q);
    });
  }, 300);

  return container;
}
