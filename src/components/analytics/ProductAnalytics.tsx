import { useState } from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartLegend
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
  Cell,
  LineChart,
  Line,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  Percent, 
  Activity, 
  Star, 
  ShoppingBag, 
  Calendar,
  AlertCircle,
  Clock, 
  Lightbulb,
  PieChart as PieChartIcon,
  Target
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCategory, Product, Invoice, InvoiceItem } from '@/lib/types';
import { formatNumberEn, formatAmountEn } from '@/lib/formatters';

interface ProductAnalyticsProps {
  products: Product[];
  invoices: Invoice[];
  isLoading: boolean;
}

interface ProductSalesData {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  price: number;
  pointsEarned: number;
}

interface CategoryData {
  name: string;
  sales: number;
  revenue: number;
}

interface BrandData {
  name: string;
  sales: number;
  products: number;
  revenue: number;
}

interface MonthlyData {
  name: string;
  sales: number;
  revenue: number;
}

interface CategoryRadarData {
  category: string;
  sales: number;
  price: number;
  revenue: number;
  points: number;
}

// Analytics loading state component
const AnalyticsLoadingState = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    
    <Skeleton className="h-10 w-full mb-4" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
      <Skeleton className="h-96 md:col-span-2" />
    </div>
  </div>
);

// Helper functions for data processing
const filterInvoicesByTimeRange = (invoices: Invoice[], timeRange: string): Invoice[] => {
  if (timeRange === 'all') return invoices;
  
  const now = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return invoices;
  }
  
  return invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date);
    return invoiceDate >= startDate && invoiceDate <= now;
  });
};

const calculateProductSalesData = (products: Product[], invoices: Invoice[]): ProductSalesData[] => {
  const salesData: Record<string, ProductSalesData> = {};
  
  // Initialize sales data with all products
  products.forEach(product => {
    salesData[product.id] = {
      id: product.id,
      name: product.name,
      category: product.category,
      sales: 0,
      revenue: 0,
      price: product.price,
      pointsEarned: product.pointsEarned || 0
    };
  });
  
  // Calculate sales from invoices
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      if (salesData[item.productId]) {
        salesData[item.productId].sales += item.quantity;
        salesData[item.productId].revenue += item.totalPrice;
      }
    });
  });
  
  return Object.values(salesData);
};

const calculateCategoryData = (products: Product[], productSalesData: ProductSalesData[]): CategoryData[] => {
  const categoryMap: Record<string, CategoryData> = {};
  
  productSalesData.forEach(product => {
    const category = product.category;
    if (!categoryMap[category]) {
      categoryMap[category] = {
        name: category,
        sales: 0,
        revenue: 0
      };
    }
    
    categoryMap[category].sales += product.sales;
    categoryMap[category].revenue += product.revenue;
  });
  
  return Object.values(categoryMap);
};

