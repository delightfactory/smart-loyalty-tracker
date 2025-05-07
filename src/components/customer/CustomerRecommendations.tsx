import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  Lightbulb, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  PieChart,
  ShoppingCart,
  Calendar,
  Percent
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Customer, Invoice, ProductCategory, ProductCategoryLabels } from '@/lib/types';
import { useProducts } from '@/hooks/useProducts';
import { useMemo } from 'react';

interface CustomerRecommendationsProps {
  customer: Customer;
  invoices: Invoice[];
}

const CustomerRecommendations = ({ customer, invoices }: CustomerRecommendationsProps) => {
  // جلب قائمة المنتجات الحقيقية
  const { data: allProducts = [], isLoading: productsLoading } = useProducts().getAll;
  const productMap = useMemo(() => new Map(allProducts.map(p => [p.id, p])), [allProducts]);
  if (productsLoading) {
    return <div>جارٍ تحميل المنتجات...</div>;
  }

  // حساب توزيع الفئات بناءً على الفواتير الفعلية
  // تهيئة توزيع الفئات لجميع الفئات لضمان نوع Record المكتمل
  const rawCategorySum: Record<ProductCategory, number> = Object.values(ProductCategory).reduce(
    (acc, category) => {
      acc[category] = 0;
      return acc;
    },
    {} as Record<ProductCategory, number>
  );
  let totalCategorySum = 0;
  invoices.forEach(inv => inv.items.forEach(item => {
    const product = productMap.get(item.productId);
    if (product) {
      rawCategorySum[product.category] = (rawCategorySum[product.category] || 0) + item.totalPrice;
      totalCategorySum += item.totalPrice;
    }
  }));
  const categoryDistribution: Record<ProductCategory, number> = Object.entries(rawCategorySum).reduce(
    (acc, [cat, sum]) => ({ ...acc, [cat]: Math.round((sum / totalCategorySum) * 100) }),
    {} as Record<ProductCategory, number>
  );
  
  // Get all purchased products
  const allPurchasedProducts = new Set<string>();
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      allPurchasedProducts.add(item.productId);
    });
  });

  // Find purchase pattern
  const purchasePattern = getPurchasePattern(invoices);
  
  // تحليل توزيع الفئات لتحديد الفئات الأكثر والأقل شراءً
  const categoryEntries = Object.entries(categoryDistribution) as [ProductCategory, number][];
  const mostFrequentCategory = categoryEntries.reduce((prev, curr) => curr[1] > prev[1] ? curr : prev)[0];
  const leastFrequentCategory = (() => {
    const filtered = categoryEntries.filter(([, v]) => v > 0);
    return filtered.length
      ? filtered.reduce((prev, curr) => curr[1] < prev[1] ? curr : prev)[0]
      : mostFrequentCategory;
  })();
  
  // توصيات ديناميكية مبنية على بيانات الفواتير الفعلية
  const upSellingProducts = allProducts
    .filter(p => p.category === mostFrequentCategory && !allPurchasedProducts.has(p.id))
    .sort((a, b) => b.price - a.price)
    .slice(0, 3);
  const weakCategories = (Object.entries(categoryDistribution) as [ProductCategory, number][])
    .filter(([, v]) => v < 20)
    .map(([c]) => c);
  const crossSellingProducts = allProducts
    .filter(p => weakCategories.includes(p.category) && !allPurchasedProducts.has(p.id))
    .slice(0, 3);

  // تحليل أعمق لتوزيع الأقسام واستراتيجيات التوصية
  const sortedCategoryEntries = Object.entries(categoryDistribution) as [ProductCategory, number][];
  sortedCategoryEntries.sort((a, b) => b[1] - a[1]);
  // فلترة الأقسام بقيمة > 0 فقط
  const nonZeroCategoryEntries = sortedCategoryEntries.filter(([, val]) => val > 0);
  const topCategories = nonZeroCategoryEntries.slice(0, 3);
  const bottomCategories = nonZeroCategoryEntries.slice(-3).reverse();
  
  // تحديد الفئات الأكثر والأقل شراءً مع fallback
  const topEntry = nonZeroCategoryEntries[0] ?? [null, 0];
  const bottomEntry = nonZeroCategoryEntries[nonZeroCategoryEntries.length - 1] ?? [null, 0];
  const topCat = topEntry[0] as ProductCategory | string | null;
  const bottomCat = bottomEntry[0] as ProductCategory | string | null;
  // استخدام اسم القسم من الـ labels أو المفتاح الأصلي كـ fallback
  const topLabel = typeof topCat === 'string'
    ? (ProductCategoryLabels[topCat as ProductCategory] ?? topCat)
    : 'منتجات عامة';
  const bottomLabel = typeof bottomCat === 'string'
    ? (ProductCategoryLabels[bottomCat as ProductCategory] ?? bottomCat)
    : 'منتجات عامة';
  const bottomPercent = bottomEntry[1] ?? 0;

  const strategyRecommendations = [
    { icon: Clock, title: 'توقيت العروض', description: `تقديم عروض على منتجات من ${topLabel} في ${purchasePattern.timingText}` },
    { icon: AlertCircle, title: 'رفع الوعي', description: `تنبيه العميل بمنتجات ${bottomLabel} لتعزيز نسبة الشراء الحالية (${bottomPercent}%)` },
    { icon: Award, title: 'باقة موفرة', description: `تجميع منتجات من ${topLabel} و ${bottomLabel} في حزمة خاصة` }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
              أنماط الشراء
            </CardTitle>
            <CardDescription>تحليل سلوك الشراء للعميل</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 space-x-reverse">
                <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">توقيت الشراء المفضل</h4>
                  <p className="text-sm text-muted-foreground">{purchasePattern.timingText}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 space-x-reverse">
                <ShoppingCart className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">معدل الشراء</h4>
                  <p className="text-sm text-muted-foreground">{purchasePattern.frequencyText}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 space-x-reverse">
                <Percent className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">حساسية السعر</h4>
                  <p className="text-sm text-muted-foreground">{purchasePattern.priceSensitivityText}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* بطاقة فرص زيادة المبيعات ديناميكية */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              فرص زيادة المبيعات
            </CardTitle>
            <CardDescription>منتجات مقترحة بناءً على مشتريات العميل</CardDescription>
          </CardHeader>
          <CardContent>
            {upSellingProducts.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {upSellingProducts.map(p => (
                  <li key={p.id}>{p.name} بسعر {p.price.toFixed(2)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">لا توجد منتجات للترقية حالياً</p>
            )}
          </CardContent>
        </Card>
        
        {/* بطاقة توصيات التنويع ديناميكية */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Award className="h-5 w-5 mr-2 text-purple-500" />
              توصيات تنويع
            </CardTitle>
            <CardDescription>منتجات لتعزيز التنويع في مشتريات العميل</CardDescription>
          </CardHeader>
          <CardContent>
            {crossSellingProducts.length > 0 ? (
              <ul className="list-disc list-inside space-y-2">
                {crossSellingProducts.map(p => (
                  <li key={p.id}>{p.name} بسعر {p.price.toFixed(2)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">لا توجد توصيات للتنويع حالياً</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            تحليل تفضيلات الأقسام
          </CardTitle>
          <CardDescription>تحليل اهتمامات العميل بأقسام المنتجات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* توزيع الأقسام ذات النسبة > 0 */}
            <div className="space-y-4">
              {nonZeroCategoryEntries.length > 0 ? nonZeroCategoryEntries.map(([cat, val]) => (
                <div key={cat}>
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{ProductCategoryLabels[cat] ?? cat}</h4>
                    <span className="text-sm font-medium">{val}%</span>
                  </div>
                  <Progress value={val} className="h-2" />
                </div>
              )) : <p className="text-sm text-muted-foreground">لا توجد بيانات كافية للأقسام</p>}
            </div>
            {/* توصيات استراتيجية محسّنة */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">توصيات استراتيجية</h3>
              <div className="space-y-4">
                {strategyRecommendations.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <div key={idx} className="flex items-start space-x-4 space-x-reverse">
                      <Icon className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* اقتراحات للترقية */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">اقتراحات للترقية</h4>
        <ul className="list-disc list-inside space-y-4 text-sm">
          {upSellingProducts.length > 0 ? upSellingProducts.map(p => (
            <li key={p.id}>
              <div className="flex justify-between">
                <span className="font-medium">{p.name}</span>
                <span className="text-sm">{p.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                منتج من قسم {ProductCategoryLabels[p.category]} لتعزيز قيمة الشراء ورفع مستوى الإنفاق.
              </p>
            </li>
          )) : <li>لا توجد توصيات للترقية حالياً</li>}
        </ul>
      </div>
      
      {/* اقتراحات للتنويع */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">اقتراحات للتنويع</h4>
        <ul className="list-disc list-inside space-y-4 text-sm">
          {crossSellingProducts.length > 0 ? crossSellingProducts.map(p => (
            <li key={p.id}>
              <div className="flex justify-between">
                <span className="font-medium">{p.name}</span>
                <span className="text-sm">{p.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                اقتراح ابتكار تجربة جديدة مع منتجات من قسم {ProductCategoryLabels[p.category]} لتنويع مشترياتك.
              </p>
            </li>
          )) : <li>لا توجد توصيات للتنويع حالياً</li>}
        </ul>
      </div>
    </div>
  );
};

// دالة لحساب نمط الشراء بناءً على الفواتير الفعلية
function getPurchasePattern(invoices: Invoice[]) {
  if (!invoices || invoices.length === 0) {
    return { timingText: 'لا توجد بيانات', frequencyText: '0', priceSensitivityText: 'غير متاح' };
  }
  // تحليل توقيت الشراء
  const segmentCount = { first: 0, middle: 0, end: 0 };
  invoices.forEach(inv => {
    const day = new Date(inv.date).getDate();
    if (day <= 10) segmentCount.first++;
    else if (day <= 20) segmentCount.middle++;
    else segmentCount.end++;
  });
  const maxSeg = Object.entries(segmentCount).sort((a, b) => b[1] - a[1])[0][0];
  const timingText =
    maxSeg === 'first' ? 'أول الشهر (1-10)' :
    maxSeg === 'middle' ? 'منتصف الشهر (11-20)' :
    'أواخر الشهر (21-31)';
  // تحليل معدل التكرار (متوسط الأيام بين الفواتير)
  const dates = invoices.map(inv => new Date(inv.date)).sort((a, b) => a.getTime() - b.getTime());
  let totalDiff = 0;
  for (let i = 1; i < dates.length; i++) {
    totalDiff += (dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24);
  }
  const frequencyText = dates.length > 1
    ? `${(totalDiff / (dates.length - 1)).toFixed(1)} يوم`
    : 'فاتورة واحدة';
  // تحليل حساسية السعر (متوسط سعر الوحدة)
  let totalPrice = 0;
  let totalItems = 0;
  invoices.forEach(inv => inv.items.forEach(item => {
    totalPrice += item.totalPrice;
    totalItems += item.quantity;
  }));
  const avgPrice = totalItems ? totalPrice / totalItems : 0;
  const priceSensitivityText =
    avgPrice > 100 ? 'مرتفع - يميل للمنتجات عالية السعر' :
    avgPrice < 50 ? 'منخفض - يميل للمنتجات منخفضة السعر' :
    'متوسط - متنوع في الأسعار';
  return { timingText, frequencyText, priceSensitivityText };
}

export default CustomerRecommendations;
