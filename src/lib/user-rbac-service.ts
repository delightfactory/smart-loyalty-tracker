
import { supabase } from '@/integrations/supabase/client';
import {
  UUID,
  Permission,
  Role,
  User,
  IUserService,
  IRoleService,
  IPermissionService,
} from './auth-rbac-types';

/**
 * خدمة إدارة المستخدمين - تتعامل مع إدارة المستخدمين وأدوارهم وصلاحياتهم
 */
export class UserService implements IUserService {
  /**
   * الحصول على جميع المستخدمين مع أدوارهم وصلاحياتهم
   */
  async getAllUsers(): Promise<User[]> {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        position,
        avatar_url,
        created_at
      `);

    if (error) throw error;

    // جلب بيانات آخر تسجيل دخول من جدول auth.users
    // ملاحظة: يتطلب هذا صلاحيات خاصة على مستوى قاعدة البيانات أو استخدام RPC
    
    const users = await Promise.all(
      profiles.map(async (profile) => {
        // جلب أدوار المستخدم
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', profile.id);

        if (rolesError) throw rolesError;

        // جلب تفاصيل الأدوار مع الصلاحيات
        const roles: Role[] = [];
        
        for (const userRole of userRoles) {
          if (!userRole.role_id) continue;
          
          const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id, name, description')
            .eq('id', userRole.role_id)
            .single();
            
          if (roleError) continue;
          
          // جلب صلاحيات الدور
          const { data: rolePerms, error: permError } = await supabase
            .from('role_permissions')
            .select('permission_id')
            .eq('role_id', roleData.id);
            
          if (permError) continue;
          
          // جلب تفاصيل الصلاحيات
          const permissions: Permission[] = [];
          
          for (const rp of rolePerms) {
            const { data: permData, error: permDetailsError } = await supabase
              .from('permissions')
              .select('id, name, description')
              .eq('id', rp.permission_id)
              .single();
              
            if (permDetailsError) continue;
            
            permissions.push(permData as Permission);
          }
          
          roles.push({
            ...roleData,
            permissions
          } as Role);
        }

        // جلب صلاحيات المستخدم المباشرة
        const { data: userPermissions, error: userPermError } = await supabase
          .from('user_permissions')
          .select('permission_id')
          .eq('user_id', profile.id);
          
        if (userPermError) throw userPermError;

        // جلب تفاصيل الصلاحيات المباشرة
        const directPermissions: Permission[] = [];
        
        for (const up of (userPermissions || [])) {
          const { data: permData, error: permError } = await supabase
            .from('permissions')
            .select('id, name, description')
            .eq('id', up.permission_id)
            .single();
            
          if (permError) continue;
          
          directPermissions.push(permData as Permission);
        }

        // جلب معلومات آخر تسجيل دخول (إذا كانت متاحة)
        // نظرًا لأن هذه المعلومات غير متاحة مباشرة، يمكن تركها فارغة أو استخدام RPC
        
        return {
          id: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatar_url,
          isActive: true, // يمكن إضافة حقل في الملف الشخصي لحالة نشاط المستخدم
          position: profile.position,
          createdAt: profile.created_at,
          lastSignInAt: null, // بحاجة إلى طريقة لجلب هذه المعلومة
          roles,
          permissions: directPermissions
        } as User;
      })
    );

    return users;
  }

  /**
   * الحصول على مستخدم محدد بواسطة معرفه
   */
  async getUserById(id: UUID): Promise<User | null> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        position,
        avatar_url,
        created_at
      `)
      .eq('id', id)
      .single();

    if (error) return null;

    // جلب أدوار المستخدم
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', profile.id);

    if (rolesError) throw rolesError;

    // جلب تفاصيل الأدوار مع الصلاحيات
    const roles: Role[] = [];
    
    for (const userRole of userRoles) {
      if (!userRole.role_id) continue;
      
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id, name, description')
        .eq('id', userRole.role_id)
        .single();
        
      if (roleError) continue;
      
      // جلب صلاحيات الدور
      const { data: rolePerms, error: permError } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleData.id);
        
