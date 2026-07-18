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
    <button className={styles.row} onClick={() => onOpen(q)} style={{ borderColor: q.completed ? color : 'var(--line)' }}>
      <QuestBadge questKey={q.key} color={color} size={42} earned={q.completed} />
      <div className="stack gap-4 flex-1 min-w-0">
        <div className="between">
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: q.completed ? color : 'var(--text-low)', flexShrink: 0, marginLeft: 8 }}>+{q.xpReward}</span>
        </div>
        {q.completed ? (
          <span className="row gap-4" style={{ color, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <CheckIcon width={12} height={12} /> Badge earned
          </span>
        ) : (
          <div style={{ height: 4, borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'var(--r-pill)', transition: 'width 600ms var(--ease)' }} />
          </div>
        )}
      </div>
    </button>
  )
}

export const QuestList = ({ quests }: { quests: Quest[] }) => {
  const [sel, setSel] = useState<Quest | null>(null)
  const groups = ORDER
    .map(type => ({ type, items: quests.filter(q => q.type === type) }))
    .filter(g => g.items.length > 0)

  const color = sel ? QUEST_TYPE_COLOR[sel.type] : 'var(--accent)'

  return (
    <div className="stack gap-16">
      {groups.map(g => {
        const done = g.items.filter(q => q.completed).length
        return (
          <section key={g.type}>
            <Eyebrow right={`${done}/${g.items.length}`}>{TYPE_LABEL[g.type]}</Eyebrow>
            <div className="stack gap-8">
              {g.items.map(q => <QuestRow key={q.id} q={q} onOpen={setSel} />)}
            </div>
          </section>
        )
      })}

      <BottomSheet open={!!sel} onClose={() => setSel(null)} title="">
        {sel && (
          <div className="stack gap-16" style={{ alignItems: 'center', textAlign: 'center', paddingBottom: 8 }}>
            <QuestBadge questKey={sel.key} color={color} size={96} earned={sel.completed} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color, textTransform: 'uppercase' }}>
              {sel.type} Quest
            </span>
            <span style={{ fontFamily: 'var(--font-mega)', fontSize: 30, fontWeight: 600, color: 'var(--text-hi)', textTransform: 'uppercase', lineHeight: 0.9 }}>
              {sel.title}
            </span>
            <p className="t-meta" style={{ color: 'var(--text-mid)', maxWidth: 300 }}>{questFlavor(sel.key)}</p>

            <div className="row" style={{ width: '100%', justifyContent: 'space-around', marginTop: 4 }}>
              <div className="stack gap-2" style={{ alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color }}>+{sel.xpReward}</span>
                <span className="t-micro" style={{ color: 'var(--text-low)' }}>XP REWARD</span>
              </div>
              <div className="stack gap-2" style={{ alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--text-hi)' }}>{sel.currentValue}/{sel.targetValue}</span>
                <span className="t-micro" style={{ color: 'var(--text-low)' }}>PROGRESS</span>
              </div>
            </div>

            <div style={{
              width: '100%', textAlign: 'center', padding: '10px', borderRadius: 'var(--r-inner)',
              background: sel.completed ? `${color}18` : 'var(--bg-2)',
              color: sel.completed ? color : 'var(--text-low)',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {sel.completed ? '✓ Badge unlocked — added to your profile' : 'Complete to earn this badge'}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
