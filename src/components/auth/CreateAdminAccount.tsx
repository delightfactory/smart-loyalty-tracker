
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, LogIn } from "lucide-react";
import { adminCredentials } from '@/services/admin';
import { UserRole } from '@/lib/auth-types';
import { createDefaultAdmin, ensureUserHasAdminRole } from '@/services/users';
import { supabase } from '@/integrations/supabase/client';

interface CreateAdminAccountProps {
  onSuccess?: () => void;
}

export const CreateAdminAccount: React.FC<CreateAdminAccountProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState(adminCredentials.email);
  const [password, setPassword] = useState(adminCredentials.password);
  const [fullName, setFullName] = useState(adminCredentials.fullName);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  
  // التحقق من وجود مستخدم مسؤول بالفعل
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setIsCheckingAdmin(true);
        
        // التحقق من وجود مستخدمين لديهم دور المسؤول
        const { data, error } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', UserRole.ADMIN);
          
        if (error) throw error;
        
        // إذا كان هناك مستخدم مسؤول موجود بالفعل
        if (data && data.length > 0) {
          console.log('Admin users exist:', data);
          setSuccess(true);
        }
      } catch (err) {
        console.error("Error checking if admin exists:", err);
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    
    checkAdmin();
  }, []);
  
  // إذا كان المستخدم مسجل الدخول حالياً، التحقق مما إذا كان لديه صلاحيات المسؤول
  useEffect(() => {
    if (user?.id) {
      const checkCurrentUserAdmin = async () => {
        try {
          await ensureUserHasAdminRole(user.id);
          setSuccess(true);
        } catch (err) {
          console.error("Error checking current user admin status:", err);
        }
      };
      
      checkCurrentUserAdmin();
    }
  }, [user]);
  
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
      setError(error.message || "حدث خطأ أثناء إنشاء حساب المسؤول");
      toast({
        variant: "destructive",
        title: "فشل إنشاء حساب المسؤول",
        description: error.message || "حدث خطأ أثناء إنشاء حساب المسؤول. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithCredentials = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("تسجيل الدخول باستخدام بيانات الاعتماد:", email, password);
      await signIn(email, password);
      
      // التحقق من صلاحيات المستخدم والتأكد من أن لديه دور المسؤول
      if (user?.id) {
        await ensureUserHasAdminRole(user.id);
      }
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "سيتم توجيهك إلى لوحة التحكم",
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      setError(error.message || "حدث خطأ أثناء تسجيل الدخول");
      console.error("خطأ في تسجيل الدخول:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFixAdminPermissions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // البحث عن مستخدم بالبريد الإلكتروني المحدد
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) throw userError;
      
      const adminUser = userData?.users.find(u => u.email === email);
      
      if (!adminUser) {
        throw new Error("لم يتم العثور على مستخدم بهذا البريد الإلكتروني");
      }
      
      // التأكد من أن المستخدم لديه دور المسؤول
      await ensureUserHasAdminRole(adminUser.id);
      
      toast({
        title: "تم إصلاح صلاحيات المسؤول بنجاح",
        description: "يمكنك الآن تسجيل الدخول بصلاحيات كاملة",
      });
      
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || "حدث خطأ أثناء إصلاح صلاحيات المسؤول");
      console.error("خطأ في إصلاح صلاحيات المسؤول:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isCheckingAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>جاري التحقق من وجود مستخدم مسؤول...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleLoginWithCredentials}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              تسجيل الدخول بهذا الحساب
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleFixAdminPermissions}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              إصلاح صلاحيات المسؤول
            </Button>
          </div>
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
