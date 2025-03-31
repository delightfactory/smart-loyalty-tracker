
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole, UserProfile } from '@/lib/auth-types';
import { 
  getAllUsers, 
  addRoleToUser, 
  removeRoleFromUser,
  getUserById,
  createUser
} from '@/services/users';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronDown, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  UserCog,
  Loader2,
  UserPlus,
  AlertTriangle
} from 'lucide-react';

const Users = () => {
  const { user, hasRole, isAuthenticated, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminCheckDone, setIsAdminCheckDone] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: UserRole.USER
  });
  
  useEffect(() => {
    console.log("Auth state:", { isAuthenticated, roles, user });
    checkAdminAccess();
  }, [isAuthenticated, roles, user]);
  
  const checkAdminAccess = async () => {
    try {
      if (isAuthenticated) {
        // توضيح عملية فحص صلاحية المسؤول بشكل أفضل
        const adminCheck = hasRole(UserRole.ADMIN);
        console.log("Admin access check result:", adminCheck);
        console.log("Current roles:", roles);
        
        setIsAdmin(adminCheck);
        setIsAdminCheckDone(true);
        
        if (!adminCheck) {
          toast({
            title: "غير مصرح",
            description: "ليس لديك صلاحيات كافية للوصول إلى هذه الصفحة",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        await fetchUsers();
      }
    } catch (error: any) {
      console.error('Error checking admin access:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء التحقق من الصلاحيات",
        variant: "destructive"
      });
      setIsAdminCheckDone(true);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      console.log("Fetched users:", data);
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء جلب المستخدمين",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await createUser({
        email: newUser.email,
        password: newUser.password,
        fullName: newUser.fullName,
        role: newUser.role
      });
      
      await fetchUsers();
      
      setIsAddUserOpen(false);
      setNewUser({
        email: '',
        password: '',
        fullName: '',
        role: UserRole.USER
      });
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المستخدم بنجاح",
      });
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editUser, setEditUser] = useState({
    fullName: '',
    role: UserRole.USER
  });
  
  const openEditUser = (user: UserProfile) => {
    setCurrentUser(user);
    setEditUser({
      fullName: user.fullName,
      role: user.roles[0] || UserRole.USER,
    });
    setIsEditUserOpen(true);
  };
  
  const handleEditUser = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      // تحديث الاسم في ملف التعريف
      await updateUserProfile({
        id: currentUser.id,
        fullName: editUser.fullName
      });
      
      // إذا تغير الدور، قم بتحديثه
      if (!currentUser.roles.includes(editUser.role)) {
        await updateUserRoles(currentUser.id, [editUser.role]);
      }
      
      await fetchUsers();
      
      setIsEditUserOpen(false);
      
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المستخدم بنجاح",
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddRole = async (userId: string, role: UserRole) => {
    try {
      await addRoleToUser(userId, role);
      
      setUsers(users.map(user => {
        if (user.id === userId) {
          if (!user.roles.includes(role)) {
            return { ...user, roles: [...user.roles, role] };
          }
        }
        return user;
      }));
      
      toast({
        title: "تم بنجاح",
        description: `تم إضافة دور ${role} للمستخدم`,
      });
    } catch (error: any) {
      console.error('Error adding role:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة الدور",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveRole = async (userId: string, role: UserRole) => {
    try {
      await removeRoleFromUser(userId, role);
      
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, roles: user.roles.filter(r => r !== role) };
        }
        return user;
      }));
      
      toast({
        title: "تم بنجاح",
        description: `تم إزالة دور ${role} من المستخدم`,
      });
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إزالة الدور",
        variant: "destructive"
      });
    }
  };
  
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsLoading(true);
      
      await deleteUser(userToDelete);
      
      setUsers(users.filter(user => user.id !== userToDelete));
      
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      
      toast({
        title: "تم بنجاح",
        description: "تم حذف المستخدم بنجاح",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-500";
      case UserRole.MANAGER:
        return "bg-blue-500";
      case UserRole.ACCOUNTANT:
        return "bg-green-500";
      case UserRole.SALES:
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <ShieldAlert className="h-4 w-4 mr-2" />;
      case UserRole.MANAGER:
        return <ShieldCheck className="h-4 w-4 mr-2" />;
      case UserRole.ACCOUNTANT:
        return <Shield className="h-4 w-4 mr-2" />;
      case UserRole.SALES:
        return <UserCog className="h-4 w-4 mr-2" />;
      default:
        return <ShieldX className="h-4 w-4 mr-2" />;
    }
  };
  
  const getNameInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // كود مستورد من services/users.ts للتوافق
  const updateUserProfile = async (profile: Partial<UserProfile> & { id: string }): Promise<UserProfile> => {
    try {
      const { id, fullName, avatarUrl, phone, position } = profile;
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          phone: phone,
          position: position
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // استرجاع الأدوار
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', id);
        
      if (rolesError) throw rolesError;
      
      const userRoles = rolesData.map(r => r.role as UserRole);
      
      return {
        id: data.id,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        phone: data.phone,
        position: data.position,
        roles: userRoles
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };
  
  const updateUserRoles = async (userId: string, roles: UserRole[]): Promise<void> => {
    try {
      // حذف جميع الأدوار الحالية
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // إذا كانت الأدوار فارغة، توقف هنا
      if (!roles.length) return;
      
      // إضافة الأدوار الجديدة
      const rolesToInsert = roles.map(role => ({
        user_id: userId,
        role: role
      }));
      
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(rolesToInsert);
        
      if (insertError) throw insertError;
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  };
  
  const deleteUser = async (userId: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };
  
  // إضافة استيراد supabase
  const { supabase } = require('@/integrations/supabase/client');
  
  if (!isAdminCheckDone) {
    return (
      <PageContainer 
        title="إدارة المستخدمين" 
        subtitle="جاري التحميل..."
      >
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }
  
  if (!isAdmin) {
    return (
      <PageContainer 
        title="إدارة المستخدمين" 
        subtitle="غير مصرح بالوصول"
      >
        <div className="h-[400px] flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="w-16 h-16 text-amber-500" />
          <h2 className="text-2xl font-bold">ليس لديك صلاحيات كافية</h2>
          <p className="text-muted-foreground">
            يتطلب الوصول إلى هذه الصفحة صلاحيات المسؤول.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            العودة إلى لوحة التحكم
          </Button>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer 
      title="إدارة المستخدمين" 
      subtitle="إدارة المستخدمين وصلاحياتهم"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <UserCog className="h-5 w-5 mr-2" />
            المستخدمين
          </h2>
          
          <div className="flex gap-2">
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  إضافة مستخدم جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                  <DialogDescription>
                    أضف مستخدم جديد وحدد صلاحياته
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-4">
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
                        minLength={6}
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
                          <SelectItem value={UserRole.ADMIN}>مدير</SelectItem>
                          <SelectItem value={UserRole.MANAGER}>مشرف</SelectItem>
                          <SelectItem value={UserRole.ACCOUNTANT}>محاسب</SelectItem>
                          <SelectItem value={UserRole.SALES}>مبيعات</SelectItem>
                          <SelectItem value={UserRole.USER}>مستخدم عادي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={handleAddUser} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      'إضافة المستخدم'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button onClick={fetchUsers} variant="outline" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                'تحديث القائمة'
              )}
            </Button>
          </div>
        </div>
        
        <Table>
          <TableCaption>قائمة بجميع المستخدمين في النظام</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>المسمى الوظيفي</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>الأدوار</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2">جاري تحميل البيانات...</p>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <p>لا يوجد مستخدمين</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl || ''} />
                        <AvatarFallback>{getNameInitials(user.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.position || '-'}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <Badge key={role} variant="outline" className={getRoleBadgeColor(role)}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          إدارة الأدوار
                          <ChevronDown className="h-4 w-4 mr-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => openEditUser(user)}>
                          تعديل المستخدم
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem disabled className="font-semibold">
                          إضافة دور
                        </DropdownMenuItem>
                        {Object.values(UserRole).map(role => (
                          <DropdownMenuItem
                            key={`add-${role}`}
                            disabled={user.roles.includes(role)}
                            onClick={() => handleAddRole(user.id, role)}
                          >
                            {getRoleIcon(role)}
                            إضافة دور {role}
                          </DropdownMenuItem>
                        ))}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem disabled className="font-semibold">
                          إزالة دور
                        </DropdownMenuItem>
                        {Object.values(UserRole).map(role => (
                          <DropdownMenuItem
                            key={`remove-${role}`}
                            disabled={!user.roles.includes(role)}
                            onClick={() => handleRemoveRole(user.id, role)}
                            className="text-red-500"
                          >
                            {getRoleIcon(role)}
                            إزالة دور {role}
                          </DropdownMenuItem>
                        ))}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                          onClick={() => {
                            setUserToDelete(user.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-500"
                        >
                          حذف المستخدم
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          {currentUser && (
            <>
              <DialogHeader>
                <DialogTitle>تعديل المستخدم</DialogTitle>
                <DialogDescription>
                  تعديل بيانات المستخدم {currentUser.fullName}
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
                  <Label htmlFor="edit-role">الصلاحية الرئيسية</Label>
                  <Select
                    value={editUser.role}
                    onValueChange={(value) => setEditUser({ ...editUser, role: value as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصلاحية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.ADMIN}>مدير</SelectItem>
                      <SelectItem value={UserRole.MANAGER}>مشرف</SelectItem>
                      <SelectItem value={UserRole.ACCOUNTANT}>محاسب</SelectItem>
                      <SelectItem value={UserRole.SALES}>مبيعات</SelectItem>
                      <SelectItem value={UserRole.USER}>مستخدم عادي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEditUser} disabled={isLoading}>
                  {isLoading ? 'جاري التحديث...' : 'حفظ التغييرات'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={confirmDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? 'جاري الحذف...' : 'تأكيد الحذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default Users;
