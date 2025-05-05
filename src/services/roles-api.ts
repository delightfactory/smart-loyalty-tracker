import { supabase } from '@/integrations/supabase/client';

export type Role = { id: string; name: string; description?: string; };
export type Permission = { id: string; name: string; description?: string; };

// 1. جلب كل الأدوار
export async function fetchAllRoles(): Promise<Role[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('id, name, description')
    .order('name');
  if (error) throw error;
  return data!;
}

// 2. جلب صلاحيات دور محدد
export async function fetchRolePermissions(roleId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('permission_id')
    .eq('role_id', roleId);
  if (error) throw error;
  return data!.map(r => r.permission_id);
}

// 3. تحديث صلاحيات دور (حذف ثم إدخال جديدة)
export async function updateRolePermissions(roleId: string, perms: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);
  if (deleteError) throw deleteError;

  if (perms.length > 0) {
    const inserts = perms.map(pid => ({ role_id: roleId, permission_id: pid }));
    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(inserts);
    if (insertError) throw insertError;
  }
}

// 4. جلب كل الصلاحيات المتاحة
export async function fetchAllPermissions(): Promise<Permission[]> {
  const { data, error } = await supabase
    .from('permissions')
    .select('id, name, description')
    .order('name');
  if (error) throw error;
  return data!;
}

// 5. إنشاء دور جديد
export async function createRole(params: { name: string; description?: string; }): Promise<void> {
  const { error } = await supabase
    .from('roles')
    .insert([{ name: params.name, description: params.description }]);
  if (error) throw error;
}

// 6. تعديل دور
export async function updateRole(roleId: string, updates: { name?: string; description?: string; }): Promise<void> {
  const { error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', roleId);
  if (error) throw error;
}

// 7. حذف دور
export async function deleteRole(roleId: string): Promise<void> {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId);
  if (error) throw error;
}
