
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createAdminUser, adminCredentials } from '@/services/admin';
import { useAuth } from '@/providers/AuthProvider';

export const CreateAdminAccount = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  
  const handleCreateAdmin = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const { email, password, fullName } = adminCredentials;
      const result = await createAdminUser(email, password, fullName);
      
      if (result.success) {
        setIsCreated(true);
      } else {
        setError(result.error || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
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
