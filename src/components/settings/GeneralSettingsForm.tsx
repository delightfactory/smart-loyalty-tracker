
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GeneralSettings } from "@/lib/settings-types";
import { Save } from "lucide-react";

interface GeneralSettingsFormProps {
  settings: GeneralSettings;
  onSave: (settings: GeneralSettings) => void;
  isLoading?: boolean;
}

export function GeneralSettingsForm({ settings, onSave, isLoading = false }: GeneralSettingsFormProps) {
  const form = useForm<GeneralSettings>({
    defaultValues: settings
  });

  const handleSubmit = (data: GeneralSettings) => {
    onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>الإعدادات العامة</CardTitle>
        <CardDescription>تخصيص الإعدادات العامة للنظام</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">اللغة</Label>
              <Select
                defaultValue={settings.language}
                onValueChange={(value) => form.setValue("language", value as "ar" | "en")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">المنطقة الزمنية</Label>
              <Select
                defaultValue={settings.timezone}
                onValueChange={(value) => form.setValue("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنطقة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cairo">القاهرة (GMT+2)</SelectItem>
                  <SelectItem value="riyadh">الرياض (GMT+3)</SelectItem>
                  <SelectItem value="dubai">دبي (GMT+4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency">العملة</Label>
              <Select
                defaultValue={settings.currency}
                onValueChange={(value) => form.setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="egp">جنيه مصري (EGP)</SelectItem>
                  <SelectItem value="sar">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="aed">درهم إماراتي (AED)</SelectItem>
                  <SelectItem value="usd">دولار أمريكي (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
              <Select
                defaultValue={settings.dateFormat}
                onValueChange={(value) => form.setValue("dateFormat", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر تنسيق التاريخ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd_mm_yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm_dd_yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy_mm_dd">YYYY/MM/DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sendEmailNotifications">إشعارات البريد الإلكتروني</Label>
              <Switch
                id="sendEmailNotifications"
                checked={form.watch("sendEmailNotifications")}
                onCheckedChange={(checked) => form.setValue("sendEmailNotifications", checked)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              تلقي إشعارات بالبريد الإلكتروني عند وجود فواتير متأخرة أو تغييرات مهمة
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="collectAnalytics">تتبع البيانات التحليلية</Label>
              <Switch
                id="collectAnalytics"
                checked={form.watch("collectAnalytics")}
                onCheckedChange={(checked) => form.setValue("collectAnalytics", checked)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              جمع بيانات استخدام النظام لتحسين الأداء وتخصيص التجربة
            </p>
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
