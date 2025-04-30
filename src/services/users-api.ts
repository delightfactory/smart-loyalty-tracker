
import { UserRole, UserProfile } from '@/lib/auth-types';

// Mock implementation of users service functions for components to use
// Later these would be replaced with actual Firebase implementation

export const getAllUsers = async (): Promise<UserProfile[]> => {
  // Mock data
  return [
    {
      id: '1',
      fullName: 'مدير النظام',
      email: 'admin@example.com',
      avatarUrl: null,
      phone: null,
      position: 'مدير النظام',
      roles: [UserRole.ADMIN],
      createdAt: '2023-01-01T00:00:00Z',
      lastSignInAt: '2023-06-01T00:00:00Z'
    },
    {
      id: '2',
      fullName: 'مستخدم عادي',
      email: 'user@example.com',
      avatarUrl: null,
      phone: null,
      position: 'مستخدم',
      roles: [UserRole.USER],
      createdAt: '2023-01-10T00:00:00Z',
      lastSignInAt: '2023-06-10T00:00:00Z'
    }
  ];
};

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const users = await getAllUsers();
  return users.find(user => user.id === userId) || null;
};

export const createUser = async (userData: {
  email: string;
  password: string; 
  fullName: string;
  roles: UserRole[];
}): Promise<UserProfile> => {
  // Mock implementation
  return {
    id: Math.random().toString(36).substr(2, 9),
    fullName: userData.fullName,
    email: userData.email,
    avatarUrl: null,
    phone: null,
    position: null,
    roles: userData.roles,
    createdAt: new Date().toISOString(),
    lastSignInAt: null
  };
};

export const updateUserProfile = async (profile: {
  id: string;
  fullName: string;
  phone: string | null;
  position: string | null;
}): Promise<UserProfile> => {
  // Mock implementation
  return {
    id: profile.id,
    fullName: profile.fullName,
    email: 'user@example.com',
    avatarUrl: null,
    phone: profile.phone,
    position: profile.position,
    roles: [UserRole.USER],
    createdAt: '2023-01-01T00:00:00Z',
    lastSignInAt: null
  };
};

export const updateUserRoles = async (userId: string, roles: UserRole[]): Promise<void> => {
  // Mock implementation
  console.log(`Updated roles for user ${userId} to:`, roles);
};

export const deleteUser = async (userId: string): Promise<void> => {
  // Mock implementation
  console.log(`Deleted user with ID: ${userId}`);
};

export const updateCurrentUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  // Mock implementation
  console.log('Password updated successfully');
};

// Helper function for admin account creation
export const assignAdminRole = async (userId: string): Promise<{success: boolean, message?: string}> => {
  // Mock implementation
  return { success: true };
};
