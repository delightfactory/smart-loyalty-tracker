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
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground dark:text-gray-300">عملاء غير نشطين جدًا</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{criticalCount}</h2>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground dark:text-gray-400 mb-2">
            غير نشطين لأكثر من 90 يوم
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Progress
                  value={totalCustomers > 0 ? (criticalCount / totalCustomers) * 100 : 0}
                  className="h-2 bg-gray-200 dark:bg-gray-800"
                  indicatorClassName="bg-red-500 dark:bg-red-400"
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white dark:bg-gray-900 shadow-lg p-2 text-gray-900 dark:text-white">
                <p>{Math.round(totalCustomers > 0 ? (criticalCount / totalCustomers) * 100 : 0)}% من إجمالي العملاء</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mt-4 text-sm">
            {criticalCount > 0 ? (
              <div className="bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 p-2 rounded-md text-xs">
                يحتاجون لتدخل عاجل لإعادة التنشيط
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 p-2 rounded-md text-xs">
                لا يوجد عملاء في حالة خطر شديد
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground dark:text-gray-300">عملاء في خطر الضياع</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{warningCount}</h2>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground dark:text-gray-400 mb-2">
            غير نشطين من 30 إلى 90 يوم
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Progress
                  value={totalCustomers > 0 ? (warningCount / totalCustomers) * 100 : 0}
                  className="h-2 bg-gray-200 dark:bg-gray-800"
                  indicatorClassName="bg-amber-500 dark:bg-amber-400"
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white dark:bg-gray-900 shadow-lg p-2 text-gray-900 dark:text-white">
                <p>{Math.round(totalCustomers > 0 ? (warningCount / totalCustomers) * 100 : 0)}% من إجمالي العملاء</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mt-4 text-sm">
            {warningCount > 0 ? (
              <div className="bg-amber-50 dark:bg-amber-900 text-amber-800 dark:text-amber-200 p-2 rounded-md text-xs">
                بحاجة لمتابعة قريبة
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 p-2 rounded-md text-xs">
                لا يوجد عملاء في حالة خطر
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground dark:text-gray-300">عملاء غير نشطين (حديثاً)</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{recentCount}</h2>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground dark:text-gray-400 mb-2">
            غير نشطين لأقل من 30 يوم
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Progress
                  value={totalCustomers > 0 ? (recentCount / totalCustomers) * 100 : 0}
                  className="h-2 bg-gray-200 dark:bg-gray-800"
                  indicatorClassName="bg-blue-500 dark:bg-blue-400"
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white dark:bg-gray-900 shadow-lg p-2 text-gray-900 dark:text-white">
                <p>{Math.round(totalCustomers > 0 ? (recentCount / totalCustomers) * 100 : 0)}% من إجمالي العملاء</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="mt-4 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-2 rounded-md text-xs">
              بحاجة لمتابعة مستمرة
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-muted-foreground dark:text-gray-300">إجمالي العملاء</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</h2>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
              <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground dark:text-gray-400 mb-2">
            نسبة غير النشطين: <span className="font-semibold">{inactivePercentage}%</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Progress
                  value={inactivePercentage}
                  className="h-2 bg-gray-200 dark:bg-gray-800"
                  indicatorClassName="bg-gray-500 dark:bg-gray-400"
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white dark:bg-gray-900 shadow-lg p-2 text-gray-900 dark:text-white">
                <p>{inactivePercentage}% من إجمالي العملاء غير نشطين</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default InactivityStatCards;
