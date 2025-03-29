
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/lib/auth-types';

// استرجاع جميع المستخدمين (للمسؤولين فقط)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    // استرجاع بيانات المستخدمين من Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    
    // استرجاع الملفات الشخصية
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) throw profilesError;
    
    // استرجاع أدوار المستخدمين
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');
      
    if (rolesError) throw rolesError;
    
    // دمج البيانات
    const users = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id);
      const userRoles = roles
        ?.filter(r => r.user_id === authUser.id)
        .map(r => r.role as UserRole) || [];
        
      return {
        id: authUser.id,
        fullName: profile?.full_name || authUser.email || '',
        avatarUrl: profile?.avatar_url,
        phone: profile?.phone,
        position: profile?.position,
        roles: userRoles
      };
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// إنشاء مستخدم جديد
export const createUser = async (userData: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}): Promise<string> => {
  try {
    // إنشاء المستخدم
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.fullName,
      },
    });
    
    if (authError) throw authError;
    
    const userId = authData.user.id;
    
    // إضافة دور للمستخدم
    if (userData.role) {
      await addRoleToUser(userId, userData.role);
    }
    
    return userId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// تحديث ملف المستخدم
export const updateUserProfile = async (profile: Partial<UserProfile> & { id: string }): Promise<UserProfile> => {
  try {
    const { id, fullName, avatarUrl, phone, position } = profile;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
        phone: phone,
        position: position
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // استرجاع الأدوار
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', id);
      
    if (rolesError) throw rolesError;
    
    const userRoles = rolesData.map(r => r.role as UserRole);
    
    return {
      id: data.id,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      phone: data.phone,
      position: data.position,
      roles: userRoles
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// حذف مستخدم
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// إضافة دور للمستخدم
export const addRoleToUser = async (userId: string, role: UserRole): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error adding role to user:', error);
    throw error;
  }
};

// حذف دور من المستخدم
export const removeRoleFromUser = async (userId: string, role: UserRole): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error removing role from user:', error);
    throw error;
  }
};

// تحديث أدوار المستخدم
export const updateUserRoles = async (userId: string, roles: UserRole[]): Promise<void> => {
  try {
    // حذف جميع الأدوار الحالية
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) throw deleteError;
    
    // إذا كانت الأدوار فارغة، توقف هنا
    if (!roles.length) return;
    
    // إضافة الأدوار الجديدة
    const rolesToInsert = roles.map(role => ({
      user_id: userId,
      role: role
    }));
    
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert(rolesToInsert);
      
    if (insertError) throw insertError;
  } catch (error) {
    console.error('Error updating user roles:', error);
    throw error;
  }
};

// التحقق مما إذا كان المستخدم لديه دور معين
export const hasRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking user role:', error);
    throw error;
  }
};

// الحصول على مستخدم واحد بواسطة المعرّف
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  try {
    // استرجاع الملف الشخصي
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) throw profileError;
    
    if (!profileData) return null;
    
    // استرجاع الأدوار
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (rolesError) throw rolesError;
    
    const userRoles = rolesData.map(r => r.role as UserRole);
    
    return {
      id: profileData.id,
      fullName: profileData.full_name,
      avatarUrl: profileData.avatar_url,
      phone: profileData.phone,
      position: profileData.position,
      roles: userRoles
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};
