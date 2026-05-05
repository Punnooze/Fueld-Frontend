import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLogHistory } from '../api/logs'
import { CalorieTrendGraph } from '../components/CalorieTrendGraph'
import { SkeletonCard } from '../components/SkeletonCard'
import { RingProgress } from '../components/RingProgress'
import { Card } from '../components/ui/Card'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MetricNumber } from '../components/ui/MetricNumber'
import { useTargets } from '../hooks/useSettings'
import { formatDate } from '../utils/dates'
import { ChevronDownIcon, TrophyIcon, StreakIcon } from '../assets/icons'
import EmptyStats from '../assets/illustrations/empty-stats.svg?react'
import DiagonalStripe from '../assets/decor/diagonal-stripe.svg?react'
import styles from './Stats.module.css'

type Range = '7d' | '14d' | '30d'
const RANGES: { label: string; value: Range; days: number }[] = [
  { label: '7 days',  value: '7d',  days: 7  },
  { label: '14 days', value: '14d', days: 14 },
  { label: '30 days', value: '30d', days: 30 },
]

function daysAgoStr(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return formatDate(d)
}

const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export const Stats = () => {
  const [range, setRange]         = useState<Range>('7d')
  const [rangeOpen, setRangeOpen] = useState(false)
  const targets = useTargets()

  const todayStr = formatDate(new Date())
  const start30  = daysAgoStr(29)
  const start14  = daysAgoStr(13)
  const start7   = daysAgoStr(6)

  const { data: history30 = [], isLoading } = useQuery({
    queryKey: ['logs', 'history', start30, todayStr],
    queryFn:  () => getLogHistory(start30, todayStr),
  })

  const rangeStart  = range === '7d' ? start7 : range === '14d' ? start14 : start30
  const selectedDays = RANGES.find(r => r.value === range)?.days ?? 7
  const rangeLogs    = history30.filter(e => e.date >= rangeStart)
  const last7Logs    = history30.filter(e => e.date >= start7)

  // Per-day aggregates
  const byDate = history30.reduce<Record<string, { cal: number; protein: number; carbs: number; fat: number }>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = { cal: 0, protein: 0, carbs: 0, fat: 0 }
    acc[e.date].cal     += e.calories
    acc[e.date].protein += e.protein ?? 0
    acc[e.date].carbs   += e.carbs   ?? 0
    acc[e.date].fat     += e.fat     ?? 0
    return acc
  }, {})

  // Activity strip — last 7 days
  const activityDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const ds = formatDate(d)
    const kcal = byDate[ds]?.cal ?? 0
    return { date: d, kcal, progress: targets.calories > 0 ? Math.min(kcal / targets.calories, 1) : 0 }
  })

  // Macro split
  const totalP = rangeLogs.reduce((s, e) => s + (e.protein ?? 0), 0)
  const totalC = rangeLogs.reduce((s, e) => s + (e.carbs   ?? 0), 0)
  const totalF = rangeLogs.reduce((s, e) => s + (e.fat     ?? 0), 0)
  const pCal   = totalP * 4, cCal = totalC * 4, fCal = totalF * 9
  const tCal   = pCal + cCal + fCal
  const pPct   = tCal > 0 ? Math.round(pCal / tCal * 100) : 0
  const cPct   = tCal > 0 ? Math.round(cCal / tCal * 100) : 0
  const fPct   = tCal > 0 ? 100 - pPct - cPct : 0
  const hasMacros = tCal > 0

  // Weekly averages
  const avg = (logs: typeof history30, key: string, days: number) =>
    logs.length === 0 ? 0 : Math.round(logs.reduce((s, e) => s + ((e as unknown as Record<string, number>)[key] ?? 0), 0) / days)

  const lastWeekLogs = history30.filter(e => e.date >= daysAgoStr(13) && e.date <= daysAgoStr(7))
  const avgData = [
    { label: 'AVG KCAL',    val: avg(last7Logs, 'calories', 7), compare: avg(lastWeekLogs, 'calories', 7), unit: '' },
    { label: 'AVG PROTEIN', val: avg(last7Logs, 'protein', 7),  compare: avg(lastWeekLogs, 'protein', 7),  unit: 'g' },
    { label: 'AVG CARBS',   val: avg(last7Logs, 'carbs', 7),    compare: avg(lastWeekLogs, 'carbs', 7),    unit: 'g' },
    { label: 'AVG FAT',     val: avg(last7Logs, 'fat', 7),      compare: avg(lastWeekLogs, 'fat', 7),      unit: 'g' },
  ]

  // Personal records
  const dateSummaries = Object.entries(byDate).map(([date, v]) => ({ date, ...v }))
  const bestProtein = dateSummaries.reduce((best, d) => d.protein > (best?.protein ?? -1) ? d : best, null as typeof dateSummaries[0] | null)
  const lowestCal   = dateSummaries.filter(d => d.cal > 0).reduce((best, d) => d.cal < (best?.cal ?? Infinity) ? d : best, null as typeof dateSummaries[0] | null)
  const highestCal  = dateSummaries.reduce((best, d) => d.cal > (best?.cal ?? -1) ? d : best, null as typeof dateSummaries[0] | null)
  const records = [
    { label: 'Highest Protein Day', val: bestProtein ? `${Math.round(bestProtein.protein)}g` : null, date: bestProtein?.date, Icon: StreakIcon },
    { label: 'Lowest Calorie Day',  val: lowestCal  ? `${Math.round(lowestCal.cal)} kcal`   : null, date: lowestCal?.date },
    { label: 'Highest Calorie Day', val: highestCal ? `${Math.round(highestCal.cal)} kcal`   : null, date: highestCal?.date },
  ]

  const currentRange = RANGES.find(r => r.value === range)!

  const Delta = ({ val, compare, unit }: { val: number; compare: number; unit: string }) => {
    const diff = val - compare
    if (diff === 0 || compare === 0) return <span style={{ fontSize: 11, color: 'var(--text-low)' }}>— flat</span>
    const up = diff > 0
    const pct = Math.round(Math.abs(diff / compare) * 100)
    return (
      <span style={{ fontSize: 11, color: up ? 'var(--danger)' : 'var(--success)' }}>
        {up ? '▲' : '▼'} {Math.abs(diff)}{unit} ({pct}%) vs last
      </span>
    )
  }

  return (
    <div className="page">
      <header className="page-header between" style={{ position: 'relative' }}>
        <h1 className="t-h1">Stats</h1>
        <button
          className="btn-ghost row gap-4"
          onClick={() => setRangeOpen(o => !o)}
        >
          Last {currentRange.label} <ChevronDownIcon width={14} height={14} />
        </button>
        {rangeOpen && (
          <div className={styles.rangeDropdown}>
            {RANGES.map(r => (
              <button key={r.value}
                className={styles.rangeOption}
                style={{ color: range === r.value ? 'var(--accent)' : 'var(--text-hi)' }}
                onClick={() => { setRange(r.value); setRangeOpen(false) }}>
                Last {r.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="stack gap-12 px">
          {[100, 260, 220, 120].map(h => <SkeletonCard key={h} height={h} />)}
        </div>
      ) : (
        <div className="stack gap-12 px">

          {/* Activity ring strip */}
          <div className={styles.activityStrip}>
            {activityDays.map((day, i) => (
              <div key={i} className={styles.activityTile}>
                <span className="t-micro" style={{ color: 'var(--text-low)' }}>{DAY_INITIALS[day.date.getDay()]}</span>
                <RingProgress progress={day.progress} size={32} strokeWidth={3.5}>
                  <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--text-low)' }}>
                    {day.progress > 0.05 ? `${Math.round(day.progress * 100)}` : ''}
                  </span>
                </RingProgress>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-low)' }}>
                  {day.kcal > 0 ? day.kcal : '—'}
                </span>
              </div>
            ))}
          </div>

          {/* Macro split */}
          <Card>
            <Eyebrow right={`Last ${currentRange.label}`}>Macro Split</Eyebrow>
            {hasMacros ? (
              <>
                <div className={styles.macroBar}>
                  <div style={{ flex: pPct, background: 'var(--protein)' }} />
                  <div style={{ flex: cPct, background: 'var(--carbs)' }} />
                  <div style={{ flex: fPct, background: 'var(--fat)' }} />
                </div>
                <div className="stack gap-6" style={{ marginTop: 12 }}>
                  {[
                    { label: 'Protein', color: 'var(--protein)', avg: Math.round(totalP / selectedDays), pct: pPct },
                    { label: 'Carbs',   color: 'var(--carbs)',   avg: Math.round(totalC / selectedDays), pct: cPct },
                    { label: 'Fat',     color: 'var(--fat)',     avg: Math.round(totalF / selectedDays), pct: fPct },
                  ].map(m => (
                    <div key={m.label} className="between">
                      <div className="row gap-8">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                        <span className="t-meta">{m.label}</span>
                      </div>
                      <div className="row gap-12">
                        <span className="t-meta">{m.avg}g avg</span>
                        <MetricNumber size="sm" color={m.color}>{m.pct}%</MetricNumber>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="stack gap-12" style={{ alignItems: 'center', padding: '16px 0' }}>
                <div className={styles.macroBarEmpty}>
                  <DiagonalStripe style={{ width: '100%', height: '100%', borderRadius: 'var(--r-inner)' }} />
                </div>
                <p className="t-meta">Log a few meals to see your split</p>
              </div>
            )}
          </Card>

          {/* Calorie trend */}
          <Card>
            <Eyebrow right={<span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>— Target {targets.calories}</span>}>
              Calorie Trend
            </Eyebrow>
            {rangeLogs.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <EmptyStats width={160} height={160} />
                <p className="t-meta">No data yet — start logging</p>
              </div>
            ) : (
              <CalorieTrendGraph logs={rangeLogs} target={targets.calories} days={selectedDays} />
            )}
          </Card>

          {/* Weekly averages */}
          <Card>
            <Eyebrow>Weekly Averages</Eyebrow>
            <div className={styles.avgGrid}>
              {avgData.map(({ label, val, compare, unit }) => (
                <div key={label} className="stack gap-4">
                  <span className="t-eyebrow">{label}</span>
                  <MetricNumber size="md">{val}</MetricNumber>
                  <Delta val={val} compare={compare} unit={unit} />
                </div>
              ))}
            </div>
          </Card>

          {/* Personal records */}
          <Card>
            <Eyebrow right={<TrophyIcon width={14} height={14} style={{ color: 'var(--accent)' }} />}>
              Personal Records
            </Eyebrow>
            <div className="stack gap-6">
              {records.map(({ label, val, date }) => (
                <div key={label} className="card-inner between" style={{ padding: '12px 14px' }}>
                  <span className="t-meta">{label}</span>
                  {val ? (
                    <div className="row gap-8">
                      <MetricNumber size="sm" color="var(--accent)">{val}</MetricNumber>
                      <span style={{ fontSize: 11, color: 'var(--text-low)' }}>
                        {date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text-low)' }}>—</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}
    </div>
  )
}
