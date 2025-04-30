// Product Categories
export enum ProductCategory {
  ENGINE_CARE = "ENGINE_CARE",
  EXTERIOR_CARE = "EXTERIOR_CARE",
  TIRE_CARE = "TIRE_CARE",
  DASHBOARD_CARE = "DASHBOARD_CARE",
  INTERIOR_CARE = "INTERIOR_CARE",
  SUPPLIES = "SUPPLIES"
}

export const ProductCategoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.ENGINE_CARE]: "العناية بالمحرك",
  [ProductCategory.EXTERIOR_CARE]: "العناية بالسطح الخارجي",
  [ProductCategory.TIRE_CARE]: "العناية بالإطارات",
  [ProductCategory.DASHBOARD_CARE]: "العناية بالتابلوه",
  [ProductCategory.INTERIOR_CARE]: "العناية بالفرش الداخلي",
  [ProductCategory.SUPPLIES]: "المستلزمات"
};

// Customer Business Types
export enum BusinessType {
  SERVICE_CENTER = "مركز خدمة",
  MAINTENANCE_CENTER = "مركز صيانة",
  CAR_SHOWROOM = "معرض سيارات",
  ACCESSORIES_SHOP = "محل كماليات",
  GAS_STATION = "محطة وقود",
  MARKET = "ماركت"
}

// Product Interface
export interface Product {
  id: string; // المستخدم يدخل هذا الحقل (كود المنتج)
  name: string;
  category: string; // تغيير النوع من ProductCategory إلى string لدعم القيم العربية
  unit: string;
  brand: string;
  price: number;
  pointsEarned?: number;
  pointsRequired?: number;
}

// Customer Interface
export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  businessType: BusinessType;
  pointsEarned: number;
  pointsRedeemed: number;
  currentPoints: number;
  creditBalance: number;
  classification: number; // Auto-calculated based on categories purchased from
  level: number; // Ranking compared to other customers
  created_at?: string;
  governorate?: string;
  city?: string;
  lastActive?: string; // Date of last activity
  totalSpent?: number; // Total amount spent by customer
  email?: string; // Optional email for customer
}

// Invoice Item Interface
export interface InvoiceItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  pointsEarned: number;
}

// Invoice Status
export enum InvoiceStatus {
  PAID = "مدفوع",
  UNPAID = "غير مدفوع",
  PARTIALLY_PAID = "مدفوع جزئياً",
  OVERDUE = "متأخر"
}

// Payment Method
export enum PaymentMethod {
  CASH = "نقداً",
  CREDIT = "آجل"
}

// Payment Type
export enum PaymentType {
  PAYMENT = "payment",
  REFUND = "refund"
}

// Invoice Interface
export interface Invoice {
  id: string;
  customerId: string;
  date: Date;
  dueDate?: Date;
  items: InvoiceItem[];
  totalAmount: number;
  pointsEarned: number;
  pointsRedeemed: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  categoriesCount: number; // Number of unique categories in this invoice
  payments?: Payment[]; // Related payments
}

// Payment Interface
export interface Payment {
  id: string;
  customerId: string;
  invoiceId?: string; // Optional: payments can be related to an invoice or just to the customer account
  amount: number;
  date: Date;
  method: string;
  notes?: string;
  type: PaymentType;
}

// Redemption Status
export enum RedemptionStatus {
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PENDING = "pending"
}

// Redemption Item Interface
export interface RedemptionItem {
  id?: string;
  productId: string;
  quantity: number;
  pointsRequired: number;
  totalPointsRequired: number;
}

// Redemption Interface
export interface Redemption {
  id: string;
  customerId: string;
  date: Date;
  items: RedemptionItem[];
  totalPointsRedeemed: number;
  status: RedemptionStatus;
}

// Customer Analysis
export interface CustomerAnalysis {
  customer: Customer;
  totalPurchases: number;
  categoriesDistribution: Record<string, number>; // Percentage per category
  purchaseFrequency: number; // Average days between purchases
  onTimePaymentRate: number; // Percentage of on-time payments
  mostPurchasedCategories: string[];
  mostPurchasedProducts: string[]; // Product IDs
  purchaseTrend: 'increasing' | 'stable' | 'decreasing';
}

// Dashboard Summary
export interface DashboardSummary {
  totalCustomers: number;
  totalProducts: number;
  totalInvoices: number;
  totalRevenue: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  categoryDistribution: Record<string, number>;
  topCustomers: Customer[];
  recentInvoices: Invoice[];
}
