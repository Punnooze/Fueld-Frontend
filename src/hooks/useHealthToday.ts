import { useQuery } from '@tanstack/react-query'
import { getHealthToday } from '../api/sync'

export const useHealthToday = (enabled = true, dateOverride?: string) =>
  useQuery({
    queryKey: ['health-today', dateOverride ?? 'today'],
    queryFn: () => getHealthToday(dateOverride),
    enabled,
    staleTime: 30 * 60_000,
    retry: 0,
  })
