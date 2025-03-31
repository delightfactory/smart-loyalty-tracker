
// User Roles Enum
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  ACCOUNTANT = "accountant",
  SALES = "sales",
  USER = "user"
}

// Auth State Interface
export interface AuthState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  error: string | null;
}
