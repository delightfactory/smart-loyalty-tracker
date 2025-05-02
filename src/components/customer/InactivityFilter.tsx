import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/DatePicker';
import DateRangePicker from './DateRangePicker';
import { AlertCircle, Filter, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface InactivityFilterProps {
  period: string;
  setPeriod: (period: string) => void;
  date?: Date;
  setDate: (date?: Date) => void;
  fromDate?: Date;
  toDate?: Date;
  onDateRangeChange: (from: Date | null, to: Date | null) => void;
}

const InactivityFilter = ({
  period,
  setPeriod,
  date,
  setDate,
  fromDate,
  toDate,
  onDateRangeChange
}: InactivityFilterProps) => {
  const [fromDateValue, setFromDateValue] = useState<Date | null>(fromDate || null);
  const [toDateValue, setToDateValue] = useState<Date | null>(toDate || null);
  
  // تحديث القيم المحلية عند تغيير القيم الخارجية
  useEffect(() => {
    setFromDateValue(fromDate || null);
    setToDateValue(toDate || null);
  }, [fromDate, toDate]);
  
  // التعامل مع تغيير نطاق التاريخ
  const handleFromDateChange = (date: Date | null) => {
    setFromDateValue(date);
    onDateRangeChange(date, toDateValue);
  };
  
  const handleToDateChange = (date: Date | null) => {
    setToDateValue(date);
    onDateRangeChange(fromDateValue, date);
  };

  // عند إعادة تعيين الفلتر الزمني، امسح أيضًا القيم المحلية لنطاق التاريخ
  const handleReset = () => {
    setPeriod('30');
    setDate(subDays(new Date(), 30));
    setFromDateValue(null);
    setToDateValue(null);
    onDateRangeChange(null, null);
  };
  
  // تنسيق الفترة للعرض
  const getDisplayPeriod = () => {
    if (period === "custom" && (fromDate || toDate)) {
      const fromText = fromDate ? format(fromDate, 'd MMM yyyy', { locale: ar }) : '...';
      const toText = toDate ? format(toDate, 'd MMM yyyy', { locale: ar }) : '...';
      return `${fromText} - ${toText}`;
    }
    
    switch (period) {
      case "7": return "آخر أسبوع";
      case "15": return "آخر 15 يوم";
      case "30": return "آخر شهر";
      case "60": return "آخر شهرين";
      case "90": return "آخر 3 أشهر";
      case "180": return "آخر 6 أشهر";
      case "365": return "آخر سنة";
      case "all": return "كل الفترات";
      case "custom": return "فترة مخصصة";
      default: return `آخر ${period} يوم`;
    }
  };
  
  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors mb-4">
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-sm text-gray-700 dark:text-gray-200">الفترة الزمنية</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white">
                <SelectValue placeholder="اختر الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                <SelectItem value="7">آخر أسبوع</SelectItem>
                <SelectItem value="15">آخر 15 يوم</SelectItem>
                <SelectItem value="30">آخر شهر</SelectItem>
                <SelectItem value="60">آخر شهرين</SelectItem>
                <SelectItem value="90">آخر 3 أشهر</SelectItem>
                <SelectItem value="180">آخر 6 أشهر</SelectItem>
                <SelectItem value="365">آخر سنة</SelectItem>
                <SelectItem value="all">كل الفترات</SelectItem>
                <SelectItem value="custom">فترة مخصصة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {period === "custom" ? (
            <>
              <div className="flex flex-col gap-2 w-full md:w-1/4">
                <label className="text-sm text-gray-700 dark:text-gray-200">من تاريخ</label>
                <DatePicker value={fromDateValue} onChange={handleFromDateChange} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="flex flex-col gap-2 w-full md:w-1/4">
                <label className="text-sm text-gray-700 dark:text-gray-200">إلى تاريخ</label>
                <DatePicker value={toDateValue} onChange={handleToDateChange} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 w-full md:w-1/2 justify-end">
              <Button variant="outline" onClick={handleReset} className="mt-6 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700">إعادة تعيين</Button>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900 p-2 rounded-md">
          <AlertCircle className="h-4 w-4 text-blue-500 dark:text-blue-200" />
          <span className="text-gray-700 dark:text-gray-200">
            {period === "all" ? (
              "عرض جميع العملاء"
            ) : period === "custom" ? (
              `عرض العملاء غير النشطين في الفترة: ${getDisplayPeriod()}`
            ) : (
              `عرض العملاء غير النشطين منذ ${getDisplayPeriod()}`
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default InactivityFilter;
