import { PageHeader } from '../components/ui/PageHeader'
import { Eyebrow } from '../components/ui/Eyebrow'
import { StatTile } from '../components/StatTile'
import { WorkoutCalendar } from '../components/WorkoutCalendar'
import { WeeklySplit } from '../components/WeeklySplit'
import { TodayTraining } from '../components/TodayTraining'
import { useSettings } from '../hooks/useSettings'
import { useHevyStats } from '../hooks/useHevyStats'
import { DumbbellIcon, RefreshIcon, TrophyIcon, ScaleIcon } from '../assets/icons'
import EmptyStats from '../assets/illustrations/empty-stats.svg?react'
import styles from './Gym.module.css'

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
        {connected && (
          <section>
            <Eyebrow>Training</Eyebrow>
            <div className="card" style={{ padding: 16 }}>
              <WeeklySplit enabled={connected} bare />
              <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />
              <WorkoutCalendar enabled={connected} bare />
            </div>
          </section>
        )}

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
          </>
        )}
      </div>
    </div>
  )
}
