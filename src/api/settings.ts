import client from './client'

export interface Settings {
  targetCalories: number
  maintenanceCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  height: number
  characterName?: string
  hevyApiKey?: string
  googleHealthConnected: boolean
  fitbitConnected: boolean
  stepTarget: number
  sleepTarget: number
  goalWeight?: number
}

const normalize = (raw: Record<string, unknown>): Settings => ({
  targetCalories: Number(raw.targetCalories ?? 1700),
  maintenanceCalories: Number(raw.maintenanceCalories ?? 2600),
  targetProtein: Number(raw.targetProtein ?? 140),
  targetCarbs: Number(raw.targetCarbs ?? 180),
  targetFat: Number(raw.targetFat ?? 60),
  height: Number(raw.height ?? 175),
  characterName: raw.characterName ? String(raw.characterName) : undefined,
  hevyApiKey: raw.hevyApiKey ? String(raw.hevyApiKey) : undefined,
  googleHealthConnected: Boolean(raw.googleHealthConnected),
  fitbitConnected: Boolean(raw.fitbitConnected),
  stepTarget: Number(raw.stepTarget ?? 10000),
  sleepTarget: Number(raw.sleepTarget ?? 8),
  goalWeight: raw.goalWeight != null ? Number(raw.goalWeight) : undefined,
})

export const getSettings = async (): Promise<Settings> => {
  const { data } = await client.get<unknown>('/settings')
  return normalize(data as Record<string, unknown>)
}

export const patchSettings = async (payload: Partial<Settings>): Promise<Settings> => {
  const { data } = await client.patch<unknown>('/settings', payload)
  return normalize(data as Record<string, unknown>)
}
