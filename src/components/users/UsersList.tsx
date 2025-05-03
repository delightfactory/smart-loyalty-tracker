import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Search, UserCog } from 'lucide-react';
import { getAllUsers } from '@/services/users-api';
import { UserRole } from '@/lib/auth-types';
import { AddUserDialog } from './AddUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { DeleteUserDialog } from './DeleteUserDialog';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function UsersList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  
  // جلب بيانات المستخدمين
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });
  
  // تطبيق فلتر البحث
  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // عرض اسم الدور بشكل مناسب
  const getRoleDisplay = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN: return "مدير";
      case UserRole.MANAGER: return "مشرف";
      case UserRole.ACCOUNTANT: return "محاسب";
      case UserRole.SALES: return "مبيعات";
      case UserRole.USER: return "مستخدم عادي";
      default: return "مستخدم عادي";
    }
  };

  // تنسيق عرض الأدوار المتعددة
  const getRoleBadges = (roles: UserRole[]) => {
    if (!roles || roles.length === 0) {
      return <Badge variant="outline">مستخدم عادي</Badge>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => (
          <Badge 
            key={role}
            variant={role === UserRole.ADMIN ? "default" : "outline"}
            className={
              role === UserRole.ADMIN 
                ? "bg-primary" 
                : role === UserRole.MANAGER
                ? "bg-blue-500" 
                : role === UserRole.ACCOUNTANT
                ? "bg-amber-500" 
                : role === UserRole.SALES
                ? "bg-green-500"
                : "bg-gray-200 text-gray-800"
            }
          >
            {getRoleDisplay(role)}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
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
        {hasPermission('manage_users') && (
          <Button onClick={() => setIsAddUserOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة مستخدم جديد
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الصلاحيات</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">آخر تسجيل دخول</TableHead>
              <TableHead className="w-[100px]">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary ml-2" />
                    جاري تحميل البيانات...
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-destructive">
                  حدث خطأ أثناء تحميل البيانات
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمين'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName || '---'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadges(user.roles)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{user.lastSignInAt ? formatDate(user.lastSignInAt) : 'لم يسجل الدخول بعد'}</TableCell>
                  <TableCell>
                    {hasPermission('manage_users') && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditUserId(user.id)}
                          title="تعديل المستخدم"
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteUserId(user.id)}
                          className="text-destructive"
                          title="حذف المستخدم"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" x2="10" y1="11" y2="17"></line>
                            <line x1="14" x2="14" y1="11" y2="17"></line>
                          </svg>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <AddUserDialog 
        isOpen={isAddUserOpen} 
        onClose={() => setIsAddUserOpen(false)} 
      />
      
      {editUserId && (
        <EditUserDialog 
          userId={editUserId} 
          isOpen={!!editUserId} 
          onClose={() => setEditUserId(null)} 
        />
      )}
      
      {deleteUserId && (
        <DeleteUserDialog 
          userId={deleteUserId}
          isOpen={!!deleteUserId}
          onClose={() => setDeleteUserId(null)}
        />
      )}
    </div>
  );
}
