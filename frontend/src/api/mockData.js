/**
 * DEPO TAKİP - Mock Data
 * Tüm modüller için gerçekçi Türkçe test verileri
 */

// ---- Kullanıcılar ----
export const users = [
  { id: 1, username: 'admin', password: '1234', name: 'Buhara Karataştan', role: 'admin', branch: '101', branchName: '(MESIHPASA)NURVAR' },
  { id: 2, username: 'depocu', password: '1234', name: 'Mehmet Kaya', role: 'warehouse', branch: '102', branchName: '(AGAYOKUSU)NURVAR' },
  { id: 3, username: 'satici', password: '1234', name: 'Fatma Demir', role: 'sales', branch: '101', branchName: '(MESIHPASA)NURVAR' },
];

// ---- Şubeler ----
export const branches = [
  { id: '101', name: '(MESIHPASA)NURVAR', code: '101' },
  { id: '102', name: '(AGAYOKUSU)NURVAR', code: '102' },
  { id: '103', name: 'KESTEL ŞUBE', code: '103' },
];

// ---- Depolar ----
export const warehouses = [
  { id: '1014', name: 'Ana Depo', code: '1014', branchId: '101' },
  { id: '1017', name: 'TAŞÇI HAKAN DEPO', code: '1017', branchId: '101' },
  { id: '1020', name: 'Ana Depo', code: '1020', branchId: '102' },
  { id: '1021', name: 'Yedek Depo', code: '1021', branchId: '102' },
  { id: '1030', name: 'Kestel Depo', code: '1030', branchId: '103' },
];

export const mockItems = [
  { id: 'ITM001', code: 'PRD-KS-001', name: 'Çikolata Sosu 5kg', barcode: '869000000001', unit: 'Kova', stock: 150, price: 450, category: 'Pastacılık Katkı' },
  { id: 'ITM002', code: 'PRD-KS-002', name: 'Krem Şanti 10kg', barcode: '869000000002', unit: 'Kutu', stock: 85, price: 620, category: 'Pastacılık Katkı' },
  { id: 'ITM003', code: 'PRD-KS-003', name: 'Madlen Çikolata Kutu', barcode: '869000000003', unit: 'Kutu', stock: 320, price: 210, category: 'Çikolata' },
  { id: 'ITM004', code: 'PRD-KS-004', name: 'Karamel Şurubu 1L', barcode: '869000000004', unit: 'Şişe', stock: 240, price: 180, category: 'Şurup' },
  { id: 'ITM005', code: 'PRD-KS-005', name: 'Vanilya Ekstraktı', barcode: '869000000005', unit: 'Adet', stock: 50, price: 340, category: 'Aroma' },
];

export const mockRawMaterials = [
  { id: 'RM001', code: 'RAW-KAKAO', name: 'Toz Kakao', unit: 'Kg', stock: 2500, minStock: 500 },
  { id: 'RM002', code: 'RAW-SEKER', name: 'Toz Şeker', unit: 'Kg', stock: 5000, minStock: 1000 },
  { id: 'RM003', code: 'RAW-SUT', name: 'Süt Tozu', unit: 'Kg', stock: 1200, minStock: 300 },
  { id: 'RM004', code: 'RAW-AROMA', name: 'Karamel Aroması', unit: 'Litre', stock: 150, minStock: 50 },
  { id: 'RM005', code: 'RAW-AMBALAJ', name: '5kg Kova Ambalaj', unit: 'Adet', stock: 800, minStock: 200 }
];

export const mockRecipes = [
  {
    productId: 'ITM001', // Çikolata Sosu 5kg
    name: 'Çikolata Sosu Reçetesi',
    materials: [
      { rawMaterialId: 'RM001', quantity: 1.5 }, // 1.5 kg Kakao
      { rawMaterialId: 'RM002', quantity: 2.0 }, // 2.0 kg Şeker
      { rawMaterialId: 'RM003', quantity: 1.0 }, // 1.0 kg Süt tozu
      { rawMaterialId: 'RM005', quantity: 1.0 }  // 1 Kova ambalaj
    ]
  },
  {
    productId: 'ITM004', // Karamel Şurubu 1L
    name: 'Karamel Şurubu Reçetesi',
    materials: [
      { rawMaterialId: 'RM002', quantity: 0.5 }, // 0.5 kg Şeker
      { rawMaterialId: 'RM004', quantity: 0.1 }  // 0.1 L Aroma
    ]
  }
];

