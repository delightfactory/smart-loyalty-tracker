
import { useState, useRef } from "react";
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
import { Download, Upload, Save, Info, RefreshCw, Trash2, Database } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { createDatabaseBackup, restoreFromBackup, factoryReset } from "@/lib/database-utils";
import { format } from "date-fns";

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
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [isRestoreInProgress, setIsRestoreInProgress] = useState(false);
  const [isResetInProgress, setIsResetInProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle backup creation
  const handleBackup = async () => {
    setIsBackupInProgress(true);
    try {
      await createDatabaseBackup();
    } finally {
      setIsBackupInProgress(false);
    }
  };

  // Handle backup restoration
  const handleRestoreTrigger = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/json') {
      toast({
        title: "نوع ملف غير صالح",
        description: "يرجى اختيار ملف نسخة احتياطية بصيغة JSON",
        variant: "destructive"
      });
      return;
    }

    setIsRestoreInProgress(true);
    try {
      await restoreFromBackup(file);
    } finally {
      setIsRestoreInProgress(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle factory reset
  const handleFactoryReset = async () => {
    setIsResetInProgress(true);
    try {
      await factoryReset();
    } finally {
      setIsResetInProgress(false);
    }
  };

  // Mock data for recent backups list
  const mockBackups = [
    {
      id: 1,
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      size: "2.4 MB",
      type: "تلقائي"
    },
    {
      id: 2,
      date: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd HH:mm:ss'), // 5 days ago
      size: "2.2 MB",
      type: "يدوي"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>النسخ الاحتياطي واستعادة البيانات</CardTitle>
        <CardDescription>إدارة نسخ البيانات الاحتياطية واستعادتها وإعادة ضبط النظام</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start mb-6 dark:bg-blue-950 dark:border-blue-900">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 ml-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300">معلومات هامة</h4>
            <p className="text-sm text-blue-700 mt-1 dark:text-blue-400">
              ننصح بعمل نسخة احتياطية من البيانات بشكل دوري. في حالة استعادة البيانات، ستتم إزالة جميع البيانات الحالية واستبدالها بالبيانات المستعادة.
              أما إعادة ضبط المصنع فستحذف جميع البيانات مع الحفاظ على إعدادات النظام.
            </p>
          </div>
        </div>

        {/* Factory Reset Section */}
        <div className="border border-red-200 rounded-md p-4 bg-red-50 dark:bg-red-950 dark:border-red-900">
          <h3 className="font-medium text-red-900 text-lg mb-2 dark:text-red-300">إعادة ضبط المصنع</h3>
          <p className="text-sm text-red-700 mb-4 dark:text-red-400">
            تحذير: ستؤدي إعادة ضبط المصنع إلى حذف جميع البيانات (العملاء، المنتجات، الفواتير، إلخ) مع الاحتفاظ بإعدادات النظام.
            هذه العملية لا يمكن التراجع عنها.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="ml-2 h-4 w-4" />
                إعادة ضبط المصنع
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد إعادة ضبط المصنع</AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من إعادة ضبط النظام؟ سيتم حذف جميع البيانات (العملاء، المنتجات، الفواتير، إلخ).
                  <span className="block mt-2 font-bold">هذه العملية لا يمكن التراجع عنها.</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleFactoryReset}
                  disabled={isResetInProgress}
                >
                  {isResetInProgress ? (
                    <>
                      <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                      جاري التنفيذ...
                    </>
                  ) : (
                    <>تأكيد إعادة الضبط</>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="space-y-2">
          <Label>النسخ الاحتياطي اليدوي</Label>
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={handleBackup}
              disabled={isBackupInProgress}
            >
              {isBackupInProgress ? (
                <>
                  <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Download className="ml-2 h-4 w-4" />
                  إنشاء نسخة احتياطية
                </>
              )}
            </Button>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            
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
                    onClick={handleRestoreTrigger}
                    disabled={isRestoreInProgress}
                  >
                    {isRestoreInProgress ? 'جاري الاستعادة...' : 'اختيار ملف واستعادة البيانات'}
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
                  <tr key={backup.id} className={backup.id % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : ""}>
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
