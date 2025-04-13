import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserProfile } from '@/lib/auth-types';

export interface CreateUserParams {
  email: string;
  password: string;
  fullName: string;
  roles: UserRole[];
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    console.log('Fetching all users...');
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }
    
    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      console.log('No users found in auth system');
      return [];
    }
    
    console.log(`Found ${authUsers.users.length} users in auth system`);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');
      
    if (rolesError) {
      console.error('Error fetching user roles:', rolesError);
      throw rolesError;
    }
    
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
        roles: roles.length > 0 ? roles : [UserRole.USER],
        createdAt: authUser.created_at,
        lastSignInAt: authUser.last_sign_in_at
      };
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<UserProfile> => {
  try {
    console.log(`Fetching user with ID ${userId}...`);
    
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      console.error(`Error fetching auth user ${userId}:`, authError);
      throw authError || new Error('User not found');
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error(`Error fetching profile for ${userId}:`, profileError);
      throw profileError;
    }
    
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (rolesError) {
      console.error(`Error fetching roles for ${userId}:`, rolesError);
      throw rolesError;
    }
    
    const roles = userRoles.map(r => r.role as UserRole);
    
    return {
      id: userId,
      email: authUser.user.email,
      fullName: profile?.full_name || authUser.user.email || 'مستخدم بدون اسم',
      avatarUrl: profile?.avatar_url || null,
      phone: profile?.phone || null,
      position: profile?.position || null,
      roles: roles.length > 0 ? roles : [UserRole.USER],
      createdAt: authUser.user.created_at,
      lastSignInAt: authUser.user.last_sign_in_at
    };
  } catch (error) {
    console.error(`Error getting user with ID ${userId}:`, error);
    throw error;
  }
};

export const createUser = async (params: CreateUserParams): Promise<UserProfile> => {
  try {
    console.log('Creating new user:', params.email);
    const { email, password, fullName, roles } = params;
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });
    
    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      throw authError || new Error('Failed to create user');
    }
    
    console.log('User created successfully:', authData.user.id);
    const userId = authData.user.id;
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking profile existence:', profileError);
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName
        })
        .select('*')
        .single();
        
      if (newProfileError) {
        console.error('Error creating profile:', newProfileError);
        throw newProfileError;
      }
      
      console.log('Profile created:', newProfile);
    } else if (!profileData) {
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName
        })
        .select('*')
        .single();
        
      if (newProfileError) {
        console.error('Error creating profile:', newProfileError);
        throw newProfileError;
      }
      
      console.log('Profile created:', newProfile);
    }
    
    const { error: deleteRolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (deleteRolesError) {
      console.error('Error deleting existing roles:', deleteRolesError);
      throw deleteRolesError;
    }
    
    const rolesToInsert = roles.map(role => ({
      user_id: userId,
      role: role
    }));
    
    if (rolesToInsert.length > 0) {
      console.log('Adding roles:', rolesToInsert);
      const { error: insertRolesError } = await supabase
        .from('user_roles')
        .insert(rolesToInsert);
        
      if (insertRolesError) {
        console.error('Error adding roles:', insertRolesError);
        throw insertRolesError;
      }
    }
    
    return {
      id: userId,
      email,
      fullName,
      avatarUrl: null,
      phone: null,
      position: null,
      roles
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUserProfile = async (profile: Partial<UserProfile> & { id: string }): Promise<UserProfile> => {
  try {
    console.log('Updating user profile:', profile.id);
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
      
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    console.log('Profile updated successfully:', data);
    
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', id);
      
    if (rolesError) {
      console.error('Error fetching roles after update:', rolesError);
      throw rolesError;
    }
    
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

export const updateUserRoles = async (userId: string, roles: UserRole[]): Promise<void> => {
  try {
    console.log(`Updating roles for user ${userId}:`, roles);
    
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error('Error deleting existing roles:', deleteError);
      throw deleteError;
    }
    
    if (!roles.length) {
      roles = [UserRole.USER];
    }
    
    const rolesToInsert = roles.map(role => ({
      user_id: userId,
      role: role
    }));
    
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert(rolesToInsert);
      
    if (insertError) {
      console.error('Error adding new roles:', insertError);
      throw insertError;
    }
    
    console.log('Roles updated successfully');
  } catch (error) {
    console.error('Error updating user roles:', error);
    throw error;
  }
};

export const addRoleToUser = async (userId: string, role: UserRole): Promise<void> => {
  try {
    console.log(`Adding role ${role} to user ${userId}`);
    
    const { data, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role);
      
    if (checkError) {
      console.error('Error checking existing role:', checkError);
      throw checkError;
    }
    
    if (data && data.length > 0) {
      console.log('User already has this role');
      return;
    }
    
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role
      });
      
    if (error) {
      console.error('Error adding role:', error);
      throw error;
    }
    
    console.log('Role added successfully');
  } catch (error) {
    console.error('Error adding role to user:', error);
    throw error;
  }
};

export const removeRoleFromUser = async (userId: string, role: UserRole): Promise<void> => {
  try {
    console.log(`Removing role ${role} from user ${userId}`);
    
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);
      
    if (error) {
      console.error('Error removing role:', error);
      throw error;
    }
    
    console.log('Role removed successfully');
    
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (rolesError) {
      console.error('Error checking remaining roles:', rolesError);
      throw rolesError;
    }
    
    if (!rolesData || rolesData.length === 0) {
      console.log('No roles remaining, adding default USER role');
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: UserRole.USER
        });
    }
  } catch (error) {
    console.error('Error removing role from user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    console.log(`Deleting user ${userId}`);
    
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    
    console.log('User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<void> => {
  try {
    console.log(`Updating password for user ${userId}`);
    
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );
    
    if (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
    
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};

export const updateCurrentUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    console.log('Updating current user password');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      console.error('Error updating current user password:', error);
      throw error;
    }
    
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Error updating current user password:', error);
    throw error;
  }
};

