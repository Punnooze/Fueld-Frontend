import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { LogEntry } from '../api/logs'
import { formatDate } from '../utils/dates'

interface Props {
  logs: LogEntry[]
  days: number
}

const PROTEIN_COLOR = '#c8f135'
const CARBS_COLOR   = '#4d9fff'
const FAT_COLOR     = '#ff9f4d'

export const MacroHistoryGraph = ({ logs, days }: Props) => {
  // Build last N days
  const today = new Date()
  const dateRange = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    return formatDate(d)
  })

  const byDate = logs.reduce<Record<string, { protein: number; carbs: number; fat: number }>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = { protein: 0, carbs: 0, fat: 0 }
    acc[e.date].protein += e.protein
    acc[e.date].carbs   += e.carbs
    acc[e.date].fat     += e.fat
    return acc
  }, {})

  const chartData = dateRange.map(date => {
    const d = new Date(date)
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return {
      date: label,
      protein: Math.round(byDate[date]?.protein ?? 0),
      carbs:   Math.round(byDate[date]?.carbs   ?? 0),
      fat:     Math.round(byDate[date]?.fat      ?? 0),
    }
  })

  const hasData = chartData.some(d => d.protein + d.carbs + d.fat > 0)
  if (!hasData) return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No macro data yet</p>
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barSize={days <= 7 ? 16 : 8}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 9, fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} interval={days > 14 ? 3 : 0} />
        <YAxis tick={{ fill: '#666', fontSize: 9, fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: '#999' }}
          formatter={(v, name) => [`${v}g`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="protein" stackId="a" fill={PROTEIN_COLOR} radius={[0, 0, 0, 0]} />
        <Bar dataKey="carbs"   stackId="a" fill={CARBS_COLOR}   radius={[0, 0, 0, 0]} />
        <Bar dataKey="fat"     stackId="a" fill={FAT_COLOR}     radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
