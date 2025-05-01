
import React from 'react';
import { Card } from '@/components/ui/card';

interface PaymentsSummaryBarProps {
  total: number;
  count: number;
}

const PaymentsSummaryBar: React.FC<PaymentsSummaryBarProps> = ({ total, count }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
      <Card className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">عدد المدفوعات</p>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{count}</p>
        </div>
      </Card>
      <Card className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
        <div className="text-center">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">إجمالي المبالغ</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">{total.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</p>
        </div>
      </Card>
    </div>
  );
};

export default PaymentsSummaryBar;
