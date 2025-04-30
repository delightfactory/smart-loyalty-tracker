
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock, AlertTriangle, Activity, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface InactivityStatCardsProps {
  criticalCount: number;
  warningCount: number;
  recentCount: number;
  totalCustomers: number;
  inactivePercentage: number;
}

const InactivityStatCards = ({
  criticalCount,
  warningCount,
  recentCount,
  totalCustomers,
  inactivePercentage
}: InactivityStatCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground">عملاء غير نشطين جدًا</p>
              <h2 className="text-2xl font-bold">{criticalCount}</h2>
            </div>
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            غير نشطين لأكثر من 90 يوم
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Progress
                  value={totalCustomers > 0 ? (criticalCount / totalCustomers) * 100 : 0}
                  className="h-2 bg-gray-200"
                  indicatorClassName="bg-red-500"
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white shadow-lg p-2">
                <p>{Math.round(totalCustomers > 0 ? (criticalCount / totalCustomers) * 100 : 0)}% من إجمالي العملاء</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="mt-4 text-sm">
            {criticalCount > 0 ? (
              <div className="bg-red-50 text-red-800 p-2 rounded-md text-xs">
                يحتاجون لتدخل عاجل لإعادة التنشيط
              </div>
            ) : (
              <div className="bg-green-50 text-green-800 p-2 rounded-md text-xs">
                لا يوجد عملاء في حالة خطر شديد
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground">عملاء في خطر الضياع</p>
              <h2 className="text-2xl font-bold">{warningCount}</h2>
            </div>
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            غير نشطين من 30 إلى 90 يوم
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Progress
                  value={totalCustomers > 0 ? (warningCount / totalCustomers) * 100 : 0}
                  className="h-2 bg-gray-200"
                  indicatorClassName="bg-amber-500"
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white shadow-lg p-2">
                <p>{Math.round(totalCustomers > 0 ? (warningCount / totalCustomers) * 100 : 0)}% من إجمالي العملاء</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="mt-4 text-sm">
            {warningCount > 0 ? (
              <div className="bg-amber-50 text-amber-800 p-2 rounded-md text-xs">
                يحتاجون لمتابعة وعروض خاصة للعودة
              </div>
            ) : (
              <div className="bg-green-50 text-green-800 p-2 rounded-md text-xs">
                لا يوجد عملاء في حالة تحذير
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground">عملاء حديثي الغياب</p>
              <h2 className="text-2xl font-bold">{recentCount}</h2>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            غير نشطين أقل من 30 يوم
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Progress
                  value={totalCustomers > 0 ? (recentCount / totalCustomers) * 100 : 0}
                  className="h-2 bg-gray-200"
                  indicatorClassName="bg-blue-500"
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white shadow-lg p-2">
                <p>{Math.round(totalCustomers > 0 ? (recentCount / totalCustomers) * 100 : 0)}% من إجمالي العملاء</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="mt-4 text-sm">
            {recentCount > 0 ? (
              <div className="bg-blue-50 text-blue-800 p-2 rounded-md text-xs">
                فرصة عالية لإعادتهم للنشاط
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-2 rounded-md text-xs">
                لا يوجد عملاء حديثي الغياب
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي نسبة عدم النشاط</p>
              <h2 className="text-2xl font-bold">{inactivePercentage}%</h2>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            <span className="font-medium">{criticalCount + warningCount + recentCount}</span> من أصل <span className="font-medium">{totalCustomers}</span> عميل
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Progress
                  value={inactivePercentage}
                  className="h-2 bg-gray-200"
                  indicatorClassName={
                    inactivePercentage > 50 ? "bg-red-500" : 
                    inactivePercentage > 25 ? "bg-amber-500" : "bg-green-500"
                  }
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white shadow-lg p-2">
                <p>{Math.round(inactivePercentage)}% من عملائك غير نشطين</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="mt-4 text-sm">
            {inactivePercentage > 50 ? (
              <div className="bg-red-50 text-red-800 p-2 rounded-md text-xs">
                مؤشر خطر عالي: يجب تطوير خطة إعادة تنشيط
              </div>
            ) : inactivePercentage > 25 ? (
              <div className="bg-amber-50 text-amber-800 p-2 rounded-md text-xs">
                مؤشر متوسط: يجب تحسين استراتيجيات الاحتفاظ
              </div>
            ) : (
              <div className="bg-green-50 text-green-800 p-2 rounded-md text-xs">
                مؤشر جيد: معدل النشاط مرتفع
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InactivityStatCards;