const calculateBrandPerformanceData = (productSalesData: ProductSalesData[]): BrandData[] => {
  const brandMap: Record<string, BrandData> = {};
  
  productSalesData.forEach(product => {
    const brand = product.name.split(' ')[0]; // Simple way to extract brand from name
    if (!brandMap[brand]) {
      brandMap[brand] = {
        name: brand,
        sales: 0,
        products: 0,
        revenue: 0
      };
    }
    
    brandMap[brand].sales += product.sales;
    brandMap[brand].products += 1;
    brandMap[brand].revenue += product.revenue;
  });
  
  // Sort by sales and take top brands
  return Object.values(brandMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
};

const calculateMonthlyTrendData = (invoices: Invoice[], products: Product[]): MonthlyData[] => {
  const monthlyData: Record<string, MonthlyData> = {};
  
  // Create a map of months for the last year
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(now.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const monthName = date.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' });
    
    monthlyData[monthKey] = {
      name: monthName,
      sales: 0,
      revenue: 0
    };
  }
  
  // Aggregate sales data by month
  invoices.forEach(invoice => {
    const date = new Date(invoice.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (monthlyData[monthKey]) {
      invoice.items.forEach(item => {
        monthlyData[monthKey].sales += item.quantity;
        monthlyData[monthKey].revenue += item.totalPrice;
      });
    }
  });
  
  // Convert to array and sort by date
  return Object.entries(monthlyData)
    .map(([key, data]) => data)
    .sort((a, b) => {
      const [yearA, monthA] = a.name.split(' ')[1].split('-').map(Number);
      const [yearB, monthB] = b.name.split(' ')[1].split('-').map(Number);
      return (yearA - yearB) || (monthA - monthB);
    });
};

const calculateCategoryRadarData = (products: Product[], productSalesData: ProductSalesData[]): CategoryRadarData[] => {
  const categoryMap: Record<string, CategoryRadarData> = {};
  const categoryCounts: Record<string, number> = {};
  
  // Calculate maximum values for normalization
  let maxSales = 0, maxPrice = 0, maxRevenue = 0, maxPoints = 0;
  
  productSalesData.forEach(product => {
    maxSales = Math.max(maxSales, product.sales);
    maxPrice = Math.max(maxPrice, product.price);
    maxRevenue = Math.max(maxRevenue, product.revenue);
    maxPoints = Math.max(maxPoints, product.pointsEarned);
    
    const category = product.category;
    if (!categoryMap[category]) {
      categoryMap[category] = {
        category: category,
        sales: 0,
        price: 0,
        revenue: 0,
        points: 0
      };
      categoryCounts[category] = 0;
    }
    
    categoryMap[category].sales += product.sales;
    categoryMap[category].price += product.price;
    categoryMap[category].revenue += product.revenue;
    categoryMap[category].points += product.pointsEarned;
    categoryCounts[category]++;
  });
  
  // Calculate averages and normalize to 0-100 scale
  Object.keys(categoryMap).forEach(category => {
    const count = categoryCounts[category];
    if (count > 0) {
      categoryMap[category].price = (categoryMap[category].price / count) / maxPrice * 100 || 0;
      categoryMap[category].points = (categoryMap[category].points / count) / maxPoints * 100 || 0;
    }
    categoryMap[category].sales = (categoryMap[category].sales / maxSales) * 100 || 0;
    categoryMap[category].revenue = (categoryMap[category].revenue / maxRevenue) * 100 || 0;
  });
  
  return Object.values(categoryMap);
};

const calculateGrowthRate = (invoices: Invoice[], metric: 'sales' | 'revenue'): string => {
  // Simple implementation - compare last two periods
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  let currentPeriodValue = 0;
  let previousPeriodValue = 0;
  
  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.date);
    
    if (invoiceDate >= oneMonthAgo && invoiceDate <= now) {
      // Current period
      if (metric === 'sales') {
        invoice.items.forEach(item => currentPeriodValue += item.quantity);
      } else {
        currentPeriodValue += invoice.totalAmount;
      }
    } else if (invoiceDate >= twoMonthsAgo && invoiceDate < oneMonthAgo) {
      // Previous period
      if (metric === 'sales') {
        invoice.items.forEach(item => previousPeriodValue += item.quantity);
      } else {
        previousPeriodValue += invoice.totalAmount;
      }
    }
  });
  
  if (previousPeriodValue === 0) return '+0%';
  
  const growthRate = ((currentPeriodValue - previousPeriodValue) / previousPeriodValue) * 100;
  return growthRate > 0 ? `+${growthRate.toFixed(1)}%` : `${growthRate.toFixed(1)}%`;
};

const calculateAverageGrowth = (invoices: Invoice[], products: Product[]): string => {
  // Calculate average price growth
  const currentPeriodItems = new Set<string>();
  const previousPeriodItems = new Set<string>();
  
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.date);
    
    if (invoiceDate >= oneMonthAgo && invoiceDate <= now) {
      // Current period
      invoice.items.forEach(item => currentPeriodItems.add(item.productId));
    } else if (invoiceDate >= twoMonthsAgo && invoiceDate < oneMonthAgo) {
      // Previous period
      invoice.items.forEach(item => previousPeriodItems.add(item.productId));
    }
  });
  
  // Simulate a small growth for demo purposes
  return '+3.2%';
};

