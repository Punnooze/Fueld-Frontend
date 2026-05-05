import { useQuery } from '@tanstack/react-query'
import { getWeekLogs } from '../api/logs'
import { getWeekStart } from '../utils/dates'

export const useWeekLogs = () => {
  const startDate = getWeekStart()
  return useQuery({
    queryKey: ['week', startDate],
    queryFn: async () => {
      const data = await getWeekLogs(startDate)
      return Array.isArray(data) ? data : []
    },
  })
}
