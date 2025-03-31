
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/auth-types';
import { 
  getAllUsers, 
  addRoleToUser, 
  removeRoleFromUser,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserRoles,
  deleteUser
} from '@/services/users';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  User, 
  Users, 
  Search, 
  Edit, 
  Trash, 
  Shield, 
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Users = () => {
  const { user, hasRole, isAuthenticated, roles } = useAuth();
  const navigate = useNavigate();
  
  // State for user management
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminCheckDone, setIsAdminCheckDone] = useState(false);
  
  // State for user dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Form state
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: UserRole.USER
  });
  
  const [editUser, setEditUser] = useState({
    fullName: '',
    role: UserRole.USER
  });
  
  // Check if user has admin access
  useEffect(() => {
    checkAdminAccess();
  }, [isAuthenticated, roles]);
  
  // Fetch users if admin
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);
  
  const checkAdminAccess = async () => {
    try {
      if (isAuthenticated) {
        const adminCheck = hasRole(UserRole.ADMIN);
        console.log("Admin access check result:", adminCheck);
        console.log("Current roles:", roles);
        
        setIsAdmin(adminCheck);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      setIsAdmin(false);
    } finally {
      setIsAdminCheckDone(true);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddUser = async () => {
    try {
      if (!newUser.email || !newUser.password || !newUser.fullName) {
        throw new Error("جميع الحقول مطلوبة");
      }
      
      await createUser({
        email: newUser.email,
        password: newUser.password,
        fullName: newUser.fullName,
        role: newUser.role
      });
      
      setNewUser({
        email: '',
        password: '',
        fullName: '',
        role: UserRole.USER
      });
      
      setIsAddDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error adding user:", error);
      alert(`خطأ: ${error.message}`);
    }
  };
  
  const handleEditUser = async () => {
    try {
      if (!currentUser || !editUser.fullName) {
        throw new Error("يرجى إدخال الاسم الكامل");
      }
      
      await updateUserProfile({
        id: currentUser.id,
        fullName: editUser.fullName
      });
      
      if (!currentUser.roles.includes(editUser.role)) {
        await updateUserRoles(currentUser.id, [editUser.role]);
      }
      
      setIsEditDialogOpen(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      alert(`خطأ: ${error.message}`);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(`خطأ: ${error.message}`);
    }
  };
  
  const openEditDialog = (user: UserProfile) => {
    setCurrentUser(user);
    setEditUser({
      fullName: user.fullName,
      role: user.roles[0] || UserRole.USER
    });
    setIsEditDialogOpen(true);
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800 border-red-300";
      case UserRole.MANAGER:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case UserRole.ACCOUNTANT:
        return "bg-green-100 text-green-800 border-green-300";
      case UserRole.SALES:
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "مدير";
      case UserRole.MANAGER:
        return "مشرف";
      case UserRole.ACCOUNTANT:
        return "محاسب";
      case UserRole.SALES:
        return "مبيعات";
      default:
        return "مستخدم";
    }
  };
  
  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  if (!isAdminCheckDone) {
    return (
      <PageContainer title="إدارة المستخدمين" subtitle="إدارة حسابات المستخدمين والصلاحيات">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center">
            <Skeleton className="h-16 w-16 rounded-full mb-4" />
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </PageContainer>
    );
  }
  
  if (!isAdmin) {
    return (
      <PageContainer title="إدارة المستخدمين" subtitle="إدارة حسابات المستخدمين والصلاحيات">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-yellow-100 p-3 mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">صلاحيات غير كافية</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                لا تملك الصلاحيات الكافية للوصول إلى صفحة إدارة المستخدمين.
                يرجى التواصل مع مدير النظام للحصول على الصلاحيات المطلوبة.
              </p>
              <Button onClick={() => navigate(-1)}>الرجوع للصفحة السابقة</Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title="إدارة المستخدمين" subtitle="إدارة حسابات المستخدمين والصلاحيات">
      <div className="flex flex-col space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="بحث عن مستخدم..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    إضافة مستخدم
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                    <DialogDescription>
                      أدخل بيانات المستخدم الجديد والصلاحيات المطلوبة
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="fullName">الاسم الكامل</Label>
                        <Input
                          id="fullName"
                          value={newUser.fullName}
                          onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">كلمة المرور</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">الصلاحية</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="اختر الصلاحية" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UserRole.ADMIN}>مدير</SelectItem>
                            <SelectItem value={UserRole.MANAGER}>مشرف</SelectItem>
                            <SelectItem value={UserRole.ACCOUNTANT}>محاسب</SelectItem>
                            <SelectItem value={UserRole.SALES}>مبيعات</SelectItem>
                            <SelectItem value={UserRole.USER}>مستخدم</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddUser}>إضافة المستخدم</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>المعرف</TableHead>
                      <TableHead>الصلاحية</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>خيارات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="h-8 w-8 mb-2" />
                            <p>لا يوجد مستخدمين</p>
                            {searchTerm && <p className="text-sm">جرب البحث بكلمة أخرى</p>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <Avatar>
                                <AvatarFallback>{getUserInitials(user.fullName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.fullName}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{user.id}</TableCell>
                          <TableCell>
                            {user.roles.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {user.roles.map((role, i) => (
                                  <div
                                    key={i}
                                    className={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeClass(role)}`}
                                  >
                                    {getRoleDisplay(role)}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs px-2 py-1 rounded-full border bg-gray-100 text-gray-800 border-gray-300 inline-block">
                                مستخدم
                              </div>
                            )}
                          </TableCell>
                          <TableCell dir="ltr" className="font-mono text-xs">
                            {user.email || 'غير متوفر'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2 space-x-reverse">
                              <Dialog open={isEditDialogOpen && currentUser?.id === user.id} onOpenChange={(open) => {
                                if (!open) setCurrentUser(null);
                                setIsEditDialogOpen(open);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">تعديل</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>تعديل المستخدم</DialogTitle>
                                    <DialogDescription>
                                      تعديل بيانات وصلاحيات المستخدم
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div>
                                      <Label htmlFor="edit-fullName">الاسم الكامل</Label>
                                      <Input
                                        id="edit-fullName"
                                        value={editUser.fullName}
                                        onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-role">الصلاحية</Label>
                                      <Select
                                        value={editUser.role}
                                        onValueChange={(value) => setEditUser({ ...editUser, role: value as UserRole })}
                                      >
                                        <SelectTrigger id="edit-role">
                                          <SelectValue placeholder="اختر الصلاحية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value={UserRole.ADMIN}>مدير</SelectItem>
                                          <SelectItem value={UserRole.MANAGER}>مشرف</SelectItem>
                                          <SelectItem value={UserRole.ACCOUNTANT}>محاسب</SelectItem>
                                          <SelectItem value={UserRole.SALES}>مبيعات</SelectItem>
                                          <SelectItem value={UserRole.USER}>مستخدم</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={handleEditUser}>حفظ التغييرات</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash className="h-4 w-4 text-red-500" />
                                    <span className="sr-only">حذف</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      سيتم حذف حساب المستخدم بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-500 hover:bg-red-600"
                                      onClick={() => handleDeleteUser(user.id)}
                                    >
                                      تأكيد الحذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Users;
