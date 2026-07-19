import type { HealthToday } from '../api/sync'
import { HeartIcon, StreakIcon, ScaleIcon, FlameIcon } from '../assets/icons'

export const HealthStats = ({ data, accent = 'var(--accent)' }: { data: HealthToday; accent?: string }) => {
  const stats = [
    { icon: HeartIcon, value: data.restingHeartRate ?? '—', label: 'resting bpm' },
    { icon: StreakIcon, value: data.hrv ?? '—', label: 'hrv ms' },
    { icon: FlameIcon, value: data.cardioMinutes != null ? data.cardioMinutes : '—', label: 'cardio min' },
    { icon: ScaleIcon, value: data.weightKg != null ? data.weightKg : '—', label: 'weight kg' },
  ]
  return (
    <div className="card" style={{ padding: '16px 14px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${accent}2e` }}>
      {stats.map((s, i) => (
        <div key={i} className="stack gap-3" style={{ alignItems: 'center', flex: 1 }}>
          <s.icon width={15} height={15} style={{ color: 'var(--text-mid)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--text-hi)' }}>{s.value}</span>
          <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}
