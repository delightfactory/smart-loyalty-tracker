import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Product, Invoice } from '@/lib/types';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define table dependencies for proper restoration order
const TABLE_ORDER = [
  'settings',
  'customers',
  'products',
  'invoices',
  'invoice_items',
  'payments',
  'redemptions',
  'redemption_items'
] as const;

// Define type for table names from the const array
type TableName = typeof TABLE_ORDER[number];

// Tables with UUID primary keys
const UUID_TABLES = ['redemption_items', 'invoice_items'] as const;
type UuidTableName = typeof UUID_TABLES[number];

/**
 * Helper function to determine if a table uses UUID as primary key
 */
const isUuidTable = (tableName: TableName): tableName is UuidTableName => {
  return UUID_TABLES.includes(tableName as any);
};

/**
 * Creates a backup of all database tables and downloads it as a JSON file
 */
export async function createDatabaseBackup(withLogs = true): Promise<boolean> {
  try {
    const backupData: Record<string, any> = {};
    
    // Fetch data from all tables in the correct order
    for (const tableName of TABLE_ORDER) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
        
      if (error) {
        if (withLogs) console.error(`Error fetching ${tableName}:`, error);
        throw new Error(`فشل في استرجاع بيانات ${tableName}: ${error.message}`);
      }
      
      backupData[tableName] = data;
    }
    
    // Create a JSON file with the backup data
    const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    saveAs(backupBlob, `loyalty_system_backup_${timestamp}.json`);
    
    if (withLogs) {
      toast({
        title: "تم إنشاء نسخة احتياطية بنجاح",
        description: "تم تحميل ملف النسخة الاحتياطية"
      });
    }
    
    return true;
  } catch (error: any) {
    if (withLogs) {
      console.error('Error creating backup:', error);
      toast({
        title: "فشل إنشاء النسخة الاحتياطية",
        description: error.message || "حدث خطأ أثناء إنشاء النسخة الاحتياطية",
        variant: "destructive"
      });
    }
    return false;
  }
}

/**
 * Restores the database from a backup file
 */
export async function restoreFromBackup(backupFile: File): Promise<boolean> {
  try {
    const fileReader = new FileReader();
    
    return new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target?.result as string);
          
          // Clear all tables in reverse order to avoid foreign key constraints
          for (const tableName of [...TABLE_ORDER].reverse()) {
            const { error } = await deleteAllFromTable(tableName);
              
            if (error) {
              console.error(`Error clearing ${tableName}:`, error);
              throw new Error(`فشل في حذف بيانات ${tableName}: ${error.message}`);
            }
          }
          
          // Restore data to all tables in the correct order
          for (const tableName of TABLE_ORDER) {
            if (backupData[tableName] && backupData[tableName].length > 0) {
              const { error } = await supabase
                .from(tableName)
                .insert(backupData[tableName]);
                
              if (error) {
                console.error(`Error restoring ${tableName}:`, error);
                throw new Error(`فشل في استعادة بيانات ${tableName}: ${error.message}`);
              }
            }
          }
          
          toast({
            title: "تم استعادة النسخة الاحتياطية بنجاح",
            description: "تم استعادة جميع البيانات من النسخة الاحتياطية"
          });
          
          resolve(true);
        } catch (error: any) {
          console.error('Error restoring backup:', error);
          toast({
            title: "فشل استعادة النسخة الاحتياطية",
            description: error.message || "حدث خطأ أثناء استعادة النسخة الاحتياطية",
            variant: "destructive"
          });
          resolve(false);
        }
      };
      
      fileReader.onerror = () => {
        toast({
          title: "فشل قراءة ملف النسخة الاحتياطية",
          description: "تعذر قراءة ملف النسخة الاحتياطية. يرجى التحقق من صحة الملف",
          variant: "destructive"
        });
        resolve(false);
      };
      
      fileReader.readAsText(backupFile);
    });
  } catch (error: any) {
    console.error('Error reading backup file:', error);
    toast({
      title: "فشل قراءة ملف النسخة الاحتياطية",
      description: error.message || "حدث خطأ أثناء قراءة ملف النسخة الاحتياطية",
      variant: "destructive"
    });
    return false;
  }
}

