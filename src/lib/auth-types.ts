
// User Roles Enum
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  ACCOUNTANT = "accountant",
  SALES = "sales",
  USER = "user"
}

// User Profile Interface
export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  position: string | null;
  roles: UserRole[];
}

// Auth State Interface
export interface AuthState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  error: string | null;
}
