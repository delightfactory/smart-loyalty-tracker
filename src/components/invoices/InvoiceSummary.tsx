import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { formatNumberEn } from '@/lib/utils';
import { ProductCategory, ProductCategoryLabels } from '@/lib/types';

export interface InvoiceSummaryProps {
  totalFiltered: number;
  totalAmountSum: number;
  statusStats: Record<string, { count: number; sum: number }>;
  categoryStats: { category: ProductCategory; percentage: number }[];
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  totalFiltered,
  totalAmountSum,
  statusStats,
  categoryStats
}) => {
  // Map statuses to colors (with dark-mode support)
  const statusColorMap: Record<string, string> = {
    'مدفوع': 'text-green-600 dark:text-green-400',
    'مدفوع جزئياً': 'text-yellow-500 dark:text-yellow-300',
    'غير مدفوع': 'text-orange-500 dark:text-orange-300',
    'متأخر': 'text-red-600 dark:text-red-400 animate-pulse',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">عدد الفواتير</CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">الفواتير المفلترة حسب المعايير</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-300">{formatNumberEn(totalFiltered)}</span>
          <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full">
            <ShoppingCart className="h-6 w-6 text-indigo-600 dark:text-indigo-200" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">إجمالي المبالغ</CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">مجموع مبالغ الفواتير</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">{formatNumberEn(totalAmountSum)}</span>
          <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
            <CreditCard className="h-6 w-6 text-green-600 dark:text-green-200" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">حالة الفواتير</CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">تفاصيل الحالات وعدد الفواتير</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(statusStats).map(([st, { count, sum }]) => (
            <div key={st} className="flex items-center justify-between">
              <span className={`text-sm font-medium ${statusColorMap[st] || 'text-gray-700 dark:text-gray-400'}`}>{st}</span>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">{formatNumberEn(count)}</span>
                <span className="text-sm text-gray-500 ml-1">({formatNumberEn(sum)})</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">توزيع الفئات</CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">النسبة المئوية لكل فئة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...categoryStats].sort((a, b) => b.percentage - a.percentage).map(({ category, percentage }) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{ProductCategoryLabels[category]}</span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">{percentage}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceSummary;
