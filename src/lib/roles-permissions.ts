// roles-permissions.ts
// تعريف جميع الأدوار والصلاحيات المرتبطة بها بشكل مركزي

export type Permission =
  | 'manage_users'
  | 'view_reports'
  | 'edit_settings'
  | 'delete_data'
  | 'create_invoice'
  | 'manage_products'
  | 'manage_customers';

export const ROLES_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'manage_users',
    'view_reports',
    'edit_settings',
    'delete_data',
    'create_invoice',
    'manage_products',
    'manage_customers',
  ],
  manager: [
    'view_reports',
    'edit_settings',
    'create_invoice',
    'manage_products',
    'manage_customers',
  ],
  accountant: [
    'view_reports',
    'create_invoice',
  ],
  sales: [
    'create_invoice',
  ],
  user: [],
};

// دالة مساعدة لجلب صلاحيات دور معين
export function getPermissionsForRole(role: string): Permission[] {
  return ROLES_PERMISSIONS[role] || [];
}
