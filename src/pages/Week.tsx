import { useWeekLogs } from '../hooks/useWeekLogs'
import { MacroBar } from '../components/MacroBar'
import { getWeekDates, formatDate, getDayLabel, formatShortDate, today } from '../utils/dates'
import { TARGETS, clamp } from '../utils/macros'
import type { WeekDay } from '../api/logs'
import styles from './Week.module.css'

export const Week = () => {
  const { data, isLoading, isError } = useWeekLogs()
  const weekData: WeekDay[] = Array.isArray(data) ? data : []
  const weekDates = getWeekDates()
  const todayStr = today()

  const dataMap = weekData.reduce<Record<string, WeekDay>>((acc, d) => {
    acc[d.date] = d
    return acc
  }, {})

  const avgCal = weekData.length
    ? Math.round(weekData.reduce((s, d) => s + d.calories, 0) / 7)
    : 0
  const avgProtein = weekData.length
    ? Math.round(weekData.reduce((s, d) => s + d.protein, 0) / 7)
    : 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>This Week</h1>
        <span className={styles.subtitle}>Mon – Sun</span>
      </header>

      {isLoading && (
        <div className={styles.skeleton}>
          {[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className={styles.skeletonRow} />)}
        </div>
      )}

      {isError && <p className={styles.error}>Failed to load week data.</p>}

      {!isLoading && !isError && (
        <>
          <div className={styles.list}>
            {weekDates.map(date => {
              const dateStr = formatDate(date)
              const dayData = dataMap[dateStr]
              const isToday = dateStr === todayStr
              const isFuture = dateStr > todayStr

              return (
                <div key={dateStr} className={`${styles.dayCard} ${isToday ? styles.today : ''}`}>
                  <div className={styles.dayHeader}>
                    <div className={styles.dayLeft}>
                      <span className={styles.dayName}>{getDayLabel(date)}</span>
                      <span className={styles.dayDate}>{formatShortDate(date)}</span>
                    </div>
                    <div className={styles.dayRight}>
                      {isToday && <span className={styles.todayBadge}>Today</span>}
                      {!isFuture && dayData && (
                        <span
                          className={styles.calCount}
                          style={{ color: dayData.calories > TARGETS.calories ? 'var(--danger)' : 'var(--text-soft)' }}
                        >
                          {Math.round(dayData.calories)} kcal
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.bars}>
                    <div className={styles.barRow}>
                      <span className={styles.barLabel}>Cal</span>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{
                            width: dayData ? `${clamp((dayData.calories / TARGETS.calories) * 100, 0, 100)}%` : '0%',
                            background: dayData && dayData.calories > TARGETS.calories ? 'var(--danger)' : 'var(--accent)',
                            opacity: isFuture ? 0.25 : 1,
                          }}
                        />
                      </div>
                      <span className={styles.barTarget}>{TARGETS.calories}</span>
                    </div>
                    <div className={styles.barRow}>
                      <span className={styles.barLabel}>Pro</span>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{
                            width: dayData ? `${clamp((dayData.protein / TARGETS.protein) * 100, 0, 100)}%` : '0%',
                            background: dayData && dayData.protein > TARGETS.protein ? 'var(--danger)' : 'var(--accent-2)',
                            opacity: isFuture ? 0.25 : 1,
                          }}
                        />
                      </div>
                      <span className={styles.barTarget}>{TARGETS.protein}g</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.totalsCard}>
            <h3 className={styles.totalsTitle}>Weekly Average</h3>
            <MacroBar label="Avg Calories" current={avgCal} target={TARGETS.calories} unit=" kcal" />
            <MacroBar label="Avg Protein" current={avgProtein} target={TARGETS.protein} />
          </div>
        </>
      )}
    </div>
  )
}
