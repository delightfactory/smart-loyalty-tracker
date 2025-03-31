
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

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { customerId, editInvoiceId } = useParams();
  const { toast } = useToast();
  const { addInvoice, getById } = useInvoices();
  const { getAll } = useProducts();
  const { data: products = [] } = getAll;
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    console.log("Component mounted. customerId:", customerId, "editInvoice:", editInvoiceId);
    setIsMounted(true);
    return () => setIsMounted(false);
  }, [customerId, editInvoiceId]);

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
  
  // Get the editing invoice if in edit mode
  const { data: editInvoice, isLoading: isLoadingInvoice } = getById(editInvoiceId || '');
  
  // Set up navigation confirmation if form is dirty
  useNavigationConfirm(isDirty);
  
  // Initialize form with customerId from params
  useEffect(() => {
    if (customerId && isMounted) {
      setSelectedCustomerId(customerId);
    }
  }, [customerId, isMounted]);
  
  // Initialize form with invoice data if in edit mode
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
  
  // Handle saving the invoice
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
    
    try {
      setIsSubmitting(true);
      
      // Prepare invoice data
      const newInvoice: Omit<Invoice, 'id'> = {
        customerId: selectedCustomerId,
        date: invoiceDate,
        dueDate: dueDate,
        items: items,
        totalAmount: totalAmount,
        pointsEarned: adjustedPointsEarned,
        pointsRedeemed: 0,
        status: paymentMethod === PaymentMethod.CASH ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
        paymentMethod: paymentMethod,
        categoriesCount: categoriesCount
      };
      
      // Send request to create invoice
      await addInvoice.mutateAsync({ invoice: newInvoice, items });
      
      // Navigate to invoice list
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
    return amount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
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
                disabled={!!editInvoiceId}
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
                      {invoiceDate ? format(invoiceDate, 'yyyy/MM/dd') : 'اختر التاريخ'}
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
                  onValueChange={(value) => {
                    setPaymentMethod(value as PaymentMethod);
                    
                    // إذا تغيرت طريقة الدفع إلى آجل، نضيف موعد استحقاق بعد شهر
                    if (value === PaymentMethod.CREDIT) {
                      const nextMonth = new Date();
                      nextMonth.setMonth(nextMonth.getMonth() + 1);
                      setDueDate(nextMonth);
                    }
                    
                    setIsDirty(true);
                  }}
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right"
                        disabled={isSubmitting}
                      >
                        <CalendarCheck className="ml-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'yyyy/MM/dd') : 'اختر تاريخ الاستحقاق'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => {
                          if (date) {
                            setDueDate(date);
                            setIsDirty(true);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
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
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>{item.pointsEarned}</TableCell>
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
                <div className="text-2xl font-bold mt-1">{adjustedPointsEarned} نقطة</div>
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
