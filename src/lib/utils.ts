
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to a readable string using date-fns
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "---";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMM yyyy", { locale: ar });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "---";
  }
}
