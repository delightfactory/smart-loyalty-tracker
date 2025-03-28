
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CompanySettings } from "@/lib/settings-types";
import { Save, Upload } from "lucide-react";

interface CompanySettingsFormProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
  isLoading?: boolean;
}

export function CompanySettingsForm({ settings, onSave, isLoading = false }: CompanySettingsFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CompanySettings>({
    defaultValues: settings
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>بيانات الشركة</CardTitle>
        <CardDescription>تعديل معلومات الشركة الأساسية</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSave)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الشركة</Label>
              <Input 
                id="name" 
                placeholder="اسم الشركة" 
                {...register("name", { required: true })} 
              />
              {errors.name && <p className="text-sm text-red-500">هذا الحقل مطلوب</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxNumber">رقم التسجيل الضريبي</Label>
              <Input 
                id="taxNumber" 
                placeholder="رقم التسجيل الضريبي" 
                {...register("taxNumber")} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input 
                id="phone" 
                placeholder="رقم الهاتف" 
                {...register("phone")} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                placeholder="البريد الإلكتروني" 
                type="email" 
                {...register("email", { 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "البريد الإلكتروني غير صحيح"
                  }
                })} 
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Textarea 
              id="address" 
              placeholder="العنوان" 
              {...register("address")} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">شعار الشركة</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="شعار الشركة" className="h-16 w-16 object-contain" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <Button type="button" variant="outline">اختيار صورة</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            <Save className="ml-2 h-4 w-4" />
            حفظ البيانات
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
