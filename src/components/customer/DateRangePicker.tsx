import React from 'react';
import DatePicker from '../ui/DatePicker';

interface DateRangePickerProps {
  from: Date | null;
  to: Date | null;
  onFromChange: (date: Date | null) => void;
  onToChange: (date: Date | null) => void;
}

const DateRangePicker = ({ from, to, onFromChange, onToChange }: DateRangePickerProps) => {
  return (
    <div className="flex gap-2 items-center">
      <DatePicker value={from} onChange={onFromChange} placeholder="من التاريخ" className="w-36" />
      <span className="px-1">-</span>
      <DatePicker value={to} onChange={onToChange} placeholder="إلى التاريخ" className="w-36" />
    </div>
  );
};

export default DateRangePicker;
