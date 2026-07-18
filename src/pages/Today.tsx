import { useState, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useLogs, useDeleteLog, logsKey } from '../hooks/useLogs'
import { useStreak } from '../hooks/useStreak'
import { useTargets } from '../hooks/useSettings'
import { MacroBar } from '../components/MacroBar'
import { RingProgress } from '../components/RingProgress'
import { FAB } from '../components/FAB'
import { SettingsModal } from '../components/SettingsModal'
import { useToast } from '../components/Toast'
import { Card } from '../components/ui/Card'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MetricNumber } from '../components/ui/MetricNumber'
import { SettingsIcon, MoreIcon, TrashIcon, StreakIcon, ChevronRightIcon, MealsIcon } from '../assets/icons'
import { sumMacros } from '../utils/macros'
import { today, formatDate } from '../utils/dates'
import { getLogs } from '../api/logs'
import { useTodayStore } from '../store/todayStore'
import LogoHeader from '../assets/brand/logo-header.svg?react'
import EmptyLog from '../assets/illustrations/empty-log.svg?react'
import styles from './Today.module.css'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getWeekDays(baseDate: Date): Date[] {
  const dow = baseDate.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() + mondayOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export const Today = () => {
  const navigate = useNavigate()
  const { selectedDate, setSelectedDate } = useTodayStore()
  const [weekAnchor, setWeekAnchor] = useState(() => new Date(selectedDate))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [openRowId, setOpenRowId]       = useState<string | null>(null)
  const [deletingId, setDeletingId]     = useState<string | null>(null)

  const { data: logs = [], isLoading, isError } = useLogs(selectedDate)
  const deleteLog = useDeleteLog(selectedDate)
  const { data: streak = 0 } = useStreak()
  const targets = useTargets()
  const { showToast } = useToast()

  const weekDays = useMemo(() => getWeekDays(weekAnchor), [weekAnchor])

  const todayStr = today()
  const dateLabel = selectedDate === todayStr
    ? "Today's Log"
    : new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  // ±10 day limits (both normalized to midnight for clean comparisons)
  const maxPast = useMemo(() => {
    const d = new Date(todayStr)
    d.setDate(d.getDate() - 10)
    d.setHours(0, 0, 0, 0)
    return d
  }, [todayStr])

  const maxFuture = useMemo(() => {
    const d = new Date(todayStr)
    d.setDate(d.getDate() + 10)
    d.setHours(0, 0, 0, 0)
    return d
  }, [todayStr])

  // One query per visible day — same queryKey/queryFn as useLogs, so cache is shared.
  // The selected day's data is already in cache; other days are fetched in parallel.
  const weekQueries = useQueries({
    queries: weekDays.map(d => ({
      queryKey: logsKey(formatDate(d)),
      queryFn:  () => getLogs(formatDate(d)),
      staleTime: 60_000,
    })),
  })

  const historyByDate = useMemo(() => {
    const map = new Map<string, { calories: number; protein: number }>()
    weekDays.forEach((d, i) => {
      const entries = weekQueries[i]?.data
      if (entries && entries.length > 0) {
        const m = sumMacros(entries)
        map.set(formatDate(d), { calories: m.calories, protein: m.protein })
      }
    })
    return map
  }, [weekQueries, weekDays])

  // Navigation guards: allow going back/forward as long as the resulting week
  // contains at least one enabled day (i.e., not the entire week is past the limit)
  const canGoBack = useMemo(() => {
    const d = new Date(weekDays[0])
    d.setHours(0, 0, 0, 0)
    return d > maxPast
  }, [weekDays, maxPast])

  const canGoForward = useMemo(() => {
    const d = new Date(weekDays[6])
    d.setHours(0, 0, 0, 0)
    return d < maxFuture
  }, [weekDays, maxFuture])

  const totals    = sumMacros(logs)
  const remaining = targets.calories - totals.calories
  const progress  = Math.min(totals.calories / targets.calories, 1)
  const isOver    = remaining < 0

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteLog.mutateAsync(id)
      showToast('Entry removed')
    } catch {
      showToast('Failed to delete', 'error')
    } finally {
      setDeletingId(null)
      setOpenRowId(null)
    }
  }

  return (
    <div className={`page ${styles.page}`}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <LogoHeader width={120} height={24} />
        <div className="row gap-10">
          <span className="t-meta">{dateLabel}</span>
          <button className="btn-icon" onClick={() => navigate('/foods')} aria-label="Meals">
            <MealsIcon width={20} height={20} />
          </button>
          <button className="btn-icon" onClick={() => setSettingsOpen(true)} aria-label="Settings">
            <SettingsIcon width={20} height={20} />
          </button>
        </div>
      </header>

      {/* ── Week strip ── */}
      <div className={styles.weekStripWrap}>
        <button
          className={`btn-icon ${styles.chevron}`}
          disabled={!canGoBack}
          onClick={() => setWeekAnchor(prev => { const n = new Date(prev); n.setDate(n.getDate() - 7); return n })}
          aria-label="Previous week"
        >
          <ChevronRightIcon width={18} height={18} style={{ transform: 'rotate(180deg)' }} />
        </button>

        <div className={styles.weekStrip}>
          {weekDays.map((d, i) => {
            const ds = formatDate(d)
            const dNorm = new Date(d); dNorm.setHours(0, 0, 0, 0)
            const isToday    = ds === todayStr
            const isSelected = ds === selectedDate
            const isClickable = dNorm >= maxPast && dNorm <= maxFuture

            const dayData = historyByDate.get(ds)
            const hasLog  = !!dayData
            const overCal = hasLog && dayData.calories > targets.calories

            // Dot: every logged day gets one. Color = protein level.
            let dotColor = ''
            if (hasLog) {
              if (dayData.protein <= targets.protein * 0.5)       dotColor = 'var(--danger)'
              else if (dayData.protein <= targets.protein * 0.75) dotColor = '#E6994C'
              else                                                 dotColor = 'var(--accent)'
            }

            const tileClasses = [
              styles.dayTile,
              isSelected                          ? styles.dayActive      : '',
              !isSelected && overCal              ? styles.dayLoggedOver  : '',
              !isSelected && hasLog && !overCal   ? styles.dayLoggedGood  : '',
              isToday                             ? styles.dayIsToday     : '',
              !isClickable                        ? styles.dayDisabled    : '',
            ].filter(Boolean).join(' ')

            return (
              <button
                key={i}
                className={tileClasses}
                disabled={!isClickable}
                onClick={() => setSelectedDate(ds)}
                aria-label={`${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}${hasLog ? ', logged' : ''}`}
                aria-pressed={isSelected}
              >
                <span className={styles.dayLetter}>{DAY_LETTERS[i]}</span>
                <span className={styles.dayNumRow}>
                  <span className={styles.dayNum}>{d.getDate()}</span>
                  {dotColor && <span className={styles.dayDot} style={{ background: dotColor }} />}
                </span>
              </button>
            )
          })}
        </div>

        <button
          className={`btn-icon ${styles.chevron}`}
          disabled={!canGoForward}
          onClick={() => setWeekAnchor(prev => { const n = new Date(prev); n.setDate(n.getDate() + 7); return n })}
          aria-label="Next week"
        >
          <ChevronRightIcon width={18} height={18} />
        </button>
      </div>

      {/* ── Calorie hero card ── */}
      <div className="px">
        {isLoading ? (
          <Card padding={24} style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="skeleton-row" style={{ width: 220, height: 220, borderRadius: '50%' }} />
            <div className="row gap-16" style={{ width: '100%' }}>
              <div className="skeleton-row flex-1" style={{ height: 40 }} />
              <div className="skeleton-row flex-1" style={{ height: 40 }} />
              <div className="skeleton-row flex-1" style={{ height: 40 }} />
            </div>
          </Card>
        ) : (
          <Card padding={24} style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <RingProgress
              progress={progress}
              size={220}
              strokeWidth={8}
              color={isOver ? 'var(--danger)' : 'var(--accent)'}
            >
              <div className="stack gap-4" style={{ alignItems: 'center' }}>
                <MetricNumber size="xl" color={isOver ? 'var(--danger)' : 'var(--accent)'}>
                  {Math.abs(Math.round(remaining))}
                </MetricNumber>
                <span className="t-eyebrow">{isOver ? 'Over Target' : 'Kcal Left'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-low)' }}>
                  {Math.round(totals.calories)} / {targets.calories} kcal
                </span>
              </div>
            </RingProgress>

            <div className="row gap-16" style={{ width: '100%' }}>
              <MacroBar label="Protein" current={totals.protein} target={targets.protein} color="var(--protein)" />
              <MacroBar label="Carbs"   current={totals.carbs}   target={targets.carbs}   color="var(--carbs)"   />
              <MacroBar label="Fat"     current={totals.fat}     target={targets.fat}     color="var(--fat)"     />
            </div>
          </Card>
        )}
      </div>

      {/* ── Streak tile ── */}
      {streak > 0 && (
        <div className="px" style={{ marginTop: 10 }}>
          <Card padding={12}>
            <div className="row gap-8">
              <StreakIcon width={18} height={18} style={{ color: 'var(--accent)' }} />
              <MetricNumber size="sm" color="var(--text-hi)">{streak}</MetricNumber>
              <span className="t-meta">day streak</span>
            </div>
          </Card>
        </div>
      )}

      {/* ── Daily log ── */}
      <section className={styles.logSection}>
        <Eyebrow right={logs.length > 0 ? `${logs.length} items · ${Math.round(totals.calories)} kcal` : undefined}>
          {selectedDate === todayStr ? "Today's Log" : "Daily Log"}
        </Eyebrow>

        {isLoading && (
          <div className="stack gap-8">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-row" style={{ height: 64 }} />)}
          </div>
        )}

        {isError && <p style={{ color: 'var(--danger)', fontSize: 14, padding: '16px 0' }}>Failed to load entries.</p>}

        {!isLoading && !isError && logs.length === 0 && (
          <div className="empty-state">
            <EmptyLog width={200} height={200} />
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-mid)' }}>No fuel logged yet</p>
            <p className="t-meta">Tap + to log your first meal</p>
          </div>
        )}

        {!isLoading && !isError && logs.length > 0 && (
          <div className="stack gap-8">
            {logs.map(entry => (
              <Card key={entry.id} padding={0} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 14px', minHeight: 64 }}>
                {/* Left tile */}
                <div style={{ width: 40, height: 40, background: 'var(--bg-2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <RingProgress progress={entry.calories / targets.calories} size={32} strokeWidth={3}>
                    <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--text-low)' }}>
                      {Math.round(Math.min(entry.calories / targets.calories, 1) * 100)}
                    </span>
                  </RingProgress>
                </div>

                {/* Info */}
                <div className="stack gap-3 flex-1 min-w-0">
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.foodName}
                  </span>
                  <span className="t-micro" style={{ color: 'var(--text-low)' }}>
                    ×{entry.quantity} · {Math.round(entry.calories)} kcal · {Math.round(entry.protein)}g P
                    {entry.note && <em style={{ fontStyle: 'normal', color: 'var(--text-mid)' }}> · {entry.note}</em>}
                  </span>
                </div>

                {/* Actions */}
                {openRowId === entry.id ? (
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                  >
                    <TrashIcon width={14} height={14} />
                  </button>
                ) : (
                  <button className="btn-icon" onClick={() => setOpenRowId(entry.id)}>
                    <MoreIcon width={16} height={16} />
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <FAB onClick={() => navigate(`/log?date=${selectedDate}`)} label="Log food" />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
