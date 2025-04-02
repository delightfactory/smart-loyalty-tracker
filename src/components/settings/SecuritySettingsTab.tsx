
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface SecuritySettingsTabProps {
  onSave?: (data: any) => void;
  isLoading?: boolean;
}

export function SecuritySettingsTab({ onSave, isLoading = false }: SecuritySettingsTabProps) {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  
  const onSubmit = async (data: any) => {
    try {
      setError(null);
      
      if (data.newPassword !== data.confirmPassword) {
        setError("كلمات المرور الجديدة غير متطابقة");
        return;
      }
      
      await updatePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
      
      if (onSave) {
        onSave(data);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تحديث كلمة المرور");
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الأمان</CardTitle>
          <CardDescription>
            تغيير كلمة المرور وإعدادات الأمان الأخرى.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>خطأ</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 border-green-400 text-green-700">
              <AlertTitle>تم تحديث كلمة المرور بنجاح</AlertTitle>
              <AlertDescription>تم تغيير كلمة المرور الخاصة بك بنجاح.</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
            <Input 
              id="currentPassword" 
              type="password"
              {...register("currentPassword", { required: true })}
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">كلمة المرور الحالية مطلوبة</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
            <Input 
              id="newPassword" 
              type="password"
              {...register("newPassword", { 
                required: true,
                minLength: {
                  value: 8,
                  message: "يجب أن تكون كلمة المرور على الأقل 8 أحرف"
                }
              })}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message as string || "كلمة المرور الجديدة مطلوبة"}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              {...register("confirmPassword", { 
                required: true,
                validate: (value) => value === watch("newPassword") || "كلمات المرور غير متطابقة"
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message as string || "تأكيد كلمة المرور مطلوب"}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            حفظ التغييرات
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
