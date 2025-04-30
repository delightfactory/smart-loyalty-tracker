
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
import { ProductCategory, Product, Invoice } from '@/lib/types';
import { formatNumberEn, formatAmountEn } from '@/lib/formatters';

// Define types for the analytics data
interface ProductSalesData {
  id: string;
  name: string;
  category: string;
  price: number;
  sales: number;
  revenue: number;
  pointsEarned: number;
  brand?: string;
}

interface CategoryData {
  name: string;
  sales: number;
  revenue: number;
}

interface BrandPerformanceData {
  name: string;
  sales: number;
  products: number;
}

interface MonthlyTrendData {
  name: string;
  sales: number;
  revenue: number;
}

interface CategoryRadarData {
  category: string;
  price: number;
  sales: number;
  revenue: number;
  points: number;
}

interface ProductAnalyticsProps {
  products: Product[];
  invoices: Invoice[];
  isLoading: boolean;
}

// Helper component for loading state
const AnalyticsLoadingState = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton className="h-10 w-72" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-9 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="h-[400px] w-full">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  </div>
);

// Utility functions for analytics calculations
const filterInvoicesByTimeRange = (invoices: Invoice[], timeRange: string): Invoice[] => {
  if (timeRange === 'all') return invoices;
  
  const now = new Date();
  let cutoffDate = new Date();
  
  switch (timeRange) {
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date || invoice.createdAt);
    return invoiceDate >= cutoffDate;
  });
};

const calculateProductSalesData = (products: Product[], invoices: Invoice[]): ProductSalesData[] => {
  // Create a map to track sales data for each product
  const productSalesMap = new Map<string, ProductSalesData>();
  
  // Initialize sales data for all products
  products.forEach(product => {
    productSalesMap.set(product.id, {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      sales: 0,
      revenue: 0,
      pointsEarned: 0,
      brand: product.brand
    });
  });
  
  // Calculate sales and revenue from invoices
  invoices.forEach(invoice => {
    invoice.items?.forEach(item => {
      if (productSalesMap.has(item.productId)) {
        const productData = productSalesMap.get(item.productId);
        if (productData) {
          const quantity = item.quantity || 0;
          const itemTotal = item.total || (item.price * quantity);
          
          productSalesMap.set(item.productId, {
            ...productData,
            sales: productData.sales + quantity,
            revenue: productData.revenue + itemTotal,
            pointsEarned: productData.pointsEarned + (item.pointsEarned || 0)
          });
        }
      }
    });
  });
  
  // Convert map to array
  return Array.from(productSalesMap.values());
};

const calculateCategoryData = (products: Product[], productSalesData: ProductSalesData[]): CategoryData[] => {
  const categoriesMap = new Map<string, CategoryData>();
  
  // Group product sales by category
  productSalesData.forEach(product => {
    const category = product.category || 'غير مصنف';
    
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, {
        name: category,
        sales: 0,
        revenue: 0
      });
    }
    
    const categoryData = categoriesMap.get(category);
    if (categoryData) {
      categoriesMap.set(category, {
        ...categoryData,
        sales: categoryData.sales + product.sales,
        revenue: categoryData.revenue + product.revenue
      });
    }
  });
  
  return Array.from(categoriesMap.values());
};

const calculateBrandPerformanceData = (productSalesData: ProductSalesData[]): BrandPerformanceData[] => {
  const brandsMap = new Map<string, BrandPerformanceData>();
  
  // Group by brand
  productSalesData.forEach(product => {
    const brand = product.brand || 'غير محدد';
    
    if (!brandsMap.has(brand)) {
      brandsMap.set(brand, {
        name: brand,
        sales: 0,
        products: 0
      });
    }
    
    const brandData = brandsMap.get(brand);
    if (brandData) {
      brandsMap.set(brand, {
        ...brandData,
        sales: brandData.sales + product.sales,
        products: brandData.products + 1
      });
    }
  });
  
  return Array.from(brandsMap.values());
};

