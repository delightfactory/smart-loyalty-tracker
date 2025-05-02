
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardHeader, CardContent, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, Plus, User, UserCog, Trash, UserX } from 'lucide-react';

import { userService, roleService } from '@/lib/user-rbac-service';
import { User as UserType, Role } from '@/lib/auth-rbac-types';
import { formatDate } from '@/lib/utils';

export function UserManagementPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // استعلام لجلب جميع المستخدمين
  const { 
    data: users = [], 
    isLoading: usersLoading,
    isError: usersError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });

  // استعلام لجلب جميع الأدوار
  const { 
    data: roles = [], 
    isLoading: rolesLoading,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAllRoles(),
  });

  // تطبيق البحث على المستخدمين
  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // تحديث أدوار المستخدم
  const updateUserRolesMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string, roleIds: string[] }) => 
      userService.setUserRoles(userId, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "تم تحديث أدوار المستخدم بنجاح",
        description: "تم تحديث صلاحيات المستخدم",
      });
      setIsEditUserOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ أثناء تحديث أدوار المستخدم",
        description: error.message,
      });
    },
  });

  // حذف المستخدم
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "تم حذف المستخدم بنجاح",
        description: "تم حذف المستخدم وجميع بياناته من النظام",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ أثناء حذف المستخدم",
        description: error.message,
      });
    },
  });

  // التعامل مع فتح نموذج تعديل المستخدم
  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles.map(role => role.id));
    setIsEditUserOpen(true);
  };

  // التعامل مع تحديث أدوار المستخدم
  const handleUpdateUserRoles = () => {
    if (!selectedUser) return;
    
    updateUserRolesMutation.mutate({
      userId: selectedUser.id,
      roleIds: selectedRoles
    });
  };

  // التعامل مع التبديل بين اختيار الأدوار
  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  // الحصول على الحروف الأولى من الاسم للصورة الرمزية
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن مستخدم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => console.log('Add user functionality to be implemented')}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* قائمة المستخدمين */}
      <Card>
        <CardHeader>
          <CardTitle>المستخدمين</CardTitle>
          <CardDescription>
            قائمة بجميع المستخدمين في النظام وأدوارهم
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : usersError ? (
            <div className="text-center py-4 text-destructive">
              حدث خطأ أثناء تحميل بيانات المستخدمين، يرجى المحاولة لاحقًا
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <>
                  <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>لا توجد نتائج مطابقة لـ "{searchQuery}"</p>
                </>
              ) : (
                <>
                  <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>لا يوجد مستخدمين حتى الآن</p>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الأدوار</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>آخر تسجيل دخول</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{user.fullName}</div>
                        {user.phone && (
                          <div className="text-sm text-muted-foreground">{user.phone}</div>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map(role => (
                              <Badge key={role.id} variant="outline">{role.name}</Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="bg-gray-100">
                              مستخدم عادي
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt || '')}</TableCell>
                      <TableCell>{user.lastSignInAt ? formatDate(user.lastSignInAt) : 'غير متاح'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(user)}
                            title="إدارة أدوار المستخدم"
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                title="حذف المستخدم"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم حذف المستخدم "{user.fullName}" وجميع بياناته من النظام.
                                  هذا الإجراء لا يمكن التراجع عنه.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleteUserMutation.isPending && deleteUserMutation.variables === user.id && (
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

      {/* نافذة تعديل أدوار المستخدم */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إدارة أدوار المستخدم</DialogTitle>
            <DialogDescription>
              تعديل أدوار المستخدم "{selectedUser?.fullName}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser?.avatarUrl || undefined} />
                  <AvatarFallback>
                    {selectedUser?.fullName ? getInitials(selectedUser.fullName) : 'N/A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedUser?.fullName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-base">الأدوار</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  حدد الأدوار التي سيتم منحها لهذا المستخدم
                </p>
              </div>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {rolesLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id={`role-${role.id}`} 
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <Label 
                          htmlFor={`role-${role.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          <div>{role.name}</div>
                          {role.description && (
                            <div className="text-xs text-muted-foreground">{role.description}</div>
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
              onClick={handleUpdateUserRoles}
              disabled={updateUserRolesMutation.isPending}
            >
              {updateUserRolesMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
