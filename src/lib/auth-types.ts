
import { User as SupabaseUser } from '@supabase/supabase-js';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ACCOUNTANT = 'accountant',
  SALES = 'sales',
  USER = 'user'
}

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  position?: string;
  roles: UserRole[];
}

export interface AuthUser extends SupabaseUser {
  profile?: UserProfile;
}

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  roles: UserRole[];
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}