// ---- Stok Kartları ----
export const stocks = [
  {
    id: 'jn1016',
    code: 'JN1016/01/012/D/295F102/AK',
    name: 'PERDELİK TÜL KUMAŞ',
    desen: 'JN1016',
    zemin: '01',
    varyant: '012',
    en: 295,
    enUnit: 'cm',
    netWeight: 222.7,
    brutWeight: 522.7,
    unit: 'METER',
    collection: 'PLAIN KOLEKSİYON',
    prices: {
      MT: { usd: 7.20, eur: 6.20, try: 325.00, profitRate: 30.0 },
      MP: { usd: 8.50, eur: 7.30, try: 385.00, profitRate: 35.0 },
      IT: { usd: 6.00, eur: 5.10, try: 270.00, profitRate: 25.0 },
      CT: { usd: 9.00, eur: 7.80, try: 410.00, profitRate: 40.0 },
    },
    hasSerial: true,
  },
  {
    id: 'fa1827',
    code: 'FA1827/33/017/D/280F80/BJ',
    name: 'DÖŞEMELIK KUMAŞ',
    desen: 'FA1827',
    zemin: '33',
    varyant: '017',
    en: 280,
    enUnit: 'cm',
    netWeight: 180.5,
    brutWeight: 410.0,
    unit: 'METER',
    collection: 'PREMIUM KOLEKSİYON',
    prices: {
      MT: { usd: 12.50, eur: 10.80, try: 565.00, profitRate: 28.0 },
      MP: { usd: 14.00, eur: 12.10, try: 635.00, profitRate: 32.0 },
      IT: { usd: 10.00, eur: 8.60, try: 450.00, profitRate: 22.0 },
      CT: { usd: 15.50, eur: 13.40, try: 700.00, profitRate: 38.0 },
    },
    hasSerial: true,
  },
  {
    id: 'mb2045',
    code: 'MB2045/05/003/D/310F120/WH',
    name: 'FONFON PERDE',
    desen: 'MB2045',
    zemin: '05',
    varyant: '003',
    en: 310,
    enUnit: 'cm',
    netWeight: 150.2,
    brutWeight: 340.0,
    unit: 'METER',
    collection: 'BASIC KOLEKSİYON',
    prices: {
      MT: { usd: 5.80, eur: 5.00, try: 262.00, profitRate: 25.0 },
      MP: { usd: 6.90, eur: 5.95, try: 312.00, profitRate: 30.0 },
      IT: { usd: 4.80, eur: 4.15, try: 218.00, profitRate: 20.0 },
      CT: { usd: 7.50, eur: 6.45, try: 340.00, profitRate: 35.0 },
    },
    hasSerial: true,
  },
];

