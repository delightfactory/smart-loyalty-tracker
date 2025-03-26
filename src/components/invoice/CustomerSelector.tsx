
import { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import SmartSearch from '@/components/search/SmartSearch';
import { Customer } from '@/lib/types';
import { customers } from '@/lib/data';

interface CustomerSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CustomerSelector = ({ value, onChange, disabled = false }: CustomerSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="customer">العميل</Label>
      <div className="flex gap-2">
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger id="customer" className="flex-1">
            <SelectValue placeholder="اختر العميل" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {!disabled && (
          <div className="w-44">
            <SmartSearch 
              type="customer"
              placeholder="بحث سريع..."
              onSelectCustomer={(customer) => onChange(customer.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSelector;
