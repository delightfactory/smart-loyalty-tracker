import { 
  Customer, 
  Product, 
  Invoice, 
  Payment, 
  InvoiceItem, 
  Redemption,
  RedemptionItem,
  BusinessType,
  ProductCategory,
  ProductCategoryLabels,
  InvoiceStatus,
  PaymentMethod,
  PaymentType,
  RedemptionStatus
} from './types';

// تحويل بيانات المنتجات من قاعدة البيانات إلى نموذج التطبيق
export function dbProductToAppProduct(dbProduct: any): Product {
  // Normalize category: map enum or Arabic label to enum
  let category: ProductCategory;
  if (Object.values(ProductCategory).includes(dbProduct.category)) {
    category = dbProduct.category as ProductCategory;
  } else {
    const found = Object.entries(ProductCategoryLabels).find(([, label]) => label === dbProduct.category);
    category = (found?.[0] as ProductCategory) ?? ProductCategory.ENGINE_CARE;
  }

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category,
    price: dbProduct.price,
    unit: dbProduct.unit,
    brand: dbProduct.brand,
    pointsEarned: dbProduct.points_earned,
    pointsRequired: dbProduct.points_required
  };
}

// تحويل بيانات المنتج من نموذج التطبيق إلى قاعدة البيانات
export function appProductToDbProduct(product: Product): any {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    unit: product.unit,
    brand: product.brand,
    points_earned: product.pointsEarned,
    points_required: product.pointsRequired
  };
}

// تحويل بيانات العميل من قاعدة البيانات إلى نموذج التطبيق
export function dbCustomerToAppCustomer(dbCustomer: any): Customer {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    contactPerson: dbCustomer.contact_person,
    phone: dbCustomer.phone,
    businessType: dbCustomer.business_type as BusinessType,
    currentPoints: dbCustomer.current_points,
    pointsEarned: dbCustomer.points_earned,
    pointsRedeemed: dbCustomer.points_redeemed,
    classification: dbCustomer.classification,
    level: dbCustomer.level,
    creditBalance: dbCustomer.credit_balance,
    openingBalance: dbCustomer.opening_balance ?? 0,
    governorate: dbCustomer.governorate ?? '',
    city: dbCustomer.city ?? '',
    lastActive: dbCustomer.lastactive ? new Date(dbCustomer.lastactive).toISOString() : undefined,
    credit_period: dbCustomer.credit_period ?? 0,
    credit_limit: dbCustomer.credit_limit ?? 0,
  };
}

// تحويل بيانات العميل من نموذج التطبيق إلى قاعدة البيانات
export function appCustomerToDbCustomer(customer: Customer | Omit<Customer, 'id'>): any {
  return {
    ...(('id' in customer) ? { id: customer.id } : {}),
    name: customer.name,
    contact_person: customer.contactPerson,
    phone: customer.phone,
    business_type: customer.businessType,
    current_points: customer.currentPoints,
    points_earned: customer.pointsEarned,
    points_redeemed: customer.pointsRedeemed,
    classification: customer.classification,
    level: customer.level,
    credit_balance: customer.creditBalance,
    opening_balance: customer.openingBalance ?? 0,
    governorate: customer.governorate ?? null,
    city: customer.city ?? null,
    lastactive: customer.lastActive ? new Date(customer.lastActive).toISOString() : null,
    credit_period: customer.credit_period ?? 0,
    credit_limit: customer.credit_limit ?? 0,
  };
}

// تحويل بيانات الفاتورة من قاعدة البيانات إلى نموذج التطبيق
export function dbInvoiceToAppInvoice(dbInvoice: any): Invoice {
  const invoice: Invoice = {
    id: dbInvoice.id,
    customerId: dbInvoice.customer_id,
    date: new Date(dbInvoice.date),
    dueDate: dbInvoice.due_date ? new Date(dbInvoice.due_date) : undefined,
    totalAmount: dbInvoice.total_amount,
    status: dbInvoice.status as InvoiceStatus,
    paymentMethod: dbInvoice.payment_method as PaymentMethod,
    pointsEarned: dbInvoice.points_earned,
    pointsRedeemed: dbInvoice.points_redeemed,
    categoriesCount: dbInvoice.categories_count,
    items: dbInvoice.items ? dbInvoice.items.map(dbInvoiceItemToAppInvoiceItem) : [],
    payments: dbInvoice.payments ? dbInvoice.payments.map(dbPaymentToAppPayment) : []
  };
  
  return invoice;
}

