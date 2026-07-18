import type { XpEvent } from '../api/xp'
import { QuestBadge } from './QuestBadge'
import { QUEST_DEFS, QUEST_TYPE_COLOR } from '../utils/quests'
import styles from './BadgeGrid.module.css'

// A badge is earned if a quest-completion XP event exists for its key.
export const BadgeGrid = ({ events }: { events: XpEvent[] }) => {
  const earned = new Set(
    events.filter(e => e.type.startsWith('quest:')).map(e => e.type.slice('quest:'.length)),
  )
  const count = QUEST_DEFS.filter(d => earned.has(d.key)).length

  return (
    <section>
      <div className="section-header">
        <span className="t-eyebrow">Badges</span>
        <span style={{ fontSize: 11, color: 'var(--text-low)' }}>{count}/{QUEST_DEFS.length} earned</span>
      </div>
      <div className={styles.grid}>
        {QUEST_DEFS.map(d => {
          const has = earned.has(d.key)
          return (
            <div key={d.key} className={styles.cell}>
              <QuestBadge questKey={d.key} color={QUEST_TYPE_COLOR[d.type]} size={58} earned={has} />
              <span className="t-micro" style={{ color: has ? 'var(--text-mid)' : 'var(--text-low)', textAlign: 'center', lineHeight: 1.2 }}>{d.title}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
