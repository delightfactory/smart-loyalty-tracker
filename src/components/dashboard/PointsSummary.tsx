import React from 'react';

interface PointsSummaryProps {
  totalEarned: number;
  totalRedeemed: number;
  totalManualAdded: number;
  totalManualDeducted: number;
  totalRemaining: number;
  loading?: boolean;
}

import { formatNumberEn } from '@/lib/utils';
// Always show numbers in English using shared util, including manual adjustments
// All displayed values include manual point adjustments (additions/deductions) for accuracy.

const PointsSummary: React.FC<PointsSummaryProps> = ({ totalEarned, totalRedeemed, totalManualAdded, totalManualDeducted, totalRemaining, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-gray-500 dark:text-gray-300 text-sm mb-2">إجمالي النقاط المكتسبة</span>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{loading ? '...' : formatNumberEn(totalEarned)}</span>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-gray-500 dark:text-gray-300 text-sm mb-2">إجمالي النقاط المستبدلة</span>
        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{loading ? '...' : formatNumberEn(totalRedeemed)}</span>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-gray-500 dark:text-gray-300 text-sm mb-2">النقاط المضافة يدويًا</span>
        <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{loading ? '...' : formatNumberEn(totalManualAdded)}</span>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-gray-500 dark:text-gray-300 text-sm mb-2">النقاط المخصومة يدويًا</span>
        <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">{loading ? '...' : formatNumberEn(totalManualDeducted)}</span>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-gray-500 dark:text-gray-300 text-sm mb-2">إجمالي النقاط المتبقية</span>
        <span className="text-2xl font-bold text-red-600 dark:text-red-400">{loading ? '...' : formatNumberEn(totalRemaining)}</span>
      </div>
    </div>
  );
};

export default PointsSummary;
