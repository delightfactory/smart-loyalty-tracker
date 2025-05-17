import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useReturns } from '@/hooks/useReturns';
import { useCustomerInvoices, useInvoice } from '@/hooks/useInvoices';
import CustomerSelector from '@/components/invoice/CustomerSelector';
import { format } from 'date-fns';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReturnItem, ReturnStatus } from '@/lib/types';
import { useProducts } from '@/hooks/useProducts';

export default function CreateReturn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addReturn, getByInvoiceId } = useReturns();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => ((location.state as { customerId?: string } | undefined)?.customerId) || '');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));

  const {
    data: customerInvoices = [],
    isLoading: invoicesLoading
  } = useCustomerInvoices(selectedCustomerId);

  const {
    data: invoiceData,
    isLoading: invoiceLoading
  } = useInvoice(selectedInvoiceId);

  const { getAll: productsQuery } = useProducts();
  const { data: products = [] } = productsQuery;

  const { data: existingReturns = [], isLoading: loadingExistingReturns } = getByInvoiceId(selectedInvoiceId);
  const returnedQtyMap = useMemo(() => {
    const map: Record<string, number> = {};
    existingReturns.forEach(r => r.items.forEach(i => {
      map[i.productId] = (map[i.productId] || 0) + i.quantity;
    }));
    return map;
  }, [existingReturns]);

  useEffect(() => {
    setReturnItems([]);
  }, [selectedInvoiceId]);

  const handleQuantityChange = (productId: string, unitPrice: number, maxQty: number, qty: number) => {
    if (qty < 0 || qty > maxQty) return;
    setReturnItems(prev => {
      const others = prev.filter(i => i.productId !== productId);
      if (qty === 0) return others;
      return [...others, { productId, quantity: qty, unitPrice, totalPrice: unitPrice * qty }];
    });
  };

  const totalAmount = returnItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = () => {
    if (!selectedCustomerId || !selectedInvoiceId) {
      toast({ title: 'خطأ', description: 'يرجى اختيار عميل وفاتورة', variant: 'destructive' });
      return;
    }
    if (returnItems.length === 0) {
      toast({ title: 'خطأ', description: 'يرجى تحديد صنف واحد على الأقل للمرتجع', variant: 'destructive' });
      return;
    }
    const ret = {
      customerId: selectedCustomerId,
      invoiceId: selectedInvoiceId,
      date: new Date(date),
      items: returnItems,
      totalAmount,
      status: ReturnStatus.PENDING
    };
    addReturn.mutate({ ret, items: returnItems }, {
      onSuccess: () => {
        toast({ title: 'تم إنشاء المرتجع', variant: 'default' });
        navigate('/returns');
      }
    });
  };

  return (
    <PageContainer title="إنشاء مرتجع جديد">
      <div className="space-y-6">
        <div>
          <Label>بحث عن عميل</Label>
          <CustomerSelector selectedCustomerId={selectedCustomerId} onSelectCustomer={setSelectedCustomerId} />
        </div>

        {invoicesLoading && selectedCustomerId && <p>جاري جلب الفواتير...</p>}
        {selectedCustomerId && !invoicesLoading && (
          <div>
            <Label>اختر فاتورة</Label>
            {customerInvoices.filter(inv => inv.pointsEarned === 0).length > 0 ? (
              <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="حدد الفاتورة" />
                </SelectTrigger>
                <SelectContent>
                  {customerInvoices.filter(inv => inv.pointsEarned === 0).map(inv => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.id} - {format(new Date(inv.date), 'yyyy-MM-dd')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p>لا توجد فواتير مؤهلة لإنشاء مرتجع.</p>
            )}
          </div>
        )}

        {invoiceLoading && selectedInvoiceId && <p>جاري جلب تفاصيل الفاتورة...</p>}
        {invoiceData && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الكمية المشتراة</TableHead>
                <TableHead>كمية الارجاع</TableHead>
                <TableHead>سعر الوحدة</TableHead>
                <TableHead>الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceData.items.map(item => {
                const retItem = returnItems.find(i => i.productId === item.productId);
                const prod = products.find(p => p.id === item.productId);
                const productName = prod?.name || '';
                const prevQty = returnedQtyMap[item.productId] || 0;
                const availableQty = item.quantity - prevQty;
                const qty = retItem ? retItem.quantity : 0;
                return (
                  <TableRow key={item.productId}>
                    <TableCell>{item.productId}{productName ? ` - ${productName}` : ''}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={availableQty}
                        value={qty}
                        disabled={availableQty <= 0}
                        onChange={e => handleQuantityChange(item.productId, item.price, availableQty, Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>{item.price.toFixed(2)}</TableCell>
                    <TableCell>{(item.price * qty).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <div className="flex justify-between items-center mt-4">
          <p><strong>الإجمالي:</strong> {totalAmount.toFixed(2)}</p>
          <Button onClick={handleSubmit} disabled={returnItems.length === 0}>إنشاء المرتجع</Button>
        </div>
      </div>
    </PageContainer>
  );
}
