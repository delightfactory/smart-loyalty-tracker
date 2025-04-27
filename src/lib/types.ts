// Product Categories
export enum ProductCategory {
  ENGINE_CARE = "العناية بالمحرك",
  EXTERIOR_CARE = "العناية بالسطح الخارجي",
  TIRE_CARE = "العناية بالإطارات",
  DASHBOARD_CARE = "العناية بالتابلوه",
  INTERIOR_CARE = "العناية بالفرش الداخلي"
}

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
  unit: string;
  category: ProductCategory;
  price: number;
  pointsEarned: number;
  pointsRequired: number;
  brand: string;
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
  categoriesDistribution: Record<ProductCategory, number>; // Percentage per category
  purchaseFrequency: number; // Average days between purchases
  onTimePaymentRate: number; // Percentage of on-time payments
  mostPurchasedCategories: ProductCategory[];
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
  categoryDistribution: Record<ProductCategory, number>;
  topCustomers: Customer[];
  recentInvoices: Invoice[];
}
