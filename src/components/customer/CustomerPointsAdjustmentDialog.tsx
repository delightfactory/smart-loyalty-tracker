
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import { Customer } from '@/lib/types';

interface CustomerPointsAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

const CustomerPointsAdjustmentDialog: React.FC<CustomerPointsAdjustmentDialogProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  const [points, setPoints] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'manual_add' | 'manual_deduct'>('manual_add');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const { addManualPoints } = usePointsHistory();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (points <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addManualPoints.mutateAsync({
        customerId: customer.id,
        points,
        type: adjustmentType,
        notes
      });
      
      // Reset form and close dialog
      setPoints(0);
      setAdjustmentType('manual_add');
      setNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل نقاط العميل</DialogTitle>
          <DialogDescription>
            إضافة أو خصم نقاط من حساب العميل {customer.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <RadioGroup 
              value={adjustmentType} 
              onValueChange={(value) => setAdjustmentType(value as 'manual_add' | 'manual_deduct')}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="manual_add" id="add" />
                <Label htmlFor="add">إضافة نقاط</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="manual_deduct" id="deduct" />
                <Label htmlFor="deduct">خصم نقاط</Label>
              </div>
            </RadioGroup>
            
            <div className="space-y-2">
              <Label htmlFor="points">عدد النقاط</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className="text-left"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="سبب إضافة/خصم النقاط"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button type="submit" disabled={points <= 0 || isSubmitting}>
              {isSubmitting ? '...جاري التنفيذ' : adjustmentType === 'manual_add' ? 'إضافة النقاط' : 'خصم النقاط'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerPointsAdjustmentDialog;
