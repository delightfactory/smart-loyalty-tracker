import { 
  Product, 
  Customer, 
  Invoice, 
  ProductCategory, 
  BusinessType, 
  InvoiceStatus, 
  PaymentMethod,
  Payment,
  Redemption,
  PaymentType,
  RedemptionStatus
} from './types';

// Sample Products
export const products: Product[] = [
  {
    id: 'P001',
    name: 'زيت محرك سوبر بريميوم',
    unit: 'لتر',
    category: ProductCategory.ENGINE_CARE,
    price: 150,
    pointsEarned: 75,
    pointsRequired: 200,
    brand: 'موبيل'
  },
  {
    id: 'P002',
    name: 'فلتر زيت',
    unit: 'قطعة',
    category: ProductCategory.ENGINE_CARE,
    price: 50,
    pointsEarned: 25,
    pointsRequired: 100,
    brand: 'بوش'
  },
  {
    id: 'P003',
    name: 'شامبو سيارات ممتاز',
    unit: 'لتر',
    category: ProductCategory.EXTERIOR_CARE,
    price: 80,
    pointsEarned: 40,
    pointsRequired: 120,
    brand: 'تيرتل واكس'
  },
  {
    id: 'P004',
    name: 'ملمع إطارات',
    unit: 'علبة',
    category: ProductCategory.TIRE_CARE,
    price: 65,
    pointsEarned: 30,
    pointsRequired: 90,
    brand: 'آرمور أول'
  },
  {
    id: 'P005',
    name: 'معطر داخلي فاخر',
    unit: 'قطعة',
    category: ProductCategory.INTERIOR_CARE,
    price: 45,
    pointsEarned: 20,
    pointsRequired: 60,
    brand: 'ليتل تريز'
  },
  {
    id: 'P006',
    name: 'منظف تابلوه',
    unit: 'علبة',
    category: ProductCategory.DASHBOARD_CARE,
    price: 55,
    pointsEarned: 25,
    pointsRequired: 75,
    brand: 'آرمور أول'
  },
  {
    id: 'P007',
    name: 'شمع حماية',
    unit: 'علبة',
    category: ProductCategory.EXTERIOR_CARE,
    price: 120,
    pointsEarned: 60,
    pointsRequired: 180,
    brand: 'تيرتل واكس'
  },
  {
    id: 'P008',
    name: 'فلتر هواء',
    unit: 'قطعة',
    category: ProductCategory.ENGINE_CARE,
    price: 60,
    pointsEarned: 30,
    pointsRequired: 100,
    brand: 'بوش'
  },
  {
    id: 'P009',
    name: 'منظف جلد',
    unit: 'علبة',
    category: ProductCategory.INTERIOR_CARE,
    price: 75,
    pointsEarned: 35,
    pointsRequired: 110,
    brand: 'ماجويرز'
  },
  {
    id: 'P010',
    name: 'منظف زجاج',
    unit: 'علبة',
    category: ProductCategory.EXTERIOR_CARE,
    price: 45,
    pointsEarned: 20,
    pointsRequired: 70,
    brand: 'رين-إكس'
  },
];

// Sample Customers
export const customers: Customer[] = [
  {
    id: 'C001',
    name: 'مركز الأمل للسيارات',
    contactPerson: 'أحمد محمد',
    phone: '0123456789',
    businessType: BusinessType.SERVICE_CENTER,
    pointsEarned: 1200,
    pointsRedeemed: 300,
    currentPoints: 900,
    creditBalance: 0,
    openingBalance: 0,
    classification: 4, // Purchases from 4 categories
    level: 1 // Top customer
  },
  {
    id: 'C002',
    name: 'معرض النجم',
    contactPerson: 'محمود خالد',
    phone: '0198765432',
    businessType: BusinessType.CAR_SHOWROOM,
    pointsEarned: 850,
    pointsRedeemed: 150,
    currentPoints: 700,
    creditBalance: 500,
    openingBalance: 0,
    classification: 3, // Purchases from 3 categories
    level: 2
  },
  {
    id: 'C003',
    name: 'محطة الواحة',
    contactPerson: 'سمير علي',
    phone: '0112233445',
    businessType: BusinessType.GAS_STATION,
    pointsEarned: 500,
    pointsRedeemed: 100,
    currentPoints: 400,
    creditBalance: 200,
    openingBalance: 0,
    classification: 2, // Purchases from 2 categories
    level: 3
  },
  {
    id: 'C004',
    name: 'صيانة السريع',
    contactPerson: 'هاني محمود',
    phone: '0109876543',
    businessType: BusinessType.MAINTENANCE_CENTER,
    pointsEarned: 1800,
    pointsRedeemed: 500,
    currentPoints: 1300,
    creditBalance: 800,
    openingBalance: 0,
    classification: 5, // Purchases from all 5 categories
    level: 4
  },
  {
    id: 'C005',
    name: 'كماليات الفخامة',
    contactPerson: 'رامي عادل',
    phone: '0111223344',
    businessType: BusinessType.ACCESSORIES_SHOP,
    pointsEarned: 350,
    pointsRedeemed: 0,
    currentPoints: 350,
    creditBalance: 100,
    openingBalance: 0,
    classification: 1, // Purchases from 1 category
    level: 5
  },
];

