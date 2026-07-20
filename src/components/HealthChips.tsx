import type { HealthToday } from '../api/sync'
import { FootprintIcon, HeartIcon, ScaleIcon, LeafIcon, StreakIcon } from '../assets/icons'
import { fmtSleepHM } from '../utils/dates'
import styles from './HealthChips.module.css'

export const HealthChips = ({ data }: { data: HealthToday }) => {
  const chips = [
    { icon: FootprintIcon, value: data.steps != null ? data.steps.toLocaleString() : '—', label: 'steps' },
    { icon: LeafIcon, value: fmtSleepHM(data.sleepHours), label: 'sleep' },
    { icon: HeartIcon, value: data.restingHeartRate ?? '—', label: 'resting bpm' },
    { icon: StreakIcon, value: data.hrv ?? '—', label: 'hrv ms' },
    { icon: ScaleIcon, value: data.weightKg != null ? `${data.weightKg}` : '—', label: 'kg' },
  ]
  return (
    <div className={styles.row}>
      {chips.map((c, i) => (
        <div key={i} className={styles.chip}>
          <c.icon width={16} height={16} style={{ color: 'var(--accent)' }} />
          <div className="stack">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-hi)', lineHeight: 1 }}>{c.value}</span>
            <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{c.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
