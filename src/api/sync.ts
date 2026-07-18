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
}

export const syncHevy = async (): Promise<HevySyncResult> => {
  const { data } = await client.post<HevySyncResult>('/hevy/sync')
  return data
}

export const syncHealth = async (): Promise<void> => {
  await client.get('/health/sync')
}

export const getHealthToday = async (): Promise<HealthToday | null> => {
  try {
    const { data } = await client.get<HealthToday>('/health/today')
    return data ?? null
  } catch {
    return null
  }
}
