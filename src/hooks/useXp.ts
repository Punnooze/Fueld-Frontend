import { useQuery } from '@tanstack/react-query'
import { getXp } from '../api/xp'

export const useXp = (limit = 100) =>
  useQuery({ queryKey: ['xp', limit], queryFn: () => getXp(limit), staleTime: 15_000 })
