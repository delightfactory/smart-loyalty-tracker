import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  CreditCard, 
  ShoppingCart, 
  Star, 
  CheckCircle, 
  XCircle,
  Pencil,
  Trash,
  Receipt
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoice } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceStatus, Invoice, PaymentMethod } from '@/lib/types';
import { cn } from '@/lib/utils';
import ErrorBoundary from '@/components/ErrorBoundary';

const InvoiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // استخدم hook useInvoice بدلاً من useInvoices().getById
  const invoiceQuery = useInvoice(id || '');
  const invoice = invoiceQuery.data;
  const isLoading = invoiceQuery.isLoading;
  const isError = invoiceQuery.isError;

  const { getAll } = useProducts();
  const { data: products = [] } = getAll;

  const getProductById = (productId: string) => products.find(p => p.id === productId);

  if (isLoading) {
    return (
      <PageContainer title="تحميل..." subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">جاري تحميل بيانات الفاتورة...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (isError || !invoice || !id) {
    console.error('InvoiceDetails Error:', { isError, invoice, id, invoiceQuery });
    return (
      <PageContainer title="خطأ" subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive">تعذر تحميل بيانات الفاتورة. تأكد من صحة الرابط أو حاول مرة أخرى.</p>
            <Button className="mt-4" onClick={() => navigate('/invoices')}>العودة للفواتير</Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const { getById: getCustomerById } = useCustomers();
  const customerQuery = getCustomerById(invoice.customerId);
  const customer = customerQuery?.data;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'EGP' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-CA'); // YYYY-MM-DD
  };

  const getStatusClass = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return "bg-green-100 text-green-800";
      case InvoiceStatus.UNPAID:
        return "bg-amber-100 text-amber-800";
      case InvoiceStatus.PARTIALLY_PAID:
        return "bg-blue-100 text-blue-800";
      case InvoiceStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const { deleteInvoice } = useInvoices();
  const handleDeleteInvoice = async () => {
    if (!invoice) return;
    try {
      await deleteInvoice.mutateAsync({ id: invoice.id, customerId: invoice.customerId });
      toast({
        title: 'تم حذف الفاتورة بنجاح',
        description: `تم حذف الفاتورة رقم ${invoice.id} بنجاح`,
        variant: 'default',
      });
      navigate('/invoices');
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: `حدث خطأ أثناء حذف الفاتورة: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleEditInvoice = () => {
    if (!invoice) return;
    navigate(`/create-invoice/${invoice.customerId}/edit/${invoice.id}`);
  };

  const handleAddPayment = () => {
    navigate(`/create-payment?invoiceId=${invoice.id}&customerId=${invoice.customerId}`);
  };

  return (
    <PageContainer title={`فاتورة رقم ${invoice.id}`} subtitle="تفاصيل الفاتورة">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة للفواتير
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>تفاصيل الفاتورة</CardTitle>
              <CardDescription>معلومات أساسية</CardDescription>
            </div>
            <div className="flex gap-2">
              {invoice.status !== InvoiceStatus.PAID && (
                <Button
                  variant="outline"
                  className="text-blue-600"
                  onClick={handleAddPayment}
                >
                  <Receipt className="h-4 w-4 ml-2" />
                  تسجيل دفعة
                </Button>
              )}

              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleEditInvoice}
              >
                <Pencil className="h-4 w-4" />
                تعديل الفاتورة
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash className="h-4 w-4" />
                    حذف الفاتورة
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد حذف الفاتورة</AlertDialogTitle>
                    <AlertDialogDescription>
                      هل أنت متأكد أنك تريد حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteInvoice} autoFocus>حذف</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الفاتورة</p>
                    <p className="font-medium">{invoice.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الإصدار</p>
                    <p className="font-medium">{formatDate(invoice.date)}</p>
                  </div>
                </div>

                {invoice.dueDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ الاستحقاق</p>
                      <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">العميل</p>
                    <p className="font-medium">{customer?.name || "غير معروف"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                    <p className="font-medium">{invoice.paymentMethod}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">حالة الفاتورة</p>
                    <Badge className={getStatusClass(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="text-lg font-semibold mb-4">المنتجات</h3>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الوحدة</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.length > 0 ? (
                      invoice.items.map((item, index) => {
                        const product = getProductById(item.productId);
                        return (
                          <TableRow key={index}>
                            <TableCell>{product?.name || 'غير معروف'}</TableCell>
                            <TableCell>{product?.unit || ''}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          لم يتم إضافة أي منتجات بعد
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملخص الفاتورة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد المنتجات:</span>
                <span>{invoice.items.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد الأقسام:</span>
                <span>{invoice.categoriesCount}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">النقاط المكتسبة:</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 ml-1" />
                  <span className="font-medium">{invoice.pointsEarned}</span>
                </div>
              </div>

              {invoice.pointsRedeemed > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">النقاط المستبدلة:</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-green-500 ml-1" />
                    <span className="font-medium">{invoice.pointsRedeemed}</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">الإجمالي:</span>
                  <span className="text-xl font-bold">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-3 rounded-lg text-sm flex items-center",
              invoice.status === InvoiceStatus.PAID 
                ? "bg-green-100 text-green-800" 
                : "bg-amber-100 text-amber-800"
            )}>
              {invoice.status === InvoiceStatus.PAID ? (
                <>
                  <CheckCircle className="h-4 w-4 ml-2" />
                  <span>تم سداد الفاتورة بالكامل</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 ml-2" />
                  <span>لم يتم سداد الفاتورة بالكامل</span>
                </>
              )}
            </div>
          </CardContent>
          {invoice.status !== InvoiceStatus.PAID && (
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleAddPayment}
              >
                <CreditCard className="h-4 w-4 ml-2" />
                تسجيل دفعة
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

    </PageContainer>
  );
};

export default function InvoiceDetailsWithBoundary() {
  return (
    <ErrorBoundary>
      <InvoiceDetails />
    </ErrorBoundary>
  );
}
