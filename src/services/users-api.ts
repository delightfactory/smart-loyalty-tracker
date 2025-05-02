import { getAllUsersWithRoles, createUser as createUserReal, updateUser as updateUserReal, deleteUser as deleteUserReal } from './users';
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
    roles: user.roles.map((role: string) => role as UserRole),
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at || null,
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
    roles: user.roles || userData.roles,
    createdAt: user.created_at,
    lastSignInAt: null,
  };
};

// تحديث مستخدم
export const updateUserProfile = async (profile: {
  id: string;
  fullName: string;
  email: string;
  roles: UserRole[];
}): Promise<UserProfile> => {
  const updated = await updateUserReal(profile.id, {
    full_name: profile.fullName,
    email: profile.email,
    // تحديث الدور يتطلب منطق منفصل إذا أردت دعم تعدد الأدوار
  });
  return {
    id: updated.id,
    fullName: updated.full_name,
    email: updated.email,
    avatarUrl: updated.avatar_url,
    phone: updated.phone,
    position: updated.position,
    roles: profile.roles,
    createdAt: updated.created_at,
    lastSignInAt: null,
  };
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
  // Mock implementation
  console.log(`Updated roles for user ${userId} to:`, roles);
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
