
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/auth-types';

// بيانات اعتماد المسؤول - نستخدمها للتسجيل ولإظهارها للمستخدم
export const adminCredentials = {
  email: 'admin@autocare.com',
  password: 'Admin@12345',
  fullName: 'مدير النظام'
};

// تحقق مما إذا كان هناك مستخدم لديه دور الأدمن
export const isAdminExists = async () => {
  try {
    console.log('Checking if admin exists...');
    // اجلب user_roles مع بيانات الدور المرتبط بدون أي join أو علاقة متداخلة
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, role_id');
    if (error) {
      console.error("Error checking if admin exists:", error);
      throw error;
    }
    // اجلب بيانات الأدوار من جدول roles
    let adminExists = false;
    if (data && data.length > 0) {
      // جلب كل أدوار الأدمن دفعة واحدة
      const roleIds = data.map((ur) => ur.role_id);
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('id, name')
        .in('id', roleIds);
      if (!rolesError && roles) {
        adminExists = roles.some((role) => role.name === UserRole.ADMIN);
      }
    }
    console.log('Admin exists check result:', adminExists, 'data:', data);
    return adminExists;
  } catch (error) {
    console.error("Error checking if admin exists:", error);
    return false;
  }
};

// تحقق من وجود دور المسؤول للمستخدم المحدد
export const ensureUserHasAdminRole = async (userId: string) => {
  try {
    console.log('Ensuring user has admin role:', userId);
    // 1. جلب user_roles لهذا المستخدم فقط
    const { data: userRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('id, role_id')
      .eq('user_id', userId);

    if (checkError) {
      console.error("Error checking admin role:", checkError);
      throw checkError;
    }

    // 2. جلب بيانات الدور من جدول roles
    let hasAdminRole = false;
    if (userRoles && userRoles.length > 0) {
      const roleIds = userRoles.map((ur) => ur.role_id);
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('id, name')
        .in('id', roleIds);
      if (!rolesError && roles) {
        hasAdminRole = roles.some((role) => role.name === UserRole.ADMIN);
      }
    }

    // 3. إذا لم يكن لديه دور الأدمن، أضفه
    if (!hasAdminRole) {
      console.log('Adding admin role to user:', userId);
      const { data: adminRole, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', UserRole.ADMIN)
        .maybeSingle();
      if (roleError || !adminRole) {
        throw roleError || new Error('Admin role not found');
      }
      const insertData = {
        user_id: userId,
        role_id: adminRole.id
      };
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(insertData);
      if (insertError) {
        console.error("Error adding admin role:", insertError);
        throw insertError;
      }
      console.log('Admin role added successfully');
    } else {
      console.log('User already has admin role');
    }
    return true;
  } catch (error) {
    console.error("Error ensuring admin role:", error);
    throw error;
  }
};
