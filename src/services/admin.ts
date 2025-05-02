
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
    console.log('Checking if admin exists...');
    
    // التحقق من وجود مستخدمين لديهم دور المسؤول
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', UserRole.ADMIN);
      
    if (error) {
      console.error("Error checking if admin exists:", error);
      throw error;
    }
    
    const adminExists = data && data.length > 0;
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
    
    // نستخدم نوع واضح للمتغير existingRole لمنع الخطأ
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', UserRole.ADMIN)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking admin role:", checkError);
      throw checkError;
    }
    
    // إذا لم يكن المستخدم لديه دور المسؤول، أضفه
    if (!existingRole) {
      console.log('Adding admin role to user:', userId);
      
      // Using explicit type declaration to avoid circular reference
      interface UserRoleInsert {
        user_id: string;
        role: UserRole;
      }
      
      const insertData: UserRoleInsert = {
        user_id: userId,
        role: UserRole.ADMIN
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
