
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers, deleteUser } from '@/services/users-api';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { UserProfile, UserRole } from '@/lib/auth-types';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { EditUserDialog } from './EditUserDialog';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export function UsersTable() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  });

  const filteredUsers = users.filter((user: UserProfile) => 
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(deleteConfirmUser.id);
      toast({ 
        title: "تم الحذف بنجاح", 
        description: `تم حذف المستخدم ${deleteConfirmUser.fullName || deleteConfirmUser.email} بنجاح` 
      });
      refetch();
    } catch (error: any) {
      toast({ 
        title: "خطأ في الحذف", 
        description: error.message || "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmUser(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case UserRole.ADMIN:
        return <Badge className="bg-primary">مدير</Badge>;
      case UserRole.MANAGER:
        return <Badge variant="outline" className="bg-blue-500 text-white">مشرف</Badge>;
      case UserRole.ACCOUNTANT:
        return <Badge variant="outline" className="bg-amber-500 text-white">محاسب</Badge>;
      case UserRole.SALES:
        return <Badge variant="outline" className="bg-green-500 text-white">مبيعات</Badge>;
      default:
        return <Badge variant="outline">مستخدم</Badge>;
    }
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن مستخدم..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="py-8 text-center text-destructive">
          حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الصلاحيات</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    لا توجد بيانات للعرض
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: UserProfile) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName || '---'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(role => (
                          <span key={role}>{getRoleBadge(role)}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditUserId(user.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => setDeleteConfirmUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit User Dialog */}
      {editUserId && (
        <EditUserDialog 
          userId={editUserId} 
          isOpen={!!editUserId} 
          onClose={() => setEditUserId(null)} 
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmUser} onOpenChange={() => !isDeleting && setDeleteConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المستخدم {deleteConfirmUser?.fullName || deleteConfirmUser?.email} بشكل نهائي.
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default UsersTable;
