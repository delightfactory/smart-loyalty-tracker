
import { supabase } from "@/integrations/supabase/client";
import { 
  Product, 
  Customer, 
  Invoice, 
  Payment, 
  Redemption,
  InvoiceItem,
  RedemptionItem,
  InvoiceStatus,
  PaymentMethod
} from "@/lib/types";

// خدمات المنتجات
export const productsService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id');
      
    if (error) throw error;
    return data || [];
  },
  
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  async create(product: Omit<Product, 'id'>): Promise<Product> {
    // إنشاء معرف جديد للمنتج
    const allProducts = await this.getAll();
    const newId = `P${(allProducts.length + 1).toString().padStart(3, '0')}`;
    
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, id: newId })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async update(product: Product): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', product.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};

// خدمات العملاء
export const customersService = {
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('id');
      
    if (error) throw error;
    return data || [];
  },
  
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    // إنشاء معرف جديد للعميل
    const allCustomers = await this.getAll();
    const newId = `C${(allCustomers.length + 1).toString().padStart(3, '0')}`;
    
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...customer, id: newId })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async update(customer: Customer): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', customer.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};

// خدمات الفواتير
export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    // تحويل البيانات من تنسيق قاعدة البيانات إلى تنسيق التطبيق
    return data.map(invoice => ({
      ...invoice,
      items: invoice.items,
      payments: [] // سنحصل على المدفوعات بشكل منفصل
    })) || [];
  },
  
  async getById(id: string): Promise<Invoice | null> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
      
    if (invoiceError && invoiceError.code !== 'PGRST116') throw invoiceError;
    if (!invoice) return null;
    
    // جلب بنود الفاتورة
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);
      
    if (itemsError) throw itemsError;
    
    // جلب مدفوعات الفاتورة
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', id);
      
    if (paymentsError) throw paymentsError;
    
    return {
      ...invoice,
      items: items || [],
      payments: payments || []
    };
  },
  
  async getByCustomerId(customerId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    return data.map(invoice => ({
      ...invoice,
      items: invoice.items,
      payments: [] // سنحصل على المدفوعات بشكل منفصل
    })) || [];
  },
  
  async create(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    // إنشاء معرف جديد للفاتورة
    const { data: allInvoices, error: countError } = await supabase
      .from('invoices')
      .select('id');
      
    if (countError) throw countError;
    
    const newId = `INV${(allInvoices.length + 1).toString().padStart(3, '0')}`;
    
    // إنشاء الفاتورة
    const { data: createdInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        id: newId,
        customer_id: invoice.customerId,
        date: invoice.date,
        due_date: invoice.dueDate,
        total_amount: invoice.totalAmount,
        points_earned: invoice.pointsEarned,
        points_redeemed: invoice.pointsRedeemed,
        status: invoice.status,
        payment_method: invoice.paymentMethod,
        categories_count: invoice.categoriesCount
      })
      .select()
      .single();
      
    if (invoiceError) throw invoiceError;
    
    // إنشاء بنود الفاتورة
    const invoiceItems = invoice.items.map(item => ({
      invoice_id: newId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      total_price: item.totalPrice,
      points_earned: item.pointsEarned
    }));
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);
      
    if (itemsError) throw itemsError;
    
    // إذا كان هناك مدفوعات، قم بإنشائها
    if (invoice.payments && invoice.payments.length > 0) {
      const paymentsData = invoice.payments.map(payment => ({
        id: payment.id || `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`,
        customer_id: invoice.customerId,
        invoice_id: newId,
        amount: payment.amount,
        date: payment.date,
        method: payment.method,
        notes: payment.notes,
        type: payment.type
      }));
      
      const { error: paymentsError } = await supabase
        .from('payments')
        .insert(paymentsData);
        
      if (paymentsError) throw paymentsError;
    }
    
    // تحديث نقاط العميل
    if (invoice.pointsEarned > 0 || invoice.pointsRedeemed > 0) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('points_earned, points_redeemed, current_points')
        .eq('id', invoice.customerId)
        .single();
        
      if (customerError) throw customerError;
      
      const updatedCustomer = {
        points_earned: customer.points_earned + invoice.pointsEarned,
        points_redeemed: customer.points_redeemed + invoice.pointsRedeemed,
        current_points: customer.current_points + invoice.pointsEarned - invoice.pointsRedeemed
      };
      
      const { error: updateError } = await supabase
        .from('customers')
        .update(updatedCustomer)
        .eq('id', invoice.customerId);
        
      if (updateError) throw updateError;
    }
    
    return {
      ...createdInvoice,
      items: invoice.items,
      payments: invoice.payments || []
    };
  },
  
  async update(invoice: Invoice): Promise<Invoice> {
    // تحديث الفاتورة
    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        customer_id: invoice.customerId,
        date: invoice.date,
        due_date: invoice.dueDate,
        total_amount: invoice.totalAmount,
        points_earned: invoice.pointsEarned,
        points_redeemed: invoice.pointsRedeemed,
        status: invoice.status,
        payment_method: invoice.paymentMethod,
        categories_count: invoice.categoriesCount
      })
      .eq('id', invoice.id);
      
    if (invoiceError) throw invoiceError;
    
    // حذف بنود الفاتورة القديمة
    const { error: deleteItemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoice.id);
      
    if (deleteItemsError) throw deleteItemsError;
    
    // إنشاء بنود الفاتورة الجديدة
    const invoiceItems = invoice.items.map(item => ({
      invoice_id: invoice.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      total_price: item.totalPrice,
      points_earned: item.pointsEarned
    }));
    
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);
      
    if (itemsError) throw itemsError;
    
    return invoice;
  },
  
  async delete(id: string): Promise<void> {
    // حذف الفاتورة سيؤدي تلقائيًا إلى حذف بنود الفاتورة بسبب قيود المفتاح الأجنبي
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};

