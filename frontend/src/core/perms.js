/**
 * Modül görünürlüğü: bazı modüller yalnızca ilgili izne sahip kullanıcılara gösterilir.
 * Asıl yetki denetimi backend'dedir; bu yalnızca yetkisiz kullanıcının boş/hatalı ekranı görmesini önler.
 * İzin listesi girişte gelir (user.permissions). Liste yoksa (eski oturum) modül gizlenmez.
 */
import AppConfig from './config.js';

const NEED = { finance: 'fin.view' };

export function moduleAllowed(key) {
  const need = NEED[key];
  if (!need) return true;
  try {
    const u = JSON.parse(localStorage.getItem(AppConfig.storageKeys.user) || 'null');
    if (!u || !Array.isArray(u.permissions)) return true;
    return u.role === 'admin' || u.permissions.includes(need);
  } catch (_e) { return true; }
}
