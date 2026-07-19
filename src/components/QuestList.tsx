import { useState } from 'react'
import type { Quest } from '../api/quests'
import { CheckIcon } from '../assets/icons'
import { Eyebrow } from './ui/Eyebrow'
import { BottomSheet } from './BottomSheet'
import { QuestBadge } from './QuestBadge'
import { QUEST_TYPE_COLOR, questFlavor } from '../utils/quests'
import styles from './QuestList.module.css'

const TYPE_LABEL: Record<Quest['type'], string> = {
  daily: 'Daily Quests',
  weekly: 'Weekly Quests',
  boss: 'Boss Quests',
}
const ORDER: Quest['type'][] = ['daily', 'weekly', 'boss']

const QuestRow = ({ q, onOpen }: { q: Quest; onOpen: (q: Quest) => void }) => {
  const color = QUEST_TYPE_COLOR[q.type]
  const pct = Math.min((q.currentValue / q.targetValue) * 100, 100)
  return (
    <button
      className={styles.row}
      onClick={() => onOpen(q)}
      style={{ borderColor: q.completed ? color : 'var(--line)', borderLeft: `3px solid ${color}` }}
    >
      <QuestBadge questKey={q.key} color={color} size={44} earned={q.completed} />
      <div className="stack gap-4 flex-1 min-w-0">
        <div className="between">
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, flexShrink: 0, marginLeft: 8 }}>+{q.xpReward}</span>
        </div>
        {q.completed ? (
          <span className="row gap-4" style={{ color, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <CheckIcon width={12} height={12} /> Badge earned
          </span>
        ) : (
          <div className="row gap-8">
            <div style={{ flex: 1, height: 4, borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'var(--r-pill)', transition: 'width 600ms var(--ease)' }} />
            </div>
            <span className="t-micro" style={{ color: 'var(--text-low)', fontFamily: 'var(--font-mono)' }}>{q.currentValue}/{q.targetValue}</span>
          </div>
        )}
      </div>
    </button>
  )
}

export const QuestList = ({ quests, accent = 'var(--accent)' }: { quests: Quest[]; accent?: string }) => {
  const [sel, setSel] = useState<Quest | null>(null)
  const groups = ORDER
    .map(type => ({ type, items: quests.filter(q => q.type === type) }))
    .filter(g => g.items.length > 0)

  const doneAll = quests.filter(q => q.completed).length
  const xpAvail = quests.filter(q => !q.completed).reduce((s, q) => s + q.xpReward, 0)
  const color = sel ? QUEST_TYPE_COLOR[sel.type] : 'var(--accent)'
  const pct = sel ? Math.min((sel.currentValue / sel.targetValue) * 100, 100) : 0

  return (
    <div className="stack gap-16">
      {/* summary header */}
      <div className={styles.summary} style={{ border: `1px solid ${accent}2e`, borderLeft: `3px solid ${accent}` }}>
        <div className="stack gap-2">
          <span className="t-eyebrow">Quests</span>
          <span className="t-micro" style={{ color: 'var(--text-low)' }}>{doneAll}/{quests.length} complete</span>
        </div>
        <div className="stack gap-2" style={{ alignItems: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)' }}>+{xpAvail.toLocaleString()}</span>
          <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>XP up for grabs</span>
        </div>
      </div>

      {groups.map(g => {
        const done = g.items.filter(q => q.completed).length
        const c = QUEST_TYPE_COLOR[g.type]
        return (
          <section key={g.type}>
            <Eyebrow right={`${done}/${g.items.length}`}>
              <span className="row gap-6" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                {TYPE_LABEL[g.type]}
              </span>
            </Eyebrow>
            <div className="stack gap-8">
              {g.items.map(q => <QuestRow key={q.id} q={q} onOpen={setSel} />)}
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
