
import { Customer } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, AlertCircle, AlertTriangle, Clock, CalendarClock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`rounded-full p-3 ${warningLevel === 'destructive' ? 'bg-destructive/10' : warningLevel === 'warning' ? 'bg-amber-100' : 'bg-secondary/50'}`}>
              {warningLevel === 'destructive' ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : warningLevel === 'warning' ? (
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              ) : (
                <Clock className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div className="text-lg font-medium">{emptyMessage}</div>
            <div className="text-sm text-muted-foreground">لا توجد بيانات لعرضها</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم العميل</TableHead>
                <TableHead>نوع النشاط</TableHead>
                <TableHead>آخر نشاط</TableHead>
                <TableHead>مدة عدم النشاط</TableHead>
                <TableHead>معلومات الاتصال</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map(customer => {
                const inactivityDays = calculateInactivityDays(customer.lastActive);
                const badgeVariant = getInactivityBadge(inactivityDays);
                const badgeCustomClass = inactivityDays > 30 && inactivityDays <= 90 ? getWarningLevelClass('warning') : '';
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.businessType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        {customer.lastActive ? formatDate(customer.lastActive) : "لم يسجل نشاط"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant} className={`flex items-center gap-1 w-fit ${badgeCustomClass}`}>
                        {getInactivityIcon(inactivityDays)}
                        {inactivityDays === Infinity ? "غير نشط تماماً" : `${inactivityDays} يوم`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" title="الاتصال">
                          <Phone className="h-4 w-4" />
                        </Button>
                        {customer.email && (
                          <Button variant="outline" size="icon" title="إرسال بريد إلكتروني">
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">عرض التفاصيل</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InactiveCustomersTable;