// ---- Seri Numaraları ----
export const serials = [
  {
    serialNo: 'N19000041841',
    stockId: 'jn1016',
    stockCode: 'JN1016/01/012/D/295F102/AK',
    stockName: 'PERDELİK TÜL KUMAŞ',
    quantity: 16.5,
    cell: '1014M3/01/02',
    warehouseId: '1014',
    warehouseName: 'Ana Depo',
    branchId: '101',
    branchName: '(MESIHPASA)NURVAR',
    collection: 'PLAIN KOLEKSİYON',
    oldDesen: 'JN1047/017/017 BEYAZ',
    prices: {
      MT: { usd: 6.8, eur: 5.9, try: 310.2, profitRate: 30.0 },
      MP: { usd: 8.1, eur: 7.0, try: 368.0, profitRate: 35.0 },
      IT: { usd: 5.7, eur: 4.9, try: 258.0, profitRate: 25.0 },
    },
  },
  {
    serialNo: 'N19000041842',
    stockId: 'jn1016',
    stockCode: 'JN1016/01/012/D/295F102/AK',
    stockName: 'PERDELİK TÜL KUMAŞ',
    quantity: 10.7,
    cell: '1014M3/01/03',
    warehouseId: '1014',
    warehouseName: 'Ana Depo',
    branchId: '101',
    branchName: '(MESIHPASA)NURVAR',
    collection: 'PLAIN KOLEKSİYON',
    oldDesen: 'JN1047/017/017 BEYAZ',
    prices: {
      MT: { usd: 6.8, eur: 5.9, try: 310.2, profitRate: 30.0 },
      MP: { usd: 8.1, eur: 7.0, try: 368.0, profitRate: 35.0 },
      IT: { usd: 5.7, eur: 4.9, try: 258.0, profitRate: 25.0 },
    },
  },
  { serialNo: 'N19000044948', stockId: 'jn1016', stockCode: 'JN1016/01/012/D/295F102/AK', stockName: 'PERDELİK TÜL KUMAŞ', quantity: 24.0, cell: '1014M3/02/01', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PLAIN KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 6.8, eur: 5.9, try: 310.2, profitRate: 30.0 }, MP: { usd: 8.1, eur: 7.0, try: 368.0, profitRate: 35.0 }, IT: { usd: 5.7, eur: 4.9, try: 258.0, profitRate: 25.0 } } },
  { serialNo: 'N19000044952', stockId: 'jn1016', stockCode: 'JN1016/01/012/D/295F102/AK', stockName: 'PERDELİK TÜL KUMAŞ', quantity: 10.3, cell: '1014M3/02/02', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PLAIN KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 6.8, eur: 5.9, try: 310.2, profitRate: 30.0 }, MP: { usd: 8.1, eur: 7.0, try: 368.0, profitRate: 35.0 }, IT: { usd: 5.7, eur: 4.9, try: 258.0, profitRate: 25.0 } } },
  { serialNo: 'N19000044953', stockId: 'jn1016', stockCode: 'JN1016/01/012/D/295F102/AK', stockName: 'PERDELİK TÜL KUMAŞ', quantity: 17.5, cell: '1014M4/01/01', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PLAIN KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 6.8, eur: 5.9, try: 310.2, profitRate: 30.0 }, MP: { usd: 8.1, eur: 7.0, try: 368.0, profitRate: 35.0 }, IT: { usd: 5.7, eur: 4.9, try: 258.0, profitRate: 25.0 } } },
  { serialNo: 'N19000044954', stockId: 'jn1016', stockCode: 'JN1016/01/012/D/295F102/AK', stockName: 'PERDELİK TÜL KUMAŞ', quantity: 11.2, cell: '1014M4/01/02', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PLAIN KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 6.8, eur: 5.9, try: 310.2, profitRate: 30.0 }, MP: { usd: 8.1, eur: 7.0, try: 368.0, profitRate: 35.0 }, IT: { usd: 5.7, eur: 4.9, try: 258.0, profitRate: 25.0 } } },
  { serialNo: 'N19000044955', stockId: 'jn1016', stockCode: 'JN1016/01/012/D/295F102/AK', stockName: 'PERDELİK TÜL KUMAŞ', quantity: 17.5, cell: '1014M4/01/03', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PLAIN KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 6.8, eur: 5.9, try: 310.2, profitRate: 30.0 }, MP: { usd: 8.1, eur: 7.0, try: 368.0, profitRate: 35.0 }, IT: { usd: 5.7, eur: 4.9, try: 258.0, profitRate: 25.0 } } },
  // FA1827 seriler
  { serialNo: 'H022400004087', stockId: 'fa1827', stockCode: 'FA1827/33/017/D/280F80/BJ', stockName: 'DÖŞEMELIK KUMAŞ', quantity: 19.5, cell: '1014M5/01/01', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PREMIUM KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 12.5, eur: 10.8, try: 565.0, profitRate: 28.0 }, MP: { usd: 14.0, eur: 12.1, try: 635.0, profitRate: 32.0 }, IT: { usd: 10.0, eur: 8.6, try: 450.0, profitRate: 22.0 } } },
  { serialNo: 'NT0525031616', stockId: 'fa1827', stockCode: 'FA1827/33/017/D/280F80/BJ', stockName: 'DÖŞEMELIK KUMAŞ', quantity: 14.0, cell: '1014M5/01/02', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PREMIUM KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 12.5, eur: 10.8, try: 565.0, profitRate: 28.0 }, MP: { usd: 14.0, eur: 12.1, try: 635.0, profitRate: 32.0 }, IT: { usd: 10.0, eur: 8.6, try: 450.0, profitRate: 22.0 } } },
  { serialNo: 'NT0826032796', stockId: 'fa1827', stockCode: 'FA1827/33/017/D/280F80/BJ', stockName: 'DÖŞEMELIK KUMAŞ', quantity: 35.0, cell: '1014M5/02/01', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PREMIUM KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 12.5, eur: 10.8, try: 565.0, profitRate: 28.0 }, MP: { usd: 14.0, eur: 12.1, try: 635.0, profitRate: 32.0 }, IT: { usd: 10.0, eur: 8.6, try: 450.0, profitRate: 22.0 } } },
  { serialNo: 'NT0826032690', stockId: 'fa1827', stockCode: 'FA1827/33/017/D/280F80/BJ', stockName: 'DÖŞEMELIK KUMAŞ', quantity: 35.0, cell: '1014M5/02/02', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PREMIUM KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 12.5, eur: 10.8, try: 565.0, profitRate: 28.0 }, MP: { usd: 14.0, eur: 12.1, try: 635.0, profitRate: 32.0 }, IT: { usd: 10.0, eur: 8.6, try: 450.0, profitRate: 22.0 } } },
  { serialNo: 'NT0924022375', stockId: 'fa1827', stockCode: 'FA1827/33/017/D/280F80/BJ', stockName: 'DÖŞEMELIK KUMAŞ', quantity: 32.0, cell: '1014M5/03/01', warehouseId: '1014', warehouseName: 'Ana Depo', branchId: '101', branchName: '(MESIHPASA)NURVAR', collection: 'PREMIUM KOLEKSİYON', oldDesen: '-', prices: { MT: { usd: 12.5, eur: 10.8, try: 565.0, profitRate: 28.0 }, MP: { usd: 14.0, eur: 12.1, try: 635.0, profitRate: 32.0 }, IT: { usd: 10.0, eur: 8.6, try: 450.0, profitRate: 22.0 } } },
];

