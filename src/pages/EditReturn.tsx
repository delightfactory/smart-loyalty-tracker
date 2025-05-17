import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { useParams, useNavigate } from 'react-router-dom';
import { useReturns } from '@/hooks/useReturns';
import { useInvoice } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Return as ReturnType, ReturnItem, ReturnStatus } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

export default function EditReturn() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, updateReturn } = useReturns();
  const { data: ret, isLoading } = getById(id);

  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<ReturnStatus>(ReturnStatus.PENDING);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

  useEffect(() => {
    if (ret) {
      setCustomerId(ret.customerId);
      setInvoiceId(ret.invoiceId);
      setDate(new Date(ret.date).toISOString().slice(0,10));
      setReturnItems(ret.items);
      setStatus(ret.status);
    }
  }, [ret]);

  const { data: invoiceData, isLoading: invoiceLoading } = useInvoice(invoiceId);
  const { getAll: getProducts } = useProducts();
  const { data: products = [], isLoading: productsLoading } = getProducts;

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
    if (!customerId || !invoiceId) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال معرف العميل ومعرف الفاتورة', variant: 'destructive' });
      return;
    }
    const updated: ReturnType = {
      id: id as string,
      customerId,
      invoiceId,
      date: new Date(date),
      items: returnItems,
      totalAmount,
      status,
    };
    updateReturn.mutate(updated, {
      onSuccess: () => {
        toast({ title: 'تم تحديث المرتجع', variant: 'default' });
        navigate('/returns');
      },
      onError: (err: Error) => {
        toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
      }
    });
  };

  if (isLoading || invoiceLoading || productsLoading) return <PageContainer title="جاري التحميل..."><p>جاري التحميل...</p></PageContainer>;
  if (!ret) return <PageContainer title="404"><p>مرتجع غير موجود</p></PageContainer>;

  return (
    <PageContainer title={`تعديل المرتجع ${id}`}>
      <div className="flex flex-col gap-4">
        <Label>معرف العميل</Label>
        <Input placeholder="customerId" value={customerId} onChange={e => setCustomerId(e.target.value)} />
        <Label>معرف الفاتورة</Label>
        <Input placeholder="invoiceId" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} />
        <Label>تاريخ المرتجع</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Label>الحالة</Label>
        <Select value={status} onValueChange={(value: string) => setStatus(value as ReturnStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="حدد الحالة" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ReturnStatus).map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                const qty = retItem ? retItem.quantity : 0;
                return (
                  <TableRow key={item.productId}>
                    <TableCell>{item.productId}{productName ? ` - ${productName}` : ''}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={qty}
                        onChange={e => handleQuantityChange(item.productId, item.price, item.quantity, Number(e.target.value))}
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
          <Button onClick={handleSubmit} disabled={returnItems.length === 0}>حفظ التغييرات</Button>
        </div>
      </div>
    </PageContainer>
  );
}
