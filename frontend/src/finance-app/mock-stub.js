/** Bağımsız finans derlemesinde WMS demo verisi (mockApi) pakete girmez; uygulama yalnız gerçek backend ile çalışır */
export function mockApiHandler() {
  return Promise.reject(new Error('Sunucu adresi tanımlı değil (tenant.json → api.erpApiUrl).'));
}
