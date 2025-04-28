import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DateRangePicker from './DateRangePicker';

interface PaymentsFilterBarProps {
  onSearch: (term: string) => void;
  onDateRangeChange: (from: string, to: string) => void;
}

const PaymentsFilterBar = ({ onSearch, onDateRangeChange }: PaymentsFilterBarProps) => {
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-4 items-end">
      <Input
        placeholder="بحث برقم العملية أو الملاحظات..."
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

export default PaymentsFilterBar;