// Sample Payments
export const payments: Payment[] = [
  {
    id: 'PAY001',
    customerId: 'C001',
    invoiceId: 'INV001',
    amount: 500,
    date: new Date(2023, 5, 16),
    method: 'نقداً',
    notes: 'دفعة أولى',
    type: PaymentType.PAYMENT
  },
  {
    id: 'PAY002',
    customerId: 'C001',
    invoiceId: 'INV001',
    amount: 605,
    date: new Date(2023, 5, 20),
    method: 'تحويل بنكي',
    notes: 'تسوية نهائية',
    type: PaymentType.PAYMENT
  },
  {
    id: 'PAY003',
    customerId: 'C002',
    invoiceId: 'INV002',
    amount: 300,
    date: new Date(2023, 5, 25),
    method: 'نقداً',
    notes: 'دفعة جزئية',
    type: PaymentType.PAYMENT
  },
  {
    id: 'PAY004',
    customerId: 'C003',
    invoiceId: 'INV003',
    amount: 300,
    date: new Date(2023, 5, 20),
    method: 'نقداً',
    notes: 'دفعة كاملة',
    type: PaymentType.PAYMENT
  },
  {
    id: 'REF001',
    customerId: 'C001',
    invoiceId: 'INV001',
    amount: 100,
    date: new Date(2023, 5, 25),
    method: 'نقداً',
    notes: 'استرجاع منتج معيب',
    type: PaymentType.REFUND
  },
];

// Sample Redemptions
export const redemptions: Redemption[] = [
  {
    id: 'RED001',
    customerId: 'C001',
    date: new Date(2023, 6, 1),
    items: [
      {
        productId: 'P003',
        quantity: 2,
        pointsRequired: 120,
        totalPointsRequired: 240
      }
    ],
    totalPointsRedeemed: 240,
    status: RedemptionStatus.COMPLETED
  },
  {
    id: 'RED002',
    customerId: 'C002',
    date: new Date(2023, 6, 5),
    items: [
      {
        productId: 'P005',
        quantity: 1,
        pointsRequired: 60,
        totalPointsRequired: 60
      },
      {
        productId: 'P004',
        quantity: 1,
        pointsRequired: 90,
        totalPointsRequired: 90
      }
    ],
    totalPointsRedeemed: 150,
    status: RedemptionStatus.COMPLETED
  }
];

