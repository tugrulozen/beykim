/** Ekip & yetkiler: kullanıcı yönetimi ve rol izin matrisi (yalnızca jt.users.manage) */
import { api, esc, state, avatar, pill, empty, errorBox, loading, sheet, guard, field, options, showToast, ROLE_ICON } from './common.js';
import { confirmDialog } from '../../components/dialog.js';

export async function render(root, ctx) {
  root.innerHTML = loading();
  let users, rolesData, unitsData = null;
  try {
    [users, rolesData] = (await Promise.all([api.get('/jt/users'), api.get('/jt/roles')])).map((r) => r.data);
    unitsData = await api.get('/jt/units').then((r) => r.data).catch(() => null); // eski sunucularda birim ucu yok
  } catch (e) { root.innerHTML = errorBox(e); return; }
  const { roles, permissions } = rolesData;
  const custom = !!rolesData.customRoles;
  const units = unitsData?.units || [];
  const refresh = () => render(root, ctx);

  root.innerHTML = `
    <div class="jt-toolbar"><h3 class="jt-title">Kullanıcılar</h3><button class="btn btn-primary jt-add" id="jt-new-user"><i class="ph ph-user-plus"></i> Yeni kullanıcı</button></div>
    <div class="jt-table-wrap"><table class="jt-table">
      <thead><tr><th>Kişi</th><th>Kullanıcı adı</th><th>Rol</th><th>Birim</th><th>Durum</th></tr></thead>
      <tbody>${users.map((u) => `<tr data-user="${u.id}" tabindex="0" class="${u.active ? '' : 'off'}">
        <td data-label="Kişi"><span class="jt-person">${avatar(u.name, 30)}<span><b>${esc(u.name)}</b><small>${esc(u.title || '')}</small></span></span></td>
        <td data-label="Kullanıcı adı"><code>${esc(u.username)}</code></td>
        <td data-label="Rol"><span class="jt-role"><i class="ph ${ROLE_ICON[u.role] || 'ph-user'}"></i> ${esc(u.roleLabel || u.role)}</span></td>
        <td data-label="Birim">${esc(u.department || '—')}</td>
        <td data-label="Durum">${u.active ? pill('Aktif', 'done') : pill('Pasif', 'cancelled')}</td></tr>`).join('')}</tbody></table></div>

    ${unitsData ? unitTree(unitsData) : ''}

    ${custom ? `<div class="jt-toolbar"><h3 class="jt-title">Roller</h3><button class="btn btn-primary jt-add" id="jt-new-role"><i class="ph ph-plus-circle"></i> Yeni rol</button></div>
    <div class="jt-role-cards">${roles.map((r) => `<button type="button" class="jt-role-card" data-role-card="${esc(r.id)}" ${r.id === 'admin' ? 'disabled' : ''}>
      <span class="jt-role-card-head"><i class="ph ${ROLE_ICON[r.id] || 'ph-user-circle-gear'}"></i><b>${esc(r.label)}</b>${r.builtin ? '' : '<span class="jt-role-tag">Özel</span>'}</span>
      <small>${esc(r.description || 'Açıklama yok')}</small>
      <span class="jt-role-card-foot"><i class="ph ph-users"></i> ${r.userCount || 0} kullanıcı · ${r.permissions.length} yetki</span></button>`).join('')}</div>` : ''}

    <div class="jt-toolbar"><h3 class="jt-title">Roller ve yetkiler</h3><small class="muted">Bir rolün yetkilerini değiştirince o roldeki herkes için geçerli olur. Yönetici rolü sabittir.</small></div>
    <div class="jt-table-wrap"><table class="jt-table matrix">
      <thead><tr><th>Yetki</th>${roles.map((r) => `<th class="c"><i class="ph ${ROLE_ICON[r.id] || 'ph-user'}"></i><small>${esc(r.label)}</small></th>`).join('')}</tr></thead>
      <tbody>${permissions.map((p) => `<tr><td>${esc(p.label)}<small><code>${esc(p.id)}</code></small></td>${roles.map((r) => `<td class="c"><input type="checkbox" data-role="${esc(r.id)}" data-perm="${esc(p.id)}" ${r.permissions.includes(p.id) ? 'checked' : ''} ${r.id === 'admin' || p.id === 'jt.view' ? 'disabled' : ''} aria-label="${esc(r.label)}: ${esc(p.label)}" /></td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;

  root.onclick = (e) => {
    if (e.target.closest('#jt-new-user')) return userForm(null, roles, units, refresh);
    if (e.target.closest('#jt-new-role')) return roleForm(null, permissions, refresh);
    if (e.target.closest('#jt-new-unit')) return unitForm(null, units, users, refresh);
    const rc = e.target.closest('[data-role-card]'); if (rc) return roleForm(roles.find((r) => r.id === rc.dataset.roleCard), permissions, refresh);
    const un = e.target.closest('[data-unit]'); if (un) return unitForm(units.find((x) => x.id === un.dataset.unit), units, users, refresh);
    const u = e.target.closest('[data-user]'); if (u) userForm(users.find((x) => String(x.id) === u.dataset.user), roles, units, refresh);
  };
  root.onkeydown = (e) => { if (e.key === 'Enter') { const u = e.target.closest('[data-user]'); if (u) userForm(users.find((x) => String(x.id) === u.dataset.user), roles, units, refresh); } };
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

/** Birim ağacı: üst birimden alt birimlere girintili liste; her birimde yönetici ve üyeler */
function unitTree({ units, unassigned }) {
  const kids = (pid) => units.filter((u) => (u.parentId || null) === pid);
  const ids = new Set(units.map((u) => u.id));
  const roots = units.filter((u) => !u.parentId || !ids.has(u.parentId));
  const node = (u, depth) => `<li class="jt-unit" style="--depth:${depth}">
    <button type="button" class="jt-unit-row" data-unit="${esc(u.id)}">
      <i class="ph ${depth ? 'ph-arrow-elbow-down-right' : 'ph-buildings'}"></i>
      <span class="jt-unit-main"><b>${esc(u.name)}</b><small>${u.managerName ? `Yönetici: ${esc(u.managerName)}` : 'Yönetici atanmadı'}${u.description ? ` · ${esc(u.description)}` : ''}</small></span>
      <span class="jt-unit-count" title="Üye sayısı"><i class="ph ph-users"></i> ${u.members.length}</span>
    </button>
    ${u.members.length ? `<div class="jt-unit-members">${u.members.map((m) => `<span class="jt-unit-member">${avatar(m.name, 22)}<span>${esc(m.name)}<small>${esc(m.title || m.roleLabel || '')}</small></span></span>`).join('')}</div>` : ''}
    ${kids(u.id).length ? `<ul>${kids(u.id).map((k) => node(k, depth + 1)).join('')}</ul>` : ''}
  </li>`;
  return `<div class="jt-toolbar"><h3 class="jt-title">Birimler ve hiyerarşi</h3><button class="btn btn-primary jt-add" id="jt-new-unit"><i class="ph ph-tree-structure"></i> Yeni birim</button></div>
    <ul class="jt-unit-tree">${roots.map((u) => node(u, 0)).join('')}</ul>
    ${unassigned.length ? `<p class="muted small jt-unit-note"><i class="ph ph-info"></i> Birime atanmamış: ${unassigned.map((m) => esc(m.name)).join(', ')}</p>` : ''}`;
}

function unitForm(unit, units, users, onDone) {
  const edit = !!unit;
  // döngüye yol açmasın: birim kendisine veya alt birimlerine bağlanamaz
  const blocked = new Set();
  if (edit) { const walk = (id) => { blocked.add(id); units.filter((x) => x.parentId === id).forEach((x) => walk(x.id)); }; walk(unit.id); }
  const s = sheet({ title: edit ? unit.name : 'Yeni birim', body: `
    <form class="jt-form" id="unf">
      ${field('Birim adı', `<input name="name" required minlength="2" maxlength="60" value="${esc(unit?.name || '')}" />`)}
      <div class="jt-2">
        ${field('Üst birim', `<select name="parentId"><option value="">— En üst birim —</option>${options(units.filter((x) => !blocked.has(x.id)).map((x) => [x.id, x.name]), unit?.parentId || '')}</select>`)}
        ${field('Birim yöneticisi', `<select name="managerId"><option value="">— Seçilmedi —</option>${options(users.filter((x) => x.active).map((x) => [String(x.id), x.name]), unit?.managerId ? String(unit.managerId) : '')}</select>`)}
      </div>
      ${field('Açıklama', `<input name="description" maxlength="200" value="${esc(unit?.description || '')}" />`)}
      ${edit && unit.members.length ? `<p class="muted small">Bu birimde ${unit.members.length} kullanıcı var. Adı değiştirirseniz kullanıcıların bölümü de güncellenir.</p>` : ''}
      <div class="jt-actions">
        ${edit ? '<button type="button" class="btn btn-secondary" id="unf-del"><i class="ph ph-trash"></i> Sil</button>' : ''}
        <button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button>
      </div>
    </form>` });
  s.body.querySelector('[data-close]').onclick = s.close;
  s.body.querySelector('#unf').onsubmit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    guard(e.submitter, async () => {
      if (edit) await api.put(`/jt/units/${encodeURIComponent(unit.id)}`, f); else await api.post('/jt/units', f);
      s.close(); showToast(edit ? 'Birim güncellendi' : 'Birim oluşturuldu', 'success'); onDone?.();
    });
  };
  const del = s.body.querySelector('#unf-del');
  if (del) del.onclick = () => guard(del, async () => {
    const yes = await confirmDialog({ title: 'Birim silinsin mi?', message: `${unit.name} birimi silinecek.`, confirmLabel: 'Sil', danger: true });
    if (!yes) return;
    await api.delete(`/jt/units/${encodeURIComponent(unit.id)}`);
    s.close(); showToast('Birim silindi', 'success'); onDone?.();
  });
}

/** Rol oluştur / düzenle: ad, açıklama ve yetkiler serbestçe belirlenir */
function roleForm(role, permissions, onDone) {
  const edit = !!role;
  const has = new Set(role?.permissions || ['jt.view', 'erp.read']);
  const s = sheet({ title: edit ? role.label : 'Yeni rol', body: `
    <form class="jt-form" id="rf">
      ${field('Rol adı', `<input name="label" required minlength="2" maxlength="60" value="${esc(role?.label || '')}" placeholder="ör. Liman Temsilcisi" />`)}
      ${field('Açıklama', `<input name="description" maxlength="200" value="${esc(role?.description || '')}" placeholder="Bu rol ne iş yapar?" />`)}
      <fieldset class="jt-perm-list"><legend>Yetkiler</legend>
        ${permissions.map((p) => `<label class="jt-toggle"><input type="checkbox" name="perm" value="${esc(p.id)}" ${has.has(p.id) ? 'checked' : ''} ${p.id === 'jt.view' ? 'disabled' : ''}/> ${esc(p.label)}</label>`).join('')}
      </fieldset>
      <div class="jt-actions">
        ${edit ? `<button type="button" class="btn btn-secondary" id="rf-del" ${role.userCount ? `title="Bu rolde ${role.userCount} kullanıcı var"` : ''}><i class="ph ph-trash"></i> Sil</button>` : ''}
        <button type="button" class="btn btn-secondary" data-close>Vazgeç</button><button class="btn btn-primary" type="submit">Kaydet</button>
      </div>
    </form>` });
  s.body.querySelector('[data-close]').onclick = s.close;
  s.body.querySelector('#rf').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = { label: fd.get('label'), description: fd.get('description'), permissions: ['jt.view', ...fd.getAll('perm')] };
    guard(e.submitter, async () => {
      if (edit) await api.put(`/jt/roles/${encodeURIComponent(role.id)}`, body); else await api.post('/jt/roles', body);
      s.close(); showToast(edit ? 'Rol güncellendi' : 'Rol oluşturuldu', 'success'); onDone?.();
    });
  };
  const del = s.body.querySelector('#rf-del');
  if (del) del.onclick = () => guard(del, async () => {
    const yes = await confirmDialog({ title: 'Rol silinsin mi?', message: `${role.label} rolü silinecek.`, confirmLabel: 'Sil', danger: true });
    if (!yes) return;
    await api.delete(`/jt/roles/${encodeURIComponent(role.id)}`);
    s.close(); showToast('Rol silindi', 'success'); onDone?.();
  });
}

function userForm(u, roles, units, onDone) {
  const edit = !!u;
  const s = sheet({ title: edit ? u.name : 'Yeni kullanıcı', body: `
    <form class="jt-form" id="uf">
      <div class="jt-2">
        ${field('Ad soyad', `<input name="name" required maxlength="80" value="${esc(u?.name || '')}" />`)}
        ${field('Kullanıcı adı', `<input name="username" required minlength="3" maxlength="40" pattern="[a-z0-9._-]+" value="${esc(u?.username || '')}" ${edit ? 'disabled' : ''} placeholder="ad.soyad" />`)}
      </div>
      <div class="jt-2">
        ${field('Rol', `<select name="role">${options(roles.map((r) => [r.id, r.label]), u?.role || 'operator')}</select>`)}
        ${units.length
    ? field('Birim', `<select name="department"><option value="">— Seçilmedi —</option>${options([...units.map((x) => [x.name, x.name]), ...(u?.department && !units.some((x) => x.name === u.department) ? [[u.department, u.department]] : [])], u?.department || '')}</select>`)
    : field('Bölüm', `<input name="department" maxlength="60" value="${esc(u?.department || '')}" />`)}
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
