
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { adminCredentials } from '@/services/admin';
import { UserRole } from '@/lib/auth-types';
import { createDefaultAdmin } from '@/services/users';

interface CreateAdminAccountProps {
  onSuccess?: () => void;
}

export const CreateAdminAccount: React.FC<CreateAdminAccountProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState(adminCredentials.email);
  const [password, setPassword] = useState(adminCredentials.password);
  const [fullName, setFullName] = useState(adminCredentials.fullName);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // استخدام وظيفة إنشاء المدير الافتراضي
      const result = await createDefaultAdmin(email, password, fullName);
      
      setSuccess(true);
      toast({
        title: "تم إنشاء حساب المسؤول بنجاح",
        description: "يمكنك الآن تسجيل الدخول باستخدام بيانات الحساب.",
      });
      
      onSuccess?.();
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "فشل إنشاء حساب المسؤول",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithCredentials = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(email, password);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "سيتم توجيهك إلى لوحة التحكم",
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>إنشاء حساب مسؤول جديد</CardTitle>
        <CardDescription>
          أدخل بيانات المستخدم لإنشاء حساب مسؤول جديد.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>تم إنشاء الحساب!</AlertTitle>
            <AlertDescription>
              تم إنشاء حساب المسؤول بنجاح. يمكنك الآن تسجيل الدخول باستخدام بيانات الحساب.
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-md bg-secondary p-4">
          <div className="text-sm font-semibold mb-2">بيانات الدخول الافتراضية:</div>
          <div className="text-sm"><span className="font-semibold">البريد الإلكتروني:</span> {adminCredentials.email}</div>
          <div className="text-sm"><span className="font-semibold">كلمة المرور:</span> {adminCredentials.password}</div>
          <div className="text-sm"><span className="font-semibold">الاسم:</span> {adminCredentials.fullName}</div>
          
          <Button
            variant="secondary"
            className="mt-2 w-full"
            onClick={handleLoginWithCredentials}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            تسجيل الدخول بهذا الحساب
          </Button>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fullName">الاسم الكامل</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="اسم المسؤول"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={isLoading} onClick={handleSubmit} className="w-full">
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          إنشاء حساب
          <ArrowRight className="mr-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
