import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toZonedTime } from "date-fns-tz"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getIstTodayBounds() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  
  const currentUtc = now.getTime();
  const localIstMillis = currentUtc + istOffset;
  const localIstDate = new Date(localIstMillis);
  
  localIstDate.setUTCHours(0, 0, 0, 0);
  
  const startOfDayIstUtc = new Date(localIstDate.getTime() - istOffset);
  const endOfDayIstUtc = new Date(localIstDate.getTime() - istOffset + 24 * 60 * 60 * 1000);
  
  return { startOfToday: startOfDayIstUtc, endOfToday: endOfDayIstUtc };
}

export function getIstTodayDate() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const localIstMillis = now.getTime() + istOffset;
  const localIstDate = new Date(localIstMillis);
  
  return new Date(Date.UTC(
    localIstDate.getUTCFullYear(),
    localIstDate.getUTCMonth(),
    localIstDate.getUTCDate()
  ));
}
