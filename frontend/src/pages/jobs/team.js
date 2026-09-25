/** Ekip & yetkiler: kullanıcı yönetimi ve rol izin matrisi (yalnızca jt.users.manage) */
import { api, esc, state, avatar, pill, empty, errorBox, loading, sheet, guard, field, options, showToast, ROLE_ICON } from './common.js';
import { confirmDialog } from '../../components/dialog.js';

export async function render(root, ctx) {
  root.innerHTML = loading();
  let users, rolesData;
  try {
    [users, rolesData] = (await Promise.all([api.get('/jt/users'), api.get('/jt/roles')])).map((r) => r.data);
  } catch (e) { root.innerHTML = errorBox(e); return; }
  const { roles, permissions } = rolesData;

  root.innerHTML = `
    <div class="jt-toolbar"><h3 class="jt-title">Kullanıcılar</h3><button class="btn btn-primary jt-add" id="jt-new-user"><i class="ph ph-user-plus"></i> Yeni kullanıcı</button></div>
    <div class="jt-table-wrap"><table class="jt-table">
      <thead><tr><th>Kişi</th><th>Kullanıcı adı</th><th>Rol</th><th>Bölüm</th><th>Durum</th></tr></thead>
      <tbody>${users.map((u) => `<tr data-user="${u.id}" tabindex="0" class="${u.active ? '' : 'off'}">
        <td data-label="Kişi"><span class="jt-person">${avatar(u.name, 30)}<span><b>${esc(u.name)}</b><small>${esc(u.title || '')}</small></span></span></td>
        <td data-label="Kullanıcı adı"><code>${esc(u.username)}</code></td>
        <td data-label="Rol"><span class="jt-role"><i class="ph ${ROLE_ICON[u.role] || 'ph-user'}"></i> ${esc(u.roleLabel || u.role)}</span></td>
        <td data-label="Bölüm">${esc(u.department || '—')}</td>
        <td data-label="Durum">${u.active ? pill('Aktif', 'done') : pill('Pasif', 'cancelled')}</td></tr>`).join('')}</tbody></table></div>

    <div class="jt-toolbar"><h3 class="jt-title">Roller ve yetkiler</h3><small class="muted">Bir rolün yetkilerini değiştirince o roldeki herkes için geçerli olur. Yönetici rolü sabittir.</small></div>
    <div class="jt-table-wrap"><table class="jt-table matrix">
      <thead><tr><th>Yetki</th>${roles.map((r) => `<th class="c"><i class="ph ${ROLE_ICON[r.id] || 'ph-user'}"></i><small>${esc(r.label)}</small></th>`).join('')}</tr></thead>
      <tbody>${permissions.map((p) => `<tr><td>${esc(p.label)}<small><code>${esc(p.id)}</code></small></td>${roles.map((r) => `<td class="c"><input type="checkbox" data-role="${esc(r.id)}" data-perm="${esc(p.id)}" ${r.permissions.includes(p.id) ? 'checked' : ''} ${r.id === 'admin' || p.id === 'jt.view' ? 'disabled' : ''} aria-label="${esc(r.label)}: ${esc(p.label)}" /></td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;

  root.onclick = (e) => {
    if (e.target.closest('#jt-new-user')) return userForm(null, roles, () => render(root, ctx));
    const u = e.target.closest('[data-user]'); if (u) userForm(users.find((x) => String(x.id) === u.dataset.user), roles, () => render(root, ctx));
  };
  root.onkeydown = (e) => { if (e.key === 'Enter') { const u = e.target.closest('[data-user]'); if (u) userForm(users.find((x) => String(x.id) === u.dataset.user), roles, () => render(root, ctx)); } };
  root.onchange = (e) => {
    const cb = e.target.closest('[data-perm]'); if (!cb) return;
    const role = roles.find((r) => r.id === cb.dataset.role);
    const next = new Set(role.permissions);
    if (cb.checked) next.add(cb.dataset.perm); else next.delete(cb.dataset.perm);
    guard(cb, async () => {
      try { await api.put(`/jt/roles/${encodeURIComponent(role.id)}`, { permissions: [...next] }); role.permissions = [...next]; showToast('Yetki güncellendi', 'success'); }
      catch (err) { cb.checked = !cb.checked; throw err; }
    });
  };
}

function userForm(u, roles, onDone) {
  const edit = !!u;
  const s = sheet({ title: edit ? u.name : 'Yeni kullanıcı', body: `
    <form class="jt-form" id="uf">
      <div class="jt-2">
        ${field('Ad soyad', `<input name="name" required maxlength="80" value="${esc(u?.name || '')}" />`)}
        ${field('Kullanıcı adı', `<input name="username" required minlength="3" maxlength="40" pattern="[a-z0-9._-]+" value="${esc(u?.username || '')}" ${edit ? 'disabled' : ''} placeholder="ad.soyad" />`)}
      </div>
      <div class="jt-2">
        ${field('Rol', `<select name="role">${options(roles.map((r) => [r.id, r.label]), u?.role || 'operator')}</select>`)}
        ${field('Bölüm', `<input name="department" maxlength="60" value="${esc(u?.department || '')}" />`)}
      </div>
      <div class="jt-2">
        ${field('Unvan', `<input name="title" maxlength="80" value="${esc(u?.title || '')}" />`)}
        ${field('Telefon', `<input name="phone" maxlength="30" value="${esc(u?.phone || '')}" />`)}
      </div>
      ${field('E-posta', `<input type="email" name="email" maxlength="80" value="${esc(u?.email || '')}" />`)}
      ${edit ? `<label class="jt-toggle"><input type="checkbox" name="active" ${u.active ? 'checked' : ''}/> Hesap aktif</label>` : '<p class="muted small">Kayıttan sonra tek seferlik geçici şifre gösterilir; kullanıcı ilk girişte şifresini değiştirmelidir.</p>'}
      <div class="jt-actions">
        ${edit ? '<button type="button" class="btn btn-secondary" id="uf-reset"><i class="ph ph-key"></i> Şifreyi sıfırla</button>' : ''}
        <button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button>
      </div>
    </form>` });
  s.body.querySelector('[data-close]').onclick = s.close;
  const showPassword = (r, title) => {
    const p = sheet({ title, body: `<div class="jt-secret"><p><b>${esc(r.data.username)}</b> için geçici şifre:</p><code>${esc(r.data.temporaryPassword)}</code><p class="muted small">Bu şifre yalnızca şimdi gösterilir. Kullanıcıya güvenli bir yolla iletin; ilk girişte değiştirmesi istenecek.</p><div class="jt-actions"><button class="btn btn-primary" data-close>Tamam</button></div></div>` });
    p.body.querySelector('[data-close]').onclick = p.close;
  };
  s.body.querySelector('#uf').onsubmit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    if (edit) f.active = e.target.active.checked;
    guard(e.submitter, async () => {
      const r = edit ? await api.put(`/jt/users/${u.id}`, f) : await api.post('/jt/users', f);
      s.close(); onDone?.();
      if (!edit) showPassword(r, 'Kullanıcı oluşturuldu'); else showToast('Kullanıcı güncellendi', 'success');
    });
  };
  const reset = s.body.querySelector('#uf-reset');
  if (reset) reset.onclick = () => guard(reset, async () => {
    const yes = await confirmDialog({ title: 'Şifre sıfırlansın mı?', message: `${u.name} için yeni bir geçici şifre oluşturulacak. Eski şifresi çalışmaz.`, confirmLabel: 'Şifreyi sıfırla', danger: true });
    if (!yes) return;
    const r = await api.post(`/jt/users/${u.id}/reset-password`, {});
    s.close(); showPassword(r, 'Şifre sıfırlandı');
  });
}
