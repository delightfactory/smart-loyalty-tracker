import { Customer } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, AlertCircle, AlertTriangle, Clock, CalendarClock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface InactiveCustomersTableProps {
  customers: Customer[];
  loading?: boolean;
  title?: string;
  description?: string;
  emptyMessage?: string;
  warningLevel?: 'default' | 'warning' | 'destructive';
}

const InactiveCustomersTable = ({
  customers,
  loading = false,
  title = 'العملاء غير النشطين',
  description = 'قائمة العملاء الذين لم يتفاعلوا مع النظام مؤخراً',
  emptyMessage = 'لا يوجد عملاء غير نشطين في الوقت الحالي',
  warningLevel = 'default'
}: InactiveCustomersTableProps) => {
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(customers.length / pageSize);
  const paginatedCustomers = customers.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  useEffect(() => setPageIndex(0), [customers]);

  // Calculate inactivity days
  const calculateInactivityDays = (lastActive?: string) => {
    if (!lastActive) return Infinity; // If no activity date, consider as infinite inactivity
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    return Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  // Get appropriate icon based on inactivity period
  const getInactivityIcon = (days: number) => {
    if (days > 90) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (days > 30) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <Clock className="h-4 w-4 text-slate-500" />;
  };
  
  // Get appropriate badge color based on inactivity period
  const getInactivityBadge = (days: number) => {
    // Change "warning" to "secondary" with appropriate styling
    if (days > 90) return "destructive";
    if (days > 30) return "secondary"; // Changed from "warning" to "secondary"
    return "secondary";
  };
  
  // Get badge style class based on warning level to maintain amber color for "warning" level
  const getWarningLevelClass = (level: string) => {
    if (level === 'warning') return 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
    if (level === 'destructive') return ''; // Use default destructive style
    return ''; // Use default secondary style
  };
  
  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{title}</CardTitle>
          <CardDescription className="text-muted-foreground dark:text-gray-300">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full bg-gray-200 dark:bg-gray-800" />
        </CardContent>
      </Card>
    );
  }
  
  if (customers.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{title}</CardTitle>
          <CardDescription className="text-muted-foreground dark:text-gray-300">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`rounded-full p-3 ${warningLevel === 'destructive' ? 'bg-destructive/10 dark:bg-red-900/30' : warningLevel === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-secondary/50 dark:bg-gray-800/60'}`}>
              {warningLevel === 'destructive' ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : warningLevel === 'warning' ? (
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              ) : (
                <Clock className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div className="text-lg font-medium">{emptyMessage}</div>
            <div className="text-sm text-muted-foreground dark:text-gray-300">لا توجد بيانات لعرضها</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{title}</CardTitle>
        <CardDescription className="text-muted-foreground dark:text-gray-300">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="bg-white dark:bg-gray-900">
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-700 dark:text-gray-200">اسم العميل</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-200">نوع النشاط</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-200">آخر نشاط</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-200">مدة عدم النشاط</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-200">معلومات الاتصال</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-200">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map(customer => {
              const inactivityDays = calculateInactivityDays(customer.lastActive);
              const badgeVariant = getInactivityBadge(inactivityDays);
              const badgeCustomClass = inactivityDays > 30 && inactivityDays <= 90 ? getWarningLevelClass('warning') : '';
              
              return (
                <TableRow key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <TableCell className="text-gray-900 dark:text-white font-medium">{customer.name}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{customer.businessType}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-4 w-4 text-muted-foreground dark:text-gray-300" />
                      {customer.lastActive ? formatDate(customer.lastActive) : "لم يسجل نشاط"}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    <Badge variant={badgeVariant} className={`flex items-center gap-1 w-fit ${badgeCustomClass}`}>
                      {getInactivityIcon(inactivityDays)}
                      {inactivityDays === Infinity ? "غير نشط تماماً" : `${inactivityDays} يوم`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" title="الاتصال" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700" onClick={() => window.location.href = `tel:${customer.phone}`}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      {customer.email && (
                        <Button variant="outline" size="icon" title="إرسال بريد إلكتروني" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700">
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    <Button variant="outline" size="sm" className="text-xs text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700" onClick={() => navigate(`/customers/${customer.id}`)}>عرض التفاصيل</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <span>صفحة {pageIndex + 1} من {totalPages}</span>
            <div className="space-x-2">
              <Button size="sm" variant="outline" onClick={() => setPageIndex(p => Math.max(p - 1, 0))} disabled={pageIndex <= 0}>السابق</Button>
              <Button size="sm" variant="outline" onClick={() => setPageIndex(p => Math.min(p + 1, totalPages - 1))} disabled={pageIndex + 1 >= totalPages}>التالي</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InactiveCustomersTable;
