import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettings, patchSettings, type Settings } from '../api/settings'
import { DEFAULT_TARGETS } from '../utils/macros'

export const SETTINGS_KEY = ['settings']

export const useSettings = () =>
  useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: getSettings,
    staleTime: 60_000,
    retry: 1,
  })

export const useUpdateSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Settings>) => patchSettings(payload),
    onSuccess: (data) => {
      qc.setQueryData(SETTINGS_KEY, data)
      qc.invalidateQueries({ queryKey: ['weight', 'journey'] })
    },
  })
}

export const useTargets = () => {
  const { data } = useSettings()
  return {
    calories: data?.targetCalories ?? DEFAULT_TARGETS.calories,
    protein: data?.targetProtein ?? DEFAULT_TARGETS.protein,
    carbs: data?.targetCarbs ?? DEFAULT_TARGETS.carbs,
    fat: data?.targetFat ?? DEFAULT_TARGETS.fat,
  }
}
