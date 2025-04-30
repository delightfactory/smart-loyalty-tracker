
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { deleteUser, getUserById } from '@/services/users-api';

interface DeleteUserDialogProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteUserDialog({ userId, isOpen, onClose }: DeleteUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // جلب بيانات المستخدم المراد حذفه
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId),
    enabled: isOpen && !!userId,
  });
  
  // حذف المستخدم
  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'تم حذف المستخدم بنجاح',
        description: 'تم حذف المستخدم وجميع بياناته من النظام',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حذف المستخدم',
        description: error.message || 'حدث خطأ أثناء حذف المستخدم',
        variant: 'destructive',
      });
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف المستخدم؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف المستخدم <span className="font-semibold">{user?.fullName || user?.email}</span> وجميع بياناته من النظام.
            <br />
            هذا الإجراء لا يمكن التراجع عنه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteUserMutation.mutate();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
