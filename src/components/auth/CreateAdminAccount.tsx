
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { adminCredentials } from '@/services/admin';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/auth-types';
import { useToast } from '@/components/ui/use-toast';

export const CreateAdminAccount = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const handleCreateAdmin = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const { email, password, fullName } = adminCredentials;
      
      // Check if admin already exists by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // If admin exists and credentials are correct, just set created state to true
      if (!signInError) {
        setIsCreated(true);
        setIsCreating(false);
        return;
      }
      
      // If admin doesn't exist or has wrong password, create a new admin
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (!userData.user) throw new Error('فشل في إنشاء المستخدم');
      
      // The admin is now created but email might not be confirmed
      // Let's try to directly set roles despite this
      const roles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.SALES];
      
      for (const role of roles) {
        try {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userData.user.id,
              role: role,
            });
            
          if (roleError) console.error(`Error adding role ${role}:`, roleError);
        } catch (err) {
          console.error(`Exception adding role ${role}:`, err);
        }
      }
      
      // Display success message with toast
      toast({
        title: "تم إنشاء حساب المدير",
        description: "يرجى ملاحظة أنه قد تحتاج إلى تأكيد البريد الإلكتروني إذا كان ذلك مفعلاً في لوحة تحكم Supabase",
        variant: "default"
      });
      
      setIsCreated(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleLogin = async () => {
    try {
      const { email, password } = adminCredentials;
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
      
      // Add special message for email confirmation issues
      if (err.message && (err.message.includes('Email not confirmed') || err.message.includes('Invalid login credentials'))) {
        toast({
          title: "تنبيه: تحتاج إلى تفعيل الإيميل",
          description: "يرجى تأكيد البريد الإلكتروني في لوحة تحكم Supabase أو تعطيل خاصية تأكيد البريد الإلكتروني",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>إنشاء حساب المدير</CardTitle>
        <CardDescription>
          إنشاء حساب إداري يملك جميع الصلاحيات للنظام
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isCreated ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">تم إنشاء الحساب بنجاح</AlertTitle>
              <AlertDescription>
                تم إنشاء حساب المدير بنجاح. يمكنك استخدام بيانات تسجيل الدخول التالية:
              </AlertDescription>
            </Alert>
            
            <div className="p-4 border rounded">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="font-semibold">البريد الإلكتروني:</div>
                <div className="col-span-2 font-mono bg-gray-100 p-1 rounded">{adminCredentials.email}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="font-semibold">كلمة المرور:</div>
                <div className="col-span-2 font-mono bg-gray-100 p-1 rounded">{adminCredentials.password}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="font-semibold">الاسم الكامل:</div>
                <div className="col-span-2">{adminCredentials.fullName}</div>
              </div>
            </div>
            
            <Button onClick={handleLogin} className="w-full">
              تسجيل الدخول
            </Button>
            
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertTitle className="text-yellow-700">هام</AlertTitle>
              <AlertDescription>
                إذا واجهت مشكلة في تسجيل الدخول بسبب عدم تأكيد البريد الإلكتروني، يرجى الانتقال إلى لوحة تحكم Supabase وتعطيل خاصية تأكيد البريد الإلكتروني من قسم Authentication.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Button 
            onClick={handleCreateAdmin} 
            className="w-full" 
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جارٍ إنشاء الحساب...
              </>
            ) : 'إنشاء حساب المدير'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
