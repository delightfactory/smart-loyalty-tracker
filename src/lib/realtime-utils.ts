
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * تمكين التحديثات الفورية لجداول قاعدة البيانات
 * @param tableName اسم الجدول المراد تمكين التحديثات الفورية له
 * @returns وعد يحتوي على نتيجة العملية
 */
export async function enableRealtimeForTable(tableName: string): Promise<boolean> {
  try {
    // تنفيذ استعلام SQL لإضافة الجدول إلى إعدادات التحديثات الفورية
    const { data, error } = await supabase.rpc('enable_realtime_for_table', { 
      table_name: tableName 
    });
    
    if (error) {
      console.error(`Error enabling realtime for table ${tableName}:`, error);
      return false;
    }
    
    console.log(`Realtime enabled for table ${tableName}:`, data);
    return true;
  } catch (error) {
    console.error(`Error enabling realtime for table ${tableName}:`, error);
    return false;
  }
}

/**
 * تمكين التحديثات الفورية لكل الجداول الرئيسية في التطبيق
 * @returns وعد يحتوي على نتيجة العملية
 */
export async function enableRealtimeForAllTables(): Promise<boolean> {
  const tables = [
    'customers',
    'invoices',
    'payments',
    'products',
    'profiles',
    'roles',
    'permissions',
    'user_roles',
    'role_permissions',
    'redemptions',
    'points_history'
  ];
  
  let success = true;
  
  for (const table of tables) {
    const result = await enableRealtimeForTable(table);
    if (!result) {
      success = false;
    }
  }
  
  if (success) {
    toast({
      title: "تم تمكين التحديثات الفورية",
      description: "تم تمكين التحديثات الفورية لجميع الجداول بنجاح"
    });
  } else {
    toast({
      variant: "destructive",
      title: "خطأ في تمكين التحديثات الفورية",
      description: "حدث خطأ أثناء تمكين التحديثات الفورية لبعض الجداول"
    });
  }
  
  return success;
}
