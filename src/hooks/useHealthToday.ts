import { useQuery } from '@tanstack/react-query'
import { getHealthToday } from '../api/sync'
import { formatDate } from '../utils/dates'

export const useHealthToday = (enabled = true, dateOverride?: string) => {
  // key on the real date so the cache busts at day rollover (was literal 'today' → served stale)
  const date = dateOverride ?? formatDate(new Date())
  return useQuery({
    queryKey: ['health-today', date],
    queryFn: () => getHealthToday(date),
    enabled,
    staleTime: 30 * 60_000,
    retry: 0,
  })
}
