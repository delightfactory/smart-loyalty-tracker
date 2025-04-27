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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
          <User className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-6 w-16" /> : <div className="text-2xl font-bold">{totalCustomers}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">عملاء جدد (الشهر الحالي)</CardTitle>
          <UserPlus className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-6 w-16" /> : <div className="text-2xl font-bold">{newCustomers}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">عملاء نشطون</CardTitle>
          <User className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-6 w-16" /> : <div className="text-2xl font-bold">{activeCustomers}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">عملاء غير نشطين</CardTitle>
          <UserX className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-6 w-16" /> : <div className="text-2xl font-bold">{inactiveCustomers}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
