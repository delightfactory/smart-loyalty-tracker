
import { 
  Product, 
  ProductCategory, 
  Invoice, 
  Customer, 
  InvoiceItem,
  InvoiceStatus,
  PaymentMethod
} from './types';
import { getProductById, getCustomerById, invoices } from './data';

// Calculate points based on the number of categories
export const calculatePoints = (items: InvoiceItem[]): number => {
  // Get unique categories from items
  const productIds = items.map(item => item.productId);
  const uniqueCategories = new Set<ProductCategory>();
  
  productIds.forEach(id => {
    const product = getProductById(id);
    if (product) {
      uniqueCategories.add(product.category);
    }
  });
  
  const categoriesCount = uniqueCategories.size;
  
  // Calculate total base points
  const totalBasePoints = items.reduce((sum, item) => {
    const product = getProductById(item.productId);
    if (product) {
      return sum + (product.pointsEarned * item.quantity);
    }
    return sum;
  }, 0);
  
  // Apply multiplier based on category count
  let multiplier = 0.25; // Default for 1 category
  
  if (categoriesCount === 2) {
    multiplier = 0.5;
  } else if (categoriesCount === 3) {
    multiplier = 0.75;
  } else if (categoriesCount >= 4) {
    multiplier = 1;
  }
  
  return totalBasePoints * multiplier;
};

// Calculate total points needed for redemption
export const calculateRedemptionPoints = (productId: string, quantity: number): number => {
  const product = getProductById(productId);
  if (!product) return 0;
  
  return product.pointsRequired * quantity;
};

// Calculate customer classification based on purchase history
export const calculateCustomerClassification = (customerId: string): number => {
  const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
  
  // Extract all product IDs from all invoices
  const allProductIds = customerInvoices.flatMap(inv => inv.items.map(item => item.productId));
  
  // Get unique categories
  const uniqueCategories = new Set<ProductCategory>();
  
  allProductIds.forEach(id => {
    const product = getProductById(id);
    if (product) {
      uniqueCategories.add(product.category);
    }
  });
  
  return uniqueCategories.size;
};

// Calculate customer level (ranking)
export const calculateCustomerLevel = (customers: Customer[]): Customer[] => {
  // Sort customers by total points earned
  const sortedCustomers = [...customers].sort((a, b) => b.pointsEarned - a.pointsEarned);
  
  // Assign level based on rank
  return sortedCustomers.map((customer, index) => ({
    ...customer,
    level: index + 1
  }));
};

// Calculate category distribution for a customer
export const calculateCategoryDistribution = (customerId: string): Record<ProductCategory, number> => {
  const customerInvoices = invoices.filter(inv => inv.customerId === customerId);
  const distribution: Record<ProductCategory, number> = {
    [ProductCategory.ENGINE_CARE]: 0,
    [ProductCategory.EXTERIOR_CARE]: 0,
    [ProductCategory.TIRE_CARE]: 0,
    [ProductCategory.DASHBOARD_CARE]: 0,
    [ProductCategory.INTERIOR_CARE]: 0
  };
  
  let totalAmount = 0;
  
  // Calculate total amount spent per category
  customerInvoices.forEach(invoice => {
    invoice.items.forEach(item => {
      const product = getProductById(item.productId);
      if (product) {
        distribution[product.category] += item.totalPrice;
        totalAmount += item.totalPrice;
      }
    });
  });
  
  // Convert to percentages
  if (totalAmount > 0) {
    Object.keys(distribution).forEach(category => {
      distribution[category as ProductCategory] = Number(((distribution[category as ProductCategory] / totalAmount) * 100).toFixed(1));
    });
  }
  
  return distribution;
};

// Generate a new invoice
export const generateInvoice = (
  customerId: string,
  items: InvoiceItem[],
  paymentMethod: PaymentMethod,
  pointsToRedeem: number = 0
): Invoice | null => {
  const customer = getCustomerById(customerId);
  if (!customer) return null;
  
  // Calculate categories count
  const productIds = items.map(item => item.productId);
  const uniqueCategories = new Set<ProductCategory>();
  
  productIds.forEach(id => {
    const product = getProductById(id);
    if (product) {
      uniqueCategories.add(product.category);
    }
  });
  
  const categoriesCount = uniqueCategories.size;
  
  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate points earned
  const pointsEarned = calculatePoints(items);
  
  // Create invoice
  const invoice: Invoice = {
    id: `INV${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    customerId,
    date: new Date(),
    dueDate: paymentMethod === PaymentMethod.CREDIT ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
    items,
    totalAmount,
    pointsEarned,
    pointsRedeemed: pointsToRedeem,
    status: paymentMethod === PaymentMethod.CASH ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
    paymentMethod,
    categoriesCount
  };
  
  return invoice;
};

// Check if a customer can redeem points
export const canRedeemPoints = (customerId: string, pointsNeeded: number): boolean => {
  const customer = getCustomerById(customerId);
  if (!customer) return false;
  
  // Check if customer has enough points
  if (customer.currentPoints < pointsNeeded) return false;
  
  // Check if customer has unpaid invoices
  const hasUnpaidInvoices = invoices.some(
    inv => inv.customerId === customerId && 
    (inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.PARTIALLY_PAID)
  );
  
  return !hasUnpaidInvoices;
};

// Get on-time payment rate for a customer
export const getOnTimePaymentRate = (customerId: string): number => {
  const customerInvoices = invoices.filter(
    inv => inv.customerId === customerId && 
    (inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.OVERDUE)
  );
  
  if (customerInvoices.length === 0) return 100;
  
  const onTimePayments = customerInvoices.filter(inv => inv.status === InvoiceStatus.PAID);
  return (onTimePayments.length / customerInvoices.length) * 100;
};
