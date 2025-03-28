
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { InvoiceSettings } from "@/lib/settings-types";
import { Save } from "lucide-react";

interface InvoiceSettingsFormProps {
  settings: InvoiceSettings;
  onSave: (settings: InvoiceSettings) => void;
  isLoading?: boolean;
}

export function InvoiceSettingsForm({ settings, onSave, isLoading = false }: InvoiceSettingsFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceSettings>({
    defaultValues: settings
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الفواتير</CardTitle>
        <CardDescription>تخصيص إعدادات الفواتير والتسعير</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSave)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">بادئة رقم الفاتورة</Label>
              <Input 
                id="invoicePrefix" 
                {...register("invoicePrefix", { required: true })} 
              />
              {errors.invoicePrefix && <p className="text-sm text-red-500">هذا الحقل مطلوب</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextInvoiceNumber">رقم الفاتورة التالي</Label>
              <Input 
                id="nextInvoiceNumber" 
                type="number" 
                min="1" 
                {...register("nextInvoiceNumber", { 
                  required: true,
                  valueAsNumber: true,
                  min: 1
                })} 
              />
              {errors.nextInvoiceNumber && <p className="text-sm text-red-500">الرقم يجب أن يكون أكبر من صفر</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultPaymentTerms">شروط الدفع الافتراضية (بالأيام)</Label>
              <Input 
                id="defaultPaymentTerms" 
                type="number" 
                min="0" 
                {...register("defaultPaymentTerms", { 
                  valueAsNumber: true,
                  min: 0
                })} 
              />
              <p className="text-sm text-muted-foreground">
                عدد الأيام الافتراضي لسداد الفواتير الآجلة
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
              <Input 
                id="taxRate" 
                type="number" 
                min="0" 
                max="100" 
                step="0.01" 
                {...register("taxRate", { 
                  valueAsNumber: true,
                  min: 0,
                  max: 100
                })} 
              />
              {errors.taxRate && <p className="text-sm text-red-500">النسبة يجب أن تكون بين 0 و 100</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="showTax">عرض الضريبة في الفواتير</Label>
              <Switch 
                id="showTax" 
                checked={watch("showTax")} 
                onCheckedChange={(checked) => setValue("showTax", checked)} 
              />
            </div>
            <p className="text-sm text-muted-foreground">
              عرض تفاصيل الضريبة منفصلة في الفواتير
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="showPoints">عرض النقاط في الفواتير</Label>
              <Switch 
                id="showPoints" 
                checked={watch("showPoints")} 
                onCheckedChange={(checked) => setValue("showPoints", checked)} 
              />
            </div>
            <p className="text-sm text-muted-foreground">
              عرض تفاصيل النقاط المكتسبة في الفواتير
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultNotes">ملاحظات الفاتورة الافتراضية</Label>
            <Textarea 
              id="defaultNotes" 
              {...register("defaultNotes")} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer">تذييل الفاتورة</Label>
            <Textarea 
              id="footer" 
              {...register("footer")} 
            />
          </div>
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