// ---- Müşteriler ----
export const customers = [
  { id: 1, name: 'ABC Tekstil Ltd.', code: 'C001', balance: { usd: 15240.50, eur: 12800.00, try: 685000.00 } },
  { id: 2, name: 'XYZ Mobilya A.Ş.', code: 'C002', balance: { usd: 8750.00, eur: 7200.00, try: 395000.00 } },
  { id: 3, name: 'Güneş Perde San.', code: 'C003', balance: { usd: 22100.00, eur: 18500.00, try: 998000.00 } },
  { id: 4, name: 'Yıldız Home Tekstil', code: 'C004', balance: { usd: 3400.00, eur: 2900.00, try: 153000.00 } },
];

// ---- Kasalar ----
export const cashRegisters = [
  { name: 'Mesihpaşa Usd Kasa', balance: 142210.99, currency: 'USD' },
  { name: 'MESİHPAŞA KİRA GETİRİSİ', balance: 104256.00, currency: 'USD' },
  { name: 'Kestel USD Kasa', balance: 0.00, currency: 'USD' },
  { name: 'Mesihpaşa Euro Kasa', balance: 85430.50, currency: 'EUR' },
  { name: 'Mesihpaşa TL Kasa', balance: 2150000.00, currency: 'TRY' },
];

// ---- CoPilot Yanıtları ----
export const copilotResponses = {
  'merhaba': 'Merhaba! Size nasıl yardımcı olabilirim?',
  'default': 'Bu konuda size yardımcı olmak isterdim. Lütfen stok, seri, kasa bakiye gibi konularda soru sorunuz.',
};
