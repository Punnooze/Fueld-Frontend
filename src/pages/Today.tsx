import { useState, useMemo, useRef, useEffect } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
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
import { SettingsIcon, MoreIcon, TrashIcon, EditIcon, StreakIcon, MealsIcon } from '../assets/icons'
import { sumMacros, eatBack } from '../utils/macros'
import { today, formatDate } from '../utils/dates'
import { getLogs, type LogEntry, type Meal } from '../api/logs'
import { getBurnedWeek } from '../api/sync'
import { useTodayStore } from '../store/todayStore'
import LogoHeader from '../assets/brand/logo-header.svg?react'
import EmptyLog from '../assets/illustrations/empty-log.svg?react'
import styles from './Today.module.css'

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'other'] as const
const MEAL_LABEL: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', other: 'Other' }


export const Today = () => {
  const navigate = useNavigate()
  const { selectedDate, setSelectedDate } = useTodayStore()
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

  const todayStr = today()
  const dateLabel = selectedDate === todayStr
    ? "Today's Log"
    : new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  // Date slider: today ±10 days, scroll-snapped one day at a time.
  const sliderDays = useMemo(() => {
    const base = new Date(todayStr); base.setHours(0, 0, 0, 0)
    return Array.from({ length: 21 }, (_, i) => {
      const d = new Date(base); d.setDate(base.getDate() + (i - 10)); return d
    })
  }, [todayStr])

  // One query per day in the window — shares cache with useLogs.
  // ponytail: 21 tiny cached queries; trim the window if it ever bites.
  const dayQueries = useQueries({
    queries: sliderDays.map(d => ({
      queryKey: logsKey(formatDate(d)),
      queryFn:  () => getLogs(formatDate(d)),
      staleTime: 60_000,
    })),
  })

  const historyByDate = useMemo(() => {
    const map = new Map<string, { calories: number; protein: number }>()
    sliderDays.forEach((d, i) => {
      const entries = dayQueries[i]?.data
      if (entries && entries.length > 0) {
        const m = sumMacros(entries)
        map.set(formatDate(d), { calories: m.calories, protein: m.protein })
      }
    })
    return map
  }, [dayQueries, sliderDays])

  // Center the selected day in the strip (on mount + whenever it changes).
  const stripRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    stripRef.current
      ?.querySelector(`[data-date="${selectedDate}"]`)
      ?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [selectedDate])

  // Wheel behaviour: whichever day settles under the fixed center indicator
  // becomes selected. tileFullWidth = 48px tile + 3px gap.
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const onStripScroll = () => {
    const el = stripRef.current
    if (!el) return
    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => {
      const i = Math.round(el.scrollLeft / 51)
      const clamped = Math.min(Math.max(i, 0), sliderDays.length - 1)
      const ds = formatDate(sliderDays[clamped])
      if (ds !== selectedDate) setSelectedDate(ds)
    }, 90)
  }

  const { data: settings, isLoading: settingsLoading } = useSettings()
  const healthQ = useHealthToday(!!settings?.googleHealthConnected, selectedDate)
  const dayHealth = healthQ.data
  const activityBonus = eatBack(dayHealth?.caloriesBurned) // 50% of burned, eaten back
  const budget = targets.calories + activityBonus

  // Burned kcal per day across the slider window → colour dots by NET calories
  // (intake vs target+eat-back), not raw intake.
  const winStart = formatDate(sliderDays[0])
  const winEnd = formatDate(sliderDays[sliderDays.length - 1])
  const { data: burnedWeek = {} } = useQuery({
    queryKey: ['burned-week', winStart, winEnd],
    queryFn: () => getBurnedWeek(winStart, winEnd),
    enabled: !!settings?.googleHealthConnected,
    staleTime: 60_000,
  })
  // Budget depends on burned calories — hold the ring skeleton until settings +
  // (if connected) burned data are in, so the number never renders then jumps.
  const budgetPending =
    settingsLoading || (!!settings?.googleHealthConnected && healthQ.isLoading)

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

      {/* ── Date slider (wheel: dates scroll under a fixed center indicator) ── */}
      <div className={styles.weekStripWrap}>
       <div className={styles.stripPill}>
        <div className={`${styles.centerIndicator} ${isOver ? styles.centerOver : ''}`} />
        <div
          className={styles.weekStrip}
          ref={stripRef}
          onScroll={onStripScroll}
          onTouchStart={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
        >
          {sliderDays.map(d => {
            const ds = formatDate(d)
            const isToday    = ds === todayStr
            const isSelected = ds === selectedDate

            const dayData = historyByDate.get(ds)
            const hasLog  = !!dayData
            // Net budget = target + eaten-back activity calories for that day
            const dayBudget = targets.calories + eatBack(burnedWeek[ds])
            const overCal = hasLog && dayData.calories > dayBudget

            // Dot: every logged day gets one. Over-budget = red (matches the ring),
            // otherwise color = protein level.
            let dotColor = ''
            if (hasLog) {
              if (overCal)                                        dotColor = 'var(--danger)'
              else if (dayData.protein <= targets.protein * 0.5)  dotColor = 'var(--danger)'
              else if (dayData.protein <= targets.protein * 0.75) dotColor = '#E6994C'
              else                                                 dotColor = 'var(--accent)'
            }

            const tileClasses = [
              styles.dayTile,
              isSelected && !overCal              ? styles.dayActive      : '',
              isSelected && overCal               ? styles.dayActiveOver  : '',
              !isSelected && overCal              ? styles.dayLoggedOver  : '',
              !isSelected && hasLog && !overCal   ? styles.dayLoggedGood  : '',
              isToday                             ? styles.dayIsToday     : '',
            ].filter(Boolean).join(' ')

            return (
              <button
                key={ds}
                data-date={ds}
                className={tileClasses}
                onClick={() => setSelectedDate(ds)}
                aria-label={`${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}${hasLog ? ', logged' : ''}`}
                aria-pressed={isSelected}
              >
                <span className={styles.dayLetter}>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                <span className={styles.dayNumRow}>
                  <span className={styles.dayNum}>{d.getDate()}</span>
                  {dotColor && <span className={styles.dayDot} style={{ background: dotColor }} />}
                </span>
              </button>
            )
          })}
        </div>
       </div>
      </div>

      {/* ── Calorie hero card ── */}
      <div className="px">
        {isLoading || budgetPending ? (
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
              <MacroBar label="Protein" current={totals.protein} target={targets.protein} color="var(--protein)" overOk />
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
                    <Card key={entry.id} padding={0} onClick={() => openEdit(entry)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px 12px 14px', minHeight: 64, cursor: 'pointer' }}>
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
                          <button className="btn-icon" onClick={e => { e.stopPropagation(); openEdit(entry) }} aria-label="Edit">
                            <EditIcon width={15} height={15} />
                          </button>
                          <button className="btn-danger" onClick={e => { e.stopPropagation(); handleDelete(entry.id) }} disabled={deletingId === entry.id} aria-label="Delete">
                            <TrashIcon width={14} height={14} />
                          </button>
                        </div>
                      ) : (
                        <button className="btn-icon" onClick={e => { e.stopPropagation(); setOpenRowId(entry.id) }} aria-label="More">
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
