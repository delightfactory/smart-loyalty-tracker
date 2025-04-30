import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to a readable string using date-fns
export function formatDate(dateString?: string | Date): string {
  if (!dateString) return 'غير محدد';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Use Intl to format dates in a locale-appropriate way
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

// Format a number to English with up to 2 decimal places (rounded)
export function formatNumberEn(value: number | string): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '-';
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