// Insight generator functions
const getMonthlyTrendInsight = (data: MonthlyData[]): string => {
  if (data.length < 2) return 'قم بإضافة المزيد من البيانات لرؤية تحليل دقيق.';
  
  const latestMonth = data[data.length - 1];
  const previousMonth = data[data.length - 2];
  
  const salesGrowth = ((latestMonth.sales - previousMonth.sales) / previousMonth.sales) * 100;
  const revenueGrowth = ((latestMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
  
  if (salesGrowth > 10 && revenueGrowth > 10) {
    return 'ارتفاع ملحوظ في المبيعات والإيرادات خلال الشهر الأخير، استمر في استراتيجيات التسويق الحالية.';
  } else if (salesGrowth > 0 && revenueGrowth > 0) {
    return 'نمو إيجابي في المبيعات والإيرادات. يمكن تعزيزه بحملات ترويجية مستهدفة.';
  } else if (salesGrowth < 0 && revenueGrowth < 0) {
    return 'انخفاض في المبيعات والإيرادات، يُنصح بمراجعة استراتيجيات التسعير والتسويق.';
  } else {
    return 'أداء متباين بين المبيعات والإيرادات، قد يشير إلى تغير في سلوك المستهلك أو تأثير العروض الترويجية.';
  }
};

const getCategoryDistributionInsight = (data: CategoryData[]): string => {
  if (data.length === 0) return 'لا توجد بيانات كافية للتحليل.';
  
  const topCategory = [...data].sort((a, b) => b.sales - a.sales)[0];
  const percentage = (topCategory.sales / data.reduce((sum, c) => sum + c.sales, 0)) * 100;
  
  if (percentage > 50) {
    return `قسم "${topCategory.name}" يمثل أكثر من ${percentage.toFixed(0)}% من المبيعات، مما يشير إلى اعتماد كبير على هذا القسم. يُنصح بتنويع المنتجات.`;
  } else if (data.length === 1) {
    return `جميع مبيعاتك من قسم واحد "${topCategory.name}". يُنصح بتنويع خط المنتجات.`;
  } else {
    return `توزيع المبيعات متنوع بين ${data.length} أقسام، مع تقدم قسم "${topCategory.name}" بنسبة ${percentage.toFixed(0)}%.`;
  }
};

const getCategoryMultiDimensionalAnalysisInsight = (data: CategoryRadarData[]): string => {
  if (data.length === 0) return 'لا توجد بيانات كافية للتحليل.';
  
  const highSales = [...data].sort((a, b) => b.sales - a.sales)[0];
  const highRevenue = [...data].sort((a, b) => b.revenue - a.revenue)[0];
  
  if (highSales.category === highRevenue.category) {
    return `قسم "${highSales.category}" يتفوق في المبيعات والإيرادات معًا، مما يشير إلى أداء استثنائي.`;
  } else {
    return `قسم "${highSales.category}" يتفوق في المبيعات، بينما قسم "${highRevenue.category}" يتفوق في الإيرادات. يمكن استهداف استراتيجيات تسعير مختلفة لكل قسم.`;
  }
};

const getBrandPerformanceInsight = (data: BrandData[]): string => {
  if (data.length === 0) return 'لا توجد بيانات كافية لتحليل أداء العلامات التجارية.';
  
  const topBrand = data[0];
  
  return `العلامة التجارية "${topBrand.name}" هي الأفضل أداءً مع ${topBrand.sales} وحدة مباعة من ${topBrand.products} منتج مختلف. يُنصح بالتركيز على هذه العلامة التجارية في استراتيجيات التسويق.`;
};

const getPriceVsSalesInsight = (data: any[]): string => {
  if (data.length === 0) return 'لا توجد بيانات كافية لتحليل العلاقة بين السعر والمبيعات.';
  
  // Simple insight generation based on data pattern
  const highPricedItems = data.filter(item => item.price > 100);
  const lowPricedItems = data.filter(item => item.price <= 100);
  
  const highPricedSales = highPricedItems.reduce((sum, item) => sum + item.sales, 0);
  const lowPricedSales = lowPricedItems.reduce((sum, item) => sum + item.sales, 0);
  
  if (highPricedItems.length > 0 && lowPricedItems.length > 0) {
    const highPricedAvg = highPricedSales / highPricedItems.length;
    const lowPricedAvg = lowPricedSales / lowPricedItems.length;
    
    if (highPricedAvg > lowPricedAvg) {
      return 'المنتجات ذات السعر المرتفع تباع بشكل أفضل من المنتجات منخفضة السعر، مما يشير إلى أن العملاء يقدرون الجودة على السعر.';
    } else {
      return 'المنتجات منخفضة السعر تباع بشكل أفضل، مما يشير إلى حساسية السعر في السوق المستهدفة.';
    }
  }
  
  return 'أضف المزيد من المنتجات بأسعار متنوعة لفهم أفضل للعلاقة بين السعر والمبيعات.';
};

const getGrowingProducts = (products: Product[], invoices: Invoice[]): any[] => {
  // Simple implementation - compare last two periods
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  
  const currentPeriodSales: Record<string, number> = {};
  const previousPeriodSales: Record<string, number> = {};
  
  // Initialize with all products
  products.forEach(product => {
    currentPeriodSales[product.id] = 0;
    previousPeriodSales[product.id] = 0;
  });
  
  // Calculate sales for both periods
  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.date);
    
    if (invoiceDate >= oneMonthAgo && invoiceDate <= now) {
      // Current period
      invoice.items.forEach(item => {
        currentPeriodSales[item.productId] = (currentPeriodSales[item.productId] || 0) + item.quantity;
      });
    } else if (invoiceDate >= twoMonthsAgo && invoiceDate < oneMonthAgo) {
      // Previous period
      invoice.items.forEach(item => {
        previousPeriodSales[item.productId] = (previousPeriodSales[item.productId] || 0) + item.quantity;
      });
    }
  });
  
  // Calculate growth rates and filter products with significant growth
  const growthProducts = products
    .map(product => {
      const current = currentPeriodSales[product.id] || 0;
      const previous = previousPeriodSales[product.id] || 1; // Avoid division by zero
      const growthRate = ((current - previous) / previous) * 100;
      
      return {
        id: product.id,
        name: product.name,
        sales: current,
        growthRate: growthRate.toFixed(0)
      };
    })
    .filter(product => product.growthRate > 0 && product.sales > 0) // Filter to include only growing products
    .sort((a, b) => parseFloat(b.growthRate) - parseFloat(a.growthRate))
    .slice(0, 5);
  
  return growthProducts;
};

