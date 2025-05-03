
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Edit, Trash, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// واجهة إدارة الأدوار والصلاحيات
export default function RolesPermissionsManagement() {
  const { toast } = useToast();
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
  
  const [isLoading, setIsLoading] = useState(false);

  // جلب الأدوار والصلاحيات
  const loadData = async () => {
    setIsLoading(true);
    try {
      const rolesData = await getAllRoles();
      const permsData = await getAllPermissions();
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: error.message || "حدث خطأ أثناء جلب الأدوار والصلاحيات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  // إدارة الأدوار
  const handleSaveRole = async () => {
    if (!roleForm.name) {
      toast({
        title: "خطأ في حفظ الدور",
        description: "يجب إدخال اسم الدور",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editRoleId) {
        await updateRole(editRoleId, roleForm);
        toast({
          title: "تم تحديث الدور بنجاح",
        });
      } else {
        await createRole(roleForm.name, roleForm.description);
        toast({
          title: "تم إنشاء الدور بنجاح",
        });
      }
      setShowRoleDialog(false);
      setRoleForm({ name: '', description: '' });
      setEditRoleId(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ الدور",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = (role: any) => {
    setEditRoleId(role.id);
    setRoleForm({ name: role.name, description: role.description || '' });
    setShowRoleDialog(true);
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (name === 'admin') {
      toast({
        title: "لا يمكن حذف دور المسؤول",
        description: "دور المسؤول أساسي في النظام",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا الدور؟')) {
      setIsLoading(true);
      try {
        await deleteRole(id);
        toast({
          title: "تم حذف الدور بنجاح",
        });
        await loadData();
      } catch (error: any) {
        toast({
          title: "خطأ في حذف الدور",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // إدارة الصلاحيات
  const handleSavePerm = async () => {
    if (!permForm.name) {
      toast({
        title: "خطأ في حفظ الصلاحية",
        description: "يجب إدخال اسم الصلاحية",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editPermId) {
        await updatePermission(editPermId, permForm);
        toast({
          title: "تم تحديث الصلاحية بنجاح",
        });
      } else {
        await createPermission(permForm.name, permForm.description);
        toast({
          title: "تم إنشاء الصلاحية بنجاح",
        });
      }
      setShowPermDialog(false);
      setPermForm({ name: '', description: '' });
      setEditPermId(null);
      await loadData();
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ الصلاحية",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPerm = (perm: any) => {
    setEditPermId(perm.id);
    setPermForm({ name: perm.name, description: perm.description || '' });
    setShowPermDialog(true);
  };

  const handleDeletePerm = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الصلاحية؟')) {
      setIsLoading(true);
      try {
        await deletePermission(id);
        toast({
          title: "تم حذف الصلاحية بنجاح",
        });
        await loadData();
      } catch (error: any) {
        toast({
          title: "خطأ في حذف الصلاحية",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ربط الصلاحيات بالدور
  const handleManageRolePerms = async (role: any) => {
    setSelectedRole(role);
    setIsLoading(true);
    try {
      const perms = await getPermissionsForRole(role.id);
      setRolePerms(perms.map((p: any) => p.id || ''));
      setShowRolePermDialog(true);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل صلاحيات الدور",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRolePerms = async () => {
    if (selectedRole) {
      setIsLoading(true);
      try {
        await setPermissionsForRole(selectedRole.id, rolePerms);
        toast({
          title: "تم حفظ صلاحيات الدور بنجاح",
        });
        setShowRolePermDialog(false);
        setSelectedRole(null);
        await loadData();
      } catch (error: any) {
        toast({
          title: "خطأ في حفظ صلاحيات الدور",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !roles.length && !permissions.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* قسم إدارة الأدوار */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">إدارة الأدوار</h2>
            <Button onClick={() => { setEditRoleId(null); setRoleForm({ name: '', description: '' }); setShowRoleDialog(true); }}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة دور جديد
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      لا توجد أدوار
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-semibold">{role.name}</TableCell>
                      <TableCell>{role.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleManageRolePerms(role)}>
                            <Badge variant="outline" className="cursor-pointer">تعديل الصلاحيات</Badge>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id, role.name)} className="text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* قسم إدارة الصلاحيات */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">إدارة الصلاحيات</h2>
            <Button onClick={() => { setEditPermId(null); setPermForm({ name: '', description: '' }); setShowPermDialog(true); }}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة صلاحية جديدة
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      لا توجد صلاحيات
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell className="font-semibold">{perm.name}</TableCell>
                      <TableCell>{perm.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPerm(perm)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePerm(perm.id)} className="text-destructive">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* نافذة حوار إضافة/تعديل دور */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRoleId ? 'تعديل الدور' : 'إضافة دور جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">اسم الدور</Label>
              <Input
                id="role-name"
                placeholder="اسم الدور"
                value={roleForm.name}
                onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">وصف الدور</Label>
              <Input
                id="role-desc"
                placeholder="وصف الدور"
                value={roleForm.description}
                onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)} disabled={isLoading}>إلغاء</Button>
            <Button onClick={handleSaveRole} disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة حوار إضافة/تعديل صلاحية */}
      <Dialog open={showPermDialog} onOpenChange={setShowPermDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPermId ? 'تعديل الصلاحية' : 'إضافة صلاحية جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="perm-name">اسم الصلاحية</Label>
              <Input
                id="perm-name"
                placeholder="اسم الصلاحية"
                value={permForm.name}
                onChange={e => setPermForm({ ...permForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perm-desc">وصف الصلاحية</Label>
              <Input
                id="perm-desc"
                placeholder="وصف الصلاحية"
                value={permForm.description}
                onChange={e => setPermForm({ ...permForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermDialog(false)} disabled={isLoading}>إلغاء</Button>
            <Button onClick={handleSavePerm} disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة حوار إدارة صلاحيات الدور */}
      <Dialog open={showRolePermDialog} onOpenChange={setShowRolePermDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إدارة صلاحيات الدور: {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="max-h-[300px] overflow-y-auto border rounded-md p-4">
              {permissions.length === 0 ? (
                <p className="text-center text-muted-foreground">لا توجد صلاحيات متاحة</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`perm-${perm.id}`}
                        checked={rolePerms.includes(perm.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRolePerms([...rolePerms, perm.id]);
                          } else {
                            setRolePerms(rolePerms.filter(pid => pid !== perm.id));
                          }
                        }}
                      />
                      <Label htmlFor={`perm-${perm.id}`} className="cursor-pointer flex-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-medium">{perm.name}</span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{perm.description || 'بدون وصف'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRolePermDialog(false)} disabled={isLoading}>إلغاء</Button>
            <Button onClick={handleSaveRolePerms} disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
