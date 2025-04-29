import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  FileText, 
  Plus, 
  Filter, 
  ShoppingCart, 
  MoreVertical,
  CreditCard,
  Pencil,
  Trash,
  Calendar,
  Eye,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import PageContainer from '@/components/layout/PageContainer';
import { InvoiceStatus, PaymentMethod } from '@/lib/types';
import { cn } from '@/lib/utils';
import SmartSearch from '@/components/search/SmartSearch';
import { useInvoices } from '@/hooks/useInvoices';
import { useCustomers } from '@/hooks/useCustomers';
import { useRealtime } from '@/hooks/use-realtime';
import { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ViewToggle from '@/components/invoices/ViewToggle';

const Invoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // استخدام React Query hooks
  const { getAll: getAllInvoices, deleteInvoice } = useInvoices();
  const { getAll: getAllCustomers } = useCustomers();
  
  const { data: invoices = [], isLoading: isLoadingInvoices, refetch: refetchInvoices } = getAllInvoices;
  const { data: customers = [], isLoading: isLoadingCustomers } = getAllCustomers;
  
  // إعداد الاستماع لتحديثات الفواتير والمدفوعات في الوقت الفعلي
  const handleRefetch = useCallback(() => {
    refetchInvoices();
  }, [refetchInvoices]);
  
  useRealtime('invoices', handleRefetch);
  useRealtime('payments', handleRefetch);
  
  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };
  
  // ترتيب الفواتير الأحدث أولاً مع دعم الفرز الديناميكي
  const [sortBy, setSortBy] = useState<'date' | 'totalAmount' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // حماية عند التعامل مع تواريخ أو بيانات ناقصة
  const safeDate = (date: any) => {
    if (!date) {
      console.error('Invoice date is missing or invalid:', date);
      return new Date(0); // تاريخ افتراضي
    }
    try {
      return new Date(date);
    } catch (e) {
      console.error('Error parsing invoice date:', date, e);
      return new Date(0);
    }
  };

  const handleSort = (column: 'date' | 'totalAmount' | 'status') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  // Helper function to format date in English (YYYY-MM-DD)
  const formatDate = (date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.error('Invalid date for formatting:', date);
      return '';
    }
    // Always English format
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    let valA, valB;
    if (sortBy === 'date') {
      valA = safeDate(a.date).getTime();
      valB = safeDate(b.date).getTime();
    } else if (sortBy === 'totalAmount') {
      valA = typeof a.totalAmount === 'number' ? a.totalAmount : 0;
      valB = typeof b.totalAmount === 'number' ? b.totalAmount : 0;
    } else if (sortBy === 'status') {
      valA = a.status || '';
      valB = b.status || '';
    }
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const filteredInvoices = sortedInvoices.filter(invoice => {
    // بحث شامل: رقم الفاتورة، اسم العميل، المبلغ، التاريخ
    const customer = getCustomerById(invoice.customerId);
    const search = searchTerm.toLowerCase();
    const matchesInvoiceId = (invoice.id || '').toLowerCase().includes(search);
    const matchesCustomer = (customer?.name || '').toLowerCase().includes(search);
    const matchesAmount = (invoice.totalAmount ? invoice.totalAmount.toString() : '').includes(search);
    const dateStr = formatDate(invoice.date);
    const matchesDate = dateStr.includes(search);
    return (
      (!search || matchesInvoiceId || matchesCustomer || matchesAmount || matchesDate) &&
      (statusFilter !== 'all' ? invoice.status === statusFilter : true)
    );
  });
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'EGP' });
  };
  
  const handleDeleteInvoice = (invoiceId: string, customerId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteInvoice = () => {
    if (invoiceToDelete) {
      // Find the invoice to get its customerId
      const invoice = invoices.find(inv => inv.id === invoiceToDelete);
      if (!invoice) return;
      
      deleteInvoice.mutate({ id: invoiceToDelete, customerId: invoice.customerId });
      setInvoiceToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  
  const getStatusClass = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return "bg-green-100 text-green-800";
      case InvoiceStatus.UNPAID:
        return "bg-amber-100 text-amber-800";
      case InvoiceStatus.PARTIALLY_PAID:
        return "bg-blue-100 text-blue-800";
      case InvoiceStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const isLoading = isLoadingInvoices || isLoadingCustomers;

  if (!Array.isArray(invoices) || !Array.isArray(customers)) {
    return (
      <PageContainer title="خطأ في تحميل البيانات" subtitle="تعذر تحميل بيانات الفواتير أو العملاء">
        <div className="flex flex-col items-center justify-center h-60 text-red-600">
          <span className="text-2xl mb-2">حدث خطأ أثناء تحميل البيانات.</span>
          <Button onClick={() => window.location.reload()} className="mt-4">إعادة المحاولة</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="إدارة الفواتير" subtitle="عرض وإنشاء وإدارة الفواتير">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <SmartSearch
          placeholder="بحث عن فاتورة أو عميل أو رقم أو مبلغ..."
          className="w-full sm:w-64"
          customers={customers}
          onSelectCustomer={(customer) => {
            setSearchTerm(customer.name);
          }}
          onChange={val => setSearchTerm(val)}
        />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="جميع الحالات" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {Object.values(InvoiceStatus).map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ViewToggle view={viewMode} setView={setViewMode} />
          <Button onClick={() => navigate('/create-payment')} variant="outline" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 ml-2 text-primary" />
            تسجيل دفعة
          </Button>
          <Button onClick={() => navigate('/create-invoice')} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
            <ShoppingCart className="h-4 w-4 ml-2" />
            فاتورة جديدة
          </Button>
        </div>
      </div>
      {/* عرض حسب الوضع المختار */}
      {viewMode === 'table' ? (
        <div className="rounded-lg border bg-card shadow-lg overflow-x-auto">
          <Table className="min-w-[900px] text-[15px]">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900">
                <TableHead
                  onClick={() => handleSort('date')}
                  className={`cursor-pointer select-none text-center w-36 transition-colors duration-150 ${sortBy === 'date' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-b-4 border-blue-500' : ''}`}
                  aria-sort={sortBy === 'date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') handleSort('date'); }}
                >
                  <span className="flex items-center justify-center gap-1">
                    التاريخ
                    {sortBy === 'date' && (
                      <span className="inline-block text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </span>
                </TableHead>
                <TableHead className="text-center w-40">رقم الفاتورة</TableHead>
                <TableHead className="text-center w-64">العميل</TableHead>
                <TableHead
                  onClick={() => handleSort('totalAmount')}
                  className={`cursor-pointer select-none text-center w-36 transition-colors duration-150 ${sortBy === 'totalAmount' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-b-4 border-blue-500' : ''}`}
                  aria-sort={sortBy === 'totalAmount' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') handleSort('totalAmount'); }}
                >
                  <span className="flex items-center justify-center gap-1">
                    الإجمالي
                    {sortBy === 'totalAmount' && (
                      <span className="inline-block text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </span>
                </TableHead>
                <TableHead
                  onClick={() => handleSort('status')}
                  className={`cursor-pointer select-none text-center w-32 transition-colors duration-150 ${sortBy === 'status' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-b-4 border-blue-500' : ''}`}
                  aria-sort={sortBy === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                  role="columnheader"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') handleSort('status'); }}
                >
                  <span className="flex items-center justify-center gap-1">
                    الحالة
                    {sortBy === 'status' && (
                      <span className="inline-block text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </span>
                </TableHead>
                <TableHead
                  className="text-center w-32"
                >
                  النقاط المكتسبة
                </TableHead>
                <TableHead className="text-center w-40">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="h-10 w-10 mb-2 animate-spin" />
                      <p>جاري تحميل البيانات...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => {
                  const customer = getCustomerById(invoice.customerId);
                  return (
                    <TableRow
                      key={invoice.id}
                      className={"group cursor-pointer border-b border-gray-100 dark:border-gray-800 transition hover:bg-emerald-50/30 dark:hover:bg-emerald-900/40"}
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <TableCell className="text-center font-mono text-[15px]">{formatDate(invoice.date)}</TableCell>
                      <TableCell className="text-center font-semibold tracking-wide text-[16px] text-emerald-800 dark:text-emerald-200">{invoice.id}</TableCell>
                      <TableCell className="text-center text-gray-800 dark:text-gray-100">{customer?.name || ''}</TableCell>
                      <TableCell className="text-center font-bold text-blue-700 dark:text-blue-300 text-[15px]">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold text-[14px] bg-gray-100 dark:bg-gray-800`}>
                          <span className={`w-2 h-2 rounded-full ${invoice.status === InvoiceStatus.PAID ? 'bg-green-500' : invoice.status === InvoiceStatus.PARTIALLY_PAID ? 'bg-yellow-400' : invoice.status === InvoiceStatus.OVERDUE ? 'bg-red-500' : 'bg-blue-400'}`}></span>
                          {invoice.status === InvoiceStatus.PAID ? 'مدفوع' : invoice.status === InvoiceStatus.UNPAID ? 'غير مدفوع' : invoice.status === InvoiceStatus.PARTIALLY_PAID ? 'مدفوع جزئياً' : 'متأخر'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-bold text-[15px]">
                          ⭐ {invoice.pointsEarned}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/invoices/${invoice.id}`); }}
                            className="rounded-full p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                            aria-label="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/create-invoice/${invoice.customerId}/edit/${invoice.id}`); }}
                            className="rounded-full p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-green-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteInvoice(invoice.id, invoice.customerId); }}
                            className="rounded-full p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                            aria-label="Delete"
                            disabled={invoice.status === InvoiceStatus.PAID}
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-10 w-10 mb-2" />
                      <p>لا توجد فواتير</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => {
              const customer = getCustomerById(invoice.customerId);
              return (
                <Card key={invoice.id} className="shadow-md border p-4 flex flex-col gap-2 transition-all hover:scale-[1.015] hover:shadow-xl border-gray-200 dark:border-gray-800 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-[17px] font-extrabold text-blue-900 dark:text-blue-100">
                      <span>فاتورة #{invoice.id}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded font-semibold text-[14px] bg-gray-100 dark:bg-gray-800">
                        <span className={`w-2 h-2 rounded-full ${invoice.status === InvoiceStatus.PAID ? 'bg-green-500' : invoice.status === InvoiceStatus.PARTIALLY_PAID ? 'bg-yellow-400' : invoice.status === InvoiceStatus.OVERDUE ? 'bg-red-500' : 'bg-blue-400'}`}></span>
                        {invoice.status === InvoiceStatus.PAID ? 'مدفوع' : invoice.status === InvoiceStatus.UNPAID ? 'غير مدفوع' : invoice.status === InvoiceStatus.PARTIALLY_PAID ? 'مدفوع جزئياً' : 'متأخر'}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-800 dark:text-gray-200 text-[15px]">
                      {customer?.name || '---'} | {formatDate(invoice.date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-blue-800 dark:text-blue-300">الإجمالي: <span className="font-extrabold">{formatCurrency(invoice.totalAmount)}</span></div>
                      <div className="font-bold">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-[15px]">
                          ⭐ النقاط المكتسبة: {invoice.pointsEarned}
                        </span>
                      </div>
                      <div className="font-medium text-gray-700 dark:text-gray-300">طريقة الدفع: <span className="font-semibold">{invoice.paymentMethod}</span></div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    <button
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="rounded-full p-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                      aria-label="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/create-invoice/${invoice.customerId}/edit/${invoice.id}`)}
                      className="rounded-full p-2 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-700 text-green-700 dark:text-green-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteInvoice(invoice.id, invoice.customerId)}
                      className="rounded-full p-2 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-700 text-red-700 dark:text-red-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                      aria-label="Delete"
                      disabled={invoice.status === InvoiceStatus.PAID}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-10 w-10 mb-2" />
              <p>لا توجد فواتير</p>
            </div>
          )}
        </div>
      )}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الفاتورة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الفاتورة بشكل نهائي من النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteInvoice} 
              className="bg-destructive text-destructive-foreground"
              disabled={deleteInvoice.isPending}
            >
              {deleteInvoice.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default Invoices;
