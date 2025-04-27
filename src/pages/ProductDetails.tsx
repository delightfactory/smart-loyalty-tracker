import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash, TrendingUp } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useProducts } from '@/hooks/useProducts';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, updateProduct, deleteProduct, getAll } = useProducts();
  const productQuery = getById(id || '');
  const allProductsQuery = getAll;
  // ✅ إصلاح نهائي لأنواع allData
  const allData = (Array.isArray(allProductsQuery.data) ? { products: allProductsQuery.data, invoices: [], customers: [] } : allProductsQuery.data) || { products: [], invoices: [], customers: [] };
  const product = productQuery.data;
  const products = allData.products;
  const invoices = allData.invoices;
  const customers = allData.customers;
  const isLoading = productQuery.isLoading || allProductsQuery.isLoading;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !product) {
      navigate('/products');
    }
  }, [product, isLoading, navigate]);

  if (isLoading || !product) {
    return (
      <PageContainer title="تفاصيل المنتج">
        <div className="flex justify-center items-center h-40">
          <span>جاري التحميل...</span>
        </div>
      </PageContainer>
    );
  }

  const formatNumber = (num: number | string) => Number(num).toLocaleString('en-US');
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  };

  const productSales = products.map(p => {
    const sales = invoices.reduce((total, invoice) => {
      const item = invoice.items.find(item => item.productId === p.id);
      return total + (item ? item.quantity : 0);
    }, 0);
    
    return { id: p.id, sales };
  }).sort((a, b) => b.sales - a.sales);
  
  const productRank = productSales.findIndex(p => p.id === product.id) + 1;
  
  const totalSales = invoices.reduce((total, invoice) => {
    const item = invoice.items.find(item => item.productId === product.id);
    return total + (item ? item.quantity : 0);
  }, 0);
  
  const totalRevenue = invoices.reduce((total, invoice) => {
    const item = invoice.items.find(item => item.productId === product.id);
    return total + (item ? item.totalPrice : 0);
  }, 0);
  
  const monthlySalesData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    
    const monthInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate.getMonth() === date.getMonth() && 
             invoiceDate.getFullYear() === date.getFullYear();
    });
    
    const sales = monthInvoices.reduce((sum, invoice) => {
      const item = invoice.items.find(item => item.productId === product.id);
      return sum + (item ? item.quantity : 0);
    }, 0);
    
    const revenue = monthInvoices.reduce((sum, invoice) => {
      const item = invoice.items.find(item => item.productId === product.id);
      return sum + (item ? item.totalPrice : 0);
    }, 0);
    
    return {
      name: month,
      sales,
      revenue
    };
  }).reverse();
  
  const customerPurchases = invoices
    .filter(invoice => invoice.items.some(item => item.productId === product.id))
    .reduce((acc, invoice) => {
      const customerId = invoice.customerId;
      const quantity = invoice.items.find(item => item.productId === product.id)?.quantity || 0;
      
      if (acc[customerId]) {
        acc[customerId] += quantity;
      } else {
        acc[customerId] = quantity;
      }
      
      return acc;
    }, {} as Record<string, number>);
  
  const topCustomers = Object.entries(customerPurchases)
    .map(([customerId, quantity]) => ({
      customerId,
      quantity: Number(quantity)
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <PageContainer title="تفاصيل المنتج" subtitle={product.name}>
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/products')}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة إلى المنتجات
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معلومات المنتج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الكود</p>
                <p className="text-lg font-bold">{product.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">وحدة القياس</p>
                <p className="text-lg font-bold">{product.unit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">القسم</p>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">البراند</p>
                <p className="text-lg font-bold">{product.brand}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">السعر</p>
                <p className="text-lg font-bold">{formatNumber(product.price)} ج.م</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">النقاط المكتسبة</p>
                <p className="text-lg font-bold">{formatNumber(product.pointsEarned)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">النقاط المطلوبة للاستبدال</p>
                <p className="text-lg font-bold">{formatNumber(product.pointsRequired)}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditProduct(product); setIsEditDialogOpen(true); }}>
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash className="h-4 w-4 ml-2" />
                حذف
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ملخص المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-center">{formatNumber(totalSales)} {product.unit}</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-center">{formatNumber(totalRevenue)} ج.م</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-3xl font-extrabold text-blue-700">{formatNumber(productRank)}</span>
                <span className="text-xs text-muted-foreground">من أصل</span>
                <span className="text-xl font-bold text-gray-700">{formatNumber(products.length)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدلات الشراء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ChartContainer
                config={{
                  sales: {
                    label: "المبيعات",
                    color: "#8B5CF6"
                  }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="sales" stroke="#8B5CF6" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>تطور المبيعات والإيرادات</CardTitle>
            <CardDescription>بيانات المبيعات والإيرادات على مدار الأشهر الماضية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  sales: {
                    label: "المبيعات (بالوحدة)",
                    color: "#10B981"
                  },
                  revenue: {
                    label: "الإيرادات (ج.م)",
                    color: "#F59E0B"
                  }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#10B981" />
                    <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales" fill="#10B981" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>العملاء الأكثر شراءً للمنتج</CardTitle>
            <CardDescription>أعلى 5 عملاء من حيث شراء هذا المنتج</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  quantity: {
                    label: "الكمية",
                    color: "#8B5CF6"
                  }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCustomers.map(item => {
                    const customer = customers.find(c => c.id === item.customerId);
                    return {
                      name: customer?.name || 'غير معروف',
                      quantity: item.quantity
                    };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="quantity" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل المنتج</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">اسم المنتج</label>
                <input className="input" value={editProduct?.name || ''} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>
              <div>
                <label className="block mb-1">السعر</label>
                <input className="input" type="number" value={editProduct?.price || ''} onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })} />
              </div>
              {/* باقي الحقول... */}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
              <Button onClick={() => {
                updateProduct.mutate(editProduct, {
                  onSuccess: () => {
                    setIsEditDialogOpen(false);
                    toast({ title: 'تم التحديث', description: 'تم تحديث بيانات المنتج بنجاح' });
                  }
                });
              }}>حفظ التعديلات</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {isDeleteDialogOpen && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد حذف المنتج</DialogTitle>
            </DialogHeader>
            <div className="py-4">هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع بعد الحذف.</div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>إلغاء</Button>
              <Button variant="destructive" onClick={() => {
                deleteProduct.mutate(product.id, {
                  onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    toast({ title: 'تم الحذف', description: 'تم حذف المنتج بنجاح' });
                    navigate('/products');
                  }
                });
              }}>تأكيد الحذف</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  );
};

export default ProductDetails;
