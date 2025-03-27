import { supabase } from '@/integrations/supabase/client';
import { 
  Product, 
  Customer, 
  Invoice, 
  Payment, 
  InvoiceItem, 
  Redemption, 
  RedemptionItem,
  PaymentType
} from '@/lib/types';
import { 
  dbProductToAppProduct, 
  appProductToDbProduct,
  dbCustomerToAppCustomer,
  appCustomerToDbCustomer,
  dbInvoiceToAppInvoice,
  appInvoiceToDbInvoice,
  dbInvoiceItemToAppInvoiceItem,
  appInvoiceItemToDbInvoiceItem,
  dbPaymentToAppPayment,
  appPaymentToDbPayment,
  dbRedemptionToAppRedemption,
  appRedemptionToDbRedemption,
  dbRedemptionItemToAppRedemptionItem,
  appRedemptionItemToDbRedemptionItem
} from '@/lib/adapters';

// خدمات المنتجات
export const productsService = {
  // الحصول على جميع المنتجات
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    return data.map(dbProductToAppProduct);
  },
  
  // الحصول على منتج بواسطة المعرف
  async getById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
    
    return dbProductToAppProduct(data);
  },
  
  // إنشاء منتج جديد
  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const dbProduct = appProductToDbProduct(product as Product);
    delete dbProduct.id; // حذف المعرف لأننا نريد أن يتم إنشاؤه تلقائيًا
    
    const { data, error } = await supabase
      .from('products')
      .insert(dbProduct)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    
    return dbProductToAppProduct(data);
  },
  
  // تحديث منتج
  async update(product: Product): Promise<Product> {
    const dbProduct = appProductToDbProduct(product);
    
    const { data, error } = await supabase
      .from('products')
      .update(dbProduct)
      .eq('id', product.id)
      .select('*')
      .single();
      
    if (error) {
      console.error(`Error updating product with id ${product.id}:`, error);
      throw error;
    }
    
    return dbProductToAppProduct(data);
  },
  
  // حذف منتج
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting product with id ${id}:`, error);
      throw error;
    }
  }
};

// خدمات العملاء
export const customersService = {
  // الحصول على جميع العملاء
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
    
    return data.map(dbCustomerToAppCustomer);
  },
  
  // الحصول على عميل بواسطة المعرف
  async getById(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching customer with id ${id}:`, error);
      throw error;
    }
    
    return dbCustomerToAppCustomer(data);
  },
  
  // إنشاء عميل جديد
  async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const dbCustomer = appCustomerToDbCustomer(customer);
    
    // تأكد من إنشاء معرّف فريد للعميل الجديد
    const customerId = `CUST${Date.now().toString().slice(-6)}`;
    dbCustomer.id = customerId;
    
    const { data, error } = await supabase
      .from('customers')
      .insert(dbCustomer)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
    
    return dbCustomerToAppCustomer(data);
  },
  
  // تحديث عميل
  async update(customer: Customer): Promise<Customer> {
    const dbCustomer = appCustomerToDbCustomer(customer);
    
    const { data, error } = await supabase
      .from('customers')
      .update(dbCustomer)
      .eq('id', customer.id)
      .select('*')
      .single();
      
    if (error) {
      console.error(`Error updating customer with id ${customer.id}:`, error);
      throw error;
    }
    
    return dbCustomerToAppCustomer(data);
  },
  
  // حذف عميل
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting customer with id ${id}:`, error);
      throw error;
    }
  }
};

// خدمات الفواتير
export const invoicesService = {
  // الحصول على جميع الفواتير مع العناصر والمدفوعات
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*),
        payments:payments(*)
      `)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
    
    return data.map(dbInvoiceToAppInvoice);
  },
  
  // الحصول على الفواتير حسب معرف العميل
  async getByCustomerId(customerId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*),
        payments:payments(*)
      `)
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
      
    if (error) {
      console.error(`Error fetching invoices for customer ${customerId}:`, error);
      throw error;
    }
    
    return data.map(dbInvoiceToAppInvoice);
  },
  
  // الحصول على فاتورة بواسطة المعرف
  async getById(id: string): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items(*),
        payments:payments(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching invoice with id ${id}:`, error);
      throw error;
    }
    
    return dbInvoiceToAppInvoice(data);
  },
  
  // إنشاء فاتورة جديدة مع العناصر
  async create(invoice: Omit<Invoice, 'id'>, items: Omit<InvoiceItem, 'id'>[]): Promise<Invoice> {
    // بدء معاملة قاعدة البيانات
    
    // إنشاء معرّف فريد للفاتورة
    const invoiceId = `INV${Date.now().toString().slice(-6)}`;
    const dbInvoice = appInvoiceToDbInvoice({ ...invoice, id: invoiceId });
    
    const { data: createdInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert(dbInvoice)
      .select('*')
      .single();
      
    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      throw invoiceError;
    }
    
    // إضافة عناصر الفاتورة
    if (items.length > 0) {
      const invoiceItems = items.map(item => ({
        ...appInvoiceItemToDbInvoiceItem(item),
        invoice_id: invoiceId
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);
        
      if (itemsError) {
        console.error('Error adding invoice items:', itemsError);
        throw itemsError;
      }
    }
    
    // إذا كانت الفاتورة مدفوعة نقدًا، أضف سجل دفع
    if (invoice.paymentMethod === 'نقداً' && invoice.status === 'مدفوع') {
      const payment = {
        customer_id: invoice.customerId,
        invoice_id: invoiceId,
        amount: invoice.totalAmount,
        date: invoice.date instanceof Date ? invoice.date.toISOString() : invoice.date,
        method: 'نقداً',
        type: PaymentType.PAYMENT,
        notes: 'دفع مع الفاتورة'
      };
      
      const { error: paymentError } = await supabase
        .from('payments')
        .insert(payment)
        .select('*')
        .single();
        
      if (paymentError) {
        console.error('Error adding payment record:', paymentError);
        throw paymentError;
      }
    }
    
    // الحصول على الفاتورة الكاملة بعد الإنشاء
    return this.getById(invoiceId);
  },
  
  // تحديث فاتورة
  async update(invoice: Invoice): Promise<Invoice> {
    const dbInvoice = appInvoiceToDbInvoice(invoice);
    
    const { data, error } = await supabase
      .from('invoices')
      .update(dbInvoice)
      .eq('id', invoice.id)
      .select('*')
      .single();
      
    if (error) {
      console.error(`Error updating invoice with id ${invoice.id}:`, error);
      throw error;
    }
    
    return dbInvoiceToAppInvoice({
      ...data,
      items: invoice.items,
      payments: invoice.payments
    });
  },
  
  // حذف فاتورة
  async delete(id: string): Promise<void> {
    // حذف عناصر الفاتورة أولاً
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);
      
    if (itemsError) {
      console.error(`Error deleting invoice items for invoice ${id}:`, itemsError);
      throw itemsError;
    }
    
    // ثم حذف الفاتورة
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting invoice with id ${id}:`, error);
      throw error;
    }
  }
};

// خدمات المدفوعات
export const paymentsService = {
  // الحصول على جميع المدفوعات
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
    
    return data.map(dbPaymentToAppPayment);
  },
  
  // الحصول على مدفوعات عميل
  async getByCustomerId(customerId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
      
    if (error) {
      console.error(`Error fetching payments for customer ${customerId}:`, error);
      throw error;
    }
    
    return data.map(dbPaymentToAppPayment);
  },
  
  // الحصول على مدفوعات فاتورة
  async getByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('date', { ascending: false });
      
    if (error) {
      console.error(`Error fetching payments for invoice ${invoiceId}:`, error);
      throw error;
    }
    
    return data.map(dbPaymentToAppPayment);
  },
  
  // إنشاء دفعة جديدة
  async create(payment: Omit<Payment, 'id'>): Promise<Payment> {
    // إنشاء معرّف فريد للدفعة
    const paymentId = `PAY${Date.now().toString().slice(-6)}`;
    const dbPayment = appPaymentToDbPayment({ ...payment, id: paymentId });
    
    const { data, error } = await supabase
      .from('payments')
      .insert(dbPayment)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
    
    return dbPaymentToAppPayment(data);
  },
  
  // تحديث دفعة
  async update(payment: Payment): Promise<Payment> {
    const dbPayment = appPaymentToDbPayment(payment);
    
    const { data, error } = await supabase
      .from('payments')
      .update(dbPayment)
      .eq('id', payment.id)
      .select('*')
      .single();
      
    if (error) {
      console.error(`Error updating payment with id ${payment.id}:`, error);
      throw error;
    }
    
    return dbPaymentToAppPayment(data);
  },
  
  // حذف دفعة
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting payment with id ${id}:`, error);
      throw error;
    }
  }
};

