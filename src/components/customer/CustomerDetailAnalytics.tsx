import { FC } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShoppingCart, Wallet, Calendar as CalendarIcon, Percent as PercentIcon, Award, CheckCircle } from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/lib/types';
import { differenceInDays } from 'date-fns';

interface CustomerDetailAnalyticsProps {
  invoices: Invoice[];
}

const CustomerDetailAnalytics: FC<CustomerDetailAnalyticsProps> = ({ invoices }) => {
  const totalInvoices = invoices.length;
  const totalSpent = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const avgInvoiceValue = totalInvoices > 0 ? totalSpent / totalInvoices : 0;

  // حساب آخر تاريخ فاتورة
  const lastInvoiceDate = invoices
    .map(inv => new Date(inv.date))
    .reduce((latest, date) => (date > latest ? date : latest), new Date(0));
  const daysSinceLastPurchase = totalInvoices > 0
    ? differenceInDays(new Date(), lastInvoiceDate)
    : null;

  // مجموع النقاط المكتسبة والمستبدلة
  const totalPointsEarned = invoices.reduce((sum, inv) => sum + (inv.pointsEarned || 0), 0);
  const totalPointsRedeemed = invoices.reduce((sum, inv) => sum + (inv.pointsRedeemed || 0), 0);

  // متوسط الأيام بين الفواتير
  const purchaseDates = invoices.map(inv => new Date(inv.date)).sort((a, b) => a.getTime() - b.getTime());
  let totalDiffBetween = 0;
  for (let i = 1; i < purchaseDates.length; i++) {
    totalDiffBetween += differenceInDays(purchaseDates[i], purchaseDates[i - 1]);
  }
  const avgDaysBetween = purchaseDates.length > 1 ? Math.round(totalDiffBetween / (purchaseDates.length - 1)) : null;

  // نسبة الفواتير المدفوعة
  const paidCount = invoices.filter(inv => inv.status === InvoiceStatus.PAID).length;
  const paidPercentage = totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>إجمالي الفواتير</CardTitle>
          <CardDescription>عدد الفواتير الصادرة للعميل</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-2xl font-bold">{totalInvoices}</span>
          <ShoppingCart className="h-6 w-6 text-blue-500" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>إجمالي الإنفاق</CardTitle>
          <CardDescription>المبلغ الإجمالي الذي أنفقه العميل</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-2xl font-bold">{totalSpent.toFixed(2)}</span>
          <Wallet className="h-6 w-6 text-green-500" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>متوسط قيمة الفاتورة</CardTitle>
          <CardDescription>متوسط المبلغ لكل فاتورة</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-2xl font-bold">{avgInvoiceValue.toFixed(2)}</span>
          <PercentIcon className="h-6 w-6 text-purple-500" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>آخر شراء منذ</CardTitle>
          <CardDescription>عدد الأيام منذ آخر فاتورة</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {daysSinceLastPurchase !== null ? `${daysSinceLastPurchase} يوم` : 'لا توجد بيانات'}
          </span>
          <CalendarIcon className="h-6 w-6 text-amber-500" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>إجمالي النقاط المكتسبة</CardTitle>
          <CardDescription>مجموع النقاط التي كسبها العميل</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-2xl font-bold">{totalPointsEarned}</span>
          <Award className="h-6 w-6 text-yellow-500" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>إجمالي النقاط المستبدلة</CardTitle>
          <CardDescription>مجموع النقاط التي استبدلها العميل</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-2xl font-bold">{totalPointsRedeemed}</span>
          <PercentIcon className="h-6 w-6 text-pink-500" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>متوسط الأيام بين المشتريات</CardTitle>
          <CardDescription>متوسط الأيام بين الفواتير</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-2xl font-bold">{avgDaysBetween !== null ? `${avgDaysBetween} يوم` : '-'}</span>
          <CalendarIcon className="h-6 w-6 text-indigo-500" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>نسبة الفواتير المدفوعة</CardTitle>
          <CardDescription>النسبة المئوية للفواتير المدفوعة كاملة</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-2xl font-bold">{paidPercentage}%</span>
          <CheckCircle className="h-6 w-6 text-green-600" />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetailAnalytics;