const calculateCategoryRadarData = (products: Product[], productSalesData: ProductSalesData[]): CategoryRadarData[] => {
  const categoriesMap = new Map<string, CategoryRadarData>();
  
  // Calculate max values for normalization
  let maxPrice = 0;
  let maxSales = 0;
  let maxRevenue = 0;
  let maxPoints = 0;
  
  productSalesData.forEach(product => {
    maxPrice = Math.max(maxPrice, product.price);
    maxSales = Math.max(maxSales, product.sales);
    maxRevenue = Math.max(maxRevenue, product.revenue);
    maxPoints = Math.max(maxPoints, product.pointsEarned);
  });
  
  // Group and normalize data by category
  productSalesData.forEach(product => {
    const category = product.category || 'غير مصنف';
    
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, {
        category: category,
        price: 0,
        sales: 0,
        revenue: 0,
        points: 0
      });
    }
    
    const currentData = categoriesMap.get(category);
    if (currentData) {
      const normalizedPrice = maxPrice > 0 ? (product.price / maxPrice) * 100 : 0;
      const normalizedSales = maxSales > 0 ? (product.sales / maxSales) * 100 : 0;
      const normalizedRevenue = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0;
      const normalizedPoints = maxPoints > 0 ? (product.pointsEarned / maxPoints) * 100 : 0;
      
      // Sum up normalized values
      categoriesMap.set(category, {
        ...currentData,
        price: currentData.price + normalizedPrice / productSalesData.filter(p => p.category === category).length,
        sales: currentData.sales + normalizedSales / productSalesData.filter(p => p.category === category).length,
        revenue: currentData.revenue + normalizedRevenue / productSalesData.filter(p => p.category === category).length,
        points: currentData.points + normalizedPoints / productSalesData.filter(p => p.category === category).length
      });
    }
  });
  
  return Array.from(categoriesMap.values());
};

const calculateMonthlyTrendData = (invoices: Invoice[], products: Product[]): MonthlyTrendData[] => {
  const monthlyData = new Map<string, { sales: number; revenue: number }>();
  
  // Process invoices for monthly data
  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.date || invoice.createdAt);
    const monthYear = `${invoiceDate.getMonth() + 1}/${invoiceDate.getFullYear()}`;
    
    if (!monthlyData.has(monthYear)) {
      monthlyData.set(monthYear, { sales: 0, revenue: 0 });
    }
    
    const currentData = monthlyData.get(monthYear);
    if (currentData && invoice.items) {
      let monthlySales = currentData.sales;
      let monthlyRevenue = currentData.revenue;
      
      invoice.items.forEach(item => {
        monthlySales += item.quantity || 0;
        monthlyRevenue += item.total || (item.price * (item.quantity || 0));
      });
      
      monthlyData.set(monthYear, { 
        sales: monthlySales, 
        revenue: monthlyRevenue 
      });
    }
  });
  
  // Convert to array and sort by date
  const result = Array.from(monthlyData.entries()).map(([month, data]) => ({
    name: month,
    sales: data.sales,
    revenue: data.revenue
  }));
  
  // Sort by date
  return result.sort((a, b) => {
    const [aMonth, aYear] = a.name.split('/');
    const [bMonth, bYear] = b.name.split('/');
    const dateA = new Date(parseInt(aYear), parseInt(aMonth) - 1);
    const dateB = new Date(parseInt(bYear), parseInt(bMonth) - 1);
    return dateA.getTime() - dateB.getTime();
  });
};

