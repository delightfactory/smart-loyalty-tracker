
import { supabase } from '@/integrations/supabase/client';
import {
  AppSettings,
  GeneralSettings,
  CompanySettings,
  InvoiceSettings,
  PaymentSettings,
  LoyaltySettings,
  BackupSettings,
  SecuritySettings
} from '@/lib/settings-types';

// الإعدادات الافتراضية
const defaultSettings: AppSettings = {
  general: {
    language: 'ar',
    timezone: 'Cairo',
    currency: 'egp',
    dateFormat: 'dd_mm_yyyy',
    sendEmailNotifications: true,
    collectAnalytics: true
  },
  company: {
    name: 'شركة العناية بالسيارات',
    taxNumber: '123456789',
    phone: '01234567890',
    email: 'info@autocare.com',
    address: 'شارع النصر، مدينة نصر، القاهرة',
    logoUrl: undefined
  },
  invoice: {
    invoicePrefix: 'INV',
    nextInvoiceNumber: 1001,
    defaultPaymentTerms: 30,
    taxRate: 14,
    showTax: true,
    showPoints: true,
    defaultNotes: 'شكراً لثقتكم في منتجاتنا. يرجى الاحتفاظ بالفاتورة للرجوع إليها عند الحاجة.',
    footer: 'جميع الحقوق محفوظة - شركة العناية بالسيارات © 2023'
  },
  payment: {
    enabledMethods: {
      cash: true,
      credit: true,
      bankTransfer: true,
      card: true
    },
    defaultMethod: 'cash',
    paymentPrefix: 'PAY',
    allowPartialPayments: true,
    enableOverdueNotifications: true,
    overdueReminders: {
      firstReminder: 3,
      secondReminder: 7
    }
  },
  loyalty: {
    enableLoyaltyProgram: true,
    pointsPerCurrency: 0.5,
    pointsExpiry: 365,
    minPointsRedemption: 100,
    pointsValue: 0.25,
    levels: [
      { id: 1, name: 'برونزي', minPoints: 0, maxPoints: 500 },
      { id: 2, name: 'فضي', minPoints: 501, maxPoints: 1000 },
      { id: 3, name: 'ذهبي', minPoints: 1001, maxPoints: 2000 },
      { id: 4, name: 'بلاتيني', minPoints: 2001, maxPoints: null }
    ]
  },
  backup: {
    enableAutoBackup: true,
    backupFrequency: 'weekly',
    backupRetention: 30
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: true,
    sessionTimeoutMinutes: 30
  }
};

// واجهة للتعامل مع جدول الإعدادات
interface SettingsRecord {
  id: number;
  settings_json: string;
  created_at: string;
  updated_at: string;
}

export const settingsService = {
  /**
   * جلب جميع الإعدادات
   */
  async getAllSettings(): Promise<AppSettings> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();
        
      if (error) {
        console.error('Error fetching settings:', error);
        return defaultSettings;
      }
      
      // في حالة وجود بيانات، دمجها مع الإعدادات الافتراضية
      if (data && data.settings_json) {
        const settingsData = typeof data.settings_json === 'string' 
          ? JSON.parse(data.settings_json) 
          : data.settings_json;
        
        return { ...defaultSettings, ...settingsData };
      }
      
      return defaultSettings;
    } catch (err) {
      console.error('Unexpected error fetching settings:', err);
      return defaultSettings;
    }
  },
  
  /**
   * جلب إعدادات محددة بالنوع
   */
  async getSettingsByType<T extends keyof AppSettings>(type: T): Promise<AppSettings[T]> {
    const allSettings = await this.getAllSettings();
    return allSettings[type];
  },
  
  /**
   * حفظ الإعدادات العامة
   */
  async saveGeneralSettings(settings: GeneralSettings): Promise<void> {
    await this.updateSettings('general', settings);
  },
  
  /**
   * حفظ إعدادات الشركة
   */
  async saveCompanySettings(settings: CompanySettings): Promise<void> {
    await this.updateSettings('company', settings);
  },
  
  /**
   * حفظ إعدادات الفواتير
   */
  async saveInvoiceSettings(settings: InvoiceSettings): Promise<void> {
    await this.updateSettings('invoice', settings);
  },
  
  /**
   * حفظ إعدادات المدفوعات
   */
  async savePaymentSettings(settings: PaymentSettings): Promise<void> {
    await this.updateSettings('payment', settings);
  },
  
  /**
   * حفظ إعدادات برنامج الولاء
   */
  async saveLoyaltySettings(settings: LoyaltySettings): Promise<void> {
    await this.updateSettings('loyalty', settings);
  },
  
  /**
   * حفظ إعدادات النسخ الاحتياطي
   */
  async saveBackupSettings(settings: BackupSettings): Promise<void> {
    await this.updateSettings('backup', settings);
  },
  
  /**
   * حفظ إعدادات الأمان
   */
  async saveSecuritySettings(settings: SecuritySettings): Promise<void> {
    await this.updateSettings('security', settings);
  },
  
  /**
   * تحديث جزء محدد من الإعدادات
   */
  async updateSettings<T extends keyof AppSettings>(
    type: T,
    settings: AppSettings[T]
  ): Promise<void> {
    try {
      // جلب الإعدادات الحالية
      const currentSettings = await this.getAllSettings();
      
      // تحديث الجزء المحدد
      currentSettings[type] = settings;
      
      // حفظ الإعدادات المحدثة
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1, // استخدام معرف ثابت للإعدادات العامة
          settings_json: currentSettings,
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (error) {
        console.error(`Error updating ${type} settings:`, error);
        throw error;
      }
    } catch (err) {
      console.error(`Unexpected error updating ${type} settings:`, err);
      throw err;
    }
  }
};
