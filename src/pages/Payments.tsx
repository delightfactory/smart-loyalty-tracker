import React from 'react';
import { usePayments } from '@/hooks/usePayments';
import { useCustomers } from '@/hooks/useCustomers';
import { useInvoices } from '@/hooks/useInvoices';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PaymentsFilterBar from '@/components/payments/PaymentsFilterBar';
import PaymentsSummaryBar from '@/components/payments/PaymentsSummaryBar';
import PaymentCard from '@/components/payments/PaymentCard';
import ViewToggle from '@/components/payments/ViewToggle';
import { Pencil, Trash2 } from 'lucide-react';

const Payments: React.FC = () => {
  const { getAll } = usePayments();
  const { data: payments = [], isLoading } = getAll;
  const { getAll: getAllCustomers } = useCustomers();
  const { data: customers = [] } = getAllCustomers;
  const { getAll: getAllInvoices } = useInvoices();
  const { data: invoices = [] } = getAllInvoices;
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState('');
  const [view, setView] = React.useState<'table' | 'cards'>('table');

  // حالة الترتيب: العمود والاتجاه
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payments</h1>
        <div className="flex gap-2 items-center">
          <ViewToggle view={view} setView={setView} />
          <Button onClick={() => navigate('/create-payment')} size="lg" className="rounded-xl bg-gradient-to-tr from-lime-400 via-emerald-300 to-teal-400 hover:from-teal-400 hover:to-lime-400 shadow-md text-emerald-900 dark:text-emerald-100 font-bold flex gap-2 items-center border-0 transition-all">
            <span className="hidden md:inline">Add New Payment</span>
            <span className="inline md:hidden">+</span>
          </Button>
        </div>
      </div>
      <PaymentsFilterBar filter={filter} setFilter={setFilter} />
      <PaymentsSummaryBar total={totalAmount} count={totalCount} />
      {view === 'table' ? (
        <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('date')}>
                  Date
                  <span className="inline-flex flex-col align-middle ml-1">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 8L10 4L14 8" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 12L10 16L6 12" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {sortConfig.key === 'date' && (
                    <span className="ml-1 font-bold">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No payments found.</td></tr>
              ) : (
                filteredPayments.map((payment, idx) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-200">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{getCustomerName(payment.customerId)}</td>
                    <td className="px-4 py-3 text-blue-600 dark:text-blue-400 font-mono">{payment.invoiceId ? getInvoiceNumber(payment.invoiceId) : '-'}</td>
                    <td className="px-4 py-3 text-green-700 dark:text-green-300 font-bold font-mono">{Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{payment.method || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{payment.type || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono">{payment.date ? formatDate(payment.date) : '-'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{payment.notes || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(payment.id)}
                          className="rounded-full p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="rounded-full p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
            <div className="col-span-full text-center py-8 text-gray-400">Loading...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-400">No payments found.</div>
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
    </div>
  );
};

export default Payments;
