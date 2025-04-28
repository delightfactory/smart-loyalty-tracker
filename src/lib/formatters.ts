// دالة لتحويل الأرقام العربية إلى الإنجليزية (123)
export function toEnglishDigits(input: string | number): string {
  return String(input).replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) =>
    String('٠١٢٣٤٥٦٧٨٩'.indexOf(d) !== -1 ? '٠١٢٣٤٥٦٧٨٩'.indexOf(d) : '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  );
}

// دالة لتنسيق المبالغ المالية بالأرقام الإنجليزية
export function formatAmountEn(amount: number, options?: { currency?: boolean }): string {
  if (options && options.currency === false) {
    // فقط أرقام إنجليزية بدون أي رمز عملة
    return toEnglishDigits(Number(amount).toLocaleString('en-US'));
  }
  // الافتراضي: عملة الجنيه المصري
  return toEnglishDigits(Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'EGP' }));
}

// دالة لتنسيق التواريخ بالأرقام الإنجليزية وتنسيق ثابت (DD/MM/YYYY)
export function formatDateEn(date: Date | string | number): string {
  if (!date) return '';
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'number') {
    d = new Date(date);
  } else {
    const parsed = Date.parse(date);
    if (!isNaN(parsed)) {
      d = new Date(parsed);
    } else {
      return '\u200E' + toEnglishDigits(date); // fallback
    }
  }
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  // أضف LTR mark قبل التاريخ
  return `\u200E${dd}/${mm}/${yyyy}`;
}

// دالة عامة لتحويل أي قيمة رقمية أو نصية إلى أرقام إنجليزية
export function formatNumberEn(num: number | string): string {
  return toEnglishDigits(num);
}
