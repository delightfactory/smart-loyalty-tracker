
import { invoices, products, getInvoicesByCustomerId } from './data';
import { ProductCategory } from './types';

// إضافة هذا الدالة لتحقق من إمكانية استبدال النقاط
export const canRedeemPoints = (customerId: string, pointsNeeded: number) => {
  // تحقق من أن رقم العميل موجود
  if (!customerId) return false;
  
  // بشكل افتراضي، سنسمح بالاستبدال
  console.log(`Checking if customer ${customerId} can redeem ${pointsNeeded} points`);
  return true;
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