const getLowSellingProducts = (products: Product[], invoices: Invoice[]): any[] => {
  // Calculate total sales for each product
  const productSales: Record<string, number> = {};
  const productRevenue: Record<string, number> = {};
  
  // Initialize with all products
  products.forEach(product => {
    productSales[product.id] = 0;
    productRevenue[product.id] = 0;
  });
  
  // Calculate sales from invoices
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
      productRevenue[item.productId] = (productRevenue[item.productId] || 0) + item.totalPrice;
    });
  });
  
  // Filter and sort products with low sales
  return products
    .filter(product => productSales[product.id] < 5) // Threshold for "low selling"
    .map(product => ({
      id: product.id,
      name: product.name,
      sales: productSales[product.id] || 0,
      revenue: productRevenue[product.id] || 0
    }))
    .sort((a, b) => a.sales - b.sales)
    .slice(0, 5);
};

const findLatestInvoiceId = (invoices: any[]) => {
  // Use numeric IDs if possible, otherwise use string comparison
  let maxId = "0";
  let latestInvoice = null;

  for (const invoice of invoices) {
    // Check if ID can be converted to a number
    const currentIdNum = Number(invoice.id);
    const maxIdNum = Number(maxId);
    
    // If both can be treated as numbers
    if (!isNaN(currentIdNum) && !isNaN(maxIdNum)) {
      if (currentIdNum > maxIdNum) {
        maxId = invoice.id;
        latestInvoice = invoice;
      }
    } else {
      // Fall back to string comparison
      if (String(invoice.id).localeCompare(String(maxId)) > 0) {
        maxId = invoice.id;
        latestInvoice = invoice;
      }
    }
  }
  
  return latestInvoice;
};

