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
import { UserRole, isUserRoleArray, convertRolesToUserRoles } from '@/lib/auth-types';
import { getUserById, updateUserProfile } from '@/services/users-api';
import { ROLES_PERMISSIONS, Permission } from '@/lib/roles-permissions';
import { Role } from '@/lib/auth-rbac-types';

// تحديد نموذج بيانات المستخدم للتعديل
const userEditFormSchema = z.object({
  fullName: z.string().min(3, { message: 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل' }),
  phone: z.string().optional(),
  position: z.string().optional(),
  roles: z.array(z.string()).min(1, { message: 'يجب اختيار صلاحية واحدة على الأقل' }),
  customPermissions: z.array(z.string()).optional(),
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
  
  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      position: '',
      roles: [UserRole.USER],
      customPermissions: [],
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
  
  // جميع الصلاحيات المتاحة من جميع الأدوار
  const allPermissions: Permission[] = Array.from(
    new Set(Object.values(ROLES_PERMISSIONS).flat())
  );
  
  // جلب بيانات المستخدم
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId),
    enabled: isOpen && !!userId,
  });
  
  // تحديث النموذج عند جلب البيانات
  useEffect(() => {
    if (user) {
      // Convert roles to UserRole array
      const roleNames: UserRole[] = Array.isArray(user.roles) ? 
        (isUserRoleArray(user.roles) ?
          user.roles as UserRole[] :
          convertRolesToUserRoles(user.roles as Role[])
        ) : [UserRole.USER];
        
      form.reset({
        fullName: user.fullName || '',
        phone: user.phone || '',
        position: user.position || '',
        roles: roleNames,
        customPermissions: user.customPermissions || [],
      });
    }
  }, [user, form]);
  
  // تحديث بيانات المستخدم
  const updateUserMutation = useMutation({
    mutationFn: async (values: UserEditFormValues) => {
      if (!user) return;
      
      // Process roles to ensure they're UserRole[] type
      const userRoles = values.roles as UserRole[];
      
      // Update user profile with form values
      await updateUserProfile({
        id: userId,
        fullName: values.fullName,
        email: user.email || '',
        phone: values.phone || null,
        position: values.position || null,
        avatarUrl: user.avatarUrl, // Pass along the existing avatarUrl
        roles: userRoles,
        customPermissions: values.customPermissions
      });
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
              
              <FormField
                control={form.control}
                name="customPermissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>صلاحيات إضافية مخصصة لهذا المستخدم</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {allPermissions.map((perm) => (
                        <label key={perm} className="flex items-center gap-1">
                          <Checkbox
                            checked={field.value?.includes(perm) || false}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), perm]);
                              } else {
                                field.onChange((field.value || []).filter((p: string) => p !== perm));
                              }
                            }}
                            id={`perm-${perm}`}
                          />
                          <span>{perm}</span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
