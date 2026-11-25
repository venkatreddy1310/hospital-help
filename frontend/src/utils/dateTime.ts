const shortDateFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const longDateFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const weekdayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short' })
const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'short' })

export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getTodayISO(): string {
  return toISODate(new Date())
}

export function addDaysISO(isoDate: string, days: number): string {
  const date = parseISODate(isoDate)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export function differenceInCalendarDays(fromISO: string, toISO: string): number {
  const [fromYear, fromMonth, fromDay] = fromISO.split('-').map(Number)
  const [toYear, toMonth, toDay] = toISO.split('-').map(Number)
  const from = Date.UTC(fromYear, fromMonth - 1, fromDay)
  const to = Date.UTC(toYear, toMonth - 1, toDay)
  return Math.round((to - from) / 86_400_000)
}

export function formatRelativeDate(
  isoDate: string,
  referenceISO = getTodayISO(),
): string {
  const difference = differenceInCalendarDays(referenceISO, isoDate)

  if (difference === 0) return 'Today'
  if (difference === 1) return 'Tomorrow'
  return shortDateFormatter.format(parseISODate(isoDate))
}

export function formatShortDate(isoDate: string): string {
  return shortDateFormatter.format(parseISODate(isoDate))
}

export function formatRelativeTimestamp(
  isoTimestamp: string,
  now = new Date(),
): string {
  const time = new Date(isoTimestamp).getTime()
  if (Number.isNaN(time)) return 'Unknown time'

  const minutes = Math.max(0, Math.round((now.getTime() - time) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`

  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

  return formatShortDate(toISODate(new Date(time)))
}

export function formatLongDate(isoDate: string): string {
  return longDateFormatter.format(parseISODate(isoDate))
}

export function formatTimeSlot(time: string): string {
  const [hourValue, minuteValue] = time.split(':').map(Number)
  const period = hourValue < 12 ? 'AM' : 'PM'
  const hour = hourValue % 12 || 12
  return `${hour}:${String(minuteValue).padStart(2, '0')} ${period}`
}

export function getCalendarParts(isoDate: string): {
  weekday: string
  day: string
  month: string
} {
  const date = parseISODate(isoDate)

  return {
    weekday: weekdayFormatter.format(date),
    day: String(date.getDate()),
    month: monthFormatter.format(date),
  }
}
