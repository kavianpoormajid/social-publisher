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
export const toApiDateTime = (value: string) => {
  const date = new Date(value);

  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = pad(Math.abs(offset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
};
