
export interface GeneralSettings {
  language: 'ar' | 'en';
  timezone: string;
  currency: string;
  dateFormat: string;
  sendEmailNotifications: boolean;
  collectAnalytics: boolean;
}

export interface CompanySettings {
  name: string;
  taxNumber: string;
  phone: string;
  email: string;
  address: string;
  logoUrl?: string;
}

export interface InvoiceSettings {
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultPaymentTerms: number;
  taxRate: number;
  showTax: boolean;
  showPoints: boolean;
  defaultNotes: string;
  footer: string;
}

export interface PaymentSettings {
  enabledMethods: {
    cash: boolean;
    credit: boolean;
    bankTransfer: boolean;
    card: boolean;
  };
  defaultMethod: 'cash' | 'credit' | 'bank_transfer' | 'card';
  paymentPrefix: string;
  allowPartialPayments: boolean;
  enableOverdueNotifications: boolean;
  overdueReminders: {
    firstReminder: number;
    secondReminder: number;
  };
}

export interface LoyaltySettings {
  enableLoyaltyProgram: boolean;
  pointsPerCurrency: number;
  pointsExpiry: number;
  minPointsRedemption: number;
  pointsValue: number;
  levels: LoyaltyLevel[];
}

export interface LoyaltyLevel {
  id: number;
  name: string;
  minPoints: number;
  maxPoints: number | null;
}

export interface BackupSettings {
  enableAutoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetention: number;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: boolean;
  sessionTimeoutMinutes: number;
}

export interface AppSettings {
  general: GeneralSettings;
  company: CompanySettings;
  invoice: InvoiceSettings;
  payment: PaymentSettings;
  loyalty: LoyaltySettings;
  backup: BackupSettings;
  security: SecuritySettings;
}
