import { useQuery } from '@tanstack/react-query'
import { getHealthToday } from '../api/sync'

export const useHealthToday = (enabled = true) =>
  useQuery({
    queryKey: ['health-today'],
    queryFn: getHealthToday,
    enabled,
    staleTime: 30 * 60_000,
    retry: 0,
  })
