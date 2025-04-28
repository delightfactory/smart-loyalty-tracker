import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DateRangePicker from './DateRangePicker';

interface PurchasesFilterBarProps {
  onSearch: (term: string) => void;
  onDateRangeChange: (from: string, to: string) => void;
}

const PurchasesFilterBar = ({ onSearch, onDateRangeChange }: PurchasesFilterBarProps) => {
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-4 items-end">
      <Input
        placeholder="بحث برقم الفاتورة أو المنتج..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        onBlur={() => onSearch(search)}
        className="md:w-64"
      />
      <DateRangePicker
        from={from}
        to={to}
        onFromChange={(date) => {
          setFrom(date);
          onDateRangeChange(date ? date.toISOString().slice(0, 10) : '', to ? to.toISOString().slice(0, 10) : '');
        }}
        onToChange={(date) => {
          setTo(date);
          onDateRangeChange(from ? from.toISOString().slice(0, 10) : '', date ? date.toISOString().slice(0, 10) : '');
        }}
      />
      <Button variant="outline" onClick={() => { setSearch(''); setFrom(null); setTo(null); onSearch(''); onDateRangeChange('', ''); }}>
        إعادة تعيين
      </Button>
    </div>
  );
};

export default PurchasesFilterBar;
