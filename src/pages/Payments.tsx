import React, { useState, useEffect } from 'react';
import { usePayments } from '@/hooks/usePayments';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PaymentsFilterBar from '@/components/payments/PaymentsFilterBar';
import PaymentsSummaryBar from '@/components/payments/PaymentsSummaryBar';
import PaymentCard from '@/components/payments/PaymentCard';
import ViewToggle from '@/components/invoice/ViewToggle';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import PageContainer from '@/components/layout/PageContainer';
import AddStandalonePaymentDialog from '@/components/payments/AddStandalonePaymentDialog';

const Payments: React.FC = () => {
  const [showStandaloneDialog, setShowStandaloneDialog] = useState(false);
  const { getAll } = usePayments();
  const { data: payments = [], isLoading } = getAll;
  const { getAll: getAllCustomers } = useCustomers();
  const { data: customers = [] } = getAllCustomers;
  const { getAll: getAllInvoices } = useInvoices();
  const { data: invoices = [] } = getAllInvoices;
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const isMobile = useIsMobile();

  // استخدام localStorage لحفظ طريقة العرض المفضلة
  useEffect(() => {
    const savedView = localStorage.getItem('payments_view') as 'table' | 'cards' | null;
    if (savedView) {
      setView(savedView);
    } else {
      // تعيين عرض البطاقات كافتراضي للأجهزة المحمولة
      setView(isMobile ? 'cards' : 'table');
    }
  }, [isMobile]);

  // حفظ تفضيل العرض في localStorage عند التغيير
  useEffect(() => {
    localStorage.setItem('payments_view', view);
  }, [view]);

  // فرض عرض الكروت دائماً في وضع الهاتف
  useEffect(() => {
    if (isMobile) setView('cards');
  }, [isMobile]);

  // حالة الترتيب: العمود والاتجاه
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  // وظيفة تغيير الترتيب عند الضغط على رأس العمود
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // عكس الاتجاه
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

  // Helper functions
  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer && typeof customer.name === 'string' ? customer.name : '-';
  };
  
  const getInvoiceNumber = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    return invoice && typeof invoice === 'object' && 'invoiceNumber' in invoice && typeof invoice.invoiceNumber === 'string' && invoice.invoiceNumber ? invoice.invoiceNumber : (invoice ? String(invoice.id).slice(-6) : '-');
  };

  // Helper function to format date in English (YYYY-MM-DD)
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    // Only show date, not time, as per user preference
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  };

  // ترتيب المدفوعات بناءً على حالة الترتيب
  const sortedPayments = [...payments].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    // دعم خاص لتواريخ
    if (sortConfig.key === 'date') {
      if (!(aValue instanceof Date)) aValue = new Date(aValue);
      if (!(bValue instanceof Date)) bValue = new Date(bValue);
      const timeA = isNaN(aValue.getTime()) ? 0 : aValue.getTime();
      const timeB = isNaN(bValue.getTime()) ? 0 : bValue.getTime();
      return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
    }
    // دعم للأرقام
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    // نصوص
    return sortConfig.direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
  
  const filteredPayments = sortedPayments.filter(payment => {
    const customer = String(getCustomerName(payment.customerId)).toLowerCase();
    const invoice = String(getInvoiceNumber(payment.invoiceId || '')).toLowerCase();
    const method = String(payment.method || '').toLowerCase();
    const notes = String(payment.notes || '').toLowerCase();
    const type = String(payment.type || '').toLowerCase();
    const amount = String(payment.amount);
    const f = filter.toLowerCase();
    return (
      customer.includes(f) ||
      invoice.includes(f) ||
      method.includes(f) ||
      notes.includes(f) ||
      type.includes(f) ||
      amount.includes(f)
    );
  });

  // Summary
  const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCount = filteredPayments.length;

  const handleEdit = (paymentId: string) => {
    navigate(`/create-payment?edit=${paymentId}`);
  };
  
  const handleDelete = (paymentId: string) => {
    // TODO: implement confirmation and delete logic
    alert('Delete payment: ' + paymentId);
  };

  return (
    <PageContainer 
      title="المدفوعات"
      subtitle="إدارة جميع المدفوعات والاستردادات"
      extra={
        <div className="flex gap-2 items-center">
          <ViewToggle view={view} setView={setView} storageKey="payments_view" />
          <Button
            size="sm"
            variant="secondary"
            className="rounded-lg bg-gradient-to-l from-yellow-400 to-yellow-600 text-white shadow-md hover:from-yellow-500 hover:to-yellow-700 px-5 py-2 font-bold text-base transition-all min-w-[180px] flex items-center gap-2"
            onClick={() => setShowStandaloneDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            إضافة دفعة غير مرتبطة بفاتورة
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg bg-gradient-to-l from-primary to-emerald-500 text-white shadow-md hover:from-emerald-600 hover:to-primary dark:from-emerald-900 dark:to-emerald-700 px-5 py-2 font-bold text-base transition-all min-w-[130px] flex items-center gap-2"
            onClick={() => navigate('/create-payment')}
          >
            <Plus className="h-4 w-4 mr-1" />
            إضافة دفعة
          </Button>
          <AddStandalonePaymentDialog open={showStandaloneDialog} onClose={() => setShowStandaloneDialog(false)} />
        </div>
      }
    >
      <PaymentsFilterBar filter={filter} setFilter={setFilter} />
      <PaymentsSummaryBar total={totalAmount} count={totalCount} />
      
      {view === 'table' ? (
        <div className="overflow-x-auto rounded-lg shadow bg-background dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-muted/60 dark:bg-muted/20">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">العميل</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الفاتورة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">المبلغ</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">طريقة الدفع</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">النوع</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('date')}>
                  التاريخ
                  <span className="inline-flex flex-col align-middle mr-1">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 8L10 4L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 12L10 16L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {sortConfig.key === 'date' && (
                    <span className="mr-1 font-bold">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">ملاحظات</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">جاري التحميل...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">لم يتم العثور على مدفوعات.</td></tr>
              ) : (
                filteredPayments.map((payment, idx) => (
                  <tr key={payment.id} className="hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm">{(idx + 1).toLocaleString('en-US')}</td>
                    <td className="px-4 py-3">{getCustomerName(payment.customerId)}</td>
                    <td className="px-4 py-3 text-primary font-mono">{payment.invoiceId ? getInvoiceNumber(payment.invoiceId) : '-'}</td>
                    <td className="px-4 py-3 text-green-600 dark:text-green-400 font-bold font-mono">{Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">{payment.method || '-'}</td>
                    <td className="px-4 py-3">{payment.type === 'refund' ? 'استرجاع' : 'دفعة'}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{payment.date ? formatDate(payment.date) : '-'}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{payment.notes || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(payment.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(payment.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">لم يتم العثور على مدفوعات.</div>
          ) : (
            filteredPayments.map(payment => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                customerName={getCustomerName(payment.customerId)}
                invoiceNumber={payment.invoiceId ? getInvoiceNumber(payment.invoiceId) : '-'}
                onEdit={() => handleEdit(payment.id)}
                onDelete={() => handleDelete(payment.id)}
              />
            ))
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default Payments;
