import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFoods, createFood, updateFood, deleteFood, type FoodPayload } from '../api/foods'

export const FOODS_KEY = ['foods']

export const useFoods = () =>
  useQuery({
    queryKey: FOODS_KEY,
    queryFn: async () => {
      const data = await getFoods()
      return Array.isArray(data) ? data : []
    },
  })

export const useCreateFood = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: FoodPayload) => createFood(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: FOODS_KEY }),
  })
}

export const useUpdateFood = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FoodPayload }) => updateFood(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: FOODS_KEY }),
  })
}

export const useDeleteFood = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFood(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: FOODS_KEY }),
  })
}
