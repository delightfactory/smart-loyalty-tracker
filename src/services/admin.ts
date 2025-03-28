
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/auth-types';

export const createAdminUser = async (email: string, password: string, fullName: string) => {
  try {
    // إنشاء المستخدم
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });
    
    if (userError) throw userError;
    
    if (!userData.user) throw new Error('فشل في إنشاء المستخدم');
    
    // إنشاء ملف تعريف للمستخدم إذا لم يكن موجوداً
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        full_name: fullName,
      });
      
    if (profileError) throw profileError;
    
    // إضافة صلاحية المدير
    const { error: adminRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: UserRole.ADMIN,
      });
      
    if (adminRoleError) throw adminRoleError;
    
    // إضافة صلاحيات إضافية
    const additionalRoles = [UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.SALES];
    
    for (const role of additionalRoles) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: role,
        });
    }
    
    return { success: true, user: userData.user };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return { success: false, error: error.message };
  }
};

export const adminCredentials = {
  email: 'admin@autocare.com',
  password: 'Admin@12345',
  fullName: 'مدير النظام'
};
