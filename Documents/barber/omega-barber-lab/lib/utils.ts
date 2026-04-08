import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, addMinutes } from 'date-fns'
import { el } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  // Deterministic Greek-style format: avoids Intl.NumberFormat ICU differences
  // between Node.js server and browser (space character before € varies by runtime).
  const abs = Math.abs(amount).toFixed(2)
  const [int, dec] = abs.split('.')
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${amount < 0 ? '-' : ''}${intFormatted},${dec} €`
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMMM yyyy', { locale: el })
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${formatDate(dateStr)} στις ${formatTime(timeStr)}`
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(h, m, 0, 0)
  const result = addMinutes(date, minutes)
  return `${String(result.getHours()).padStart(2, '0')}:${String(result.getMinutes()).padStart(2, '0')}`
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function dayOfWeekName(day: number): string {
  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']
  return days[day]
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Εκκρεμεί',
    confirmed: 'Επιβεβαιωμένο',
    cancelled: 'Ακυρωμένο',
    completed: 'Ολοκληρωμένο',
    no_show: 'Δεν εμφανίστηκε',
  }
  return labels[status] ?? status
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'amber',
    confirmed: 'green',
    cancelled: 'red',
    completed: 'blue',
    no_show: 'gray',
  }
  return colors[status] ?? 'gray'
}