// خدمات المدفوعات
export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },
  
  async getById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
  
  async getByCustomerId(customerId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },
  
  async getByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  },
  
  async create(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const newId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const { data, error } = await supabase
      .from('payments')
      .insert({ ...payment, id: newId })
      .select()
      .single();
      
    if (error) throw error;
    
    // تحديث حالة الفاتورة بعد إضافة الدفعة
    if (payment.invoiceId) {
      await this.updateInvoiceStatus(payment.invoiceId);
    }
    
    // تحديث رصيد العميل
    await this.updateCustomerCreditBalance(payment.customerId);
    
    return data;
  },
  
  async update(payment: Payment): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', payment.id)
      .select()
      .single();
      
    if (error) throw error;
    
    // تحديث حالة الفاتورة بعد تعديل الدفعة
    if (payment.invoiceId) {
      await this.updateInvoiceStatus(payment.invoiceId);
    }
    
    // تحديث رصيد العميل
    await this.updateCustomerCreditBalance(payment.customerId);
    
    return data;
  },
  
  async delete(id: string): Promise<void> {
    // جلب معلومات الدفعة قبل حذفها
    const payment = await this.getById(id);
    if (!payment) return;
    
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    // تحديث حالة الفاتورة بعد حذف الدفعة
    if (payment.invoiceId) {
      await this.updateInvoiceStatus(payment.invoiceId);
    }
    
    // تحديث رصيد العميل
    await this.updateCustomerCreditBalance(payment.customerId);
  },
  
  // دالة مساعدة لتحديث حالة الفاتورة
  async updateInvoiceStatus(invoiceId: string): Promise<void> {
    // جلب الفاتورة
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
      
    if (invoiceError) throw invoiceError;
    
    // جلب المدفوعات المتعلقة بالفاتورة
    const payments = await this.getByInvoiceId(invoiceId);
    
    // حساب إجمالي المدفوعات (المدفوعات ناقص المردودات)
    const totalPayments = payments.reduce((sum, payment) => {
      if (payment.type === 'payment') {
        return sum + Number(payment.amount);
      } else if (payment.type === 'refund') {
        return sum - Number(payment.amount);
      }
      return sum;
    }, 0);
    
    // تحديد الحالة الجديدة بناء على مبلغ الدفع
    let newStatus: InvoiceStatus;
    
    if (totalPayments >= Number(invoice.total_amount)) {
      newStatus = InvoiceStatus.PAID;
    } else if (totalPayments > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    } else {
      newStatus = invoice.payment_method === PaymentMethod.CREDIT ? InvoiceStatus.UNPAID : InvoiceStatus.PAID;
    }
    
    // التحقق مما إذا كانت الفاتورة متأخرة
    const today = new Date();
    if (invoice.due_date && today > new Date(invoice.due_date) && totalPayments < Number(invoice.total_amount)) {
      newStatus = InvoiceStatus.OVERDUE;
    }
    
    // تحديث حالة الفاتورة
    if (invoice.status !== newStatus) {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId);
        
      if (updateError) throw updateError;
    }
  },
  
  // دالة مساعدة لتحديث رصيد العميل
  async updateCustomerCreditBalance(customerId: string): Promise<void> {
    // جلب العميل
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
      
    if (customerError) throw customerError;
    
    // جلب الفواتير غير المدفوعة أو المدفوعة جزئيًا
    const { data: unpaidInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .in('status', [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE]);
      
    if (invoicesError) throw invoicesError;
    
    // حساب إجمالي المبلغ المستحق
    let totalAmountDue = 0;
    
    for (const invoice of unpaidInvoices) {
      const payments = await this.getByInvoiceId(invoice.id);
      const totalPaidForInvoice = payments.reduce((sum, payment) => {
        if (payment.type === 'payment') {
          return sum + Number(payment.amount);
        } else if (payment.type === 'refund') {
          return sum - Number(payment.amount);
        }
        return sum;
      }, 0);
      
      totalAmountDue += (Number(invoice.total_amount) - totalPaidForInvoice);
    }
    
    // تحديث رصيد العميل
    const { error: updateError } = await supabase
      .from('customers')
      .update({ credit_balance: totalAmountDue })
      .eq('id', customerId);
      
    if (updateError) throw updateError;
  }
};

