
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
