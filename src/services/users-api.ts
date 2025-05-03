
import { getAllUsersWithRoles, createUser as createUserReal, updateUser as updateUserReal, deleteUser as deleteUserReal } from './users';
import { setPermissionsForUser, setRolesForUser } from './roles-permissions-api';
import { UserRole, UserProfile, UpdateUserParams } from '@/lib/auth-types';

// جلب كل المستخدمين مع أدوارهم من Supabase
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
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
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

// إضافة مستخدم جديد
export const createUser = async (userData: {
  email: string;
  fullName: string;
  password: string;
  roles: UserRole[];
}): Promise<UserProfile> => {
  try {
    // نستخدم أول دور فقط (يمكنك توسيعها لاحقًا لدعم تعدد الأدوار)
    const user = await createUserReal(userData.fullName, userData.email, userData.roles[0], userData.password);
    
    // إذا كان هناك أكثر من دور، قم بإضافتهم
    if (userData.roles.length > 1) {
      for (let i = 1; i < userData.roles.length; i++) {
        await setRolesForUser(user.id, [userData.roles[i]]);
      }
    }
    
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
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// تحديث مستخدم شاملاً تحديث الأدوار والصلاحيات الفردية
export const updateUserProfile = async (profile: UpdateUserParams): Promise<UserProfile> => {
  try {
    // إعداد كائن التحديث فقط بالحقول الموجودة فعليًا في جدول profiles
    const updateObj: any = {
      full_name: profile.fullName,
      email: profile.email,
    };
    
    if (profile.phone !== undefined) updateObj.phone = profile.phone;
    if (profile.position !== undefined) updateObj.position = profile.position;
    if (profile.avatarUrl !== undefined) updateObj.avatar_url = profile.avatarUrl;
    if (profile.customPermissions !== undefined) updateObj.custom_permissions = profile.customPermissions;
    
    console.log("Updating user with data:", updateObj);
    
    // تحديث بيانات المستخدم في جدول profiles
    const updated = await updateUserReal(profile.id, updateObj);
    
    // تحديث الأدوار (user_roles) عبر الدالة الصحيحة
    if (profile.roles && profile.roles.length > 0) {
      console.log("Updating roles for user:", profile.id, profile.roles);
      await setRolesForUser(profile.id, profile.roles);
    }
    
    // تحديث الصلاحيات الفردية (user_permissions) إذا تم تمرير customPermissions
    if (profile.customPermissions !== undefined) {
      console.log("Updating permissions for user:", profile.id, profile.customPermissions);
      await setPermissionsForUser(profile.id, profile.customPermissions);
    }
    
    return {
      id: updated.id,
      fullName: updated.full_name,
      email: updated.email,
      avatarUrl: updated.avatar_url,
      phone: updated.phone,
      position: updated.position,
      roles: profile.roles || [],
      customPermissions: profile.customPermissions !== undefined ? profile.customPermissions : [],
      createdAt: updated.created_at,
      lastSignInAt: null,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// تحديث أدوار وصلاحيات مستخدم
export const updateUserRoles = async (
  userId: string,
  roles: UserRole[],
  customPermissions: string[] = []
): Promise<void> => {
  try {
    // يجب تعديل backend ليقبل customPermissions
    await updateUserReal(userId, {
      custom_permissions: customPermissions,
    });
    
    // تحديث الأدوار
    await setRolesForUser(userId, roles);
    
    // تحديث الصلاحيات
    await setPermissionsForUser(userId, customPermissions);
  } catch (error) {
    console.error("Error updating user roles:", error);
    throw error;
  }
};

// حذف مستخدم
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteUserReal(userId);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// جلب مستخدم واحد مع صلاحياته المخصصة
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
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
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

export const updateCurrentUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    // Mock implementation
    console.log('Password updated successfully');
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

// Helper function for admin account creation
export const assignAdminRole = async (userId: string): Promise<{success: boolean, message?: string}> => {
  try {
    // Mock implementation
    return { success: true };
  } catch (error) {
    console.error("Error assigning admin role:", error);
    return { success: false, message: (error as Error).message };
  }
};
