import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import PageContainer from '@/components/layout/PageContainer';
import { customers, invoices, getCustomerById, updateInvoice, addPayment } from '@/lib/data';
import { InvoiceStatus, Payment, PaymentMethod, PaymentType } from '@/lib/types';
import { cn } from '@/lib/utils';

const paymentSchema = z.object({
  customerId: z.string({ required_error: "يجب اختيار العميل" }),
  invoiceId: z.string({ required_error: "يجب اختيار الفاتورة" }),
  amount: z.coerce.number().positive({ message: "يجب إدخال مبلغ أكبر من صفر" }),
  paymentDate: z.string().min(1, { message: "يجب تحديد تاريخ الدفع" }),
  method: z.string().min(1, { message: "يجب تحديد طريقة الدفع" }),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const CreatePayment = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(customerId);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      customerId: customerId || '',
      invoiceId: '',
      amount: 0,
      paymentDate: new Date().toISOString().slice(0, 10),
      method: 'نقداً',
      notes: '',
    },
  });
  
  useEffect(() => {
    if (selectedCustomerId) {
      const customerUnpaidInvoices = invoices.filter(
        invoice => invoice.customerId === selectedCustomerId && 
        (invoice.status === InvoiceStatus.UNPAID || 
         invoice.status === InvoiceStatus.PARTIALLY_PAID || 
         invoice.status === InvoiceStatus.OVERDUE)
      );
      
      setUnpaidInvoices(customerUnpaidInvoices);
      
      if (customerUnpaidInvoices.length > 0 && !form.getValues('invoiceId')) {
        onInvoiceChange(customerUnpaidInvoices[0].id);
      } else if (customerUnpaidInvoices.length === 0) {
        setSelectedInvoice(null);
        form.setValue('invoiceId', '');
        form.setValue('amount', 0);
      }
    }
  }, [selectedCustomerId]);
  
  const onCustomerChange = (value: string) => {
    setSelectedCustomerId(value);
    form.setValue('customerId', value);
    form.setValue('invoiceId', '');
    setSelectedInvoice(null);
  };
  
  const onInvoiceChange = (value: string) => {
    form.setValue('invoiceId', value);
    const invoice = invoices.find(inv => inv.id === value);
    setSelectedInvoice(invoice);
    
    if (invoice) {
      const paidAmount = invoice.payments?.reduce((sum, payment) => {
        if (payment.type === 'payment') {
          return sum + payment.amount;
        } else if (payment.type === 'refund') {
          return sum - payment.amount;
        }
        return sum;
      }, 0) || 0;
      
      const remainingAmount = invoice.totalAmount - paidAmount;
      form.setValue('amount', remainingAmount > 0 ? remainingAmount : 0);
    }
  };
  
  const onSubmit = (data: PaymentFormValues) => {
    const invoice = invoices.find(inv => inv.id === data.invoiceId);
    
    if (!invoice) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الفاتورة غير موجودة",
      });
      return;
    }
    
    const paymentId = `PAY${Date.now().toString().slice(-6)}`;
    
    const payment: Payment = {
      id: paymentId,
      customerId: data.customerId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      date: new Date(data.paymentDate),
      method: data.method,
      notes: data.notes || '',
      type: PaymentType.PAYMENT
    };
    
    addPayment(payment);
    
    toast({
      title: "تم إضافة الدفعة بنجاح",
      description: `تم تسجيل دفعة بقيمة ${data.amount.toLocaleString('ar-EG')} ج.م للفاتورة ${data.invoiceId}`,
    });
    
    navigate(customerId ? `/customer/${customerId}` : '/invoices');
  };
  
  return (
    <PageContainer title="إضافة دفعة جديدة" subtitle="تسجيل دفعات العملاء">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          رجوع
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الدفعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العميل</FormLabel>
                        <Select
                          onValueChange={(value) => onCustomerChange(value)}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر العميل" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedCustomerId && (
                    <FormField
                      control={form.control}
                      name="invoiceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الفاتورة</FormLabel>
                          <Select
                            onValueChange={(value) => onInvoiceChange(value)}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الفاتورة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {unpaidInvoices.length > 0 ? (
                                unpaidInvoices.map((invoice) => (
                                  <SelectItem key={invoice.id} value={invoice.id}>
                                    {invoice.id} - {invoice.totalAmount.toLocaleString('ar-EG')} ج.م
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem disabled value="none">
                                  لا توجد فواتير غير مدفوعة
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {selectedInvoice && (
                    <>
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>مبلغ الدفعة</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="paymentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>تاريخ الدفع</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>طريقة الدفع</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر طريقة الدفع" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="نقداً">نقداً</SelectItem>
                                <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                                <SelectItem value="شيك">شيك</SelectItem>
                                <SelectItem value="بطاقة ائتمان">بطاقة ائتمان</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ملاحظات</FormLabel>
                            <FormControl>
                              <Textarea placeholder="أي ملاحظات إضافية..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
              
              {unpaidInvoices.length === 0 && selectedCustomerId && (
                <Alert variant="destructive" className="my-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>لا توجد فواتير غير مدفوعة</AlertTitle>
                  <AlertDescription>
                    هذا العميل ليس لديه أي فواتير مستحقة الدفع حالياً.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={!selectedInvoice || unpaidInvoices.length === 0}
              >
                <CreditCard className="ml-2 h-4 w-4" />
                تسجيل الدفعة
              </Button>
            </form>
          </Form>
        </div>
        
        {selectedCustomerId && (
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل العميل</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const customer = getCustomerById(selectedCustomerId);
                if (!customer) return <p>لا توجد بيانات</p>;
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">اسم العميل</p>
                        <p className="text-lg font-bold">{customer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">المسؤول</p>
                        <p className="text-lg font-bold">{customer.contactPerson}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">رقم الهاتف</p>
                        <p className="text-lg font-bold">{customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">نوع النشاط</p>
                        <p className="text-lg font-bold">{customer.businessType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">رصيد النقاط</p>
                        <p className="text-lg font-bold">{customer.currentPoints}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">رصيد الآجل</p>
                        <p className="text-lg font-bold">{customer.creditBalance.toLocaleString('ar-EG')} ج.م</p>
                      </div>
                    </div>
                    
                    {selectedInvoice && (
                      <div className="mt-6">
                        <p className="text-base font-medium text-muted-foreground mb-2">تفاصيل الفاتورة</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">رقم الفاتورة</p>
                            <p className="text-lg font-bold">{selectedInvoice.id}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">التاريخ</p>
                            <p className="text-lg font-bold">
                              {new Date(selectedInvoice.date).toLocaleDateString('ar-EG')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">الإجمالي</p>
                            <p className="text-lg font-bold">{selectedInvoice.totalAmount.toLocaleString('ar-EG')} ج.م</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">الحالة</p>
                            <p className={cn(
                              "text-lg font-bold",
                              selectedInvoice.status === InvoiceStatus.PAID ? "text-green-600" :
                              selectedInvoice.status === InvoiceStatus.UNPAID ? "text-amber-600" :
                              selectedInvoice.status === InvoiceStatus.OVERDUE ? "text-red-600" :
                              "text-blue-600"
                            )}>{selectedInvoice.status}</p>
                          </div>
                          
                          {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                            <div className="col-span-2">
                              <p className="text-sm font-medium text-muted-foreground">الدفعات السابقة</p>
                              <div className="mt-2 space-y-2">
                                {selectedInvoice.payments.map((payment: Payment) => (
                                  <div key={payment.id} className="flex justify-between p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center">
                                      <span className={payment.type === 'payment' ? "text-green-600" : "text-red-600"}>
                                        {payment.type === 'payment' ? '+ ' : '- '}
                                        {payment.amount.toLocaleString('ar-EG')} ج.م
                                      </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(payment.date).toLocaleDateString('ar-EG')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default CreatePayment;
