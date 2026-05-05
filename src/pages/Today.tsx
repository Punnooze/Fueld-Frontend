import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useLogs, useDeleteLog } from '../hooks/useLogs'
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
import { SettingsIcon, MoreIcon, TrashIcon, StreakIcon } from '../assets/icons'
import { sumMacros } from '../utils/macros'
import { today, formatDate } from '../utils/dates'
import { getLogHistory } from '../api/logs'
import LogoHeader from '../assets/brand/logo-header.svg?react'
import EmptyLog from '../assets/illustrations/empty-log.svg?react'
import styles from './Today.module.css'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function getWeekDays(): Date[] {
  const now = new Date()
  const dow = now.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export const Today = () => {
  const date = today()
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [openRowId, setOpenRowId]       = useState<string | null>(null)
  const [deletingId, setDeletingId]     = useState<string | null>(null)

  const { data: logs = [], isLoading, isError } = useLogs(date)
  const deleteLog = useDeleteLog(date)
  const { data: streak = 0 } = useStreak()
  const targets = useTargets()
  const { showToast } = useToast()

  const weekDays = getWeekDays()
  const todayStr = formatDate(new Date())
  const weekStart = formatDate(weekDays[0])
  const weekEnd   = formatDate(weekDays[6])

  const { data: weekHistory = [] } = useQuery({
    queryKey: ['logs', 'history', weekStart, weekEnd],
    queryFn: () => getLogHistory(weekStart, weekEnd),
  })
  const daysWithLogs = new Set(weekHistory.map(e => e.date))

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

  const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className={`page ${styles.page}`}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <LogoHeader width={120} height={24} />
        <div className="row gap-10">
          <span className="t-meta">{dateLabel}</span>
          <button className="btn-icon" onClick={() => setSettingsOpen(true)} aria-label="Settings">
            <SettingsIcon width={20} height={20} />
          </button>
        </div>
      </header>

      {/* ── Week strip ── */}
      <div className={styles.weekStrip}>
        {weekDays.map((d, i) => {
          const ds      = formatDate(d)
          const isToday = ds === todayStr
          const isPast  = d < new Date() && !isToday
          const hasLog  = daysWithLogs.has(ds)
          return (
            <div key={i} className={`${styles.dayTile} ${isToday ? styles.dayToday : ''}`}>
              <span className={styles.dayLetter}>{DAY_LETTERS[i]}</span>
              <span className={styles.dayNum}>{d.getDate()}</span>
              {isPast && hasLog && <span className={styles.dayDot} />}
            </div>
          )
        })}
      </div>

      {/* ── Calorie hero card ── */}
      <div className="px">
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

      {/* ── Today's log ── */}
      <section className={styles.logSection}>
        <Eyebrow right={logs.length > 0 ? `${logs.length} items · ${Math.round(totals.calories)} kcal` : undefined}>
          Today's Log
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

      <FAB onClick={() => navigate('/log')} label="Log food" />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
