
import { useState } from 'react';
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
import { invoices, customers, products } from '@/lib/data';
import { ProductCategory } from '@/lib/types';

const PointsAnalytics = () => {
  const [timeRange, setTimeRange] = useState('all');
  
  // Points earned vs redeemed overall
  const totalPointsEarned = invoices.reduce((sum, invoice) => sum + invoice.pointsEarned, 0);
  const totalPointsRedeemed = invoices.reduce((sum, invoice) => sum + invoice.pointsRedeemed, 0);
  const currentPoints = totalPointsEarned - totalPointsRedeemed;
  
  const pointsOverviewData = [
    { name: 'النقاط المكتسبة', value: totalPointsEarned },
    { name: 'النقاط المستبدلة', value: totalPointsRedeemed },
    { name: 'الرصيد الحالي', value: currentPoints }
  ];
  
  // Points by product category
  const pointsByCategoryData = Object.values(ProductCategory).map(category => {
    const categoryProducts = products.filter(product => product.category === category);
    const categoryPointsEarned = invoices.reduce((sum, invoice) => {
      const categoryItems = invoice.items.filter(item => 
        categoryProducts.some(product => product.id === item.productId)
      );
      
      if (categoryItems.length > 0) {
        const itemsPoints = categoryItems.reduce((itemSum, item) => {
          const product = products.find(p => p.id === item.productId);
          return itemSum + (product?.pointsEarned || 0) * item.quantity;
        }, 0);
        
        // Apply the points multiplier based on categories in the invoice
        const multiplier = getPointsMultiplier(invoice.categoriesCount);
        return sum + (itemsPoints * multiplier);
      }
      
      return sum;
    }, 0);
    
    return {
      name: category,
      points: Math.round(categoryPointsEarned)
    };
  });
  
  // Function to get points multiplier based on number of categories
  function getPointsMultiplier(categoriesCount: number): number {
    switch (categoriesCount) {
      case 1: return 0.25;
      case 2: return 0.5;
      case 3: return 0.75;
      case 4: case 5: return 1;
      default: return 0;
    }
  }
  
  // Define colors for pie chart
  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];
  
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
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">الفئة:</div>
                                <div>{payload[0].payload.name}</div>
                                <div className="font-medium">القيمة:</div>
                                <div>{payload[0].value.toLocaleString('ar-EG')} نقطة</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
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
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pointsByCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="points" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PointsAnalytics;
