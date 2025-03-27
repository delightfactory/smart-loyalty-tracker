
import { 
  Product, 
  Customer, 
  Invoice, 
  Payment, 
  Redemption,
  InvoiceItem, 
  RedemptionItem,
  BusinessType,
  ProductCategory,
  InvoiceStatus,
  PaymentMethod
} from './types';

// Database to Application model adapters
export const dbToAppAdapters = {
  // Convert DB Product to App Product
  productFromDB(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      unit: dbProduct.unit,
      category: dbProduct.category as ProductCategory,
      price: dbProduct.price,
      pointsEarned: dbProduct.points_earned,
      pointsRequired: dbProduct.points_required,
      brand: dbProduct.brand
    };
  },

  // Convert DB Customer to App Customer
  customerFromDB(dbCustomer: any): Customer {
    return {
      id: dbCustomer.id,
      name: dbCustomer.name,
      contactPerson: dbCustomer.contact_person,
      phone: dbCustomer.phone,
      businessType: dbCustomer.business_type as BusinessType,
      pointsEarned: dbCustomer.points_earned,
      pointsRedeemed: dbCustomer.points_redeemed,
      currentPoints: dbCustomer.current_points,
      creditBalance: dbCustomer.credit_balance,
      classification: dbCustomer.classification,
      level: dbCustomer.level
    };
  },

  // Convert DB Invoice Item to App Invoice Item
  invoiceItemFromDB(dbItem: any): InvoiceItem {
    return {
      productId: dbItem.product_id,
      quantity: dbItem.quantity,
      price: dbItem.price,
      totalPrice: dbItem.total_price,
      pointsEarned: dbItem.points_earned
    };
  },

  // Convert DB Payment to App Payment
  paymentFromDB(dbPayment: any): Payment {
    return {
      id: dbPayment.id,
      customerId: dbPayment.customer_id,
      invoiceId: dbPayment.invoice_id,
      amount: dbPayment.amount,
      date: new Date(dbPayment.date),
      method: dbPayment.method,
      notes: dbPayment.notes,
      type: dbPayment.type
    };
  },

  // Convert DB Invoice to App Invoice
  invoiceFromDB(dbInvoice: any, items: any[] = [], payments: any[] = []): Invoice {
    return {
      id: dbInvoice.id,
      customerId: dbInvoice.customer_id,
      date: new Date(dbInvoice.date),
      dueDate: dbInvoice.due_date ? new Date(dbInvoice.due_date) : undefined,
      items: items.map(item => this.invoiceItemFromDB(item)),
      totalAmount: dbInvoice.total_amount,
      pointsEarned: dbInvoice.points_earned,
      pointsRedeemed: dbInvoice.points_redeemed,
      status: dbInvoice.status as InvoiceStatus,
      paymentMethod: dbInvoice.payment_method as PaymentMethod,
      categoriesCount: dbInvoice.categories_count,
      payments: payments.map(payment => this.paymentFromDB(payment))
    };
  },

  // Convert DB Redemption Item to App Redemption Item
  redemptionItemFromDB(dbItem: any): RedemptionItem {
    return {
      productId: dbItem.product_id,
      quantity: dbItem.quantity,
      pointsRequired: dbItem.points_required,
      totalPointsRequired: dbItem.total_points_required
    };
  },

  // Convert DB Redemption to App Redemption
  redemptionFromDB(dbRedemption: any, items: any[] = []): Redemption {
    return {
      id: dbRedemption.id,
      customerId: dbRedemption.customer_id,
      date: new Date(dbRedemption.date),
      items: items.map(item => this.redemptionItemFromDB(item)),
      totalPointsRedeemed: dbRedemption.total_points_redeemed,
      status: dbRedemption.status
    };
  }
};

// Application to Database model adapters
export const appToDbAdapters = {
  // Convert App Product to DB Product
  productToDB(product: Product): any {
    return {
      id: product.id,
      name: product.name,
      unit: product.unit,
      category: product.category,
      price: product.price,
      points_earned: product.pointsEarned,
      points_required: product.pointsRequired,
      brand: product.brand
    };
  },

  // Convert App Customer to DB Customer
  customerToDB(customer: Customer): any {
    return {
      id: customer.id,
      name: customer.name,
      contact_person: customer.contactPerson,
      phone: customer.phone,
      business_type: customer.businessType,
      points_earned: customer.pointsEarned,
      points_redeemed: customer.pointsRedeemed,
      current_points: customer.currentPoints,
      credit_balance: customer.creditBalance,
      classification: customer.classification,
      level: customer.level
    };
  },

  // Convert App Invoice to DB Invoice
  invoiceToDB(invoice: Invoice): any {
    return {
      id: invoice.id,
      customer_id: invoice.customerId,
      date: invoice.date.toISOString(),
      due_date: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      total_amount: invoice.totalAmount,
      points_earned: invoice.pointsEarned,
      points_redeemed: invoice.pointsRedeemed,
      status: invoice.status,
      payment_method: invoice.paymentMethod,
      categories_count: invoice.categoriesCount
    };
  },

  // Convert App Invoice Item to DB Invoice Item
  invoiceItemToDB(item: InvoiceItem, invoiceId: string): any {
    return {
      invoice_id: invoiceId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      total_price: item.totalPrice,
      points_earned: item.pointsEarned
    };
  },

  // Convert App Payment to DB Payment
  paymentToDB(payment: Payment): any {
    return {
      id: payment.id,
      customer_id: payment.customerId,
      invoice_id: payment.invoiceId,
      amount: payment.amount,
      date: payment.date.toISOString(),
      method: payment.method,
      notes: payment.notes || null,
      type: payment.type
    };
  },

  // Convert App Redemption to DB Redemption
  redemptionToDB(redemption: Redemption): any {
    return {
      id: redemption.id,
      customer_id: redemption.customerId,
      date: redemption.date.toISOString(),
      total_points_redeemed: redemption.totalPointsRedeemed,
      status: redemption.status
    };
  },

  // Convert App Redemption Item to DB Redemption Item
  redemptionItemToDB(item: RedemptionItem, redemptionId: string): any {
    return {
      redemption_id: redemptionId,
      product_id: item.productId,
      quantity: item.quantity,
      points_required: item.pointsRequired,
      total_points_required: item.totalPointsRequired
    };
  }
};
