
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentSettings } from "@/lib/settings-types";
import { Save } from "lucide-react";

interface PaymentSettingsFormProps {
  settings: PaymentSettings;
  onSave: (settings: PaymentSettings) => void;
  isLoading?: boolean;
}

export function PaymentSettingsForm({ settings, onSave, isLoading = false }: PaymentSettingsFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PaymentSettings>({
    defaultValues: settings
  });

  const updatePaymentMethod = (key: keyof PaymentSettings['enabledMethods'], value: boolean) => {
    const methods = watch('enabledMethods');
    setValue('enabledMethods', { ...methods, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات المدفوعات</CardTitle>
        <CardDescription>تخصيص طرق الدفع وإعدادات المدفوعات</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSave)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>طرق الدفع المتاحة</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="payment_cash" 
                  checked={watch('enabledMethods.cash')} 
                  onCheckedChange={(checked) => updatePaymentMethod('cash', checked)} 
                />
                <Label htmlFor="payment_cash" className="mr-2">نقداً</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="payment_credit" 
                  checked={watch('enabledMethods.credit')} 
                  onCheckedChange={(checked) => updatePaymentMethod('credit', checked)} 
                />
                <Label htmlFor="payment_credit" className="mr-2">آجل</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="payment_bank" 
                  checked={watch('enabledMethods.bankTransfer')} 
                  onCheckedChange={(checked) => updatePaymentMethod('bankTransfer', checked)} 
                />
                <Label htmlFor="payment_bank" className="mr-2">تحويل بنكي</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="payment_card" 
                  checked={watch('enabledMethods.card')} 
                  onCheckedChange={(checked) => updatePaymentMethod('card', checked)} 
                />
                <Label htmlFor="payment_card" className="mr-2">بطاقة ائتمان</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultMethod">طريقة الدفع الافتراضية</Label>
              <Select 
                defaultValue={settings.defaultMethod} 
                onValueChange={(value) => setValue('defaultMethod', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة الدفع الافتراضية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="credit">آجل</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="card">بطاقة ائتمان</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentPrefix">بادئة رقم الدفعة</Label>
              <Input 
                id="paymentPrefix" 
                {...register("paymentPrefix", { required: true })} 
              />
              {errors.paymentPrefix && <p className="text-sm text-red-500">هذا الحقل مطلوب</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="allowPartialPayments">السماح بالمدفوعات الجزئية</Label>
              <Switch 
                id="allowPartialPayments" 
                checked={watch("allowPartialPayments")} 
                onCheckedChange={(checked) => setValue("allowPartialPayments", checked)} 
              />
            </div>
            <p className="text-sm text-muted-foreground">
              السماح للعملاء بتسديد جزء من قيمة الفاتورة
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableOverdueNotifications">إشعارات المتأخرات</Label>
              <Switch 
                id="enableOverdueNotifications" 
                checked={watch("enableOverdueNotifications")} 
                onCheckedChange={(checked) => setValue("enableOverdueNotifications", checked)} 
              />
            </div>
            <p className="text-sm text-muted-foreground">
              إرسال إشعارات تلقائية للفواتير المتأخرة
            </p>
          </div>

          {watch("enableOverdueNotifications") && (
            <div className="space-y-2">
              <Label>إعدادات المتأخرات</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="overdueReminders.firstReminder">تذكير أول (بالأيام)</Label>
                  <Input 
                    id="overdueReminders.firstReminder" 
                    type="number" 
                    min="0" 
                    {...register("overdueReminders.firstReminder", { 
                      valueAsNumber: true,
                      min: 0
                    })} 
                  />
                </div>
                <div>
                  <Label htmlFor="overdueReminders.secondReminder">تذكير ثاني (بالأيام)</Label>
                  <Input 
                    id="overdueReminders.secondReminder" 
                    type="number" 
                    min="0" 
                    {...register("overdueReminders.secondReminder", { 
                      valueAsNumber: true,
                      min: 0
                    })} 
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            <Save className="ml-2 h-4 w-4" />
            حفظ الإعدادات
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
