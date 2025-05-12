import { useState, useEffect, useMemo } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Plus, Search, Filter, UserPlus, Star, Loader2, Eye, Pencil, Trash, RotateCcw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { BusinessType, Customer, ProductCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCustomers } from '@/hooks/useCustomers';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateClassificationAndLevel } from '@/lib/customerClassification';
import { egyptGovernorates } from '../lib/egyptLocations';
import { customersToCSV, csvToCustomers, customersToExcel, excelToCustomers } from '../lib/customerImportExport';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import CustomerCard from '@/components/customer/CustomerCard';
import CustomerEditDialog from '@/components/customer/CustomerEditDialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import ViewToggle from '@/components/invoices/ViewToggle';
import { InvoiceStatus, ProductCategoryLabels } from '@/lib/types';
import { formatNumberEn } from '@/lib/utils';
import { useInvoices } from '@/hooks/useInvoices';
import { useProducts } from '@/hooks/useProducts';
import DataTable, { Column } from '@/components/ui/DataTable';

const ProductCategoryShortLabels: Record<ProductCategory, string> = {
  [ProductCategory.ENGINE_CARE]: 'المحرك',
  [ProductCategory.EXTERIOR_CARE]: 'السطح',
  [ProductCategory.TIRE_CARE]: 'الإطارات',
  [ProductCategory.DASHBOARD_CARE]: 'التابلوه',
  [ProductCategory.INTERIOR_CARE]: 'الفرش',
  [ProductCategory.SUPPLIES]: 'المستلزمات',
};

const categoryColorClasses: Record<ProductCategory, { bullet: string; text: string }> = {
  [ProductCategory.ENGINE_CARE]: { bullet: 'bg-red-400 dark:bg-red-600', text: 'text-red-800 dark:text-red-300' },
  [ProductCategory.EXTERIOR_CARE]: { bullet: 'bg-blue-400 dark:bg-blue-600', text: 'text-blue-800 dark:text-blue-300' },
  [ProductCategory.TIRE_CARE]: { bullet: 'bg-green-400 dark:bg-green-600', text: 'text-green-800 dark:text-green-300' },
  [ProductCategory.DASHBOARD_CARE]: { bullet: 'bg-yellow-400 dark:bg-yellow-600', text: 'text-yellow-800 dark:text-yellow-300' },
  [ProductCategory.INTERIOR_CARE]: { bullet: 'bg-purple-400 dark:bg-purple-600', text: 'text-purple-800 dark:text-purple-300' },
  [ProductCategory.SUPPLIES]: { bullet: 'bg-teal-400 dark:bg-teal-600', text: 'text-teal-800 dark:text-teal-300' },
};

