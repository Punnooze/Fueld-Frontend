import client from './client'

export interface HevySyncResult {
  synced: number
  xpEarned: number
  newPRs: string[]
}

export interface HealthToday {
  steps?: number | null
  restingHeartRate?: number | null
  weightKg?: number | null
  sleepHours?: number | null
  hrv?: number | null
  activeZoneMinutes?: number | null
  cardioMinutes?: number | null
}

export const syncHevy = async (): Promise<HevySyncResult> => {
  const { data } = await client.post<HevySyncResult>('/hevy/sync')
  return data
}

export const syncHealth = async (): Promise<void> => {
  await client.get('/health/sync')
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
