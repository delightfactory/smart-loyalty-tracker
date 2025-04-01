
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Shield, Lock, Key, EyeOff, Eye } from 'lucide-react';
import { updateUserPassword } from '@/services/users';
import { UserRole } from '@/lib/auth-types';
import { useAuth } from '@/hooks/useAuth';

export interface SecuritySettingsTabProps {
  
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = () => {
  const { toast } = useToast();
  const { user, hasRole } = useAuth();
  const [isTwoFactorAuthEnabled, setIsTwoFactorAuthEnabled] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleToggleTwoFactorAuth = () => {
    setIsTwoFactorAuthEnabled(!isTwoFactorAuthEnabled);
    // Implement logic to enable/disable 2FA
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFields({ ...passwordFields, [name]: value });
  };
  
  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdatingPassword(true);
    
    try {
      if (!user) {
        throw new Error("المستخدم غير مسجل الدخول");
      }
      
      await updateUserPassword(user.id, passwordFields.currentPassword, passwordFields.newPassword);
      
      toast({
        title: "تم التحديث",
        description: "تم تحديث كلمة المرور بنجاح",
      });
      
      setPasswordFields({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>تغيير كلمة المرور</CardTitle>
          <CardDescription>
            تحديث كلمة المرور الخاصة بك بكلمة مرور قوية وآمنة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordFields.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="كلمة المرور الحالية"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">Show password</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordFields.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="كلمة المرور الجديدة"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">Show password</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordFields.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="تأكيد كلمة المرور الجديدة"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">Show password</span>
                </Button>
              </div>
            </div>
            
            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  تغيير كلمة المرور
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {hasRole(UserRole.ADMIN) && (
        <Card>
          <CardHeader>
            <CardTitle>المصادقة الثنائية</CardTitle>
            <CardDescription>
              إضافة طبقة حماية إضافية لحسابك باستخدام المصادقة الثنائية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  تفعيل المصادقة الثنائية
                </p>
                <p className="text-sm text-muted-foreground">
                  عند التفعيل، ستحتاج إلى إدخال رمز تحقق إضافي عند تسجيل الدخول.
                </p>
              </div>
              <Switch id="2fa" checked={isTwoFactorAuthEnabled} onCheckedChange={handleToggleTwoFactorAuth} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
