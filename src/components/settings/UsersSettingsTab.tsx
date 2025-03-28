
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Pencil, Trash } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/lib/auth-types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  id: string;
  email: string;
  profile: {
    full_name: string;
    phone?: string;
    position?: string;
  };
  roles: UserRole[];
  created_at: string;
  last_sign_in_at: string | null;
}

export function UsersSettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user' as UserRole,
  });
  const [editUser, setEditUser] = useState({
    fullName: '',
    role: 'user' as UserRole,
  });

  // جلب المستخدمين
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      // جلب معلومات المستخدم الإضافية
      const profiles = await supabase.from('profiles').select('*');
      const userRoles = await supabase.from('user_roles').select('*');
      
      return users.map(user => {
        const profile = profiles.data?.find(p => p.id === user.id) || { full_name: user.email };
        const roles = userRoles.data?.filter(r => r.user_id === user.id).map(r => r.role) || [];
        
        return {
          id: user.id,
          email: user.email,
          profile: {
            full_name: profile.full_name,
            phone: profile.phone,
            position: profile.position,
          },
          roles,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
        };
      });
    },
  });

  // إضافة مستخدم جديد
  const addUser = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: newUser.fullName,
        },
      });
      
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddUserOpen(false);
      setNewUser({
        email: '',
        password: '',
        fullName: '',
        role: 'user',
      });
      toast({
        title: "تم إضافة المستخدم",
        description: "تم إضافة المستخدم بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إضافة المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تعديل مستخدم
  const updateUser = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;
      
      // تحديث بيانات الملف الشخصي
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: editUser.fullName })
        .eq('id', currentUser.id);
      
      if (profileError) throw profileError;
      
      // تحديث الصلاحيات
      if (currentUser.roles.join(',') !== editUser.role) {
        // حذف الصلاحيات الحالية
        const { error: deleteRolesError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', currentUser.id);
        
        if (deleteRolesError) throw deleteRolesError;
        
        // إضافة الصلاحية الجديدة
        const { error: addRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: currentUser.id,
            role: editUser.role,
          });
        
        if (addRoleError) throw addRoleError;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditUserOpen(false);
      setCurrentUser(null);
      toast({
        title: "تم تحديث المستخدم",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // حذف مستخدم
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "تم حذف المستخدم",
        description: "تم حذف المستخدم بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في حذف المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openEditUser = (user: UserData) => {
    setCurrentUser(user);
    setEditUser({
      fullName: user.profile.full_name,
      role: user.roles[0] || 'user',
    });
    setIsEditUserOpen(true);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser.mutate();
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة المستخدمين</CardTitle>
        <CardDescription>إضافة وتعديل وحذف مستخدمي النظام</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end mb-4">
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <User className="ml-2 h-4 w-4" />
                إضافة مستخدم جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddUserSubmit}>
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                  <DialogDescription>
                    أضف مستخدم جديد للنظام وحدد صلاحياته
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input
                      id="fullName"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">الصلاحية</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصلاحية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مدير</SelectItem>
                        <SelectItem value="manager">مشرف</SelectItem>
                        <SelectItem value="accountant">محاسب</SelectItem>
                        <SelectItem value="sales">مبيعات</SelectItem>
                        <SelectItem value="user">مستخدم عادي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addUser.isPending}>
                    {addUser.isPending ? 'جاري الإضافة...' : 'إضافة المستخدم'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent>
              {currentUser && (
                <form onSubmit={handleEditUserSubmit}>
                  <DialogHeader>
                    <DialogTitle>تعديل المستخدم</DialogTitle>
                    <DialogDescription>
                      تعديل بيانات المستخدم {currentUser.email}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-fullName">الاسم الكامل</Label>
                      <Input
                        id="edit-fullName"
                        value={editUser.fullName}
                        onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-role">الصلاحية</Label>
                      <Select
                        value={editUser.role}
                        onValueChange={(value) => setEditUser({ ...editUser, role: value as UserRole })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصلاحية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">مدير</SelectItem>
                          <SelectItem value="manager">مشرف</SelectItem>
                          <SelectItem value="accountant">محاسب</SelectItem>
                          <SelectItem value="sales">مبيعات</SelectItem>
                          <SelectItem value="user">مستخدم عادي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={updateUser.isPending}>
                      {updateUser.isPending ? 'جاري التحديث...' : 'حفظ التغييرات'}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right p-2">اسم المستخدم</th>
                <th className="text-right p-2">البريد الإلكتروني</th>
                <th className="text-right p-2">الصلاحية</th>
                <th className="text-right p-2">تاريخ الإنشاء</th>
                <th className="text-right p-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    لا يوجد مستخدمين
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                    <td className="p-2">{user.profile.full_name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      {user.roles.includes("admin")
                        ? "مدير"
                        : user.roles.includes("manager")
                        ? "مشرف"
                        : user.roles.includes("accountant")
                        ? "محاسب"
                        : user.roles.includes("sales")
                        ? "مبيعات"
                        : "مستخدم عادي"}
                    </td>
                    <td className="p-2">
                      {new Date(user.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditUser(user)}
                        >
                          <Pencil className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              <Trash className="h-4 w-4 ml-1" />
                              حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد من حذف المستخدم؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المستخدم نهائياً من النظام.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteUser.mutate(user.id)}
                                disabled={deleteUser.isPending}
                              >
                                {deleteUser.isPending ? 'جاري الحذف...' : 'تأكيد الحذف'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
