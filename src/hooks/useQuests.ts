import { useQuery } from '@tanstack/react-query'
import { getQuests } from '../api/quests'

export const QUESTS_KEY = ['quests']

export const useQuests = () =>
  useQuery({ queryKey: QUESTS_KEY, queryFn: getQuests, staleTime: 15_000 })
