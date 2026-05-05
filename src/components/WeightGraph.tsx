import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts'
import type { WeightEntry } from '../api/weight'

interface Props {
  data: WeightEntry[]
}

const fmt = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const CustomDot = () => null

export const WeightGraph = ({ data }: Props) => {
  if (data.length === 0) return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No weight data yet</p>
    </div>
  )

  const chartData = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({ date: fmt(e.date), weight: e.weight, raw: e.date }))

  const weights = data.map(e => e.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const yMin = Math.floor(minW - 2)
  const yMax = Math.ceil(maxW + 2)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#666', fontSize: 10, fontFamily: 'DM Sans' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fill: '#666', fontSize: 10, fontFamily: 'DM Sans' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}`}
        />
        <Tooltip
          contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, fontSize: 13 }}
          labelStyle={{ color: '#999' }}
          itemStyle={{ color: '#c8f135' }}
          formatter={(v) => [`${v} kg`, 'Weight']}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#c8f135"
          strokeWidth={2.5}
          dot={<CustomDot />}
          activeDot={{ r: 5, fill: '#c8f135', stroke: '#0a0a0a', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
