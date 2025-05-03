import { getAllUsersWithRoles, createUser as createUserReal, updateUser as updateUserReal, deleteUser as deleteUserReal } from './users';
import { setPermissionsForUser, setRolesForUser } from './roles-permissions-api';
import { UserRole, UserProfile } from '@/lib/auth-types';

// جلب كل المستخدمين مع أدوارهم من Supabase
export const getAllUsers = async (): Promise<UserProfile[]> => {
  // مخرجات getAllUsersWithRoles متوافقة مع UserProfile أو تحتاج تحويل بسيط
  const users = await getAllUsersWithRoles();
  return users.map((user: any) => ({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    phone: user.phone,
    position: user.position,
    roles: user.roles ? user.roles.map((role: string) => role as UserRole) : [],
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
    customPermissions: user.custom_permissions || [],
  }));
};

// إضافة مستخدم جديد
export const createUser = async (userData: {
  email: string;
  fullName: string;
  roles: UserRole[];
}): Promise<UserProfile> => {
  // نستخدم أول دور فقط (يمكنك توسيعها لاحقًا لدعم تعدد الأدوار)
  const user = await createUserReal(userData.fullName, userData.email, userData.roles[0]);
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
    customPermissions: [],
  };
};

// تحديث مستخدم شاملاً تحديث الأدوار والصلاحيات الفردية
export const updateUserProfile = async (profile: {
  id: string;
  fullName: string;
  email: string;
  roles: UserRole[];
  customPermissions?: string[];
  phone?: string | null;
  position?: string | null;
}): Promise<UserProfile> => {
  // إعداد كائن التحديث فقط بالحقول الموجودة فعليًا في جدول profiles
  const updateObj: any = {
    full_name: profile.fullName,
    email: profile.email,
  };
  if (profile.phone !== undefined) updateObj.phone = profile.phone;
  if (profile.position !== undefined) updateObj.position = profile.position;
  if (profile.customPermissions !== undefined) updateObj.custom_permissions = profile.customPermissions;

  // تحديث بيانات المستخدم في جدول profiles
  const updated = await updateUserReal(profile.id, updateObj);

  // تحديث الأدوار (user_roles) عبر الدالة الصحيحة
  if (profile.roles && profile.roles.length > 0) {
    await setRolesForUser(profile.id, profile.roles);
  }

  // تحديث الصلاحيات الفردية (user_permissions) إذا تم تمرير customPermissions
  if (profile.customPermissions !== undefined) {
    await setPermissionsForUser(profile.id, profile.customPermissions);
  }

  return {
    id: updated.id,
    fullName: updated.full_name,
    email: updated.email,
    avatarUrl: updated.avatar_url,
    phone: updated.phone,
    position: updated.position,
    roles: profile.roles,
    customPermissions: profile.customPermissions !== undefined ? profile.customPermissions : [],
    createdAt: updated.created_at,
    lastSignInAt: null,
  };
};

// تحديث أدوار وصلاحيات مستخدم
export const updateUserRoles = async (
  userId: string,
  roles: UserRole[],
  customPermissions: string[] = []
): Promise<void> => {
  // يجب تعديل backend ليقبل customPermissions
  await updateUserReal(userId, {
    roles,
    custom_permissions: customPermissions,
  });
};

// حذف مستخدم
export const deleteUser = async (userId: string): Promise<void> => {
  await deleteUserReal(userId);
};

// جلب مستخدم واحد مع صلاحياته المخصصة
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const user = await getAllUsersWithRoles(userId);
  if (!user) return null;
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    phone: user.phone,
    position: user.position,
    roles: user.roles ? user.roles.map((role: string) => role as UserRole) : [],
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
    customPermissions: user.custom_permissions || [],
  };
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