const calculateGrowthRate = (invoices: Invoice[], metric: 'sales' | 'revenue'): string => {
  if (invoices.length < 2) return '0%';
  
  // Group invoices by month
  const monthData = new Map<string, { sales: number; revenue: number }>();
  
  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.date || invoice.createdAt);
    const monthYear = `${invoiceDate.getMonth() + 1}/${invoiceDate.getFullYear()}`;
    
    if (!monthData.has(monthYear)) {
      monthData.set(monthYear, { sales: 0, revenue: 0 });
    }
    
    const currentData = monthData.get(monthYear);
    if (currentData && invoice.items) {
      let monthlySales = currentData.sales;
      let monthlyRevenue = currentData.revenue;
      
      invoice.items.forEach(item => {
        monthlySales += item.quantity || 0;
        monthlyRevenue += item.total || (item.price * (item.quantity || 0));
      });
      
      monthData.set(monthYear, { 
        sales: monthlySales, 
        revenue: monthlyRevenue 
      });
    }
  });
  
  // Convert to array and sort by date
  const sortedData = Array.from(monthData.entries())
    .map(([month, data]) => ({
      month,
      ...data
    }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/');
      const [bMonth, bYear] = b.month.split('/');
      const dateA = new Date(parseInt(aYear), parseInt(aMonth) - 1);
      const dateB = new Date(parseInt(bYear), parseInt(bMonth) - 1);
      return dateA.getTime() - dateB.getTime();
    });
  
  if (sortedData.length < 2) return '0%';
  
  // Calculate growth rate (current - previous) / previous
  const currentValue = sortedData[sortedData.length - 1][metric];
  const previousValue = sortedData[sortedData.length - 2][metric];
  
  if (previousValue === 0) return '∞%';
  
  const growthRate = ((currentValue - previousValue) / previousValue) * 100;
  return `${growthRate.toFixed(1)}%`;
};

const calculateAverageGrowth = (invoices: Invoice[], products: Product[]): string => {
  if (invoices.length < 2) return '0%';
  
  // Group invoices by month and calculate average unit value
  const monthData = new Map<string, { sales: number; revenue: number; average: number }>();
  
  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.date || invoice.createdAt);
    const monthYear = `${invoiceDate.getMonth() + 1}/${invoiceDate.getFullYear()}`;
    
    if (!monthData.has(monthYear)) {
      monthData.set(monthYear, { sales: 0, revenue: 0, average: 0 });
    }
    
    const currentData = monthData.get(monthYear);
    if (currentData && invoice.items) {
      let monthlySales = currentData.sales;
      let monthlyRevenue = currentData.revenue;
      
      invoice.items.forEach(item => {
        monthlySales += item.quantity || 0;
        monthlyRevenue += item.total || (item.price * (item.quantity || 0));
      });
      
      const average = monthlySales > 0 ? monthlyRevenue / monthlySales : 0;
      
      monthData.set(monthYear, { 
        sales: monthlySales, 
        revenue: monthlyRevenue,
        average
      });
    }
  });
  
  // Convert to array and sort by date
  const sortedData = Array.from(monthData.entries())
    .map(([month, data]) => ({
      month,
      ...data
    }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/');
      const [bMonth, bYear] = b.month.split('/');
      const dateA = new Date(parseInt(aYear), parseInt(aMonth) - 1);
      const dateB = new Date(parseInt(bYear), parseInt(bMonth) - 1);
      return dateA.getTime() - dateB.getTime();
    });
  
  if (sortedData.length < 2) return '0%';
  
  // Calculate average unit value growth
  const currentAvg = sortedData[sortedData.length - 1].average;
  const previousAvg = sortedData[sortedData.length - 2].average;
  
  if (previousAvg === 0) return '0%';
  
  const growthRate = ((currentAvg - previousAvg) / previousAvg) * 100;
  return `${growthRate.toFixed(1)}%`;
};

// Insight generation functions
const getMonthlyTrendInsight = (data: MonthlyTrendData[]): string => {
  if (data.length <= 1) return 'لا توجد بيانات كافية لتحليل الاتجاهات.';
  
  const lastMonthSales = data[data.length - 1].sales;
  const secondLastMonthSales = data[data.length - 2].sales;
  const salesDiff = lastMonthSales - secondLastMonthSales;
  
  if (salesDiff > 0) {
    return `ارتفعت المبيعات بنسبة ${((salesDiff / secondLastMonthSales) * 100).toFixed(1)}% في الشهر الأخير. استمر في تطبيق استراتيجيات البيع الناجحة.`;
  } else if (salesDiff < 0) {
    return `انخفضت المبيعات بنسبة ${((Math.abs(salesDiff) / secondLastMonthSales) * 100).toFixed(1)}% في الشهر الأخير. قد تحتاج لمراجعة استراتيجيات البيع.`;
  } else {
    return 'استقرت المبيعات في الشهر الأخير. تابع مراقبة الأداء.';
  }
};

