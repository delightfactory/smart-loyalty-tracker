import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, UserPlus, UserX } from 'lucide-react';

interface CustomerStatsCardsProps {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  loading?: boolean;
}

export default function CustomerStatsCards({
  totalCustomers,
  newCustomers,
  activeCustomers,
  inactiveCustomers,
  loading
}: CustomerStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-100">إجمالي العملاء</CardTitle>
          <User className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-800" /> : <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</div>}
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-100">عملاء جدد (الشهر الحالي)</CardTitle>
          <UserPlus className="h-5 w-5 text-green-500 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-800" /> : <div className="text-2xl font-bold text-gray-900 dark:text-white">{newCustomers}</div>}
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-100">عملاء نشطون</CardTitle>
          <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-800" /> : <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeCustomers}</div>}
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-100">عملاء غير نشطين</CardTitle>
          <UserX className="h-5 w-5 text-red-500 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-800" /> : <div className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveCustomers}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