// خدمات استبدال النقاط
export const redemptionsService = {
  async getAll(): Promise<Redemption[]> {
    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    // جلب بنود الاستبدال لكل عملية استبدال
    const result = await Promise.all(data.map(async (redemption) => {
      const { data: items, error: itemsError } = await supabase
        .from('redemption_items')
        .select('*')
        .eq('redemption_id', redemption.id);
        
      if (itemsError) throw itemsError;
      
      return {
        ...redemption,
        items: items || []
      };
    }));
    
    return result || [];
  },
  
  async getById(id: string): Promise<Redemption | null> {
    const { data: redemption, error: redemptionError } = await supabase
      .from('redemptions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (redemptionError && redemptionError.code !== 'PGRST116') throw redemptionError;
    if (!redemption) return null;
    
    // جلب بنود الاستبدال
    const { data: items, error: itemsError } = await supabase
      .from('redemption_items')
      .select('*')
      .eq('redemption_id', id);
      
    if (itemsError) throw itemsError;
    
    return {
      ...redemption,
      items: items || []
    };
  },
  
  async getByCustomerId(customerId: string): Promise<Redemption[]> {
    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .eq('customer_id', customerId)
      .order('date', { ascending: false });
      
    if (error) throw error;
    
    // جلب بنود الاستبدال لكل عملية استبدال
    const result = await Promise.all(data.map(async (redemption) => {
      const { data: items, error: itemsError } = await supabase
        .from('redemption_items')
        .select('*')
        .eq('redemption_id', redemption.id);
        
      if (itemsError) throw itemsError;
      
      return {
        ...redemption,
        items: items || []
      };
    }));
    
    return result || [];
  },
  
  async create(redemption: Omit<Redemption, 'id'>): Promise<Redemption> {
    // إنشاء معرف جديد للاستبدال
    const { data: allRedemptions, error: countError } = await supabase
      .from('redemptions')
      .select('id');
      
    if (countError) throw countError;
    
    const newId = `RED${(allRedemptions.length + 1).toString().padStart(3, '0')}`;
    
    // إنشاء عملية الاستبدال
    const { data: createdRedemption, error: redemptionError } = await supabase
      .from('redemptions')
      .insert({
        id: newId,
        customer_id: redemption.customerId,
        date: redemption.date,
        total_points_redeemed: redemption.totalPointsRedeemed,
        status: redemption.status
      })
      .select()
      .single();
      
    if (redemptionError) throw redemptionError;
    
    // إنشاء بنود الاستبدال
    const redemptionItems = redemption.items.map(item => ({
      redemption_id: newId,
      product_id: item.productId,
      quantity: item.quantity,
      points_required: item.pointsRequired,
      total_points_required: item.totalPointsRequired
    }));
    
    const { error: itemsError } = await supabase
      .from('redemption_items')
      .insert(redemptionItems);
      
    if (itemsError) throw itemsError;
    
    // تحديث نقاط العميل إذا تم الاستبدال
    if (redemption.status === 'completed') {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('points_earned, points_redeemed, current_points')
        .eq('id', redemption.customerId)
        .single();
        
      if (customerError) throw customerError;
      
      const updatedCustomer = {
        points_redeemed: customer.points_redeemed + redemption.totalPointsRedeemed,
        current_points: customer.current_points - redemption.totalPointsRedeemed
      };
      
      const { error: updateError } = await supabase
        .from('customers')
        .update(updatedCustomer)
        .eq('id', redemption.customerId);
        
      if (updateError) throw updateError;
    }
    
    return {
      ...createdRedemption,
      items: redemption.items
    };
  },
  
  async update(redemption: Redemption): Promise<Redemption> {
    // جلب الاستبدال القديم لمعرفة حالته
    const oldRedemption = await this.getById(redemption.id);
    if (!oldRedemption) throw new Error('Redemption not found');
    
    // تحديث عملية الاستبدال
    const { error: redemptionError } = await supabase
      .from('redemptions')
      .update({
        date: redemption.date,
        total_points_redeemed: redemption.totalPointsRedeemed,
        status: redemption.status
      })
      .eq('id', redemption.id);
      
    if (redemptionError) throw redemptionError;
    
    // حذف بنود الاستبدال القديمة
    const { error: deleteItemsError } = await supabase
      .from('redemption_items')
      .delete()
      .eq('redemption_id', redemption.id);
      
    if (deleteItemsError) throw deleteItemsError;
    
    // إنشاء بنود الاستبدال الجديدة
    const redemptionItems = redemption.items.map(item => ({
      redemption_id: redemption.id,
      product_id: item.productId,
      quantity: item.quantity,
      points_required: item.pointsRequired,
      total_points_required: item.totalPointsRequired
    }));
    
    const { error: itemsError } = await supabase
      .from('redemption_items')
      .insert(redemptionItems);
      
    if (itemsError) throw itemsError;
    
    // تحديث نقاط العميل إذا تغيرت الحالة
    if (oldRedemption.status !== redemption.status) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('points_earned, points_redeemed, current_points')
        .eq('id', redemption.customerId)
        .single();
        
      if (customerError) throw customerError;
      
      let updatedCustomer = { ...customer };
      
      if (oldRedemption.status === 'completed' && redemption.status !== 'completed') {
        // إعادة النقاط المستردة
        updatedCustomer.points_redeemed = customer.points_redeemed - oldRedemption.totalPointsRedeemed;
        updatedCustomer.current_points = customer.current_points + oldRedemption.totalPointsRedeemed;
      } else if (oldRedemption.status !== 'completed' && redemption.status === 'completed') {
        // خصم النقاط للاستبدال الجديد
        updatedCustomer.points_redeemed = customer.points_redeemed + redemption.totalPointsRedeemed;
        updatedCustomer.current_points = customer.current_points - redemption.totalPointsRedeemed;
      }
      
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          points_redeemed: updatedCustomer.points_redeemed,
          current_points: updatedCustomer.current_points
        })
        .eq('id', redemption.customerId);
        
      if (updateError) throw updateError;
    }
    
    return redemption;
  },
  
  async delete(id: string): Promise<void> {
    // جلب معلومات الاستبدال قبل حذفه
    const redemption = await this.getById(id);
    if (!redemption) return;
    
    // إعادة النقاط للعميل إذا كان الاستبدال مكتمل
    if (redemption.status === 'completed') {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('points_earned, points_redeemed, current_points')
        .eq('id', redemption.customerId)
        .single();
        
      if (customerError) throw customerError;
      
      const updatedCustomer = {
        points_redeemed: customer.points_redeemed - redemption.totalPointsRedeemed,
        current_points: customer.current_points + redemption.totalPointsRedeemed
      };
      
      const { error: updateError } = await supabase
        .from('customers')
        .update(updatedCustomer)
        .eq('id', redemption.customerId);
        
      if (updateError) throw updateError;
    }
    
    // حذف الاستبدال
    const { error } = await supabase
      .from('redemptions')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};

