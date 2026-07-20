import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLogs, createLog, updateLog, deleteLog, type CreateLogPayload, type UpdateLogPayload, type LogEntry } from '../api/logs'
import { getFoods } from '../api/foods'
import { FOODS_KEY } from './useFoods'
import type { FoodItem } from '../api/foods'

export const logsKey = (date: string) => ['logs', date]

const enrichFromFoods = (entries: LogEntry[], foods: FoodItem[]): LogEntry[] =>
  entries.map(entry => {
    if (entry.calories !== 0) return entry
    const food = foods.find(f => f.id === entry.foodItemId)
    if (!food) return entry
    return {
      ...entry,
      foodName: entry.foodName || food.name,
      calories: food.calories * entry.quantity,
      protein: food.protein * entry.quantity,
      carbs: food.carbs * entry.quantity,
      fat: food.fat * entry.quantity,
    }
  })

export const useLogs = (date: string) => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: logsKey(date),
    queryFn: async () => {
      const data = await getLogs(date)
      const entries = Array.isArray(data) ? data : []

      // Get foods from cache; if cache is cold and entries need enrichment, fetch them
      let foods = qc.getQueryData<FoodItem[]>(FOODS_KEY) ?? []
      if (entries.some(e => e.calories === 0) && foods.length === 0) {
        foods = await qc.fetchQuery({ queryKey: FOODS_KEY, queryFn: getFoods }).catch(() => [])
      }

      return enrichFromFoods(entries, foods)
    },
  })
}

export const useCreateLog = (date: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLogPayload) => createLog(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: logsKey(date) })
      qc.invalidateQueries({ queryKey: ['week'] })
      qc.invalidateQueries({ queryKey: ['character'] })
      qc.invalidateQueries({ queryKey: ['quests'] })
      qc.invalidateQueries({ queryKey: ['streak'] })
    },
  })
}

export const useUpdateLog = (date: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateLogPayload }) => updateLog(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: logsKey(date) })
      qc.invalidateQueries({ queryKey: ['week'] })
      qc.invalidateQueries({ queryKey: ['character'] })
      qc.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

export const useDeleteLog = (date: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: logsKey(date) })
      qc.invalidateQueries({ queryKey: ['week'] })
    },
  })
}
