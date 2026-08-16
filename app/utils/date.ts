import { format } from "date-fns-jalali";

export function formatJalaliDate(value: string | Date): string {
  return format(new Date(value), "yyyy/MM/dd");
}

export function formatJalaliDateTime(value: string | Date): string {
  return format(new Date(value), "yyyy/MM/dd HH:mm");
}

export function formatJalaliTime(value: string | Date): string {
  return format(new Date(value), "HH:mm");
}
