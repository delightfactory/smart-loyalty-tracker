import { invoices, products, customers, getInvoicesByCustomerId, getCustomerById } from './data';
import { ProductCategory } from './types';

// إضافة هذا الدالة لتحقق من إمكانية استبدال النقاط
export const canRedeemPoints = (customerId: string, pointsNeeded: number) => {
  // تحقق من أن رقم العميل موجود
  if (!customerId) return false;
  
  // احصل على بيانات العميل
  const customer = getCustomerById(customerId);
  if (!customer) return false;
  
  // تحقق من أن العميل لديه نقاط كافية للاستبدال
  const hasEnoughPoints = customer.currentPoints >= pointsNeeded;
  
  console.log(`Checking if customer ${customerId} can redeem ${pointsNeeded} points. Current points: ${customer.currentPoints}, Has enough: ${hasEnoughPoints}`);
  
  return hasEnoughPoints;
};

// حساب توزيع المشتريات حسب الفئات
export const calculateCategoryDistribution = (customerId: string): Record<ProductCategory, number> => {
  const customerInvoices = getInvoicesByCustomerId(customerId);
  
  // تهيئة كائن يحتوي على جميع الفئات بقيمة 0
  const distribution: Record<ProductCategory, number> = Object.values(ProductCategory).reduce(
    (acc, category) => ({ ...acc, [category]: 0 }),
    {} as Record<ProductCategory, number>
  );
  
  if (customerInvoices.length === 0) {
    return distribution;
  }
  
  // حساب إجمالي المشتريات من كل فئة
  let totalPurchases = 0;
  
  customerInvoices.forEach(invoice => {
    invoice.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        distribution[product.category] = (distribution[product.category] || 0) + item.totalPrice;
        totalPurchases += item.totalPrice;
      }
    });
  });
  
  // تحويل القيم إلى نسب مئوية
  if (totalPurchases > 0) {
    Object.keys(distribution).forEach(category => {
      const typedCategory = category as ProductCategory;
      distribution[typedCategory] = Math.round((distribution[typedCategory] / totalPurchases) * 100);
    });
  }
  
  return distribution;
};

// حساب معدل السداد في الوقت المحدد
export const getOnTimePaymentRate = (customerId: string): number => {
  const customerInvoices = getInvoicesByCustomerId(customerId);
  
  if (customerInvoices.length === 0) {
    return 100; // إذا لم يكن هناك فواتير، نفترض أنه ملتزم بنسبة 100٪
  }
  
  let onTimeCount = 0;
  
  customerInvoices.forEach(invoice => {
    // نعتبر الفاتورة مدفوعة في الوقت إذا كانت مدفوعة وليس متأخرة
    if (invoice.status === 'مدفوع' && invoice.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      const now = new Date();
      
      // إذا كان تاريخ الاستحقاق لم يمر بعد أو تم دفع الفاتورة
      if (dueDate >= now || invoice.payments && invoice.payments.length > 0) {
        onTimeCount++;
      }
    }
  });
  
  return Math.round((onTimeCount / customerInvoices.length) * 100);
};

// مؤشر نقاط الولاء (Loyalty Score)
export const calculateLoyaltyScore = (customerId: string): number => {
  const customer = getCustomerById(customerId);
  const invoices = getInvoicesByCustomerId(customerId);
  if (!customer || invoices.length === 0) return 0;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const monthsActive = new Set(invoices.map(inv => {
    const d = new Date(inv.date);
    return `${d.getFullYear()}-${d.getMonth() + 1}`;
  })).size;
  const repeatRate = invoices.length / monthsActive;
  const onTimeRate = getOnTimePaymentRate(customerId) / 100;
  // معادلة مركبة (يمكن تعديلها حسب الرؤية)
  const score = Math.min(100, Math.round((totalAmount / 1000) + (repeatRate * 20) + (onTimeRate * 30)));
  return score;
};

