import { useMutation, useQueryClient } from '@tanstack/react-query'
import { syncHevy, syncHealth } from '../api/sync'

const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['character'] })
  qc.invalidateQueries({ queryKey: ['quests'] })
  qc.invalidateQueries({ queryKey: ['workouts'] })
  qc.invalidateQueries({ queryKey: ['xp'] })
  qc.invalidateQueries({ queryKey: ['weight'] })
  qc.invalidateQueries({ queryKey: ['hevy-stats'] })
}

export const useSyncHevy = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: syncHevy, onSuccess: () => invalidateAll(qc) })
}

export const useSyncHealth = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: syncHealth, onSuccess: () => invalidateAll(qc) })
}
