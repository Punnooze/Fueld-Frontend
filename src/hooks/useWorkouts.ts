import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRecentWorkouts,
  createWorkout,
  deleteWorkout,
  type CreateWorkoutPayload,
} from '../api/workouts'
import { CHARACTER_KEY } from './useCharacter'
import { QUESTS_KEY } from './useQuests'

export const WORKOUTS_KEY = ['workouts']

export const useRecentWorkouts = (limit = 10) =>
  useQuery({ queryKey: [...WORKOUTS_KEY, limit], queryFn: () => getRecentWorkouts(limit) })

export const useCreateWorkout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CreateWorkoutPayload) => createWorkout(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKOUTS_KEY })
      qc.invalidateQueries({ queryKey: CHARACTER_KEY })
      qc.invalidateQueries({ queryKey: QUESTS_KEY })
      qc.invalidateQueries({ queryKey: ['xp'] })
    },
  })
}

export const useDeleteWorkout = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKOUTS_KEY })
      qc.invalidateQueries({ queryKey: CHARACTER_KEY })
    },
  })
}
