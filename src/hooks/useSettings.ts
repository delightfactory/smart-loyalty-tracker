
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings';
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
import { useToast } from '@/hooks/use-toast';

export const useSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // جلب جميع الإعدادات
  const { data: allSettings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getAllSettings(),
    staleTime: 1000 * 60 * 10, // 10 دقائق
  });
  
  // جلب إعدادات محددة
  const getSettingsByType = <T extends keyof AppSettings>(type: T): AppSettings[T] => {
    if (!allSettings) return {} as AppSettings[T];
    return allSettings[type];
  };
  
  // تحديث الإعدادات العامة
  const updateGeneralSettings = useMutation({
    mutationFn: (settings: GeneralSettings) => settingsService.saveGeneralSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث الإعدادات العامة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء تحديث الإعدادات العامة",
        variant: "destructive",
      });
      console.error("Error updating general settings:", error);
    }
  });
  
  // تحديث إعدادات الشركة
  const updateCompanySettings = useMutation({
    mutationFn: (settings: CompanySettings) => settingsService.saveCompanySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث بيانات الشركة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء تحديث بيانات الشركة",
        variant: "destructive",
      });
      console.error("Error updating company settings:", error);
    }
  });
  
  // تحديث إعدادات الفواتير
  const updateInvoiceSettings = useMutation({
    mutationFn: (settings: InvoiceSettings) => settingsService.saveInvoiceSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات الفواتير بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء تحديث إعدادات الفواتير",
        variant: "destructive",
      });
      console.error("Error updating invoice settings:", error);
    }
  });
  
  // تحديث إعدادات المدفوعات
  const updatePaymentSettings = useMutation({
    mutationFn: (settings: PaymentSettings) => settingsService.savePaymentSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات المدفوعات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء تحديث إعدادات المدفوعات",
        variant: "destructive",
      });
      console.error("Error updating payment settings:", error);
    }
  });
  
  // تحديث إعدادات برنامج الولاء
  const updateLoyaltySettings = useMutation({
    mutationFn: (settings: LoyaltySettings) => settingsService.saveLoyaltySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات برنامج الولاء بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء تحديث إعدادات برنامج الولاء",
        variant: "destructive",
      });
      console.error("Error updating loyalty settings:", error);
    }
  });
  
  // تحديث إعدادات النسخ الاحتياطي
  const updateBackupSettings = useMutation({
    mutationFn: (settings: BackupSettings) => settingsService.saveBackupSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات النسخ الاحتياطي بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء تحديث إعدادات النسخ الاحتياطي",
        variant: "destructive",
      });
      console.error("Error updating backup settings:", error);
    }
  });
  
  // تحديث إعدادات الأمان
  const updateSecuritySettings = useMutation({
    mutationFn: (settings: SecuritySettings) => settingsService.saveSecuritySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات الأمان بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء تحديث إعدادات الأمان",
        variant: "destructive",
      });
      console.error("Error updating security settings:", error);
    }
  });
  
  return {
    // بيانات الإعدادات
    allSettings,
    isLoading,
    error,
    getSettingsByType,
    
    // إعدادات محددة
    generalSettings: allSettings?.general,
    companySettings: allSettings?.company,
    invoiceSettings: allSettings?.invoice,
    paymentSettings: allSettings?.payment,
    loyaltySettings: allSettings?.loyalty,
    backupSettings: allSettings?.backup,
    securitySettings: allSettings?.security,
    
    // وظائف التحديث
    updateGeneralSettings,
    updateCompanySettings,
    updateInvoiceSettings,
    updatePaymentSettings,
    updateLoyaltySettings,
    updateBackupSettings,
    updateSecuritySettings
  };
};
