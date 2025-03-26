
import { useState } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { products, invoices, getProductById } from '@/lib/data';
import { ProductCategory } from '@/lib/types';

const ProductAnalytics = () => {
  const [timeRange, setTimeRange] = useState('all');
  
  // Get product sales data
  const productSalesData = products.map(product => {
    const productSales = invoices.reduce((total, invoice) => {
      const item = invoice.items.find(item => item.productId === product.id);
      return total + (item ? item.quantity : 0);
    }, 0);
    
    return {
      id: product.id,
      name: product.name,
      sales: productSales,
      category: product.category
    };
  }).sort((a, b) => b.sales - a.sales);
  
  // Top 5 products by sales
  const topProducts = productSalesData.slice(0, 5);
  
  // Category distribution
  const categoryData = Object.values(ProductCategory).map(category => {
    const categoryProducts = products.filter(product => product.category === category);
    const categorySales = productSalesData
      .filter(product => categoryProducts.some(p => p.id === product.id))
      .reduce((sum, product) => sum + product.sales, 0);
    
    return {
      name: category,
      value: categorySales
    };
  });
  
  // Define colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
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
            <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
            <CardDescription>ترتيب المنتجات حسب عدد الوحدات المباعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  sales: {
                    label: "المبيعات",
                    color: "#8B5CF6"
                  }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">المنتج:</div>
                                <div>{payload[0].payload.name}</div>
                                <div className="font-medium">المبيعات:</div>
                                <div>{payload[0].value} وحدة</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="sales" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>توزيع المبيعات حسب الأقسام</CardTitle>
            <CardDescription>نسبة المبيعات لكل قسم من منتجات العناية بالسيارات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={
                  Object.values(ProductCategory).reduce((acc, category, index) => {
                    acc[category] = {
                      label: category,
                      color: COLORS[index % COLORS.length]
                    };
                    return acc;
                  }, {} as any)
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductAnalytics;
