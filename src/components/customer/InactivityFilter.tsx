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
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">تصفية حسب فترة عدم النشاط:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
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
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 border border-gray-200"
              onClick={handleReset}
              aria-label="إعادة تعيين الفلتر الزمني"
            >
              إعادة تعيين
            </Button>
            
            {period === "custom" ? (
              <div className="flex items-center gap-2">
                <DateRangePicker
                  from={fromDateValue}
                  to={toDateValue}
                  onFromChange={handleFromDateChange}
                  onToChange={handleToDateChange}
                />
              </div>
            ) : (
              period !== "all" && period !== "custom" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>العملاء غير النشطين منذ {period} يوم أو أكثر</span>
                </div>
              )
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-sm bg-blue-50 p-2 rounded-md">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <span>
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