// Sample Invoices
export const invoices: Invoice[] = [
  {
    id: 'INV001',
    customerId: 'C001',
    date: new Date(2023, 5, 15),
    items: [
      { productId: 'P001', quantity: 5, price: 150, totalPrice: 750, pointsEarned: 375 },
      { productId: 'P003', quantity: 2, price: 80, totalPrice: 160, pointsEarned: 80 },
      { productId: 'P004', quantity: 3, price: 65, totalPrice: 195, pointsEarned: 90 }
    ],
    totalAmount: 1105,
    pointsEarned: 217, // 75% of total points because 3 categories
    pointsRedeemed: 0,
    status: InvoiceStatus.PAID,
    paymentMethod: PaymentMethod.CASH,
    categoriesCount: 3,
    payments: [
      {
        id: 'PAY001',
        customerId: 'C001',
        invoiceId: 'INV001',
        amount: 500,
        date: new Date(2023, 5, 16),
        method: 'نقداً',
        notes: 'دفعة أولى',
        type: PaymentType.PAYMENT
      },
      {
        id: 'PAY002',
        customerId: 'C001',
        invoiceId: 'INV001',
        amount: 605,
        date: new Date(2023, 5, 20),
        method: 'تحويل بنكي',
        notes: 'تسوية نهائية',
        type: PaymentType.PAYMENT
      },
      {
        id: 'REF001',
        customerId: 'C001',
        invoiceId: 'INV001',
        amount: 100,
        date: new Date(2023, 5, 25),
        method: 'نقداً',
        notes: 'استرجاع منتج معيب',
        type: PaymentType.REFUND
      }
    ]
  },
  {
    id: 'INV002',
    customerId: 'C002',
    date: new Date(2023, 5, 18),
    dueDate: new Date(2023, 6, 18),
    items: [
      { productId: 'P002', quantity: 10, price: 50, totalPrice: 500, pointsEarned: 250 },
      { productId: 'P005', quantity: 5, price: 45, totalPrice: 225, pointsEarned: 100 }
    ],
    totalAmount: 725,
    pointsEarned: 175, // 50% of total points because 2 categories
    pointsRedeemed: 0,
    status: InvoiceStatus.PARTIALLY_PAID,
    paymentMethod: PaymentMethod.CREDIT,
    categoriesCount: 2,
    payments: [
      {
        id: 'PAY003',
        customerId: 'C002',
        invoiceId: 'INV002',
        amount: 300,
        date: new Date(2023, 5, 25),
        method: 'نقداً',
        notes: 'دفعة جزئية',
        type: PaymentType.PAYMENT
      }
    ]
  },
  {
    id: 'INV003',
    customerId: 'C003',
    date: new Date(2023, 5, 20),
    items: [
      { productId: 'P001', quantity: 2, price: 150, totalPrice: 300, pointsEarned: 150 }
    ],
    totalAmount: 300,
    pointsEarned: 37.5, // 25% of total points because 1 category
    pointsRedeemed: 0,
    status: InvoiceStatus.PAID,
    paymentMethod: PaymentMethod.CASH,
    categoriesCount: 1,
    payments: [
      {
        id: 'PAY004',
        customerId: 'C003',
        invoiceId: 'INV003',
        amount: 300,
        date: new Date(2023, 5, 20),
        method: 'نقداً',
        notes: 'دفعة كاملة',
        type: PaymentType.PAYMENT
      }
    ]
  },
  {
    id: 'INV004',
    customerId: 'C001',
    date: new Date(2023, 6, 5),
    items: [
      { productId: 'P006', quantity: 3, price: 55, totalPrice: 165, pointsEarned: 75 },
      { productId: 'P007', quantity: 1, price: 120, totalPrice: 120, pointsEarned: 60 },
      { productId: 'P010', quantity: 2, price: 45, totalPrice: 90, pointsEarned: 40 }
    ],
    totalAmount: 375,
    pointsEarned: 131.25, // 75% of total points for 3 categories
    pointsRedeemed: 0,
    status: InvoiceStatus.PAID,
    paymentMethod: PaymentMethod.CASH,
    categoriesCount: 3
  },
  {
    id: 'INV005',
    customerId: 'C004',
    date: new Date(2023, 6, 8),
    dueDate: new Date(2023, 7, 8),
    items: [
      { productId: 'P001', quantity: 10, price: 150, totalPrice: 1500, pointsEarned: 750 },
      { productId: 'P002', quantity: 20, price: 50, totalPrice: 1000, pointsEarned: 500 },
      { productId: 'P008', quantity: 15, price: 60, totalPrice: 900, pointsEarned: 450 }
    ],
    totalAmount: 3400,
    pointsEarned: 850, // 50% of total points for 1 category (all products are ENGINE_CARE)
    pointsRedeemed: 0,
    status: InvoiceStatus.UNPAID,
    paymentMethod: PaymentMethod.CREDIT,
    categoriesCount: 1
  }
];

// Helper Functions
export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(customer => customer.id === id);
};

export const getInvoiceById = (id: string): Invoice | undefined => {
  return invoices.find(invoice => invoice.id === id);
};

export const getInvoicesByCustomerId = (customerId: string): Invoice[] => {
  return invoices.filter(invoice => invoice.customerId === customerId);
};

export const getPaymentsByCustomerId = (customerId: string): Payment[] => {
  return payments.filter(payment => payment.customerId === customerId);
};

export const getPaymentsByInvoiceId = (invoiceId: string): Payment[] => {
  return payments.filter(payment => payment.invoiceId === invoiceId);
};

export const getRedemptionsByCustomerId = (customerId: string): Redemption[] => {
  return redemptions.filter(redemption => redemption.customerId === customerId);
};

export const addProduct = (product: Product): void => {
  products.push(product);
};

export const addCustomer = (customer: Customer): void => {
  customers.push(customer);
};

export const addInvoice = (invoice: Invoice): void => {
  invoices.push(invoice);
};

export const addPayment = (payment: Payment): void => {
  payments.push(payment);
  
  // If this payment is related to an invoice, update invoice status
  if (payment.invoiceId) {
    updateInvoiceStatusAfterPayment(payment.invoiceId);
  }
  
  // Update customer's credit balance
  if (payment.customerId) {
    updateCustomerCreditBalance(payment.customerId);
  }
};

export const addRedemption = (redemption: Redemption): void => {
  redemptions.push(redemption);
  
  // Update customer's points
  const customer = getCustomerById(redemption.customerId);
  if (customer && redemption.status === 'completed') {
    customer.pointsRedeemed += redemption.totalPointsRedeemed;
    customer.currentPoints = customer.pointsEarned - customer.pointsRedeemed;
    updateCustomer(customer);
  }
};

