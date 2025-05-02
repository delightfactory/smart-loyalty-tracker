import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/auth-types';

// إنشاء مستخدم جديد مع ربطه بدور
export const createUser = async (fullName: string, email: string, role: string, password?: string) => {
  // 1. إنشاء المستخدم في Auth أولاً
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: password || Math.random().toString(36).slice(-8) // كلمة مرور مؤقتة إذا لم تُمرر
  });
  if (signUpError || !signUpData.user) throw signUpError || new Error('Auth sign up failed');
  const userId = signUpData.user.id;

  // 2. تحقق أولاً إذا كان يوجد صف في profiles بنفس id
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (existingProfileError) throw existingProfileError;

  let profile = existingProfile;
  // إذا لم يوجد صف، قم بالإدراج
  if (!existingProfile) {
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        email,
        created_at: new Date().toISOString(),
        avatar_url: null,
        phone: null,
        position: null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();
    if (profileError || !newProfile) throw profileError || new Error('Failed to create profile');
    profile = newProfile;
  }

  // 3. جلب role_id
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', role)
    .maybeSingle();
  if (roleError || !roleData) throw roleError || new Error('Role not found');

  // 4. تحقق من عدم تكرار ربط المستخدم بالدور
  const { data: existingUserRole, error: existingUserRoleError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', profile.id)
    .eq('role_id', roleData.id)
    .maybeSingle();
  if (existingUserRoleError) throw existingUserRoleError;
  if (!existingUserRole) {
    const { error: userRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: profile.id,
        role_id: roleData.id,
        created_at: new Date().toISOString(),
      });
    if (userRoleError) throw userRoleError;
  }

  return profile;
};

// جلب جميع المستخدمين مع أدوارهم
export const getAllUsersWithRoles = async () => {
  // جلب كل المستخدمين
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*');
  if (usersError) throw usersError;

  // جلب كل user_roles
  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('user_id, role_id');
  if (userRolesError) throw userRolesError;

  // جلب كل الأدوار
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name');
  if (rolesError) throw rolesError;

  // دمج البيانات
  return users.map((user: any) => {
    const userRoleLinks = userRoles.filter((ur: any) => ur.user_id === user.id);
    const userRoleNames = userRoleLinks.map((ur: any) => {
      const role = roles.find((r: any) => r.id === ur.role_id);
      return role ? role.name : null;
    }).filter(Boolean);
    // ضمان وجود خاصية roles دائمًا
    return { ...user, roles: userRoleNames.length > 0 ? userRoleNames : [] };
  });
};

// تحديث بيانات مستخدم
export const updateUser = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
};

// حذف مستخدم
export const deleteUser = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (error) throw error;
  return true;
};
