import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWorkoutsRange } from '../hooks/useWorkouts'
import { getCardioDates, getStepsDates, getHealthToday, type CardioSession } from '../api/sync'
import { Eyebrow } from './ui/Eyebrow'
import { ChevronRightIcon, DumbbellIcon, HeartIcon, FootprintIcon } from '../assets/icons'
import { formatDate, today, fmtClock } from '../utils/dates'
import styles from './WorkoutCalendar.module.css'

const CARDIO = '#5A9EFF'
const STEPS = '#F59E0B' // 10k-steps underline (amber — contrasts lime + dark)

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const cardioIcon = (t = '') => (/WALK|HIK/.test(t) ? FootprintIcon : HeartIcon)
const cardioLabel = (s: CardioSession) =>
  s.name || (s.type ? s.type.charAt(0) + s.type.slice(1).toLowerCase() : 'Cardio')
const cardioSub = (s: CardioSession) =>
  [
    fmtClock(s.startTime) || null,
    s.durationMin != null ? `${s.durationMin}min` : null,
    s.activeZoneMinutes != null ? `${s.activeZoneMinutes} zone` : null,
    s.calories != null ? `${s.calories}kcal` : null,
    s.distanceKm != null ? `${s.distanceKm}km` : null,
  ].filter(Boolean).join(' · ')

export const WorkoutCalendar = ({ enabled = true, bare = false }: { enabled?: boolean; bare?: boolean }) => {
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
  // refetch fresh on mount so a day shows every marker it earned (cardio + 10k
  // steps events are awarded server-side and can appear after the first cache)
  const { data: cardioDates = [] } = useQuery({ queryKey: ['cardio-dates'], queryFn: getCardioDates, enabled, staleTime: 0, refetchOnMount: 'always' })
  const cardioSet = useMemo(() => new Set(cardioDates), [cardioDates])
  const { data: stepsDates = [] } = useQuery({ queryKey: ['steps-dates'], queryFn: getStepsDates, enabled, staleTime: 0, refetchOnMount: 'always' })
  const stepsSet = useMemo(() => new Set(stepsDates), [stepsDates])

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
  const gymList = (selected ? byDate.get(selected) : undefined) ?? []
  // fetch the selected day's health for its cardio sessions + step count
  const { data: dayHealth } = useQuery({
    queryKey: ['health-day', selected],
    queryFn: () => getHealthToday(selected ?? undefined),
    enabled: enabled && !!selected,
  })
  const daySessions = dayHealth?.cardioSessions ?? []
  const dayStepsHit = selected ? stepsSet.has(selected) : false

  const inner = (
    <>
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
          const cardio = cardioSet.has(ds)
          const steps = stepsSet.has(ds)
          const selectable = has || cardio || steps
          const isToday = ds === todayStr
          const isSel = ds === selected
          // fill tint keyed to the day's primary activity (gym > cardio > steps)
          const tint = has ? 'rgba(200,241,53,0.16)' : cardio ? 'rgba(90,158,255,0.16)' : steps ? 'rgba(245,158,11,0.16)' : undefined
          return (
            <button
              key={i}
              className={styles.day}
              onClick={() => selectable && setSelected(isSel ? null : ds)}
              data-sel={isSel || undefined}
              data-today={isToday || undefined}
              style={{ cursor: selectable ? 'pointer' : 'default', background: isSel ? undefined : tint, color: selectable ? 'var(--text-hi)' : 'var(--text-low)', fontWeight: selectable ? 700 : 400 }}
            >
              <span className={styles.dayNum}>{day}</span>
              <span className={styles.dots}>
                {has && <i style={{ background: 'var(--accent)' }} />}
                {cardio && <i style={{ background: CARDIO }} />}
                {steps && <i style={{ background: STEPS }} />}
              </span>
            </button>
          )
        })}
      </div>

      {/* legend */}
      <div className={styles.legend}>
        <span><i style={{ background: 'var(--accent)' }} />Gym</span>
        <span><i style={{ background: CARDIO }} />Cardio</span>
        <span><i style={{ background: STEPS }} />10k steps</span>
      </div>

    </>
  )

  const hasDetail = gymList.length > 0 || daySessions.length > 0 || dayStepsHit
  const detail = selected && hasDetail && (
    <div className="stack gap-8" style={{ marginTop: 10 }}>
      {gymList.map(w => (
        <div key={w.id} className={styles.detail}>
          <div className={styles.dicon}><DumbbellIcon width={18} height={18} /></div>
          <div className="stack gap-2 flex-1 min-w-0">
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)' }}>{w.type}</span>
            <span className="t-micro" style={{ color: 'var(--text-low)' }}>
              {[fmtClock(w.startedAt) || null, w.totalVolume > 0 ? `${w.totalVolume.toLocaleString()}kg` : null, w.duration ? `${w.duration}min` : null, w.exercises.length ? `${w.exercises.length} exercises` : null].filter(Boolean).join(' · ')}
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>+{w.xpEarned}</span>
        </div>
      ))}
      {daySessions.map((s, i) => {
        const Icon = cardioIcon(s.type)
        return (
          <div key={`c${i}`} className={styles.detail}>
            <div className={styles.dicon} style={{ color: CARDIO }}><Icon width={18} height={18} /></div>
            <div className="stack gap-2 flex-1 min-w-0">
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)' }}>{cardioLabel(s)}</span>
              <span className="t-micro" style={{ color: 'var(--text-low)' }}>{cardioSub(s)}</span>
            </div>
          </div>
        )
      })}
      {dayStepsHit && (
        <div className={styles.detail}>
          <div className={styles.dicon} style={{ color: STEPS }}><FootprintIcon width={18} height={18} /></div>
          <div className="stack gap-2 flex-1 min-w-0">
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)' }}>10k+ steps</span>
            <span className="t-micro" style={{ color: 'var(--text-low)' }}>{dayHealth?.steps != null ? `${dayHealth.steps.toLocaleString()} steps` : ''}</span>
          </div>
        </div>
      )}
    </div>
  )

  if (bare) return <>{inner}{detail}</>

  return (
    <section>
      <Eyebrow>Training Calendar</Eyebrow>
      <div className="card" style={{ padding: 16 }}>{inner}</div>
      {detail}
    </section>
  )
}
