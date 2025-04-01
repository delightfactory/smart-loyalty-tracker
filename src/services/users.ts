import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/auth-types';

export interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl: string | null;
  phone: string | null;
  position: string | null;
  roles: UserRole[];
}

export interface CreateUserParams {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

// Get all users
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    // Get all users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    
    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      return [];
    }
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) throw profilesError;
    
    // Get all roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
      
    if (rolesError) throw rolesError;
    
    // Combine data
    const users: UserProfile[] = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id);
      const roles = userRoles
        ?.filter(r => r.user_id === authUser.id)
        .map(r => r.role as UserRole) || [];
        
      return {
        id: authUser.id,
        email: authUser.email,
        fullName: profile?.full_name || authUser.email || 'مستخدم بدون اسم',
        avatarUrl: profile?.avatar_url || null,
        phone: profile?.phone || null,
        position: profile?.position || null,
        roles
      };
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<UserProfile> => {
  try {
    // Get auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) throw authError || new Error('User not found');
    
    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    // Get roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (rolesError) throw rolesError;
    
    const roles = userRoles.map(r => r.role as UserRole);
    
    return {
      id: userId,
      email: authUser.user.email,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      phone: profile.phone,
      position: profile.position,
      roles
    };
  } catch (error) {
    console.error(`Error getting user with ID ${userId}:`, error);
    throw error;
  }
};

// Create a new user
export const createUser = async (params: CreateUserParams): Promise<UserProfile> => {
  try {
    const { email, password, fullName, role } = params;
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });
    
    if (authError || !authData.user) throw authError || new Error('Failed to create user');
    
    const userId = authData.user.id;
    
    // Update profile (if not created by trigger)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName
        })
        .select('*')
        .single();
        
      if (newProfileError) throw newProfileError;
    }
    
    // Add role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role
      });
      
    if (roleError) throw roleError;
    
    return {
      id: userId,
      email,
      fullName,
      avatarUrl: null,
      phone: null,
      position: null,
      roles: [role]
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user profile
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
    
    // Get roles
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

// Update user roles
export const updateUserRoles = async (userId: string, roles: UserRole[]): Promise<void> => {
  try {
    // Delete existing roles
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) throw deleteError;
    
    // If roles array is empty, stop here
    if (!roles.length) return;
    
    // Add new roles
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

// Add a role to user
export const addRoleToUser = async (userId: string, role: UserRole): Promise<void> => {
  try {
    // Check if user already has this role
    const { data, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role);
      
    if (checkError) throw checkError;
    
    // If role already exists, do nothing
    if (data && data.length > 0) return;
    
    // Add the role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error adding role to user:', error);
    throw error;
  }
};

// Remove a role from user
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

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// تحديث كلمة مرور المستخدم
export const updateUserPassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  try {
    // التحقق من كلمة المرور الحالية
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: '', // نحتاج إلى البريد الإلكتروني للتحقق من كلمة المرور
      password: currentPassword
    });
    
    if (authError) {
      throw new Error('كلمة المرور الحالية غير صحيحة');
    }
    
    // تحديث كلمة المرور
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );
    
    if (error) throw error;
    
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};
