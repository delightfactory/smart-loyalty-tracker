
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from './button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

const DatePicker = ({ value, onChange, placeholder, className = '' }: DatePickerProps) => {
  return (
    <ReactDatePicker
      selected={value}
      onChange={onChange}
      placeholderText={placeholder}
      dateFormat="MM/dd/yyyy"
      className={`border border-input rounded-md px-3 py-2 text-base md:text-sm ${className}`}
      isClearable
      showPopperArrow={false}
    />
  );
};

// Add DatePickerWithRange component to be exported
interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DatePickerWithRangeProps {
  onChange: (range: DateRange | undefined) => void;
  className?: string;
  initialDateRange?: DateRange;
}

export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({ 
  onChange, 
  className,
  initialDateRange
}) => {
  const [date, setDate] = React.useState<DateRange | undefined>(initialDateRange || {
    from: null,
    to: null,
  });

  const [isOpen, setIsOpen] = React.useState(false);

  // Update parent component when dates change
  React.useEffect(() => {
    onChange(date);
  }, [date, onChange]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>حدد نطاق تاريخ...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 max-h-[calc(100vh-10rem)] overflow-y-auto" align="start">
          <ReactDatePicker
            selected={date?.from}
            onChange={(dates: [Date | null, Date | null]) => {
              const [start, end] = dates;
              setDate({ from: start, to: end });
              if (start && end) {
                setIsOpen(false);
              }
            }}
            startDate={date?.from}
            endDate={date?.to}
            selectsRange
            inline
            monthsShown={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
