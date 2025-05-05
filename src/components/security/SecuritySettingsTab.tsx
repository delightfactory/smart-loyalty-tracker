import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// تعريف نموذج تحديث كلمة المرور
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: 'كلمة المرور الحالية يجب أن تكون 8 أحرف على الأقل',
    }),
    newPassword: z.string().min(8, {
      message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل',
    }),
    confirmPassword: z.string().min(8, {
      message: 'يجب تأكيد كلمة المرور الجديدة',
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'كلمات المرور غير متطابقة',
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function SecuritySettingsTab() {
  const { toast } = useToast();
  const { profile, updatePassword } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // تهيئة نموذج تحديث كلمة المرور
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // تحديث كلمة المرور
  const mutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      setIsLoading(true);
      try {
        await updatePassword(data.currentPassword, data.newPassword);
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'تم تحديث كلمة المرور',
        description: 'تم تحديث كلمة المرور بنجاح',
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'فشل تحديث كلمة المرور',
        description: error.message || 'حدث خطأ أثناء تحديث كلمة المرور',
        variant: 'destructive',
      });
    },
  });

  function onSubmit(data: PasswordFormValues) {
    mutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
          <CardDescription>
            تغيير كلمة المرور الخاصة بك. نوصي باستخدام كلمة مرور قوية.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور الحالية</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل كلمة المرور الحالية"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل كلمة المرور الجديدة"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      يجب أن تكون كلمة المرور الجديدة وتأكيدها متطابقين
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* معلومات أمان إضافية */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الأمان</CardTitle>
          <CardDescription>
            معلومات هامة حول أمان حسابك وكيفية المحافظة عليه
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium">البريد الإلكتروني</h4>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium">نصائح لكلمة مرور قوية</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>استخدم كلمة مرور مكونة من 8 أحرف على الأقل</li>
              <li>استخدم مزيج من الأحرف الكبيرة والصغيرة</li>
              <li>أضف أرقام ورموز خاصة</li>
              <li>تجنب استخدام معلومات شخصية يمكن تخمينها</li>
              <li>لا تستخدم كلمة المرور نفسها لمواقع أخرى</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
