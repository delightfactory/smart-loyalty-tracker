import React from 'react';

interface PointsSummaryProps {
  totalEarned: number;
  totalRedeemed: number;
  totalRemaining: number;
  loading?: boolean;
}

const formatNumber = (num: number) => {
  // Always show numbers in English
  return num.toLocaleString('en-US');
};

const PointsSummary: React.FC<PointsSummaryProps> = ({ totalEarned, totalRedeemed, totalRemaining, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-gray-500 dark:text-gray-300 text-sm mb-2">إجمالي النقاط المكتسبة</span>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{loading ? '...' : formatNumber(totalEarned)}</span>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-gray-500 dark:text-gray-300 text-sm mb-2">إجمالي النقاط المستبدلة</span>
        <span className="text-2xl font-bold text-green-600 dark:text-green-400">{loading ? '...' : formatNumber(totalRedeemed)}</span>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
        <span className="text-gray-500 dark:text-gray-300 text-sm mb-2">إجمالي النقاط المتبقية</span>
        <span className="text-2xl font-bold text-red-600 dark:text-red-400">{loading ? '...' : formatNumber(totalRemaining)}</span>
      </div>
    </div>
  );
};

export default PointsSummary;
