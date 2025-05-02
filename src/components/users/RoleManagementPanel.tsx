
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardHeader, CardContent, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Shield, Trash, Edit, Users } from 'lucide-react';

import { roleService, permissionService } from '@/lib/user-rbac-service';
import { Role, Permission } from '@/lib/auth-rbac-types';

export function RoleManagementPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // استعلام لجلب جميع الأدوار
  const { 
    data: roles = [], 
    isLoading: rolesLoading,
    isError: rolesError,
    refetch: refetchRoles
  } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAllRoles(),
  });

  // استعلام لجلب جميع الصلاحيات
  const { 
    data: permissions = [], 
    isLoading: permissionsLoading,
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getAllPermissions(),
  });

  // إنشاء دور جديد
  const createRoleMutation = useMutation({
    mutationFn: (role: Partial<Role>) => roleService.createRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "تم إنشاء الدور بنجاح",
        description: "تم إضافة الدور الجديد إلى النظام",
      });
      resetRoleForm();
      setIsCreateRoleOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ أثناء إنشاء الدور",
        description: error.message,
      });
    },
  });

  // تحديث دور
  const updateRoleMutation = useMutation({
    mutationFn: (role: { id: string, updates: Partial<Role> }) => 
      roleService.updateRole(role.id, role.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "تم تحديث الدور بنجاح",
        description: "تم تحديث بيانات الدور في النظام",
      });
      resetRoleForm();
      setIsEditRoleOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ أثناء تحديث الدور",
        description: error.message,
      });
    },
  });

  // حذف دور
  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "تم حذف الدور بنجاح",
        description: "تم حذف الدور وجميع علاقاته من النظام",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ أثناء حذف الدور",
        description: error.message,
      });
    },
  });

  // إعادة تعيين نموذج الدور
  const resetRoleForm = () => {
    setNewRoleName('');
    setNewRoleDescription('');
    setSelectedPermissions([]);
    setSelectedRole(null);
  };

  // التعامل مع فتح نموذج تعديل الدور
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description || '');
    setSelectedPermissions(role.permissions.map(p => p.id));
    setIsEditRoleOpen(true);
  };

  // التعامل مع إنشاء دور جديد
  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast({
        variant: "destructive",
        title: "اسم الدور مطلوب",
        description: "يرجى إدخال اسم للدور الجديد",
      });
      return;
    }

    const selectedPerms = permissions.filter(p => 
      selectedPermissions.includes(p.id)
    );

    createRoleMutation.mutate({
      name: newRoleName,
      description: newRoleDescription || undefined,
      permissions: selectedPerms
    });
  };

  // التعامل مع تحديث دور
  const handleUpdateRole = () => {
    if (!selectedRole) return;
    if (!newRoleName.trim()) {
      toast({
        variant: "destructive",
        title: "اسم الدور مطلوب",
        description: "يرجى إدخال اسم للدور",
      });
      return;
    }

    const selectedPerms = permissions.filter(p => 
      selectedPermissions.includes(p.id)
    );

    updateRoleMutation.mutate({
      id: selectedRole.id,
      updates: {
        name: newRoleName,
        description: newRoleDescription || undefined,
        permissions: selectedPerms
      }
    });
  };

  // التعامل مع التبديل بين اختيار الصلاحيات
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الأدوار والصلاحيات</h2>
        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة دور جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>إنشاء دور جديد</DialogTitle>
              <DialogDescription>
                أضف دور جديد وحدد الصلاحيات التي سيمتلكها
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="roleName">اسم الدور</Label>
                <Input 
                  id="roleName" 
                  value={newRoleName} 
                  onChange={e => setNewRoleName(e.target.value)} 
                  placeholder="مثال: مدير المبيعات" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="roleDescription">وصف الدور</Label>
                <Textarea 
                  id="roleDescription" 
                  value={newRoleDescription} 
                  onChange={e => setNewRoleDescription(e.target.value)}
                  placeholder="وصف مختصر للدور وصلاحياته"
                  rows={3} 
                />
              </div>
              <div className="grid gap-2">
                <Label>الصلاحيات</Label>
                <div className="border rounded-md p-4 h-60 overflow-y-auto">
                  {permissionsLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox 
                            id={`perm-${permission.id}`} 
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <Label 
                            htmlFor={`perm-${permission.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            <div>{permission.name}</div>
                            {permission.description && (
                              <div className="text-xs text-muted-foreground">{permission.description}</div>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button 
                onClick={handleCreateRole}
                disabled={createRoleMutation.isPending}
              >
                {createRoleMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إنشاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* قائمة الأدوار */}
      <Card>
        <CardHeader>
          <CardTitle>الأدوار</CardTitle>
          <CardDescription>
            قائمة بجميع الأدوار المتاحة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rolesLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : rolesError ? (
            <div className="text-center py-4 text-destructive">
              حدث خطأ أثناء تحميل الأدوار، يرجى المحاولة لاحقًا
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد أدوار حتى الآن</p>
              <p className="text-sm">قم بإضافة أدوار جديدة للمساعدة في تنظيم صلاحيات المستخدمين</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الدور</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الصلاحيات</TableHead>
                    <TableHead>المستخدمين</TableHead>
                    <TableHead className="w-[120px] text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.length > 0 ? (
                            <span className="text-sm">
                              {role.permissions.length} صلاحية
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              لا توجد صلاحيات
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-muted-foreground ml-1" />
                          <span className="text-sm">يتم الحساب...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRole(role)}
                            title="تعديل الدور"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                title="حذف الدور"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من حذف هذا الدور؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم إزالة الدور "{role.name}" من جميع المستخدمين المرتبطين به وحذف جميع العلاقات به.
                                  هذا الإجراء لا يمكن التراجع عنه.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteRoleMutation.mutate(role.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleteRoleMutation.isPending && deleteRoleMutation.variables === role.id && (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                  )}
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة تعديل الدور */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل الدور</DialogTitle>
            <DialogDescription>
              تعديل بيانات الدور وصلاحياته
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editRoleName">اسم الدور</Label>
              <Input 
                id="editRoleName" 
                value={newRoleName} 
                onChange={e => setNewRoleName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editRoleDescription">وصف الدور</Label>
              <Textarea 
                id="editRoleDescription" 
                value={newRoleDescription} 
                onChange={e => setNewRoleDescription(e.target.value)}
                rows={3} 
              />
            </div>
            <div className="grid gap-2">
              <Label>الصلاحيات</Label>
              <div className="border rounded-md p-4 h-60 overflow-y-auto">
                {permissionsLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id={`edit-perm-${permission.id}`} 
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <Label 
                          htmlFor={`edit-perm-${permission.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          <div>{permission.name}</div>
                          {permission.description && (
                            <div className="text-xs text-muted-foreground">{permission.description}</div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تحديث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
