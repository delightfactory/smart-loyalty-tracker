
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/DatePicker';

interface PaymentsFilterBarProps {
  onSearch: (term: string) => void;
  onDateRangeChange: (from: string, to: string) => void;
}

const PaymentsFilterBar: React.FC<PaymentsFilterBarProps> = ({ onSearch, onDateRangeChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 mb-4">
      <div className="relative w-full md:w-2/3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث عن مدفوعات..."
          className="pl-10"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="w-full md:w-1/3">
        <DatePickerWithRange 
          onChange={(range) => {
            const from = range?.from ? range.from.toISOString().split('T')[0] : '';
            const to = range?.to ? range.to.toISOString().split('T')[0] : '';
            onDateRangeChange(from, to);
          }}
        />
      </div>
    </div>
  );
};

export default PaymentsFilterBar;