// تحويل بيانات الفاتورة من نموذج التطبيق إلى قاعدة البيانات
export function appInvoiceToDbInvoice(invoice: Invoice | Omit<Invoice, 'id'>): any {
  return {
    ...(('id' in invoice) ? { id: invoice.id } : {}),
    customer_id: invoice.customerId,
    date: invoice.date instanceof Date ? invoice.date.toISOString() : invoice.date,
    due_date: invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : invoice.dueDate,
    total_amount: invoice.totalAmount,
    status: invoice.status,
    payment_method: invoice.paymentMethod,
    points_earned: invoice.pointsEarned,
    points_redeemed: invoice.pointsRedeemed,
    categories_count: invoice.categoriesCount
  };
}

// تحويل بيانات عنصر الفاتورة من قاعدة البيانات إلى نموذج التطبيق
export function dbInvoiceItemToAppInvoiceItem(dbItem: any): InvoiceItem {
  return {
    id: dbItem.id,
    productId: dbItem.product_id,
    quantity: dbItem.quantity,
    price: dbItem.price,
    totalPrice: dbItem.total_price,
    pointsEarned: dbItem.points_earned
  };
}

// تحويل بيانات عنصر الفاتورة من نموذج التطبيق إلى قاعدة البيانات
export function appInvoiceItemToDbInvoiceItem(item: InvoiceItem | Omit<InvoiceItem, 'id'>): any {
  const dbItem: any = {
    product_id: item.productId,
    quantity: item.quantity,
    price: item.price,
    total_price: item.totalPrice,
    points_earned: item.pointsEarned
  };
  
  if ('id' in item && item.id) {
    dbItem.id = item.id;
  }
  
  return dbItem;
}

// تحويل بيانات الدفعة من قاعدة البيانات إلى نموذج التطبيق
export function dbPaymentToAppPayment(dbPayment: any): Payment {
  return {
    id: dbPayment.id,
    customerId: dbPayment.customer_id,
    invoiceId: dbPayment.invoice_id || undefined,
    date: new Date(dbPayment.date),
    amount: dbPayment.amount,
    method: dbPayment.method,
    type: dbPayment.type as PaymentType,
    notes: dbPayment.notes || ''
  };
}

// تحويل بيانات الدفعة من نموذج التطبيق إلى قاعدة البيانات
export function appPaymentToDbPayment(payment: Payment | Omit<Payment, 'id'>): any {
  return {
    ...(('id' in payment) ? { id: payment.id } : {}),
    customer_id: payment.customerId,
    invoice_id: payment.invoiceId || null,
    date: payment.date instanceof Date ? payment.date.toISOString() : payment.date,
    amount: payment.amount,
    method: payment.method,
    type: payment.type,
    notes: payment.notes || null
  };
}

// تحويل بيانات استبدال النقاط من قاعدة البيانات إلى نموذج التطبيق
export function dbRedemptionToAppRedemption(dbRedemption: any): Redemption {
  return {
    id: dbRedemption.id,
    customerId: dbRedemption.customer_id,
    date: new Date(dbRedemption.date),
    status: dbRedemption.status as RedemptionStatus,
    totalPointsRedeemed: dbRedemption.total_points_redeemed,
    items: dbRedemption.items ? dbRedemption.items.map(dbRedemptionItemToAppRedemptionItem) : []
  };
}

// تحويل بيانات استبدال النقاط من نموذج التطبيق إلى قاعدة البيانات
export function appRedemptionToDbRedemption(redemption: Redemption | Omit<Redemption, 'id'>): any {
  return {
    ...(('id' in redemption) ? { id: redemption.id } : {}),
    customer_id: redemption.customerId,
    date: redemption.date instanceof Date ? redemption.date.toISOString() : redemption.date,
    status: redemption.status,
    total_points_redeemed: redemption.totalPointsRedeemed
  };
}

// تحويل بيانات عنصر استبدال النقاط من قاعدة البيانات إلى نموذج التطبيق
export function dbRedemptionItemToAppRedemptionItem(dbItem: any): RedemptionItem {
  return {
    id: dbItem.id,
    productId: dbItem.product_id,
    quantity: dbItem.quantity,
    pointsRequired: dbItem.points_required,
    totalPointsRequired: dbItem.total_points_required
  };
}

// تحويل بيانات عنصر استبدال النقاط من نموذج التطبيق إلى قاعدة البيانات
export function appRedemptionItemToDbRedemptionItem(item: RedemptionItem | Omit<RedemptionItem, 'id'>): any {
  const dbItem: any = {
    product_id: item.productId,
    quantity: item.quantity,
    points_required: item.pointsRequired,
    total_points_required: item.totalPointsRequired
  };
  
  if ('id' in item && item.id) {
    dbItem.id = item.id;
  }
  
  return dbItem;
}
