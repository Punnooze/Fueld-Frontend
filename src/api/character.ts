import client from './client'

export interface Character {
  name: string
  level: number
  title: string
  rank: string
  rankTier: number
  class: string
  streak: number
  longestStreak: number
  decaying: boolean
  daysSinceActive: number | null
  xp: {
    total: number
    currentLevelFloor: number
    nextLevelAt: number
    intoLevel: number
    neededForNext: number
  }
  stats: {
    totalWorkouts: number
    workoutsThisMonth: number
    nutritionDaysThisMonth: number
  }
}

export const getCharacter = async (): Promise<Character> => {
  const { data } = await client.get<Character>('/character')
  return data
}

export interface Records {
  heaviestLift: { title: string; weight: number; date: string } | null
  biggestSession: { type: string; volume: number; date: string } | null
  bestProteinDay: { grams: number; date: string } | null
  bestCardio: { azm: number; date: string } | null
  longestStreak: number
  bestWeek: number
  totalSessions: number
  totalVolume: number
}

export const getRecords = async (): Promise<Records> => {
  const { data } = await client.get<Records>('/character/records')
  return data
}
