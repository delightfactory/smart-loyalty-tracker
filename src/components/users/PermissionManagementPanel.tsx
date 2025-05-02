
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardHeader, CardContent, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, Plus, Shield, Trash, Edit } from 'lucide-react';

import { permissionService } from '@/lib/user-rbac-service';
import { Permission } from '@/lib/auth-rbac-types';

export function PermissionManagementPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false);
  const [isEditPermissionOpen, setIsEditPermissionOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [permissionName, setPermissionName] = useState('');
  const [permissionDescription, setPermissionDescription] = useState('');

  // استعلام لجلب جميع الصلاحيات
  const { 
    data: permissions = [], 
    isLoading: permissionsLoading,
    isError: permissionsError,
    refetch: refetchPermissions
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getAllPermissions(),
  });

  // إنشاء صلاحية جديدة
  const createPermissionMutation = useMutation({
    mutationFn: (permission: Partial<Permission>) => permissionService.createPermission(permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast({
        title: "تم إنشاء الصلاحية بنجاح",
        description: "تم إضافة الصلاحية الجديدة إلى النظام",
      });
      resetPermissionForm();
      setIsCreatePermissionOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ أثناء إنشاء الصلاحية",
        description: error.message,
      });
    },
  });

  // تحديث صلاحية
  const updatePermissionMutation = useMutation({
    mutationFn: (permission: { id: string, updates: Partial<Permission> }) => 
      permissionService.updatePermission(permission.id, permission.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] }); // تحديث الأدوار أيضًا لأنها قد تتأثر
      toast({
        title: "تم تحديث الصلاحية بنجاح",
        description: "تم تحديث بيانات الصلاحية في النظام",
      });
      resetPermissionForm();
      setIsEditPermissionOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ أثناء تحديث الصلاحية",
        description: error.message,
      });
    },
  });

  // حذف صلاحية
  const deletePermissionMutation = useMutation({
    mutationFn: (id: string) => permissionService.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] }); // تحديث الأدوار أيضًا لأنها قد تتأثر
      toast({
        title: "تم حذف الصلاحية بنجاح",
        description: "تم حذف الصلاحية من النظام",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ أثناء حذف الصلاحية",
        description: error.message,
      });
    },
  });

  // إعادة تعيين نموذج الصلاحية
  const resetPermissionForm = () => {
    setPermissionName('');
    setPermissionDescription('');
    setSelectedPermission(null);
  };

  // التعامل مع فتح نموذج تعديل الصلاحية
  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setPermissionName(permission.name);
    setPermissionDescription(permission.description || '');
    setIsEditPermissionOpen(true);
  };

  // التعامل مع إنشاء صلاحية جديدة
  const handleCreatePermission = () => {
    if (!permissionName.trim()) {
      toast({
        variant: "destructive",
        title: "اسم الصلاحية مطلوب",
        description: "يرجى إدخال اسم للصلاحية الجديدة",
      });
      return;
    }

    createPermissionMutation.mutate({
      name: permissionName,
      description: permissionDescription || undefined,
    });
  };

  // التعامل مع تحديث صلاحية
  const handleUpdatePermission = () => {
    if (!selectedPermission) return;
    if (!permissionName.trim()) {
      toast({
        variant: "destructive",
        title: "اسم الصلاحية مطلوب",
        description: "يرجى إدخال اسم للصلاحية",
      });
      return;
    }

    updatePermissionMutation.mutate({
      id: selectedPermission.id,
      updates: {
        name: permissionName,
        description: permissionDescription || undefined,
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الصلاحيات</h2>
        <Dialog open={isCreatePermissionOpen} onOpenChange={setIsCreatePermissionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة صلاحية جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>إنشاء صلاحية جديدة</DialogTitle>
              <DialogDescription>
                أضف صلاحية جديدة يمكن إضافتها للأدوار والمستخدمين
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="permissionName">اسم الصلاحية</Label>
                <Input 
                  id="permissionName" 
                  value={permissionName} 
                  onChange={e => setPermissionName(e.target.value)} 
                  placeholder="مثال: create.invoice" 
                />
                <p className="text-xs text-muted-foreground">
                  يفضل استخدام تنسيق مثل "عملية.كائن" - مثل "user.create" أو "invoice.update"
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="permissionDescription">وصف الصلاحية</Label>
                <Textarea 
                  id="permissionDescription" 
                  value={permissionDescription} 
                  onChange={e => setPermissionDescription(e.target.value)}
                  placeholder="وصف مختصر للصلاحية والغرض منها"
                  rows={3} 
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button 
                onClick={handleCreatePermission}
                disabled={createPermissionMutation.isPending}
              >
                {createPermissionMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إنشاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* قائمة الصلاحيات */}
      <Card>
        <CardHeader>
          <CardTitle>الصلاحيات</CardTitle>
          <CardDescription>
            قائمة بجميع الصلاحيات المتاحة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissionsLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : permissionsError ? (
            <div className="text-center py-4 text-destructive">
              حدث خطأ أثناء تحميل الصلاحيات، يرجى المحاولة لاحقًا
            </div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد صلاحيات حتى الآن</p>
              <p className="text-sm">قم بإضافة صلاحيات جديدة لتنظيم وصول المستخدمين للميزات</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الصلاحية</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead className="w-[120px] text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>{permission.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPermission(permission)}
                            title="تعديل الصلاحية"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                title="حذف الصلاحية"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من حذف هذه الصلاحية؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم إزالة الصلاحية "{permission.name}" من جميع الأدوار والمستخدمين.
                                  هذا الإجراء لا يمكن التراجع عنه.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePermissionMutation.mutate(permission.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deletePermissionMutation.isPending && deletePermissionMutation.variables === permission.id && (
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

      {/* نافذة تعديل الصلاحية */}
      <Dialog open={isEditPermissionOpen} onOpenChange={setIsEditPermissionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل الصلاحية</DialogTitle>
            <DialogDescription>
              تعديل بيانات الصلاحية
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editPermissionName">اسم الصلاحية</Label>
              <Input 
                id="editPermissionName" 
                value={permissionName} 
                onChange={e => setPermissionName(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground">
                يفضل استخدام تنسيق مثل "عملية.كائن" - مثل "user.create" أو "invoice.update"
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPermissionDescription">وصف الصلاحية</Label>
              <Textarea 
                id="editPermissionDescription" 
                value={permissionDescription} 
                onChange={e => setPermissionDescription(e.target.value)}
                rows={3} 
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdatePermission}
              disabled={updatePermissionMutation.isPending}
            >
              {updatePermissionMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تحديث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
