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
  PaymentMethod,
  RedemptionStatus,
  BusinessType
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
import { supabase } from '@/integrations/supabase/client';
import { Constants } from '@/integrations/supabase/types';

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
    
    // Make sure all numeric fields are properly handled
    if (dbProduct.points_required === undefined) {
      dbProduct.points_required = 0;
    }
    
    if (dbProduct.points_earned === undefined) {
      dbProduct.points_earned = 0;
    }
    
    if (dbProduct.price === undefined) {
      dbProduct.price = 0;
    }
    
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
  },
  
  async search(query: string, limit: number = 10): Promise<Product[]> {
    if (!query) return [];
    const qLower = query.toLowerCase();
    // البحث في الحقول id, name, brand، والفئات إن وجدت
    const matchingCategories = Constants.public.Enums.product_category.filter(label => label.toLowerCase().includes(qLower));
    const clauses = [
      `name.ilike.%${qLower}%`,
      `brand.ilike.%${qLower}%`,
    ];
    if (matchingCategories.length) {
      const inList = matchingCategories.map(label => `'${label}'`).join(',');
      clauses.push(`category.in.(${inList})`);
    }
    const orFilter = clauses.join(',');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(orFilter)
      .order('name')
      .limit(limit);
    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }
    return data.map(dbProductToAppProduct);
  }
};

export const customersService = {
  async getAll(): Promise<Customer[]> {
    const allRaw: any[] = [];
    const batchSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')
        .range(from, from + batchSize - 1);
      if (error) {
        console.error('Error fetching customers batch:', error);
        throw error;
      }
      if (!data || data.length === 0) break;
      allRaw.push(...data);
      if (data.length < batchSize) break;
      from += batchSize;
    }
    return allRaw.map(dbCustomerToAppCustomer);
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
  
  async create(customer: Customer): Promise<Customer> {
    const dbCustomer = appCustomerToDbCustomer(customer);

    const { data, error } = await supabase
      .from('customers')
      .insert(dbCustomer)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    const createdCustomer = dbCustomerToAppCustomer(data);
    // Initialize credit balance based on opening balance
    await updateCustomerCreditBalance(createdCustomer.id);
    // Fetch updated record
    return await this.getById(createdCustomer.id);
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

    const updatedCustomer = dbCustomerToAppCustomer(data);
    // Recalculate credit balance after update
    await updateCustomerCreditBalance(updatedCustomer.id);
    // Fetch updated record
    return await this.getById(updatedCustomer.id);
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
  },
  
  async search(query: string, limit: number = 10): Promise<Customer[]> {
    if (!query) return [];
    const searchLower = query.toLowerCase();
    const searchDigits = query.replace(/\D/g, '');
    // البحث عبر كافة حقول العميل
    const clauses = [
      `name.ilike.%${searchLower}%`,
      `contact_person.ilike.%${searchLower}%`,
      `governorate.ilike.%${searchLower}%`,
      `city.ilike.%${searchLower}%`,
      `phone.ilike.%${searchDigits}%`
    ];
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(clauses.join(','))
      .order('name')
      .limit(limit);
    if (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
    return data.map(dbCustomerToAppCustomer);
  },
  
  async getPaginated(
    pageIndex: number,
    pageSize: number,
    searchTerm?: string,
    businessType?: string,
    governorate?: string,
    city?: string
  ): Promise<{ items: Customer[]; total: number }> {
    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;
    let qb = supabase
      .from('customers')
      .select(
        'id,name,contact_person,phone,business_type,governorate,city,current_points,points_earned,points_redeemed,classification,level,credit_balance,opening_balance,credit_period,credit_limit',
        { count: 'exact' }
      );
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchDigits = searchTerm.replace(/\D/g, '');
      const isNumericSearch = /^\d+$/.test(searchTerm);
      if (isNumericSearch) {
        // بحث بالكود (id) أولاً
        const selectCols = 'id,name,contact_person,phone,business_type,governorate,city,current_points,points_earned,points_redeemed,classification,level,credit_balance,opening_balance,credit_period,credit_limit';
        // جلب عن طريق id
        let idQb = supabase
          .from('customers')
          .select(selectCols, { count: 'exact' })
          .eq('id', searchTerm);
        if (businessType && businessType !== 'all') idQb = idQb.eq('business_type', businessType as BusinessType);
        if (governorate && governorate !== 'all') idQb = idQb.eq('governorate', governorate);
        if (city && city !== 'all') idQb = idQb.eq('city', city);
        const { data: idData, error: idError } = await idQb;
        if (idError) throw idError;
        const itemsById = idData.map(dbCustomerToAppCustomer);
        // جلب عن طريق الهاتف
        let phoneQb = supabase
          .from('customers')
          .select(selectCols, { count: 'exact' })
          .ilike('phone', `%${searchDigits}%`);
        if (businessType && businessType !== 'all') phoneQb = phoneQb.eq('business_type', businessType as BusinessType);
        if (governorate && governorate !== 'all') phoneQb = phoneQb.eq('governorate', governorate);
        if (city && city !== 'all') phoneQb = phoneQb.eq('city', city);
        const { data: phoneData, error: phoneError, count: phoneCount } = await phoneQb
          .order('name')
          .range(from, to);
        if (phoneError) throw phoneError;
        const itemsPhone = phoneData.map(dbCustomerToAppCustomer);
        return {
          items: [...itemsById, ...itemsPhone],
          total: itemsById.length + (phoneCount || 0)
        };
      } else {
        const q = `%${searchLower}%`;
        qb = qb.or(
          `name.ilike.${q},contact_person.ilike.${q},governorate.ilike.${q},city.ilike.${q},phone.ilike.%${searchDigits}%`
        );
      }
    }
    if (businessType && businessType !== 'all')
      qb = qb.eq('business_type', businessType as BusinessType);
    if (governorate && governorate !== 'all') qb = qb.eq('governorate', governorate);
    if (city && city !== 'all') qb = qb.eq('city', city);
    const { data, error, count } = await qb
      .order('name')
      .range(from, to);
    if (error) {
      console.error('Error fetching paginated customers:', error);
      throw error;
    }
    return {
      items: data.map(dbCustomerToAppCustomer),
      total: count || 0
    };
  }
};

