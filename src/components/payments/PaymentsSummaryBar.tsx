import React from 'react';

interface PaymentsSummaryBarProps {
  total: number;
  count: number;
}

const PaymentsSummaryBar: React.FC<PaymentsSummaryBarProps> = ({ total, count }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
      <div className="text-base font-semibold text-gray-700 dark:text-gray-200">
        Total Payments: <span className="font-mono text-blue-700 dark:text-blue-300">{count}</span>
      </div>
      <div className="text-base font-semibold text-gray-700 dark:text-gray-200">
        Total Amount: <span className="font-mono text-green-700 dark:text-green-300">{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
};

export default PaymentsSummaryBar;
