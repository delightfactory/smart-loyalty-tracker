
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

interface CreateAdminAccountProps {
  onSuccess?: () => void;
}

export const CreateAdminAccount: React.FC<CreateAdminAccountProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { hasRole, signUp } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!hasRole(UserRole.ADMIN)) {
      navigate('/profile');
    }
  }, [hasRole, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // استخدام وظيفة التسجيل من useAuth
      await signUp(email, password, fullName);
      
      setSuccess(true);
      toast({
        title: "تم إنشاء حساب المسؤول بنجاح",
        description: "تم إرسال بريد إلكتروني لتفعيل الحساب إلى المستخدم.",
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل إنشاء حساب المسؤول",
        description: error.message,
      });
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
        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>تم إنشاء الحساب!</AlertTitle>
            <AlertDescription>
              تم إنشاء حساب المسؤول بنجاح. تم إرسال بريد إلكتروني لتفعيل الحساب إلى المستخدم.
            </AlertDescription>
          </Alert>
        )}
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
        <Button disabled={isLoading} onClick={handleSubmit}>
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
