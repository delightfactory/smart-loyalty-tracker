import { FC } from 'react';
import { Customer, BusinessType } from '@/lib/types';
import { Eye, Pencil, Trash, Phone, User, MapPin, Star, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  onView: (id: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  getLevelBadgeClass: (level: number) => string;
  getClassificationDisplay: (classification: number) => string;
  formatNumber: (num: number | string) => string;
}

const CustomerCard: FC<CustomerCardProps> = ({ customer, onView, onEdit, onDelete, getLevelBadgeClass, getClassificationDisplay, formatNumber }) => {
  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 shadow-lg p-5 flex flex-col gap-3 transition hover:shadow-xl cursor-pointer group',
        customer.level >= 4 ? 'ring-2 ring-blue-200 dark:ring-blue-900' : '',
        'dark:bg-zinc-900 dark:border-zinc-700'
      )}
      onClick={() => onView(customer.id)}
    >
      {/* شريط المستوى والتصنيف */}
      <div className="flex items-center justify-between mb-2 relative">
        <span className={cn('text-xs px-3 py-1 rounded-full border font-bold shadow-sm', getLevelBadgeClass(customer.level), 'dark:shadow-none')}
          title={`المستوى ${formatNumber(customer.level)}`}
        >
          المستوى {formatNumber(customer.level)}
        </span>
        <span className="flex items-center gap-1 text-amber-500 text-lg dark:text-amber-400" title="تصنيف العميل">
          <Star className="w-4 h-4" />
          {getClassificationDisplay(customer.classification)}
        </span>
      </div>
      {/* اسم العميل وكود العميل */}
      <div className="flex items-center gap-2 mt-2">
        <User className="w-5 h-5 text-primary/80 dark:text-zinc-200" />
        <span className="font-bold text-xl dark:text-zinc-100 truncate" title={customer.name}>{customer.name}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-zinc-400">
        <span>كود: {customer.id}</span>
        <span className="mx-2">|</span>
        <span>المسؤول: {customer.contactPerson}</span>
      </div>
      {/* بيانات النشاط */}
      <div className="flex flex-wrap gap-2 items-center mt-1">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-zinc-800 text-xs font-medium">
          <Building2 className="w-4 h-4" />
          <span className={customer.businessType === BusinessType.SERVICE_CENTER ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}>●</span>
          <span className="dark:text-zinc-100">{customer.businessType}</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 dark:bg-zinc-800 text-xs font-medium">
          <Phone className="w-4 h-4" />
          <span dir="ltr" className="tracking-wider font-mono dark:text-zinc-100">{customer.phone}</span>
        </span>
      </div>
      {/* النقاط والرصد */}
      <div className="flex flex-wrap gap-4 mt-2">
        <div className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground dark:text-zinc-400">النقاط الحالية</span>
          <span className="text-emerald-700 font-bold text-lg dark:text-emerald-300">{formatNumber(customer.currentPoints)}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground dark:text-zinc-400">رصيد الآجل</span>
          <span className="text-orange-700 font-bold text-lg dark:text-orange-300">{formatNumber(customer.creditBalance)} ج.م</span>
        </div>
      </div>
      {/* الموقع */}
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground dark:text-zinc-400">
        <MapPin className="w-4 h-4" />
        <span>{customer.governorate || '-'}</span>
        <span className="mx-1">/</span>
        <span>{customer.city || '-'}</span>
      </div>
      {/* أزرار الإجراءات - أسفل الكارت */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          className="p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-blue-100 dark:hover:bg-blue-900 shadow transition"
          title="تفاصيل"
          onClick={e => { e.stopPropagation(); onView(customer.id); }}
        >
          <Eye className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        </button>
        <button
          className="p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-yellow-100 dark:hover:bg-yellow-900 shadow transition"
          title="تعديل"
          onClick={e => { e.stopPropagation(); onEdit(customer); }}
        >
          <Pencil className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
        </button>
        <button
          className="p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-red-100 dark:hover:bg-red-900 shadow transition"
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
