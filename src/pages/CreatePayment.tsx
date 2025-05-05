import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
import { ArrowLeft, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import PageContainer from '@/components/layout/PageContainer';
import { InvoiceStatus, Payment, PaymentMethod, PaymentType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePayments } from '@/hooks/usePayments';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import SmartSearch from '@/components/search/SmartSearch';

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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editPaymentId = searchParams.get('edit') || undefined;
  const isEditing = !!editPaymentId;
  const { toast } = useToast();
  
  // استخدام حالة المكان للاستلام من صفحة المسار
  const { state } = location;
  const preselectedInvoiceId = state?.invoiceId;
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(customerId);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  
  // React Query hooks
  const { getAll: getAllCustomers } = useCustomers();
  const { getByCustomerId: getCustomerInvoices, getById: getInvoiceById } = useInvoices();
  const { addPayment, updatePayment, getById: getPaymentById } = usePayments();
  
  // استرجاع بيانات العملاء والفواتير
  const { data: customers = [], isLoading: isLoadingCustomers } = getAllCustomers;
  const { data: customerInvoices = [], isLoading: isLoadingInvoices } = getCustomerInvoices(selectedCustomerId || '');
  const { data: invoiceData, isLoading: isLoadingInvoice } = getInvoiceById(selectedInvoice?.id || '');
  const { data: editingPayment, isLoading: isLoadingPayment } = getPaymentById(editPaymentId || '');
  
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
  
  // عند تحميل الصفحة، تحقق من وجود معرف عميل وفاتورة مسبقا
  useEffect(() => {
    console.log('Component mounted. customerId:', customerId, 'preselectedInvoiceId:', preselectedInvoiceId);
    
    if (customerId) {
      form.setValue('customerId', customerId);
      setSelectedCustomerId(customerId);
    }
    
    if (preselectedInvoiceId && selectedCustomerId) {
      form.setValue('invoiceId', preselectedInvoiceId);
      onInvoiceChange(preselectedInvoiceId);
    }
    
    if (isEditing && editingPayment) {
      form.reset({
        customerId: editingPayment.customerId,
        invoiceId: editingPayment.invoiceId || '',
        amount: editingPayment.amount,
        paymentDate: new Date(editingPayment.date).toISOString().slice(0,10),
        method: editingPayment.method || 'نقداً',
        notes: editingPayment.notes || '',
      });
      setSelectedCustomerId(editingPayment.customerId);
      if (editingPayment.invoiceId) onInvoiceChange(editingPayment.invoiceId);
    }
  }, [customerId, preselectedInvoiceId, editingPayment]);
  
  // عند تغيير العميل المختار، تحديث قائمة الفواتير غير المدفوعة
  useEffect(() => {
    if (selectedCustomerId && customerInvoices) {
      const filteredInvoices = customerInvoices.filter(
        invoice => invoice.status === InvoiceStatus.UNPAID || 
                  invoice.status === InvoiceStatus.PARTIALLY_PAID || 
                  invoice.status === InvoiceStatus.OVERDUE
      );
      
      setUnpaidInvoices(filteredInvoices);
      
      if (filteredInvoices.length > 0 && !form.getValues('invoiceId')) {
        // إذا كان هناك فاتورة محددة مسبقا من المسار، استخدمها
        if (preselectedInvoiceId) {
          onInvoiceChange(preselectedInvoiceId);
        } else {
          // وإلا استخدم أول فاتورة غير مدفوعة
          onInvoiceChange(filteredInvoices[0].id);
        }
      } else if (filteredInvoices.length === 0) {
        setSelectedInvoice(null);
        form.setValue('invoiceId', '');
        form.setValue('amount', 0);
      }
    }
  }, [selectedCustomerId, customerInvoices]);
  
  const onCustomerChange = (value: string) => {
    setSelectedCustomerId(value);
    form.setValue('customerId', value);
    form.setValue('invoiceId', '');
    setSelectedInvoice(null);
  };
  
  const onInvoiceChange = (value: string) => {
    form.setValue('invoiceId', value);
    
    // البحث عن الفاتورة المحددة من قائمة الفواتير
    const invoice = unpaidInvoices.find(inv => inv.id === value);
    setSelectedInvoice(invoice);
    
    if (invoice) {
      // حساب المبلغ المدفوع مسبقا
      const paidAmount = invoice.payments?.reduce((sum: number, payment: Payment) => {
        if (payment.type === PaymentType.PAYMENT) {
          return sum + payment.amount;
        } else if (payment.type === PaymentType.REFUND) {
          return sum - payment.amount;
        }
        return sum;
      }, 0) || 0;
      
      // تحديث مبلغ الدفعة بالمبلغ المتبقي
      const remainingAmount = invoice.totalAmount - paidAmount;
      form.setValue('amount', remainingAmount > 0 ? remainingAmount : 0);
    }
  };
  
  const onSubmit = (data: PaymentFormValues) => {
    const base = {
      customerId: data.customerId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      date: new Date(data.paymentDate),
      method: data.method,
      notes: data.notes || '',
      type: PaymentType.PAYMENT
    };
    
    if (isEditing && editPaymentId) {
      updatePayment.mutate({ id: editPaymentId, ...base }, {
        onSuccess: (p) => { toast({ title: 'تم تحديث الدفعة بنجاح', description: `تم تعديل الدفعة ${p.id}` }); navigate('/payments'); },
        onError: (error) => { toast({ title: 'خطأ', description: `حدث خطأ أثناء تعديل الدفعة: ${error.message}`, variant: 'destructive' }); }
      });
    } else {
      addPayment.mutate(base, {
        onSuccess: (p) => { toast({ title: 'تم إضافة الدفعة بنجاح', description: `تم تسجيل دفعة بقيمة ${data.amount.toLocaleString('ar-EG')} ج.م للفاتورة ${data.invoiceId}` }); navigate(customerId ? `/customer/${customerId}` : '/invoices'); },
        onError: (error) => { toast({ title: 'خطأ', description: `حدث خطأ أثناء تسجيل الدفعة: ${error.message}`, variant: 'destructive' }); }
      });
    }
  };
  
  // تحقق من حالة التحميل
  const isLoading = isLoadingCustomers || isLoadingInvoices || isLoadingInvoice || addPayment.isPending || (isEditing && updatePayment.isPending) || (isEditing && isLoadingPayment);
  
  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };
  
  // --- تحسينات العرض ---
  // 1. توحيد تنسيقات الأرقام والتواريخ للإنجليزية
  const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2 });
  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  
  return (
    <PageContainer title="إضافة دفعة جديدة" subtitle="تسجيل دفعات العملاء">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          رجوع
        </Button>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>جاري تحميل البيانات...</p>
        </div>
      )}
      
      {!isLoading && (
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
                          <SmartSearch
                            type="customer"
                            customers={customers} // تمرير بيانات العملاء الحقيقية
                            placeholder="ابحث عن اسم العميل أو رقم الهاتف أو رقم العميل..."
                            onSelectCustomer={customer => {
                              field.onChange(customer.id);
                              setSelectedCustomerId(customer.id);
                            }}
                            className="mb-2"
                            initialSearchTerm={form.getValues('customerId') ? customers.find(c => c.id === form.getValues('customerId'))?.name || '' : ''}
                          />
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
                                      {invoice.id} - {formatCurrency(invoice.totalAmount)}
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
                  disabled={!selectedInvoice || unpaidInvoices.length === 0 || addPayment.isPending || (isEditing && updatePayment.isPending)}
                >
                  {(isEditing && updatePayment.isPending) ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحديث...
                    </>
                  ) : (addPayment.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    <>
                      <CreditCard className="ml-2 h-4 w-4" />
                      {isEditing ? 'تحديث الدفعة' : 'تسجيل الدفعة'}
                    </>
                  ))}
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
                          <p className="text-lg font-bold">{formatCurrency(customer.creditBalance)}</p>
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
                                {formatDate(selectedInvoice.date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">الإجمالي</p>
                              <p className="text-lg font-bold">{formatCurrency(selectedInvoice.totalAmount)}</p>
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
                                        <span className={payment.type === PaymentType.PAYMENT ? "text-green-600" : "text-red-600"}>
                                          {payment.type === PaymentType.PAYMENT ? '+ ' : '- '}
                                          {formatCurrency(payment.amount)}
                                        </span>
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        {formatDate(payment.date)}
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
      )}
    </PageContainer>
  );
};

export default CreatePayment;
