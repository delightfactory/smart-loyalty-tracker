import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { productsService, invoicesService } from '@/services/database';
import { Product, Invoice, ProductCategory } from '@/lib/types';
import { formatNumberEn, formatAmountEn } from '@/lib/formatters';

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
  // توزيع المنتجات حسب الفئة
  const categoryStats = Object.values(ProductCategory).map(category => {
    const categoryProducts = productSales.filter(p => p.category === category);
    return {
      category,
      count: categoryProducts.length,
      totalSold: categoryProducts.reduce((sum, p) => sum + p.totalSold, 0),
      totalRevenue: categoryProducts.reduce((sum, p) => sum + p.totalRevenue, 0),
    };
  });

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
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">#</th>
                    <th className="p-2">اسم المنتج</th>
                    <th className="p-2">الفئة</th>
                    <th className="p-2">الكمية المباعة</th>
                    <th className="p-2">الإيرادات</th>
                    <th className="p-2">آخر عملية بيع</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, idx) => (
                    <tr key={p.id} className={idx % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'}>
                      <td className="p-2 font-bold text-blue-700">{formatNumberEn(idx + 1)}</td>
                      <td className="p-2 font-semibold">{p.name}</td>
                      <td className="p-2">{p.category}</td>
                      <td className="p-2 text-green-700 font-bold">{formatNumberEn(p.totalSold)}</td>
                      <td className="p-2 text-purple-700 font-bold">{formatAmountEn(p.totalRevenue)}</td>
                      <td className="p-2" dir="ltr">{p.lastSoldDate ? formatNumberEn(p.lastSoldDate.getDate()).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getMonth() + 1).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getFullYear()) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* الأعلى إيرادًا */}
          <TabsContent value="revenue">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">#</th>
                    <th className="p-2">اسم المنتج</th>
                    <th className="p-2">الفئة</th>
                    <th className="p-2">الإيرادات</th>
                    <th className="p-2">الكمية المباعة</th>
                    <th className="p-2">آخر عملية بيع</th>
                  </tr>
                </thead>
                <tbody>
                  {topRevenueProducts.map((p, idx) => (
                    <tr key={p.id} className={idx % 2 === 0 ? 'bg-purple-50/50' : 'bg-white'}>
                      <td className="p-2 font-bold text-purple-700">{formatNumberEn(idx + 1)}</td>
                      <td className="p-2 font-semibold">{p.name}</td>
                      <td className="p-2">{p.category}</td>
                      <td className="p-2 text-purple-700 font-bold">{formatAmountEn(p.totalRevenue)}</td>
                      <td className="p-2 text-green-700 font-bold">{formatNumberEn(p.totalSold)}</td>
                      <td className="p-2" dir="ltr">{p.lastSoldDate ? formatNumberEn(p.lastSoldDate.getDate()).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getMonth() + 1).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getFullYear()) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* إحصائيات الفئات */}
          <TabsContent value="categories">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">الفئة</th>
                    <th className="p-2">عدد المنتجات</th>
                    <th className="p-2">إجمالي المبيعات</th>
                    <th className="p-2">إجمالي الإيرادات</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.map((cat, idx) => (
                    <tr key={cat.category} className={idx % 2 === 0 ? 'bg-green-50/50' : 'bg-white'}>
                      <td className="p-2 font-semibold">{cat.category}</td>
                      <td className="p-2">{formatNumberEn(cat.count)}</td>
                      <td className="p-2 text-blue-700 font-bold">{formatNumberEn(cat.totalSold)}</td>
                      <td className="p-2 text-purple-700 font-bold">{formatAmountEn(cat.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* كل المنتجات */}
          <TabsContent value="all">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">#</th>
                    <th className="p-2">اسم المنتج</th>
                    <th className="p-2">الفئة</th>
                    <th className="p-2">السعر</th>
                    <th className="p-2">الكمية المباعة</th>
                    <th className="p-2">الإيرادات</th>
                    <th className="p-2">آخر عملية بيع</th>
                  </tr>
                </thead>
                <tbody>
                  {productSales.map((p, idx) => (
                    <tr key={p.id} className={idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                      <td className="p-2 font-bold text-gray-700">{formatNumberEn(idx + 1)}</td>
                      <td className="p-2 font-semibold">{p.name}</td>
                      <td className="p-2">{p.category}</td>
                      <td className="p-2">{formatAmountEn(p.price)}</td>
                      <td className="p-2 text-green-700 font-bold">{formatNumberEn(p.totalSold)}</td>
                      <td className="p-2 text-purple-700 font-bold">{formatAmountEn(p.totalRevenue)}</td>
                      <td className="p-2" dir="ltr">{p.lastSoldDate ? formatNumberEn(p.lastSoldDate.getDate()).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getMonth() + 1).padStart(2, '0') + '/' + formatNumberEn(p.lastSoldDate.getFullYear()) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
