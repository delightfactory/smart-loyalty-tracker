
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PaymentsFilterBarProps {
  filter: string;
  setFilter: (value: string) => void;
}

const PaymentsFilterBar: React.FC<PaymentsFilterBarProps> = ({ filter, setFilter }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
      <div className="relative w-full md:w-auto flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="بحث عن عميل، فاتورة، طريقة دفع..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
    </div>
  );
};

export default PaymentsFilterBar;
