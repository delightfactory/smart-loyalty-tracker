// خدمات إدارة الأدوار والصلاحيات بشكل ديناميكي من قاعدة البيانات
import { supabase } from '@/integrations/supabase/client';

// ----------- Roles -----------
export async function getAllRoles() {
  const { data, error } = await supabase.from('roles').select('*');
  if (error) throw error;
  return data;
}

export async function createRole(name: string, description?: string) {
  const { data, error } = await supabase.from('roles').insert([{ name, description }]).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateRole(id: string, updates: { name?: string; description?: string }) {
  const { data, error } = await supabase.from('roles').update(updates).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteRole(id: string) {
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) throw error;
}

// ----------- Permissions -----------
export async function getAllPermissions() {
  const { data, error } = await supabase.from('permissions').select('*');
  if (error) throw error;
  return data;
}

export async function createPermission(name: string, description?: string) {
  const { data, error } = await supabase.from('permissions').insert([{ name, description }]).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function updatePermission(id: string, updates: { name?: string; description?: string }) {
  const { data, error } = await supabase.from('permissions').update(updates).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function deletePermission(id: string) {
  const { error } = await supabase.from('permissions').delete().eq('id', id);
  if (error) throw error;
}

// ----------- Role-Permissions Linking -----------
export async function getPermissionsForRole(roleId: string) {
  // جلب جميع الصلاحيات المرتبطة بدور معين
  const { data, error } = await supabase
    .from('role_permissions')
    .select('permission_id, permissions(name, description)')
    .eq('role_id', roleId);
  if (error) throw error;
  return data.map((rp: any) => rp.permissions);
}

export async function setPermissionsForRole(roleId: string, permissionIds: string[]) {
  // حذف الصلاحيات القديمة
  await supabase.from('role_permissions').delete().eq('role_id', roleId);
  // إضافة الصلاحيات الجديدة
  const inserts = permissionIds.map(pid => ({ role_id: roleId, permission_id: pid }));
  if (inserts.length) {
    const { error } = await supabase.from('role_permissions').insert(inserts);
    if (error) throw error;
  }
}

// ----------- User-Permissions (Overrides) -----------
export async function getPermissionsForUser(userId: string) {
  // جلب جميع الصلاحيات المباشرة للمستخدم
  const { data, error } = await supabase
    .from('user_permissions')
    .select('permission_id, permissions(name, description)')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map((up: any) => up.permissions);
}

export async function setPermissionsForUser(userId: string, permissionIds: string[]) {
  // حذف الصلاحيات الفردية القديمة
  await supabase.from('user_permissions').delete().eq('user_id', userId);
  // إضافة الصلاحيات الجديدة
  const inserts = permissionIds.map(pid => ({ user_id: userId, permission_id: pid }));
  if (inserts.length) {
    const { error } = await supabase.from('user_permissions').insert(inserts);
    if (error) throw error;
  }
}

// ----------- User-Roles Linking -----------
export async function getRolesForUser(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_id, roles(name, description)')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map((ur: any) => ur.roles);
}

export async function setRolesForUser(userId: string, roleIds: string[]) {
  // حذف الأدوار القديمة
  await supabase.from('user_roles').delete().eq('user_id', userId);
  // إضافة الأدوار الجديدة
  const inserts = roleIds.map(rid => ({ user_id: userId, role_id: rid }));
  if (inserts.length) {
    const { error } = await supabase.from('user_roles').insert(inserts);
    if (error) throw error;
  }
}