      if (permError) continue;
      
      // جلب تفاصيل الصلاحيات
      const permissions: Permission[] = [];
      
      for (const rp of rolePerms) {
        const { data: permData, error: permDetailsError } = await supabase
          .from('permissions')
          .select('id, name, description')
          .eq('id', rp.permission_id)
          .single();
          
        if (permDetailsError) continue;
        
        permissions.push(permData as Permission);
      }
      
      roles.push({
        ...roleData,
        permissions
      } as Role);
    }

    // جلب صلاحيات المستخدم المباشرة
    const { data: userPermissions, error: userPermError } = await supabase
      .from('user_permissions')
      .select('permission_id')
      .eq('user_id', profile.id);
      
    if (userPermError) throw userPermError;

    // جلب تفاصيل الصلاحيات المباشرة
    const directPermissions: Permission[] = [];
    
    for (const up of (userPermissions || [])) {
      const { data: permData, error: permError } = await supabase
        .from('permissions')
        .select('id, name, description')
        .eq('id', up.permission_id)
        .single();
        
      if (permError) continue;
      
      directPermissions.push(permData as Permission);
    }

    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      isActive: true,
      position: profile.position,
      createdAt: profile.created_at,
      lastSignInAt: null,
      roles,
      permissions: directPermissions
    } as User;
  }

  /**
   * إنشاء مستخدم جديد
   */
  async createUser(user: Partial<User>): Promise<User> {
    // في الواقع، هذه الدالة ستكون أكثر تعقيدًا لأنها ستحتاج إلى إنشاء مستخدم في نظام المصادقة أولاً
    // ثم إنشاء ملف تعريف له، لكن هنا نفترض أن المستخدم موجود بالفعل في نظام المصادقة
    
    // إنشاء أو تحديث الملف الشخصي
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id!,
        full_name: user.fullName!,
        email: user.email,
        phone: user.phone || null,
        position: user.position || null,
        avatar_url: user.avatarUrl || null
      })
      .select()
      .single();

    if (error) throw error;

    // إنشاء مستخدم جديد (نسخة بسيطة)
    const newUser: User = {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email || '',
      phone: profile.phone || null,
      isActive: true,
      position: profile.position || null,
      avatarUrl: profile.avatar_url || null,
      createdAt: profile.created_at,
      lastSignInAt: null,
      roles: [],
      permissions: []
    };

    // إذا تم تحديد أدوار، قم بإضافتها
    if (user.roles && user.roles.length > 0) {
      await this.setUserRoles(newUser.id, user.roles.map(role => role.id));
      newUser.roles = user.roles;
    }

    // إذا تم تحديد صلاحيات مباشرة، قم بإضافتها
    if (user.permissions && user.permissions.length > 0) {
      await this.setUserPermissions(newUser.id, user.permissions.map(perm => perm.id));
      newUser.permissions = user.permissions;
    }

    return newUser;
  }

  /**
   * تحديث بيانات مستخدم
   */
  async updateUser(id: UUID, updates: Partial<User>): Promise<User> {
    // تحديث الملف الشخصي
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.fullName,
        email: updates.email,
        phone: updates.phone,
        position: updates.position,
        avatar_url: updates.avatarUrl
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const user = await this.getUserById(id);
    if (!user) throw new Error('User not found');

    // إذا تم تحديد أدوار، قم بتحديثها
    if (updates.roles) {
      await this.setUserRoles(id, updates.roles.map(role => role.id));
      user.roles = updates.roles;
    }

    // إذا تم تحديد صلاحيات مباشرة، قم بتحديثها
    if (updates.permissions) {
      await this.setUserPermissions(id, updates.permissions.map(perm => perm.id));
      user.permissions = updates.permissions;
    }

    // قم بتحديث البيانات الأخرى
    Object.assign(user, {
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      position: profile.position,
      avatarUrl: profile.avatar_url
    });

    return user;
  }

  /**
   * حذف مستخدم
   */
  async deleteUser(id: UUID): Promise<void> {
    // حذف أدوار المستخدم أولاً
    const { error: roleErr } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', id);

    if (roleErr) throw roleErr;

    // حذف صلاحيات المستخدم المباشرة
    const { error: permErr } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', id);

    if (permErr) throw permErr;

    // حذف الملف الشخصي
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // ملاحظة: حذف المستخدم من نظام المصادقة يتطلب صلاحيات خاصة
    // يمكن استخدام API وظائف مخصصة لهذه العملية
  }

  /**
   * تعيين أدوار المستخدم
   */
  async setUserRoles(userId: UUID, roleIds: UUID[]): Promise<void> {
    // حذف الأدوار الحالية للمستخدم
    const { error: deleteErr } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteErr) throw deleteErr;

    // لا تضيف أي أدوار إذا كانت القائمة فارغة
    if (roleIds.length === 0) return;

    // إضافة الأدوار الجديدة
    const userRoles = roleIds.map(roleId => ({
      user_id: userId,
      role_id: roleId
    }));

    const { error } = await supabase
      .from('user_roles')
      .insert(userRoles);

    if (error) throw error;
  }

  /**
   * تعيين صلاحيات المستخدم المباشرة
   */
  async setUserPermissions(userId: UUID, permissionIds: UUID[]): Promise<void> {
    // حذف الصلاحيات الحالية للمستخدم
    const { error: deleteErr } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId);

    if (deleteErr) throw deleteErr;

    // لا تضيف أي صلاحيات إذا كانت القائمة فارغة
    if (permissionIds.length === 0) return;

    // إضافة الصلاحيات الجديدة
    const userPermissions = permissionIds.map(permId => ({
      user_id: userId,
      permission_id: permId
    }));

    const { error } = await supabase
      .from('user_permissions')
      .insert(userPermissions);

    if (error) throw error;
  }
}

