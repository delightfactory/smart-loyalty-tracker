
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Customer, BusinessType } from '@/lib/types';

interface CustomerEditDialogProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

const CustomerEditDialog = ({ customer, isOpen, onClose, onSave }: CustomerEditDialogProps) => {
  const [editedCustomer, setEditedCustomer] = useState<Customer>({...customer});
  
  const handleChange = (field: keyof Customer, value: string | number) => {
    setEditedCustomer(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedCustomer);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تعديل بيانات العميل</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">اسم العميل</Label>
              <Input 
                id="name" 
                value={editedCustomer.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">اسم المسؤول</Label>
              <Input 
                id="contactPerson" 
                value={editedCustomer.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input 
                id="phone" 
                value={editedCustomer.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="businessType">نوع النشاط</Label>
              <Select 
                value={editedCustomer.businessType} 
                onValueChange={(value) => handleChange('businessType', value as BusinessType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر نوع النشاط" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BusinessType).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="creditBalance">رصيد الآجل (ج.م)</Label>
              <Input 
                id="creditBalance"
                type="number"
                value={editedCustomer.creditBalance.toString()}
                onChange={(e) => handleChange('creditBalance', Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit">حفظ التغييرات</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEditDialog;
