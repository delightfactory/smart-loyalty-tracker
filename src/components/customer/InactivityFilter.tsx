
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DatePicker from '@/components/ui/DatePicker';
import { RefreshCcw } from 'lucide-react';

interface InactivityFilterProps {
  period: string;
  setPeriod: (value: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const InactivityFilter: React.FC<InactivityFilterProps> = ({
  period,
  setPeriod,
  date,
  setDate,
}) => {
  const handleReset = () => {
    setPeriod("30");
    setDate(undefined);
  };
  
  return (
    <div className="bg-card p-4 rounded-md shadow-sm border">
      <h3 className="font-medium mb-3">فلترة العملاء غير النشطين</h3>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="space-y-2 flex-grow">
          <label className="text-sm text-muted-foreground">فترة الغياب</label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">آخر 7 أيام</SelectItem>
              <SelectItem value="15">آخر 15 يوم</SelectItem>
              <SelectItem value="30">آخر 30 يوم</SelectItem>
              <SelectItem value="60">آخر 60 يوم</SelectItem>
              <SelectItem value="90">آخر 90 يوم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-grow">
          <label className="text-sm text-muted-foreground">تاريخ الفلترة</label>
          <DatePicker value={date} onChange={setDate} placeholder="اختر التاريخ" />
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleReset} 
          className="flex-shrink-0 h-10 w-10"
          title="إعادة تعيين الفلاتر"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InactivityFilter;
