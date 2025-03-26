
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  FileText, 
  User, 
  Phone, 
  Building, 
  Star, 
  Award, 
  CreditCard, 
  TrendingUp,
  ChevronLeft,
  Edit,
  ShoppingCart
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { 
  Customer, 
  Invoice, 
  ProductCategory, 
  InvoiceStatus 
} from '@/lib/types';
import { 
  getCustomerById, 
  getInvoicesByCustomerId, 
  getProductById 
} from '@/lib/data';
import { calculateCategoryDistribution, getOnTimePaymentRate } from '@/lib/calculations';
import { cn } from '@/lib/utils';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<Record<ProductCategory, number>>({} as Record<ProductCategory, number>);
  const [onTimePaymentRate, setOnTimePaymentRate] = useState<number>(0);
  
  useEffect(() => {
    if (id) {
      const foundCustomer = getCustomerById(id);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        
        // Get customer invoices
        const customerInvoices = getInvoicesByCustomerId(id);
        setInvoices(customerInvoices);
        
        // Calculate category distribution
        const distribution = calculateCategoryDistribution(id);
        setCategoryDistribution(distribution);
        
        // Calculate on-time payment rate
        const paymentRate = getOnTimePaymentRate(id);
        setOnTimePaymentRate(paymentRate);
      }
    }
  }, [id]);
  
  if (!customer) {
    return (
      <PageContainer title="تحميل..." subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">جاري تحميل بيانات العميل...</p>
          </div>
        </div>
      </PageContainer>
    );
  }
  
  // Format category distribution data for pie chart
  const categoryData = Object.entries(categoryDistribution)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value
    }));
  
  // Format monthly purchase data
  const monthlyPurchaseData = [
    { name: 'يناير', amount: 1200 },
    { name: 'فبراير', amount: 1800 },
    { name: 'مارس', amount: 1400 },
    { name: 'أبريل', amount: 2200 },
    { name: 'مايو', amount: 1900 },
    { name: 'يونيو', amount: 2500 }
  ];
  
  const getClassificationDisplay = (classification: number) => {
    const stars = Array(classification).fill('★').join('');
    const emptyStars = Array(5 - classification).fill('☆').join('');
    return stars + emptyStars;
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG');
  };
  
  return (
    <PageContainer title={customer.name} subtitle={`بيانات وتحليلات العميل`}>
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          العودة للعملاء
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>معلومات العميل</CardTitle>
            <CardDescription>البيانات الأساسية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">اسم المسؤول</p>
                    <p className="font-medium">{customer.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium" dir="ltr">{customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">نوع النشاط</p>
                    <p className="font-medium">{customer.businessType}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">التصنيف</p>
                    <p className="font-medium text-amber-500">
                      {getClassificationDisplay(customer.classification)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">المستوى</p>
                    <p className="font-medium">المستوى {customer.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">رصيد الآجل</p>
                    <p className="font-medium">{formatCurrency(customer.creditBalance)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>نقاط الولاء</CardTitle>
            <CardDescription>رصيد النقاط والاستبدال</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">النقاط المكتسبة</p>
                <div className="flex items-center">
                  <div className="h-2 bg-blue-100 rounded-full w-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${(customer.pointsEarned > 0 ? customer.pointsEarned / (customer.pointsEarned + customer.pointsRedeemed) : 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{customer.pointsEarned}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">النقاط المستبدلة</p>
                <div className="flex items-center">
                  <div className="h-2 bg-green-100 rounded-full w-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${(customer.pointsRedeemed > 0 ? customer.pointsRedeemed / (customer.pointsEarned + customer.pointsRedeemed) : 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{customer.pointsRedeemed}</span>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t">
                <p className="text-base font-medium">الرصيد الحالي</p>
                <div className="flex items-center mt-2">
                  <Star className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-2xl font-bold">{customer.currentPoints}</span>
                  <span className="text-sm text-muted-foreground ml-2">نقطة</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="purchases" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="purchases">المشتريات</TabsTrigger>
          <TabsTrigger value="analysis">التحليلات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="purchases">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>سجل المشتريات</CardTitle>
                <CardDescription>جميع فواتير الشراء</CardDescription>
              </div>
              <Button onClick={() => navigate(`/create-invoice/${customer.id}`)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                فاتورة جديدة
              </Button>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الفاتورة</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>القيمة</TableHead>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>النقاط المكتسبة</TableHead>
                      <TableHead>المنتجات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            invoice.status === InvoiceStatus.PAID ? "bg-green-100 text-green-800" :
                            invoice.status === InvoiceStatus.OVERDUE ? "bg-red-100 text-red-800" :
                            "bg-amber-100 text-amber-800"
                          )}>
                            {invoice.status}
                          </span>
                        </TableCell>
                        <TableCell>{invoice.pointsEarned}</TableCell>
                        <TableCell>{invoice.items.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>لا توجد فواتير لهذا العميل</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate(`/create-invoice/${customer.id}`)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    إنشاء فاتورة جديدة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المشتريات حسب الأقسام</CardTitle>
                <CardDescription>النسبة المئوية للإنفاق في كل قسم</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'النسبة المئوية']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>تطور المشتريات الشهرية</CardTitle>
                <CardDescription>قيمة المشتريات على مدار الأشهر</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPurchaseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'قيمة المشتريات']} />
                    <Legend />
                    <Bar dataKey="amount" name="قيمة المشتريات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>معدل الالتزام بالسداد</CardTitle>
                <CardDescription>نسبة السداد في الوقت المحدد</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative h-40 w-40">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle
                        className="text-muted stroke-current"
                        strokeWidth="10"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className={cn(
                          "stroke-current",
                          onTimePaymentRate >= 75 ? "text-green-500" :
                          onTimePaymentRate >= 50 ? "text-amber-500" : "text-red-500"
                        )}
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${onTimePaymentRate * 2.51} 251`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold">{onTimePaymentRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  <p className="mt-4 text-center text-muted-foreground">
                    {onTimePaymentRate >= 75 ? "معدل التزام ممتاز بالسداد" :
                     onTimePaymentRate >= 50 ? "معدل التزام متوسط بالسداد" : "معدل التزام ضعيف بالسداد"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default CustomerDetails;
