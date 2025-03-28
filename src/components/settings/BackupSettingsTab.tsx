
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackupSettings } from "@/lib/settings-types";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Upload, Save, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface BackupSettingsTabProps {
  settings: BackupSettings;
  onSave: (settings: BackupSettings) => void;
  isLoading?: boolean;
}

export function BackupSettingsTab({ settings, onSave, isLoading = false }: BackupSettingsTabProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BackupSettings>({
    defaultValues: settings
  });
  
  const { toast } = useToast();

  const handleBackup = () => {
    // في الواقع، هنا سيتم تنفيذ عملية النسخ الاحتياطي
    toast({
      title: "تم إنشاء نسخة احتياطية",
      description: "تم إنشاء نسخة احتياطية بنجاح",
    });
  };

  const handleRestore = () => {
    // في الواقع، هنا سيتم تنفيذ عملية استعادة من النسخة الاحتياطية
    toast({
      title: "تم استعادة البيانات",
      description: "تم استعادة البيانات من النسخة الاحتياطية بنجاح",
    });
  };

  const mockBackups = [
    {
      id: 1,
      date: "2023-06-15 14:30:00",
      size: "2.4 MB",
      type: "تلقائي"
    },
    {
      id: 2,
      date: "2023-06-10 09:15:00",
      size: "2.2 MB",
      type: "يدوي"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>النسخ الاحتياطي واستعادة البيانات</CardTitle>
        <CardDescription>إدارة نسخ البيانات الاحتياطية واستعادتها</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start mb-6">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 ml-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">معلومات هامة</h4>
            <p className="text-sm text-blue-700 mt-1">
              ننصح بعمل نسخة احتياطية من البيانات بشكل دوري. في حالة استعادة البيانات، ستتم إزالة جميع البيانات الحالية واستبدالها بالبيانات المستعادة.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>النسخ الاحتياطي اليدوي</Label>
          <div className="flex items-center gap-4">
            <Button onClick={handleBackup}>
              <Download className="ml-2 h-4 w-4" />
              إنشاء نسخة احتياطية
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="ml-2 h-4 w-4" />
                  استعادة من نسخة احتياطية
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد من استعادة البيانات؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    ستتم إزالة جميع البيانات الحالية واستبدالها بالبيانات من النسخة الاحتياطية. هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleRestore}
                  >
                    تأكيد الاستعادة
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSave)}>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableAutoBackup">النسخ الاحتياطي التلقائي</Label>
                <Switch 
                  id="enableAutoBackup" 
                  checked={watch("enableAutoBackup")} 
                  onCheckedChange={(checked) => setValue("enableAutoBackup", checked)} 
                />
              </div>
              <p className="text-sm text-muted-foreground">
                إنشاء نسخة احتياطية تلقائية بشكل دوري
              </p>
            </div>

            {watch("enableAutoBackup") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">تكرار النسخ الاحتياطي</Label>
                  <Select 
                    defaultValue={settings.backupFrequency} 
                    onValueChange={(value) => setValue("backupFrequency", value as "daily" | "weekly" | "monthly")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تكرار النسخ الاحتياطي" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupRetention">مدة الاحتفاظ بالنسخ الاحتياطية (بالأيام)</Label>
                  <Input 
                    id="backupRetention"
                    type="number"
                    min="1"
                    {...register("backupRetention", { 
                      valueAsNumber: true,
                      min: 1
                    })}
                  />
                  {errors.backupRetention && <p className="text-sm text-red-500">يجب أن تكون مدة الاحتفاظ يوم واحد على الأقل</p>}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <Save className="ml-2 h-4 w-4" />
              حفظ الإعدادات
            </Button>
          </div>
        </form>

        <div className="mt-6 space-y-2">
          <Label>آخر النسخ الاحتياطية</Label>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">تاريخ النسخة</th>
                  <th className="text-right p-2">الحجم</th>
                  <th className="text-right p-2">النوع</th>
                  <th className="text-right p-2">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {mockBackups.map((backup) => (
                  <tr key={backup.id} className={backup.id % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="p-2">{backup.date}</td>
                    <td className="p-2">{backup.size}</td>
                    <td className="p-2">{backup.type}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "استعادة النسخة الاحتياطية",
                              description: `تم استعادة النسخة الاحتياطية بتاريخ ${backup.date}`,
                            });
                          }}
                        >
                          استعادة
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "تنزيل النسخة الاحتياطية",
                              description: `تم بدء تنزيل النسخة الاحتياطية بتاريخ ${backup.date}`,
                            });
                          }}
                        >
                          تنزيل
                        </Button>
                      </div>
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
