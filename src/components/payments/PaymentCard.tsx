import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface PaymentCardProps {
  payment: any;
  customerName: string;
  invoiceNumber: string;
  onEdit: () => void;
  onDelete: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ payment, customerName, invoiceNumber, onEdit, onDelete }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-5 flex flex-col gap-3 border border-gray-200 dark:border-gray-800 transition-all hover:scale-[1.015] hover:shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 font-mono drop-shadow-sm">
          {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="rounded-full p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-full p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900 rounded px-2 py-0.5">Customer</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">{customerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-green-100 dark:bg-green-900 rounded px-2 py-0.5">Invoice</span>
          <span className="font-mono text-gray-700 dark:text-gray-200">{invoiceNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900 rounded px-2 py-0.5">Date</span>
          <span className="text-xs text-gray-600 dark:text-gray-300">{payment.date ? format(new Date(payment.date), 'yyyy-MM-dd HH:mm') : '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-purple-100 dark:bg-purple-900 rounded px-2 py-0.5">Method</span>
          <span className="text-xs text-gray-700 dark:text-gray-200">{payment.method || '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-pink-100 dark:bg-pink-900 rounded px-2 py-0.5">Type</span>
          <span className="text-xs text-gray-700 dark:text-gray-200">{payment.type || '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded px-2 py-0.5">Notes</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">{payment.notes || '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
