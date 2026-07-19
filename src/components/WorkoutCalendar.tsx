import { useMemo, useState } from 'react'
import { useWorkoutsRange } from '../hooks/useWorkouts'
import { Eyebrow } from './ui/Eyebrow'
import { ChevronRightIcon, DumbbellIcon } from '../assets/icons'
import { formatDate, today } from '../utils/dates'
import styles from './WorkoutCalendar.module.css'

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export const WorkoutCalendar = ({ enabled = true }: { enabled?: boolean }) => {
  const [anchor, setAnchor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selected, setSelected] = useState<string | null>(null)

  const y = anchor.getFullYear()
  const m = anchor.getMonth()
  const first = new Date(y, m, 1)
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const startWeekday = (first.getDay() + 6) % 7 // Monday = 0
  const monthStart = formatDate(first)
  const monthEnd = formatDate(new Date(y, m + 1, 0))

  const { data: workouts = [] } = useWorkoutsRange(monthStart, monthEnd, enabled)

  const byDate = useMemo(() => {
    const map = new Map<string, typeof workouts>()
    for (const w of workouts) {
      const arr = map.get(w.date) ?? []
      arr.push(w)
      map.set(w.date, arr)
    }
    return map
  }, [workouts])

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const monthLabel = anchor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const canForward = new Date(y, m, 1) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const todayStr = today()
  const sel = selected ? byDate.get(selected) : undefined

  return (
    <section>
      <Eyebrow>Training Calendar</Eyebrow>
      <div className="card" style={{ padding: 16 }}>
        {/* month nav */}
        <div className="between" style={{ marginBottom: 14 }}>
          <button className="btn-icon" onClick={() => setAnchor(new Date(y, m - 1, 1))} aria-label="Previous month">
            <ChevronRightIcon width={18} height={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-hi)' }}>{monthLabel}</span>
          <button className="btn-icon" onClick={() => canForward && setAnchor(new Date(y, m + 1, 1))} disabled={!canForward} aria-label="Next month" style={{ opacity: canForward ? 1 : 0.3 }}>
            <ChevronRightIcon width={18} height={18} />
          </button>
        </div>

        {/* weekday row */}
        <div className={styles.grid} style={{ marginBottom: 6 }}>
          {WEEK.map((d, i) => <span key={i} className="t-micro" style={{ textAlign: 'center', color: 'var(--text-low)' }}>{d}</span>)}
        </div>

        {/* days */}
        <div className={styles.grid}>
          {cells.map((day, i) => {
            if (day == null) return <span key={i} />
            const ds = formatDate(new Date(y, m, day))
            const has = byDate.has(ds)
            const isToday = ds === todayStr
            const isSel = ds === selected
            return (
              <button
                key={i}
                className={styles.day}
                onClick={() => has && setSelected(isSel ? null : ds)}
                style={{
                  background: has ? 'var(--accent)' : 'transparent',
                  color: has ? 'var(--accent-ink)' : 'var(--text-mid)',
                  fontWeight: has ? 700 : 500,
                  border: isSel ? '2px solid var(--text-hi)' : isToday ? '1px solid var(--line)' : '2px solid transparent',
                  cursor: has ? 'pointer' : 'default',
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* selected day detail */}
      {sel && sel.length > 0 && (
        <div className="stack gap-8" style={{ marginTop: 10 }}>
          {sel.map(w => (
            <div key={w.id} className={styles.detail}>
              <div className={styles.dicon}><DumbbellIcon width={18} height={18} /></div>
              <div className="stack gap-2 flex-1 min-w-0">
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)' }}>{w.type}</span>
                <span className="t-micro" style={{ color: 'var(--text-low)' }}>
                  {w.totalVolume > 0 ? `${w.totalVolume.toLocaleString()}kg` : ''}{w.exercises.length ? ` · ${w.exercises.length} exercises` : ''}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>+{w.xpEarned}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
