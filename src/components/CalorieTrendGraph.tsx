import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import type { LogEntry } from '../api/logs'
import { formatDate } from '../utils/dates'

interface Props {
  logs: LogEntry[]
  target: number
  days?: number
}

interface DotProps {
  cx?: number
  cy?: number
  value?: number
  target: number
}

const CustomDot = ({ cx = 0, cy = 0, value = 0, target }: DotProps) => (
  <circle cx={cx} cy={cy} r={3} fill={value > target ? '#ff4d4d' : '#c8f135'} stroke="none" />
)

export const CalorieTrendGraph = ({ logs, target, days = 30 }: Props) => {
  const today = new Date()
  const dateRange = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    return formatDate(d)
  })

  const byDate = logs.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] ?? 0) + e.calories
    return acc
  }, {})

  const chartData = dateRange.map(date => {
    const d = new Date(date)
    return {
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      calories: byDate[date] != null ? Math.round(byDate[date]) : null,
    }
  })

  const hasData = chartData.some(d => d.calories != null)
  if (!hasData) return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No calorie data yet</p>
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#666', fontSize: 9, fontFamily: 'DM Sans' }}
          tickLine={false} axisLine={false}
          interval={Math.floor(days / 7)}
        />
        <YAxis tick={{ fill: '#666', fontSize: 10, fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: '#999' }}
          formatter={(v) => [`${v} kcal`, 'Calories']}
        />
        <ReferenceLine
          y={target}
          stroke="#c8f135"
          strokeDasharray="5 4"
          strokeOpacity={0.4}
          label={{ value: `${target}`, fill: '#c8f135', fontSize: 10, position: 'insideTopRight' }}
        />
        <Line
          type="monotone"
          dataKey="calories"
          stroke="#c8f135"
          strokeWidth={2}
          connectNulls={false}
          dot={(props) => <CustomDot {...props} target={target} />}
          activeDot={{ r: 5, fill: '#c8f135', stroke: '#0a0a0a', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
