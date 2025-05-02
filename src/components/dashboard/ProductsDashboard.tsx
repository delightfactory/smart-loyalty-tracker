import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { productsService, invoicesService } from '@/services/database';
import { Product, Invoice, ProductCategory, ProductCategoryLabels } from '@/lib/types';
import { formatNumberEn, formatAmountEn } from '@/lib/formatters';
import { ChevronUp, ChevronDown } from 'lucide-react';
import RevenueChart from './RevenueChart';
import InvoiceStatusChart from './InvoiceStatusChart';
import NewCustomersChart from './NewCustomersChart';

interface ProductsDashboardProps {
  products?: Product[];
  invoices?: Invoice[];
  timeRange?: string;
  customRange?: { from?: Date; to?: Date };
}

export default function ProductsDashboard({ products = [], invoices = [], timeRange = 'all', customRange }: ProductsDashboardProps) {
  const [tab, setTab] = useState('overview');
  // فلترة الفواتير حسب الفترة الزمنية
  let filteredInvoices = invoices;
  if (timeRange && timeRange !== 'all' && invoices.length) {
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (customRange?.from && customRange?.to) {
          startDate = new Date(customRange.from);
          const endDate = new Date(customRange.to);
          filteredInvoices = invoices.filter(inv => {
            const d = new Date(inv.date);
            return d >= startDate && d <= endDate;
          });
        }
        break;
      default:
        break;
    }
    if (timeRange !== 'custom') {
      filteredInvoices = invoices.filter(inv => {
        const d = new Date(inv.date);
        return d >= startDate && d <= now;
      });
    }
  }

  // جمع بيانات المبيعات للمنتجات بناءً على الفواتير المفلترة
  const productSales = products.map((product: Product) => {
    let totalSold = 0, totalRevenue = 0, lastSoldDate: Date|null = null;
    filteredInvoices.forEach((inv: Invoice) => {
      inv.items.forEach((item: any) => {
        if (item.productId === product.id) {
          totalSold += item.quantity;
          totalRevenue += item.totalPrice;
          const invDate = new Date(inv.date);
          if (!lastSoldDate || invDate > lastSoldDate) lastSoldDate = invDate;
        }
      });
    });
    return {
      ...product,
      totalSold,
      totalRevenue,
      lastSoldDate,
    };
  });

  // المنتجات الأعلى مبيعًا
  const topProducts = [...productSales].sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);
  // المنتجات الأعلى إيرادًا
  const topRevenueProducts = [...productSales].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

  // أداة موحدة لتحويل أي قيمة category إلى enum الصحيح إن أمكن
  function normalizeCategory(category: string): ProductCategory | undefined {
    // إذا كانت القيمة بالفعل من enum
    if (Object.values(ProductCategory).includes(category as ProductCategory)) {
      return category as ProductCategory;
    }
    // إذا كانت القيمة عربية، أرجع المفتاح المناسب
    const found = Object.entries(ProductCategoryLabels).find(([_enum, label]) => label === category);
    if (found) return found[0] as ProductCategory;
    return undefined;
  }

  // توزيع المنتجات حسب الفئة (مع التطبيع)
  const categoryStats = Object.values(ProductCategory).map(category => {
    const categoryProducts = productSales.filter(p => normalizeCategory(p.category) === category);
    return {
      category,
      count: categoryProducts.length,
      totalSold: categoryProducts.reduce((sum, p) => sum + p.totalSold, 0),
      totalRevenue: categoryProducts.reduce((sum, p) => sum + p.totalRevenue, 0),
    };
  });

  // تحسين ألوان الجداول في جميع التبويبات
  // تعريف متغيرات CSS utility للألوان
  const rowBase = 'transition-colors duration-150';
  const evenRow = 'bg-gray-50 dark:bg-gray-900';
  const oddRow = 'bg-white dark:bg-gray-800';
  const hoverRow = 'hover:bg-primary/10 dark:hover:bg-primary/20';
  const borderRow = 'border-b border-gray-200 dark:border-gray-700';
  const thHead = 'bg-gradient-to-r from-primary to-blue-500 dark:from-gray-800 dark:to-primary text-white dark:text-gray-100 text-base font-bold';

  // تحديث أنماط الأعمدة والرؤوس لضبط المحاذاة بدقة
  const thNum = thHead + ' text-center';
  const thText = thHead + ' text-right';
  const tdNum = 'p-2 text-center align-middle';
  const tdText = 'p-2 text-right align-middle';

  // حالة الفرز العامة
  const [sortConfig, setSortConfig] = useState<{ tab: string; key: string; direction: 'asc' | 'desc' } | null>(null);

  // دالة فرز عامة
  function sortData<T>(data: T[], key: keyof T, direction: 'asc' | 'desc') {
    return [...data].sort((a, b) => {
      if (a[key] === undefined || b[key] === undefined) return 0;
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return direction === 'asc' ? (a[key] as number) - (b[key] as number) : (b[key] as number) - (a[key] as number);
      }
      return direction === 'asc'
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });
  }

  // بيانات الجداول بعد الفرز
  const sortedTopProducts = sortConfig && sortConfig.tab === 'top'
    ? sortData(topProducts, sortConfig.key as keyof typeof topProducts[0], sortConfig.direction)
    : topProducts;
  const sortedTopRevenueProducts = sortConfig && sortConfig.tab === 'revenue'
    ? sortData(topRevenueProducts, sortConfig.key as keyof typeof topRevenueProducts[0], sortConfig.direction)
    : topRevenueProducts;
  const sortedCategoryStats = sortConfig && sortConfig.tab === 'categories'
    ? sortData(categoryStats, sortConfig.key as keyof typeof categoryStats[0], sortConfig.direction)
    : categoryStats;
  const sortedProductSales = sortConfig && sortConfig.tab === 'all'
    ? sortData(productSales, sortConfig.key as keyof typeof productSales[0], sortConfig.direction)
    : productSales;

  // تحويل بيانات المنتجات لتناسب RevenueChart
  const topProductsChartData = sortedTopProducts.map(p => ({
    name: p.name,
    revenue: p.totalRevenue,
    invoiceCount: p.totalSold
  }));
  const topRevenueProductsChartData = sortedTopRevenueProducts.map(p => ({
    name: p.name,
    revenue: p.totalRevenue,
    invoiceCount: p.totalSold
  }));
  const categoryStatsChartData = sortedCategoryStats.map(cat => ({
    name: ProductCategoryLabels[cat.category],
    revenue: cat.totalRevenue,
    invoiceCount: cat.totalSold
  }));

  // مكون رأس عمود قابل للفرز
  function SortableTh({ label, tab, sortKey, className }: { label: string; tab: string; sortKey: string; className?: string }) {
    const active = sortConfig && sortConfig.tab === tab && sortConfig.key === sortKey;
    const direction = active ? sortConfig!.direction : undefined;
    return (
      <th className={className ? className : "p-2 cursor-pointer select-none"} onClick={() => {
        setSortConfig(cfg => {
          if (cfg && cfg.tab === tab && cfg.key === sortKey) {
            // عكس الاتجاه
            return { tab, key: sortKey, direction: cfg.direction === 'asc' ? 'desc' : 'asc' };
          }
          return { tab, key: sortKey, direction: 'asc' };
        });
      }}>
        <span className="flex items-center gap-1 justify-center">
          {label}
          {active && (direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </span>
      </th>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>لوحة تحكم المنتجات</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="top">الأعلى مبيعًا</TabsTrigger>
            <TabsTrigger value="revenue">الأعلى إيرادًا</TabsTrigger>
            <TabsTrigger value="categories">إحصائيات الفئات</TabsTrigger>
            <TabsTrigger value="all">كل المنتجات</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>عدد المنتجات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatNumberEn(products.length)}</div>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>إجمالي الكمية المباعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatNumberEn(productSales.reduce((sum, p) => sum + p.totalSold, 0))}</div>
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>إجمالي الإيرادات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatAmountEn(productSales.reduce((sum, p) => sum + p.totalRevenue, 0))}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* الأعلى مبيعًا */}
          <TabsContent value="top">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={borderRow}>
                    <SortableTh label="#" tab="top" sortKey="id" className={thNum} />
                    <SortableTh label="اسم المنتج" tab="top" sortKey="name" className={thText} />
                    <SortableTh label="الفئة" tab="top" sortKey="category" className={thText} />
                    <SortableTh label="الكمية المباعة" tab="top" sortKey="totalSold" className={thNum} />
                    <SortableTh label="الإيرادات" tab="top" sortKey="totalRevenue" className={thNum} />
                    <SortableTh label="آخر عملية بيع" tab="top" sortKey="lastSoldDate" className={thNum} />
                  </tr>
                </thead>
                <tbody>
                  {sortedTopProducts.map((p, idx) => (
                    <tr key={p.id} className={`${rowBase} ${idx % 2 === 0 ? evenRow : oddRow} ${hoverRow} ${borderRow} text-gray-900 dark:text-gray-100`}>
                      <td className={tdNum + ' font-bold text-blue-700 dark:text-blue-400'}>{formatNumberEn(idx + 1)}</td>
                      <td className={tdText + ' font-semibold'}>{p.name}</td>
                      <td className={tdText}>{ProductCategoryLabels[normalizeCategory(p.category) as ProductCategory] || p.category}</td>
                      <td className={tdNum + ' text-green-700 dark:text-green-400 font-bold'}>{formatNumberEn(p.totalSold)}</td>
                      <td className={tdNum + ' text-purple-700 dark:text-purple-400 font-bold'}>{formatAmountEn(p.totalRevenue)}</td>
                      <td className={tdNum} dir="ltr">{p.lastSoldDate ? formatNumberEn(p.lastSoldDate.getDate()).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getMonth() + 1).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getFullYear()) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardContent className="pt-4">
                  <RevenueChart
                    data={topProductsChartData}
                    formatCurrency={formatAmountEn}
                    title="المنتجات الأعلى مبيعًا (رسم بياني)"
                    description="مقارنة الكميات المباعة والإيرادات للمنتجات الأعلى"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* الأعلى إيرادًا */}
          <TabsContent value="revenue">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={borderRow}>
                    <SortableTh label="#" tab="revenue" sortKey="id" className={thNum} />
                    <SortableTh label="اسم المنتج" tab="revenue" sortKey="name" className={thText} />
                    <SortableTh label="الفئة" tab="revenue" sortKey="category" className={thText} />
                    <SortableTh label="الإيرادات" tab="revenue" sortKey="totalRevenue" className={thNum} />
                    <SortableTh label="الكمية المباعة" tab="revenue" sortKey="totalSold" className={thNum} />
                    <SortableTh label="آخر عملية بيع" tab="revenue" sortKey="lastSoldDate" className={thNum} />
                  </tr>
                </thead>
                <tbody>
                  {sortedTopRevenueProducts.map((p, idx) => (
                    <tr key={p.id} className={`${rowBase} ${idx % 2 === 0 ? evenRow : oddRow} ${hoverRow} ${borderRow} text-gray-900 dark:text-gray-100`}>
                      <td className={tdNum + ' font-bold text-purple-700 dark:text-purple-400'}>{formatNumberEn(idx + 1)}</td>
                      <td className={tdText + ' font-semibold'}>{p.name}</td>
                      <td className={tdText}>{ProductCategoryLabels[normalizeCategory(p.category) as ProductCategory] || p.category}</td>
                      <td className={tdNum + ' text-purple-700 dark:text-purple-400 font-bold'}>{formatAmountEn(p.totalRevenue)}</td>
                      <td className={tdNum + ' text-green-700 dark:text-green-400 font-bold'}>{formatNumberEn(p.totalSold)}</td>
                      <td className={tdNum} dir="ltr">{p.lastSoldDate ? formatNumberEn(p.lastSoldDate.getDate()).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getMonth() + 1).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getFullYear()) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardContent className="pt-4">
                  <RevenueChart
                    data={topRevenueProductsChartData}
                    formatCurrency={formatAmountEn}
                    title="المنتجات الأعلى إيرادًا (رسم بياني)"
                    description="مقارنة الإيرادات والكميات للمنتجات الأعلى إيرادًا"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* إحصائيات الفئات */}
          <TabsContent value="categories">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={borderRow}>
                    <SortableTh label="الفئة" tab="categories" sortKey="category" className={thText} />
                    <SortableTh label="عدد المنتجات" tab="categories" sortKey="count" className={thNum} />
                    <SortableTh label="إجمالي المبيعات" tab="categories" sortKey="totalSold" className={thNum} />
                    <SortableTh label="إجمالي الإيرادات" tab="categories" sortKey="totalRevenue" className={thNum} />
                  </tr>
                </thead>
                <tbody>
                  {sortedCategoryStats.map((cat, idx) => (
                    <tr key={cat.category} className={`${rowBase} ${idx % 2 === 0 ? evenRow : oddRow} ${hoverRow} ${borderRow} text-gray-900 dark:text-gray-100`}>
                      <td className={tdText + ' font-semibold'}>{ProductCategoryLabels[cat.category]}</td>
                      <td className={tdNum}>{formatNumberEn(cat.count)}</td>
                      <td className={tdNum + ' text-blue-700 dark:text-blue-400 font-bold'}>{formatNumberEn(cat.totalSold)}</td>
                      <td className={tdNum + ' text-purple-700 dark:text-purple-400 font-bold'}>{formatAmountEn(cat.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardContent className="pt-4">
                  <RevenueChart
                    data={categoryStatsChartData}
                    formatCurrency={formatAmountEn}
                    title="إحصائيات الفئات (رسم بياني)"
                    description="مقارنة المبيعات والإيرادات حسب الفئة"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <InvoiceStatusChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* كل المنتجات */}
          <TabsContent value="all">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={borderRow}>
                    <SortableTh label="#" tab="all" sortKey="id" className={thNum} />
                    <SortableTh label="اسم المنتج" tab="all" sortKey="name" className={thText} />
                    <SortableTh label="الفئة" tab="all" sortKey="category" className={thText} />
                    <SortableTh label="السعر" tab="all" sortKey="price" className={thNum} />
                    <SortableTh label="الكمية المباعة" tab="all" sortKey="totalSold" className={thNum} />
                    <SortableTh label="الإيرادات" tab="all" sortKey="totalRevenue" className={thNum} />
                    <SortableTh label="آخر عملية بيع" tab="all" sortKey="lastSoldDate" className={thNum} />
                  </tr>
                </thead>
                <tbody>
                  {sortedProductSales.map((p, idx) => (
                    <tr key={p.id} className={`${rowBase} ${idx % 2 === 0 ? evenRow : oddRow} ${hoverRow} ${borderRow} text-gray-900 dark:text-gray-100`}>
                      <td className={tdNum + ' font-bold text-gray-700 dark:text-gray-300'}>{formatNumberEn(idx + 1)}</td>
                      <td className={tdText + ' font-semibold'}>{p.name}</td>
                      <td className={tdText}>{ProductCategoryLabels[normalizeCategory(p.category) as ProductCategory] || p.category}</td>
                      <td className={tdNum}>{formatAmountEn(p.price)}</td>
                      <td className={tdNum + ' text-green-700 dark:text-green-400 font-bold'}>{formatNumberEn(p.totalSold)}</td>
                      <td className={tdNum + ' text-purple-700 dark:text-purple-400 font-bold'}>{formatAmountEn(p.totalRevenue)}</td>
                      <td className={tdNum} dir="ltr">{p.lastSoldDate ? formatNumberEn(p.lastSoldDate.getDate()).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getMonth() + 1).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getFullYear()) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardContent className="pt-4">
                  <NewCustomersChart customers={products} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
