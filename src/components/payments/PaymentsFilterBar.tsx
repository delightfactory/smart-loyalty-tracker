import React from 'react';

interface PaymentsFilterBarProps {
  filter: string;
  setFilter: (value: string) => void;
}

const PaymentsFilterBar: React.FC<PaymentsFilterBarProps> = ({ filter, setFilter }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
      <input
        type="text"
        placeholder="Search by customer, invoice, method, or notes..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="border rounded px-3 py-2 w-full md:w-80 text-sm focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
};

export default PaymentsFilterBar;
