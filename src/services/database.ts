import { supabase } from '@/integrations/supabase/client';
import { 
  Product, 
  Customer, 
  Invoice, 
  Payment, 
  InvoiceItem, 
  Redemption, 
  RedemptionItem,
  PaymentType,
  InvoiceStatus,
  PaymentMethod
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

export const productsService = {
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
  
  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const dbProduct = appProductToDbProduct(product as Product);
    delete dbProduct.id;
    
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

export const customersService = {
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
  
  async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const dbCustomer = appCustomerToDbCustomer(customer);
    
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
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting customer with id ${id}:`, error);
      throw error;
    }
  },
  
  async updateCustomerData(customer: Customer): Promise<Customer> {
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
  }
};

export const paymentsService = {
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
  
  async create(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const dbPayment = appPaymentToDbPayment(payment);
    
    const paymentId = `PAY${Date.now().toString().slice(-6)}`;
    dbPayment.id = paymentId;
    
    if (dbPayment.date instanceof Date) {
      dbPayment.date = dbPayment.date.toISOString();
    }
    
    const { data, error } = await supabase
      .from('payments')
      .insert(dbPayment)
      .select()
      .single();
      
    if (error) throw error;
    
    if (payment.invoiceId) {
      await updateInvoiceStatusAfterPayment(payment.invoiceId, payment.customerId);
    }
    
    if (payment.customerId) {
      await updateCustomerCreditBalance(payment.customerId);
    }
    
    return dbPaymentToAppPayment(data);
  },
  
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
    
    if (payment.invoiceId) {
      await updateInvoiceStatusAfterPayment(payment.invoiceId, payment.customerId);
    }
    
    if (payment.customerId) {
      await updateCustomerCreditBalance(payment.customerId);
    }
    
    return dbPaymentToAppPayment(data);
  },
  
  async delete(id: string): Promise<void> {
    const { data: paymentData, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error(`Error fetching payment with id ${id}:`, fetchError);
      throw fetchError;
    }
    
    const payment = dbPaymentToAppPayment(paymentData);
    
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting payment with id ${id}:`, error);
      throw error;
    }
    
    if (payment.invoiceId) {
      await updateInvoiceStatusAfterPayment(payment.invoiceId, payment.customerId);
    }
    
    if (payment.customerId) {
      await updateCustomerCreditBalance(payment.customerId);
    }
  }
};

const updateInvoiceStatusAfterPayment = async (invoiceId: string, customerId: string): Promise<void> => {
  console.log(`Updating invoice status for invoice ${invoiceId}`);
  
  try {
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
      
    if (invoiceError) {
      console.error(`Error fetching invoice ${invoiceId}:`, invoiceError);
      throw invoiceError;
    }
    
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId);
      
    if (paymentsError) {
      console.error(`Error fetching payments for invoice ${invoiceId}:`, paymentsError);
      throw paymentsError;
    }
    
    const invoice = dbInvoiceToAppInvoice(invoiceData);
    const payments = paymentsData.map(dbPaymentToAppPayment);
    
    const totalPayments = payments.reduce((sum, payment) => {
      if (payment.type === 'payment') {
        return sum + payment.amount;
      } else if (payment.type === 'refund') {
        return sum - payment.amount;
      }
      return sum;
    }, 0);
    
    console.log(`Invoice ${invoiceId} - Total amount: ${invoice.totalAmount}, Total payments: ${totalPayments}`);
    
    let newStatus: InvoiceStatus;
    
    if (totalPayments >= invoice.totalAmount) {
      newStatus = InvoiceStatus.PAID;
    } else if (totalPayments > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    } else {
      newStatus = invoice.paymentMethod === PaymentMethod.CREDIT ? InvoiceStatus.UNPAID : InvoiceStatus.PAID;
    }
    
    const today = new Date();
    if (invoice.dueDate && today > new Date(invoice.dueDate) && totalPayments < invoice.totalAmount) {
      newStatus = InvoiceStatus.OVERDUE;
    }
    
    console.log(`Updating invoice ${invoiceId} status to: ${newStatus}`);
    
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoiceId);
      
    if (updateError) {
      console.error(`Error updating invoice ${invoiceId} status:`, updateError);
      throw updateError;
    }
    
    console.log(`Invoice ${invoiceId} status updated successfully to ${newStatus}`);
  } catch (error) {
    console.error(`Failed to update invoice status for ${invoiceId}:`, error);
    throw error;
  }
};

