
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/auth-types';

// بيانات اعتماد المسؤول - نستخدمها للتسجيل ولإظهارها للمستخدم
export const adminCredentials = {
  email: 'admin@autocare.com',
  password: 'Admin@12345',
  fullName: 'مدير النظام'
};

// تحقق مما إذا كان المستخدم موجودًا بالفعل
export const isAdminExists = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: adminCredentials.email,
    password: adminCredentials.password,
  });
  
  if (error) {
    return false;
  }
  
  return !!data.user;
};

// إنشاء حساب مسؤول جديد
export const createAdminAccount = async (email: string, password: string, fullName: string) => {
  try {
    // إنشاء حساب المستخدم
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    });
    
    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error('فشل إنشاء حساب المستخدم');
    }
    
    // إضافة صلاحية المسؤول
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: UserRole.ADMIN
      });
      
    if (roleError) throw roleError;
    
    return authData.user;
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
};
