
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Star, 
  Package, 
  User,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { 
  Product, 
  Customer, 
  RedemptionItem, 
  InvoiceStatus
} from '@/lib/types';
import { 
  products, 
  customers, 
  getProductById, 
  getCustomerById, 
  getInvoicesByCustomerId,
  updateCustomer
} from '@/lib/data';
import { canRedeemPoints } from '@/lib/calculations';
import { cn } from '@/lib/utils';

const CreateRedemption = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerId || '');
  const [redemptionItems, setRedemptionItems] = useState<RedemptionItem[]>([]);
  const [newRedemptionItem, setNewRedemptionItem] = useState<Partial<RedemptionItem>>({
    productId: '',
    quantity: 1,
    pointsRequired: 0,
    totalPointsRequired: 0
  });
  const [totalRedemptionPoints, setTotalRedemptionPoints] = useState<number>(0);
  
  const customer = selectedCustomerId ? getCustomerById(selectedCustomerId) : null;
  
  useEffect(() => {
    if (redemptionItems.length > 0) {
      const calculatedTotalPoints = redemptionItems.reduce((sum, item) => sum + (item.totalPointsRequired || 0), 0);
      setTotalRedemptionPoints(calculatedTotalPoints);
    } else {
      setTotalRedemptionPoints(0);
    }
  }, [redemptionItems]);
  
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
  
  const removeRedemptionItem = (index: number) => {
    const updatedItems = [...redemptionItems];
    updatedItems.splice(index, 1);
    setRedemptionItems(updatedItems);
  };
  
  const handleCreateRedemption = () => {
    if (!selectedCustomerId) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار عميل",
        variant: "destructive"
      });
      return;
    }
    
    if (redemptionItems.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة منتج واحد على الأقل",
        variant: "destructive"
      });
      return;
    }
    
    if (customer && !canRedeemPoints(customer.id, totalRedemptionPoints)) {
      toast({
        title: "خطأ",
        description: "العميل لا يملك نقاط كافية أو لديه فواتير غير مدفوعة",
        variant: "destructive"
      });
      return;
    }
    
    // Perform the redemption by updating customer points
    if (customer) {
      const updatedCustomer = { ...customer };
      updatedCustomer.pointsRedeemed += totalRedemptionPoints;
      updatedCustomer.currentPoints = updatedCustomer.pointsEarned - updatedCustomer.pointsRedeemed;
      
      updateCustomer(updatedCustomer);
      
      toast({
        title: "نجاح",
        description: `تم استبدال ${totalRedemptionPoints} نقطة بنجاح`,
      });
      
      navigate(customerId ? `/customer/${customerId}` : '/customers');
    }
  };
  
  // Check if customer has unpaid invoices
  const hasUnpaidInvoices = () => {
    if (!customer) return false;
    
    const customerInvoices = getInvoicesByCustomerId(customer.id);
    return customerInvoices.some(invoice => 
      invoice.status === InvoiceStatus.UNPAID || 
      invoice.status === InvoiceStatus.PARTIALLY_PAID || 
      invoice.status === InvoiceStatus.OVERDUE
    );
  };
  
  return (
    <PageContainer title="استبدال النقاط" subtitle="استبدال نقاط الولاء بمنتجات">
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
              <Star className="h-5 w-5 mr-2 text-amber-500" />
              تفاصيل الاستبدال
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
                        {customer.name} ({customer.currentPoints} نقطة)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {customer && hasUnpaidInvoices() && (
                <div className="bg-amber-100 text-amber-800 p-4 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <div>
                    <p className="font-medium">تنبيه: يوجد فواتير غير مدفوعة</p>
                    <p className="text-sm">لا يمكن استبدال النقاط طالما يوجد فواتير غير مدفوعة</p>
                  </div>
                </div>
              )}
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">إضافة منتج للاستبدال</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="product">المنتج</Label>
                    <Select
                      value={newRedemptionItem.productId}
                      onValueChange={handleRedemptionProductChange}
                    >
                      <SelectTrigger id="product">
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
                    <Label htmlFor="quantity">الكمية</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newRedemptionItem.quantity}
                      onChange={(e) => handleRedemptionQuantityChange(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={addRedemptionItem} 
                      className="w-full"
                      disabled={!customer || hasUnpaidInvoices()}
                    >
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
                        <TableHead>النقاط المطلوبة</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>إجمالي النقاط</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {redemptionItems.map((item, index) => {
                        const product = getProductById(item.productId);
                        return (
                          <TableRow key={index}>
                            <TableCell>{product?.name || 'غير معروف'}</TableCell>
                            <TableCell>{item.pointsRequired}</TableCell>
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
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لم يتم إضافة منتجات للاستبدال بعد</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-amber-500" />
              ملخص الاستبدال
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {customer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">العميل</p>
                    <p className="font-medium">{customer.name}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">النقاط المكتسبة:</span>
                    <span className="font-medium">{customer.pointsEarned}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">النقاط المستبدلة:</span>
                  <span className="font-medium">{customer.pointsRedeemed}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الرصيد الحالي:</span>
                  <span className="font-bold text-lg">{customer.currentPoints}</span>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">النقاط المطلوبة:</span>
                  <span className="text-xl font-bold text-amber-600">{totalRedemptionPoints}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">الرصيد المتبقي:</span>
                  <span className={cn(
                    "text-lg font-bold",
                    customer.currentPoints - totalRedemptionPoints >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {customer.currentPoints - totalRedemptionPoints}
                  </span>
                </div>
                
                <div className={cn(
                  "p-3 rounded-lg text-sm flex items-center mt-4",
                  canRedeemPoints(customer.id, totalRedemptionPoints) 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                )}>
                  {canRedeemPoints(customer.id, totalRedemptionPoints) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      <span>يمكن إتمام عملية الاستبدال</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      <span>
                        {customer.currentPoints < totalRedemptionPoints 
                          ? "رصيد النقاط غير كافٍ"
                          : "يوجد فواتير غير مدفوعة"
                        }
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <p>يرجى اختيار عميل أولاً</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCreateRedemption}
              disabled={
                !customer || 
                redemptionItems.length === 0 || 
                !canRedeemPoints(customer?.id || '', totalRedemptionPoints)
              }
            >
              تأكيد الاستبدال
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CreateRedemption;
