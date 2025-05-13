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
import { Switch } from '@/components/ui/switch';
import { Customer, BusinessType } from '@/lib/types';
import { egyptGovernorates } from '@/lib/egyptLocations';

interface CustomerEditDialogProps {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

const CustomerEditDialog = ({ customer, isOpen, onClose, onSave }: CustomerEditDialogProps) => {
  const [editedCustomer, setEditedCustomer] = useState<Customer>({...customer});
  
  const handleChange = (field: keyof Customer, value: string | number | boolean) => {
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
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
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
              <Label htmlFor="governorate">المحافظة</Label>
              <Select
                value={editedCustomer.governorate || ''}
                onValueChange={(value) => {
                  handleChange('governorate', value);
                  // Reset city if governorate changes
                  setEditedCustomer((prev) => ({ ...prev, city: '' }));
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {egyptGovernorates.map((gov) => (
                    <SelectItem key={gov.governorate} value={gov.governorate}>{gov.governorate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Select
                value={editedCustomer.city || ''}
                onValueChange={(value) => handleChange('city', value)}
                disabled={!editedCustomer.governorate}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {(egyptGovernorates.find(gov => gov.governorate === editedCustomer.governorate)?.cities || []).map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="credit_period">مدة الائتمان (بالأيام)</Label>
              <Input 
                id="credit_period"
                type="number"
                min={0}
                value={editedCustomer.credit_period ?? ''}
                onChange={(e) => handleChange('credit_period', Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="credit_limit">قيمة الائتمان (EGP)</Label>
              <Input 
                id="credit_limit"
                type="number"
                min={0}
                step={0.01}
                value={editedCustomer.credit_limit ?? ''}
                onChange={(e) => handleChange('credit_limit', Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="earnPointsEnabled"
                checked={editedCustomer.earnPointsEnabled}
                onCheckedChange={(checked) => handleChange('earnPointsEnabled', checked as boolean)}
              />
              <Label htmlFor="earnPointsEnabled">استحقاق النقاط</Label>
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
