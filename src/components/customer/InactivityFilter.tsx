
import { useState } from 'react';
import { History, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface InactivityFilterProps {
  period: string;
  setPeriod: (period: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const InactivityFilter = ({ period, setPeriod, date, setDate }: InactivityFilterProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/50 p-4 rounded-lg">
      <div className="flex gap-2 items-center">
        <History className="text-muted-foreground h-5 w-5" />
        <h3 className="font-medium">تصفية حسب فترة عدم النشاط</h3>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر الفترة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 يوم</SelectItem>
            <SelectItem value="30">30 يوم</SelectItem>
            <SelectItem value="60">60 يوم</SelectItem>
            <SelectItem value="90">90 يوم</SelectItem>
            <SelectItem value="180">180 يوم</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-right"
            >
              <CalendarIcon className="ml-2 h-4 w-4" />
              {date ? (
                format(date, 'PPP', { locale: ar })
              ) : (
                <span>اختر تاريخًا محددًا</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ar}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default InactivityFilter;
