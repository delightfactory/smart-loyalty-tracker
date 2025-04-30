
import { useState, useMemo } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  Tooltip 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ProductCategory } from '@/lib/types';

interface PointsAnalyticsProps {
  invoices: any[];
  customers: any[];
  products: any[];
  isLoading: boolean;
}

const PointsAnalytics = ({ invoices, customers, products, isLoading }: PointsAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('all');
  
  // Filter invoices based on time range
  const filteredInvoices = useMemo(() => {
    if (isLoading || !invoices.length) return [];
    
    const now = new Date();
    
    if (timeRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return invoices.filter(inv => new Date(inv.date) >= monthAgo);
    }
    
    if (timeRange === 'quarter') {
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      return invoices.filter(inv => new Date(inv.date) >= quarterAgo);
    }
    
    if (timeRange === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return invoices.filter(inv => new Date(inv.date) >= yearAgo);
    }
    
    return invoices;
  }, [invoices, timeRange, isLoading]);
  
  // Points earned vs redeemed overall
  const pointsOverview = useMemo(() => {
    if (isLoading || !filteredInvoices.length) {
      return {
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        currentPoints: 0
      };
    }
    
    const totalPointsEarned = filteredInvoices.reduce((sum, invoice) => sum + (invoice.pointsEarned || 0), 0);
    const totalPointsRedeemed = filteredInvoices.reduce((sum, invoice) => sum + (invoice.pointsRedeemed || 0), 0);
    const currentPoints = totalPointsEarned - totalPointsRedeemed;
    
    return { totalPointsEarned, totalPointsRedeemed, currentPoints };
  }, [filteredInvoices, isLoading]);
  
  // Points overview data for chart
  const pointsOverviewData = useMemo(() => {
    return [
      { name: 'النقاط المكتسبة', value: pointsOverview.totalPointsEarned },
      { name: 'النقاط المستبدلة', value: pointsOverview.totalPointsRedeemed },
      { name: 'الرصيد الحالي', value: pointsOverview.currentPoints }
    ].filter(item => item.value > 0);
  }, [pointsOverview]);
  
  // Points by product category
  const pointsByCategoryData = useMemo(() => {
    if (isLoading || !filteredInvoices.length || !products.length) return [];
    
    const categoryPoints: Record<string, number> = {};
    
    // Initialize all categories with zero
    Object.values(ProductCategory).forEach(category => {
      categoryPoints[category] = 0;
    });
    
    // Calculate points per category
    filteredInvoices.forEach(invoice => {
      if (!invoice.items || !Array.isArray(invoice.items)) return;
      
      invoice.items.forEach((item: any) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          categoryPoints[product.category] = (categoryPoints[product.category] || 0) + 
            ((product.pointsEarned || 0) * item.quantity);
        }
      });
    });
    
    // Convert to array for the chart and filter out zero values
    return Object.entries(categoryPoints)
      .filter(([_, value]) => value > 0)
      .map(([category, points]) => ({
        name: category,
        points: Math.round(points)
      }));
  }, [filteredInvoices, products, isLoading]);
  
  // Define colors for pie chart
  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">جاري تحميل البيانات...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="الفترة الزمنية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفترات</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
            <SelectItem value="quarter">آخر ربع سنة</SelectItem>
            <SelectItem value="year">آخر سنة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ملخص النقاط</CardTitle>
            <CardDescription>توزيع النقاط المكتسبة والمستبدلة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {pointsOverviewData.length > 0 ? (
                <ChartContainer
                  config={{
                    earned: {
                      label: "النقاط المكتسبة",
                      color: "#10B981"
                    },
                    redeemed: {
                      label: "النقاط المستبدلة",
                      color: "#F59E0B"
                    },
                    current: {
                      label: "الرصيد الحالي",
                      color: "#3B82F6"
                    }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pointsOverviewData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pointsOverviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toLocaleString('ar-EG')} نقطة`, 'القيمة']} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>النقاط حسب أقسام المنتجات</CardTitle>
            <CardDescription>توزيع النقاط المكتسبة على أقسام المنتجات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {pointsByCategoryData.length > 0 ? (
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pointsByCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value.toLocaleString('ar-EG')} نقطة`, 'عدد النقاط']} />
                      <Legend />
                      <Bar dataKey="points" name="النقاط" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">لا توجد بيانات كافية للعرض</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PointsAnalytics;
