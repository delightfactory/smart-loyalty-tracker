
// User Roles Enum
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  ACCOUNTANT = "accountant",
  SALES = "sales",
  USER = "user"
}

// Role Interface (for compatibility with auth-rbac-types.ts)
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: any[];
}

// User Profile Interface
export interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  avatarUrl: string | null;
  phone: string | null;
  position: string | null;
  roles: UserRole[] | Role[];
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

// Helper function to check if roles array contains UserRole or Role objects
export function isUserRoleArray(roles: UserRole[] | Role[]): roles is UserRole[] {
  return roles.length === 0 || typeof roles[0] === 'string' || !('id' in roles[0]);
}

// Helper function to convert Role objects to UserRole enum values
export function convertRoleToUserRole(role: Role): UserRole {
  return role.name as UserRole;
}

// Helper function to convert Role[] to UserRole[]
export function convertRolesToUserRoles(roles: Role[]): UserRole[] {
  return roles.map(role => convertRoleToUserRole(role));
}
