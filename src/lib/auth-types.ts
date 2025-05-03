
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
  email?: string;
  avatarUrl: string | null;
  phone: string | null;
  position: string | null;
  roles: UserRole[] | { id: string; name: string }[];
  createdAt?: string;
  lastSignInAt?: string | null;
  customPermissions?: string[]; // صلاحيات مخصصة لكل مستخدم
}

// Auth State Interface
export interface AuthState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  error: string | null;
}

// Create User Interface
export interface CreateUserParams {
  email: string;
  password: string;
  fullName: string;
  roles: UserRole[];
}
