
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { createUser } from '@/services/users';

// تحديد نموذج بيانات المستخدم
const userFormSchema = z.object({
  fullName: z.string().min(3, { message: 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),
  roles: z.array(z.string()).min(1, { message: 'يجب اختيار صلاحية واحدة على الأقل' }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddUserDialog({ isOpen, onClose }: AddUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
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
  
  // إضافة مستخدم جديد
  const createUserMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      // تحويل مصفوفة الأدوار من سلاسل نصية إلى نوع UserRole
      const userRoles = values.roles.map(role => role as UserRole);
      const userData = {
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        roles: userRoles,
      };
      return createUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'تم إضافة المستخدم بنجاح',
        description: 'تم إضافة المستخدم الجديد وتعيين الصلاحيات',
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إضافة المستخدم',
        description: error.message || 'حدث خطأ أثناء إنشاء المستخدم',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: UserFormValues) => {
    createUserMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة مستخدم جديد</DialogTitle>
        </DialogHeader>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="أدخل البريد الإلكتروني" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
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
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إضافة
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