export const checkAdminExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', UserRole.ADMIN);
      
    if (error) {
      console.error('Error checking admin existence:', error);
      throw error;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return false;
  }
};

export const createDefaultAdmin = async (email: string, password: string, fullName: string): Promise<UserProfile | null> => {
  try {
    console.log('Creating default admin user');
    
    const adminExists = await checkAdminExists();
    console.log('Admin exists?', adminExists);
    
    if (adminExists) {
      console.log('Admin user already exists');
      
      const { data, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error("Error listing users:", userError);
        throw userError;
      }
      
      if (data && data.users && data.users.length > 0) {
        const adminUser = data.users.find(user => {
          return typeof user.email === 'string' && user.email === email;
        });
        
        if (adminUser) {
          console.log('Found existing admin user:', adminUser.id);
          
          await ensureUserHasAdminRole(adminUser.id);
          
          const adminProfile = await getUserById(adminUser.id);
          return adminProfile;
        }
      }
      
      return null;
    }
    
    console.log('No admin found. Creating new admin with:', { email, fullName });
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName
      }
    });
    
    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      throw authError || new Error('Failed to create user');
    }
    
    console.log('User created successfully:', authData.user.id);
    const userId = authData.user.id;
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking profile existence:', profileError);
      
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName
        })
        .select('*')
        .single();
        
      if (newProfileError) {
        console.error('Error creating profile:', newProfileError);
        throw newProfileError;
      }
      
      console.log('Profile created:', newProfile);
    } else if (!profileData) {
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName
        })
        .select('*')
        .single();
        
      if (newProfileError) {
        console.error('Error creating profile:', newProfileError);
        throw newProfileError;
      }
      
      console.log('Profile created:', newProfile);
    }
    
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: UserRole.ADMIN
      });
      
    if (roleError) {
      console.error('Error adding admin role:', roleError);
      throw roleError;
    }
    
    console.log('Admin role added successfully');
    
    const newAdmin: UserProfile = {
      id: userId,
      email,
      fullName,
      avatarUrl: null,
      phone: null,
      position: null,
      roles: [UserRole.ADMIN]
    };
    
    return newAdmin;
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};

export const ensureUserHasAdminRole = async (userId: string): Promise<void> => {
  try {
    console.log('Ensuring user has admin role:', userId);
    
    const { data: existingRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (checkError) {
      console.error('Error checking user roles:', checkError);
      throw checkError;
    }
    
    const hasAdminRole = existingRoles.some(r => r.role === UserRole.ADMIN);
    
    if (!hasAdminRole) {
      console.log('Adding admin role to user:', userId);
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: UserRole.ADMIN
        });
      
      if (insertError) {
        console.error('Error adding admin role:', insertError);
        throw insertError;
      }
      
      console.log('Admin role added successfully');
    } else {
      console.log('User already has admin role');
    }
  } catch (error) {
    console.error('Error ensuring admin role:', error);
    throw error;
  }
};
