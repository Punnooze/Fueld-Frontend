import { useQuery } from '@tanstack/react-query'
import { getLogHistory } from '../api/logs'
import { formatDate } from '../utils/dates'

export const useStreak = () => {
  const todayStr = formatDate(new Date())
  const start = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 90)
    return formatDate(d)
  })()

  return useQuery({
    queryKey: ['streak', todayStr],
    queryFn: async () => {
      const history = await getLogHistory(start, todayStr)
      const datesWithLogs = new Set(history.map(e => e.date))
      let streak = 0
      const ref = new Date()
      for (let i = 0; i < 90; i++) {
        const d = new Date(ref)
        d.setDate(ref.getDate() - i)
        if (datesWithLogs.has(formatDate(d))) {
          streak++
        } else {
          break
        }
      }
      return streak
    },
    staleTime: 60_000,
  })
}