const getCategoryDistributionInsight = (data: CategoryData[]): string => {
  if (data.length === 0) return 'لا توجد بيانات كافية للتحليل.';
  
  // Find top category
  let topCategory = data[0];
  data.forEach(category => {
    if (category.sales > topCategory.sales) {
      topCategory = category;
    }
  });
  
  // Calculate percentage of top category
  const totalSales = data.reduce((sum, category) => sum + category.sales, 0);
  const topPercentage = totalSales > 0 ? (topCategory.sales / totalSales) * 100 : 0;
  
  if (topPercentage > 50) {
    return `يمثل قسم "${topCategory.name}" نسبة ${topPercentage.toFixed(0)}% من المبيعات. قد تعتمد كثيرًا على هذا القسم، فكر في تنويع منتجاتك.`;
  } else if (data.length === 1) {
    return `جميع المبيعات تأتي من قسم واحد. التنويع قد يساعد في نمو الأعمال.`;
  } else {
    return `يوجد توازن جيد بين أقسام المنتجات. قسم "${topCategory.name}" هو الأكثر مبيعًا بنسبة ${topPercentage.toFixed(0)}%.`;
  }
};

const getCategoryMultiDimensionalAnalysisInsight = (data: CategoryRadarData[]): string => {
  if (data.length === 0) return 'لا توجد بيانات كافية للتحليل.';
  
  // Find best and worst performing categories
  let bestCategory = data[0];
  let worstCategory = data[0];
  
  data.forEach(category => {
    const categoryScore = category.sales + category.revenue + category.points;
    const bestScore = bestCategory.sales + bestCategory.revenue + bestCategory.points;
    const worstScore = worstCategory.sales + worstCategory.revenue + worstCategory.points;
    
    if (categoryScore > bestScore) bestCategory = category;
    if (categoryScore < worstScore) worstCategory = category;
  });
  
  return `قسم "${bestCategory.category}" يقدم أفضل أداء شامل، بينما قسم "${worstCategory.category}" يحتاج إلى تحسين. قد يكون استهداف تحسين الأقسام الأقل أداءً أكثر فعالية لنمو الأعمال.`;
};

const getBrandPerformanceInsight = (data: BrandPerformanceData[]): string => {
  if (data.length === 0) return 'لا توجد بيانات كافية للتحليل.';
  
  // Find best performing brand
  let bestBrand = data[0];
  data.forEach(brand => {
    if (brand.sales > bestBrand.sales) {
      bestBrand = brand;
    }
  });
  
  if (data.length === 1) {
    return `جميع المبيعات تأتي من علامة تجارية واحدة. قد ترغب في تنويع العلامات التجارية.`;
  } else {
    return `العلامة التجارية "${bestBrand.name}" هي الأفضل أداءً مع ${bestBrand.sales} وحدة مباعة من ${bestBrand.products} منتجات. قد ترغب في زيادة المخزون من هذه العلامة.`;
  }
};

const getPriceVsSalesInsight = (data: any[]): string => {
  if (data.length < 3) return 'لا توجد بيانات كافية للتحليل.';
  
  // Calculate correlation coefficient
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  const n = data.length;
  
  data.forEach(item => {
    sumX += item.price;
    sumY += item.sales;
    sumXY += item.price * item.sales;
    sumX2 += item.price * item.price;
    sumY2 += item.sales * item.sales;
  });
  
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (correlation < -0.5) {
    return 'هناك علاقة عكسية قوية بين السعر والمبيعات. خفض الأسعار قد يزيد المبيعات.';
  } else if (correlation > 0.5) {
    return 'هناك علاقة طردية قوية بين السعر والمبيعات. يبدو أن العملاء يقدرون المنتجات الأعلى سعرًا.';
  } else {
    return 'لا توجد علاقة واضحة بين السعر والمبيعات. قد تكون عوامل أخرى مثل الجودة أو العلامة التجارية أكثر تأثيرًا.';
  }
};

