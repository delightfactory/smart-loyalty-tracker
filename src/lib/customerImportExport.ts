import type { Customer } from './types';
import * as XLSX from 'xlsx';

// تصدير العملاء إلى CSV (احتياطي)
export function customersToCSV(customers: Customer[], lang: 'ar' | 'en' = 'ar'): string {
  const headers = lang === 'ar'
    ? [
      'كود العميل', 'الاسم', 'مسؤول التواصل', 'رقم الهاتف', 'نوع النشاط', 'النقاط المكتسبة', 'النقاط المستبدلة', 'النقاط الحالية', 'الرصيد', 'التصنيف', 'المستوى', 'المحافظة', 'المدينة', 'تاريخ الإنشاء'
    ]
    : [
      'id', 'name', 'contactPerson', 'phone', 'businessType', 'pointsEarned', 'pointsRedeemed', 'currentPoints', 'creditBalance', 'classification', 'level', 'governorate', 'city', 'created_at'
    ];
  const rows = customers.map(c => [
    c.id,
    c.name,
    c.contactPerson,
    `\u200E${c.phone}`,
    c.businessType,
    c.pointsEarned,
    c.pointsRedeemed,
    c.currentPoints,
    c.creditBalance,
    c.classification,
    c.level,
    c.governorate,
    c.city,
    c.created_at ?? ''
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(','))].join('\n');
  return csv;
}

// استيراد العملاء من CSV (احتياطي)
export function csvToCustomers(csv: string): Customer[] {
  // دعم رؤوس الأعمدة العربية والإنجليزية
  const arabicKeys = {
    'كود العميل': 'id',
    'الاسم': 'name',
    'مسؤول التواصل': 'contactPerson',
    'رقم الهاتف': 'phone',
    'نوع النشاط': 'businessType',
    'النقاط المكتسبة': 'pointsEarned',
    'النقاط المستبدلة': 'pointsRedeemed',
    'النقاط الحالية': 'currentPoints',
    'الرصيد': 'creditBalance',
    'التصنيف': 'classification',
    'المستوى': 'level',
    'المحافظة': 'governorate',
    'المدينة': 'city',
    'تاريخ الإنشاء': 'created_at'
  };
  const [headerLine, ...lines] = csv.split(/\r?\n/).filter(Boolean);
  let headers = headerLine.split(',').map(h => h.replace(/"/g, '').trim());
  // إذا كانت الأعمدة عربية، حوّلها للإنجليزية
  if (arabicKeys[headers[0]]) {
    headers = headers.map(h => arabicKeys[h] || h);
  }
  return lines.map(line => {
    const values = line.match(/(?:"[^"]*"|[^,])+/g)?.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"')) ?? [];
    const obj: any = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    // إزالة اتجاه النص من الهاتف
    if (obj.phone) obj.phone = obj.phone.replace(/^\u200E/, '');
    // تحويل القيم الرقمية
    obj.pointsEarned = Number(obj.pointsEarned) || 0;
    obj.pointsRedeemed = Number(obj.pointsRedeemed) || 0;
    obj.currentPoints = Number(obj.currentPoints) || 0;
    obj.creditBalance = Number(obj.creditBalance) || 0;
    obj.classification = Number(obj.classification) || 0;
    obj.level = Number(obj.level) || 0;
    return obj as Customer;
  });
}

// تصدير العملاء إلى ملف Excel (رؤوس أعمدة مطابقة لقاعدة البيانات)
export function customersToExcel(customers: Customer[]): Blob {
  const headers = [
    'id', 'name', 'contactPerson', 'phone', 'businessType', 'pointsEarned', 'pointsRedeemed', 'currentPoints', 'creditBalance', 'classification', 'level', 'governorate', 'city', 'created_at'
  ];
  const rows = customers.map(c => [
    c.id,
    c.name,
    c.contactPerson,
    c.phone,
    c.businessType,
    c.pointsEarned,
    c.pointsRedeemed,
    c.currentPoints,
    c.creditBalance,
    c.classification,
    c.level,
    c.governorate,
    c.city,
    c.created_at ?? ''
  ]);
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'customers');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// استيراد العملاء من ملف Excel
export async function excelToCustomers(file: File): Promise<Customer[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const worksheet = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName], { defval: '' });
  return worksheet.map(row => {
    // الأعمدة يجب أن تكون بالإنجليزية ومطابقة لقاعدة البيانات
    const obj: any = {};
    [
      'id', 'name', 'contactPerson', 'phone', 'businessType', 'pointsEarned', 'pointsRedeemed', 'currentPoints', 'creditBalance', 'classification', 'level', 'governorate', 'city', 'created_at'
    ].forEach(key => { obj[key] = row[key] ?? ''; });
    obj.pointsEarned = Number(obj.pointsEarned) || 0;
    obj.pointsRedeemed = Number(obj.pointsRedeemed) || 0;
    obj.currentPoints = Number(obj.currentPoints) || 0;
    obj.creditBalance = Number(obj.creditBalance) || 0;
    obj.classification = Number(obj.classification) || 0;
    obj.level = Number(obj.level) || 0;
    return obj as Customer;
  });
}
