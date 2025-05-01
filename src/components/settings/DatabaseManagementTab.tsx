
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Database, RefreshCw, AlertTriangle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { factoryReset } from "@/lib/database-utils";

export function DatabaseManagementTab() {
  const { toast } = useToast();
  const [isResetInProgress, setIsResetInProgress] = useState(false);

  // Handle factory reset
  const handleFactoryReset = async () => {
    setIsResetInProgress(true);
    try {
      await factoryReset();
    } finally {
      setIsResetInProgress(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة قاعدة البيانات</CardTitle>
        <CardDescription>إعادة ضبط المصنع وإدارة البيانات</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start mb-6 dark:bg-amber-950 dark:border-amber-900">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 ml-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900 dark:text-amber-300">منطقة خطرة</h4>
            <p className="text-sm text-amber-700 mt-1 dark:text-amber-400">
              الإجراءات في هذه المنطقة تؤدي إلى حذف البيانات بشكل دائم. يرجى التأكد من عمل نسخة احتياطية قبل المتابعة.
            </p>
          </div>
        </div>

        <div className="border border-red-200 rounded-md p-5 bg-red-50 dark:bg-red-950 dark:border-red-900">
          <h3 className="font-medium text-red-900 text-lg mb-3 dark:text-red-300">إعادة ضبط المصنع</h3>
          <p className="text-sm text-red-700 mb-4 dark:text-red-400">
            ستؤدي إعادة ضبط المصنع إلى حذف جميع البيانات في النظام بما في ذلك:
          </p>
          
          <ul className="list-disc list-inside text-sm text-red-700 mb-4 space-y-1 mr-2 dark:text-red-400">
            <li>جميع بيانات العملاء</li>
            <li>جميع المنتجات</li>
            <li>جميع الفواتير والمدفوعات</li>
            <li>جميع عمليات استبدال النقاط</li>
          </ul>
          
          <p className="text-sm text-red-700 mb-4 font-bold dark:text-red-400">
            سيتم الاحتفاظ بإعدادات النظام فقط.
          </p>
          
          <div className="bg-red-100 p-3 rounded-md border border-red-300 mb-4 dark:bg-red-900 dark:border-red-700">
            <p className="text-sm text-red-800 font-bold dark:text-red-300">
              تحذير: هذه العملية لا يمكن التراجع عنها!
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Database className="ml-2 h-4 w-4" />
                إعادة ضبط المصنع
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد إعادة ضبط المصنع</AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من إعادة ضبط النظام بالكامل؟ سيتم حذف جميع البيانات (العملاء، المنتجات، الفواتير، إلخ).
                  <span className="block mt-2 font-bold text-red-600 dark:text-red-400">هذه العملية لا يمكن التراجع عنها.</span>
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
                      جاري إعادة الضبط...
                    </>
                  ) : (
                    <>تأكيد إعادة الضبط</>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="border rounded-md p-5 mt-6">
          <h3 className="font-medium text-lg mb-3">معلومات قاعدة البيانات</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">مزود قاعدة البيانات:</span>
              <span className="font-medium">Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">وضع الاتصال:</span>
              <span className="text-green-600 font-medium">متصل</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">آخر تحديث للبيانات:</span>
              <span className="font-medium">{new Date().toLocaleString('ar-EG')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
