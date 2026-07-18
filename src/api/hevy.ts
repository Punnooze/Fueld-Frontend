import client from './client'

export interface ExerciseStat {
  title: string
  sessions: number
  sets: number
  currentWeight: number
  maxWeight: number
  lastDate: string
  trend: number[]
}

export interface HevyStats {
  days: number
  totalSessions: number
  totalVolume: number // kg
  totalSets: number
  heaviest: { title: string; weight: number }
  mostFrequent: { title: string; count: number } | null
  exercises: ExerciseStat[]
}

export const getHevyStats = async (days = 90): Promise<HevyStats> => {
  const { data } = await client.get<HevyStats>('/hevy/stats', { params: { days } })
  return data
}
