import { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star, Plus, AlertTriangle } from 'lucide-react';
import { RedemptionItem, Customer, Product } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import RedemptionItemsList from './RedemptionItemsList';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';

interface RedemptionFormProps {
  customer: Customer | null;
  selectedCustomerId: string;
  redemptionItems: RedemptionItem[];
  setRedemptionItems: (items: RedemptionItem[]) => void;
  totalRedemptionPoints: number;
  onCustomerChange: (customerId: string) => void;
  hasUnpaidInvoices: boolean;
  isCustomerSelected: boolean;
}

const RedemptionForm = ({
  customer,
  selectedCustomerId,
  redemptionItems,
  setRedemptionItems,
  totalRedemptionPoints,
  onCustomerChange,
  hasUnpaidInvoices,
  isCustomerSelected
}: RedemptionFormProps) => {
  const { toast } = useToast();
  
  // Use React Query for products
  const { getAll } = useProducts();
  const productsQuery = getAll;
  const products = productsQuery.data || [];
  
  // Use React Query for customers
  const { getAll: getAllCustomers } = useCustomers();
  const customersQuery = getAllCustomers;
  const customers = customersQuery.data || [];
  
  const [newRedemptionItem, setNewRedemptionItem] = useState<Partial<RedemptionItem>>({
    productId: '',
    quantity: 1,
    pointsRequired: 0,
    totalPointsRequired: 0
  });

  // دوال مساعدة لجلب الكود من العميل أو المنتج (للتوافق مع الواجهة)
  const getCustomerCode = (customer: Customer) => customer.id;
  const getProductCode = (product: Product) => product.id;

  // بحث العملاء (اسم، كود، هاتف)
  const [customerSearch, setCustomerSearch] = useState('');
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    return customers.filter((c) => {
      const search = customerSearch.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(search)) ||
        (getCustomerCode(c) && getCustomerCode(c).toLowerCase().includes(search)) ||
        (c.phone && c.phone.toLowerCase().includes(search))
      );
    });
  }, [customerSearch, customers]);

  // بحث المنتجات (اسم، كود)
  const [productSearch, setProductSearch] = useState('');
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    return products.filter((p) => {
      const search = productSearch.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(search)) ||
        (getProductCode(p) && getProductCode(p).toLowerCase().includes(search))
      );
    });
  }, [productSearch, products]);

  const handleRedemptionProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      const pointsRequired = Number(selectedProduct.pointsRequired) || 0;
      setNewRedemptionItem({
        ...newRedemptionItem,
        productId,
        pointsRequired: pointsRequired,
        totalPointsRequired: pointsRequired * (newRedemptionItem.quantity || 1)
      });
      // إعادة تعيين مربع البحث عن المنتج بعد الاختيار
      setProductSearch('');
    }
  };
  
  const handleRedemptionQuantityChange = (quantity: number) => {
    const selectedProduct = products.find(p => p.id === newRedemptionItem.productId);
    if (selectedProduct) {
      const pointsRequired = Number(selectedProduct.pointsRequired) || 0;
      setNewRedemptionItem({
        ...newRedemptionItem,
        quantity,
        totalPointsRequired: pointsRequired * quantity
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
    
    // تحقق من رصيد نقاط العميل إذا كان مختارًا
    if (customer) {
      const customerCurrentPoints = Number(customer.currentPoints) || 0;
      const newTotalPoints = totalRedemptionPoints + (newRedemptionItem.totalPointsRequired || 0);
      
      if (newTotalPoints > customerCurrentPoints) {
        toast({
          title: "خطأ",
          description: "العميل لا يملك نقاط كافية للاستبدال",
          variant: "destructive"
        });
        return;
      }
    }
    
    const item: RedemptionItem = {
      productId: newRedemptionItem.productId || '',
      quantity: newRedemptionItem.quantity || 1,
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
    
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة المنتج إلى القائمة بنجاح",
    });
  };
  
  const removeRedemptionItem = (index: number) => {
    const updatedItems = [...redemptionItems];
    updatedItems.splice(index, 1);
    setRedemptionItems(updatedItems);
    
    toast({
      title: "تم الحذف",
      description: "تم حذف المنتج من القائمة بنجاح",
    });
  };

  // تأكد من أن لدينا منتجات متاحة للاستبدال
  const redeemableProducts = products.filter(product => {
    const pointsRequired = Number(product.pointsRequired) || 0;
    return pointsRequired > 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-2 mb-4">
        <div className="font-bold text-lg text-blue-900 dark:text-blue-300">
          {/* النقاط المتاحة الحقيقية = نقاط العميل الحالية - إجمالي نقاط الاستبدال الجارية */}
          النقاط المتاحة: {customer ? Math.max((customer.currentPoints ?? 0) - totalRedemptionPoints, 0).toLocaleString('en-US') : '--'}
        </div>
        {customer && (
          <div className="text-sm text-gray-500 dark:text-gray-300">
            العميل: <span className="font-medium">{customer.name}</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer">العميل</Label>
        <Input
          placeholder="بحث بالاسم أو الكود أو الهاتف..."
          className="mb-2"
          value={customerSearch}
          onChange={e => setCustomerSearch(e.target.value)}
        />
        <Select
          value={selectedCustomerId}
          onValueChange={onCustomerChange}
        >
          <SelectTrigger id="customer">
            <SelectValue placeholder="اختر العميل" />
          </SelectTrigger>
          <SelectContent>
            {customersQuery.isLoading ? (
              <SelectItem value="loading" disabled>جاري تحميل البيانات...</SelectItem>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} (كود: {getCustomerCode(customer) || '--'}, هاتف: {customer.phone || '--'}, النقاط: {(customer.currentPoints ?? 0).toLocaleString('en-US')})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>لا يوجد نتائج مطابقة</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {customer && hasUnpaidInvoices && (
        <div className="bg-amber-100 text-amber-800 dark:bg-yellow-900 dark:text-yellow-200 p-4 rounded-lg flex items-center animate-fade-in">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">تنبيه: يوجد فواتير غير مدفوعة</p>
            <p className="text-sm">لا يمكن استبدال النقاط طالما يوجد فواتير غير مدفوعة</p>
          </div>
        </div>
      )}
      
      <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-300" />
          إضافة منتج للاستبدال
        </h3>
        <Input
          placeholder="بحث عن منتج بالاسم أو الكود..."
          className="mb-2"
          value={productSearch}
          onChange={e => setProductSearch(e.target.value)}
          disabled={!isCustomerSelected || hasUnpaidInvoices}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="product">المنتج</Label>
            <Select
              value={newRedemptionItem.productId}
              onValueChange={handleRedemptionProductChange}
              disabled={!isCustomerSelected || hasUnpaidInvoices}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="اختر منتج" />
              </SelectTrigger>
              <SelectContent>
                {productsQuery.isLoading ? (
                  <SelectItem value="loading" disabled>جاري تحميل البيانات...</SelectItem>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (كود: {getProductCode(product) || '--'}, {(product.pointsRequired ?? 0).toLocaleString('en-US')} نقطة)
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>لا يوجد نتائج مطابقة</SelectItem>
                )}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') addRedemptionItem();
              }}
              disabled={!isCustomerSelected || hasUnpaidInvoices || !newRedemptionItem.productId}
            />
            {newRedemptionItem.productId && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Total Points: {((newRedemptionItem.totalPointsRequired ?? 0)).toLocaleString('en-US')}
              </div>
            )}
          </div>
          <div className="flex items-end">
            <Button 
              onClick={addRedemptionItem} 
              className="w-full"
              disabled={!isCustomerSelected || hasUnpaidInvoices || !newRedemptionItem.productId}
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة
            </Button>
          </div>
        </div>
      </div>
      
      <RedemptionItemsList 
        redemptionItems={redemptionItems} 
        onRemoveItem={removeRedemptionItem}
        products={products}
        numberFormat="en-US"
      />
    </div>
  );
};

export default RedemptionForm;