export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    // Fetch all payments in batches to bypass default row limits
    const allRaw: any[] = [];
    const batchSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false })
        .range(from, from + batchSize - 1);
      if (error) {
        console.error('Error fetching payments batch:', error);
        throw error;
      }
      if (!data || data.length === 0) break;
      allRaw.push(...data);
      if (data.length < batchSize) break;
      from += batchSize;
    }
    return allRaw.map(dbPaymentToAppPayment);
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
  
  async getById(id: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching payment with id ${id}:`, error);
      throw error;
    }
    
    return dbPaymentToAppPayment(data);
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
      // Payment for an invoice
      await updateInvoiceStatusAfterPayment(payment.invoiceId, payment.customerId);
      await updateCustomerCreditBalance(payment.customerId);
    } else if (payment.customerId) {
      // Payment against opening balance
      await updateCustomerOpeningBalance(payment.customerId, payment.amount);
    }
    
    return dbPaymentToAppPayment(data);
  },
  
  async update(payment: Payment): Promise<Payment> {
    // جلب بيانات الدفعة القديمة لحساب فرق المبلغ للرصيد الافتتاحي
    const { data: oldData, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment.id)
      .single();
      
    if (fetchError) {
      console.error(`Error fetching existing payment ${payment.id}:`, fetchError);
      throw fetchError;
    }
    
    const oldPayment = dbPaymentToAppPayment(oldData);
    // تجهيز بيانات التعديل
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
      // تعديل دفعة مرتبطة بفاتورة
      await updateInvoiceStatusAfterPayment(payment.invoiceId, payment.customerId);
      await updateCustomerCreditBalance(payment.customerId);
    } else {
      // تعديل دفعة ضد الرصيد الافتتاحي: تطبيق فرق المبلغ
      const diff = payment.amount - oldPayment.amount;
      await updateCustomerOpeningBalance(payment.customerId, diff);
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
      // Deletion of payment for an invoice
      await updateInvoiceStatusAfterPayment(payment.invoiceId, payment.customerId);
      await updateCustomerCreditBalance(payment.customerId);
    } else {
      // Revert payment against opening balance
      await updateCustomerOpeningBalance(payment.customerId, -payment.amount);
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
      if (payment.type === PaymentType.PAYMENT) {
        return sum + payment.amount;
      } else if (payment.type === PaymentType.REFUND) {
        return sum - payment.amount;
      }
      return sum;
    }, 0);
    
    console.log(`Invoice ${invoiceId} - Total amount: ${invoice.totalAmount}, Total payments: ${totalPayments}`);
    
    let newStatus: InvoiceStatus;
    
    // Fix: Use proper comparison with a small epsilon to account for floating point errors
    const epsilon = 0.01; // Small tolerance for floating point comparison
    
    if (totalPayments >= invoice.totalAmount - epsilon) {
      newStatus = InvoiceStatus.PAID;
    } else if (totalPayments > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    } else {
      newStatus = invoice.paymentMethod === PaymentMethod.CREDIT ? InvoiceStatus.UNPAID : InvoiceStatus.PAID;
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
      .in('status', [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE]);
      
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
        if (payment.type === PaymentType.PAYMENT) {
          return sum + payment.amount;
        } else if (payment.type === PaymentType.REFUND) {
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

// تحديث الرصيد الافتتاحي بعد الدفعات غير المرتبطة بالفواتير
const updateCustomerOpeningBalance = async (customerId: string, amount: number): Promise<void> => {
  console.log(`Updating opening balance for customer ${customerId}, amount: ${amount}`);
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('opening_balance')
    .eq('id', customerId)
    .single();
  if (customerError) {
    console.error(`Error fetching opening_balance for customer ${customerId}:`, customerError);
    throw customerError;
  }
  const openingBalance = customerData.opening_balance ?? 0;
  const newOpeningBalance = openingBalance - amount;
  const { error: updateError } = await supabase
    .from('customers')
    .update({ opening_balance: newOpeningBalance })
    .eq('id', customerId);
  if (updateError) {
    console.error(`Error updating opening_balance for customer ${customerId}:`, updateError);
    throw updateError;
  }
  console.log(`Opening balance for customer ${customerId} updated to ${newOpeningBalance}`);
};

// إضافة دالة لحساب وتحديث رصيد النقاط للعميل
const updateCustomerPointsBalance = async (customerId: string): Promise<void> => {
  console.log(`Updating points balance for customer ${customerId}`);
  try {
    // احتساب النقاط المكتسبة من الفواتير المدفوعة فقط
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('points_earned')
      .eq('customer_id', customerId)
      .eq('status', InvoiceStatus.PAID);
    if (invoiceError) throw invoiceError;
    const totalEarned = invoiceData?.reduce((sum, inv) => sum + (inv.points_earned ?? 0), 0) ?? 0;

    // احتساب النقاط المستبدلة من العمليات المكتملة فقط
    const { data: redemptionData, error: redemptionError } = await supabase
      .from('redemptions')
      .select('total_points_redeemed')
      .eq('customer_id', customerId)
      .eq('status', RedemptionStatus.COMPLETED);
    if (redemptionError) throw redemptionError;
    const totalRedeemed = redemptionData?.reduce((sum, r) => sum + (r.total_points_redeemed ?? 0), 0) ?? 0;

    const { error: updateError } = await supabase
      .from('customers')
      .update({
        points_earned: totalEarned,
        points_redeemed: totalRedeemed,
        current_points: totalEarned - totalRedeemed
      })
      .eq('id', customerId);
    if (updateError) throw updateError;

    console.log(`Points balance for customer ${customerId} updated to ${totalEarned - totalRedeemed}`);
  } catch (error) {
    console.error(`Failed to update points balance for customer ${customerId}:`, error);
    throw error;
  }
};

export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    // Fetch all invoices in batches to bypass server row limits
    const allRaw: any[] = [];
    const batchSize = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*),
          payments:payments(*)
        `)
        .order('date', { ascending: false })
        .range(from, from + batchSize - 1);
      if (error) {
        console.error('Error fetching invoices batch:', error);
        throw error;
      }
      if (!data || data.length === 0) break;
      allRaw.push(...data);
      if (data.length < batchSize) break;
      from += batchSize;
    }
    return allRaw.map(dbInvoiceToAppInvoice);
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
    
    // تحديث رصيد العميل بعد إنشاء الفاتورة
    await updateCustomerCreditBalance(invoice.customerId);
    await updateCustomerPointsBalance(invoice.customerId);
    
    return this.getById(invoiceId);
  },
  
  async update(invoice: Invoice): Promise<Invoice> {
    // جلب بيانات الفاتورة القديمة
    const oldInvoice = await this.getById(invoice.id);
    // قيد: منع رصيد النقاط السالب عند تعديل الفاتورة
    const customerId = invoice.customerId;
    const { data: allInvs, error: allInvsError } = await supabase
      .from('invoices')
      .select('id, points_earned, status')
      .eq('customer_id', customerId);
    if (allInvsError) throw allInvsError;
    // حساب النقاط المكتسبة المتوقعة بعد التعديل
    const projectedEarned = (allInvs ?? []).reduce((sum, inv) => {
      if (inv.id === invoice.id) {
        return sum + (invoice.status === InvoiceStatus.PAID ? invoice.pointsEarned : 0);
      }
      return inv.status === InvoiceStatus.PAID ? sum + (inv.points_earned ?? 0) : sum;
    }, 0);
    // مجموع النقاط المستبدلة المكتملة
    const { data: completedReds, error: redsError } = await supabase
      .from('redemptions')
      .select('total_points_redeemed')
      .eq('customer_id', customerId)
      .eq('status', RedemptionStatus.COMPLETED);
    if (redsError) throw redsError;
    const totalRedeemed = (completedReds ?? []).reduce((sum, r) => sum + (r.total_points_redeemed ?? 0), 0);
    if (projectedEarned < totalRedeemed) {
      throw new Error('لا يمكن تعديل الفاتورة لأن النقاط المتوقعة أقل من النقاط المستبدلة المكتملة');
    }
    // تحديث صف الفاتورة
    const dbInvoice = appInvoiceToDbInvoice(invoice);
    const { error: invError } = await supabase
      .from('invoices')
      .update(dbInvoice)
      .eq('id', invoice.id);
    if (invError) {
      console.error(`Error updating invoice ${invoice.id}:`, invError);
      throw invError;
    }

    // إعادة بناء عناصر الفاتورة
    await supabase.from('invoice_items').delete().eq('invoice_id', invoice.id);
    if (invoice.items.length > 0) {
      const itemsDb = invoice.items.map(item => ({
        ...appInvoiceItemToDbInvoiceItem(item),
        invoice_id: invoice.id
      }));
      const { error: itemsError } = await supabase.from('invoice_items').insert(itemsDb);
      if (itemsError) throw itemsError;
    }

    // معالجة الدفعات الآلية حسب تغيير الحالة أو طريقة الدفع أو المبلغ
    const oldStatus = oldInvoice.status;
    const oldMethod = oldInvoice.paymentMethod;
    const newStatus = invoice.status;
    const newMethod = invoice.paymentMethod;
    // جلب الدفعات الحالية للفاتورة
    const { data: existingPays = [], error: paysFetchError } = await supabase.from('payments')
      .select('*')
      .eq('invoice_id', invoice.id);
    if (paysFetchError) throw paysFetchError;
    const autoPays = existingPays.filter(p => p.notes?.includes('تم الدفع عند إنشاء') || p.notes?.includes('تم الدفع عند تعديل'));
    // إضافة دفعة آلية جديدة أو تحديث الحالية للمدفوعات النقدية
    if (newStatus === InvoiceStatus.PAID && newMethod === PaymentMethod.CASH) {
      if (oldStatus !== InvoiceStatus.PAID || oldMethod !== PaymentMethod.CASH) {
        // إنشاء دفعة آلية
        const payId = `PAY${Date.now().toString().slice(-6)}`;
        const payDb = appPaymentToDbPayment({
          id: payId,
          customerId: invoice.customerId,
          invoiceId: invoice.id,
          amount: invoice.totalAmount,
          date: invoice.date,
          method: 'cash',
          type: PaymentType.PAYMENT,
          notes: oldStatus !== InvoiceStatus.PAID ? 'تم الدفع عند تعديل الفاتورة' : 'تم الدفع عند إنشاء الفاتورة'
        });
        await supabase.from('payments').insert(payDb);
      } else if (invoice.totalAmount !== oldInvoice.totalAmount) {
        // تحديث دفعة آلية موجودة عند تغيير المبلغ
        for (const p of autoPays) {
          const payDb = appPaymentToDbPayment({
            id: p.id,
            customerId: invoice.customerId,
            invoiceId: invoice.id,
            amount: invoice.totalAmount,
            date: invoice.date,
            method: 'cash',
            type: PaymentType.PAYMENT,
            notes: p.notes || ''
          });
          await supabase.from('payments').update(payDb).eq('id', p.id);
        }
      }
    }
    // حذف الدفعات الآلية عند إزالة الدفع أو التحويل لآجل أو تغيير الحالة
    if ((oldStatus === InvoiceStatus.PAID && newStatus !== InvoiceStatus.PAID) ||
        (oldMethod === PaymentMethod.CASH && newMethod !== PaymentMethod.CASH)) {
      for (const p of autoPays) {
        await supabase.from('payments').delete().eq('id', p.id);
      }
    }

    // تحديث أرصدة العميل
    await updateCustomerCreditBalance(invoice.customerId);
    await updateCustomerPointsBalance(invoice.customerId);

    return this.getById(invoice.id);
  },
  
  async delete(id: string): Promise<void> {
    // جلب customer_id وpoints_earned قبل حذف الفاتورة
    const { data: deletedInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('customer_id, points_earned')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error(`Error fetching invoice ${id}:`, fetchError);
      throw fetchError;
    }
    
    // تحقق من عدم حدوث رصيد نقاط سالب بعد حذف هذه الفاتورة
    const customerId = deletedInvoice.customer_id;
    // مجموع النقاط المكتسبة بعد حذف هذه الفاتورة
    const { data: invs, error: invsError } = await supabase
      .from('invoices')
      .select('points_earned')
      .eq('customer_id', customerId)
      .neq('id', id)
      .eq('status', InvoiceStatus.PAID);
    if (invsError) throw invsError;
    const remainingEarned = invs.reduce((sum, inv) => sum + (inv.points_earned ?? 0), 0);
    // مجموع النقاط المستبدلة
    const { data: reds, error: redsError } = await supabase
      .from('redemptions')
      .select('total_points_redeemed')
      .eq('customer_id', customerId);
    if (redsError) throw redsError;
    const totalRedeemed = reds.reduce((sum, r) => sum + (r.total_points_redeemed ?? 0), 0);
    if (remainingEarned - totalRedeemed < 0) {
      throw new Error('لا يمكن حذف الفاتورة لأن حذف نقاط هذه الفاتورة سيؤدي إلى رصيد نقاط سالب للعميل');
    }
    
    // حذف جميع الدفعات المرتبطة بالفاتورة
    const { data: paymentsData, error: paymentsFetchError } = await supabase
      .from('payments')
      .select('id')
      .eq('invoice_id', id);
    if (paymentsFetchError) {
      console.error(`Error fetching payments for invoice ${id}:`, paymentsFetchError);
      throw paymentsFetchError;
    }
    // تطبيق الحذف العكسي للدفعات
    for (const p of paymentsData) {
      await supabase.from('payments').delete().eq('id', p.id);
    }
    // حذف عناصر الفاتورة
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
    
    // تحديث أرصدة العميل بعد حذف الفاتورة
    await updateCustomerCreditBalance(deletedInvoice.customer_id);
    await updateCustomerPointsBalance(deletedInvoice.customer_id);
  },
  
  async getPaginated(
    pageIndex: number,
    pageSize: number,
    searchTerm?: string,
    statusFilter?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{ items: Invoice[]; total: number }> {
    const from = pageIndex * pageSize;
    const to = from + pageSize - 1;
    let qb = supabase
      .from('invoices')
      .select(
        `*, customer:customers(*), items:invoice_items(*), payments:payments(*)`,
        { count: 'exact' }
      );
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchDigits = searchTerm.replace(/\D/g, '');
      const isNumericSearch = /^\d+$/.test(searchTerm);
      if (isNumericSearch) {
        // بحث بالكود (id) أولاً
        const selectCols = '*, customer:customers(*)';
        // جلب عن طريق id
        let idQb = supabase
          .from('invoices')
          .select(selectCols, { count: 'exact' })
          .eq('id', searchTerm);
        if (statusFilter && statusFilter !== 'all') idQb = idQb.eq('status', statusFilter as InvoiceStatus);
        if (dateFrom) idQb = idQb.gte('date', dateFrom);
        if (dateTo) idQb = idQb.lte('date', dateTo);
        const { data: idData, error: idError } = await idQb;
        if (idError) throw idError;
        const itemsById = idData.map(dbInvoiceToAppInvoice);
        // جلب عن طريق الهاتف
        let phoneQb = supabase
          .from('invoices')
          .select(selectCols, { count: 'exact' })
          .ilike('customer.phone', `%${searchDigits}%`);
        if (statusFilter && statusFilter !== 'all') phoneQb = phoneQb.eq('status', statusFilter as InvoiceStatus);
        if (dateFrom) phoneQb = phoneQb.gte('date', dateFrom);
        if (dateTo) phoneQb = phoneQb.lte('date', dateTo);
        const { data: phoneData, error: phoneError, count: phoneCount } = await phoneQb
          .order('date', { ascending: false })
          .range(from, to);
        if (phoneError) throw phoneError;
        const itemsPhone = phoneData.map(dbInvoiceToAppInvoice);
        return {
          items: [...itemsById, ...itemsPhone],
          total: itemsById.length + (phoneCount || 0)
        };
      } else {
        const q = `%${searchLower}%`;
        qb = qb.ilike('id', q);
      }
    }
    if (statusFilter && statusFilter !== 'all')
      qb = qb.eq('status', statusFilter as InvoiceStatus);
    if (dateFrom) qb = qb.gte('date', dateFrom);
    if (dateTo) qb = qb.lte('date', dateTo);
    const { data, error, count } = await qb
      .order('date', { ascending: false })
      .range(from, to);
    if (error) {
      console.error('Error fetching paginated invoices:', error);
      throw error;
    }
    return {
      items: (data || []).map(dbInvoiceToAppInvoice),
      total: count || 0
    };
  },
};

