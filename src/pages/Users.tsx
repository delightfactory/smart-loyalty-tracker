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
import { supabase } from '@/integrations/supabase/client';
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
  UserPlus
} from 'lucide-react';

const Users = () => {
  const { hasRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminCheckDone, setIsAdminCheckDone] = useState(false);
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    role: UserRole.USER
  });
  
  useEffect(() => {
    checkAdminAccess();
  }, [isAuthenticated]);
  
  const checkAdminAccess = async () => {
    try {
      if (isAuthenticated) {
        const isAdmin = hasRole(UserRole.ADMIN);
        setIsAdminCheckDone(true);
        
        if (!isAdmin) {
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
    }
  };
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
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
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة المستخدم",
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
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إزالة الدور",
        variant: "destructive"
      });
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
  
  if (!isAdminCheckDone || (isAdminCheckDone && isLoading && users.length === 0)) {
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
            {users.map(user => (
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
};

export default Users;
