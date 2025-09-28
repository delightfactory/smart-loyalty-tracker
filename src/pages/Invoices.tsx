import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Invoice, InvoiceStatus, PaymentMethod } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import SmartSearch from '@/components/search/SmartSearch';
import { useInvoices } from '@/hooks/useInvoices';
import { useRealtime } from '@/hooks/use-realtime';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ViewToggle from '@/components/invoices/ViewToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { egyptGovernorates } from '@/lib/egyptLocations';
import { formatNumberEn } from '@/lib/utils';
import { customersService } from '@/services/database';
import InvoiceSummary from '@/components/invoices/InvoiceSummary';
import DatePicker from '@/components/ui/DatePicker';
import DataTable, { Column } from '@/components/ui/DataTable';

const Invoices = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // ملاحظة: التعريفات moved أدناه ضمن قسم الفلاتر لتجنّب التكرار
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => (localStorage.getItem('invoices_viewMode') as 'table'|'cards') || (isMobile ? 'cards' : 'table'));
  
  // استخدام React Query hooks
  const { getPaginated, getAggregates, deleteInvoice } = useInvoices();
  // ترقيم وفرز محكوم بالخادم
  const [pageSize,setPageSize] = useState<number>(()=>parseInt(localStorage.getItem('invoices_page_size')||'50',10));
  const [pageIndex,setPageIndex] = useState<number>(()=>parseInt(localStorage.getItem('invoices_page_index')||'0',10));
  const [sortBy, setSortBy] = useState<keyof Invoice>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  // بحث/فلاتر
  const [searchTerm, setSearchTerm] = useState<string>(() => localStorage.getItem('invoices_searchTerm') || '');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(searchTerm);
  const [statusFilter, setStatusFilter] = useState<string>(() => localStorage.getItem('invoices_statusFilter') || 'all');
  const [dateFrom,setDateFrom] = useState<string>(()=>localStorage.getItem('invoices_dateFrom')||'');
  const [dateTo,setDateTo]   = useState<string>(()=>localStorage.getItem('invoices_dateTo')||'');
  const [governorateFilter,setGovernorateFilter] = useState<string>(()=>localStorage.getItem('invoices_governorateFilter')||'all');
  const [cityFilter,setCityFilter] = useState<string>(()=>localStorage.getItem('invoices_cityFilter')||'all');
  // خريطة تحويل أسماء الأعمدة للفرز في الخادم
  const sortMap: Record<string, string> = useMemo(() => ({
    id: 'id',
    date: 'date',
    totalAmount: 'total_amount',
    status: 'status',
    paymentMethod: 'payment_method',
    pointsEarned: 'points_earned',
    customerId: 'customer_id',
  }), []);

  const paginated = getPaginated({
    pageIndex,
    pageSize,
    searchTerm: debouncedSearchTerm,
    statusFilter,
    dateFrom,
    dateTo,
    sortBy,
    sortDir: sortDirection,
    governorateFilter,
    cityFilter,
  });
  const invoices = paginated.data?.items ?? [];
  const totalFiltered = paginated.data?.total ?? 0;
  const isLoadingInvoices = paginated.isLoading;

  // جلب الإحصائيات المجمعة بناءً على نفس الفلاتر
  const aggregates = getAggregates({
    searchTerm: debouncedSearchTerm,
    statusFilter,
    dateFrom,
    dateTo,
    governorateFilter,
    cityFilter,
  });
  const aggregatesData = aggregates.data;
  const isLoadingAggregates = aggregates.isLoading;
  
  // إعداد الاستماع لتحديثات الفواتير والمدفوعات في الوقت الفعلي
  const handleRefetch = useCallback(() => {}, []);
  
  // Fix: Update useRealtime calls to pass only the table name parameter
  useRealtime('invoices');
  useRealtime('payments');
  
  // جلب أسماء العملاء لصفحة النتائج فقط
  const pageCustomerIds = useMemo(() => Array.from(new Set(invoices.map(inv => inv.customerId))), [invoices]);
  const { data: customerNamesMap = {} } = useQuery({
    queryKey: ['customerNames', pageCustomerIds],
    queryFn: () => customersService.getNamesByIds(pageCustomerIds),
    enabled: pageCustomerIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  const getCustomerName = (id: string) => customerNamesMap[id] || '';
  
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

  const handleSort = (column: keyof Invoice) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
    setPageIndex(0);
  };

  // ملاحظة: تحديد حالة الفاتورة المتأخرة يجب أن يتم في الخادم لاحقاً إذا لزم

  useEffect(()=>{localStorage.setItem('invoices_dateFrom',dateFrom); setPageIndex(0);},[dateFrom]);
  useEffect(()=>{localStorage.setItem('invoices_dateTo',dateTo); setPageIndex(0);},[dateTo]);
  useEffect(()=>{localStorage.setItem('invoices_governorateFilter',governorateFilter); setPageIndex(0);},[governorateFilter]);
  useEffect(()=>{localStorage.setItem('invoices_cityFilter',cityFilter); setPageIndex(0);},[cityFilter]);
  useEffect(()=>{localStorage.setItem('invoices_page_size',String(pageSize)); setPageIndex(0);},[pageSize]);
  useEffect(()=>{localStorage.setItem('invoices_page_index',String(pageIndex));},[pageIndex]);

  useEffect(() => { localStorage.setItem('invoices_searchTerm', searchTerm); }, [searchTerm]);
  // Delay running the server query until the user pauses typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 600); // debounce delay (ms)
    return () => clearTimeout(handler);
  }, [searchTerm]);
  // Reset to first page when debounced term changes
  useEffect(() => { setPageIndex(0); }, [debouncedSearchTerm]);
  useEffect(() => { localStorage.setItem('invoices_statusFilter', statusFilter); setPageIndex(0); }, [statusFilter]);
  useEffect(() => { localStorage.setItem('invoices_viewMode', viewMode); }, [viewMode]);

  // إزالة التكرارات لتفادي مفاتيح مكررة في عناصر Select
  const uniqueGovernorates = Array.from(new Set(egyptGovernorates.map(g => g.governorate)));
  const uniqueCities = governorateFilter !== 'all'
    ? Array.from(new Set( (egyptGovernorates.find(g => g.governorate === governorateFilter)?.cities || []) ))
    : [];

  // استخدام الإحصائيات المجمعة بدلاً من حساب الصفحة الحالية
  const totalAmountSum = aggregatesData?.totalAmount ?? 0;
  const statusStats = aggregatesData?.statusBreakdown ?? {};
  const categoryStats = Object.entries(aggregatesData?.categoryBreakdown ?? {})
    .map(([category, data]) => ({
      category: category as any,
      percentage: data.percentage
    }));

  const totalPages = Math.max(1,Math.ceil(totalFiltered/pageSize));

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

  const isLoading = isLoadingInvoices;

  useEffect(() => {
    if (isMobile) setViewMode('cards');
  }, [isMobile]);

  const columns: Column<Invoice>[] = [
    { header: 'التاريخ', accessor: 'date', Cell: value => formatDate(value) },
    { header: 'رقم الفاتورة', accessor: 'id' },
    { header: 'العميل', accessor: 'customerId', Cell: (_v, row) => getCustomerName(row.customerId) },
    { header: 'الإجمالي', accessor: 'totalAmount', Cell: value => formatCurrency(value) },
    { header: 'الحالة', accessor: 'status' },
    { header: 'النقاط المكتسبة', accessor: 'pointsEarned', Cell: value => String(value) },
    { header: 'إجراءات', accessor: 'id', Cell: (_v, row) => (
      <div className="flex justify-center gap-2">
        <button onClick={e => { e.stopPropagation(); navigate(`/invoices/${row.id}`); }} aria-label="View">
          <Eye className="h-4 w-4 text-blue-700 dark:text-blue-200" />
        </button>
        <button onClick={e => { e.stopPropagation(); navigate(`/create-invoice/${row.customerId}/edit/${row.id}`); }} aria-label="Edit">
          <Pencil className="h-4 w-4 text-green-700 dark:text-green-200" />
        </button>
        <button onClick={e => { e.stopPropagation(); handleDeleteInvoice(row.id, row.customerId); }} disabled={row.status === InvoiceStatus.PAID} aria-label="Delete">
          <Trash className="h-4 w-4 text-red-500" />
        </button>
      </div>
    ) }
  ];

  if (!Array.isArray(invoices)) {
    return (
      <PageContainer title="خطأ في تحميل البيانات" subtitle="تعذر تحميل بيانات الفواتير">
        <div className="flex flex-col items-center justify-center h-60 text-red-600">
          <span className="text-2xl mb-2">حدث خطأ أثناء تحميل البيانات.</span>
          <Button onClick={() => window.location.reload()} className="mt-4">إعادة المحاولة</Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="إدارة الفواتير"
      subtitle="عرض وإدارة الفواتير"
      extra={
        <div className="flex gap-2 items-center">
          <ViewToggle view={viewMode} setView={setViewMode} />
          <Button onClick={() => navigate('/create-invoice')}><Plus className="mr-1"/> إنشاء فاتورة</Button>
        </div>
      }
    >
      {(isLoading || isLoadingAggregates) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <InvoiceSummary
          totalFiltered={aggregatesData?.totalCount ?? totalFiltered}
          totalAmountSum={totalAmountSum}
          statusStats={statusStats}
          categoryStats={categoryStats}
        />
      )}
      {/* فلترة إضافية */}
      {isLoading ? (
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full sm:w-40 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-6 items-center bg-gradient-to-tr from-blue-50/40 to-white dark:from-zinc-900/60 dark:to-zinc-800/80 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-zinc-700">
          <DatePicker
            value={dateFrom ? new Date(dateFrom) : null}
            onChange={d => setDateFrom(d ? formatDate(d) : '')}
            placeholder="من تاريخ"
            className="w-full sm:w-40 rounded-lg"
          />
          <DatePicker
            value={dateTo ? new Date(dateTo) : null}
            onChange={d => setDateTo(d ? formatDate(d) : '')}
            placeholder="إلى تاريخ"
            className="w-full sm:w-40 rounded-lg"
          />
          <Select value={governorateFilter} onValueChange={setGovernorateFilter}>
            <SelectTrigger className="w-full sm:w-40 rounded-lg"><SelectValue placeholder="المحافظة"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {uniqueGovernorates.map((gov, idx) => (
                <SelectItem key={`${gov}-${idx}`} value={gov}>{gov}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-40 rounded-lg"><SelectValue placeholder="المدينة"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {uniqueCities.map((city, idx) => (
                <SelectItem key={`${city}-${idx}`} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SmartSearch
            placeholder="بحث..."
            initialSearchTerm={searchTerm}
            onChange={setSearchTerm}
            className="w-full sm:w-40 rounded-lg"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-40 rounded-lg">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {Object.values(InvoiceStatus).map(st => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={()=>{setSearchTerm('');setStatusFilter('all');setDateFrom('');setDateTo('');setGovernorateFilter('all');setCityFilter('all');}} className="min-w-[120px]">إعادة التعيين</Button>
        </div>
      )}
      {/* عرض حسب الوضع المختار */}
      {viewMode === 'table' && (
        <DataTable
          columns={[
            ...columns,
            { header: 'كود العميل', accessor: 'customerId' as const }
          ]}
          data={invoices}
          loading={isLoadingInvoices}
          pageIndex={pageIndex}
          defaultPageSize={pageSize}
          totalItems={totalFiltered}
          onPageChange={setPageIndex}
          sortBy={sortBy}
          sortDir={sortDirection}
          onSortChange={(col, dir) => { setSortBy(col); setSortDirection(dir); setPageIndex(0); }}
        />
      )}
      {viewMode !== 'table' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : invoices.length > 0 ? (
            invoices.map((invoice) => (
                <Card key={invoice.id} className="shadow-md border p-4 flex flex-col gap-2 transition-all hover:scale-[1.015] hover:shadow-xl border-gray-200 dark:border-gray-800 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-[17px] font-extrabold text-blue-900 dark:text-blue-100">
                      <span>فاتورة #{invoice.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold text-[14px] ${
                        invoice.status === InvoiceStatus.PAID ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-500' :
                        invoice.status === InvoiceStatus.PARTIALLY_PAID ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-500' :
                        invoice.status === InvoiceStatus.UNPAID ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border border-orange-500' :
                        'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-500 animate-pulse'
                      }` }>
                        <span className={`w-2 h-2 rounded-full ${
                          invoice.status === InvoiceStatus.PAID ? 'bg-green-500' :
                          invoice.status === InvoiceStatus.PARTIALLY_PAID ? 'bg-yellow-400' :
                          invoice.status === InvoiceStatus.UNPAID ? 'bg-orange-500' :
                          'bg-red-500 animate-pulse'
                        }` }></span>
                        {invoice.status === InvoiceStatus.PAID ? 'مدفوع' :
                         invoice.status === InvoiceStatus.PARTIALLY_PAID ? 'مدفوع جزئياً' :
                         invoice.status === InvoiceStatus.UNPAID ? 'غير مدفوع' :
                         'متأخر'}
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-800 dark:text-gray-200 text-[15px]">
                      {getCustomerName(invoice.customerId) || '---'} | {formatDate(invoice.date)}
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
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="h-10 w-10 mb-2" />
              <p>لا توجد فواتير</p>
            </div>
          )}
        </div>
      )}
      {viewMode !== 'table' && (
        <>
          {/* ترقيم الصفحات */}
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" onClick={()=>setPageIndex(i=>i-1)} disabled={pageIndex===0}>السابق</Button>
            <span className="text-sm">صفحة {pageIndex+1} من {totalPages}</span>
            <Button variant="outline" onClick={()=>setPageIndex(i=>i+1)} disabled={pageIndex>=totalPages-1}>التالي</Button>
            <Select value={String(pageSize)} onValueChange={v => setPageSize(parseInt(v, 10))}>
              <SelectTrigger className="w-20 text-center">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="150">150</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
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
