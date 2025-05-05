import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/lib/auth-types';
import { getUserById, updateUserProfile, updateUserRoles, updateUserPermissions, fetchUserPermissions } from '@/services/users-api';
import UserPermissionsForm from '@/components/users/UserPermissionsForm';

// تحديد نموذج بيانات المستخدم للتعديل
const userEditFormSchema = z.object({
  fullName: z.string().min(3, { message: 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل' }),
  phone: z.string().optional(),
  position: z.string().optional(),
  roles: z.array(z.string()).min(1, { message: 'يجب اختيار صلاحية واحدة على الأقل' }),
});

type UserEditFormValues = z.infer<typeof userEditFormSchema>;

interface EditUserDialogProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserDialog({ userId, isOpen, onClose }: EditUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permissions, setPermissions] = useState<string[]>([]);
  
  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      position: '',
      roles: [UserRole.USER],
    },
  });
  
  // تعريف الأدوار المتاحة
  const availableRoles = [
    { id: UserRole.ADMIN, label: 'مدير النظام' },
    { id: UserRole.MANAGER, label: 'مشرف' },
    { id: UserRole.ACCOUNTANT, label: 'محاسب' },
    { id: UserRole.SALES, label: 'مبيعات' },
    { id: UserRole.USER, label: 'مستخدم عادي' },
  ];
  
  // جلب بيانات المستخدم
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId),
    enabled: isOpen && !!userId,
  });
  
  // جلب صلاحيات المستخدم الحالية عند فتح الحوار
  useEffect(() => {
    if (isOpen) {
      fetchUserPermissions(userId)
        .then(perms => setPermissions(perms))
        .catch(error => toast({ variant: 'destructive', title: 'خطأ في جلب صلاحيات المستخدم', description: error.message }));
    }
  }, [isOpen, userId]);
  
  // تحديث النموذج عند جلب البيانات
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || '',
        phone: user.phone || '',
        position: user.position || '',
        roles: user.roles || [UserRole.USER],
      });
    }
  }, [user, form]);
  
  // تحديث بيانات المستخدم
  const updateUserMutation = useMutation({
    mutationFn: async (values: UserEditFormValues) => {
      // تحديث الملف الشخصي
      await updateUserProfile({
        id: userId,
        fullName: values.fullName,
        phone: values.phone || null,
        position: values.position || null,
      });
      
      // تحديث الأدوار
      const userRoles = values.roles.map(role => role as UserRole);
      await updateUserRoles(userId, userRoles);
      
      // تحديث الصلاحيات المخصصة
      await updateUserPermissions(userId, permissions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
      toast({
        title: 'تم تحديث المستخدم بنجاح',
        description: 'تم تحديث بيانات المستخدم والصلاحيات',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تحديث بيانات المستخدم',
        description: error.message || 'حدث خطأ أثناء تحديث المستخدم',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: UserEditFormValues) => {
    updateUserMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الاسم الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل رقم الهاتف" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسمى الوظيفي</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل المسمى الوظيفي" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="roles"
                render={() => (
                  <FormItem>
                    <FormLabel>الصلاحيات</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableRoles.map((role) => (
                        <FormField
                          key={role.id}
                          control={form.control}
                          name="roles"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={role.id}
                                className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(role.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, role.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== role.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {role.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* نموذج إدارة صلاحيات المستخدم */}
              <UserPermissionsForm userId={userId} onChange={setPermissions} />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  حفظ التغييرات
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
