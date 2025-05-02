
// RBAC Types for User, Role, Permission management

export type UUID = string;

// Permission entity (granular action)
export interface Permission {
  id: UUID;
  name: string; // e.g. 'user.create', 'invoice.view', 'settings.update'
  description?: string;
}

// Role entity (collection of permissions)
export interface Role {
  id: UUID;
  name: string; // e.g. 'admin', 'manager', 'sales'
  description?: string;
  permissions: Permission[]; // List of permissions assigned to this role
}

// User entity
export interface User {
  id: UUID;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastSignInAt?: string;
  roles: Role[]; // List of roles assigned to the user
  permissions?: Permission[]; // Optional: direct permissions for the user
  avatarUrl?: string;
  position?: string; // Added position field to fix TypeScript errors
}

// Assignment tables for DB (for Supabase/Postgres)
export interface UserRole {
  userId: UUID;
  roleId: UUID;
}

export interface RolePermission {
  roleId: UUID;
  permissionId: UUID;
}

export interface UserPermission {
  userId: UUID;
  permissionId: UUID;
}

// RBAC API interface (for service abstraction)
export interface IUserService {
  getAllUsers(): Promise<User[]>;
  getUserById(id: UUID): Promise<User | null>;
  createUser(user: Partial<User>): Promise<User>;
  updateUser(id: UUID, updates: Partial<User>): Promise<User>;
  deleteUser(id: UUID): Promise<void>;
  setUserRoles(userId: UUID, roleIds: UUID[]): Promise<void>;
  setUserPermissions(userId: UUID, permissionIds: UUID[]): Promise<void>;
}

export interface IRoleService {
  getAllRoles(): Promise<Role[]>;
  getRoleById(id: UUID): Promise<Role | null>;
  createRole(role: Partial<Role>): Promise<Role>;
  updateRole(id: UUID, updates: Partial<Role>): Promise<Role>;
  deleteRole(id: UUID): Promise<void>;
  setRolePermissions(roleId: UUID, permissionIds: UUID[]): Promise<void>;
}

export interface IPermissionService {
  getAllPermissions(): Promise<Permission[]>;
  getPermissionById(id: UUID): Promise<Permission | null>;
  createPermission(permission: Partial<Permission>): Promise<Permission>;
  updatePermission(id: UUID, updates: Partial<Permission>): Promise<Permission>;
  deletePermission(id: UUID): Promise<void>;
}

// Utility for checking permissions
export function userHasPermission(user: User, permissionName: string): boolean {
  const rolePerms = user.roles.flatMap(r => r.permissions.map(p => p.name));
  const directPerms = user.permissions?.map(p => p.name) || [];
  return [...rolePerms, ...directPerms].includes(permissionName);
}

export function userHasRole(user: User, roleName: string): boolean {
  return user.roles.some(r => r.name === roleName);
}
