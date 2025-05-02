import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { useEffect } from 'react';
import { getInvoicesByCustomerId, getProductById } from '@/lib/data';
import { calculateClassificationAndLevel } from '@/lib/customerClassification';
import { egyptGovernorates } from '../lib/egyptLocations';
import { customersToCSV, csvToCustomers, customersToExcel, excelToCustomers } from '../lib/customerImportExport';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import CustomerCard from '@/components/customer/CustomerCard';
import CustomerEditDialog from '@/components/customer/CustomerEditDialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { useInvoices } from '@/hooks/useInvoices';
import { usePayments } from '@/hooks/usePayments';
import { useRedemptions } from '@/hooks/useRedemptions';
import { useMemo } from 'react';
import { formatNumberEn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import ViewToggle from '@/components/invoice/ViewToggle';

const Customers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>('all');
  const [governorateFilter, setGovernorateFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // استخدام React Query hook
  const { getAll, addCustomer, updateCustomer } = useCustomers();
  const { data: customers = [], isLoading, refetch } = getAll;
  
  // زر تحديث يدوي لإجبار إعادة جلب بيانات العملاء
  const [refreshing, setRefreshing] = useState(false);
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({
      title: 'تم تحديث البيانات',
      description: 'تم إعادة جلب بيانات العملاء من قاعدة البيانات',
    });
  };

  // إعداد الاستماع لتحديثات العملاء في الوقت الفعلي
  useEffect(() => {
    const channel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        () => {
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  
  // Form state
  const [newCustomer, setNewCustomer] = useState<any>({
    id: '',
    name: '',
    contactPerson: '',
    phone: '',
    businessType: BusinessType.SERVICE_CENTER,
    creditBalance: 0,
    governorate: '',
    city: ''
  });

  // مدن المحافظة المختارة في نموذج الإضافة
  const citiesForSelectedGovernorate = egyptGovernorates.find(g => g.governorate === newCustomer.governorate)?.cities || [];

  // --- تحديث مستويات العملاء بناءً على الأهمية ---
  // حساب القيم القصوى لجميع العملاء
  const maxAmount = Math.max(...customers.map(c => {
    const invoices = getInvoicesByCustomerId(c.id);
    return invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  }), 1);
  const maxFrequency = Math.max(...customers.map(c => {
    const invoices = getInvoicesByCustomerId(c.id);
    return invoices.length;
  }), 1);
  const maxPoints = Math.max(...customers.map(c => Number(c.pointsEarned || 0)), 1);

  // استخراج المحافظات والمدن الفريدة للفلترة
  const uniqueGovernorates = egyptGovernorates.map(g => g.governorate);
  const uniqueCities = governorateFilter !== 'all'
    ? (egyptGovernorates.find(g => g.governorate === governorateFilter)?.cities || [])
    : Array.from(new Set(customers.map(c => c.city).filter(Boolean)));

  // تحديث التصنيف (عدد النجوم) بناءً على تنوع المشتريات من الأقسام الأساسية فقط
  // (تم نقل المنطق إلى دالة مشتركة)
  const customersWithLevel = customers.map(c => {
    const invoices = getInvoicesByCustomerId(c.id);
    const { classification, level } = calculateClassificationAndLevel(c, invoices);
    return { ...c, level, classification };
  });

  // فلترة العملاء حسب البحث والفلاتر
  const filteredCustomers = customersWithLevel.filter((customer) => {
    const matchesSearch =
      customer.name.includes(searchTerm) ||
      customer.contactPerson.includes(searchTerm) ||
      customer.phone.includes(searchTerm) ||
      customer.id.includes(searchTerm);
    const matchesBusinessType = businessTypeFilter === 'all' || customer.businessType === businessTypeFilter;
    const matchesGovernorate = governorateFilter === 'all' || (customer.governorate || '') === governorateFilter;
    const matchesCity = cityFilter === 'all' || (customer.city || '') === cityFilter;
    return matchesSearch && matchesBusinessType && matchesGovernorate && matchesCity;
  });
  
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
      creditBalance: newCustomer.creditBalance || 0,
      currentPoints: 0,
      pointsEarned: 0,
      pointsRedeemed: 0,
      classification: 0,
      level: customers.length + 1,
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
          creditBalance: 0,
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

  // دالة لإعادة تعيين جميع الفلاتر
  const resetFilters = () => {
    setSearchTerm('');
    setBusinessTypeFilter('all');
    setGovernorateFilter('all');
    setCityFilter('all');
  };

  // تصدير العملاء إلى ملف Excel
  const handleExportCustomers = () => {
    const blob = customersToExcel(customers);
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
          failedRows.push({
            row: idx + 2, // +2: 1-based index + header row
            ...customer
          });
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
  const [view, setView] = useState<'table' | 'cards'>(isMobile ? 'cards' : 'table');

  useEffect(() => {
    if (isMobile) setView('cards');
  }, [isMobile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customers_view', view);
    }
  }, [view]);

  // --- Real-time points cell ---
  function CustomerPointsCell({ customerId }: { customerId: string }) {
    const { getByCustomerId: getInvoices } = useInvoices();
    const { getByCustomerId: getRedemptions } = useRedemptions();
    const invoicesQuery = getInvoices(customerId);
    const redemptionsQuery = getRedemptions(customerId);
    const points = useMemo(() => {
      const invoices = invoicesQuery.data || [];
      const redemptions = redemptionsQuery.data || [];
      const pointsEarned = invoices.reduce((sum, inv) => sum + (inv.pointsEarned || 0), 0);
      const pointsRedeemed = redemptions.reduce((sum, r) => sum + (r.totalPointsRedeemed || 0), 0);
      return pointsEarned - pointsRedeemed;
    }, [invoicesQuery.data, redemptionsQuery.data]);
    if (invoicesQuery.isLoading || redemptionsQuery.isLoading) {
      return <span className="text-muted-foreground">...</span>;
    }
    if (invoicesQuery.isError || redemptionsQuery.isError) {
      return <span className="text-destructive">خطأ</span>;
    }
    return <>{formatNumberEn(points)}</>;
  }

  // --- Real-time balance cell ---
  function CustomerBalanceCell({ customerId }: { customerId: string }) {
    const { getByCustomerId: getInvoices } = useInvoices();
    const { getByCustomerId: getPayments } = usePayments();
    const invoicesQuery = getInvoices(customerId);
    const paymentsQuery = getPayments(customerId);
    const totalBalance = useMemo(() => {
      const invoices = invoicesQuery.data || [];
      const payments = paymentsQuery.data || [];
      const invoiceTotal = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const paymentTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      return invoiceTotal - paymentTotal;
    }, [invoicesQuery.data, paymentsQuery.data]);
    if (invoicesQuery.isLoading || paymentsQuery.isLoading) {
      return <span className="text-muted-foreground">...</span>;
    }
    if (invoicesQuery.isError || paymentsQuery.isError) {
      return <span className="text-destructive">خطأ</span>;
    }
    return <>{formatNumberEn(totalBalance)} ج.م</>;
  }

  // فتح نافذة إضافة عميل تلقائياً إذا تم التوجيه مع state مناسب
  useEffect(() => {
    if (location.state && location.state.openAddDialog) {
      setIsAddDialogOpen(true);
    }
  }, [location.state]);

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
            disabled={refreshing || isLoading}
            aria-label="تحديث البيانات"
          >
            {refreshing || isLoading ? (
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
      
      {/* تحسين مربعات البحث والفلترة وزر إعادة التعيين - دعم كامل للاستجابة */}
      <div className="flex flex-wrap gap-2 mb-6 items-center bg-gradient-to-tr from-blue-50/40 to-white dark:from-zinc-900/60 dark:to-zinc-800/80 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-zinc-700
        sm:flex-nowrap sm:gap-3 md:gap-4 lg:gap-6
        sm:justify-start justify-center
        max-w-full overflow-x-auto">
        <div className="relative flex items-center">
          <Input
            placeholder="بحث بالاسم أو الهاتف أو الكود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-52 md:w-60 lg:w-72 rounded-lg border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/70 bg-white dark:bg-zinc-900 dark:border-zinc-700 dark:focus:border-blue-700 shadow-sm transition-all min-w-[180px]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
        </div>
        <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
          <SelectTrigger className="w-full sm:w-44 md:w-48 lg:w-56 rounded-lg border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/70 bg-white dark:bg-zinc-900 dark:border-zinc-700 dark:focus:border-blue-700 shadow-sm transition-all min-w-[120px]">
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
          <SelectTrigger className="w-full sm:w-44 md:w-48 lg:w-56 rounded-lg border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/70 bg-white dark:bg-zinc-900 dark:border-zinc-700 dark:focus:border-blue-700 shadow-sm transition-all min-w-[120px]">
            <SelectValue placeholder="المحافظة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المحافظات</SelectItem>
            {uniqueGovernorates.map((gov) => (
              <SelectItem key={gov} value={gov}>{gov}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full sm:w-44 md:w-48 lg:w-56 rounded-lg border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/70 bg-white dark:bg-zinc-900 dark:border-zinc-700 dark:focus:border-blue-700 shadow-sm transition-all min-w-[120px]">
            <SelectValue placeholder="المدينة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المدن</SelectItem>
            {uniqueCities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={resetFilters}
          variant="outline"
          className="rounded-lg px-4 py-2 font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-700 shadow-sm transition-all min-w-[130px]"
        >
          <Filter className="w-4 h-4 ml-1 text-blue-400" /> إعادة تعيين الفلاتر
        </Button>
      </div>
      
      {view === 'table' ? (
        <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">كود العميل</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">اسم العميل</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">المسؤول</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">نوع النشاط</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">هاتف</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">المحافظة</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">المدينة</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100 text-center">النقاط الحالية</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100 text-center">رصيد العميل</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100 text-center">مدة الائتمان (يوم)</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">قيمة الائتمان (EGP)</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">التصنيف</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">المستوى</TableHead>
                <TableHead className="bg-muted/40 text-primary font-bold dark:bg-zinc-900 dark:text-zinc-100">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="h-10 w-10 animate-spin" />
                      <p>جاري تحميل البيانات...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, idx) => (
                  <TableRow 
                    key={customer.id} 
                    className={cn(
                      "group cursor-pointer hover:bg-blue-50/70 transition-all border-b border-muted/30 dark:hover:bg-zinc-800",
                      idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-muted/10 dark:bg-zinc-800",
                      customer.level >= 4 ? "ring-2 ring-blue-200 dark:ring-blue-900" : ""
                    )}
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <TableCell className="font-medium text-primary/90 text-sm dark:text-zinc-100">{formatNumberEn(customer.id)}</TableCell>
                    <TableCell className="font-semibold text-lg dark:text-zinc-100">{customer.name}</TableCell>
                    <TableCell className="text-gray-700 dark:text-zinc-200">{customer.contactPerson}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <span className={customer.businessType === BusinessType.SERVICE_CENTER ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}>●</span>
                        <span className="dark:text-zinc-100">{customer.businessType}</span>
                      </span>
                    </TableCell>
                    <TableCell dir="ltr" className="tracking-wider font-mono dark:text-zinc-100">{customer.phone}</TableCell>
                    <TableCell className="dark:text-zinc-100">{customer.governorate || '-'}</TableCell>
                    <TableCell className="dark:text-zinc-100">{customer.city || '-'}</TableCell>
                    <TableCell className="text-center align-middle">
                      <span className="inline-block min-w-[70px] px-2 py-1 rounded bg-emerald-50 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-700">
                        <CustomerPointsCell customerId={customer.id} />
                      </span>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <span className="inline-block min-w-[90px] px-2 py-1 rounded bg-orange-50 dark:bg-zinc-800 text-orange-700 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-700">
                        <CustomerBalanceCell customerId={customer.id} />
                      </span>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <span className="inline-block min-w-[70px] px-2 py-1 rounded bg-cyan-50 dark:bg-zinc-800 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-700">
                        {formatNumberEn(customer.credit_period)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <span className="inline-block min-w-[90px] px-2 py-1 rounded bg-fuchsia-50 dark:bg-zinc-800 text-fuchsia-700 dark:text-fuchsia-300 font-bold border border-fuchsia-200 dark:border-fuchsia-700">
                        {formatNumberEn(customer.credit_limit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-amber-500 text-lg dark:text-amber-400">
                        {getClassificationDisplay(customer.classification)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold border shadow-sm dark:border-zinc-700",
                        getLevelBadgeClass(customer.level),
                        customer.level >= 4 ? "scale-110 border-2" : "",
                        "dark:text-zinc-100"
                      )}>
                        المستوى {formatNumberEn(customer.level)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" title="إجراءات">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCustomerClick(customer.id)}>
                            <Eye className="w-4 h-4 mr-2" /> تفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                            <Pencil className="w-4 h-4 mr-2" /> تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCustomer(customer.id)} className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300">
                            <Trash className="w-4 h-4 mr-2" /> حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={13} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground dark:text-zinc-400">
                      <Users className="h-10 w-10 mb-2" />
                      <p>لا يوجد عملاء</p>
                      {searchTerm && <p className="text-sm">جرب البحث بمصطلح آخر</p>}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onView={handleCustomerClick}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
                getLevelBadgeClass={getLevelBadgeClass}
                getClassificationDisplay={getClassificationDisplay}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground dark:text-zinc-400 py-12">
              <Users className="h-10 w-10 mb-2" />
              <p>لا يوجد عملاء</p>
              {searchTerm && <p className="text-sm">جرب البحث بمصطلح آخر</p>}
            </div>
          )}
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
              <Label htmlFor="creditBalance">رصيد الآجل</Label>
              <Input 
                id="creditBalance" 
                type="number"
                value={newCustomer.creditBalance}
                onChange={(e) => {
                  // Always store as number, but display as English digits only
                  const val = e.target.value.replace(/[^0-9.\-]/g, '');
                  setNewCustomer({ ...newCustomer, creditBalance: val === '' ? '' : Number(val) });
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
