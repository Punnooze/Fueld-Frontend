import client from './client'
import type { HealthToday } from './sync'

export const getFitbitToday = async (): Promise<HealthToday | null> => {
  try {
    const { data } = await client.get<HealthToday>('/fitbit/today')
    return data ?? null
  } catch {
    return null
  }
}
