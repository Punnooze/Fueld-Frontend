import type { Records } from '../api/character'
import { TrophyIcon, DumbbellIcon, ForkIcon, FlameIcon, StreakIcon, ScaleIcon } from '../assets/icons'
import styles from './RecordsGrid.module.css'

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '')

export const RecordsGrid = ({ records, accent = 'var(--accent)' }: { records: Records; accent?: string }) => {
  const r = records
  const tiles = [
    { icon: TrophyIcon, value: r.heaviestLift ? `${r.heaviestLift.weight}kg` : '—', label: 'Heaviest Lift', sub: r.heaviestLift?.title ?? '' },
    { icon: DumbbellIcon, value: r.biggestSession ? `${(r.biggestSession.volume / 1000).toFixed(1)}t` : '—', label: 'Biggest Session', sub: r.biggestSession?.type ?? '' },
    { icon: ForkIcon, value: r.bestProteinDay ? `${r.bestProteinDay.grams}g` : '—', label: 'Best Protein Day', sub: fmtDate(r.bestProteinDay?.date) },
    { icon: FlameIcon, value: r.bestCardio ? `${r.bestCardio.azm}` : '—', label: 'Best Cardio (AZM)', sub: fmtDate(r.bestCardio?.date) },
    { icon: StreakIcon, value: `${r.longestStreak}`, label: 'Longest Streak', sub: 'days' },
    { icon: DumbbellIcon, value: `${r.bestWeek}`, label: 'Best Week', sub: 'sessions' },
    { icon: DumbbellIcon, value: `${r.totalSessions}`, label: 'Total Sessions', sub: 'all time' },
    { icon: ScaleIcon, value: `${(r.totalVolume / 1000).toFixed(1)}t`, label: 'Total Volume', sub: 'all time' },
  ]
  return (
    <div className={styles.grid}>
      {tiles.map((t, i) => (
        <div key={i} className={styles.tile}>
          <t.icon width={15} height={15} style={{ color: accent, opacity: 0.85 }} />
          <span style={{ fontFamily: 'var(--font-mega)', fontSize: 28, fontWeight: 600, color: 'var(--text-hi)', lineHeight: 0.95, marginTop: 6 }}>{t.value}</span>
          <span className="t-micro" style={{ color: 'var(--text-mid)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>{t.label}</span>
          {t.sub && <span className="t-micro" style={{ color: 'var(--text-low)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{t.sub}</span>}
        </div>
      ))}
    </div>
  )
}
