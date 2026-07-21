import { useState, useMemo, useRef } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useLogs, useDeleteLog, useUpdateLog, logsKey } from '../hooks/useLogs'
import { useStreak } from '../hooks/useStreak'
import { useTargets, useSettings } from '../hooks/useSettings'
import { useHealthToday } from '../hooks/useHealthToday'
import { MacroBar } from '../components/MacroBar'
import { RingProgress } from '../components/RingProgress'
import { FAB } from '../components/FAB'
import { SettingsModal } from '../components/SettingsModal'
import { BottomSheet } from '../components/BottomSheet'
import { useToast } from '../components/Toast'
import { Card } from '../components/ui/Card'
import { Eyebrow } from '../components/ui/Eyebrow'
import { MetricNumber } from '../components/ui/MetricNumber'
import { SettingsIcon, MoreIcon, TrashIcon, EditIcon, StreakIcon, ChevronRightIcon, MealsIcon } from '../assets/icons'
import { sumMacros, eatBack } from '../utils/macros'
import { today, formatDate } from '../utils/dates'
import { getLogs, type LogEntry, type Meal } from '../api/logs'
import { useTodayStore } from '../store/todayStore'
import LogoHeader from '../assets/brand/logo-header.svg?react'
import EmptyLog from '../assets/illustrations/empty-log.svg?react'
import styles from './Today.module.css'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'other'] as const
const MEAL_LABEL: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', other: 'Other' }

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
  const [editing, setEditing]           = useState<LogEntry | null>(null)
  const [editQty, setEditQty]           = useState('1')
  const [editMeal, setEditMeal]         = useState<Meal>('other')
  const [editNote, setEditNote]         = useState('')
  const [saving, setSaving]             = useState(false)

  const { data: logs = [], isLoading, isError } = useLogs(selectedDate)
  const deleteLog = useDeleteLog(selectedDate)
  const updateLog = useUpdateLog(selectedDate)
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

  const goWeek = (delta: number) =>
    setWeekAnchor(prev => { const n = new Date(prev); n.setDate(n.getDate() + delta * 7); return n })

  // Swipe the week strip to change weeks. stopPropagation so the app-level
  // tab-switch swipe (SwipeTabs) never fires from a strip gesture.
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const onStripTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    swipe.current = { x: t.clientX, y: t.clientY }
    e.stopPropagation()
  }
  const onStripTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation()
    const s = swipe.current; swipe.current = null
    if (!s) return
    const t = e.changedTouches[0]
    const dx = t.clientX - s.x, dy = t.clientY - s.y
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0 && canGoForward) goWeek(1)
    else if (dx > 0 && canGoBack) goWeek(-1)
  }

  const { data: settings } = useSettings()
  const dayHealth = useHealthToday(!!settings?.googleHealthConnected, selectedDate).data
  const activityBonus = eatBack(dayHealth?.caloriesBurned) // 50% of burned, eaten back
  const budget = targets.calories + activityBonus

  const totals    = sumMacros(logs)
  const remaining = budget - totals.calories
  const progress  = Math.min(totals.calories / budget, 1)
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

  const openEdit = (entry: LogEntry) => {
    setEditing(entry)
    setEditQty(String(entry.quantity))
    setEditMeal((entry.meal || 'other') as Meal)
    setEditNote(entry.note ?? '')
    setOpenRowId(null)
  }

  const handleSave = async () => {
    if (!editing) return
    const qty = parseFloat(editQty)
    if (!qty || qty <= 0) { showToast('Enter a valid quantity', 'error'); return }
    setSaving(true)
    try {
      await updateLog.mutateAsync({ id: editing.id, patch: { quantity: qty, meal: editMeal, note: editNote.trim() } })
      showToast('Entry updated')
      setEditing(null)
    } catch {
      showToast('Failed to update', 'error')
    } finally {
      setSaving(false)
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

      {/* ── Week strip (swipe to change weeks) ── */}
      <div
        className={styles.weekStripWrap}
        onTouchStart={onStripTouchStart}
        onTouchEnd={onStripTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <button
          className={`btn-icon ${styles.chevron}`}
          disabled={!canGoBack}
          onClick={() => goWeek(-1)}
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
          onClick={() => goWeek(1)}
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
                <span className="t-eyebrow">{isOver ? 'Over Budget' : 'Kcal Left'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-low)' }}>
                  {Math.round(totals.calories)} / {budget} kcal
                </span>
                {activityBonus > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim, rgba(200,241,53,0.12))', padding: '2px 8px', borderRadius: 'var(--r-pill)' }}>
                    +{activityBonus} from activity
                  </span>
                )}
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
          <div className="stack gap-16">
            {MEAL_ORDER.map(meal => {
              const items = logs.filter(e => (e.meal || 'other') === meal)
              if (items.length === 0) return null
              const kcal = Math.round(items.reduce((s, e) => s + e.calories, 0))
              return (
                <div key={meal} className="stack gap-8">
                  <div className="between" style={{ padding: '0 2px' }}>
                    <span className="t-eyebrow">{MEAL_LABEL[meal]}</span>
                    <span className="t-micro" style={{ color: 'var(--text-low)', fontFamily: 'var(--font-mono)' }}>{kcal} kcal</span>
                  </div>
                  {items.map(entry => (
                    <Card key={entry.id} padding={0} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 14px', minHeight: 64 }}>
                      <div style={{ width: 40, height: 40, background: 'var(--bg-2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <RingProgress progress={entry.calories / targets.calories} size={32} strokeWidth={3}>
                          <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', color: 'var(--text-low)' }}>
                            {Math.round(Math.min(entry.calories / targets.calories, 1) * 100)}
                          </span>
                        </RingProgress>
                      </div>
                      <div className="stack gap-3 flex-1 min-w-0">
                        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.foodName}
                        </span>
                        <span className="t-micro" style={{ color: 'var(--text-low)' }}>
                          ×{entry.quantity} · {Math.round(entry.calories)} kcal · {Math.round(entry.protein)}g P
                          {entry.note && <em style={{ fontStyle: 'normal', color: 'var(--text-mid)' }}> · {entry.note}</em>}
                        </span>
                      </div>
                      {openRowId === entry.id ? (
                        <div className="row gap-6" style={{ flexShrink: 0 }}>
                          <button className="btn-icon" onClick={() => openEdit(entry)} aria-label="Edit">
                            <EditIcon width={15} height={15} />
                          </button>
                          <button className="btn-danger" onClick={() => handleDelete(entry.id)} disabled={deletingId === entry.id} aria-label="Delete">
                            <TrashIcon width={14} height={14} />
                          </button>
                        </div>
                      ) : (
                        <button className="btn-icon" onClick={() => setOpenRowId(entry.id)}>
                          <MoreIcon width={16} height={16} />
                        </button>
                      )}
                    </Card>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <FAB onClick={() => navigate(`/log?date=${selectedDate}`)} label="Log food" />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <BottomSheet open={!!editing} onClose={() => setEditing(null)} title={`Edit · ${editing?.foodName ?? ''}`}>
        {editing && (
          <div className="stack gap-16" style={{ paddingBottom: 8 }}>
            <div className="stack gap-6">
              <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quantity (×)</span>
              <input
                type="number" inputMode="decimal" min="0.1" step="0.1" value={editQty}
                onChange={e => setEditQty(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--text-hi)', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-inner)' }}
              />
            </div>

            <div className="stack gap-6">
              <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Meal</span>
              <div className="row gap-6">
                {MEAL_ORDER.map(m => (
                  <button key={m} onClick={() => setEditMeal(m)}
                    style={{ flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600, borderRadius: 'var(--r-inner)', textTransform: 'capitalize',
                      background: editMeal === m ? 'var(--accent)' : 'var(--bg-2)',
                      color: editMeal === m ? 'var(--bg-0)' : 'var(--text-mid)',
                      border: `1px solid ${editMeal === m ? 'var(--accent)' : 'var(--line)'}` }}>
                    {MEAL_LABEL[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="stack gap-6">
              <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Note</span>
              <input
                type="text" value={editNote} placeholder="optional"
                onChange={e => setEditNote(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', fontSize: 15, color: 'var(--text-hi)', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-inner)' }}
              />
            </div>

            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%', height: 48 }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
