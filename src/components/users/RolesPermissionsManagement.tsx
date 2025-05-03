import React, { useEffect, useState } from 'react';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionsForRole,
  setPermissionsForRole
} from '@/services/roles-permissions-api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// واجهة إدارة الأدوار والصلاحيات
export default function RolesPermissionsManagement() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [editRoleId, setEditRoleId] = useState<string | null>(null);

  const [showPermDialog, setShowPermDialog] = useState(false);
  const [permForm, setPermForm] = useState({ name: '', description: '' });
  const [editPermId, setEditPermId] = useState<string | null>(null);

  const [showRolePermDialog, setShowRolePermDialog] = useState(false);
  const [rolePerms, setRolePerms] = useState<string[]>([]);

  // جلب الأدوار والصلاحيات
  const loadData = async () => {
    setRoles(await getAllRoles());
    setPermissions(await getAllPermissions());
  };
  useEffect(() => { loadData(); }, []);

  // إدارة الأدوار
  const handleSaveRole = async () => {
    if (editRoleId) {
      await updateRole(editRoleId, roleForm);
    } else {
      await createRole(roleForm.name, roleForm.description);
    }
    setShowRoleDialog(false);
    setRoleForm({ name: '', description: '' });
    setEditRoleId(null);
    loadData();
  };
  const handleEditRole = (role: any) => {
    setEditRoleId(role.id);
    setRoleForm({ name: role.name, description: role.description });
    setShowRoleDialog(true);
  };
  const handleDeleteRole = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف الدور؟')) {
      await deleteRole(id);
      loadData();
    }
  };

  // إدارة الصلاحيات
  const handleSavePerm = async () => {
    if (editPermId) {
      await updatePermission(editPermId, permForm);
    } else {
      await createPermission(permForm.name, permForm.description);
    }
    setShowPermDialog(false);
    setPermForm({ name: '', description: '' });
    setEditPermId(null);
    loadData();
  };
  const handleEditPerm = (perm: any) => {
    setEditPermId(perm.id);
    setPermForm({ name: perm.name, description: perm.description });
    setShowPermDialog(true);
  };
  const handleDeletePerm = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف الصلاحية؟')) {
      await deletePermission(id);
      loadData();
    }
  };

  // ربط الصلاحيات بالدور
  const handleManageRolePerms = async (role: any) => {
    setSelectedRole(role);
    const perms = await getPermissionsForRole(role.id);
    setRolePerms(perms.map((p: any) => p.id));
    setShowRolePermDialog(true);
  };
  const handleSaveRolePerms = async () => {
    if (selectedRole) {
      await setPermissionsForRole(selectedRole.id, rolePerms);
      setShowRolePermDialog(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="p-4 space-y-8">
      <h2 className="text-xl font-bold mb-4">إدارة الأدوار</h2>
      <Button onClick={() => setShowRoleDialog(true)}>إضافة دور جديد</Button>
      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الوصف</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>{role.description}</td>
              <td>
                <Button onClick={() => handleEditRole(role)}>تعديل</Button>
                <Button variant="destructive" onClick={() => handleDeleteRole(role.id)}>حذف</Button>
                <Button onClick={() => handleManageRolePerms(role)}>إدارة الصلاحيات</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mb-4 mt-12">إدارة الصلاحيات</h2>
      <Button onClick={() => setShowPermDialog(true)}>إضافة صلاحية جديدة</Button>
      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الوصف</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm.id}>
              <td>{perm.name}</td>
              <td>{perm.description}</td>
              <td>
                <Button onClick={() => handleEditPerm(perm)}>تعديل</Button>
                <Button variant="destructive" onClick={() => handleDeletePerm(perm.id)}>حذف</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dialogs */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRoleId ? 'تعديل الدور' : 'إضافة دور جديد'}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="اسم الدور"
            value={roleForm.name}
            onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="وصف الدور"
            value={roleForm.description}
            onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
          />
          <DialogFooter>
            <Button onClick={handleSaveRole}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPermDialog} onOpenChange={setShowPermDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPermId ? 'تعديل الصلاحية' : 'إضافة صلاحية جديدة'}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="اسم الصلاحية"
            value={permForm.name}
            onChange={e => setPermForm({ ...permForm, name: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="وصف الصلاحية"
            value={permForm.description}
            onChange={e => setPermForm({ ...permForm, description: e.target.value })}
          />
          <DialogFooter>
            <Button onClick={handleSavePerm}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog إدارة صلاحيات الدور */}
      <Dialog open={showRolePermDialog} onOpenChange={setShowRolePermDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إدارة صلاحيات الدور: {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {permissions.map((perm) => (
              <label key={perm.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rolePerms.includes(perm.id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setRolePerms([...rolePerms, perm.id]);
                    } else {
                      setRolePerms(rolePerms.filter(pid => pid !== perm.id));
                    }
                  }}
                />
                <span>{perm.name}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveRolePerms}>حفظ الصلاحيات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
