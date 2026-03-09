import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'

export const NY_TIMEZONE = 'America/New_York'

// Get current datetime in New York time as an ISO string
export function nowInNY(): string {
  return new Date().toISOString()
}

// Format a UTC ISO string for display in NY time
export function formatNY(isoString: string, fmt = 'MMM d, yyyy h:mm a'): string {
  return formatInTimeZone(new Date(isoString), NY_TIMEZONE, fmt)
}

// Format just a date string (YYYY-MM-DD) for display
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return format(date, 'MMM d, yyyy')
}

// Format a time string (HH:MM:SS) for display
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)
  return format(date, 'h:mm a')
}

// Get current NY time formatted for checkout_at display
export function checkoutNowFormatted(): string {
  return formatInTimeZone(new Date(), NY_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssxxx")
}

// Convert a date + time to a display string
export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${formatDate(dateStr)} at ${formatTime(timeStr)}`
}
