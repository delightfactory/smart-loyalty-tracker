
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
  try {
    // التحقق من وجود مستخدمين لديهم دور المسؤول
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', UserRole.ADMIN);
      
    if (error) throw error;
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking if admin exists:", error);
    return false;
  }
};
