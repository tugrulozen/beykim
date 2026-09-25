/**
 * DEPO TAKİP - Barkod Tarayıcı (Unified)
 * ZXing tabanlı kamera barkod okuma + manuel giriş
 */

let activeScanner = null;

/**
 * Barkod tarama modal'ını aç
 * @param {Function} onScan - Barkod okunduğunda çağrılacak callback(code)
 * @param {Function} [onError] - Hata callback'i (opsiyonel)
 * @returns {Function} closeScanner - Tarayıcıyı kapatma fonksiyonu
 */
export function openBarcodeScanner(onScan, onError) {
  // Önceki tarayıcı varsa kapat
  if (activeScanner) {
    try { activeScanner(); } catch(_) {}
    activeScanner = null;
  }

  // Modal container
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) {
    console.error('modal-container bulunamadı');
    return () => {};
  }

  modalContainer.classList.add('active');
  modalContainer.innerHTML = `
    <div class="scanner-backdrop" id="scanner-backdrop" style="
      position:fixed; top:0; left:0; width:100%; height:100%;
      background:rgba(0,0,0,0.85); z-index:9998;
    "></div>
    <div class="scanner-modal" style="
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      width:92%; max-width:420px; z-index:9999;
      border-radius:16px; overflow:hidden; background:#000;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
    ">
      <div class="scanner-header" style="
        display:flex; align-items:center; justify-content:space-between;
        padding:14px 16px; background:linear-gradient(135deg,#4ECDC4,#2196F3);
        color:white;
      ">
        <span style="font-weight:700; font-size:15px;"><i class="ph ph-camera" style="vertical-align:-2px; margin-right:6px;"></i>Barkod Tarayıcı</span>
        <button id="scanner-close-btn" style="
          background:rgba(255,255,255,0.2); border:none; color:white;
          width:32px; height:32px; border-radius:50%; cursor:pointer;
          font-size:18px; display:flex; align-items:center; justify-content:center;
        "><i class="ph ph-x"></i></button>
      </div>

      <div class="scanner-video-container" style="
        position:relative; width:100%; aspect-ratio:4/3; background:#111;
        display:flex; align-items:center; justify-content:center;
      ">
        <video id="scanner-video" autoplay playsinline muted style="
          width:100%; height:100%; object-fit:cover;
        "></video>
        
        <!-- Scan overlay -->
        <div style="
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:260px; height:140px;
          border:3px solid rgba(78,205,196,0.9);
          border-radius:12px;
          box-shadow: 0 0 0 3000px rgba(0,0,0,0.45);
          z-index:2;
        "></div>
        
        <!-- Scan line animation -->
        <div id="scanner-line" style="
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:240px; height:2px;
          background:linear-gradient(90deg, transparent, #ff4444, #ff4444, transparent);
          box-shadow: 0 0 8px rgba(255,68,68,0.6);
          z-index:3;
          animation: scanLine 2s ease-in-out infinite;
        "></div>
        
        <!-- Loading indicator -->
        <div id="scanner-loading" style="
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          color:white; font-size:14px; text-align:center; z-index:4;
        ">
          <div style="width:30px;height:30px;border:3px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 8px;"></div>
          Kamera açılıyor...
        </div>
      </div>

      <div style="padding:14px 16px; background:#fff;">
        <div style="text-align:center; margin-bottom:12px;">
          <span style="font-size:13px; color:#666; font-weight:500;">Barkodu çerçeveye hizalayın veya manuel girin</span>
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" id="scanner-manual-input" placeholder="Barkod numarası..." style="
            flex:1; padding:11px 14px; border:1.5px solid #E5E7EB;
            border-radius:10px; font-size:15px; font-family:inherit;
            outline:none; transition: border-color 0.2s;
          " />
          <button id="scanner-manual-btn" style="
            padding:11px 18px; background:linear-gradient(135deg,#4ECDC4,#2196F3);
            color:#fff; border:none; border-radius:10px; font-weight:700;
            font-size:14px; cursor:pointer; white-space:nowrap;
          ">Ekle</button>
        </div>
      </div>
    </div>

    <style>
      @keyframes scanLine {
        0%, 100% { transform: translate(-50%, calc(-50% - 40px)); }
        50% { transform: translate(-50%, calc(-50% + 40px)); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;

  let codeReader = null;
  let controls = null;
  let isClosed = false;

  function closeScanner() {
    if (isClosed) return;
    isClosed = true;
    activeScanner = null;

    // Stop camera
    if (controls) {
      try { controls.stop(); } catch(_) {}
      controls = null;
    }

    // Stop all video tracks
    const video = document.getElementById('scanner-video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }

    modalContainer.classList.remove('active');
    modalContainer.innerHTML = '';
  }

  activeScanner = closeScanner;

  // Event listeners
  setTimeout(() => {
    document.getElementById('scanner-close-btn')?.addEventListener('click', closeScanner);
    document.getElementById('scanner-backdrop')?.addEventListener('click', closeScanner);

    // Manuel giriş
    const manualInput = document.getElementById('scanner-manual-input');
    const manualBtn = document.getElementById('scanner-manual-btn');

    function handleManualSubmit() {
      const code = manualInput?.value?.trim();
      if (code) {
        closeScanner();
        onScan(code);
      }
    }

    manualBtn?.addEventListener('click', handleManualSubmit);
    manualInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleManualSubmit();
    });
    manualInput?.addEventListener('focus', () => {
      manualInput.style.borderColor = '#4ECDC4';
    });
    manualInput?.addEventListener('blur', () => {
      manualInput.style.borderColor = '#E5E7EB';
    });

    // Start camera
    startCamera();
  }, 50);

  async function startCamera() {
    const video = document.getElementById('scanner-video');
    const loading = document.getElementById('scanner-loading');
    
    if (!video) return;

    // ZXing yerel pakettir (CDN yok); kamera açılırken yüklenir
    let ZXingBrowser;
    try {
      ZXingBrowser = await import('@zxing/browser');
    } catch (_e) {
      if (loading) loading.innerHTML = '<i class="ph ph-warning"></i> Barkod okuyucu yüklenemedi.<br>Manuel barkod girişi kullanın.';
      return;
    }

    try {
      codeReader = new ZXingBrowser.BrowserMultiFormatReader();
      
      const onResult = (result, err) => {
        if (isClosed) return;
        if (result) {
          const code = result.getText();
          if (code && code.length > 0) {
            // Vibrate feedback
            if (navigator.vibrate) navigator.vibrate(100);
            closeScanner();
            onScan(code);
          }
        }
      };

      // Try rear camera first, then any camera
      try {
        controls = await codeReader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
          video,
          onResult
        );
      } catch (e1) {
        console.warn('Rear camera failed, trying any camera:', e1.message);
        try {
          controls = await codeReader.decodeFromConstraints(
            { audio: false, video: true },
            video,
            onResult
          );
        } catch (e2) {
          console.error('All cameras failed:', e2.message);
          if (loading) loading.innerHTML = '<i class="ph ph-warning"></i> Kamera açılamadı.<br>Manuel barkod girişi kullanın.';
          if (onError) onError(e2);
          return;
        }
      }

      // Camera started successfully - hide loading
      if (loading) loading.style.display = 'none';

    } catch (e) {
      console.error('ZXing init error:', e);
      if (loading) loading.innerHTML = '<i class="ph ph-warning"></i> Tarayıcı başlatılamadı.<br>Manuel giriş kullanın.';
      if (onError) onError(e);
    }
  }

  return closeScanner;
}