export const updateProduct = (updatedProduct: Product): void => {
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
  }
};

export const updateCustomer = (updatedCustomer: Customer): void => {
  const index = customers.findIndex(c => c.id === updatedCustomer.id);
  if (index !== -1) {
    customers[index] = updatedCustomer;
  }
};

export const updateInvoice = (updatedInvoice: Invoice): void => {
  const index = invoices.findIndex(i => i.id === updatedInvoice.id);
  if (index !== -1) {
    invoices[index] = updatedInvoice;
  }
};

export const updatePayment = (updatedPayment: Payment): void => {
  const index = payments.findIndex(p => p.id === updatedPayment.id);
  if (index !== -1) {
    payments[index] = updatedPayment;
    
    // Update related entities
    if (updatedPayment.invoiceId) {
      updateInvoiceStatusAfterPayment(updatedPayment.invoiceId);
    }
    
    if (updatedPayment.customerId) {
      updateCustomerCreditBalance(updatedPayment.customerId);
    }
  }
};

export const updateRedemption = (updatedRedemption: Redemption): void => {
  const index = redemptions.findIndex(r => r.id === updatedRedemption.id);
  if (index !== -1) {
    const oldRedemption = redemptions[index];
    redemptions[index] = updatedRedemption;
    
    // Update customer points if status changed
    if (oldRedemption.status !== updatedRedemption.status) {
      const customer = getCustomerById(updatedRedemption.customerId);
      if (customer) {
        if (oldRedemption.status === 'completed' && updatedRedemption.status !== 'completed') {
          // Reverting points from a completed redemption
          customer.pointsRedeemed -= oldRedemption.totalPointsRedeemed;
        } else if (oldRedemption.status !== 'completed' && updatedRedemption.status === 'completed') {
          // Adding points for a newly completed redemption
          customer.pointsRedeemed += updatedRedemption.totalPointsRedeemed;
        }
        
        customer.currentPoints = customer.pointsEarned - customer.pointsRedeemed;
        updateCustomer(customer);
      }
    }
  }
};

// Helper function to update invoice status after a payment
const updateInvoiceStatusAfterPayment = (invoiceId: string): void => {
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) return;
  
  const relatedPayments = getPaymentsByInvoiceId(invoiceId);
  
  // Calculate total payments (payments minus refunds)
  const totalPayments = relatedPayments.reduce((sum, payment) => {
    if (payment.type === 'payment') {
      return sum + payment.amount;
    } else if (payment.type === 'refund') {
      return sum - payment.amount;
    }
    return sum;
  }, 0);
  
  // Determine new status based on payment amount
  let newStatus: InvoiceStatus;
  
  if (totalPayments >= invoice.totalAmount) {
    newStatus = InvoiceStatus.PAID;
  } else if (totalPayments > 0) {
    newStatus = InvoiceStatus.PARTIALLY_PAID;
  } else {
    newStatus = invoice.paymentMethod === PaymentMethod.CREDIT ? InvoiceStatus.UNPAID : InvoiceStatus.PAID;
  }
  
  // Check if invoice is overdue
  const today = new Date();
  if (invoice.dueDate && today > invoice.dueDate && totalPayments < invoice.totalAmount) {
    newStatus = InvoiceStatus.OVERDUE;
  }
  
  // Update invoice status
  if (invoice.status !== newStatus) {
    invoice.status = newStatus;
    updateInvoice(invoice);
  }
};

// Helper function to update customer credit balance
const updateCustomerCreditBalance = (customerId: string): void => {
  const customer = getCustomerById(customerId);
  if (!customer) return;
  
  // Get all unpaid or partially paid invoices
  const unpaidInvoices = getInvoicesByCustomerId(customerId).filter(
    invoice => invoice.status === InvoiceStatus.UNPAID || 
               invoice.status === InvoiceStatus.PARTIALLY_PAID ||
               invoice.status === InvoiceStatus.OVERDUE
  );
  
  // Calculate total amount due
  let totalAmountDue = 0;
  
  for (const invoice of unpaidInvoices) {
    const paymentsForInvoice = getPaymentsByInvoiceId(invoice.id);
    const totalPaidForInvoice = paymentsForInvoice.reduce((sum, payment) => {
      if (payment.type === 'payment') {
        return sum + payment.amount;
      } else if (payment.type === 'refund') {
        return sum - payment.amount;
      }
      return sum;
    }, 0);
    
    totalAmountDue += (invoice.totalAmount - totalPaidForInvoice);
  }
  
  // Update customer credit balance including opening balance
  customer.creditBalance = totalAmountDue + (customer.openingBalance ?? 0);
  updateCustomer(customer);
};
