
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  ACCOUNTANT = "accountant",
  SALES = "sales",
  USER = "user"
}

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  position?: string | null;
  roles: UserRole[];
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  error: string | null;
}
