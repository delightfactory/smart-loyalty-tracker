import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock, AlertTriangle, Activity, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface InactivityStatCardsProps {
  activeCount: number;
  criticalCount: number;
  warningCount: number;
  recentCount: number;
  totalCustomers: number;
  inactivePercentage: number;
  onSelect?: (tab: 'active' | 'inactive' | 'warning' | 'critical' | 'analytics') => void;
}

const InactivityStatCards = ({
  activeCount,
  criticalCount,
  warningCount,
  recentCount,
  totalCustomers,
  inactivePercentage,
  onSelect
}: InactivityStatCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card onClick={() => onSelect?.('active')} className="cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardContent className="p-4 text-center flex flex-col items-center space-y-3 h-48 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 hover:shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2 w-full">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">العملاء النشطين</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</h2>
            </div>
            <div className="bg-green-300 dark:bg-green-700 p-2 rounded-full">
              <Activity className="h-6 w-6 text-green-800 dark:text-green-200" />
            </div>
          </div>
          <div className="w-full text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2 whitespace-nowrap">
            تفاعلوا خلال 7 أيام
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Progress
                  value={totalCustomers > 0 ? (activeCount / totalCustomers) * 100 : 0}
                  className="h-2 bg-gray-200 dark:bg-gray-800"
                  indicatorClassName="bg-green-500 dark:bg-green-400"
                />
              </TooltipTrigger>
              <TooltipContent className="bg-white dark:bg-gray-900 shadow-lg p-2 text-gray-900 dark:text-white">
                <p>{Math.round(totalCustomers > 0 ? (activeCount / totalCustomers) * 100 : 0)}% من إجمالي العملاء</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="w-full mt-4 text-sm flex justify-center">
            <div className="bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 p-2 rounded-md text-xs">
              عملاء نشطون جداً
            </div>
          </div>
        </CardContent>
      </Card>
      <Card onClick={() => onSelect?.('critical')} className="cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardContent className="p-4 text-center flex flex-col items-center space-y-3 h-48 bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900 dark:to-red-800 hover:shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2 w-full">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">عملاء غير نشطين جدًا</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{criticalCount}</h2>
            </div>
            <div className="bg-red-300 dark:bg-red-700 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-800 dark:text-red-200" />
            </div>
          </div>
          <div className="w-full text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2 whitespace-nowrap">
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
          <div className="w-full mt-4 text-sm flex justify-center">
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
      <Card onClick={() => onSelect?.('warning')} className="cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardContent className="p-4 text-center flex flex-col items-center space-y-3 h-48 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900 dark:to-amber-800 hover:shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2 w-full">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">عملاء في خطر الضياع</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{warningCount}</h2>
            </div>
            <div className="bg-amber-300 dark:bg-amber-700 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-800 dark:text-amber-200" />
            </div>
          </div>
          <div className="w-full text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2 whitespace-nowrap">
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
          <div className="w-full mt-4 text-sm flex justify-center">
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
      <Card onClick={() => onSelect?.('inactive')} className="cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardContent className="p-4 text-center flex flex-col items-center space-y-3 h-48 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 hover:shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2 w-full">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">عملاء غير نشطين (حديثاً)</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{recentCount}</h2>
            </div>
            <div className="bg-blue-300 dark:bg-blue-700 p-2 rounded-full">
              <Clock className="h-6 w-6 text-blue-800 dark:text-blue-200" />
            </div>
          </div>
          <div className="w-full text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2 whitespace-nowrap">
            غير نشطين بين 7 و30 يوم
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
          <div className="w-full mt-4 text-sm flex justify-center">
            <div className="bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-2 rounded-md text-xs">
              بحاجة لمتابعة مستمرة
            </div>
          </div>
        </CardContent>
      </Card>
      <Card onClick={() => onSelect?.('analytics')} className="cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardContent className="p-4 text-center flex flex-col items-center space-y-3 h-48 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2 w-full">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">إجمالي العملاء</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</h2>
            </div>
            <div className="bg-gray-300 dark:bg-gray-700 p-2 rounded-full">
              <Users className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            </div>
          </div>
          <div className="w-full text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2 whitespace-nowrap">
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