/**
 * Helper function to delete all records from a table with appropriate method for the primary key type
 */
async function deleteAllFromTable(tableName: TableName) {
  if (isUuidTable(tableName)) {
    // للجداول التي تستخدم UUID، نستخدم استعلام مخصص بدلًا من قيمة dummy
    return await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // سيحذف جميع السجلات مع أي معرف UUID صالح
  } else {
    // للجداول الأخرى، استخدام استعلام ملائم للمفاتيح الرقمية
    return await supabase
      .from(tableName)
      .delete()
      .gte('id', 0); // هذا سيطابق جميع المعرفات الرقمية
  }
}

/**
 * Performs a factory reset by clearing all data from all tables
 */
export async function factoryReset(): Promise<boolean> {
  try {
    // Preserve settings
    const { data: settingsData } = await supabase
      .from('settings' as TableName)
      .select('*')
      .single();
    
    // Clear all tables in reverse order to avoid foreign key constraints
    for (const tableName of [...TABLE_ORDER].reverse()) {
      if (tableName !== 'settings') { // Skip settings table to preserve configurations
        const { error } = await deleteAllFromTable(tableName);
          
        if (error) {
          console.error(`Error clearing ${tableName}:`, error);
          throw new Error(`فشل في حذف بيانات ${tableName}: ${error.message}`);
        }
      }
    }
    
    toast({
      title: "تم إعادة ضبط النظام بنجاح",
      description: "تم حذف جميع البيانات ماعدا إعدادات النظام"
    });
    
    return true;
  } catch (error: any) {
    console.error('Error performing factory reset:', error);
    toast({
      title: "فشل إعادة ضبط النظام",
      description: error.message || "حدث خطأ أثناء إعادة ضبط النظام",
      variant: "destructive"
    });
    return false;
  }
}

// Add the actual ProductAnalytics component
interface ProductAnalyticsProps {
  products: Product[];
  invoices: Invoice[];
  isLoading: boolean;
}

export const ProductAnalytics: React.FC<ProductAnalyticsProps> = ({ products, invoices, isLoading }) => {
  const isMobile = useIsMobile();
  
  // حساب بعض الإحصائيات البسيطة عن المنتجات
  const totalProducts = products.length;
  
  // Fix: Use an isActive property if it exists, otherwise always consider it active
  // Since 'active' doesn't exist in the Product type, we'll modify this logic
  const activeProducts = products.filter(p => 'active' in p ? p.active : true).length;
  const inactiveProducts = totalProducts - activeProducts;
  
  // حساب الأكثر مبيعاً
  const productSales = products.map(product => {
    const productInvoiceItems = invoices
      .flatMap(invoice => invoice.items || [])
      .filter(item => item.productId === product.id);
    
    const totalQuantity = productInvoiceItems.reduce((total, item) => total + item.quantity, 0);
    const totalRevenue = productInvoiceItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    return {
      id: product.id,
      name: product.name,
      totalQuantity,
      totalRevenue,
    };
  });
  
  // ترتيب المنتجات حسب الكمية المباعة
  const topSellingProducts = [...productSales]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">تحليل المنتجات</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <span>جاري تحميل البيانات...</span>
        </div>
      ) : (
        <>
          {/* بطاقات إحصائية للمنتجات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">إجمالي المنتجات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalProducts}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">المنتجات النشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">{activeProducts}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">المنتجات غير النشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-500">{inactiveProducts}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* جدول أفضل المنتجات مبيعاً */}
          <Card>
            <CardHeader>
              <CardTitle>أكثر المنتجات مبيعاً</CardTitle>
            </CardHeader>
            <CardContent>
              {topSellingProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">المرتبة</TableHead>
                        <TableHead>اسم المنتج</TableHead>
                        <TableHead className="text-center">الكمية المباعة</TableHead>
                        <TableHead className="text-center">إجمالي المبيعات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSellingProducts.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-center">{product.totalQuantity}</TableCell>
                          <TableCell className="text-center">{product.totalRevenue.toFixed(2)} ر.س</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  لا توجد بيانات مبيعات للمنتجات
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

// إضافة export default للتوافق مع الاستيراد في ملفات أخرى
export default ProductAnalytics;
