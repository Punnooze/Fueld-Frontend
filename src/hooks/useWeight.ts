import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWeight, getLatestWeight, createWeight, deleteWeight, type WeightPayload } from '../api/weight'
import { formatDate } from '../utils/dates'

export const LATEST_WEIGHT_KEY = ['weight', 'latest']
export const weightRangeKey = (s: string, e: string) => ['weight', s, e]

export const useLatestWeight = () =>
  useQuery({ queryKey: LATEST_WEIGHT_KEY, queryFn: getLatestWeight })

const rangeStart = (range: string): string => {
  const d = new Date()
  const m: Record<string, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '2Y': 24 }
  d.setMonth(d.getMonth() - (m[range] ?? 1))
  return formatDate(d)
}

export const useWeight = (range: string) => {
  const end = formatDate(new Date())
  const start = rangeStart(range)
  return useQuery({
    queryKey: weightRangeKey(start, end),
    queryFn: () => getWeight(start, end),
  })
}

export const useCreateWeight = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: WeightPayload) => createWeight(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weight'] })
      qc.invalidateQueries({ queryKey: ['character'] })
      qc.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

export const useDeleteWeight = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWeight(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weight'] }),
  })
}
