/**
 * DEPO TAKİP - Mock API Handler
 * Gerçek API endpoint'lerini simüle eder
 */

import { users, branches, warehouses, stocks, serials, customers, cashRegisters } from './mockData.js';
import { suppliers, purchaseOrders, orderStatuses } from './purchaseData.js';

/**
 * Sipariş satırı net tutarı (iskonto sonrası, KDV öncesi)
 */
function calcLineNet(line) {
  const gross = (line.qty || 0) * (line.unitPrice || 0);
  const discount = gross * ((line.discount || 0) / 100);
  return gross - discount;
}

function calcOrderNet(order) {
  return (order.lines || []).reduce((sum, l) => sum + calcLineNet(l), 0);
}

function calcOrderTax(order) {
  return (order.lines || []).reduce((sum, l) => {
    const net = calcLineNet(l);
    return sum + net * ((l.taxRate || 0) / 100);
  }, 0);
}

function calcOrderGross(order) {
  return calcOrderNet(order) + calcOrderTax(order);
}

/**
 * Yapay gecikme ekle (gerçekçi deneyim için)
 */
function delay(ms = 400) {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 300));
}

/**
 * Mock API handler
 */
export async function mockApiHandler(method, endpoint, data) {
  await delay();

  // ---- AUTH ----
  if (endpoint === '/auth/login' && method === 'POST') {
    const user = users.find(u => u.username === data.username && u.password === data.password);
    if (user) {
      const { password: _pw, ...safeUser } = user;
      return {
        success: true,
        data: {
          token: 'mock-token-' + Date.now(),
          user: safeUser,
        },
      };
    }
    return { success: false, message: 'Kullanıcı adı veya şifre hatalı' };
  }

  if (endpoint === '/auth/logout') {
    return { success: true };
  }

  // ---- BRANCHES ----
  if (endpoint === '/branches' && method === 'GET') {
    return { success: true, data: branches };
  }

  // ---- WAREHOUSES ----
  if (endpoint.startsWith('/warehouses') && method === 'GET') {
    const parts = endpoint.split('/');
    if (parts.length > 2) {
      // /warehouses?branchId=101
      const branchId = endpoint.split('branchId=')[1];
      if (branchId) {
        return { success: true, data: warehouses.filter(w => w.branchId === branchId) };
      }
      return { success: true, data: warehouses.filter(w => w.id === parts[2]) };
    }
    return { success: true, data: warehouses };
  }

  // ---- STOCKS ----
  if (endpoint.startsWith('/stocks/') && method === 'GET') {
    const code = decodeURIComponent(endpoint.split('/stocks/')[1]).toLowerCase();
    const found = stocks.filter(s =>
      s.id.toLowerCase().includes(code) ||
      s.code.toLowerCase().includes(code) ||
      s.name.toLowerCase().includes(code) ||
      s.desen.toLowerCase().includes(code)
    );
    if (found.length > 0) {
      return { success: true, data: found[0], results: found };
    }
    return { success: false, message: 'Stok bulunamadı' };
  }

  // ---- SERIALS ----
  if (endpoint.startsWith('/serials/') && method === 'GET') {
    const parts = endpoint.split('/');
    const serialNo = parts[2];

    if (parts[3] === 'others') {
      // Aynı stok kodundaki diğer seriler
      const mainSerial = serials.find(s => s.serialNo === serialNo);
      if (mainSerial) {
        const others = serials.filter(s => s.stockId === mainSerial.stockId && s.serialNo !== serialNo);
        const totalQuantity = others.reduce((sum, s) => sum + s.quantity, 0);
        return {
          success: true,
          data: {
            items: others,
            totalCount: others.length,
            totalQuantity: Math.round(totalQuantity * 100) / 100,
          },
        };
      }
      return { success: true, data: { items: [], totalCount: 0, totalQuantity: 0 } };
    }

    const found = serials.find(s => s.serialNo === serialNo);
    if (found) {
      return { success: true, data: found };
    }
    // Kısmi arama
    const partial = serials.filter(s => s.serialNo.includes(serialNo));
    if (partial.length > 0) {
      return { success: true, data: partial[0], results: partial };
    }
    return { success: false, message: 'Seri numarası bulunamadı' };
  }

  // ---- TRANSFERS ----
  if (endpoint === '/transfers' && method === 'POST') {
    return {
      success: true,
      data: {
        transferId: 'TRF-' + Date.now(),
        processId: 3,
        status: 'completed',
        barcodeCount: data.barcodes?.length || 0,
      },
      message: 'Transfer işlemi başarıyla tamamlandı',
    };
  }

  // ---- SALES ----
  if (endpoint === '/sales' && method === 'POST') {
    return {
      success: true,
      data: { saleId: 'SL-' + Date.now(), status: 'completed' },
      message: 'Satış işlemi başarıyla kaydedildi',
    };
  }

  if (endpoint === '/sales/types' && method === 'GET') {
    return { success: true, data: ['toptan', 'perakende', 'ihracat', 'b2b', 'iade'] };
  }

  // ---- PURCHASES ----
  if (endpoint === '/purchases' && method === 'POST') {
    return {
      success: true,
      data: { purchaseId: 'PR-' + Date.now(), status: 'completed' },
      message: 'Alış işlemi başarıyla kaydedildi',
    };
  }

  // ---- STOCK COUNT ----
  if (endpoint === '/stock-count' && method === 'POST') {
    return {
      success: true,
      data: { countId: 'SC-' + Date.now(), status: 'completed' },
      message: 'Sayım verisi başarıyla kaydedildi',
    };
  }

  // ---- REPORTS ----
  if (endpoint === '/reports/customer-balance' && method === 'GET') {
    return { success: true, data: customers };
  }

  if (endpoint === '/reports/cash-balance' && method === 'GET') {
    return { success: true, data: cashRegisters };
  }

  // ---- COPILOT ----
  if (endpoint === '/copilot/chat' && method === 'POST') {
    const message = (data.message || '').toLowerCase().trim();
    let response = '';

    if (message.includes('merhaba') || message.includes('selam')) {
      response = 'Merhaba! Size nasıl yardımcı olabilirim?';
    } else if (message.includes('kasa') && message.includes('dolar')) {
      const usdRegisters = cashRegisters.filter(c => c.currency === 'USD');
      let table = '<table><tr><th>Kasa Adı</th><th>Bakiye (USD)</th></tr>';
      usdRegisters.forEach(c => {
        table += `<tr><td>${c.name}</td><td>$${c.balance.toLocaleString('tr-TR')}</td></tr>`;
      });
      table += '</table>';
      response = `Kasa dolar bakiyeniz aşağıdaki gibidir:\n${table}\nBaşka bir konuda yardımcı olabilir miyim?`;
    } else if (message.includes('fa1827') || message.includes('fa 1827')) {
      const fa = serials.filter(s => s.stockId === 'fa1827');
      const total = fa.reduce((s, item) => s + item.quantity, 0);
      const maxQ = Math.max(...fa.map(s => s.quantity));
      let table = '<table><tr><th>Seri No</th><th>Depo Kod</th><th>Bakiye (metre)</th></tr>';
      fa.forEach(s => {
        table += `<tr><td>${s.serialNo}</td><td>${s.warehouseId}</td><td>${s.quantity}</td></tr>`;
      });
      table += '</table>';
      response = `Fa1827/33 deseni için depo bilgileri aşağıdaki gibidir:\n\n- <b>Toplam Miktar:</b> ${total} metre\n- <b>En Büyük Seri Miktarı:</b> ${maxQ} metre\n\nHer bir seri için ayrıntılar:\n${table}\nBaşka bir konuda yardımcı olabilir miyim?`;
    } else if (message.includes('stok') || message.includes('ürün')) {
      response = 'Hangi stok kodu veya desen hakkında bilgi almak istersiniz? Örneğin: "JN1016 stok bilgisi" veya "FA1827/33 deseni hangi depoda?"';
    } else if (message.includes('satış') || message.includes('satılan')) {
      response = 'Bugün satılan mallarla ilgili bilgi almak için sistemdeki satış raporlarına bakmam gerekiyor. Ancak şu anda bu bilgiye doğrudan erişimim yok. Lütfen satış raporlarınızı kontrol edin veya sistem yöneticinizle iletişime geçin. Başka bir konuda yardımcı olabilir miyim?';
    } else {
      response = 'Bu konuda size yardımcı olmak isterdim. Şu konularda sorularınızı yanıtlayabilirim:\n\n• Stok ve seri sorgulama\n• Kasa bakiye bilgileri\n• Desen bazlı depo bilgileri\n\nNasıl yardımcı olabilirim?';
    }

    return {
      success: true,
      data: {
        message: response,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      },
    };
  }

  // ---- SUPPLIERS ----
  if (endpoint === '/suppliers' && method === 'GET') {
    return { success: true, data: suppliers };
  }

  if (endpoint.startsWith('/suppliers/') && method === 'GET') {
    const id = endpoint.split('/suppliers/')[1];
    const found = suppliers.find(s => s.id === id);
    if (found) return { success: true, data: found };
    return { success: false, message: 'Tedarikçi bulunamadı' };
  }

  if (endpoint === '/suppliers' && method === 'POST') {
    const newSupplier = {
      ...data,
      id: 'SUP' + String(suppliers.length + 1).padStart(3, '0'),
      code: 'TED-' + String(suppliers.length + 1).padStart(3, '0'),
      totalOrders: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    suppliers.push(newSupplier);
    return { success: true, data: newSupplier, message: 'Tedarikçi eklendi' };
  }

  if (endpoint.startsWith('/suppliers/') && method === 'PUT') {
    const id = endpoint.split('/suppliers/')[1];
    const idx = suppliers.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, message: 'Tedarikçi bulunamadı' };
    suppliers[idx] = { ...suppliers[idx], ...data };
    return { success: true, data: suppliers[idx], message: 'Tedarikçi güncellendi' };
  }

  if (endpoint.startsWith('/suppliers/') && method === 'DELETE') {
    const id = endpoint.split('/suppliers/')[1];
    const idx = suppliers.findIndex(s => s.id === id);
    if (idx === -1) return { success: false, message: 'Tedarikçi bulunamadı' };
    suppliers[idx].status = 'passive';
    return { success: true, message: 'Tedarikçi pasife alındı' };
  }

  // ---- PURCHASE ORDERS ----
  if (endpoint === '/purchase-orders' && method === 'GET') {
    // Filtreler: ?status=draft&supplierId=SUP001
    let list = [...purchaseOrders];
    if (data && data.status) list = list.filter(o => o.status === data.status);
    if (data && data.supplierId) list = list.filter(o => o.supplierId === data.supplierId);
    // Özet hesapla
    const withTotals = list.map(o => ({
      ...o,
      totalNet: calcOrderNet(o),
      totalTax: calcOrderTax(o),
      totalGross: calcOrderGross(o),
    }));
    return { success: true, data: withTotals };
  }

  if (endpoint.startsWith('/purchase-orders/') && !endpoint.includes('/receive') && method === 'GET') {
    const id = endpoint.split('/purchase-orders/')[1];
    const found = purchaseOrders.find(o => o.id === id);
    if (!found) return { success: false, message: 'Sipariş bulunamadı' };
    return {
      success: true,
      data: {
        ...found,
        totalNet: calcOrderNet(found),
        totalTax: calcOrderTax(found),
        totalGross: calcOrderGross(found),
      }
    };
  }

  if (endpoint === '/purchase-orders' && method === 'POST') {
    const year = new Date().getFullYear();
    const seq = String(purchaseOrders.length + 1).padStart(3, '0');
    const newOrder = {
      ...data,
      id: `PO-${year}-${seq}`,
      status: data.status || 'draft',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    purchaseOrders.push(newOrder);
    // Tedarikçi sipariş sayısını güncelle
    const sup = suppliers.find(s => s.id === newOrder.supplierId);
    if (sup) sup.totalOrders++;
    return { success: true, data: newOrder, message: 'Satın alma siparişi oluşturuldu' };
  }

  if (endpoint.startsWith('/purchase-orders/') && method === 'PUT') {
    const id = endpoint.split('/purchase-orders/')[1].split('/')[0];
    const idx = purchaseOrders.findIndex(o => o.id === id);
    if (idx === -1) return { success: false, message: 'Sipariş bulunamadı' };
    purchaseOrders[idx] = { ...purchaseOrders[idx], ...data };
    return { success: true, data: purchaseOrders[idx], message: 'Sipariş güncellendi' };
  }

  // Onay işlemi
  if (endpoint.startsWith('/purchase-orders/') && endpoint.endsWith('/approve') && method === 'POST') {
    const id = endpoint.split('/purchase-orders/')[1].replace('/approve', '');
    const idx = purchaseOrders.findIndex(o => o.id === id);
    if (idx === -1) return { success: false, message: 'Sipariş bulunamadı' };
    if (!['draft', 'pending'].includes(purchaseOrders[idx].status)) {
      return { success: false, message: 'Bu sipariş onaylanamaz' };
    }
    purchaseOrders[idx].status = 'approved';
    purchaseOrders[idx].approvedBy = data.approvedBy || 'Kullanıcı';
    purchaseOrders[idx].approvedAt = new Date().toISOString().slice(0, 10);
    return { success: true, data: purchaseOrders[idx], message: 'Sipariş onaylandı' };
  }

  // İptal işlemi
  if (endpoint.startsWith('/purchase-orders/') && endpoint.endsWith('/cancel') && method === 'POST') {
    const id = endpoint.split('/purchase-orders/')[1].replace('/cancel', '');
    const idx = purchaseOrders.findIndex(o => o.id === id);
    if (idx === -1) return { success: false, message: 'Sipariş bulunamadı' };
    if (['received', 'cancelled'].includes(purchaseOrders[idx].status)) {
      return { success: false, message: 'Bu sipariş iptal edilemez' };
    }
    purchaseOrders[idx].status = 'cancelled';
    purchaseOrders[idx].cancelReason = data.reason || '';
    return { success: true, data: purchaseOrders[idx], message: 'Sipariş iptal edildi' };
  }

  // Mal kabul (receive)
  if (endpoint.startsWith('/purchase-orders/') && endpoint.endsWith('/receive') && method === 'POST') {
    const id = endpoint.split('/purchase-orders/')[1].replace('/receive', '');
    const idx = purchaseOrders.findIndex(o => o.id === id);
    if (idx === -1) return { success: false, message: 'Sipariş bulunamadı' };
    const order = purchaseOrders[idx];
    if (!['approved', 'ordered', 'partial'].includes(order.status)) {
      return { success: false, message: 'Bu sipariş için mal kabul yapılamaz' };
    }
    // receivedLines: [{ lineId, qty }]
    const receivedLines = data.receivedLines || [];
    receivedLines.forEach(rl => {
      const line = order.lines.find(l => l.id === rl.lineId);
      if (line) {
        line.receivedQty = Math.min((line.receivedQty || 0) + rl.qty, line.qty);
      }
    });
    order.invoiceNo = data.invoiceNo || order.invoiceNo;
    order.receiptDate = new Date().toISOString().slice(0, 10);
    // Durum güncelle
    const allReceived = order.lines.every(l => l.receivedQty >= l.qty);
    order.status = allReceived ? 'received' : 'partial';
    // Tedarikçi toplam tutarını güncelle
    const sup = suppliers.find(s => s.id === order.supplierId);
    if (sup) sup.totalAmount += calcOrderNet(order);
    return {
      success: true,
      data: order,
      message: allReceived ? 'Tüm kalemler teslim alındı' : 'Kısmi teslim kaydedildi',
    };
  }

  // ---- PURCHASE REPORTS ----
  if (endpoint === '/purchase-reports/summary' && method === 'GET') {
    const total = purchaseOrders.length;
    const byStatus = {};
    Object.keys(orderStatuses).forEach(s => { byStatus[s] = 0; });
    purchaseOrders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
    const totalAmount = purchaseOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + calcOrderGross(o), 0);
    const receivedAmount = purchaseOrders
      .filter(o => o.status === 'received')
      .reduce((sum, o) => sum + calcOrderGross(o), 0);
    return {
      success: true,
      data: { total, byStatus, totalAmount, receivedAmount },
    };
  }

  // Default
  return { success: false, message: 'Endpoint bulunamadı: ' + endpoint };
}
