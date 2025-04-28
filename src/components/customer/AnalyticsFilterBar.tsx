import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DateRangePicker from './DateRangePicker';

interface AnalyticsFilterBarProps {
  onDateRangeChange: (from: string, to: string) => void;
}

const AnalyticsFilterBar = ({ onDateRangeChange }: AnalyticsFilterBarProps) => {
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-4 items-end">
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
      <Button variant="outline" onClick={() => { setFrom(null); setTo(null); onDateRangeChange('', ''); }}>
        إعادة تعيين
      </Button>
    </div>
  );
};

export default AnalyticsFilterBar;
