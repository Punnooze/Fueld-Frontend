import { useQuery } from '@tanstack/react-query'
import { getFitbitToday } from '../api/fitbit'

export const useFitbitToday = (enabled = true) =>
  useQuery({
    queryKey: ['fitbit-today'],
    queryFn: getFitbitToday,
    enabled,
    staleTime: 5 * 60_000,
    retry: 0,
  })
