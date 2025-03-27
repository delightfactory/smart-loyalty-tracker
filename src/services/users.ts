
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/lib/auth-types';

// استرجاع جميع المستخدمين (للمسؤولين فقط)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');
    
  if (profilesError) throw profilesError;
  
  // استرجاع أدوار المستخدمين
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');
    
  if (rolesError) throw rolesError;
  
  // دمج البيانات
  const users = profiles.map(profile => {
    const userRoles = roles
      .filter(r => r.user_id === profile.id)
      .map(r => r.role as UserRole);
      
    return {
      id: profile.id,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      phone: profile.phone,
      position: profile.position,
      roles: userRoles
    };
  });
  
  return users;
};

// تحديث ملف المستخدم
export const updateUserProfile = async (profile: Partial<UserProfile> & { id: string }): Promise<UserProfile> => {
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
};

// إضافة دور للمستخدم
export const addRoleToUser = async (userId: string, role: UserRole): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: role
    });
    
  if (error) throw error;
};

// حذف دور من المستخدم
export const removeRoleFromUser = async (userId: string, role: UserRole): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);
    
  if (error) throw error;
};

// التحقق مما إذا كان المستخدم لديه دور معين
export const hasRole = async (userId: string, role: UserRole): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();
    
  if (error) throw error;
  
  return !!data;
};