// تصنيف العملاء حسب الولاء
export const getLoyaltySegment = (customerId: string): string => {
  const score = calculateLoyaltyScore(customerId);
  if (score >= 80) return 'عميل دائم';
  if (score >= 50) return 'عميل متوسط';
  if (score >= 30) return 'عميل موسمي';
  return 'عميل معرض للفقدان';
};

// تحليل احتمالية فقدان العميل (Churn Prediction)
export const predictChurn = (customerId: string): number => {
  const invoices = getInvoicesByCustomerId(customerId);
  if (invoices.length === 0) return 100;
  const lastInvoice = invoices.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
  const now = new Date();
  const monthsSinceLast = (now.getFullYear() - new Date(lastInvoice.date).getFullYear()) * 12 + (now.getMonth() - new Date(lastInvoice.date).getMonth());
  // كل شهر بدون شراء يزيد الاحتمالية 20%
  return Math.min(100, monthsSinceLast * 20);
};

// تحليل دورة حياة العميل (CLV)
export const calculateCLV = (customerId: string): number => {
  const invoices = getInvoicesByCustomerId(customerId);
  if (invoices.length === 0) return 0;
  const avgValue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / invoices.length;
  const repeat = invoices.length;
  // قيمة متوقعة = متوسط الفاتورة × عدد مرات الشراء
  return Math.round(avgValue * repeat);
};

// معدل تكرار الشراء
export const getRepeatPurchaseRate = (customerId: string): number => {
  const invoices = getInvoicesByCustomerId(customerId);
  if (invoices.length === 0) return 0;
  const months = new Set(invoices.map(inv => {
    const d = new Date(inv.date);
    return `${d.getFullYear()}-${d.getMonth() + 1}`;
  })).size;
  return Math.round(invoices.length / months * 100);
};

// تحليل نقاط التفاعل (Engagement)
// استخدم الحقول الصحيحة من Customer: pointsRedeemed و pointsEarned
export const getEngagementStats = (customerId: string) => {
  const customer = getCustomerById(customerId);
  if (!customer) return { redeemed: 0, total: 0, rate: 0 };
  const redeemed = customer.pointsRedeemed || 0;
  const total = customer.pointsEarned || 0;
  const rate = total > 0 ? Math.round((redeemed / total) * 100) : 0;
  return { redeemed, total, rate };
};

// توقع المنتجات المفضلة القادمة
export const predictNextFavoriteProducts = (customerId: string, topN = 3): string[] => {
  const invoices = getInvoicesByCustomerId(customerId);
  const productMap: Record<string, number> = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      productMap[item.productId] = (productMap[item.productId] || 0) + item.quantity;
    });
  });
  return Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([id]) => id);
};

// --- تحليل RFM ---
export interface RFMResult {
  recency: number; // بالأيام منذ آخر عملية شراء
  frequency: number; // عدد عمليات الشراء
  monetary: number; // إجمالي الإنفاق
}

export const calculateRFM = (customerId: string, now: Date = new Date()): RFMResult => {
  const invoices = getInvoicesByCustomerId(customerId);
  if (invoices.length === 0) return { recency: -1, frequency: 0, monetary: 0 };
  const lastInvoice = invoices.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b);
  const recency = Math.floor((now.getTime() - new Date(lastInvoice.date).getTime()) / (1000 * 60 * 60 * 24));
  const frequency = invoices.length;
  const monetary = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  return { recency, frequency, monetary };
};

// --- تحديث معادلة نقاط الولاء لدعم الأوزان القابلة للتخصيص ---
export interface LoyaltyWeights {
  amountWeight: number; // وزن قيمة المشتريات
  repeatWeight: number; // وزن معدل التكرار
  onTimeWeight: number; // وزن الالتزام بالسداد
}

