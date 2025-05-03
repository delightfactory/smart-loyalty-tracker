import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile, UserRole, isUserRoleArray, convertRoleToUserRole } from '@/lib/auth-types';
import { getAllUsers, createUser, deleteUser } from '@/services/users-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Loader2 } from 'lucide-react';
import { UserRolesList } from './UserRolesList';
import UserForm from './UserForm';
import UsersTable from './UsersTable';
import { EditUserDialog } from './EditUserDialog';
import { User } from '@/lib/auth-rbac-types';

export function UsersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  // جلب جميع المستخدمين
  const { data: usersData = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });
  
  // تحويل UserProfile[] إلى User[] لتوافق مع UsersTable
  const users = usersData.map((user: UserProfile) => {
    // Process roles to ensure they have the correct format
    const processedRoles = user.roles ? 
      (isUserRoleArray(user.roles) ? 
        user.roles.map(role => ({
          id: typeof role === 'string' ? role : '',
          name: typeof role === 'string' ? role : '',
          description: undefined,
          permissions: []
        })) : 
        (user.roles as any[]).map(role => ({
          id: role.id || '',
          name: role.name,
          description: role.description,
          permissions: role.permissions || []
        }))
      ) : [];
      
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email || '',
      roles: processedRoles,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      isActive: true,
      position: user.position,
      createdAt: user.createdAt || '',
      lastSignInAt: user.lastSignInAt || null,
      permissions: []
    };
  });

  // إضافة مستخدم جديد
  const createUserMutation = useMutation({
    mutationFn: (userData: { fullName: string; email: string; role: string }) => {
      return createUser({
        email: userData.email,
        fullName: userData.fullName,
        roles: [userData.role as UserRole],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'تم إضافة المستخدم بنجاح',
        description: 'تم إنشاء حساب جديد وإرسال بريد تعيين كلمة المرور',
      });
      setIsAddUserOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إضافة المستخدم',
        description: error.message || 'حدث خطأ أثناء إضافة المستخدم',
        variant: 'destructive',
      });
    },
  });

  // حذف مستخدم
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'تم حذف المستخدم بنجاح',
      });
      setDeleteUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حذف المستخدم',
        description: error.message || 'حدث خطأ أثناء حذف المستخدم',
        variant: 'destructive',
      });
    },
  });

  // معالجة إضافة مستخدم
  const handleAddUser = (data: any) => {
    createUserMutation.mutate({
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    });
  };

  // معالجة تعديل مستخدم
  const handleEditUser = (userId: string) => {
    setEditUserId(userId);
  };

  // معالجة حذف مستخدم
  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  // تأكيد حذف مستخدم
  const confirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };

  // قائمة الأدوار المتاحة
  const availableRoles = Object.values(UserRole);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-700">خطأ في تحميل البيانات</h3>
        <p className="text-sm text-red-600">{(error as any).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>المستخدمون</CardTitle>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            إضافة مستخدم
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
              <span className="text-lg">جاري تحميل البيانات...</span>
            </div>
          ) : (
            <UsersTable
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          )}
        </CardContent>
      </Card>

      {/* إدارة الأدوار والصلاحيات */}
      <UserRolesList />

      {/* نموذج إضافة مستخدم */}
      <UserForm
        open={isAddUserOpen}
        isLoading={createUserMutation.isPending}
        onSubmit={handleAddUser}
        onCancel={() => setIsAddUserOpen(false)}
        roles={availableRoles}
      />

      {/* نموذج تعديل مستخدم */}
      {editUserId && (
        <EditUserDialog
          userId={editUserId}
          isOpen={!!editUserId}
          onClose={() => setEditUserId(null)}
        />
      )}

      {/* مربع حوار تأكيد الحذف */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف هذا المستخدم بشكل دائم وإلغاء وصوله إلى النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
