import { createClient } from '@supabase/supabase-js';
import { parseISO, formatISO, differenceInDays } from 'date-fns';

// إنشاء عميل Supabase بصلاحيات السيرفر
const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// ترتيب الجداول للنسخ
const TABLE_ORDER = [
  'settings',
  'customers',
  'products',
  'invoices',
  'invoice_items',
  'payments',
  'redemptions',
  'redemption_items',
  'points_history'
];

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    // جلب إعدادات النسخ التلقائي
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('settings')
      .select('settings_json')
      .single();
    if (settingsError) throw settingsError;

    const backupSettings = settingsData?.settings_json?.backup;
    if (!backupSettings?.enableAutoBackup) {
      return res.status(200).json({ message: 'Auto backup disabled' });
    }

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const dayOfMonth = now.getDate();

    // تحقق من التردد
    if (
      (backupSettings.backupFrequency === 'weekly' && dayOfWeek !== 0) ||
      (backupSettings.backupFrequency === 'monthly' && dayOfMonth !== 1)
    ) {
      return res.status(200).json({ message: 'Not scheduled per current backupFrequency' });
    }

    // تجميع البيانات
    const backupData: Record<string, any> = {};
    for (const table of TABLE_ORDER) {
      const { data, error } = await supabaseAdmin.from(table).select('*');
      if (error) throw error;
      backupData[table] = data;
    }
    backupData.__timestamp = now.toISOString();
    backupData.__version = '1.0.0';

    // رفع النسخة إلى Supabase Storage
    const bucket = 'backups';
    const dateFolder = formatISO(now, { representation: 'date' });
    const fileName = `${now.getTime()}.json`;
    const filePath = `${dateFolder}/${fileName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, Buffer.from(JSON.stringify(backupData, null, 2)), {
        contentType: 'application/json',
        upsert: false,
      });
    if (uploadError) throw uploadError;

    // تنظيف النسخ القديمة
    if (backupSettings.backupRetention > 0) {
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from(bucket)
        .list('', { limit: 1000 });
      if (listError) throw listError;
      for (const file of files) {
        const fileDate = parseISO(file.name.split('/')[0]);
        if (differenceInDays(now, fileDate) > backupSettings.backupRetention) {
          await supabaseAdmin.storage.from(bucket).remove([file.name]);
        }
      }
    }

    res.status(200).json({ message: 'Backup created', path: filePath });
  } catch (error: any) {
    console.error('Backup error:', error);
    res.status(500).json({ error: error.message });
  }
}