const getGrowingProducts = (products: Product[], invoices: Invoice[]): any[] => {
  const recentInvoices = invoices.sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Split invoices into two periods: recent and older
  const midPoint = Math.floor(recentInvoices.length / 2);
  const recentPeriod = recentInvoices.slice(0, midPoint);
  const olderPeriod = recentInvoices.slice(midPoint);
  
  // Calculate sales for each period
  const recentSales = new Map<string, number>();
  const olderSales = new Map<string, number>();
  
  recentPeriod.forEach(invoice => {
    invoice.items?.forEach(item => {
      const currentSales = recentSales.get(item.productId) || 0;
      recentSales.set(item.productId, currentSales + (item.quantity || 0));
    });
  });
  
  olderPeriod.forEach(invoice => {
    invoice.items?.forEach(item => {
      const currentSales = olderSales.get(item.productId) || 0;
      olderSales.set(item.productId, currentSales + (item.quantity || 0));
    });
  });
  
  // Calculate growth rates
  const growingProducts = products
    .map(product => {
      const recentSale = recentSales.get(product.id) || 0;
      const olderSale = olderSales.get(product.id) || 0;
      
      let growthRate = 0;
      if (olderSale > 0) {
        growthRate = ((recentSale - olderSale) / olderSale) * 100;
      } else if (recentSale > 0) {
        growthRate = 100; // New product with sales
      }
      
      return {
        id: product.id,
        name: product.name,
        sales: recentSale + olderSale,
        growthRate: Math.round(growthRate)
      };
    })
    .filter(product => product.growthRate > 0 && product.sales > 0)
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, 5);
  
  return growingProducts;
};

const getLowSellingProducts = (products: Product[], invoices: Invoice[]): any[] => {
  // Map to store product sales data
  const productSales = new Map<string, { name: string; sales: number; revenue: number }>();
  
  // Initialize with all products at 0 sales
  products.forEach(product => {
    productSales.set(product.id, {
      name: product.name,
      sales: 0,
      revenue: 0
    });
  });
  
  // Calculate sales from invoices
  invoices.forEach(invoice => {
    invoice.items?.forEach(item => {
      if (productSales.has(item.productId)) {
        const currentData = productSales.get(item.productId);
        if (currentData) {
          productSales.set(item.productId, {
            ...currentData,
            sales: currentData.sales + (item.quantity || 0),
            revenue: currentData.revenue + (item.total || (item.price * (item.quantity || 0)))
          });
        }
      }
    });
  });
  
  // Find products with sales below average
  const productsArray = Array.from(productSales.values());
  const totalSales = productsArray.reduce((sum, product) => sum + product.sales, 0);
  const averageSales = totalSales / productsArray.length || 1;
  
  const lowSellingProducts = productsArray
    .filter(product => product.sales > 0 && product.sales < averageSales * 0.5) // Products with sales below 50% of average
    .sort((a, b) => a.sales - b.sales)
    .slice(0, 5);
  
  return lowSellingProducts;
};

