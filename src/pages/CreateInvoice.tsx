import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard, 
  Star, 
  Check, 
  X 
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { 
  Product, 
  Customer, 
  InvoiceItem, 
  ProductCategory, 
  PaymentMethod, 
  RedemptionItem 
} from '@/lib/types';
import { 
  products, 
  customers, 
  getProductById, 
  getCustomerById, 
  addInvoice, 
  updateCustomer 
} from '@/lib/data';
import { 
  calculatePoints, 
  calculateRedemptionPoints, 
  canRedeemPoints,
  generateInvoice 
} from '@/lib/calculations';
import { cn } from '@/lib/utils';

const CreateInvoice = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerId || '');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [redemptionItems, setRedemptionItems] = useState<RedemptionItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({
    productId: '',
    quantity: 1,
    price: 0,
    totalPrice: 0,
    pointsEarned: 0
  });
  const [newRedemptionItem, setNewRedemptionItem] = useState<Partial<RedemptionItem>>({
    productId: '',
    quantity: 1,
    pointsRequired: 0,
    totalPointsRequired: 0
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalRedemptionPoints, setTotalRedemptionPoints] = useState<number>(0);
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  
  const customer = selectedCustomerId ? getCustomerById(selectedCustomerId) : null;
  
  useEffect(() => {
    if (items.length > 0) {
      const uniqueCategories = new Set<ProductCategory>();
      
      items.forEach(item => {
        const product = getProductById(item.productId);
        if (product) {
          uniqueCategories.add(product.category);
        }
      });
      
      setCategoriesCount(uniqueCategories.size);
      
      const calculatedTotalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
      setTotalAmount(calculatedTotalAmount);
      
      const calculatedPointsEarned = calculatePoints(items);
      setPointsEarned(calculatedPointsEarned);
    } else {
      setCategoriesCount(0);
      setTotalAmount(0);
      setPointsEarned(0);
    }
  }, [items]);
  
  useEffect(() => {
    if (redemptionItems.length > 0) {
      const calculatedTotalPoints = redemptionItems.reduce((sum, item) => sum + (item.totalPointsRequired || 0), 0);
      setTotalRedemptionPoints(calculatedTotalPoints);
    } else {
      setTotalRedemptionPoints(0);
    }
  }, [redemptionItems]);
  
  const handleProductChange = (productId: string) => {
    const selectedProduct = getProductById(productId);
    if (selectedProduct) {
      setNewItem({
        ...newItem,
        productId,
        price: selectedProduct.price,
        totalPrice: selectedProduct.price * (newItem.quantity || 1),
        pointsEarned: selectedProduct.pointsEarned
      });
    }
  };
  
  const handleRedemptionProductChange = (productId: string) => {
    const selectedProduct = getProductById(productId);
    if (selectedProduct) {
      setNewRedemptionItem({
        ...newRedemptionItem,
        productId,
        pointsRequired: selectedProduct.pointsRequired,
        totalPointsRequired: selectedProduct.pointsRequired * (newRedemptionItem.quantity || 1)
      });
    }
  };
  
  const handleQuantityChange = (quantity: number) => {
    const selectedProduct = getProductById(newItem.productId || '');
    if (selectedProduct) {
      setNewItem({
        ...newItem,
        quantity,
        totalPrice: selectedProduct.price * quantity
      });
    } else {
      setNewItem({
        ...newItem,
        quantity
      });
    }
  };
  
  const handleRedemptionQuantityChange = (quantity: number) => {
    const selectedProduct = getProductById(newRedemptionItem.productId || '');
    if (selectedProduct) {
      setNewRedemptionItem({
        ...newRedemptionItem,
        quantity,
        totalPointsRequired: selectedProduct.pointsRequired * quantity
      });
    } else {
      setNewRedemptionItem({
        ...newRedemptionItem,
        quantity
      });
    }
  };
  
  const addItemToInvoice = () => {
    if (!newItem.productId || !newItem.quantity) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار منتج وتحديد الكمية",
        variant: "destructive"
      });
      return;
    }
    
    const item: InvoiceItem = {
      productId: newItem.productId,
      quantity: newItem.quantity,
      price: newItem.price || 0,
      totalPrice: newItem.totalPrice || 0,
      pointsEarned: newItem.pointsEarned || 0
    };
    
    setItems([...items, item]);
    
    setNewItem({
      productId: '',
      quantity: 1,
      price: 0,
      totalPrice: 0,
      pointsEarned: 0
    });
  };
  
  const addRedemptionItem = () => {
    if (!newRedemptionItem.productId || !newRedemptionItem.quantity) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار منتج وتحديد الكمية",
        variant: "destructive"
      });
      return;
    }
    
    if (customer && !canRedeemPoints(customer.id, totalRedemptionPoints + (newRedemptionItem.totalPointsRequired || 0))) {
      toast({
        title: "خطأ",
        description: "العميل لا يملك نقاط كافية أو لديه فواتير غير مدفوعة",
        variant: "destructive"
      });
      return;
    }
    
    const item: RedemptionItem = {
      productId: newRedemptionItem.productId,
      quantity: newRedemptionItem.quantity,
      pointsRequired: newRedemptionItem.pointsRequired || 0,
      totalPointsRequired: newRedemptionItem.totalPointsRequired || 0
    };
    
    setRedemptionItems([...redemptionItems, item]);
    
    setNewRedemptionItem({
      productId: '',
      quantity: 1,
      pointsRequired: 0,
      totalPointsRequired: 0
    });
  };
  
  const removeItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };
  
  const removeRedemptionItem = (index: number) => {
    const updatedItems = [...redemptionItems];
    updatedItems.splice(index, 1);
    setRedemptionItems(updatedItems);
  };
  
  const handleCreateInvoice = () => {
    if (!selectedCustomerId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار عميل",
        variant: "destructive"
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة منتج واحد على الأقل",
        variant: "destructive"
      });
      return;
    }
    
    const invoice = generateInvoice(selectedCustomerId, items, paymentMethod, totalRedemptionPoints);
    
    if (invoice) {
      addInvoice(invoice);
      
      if (customer) {
        const updatedCustomer = { ...customer };
        updatedCustomer.pointsEarned += invoice.pointsEarned;
        
        if (redemptionItems.length > 0) {
          updatedCustomer.pointsRedeemed += totalRedemptionPoints;
        }
        
        updatedCustomer.currentPoints = updatedCustomer.pointsEarned - updatedCustomer.pointsRedeemed;
        
        if (paymentMethod === PaymentMethod.CREDIT) {
          updatedCustomer.creditBalance += invoice.totalAmount;
        }
        
        updateCustomer(updatedCustomer);
      }
      
      toast({
        title: "نجاح",
        description: "تم إنشاء الفاتورة بنجاح",
      });
      
      navigate(customerId ? `/customer/${customerId}` : '/invoices');
    }
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };
  
  const getPointsMultiplierLabel = () => {
    switch (categoriesCount) {
      case 0:
        return "0%";
      case 1:
        return "25%";
      case 2:
        return "50%";
      case 3:
        return "75%";
      default:
        return "100%";
    }
  };
  
  const getCategoryBadgeColor = (category: ProductCategory) => {
    switch(category) {
      case ProductCategory.ENGINE_CARE:
        return "bg-blue-100 text-blue-800";
      case ProductCategory.EXTERIOR_CARE:
        return "bg-green-100 text-green-800";
      case ProductCategory.TIRE_CARE:
        return "bg-purple-100 text-purple-800";
      case ProductCategory.DASHBOARD_CARE:
        return "bg-amber-100 text-amber-800";
      case ProductCategory.INTERIOR_CARE:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <PageContainer title="إنشاء فاتورة جديدة" subtitle="إضافة منتجات وحساب النقاط">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              تفاصيل الفاتورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customer">العميل</Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  disabled={!!customerId}
                >
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value={PaymentMethod.CASH}>{PaymentMethod.CASH}</SelectItem>
                    <SelectItem value={PaymentMethod.CREDIT}>{PaymentMethod.CREDIT}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">إضافة منتج</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="product">المنتج</Label>
                    <Select
                      value={newItem.productId}
                      onValueChange={handleProductChange}
                    >
                      <SelectTrigger id="product">
                        <SelectValue placeholder="اختر منتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({formatCurrency(product.price)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">الكمية</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addItemToInvoice} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة
                    </Button>
                  </div>
                </div>
              </div>
              
              {items.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>القسم</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead>النقاط</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => {
                        const product = getProductById(item.productId);
                        return (
                          <TableRow key={index}>
                            <TableCell>{product?.name || 'غير معروف'}</TableCell>
                            <TableCell>
                              {product && (
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  getCategoryBadgeColor(product.category)
                                )}>
                                  {product.category}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                            <TableCell>{item.pointsEarned}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لم يتم إضافة منتجات بعد</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              ملخص الفاتورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد المنتجات:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد الأقسام:</span>
                <span className="flex items-center">
                  {categoriesCount}
                  <span className={cn(
                    "ml-2 px-2 py-1 rounded-full text-xs font-medium",
                    categoriesCount >= 4 ? "bg-green-100 text-green-800" :
                    categoriesCount === 3 ? "bg-blue-100 text-blue-800" :
                    categoriesCount === 2 ? "bg-amber-100 text-amber-800" :
                    categoriesCount === 1 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                  )}>
                    {getPointsMultiplierLabel()}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">النقاط المكتسبة:</span>
                <span className="font-medium">{pointsEarned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">النقاط المستبدلة:</span>
                <span className="font-medium">{totalRedemptionPoints}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">الإجمالي:</span>
                  <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
            
            {paymentMethod === PaymentMethod.CASH && customer && (
              <Accordion type="single" collapsible className="border rounded-lg">
                <AccordionItem value="redemption" className="border-none">
                  <AccordionTrigger className="px-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2 text-amber-500" />
                      استبدال النقاط
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>رصيد النقاط الحالي:</span>
                        <span className="font-medium">{customer.currentPoints}</span>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            <Label htmlFor="redemptionProduct" className="text-xs">المنتج</Label>
                            <Select
                              value={newRedemptionItem.productId}
                              onValueChange={handleRedemptionProductChange}
                            >
                              <SelectTrigger id="redemptionProduct">
                                <SelectValue placeholder="اختر منتج" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.pointsRequired} نقطة)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="redemptionQuantity" className="text-xs">الكمية</Label>
                            <Input
                              id="redemptionQuantity"
                              type="number"
                              min="1"
                              value={newRedemptionItem.quantity}
                              onChange={(e) => handleRedemptionQuantityChange(Number(e.target.value))}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button onClick={addRedemptionItem} className="w-full">
                              <Plus className="h-4 w-4 mr-2" />
                              إضافة
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {redemptionItems.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>المنتج</TableHead>
                                <TableHead>الكمية</TableHead>
                                <TableHead>النقاط</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {redemptionItems.map((item, index) => {
                                const product = getProductById(item.productId);
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{product?.name || 'غير معروف'}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.totalPointsRequired}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRedemptionItem(index)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              <TableRow>
                                <TableCell colSpan={2} className="font-medium">الإجمالي</TableCell>
                                <TableCell colSpan={2} className="font-bold">{totalRedemptionPoints} نقطة</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center">
                          لم يتم إضافة منتجات للاستبدال
                        </div>
                      )}
                      
                      {redemptionItems.length > 0 && (
                        <div className={cn(
                          "p-3 rounded-lg text-sm flex items-center",
                          canRedeemPoints(customer.id, totalRedemptionPoints) 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        )}>
                          {canRedeemPoints(customer.id, totalRedemptionPoints) ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              <span>يمكن استبدال النقاط</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              <span>لا يمكن استبدال النقاط (نقاط غير كافية أو فواتير غير مدفوعة)</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCreateInvoice}
              disabled={items.length === 0 || !selectedCustomerId}
            >
              إنشاء الفاتورة
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CreateInvoice;
