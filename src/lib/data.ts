
import { 
  Product, 
  Customer, 
  Invoice, 
  ProductCategory, 
  BusinessType, 
  InvoiceStatus, 
  PaymentMethod 
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
    classification: 2, // Purchases from 2 categories
    level: 3
  },
];

// Sample Invoices
export const invoices: Invoice[] = [
  {
    id: 'INV001',
    customerId: 'C001',
    date: new Date(2023, 5, 15),
    items: [
      { productId: 'P001', quantity: 5, price: 150, totalPrice: 750, pointsEarned: 75 },
      { productId: 'P003', quantity: 2, price: 80, totalPrice: 160, pointsEarned: 40 },
      { productId: 'P004', quantity: 3, price: 65, totalPrice: 195, pointsEarned: 30 }
    ],
    totalAmount: 1105,
    pointsEarned: 217, // 75% of total points because 3 categories
    pointsRedeemed: 0,
    status: InvoiceStatus.PAID,
    paymentMethod: PaymentMethod.CASH,
    categoriesCount: 3
  },
  {
    id: 'INV002',
    customerId: 'C002',
    date: new Date(2023, 5, 18),
    dueDate: new Date(2023, 6, 18),
    items: [
      { productId: 'P002', quantity: 10, price: 50, totalPrice: 500, pointsEarned: 25 },
      { productId: 'P005', quantity: 5, price: 45, totalPrice: 225, pointsEarned: 20 }
    ],
    totalAmount: 725,
    pointsEarned: 22.5, // 50% of total points because 2 categories
    pointsRedeemed: 0,
    status: InvoiceStatus.UNPAID,
    paymentMethod: PaymentMethod.CREDIT,
    categoriesCount: 2
  },
  {
    id: 'INV003',
    customerId: 'C003',
    date: new Date(2023, 5, 20),
    items: [
      { productId: 'P001', quantity: 2, price: 150, totalPrice: 300, pointsEarned: 75 }
    ],
    totalAmount: 300,
    pointsEarned: 37.5, // 25% of total points because 1 category
    pointsRedeemed: 0,
    status: InvoiceStatus.PAID,
    paymentMethod: PaymentMethod.CASH,
    categoriesCount: 1
  },
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

export const addProduct = (product: Product): void => {
  products.push(product);
};

export const addCustomer = (customer: Customer): void => {
  customers.push(customer);
};

export const addInvoice = (invoice: Invoice): void => {
  invoices.push(invoice);
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
