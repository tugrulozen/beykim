/**
 * Barkod giriş alanı: kamera olmadan da çalışır.
 * Barkod yalnızca açık bir onayla alınır: Enter (masaüstü / el okuyucusu), klavyedeki "Git/Bitti" tuşu (mobil)
 * veya "Ekle" düğmesi. Alandan çıkmak (başka yere tıklamak) barkodu KAYDETMEZ; yarım yazılmış kod alanda kalır.
 * Formu gönderirken alanda yazılı kalmış barkod `flush()` ile bilinçli olarak alınabilir.
 */
export function wireBarcodeInput(input, onCode) {
  if (!input) return { flush: () => false };

  input.setAttribute('enterkeyhint', 'done');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('spellcheck', 'false');

  const take = () => {
    const code = input.value.trim();
    if (!code) return false;
    input.value = '';
    onCode(code);
    return true;
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); take(); }
  });
  // Bazı Android klavyeleri "Git/Bitti" tuşunda keydown yerine satır sonu girdisi gönderir
  input.addEventListener('beforeinput', (e) => {
    if (e.inputType === 'insertLineBreak') { e.preventDefault(); take(); }
  });

  const row = input.closest('.barcode-input-row, .search-input-row');
  if (row && !row.querySelector('.barcode-add-btn')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'barcode-add-btn';
    btn.setAttribute('aria-label', 'Barkodu ekle');
    btn.innerHTML = '<i class="ph ph-plus"></i>';
    btn.addEventListener('mousedown', (e) => e.preventDefault()); // odak alanda kalsın
    btn.addEventListener('click', () => { if (!take()) input.focus(); });
    row.insertBefore(btn, row.querySelector('.camera-btn') || null);
  }
  return { flush: take };
}
