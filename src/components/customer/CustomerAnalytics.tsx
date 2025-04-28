import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCategory } from '@/lib/types';
import { 
  calculateCategoryDistribution, 
  getOnTimePaymentRate,
  calculateLoyaltyScore,
  getLoyaltySegment,
  predictChurn,
  calculateCLV,
  getRepeatPurchaseRate,
  getEngagementStats,
  predictNextFavoriteProducts,
  calculateRFM,
  compareWithSector,
  calculateLoyaltyScoreWeighted,
  getMonthlyPurchaseTrend
} from '@/lib/calculations';
import type { LoyaltyWeights, RFMResult, SectorComparison, TrendPoint } from '@/lib/calculations';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from '@/hooks/useProducts';
import { formatAmountEn, formatDateEn } from '@/lib/formatters'; // استورد دالة formatAmountEn من '@/lib/formatters'
import AnalyticsFilterBar from './AnalyticsFilterBar';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface CustomerAnalyticsProps {
  customerId: string;
}

const CustomerAnalytics = ({ customerId }: CustomerAnalyticsProps) => {
  // جلب بيانات الفواتير والمدفوعات الحقيقية
  const { getByCustomerId: getInvoices } = useInvoices();
  const { getByCustomerId: getPayments } = usePayments();
  const { data: invoices = [], isLoading: loadingInvoices } = getInvoices(customerId);
  const { data: payments = [], isLoading: loadingPayments } = getPayments(customerId);

  // جلب المنتجات الحقيقية
  const { getAll: getAllProducts } = useProducts();
  const { data: products = [] } = getAllProducts;

  // حالة الفلترة بالتاريخ
  const [dateFilter, setDateFilter] = React.useState<{ from: string; to: string }>({ from: '', to: '' });

  // فلترة الفواتير والمدفوعات حسب التاريخ
  const filteredInvoices = React.useMemo(() => {
    if (!dateFilter.from && !dateFilter.to) return invoices;
    return invoices.filter(inv => {
      const d = new Date(inv.date);
      const from = dateFilter.from ? new Date(dateFilter.from) : null;
      const to = dateFilter.to ? new Date(dateFilter.to) : null;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [invoices, dateFilter]);

  // حساب توزيع المشتريات حسب الفئات
  const categoryDistribution = React.useMemo(() => {
    // تهيئة جميع الفئات بقيمة 0
    const distribution = Object.values(ProductCategory).reduce(
      (acc, category) => ({ ...acc, [category]: 0 }),
      {} as Record<string, number>
    );
    let totalPurchases = 0;
    filteredInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          distribution[product.category] = (distribution[product.category] || 0) + item.totalPrice;
          totalPurchases += item.totalPrice;
        }
      });
    });
    if (totalPurchases > 0) {
      Object.keys(distribution).forEach(category => {
        distribution[category] = Math.round((distribution[category] / totalPurchases) * 100);
      });
    }
    return distribution;
  }, [filteredInvoices, products]);

  // بيانات الرسم البياني للفئات
  const categoryData = Object.entries(categoryDistribution)
    .filter(([_, value]) => Number(value) > 0)
    .map(([key, value]) => ({
      name: key,
      value: Number(value)
    }));

  // حساب المشتريات الشهرية
  const monthlyPurchaseData = React.useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredInvoices.forEach(inv => {
      const date = new Date(inv.date);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      map[key] = (map[key] || 0) + inv.totalAmount;
    });
    // تحويل إلى مصفوفة مع اسم الشهر بالإنجليزية
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([key, amount]) => {
      const [year, month] = key.split('-');
      const date = new Date(Number(year), Number(month) - 1);
      return {
        name: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        amount
      };
    });
  }, [filteredInvoices]);

  // حساب معدل الاحتفاظ (عدد الأشهر التي اشترى فيها ÷ عدد الأشهر منذ أول عملية)
  const retentionRate = React.useMemo(() => {
    if (filteredInvoices.length === 0) return 0;
    const months = new Set<string>();
    filteredInvoices.forEach(inv => {
      const date = new Date(inv.date);
      months.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
    });
    const first = new Date(Math.min(...filteredInvoices.map(inv => new Date(inv.date).getTime())));
    const now = new Date();
    const totalMonths = (now.getFullYear() - first.getFullYear()) * 12 + (now.getMonth() - first.getMonth() + 1);
    return Math.round((months.size / totalMonths) * 100);
  }, [filteredInvoices]);

  // المنتجات والفئات الأكثر شراءً
  const mostPurchasedProducts = React.useMemo(() => {
    const map: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        map[item.productId] = (map[item.productId] || 0) + item.quantity;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => {
      const product = products.find(p => p.id === id);
      return product ? product.name : id;
    });
  }, [filteredInvoices, products]);

  const mostPurchasedCategories = React.useMemo(() => {
    const map: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          map[product.category] = (map[product.category] || 0) + item.quantity;
        }
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat]) => cat);
  }, [filteredInvoices, products]);

  // اتجاه الشراء (trend)
  const purchaseTrend = React.useMemo(() => {
    if (monthlyPurchaseData.length < 2) return 'stable';
    const first = monthlyPurchaseData[0].amount;
    const last = monthlyPurchaseData[monthlyPurchaseData.length - 1].amount;
    if (last > first) return 'increasing';
    if (last < first) return 'decreasing';
    return 'stable';
  }, [monthlyPurchaseData]);

  // معدل السداد في الوقت المحدد
  const onTimePaymentRate = React.useMemo(() => {
    if (filteredInvoices.length === 0) return 100;
    let onTimeCount = 0;
    filteredInvoices.forEach(invoice => {
      if (invoice.status === 'مدفوع' && invoice.dueDate) {
        const dueDate = new Date(invoice.dueDate);
        const paidDate = new Date(invoice.date);
        if (paidDate <= dueDate) onTimeCount++;
      }
    });
    return Math.round((onTimeCount / filteredInvoices.length) * 100);
  }, [filteredInvoices]);

  // تحليلات الولاء المتقدمة
  const loyaltyScore = React.useMemo(() => calculateLoyaltyScore(customerId), [customerId, filteredInvoices, payments]);
  const loyaltySegment = React.useMemo(() => getLoyaltySegment(customerId), [customerId, filteredInvoices, payments]);
  const churnRate = React.useMemo(() => predictChurn(customerId), [customerId, filteredInvoices, payments]);
  const clv = React.useMemo(() => calculateCLV(customerId), [customerId, filteredInvoices, payments]);
  const repeatRate = React.useMemo(() => getRepeatPurchaseRate(customerId), [customerId, filteredInvoices, payments]);
  const engagement = React.useMemo(() => getEngagementStats(customerId), [customerId, filteredInvoices, payments]);
  const predictedProducts = React.useMemo(() => predictNextFavoriteProducts(customerId, 3), [customerId, filteredInvoices, payments, products]);

  // إعداد الأوزان الافتراضية ويمكن تعديلها من واجهة الإدارة مستقبلاً
  const defaultWeights: LoyaltyWeights = { amountWeight: 0.3, repeatWeight: 0.4, onTimeWeight: 0.3 };

  // حساب نقاط الولاء المركبة (Weighted Loyalty Score)
  const weightedLoyaltyScore = React.useMemo(() => calculateLoyaltyScoreWeighted(customerId, defaultWeights), [customerId, filteredInvoices, payments, defaultWeights]);

  // جلب جميع العملاء في نفس القطاع (مثال: نفس نوع النشاط)
  const { data: allCustomers = [] } = useQuery<any[]>({ queryKey: ['customers'] }); 
  const customer = allCustomers.find((c) => c.id === customerId);
  const sectorCustomers = allCustomers.filter((c) => c.businessType === (customer?.businessType || ''));
  const sectorCustomerIds = sectorCustomers.map((c) => c.id);

  // حساب RFM
  const paidInvoices = React.useMemo(() => filteredInvoices.filter(inv => inv.status === 'مدفوع' || inv.status === 'مدفوع جزئياً'), [filteredInvoices]);
  const rfm: RFMResult = React.useMemo(() => {
    if (paidInvoices.length === 0) return { recency: -1, frequency: 0, monetary: 0 };
    const lastInvoice = paidInvoices.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
    const recency = Math.floor((new Date().getTime() - new Date(lastInvoice.date).getTime()) / (1000 * 60 * 60 * 24));
    const frequency = paidInvoices.length;
    const monetary = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    return { recency, frequency, monetary };
  }, [paidInvoices]);

  // حساب RFM للقطاع
  const sectorPaidRFM = React.useMemo(() => {
    return sectorCustomerIds.map(cid => {
      const invs = invoices.filter(inv => inv.customerId === cid && (inv.status === 'مدفوع' || inv.status === 'مدفوع جزئياً'));
      if (invs.length === 0) return { recency: -1, frequency: 0, monetary: 0 };
      const lastInvoice = invs.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
      const recency = Math.floor((new Date().getTime() - new Date(lastInvoice.date).getTime()) / (1000 * 60 * 60 * 24));
      const frequency = invs.length;
      const monetary = invs.reduce((sum, inv) => sum + inv.totalAmount, 0);
      return { recency, frequency, monetary };
    });
  }, [sectorCustomerIds, invoices]);
  const sectorComparison: SectorComparison = React.useMemo(() => {
    if (sectorPaidRFM.length === 0) return { avgRecency: 0, avgFrequency: 0, avgMonetary: 0, avgLoyalty: 0 };
    const valid = sectorPaidRFM.filter(rfm => rfm.frequency > 0);
    if (valid.length === 0) return { avgRecency: 0, avgFrequency: 0, avgMonetary: 0, avgLoyalty: 0 };
    const avgRecency = Math.round(valid.reduce((sum, rfm) => sum + (rfm.recency > -1 ? rfm.recency : 0), 0) / valid.length);
    const avgFrequency = Math.round(valid.reduce((sum, rfm) => sum + rfm.frequency, 0) / valid.length);
    const avgMonetary = Math.round(valid.reduce((sum, rfm) => sum + rfm.monetary, 0) / valid.length);
    const avgLoyalty = Math.round(valid.reduce((sum, rfm, i) => sum + calculateLoyaltyScore(sectorCustomerIds[i]), 0) / valid.length);
    return { avgRecency, avgFrequency, avgMonetary, avgLoyalty };
  }, [sectorPaidRFM, sectorCustomerIds]);

  // عدد العملاء في القطاع
  const sectorCount = sectorCustomerIds.length;

  // تنسيق العملة والتواريخ بالإنجليزية دائمًا
  const formatCurrency = (value: number) => {
    return formatAmountEn(value);
  };

  // دالة تنسيق رقم بدون رمز العملة
  const formatAmountNoCurrency = (value: number) => {
    const numberOnly = String(formatAmountEn(value)).replace(/[^\d.,-]+/g, '').replace(/\s+/g, '');
    return numberOnly;
  };

  // --- ملخص سريع أعلى التبويب ---
  const summary = React.useMemo(() => {
    if (!filteredInvoices.length) return null;
    const totalInvoices = filteredInvoices.length;
    const totalSpent = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const lastInvoice = filteredInvoices.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
    const highestInvoice = filteredInvoices.reduce((a, b) => a.totalAmount > b.totalAmount ? a : b);
    const avgInvoice = totalInvoices ? (totalSpent / totalInvoices) : 0;
    return {
      totalInvoices,
      totalSpent,
      lastInvoiceDate: lastInvoice ? lastInvoice.date : null,
      highestInvoiceAmount: highestInvoice ? highestInvoice.totalAmount : 0,
      avgInvoice
    };
  }, [filteredInvoices]);

  // --- المنتجات الأكثر شراءً مع الكمية والقيمة ---
  const topProducts = React.useMemo(() => {
    const map: Record<string, { name: string; quantity: number; value: number }> = {};
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!map[product.id]) map[product.id] = { name: product.name, quantity: 0, value: 0 };
          map[product.id].quantity += item.quantity;
          map[product.id].value += item.totalPrice;
        }
      });
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity).slice(0, 3);
  }, [filteredInvoices, products]);

  // --- الفئات الأكثر شراءً مع النسبة وعدد العمليات ---
  const topCategories = React.useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!map[product.category]) map[product.category] = { count: 0, value: 0 };
          map[product.category].count += item.quantity;
          map[product.category].value += item.totalPrice;
        }
      });
    });
    return Object.entries(map).map(([cat, data]) => ({ category: cat, ...data })).sort((a, b) => b.count - a.count).slice(0, 3);
  }, [filteredInvoices, products]);

  // --- آخر عملية استبدال نقاط ---
  const lastRedemption = React.useMemo(() => {
    return null; // للتطوير لاحقًا
  }, [customerId]);

  // --- توصيات بناءً على السلوك ---
  const recommendations = React.useMemo(() => {
    if (!filteredInvoices.length) return ['لم يقم العميل بأي عملية شراء حتى الآن.'];
    if (loyaltyScore > 80) return ['عميل ذو ولاء مرتفع، حافظ على التواصل معه بعروض خاصة.'];
    if (churnRate > 50) return ['احتمالية فقدان العميل مرتفعة، اقترح تقديم حافز للعودة.'];
    if (repeatRate > 70) return ['عميل نشط في الشراء المتكرر.'];
    return ['تابع سلوك العميل باستمرار وقدم عروضًا مخصصة حسب احتياجاته.'];
  }, [filteredInvoices, loyaltyScore, churnRate, repeatRate]);

  if (loadingInvoices || loadingPayments) {
    return <div className="flex items-center justify-center h-64">جارٍ تحميل التحليلات...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* شريط فلترة التاريخ */}
      <AnalyticsFilterBar onDateRangeChange={(from, to) => setDateFilter({ from, to })} />

      {/* --- ملخص سريع أعلى التبويب --- */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
          <div className="rounded-lg p-4 flex flex-col items-center border bg-white dark:bg-zinc-900 dark:border-zinc-700 min-w-[120px] w-full">
            <span className="text-xs text-gray-600 dark:text-gray-300">إجمالي الفواتير</span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400 break-words">
              {formatAmountEn(summary.totalInvoices)}
            </span>
          </div>
          <div className="rounded-lg p-4 flex flex-col items-center border bg-white dark:bg-zinc-900 dark:border-zinc-700 min-w-[120px] w-full">
            <span className="text-xs text-gray-600 dark:text-gray-300">إجمالي الإنفاق</span>
            <span className="text-xl font-bold text-green-700 dark:text-green-400 break-words">
              {formatAmountNoCurrency(summary.totalSpent)}
            </span>
          </div>
          <div className="rounded-lg p-4 flex flex-col items-center border bg-white dark:bg-zinc-900 dark:border-zinc-700 min-w-[120px] w-full">
            <span className="text-xs text-gray-600 dark:text-gray-300">متوسط قيمة الفاتورة</span>
            <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400 break-words">
              {formatAmountNoCurrency(summary.avgInvoice)}
            </span>
          </div>
          <div className="rounded-lg p-4 flex flex-col items-center border bg-white dark:bg-zinc-900 dark:border-zinc-700 min-w-[120px] w-full">
            <span className="text-xs text-gray-600 dark:text-gray-300">تاريخ آخر شراء</span>
            <span className="text-xl font-bold text-purple-700 dark:text-purple-400 break-words">
              {summary.lastInvoiceDate ? formatDateEn(summary.lastInvoiceDate) : '-'}
            </span>
          </div>
          <div className="rounded-lg p-4 flex flex-col items-center border bg-white dark:bg-zinc-900 dark:border-zinc-700 min-w-[120px] w-full">
            <span className="text-xs text-gray-600 dark:text-gray-300">أعلى فاتورة</span>
            <span className="text-xl font-bold text-orange-700 dark:text-orange-400 break-words">
              {formatAmountNoCurrency(summary.highestInvoiceAmount)}
            </span>
          </div>
        </div>
      )}

      {/* --- توصيات بناءً على البيانات --- */}
      <div className="mb-6">
        <h4 className="text-base font-semibold mb-2">توصيات وتحليل سريع:</h4>
        <ul className="list-disc pl-6">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="break-words max-w-full">{rec}</li>
          ))}
        </ul>
      </div>

      {/* --- المنتجات والفئات الأكثر شراءً --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="shadow-sm border-2 border-blue-100 dark:border-zinc-700 w-full min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">المنتجات الأكثر شراءً</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400">
                    <th className="text-right px-2 py-1">المنتج</th>
                    <th className="text-center px-2 py-1">الكمية</th>
                    <th className="text-center px-2 py-1">إجمالي القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length ? topProducts.map((prod, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-2 py-1 font-medium text-right">{prod.name}</td>
                      <td className="px-2 py-1 text-center">{formatAmountEn(prod.quantity, { currency: false })}</td>
                      <td className="px-2 py-1 text-center">{formatAmountNoCurrency(prod.value)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="text-center py-2 text-gray-400">لا توجد بيانات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-2 border-amber-100 dark:border-zinc-700 w-full min-w-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">الفئات الأكثر شراءً</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400">
                    <th className="text-right px-2 py-1">الفئة</th>
                    <th className="text-center px-2 py-1">عدد العمليات</th>
                    <th className="text-center px-2 py-1">إجمالي القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  {topCategories.length ? topCategories.map((cat, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-2 py-1 font-medium text-right">{cat.category}</td>
                      <td className="px-2 py-1 text-center">{formatAmountEn(cat.count, { currency: false })}</td>
                      <td className="px-2 py-1 text-center">{formatAmountNoCurrency(cat.value)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="text-center py-2 text-gray-400">لا توجد بيانات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* توزيع المشتريات حسب الأقسام */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع المشتريات حسب الأقسام</CardTitle>
          <CardDescription>النسبة المئوية للإنفاق في كل قسم</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'النسبة المئوية']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* تطور المشتريات الشهرية */}
      <Card>
        <CardHeader>
          <CardTitle>تطور المشتريات الشهرية</CardTitle>
          <CardDescription>قيمة المشتريات على مدار الأشهر</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPurchaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [formatAmountNoCurrency(value as number), 'قيمة المشتريات']} />
              <Legend />
              <Bar dataKey="amount" name="قيمة المشتريات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* معدل الاحتفاظ */}
      <Card>
        <CardHeader>
          <CardTitle>معدل الاحتفاظ بالعميل</CardTitle>
          <CardDescription>نسبة الأشهر التي قام فيها العميل بالشراء</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <span className="text-5xl font-bold text-blue-700">{retentionRate}%</span>
          <span className="mt-2 text-muted-foreground">معدل الاحتفاظ الشهري</span>
        </CardContent>
      </Card>

      {/* معدل الالتزام بالسداد */}
      <Card>
        <CardHeader>
          <CardTitle>معدل الالتزام بالسداد</CardTitle>
          <CardDescription>نسبة السداد في الوقت المحدد</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative h-40 w-40">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted stroke-current"
                  strokeWidth="10"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={cn(
                    "stroke-current",
                    onTimePaymentRate >= 75 ? "text-green-500" :
                    onTimePaymentRate >= 50 ? "text-amber-500" : "text-red-500"
                  )}
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${onTimePaymentRate * 2.51} 251`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{onTimePaymentRate}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* مؤشرات الولاء والتحليلات المتقدمة */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>مؤشرات الولاء والتحليلات المتقدمة</CardTitle>
          <CardDescription>تحليلات تساعد في فهم ولاء العميل وتوقع سلوكه المستقبلي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-700">{loyaltyScore}/100</span>
              <span className="text-sm mt-2">نقاط الولاء</span>
            </div>
            <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-green-700">{loyaltySegment}</span>
              <span className="text-sm mt-2">تصنيف الولاء</span>
            </div>
            <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-red-700">{churnRate}%</span>
              <span className="text-sm mt-2">احتمالية فقدان العميل</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-yellow-700">{formatAmountNoCurrency(clv)}</span>
              <span className="text-sm mt-2">قيمة دورة حياة العميل (CLV)</span>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-indigo-700">{repeatRate}%</span>
              <span className="text-sm mt-2">معدل تكرار الشراء</span>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-2xl font-bold text-purple-700">{engagement.rate}%</span>
              <span className="text-sm mt-2">معدل استبدال النقاط</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-base font-semibold mb-2">المنتجات المتوقعة المفضلة القادمة:</span>
            <ul className="flex flex-wrap gap-4 justify-center">
              {predictedProducts.map(pid => {
                const product = products.find(p => p.id === pid);
                return (
                  <li key={pid} className="px-3 py-1 bg-white rounded shadow text-sm">
                    {product ? product.name : pid}
                  </li>
                );
              })}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* تحليل RFM والمقارنات القطاعية */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>تحليل RFM والمقارنة القطاعية</CardTitle>
          <CardDescription>تحليل Recency, Frequency, Monetary ومقارنة أداء العميل بمتوسط القطاع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-base">Recency
                <span className="ml-1 cursor-pointer" title="عدد الأيام منذ آخر عملية شراء. كلما قل الرقم كان العميل أكثر نشاطًا.">🛈</span>
              </span>
              <span className="text-2xl font-bold text-blue-700">{rfm.recency > -1 ? rfm.recency : 'N/A'}</span>
              <span className="text-xs mt-1">أيام منذ آخر شراء</span>
            </div>
            <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-base">Frequency
                <span className="ml-1 cursor-pointer" title="عدد عمليات الشراء المدفوعة أو المكتملة. كلما زاد الرقم زادت ولاء العميل.">🛈</span>
              </span>
              <span className="text-2xl font-bold text-green-700">{rfm.frequency}</span>
              <span className="text-xs mt-1">عدد عمليات الشراء</span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-base">Monetary
                <span className="ml-1 cursor-pointer" title="إجمالي الإنفاق في الفواتير المدفوعة فقط.">🛈</span>
              </span>
              <span className="text-2xl font-bold text-yellow-700">{formatAmountNoCurrency(rfm.monetary)}</span>
              <span className="text-xs mt-1">إجمالي الإنفاق</span>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
              <span className="text-base">Loyalty (Weighted)
                <span className="ml-1 cursor-pointer" title="مؤشر مركب لولاء العميل بناءً على عدة عوامل.">🛈</span>
              </span>
              <span className="text-2xl font-bold text-purple-700">{weightedLoyaltyScore}/100</span>
              <span className="text-xs mt-1">نقاط الولاء (مخصصة)</span>
            </div>
          </div>
          <div className="mb-2 text-xs text-gray-500 text-center">عدد العملاء في القطاع: {sectorCount}</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
              <span className="text-sm">متوسط Recency بالقطاع</span>
              <span className="text-xl font-bold">{sectorComparison.avgRecency}</span>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
              <span className="text-sm">متوسط Frequency بالقطاع</span>
              <span className="text-xl font-bold">{sectorComparison.avgFrequency}</span>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
              <span className="text-sm">متوسط Monetary بالقطاع</span>
              <span className="text-xl font-bold">{formatAmountNoCurrency(sectorComparison.avgMonetary)}</span>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
              <span className="text-sm">متوسط الولاء بالقطاع</span>
              <span className="text-xl font-bold">{sectorComparison.avgLoyalty}</span>
            </div>
          </div>
          {sectorCount === 0 && (
            <div className="text-center text-red-500 text-xs mb-4">لا يوجد عملاء آخرون في نفس القطاع للمقارنة.</div>
          )}
        </CardContent>
      </Card>

      {/* اتجاه المشتريات الشهرية */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>اتجاه المشتريات الشهرية</CardTitle>
          <CardDescription>رسم بياني يوضح تطور مشتريات العميل عبر الزمن</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyPurchaseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [formatAmountNoCurrency(value as number), 'قيمة المشتريات']} />
              <Legend />
              <Line type="monotone" dataKey="amount" name="قيمة المشتريات" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* المنتجات والفئات الأكثر شراءً واتجاه الشراء */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>ملخص سلوك الشراء</CardTitle>
          <CardDescription>أكثر المنتجات والفئات شراءً، واتجاه الشراء</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-8">
            <div>
              <h4 className="text-base font-semibold mb-2">المنتجات الأكثر شراءً</h4>
              <ul className="list-disc pl-6">
                {mostPurchasedProducts.map(productName => (
                  <li key={productName}>{productName}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-2">الفئات الأكثر شراءً</h4>
              <ul className="list-disc pl-6">
                {mostPurchasedCategories.map(cat => (
                  <li key={cat}>{cat}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-2">اتجاه الشراء</h4>
              <span className="font-bold text-lg">
                {purchaseTrend === 'increasing' && 'زيادة'}
                {purchaseTrend === 'decreasing' && 'انخفاض'}
                {purchaseTrend === 'stable' && 'ثبات'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAnalytics;
