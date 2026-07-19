import { useNavigate } from 'react-router-dom'
import { useWorkoutsRange } from '../hooks/useWorkouts'
import { useHealthToday } from '../hooks/useHealthToday'
import { useSettings } from '../hooks/useSettings'
import { Eyebrow } from './ui/Eyebrow'
import { DumbbellIcon, FlameIcon, HeartIcon, ChevronRightIcon } from '../assets/icons'
import { today } from '../utils/dates'
import styles from './TodayTraining.module.css'

const Metric = ({ value, unit, label }: { value: string | number | null | undefined; unit?: string; label: string }) => (
  <div className="stack gap-2" style={{ alignItems: 'center', flex: 1 }}>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-hi)' }}>
      {value ?? '—'}{value != null && unit ? <span style={{ fontSize: 11, color: 'var(--text-low)' }}>{unit}</span> : ''}
    </span>
    <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
  </div>
)

// ponytail: TEMP preview a date (e.g. '2026-07-19'); null = real today. REMOVE.
const PREVIEW_DATE: string | null = '2026-07-18'

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
  const cardio = health?.cardioMinutes ? health : null

  return (
    <section>
      <Eyebrow>Today's Training</Eyebrow>
      {workouts.length === 0 && !cardio ? (
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
          {cardio && (
            <div className={styles.card} style={{ borderColor: '#5A9EFF44' }}>
              <div className="row gap-8" style={{ marginBottom: 12 }}>
                <div className={styles.icon} style={{ color: '#5A9EFF' }}><FlameIcon width={18} height={18} /></div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>Cardio</span>
              </div>
              <div className="row">
                <Metric value={cardio.cardioMinutes ?? null} unit="min" label="Duration" />
                <Metric value={cardio.activeZoneMinutes ?? null} label="Active Zone" />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// Minimal card for HOME → taps into GYM
export const TodayTrainingCard = () => {
  const navigate = useNavigate()
  const { workouts, health } = useToday()
  const gym = workouts[0]
  const parts: string[] = []
  if (gym) parts.push(`${gym.type}${gym.totalVolume > 0 ? ` · ${(gym.totalVolume / 1000).toFixed(1)}t` : ''}`)
  if (health?.cardioMinutes) parts.push(`Cardio ${health.cardioMinutes}min`)
  const summary = parts.length ? parts.join('  +  ') : 'Rest day'
  const active = parts.length > 0

  return (
    <button className={styles.mini} onClick={() => navigate('/gym')}>
      <div className={styles.icon} style={{ color: active ? 'var(--accent)' : 'var(--text-low)' }}>
        {health?.cardioMinutes && !gym ? <HeartIcon width={18} height={18} /> : <DumbbellIcon width={18} height={18} />}
      </div>
      <div className="stack gap-2 flex-1 min-w-0" style={{ textAlign: 'left' }}>
        <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.14em' }}>TODAY'S TRAINING</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: active ? 'var(--text-hi)' : 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
      </div>
      <ChevronRightIcon width={16} height={16} style={{ color: 'var(--text-low)' }} />
    </button>
  )
}
