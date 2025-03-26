
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
import { Customer, Invoice, ProductCategory } from '@/lib/types';
import { getProductById } from '@/lib/data';
import { calculateCategoryDistribution } from '@/lib/calculations';

interface CustomerRecommendationsProps {
  customer: Customer;
  invoices: Invoice[];
}

const CustomerRecommendations = ({ customer, invoices }: CustomerRecommendationsProps) => {
  const categoryDistribution = calculateCategoryDistribution(customer.id);
  
  // Get all purchased products
  const allPurchasedProducts = new Set<string>();
  invoices.forEach(invoice => {
    invoice.items.forEach(item => {
      allPurchasedProducts.add(item.productId);
    });
  });

  // Find purchase pattern
  const purchasePattern = getPurchasePattern(invoices);
  
  // Get most frequent category
  const mostFrequentCategory = getMostFrequentCategory(categoryDistribution);
  
  // Get least frequent category
  const leastFrequentCategory = getLeastFrequentCategory(categoryDistribution);
  
  // Get up-selling opportunities
  const upSellingOpportunities = getUpSellingOpportunities(invoices);
  
  // Get cross-selling suggestions
  const crossSellingRecommendations = getCrossSellingRecommendations(customer.id, categoryDistribution);
  
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
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              فرص زيادة المبيعات
            </CardTitle>
            <CardDescription>توصيات لزيادة قيمة المبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upSellingOpportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start space-x-4 space-x-reverse">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{opportunity.title}</h4>
                    <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Award className="h-5 w-5 mr-2 text-purple-500" />
              توصيات المنتجات
            </CardTitle>
            <CardDescription>منتجات مقترحة بناءً على المشتريات السابقة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crossSellingRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-4 space-x-reverse">
                  <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">{recommendation.title}</h4>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">القسم الأكثر شراءً</h4>
                  <span className="text-sm font-medium">{categoryDistribution[mostFrequentCategory]}%</span>
                </div>
                <div className="space-y-1">
                  <Progress value={categoryDistribution[mostFrequentCategory]} className="h-2" />
                  <p className="text-sm text-muted-foreground">{mostFrequentCategory}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  هذا القسم يمثل الاهتمام الرئيسي للعميل، يمكن تقديم عروض خاصة عليه.
                </p>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">القسم الأقل شراءً</h4>
                  <span className="text-sm font-medium">{categoryDistribution[leastFrequentCategory]}%</span>
                </div>
                <div className="space-y-1">
                  <Progress value={categoryDistribution[leastFrequentCategory]} className="h-2" />
                  <p className="text-sm text-muted-foreground">{leastFrequentCategory}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  هناك فرصة لزيادة مبيعات هذا القسم من خلال التوعية بمنتجاته وفوائدها.
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">توصيات استراتيجية</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">توقيت العروض</h4>
                    <p className="text-sm text-muted-foreground">
                      تقديم عروض في {purchasePattern.bestTimingForOffers} لزيادة احتمالية الشراء.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 space-x-reverse">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">تنبيه بشأن المنتجات</h4>
                    <p className="text-sm text-muted-foreground">
                      تذكير العميل بالمنتجات الدورية المتوقع احتياجه لها خلال الأسبوعين القادمين.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 space-x-reverse">
                  <Award className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">مكافآت الولاء</h4>
                    <p className="text-sm text-muted-foreground">
                      تقديم نقاط إضافية على المنتجات من قسم {leastFrequentCategory} لتشجيع تنويع المشتريات.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions to generate recommendations

function getPurchasePattern(invoices: Invoice[]) {
  // In a real app, these would be calculated from actual data
  return {
    timingText: "بداية الشهر (1-10)",
    frequencyText: "مرة كل شهر",
    priceSensitivityText: "متوسطة - يفضل المنتجات ذات الجودة العالية",
    bestTimingForOffers: "بداية الشهر"
  };
}

function getMostFrequentCategory(categoryDistribution: Record<ProductCategory, number>) {
  return Object.entries(categoryDistribution)
    .reduce((max, [category, percentage]) => 
      percentage > max.percentage ? { category, percentage } : max, 
      { category: ProductCategory.ENGINE_CARE, percentage: 0 }
    ).category as ProductCategory;
}

function getLeastFrequentCategory(categoryDistribution: Record<ProductCategory, number>) {
  return Object.entries(categoryDistribution)
    .filter(([_, percentage]) => percentage > 0) // Only consider categories that were purchased
    .reduce((min, [category, percentage]) => 
      percentage < min.percentage ? { category, percentage } : min, 
      { category: ProductCategory.ENGINE_CARE, percentage: 100 }
    ).category as ProductCategory;
}

function getUpSellingOpportunities(invoices: Invoice[]) {
  // In a real app, these would be based on customer purchase history
  return [
    {
      title: "ترقية زيوت المحرك",
      description: "اقتراح الزيوت الاصطناعية الكاملة بدلاً من المخلوطة لأداء أفضل."
    },
    {
      title: "الباقات المتكاملة",
      description: "تقديم حزم صيانة متكاملة توفر 15% عن شراء المنتجات فردياً."
    },
    {
      title: "برنامج الصيانة الدورية",
      description: "اشتراك شهري يوفر جميع احتياجات الصيانة الدورية بخصم 20%."
    }
  ];
}

function getCrossSellingRecommendations(customerId: string, categoryDistribution: Record<ProductCategory, number>) {
  // Get weakest categories to recommend products from them
  const weakCategories = Object.entries(categoryDistribution)
    .filter(([_, percentage]) => percentage < 15)
    .map(([category]) => category as ProductCategory);
  
  // Recommendations based on category distribution
  const recommendations = [
    {
      title: "منتجات العناية بالإطارات",
      description: "ملمع الإطارات يزيد عمر الإطارات ويحسن المظهر الخارجي للسيارة."
    },
    {
      title: "منتجات العناية بالسطح الخارجي",
      description: "شمع الحماية يوفر طبقة عازلة تحمي طلاء السيارة من العوامل الجوية."
    },
    {
      title: "منتجات العناية بالتابلوه",
      description: "منظف ومعطر التابلوه يحمي من أشعة الشمس ويعطي رائحة منعشة."
    }
  ];
  
  // Filter to show only relevant recommendations
  if (weakCategories.length > 0) {
    return recommendations.filter((_, index) => index < 3);
  }
  
  return recommendations;
}

export default CustomerRecommendations;
