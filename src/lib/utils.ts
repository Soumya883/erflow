import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toZonedTime } from "date-fns-tz"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getIstTodayBounds() {
  const now = new Date();
  // Get the current time in IST
  const istTime = toZonedTime(now, 'Asia/Kolkata');
  
  // Set to midnight IST
  istTime.setHours(0, 0, 0, 0);
  
  // Return the JS Date object that represents 00:00 IST in absolute UTC time
  // Wait, toZonedTime returns a Date object where the local time matches the target timezone.
  // To get the absolute UTC bounds representing the start and end of the IST day:
  // Since Prisma expects absolute UTC Dates, we need to convert the 00:00 IST back to UTC.
  const istOffset = 5.5 * 60 * 60 * 1000;
  
  // A safer way: just calculate absolute milliseconds
  // Get current absolute UTC time
  const currentUtc = now.getTime();
  // Add IST offset to get "local IST time" as if it were UTC
  const localIstMillis = currentUtc + istOffset;
  const localIstDate = new Date(localIstMillis);
  
  // Truncate to midnight
  localIstDate.setUTCHours(0, 0, 0, 0);
  
  // Subtract offset to get back to absolute UTC representing 00:00 IST
  const startOfDayIstUtc = new Date(localIstDate.getTime() - istOffset);
  const endOfDayIstUtc = new Date(localIstDate.getTime() - istOffset + 24 * 60 * 60 * 1000);
  
  return { startOfToday: startOfDayIstUtc, endOfToday: endOfDayIstUtc };
}
