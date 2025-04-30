import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Calendar as CalendarIcon, 
  CalendarCheck, 
  Save, 
  Trash, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { 
  InvoiceStatus, 
  PaymentMethod, 
  Product, 
  InvoiceItem,
  Invoice
} from '@/lib/types';
import ProductSelector from '@/components/invoice/ProductSelector';
import CustomerSelector from '@/components/invoice/CustomerSelector';
import { useInvoices } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';
import { useNavigationConfirm } from '@/hooks/useNavigationConfirm';
import { useToast } from '@/components/ui/use-toast';
import { useCustomers } from '@/hooks/useCustomers';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { customerId, edit } = useParams();
  const { toast } = useToast();
  const { addInvoice, getById, updateInvoice } = useInvoices();
  const { getAll } = useProducts();
  const { data: products = [] } = getAll;
  const { getAll: getAllCustomers } = useCustomers();
  const { data: customers = [] } = getAllCustomers;
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    console.log("Component mounted. customerId:", customerId, "edit:", edit);
    setIsMounted(true);
    return () => setIsMounted(false);
  }, [customerId, edit]);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // احصل على بيانات الفاتورة إذا كنا في وضع التعديل
  const { data: editInvoice, isLoading: isLoadingInvoice } = getById(edit || '');
  
  // Set up navigation confirmation if form is dirty
  useNavigationConfirm(isDirty);
  
  // Initialize form with customerId from params
  useEffect(() => {
    if (customerId && isMounted) {
      setSelectedCustomerId(customerId);
    }
  }, [customerId, isMounted]);
  
  // عند التعديل، قم بتهيئة النموذج ببيانات الفاتورة
  useEffect(() => {
    if (editInvoice && isMounted) {
      setSelectedCustomerId(editInvoice.customerId);
      setInvoiceDate(new Date(editInvoice.date));
      if (editInvoice.dueDate) {
        setDueDate(new Date(editInvoice.dueDate));
      }
      setPaymentMethod(editInvoice.paymentMethod);
      setItems(editInvoice.items || []);
    }
  }, [editInvoice, isMounted]);
  
  // عند تغيير العميل أو طريقة الدفع، احسب تاريخ الاستحقاق تلقائيًا إذا كان الدفع آجل
  useEffect(() => {
    if (paymentMethod === PaymentMethod.CREDIT && selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      const creditDays = customer?.credit_period || 0;
      if (creditDays > 0) {
        const newDueDate = new Date(invoiceDate);
        newDueDate.setDate(newDueDate.getDate() + creditDays);
        setDueDate(newDueDate);
      } else {
        setDueDate(undefined);
      }
    }
  }, [paymentMethod, selectedCustomerId, invoiceDate, customers]);

  // Calculate totals
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPointsEarned = items.reduce((sum, item) => sum + item.pointsEarned, 0);
  
  // Determine categories count for points calculation
  const uniqueCategories = new Set(
    items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return product?.category;
    }).filter(Boolean)
  );
  const categoriesCount = uniqueCategories.size;
  
  // Calculate adjusted points based on categories count
  const getPointsMultiplier = (count: number) => {
    if (count >= 4) return 1.0; // 100% of points
    if (count === 3) return 0.75; // 75% of points
    if (count === 2) return 0.5; // 50% of points
    return 0.25; // 25% of points for 1 category
  };
  
  const adjustedPointsEarned = Math.round(totalPointsEarned * getPointsMultiplier(categoriesCount));
  
  // Handle adding a product to the invoice
  const handleAddItem = () => {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    // Check if product already exists in items
    const existingItemIndex = items.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        totalPrice: product.price * newQuantity,
        pointsEarned: product.pointsEarned * newQuantity
      };
      
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: InvoiceItem = {
        productId: selectedProductId,
        quantity: quantity,
        price: product.price,
        totalPrice: product.price * quantity,
        pointsEarned: product.pointsEarned * quantity
      };
      
      setItems([...items, newItem]);
    }
    
    // Reset product selection
    setSelectedProductId('');
    setQuantity(1);
    setIsDirty(true);
  };
  
  // Handle removing an item from the invoice
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    setIsDirty(true);
  };
  
  // عند الحفظ، إذا كنا في وضع التعديل نفذ updateInvoice.mutateAsync مباشرة ببيانات الفاتورة والأصناف
  const handleSaveInvoice = async () => {
    if (!selectedCustomerId) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار العميل",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "تنبيه",
        description: "يرجى إضافة منتج واحد على الأقل",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === PaymentMethod.CREDIT) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      const creditDays = customer?.credit_period || 0;
      if (!selectedCustomerId || creditDays === 0) {
        toast({
          title: 'تنبيه',
          description: 'هذا العميل ليس لديه صلاحية ائتمان ولا يمكن إصدار فاتورة آجل له',
          variant: 'destructive',
        });
        return;
      }
      if (!dueDate) {
        toast({
          title: 'تنبيه',
          description: 'يجب تحديد تاريخ الاستحقاق للفاتورة الآجلة',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (editInvoice) {
        // تعديل الفاتورة: أرسل جميع بيانات الفاتورة مع الأصناف
        const updatedInvoice = {
          ...editInvoice,
          customerId: selectedCustomerId,
          date: invoiceDate,
          dueDate: dueDate,
          paymentMethod,
          items,
          totalAmount,
          pointsEarned: adjustedPointsEarned,
          pointsRedeemed: 0,
          status: paymentMethod === PaymentMethod.CASH ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
          categoriesCount,
        };
        await updateInvoice.mutateAsync(updatedInvoice);
      } else {
        // إضافة فاتورة جديدة
        const newInvoice = {
          customerId: selectedCustomerId,
          date: invoiceDate,
          dueDate: dueDate,
          paymentMethod,
          items,
          totalAmount,
          pointsEarned: adjustedPointsEarned,
          pointsRedeemed: 0,
          status: paymentMethod === PaymentMethod.CASH ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
          categoriesCount,
        };
        await addInvoice.mutateAsync({ invoice: newInvoice, items });
      }
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get product details by ID
  const getProductById = (productId: string): Product | undefined => {
    return products.find(product => product.id === productId);
  };
  
  // Format currency helper
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'EGP' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
  };
  
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as PaymentMethod);
    if (value === PaymentMethod.CREDIT) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      const creditDays = customer?.credit_period || 0;
      if (!selectedCustomerId || creditDays === 0) {
        toast({
          title: 'تنبيه',
          description: 'هذا العميل ليس لديه صلاحية ائتمان ولا يمكن إصدار فاتورة آجل له',
          variant: 'destructive',
        });
        setPaymentMethod(PaymentMethod.CASH);
        setDueDate(undefined);
        return;
      }
      // سيُحسب تاريخ الاستحقاق تلقائيًا في useEffect أعلاه
    } else {
      setDueDate(undefined);
    }
  };

  return (
    <PageContainer title="إنشاء فاتورة جديدة" subtitle="إضافة فاتورة جديدة للعميل">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomerSelector 
                selectedCustomerId={selectedCustomerId}
                onSelectCustomer={setSelectedCustomerId}
                disabled={!!editInvoice}
              />
              
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">تاريخ الفاتورة</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right"
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {invoiceDate ? formatDate(invoiceDate) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={invoiceDate}
                      onSelect={(date) => {
                        if (date) {
                          setInvoiceDate(date);
                          setIsDirty(true);
                        }
                      }}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={handlePaymentMethodChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethod.CASH}>{PaymentMethod.CASH}</SelectItem>
                    <SelectItem value={PaymentMethod.CREDIT}>{PaymentMethod.CREDIT}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {paymentMethod === PaymentMethod.CREDIT && (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                  <Input
                    id="dueDate"
                    type="text"
                    value={dueDate ? formatDate(dueDate) : ''}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <ProductSelector
              productId={selectedProductId}
              quantity={quantity}
              onProductChange={setSelectedProductId}
              onQuantityChange={setQuantity}
              onAddItem={handleAddItem}
            />
            
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الوحدة</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length > 0 ? (
                    items.map((item, index) => {
                      const product = getProductById(item.productId);
                      return (
                        <TableRow key={index}>
                          <TableCell>{product?.name || 'غير معروف'}</TableCell>
                          <TableCell>{product?.unit || ''}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  // تقليل الكمية
                                  if (item.quantity > 1) {
                                    const updatedItems = [...items];
                                    updatedItems[index] = {
                                      ...item,
                                      quantity: item.quantity - 1,
                                      totalPrice: item.price * (item.quantity - 1),
                                      pointsEarned: product?.pointsEarned ? product.pointsEarned * (item.quantity - 1) : 0
                                    };
                                    setItems(updatedItems);
                                    setIsDirty(true);
                                  }
                                }}
                                disabled={isSubmitting || item.quantity <= 1}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                min={1}
                                className="w-16 text-center"
                                value={item.quantity}
                                onChange={e => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val) && val > 0) {
                                    const updatedItems = [...items];
                                    updatedItems[index] = {
                                      ...item,
                                      quantity: val,
                                      totalPrice: item.price * val,
                                      pointsEarned: product?.pointsEarned ? product.pointsEarned * val : 0
                                    };
                                    setItems(updatedItems);
                                    setIsDirty(true);
                                  }
                                }}
                                disabled={isSubmitting}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  // زيادة الكمية
                                  const updatedItems = [...items];
                                  updatedItems[index] = {
                                    ...item,
                                    quantity: item.quantity + 1,
                                    totalPrice: item.price * (item.quantity + 1),
                                    pointsEarned: product?.pointsEarned ? product.pointsEarned * (item.quantity + 1) : 0
                                  };
                                  setItems(updatedItems);
                                  setIsDirty(true);
                                }}
                                disabled={isSubmitting}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>{item.pointsEarned.toLocaleString('en-US')}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveItem(index)}
                              disabled={isSubmitting}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                              <span className="sr-only">حذف</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        لم يتم إضافة أي منتجات بعد
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-md p-4">
                <div className="text-muted-foreground text-sm">إجمالي الفاتورة</div>
                <div className="text-2xl font-bold mt-1">{formatCurrency(totalAmount)}</div>
              </div>
              
              <div className="bg-muted rounded-md p-4">
                <div className="text-muted-foreground text-sm">عدد الأقسام</div>
                <div className="text-xl font-bold mt-1">{categoriesCount} أقسام</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {getPointsMultiplier(categoriesCount) * 100}% من النقاط
                </div>
              </div>
              
              <div className="bg-muted rounded-md p-4">
                <div className="text-muted-foreground text-sm">النقاط المكتسبة</div>
                <div className="text-2xl font-bold mt-1">{adjustedPointsEarned.toLocaleString('en-US')} نقطة</div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                رجوع
              </Button>
              
              <Button
                onClick={handleSaveInvoice}
                disabled={items.length === 0 || !selectedCustomerId || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="ml-2 h-4 w-4" />
                    حفظ الفاتورة
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CreateInvoice;
