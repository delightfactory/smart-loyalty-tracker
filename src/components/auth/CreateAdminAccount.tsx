
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import * as z from 'zod';
import { usersService } from '@/services/users';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the form schema
const formSchema = z.object({
  email: z.string().email({
    message: 'يرجى إدخال بريد إلكتروني صالح',
  }),
  password: z.string().min(6, {
    message: 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل',
  }),
  confirmPassword: z.string(),
  fullName: z.string().min(1, {
    message: 'يرجى إدخال الاسم الكامل',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof formSchema>;

const CreateAdminAccount: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      // Create the admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
      if (signUpData && signUpData.user) {
        // Assign admin role to the user
        const adminRoleResult = await usersService.assignAdminRole(signUpData.user.id);
        
        if (!adminRoleResult.success) {
          throw new Error(adminRoleResult.message || 'فشل في إضافة دور المدير');
        }
        
        toast({
          title: "تم إنشاء حساب المدير بنجاح",
          description: "يمكنك الآن تسجيل الدخول باستخدام هذه البيانات",
        });

        // Check if email confirmation is required
        if (signUpData && signUpData.user && signUpData.user.email) {
          toast({
            title: "تحقق من بريدك الإلكتروني",
            description: `تم إرسال رابط التأكيد إلى ${signUpData.user.email}`,
          });
        }

        navigate('/auth');
      }
    } catch (error: any) {
      console.error('Error creating admin account:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء حساب المدير. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>إنشاء حساب المدير</CardTitle>
        <CardDescription>
          أنشئ حساب المدير الأول للنظام. سيتم منح هذا الحساب صلاحيات كاملة.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة المرور"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 left-0 px-3 flex items-center"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
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
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="أعد إدخال كلمة المرور"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 left-0 px-3 flex items-center"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              العودة للخلف
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              إنشاء الحساب
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CreateAdminAccount;