export const redemptionsService = {
  async getAll(): Promise<Redemption[]> {
    const { data, error } = await supabase
      .from('redemptions')
      .select(`
        *,
        items:redemption_items(*)
      `)
      .order('date', { ascending: false })
      .range(0, 5000);
      
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
      .maybeSingle(); // Fix: Use maybeSingle instead of single to prevent error
      
    if (error) {
      console.error(`Error fetching redemption with id ${id}:`, error);
      throw error;
    }
    
    if (!data) {
      throw new Error(`Redemption with id ${id} not found`);
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
      const redemptionItems = items.map(item => {
        // استبعاد id لاستخدام التسلسل الافتراضي أو التحكّم في توليده
        const dbItem = appRedemptionItemToDbRedemptionItem(item);
        const { id: _ignoreId, ...dbFields } = dbItem;
        return {
          ...dbFields,
          redemption_id: redemptionId
        };
      });
      
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
    
    // حذف أصناف الاستبدال القديمة
    const { error: deleteError } = await supabase
      .from('redemption_items')
      .delete()
      .eq('redemption_id', redemption.id);
    if (deleteError) {
      console.error(`Error deleting old redemption items for ${redemption.id}:`, deleteError);
      throw deleteError;
    }
    // إضافة أصناف الاستبدال الجديدة
    if (redemption.items && redemption.items.length > 0) {
      const newItems = redemption.items.map(item => {
        // استبعاد id لاستخدام التسلسل الافتراضي أو التحكّم في توليده
        const dbItem = appRedemptionItemToDbRedemptionItem(item);
        const { id: _ignoreId, ...dbFields } = dbItem;
        return {
          ...dbFields,
          redemption_id: redemption.id
        };
      });
      const { error: insertError } = await supabase
        .from('redemption_items')
        .insert(newItems);
      if (insertError) {
        console.error(`Error inserting new redemption items for ${redemption.id}:`, insertError);
        throw insertError;
      }
    }
    // إعادة جلب الاستبدال مع الأصناف المحدثة
    return this.getById(redemption.id);
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
