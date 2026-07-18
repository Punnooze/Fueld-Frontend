import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts'
import type { XpEvent } from '../api/xp'
import { formatDate } from '../utils/dates'

interface Props {
  events: XpEvent[]
  days?: number
}

// Cumulative XP earned over the window — the climb.
export const XpTrendGraph = ({ events, days = 30 }: Props) => {
  const today = new Date()
  const range = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    return formatDate(d)
  })

  const perDay = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] ?? 0) + e.xp
    return acc
  }, {})

  let cum = 0
  const data = range.map(date => {
    cum += perDay[date] ?? 0
    return { date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), xp: cum }
  })

  if (cum === 0) {
    return (
      <div style={{ height: 160, display: 'grid', placeItems: 'center' }}>
        <p className="t-meta">No XP earned in this window yet.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8F135" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#C8F135" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: '#5C625B', fontSize: 9 }}
          tickLine={false} axisLine={false}
          interval={Math.floor(days / 5)}
        />
        <Tooltip
          contentStyle={{ background: '#1B1E1B', border: '1px solid #2A2E2A', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: '#9BA199' }}
          formatter={(v) => [`${v} XP`, 'Total']}
        />
        <Area type="monotone" dataKey="xp" stroke="#C8F135" strokeWidth={2} fill="url(#xpFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
