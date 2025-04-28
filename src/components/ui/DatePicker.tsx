import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

export default DatePicker;
