import client from './client'

export interface WeightEntry {
  id: string
  weight: number
  date: string
  loggedAt: string
}

export interface WeightPayload {
  weight: number
  date: string
}

const normalize = (raw: Record<string, unknown>): WeightEntry => ({
  id: String(raw.id ?? raw._id ?? ''),
  weight: Number(raw.weight ?? 0),
  date: String(raw.date ?? ''),
  loggedAt: String(raw.loggedAt ?? raw.createdAt ?? ''),
})

export const getWeight = async (startDate: string, endDate: string): Promise<WeightEntry[]> => {
  const { data } = await client.get<unknown[]>('/weight', { params: { startDate, endDate } })
  return (Array.isArray(data) ? data : []).map(d => normalize(d as Record<string, unknown>))
}

export const getLatestWeight = async (): Promise<WeightEntry | null> => {
  try {
    const { data } = await client.get<unknown>('/weight/latest')
    if (!data) return null
    return normalize(data as Record<string, unknown>)
  } catch {
    return null
  }
}

export interface WeightJourney {
  goalWeight: number
  startWeight: number
  currentWeight: number
  losing: boolean
  totalKg: number
  achievedKg: number
  bestKg: number
  remainingKg: number
  pct: number
  reached: boolean
}

export const getWeightJourney = async (): Promise<WeightJourney | null> => {
  try {
    const { data } = await client.get<WeightJourney | null>('/weight/journey')
    return data ?? null
  } catch {
    return null
  }
}

export const createWeight = async (payload: WeightPayload): Promise<WeightEntry> => {
  const { data } = await client.post<Record<string, unknown>>('/weight', payload)
  const raw = (data?.entry as Record<string, unknown>) ?? data
  return normalize(raw as Record<string, unknown>)
}

export const deleteWeight = async (id: string): Promise<void> => {
  await client.delete(`/weight/${id}`)
}
