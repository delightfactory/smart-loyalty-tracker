import { 
  Label
} from '@/components/ui/label';
import { Search } from 'lucide-react';
import { Customer } from '@/lib/types';
import { useCustomers } from '@/hooks/useCustomers';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';

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
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { getPaginated } = useCustomers();
  const { data: paginatedResponse = { items: [], total: 0 }, isLoading: loading, error: fetchError } =
    getPaginated({ pageIndex: 0, pageSize: 10, searchTerm });
  const suggestions = paginatedResponse.items;
  // ترتيب الاقتراحات عند البحث بالأرقام: أولاً الكود ثم الهاتف
  const isNumericSearch = /^\d+$/.test(searchTerm);
  const orderedSuggestions = isNumericSearch
    ? [
        ...suggestions.filter(c => c.id.includes(searchTerm)),
        ...suggestions.filter(c => c.phone.includes(searchTerm) && !c.id.includes(searchTerm))
      ]
    : suggestions;
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (fetchError) {
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
      {disabled ? (
        <Input id="customer" value={searchTerm} disabled />
      ) : (
        <div className="relative">
          <Input
            id="customer-search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            placeholder="بحث بالاسم، الكود، الهاتف أو المسؤول..."
            className="w-full pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          {loading && <Skeleton className="h-10 w-full mt-1" />}
          {!loading && orderedSuggestions.length > 0 && showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {orderedSuggestions.map(customer => (
                <div
                  key={customer.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => {
                    onSelectCustomer(customer.id);
                    setSearchTerm(customer.name);
                    setShowDropdown(false);
                  }}
                >
                  {customer.name} ({customer.id})
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
