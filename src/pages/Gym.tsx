import { PageHeader } from '../components/ui/PageHeader'
import { Eyebrow } from '../components/ui/Eyebrow'
import { StatTile } from '../components/StatTile'
import { MiniSpark } from '../components/MiniSpark'
import { WorkoutCalendar } from '../components/WorkoutCalendar'
import { WeeklySplit } from '../components/WeeklySplit'
import { TodayTraining } from '../components/TodayTraining'
import { useSettings } from '../hooks/useSettings'
import { useHevyStats } from '../hooks/useHevyStats'
import { DumbbellIcon, RefreshIcon, TrophyIcon, ScaleIcon } from '../assets/icons'
import EmptyStats from '../assets/illustrations/empty-stats.svg?react'
import styles from './Gym.module.css'

const trendDir = (t: number[]): 'up' | 'down' | 'flat' => {
  if (t.length < 2) return 'flat'
  const d = t[t.length - 1] - t[0]
  return d > 0.5 ? 'up' : d < -0.5 ? 'down' : 'flat'
}

export const Gym = () => {
  const { data: settings } = useSettings()
  const connected = !!settings?.hevyApiKey
  const { data: stats, isLoading } = useHevyStats(7, connected)

  const tonnes = stats ? stats.totalVolume / 1000 : 0
  const cars = tonnes / 1.5 // ~1.5t per car

  return (
    <div className="page">
      <PageHeader title="Gym" subtitle="Your training, analyzed" />

      <div className="px stack gap-24">
        {!connected && (
          <div className="empty-state">
            <EmptyStats width={180} height={180} />
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-mid)' }}>No Hevy connected</p>
            <p className="t-meta">Add your API key in Settings, then sync to see your lifting breakdown.</p>
          </div>
        )}

        {connected && isLoading && (
          <div className="stack gap-12">
            <div className="skeleton-row" style={{ height: 90 }} />
            <div className="skeleton-row" style={{ height: 200 }} />
          </div>
        )}

        {connected && <TodayTraining />}
        {connected && <WeeklySplit enabled={connected} />}
        {connected && <WorkoutCalendar enabled={connected} />}

        {connected && stats && stats.totalSessions === 0 && (
          <div className="empty-state">
            <EmptyStats width={160} height={160} />
            <p className="t-meta">No sessions in the last {stats.days} days. Go lift.</p>
          </div>
        )}

        {connected && stats && stats.totalSessions > 0 && (
          <>
            {/* overview */}
            <section>
              <Eyebrow right={`last ${stats.days}d`}>Overview</Eyebrow>
              <div className={styles.grid}>
                <StatTile icon={DumbbellIcon} value={stats.totalSessions} label="Sessions" />
                <StatTile icon={ScaleIcon} value={stats.totalVolume} suffix="kg" label="Volume" />
                <StatTile icon={RefreshIcon} value={stats.totalSets} label="Total Sets" />
                <StatTile icon={TrophyIcon} value={stats.heaviest.weight} suffix="kg" label="Heaviest Lift" />
              </div>
              <p className={styles.fun}>
                You moved <b>{Math.round(stats.totalVolume).toLocaleString()} kg</b> — that's{' '}
                <b>{cars < 1 ? cars.toFixed(1) : Math.round(cars)}</b> cars lifted off the ground. Heaviest single: <b>{stats.heaviest.title}</b> at {stats.heaviest.weight}kg.
              </p>
            </section>

            {/* most trained */}
            <section>
              <Eyebrow right={`${stats.exercises.length} exercises`}>Most Trained</Eyebrow>
              <div className="stack gap-8">
                {stats.exercises.slice(0, 12).map(e => {
                  const dir = trendDir(e.trend)
                  const atPR = e.currentWeight >= e.maxWeight && e.currentWeight > 0
                  return (
                    <div key={e.title} className={styles.exRow}>
                      <div className={styles.freq}>{e.sessions}<span>×</span></div>
                      <div className="stack gap-3 flex-1 min-w-0">
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                        <span className="t-micro" style={{ color: 'var(--text-low)' }}>
                          max {e.maxWeight}kg · last {e.currentWeight}kg
                        </span>
                      </div>
                      <MiniSpark values={e.trend} color={dir === 'down' ? 'var(--danger)' : 'var(--accent)'} />
                      <div className="stack" style={{ alignItems: 'flex-end', width: 62 }}>
                        <div className="row gap-3" style={{ alignItems: 'baseline' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: atPR ? 'var(--accent)' : 'var(--text-hi)' }}>{e.currentWeight}</span>
                          <span className="t-micro" style={{ color: 'var(--text-low)' }}>kg</span>
                        </div>
                        <span className="t-micro" style={{ color: dir === 'up' ? 'var(--accent)' : dir === 'down' ? 'var(--danger)' : 'var(--text-low)' }}>
                          {dir === 'up' ? '▲ up' : dir === 'down' ? '▼ down' : '— hold'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
