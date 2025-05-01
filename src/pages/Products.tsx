import React from "react";
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
import { Package, Plus, Search, Filter, ExternalLink, Loader2, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Product, ProductCategory, ProductCategoryLabels } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import ProductCard from "@/components/products/ProductCard";
import { useIsMobile } from '@/hooks/use-mobile';

const Products = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { getAll, addProduct, updateProduct, deleteProduct } = useProducts();
  const { data: products = [], isLoading } = getAll;

  // قيمة افتراضية للوحدة عند إنشاء منتج جديد
  const defaultUnit = "قطعة";
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: '',
    name: '',
    unit: defaultUnit,
    category: ProductCategory.ENGINE_CARE,
    price: 0,
    pointsEarned: 0,
    pointsRequired: 0,
    brand: '',
  });

  // قائمة البراندات الأساسية
  const BRANDS = ["CRYSTAL", "CRAX", "TOOLS", "END USER"];

  // فلترة المنتجات
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter !== 'all' ? product.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  // إضافة منتج
  const handleAddProduct = () => {
    if (!newProduct.id || !newProduct.name || !newProduct.unit || !newProduct.brand) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة بما في ذلك كود المنتج",
        variant: "destructive"
      });
      return;
    }
    // إرسال اسم القسم بالعربية للباك اند كما هو معرف في قاعدة البيانات
    const productToAdd = {
      id: newProduct.id!,
      name: newProduct.name!,
      category: ProductCategoryLabels[newProduct.category as ProductCategory] || newProduct.category!,
      unit: newProduct.unit!,
      brand: newProduct.brand!,
      price: Number(newProduct.price) || 0,
      pointsEarned: Number(newProduct.pointsEarned) || 0,
      pointsRequired: Number(newProduct.pointsRequired) || 0
    };
    addProduct.mutate(productToAdd, {
      onSuccess: () => {
        setNewProduct({
          id: '', name: '', unit: defaultUnit, category: ProductCategory.ENGINE_CARE, price: 0, pointsEarned: 0, pointsRequired: 0, brand: '',
        });
        setIsAddDialogOpen(false);
      }
    });
  };

  // تعديل منتج
  const handleEditProduct = (product: Product) => {
    setEditProduct(product);
    setIsEditDialogOpen(true);
  };
  const handleSaveEditProduct = () => {
    if (editProduct && editProduct.id) {
      updateProduct.mutate(editProduct as Product, {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditProduct(null);
        }
      });
    }
  };

  // حذف منتج
  const handleDeleteProduct = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteDialogOpen(true);
  };
  const confirmDeleteProduct = () => {
    if (deleteTargetId) {
      deleteProduct.mutate(deleteTargetId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteTargetId(null);
        }
      });
    }
  };

  // ✅ تصحيح مسار تفاصيل المنتج ليطابق الراوتر
  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const categoryColorMap: Record<ProductCategory, string> = {
    [ProductCategory.ENGINE_CARE]: 'bg-blue-100 text-blue-800',
    [ProductCategory.EXTERIOR_CARE]: 'bg-green-100 text-green-800',
    [ProductCategory.TIRE_CARE]: 'bg-purple-100 text-purple-800',
    [ProductCategory.DASHBOARD_CARE]: 'bg-amber-100 text-amber-800',
    [ProductCategory.INTERIOR_CARE]: 'bg-red-100 text-red-800',
    [ProductCategory.SUPPLIES]: 'bg-yellow-100 text-yellow-800',
  };

  // تنسيق الأرقام بالإنجليزية فقط
  const formatNumber = (num: number | string) => Number(num).toLocaleString('en-US');

  // --- استيراد المنتجات من ملف اكسل ---
  const handleImportProducts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
      // تحقق من الأعمدة المطلوبة
      const requiredFields = ['id','name','unit','category','price','pointsEarned','pointsRequired','brand'];
      const invalidRows = rows.filter((row: any) => requiredFields.some(key => !row[key] && row[key] !== 0));
      if (invalidRows.length > 0) {
        toast({
          title: 'خطأ في الاستيراد',
          description: 'هناك صفوف ناقصة البيانات أو غير مطابقة للنموذج. يرجى مراجعة الملف.',
          variant: 'destructive',
        });
        return;
      }
      // تحويل القيم الرقمية
      const productsToImport = rows.map((row: any) => ({
        id: String(row.id),
        name: String(row.name),
        unit: String(row.unit),
        category: String(row.category),
        price: Number(row.price),
        pointsEarned: Number(row.pointsEarned),
        pointsRequired: Number(row.pointsRequired),
        brand: String(row.brand),
      }));
      // استيراد المنتجات
      let successCount = 0;
      let failCount = 0;
      for (const prod of productsToImport) {
        await new Promise(res => setTimeout(res, 50)); // لتقليل الضغط على السيرفر
        await addProduct.mutateAsync(prod as Product)
          .then(() => { successCount++; })
          .catch(() => { failCount++; });
      }
      toast({
        title: 'تم الاستيراد',
        description: `تم استيراد ${successCount} منتج بنجاح${failCount ? `، وفشل استيراد ${failCount} منتج (قد يكون مكرر أو به خطأ)` : ''}`,
        variant: failCount ? 'destructive' : 'default',
      });
    } catch (err) {
      toast({
        title: 'خطأ في الاستيراد',
        description: 'حدث خطأ أثناء قراءة الملف أو معالجته. تأكد من أن الملف مطابق للنموذج.',
        variant: 'destructive',
      });
    }
  };

  // الحالة الجديدة لعرض الجدول أو الكروت
  const [viewMode, setViewMode] = React.useState<'table' | 'card'>(isMobile ? 'card' : 'table');

  // فرض عرض الكروت تلقائياً في وضع الهاتف
  React.useEffect(() => {
    if (isMobile) setViewMode('card');
  }, [isMobile]);

  // حفظ التفضيل عند التغيير
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('products_view_mode', viewMode);
    }
  }, [viewMode]);

  return (
    <PageContainer title="إدارة المنتجات" subtitle="عرض وإضافة وتعديل المنتجات">
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between mb-8 gap-4">
        {/* شريط البحث */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            placeholder="بحث عن منتج..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-primary text-base shadow-sm bg-white dark:bg-gray-900 dark:text-gray-100 w-full"
          />
        </div>
        {/* مجموعة الأزرار العلوية */}
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto justify-end">
          <Button
            asChild
            variant="outline"
            className="flex gap-2 rounded-xl border-2 border-primary/60 dark:border-blue-700 bg-gradient-to-l from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-blue-900 dark:to-blue-950 text-primary dark:text-blue-200 font-semibold shadow-md hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900 dark:hover:to-blue-800 transition-all px-4 py-2 min-w-[150px]"
          >
            <a href="/product_import_template.csv" download>
              <ExternalLink className="h-4 w-4 ml-1" />
              تحميل نموذج الاستيراد
            </a>
          </Button>
          <label className="flex items-center gap-2 cursor-pointer w-full sm:w-auto">
            <span className="bg-gradient-to-l from-primary to-blue-500 text-white rounded-xl px-4 py-2 text-sm font-semibold shadow-md hover:from-blue-600 hover:to-primary dark:from-blue-900 dark:to-blue-700 w-full sm:w-auto text-center transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              استيراد منتجات من Excel
            </span>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
              onChange={handleImportProducts}
            />
          </label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="rounded-xl border-2 border-primary/60 dark:border-blue-700 shadow-md bg-white dark:bg-gray-900 dark:text-gray-100 min-w-[140px] font-semibold text-primary dark:text-blue-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="جميع الأقسام" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 dark:text-gray-100">
              <SelectItem value="all">جميع الأقسام</SelectItem>
              {Object.values(ProductCategory).map((category) => (
                <SelectItem key={category} value={category}>{ProductCategoryLabels[category]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="rounded-xl bg-gradient-to-l from-primary to-blue-500 text-white shadow-md hover:from-blue-600 hover:to-primary dark:from-blue-900 dark:to-blue-700 px-5 py-2 font-bold text-base transition-all min-w-[130px] flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            إضافة منتج
          </Button>
          <Button
            variant="outline"
            className="rounded-xl border-2 border-primary/60 dark:border-blue-700 shadow-md flex items-center gap-2 px-4 py-2 font-semibold text-primary dark:text-blue-200 transition-all min-w-[120px]"
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
          >
            {viewMode === 'table' ? (
              <>
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" className="stroke-current"/><rect x="14" y="3" width="7" height="7" className="stroke-current"/><rect x="14" y="14" width="7" height="7" className="stroke-current"/><rect x="3" y="14" width="7" height="7" className="stroke-current"/></svg>
                عرض كروت
              </>
            ) : (
              <>
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                عرض جدول
              </>
            )}
          </Button>
        </div>
      </div>
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-x-auto w-full">
          <Table className="min-w-[700px] w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800">
                <TableHead className="font-bold text-base text-gray-700 dark:text-gray-200 whitespace-nowrap">كود المنتج</TableHead>
                <TableHead className="font-bold text-base text-gray-700 dark:text-gray-200 whitespace-nowrap">اسم المنتج</TableHead>
                <TableHead className="font-bold text-base text-gray-700 dark:text-gray-200 whitespace-nowrap">القسم</TableHead>
                <TableHead className="font-bold text-base text-gray-700 dark:text-gray-200 whitespace-nowrap">وحدة القياس</TableHead>
                <TableHead className="font-bold text-base text-gray-700 dark:text-gray-200 whitespace-nowrap">البراند</TableHead>
                <TableHead className="font-bold text-base text-gray-700 dark:text-gray-200 whitespace-nowrap">السعر</TableHead>
                <TableHead className="font-bold text-base text-gray-700 dark:text-gray-200 whitespace-nowrap">النقاط المكتسبة</TableHead>
                <TableHead className="font-bold text-base text-gray-700 dark:text-gray-200 whitespace-nowrap">النقاط المطلوبة</TableHead>
                <TableHead className="w-[80px]"/>
                <TableHead className="w-[80px]"/>
                <TableHead className="w-[80px]"/>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="h-10 w-10 mb-2 animate-spin" />
                      <p>جاري تحميل البيانات...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className={cn(
                      "hover:bg-blue-50 dark:hover:bg-blue-900 transition",
                      product.pointsEarned >= 1000 ? "bg-green-50 dark:bg-green-900" : product.price > 500 ? "bg-yellow-50 dark:bg-yellow-900" : "bg-white dark:bg-gray-900"
                    )}>
                      <TableCell className="font-semibold text-gray-800 dark:text-gray-100 text-base whitespace-nowrap">
                        <span className="inline-block px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-xs shadow-sm">
                          {product.id}
                        </span>
                      </TableCell>
                      <TableCell className="text-base whitespace-nowrap">
                        <span className="inline-block px-2 py-1 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-800 dark:text-fuchsia-200 font-semibold text-sm shadow-sm">
                          {product.name}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-gradient-to-l from-gray-100 to-blue-50 dark:from-gray-900 dark:to-blue-800",
                          "text-blue-800 dark:text-blue-200 shadow-sm"
                        )}>
                          {ProductCategoryLabels[Object.keys(ProductCategoryLabels).find(key => ProductCategoryLabels[key as ProductCategory] === product.category) as ProductCategory] || product.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-base whitespace-nowrap">
                        <span className="inline-block px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-sm font-medium shadow-sm">
                          {product.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-base whitespace-nowrap">
                        <span className="inline-block px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-sm font-medium shadow-sm">
                          {product.brand}
                        </span>
                      </TableCell>
                      <TableCell className="text-base whitespace-nowrap">
                        <span className="inline-block px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-bold shadow-sm">
                          {formatNumber(product.price)} ج.م
                        </span>
                      </TableCell>
                      <TableCell className="text-base whitespace-nowrap">
                        <span className="inline-block px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-bold shadow-sm">
                          {formatNumber(product.pointsEarned)}
                        </span>
                      </TableCell>
                      <TableCell className="text-base whitespace-nowrap">
                        <span className="inline-block px-2 py-1 rounded-lg bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 text-sm font-bold shadow-sm">
                          {formatNumber(product.pointsRequired)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewProduct(product.id)}
                          className="hover:bg-blue-200 dark:hover:bg-blue-800 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-100 dark:border-blue-900 rounded-lg shadow-sm transition"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">عرض</span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditProduct(product)}
                          className="hover:bg-yellow-200 dark:hover:bg-yellow-800 bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border border-yellow-100 dark:border-yellow-900 rounded-lg shadow-sm transition"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">تعديل</span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="hover:bg-red-200 dark:hover:bg-red-800 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 border border-red-100 dark:border-red-900 rounded-lg shadow-sm transition"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">حذف</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-10 w-10 mb-2" />
                      <p>لا توجد منتجات</p>
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
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-12">
              <Loader2 className="h-10 w-10 mb-2 animate-spin" />
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onView={handleViewProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-12">
              <Package className="h-10 w-10 mb-2" />
              <p>لا توجد منتجات</p>
              {searchTerm && <p className="text-sm">جرب البحث بمصطلح آخر</p>}
            </div>
          )}
        </div>
      )}
      {/* Dialog تعديل المنتج */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 border dark:border-gray-700 w-[95vw] max-w-full">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <Label htmlFor="edit-id">كود المنتج</Label>
                  <Input id="edit-id" value={editProduct.id} disabled className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label htmlFor="edit-name">اسم المنتج</Label>
                  <Input id="edit-name" value={editProduct.name}
                    onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                    className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full" />
                </div>
                <div>
                  <Label htmlFor="edit-unit">وحدة القياس</Label>
                  <Input id="edit-unit" value={editProduct.unit}
                    onChange={e => setEditProduct({ ...editProduct, unit: e.target.value })}
                    className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full" />
                </div>
                <div>
                  <Label htmlFor="edit-brand">البراند</Label>
                  <Input id="edit-brand" value={editProduct.brand}
                    onChange={e => setEditProduct({ ...editProduct, brand: e.target.value })}
                    className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full" />
                </div>
                <div>
                  <Label htmlFor="edit-category">القسم</Label>
                  <Select value={editProduct.category} onValueChange={(value) => setEditProduct({ ...editProduct, category: value as ProductCategory })}>
                    <SelectTrigger className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 dark:text-gray-100">
                      {Object.values(ProductCategory).map((category) => (
                        <SelectItem key={category} value={category}>{ProductCategoryLabels[category]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-price">السعر</Label>
                  <Input id="edit-price" type="number" value={editProduct.price?.toString() || ''}
                    onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                    className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full" />
                </div>
                <div>
                  <Label htmlFor="edit-pointsEarned">النقاط المكتسبة</Label>
                  <Input id="edit-pointsEarned" type="number" value={editProduct.pointsEarned?.toString() || ''}
                    onChange={e => setEditProduct({ ...editProduct, pointsEarned: Number(e.target.value) })}
                    className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full" />
                </div>
                <div>
                  <Label htmlFor="edit-pointsRequired">النقاط المطلوبة للاستبدال</Label>
                  <Input id="edit-pointsRequired" type="number" value={editProduct.pointsRequired?.toString() || ''}
                    onChange={e => setEditProduct({ ...editProduct, pointsRequired: Number(e.target.value) })}
                    className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full" />
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveEditProduct}
              disabled={updateProduct.isPending}
              className="rounded-xl bg-gradient-to-l from-primary to-blue-500 text-white shadow-md hover:from-blue-600 hover:to-primary dark:from-blue-900 dark:to-blue-700 w-full sm:w-auto"
            >
              {updateProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التعديلات'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Dialog تأكيد حذف المنتج */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 border dark:border-gray-700 w-[95vw] max-w-full">
          <DialogHeader>
            <DialogTitle>تأكيد حذف المنتج</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={confirmDeleteProduct} className="bg-red-500 hover:bg-red-600 text-white rounded-lg dark:bg-red-700 dark:hover:bg-red-800">تأكيد الحذف</Button>
            <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">إلغاء</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Dialog إضافة منتج */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl bg-white dark:bg-gray-900 dark:text-gray-100 border dark:border-gray-700 w-[95vw] max-w-full">
          <DialogHeader>
            <DialogTitle>إضافة منتج جديد</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <Label htmlFor="id">كود المنتج</Label>
                <Input 
                  id="id" 
                  value={newProduct.id}
                  onChange={(e) => setNewProduct({...newProduct, id: e.target.value})}
                  className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label htmlFor="name">اسم المنتج</Label>
                <Input 
                  id="name" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full"
                />
              </div>
              <div>
                <Label htmlFor="unit">وحدة القياس</Label>
                <Input 
                  id="unit" 
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                  className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full"
                />
              </div>
              <div>
                <Label htmlFor="brand">البراند</Label>
                <input
                  list="brands-list"
                  id="brand"
                  value={newProduct.brand || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full"
                  placeholder="اختر أو اكتب البراند"
                />
                <datalist id="brands-list">
                  {BRANDS.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="category">القسم</Label>
                <Select 
                  value={newProduct.category} 
                  onValueChange={(value) => setNewProduct({...newProduct, category: value as ProductCategory})}
                >
                  <SelectTrigger className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 dark:text-gray-100">
                    {Object.values(ProductCategory).map((category) => (
                      <SelectItem key={category} value={category}>{ProductCategoryLabels[category]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">السعر</Label>
                <Input 
                  id="price"
                  type="number"
                  value={newProduct.price?.toString() || ''}
                  onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full"
                />
              </div>
              <div>
                <Label htmlFor="pointsEarned">النقاط المكتسبة</Label>
                <Input 
                  id="pointsEarned"
                  type="number"
                  value={newProduct.pointsEarned?.toString() || ''}
                  onChange={(e) => setNewProduct({...newProduct, pointsEarned: Number(e.target.value)})}
                  className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full"
                />
              </div>
              <div>
                <Label htmlFor="pointsRequired">النقاط المطلوبة للاستبدال</Label>
                <Input 
                  id="pointsRequired"
                  type="number"
                  value={newProduct.pointsRequired?.toString() || ''}
                  onChange={(e) => setNewProduct({...newProduct, pointsRequired: Number(e.target.value)})}
                  className="mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleAddProduct}
              disabled={addProduct.isPending}
              className="rounded-xl bg-gradient-to-l from-primary to-blue-500 text-white shadow-md hover:from-blue-600 hover:to-primary dark:from-blue-900 dark:to-blue-700 w-full sm:w-auto"
            >
              {addProduct.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                'إضافة المنتج'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Products;
