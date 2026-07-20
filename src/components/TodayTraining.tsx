import { useNavigate } from 'react-router-dom'
import { useWorkoutsRange } from '../hooks/useWorkouts'
import { useHealthToday } from '../hooks/useHealthToday'
import { useSettings } from '../hooks/useSettings'
import { Eyebrow } from './ui/Eyebrow'
import { DumbbellIcon, FlameIcon, HeartIcon, FootprintIcon, ChevronRightIcon } from '../assets/icons'
import { today } from '../utils/dates'
import type { CardioSession } from '../api/sync'
import styles from './TodayTraining.module.css'

const cardioLabel = (s: CardioSession) =>
  s.name || (s.type ? s.type.charAt(0) + s.type.slice(1).toLowerCase() : 'Cardio')

const cardioIcon = (type = '') =>
  /WALK|RUN|HIK/.test(type) ? FootprintIcon : HeartIcon

const Metric = ({ value, unit, label }: { value: string | number | null | undefined; unit?: string; label: string }) => (
  <div className="stack gap-2" style={{ alignItems: 'center', flex: 1 }}>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-hi)' }}>
      {value ?? '—'}{value != null && unit ? <span style={{ fontSize: 11, color: 'var(--text-low)' }}>{unit}</span> : ''}
    </span>
    <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
  </div>
)

// ponytail: TEMP preview a date (e.g. '2026-07-19'); null = real today. REMOVE.
const PREVIEW_DATE: string | null = null

function useToday() {
  const t = PREVIEW_DATE ?? today()
  const { data: settings } = useSettings()
  const { data: workouts = [] } = useWorkoutsRange(t, t)
  const { data: health } = useHealthToday(!!settings?.googleHealthConnected, PREVIEW_DATE ?? undefined)
  return { workouts, health }
}

// Full section for the GYM tab
export const TodayTraining = () => {
  const { workouts, health } = useToday()
  const sessions = health?.cardioSessions ?? []
  // fallback to the old merged block if backend hasn't sent per-session data yet
  const cardioFallback = !sessions.length && health?.cardioMinutes ? health : null

  return (
    <section>
      <Eyebrow>Today's Training</Eyebrow>
      {workouts.length === 0 && !sessions.length && !cardioFallback ? (
        <div className="card" style={{ padding: 18, textAlign: 'center' }}>
          <p className="t-meta" style={{ color: 'var(--text-mid)' }}>Rest day — nothing logged yet.</p>
        </div>
      ) : (
        <div className="stack gap-8">
          {workouts.map(w => (
            <div key={w.id} className={styles.card}>
              <div className="row gap-8" style={{ marginBottom: 12 }}>
                <div className={styles.icon}><DumbbellIcon width={18} height={18} /></div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>{w.type}</span>
              </div>
              <div className="row">
                <Metric value={w.totalVolume > 0 ? w.totalVolume.toLocaleString() : null} unit="kg" label="Volume" />
                <Metric value={w.duration ?? null} unit="min" label="Duration" />
                {w.prs.length > 0 && <Metric value={w.prs.length} label="PRs" />}
              </div>
            </div>
          ))}
          {sessions.map((s, i) => {
            const Icon = cardioIcon(s.type)
            return (
              <div key={s.startTime ?? i} className={styles.card} style={{ borderColor: '#5A9EFF44' }}>
                <div className="row gap-8" style={{ marginBottom: 12 }}>
                  <div className={styles.icon} style={{ color: '#5A9EFF' }}><Icon width={18} height={18} /></div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>{cardioLabel(s)}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', rowGap: 12 }}>
                  {[
                    { v: s.durationMin, u: 'min', l: 'Duration' },
                    { v: s.activeZoneMinutes, u: 'min', l: 'Zone Min' },
                    { v: s.calories, u: 'kcal', l: 'Calories' },
                    { v: s.distanceKm, u: 'km', l: 'Distance' },
                    { v: s.avgHr, u: 'bpm', l: 'Avg HR' },
                  ].filter(m => m.v != null).map(m => (
                    <Metric key={m.l} value={m.v} unit={m.u} label={m.l} />
                  ))}
                </div>
              </div>
            )
          })}
          {cardioFallback && (
            <div className={styles.card} style={{ borderColor: '#5A9EFF44' }}>
              <div className="row gap-8" style={{ marginBottom: 12 }}>
                <div className={styles.icon} style={{ color: '#5A9EFF' }}><FlameIcon width={18} height={18} /></div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>Cardio</span>
              </div>
              <div className="row">
                <Metric value={cardioFallback.cardioMinutes ?? null} unit="min" label="Duration" />
                <Metric value={cardioFallback.activeZoneMinutes ?? null} label="Active Zone" />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// HOME → one compact row per activity (each cardio session split out), taps into GYM
type MiniRow = { key: string; Icon: typeof HeartIcon; name: string; sub: string }

export const TodayTrainingCard = () => {
  const navigate = useNavigate()
  const { workouts, health } = useToday()
  const sessions = health?.cardioSessions ?? []

  const rows: MiniRow[] = []
  workouts.forEach(w =>
    rows.push({
      key: w.id, Icon: DumbbellIcon, name: w.type,
      sub: [w.totalVolume > 0 ? `${(w.totalVolume / 1000).toFixed(1)}t` : null, w.duration ? `${w.duration}min` : null].filter(Boolean).join(' · '),
    }),
  )
  sessions.forEach((s, i) =>
    rows.push({
      key: s.startTime ?? `c${i}`, Icon: cardioIcon(s.type), name: cardioLabel(s),
      sub: [s.durationMin != null ? `${s.durationMin}min` : null, s.activeZoneMinutes != null ? `${s.activeZoneMinutes} zone` : null, s.calories != null ? `${s.calories}kcal` : null].filter(Boolean).join(' · '),
    }),
  )
  if (!rows.length && health?.cardioMinutes)
    rows.push({ key: 'cardio', Icon: HeartIcon, name: 'Cardio', sub: `${health.cardioMinutes}min` })

  const Row = ({ Icon, name, sub, active }: { Icon: typeof HeartIcon; name: string; sub?: string; active: boolean }) => (
    <button className={styles.mini} onClick={() => navigate('/gym')}>
      <div className={styles.icon} style={{ color: active ? 'var(--accent)' : 'var(--text-low)' }}>
        <Icon width={18} height={18} />
      </div>
      <div className="stack gap-2 flex-1 min-w-0" style={{ textAlign: 'left' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: active ? 'var(--text-hi)' : 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        {sub && <span className="t-micro" style={{ color: 'var(--text-low)' }}>{sub}</span>}
      </div>
      <ChevronRightIcon width={16} height={16} style={{ color: 'var(--text-low)' }} />
    </button>
  )

  if (!rows.length) return <Row Icon={DumbbellIcon} name="Rest day" active={false} />

  return (
    <div className="stack gap-8">
      {rows.map(r => <Row key={r.key} Icon={r.Icon} name={r.name} sub={r.sub} active />)}
    </div>
  )
}
