import client from './client'
import { normalizeQuest, type Quest } from './quests'

export interface Workout {
  id: string
  type: string
  duration?: number
  intensity: string
  note?: string
  date: string
  xpEarned: number
  totalVolume: number
  exercises: string[]
  prs: string[]
}

export interface CreateWorkoutPayload {
  type: string
  duration?: number
  intensity?: string
  note?: string
  date: string
}

export interface CreateWorkoutResult {
  workout: Workout
  xpEarned: number
  completedQuests: Quest[]
}

const normalize = (raw: Record<string, unknown>): Workout => ({
  id: String(raw.id ?? raw._id ?? ''),
  type: String(raw.type ?? ''),
  duration: raw.duration != null ? Number(raw.duration) : undefined,
  intensity: String(raw.intensity ?? 'Medium'),
  note: raw.note ? String(raw.note) : undefined,
  date: String(raw.date ?? '').slice(0, 10),
  xpEarned: Number(raw.xpEarned ?? 0),
  totalVolume: Number(raw.totalVolume ?? 0),
  exercises: Array.isArray(raw.exercises) ? (raw.exercises as string[]) : [],
  prs: Array.isArray(raw.prs) ? (raw.prs as string[]) : [],
})

export const getRecentWorkouts = async (limit = 10): Promise<Workout[]> => {
  const { data } = await client.get<unknown[]>('/workouts/recent', { params: { limit } })
  return (Array.isArray(data) ? data : []).map(w => normalize(w as Record<string, unknown>))
}

export const createWorkout = async (
  payload: CreateWorkoutPayload,
): Promise<CreateWorkoutResult> => {
  const { data } = await client.post<Record<string, unknown>>('/workouts', payload)
  return {
    workout: normalize((data.workout ?? {}) as Record<string, unknown>),
    xpEarned: Number(data.xpEarned ?? 0),
    completedQuests: Array.isArray(data.completedQuests)
      ? (data.completedQuests as Record<string, unknown>[]).map(normalizeQuest)
      : [],
  }
}

export const deleteWorkout = async (id: string): Promise<void> => {
  await client.delete(`/workouts/${id}`)
}
