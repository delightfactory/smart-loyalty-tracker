import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Eye, Pencil, Trash2 } from 'lucide-react';
import { Redemption, RedemptionStatus } from '@/lib/types';

interface RedemptionCardProps {
  redemption: Redemption;
  customerName?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const RedemptionCard: React.FC<RedemptionCardProps> = ({ redemption, customerName, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-5 flex flex-col gap-3 border border-gray-200 dark:border-gray-800 transition-all hover:scale-[1.015] hover:shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 items-center">
          <span className="text-lg font-bold text-amber-700 dark:text-amber-300 font-mono">{redemption.totalPointsRedeemed} points</span>
          <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            {redemption.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="rounded-full p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="rounded-full p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-green-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
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
          <span className="font-semibold text-gray-800 dark:text-gray-100">{customerName || redemption.customerId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900 rounded px-2 py-0.5">Date</span>
          <span className="text-xs text-gray-600 dark:text-gray-300">{redemption.date ? new Date(redemption.date).toLocaleDateString('en-GB') : '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default RedemptionCard;
