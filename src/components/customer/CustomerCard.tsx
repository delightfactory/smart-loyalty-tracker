
import { FC } from 'react';
import { Customer, BusinessType } from '@/lib/types';
import { Eye, Pencil, Trash, Phone, User, MapPin, Star, Building2 } from 'lucide-react';
import { cn, formatNumberEn } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  onView: (id: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  getLevelBadgeClass: (level: number) => string;
  getClassificationDisplay: (classification: number) => string;
}

// Calculate the total balance for a customer
const calculateTotalBalance = (customer: Customer): number => {
  // Always include opening balance
  const openingBalance = customer.openingBalance ?? 0;
  // Include credit balance from invoices and payments
  const creditBalance = customer.creditBalance ?? 0;
  
  return openingBalance + creditBalance;
};

const CustomerCard: FC<CustomerCardProps> = ({ customer, onView, onEdit, onDelete, getLevelBadgeClass, getClassificationDisplay }) => {
  // Calculate the current balance
  const currentBalance = calculateTotalBalance(customer);
  
  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-gradient-to-br from-white via-blue-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 shadow-xl p-6 flex flex-col gap-4 transition hover:shadow-2xl cursor-pointer group',
        customer.level >= 4 ? 'ring-2 ring-blue-300 dark:ring-blue-700' : '',
        'dark:bg-zinc-900 dark:border-zinc-700'
      )}
      onClick={() => onView(customer.id)}
    >
      {/* شريط المستوى والتصنيف */}
      <div className="flex items-center justify-between mb-2 relative">
        <span className={cn('text-xs px-3 py-1 rounded-full border font-bold shadow-sm', getLevelBadgeClass(customer.level), 'dark:shadow-none', 'bg-white dark:bg-zinc-800')}
          title={`المستوى ${formatNumberEn(customer.level)}`}
        >
          المستوى {formatNumberEn(customer.level)}
        </span>
        <span className="flex items-center gap-1 text-amber-500 text-lg dark:text-amber-400 bg-yellow-50 dark:bg-zinc-800 px-2 py-1 rounded-full shadow-sm" title="تصنيف العميل">
          <Star className="w-4 h-4" />
          {getClassificationDisplay(customer.classification)}
        </span>
      </div>
      {/* اسم العميل وكود العميل */}
      <div className="flex items-center gap-2 mt-2">
        <User className="w-5 h-5 text-primary/80 dark:text-zinc-200" />
        <span className="font-bold text-xl dark:text-zinc-100 truncate" title={customer.name}>{customer.name}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200 font-semibold">
        <span>كود: <span className="font-bold">{customer.id}</span></span>
        <span className="mx-2 text-blue-300 dark:text-blue-600">|</span>
        <span>المسؤول: <span className="font-bold">{customer.contactPerson}</span></span>
      </div>
      {/* بيانات النشاط */}
      <div className="flex flex-wrap gap-2 items-center mt-1">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-bold shadow-sm">
          <Building2 className="w-4 h-4" />
          <span className={customer.businessType === BusinessType.SERVICE_CENTER ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}>●</span>
          <span className="dark:text-zinc-100">{customer.businessType}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900 text-xs font-bold shadow-sm">
          <Phone className="w-4 h-4" />
          <span dir="ltr" className="tracking-wider font-mono dark:text-zinc-100">{customer.phone}</span>
        </span>
      </div>
      {/* النقاط والرصد وبيانات الائتمان */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex flex-col items-start bg-yellow-50 dark:bg-yellow-900 rounded-lg p-2 shadow-sm w-full">
            <span className="text-xs text-yellow-800 dark:text-yellow-200 font-semibold">الرصيد الحالي</span>
            <span className="text-yellow-700 font-bold text-lg dark:text-yellow-300">{formatNumberEn(currentBalance)} ج.م</span>
            {customer.openingBalance > 0 && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                منه رصيد افتتاحي: {formatNumberEn(customer.openingBalance)} ج.م
              </span>
            )}
          </div>
          <div className="flex flex-col items-start bg-green-50 dark:bg-green-900 rounded-lg p-2 shadow-sm w-full">
            <span className="text-xs text-green-800 dark:text-green-200 font-semibold">النقاط الحالية</span>
            <span className="text-green-700 font-bold text-lg dark:text-green-300">{formatNumberEn(customer.currentPoints)}</span>
          </div>
        </div>
      {/* الموقع */}
      <div className="flex items-center gap-2 mt-2 text-xs text-blue-900 dark:text-blue-200 font-semibold">
        <MapPin className="w-4 h-4" />
        <span>{customer.governorate || '-'}</span>
        <span className="mx-1 text-blue-300 dark:text-blue-600">/</span>
        <span>{customer.city || '-'}</span>
      </div>
      {/* أزرار الإجراءات - أسفل الكارت */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          className="p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-blue-100 dark:hover:bg-blue-900 shadow transition border border-blue-200 dark:border-blue-700"
          title="تفاصيل"
          onClick={e => { e.stopPropagation(); onView(customer.id); }}
        >
          <Eye className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        </button>
        <button
          className="p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-yellow-100 dark:hover:bg-yellow-900 shadow transition border border-yellow-200 dark:border-yellow-700"
          title="تعديل"
          onClick={e => { e.stopPropagation(); onEdit(customer); }}
        >
          <Pencil className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
        </button>
        <button
          className="p-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-red-100 dark:hover:bg-red-900 shadow transition border border-red-200 dark:border-red-700"
          title="حذف"
          onClick={e => { e.stopPropagation(); onDelete(customer.id); }}
        >
          <Trash className="w-5 h-5 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default CustomerCard;
