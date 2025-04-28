import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowUpCircle, ArrowDownCircle, Edit } from 'lucide-react';
import { useRedemptions } from '@/hooks/useRedemptions';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';

interface CustomerPointsHistoryProps {
  customerId: string;
}

// Helper to format date in ENGLISH (MM/DD/YYYY)
const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const CustomerPointsHistory = ({ customerId }: CustomerPointsHistoryProps) => {
  const { getByCustomerId: getRedemptions } = useRedemptions();
  const { getById: getCustomer } = useCustomers();
  const { getByCustomerId: getInvoices } = useInvoices();
  const { data: redemptions = [], isLoading: loadingRedemptions } = getRedemptions(customerId);
  const { data: invoices = [], isLoading: loadingInvoices } = getInvoices(customerId);
  const { data: customer, isLoading: loadingCustomer } = getCustomer(customerId);

  // بناء سجل العمليات (اكتساب/استبدال)
  let runningBalance = 0;
  const events = [
    // عمليات اكتساب النقاط من الفواتير
    ...invoices.map((inv) => ({
      type: 'earned',
      points: inv.pointsEarned,
      date: inv.date,
      source: 'فاتورة',
      notes: '-', // لا توجد خاصية نصية مناسبة
      id: inv.id
    })),
    // عمليات الاستبدال
    ...redemptions.map((r) => ({
      type: 'redeemed',
      points: r.totalPointsRedeemed,
      date: r.date,
      source: 'استبدال',
      notes: '-', // لا توجد خاصية نصية مناسبة
      id: r.id
    }))
  ];
  // ترتيب الأحداث حسب التاريخ تصاعديًا (الأقدم أولاً)
  const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  // حساب الرصيد بعد كل عملية
  const eventsWithBalance = sortedEvents.map((event) => {
    if (event.type === 'earned') {
      runningBalance += event.points;
    } else if (event.type === 'redeemed') {
      runningBalance -= event.points;
    }
    return { ...event, balance: runningBalance };
  });

  if (loadingRedemptions || loadingCustomer || loadingInvoices) {
    return (
      <Card><CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-3" />
        <p>جاري تحميل سجل النقاط...</p>
      </CardContent></Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowUpCircle className="mr-2 h-5 w-5 text-primary" />
          سجل النقاط
        </CardTitle>
        <CardDescription>جميع العمليات التي أثرت على نقاط العميل</CardDescription>
      </CardHeader>
      <CardContent>
        {eventsWithBalance.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>النقاط</TableHead>
                <TableHead>الرصيد بعد العملية</TableHead>
                <TableHead>المصدر</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventsWithBalance.map((event, idx) => (
                <TableRow key={event.id + '-' + idx}>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>
                    {event.type === 'earned' ? (
                      <Badge className="bg-green-100 text-green-800">كسب</Badge>
                    ) : event.type === 'redeemed' ? (
                      <Badge className="bg-red-100 text-red-800">استبدال</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800">تعديل يدوي</Badge>
                    )}
                  </TableCell>
                  <TableCell>{Number(event.points).toLocaleString('en-US')}</TableCell>
                  <TableCell>{Number(event.balance).toLocaleString('en-US')}</TableCell>
                  <TableCell>{event.source}</TableCell>
                  <TableCell>{event.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <ArrowUpCircle className="h-12 w-12 mb-4 opacity-50 text-primary" />
            <p>لا توجد عمليات نقاط لهذا العميل</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerPointsHistory;