// خدمات عمليات استبدال النقاط
export const redemptionsService = {
  // الحصول على جميع عمليات استبدال النقاط
  async getAll(): Promise<Redemption[]> {
    const { data, error } = await supabase
      .from('redemptions')
      .select(`
        *,
        items:redemption_items(*)
      `)
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching redemptions:', error);
      throw error;
    }
    
    return data.map(dbRedemptionToAppRedemption);
  },
  
  // الحصول على عمليات استبدال النقاط لعميل
  async getByCustomerId(customerId: string): Promise<Redemption[]> {
    const { data, error } = await supabase
      .from('redemptions')
      .select(`
        *,
        items:redemption_items(*)
      `)
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
      
    if (error) {
      console.error(`Error fetching redemptions for customer ${customerId}:`, error);
      throw error;
    }
    
    return data.map(dbRedemptionToAppRedemption);
  },
  
  // الحصول على عملية استبدال نقاط بواسطة المعرف
  async getById(id: string): Promise<Redemption> {
    const { data, error } = await supabase
      .from('redemptions')
      .select(`
        *,
        items:redemption_items(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching redemption with id ${id}:`, error);
      throw error;
    }
    
    return dbRedemptionToAppRedemption(data);
  },
  
  // إنشاء عملية استبدال نقاط جديدة
  async create(redemption: Omit<Redemption, 'id'>, items: Omit<RedemptionItem, 'id'>[]): Promise<Redemption> {
    // إنشاء معرّف فريد لعملية الاستبدال
    const redemptionId = `RED${Date.now().toString().slice(-6)}`;
    const dbRedemption = appRedemptionToDbRedemption({ ...redemption, id: redemptionId });
    
    const { data, error: redemptionError } = await supabase
      .from('redemptions')
      .insert(dbRedemption)
      .select('*')
      .single();
      
    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError);
      throw redemptionError;
    }
    
    // إضافة عناصر الاستبدال
    if (items.length > 0) {
      const redemptionItems = items.map(item => ({
        ...appRedemptionItemToDbRedemptionItem(item),
        redemption_id: redemptionId
      }));
      
      const { error: itemsError } = await supabase
        .from('redemption_items')
        .insert(redemptionItems);
        
      if (itemsError) {
        console.error('Error adding redemption items:', itemsError);
        throw itemsError;
      }
    }
    
    // الحصول على عملية الاستبدال الكاملة بعد الإنشاء
    return this.getById(redemptionId);
  },
  
  // تحديث عملية استبدال نقاط
  async update(redemption: Redemption): Promise<Redemption> {
    const dbRedemption = appRedemptionToDbRedemption(redemption);
    
    const { data, error } = await supabase
      .from('redemptions')
      .update(dbRedemption)
      .eq('id', redemption.id)
      .select('*')
      .single();
      
    if (error) {
      console.error(`Error updating redemption with id ${redemption.id}:`, error);
      throw error;
    }
    
    return dbRedemptionToAppRedemption({
      ...data,
      items: redemption.items
    });
  },
  
  // حذف عملية استبدال نقاط
  async delete(id: string): Promise<void> {
    // حذف عناصر الاستبدال أولاً
    const { error: itemsError } = await supabase
      .from('redemption_items')
      .delete()
      .eq('redemption_id', id);
      
    if (itemsError) {
      console.error(`Error deleting redemption items for redemption ${id}:`, itemsError);
      throw itemsError;
    }
    
    // ثم حذف عملية الاستبدال
    const { error } = await supabase
      .from('redemptions')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting redemption with id ${id}:`, error);
      throw error;
    }
  }
};
