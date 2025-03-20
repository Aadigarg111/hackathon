import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to format date as YYYY-MM-DD for input[type="date"]
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}
