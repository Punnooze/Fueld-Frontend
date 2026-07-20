export const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const today = (): string => formatDate(new Date())

export const getWeekDates = (referenceDate?: Date): Date[] => {
  const ref = referenceDate ? new Date(referenceDate) : new Date()
  // Monday = 1, Sunday = 0 → shift so week starts on Monday
  const day = ref.getDay()
  const monday = new Date(ref)
  monday.setDate(ref.getDate() - ((day === 0 ? 7 : day) - 1))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export const getWeekStart = (): string => {
  const dates = getWeekDates()
  return formatDate(dates[0])
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const getDayLabel = (date: Date): string => {
  const day = date.getDay()
  return DAY_LABELS[(day === 0 ? 6 : day - 1)]
}

export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** Sleep hours → "7h 18m" (no rounding to whole hours). */
export const fmtSleepHM = (hours?: number | null): string => {
  if (hours == null) return '—'
  const total = Math.round(hours * 60)
  const h = Math.floor(total / 60)
  const m = total % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
