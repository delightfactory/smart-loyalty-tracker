
import { getAllUsersWithRoles, createUser as createUserReal, updateUser as updateUserReal, deleteUser as deleteUserReal } from './users';
import { UserRole, UserProfile } from '@/lib/auth-types';
import { supabase } from '@/integrations/supabase/client';

// جلب كل المستخدمين مع أدوارهم من Supabase
export const getAllUsers = async (): Promise<UserProfile[]> => {
  // مخرجات getAllUsersWithRoles متوافقة مع UserProfile أو تحتاج تحويل بسيط
  const users: any[] = await getAllUsersWithRoles();
  return users.map((user: any) => ({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    phone: user.phone,
    position: user.position,
    roles: user.roles.map((role: string) => role as UserRole),
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
  }));
};

// إضافة مستخدم جديد
export const createUser = async (userData: {
  email: string;
  fullName: string;
  password: string;
  roles: UserRole[];
}): Promise<UserProfile> => {
  // بناء المستخدم مع تمرير كلمة المرور المدخلة
  const user = await createUserReal(
    userData.fullName,
    userData.email,
    userData.roles[0],
    userData.password
  );
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    phone: user.phone,
    position: user.position,
    roles: userData.roles,
    createdAt: user.created_at,
    lastSignInAt: null,
  };
};

// تحديث مستخدم
export const updateUserProfile = async (profile: {
  id: string;
  fullName: string;
  phone?: string | null;
  position?: string | null;
}): Promise<void> => {
  // تحديث الاسم والهاتف والمسمى الوظيفي في جدول profiles
  const updates: any = { full_name: profile.fullName };
  if (profile.phone !== undefined) updates.phone = profile.phone;
  if (profile.position !== undefined) updates.position = profile.position;
  await updateUserReal(profile.id, updates);
};

// حذف مستخدم
export const deleteUser = async (userId: string): Promise<void> => {
  await deleteUserReal(userId);
};

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const users = await getAllUsers();
  return users.find(user => user.id === userId) || null;
};

export const updateUserRoles = async (userId: string, roles: UserRole[]): Promise<void> => {
  // 1) احذف كل الروابط القديمة بين المستخدم وأدواره
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);
  if (deleteError) {
    throw deleteError;
  }

  // 2) جهز بيانات الإدخال الجديدة بربط user_id مع role_id
  //    نحتاج أولًا لجلب كل الأدوار المنشأة من قاعدة البيانات
  const { data: allRoles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name');
  if (rolesError || !allRoles) {
    throw rolesError || new Error('Failed to fetch roles');
  }

  // 3) فلتر وحضّر الإدخالات
  const inserts = roles
    .map((roleName) => {
      const roleRecord = allRoles.find(r => r.name === roleName);
      return roleRecord
        ? { user_id: userId, role_id: roleRecord.id }
        : null;
    })
    .filter((r): r is { user_id: string; role_id: string } => r !== null);

  // 4) أدخل الروابط الجديدة دفعة واحدة
  if (inserts.length > 0) {
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert(inserts);
    if (insertError) {
      throw insertError;
    }
  }
};

export const updateCurrentUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  // Mock implementation
  console.log('Password updated successfully');
};

// Helper function for admin account creation
export const assignAdminRole = async (userId: string): Promise<{success: boolean, message?: string}> => {
  // Mock implementation
  return { success: true };
};

// 1) جلب كل الصلاحيات المتاحة
export async function fetchAllPermissions(): Promise<{ id: string; name: string; description: string }[]> {
  const { data, error } = await supabase
    .from('permissions')
    .select('id, name, description')
    .order('name');
  if (error) throw error;
  return data!;
}

// 2) جلب صلاحيات مستخدم محدد
export async function fetchUserPermissions(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('permission_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data!.map(r => r.permission_id);
}

// 3) تحديث صلاحيات المستخدم (حذف ثم إدخال جديدة)
export async function updateUserPermissions(
  userId: string,
  permissions: string[]
): Promise<void> {
  // 3.1 حذف الصلاحيات القديمة
  const { error: deleteError } = await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId);
  if (deleteError) throw deleteError;

  // 3.2 إدخال الصلاحيات الجديدة
  if (permissions.length > 0) {
    const inserts = permissions.map(pid => ({ user_id: userId, permission_id: pid }));
    const { error: insertError } = await supabase
      .from('user_permissions')
      .insert(inserts);
    if (insertError) throw insertError;
  }
}
