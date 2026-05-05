import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLogHistory } from '../api/logs'
import { MacroHistoryGraph } from '../components/MacroHistoryGraph'
import { CalorieTrendGraph } from '../components/CalorieTrendGraph'
import { SkeletonCard } from '../components/SkeletonCard'
import { useTargets } from '../hooks/useSettings'
import { formatDate } from '../utils/dates'
import styles from './Stats.module.css'

type MacroFilter = '1W' | '2W' | '1M'
const MACRO_FILTERS: { label: MacroFilter; days: number }[] = [
  { label: '1W', days: 7 },
  { label: '2W', days: 14 },
  { label: '1M', days: 30 },
]

const historyKey = (start: string, end: string) => ['logs', 'history', start, end]

export const Stats = () => {
  const [macroFilter, setMacroFilter] = useState<MacroFilter>('2W')
  const targets = useTargets()

  const todayStr = formatDate(new Date())
  const start30 = (() => { const d = new Date(); d.setDate(d.getDate() - 29); return formatDate(d) })()
  const start14 = (() => { const d = new Date(); d.setDate(d.getDate() - 13); return formatDate(d) })()
  const start7  = (() => { const d = new Date(); d.setDate(d.getDate() - 6);  return formatDate(d) })()
  const { data: history30 = [], isLoading } = useQuery({
    queryKey: historyKey(start30, todayStr),
    queryFn: () => getLogHistory(start30, todayStr),
  })

  // This week vs last week
  const thisWeekLogs  = history30.filter(e => e.date >= start7)
  const lastWeekStart = (() => { const d = new Date(); d.setDate(d.getDate() - 13); return formatDate(d) })()
  const lastWeekEnd   = (() => { const d = new Date(); d.setDate(d.getDate() - 7);  return formatDate(d) })()
  const lastWeekLogs  = history30.filter(e => e.date >= lastWeekStart && e.date <= lastWeekEnd)

  const avg = (logs: typeof history30, key: 'calories' | 'protein', days: number) =>
    logs.length === 0 ? 0 : Math.round(logs.reduce((s, e) => s + e[key], 0) / days)

  const thisAvgCal   = avg(thisWeekLogs,  'calories', 7)
  const lastAvgCal   = avg(lastWeekLogs,  'calories', 7)
  const thisAvgPro   = avg(thisWeekLogs,  'protein',  7)
  const lastAvgPro   = avg(lastWeekLogs,  'protein',  7)

  // Personal records
  const byDate = history30.reduce<Record<string, { cal: number; protein: number }>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = { cal: 0, protein: 0 }
    acc[e.date].cal     += e.calories
    acc[e.date].protein += e.protein
    return acc
  }, {})

  const dateSummaries = Object.entries(byDate).map(([date, v]) => ({ date, ...v }))
  const bestProtein = dateSummaries.reduce((best, d) => d.protein > (best?.protein ?? -1) ? d : best, null as typeof dateSummaries[0] | null)
  const lowestCal   = dateSummaries.filter(d => d.cal > 0).reduce((best, d) => d.cal < (best?.cal ?? Infinity) ? d : best, null as typeof dateSummaries[0] | null)

  const macroLogs = macroFilter === '1W' ? history30.filter(e => e.date >= start7)
                  : macroFilter === '2W' ? history30.filter(e => e.date >= start14)
                  : history30

  const macroDays = MACRO_FILTERS.find(f => f.label === macroFilter)?.days ?? 14

  const Delta = ({ val, compare, unit }: { val: number; compare: number; unit: string }) => {
    const diff = val - compare
    const pct = compare > 0 ? Math.round(Math.abs(diff / compare) * 100) : 0
    if (diff === 0) return <span className={styles.deltaFlat}>—</span>
    return (
      <span className={diff > 0 ? styles.deltaUp : styles.deltaDown}>
        {diff > 0 ? '↑' : '↓'} {Math.abs(diff)}{unit} ({pct}%)
      </span>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}><h1 className={styles.title}>Stats</h1></header>

      {isLoading ? (
        <div className={styles.content}>
          <SkeletonCard height={260} />
          <SkeletonCard height={220} />
          <SkeletonCard height={120} />
        </div>
      ) : (
        <div className={styles.content}>

          {/* Macro split */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Macro Split</h2>
              <div className={styles.filterRow}>
                {MACRO_FILTERS.map(f => (
                  <button
                    key={f.label}
                    className={`${styles.filterBtn} ${macroFilter === f.label ? styles.filterBtnActive : ''}`}
                    onClick={() => setMacroFilter(f.label)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <MacroHistoryGraph logs={macroLogs} days={macroDays} />
          </section>

          {/* Calorie trend */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Calorie Trend</h2>
              <span className={styles.cardSub}>30 days</span>
            </div>
            <CalorieTrendGraph logs={history30} target={targets.calories} days={30} />
          </section>

          {/* Weekly comparison */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 14 }}>Weekly Averages</h2>
            <div className={styles.compareGrid}>
              <div className={styles.compareCol}>
                <span className={styles.compareLabel}>This week</span>
                <span className={styles.compareVal}>{thisAvgCal}</span>
                <span className={styles.compareUnit}>avg kcal</span>
                <Delta val={thisAvgCal} compare={lastAvgCal} unit="" />
              </div>
              <div className={styles.compareDivider} />
              <div className={styles.compareCol}>
                <span className={styles.compareLabel}>This week</span>
                <span className={styles.compareVal}>{thisAvgPro}</span>
                <span className={styles.compareUnit}>avg protein g</span>
                <Delta val={thisAvgPro} compare={lastAvgPro} unit="g" />
              </div>
            </div>
          </section>

          {/* Personal records */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 14 }}>Personal Records <span style={{ fontSize: 14 }}>🏆</span></h2>
            <div className={styles.records}>
              <div className={styles.record}>
                <span className={styles.recordLabel}>Highest Protein Day</span>
                {bestProtein ? (
                  <>
                    <span className={styles.recordVal}>{Math.round(bestProtein.protein)}g</span>
                    <span className={styles.recordDate}>{new Date(bestProtein.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </>
                ) : <span className={styles.recordEmpty}>No data yet</span>}
              </div>
              <div className={styles.record}>
                <span className={styles.recordLabel}>Lowest Calorie Day</span>
                {lowestCal ? (
                  <>
                    <span className={styles.recordVal}>{Math.round(lowestCal.cal)} kcal</span>
                    <span className={styles.recordDate}>{new Date(lowestCal.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </>
                ) : <span className={styles.recordEmpty}>No data yet</span>}
              </div>
            </div>
          </section>

        </div>
      )}
    </div>
  )
}