const Customers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>(() => localStorage.getItem('customers_businessTypeFilter') || 'all');
  const [governorateFilter, setGovernorateFilter] = useState<string>(() => localStorage.getItem('customers_governorateFilter') || 'all');
  const [cityFilter, setCityFilter] = useState<string>(() => localStorage.getItem('customers_cityFilter') || 'all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // إعداد pagination: pageIndex و pageSize قبل الاستخدام
  const [pageIndex, setPageIndex] = useState<number>(() => {
    const saved = localStorage.getItem('customers_page_index');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = localStorage.getItem('customers_page_size');
    return saved ? parseInt(saved, 10) : 50;
  });

  const { addCustomer, updateCustomer, deleteCustomer, getPaginated } = useCustomers();
  const { getAll: getAllInvoices } = useInvoices();
  const { data: allInvoices = [], isLoading: invoicesLoading } = getAllInvoices;
  const { getAll: getAllProducts } = useProducts();
  const { data: products = [], isLoading: productsLoading } = getAllProducts;
  const { data: paginatedResponse, isLoading: customersLoading, refetch } = getPaginated({
    pageIndex,
    pageSize,
    searchTerm,
    businessType: businessTypeFilter,
    governorate: governorateFilter,
    city: cityFilter
  });
  const customersList = paginatedResponse?.items ?? [];
  const totalItems = paginatedResponse?.total ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const [refreshing, setRefreshing] = useState(false);
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({ title: 'تم تحديث البيانات', description: 'تمت إعادة جلب بيانات العملاء' });
  };

  // Form state
  const [newCustomer, setNewCustomer] = useState<any>({
    id: '',
    name: '',
    contactPerson: '',
    phone: '',
    businessType: BusinessType.SERVICE_CENTER,
    openingBalance: 0,
    governorate: '',
    city: ''
  });

  // مدن المحافظة المختارة في نموذج الإضافة
  const citiesForSelectedGovernorate = egyptGovernorates.find(g => g.governorate === newCustomer.governorate)?.cities || [];

  // ملخص بناءً على الصفحة الحالية
  const totalDebt = customersList.reduce((sum, c) => sum + (c.creditBalance || 0), 0);
  const totalPointsEarned = customersList.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
  const totalPointsRedeemed = customersList.reduce((sum, c) => sum + (c.pointsRedeemed || 0), 0);
  const totalPointsRemaining = totalPointsEarned - totalPointsRedeemed;
  const indebtedCount = customersList.filter(c => c.creditBalance && c.creditBalance > 0).length;

  // قائمة المدن المتاحة بناءً على الفلتر
  const availableCities = useMemo(() => {
    if (governorateFilter !== 'all') {
      return egyptGovernorates.find(g => g.governorate === governorateFilter)?.cities || [];
    }
    const cities = customersList.map(c => c.city).filter(city => Boolean(city));
    return Array.from(new Set(cities));
  }, [customersList, governorateFilter]);

  // توزيع نوع النشاط بين العملاء
  const businessTypeDistribution = useMemo(() => {
    const dist = Object.values(BusinessType).reduce((acc, type) => { acc[type] = 0; return acc; }, {} as Record<BusinessType, number>);
    customersList.forEach(c => { if (dist[c.businessType] !== undefined) dist[c.businessType]++; });
    return Object.entries(dist).map(([type, count]) => ({ type, percentage: totalItems ? Math.round((count / totalItems) * 100) : 0 }));
  }, [customersList, totalItems]);

  // توزيع حالات الفواتير بناءً على العملاء الحاليين
  const invoiceStatusDistribution = useMemo(() => {
    if (invoicesLoading) return { unpaid: 0, partiallyPaid: 0, overdue: 0 };
    const customerIds = new Set(customersList.map(c => c.id));
    const filteredInvoices = allInvoices.filter(inv => customerIds.has(inv.customerId));
    const unpaid = filteredInvoices.filter(inv => inv.status === InvoiceStatus.UNPAID).length;
    const partiallyPaid = filteredInvoices.filter(inv => inv.status === InvoiceStatus.PARTIALLY_PAID).length;
    const overdue = filteredInvoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length;
    return { unpaid, partiallyPaid, overdue };
  }, [allInvoices, customersList, invoicesLoading]);

  // توزيع الفئات بناءً على قيمة المبيعات للعملاء الحاليين
  const categoryDistribution = useMemo(() => {
    if (invoicesLoading || productsLoading) return [];
    const customerIds = new Set(customersList.map(c => c.id));
    const catSales: Record<string, number> = {};
    allInvoices.forEach(inv => {
      if (customerIds.has(inv.customerId) && inv.items) {
        inv.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          const cat = product?.category;
          if (!cat) return;
          catSales[cat] = (catSales[cat] || 0) + (item.totalPrice ?? (item.price * item.quantity));
        });
      }
    });
    const totalSales = Object.values(catSales).reduce((sum, v) => sum + v, 0);
    return Object.entries(catSales)
      .map(([name, value]) => ({ name, percentage: totalSales ? Math.round((value / totalSales) * 100) : 0 }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [allInvoices, customersList, invoicesLoading, products, productsLoading]);

  useEffect(() => {
    localStorage.setItem('customers_page_size', pageSize.toString());
    setPageIndex(0);
  }, [pageSize]);

  useEffect(() => {
    localStorage.setItem('customers_page_index', pageIndex.toString());
  }, [pageIndex]);

  useEffect(() => {
    localStorage.setItem('customers_businessTypeFilter', businessTypeFilter);
    setPageIndex(0);
  }, [businessTypeFilter]);

  useEffect(() => {
    localStorage.setItem('customers_governorateFilter', governorateFilter);
    setPageIndex(0);
  }, [governorateFilter]);

  useEffect(() => {
    localStorage.setItem('customers_cityFilter', cityFilter);
    setPageIndex(0);
  }, [cityFilter]);

  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm]);

  const handleAddCustomer = () => {
    if (!newCustomer.id || !newCustomer.name || !newCustomer.contactPerson || !newCustomer.phone) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة بما في ذلك كود العميل",
        variant: "destructive"
      });
      return;
    }

    const customerData: Customer = {
      id: newCustomer.id!,
      name: newCustomer.name!,
      contactPerson: newCustomer.contactPerson!,
      phone: newCustomer.phone!,
      businessType: newCustomer.businessType || BusinessType.SERVICE_CENTER,
      creditBalance: 0,
      openingBalance: newCustomer.openingBalance || 0,
      currentPoints: 0,
      pointsEarned: 0,
      pointsRedeemed: 0,
      classification: 0,
      level: customersList.length + 1,
      governorate: newCustomer.governorate || '',
      city: newCustomer.city || ''
    };

    addCustomer.mutate(customerData, {
      onSuccess: () => {
        setNewCustomer({
          id: '',
          name: '',
          contactPerson: '',
          phone: '',
          businessType: BusinessType.SERVICE_CENTER,
          openingBalance: 0,
          governorate: '',
          city: ''
        });
        setIsAddDialogOpen(false);
      }
    });
  };
  
  // تصحيح مسار فتح صفحة التفاصيل
  const handleCustomerClick = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  // تخصيص ألوان لكل مستوى
  const getLevelBadgeClass = (level: number) => {
    switch (level) {
      case 1:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700"; // عادي
      case 2:
        return "bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-zinc-700 dark:text-yellow-300 dark:border-zinc-600"; // فضي
      case 3:
        return "bg-amber-100 text-amber-900 border-amber-400 dark:bg-zinc-600 dark:text-amber-400 dark:border-zinc-500"; // ذهبي
      case 4:
        return "bg-blue-100 text-blue-900 border-blue-400 dark:bg-zinc-500 dark:text-blue-400 dark:border-zinc-400"; // بلاتيني
      case 5:
        return "bg-purple-100 text-purple-900 border-purple-500 dark:bg-zinc-400 dark:text-purple-400 dark:border-zinc-300"; // VIP
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700";
    }
  };

  const getClassificationDisplay = (classification: number) => {
    const stars = Array(classification).fill('★').join('');
    const emptyStars = Array(5 - classification).fill('☆').join('');
    return stars + emptyStars;
  };

  // ✅ تعديل عميل: يفتح نافذة التعديل بدلاً من رسالة قريبا
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    toast({
      title: "حذف عميل",
      description: `سيتم دعم حذف العميل قريبًا (ID: ${customerId})`,
      variant: "destructive"
    });
  };

  // حالة العميل الجاري تعديله
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCustomerUpdate = (customer: Customer) => {
    updateCustomer.mutate(customer);
    setIsEditDialogOpen(false);
  };

  // تصدير العملاء إلى ملف Excel
  const handleExportCustomers = () => {
    const blob = customersToExcel(customersList);
    saveAs(blob, `تصدير_العملاء_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // استيراد العملاء من ملف Excel أو CSV
  const handleImportCustomers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    let imported: Customer[] = [];
    let successCount = 0;
    let failCount = 0;
    let failedRows: any[] = [];
    try {
      if (file.name.endsWith('.xlsx')) {
        imported = await excelToCustomers(file);
      } else {
        const text = await file.text();
        imported = csvToCustomers(text);
      }
      imported.forEach((customer, idx) => {
        if (!customer.name || !customer.contactPerson || !customer.phone) {
          failCount++;
          failedRows.push({ row: idx + 2, ...customer });
          return;
        }
        addCustomer.mutate(customer);
        successCount++;
      });
      refetch();
      if (failCount > 0) {
        toast({
          title: 'نتيجة الاستيراد',
          description: (
            <div>
              <div>تم استيراد {successCount} عميل بنجاح، وفشل استيراد {failCount} سجل لوجود نقص في البيانات.</div>
              <details style={{marginTop:8}}>
                <summary>عرض السجلات الفاشلة</summary>
                <div style={{maxHeight:200,overflow:'auto'}}>
                  <table style={{direction:'ltr',fontSize:13,borderCollapse:'collapse'}}>
                    <thead>
                      <tr>
                        <th style={{border:'1px solid #ccc',padding:'2px 8px'}}>#</th>
                        <th style={{border:'1px solid #ccc',padding:'2px 8px'}}>Row</th>
                        <th style={{border:'1px solid #ccc',padding:'2px 8px'}}>Name</th>
                        <th style={{border:'1px solid #ccc',padding:'2px 8px'}}>Contact</th>
                        <th style={{border:'1px solid #ccc',padding:'2px 8px'}}>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {failedRows.map((row, i) => (
                        <tr key={i}>
                          <td style={{border:'1px solid #ccc',padding:'2px 8px'}}>{i+1}</td>
                          <td style={{border:'1px solid #ccc',padding:'2px 8px'}}>{row.row}</td>
                          <td style={{border:'1px solid #ccc',padding:'2px 8px'}}>{row.name||'-'}</td>
                          <td style={{border:'1px solid #ccc',padding:'2px 8px'}}>{row.contactPerson||'-'}</td>
                          <td style={{border:'1px solid #ccc',padding:'2px 8px'}}>{row.phone||'-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          ),
          variant: 'destructive',
          duration: 20000,
        });
      } else {
        toast({
          title: 'نتيجة الاستيراد',
          description: `تم استيراد ${successCount} عميل بنجاح!`,
          variant: 'default',
        });
      }
    } catch (err: any) {
      toast({
        title: 'خطأ في الاستيراد',
        description: err.message || 'حدث خطأ أثناء معالجة الملف',
        variant: 'destructive',
      });
    }
    e.target.value = '';
  };

  // واجهة العرض: جدول أو كروت
  const [view, setView] = useState<'table' | 'cards'>(() => {
    const saved = typeof window !== 'undefined'
      ? (localStorage.getItem('customers_view') as 'table' | 'cards' | null)
      : null;
    if (saved === 'table' || saved === 'cards') return saved;
    return isMobile ? 'cards' : 'table';
  });
  useEffect(() => { if (isMobile) setView('cards'); }, [isMobile]);
  useEffect(() => { if (typeof window !== 'undefined') { localStorage.setItem('customers_view', view); } }, [view]);

  // تعريف أعمدة جدول العملاء مع تفعيل الفرز
  const columns: Column<Customer>[] = [
    { header: 'اسم العميل', accessor: 'name' },
    { header: 'كود العميل', accessor: 'id', Cell: value => formatNumberEn(value) },
    { header: 'المسؤول', accessor: 'contactPerson' },
    { header: 'نوع النشاط', accessor: 'businessType' },
    { header: 'هاتف', accessor: 'phone' },
    { header: 'المحافظة', accessor: 'governorate' },
    { header: 'المدينة', accessor: 'city' },
    { header: 'النقاط الحالية', accessor: 'currentPoints', Cell: value => formatNumberEn(value) },
    { header: 'رصيد العميل', accessor: 'creditBalance', Cell: value => formatNumberEn(value) },
    { header: 'مدة الائتمان (يوم)', accessor: 'credit_period', Cell: value => formatNumberEn(value) },
    { header: 'قيمة الائتمان (EGP)', accessor: 'credit_limit', Cell: value => formatNumberEn(value) },
    { header: 'التصنيف', accessor: 'classification' },
    { header: 'المستوى', accessor: 'level' },
    { header: 'إجراءات', accessor: 'id', Cell: (_v, row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="إجراءات">
            <Eye className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleCustomerClick(row.id)}>
            <Eye className="w-4 h-4 mr-2" /> تفاصيل
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEditCustomer(row)}>
            <Pencil className="w-4 h-4 mr-2" /> تعديل
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDeleteCustomer(row.id)} className="text-red-600 dark:text-red-400">
            <Trash className="w-4 h-4 mr-2" /> حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) },
  ];

  return (
    <PageContainer
      title="إدارة العملاء"
      subtitle="عرض وإضافة وتحليل العملاء"
      extra={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="p-2 h-10 w-10 border border-muted-foreground/20 hover:bg-primary/10 hover:text-primary transition-colors shadow-sm rounded-full relative"
            onClick={handleManualRefresh}
            disabled={refreshing || customersLoading}
            aria-label="تحديث البيانات"
          >
            {refreshing || customersLoading ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <RotateCcw className="animate-spin w-5 h-5 text-primary" />
              </span>
            ) : (
              <RotateCcw className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </Button>
          <ThemeToggle />
        </div>
      }
    >
      {/* أزرار عصرية أعلى الصفحة */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <ViewToggle view={view} setView={setView} storageKey="customers_view" />
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg bg-gradient-to-l from-primary to-green-500 text-white shadow-md hover:from-green-600 hover:to-primary dark:from-green-900 dark:to-green-700 px-5 py-2 font-bold text-base transition-all min-w-[130px] flex items-center gap-2"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          إضافة عميل
        </Button>
        <Button
          variant="ghost"
          className="rounded-lg px-4 py-2 font-medium border border-green-200 text-green-700 bg-white hover:bg-green-50 shadow-sm transition-all duration-200"
          onClick={handleExportCustomers}
        >
          <Star className="w-4 h-4 ml-1" /> تصدير العملاء
        </Button>
        <label htmlFor="import-customers" className="rounded-lg px-4 py-2 font-medium border border-orange-200 text-orange-700 bg-white hover:bg-orange-50 shadow-sm transition-all duration-200 cursor-pointer ml-2 flex items-center">
          <Loader2 className="w-4 h-4 ml-1" /> استيراد العملاء
          <input
            id="import-customers"
            type="file"
            accept=".csv,.xlsx"
            style={{ display: 'none' }}
            onChange={handleImportCustomers}
          />
        </label>
        <div className="flex gap-2 items-center ml-4">
        </div>
      </div>
      
      {/* تحسين مربعات البحث والفلترة وزر إعادة التعيين */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg shadow-sm">
          <h3 className="text-sm text-blue-600 dark:text-blue-300 font-semibold">عدد العملاء</h3>
          <p className="mt-1 text-xl font-bold text-blue-800 dark:text-blue-100">{formatNumberEn(totalItems)}</p>
          <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <div>إجمالي المديونيات: <span className="font-semibold">{formatNumberEn(totalDebt)} EGP</span></div>
            <div>عدد المدينين: <span className="font-semibold">{formatNumberEn(indebtedCount)}</span></div>
          </div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg shadow-sm">
          <h3 className="text-sm text-green-600 dark:text-green-300 font-semibold">ملخص النقاط</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-400 dark:bg-green-600 rounded-full"></span>
              <span className="ml-1">المكتسبة:</span>
              <span className="ml-auto font-semibold text-green-800 dark:text-green-200">{formatNumberEn(totalPointsEarned)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-indigo-400 dark:bg-indigo-600 rounded-full"></span>
              <span className="ml-1">المستبدلة:</span>
              <span className="ml-auto font-semibold text-indigo-800 dark:text-indigo-200">{formatNumberEn(totalPointsRedeemed)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></span>
              <span className="ml-1">المتبقية:</span>
              <span className="ml-auto font-semibold text-gray-800 dark:text-gray-200">{formatNumberEn(totalPointsRemaining)}</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg shadow-sm">
          <h3 className="text-sm text-yellow-600 dark:text-yellow-300 font-semibold">حالة الفواتير</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-red-400 dark:bg-red-600 rounded-full"></span><span className="ml-1">غير مدفوعة:</span><span className="ml-auto font-semibold text-red-700 dark:text-red-300">{formatNumberEn(invoiceStatusDistribution.unpaid)}</span></div>
            <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-orange-400 dark:bg-orange-600 rounded-full"></span><span className="ml-1">مدفوعة جزئياً:</span><span className="ml-auto font-semibold text-orange-700 dark:text-orange-300">{formatNumberEn(invoiceStatusDistribution.partiallyPaid)}</span></div>
            <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-yellow-400 dark:bg-yellow-600 rounded-full"></span><span className="ml-1">متأخرة:</span><span className="ml-auto font-semibold text-yellow-700 dark:text-yellow-300">{formatNumberEn(invoiceStatusDistribution.overdue)}</span></div>
          </div>
        </div>
        <div className="p-2 bg-teal-50 dark:bg-teal-900 border border-teal-200 dark:border-teal-700 rounded-lg shadow-sm">
          <h3 className="text-xs text-teal-600 dark:text-teal-300 font-semibold">توزيع الفئات</h3>
          <div className="mt-1 grid grid-cols-2 gap-y-1 gap-x-1">
            {categoryDistribution.map(({ name, percentage }) => {
              const color = categoryColorClasses[name as ProductCategory] || { bullet: 'bg-blue-400 dark:bg-blue-600', text: 'text-blue-800 dark:text-blue-300' };
              return (
                <div key={name} className="flex justify-between items-center min-w-0 py-0.5">
                  <span className="flex items-center gap-1 min-w-0 overflow-hidden">
                    <span className={`w-1 h-1 rounded-full ${color.bullet}`}></span>
                    <span className="truncate text-xs flex-1">{ProductCategoryShortLabels[name as ProductCategory] || name}</span>
                  </span>
                  <span className={`${color.text} font-semibold text-base`}>{formatNumberEn(percentage)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* تحسين مربعات البحث والفلترة وزر إعادة التعيين */}
      <div className="flex flex-wrap gap-2 mb-6 items-center bg-gradient-to-tr from-blue-50/40 to-white dark:from-zinc-900/60 dark:to-zinc-800/80 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-zinc-700
        sm:flex-nowrap sm:gap-3 md:gap-4 lg:gap-6
        sm:justify-start justify-center
        max-w-full overflow-x-auto">
        <div className="relative flex items-center">
          <Input
            placeholder="بحث بالاسم، الكود، الهاتف أو اسم المسؤول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-52 md:w-60 lg:w-72 rounded-lg border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/70 bg-white dark:bg-zinc-900 dark:border-zinc-700 dark:focus:border-blue-700 shadow-sm transition-all min-w-[180px]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
        </div>
        <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="نوع النشاط" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنشطة</SelectItem>
            {Object.values(BusinessType).map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={governorateFilter} onValueChange={setGovernorateFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="المحافظة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المحافظات</SelectItem>
            {egyptGovernorates.map((gov) => (
              <SelectItem key={gov.governorate} value={gov.governorate}>{gov.governorate}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="المدينة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المدن</SelectItem>
            {availableCities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setSearchTerm('');
            setBusinessTypeFilter('all');
            setGovernorateFilter('all');
            setCityFilter('all');
          }}
          variant="outline"
          className="rounded-lg px-4 py-2 font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 shadow-sm transition-all min-w-[130px]"
        >
          <Filter className="w-4 h-4 ml-1 text-blue-400" /> إعادة تعيين الفلاتر
        </Button>
      </div>
      
      {view === 'table' ? (
        <>
          {/* جدول العملاء مع الفرز والصفحات */}
          <DataTable
            data={customersList}
            columns={columns}
            defaultPageSize={pageSize}
            pageIndex={pageIndex}
            onPageChange={setPageIndex}
            totalItems={totalItems}
            loading={customersLoading}
            onRowClick={(row) => handleCustomerClick(row.id)}
          />
          <div className="flex items-center justify-between mt-4 px-4">
            <div className="flex items-center gap-2">
              <span>عرض </span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue placeholder={`${pageSize}`} />
                </SelectTrigger>
                <SelectContent>
                  {[50, 100, 150, 200].map((n) => (
                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span> صفوف لكل صفحة</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)}>السابق</Button>
              <span>صفحة {pageIndex + 1} من {totalPages}</span>
              <Button variant="outline" disabled={pageIndex >= totalPages - 1} onClick={() => setPageIndex(pageIndex + 1)}>التالي</Button>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {customersList.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onView={handleCustomerClick}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
              getLevelBadgeClass={getLevelBadgeClass}
              getClassificationDisplay={getClassificationDisplay}
            />
          ))}
        </div>
      )}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogTitle>إضافة عميل جديد</DialogTitle>
          <div className="space-y-4">
            <div>
              <Label htmlFor="id">كود العميل</Label>
              <Input 
                id="id" 
                value={newCustomer.id}
                onChange={(e) => setNewCustomer({ ...newCustomer, id: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name">اسم العميل</Label>
              <Input 
                id="name" 
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contactPerson">المسؤول</Label>
              <Input 
                id="contactPerson" 
                value={newCustomer.contactPerson}
                onChange={(e) => setNewCustomer({ ...newCustomer, contactPerson: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">هاتف</Label>
              <Input 
                id="phone" 
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="businessType">نوع النشاط</Label>
              <Select
                value={newCustomer.businessType}
                onValueChange={(value) => setNewCustomer({ ...newCustomer, businessType: value as BusinessType })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="نوع النشاط" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BusinessType).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="openingBalance">الرصيد الافتتاحي (ج.م)</Label>
              <Input
                id="openingBalance"
                type="number"
                value={newCustomer.openingBalance}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.\-]/g, '');
                  setNewCustomer({ ...newCustomer, openingBalance: val === '' ? '' : Number(val) });
                }}
                className="mt-1 text-left ltr"
                inputMode="decimal"
                pattern="[0-9]*"
                style={{ direction: 'ltr' }}
              />
            </div>
            <div>
              <Label htmlFor="governorate">المحافظة</Label>
              <Select
                value={newCustomer.governorate}
                onValueChange={(value) => {
                  setNewCustomer({ ...newCustomer, governorate: value, city: '' });
                }}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {egyptGovernorates.map(g => (
                    <SelectItem key={g.governorate} value={g.governorate}>{g.governorate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Select
                value={newCustomer.city}
                onValueChange={(value) => setNewCustomer({ ...newCustomer, city: value })}
                disabled={!newCustomer.governorate}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {citiesForSelectedGovernorate.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="default" onClick={handleAddCustomer}>إضافة عميل</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogTitle>تعديل عميل</DialogTitle>
          {editingCustomer && (
            <CustomerEditDialog
              customer={editingCustomer}
              isOpen={isEditDialogOpen}
              onClose={() => setIsEditDialogOpen(false)}
              onSave={handleCustomerUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Customers;
