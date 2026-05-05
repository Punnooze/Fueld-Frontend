import client from './client'

export interface Settings {
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  height: number
}

const normalize = (raw: Record<string, unknown>): Settings => ({
  targetCalories: Number(raw.targetCalories ?? 1700),
  targetProtein: Number(raw.targetProtein ?? 140),
  targetCarbs: Number(raw.targetCarbs ?? 180),
  targetFat: Number(raw.targetFat ?? 60),
  height: Number(raw.height ?? 175),
})

export const getSettings = async (): Promise<Settings> => {
  const { data } = await client.get<unknown>('/settings')
  return normalize(data as Record<string, unknown>)
}

export const patchSettings = async (payload: Partial<Settings>): Promise<Settings> => {
  const { data } = await client.patch<unknown>('/settings', payload)
  return normalize(data as Record<string, unknown>)
}
