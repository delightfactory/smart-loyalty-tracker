import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import SmartSearch from '@/components/search/SmartSearch';
import { Customer } from '@/lib/types';
import { useCustomers } from '@/hooks/useCustomers';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomerSelectorProps {
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
  disabled?: boolean;
}

const CustomerSelector = ({ 
  selectedCustomerId, 
  onSelectCustomer, 
  disabled = false 
}: CustomerSelectorProps) => {
  const { getAll: getCustomers } = useCustomers();
  const { data: customers, isLoading, error } = getCustomers;
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>العميل</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error || !customers) {
    return (
      <div className="space-y-2">
        <Label>العميل</Label>
        <div className="text-red-500 text-sm">
          حدث خطأ أثناء تحميل العملاء، يرجى المحاولة مرة أخرى
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="customer">العميل</Label>
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
        <Select
          value={selectedCustomerId}
          onValueChange={onSelectCustomer}
          disabled={disabled}
        >
          <SelectTrigger id="customer" className="flex-1">
            <SelectValue placeholder="اختر العميل" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {!disabled && (
          <div className="flex-1 relative">
            <SmartSearch
              type="customer"
              placeholder="بحث بالاسم، الكود، الهاتف أو المسؤول..."
              onSelectCustomer={(customer) => onSelectCustomer(customer.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSelector;
