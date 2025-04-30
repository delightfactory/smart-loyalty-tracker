import { ProductCategory, Customer, Invoice } from '@/lib/types';
import { calculateCustomerImportance, importanceScoreToLevel, getOnTimePaymentRate } from '@/lib/calculations';
import { getProductById } from '@/lib/data';

// Main categories as used in Customers.tsx
const MAIN_CATEGORIES = [
  ProductCategory.DASHBOARD_CARE,
  ProductCategory.ENGINE_CARE,
  ProductCategory.EXTERIOR_CARE,
  ProductCategory.TIRE_CARE,
  ProductCategory.INTERIOR_CARE,
];

/**
 * Calculates the classification (number of main categories purchased) and level for a customer
 * @param customer Customer object
 * @param invoices All invoices for the customer
 * @returns { classification: number, level: number }
 */
export function calculateClassificationAndLevel(customer: Customer, invoices: Invoice[]): { classification: number, level: number } {
  // Calculate importance/level
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const frequency = invoices.length;
  const pointsEarned = Number(customer.pointsEarned || 0);
  const onTimePaymentRate = getOnTimePaymentRate(customer.id) / 100;

  // These max values should be passed in for batch ops, but for single-customer just use self values to avoid div by 0
  const maxAmount = Math.max(totalAmount, 1);
  const maxFrequency = Math.max(frequency, 1);
  const maxPoints = Math.max(pointsEarned, 1);

  const importance = calculateCustomerImportance({
    totalAmount,
    frequency,
    pointsEarned,
    onTimePaymentRate,
    maxAmount,
    maxFrequency,
    maxPoints,
  });
  const level = importanceScoreToLevel(importance);

  // Calculate classification (number of main categories purchased)
  const purchasedMainCategories = new Set<string>();
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      const product = getProductById(item.productId);
      if (product && MAIN_CATEGORIES.includes(product.category as ProductCategory)) {
        purchasedMainCategories.add(product.category);
      }
    });
  });
  // At least 1 star if any invoice exists
  const classification = purchasedMainCategories.size > 0 ? purchasedMainCategories.size : (invoices.length > 0 ? 1 : 0);

  return { classification, level };
}
