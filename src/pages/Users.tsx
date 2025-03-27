
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole, UserProfile } from '@/lib/auth-types';
import { getAllUsers, addRoleToUser, removeRoleFromUser } from '@/services/users';
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
  ChevronDown, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  UserCog 
} from 'lucide-react';

const Users = () => {
  const { hasRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // التحقق من الصلاحيات
    if (isAuthenticated && !hasRole(UserRole.ADMIN)) {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحيات كافية للوصول إلى هذه الصفحة",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
    
    fetchUsers();
  }, [isAuthenticated]);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddRole = async (userId: string, role: UserRole) => {
    try {
      await addRoleToUser(userId, role);
      
      // تحديث القائمة المحلية
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
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveRole = async (userId: string, role: UserRole) => {
    try {
      await removeRoleFromUser(userId, role);
      
      // تحديث القائمة المحلية
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
        description: error.message,
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
          <Button onClick={fetchUsers} disabled={isLoading}>
            تحديث القائمة
          </Button>
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
