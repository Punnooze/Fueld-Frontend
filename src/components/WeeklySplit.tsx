import { useMemo } from 'react'
import { useWorkoutsRange } from '../hooks/useWorkouts'
import { Eyebrow } from './ui/Eyebrow'
import { getWeekDates, formatDate, today } from '../utils/dates'
import styles from './WeeklySplit.module.css'

const DAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const GYM_TARGET = 5

// derive a short split label from a Hevy workout title
function splitLabel(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('pull')) return 'PULL'
  if (t.includes('push')) return 'PUSH'
  if (t.includes('leg')) return 'LEGS'
  if (t.includes('arm')) return 'ARMS'
  if (t.includes('upper')) return 'UPPER'
  if (t.includes('lower')) return 'LOWER'
  if (t.includes('chest')) return 'PUSH'
  if (t.includes('back')) return 'PULL'
  if (t.includes('full')) return 'FULL'
  if (t.includes('cardio') || t.includes('cycle') || t.includes('run')) return 'CARDIO'
  return type.slice(0, 5).toUpperCase()
}

export const WeeklySplit = ({ enabled = true, bare = false }: { enabled?: boolean; bare?: boolean }) => {
  const week = useMemo(() => getWeekDates(), [])
  const weekStart = formatDate(week[0])
  const weekEnd = formatDate(week[6])
  const { data: workouts = [] } = useWorkoutsRange(weekStart, weekEnd, enabled)
  const todayStr = today()

  const byDate = useMemo(() => {
    const m = new Map<string, string>()
    for (const w of workouts) m.set(w.date, splitLabel(w.type))
    return m
  }, [workouts])

  const gymDays = week.filter(d => byDate.has(formatDate(d))).length
  // rest = past/today non-Sunday days with no session
  const restDays = week.filter((d, i) => {
    const ds = formatDate(d)
    return ds <= todayStr && i !== 6 && !byDate.has(ds)
  }).length

  const gymLine =
    gymDays >= 5 ? 'FULL SEND · 5/5'
    : gymDays >= 4 ? '▲ DANGEROUS THIS WEEK'
    : gymDays === 0 ? 'GET IN THERE'
    : `${4 - gymDays} MORE. NO EXCUSES.`
  const gymColor = gymDays >= 4 ? 'var(--success)' : gymDays === 0 ? 'var(--danger)' : 'var(--text-mid)'

  const restLine =
    restDays === 0 ? 'ZERO REST · MACHINE'
    : restDays === 1 ? '1 OFF · DISCIPLINED'
    : restDays === 2 ? '2 OFF · AT THE LIMIT'
    : 'GONE SOFT · TOO MANY OFF'
  const restColor = restDays > 2 ? 'var(--danger)' : restDays <= 1 ? 'var(--accent)' : 'var(--carbs)'

  const inner = (
    <>
      <div className={styles.week}>
        {week.map((d, i) => {
          const ds = formatDate(d)
          const label = byDate.get(ds)
          const isToday = ds === todayStr
          const isSun = i === 6
          const future = ds > todayStr
          const rest = !label && (isSun || (!future))
          return (
            <div key={i} className={styles.day}>
              <span className="t-micro" style={{ color: isToday ? 'var(--accent)' : 'var(--text-low)' }}>{DAY[i]}</span>
              <div
                className={styles.cell}
                style={{
                  background: label ? 'var(--accent)' : 'transparent',
                  borderColor: isToday ? 'var(--accent)' : label ? 'var(--accent)' : 'var(--line)',
                  color: label ? 'var(--accent-ink)' : 'var(--text-dim)',
                }}
              >
                {label ? '' : isSun ? '✕' : rest ? '·' : ''}
              </div>
              <span className={styles.lbl} style={{ color: label ? 'var(--text-hi)' : 'var(--text-dim)' }}>
                {label ?? (isSun ? 'REST' : rest ? 'rest' : '—')}
              </span>
            </div>
          )
        })}
      </div>

      <div className="between" style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
        <span className="t-micro" style={{ color: gymColor, fontWeight: 700, letterSpacing: '0.06em' }}>{gymLine}</span>
        <span className="t-micro" style={{ color: restColor, fontWeight: 700, letterSpacing: '0.06em' }}>{restLine}</span>
      </div>
    </>
  )

  if (bare) {
    return (
      <>
        <div className="between" style={{ marginBottom: 12 }}>
          <span className="t-eyebrow">This Week</span>
          <span className="t-micro" style={{ color: 'var(--text-low)' }}>{gymDays}/{GYM_TARGET} gym</span>
        </div>
        {inner}
      </>
    )
  }

  return (
    <section>
      <Eyebrow right={`${gymDays}/${GYM_TARGET} gym`}>This Week</Eyebrow>
      <div className="card" style={{ padding: 16 }}>{inner}</div>
    </section>
  )
}
