
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
import { getProductById, products, invoices } from '@/lib/data';
import { cn } from '@/lib/utils';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState(getProductById(id || ''));
  
  // If product not found, redirect to products page
  useEffect(() => {
    if (!product) {
      navigate('/products');
    }
  }, [product, navigate]);
  
  if (!product) {
    return null;
  }
  
  // Calculate product rank based on sales
  const productSales = products.map(p => {
    const sales = invoices.reduce((total, invoice) => {
      const item = invoice.items.find(item => item.productId === p.id);
      return total + (item ? item.quantity : 0);
    }, 0);
    
    return { id: p.id, sales };
  }).sort((a, b) => b.sales - a.sales);
  
  const productRank = productSales.findIndex(p => p.id === product.id) + 1;
  
  // Calculate total sales and revenue for this product
  const totalSales = invoices.reduce((total, invoice) => {
    const item = invoice.items.find(item => item.productId === product.id);
    return total + (item ? item.quantity : 0);
  }, 0);
  
  const totalRevenue = invoices.reduce((total, invoice) => {
    const item = invoice.items.find(item => item.productId === product.id);
    return total + (item ? item.totalPrice : 0);
  }, 0);
  
  // Monthly sales data
  const monthlySalesData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('ar-EG', { month: 'long' });
    
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
  
  // Customers who purchased this product
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
      quantity
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
                <p className="text-lg font-bold">{product.price.toLocaleString('ar-EG')} ج.م</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">النقاط المكتسبة</p>
                <p className="text-lg font-bold">{product.pointsEarned}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">النقاط المطلوبة للاستبدال</p>
                <p className="text-lg font-bold">{product.pointsRequired}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
              <Button variant="destructive" size="sm">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold">{totalSales} {product.unit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString('ar-EG')} ج.م</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">ترتيب المنتج</p>
                <div className="flex items-center">
                  <TrendingUp className={cn(
                    "h-5 w-5 mr-2",
                    productRank <= 3 ? "text-green-500" : 
                    productRank <= 10 ? "text-amber-500" : "text-gray-500"
                  )} />
                  <p className="text-2xl font-bold">
                    {productRank} من أصل {products.length}
                  </p>
                </div>
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
    </PageContainer>
  );
};

export default ProductDetails;
