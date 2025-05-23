// We need to ensure the Customer interface has all required properties
// Adding lastActive and totalSpent properties

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
  active?: boolean; // Adding the active property that was missing
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
  openingBalance?: number; // الرصيد الافتتاحي
  classification: number; // Auto-calculated based on categories purchased from
  level: number; // Ranking compared to other customers
  created_at?: string;
  governorate?: string;
  city?: string;
  lastActive?: string; // Date of last activity (ISO string)
  totalSpent?: number; // Total amount spent by customer
  email?: string; // Optional email for customer
  credit_period?: number; // مدة الائتمان بالأيام
  credit_limit?: number;  // قيمة الائتمان
  region?: string; // منطقة العميل (حل مشكلة عدم وجود الحقل في Customer)
  earnPointsEnabled: boolean; // إضافة خيار استحقاق النقاط
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
  customer?: Customer; // joined customer record
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

// Return Types
export enum ReturnStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export interface ReturnItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Return {
  id: string;
  invoiceId: string;
  customerId: string;
  date: Date;
  items: ReturnItem[];
  totalAmount: number;
  status: ReturnStatus;
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
