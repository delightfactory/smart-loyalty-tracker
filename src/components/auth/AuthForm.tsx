
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define form validation schema
const loginSchema = z.object({
  email: z.string().email({
    message: 'يرجى إدخال بريد إلكتروني صالح',
  }),
  password: z.string().min(6, {
    message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(data.email, data.password);
      setSuccess(true);
      toast({
        variant: "default",
        title: "تم تسجيل الدخول بنجاح",
        description: "سيتم توجيهك إلى لوحة التحكم",
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      setError(error.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="shadow-lg border-t-4 border-t-primary">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
        <CardDescription className="text-center">
          أدخل بيانات حسابك للوصول إلى لوحة التحكم
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>فشل تسجيل الدخول</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertTitle>تم تسجيل الدخول بنجاح</AlertTitle>
            <AlertDescription>
              جاري تحويلك إلى لوحة التحكم...
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
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
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  تسجيل الدخول
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <p className="mt-2 text-center text-sm text-muted-foreground">
          نظام إدارة نقاط الولاء للعملاء
        </p>
      </CardFooter>
    </Card>
  );
};