// Main component
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
                      ? `تمثل هذه المنتجات نسبة كبيرة من إجمالي المبيعات. يُنصح بضمان توفرها دائمًا.`
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
                {categoryData.length > 0 && categoryData.some(c => c.sales > 0) ? (
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
                    {categoryData.length > 0 && categoryData.some(c => c.sales > 0)
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
                {categoryRadarData.length > 0 && categoryRadarData.some(c => c.sales > 0) ? (
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
                    {categoryRadarData.length > 0 && categoryRadarData.some(c => c.sales > 0)
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
                        ? 'هذه المنتجات تحتاج إلى استراتيجيات تسويق مخصصة أو تعديل في السعر لتحسين مبيعاتها.'
                        : 'تبدو جميع المنتجات تؤدي أداءً جيدًا نسبيًا.'}
                    </p>
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    المنتجات الموسمية
                  </CardTitle>
                  <CardDescription>المنتجات التي تظهر تباينًا موسميًا في المبيعات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* هنا سيتم إضافة تحليل المنتجات الموسمية في المستقبل */}
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">لا يوجد تحليل للمنتجات الموسمية حاليًا، يرجى إضافة المزيد من الفواتير مع تواريخ متنوعة لتفعيل هذه الميزة.</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex items-center bg-blue-50 text-blue-700 p-3 rounded-lg w-full">
                    <Clock className="h-5 w-5 ml-3 flex-shrink-0" />
                    <p className="text-sm">
                      معرفة الطلب الموسمي على المنتجات يساعد في تحسين إدارة المخزون وتوقيت الحملات الترويجية.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  توصيات تحسين المبيعات
                </CardTitle>
                <CardDescription>نصائح تحليلية لزيادة المبيعات والإيرادات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">التركيز على المنتجات الأكثر مبيعًا</h4>
                    <p className="text-sm">
                      استمر في ضمان توفر المنتجات الأكثر مبيعًا وقم بتعزيز تسويقها للاستفادة من شعبيتها الحالية.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">تحسين أداء المنتجات منخفضة المبيعات</h4>
                    <p className="text-sm">
                      قم بمراجعة أسعار المنتجات منخفضة المبيعات وفكر في عروض ترويجية أو تخفيضات لتحفيز المبيعات.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">تنويع الأقسام</h4>
                    <p className="text-sm">
                      {categoryData.length > 1 
                        ? `تركز المبيعات على عدد محدود من الأقسام. فكر في تعزيز المنتجات من الأقسام الأقل مبيعًا.`
                        : `وسع نطاق منتجاتك لتشمل أقسامًا متنوعة لجذب شرائح مختلفة من العملاء.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  تحليل التسعير
                </CardTitle>
                <CardDescription>توصيات لتحسين استراتيجية التسعير</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2">متوسط سعر المنتجات</h4>
                    <p className="text-sm">
                      متوسط سعر المنتجات المباعة هو {totalSales > 0 ? formatAmountEn(totalRevenue / totalSales) : '0'} ج.م.
                      {topProducts.length > 0 && ` أسعار المنتجات الأكثر مبيعًا تتراوح من ${formatAmountEn(Math.min(...topProducts.map(p => p.price)))} إلى ${formatAmountEn(Math.max(...topProducts.map(p => p.price)))} ج.م.`}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">العلاقة بين السعر والمبيعات</h4>
                    <p className="text-sm">
                      {priceVsSalesData.length > 3 
                        ? getPriceVsSalesInsight(priceVsSalesData)
                        : 'أضف المزيد من الفواتير لتحليل العلاقة بين السعر والمبيعات بدقة أكبر.'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">توصيات التسعير</h4>
                    <p className="text-sm">
                      جرب استراتيجيات تسعير مختلفة للمنتجات منخفضة المبيعات، مثل التخفيضات المؤقتة أو العروض الترويجية للحزم، لتقييم استجابة السوق.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  توقعات وتخطيط
                </CardTitle>
                <CardDescription>التخطيط للمستقبل بناءً على تحليلات المبيعات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        توقعات النمو
                      </h4>
                      <p className="text-sm">
                        {monthlyTrendData.length >= 3 
                          ? 'بناءً على اتجاهات المبيعات الحالية، يمكن توقع استمرار النمو إذا واصلت استراتيجيات البيع الناجحة.'
                          : 'أضف المزيد من الفواتير بتواريخ متنوعة لتمكين نظام التوقعات من عمل تنبؤات دقيقة.'}
                      </p>
                    </div>
                    <div className="flex-1 p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        إدارة المخزون
                      </h4>
                      <p className="text-sm">
                        {topProducts.length > 0 
                          ? 'تأكد من توفر مخزون كافٍ من المنتجات الأكثر مبيعًا، خاصة المنتجات ذات معدل النمو المرتفع.'
                          : 'أضف بيانات المخزون والمبيعات لتفعيل توصيات إدارة المخزون.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2 flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        التسويق والترويج
                      </h4>
                      <p className="text-sm">
                        استهدف حملات التسويق نحو العلامات التجارية والأقسام الأفضل أداءً، مع تخصيص حملات ترويجية للمنتجات منخفضة المبيعات لتحسين أدائها.
                      </p>
                    </div>
                    <div className="flex-1 p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-medium text-amber-800 mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        التنويع والتوسع
                      </h4>
                      <p className="text-sm">
                        {categoryData.length > 0 
                          ? `استكشف فرص التوسع في أقسام جديدة أو زيادة تنوع المنتجات في الأقسام الحالية لتلبية احتياجات شرائح مختلفة من العملاء.`
                          : 'أضف المزيد من المنتجات من أقسام متنوعة لتمكين توصيات التنويع والتوسع.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductAnalytics;
