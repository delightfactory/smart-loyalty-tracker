import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { customersService, invoicesService } from '@/services/database';
import { useEffect, useState } from 'react';
import { Customer, Invoice } from '@/lib/types';
import { formatNumberEn, formatAmountEn, formatDateEn } from '@/lib/formatters';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CustomerRFMTableProps {
  customers?: Customer[];
  invoices?: Invoice[];
  loading?: boolean;
}

function getCustomerRFM(customers: Customer[], invoices: Invoice[]) {
  const now = new Date();
  return customers.map((customer) => {
    const customerInvoices = invoices.filter((inv) => inv.customerId === customer.id);
    const sortedInvoices = customerInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const invoiceDates = sortedInvoices.map((inv) => new Date(inv.date));
    const totalAmount = customerInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    let recency = null;
    if (invoiceDates.length > 0) {
      const diffDays = Math.round((now.getTime() - invoiceDates[0].getTime()) / (1000 * 60 * 60 * 24));
      recency = diffDays;
    }
    return {
      id: customer.id,
      name: customer.name,
      businessType: customer.businessType,
      frequency: customerInvoices.length,
      monetary: totalAmount,
      recency,
      lastPurchase: invoiceDates[0] ? invoiceDates[0] : null,
    };
  });
}

// مكون رأس عمود قابل للفرز
function SortableTh({ label, sortKey, sortConfig, setSortConfig, className }: { label: string; sortKey: string; sortConfig: any; setSortConfig: any; className?: string }) {
  const active = sortConfig && sortConfig.key === sortKey;
  const direction = active ? sortConfig.direction : undefined;
  return (
    <th className={className ? className : "p-2 cursor-pointer select-none"} onClick={() => {
      setSortConfig((cfg: any) => {
        if (cfg && cfg.key === sortKey) {
          // عكس الاتجاه
          return { key: sortKey, direction: cfg.direction === 'asc' ? 'desc' : 'asc' };
        }
        return { key: sortKey, direction: 'asc' };
      });
    }}>
      <span className="flex items-center gap-1 justify-center">
        {label}
        {active && (direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
      </span>
    </th>
  );
}

const CustomerRFMTable = (props: CustomerRFMTableProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => await customersService.getAll(),
    enabled: isMounted && !props.customers,
  });
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => await invoicesService.getAll(),
    enabled: isMounted && !props.invoices,
  });
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const finalCustomers = props.customers || customers;
  const finalInvoices = props.invoices || invoices;
  const loading = props.loading || loadingCustomers || loadingInvoices;

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const customerRFM = getCustomerRFM(finalCustomers, finalInvoices);

  // دالة فرز
  function sortData<T>(data: T[], key: keyof T, direction: 'asc' | 'desc') {
    return [...data].sort((a, b) => {
      if (a[key] === undefined || b[key] === undefined) return 0;
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return direction === 'asc' ? (a[key] as number) - (b[key] as number) : (b[key] as number) - (a[key] as number);
      }
      return direction === 'asc'
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });
  }
  const sortedData = sortConfig ? sortData(customerRFM, sortConfig.key as any, sortConfig.direction) : customerRFM;

  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل RFM للعملاء</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b">
                <SortableTh label="#" sortKey="id" sortConfig={sortConfig} setSortConfig={setSortConfig} className="p-2" />
                <SortableTh label="اسم العميل" sortKey="name" sortConfig={sortConfig} setSortConfig={setSortConfig} className="p-2" />
                <SortableTh label="نوع النشاط" sortKey="businessType" sortConfig={sortConfig} setSortConfig={setSortConfig} className="p-2" />
                <SortableTh label="Recency (أيام)" sortKey="recency" sortConfig={sortConfig} setSortConfig={setSortConfig} className="p-2" />
                <SortableTh label="Frequency" sortKey="frequency" sortConfig={sortConfig} setSortConfig={setSortConfig} className="p-2" />
                <SortableTh label="Monetary" sortKey="monetary" sortConfig={sortConfig} setSortConfig={setSortConfig} className="p-2" />
                <th className="p-2">آخر عملية شراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center">جارٍ التحميل...</td></tr>
              ) : (
                sortedData.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={
                      idx % 2 === 0
                        ? 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                    }
                  >
                    <td className="p-2 font-bold text-blue-600 dark:text-blue-300">{formatNumberEn(idx + 1)}</td>
                    <td className="p-2 font-semibold dark:text-gray-100">{c.name}</td>
                    <td className="p-2 dark:text-gray-200">{c.businessType}</td>
                    <td className="p-2 text-gray-700 font-bold dark:text-gray-300">{c.recency !== null ? formatNumberEn(c.recency) + ' يوم' : 'غير متاح'}</td>
                    <td className="p-2 text-gray-700 font-bold dark:text-gray-300">{formatNumberEn(c.frequency)}</td>
                    <td className="p-2 text-green-700 font-bold dark:text-green-300">{formatAmountEn(c.monetary)}</td>
                    <td className="p-2 dark:text-gray-200" dir="ltr">{c.lastPurchase ? formatDateEn(c.lastPurchase) : 'لم يشترِ من قبل'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerRFMTable;
