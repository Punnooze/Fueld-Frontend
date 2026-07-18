import { useQuery } from '@tanstack/react-query'
import { getHevyStats } from '../api/hevy'

export const useHevyStats = (days = 90, enabled = true) =>
  useQuery({
    queryKey: ['hevy-stats', days],
    queryFn: () => getHevyStats(days),
    enabled,
    staleTime: 30 * 60_000,
    retry: 0,
  })
