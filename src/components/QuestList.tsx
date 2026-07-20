import { useState } from 'react'
import type { Quest } from '../api/quests'
import { CheckIcon, TrophyIcon } from '../assets/icons'
import { Eyebrow } from './ui/Eyebrow'
import { BottomSheet } from './BottomSheet'
import { QuestBadge } from './QuestBadge'
import { questFlavor } from '../utils/quests'
import styles from './QuestList.module.css'

const TYPE_LABEL: Record<Quest['type'], string> = {
  daily: 'Daily Quests',
  weekly: 'Weekly Quests',
  boss: 'Boss Quests',
}
const ORDER: Quest['type'][] = ['daily', 'weekly', 'boss']

const QuestRow = ({ q, onOpen, color }: { q: Quest; onOpen: (q: Quest) => void; color: string }) => {
  const pct = Math.min((q.currentValue / q.targetValue) * 100, 100)
  return (
    <button
      className={styles.row}
      onClick={() => onOpen(q)}
      style={{ borderColor: q.completed ? color : 'var(--line)', borderLeft: `3px solid ${color}` }}
    >
      <QuestBadge questKey={q.key} color={color} size={44} earned={q.completed} />
      <div className="stack gap-6 flex-1 min-w-0">
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</span>
        {q.completed ? (
          <span className="row gap-4" style={{ color, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <CheckIcon width={12} height={12} /> Badge earned
          </span>
        ) : (
          <div className="row gap-8" style={{ alignItems: 'center' }}>
            <div style={{ flex: 1, height: 4, borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'var(--r-pill)', transition: 'width 600ms var(--ease)' }} />
            </div>
            <span className="t-micro" style={{ color: 'var(--text-low)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{q.currentValue}/{q.targetValue}</span>
          </div>
        )}
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color, flexShrink: 0, marginLeft: 4, alignSelf: 'center' }}>+{q.xpReward}</span>
    </button>
  )
}

export const QuestList = ({
  quests,
  accent = 'var(--accent)',
  types,
  showSummary = true,
}: {
  quests: Quest[]
  accent?: string
  types?: Quest['type'][]
  showSummary?: boolean
}) => {
  const [sel, setSel] = useState<Quest | null>(null)
  const visible = types ? ORDER.filter(t => types.includes(t)) : ORDER
  const groups = visible
    .map(type => ({ type, items: quests.filter(q => q.type === type) }))
    .filter(g => g.items.length > 0)

  const doneAll = quests.filter(q => q.completed).length
  const xpAvail = quests.filter(q => !q.completed).reduce((s, q) => s + q.xpReward, 0)
  const color = accent
  const pct = sel ? Math.min((sel.currentValue / sel.targetValue) * 100, 100) : 0

  return (
    <div className="stack gap-16">
      {/* summary header */}
      {showSummary && (() => {
        const donePct = quests.length ? Math.round((doneAll / quests.length) * 100) : 0
        return (
          <div className={styles.summary} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12, border: `1px solid ${accent}2e`, borderLeft: `3px solid ${accent}` }}>
            <div className="between" style={{ alignItems: 'flex-end' }}>
              <div className="stack gap-2">
                <span className="row gap-6" style={{ alignItems: 'center' }}>
                  <TrophyIcon width={14} height={14} style={{ color: accent }} />
                  <span className="t-eyebrow">Quests</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mega)', fontSize: 30, fontWeight: 600, color: accent, lineHeight: 0.9 }}>
                  {doneAll}<span style={{ fontSize: 16, color: 'var(--text-low)' }}>/{quests.length}</span>
                  <span className="t-micro" style={{ marginLeft: 8, color: 'var(--text-low)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>complete</span>
                </span>
              </div>
              <div className="stack gap-2" style={{ alignItems: 'flex-end' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: accent }}>+{xpAvail.toLocaleString()}</span>
                <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>XP up for grabs</span>
              </div>
            </div>
            <div style={{ height: 8, borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(donePct, 2)}%`, background: accent, borderRadius: 'var(--r-pill)', boxShadow: `0 0 10px ${accent}`, transition: 'width 700ms var(--ease)' }} />
            </div>
          </div>
        )
      })()}

      {groups.map(g => {
        const done = g.items.filter(q => q.completed).length
        return (
          <section key={g.type}>
            <Eyebrow right={`${done}/${g.items.length}`}>{TYPE_LABEL[g.type]}</Eyebrow>
            <div className="stack gap-8">
              {g.items.map(q => <QuestRow key={q.id} q={q} onOpen={setSel} color={accent} />)}
            </div>
          </section>
        )
      })}

      <BottomSheet open={!!sel} onClose={() => setSel(null)} title="">
        {sel && (
          <div className="stack gap-16" style={{ alignItems: 'center', textAlign: 'center', paddingBottom: 8 }}>
            <QuestBadge questKey={sel.key} color={color} size={104} earned={sel.completed} />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: '0.2em',
              color, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 'var(--r-pill)',
              background: `${color}1f`, border: `1px solid ${color}44`,
            }}>
              {sel.type} Quest
            </span>
            <span style={{ fontFamily: 'var(--font-mega)', fontSize: 32, fontWeight: 600, color: 'var(--text-hi)', textTransform: 'uppercase', lineHeight: 0.9 }}>
              {sel.title}
            </span>
            <p className="t-meta" style={{ color: 'var(--text-mid)', maxWidth: 300 }}>{questFlavor(sel.key)}</p>

            {/* progress bar */}
            <div className="stack gap-6" style={{ width: '100%' }}>
              <div className="between">
                <span className="t-micro" style={{ color: 'var(--text-low)' }}>PROGRESS</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color }}>{sel.currentValue}/{sel.targetValue}</span>
              </div>
              <div style={{ height: 8, borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${sel.completed ? 100 : pct}%`, background: color, borderRadius: 'var(--r-pill)', boxShadow: `0 0 10px ${color}`, transition: 'width 700ms var(--ease)' }} />
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--line)', width: '100%' }} />

            <div className="between" style={{ width: '100%' }}>
              <div className="stack gap-2" style={{ alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-mega)', fontSize: 26, color }}>+{sel.xpReward}</span>
                <span className="t-micro" style={{ color: 'var(--text-low)' }}>XP REWARD</span>
              </div>
              <div style={{
                padding: '10px 16px', borderRadius: 'var(--r-inner)',
                background: sel.completed ? `${color}1f` : 'var(--bg-2)',
                border: `1px solid ${sel.completed ? color : 'var(--line)'}`,
                color: sel.completed ? color : 'var(--text-low)',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {sel.completed ? '✓ Badge unlocked' : 'In progress'}
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
