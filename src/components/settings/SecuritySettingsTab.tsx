
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SecuritySettings } from "@/lib/settings-types";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

interface SecuritySettingsTabProps {
  settings: SecuritySettings;
  onSave: (settings: SecuritySettings) => void;
  isLoading?: boolean;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SecuritySettingsTab({ settings, onSave, isLoading = false }: SecuritySettingsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [passwordChanging, setPasswordChanging] = useState(false);

  const securityForm = useForm<SecuritySettings>({
    defaultValues: settings
  });

  const passwordForm = useForm<PasswordChangeForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const handleSecuritySubmit = (data: SecuritySettings) => {
    onSave(data);
  };

  const handlePasswordSubmit = async (data: PasswordChangeForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: "كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين",
        variant: "destructive"
      });
      return;
    }

    if (data.newPassword.length < 8) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    setPasswordChanging(true);

    try {
      // أولاً، تسجيل الدخول باستخدام كلمة المرور الحالية للتحقق منها
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: data.currentPassword
      });

      if (signInError) {
        throw new Error("كلمة المرور الحالية غير صحيحة");
      }

      // تغيير كلمة المرور
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح"
      });

      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setPasswordChanging(false);
    }
  };

  // سجل تسجيل الدخول الوهمي
  const loginLogs = [
    {
      id: 1,
      date: "2023-06-15 14:30:00",
      user: "أحمد محمد",
      ip: "192.168.1.1",
      status: "ناجح"
    },
    {
      id: 2,
      date: "2023-06-15 10:25:00",
      user: "محمد علي",
      ip: "192.168.1.2",
      status: "ناجح"
    },
    {
      id: 3,
      date: "2023-06-14 16:10:00",
      user: "غير معروف",
      ip: "192.168.1.100",
      status: "فاشل"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الأمان</CardTitle>
        <CardDescription>ضبط إعدادات الأمان وحماية الحساب</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>تغيير كلمة المرور</Label>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                {...passwordForm.register("currentPassword", { required: true })} 
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-500">كلمة المرور الحالية مطلوبة</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input 
                id="newPassword" 
                type="password" 
                {...passwordForm.register("newPassword", { required: true, minLength: 8 })} 
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-500">كلمة المرور الجديدة مطلوبة (8 أحرف على الأقل)</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                {...passwordForm.register("confirmPassword", { required: true })} 
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">تأكيد كلمة المرور مطلوب</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="mt-2 w-full md:w-auto"
              disabled={passwordChanging}
            >
              {passwordChanging ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </Button>
          </form>
        </div>

        <Separator />

        <form onSubmit={securityForm.handleSubmit(handleSecuritySubmit)}>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorEnabled">المصادقة الثنائية</Label>
                <Switch 
                  id="twoFactorEnabled" 
                  checked={securityForm.watch("twoFactorEnabled")} 
                  onCheckedChange={(checked) => securityForm.setValue("twoFactorEnabled", checked)} 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                تفعيل المصادقة الثنائية لتعزيز أمان الحساب
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sessionTimeout">انتهاء مهلة الجلسة بعد عدم النشاط</Label>
                <Switch 
                  id="sessionTimeout" 
                  checked={securityForm.watch("sessionTimeout")} 
                  onCheckedChange={(checked) => securityForm.setValue("sessionTimeout", checked)} 
                />
              </div>
              {securityForm.watch("sessionTimeout") && (
                <div className="pt-2">
                  <Label htmlFor="sessionTimeoutMinutes">مدة عدم النشاط (بالدقائق)</Label>
                  <Input 
                    id="sessionTimeoutMinutes" 
                    type="number" 
                    min="1" 
                    {...securityForm.register("sessionTimeoutMinutes", { 
                      valueAsNumber: true,
                      min: 1
                    })} 
                  />
                  {securityForm.formState.errors.sessionTimeoutMinutes && (
                    <p className="text-sm text-red-500">يجب أن تكون المدة دقيقة واحدة على الأقل</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        </form>

        <Separator />

        <div className="space-y-2">
          <Label>سجل تسجيل الدخول</Label>
          <div className="overflow-x-auto bg-gray-50 rounded-md p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">التاريخ</th>
                  <th className="text-right p-2">المستخدم</th>
                  <th className="text-right p-2">عنوان IP</th>
                  <th className="text-right p-2">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {loginLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2">{log.date}</td>
                    <td className="p-2">{log.user}</td>
                    <td className="p-2">{log.ip}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 ${log.status === "ناجح" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} rounded-full text-xs`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