const updateCustomerCreditBalance = async (customerId: string): Promise<void> => {
  console.log(`Updating credit balance for customer ${customerId}`);
  
  try {
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .in('status', ['غير مدفوع', 'مدفوع جزئياً', 'متأخر']);
      
    if (invoicesError) {
      console.error(`Error fetching invoices for customer ${customerId}:`, invoicesError);
      throw invoicesError;
    }
    
    let totalAmountDue = 0;
    
    for (const invoiceData of invoicesData) {
      const invoice = dbInvoiceToAppInvoice(invoiceData);
      
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoice.id);
        
      if (paymentsError) {
        console.error(`Error fetching payments for invoice ${invoice.id}:`, paymentsError);
        throw paymentsError;
      }
      
      const payments = paymentsData.map(dbPaymentToAppPayment);
      
      const totalPaidForInvoice = payments.reduce((sum, payment) => {
        if (payment.type === 'payment') {
          return sum + payment.amount;
        } else if (payment.type === 'refund') {
          return sum - payment.amount;
        }
        return sum;
      }, 0);
      
      totalAmountDue += (invoice.totalAmount - totalPaidForInvoice);
    }
    
    console.log(`Customer ${customerId} - Total credit balance: ${totalAmountDue}`);
    
    const { error: updateError } = await supabase
      .from('customers')
      .update({ credit_balance: totalAmountDue })
      .eq('id', customerId);
      
    if (updateError) {
      console.error(`Error updating credit balance for customer ${customerId}:`, updateError);
      throw updateError;
    }
    
    console.log(`Credit balance for customer ${customerId} updated successfully to ${totalAmountDue}`);
  } catch (error) {
    console.error(`Failed to update credit balance for customer ${customerId}:`, error);
    throw error;
  }
};

export const invoicesService = {
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
  
  async create(invoice: Omit<Invoice, 'id'>, items: Omit<InvoiceItem, 'id' | 'invoiceId'>[]): Promise<Invoice> {
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
    
    if (invoice.paymentMethod === 'نقداً' && invoice.status === 'مدفوع') {
      const paymentId = `PAY${Date.now().toString().slice(-6)}`;
      const payment = {
        id: paymentId,
        customer_id: invoice.customerId,
        invoice_id: invoiceId,
        amount: invoice.totalAmount,
        date: invoice.date instanceof Date ? invoice.date.toISOString() : invoice.date,
        method: 'cash',
        type: PaymentType.PAYMENT,
        notes: 'تم الدفع عند إنشاء الفاتورة'
      };
      
      await supabase.from('payments').insert(payment);
    }
    
    return this.getById(invoiceId);
  },
  
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
  
  async delete(id: string): Promise<void> {
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);
      
    if (itemsError) {
      console.error(`Error deleting invoice items for invoice ${id}:`, itemsError);
      throw itemsError;
    }
    
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

export const redemptionsService = {
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
  
  async create(redemption: Omit<Redemption, 'id'>, items: Omit<RedemptionItem, 'id'>[]): Promise<Redemption> {
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
    
    return this.getById(redemptionId);
  },
  
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
  
  async delete(id: string): Promise<void> {
    const { error: itemsError } = await supabase
      .from('redemption_items')
      .delete()
      .eq('redemption_id', id);
      
    if (itemsError) {
      console.error(`Error deleting redemption items for redemption ${id}:`, itemsError);
      throw itemsError;
    }
    
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
