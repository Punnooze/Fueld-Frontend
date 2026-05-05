import { useState } from 'react'
import { useLogs, useDeleteLog } from '../hooks/useLogs'
import { useStreak } from '../hooks/useStreak'
import { useTargets } from '../hooks/useSettings'
import { MacroBar } from '../components/MacroBar'
import { SettingsModal } from '../components/SettingsModal'
import { useToast } from '../components/Toast'
import { sumMacros } from '../utils/macros'
import { today } from '../utils/dates'
import styles from './Today.module.css'

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
)

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

export const Today = () => {
  const date = today()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: logs = [], isLoading, isError } = useLogs(date)
  const deleteLog = useDeleteLog(date)
  const { data: streak = 0 } = useStreak()
  const targets = useTargets()
  const { showToast } = useToast()

  const totals = sumMacros(logs)
  const remaining = targets.calories - totals.calories

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteLog.mutateAsync(id)
      showToast('Entry removed')
    } catch {
      showToast('Failed to delete', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>FUELD</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={styles.dateLabel}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
          <button className={styles.gearBtn} onClick={() => setSettingsOpen(true)} aria-label="Settings">
            <GearIcon />
          </button>
        </div>
      </header>

      <div className={styles.summaryCard}>
        <div className={styles.calSection}>
          <span className={styles.remainingNum} style={{ color: remaining < 0 ? 'var(--danger)' : 'var(--accent)' }}>
            {Math.abs(Math.round(remaining))}
          </span>
          <span className={styles.remainingLabel}>
            {remaining < 0 ? 'over target' : 'kcal left'}
            <span className={styles.target}> · of {targets.calories} kcal</span>
          </span>
        </div>

        <div className={styles.macros}>
          <MacroBar label="Protein" current={totals.protein} target={targets.protein} />
          <MacroBar label="Carbs"   current={totals.carbs}   target={targets.carbs}   />
          <MacroBar label="Fat"     current={totals.fat}     target={targets.fat}     />
        </div>

        {streak > 0 && (
          <div className={styles.streak}>
            🔥 <span>{streak} day streak</span>
          </div>
        )}
      </div>

      <section className={styles.logSection}>
        <h2 className={styles.sectionTitle}>Today's Log</h2>

        {isLoading ? (
          <div className={styles.skeleton}>
            {[1, 2, 3].map(i => <div key={i} className={styles.skeletonRow} />)}
          </div>
        ) : isError ? (
          <p className={styles.error}>Failed to load log entries.</p>
        ) : logs.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🥗</span>
            <p>Nothing logged yet.</p>
            <p className={styles.emptyHint}>Hit + to add your first meal.</p>
          </div>
        ) : (
          <div className={styles.logList}>
            {logs.map(entry => (
              <div key={entry.id} className={styles.logRow}>
                <div className={styles.logInfo}>
                  <span className={styles.logName}>{entry.foodName}</span>
                  {entry.note && <span className={styles.logNote}>{entry.note}</span>}
                  <span className={styles.logMeta}>
                    ×{entry.quantity} · {Math.round(entry.calories)} kcal · {Math.round(entry.protein)}g protein
                  </span>
                </div>
                <button
                  className={styles.logDelete}
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  aria-label={`Delete ${entry.foodName}`}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
