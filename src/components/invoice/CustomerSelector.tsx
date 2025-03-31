
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

interface CustomerSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CustomerSelector = ({ value, onChange, disabled = false }: CustomerSelectorProps) => {
  const { getAll: getCustomers } = useCustomers();
  const { data: customers, isLoading, error } = getCustomers;

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
      <div className="flex gap-2">
        <Select
          value={value}
          onValueChange={onChange}
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
          <div className="w-44">
            <SmartSearch 
              type="customer"
              placeholder="بحث سريع..."
              onSelectCustomer={(customer) => onChange(customer.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSelector;
