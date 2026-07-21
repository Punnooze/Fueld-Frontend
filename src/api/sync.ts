import client from './client'

export interface HevySyncResult {
  synced: number
  xpEarned: number
  newPRs: string[]
}

export interface CardioSession {
  type: string          // WALKING | SPORT | BIKING | RUNNING …
  name: string          // display name e.g. "Walk"
  durationMin?: number | null
  calories?: number | null
  distanceKm?: number | null
  avgHr?: number | null
  activeZoneMinutes?: number | null
  startTime?: string
}

export interface HealthToday {
  steps?: number | null
  restingHeartRate?: number | null
  weightKg?: number | null
  sleepHours?: number | null
  hrv?: number | null
  activeZoneMinutes?: number | null
  cardioMinutes?: number | null
  cardioSessions?: CardioSession[]
  caloriesBurned?: number | null
}

export const syncHevy = async (): Promise<HevySyncResult> => {
  const { data } = await client.post<HevySyncResult>('/hevy/sync')
  return data
}

export const syncHealth = async (): Promise<void> => {
  await client.get('/health/sync')
}

// distinct dates (YYYY-MM-DD) that earned a cardio XP event — used to mark the calendar
export const getCardioDates = async (): Promise<string[]> => {
  const { data } = await client.get<string[]>('/xp/dates', { params: { type: 'cardio' } })
  return data ?? []
}

export const getStepsDates = async (): Promise<string[]> => {
  const { data } = await client.get<string[]>('/xp/dates', { params: { type: 'steps_bonus' } })
  return data ?? []
}

// Exercise calories burned per day for a range → { 'YYYY-MM-DD': kcal }
export const getBurnedWeek = async (start: string, end: string): Promise<Record<string, number>> => {
  try {
    const { data } = await client.get<Record<string, number>>('/health/burned', { params: { start, end } })
    return data ?? {}
  } catch {
    return {}
  }
}

export const getHealthToday = async (dateOverride?: string): Promise<HealthToday | null> => {
  try {
    // send local civil date so steps match the device's day (tz-safe)
    const d = new Date()
    const date = dateOverride ?? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const { data } = await client.get<HealthToday>('/health/today', { params: { date } })
    return data ?? null
  } catch {
    return null
  }
}