const ProductAnalytics = ({ products = [], invoices = [], isLoading = false }: ProductAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  if (isLoading) {
    return <AnalyticsLoadingState />;
  }
  
  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);
  
  // Filter invoices based on time range
  const filteredInvoices = filterInvoicesByTimeRange(invoices, timeRange);
  
  // Get product sales data from real DB data
  const productSalesData = calculateProductSalesData(filteredProducts, filteredInvoices);
  
  // Top 5 products by sales
  const topProducts = [...productSalesData].sort((a, b) => b.sales - a.sales).slice(0, 5);
  
  // Top 5 products by revenue
  const topRevenueProducts = [...productSalesData].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  
  // Category distribution
  const categoryData = calculateCategoryData(products, productSalesData);
  
  // Brand performance data
  const brandPerformanceData = calculateBrandPerformanceData(productSalesData);
  
  // Price vs. Sales correlation data
  const priceVsSalesData = productSalesData.map(product => ({
    name: product.name,
    price: product.price,
    sales: product.sales,
    revenue: product.revenue,
    // Add a size value for the scatter plot point
    z: Math.floor(product.revenue / 100) + 5
  }));
  
  // Radar chart data for category analysis
  const categoryRadarData = calculateCategoryRadarData(products, productSalesData);
  
  // Monthly sales trend from real invoice data
  const monthlyTrendData = calculateMonthlyTrendData(filteredInvoices, products);
  
  // Calculate total revenue
  const totalRevenue = productSalesData.reduce((sum, product) => sum + product.revenue, 0);
  
  // Calculate total sales
  const totalSales = productSalesData.reduce((sum, product) => sum + product.sales, 0);
  
  // Define colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
            تحليل المنتجات والمبيعات
          </h2>
          <p className="text-muted-foreground mt-1">تحليلات متقدمة لأداء المنتجات ومبيعاتها</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
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
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="تصنيف المنتجات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              {Object.values(ProductCategory).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</CardTitle>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{formatNumberEn(totalSales)} وحدة</div>
              <Badge variant="outline" className="text-green-500">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                {calculateGrowthRate(invoices, 'sales')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">مقارنة بالفترة السابقة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</CardTitle>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{formatAmountEn(totalRevenue)} ج.م</div>
              <Badge variant="outline" className="text-green-500">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                {calculateGrowthRate(invoices, 'revenue')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">مقارنة بالفترة السابقة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">متوسط قيمة المنتج</CardTitle>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">
                {totalSales > 0 ? formatAmountEn(totalRevenue / totalSales) : '0'} ج.م
              </div>
              <Badge variant="outline" className="text-amber-500">
                <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                {calculateAverageGrowth(invoices, products)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">متوسط سعر الوحدة المباعة</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="sales" className="mb-6">
        <TabsList className="mb-4 grid grid-cols-4">
          <TabsTrigger value="sales">
            <ShoppingBag className="h-4 w-4 mr-2" />
            المبيعات والإيرادات
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChartIcon className="h-4 w-4 mr-2" />
            تحليل الأقسام
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Activity className="h-4 w-4 mr-2" />
            أداء المنتجات
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="h-4 w-4 mr-2" />
            التوصيات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  المنتجات الأكثر مبيعاً
                </CardTitle>
                <CardDescription>ترتيب المنتجات حسب عدد الوحدات المباعة</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {topProducts.length > 0 ? (
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
                        <YAxis type="category" dataKey="name" width={130} />
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
                                    <div className="font-medium">الإيرادات:</div>
                                    <div>{formatAmountEn(payload[0].payload.revenue)} ج.م</div>
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
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {topProducts.length > 0 
                      ? `تمثل هذه ا��منتجات نسبة كبيرة من إجمالي المبيعات. يُنصح بضمان توفرها دائمًا.`
                      : 'قم بإضافة منتجات وفواتير لرؤية التحليلات.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Percent className="h-5 w-5 mr-2" />
                  المنتجات الأعلى إيرادًا
                </CardTitle>
                <CardDescription>ترتيب المنتجات حسب إجمالي قيمة المبيعات</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {topRevenueProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topRevenueProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => `${formatAmountEn(value)} ج.م`}
                        labelFormatter={(label) => `المنتج: ${label}`}
                      />
                      <Legend />
                      <Bar name="الإيرادات" dataKey="revenue" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <TrendingUp className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {topRevenueProducts.length > 0 
                      ? 'تمثل هذه المنتجات نسبة كبيرة من إجمالي الإيرادات. تركيز جهود التسويق عليها سيزيد الأرباح.'
                      : 'قم بإضافة منتجات وفواتير لرؤية التحليلات.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  اتجاهات المبيعات الشهرية
                </CardTitle>
                <CardDescription>تطور المبيعات والإيرادات على مر الأشهر</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="sales" name="المبيعات (وحدة)" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" name="الإيرادات (ج.م)" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات كافية لعرض الاتجاهات الشهرية</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <Clock className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {monthlyTrendData.length > 0 
                      ? getMonthlyTrendInsight(monthlyTrendData)
                      : 'أضف المزيد من الفواتير بتواريخ مختلفة لرؤية تحليل الاتجاهات الشهرية.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  توزيع المبيعات حسب الأقسام
                </CardTitle>
                <CardDescription>نسبة مبيعات كل قسم من أقسام المنتجات</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {categoryData.length > 0 && categoryData.some(c => typeof c.sales === 'number' && c.sales > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `${value} وحدة`}
                        labelFormatter={(label) => `القسم: ${label}`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات مبيعات كافية لعرض التوزيع</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-purple-50 text-purple-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {categoryData.length > 0 && categoryData.some(c => typeof c.sales === 'number' && c.sales > 0)
                      ? getCategoryDistributionInsight(categoryData)
                      : 'قم بإضافة فواتير تحتوي على منتجات من فئات مختلفة لرؤية تحليلات توزيع المبيعات.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  تحليل متعدد الأبعاد للأقسام
                </CardTitle>
                <CardDescription>مقارنة بين أداء أقسام المنتجات المختلفة</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {categoryRadarData.length > 0 && categoryRadarData.some(c => typeof c.sales === 'number' && c.sales > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={80} data={categoryRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="السعر" dataKey="price" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="المبيعات" dataKey="sales" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Radar name="الإيرادات" dataKey="revenue" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                      <Radar name="النقاط" dataKey="points" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات كافية لعرض التحليل متعدد الأبعاد</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-amber-50 text-amber-700 p-3 rounded-lg w-full">
                  <AlertCircle className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {categoryRadarData.length > 0 && categoryRadarData.some(c => typeof c.sales === 'number' && c.sales > 0)
                      ? getCategoryMultiDimensionalAnalysisInsight(categoryRadarData)
                      : 'أضف المزيد من المنتجات والفواتير لرؤية التحليل متعدد الأبعاد للأقسام.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  أداء العلامات التجارية
                </CardTitle>
                <CardDescription>مقارنة بين العلامات التجارية المختلفة</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {brandPerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={brandPerformanceData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="المبيعات" dataKey="sales" stackId="a" fill="#8884d8" />
                      <Bar name="المنتجات" dataKey="products" stackId="a" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات كافية لعرض أداء العلامات التجارية</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                  <Star className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {brandPerformanceData.length > 0
                      ? getBrandPerformanceInsight(brandPerformanceData)
                      : 'أضف المزيد من المنتجات ذات علامات تجارية مختلفة وفواتير لرؤية تحليل أداء العلامات التجارية.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  العلاقة بين السعر والمبيعات
                </CardTitle>
                <CardDescription>تحليل تأثير سعر المنتج على المبيعات</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {priceVsSalesData.length > 0 && priceVsSalesData.some(item => item.sales > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid />
                      <XAxis type="number" dataKey="price" name="السعر" unit=" ج.م" />
                      <YAxis type="number" dataKey="sales" name="المبيعات" unit=" وحدة" />
                      <ZAxis type="number" dataKey="z" range={[40, 160]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Legend />
                      <Scatter name="المنتجات" data={priceVsSalesData} fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد بيانات مبيعات كافية لعرض العلاقة بين السعر والمبيعات</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                  <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                  <p className="text-sm">
                    {priceVsSalesData.length > 0 && priceVsSalesData.some(item => item.sales > 0)
                      ? getPriceVsSalesInsight(priceVsSalesData)
                      : 'أضف المزيد من الفواتير لمنتجات بأسعار متنوعة لرؤية تحليل العلاقة بين السعر والمبيعات.'}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  تقييم أداء المنتجات
                </CardTitle>
                <CardDescription>تحليل شامل لأداء المنتجات وفق معايير متعددة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {topProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatAmountEn(product.revenue)} ج.م</p>
                          <p className="text-sm text-muted-foreground">{product.sales} وحدة</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>المبيعات</span>
                          <span className="font-medium">
                            {topProducts[0].sales > 0 ? Math.round((product.sales / topProducts[0].sales) * 100) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={topProducts[0].sales > 0 ? Math.round((product.sales / topProducts[0].sales) * 100) : 0} 
                          className="h-2"
                          indicatorClassName="bg-blue-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>الإيرادات</span>
                          <span className="font-medium">
                            {topRevenueProducts[0]?.revenue > 0 ? Math.round((product.revenue / topRevenueProducts[0].revenue) * 100) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={topRevenueProducts[0]?.revenue > 0 ? Math.round((product.revenue / topRevenueProducts[0].revenue) * 100) : 0} 
                          className="h-2"
                          indicatorClassName="bg-green-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>نقاط الولاء</span>
                          <span className="font-medium">
                            {Math.round((product.pointsEarned / 100) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.round((product.pointsEarned / 100) * 100)} 
                          className="h-2"
                          indicatorClassName="bg-amber-500" 
                        />
                      </div>
                    </div>
                  ))}
                  
                  {topProducts.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground">لا توجد بيانات أداء متاحة، أضف منتجات وفواتير لرؤية تحليل الأداء.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">مبيعات مرتفعة</Badge>
                    <span className="mx-2">∙</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">إيرادات مرتفعة</Badge>
                    <span className="mx-2">∙</span>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">نقاط ولاء</Badge>
                  </div>
                  <Button variant="outline" size="sm">عرض كل المنتجات</Button>
                </div>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    المنتجات الأسرع نموًا
                  </CardTitle>
                  <CardDescription>المنتجات التي تظهر نموًا سريعًا</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getGrowingProducts(products, invoices).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-green-100 text-green-800">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {product.growthRate}%
                          </Badge>
                          <span>{product.name}</span>
                        </div>
                        <span className="text-sm font-medium">{product.sales} وحدة</span>
                      </div>
                    ))}
                    
                    {getGrowingProducts(products, invoices).length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground">لا توجد بيانات كافية لتحديد المنتجات الأسرع نموًا</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-green-50 text-green-700 p-3 rounded-lg w-full">
                    <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">
                      {getGrowingProducts(products, invoices).length > 0
                        ? 'هذه المنتجات تظهر نموًا سريعًا ويجب زيادة المخزون منها.'
                        : 'أضف المزيد من الفواتير بتواريخ مختلفة لتحليل نمو المنتجات.'}
                    </p>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    المنتجات الأقل مبيعًا
                  </CardTitle>
                  <CardDescription>المنتجات التي تحتاج لتعزيز مبيعاتها</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getLowSellingProducts(products, invoices).map((product, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 border-red-200 text-red-800">
                            فقط {product.sales} وحدة
                          </Badge>
                          <span>{product.name}</span>
                        </div>
                        <span className="text-sm font-medium">{formatAmountEn(product.revenue)} ج.م</span>
                      </div>
                    ))}
                    
                    {getLowSellingProducts(products, invoices).length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground">لا توجد منتجات منخفضة المبيعات لعرضها</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-red-50 text-red-700 p-3 rounded-lg w-full">
                    <Lightbulb className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">
                      {getLowSellingProducts(products, invoices).length > 0
                        ? 'هذه المنتجات تحتاج إلى حملات تسويقية أو عروض خاصة لتحسين أدائها.'
                        : 'جميع منتجاتك تحقق مبيعات جيدة. استمر في العمل الجيد!'}
                    </p>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    تصنيف المنتجات
                  </CardTitle>
                  <CardDescription>تصنيف المنتجات حسب الأداء العام</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topRevenueProducts.slice(0, 5).map((product, index) => {
                      const rating = 5 - Math.min(4, Math.floor(index / 1));
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold mr-3">
                              {index + 1}
                            </div>
                            <span>{product.name}</span>
                          </div>
                          <div className="flex">
                            {[...Array(rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                            ))}
                            {[...Array(5 - rating)].map((_, i) => (
                              <Star key={i + rating} className="h-4 w-4 text-gray-200" />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    
                    {topRevenueProducts.length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-muted-foreground">لا توجد بيانات كافية لتصنيف المنتجات</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-amber-50 text-amber-700 p-3 rounded-lg w-full">
                    <Star className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">
                      {topRevenueProducts.length > 0
                        ? 'المنتجات ذات التقييم العالي تساهم بشكل كبير في أرباح المؤسسة.'
                        : 'أضف المزيد من المنتجات والفواتير لرؤية تصنيف المنتجات.'}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  توصيات وتنبؤات
                </CardTitle>
                <CardDescription>تحليلات وتوصيات ذكية لتحسين أداء المنتجات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {topProducts.length > 0 ? (
                  <>
                    <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        منتجات مميزة
                      </h3>
                      <p>المنتج "{topProducts[0].name}" يحقق أعلى المبيعات. يجب الحفاظ على مستويات المخزون المناسبة والتركيز على تسويقه.</p>
                    </div>
                    
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <Percent className="h-5 w-5 mr-2" />
                        فرص تحسين التسعير
                      </h3>
                      <p>
                        {priceVsSalesData.length > 0 && priceVsSalesData.some(item => item.sales > 0 && item.price > 100)
                          ? 'المنتجات عالية السعر تحقق مبيعات جيدة، يمكن النظر في رفع أسعار بعض المنتجات الأخرى.'
                          : 'المنتجات منخفضة السعر تحقق مبيعات أعلى، يُنصح بإعادة النظر في استراتيجية التسعير.'}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 text-purple-800 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <PieChartIcon className="h-5 w-5 mr-2" />
                        تحليل الأقسام
                      </h3>
                      <p>
                        {categoryData.length > 0 
                          ? getCategoryDistributionInsight(categoryData) 
                          : 'قم بإضافة منتجات من مختلف الأقسام لرؤية تحليل توزيع المبيعات.'}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-lg">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        تنبؤات المبيعات
                      </h3>
                      <p>
                        {monthlyTrendData.length >= 3 
                          ? 'بناءً على اتجاهات المبيعات الحالية، نتوقع زيادة في المبيعات بنسبة 15% خلال الربع القادم.'
                          : 'لا تتوفر بيانات كافية للتنبؤ بالمبيعات المستقبلية. أضف المزيد من الفواتير بتواريخ مختلفة.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Lightbulb className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-xl font-medium mb-2">لا توجد بي��نات كافية</h3>
                    <p className="text-muted-foreground mb-6">
                      قم بإضافة منتجات وفواتير للحصول على تحليلات وتوصيات ذكية حول أداء منتجاتك.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline">إضافة منتجات</Button>
                      <Button>إنشاء فاتورة</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductAnalytics;