// وظائف مساعدة للتحويل بين تنسيقات البيانات
export const dataTransformers = {
  // تحويل البيانات من تنسيق قاعدة البيانات إلى تنسيق التطبيق
  transformInvoiceFromDB(dbInvoice: any, items: any[] = [], payments: any[] = []): Invoice {
    return {
      id: dbInvoice.id,
      customerId: dbInvoice.customer_id,
      date: new Date(dbInvoice.date),
      dueDate: dbInvoice.due_date ? new Date(dbInvoice.due_date) : undefined,
      items: items.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.total_price,
        pointsEarned: item.points_earned
      })),
      totalAmount: dbInvoice.total_amount,
      pointsEarned: dbInvoice.points_earned,
      pointsRedeemed: dbInvoice.points_redeemed,
      status: dbInvoice.status,
      paymentMethod: dbInvoice.payment_method,
      categoriesCount: dbInvoice.categories_count,
      payments: payments.map(payment => ({
        id: payment.id,
        customerId: payment.customer_id,
        invoiceId: payment.invoice_id,
        amount: payment.amount,
        date: new Date(payment.date),
        method: payment.method,
        notes: payment.notes,
        type: payment.type
      }))
    };
  },
  
  // تحويل البيانات من تنسيق التطبيق إلى تنسيق قاعدة البيانات
  transformInvoiceToDB(invoice: Invoice): any {
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
  }
};

// تصدير الخدمات
export const databaseService = {
  products: productsService,
  customers: customersService,
  invoices: invoicesService,
  payments: paymentsService,
  redemptions: redemptionsService
};