export const calculateLoyaltyScoreWeighted = (
  customerId: string,
  weights: LoyaltyWeights = { amountWeight: 0.3, repeatWeight: 0.4, onTimeWeight: 0.3 }
): number => {
  const invoices = getInvoicesByCustomerId(customerId);
  if (invoices.length === 0) return 0;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const monthsActive = new Set(invoices.map(inv => {
    const d = new Date(inv.date);
    return `${d.getFullYear()}-${d.getMonth() + 1}`;
  })).size;
  const repeatRate = invoices.length / monthsActive;
  const onTimeRate = getOnTimePaymentRate(customerId) / 100;
  // الأوزان يجب أن يكون مجموعها 1
  const score = Math.min(100, Math.round(
    (totalAmount / 1000) * weights.amountWeight +
    (repeatRate * 20) * weights.repeatWeight +
    (onTimeRate * 100) * weights.onTimeWeight
  ));
  return score;
};

// --- مقارنة أداء العميل مع القطاع ---
export interface SectorComparison {
  avgRecency: number;
  avgFrequency: number;
  avgMonetary: number;
  avgLoyalty: number;
}

export const compareWithSector = (customerId: string, sectorCustomers: string[]): SectorComparison => {
  // sectorCustomers: قائمة معرفات العملاء في نفس القطاع
  const rfms = sectorCustomers.map(cid => calculateRFM(cid));
  const loyaltyScores = sectorCustomers.map(cid => calculateLoyaltyScore(cid));
  const avgRecency = Math.round(rfms.reduce((sum, rfm) => sum + (rfm.recency > -1 ? rfm.recency : 0), 0) / sectorCustomers.length);
  const avgFrequency = Math.round(rfms.reduce((sum, rfm) => sum + rfm.frequency, 0) / sectorCustomers.length);
  const avgMonetary = Math.round(rfms.reduce((sum, rfm) => sum + rfm.monetary, 0) / sectorCustomers.length);
  const avgLoyalty = Math.round(loyaltyScores.reduce((sum, l) => sum + l, 0) / sectorCustomers.length);
  return { avgRecency, avgFrequency, avgMonetary, avgLoyalty };
};

// --- مؤشرات الاتجاه والتغيرات الزمنية ---
export interface TrendPoint {
  date: string; // YYYY-MM
  value: number;
}

export const getMonthlyPurchaseTrend = (customerId: string): TrendPoint[] => {
  const invoices = getInvoicesByCustomerId(customerId);
  const map: { [key: string]: number } = {};
  invoices.forEach(inv => {
    const date = new Date(inv.date);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    map[key] = (map[key] || 0) + inv.totalAmount;
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
};

// --- دعم التخصيص حسب سياسات الشركة ---
// يمكن تمرير الأوزان والمعايير من الإعدادات العامة أو واجهة الإدارة
// مثال: calculateLoyaltyScoreWeighted(customerId, companySettings.loyaltyWeights)

// --- Customer Importance & Level Calculation ---
/**
 * Calculate normalized importance score for a customer (0-100)
 * based on totalAmount, frequency, pointsEarned, onTimePaymentRate
 */
export function calculateCustomerImportance({
  totalAmount,
  frequency,
  pointsEarned,
  onTimePaymentRate,
  maxAmount,
  maxFrequency,
  maxPoints
}: {
  totalAmount: number,
  frequency: number,
  pointsEarned: number,
  onTimePaymentRate: number,
  maxAmount: number,
  maxFrequency: number,
  maxPoints: number
}): number {
  const amountScore = maxAmount ? totalAmount / maxAmount : 0;
  const freqScore = maxFrequency ? frequency / maxFrequency : 0;
  const pointsScore = maxPoints ? pointsEarned / maxPoints : 0;
  const onTimeScore = onTimePaymentRate; // already 0-1
  // Weights: 35%, 25%, 25%, 15%
  return Math.round(
    amountScore * 35 +
    freqScore * 25 +
    pointsScore * 25 +
    onTimeScore * 15
  );
}

/**
 * Convert importance score (0-100) to level (1-5)
 */
export function importanceScoreToLevel(score: number): number {
  if (score >= 81) return 5;
  if (score >= 61) return 4;
  if (score >= 41) return 3;
  if (score >= 21) return 2;
  return 1;
}
