
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

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
];

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
            const { error } = await supabase
              .from(tableName)
              .delete()
              .neq('id', 'dummy_value'); // Delete all rows
              
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
 * Performs a factory reset by clearing all data from all tables
 */
export async function factoryReset(): Promise<boolean> {
  try {
    // Preserve settings
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .single();
    
    // Clear all tables in reverse order to avoid foreign key constraints
    for (const tableName of [...TABLE_ORDER].reverse()) {
      if (tableName !== 'settings') { // Skip settings table to preserve configurations
        const { error } = await supabase
          .from(tableName)
          .delete()
          .neq('id', 'dummy_value'); // Delete all rows
          
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
