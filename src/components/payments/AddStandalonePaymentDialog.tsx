import React, { useState, useMemo } from 'react';
import { PaymentType } from '@/lib/types';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import { usePayments } from '@/hooks/usePayments';

function formatNumberEn(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface AddStandalonePaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddStandalonePaymentDialog: React.FC<AddStandalonePaymentDialogProps> = ({ open, onClose }) => {
  const { getAll } = useCustomers();
  const { data: customers = [] } = getAll;
  const { addPayment } = usePayments();
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('نقداً');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // حساب رصيد العميل المختار
  const customerBalance = useMemo(() => {
    if (!customerId) return null;
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return null;
    // الرصيد النهائي: openingBalance + creditBalance (أو حسب منطقك الموحد)
    // إذا كان لديك منطق موحد لحساب الرصيد استخدمه هنا
    // سنستخدم هنا openingBalance + creditBalance فقط كمثال
    const opening = Number(customer.openingBalance || 0);
    const credit = Number(customer.creditBalance || 0);
    return opening + credit;
  }, [customerId, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerId || !amount) {
      setError('يجب اختيار العميل وإدخال المبلغ');
      return;
    }
    setLoading(true);
    try {
      const result = await addPayment.mutateAsync({
        customerId,
        amount: parseFloat(amount),
        method,
        notes,
        type: PaymentType.PAYMENT, // استخدم النوع الصحيح من enum
        date: new Date(),
        // بدون ربط بفاتورة
      });
      setLoading(false);
      onClose();
      setCustomerId('');
      setAmount('');
      setMethod('نقداً');
      setNotes('');
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'حدث خطأ أثناء حفظ الدفعة');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة دفعة غير مرتبطة بفاتورة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">اختر العميل</label>
            <Select value={customerId} onValueChange={setCustomerId} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر العميل" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {customerId && customerBalance !== null && (
              <div className="mt-1 text-sm text-blue-700 font-bold bg-blue-50 rounded px-2 py-1">
                رصيد العميل الحالي: <span className="font-mono">{formatNumberEn(customerBalance)}</span> ج.م
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold">المبلغ</label>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              inputMode="decimal"
              pattern="[0-9.]*"
              className="ltr text-right"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">طريقة الدفع</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر الطريقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="نقداً">نقداً</SelectItem>
                <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                <SelectItem value="شيك">شيك</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">ملاحظات</label>
            <Input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="اختياري"
            />
          </div>
          {error && (
            <div className="text-red-600 bg-red-50 rounded px-2 py-1 text-sm mb-2 text-center">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'جارٍ الحفظ...' : 'حفظ الدفعة'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStandalonePaymentDialog;
