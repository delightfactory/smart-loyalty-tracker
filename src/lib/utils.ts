import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// تنسيق التاريخ لواجهة المستخدم (DD/MM/YYYY)
export function formatDate(dateString?: string | Date): string {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  // Format date as DD/MM/YYYY with English locale
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// Format a number to English with up to 2 decimal places (rounded)
export function formatNumberEn(value: number | string): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Format a number to Arabic with up to 2 decimal places (rounded)
export function formatNumberAr(value: number | string): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Format date and time to a readable string
export function formatDateTime(dateString?: string | Date): string {
  if (!dateString) return 'غير محدد';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

// تنسيق التاريخ بصيغة إنجليزية YYYY-MM-DD
export function formatDateEn(dateString?: string | Date): string {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toISOString().split('T')[0];
}