/**
 * خدمة إدارة الأدوار - تتعامل مع إدارة الأدوار وصلاحياتها
 */
export class RoleService implements IRoleService {
  /**
   * الحصول على جميع الأدوار مع صلاحياتها
   */
  async getAllRoles(): Promise<Role[]> {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('id, name, description');

    if (error) throw error;

    return Promise.all(roles.map(async role => {
      // جلب صلاحيات الدور
      const { data: rolePerms, error: rpError } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id);

      if (rpError) throw rpError;

      // جلب تفاصيل الصلاحيات
      const permissions: Permission[] = [];
      
      for (const rp of rolePerms) {
        const { data: permData, error: permError } = await supabase
          .from('permissions')
          .select('id, name, description')
          .eq('id', rp.permission_id)
          .single();
          
        if (permError) continue;
        
        permissions.push(permData as Permission);
      }

      return {
        id: role.id,
        name: role.name,
        description: role.description || undefined,
        permissions
      } as Role;
    }));
  }

  /**
   * الحصول على دور محدد بواسطة معرفه
   */
  async getRoleById(id: UUID): Promise<Role | null> {
    const { data: role, error } = await supabase
      .from('roles')
      .select('id, name, description')
      .eq('id', id)
      .single();

    if (error) return null;

    // جلب صلاحيات الدور
    const { data: rolePerms, error: rpError } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', role.id);

    if (rpError) throw rpError;

    // جلب تفاصيل الصلاحيات
    const permissions: Permission[] = [];
    
    for (const rp of rolePerms) {
      const { data: permData, error: permError } = await supabase
        .from('permissions')
        .select('id, name, description')
        .eq('id', rp.permission_id)
        .single();
        
      if (permError) continue;
      
      permissions.push(permData as Permission);
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description || undefined,
      permissions
    } as Role;
  }

  /**
   * إنشاء دور جديد
   */
  async createRole(role: Partial<Role>): Promise<Role> {
    const { data: newRole, error } = await supabase
      .from('roles')
      .insert({
        name: role.name!,
        description: role.description || null
      })
      .select()
      .single();

    if (error) throw error;

    const createdRole: Role = {
      id: newRole.id,
      name: newRole.name,
      description: newRole.description || undefined,
      permissions: []
    };

    // إذا تم تحديد صلاحيات، قم بإضافتها
    if (role.permissions && role.permissions.length > 0) {
      await this.setRolePermissions(createdRole.id, role.permissions.map(p => p.id));
      createdRole.permissions = role.permissions;
    }

    return createdRole;
  }

  /**
   * تحديث بيانات دور
   */
  async updateRole(id: UUID, updates: Partial<Role>): Promise<Role> {
    const { data: updatedRole, error } = await supabase
      .from('roles')
      .update({
        name: updates.name,
        description: updates.description || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const role = await this.getRoleById(id);
    if (!role) throw new Error('Role not found');

    // إذا تم تحديد صلاحيات، قم بتحديثها
    if (updates.permissions) {
      await this.setRolePermissions(id, updates.permissions.map(p => p.id));
      role.permissions = updates.permissions;
    }

    // قم بتحديث البيانات الأخرى
    role.name = updatedRole.name;
    role.description = updatedRole.description || undefined;

    return role;
  }

  /**
   * حذف دور
   */
  async deleteRole(id: UUID): Promise<void> {
    // حذف علاقات الدور بالصلاحيات أولاً
    const { error: rpError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    if (rpError) throw rpError;

    // حذف علاقات الدور بالمستخدمين
    const { error: urError } = await supabase
      .from('user_roles')
      .delete()
      .eq('role_id', id);

    if (urError) throw urError;

    // حذف الدور نفسه
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * تعيين صلاحيات الدور
   */
  async setRolePermissions(roleId: UUID, permissionIds: UUID[]): Promise<void> {
    // حذف الصلاحيات الحالية للدور
    const { error: deleteErr } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (deleteErr) throw deleteErr;

    // لا تضيف أي صلاحيات إذا كانت القائمة فارغة
    if (permissionIds.length === 0) return;

    // إضافة الصلاحيات الجديدة
    const rolePermissions = permissionIds.map(permId => ({
      role_id: roleId,
      permission_id: permId
    }));

    const { error } = await supabase
      .from('role_permissions')
      .insert(rolePermissions);

    if (error) throw error;
  }
}

/**
 * خدمة إدارة الصلاحيات - تتعامل مع إدارة الصلاحيات
 */
export class PermissionService implements IPermissionService {
  /**
   * الحصول على جميع الصلاحيات
   */
  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*');

    if (error) throw error;

    return data.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined
    }));
  }

  /**
   * الحصول على صلاحية محددة بواسطة معرفها
   */
  async getPermissionById(id: UUID): Promise<Permission | null> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined
    };
  }

  /**
   * إنشاء صلاحية جديدة
   */
  async createPermission(permission: Partial<Permission>): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .insert({
        name: permission.name!,
        description: permission.description || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined
    };
  }

  /**
   * تحديث بيانات صلاحية
   */
  async updatePermission(id: UUID, updates: Partial<Permission>): Promise<Permission> {
    const { data, error } = await supabase
      .from('permissions')
      .update({
        name: updates.name,
        description: updates.description || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined
    };
  }

  /**
   * حذف صلاحية
   */
  async deletePermission(id: UUID): Promise<void> {
    // حذف علاقات الصلاحية بالأدوار أولاً
    const { error: rpError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('permission_id', id);

    if (rpError) throw rpError;

    // حذف علاقات الصلاحية بالمستخدمين
    const { error: upError } = await supabase
      .from('user_permissions')
      .delete()
      .eq('permission_id', id);

    if (upError) throw upError;

    // حذف الصلاحية نفسها
    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// إنشاء نسخ من الخدمات للاستخدام في التطبيق
export const userService = new UserService();
export const roleService = new RoleService();
export const permissionService = new PermissionService();
