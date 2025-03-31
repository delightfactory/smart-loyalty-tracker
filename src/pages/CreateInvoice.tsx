import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { 
  Invoice, 
  InvoiceItem, 
  InvoiceStatus, 
  PaymentMethod, 
  Product,
  Customer
} from '@/lib/types';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import CustomerSelector from '@/components/customer/CustomerSelector';
import ProductSelector from '@/components/invoice/ProductSelector';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon, ChevronLeft, Trash, Loader2 } from 'lucide-react';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  
  const editInvoice = location.state?.editInvoice as Invoice | undefined;
  
  const { addInvoice, updateInvoice } = useInvoices();
  const { getAll: getAllProducts } = useProducts();
  const { getAll: getAllCustomers, getById: getCustomerById } = useCustomers();
  
  const { data: products = [], isLoading: isLoadingProducts } = getAllProducts;
  const { data: customers = [], isLoading: isLoadingCustomers } = getAllCustomers;
  const { data: selectedCustomer, isLoading: isLoadingCustomer } = getCustomerById(customerId || '');
  
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.UNPAID);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [newItemProductId, setNewItemProductId] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState<boolean>(false);
  
  useEffect(() => {
    console.log('Component mounted. customerId:', customerId, 'editInvoice:', editInvoice);
    
    if (customerId) {
      setSelectedCustomerId(customerId);
    }
    
    if (editInvoice) {
      console.log('Editing existing invoice:', editInvoice);
      
      setInvoiceDate(new Date(editInvoice.date));
      setDueDate(editInvoice.dueDate ? new Date(editInvoice.dueDate) : undefined);
      setStatus(editInvoice.status);
      setPaymentMethod(editInvoice.paymentMethod);
      setSelectedCustomerId(editInvoice.customerId);
      setInvoiceItems(editInvoice.items || []);
    }
  }, [customerId, editInvoice]);
  
  useEffect(() => {
    if (paymentMethod === PaymentMethod.CASH) {
      setStatus(InvoiceStatus.PAID);
    } else if (paymentMethod === PaymentMethod.CREDIT && status === InvoiceStatus.PAID) {
      setStatus(InvoiceStatus.UNPAID);
    }
  }, [paymentMethod]);
  
  const handleAddItem = () => {
    if (!newItemProductId || newItemQuantity <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار منتج وتحديد كمية صحيحة",
        variant: "destructive",
      });
      return;
    }
    
    const selectedProduct = products.find(p => p.id === newItemProductId);
    
    if (!selectedProduct) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على المنتج المحدد",
        variant: "destructive",
      });
      return;
    }
    
    const existingItemIndex = invoiceItems.findIndex(item => item.productId === newItemProductId);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...invoiceItems];
      const existingItem = updatedItems[existingItemIndex];
      
      const newQuantity = existingItem.quantity + newItemQuantity;
      const newTotalPrice = selectedProduct.price * newQuantity;
      const newPointsEarned = selectedProduct.pointsEarned * newQuantity;
      
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        totalPrice: newTotalPrice,
        pointsEarned: newPointsEarned
      };
      
      setInvoiceItems(updatedItems);
    } else {
      const newItem: InvoiceItem = {
        productId: selectedProduct.id,
        quantity: newItemQuantity,
        price: selectedProduct.price,
        totalPrice: selectedProduct.price * newItemQuantity,
        pointsEarned: selectedProduct.pointsEarned * newItemQuantity
      };
      
      setInvoiceItems([...invoiceItems, newItem]);
    }
    
    setNewItemProductId('');
    setNewItemQuantity(1);
    
    toast({
      title: "تم الإضافة",
      description: "تمت إضافة المنتج إلى الفاتورة",
    });
  };
  
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
  };
  
  const calculateTotals = () => {
    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalPointsEarned = invoiceItems.reduce((sum, item) => sum + item.pointsEarned, 0);
    
    return {
      totalAmount,
      totalPointsEarned
    };
  };
  
  const getUniqueCategoriesCount = () => {
    const categories = new Set();
    
    invoiceItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        categories.add(product.category);
      }
    });
    
    return categories.size;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId || invoiceItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار عميل وإضافة منتج واحد على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { totalAmount, totalPointsEarned } = calculateTotals();
      const categoriesCount = getUniqueCategoriesCount();
      
      if (editInvoice) {
        const updatedInvoice: Invoice = {
          ...editInvoice,
          date: invoiceDate,
          dueDate,
          customerId: selectedCustomerId,
          status,
          paymentMethod,
          items: invoiceItems,
          totalAmount,
          pointsEarned: totalPointsEarned,
          pointsRedeemed: editInvoice.pointsRedeemed || 0,
          categoriesCount
        };
        
        await updateInvoice.mutateAsync(updatedInvoice);
        
        toast({
          title: "تم التحديث",
          description: "تم تحديث الفاتورة بنجاح",
        });
      } else {
        const newInvoice: Omit<Invoice, 'id'> = {
          customerId: selectedCustomerId,
          date: invoiceDate,
          dueDate,
          totalAmount,
          pointsEarned: totalPointsEarned,
          pointsRedeemed: 0,
          status,
          paymentMethod,
          categoriesCount
        };
        
        await addInvoice.mutateAsync({ invoice: newInvoice, items: invoiceItems });
        
        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء الفاتورة بنجاح",
        });
      }
      
      navigate('/invoices');
    } catch (error) {
      console.error('Error submitting invoice:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الفاتورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDiscard = () => {
    setDiscardDialogOpen(true);
  };
  
  const confirmDiscard = () => {
    setDiscardDialogOpen(false);
    navigate('/invoices');
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };
  
  const getProductById = (productId: string): Product | undefined => {
    return products.find(product => product.id === productId);
  };
  
  const totals = calculateTotals();
  
  return (
    <PageContainer 
      title={editInvoice ? "تعديل فاتورة" : "إنشاء فاتورة جديدة"} 
      subtitle={editInvoice ? "تعديل بيانات الفاتورة" : "إضافة فاتورة جديدة للعميل"}
    >
      <div className="flex mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/invoices')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          العودة إلى الفواتير
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>بيانات الفاتورة</CardTitle>
            <CardDescription>أدخل البيانات الرئيسية للفاتورة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer">العميل</Label>
                {isLoadingCustomers || isLoadingCustomer ? (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري تحميل العملاء...</span>
                  </div>
                ) : (
                  <CustomerSelector 
                    selectedCustomerId={selectedCustomerId}
                    onSelectCustomer={(customerId) => setSelectedCustomerId(customerId)}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label>تاريخ الفاتورة</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {invoiceDate ? format(invoiceDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={invoiceDate}
                      onSelect={(date) => date && setInvoiceDate(date)}
                      locale={ar}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>تاريخ الاستحقاق</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right"
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP', { locale: ar }) : 'اختياري'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      locale={ar}
                      disabled={(date) => date < invoiceDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.CASH}>نقداً</SelectItem>
                    <SelectItem value={PaymentMethod.CREDIT}>آجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">حالة الفاتورة</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => setStatus(value as InvoiceStatus)}
                  disabled={paymentMethod === PaymentMethod.CASH}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر حالة الفاتورة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={InvoiceStatus.PAID} disabled={paymentMethod === PaymentMethod.CREDIT}>مدفوع</SelectItem>
                    <SelectItem value={InvoiceStatus.UNPAID}>غير مدفوع</SelectItem>
                    <SelectItem value={InvoiceStatus.PARTIALLY_PAID}>مدفوع جزئياً</SelectItem>
                    <SelectItem value={InvoiceStatus.OVERDUE}>متأخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>المنتجات</CardTitle>
            <CardDescription>أضف المنتجات إلى الفاتورة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProductSelector 
              productId={newItemProductId}
              quantity={newItemQuantity}
              onProductChange={setNewItemProductId}
              onQuantityChange={setNewItemQuantity}
              onAddItem={handleAddItem}
            />
            
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        لم تتم إضافة منتجات بعد
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoiceItems.map((item, index) => {
                      const product = getProductById(item.productId);
                      return (
                        <TableRow key={index}>
                          <TableCell>{product?.name || 'منتج غير معروف'}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>{item.pointsEarned}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between border-t p-4">
            <div className="space-y-1 mb-4 sm:mb-0">
              <div className="text-sm">إجمالي النقاط المكتسبة: <span className="font-bold">{totals.totalPointsEarned}</span></div>
              <div className="text-xl">الإجمالي: <span className="font-bold">{formatCurrency(totals.totalAmount)}</span></div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscard}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || invoiceItems.length === 0 || !selectedCustomerId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  editInvoice ? 'تحديث الفاتورة' : 'إنشاء الفاتورة'
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
      
      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من إلغاء الفاتورة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم تجاهل جميع التغييرات التي قمت بها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default CreateInvoice;
