
// Stub implementation of Firebase services to satisfy TypeScript
// Real implementation would use Firebase services

// Define types
import { UserProfile, UserRole } from '@/lib/auth-types';

// Note: We're not actually using Firebase, this just fixes the import errors
const auth = {
  currentUser: null,
};

export const usersService = {
  createUser: async (email: string, password: string, displayName: string, role: string) => {
    console.log('Creating user', { email, password, displayName, role });
    return {
      id: 'mock-user-id',
      uid: 'mock-user-id',
      email,
      displayName,
      photoURL: null,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
  
  signInUser: async (email: string, password: string) => {
    console.log('Signing in user', { email, password });
    return { uid: 'mock-user-id', email };
  },
  
  signOutUser: async () => {
    console.log('Signing out user');
  },
  
  resetPassword: async (email: string) => {
    console.log('Resetting password for', email);
  },
  
  // More stub implementations
  getUserDocument: async (id: string) => {
    return {
      id,
      uid: id,
      email: 'user@example.com',
      displayName: 'User',
      photoURL: null,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
  
  getAllUserDocuments: async () => {
    return [
      {
        id: '1',
        uid: '1',
        email: 'user1@example.com',
        displayName: 'User 1',
        photoURL: null,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        uid: '2',
        email: 'user2@example.com',
        displayName: 'User 2',
        photoURL: null,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  },
  
  // Stub implementations for the rest of the methods
  updateUserDocument: async (user: any) => {
    console.log('Updating user', user);
    return user;
  },
  
  deleteUserDocument: async (id: string) => {
    console.log('Deleting user', id);
  },
  
  uploadUserPhoto: async (file: File, userId: string) => {
    console.log('Uploading photo for user', userId);
    return 'mock-photo-url';
  },
  
  deleteUserPhoto: async (photoURL: string, userId: string) => {
    console.log('Deleting photo for user', userId);
  },
  
  changeEmail: async (userId: string, newEmail: string) => {
    console.log('Changing email for user', { userId, newEmail });
    return true;
  },
  
  changePassword: async (userId: string, newPassword: string) => {
    console.log('Changing password for user', userId);
    return true;
  },
  
  sendVerificationEmail: async () => {
    console.log('Sending verification email');
    return true;
  },
  
  resendPasswordResetEmail: async (email: string) => {
    console.log('Resending password reset email to', email);
    return true;
  },
  
  deleteAccount: async (userId: string) => {
    console.log('Deleting account for user', userId);
    return true;
  },
  
  getUserByEmail: async (email: string) => {
    console.log('Getting user by email', email);
    if (email) {
      return {
        id: 'mock-user-id',
        uid: 'mock-user-id',
        email: email,
        displayName: 'User',
        photoURL: null,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  },
  
  verifyPasswordResetCode: async (code: string, email: string) => {
    console.log('Verifying password reset code', { code, email });
    return true;
  },
  
  confirmPasswordReset: async (code: string, newPassword: string, email: string) => {
    console.log('Confirming password reset', { code, email });
  },
  
  sendSignInLinkToEmail: async (email: string, actionCodeSettings: any) => {
    console.log('Sending sign-in link to email', { email, actionCodeSettings });
    return true;
  },
  
  isSignInWithEmailLink: (url: string) => {
    return false;
  },
  
  signInWithEmailLink: async (email: string, url: string) => {
    console.log('Signing in with email link', { email, url });
    return { user: { uid: 'mock-user-id', email } };
  },
  
  getUsersWithRole: async (role: string) => {
    console.log('Getting users with role', role);
    return [];
  },
  
  findUsers: async (searchTerm: string) => {
    console.log('Finding users with search term', searchTerm);
    return [];
  },
  
  findUsersByRole: async (searchTerm: string, role: string) => {
    console.log('Finding users by role', { searchTerm, role });
    return [];
  },
  
  isEmailAlreadyInUse: async (email: string) => {
    console.log('Checking if email is already in use', email);
    return false;
  },
  
  sendPasswordResetEmail: async (email: string) => {
    console.log('Sending password reset email', email);
    return true;
  },
};

export default usersService;
