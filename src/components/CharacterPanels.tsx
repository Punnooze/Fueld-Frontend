import type { Character } from '../api/character'
import type { XpEvent } from '../api/xp'
import { Reveal } from './Reveal'
import { RankInsignia } from './RankInsignia'
import { XpBar } from './XpBar'
import { StatTile } from './StatTile'
import { XpTrendGraph } from './XpTrendGraph'
import { ClassAvatar } from './ClassAvatar'
import { Eyebrow } from './ui/Eyebrow'
import { getClassTheme, CLASS_THEMES } from '../utils/classes'
import { RANKS, rankColor } from '../utils/ranks'
import { UNLOCKS } from '../utils/unlocks'
import { DumbbellIcon, ForkIcon, StreakIcon, TrophyIcon, CheckIcon } from '../assets/icons'
import styles from './CharacterPanels.module.css'

const relTime = (iso: string): string => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `${d}d`
  const h = Math.floor(diff / 3600000)
  if (h > 0) return `${h}h`
  const m = Math.floor(diff / 60000)
  return m > 0 ? `${m}m` : 'now'
}

export const CharacterPanels = ({ character: c, events }: { character: Character; events: XpEvent[] }) => {
  const theme = getClassTheme(c.class)
  const accent = c.decaying ? 'var(--danger)' : theme.color

  return (
    <div className="stack gap-24">
      {/* ── Progression ── */}
      <Reveal>
        <section>
          <Eyebrow right={`${c.xp.total.toLocaleString()} total`}>Progression</Eyebrow>
          <div className="card stack gap-12">
            <XpBar intoLevel={c.xp.intoLevel} neededForNext={c.xp.neededForNext} color={accent} />
            <span className="t-meta" style={{ color: 'var(--text-mid)' }}>
              {(c.xp.neededForNext - c.xp.intoLevel).toLocaleString()} XP to{' '}
              <b style={{ color: accent }}>LEVEL {c.level + 1}</b>
            </span>
            <div style={{ height: 1, background: 'var(--line)' }} />
            <XpTrendGraph events={events} days={30} />
          </div>
        </section>
      </Reveal>

      {/* ── Fighter class ── */}
      <Reveal>
        <section>
          <Eyebrow right={`${c.stats.workoutsThisMonth} gym · ${c.stats.nutritionDaysThisMonth} fuel / 30d`}>Fighter Class</Eyebrow>
          {/* current class hero */}
          <div className={styles.classHero} style={{ borderColor: theme.color, background: theme.dim }}>
            <div style={{ color: theme.color }}><ClassAvatar className={c.class} size={64} /></div>
            <div className="stack gap-4 flex-1 min-w-0">
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '0.06em', color: theme.color }}>{c.class}</span>
              <span className="t-meta" style={{ color: 'var(--text-mid)' }}>{theme.blurb}</span>
              <span className="t-micro" style={{ color: 'var(--text-low)' }}>⚡ {theme.perk}</span>
            </div>
          </div>
          {/* other classes */}
          <div className={styles.classRail}>
            {Object.values(CLASS_THEMES).filter(t => t.name !== c.class).map(t => (
              <div key={t.name} className={styles.classChip}>
                <div style={{ color: t.color, opacity: 0.85 }}><ClassAvatar className={t.name} size={30} /></div>
                <span className="t-micro" style={{ color: 'var(--text-mid)', textAlign: 'center' }}>{t.name}</span>
              </div>
            ))}
          </div>
          <span className="t-micro" style={{ color: 'var(--text-dim)', display: 'block', marginTop: 8 }}>
            Class recalculates monthly from what you actually log.
          </span>
        </section>
      </Reveal>

      {/* ── Rank ladder ── */}
      <Reveal>
        <section>
          <Eyebrow>Rank Ladder</Eyebrow>
          <div className="stack gap-8">
            {RANKS.map((r, i) => {
              const achieved = i <= c.rankTier
              const current = i === c.rankTier
              const rc = rankColor(i)
              return (
                <div key={r.name} className={styles.rankRow} style={{
                  borderColor: current ? rc : achieved ? `${rc}55` : 'var(--line)',
                  background: current ? `${rc}14` : 'var(--bg-1)',
                  opacity: achieved ? 1 : 0.45,
                }}>
                  <RankInsignia tier={i} size={30} color={achieved ? rc : 'var(--text-low)'} />
                  <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.14em', color: achieved ? rc : 'var(--text-low)' }}>{r.name}</span>
                  {current && <span className={styles.tag} style={{ background: rc }}>CURRENT</span>}
                  <span className="t-micro" style={{ color: 'var(--text-low)', fontFamily: 'var(--font-mono)' }}>LVL {r.minLevel}+</span>
                </div>
              )
            })}
          </div>
        </section>
      </Reveal>

      {/* ── Unlocks ── */}
      <Reveal>
        <section>
          <Eyebrow>Unlocks</Eyebrow>
          <div className="stack gap-6">
            {UNLOCKS.map(u => {
              const earned = c.level >= u.level
              return (
                <div key={u.title} className={styles.unlockRow} style={{ opacity: earned ? 1 : 0.55 }}>
                  <div className={styles.unlockDot} style={{ background: earned ? accent : 'var(--bg-3)', borderColor: earned ? accent : 'var(--line)' }}>
                    {earned && <CheckIcon width={12} height={12} style={{ color: 'var(--accent-ink)' }} />}
                  </div>
                  <div className="stack gap-2 flex-1 min-w-0">
                    <span style={{ fontSize: 13, fontWeight: 600, color: earned ? 'var(--text-hi)' : 'var(--text-mid)' }}>{u.title}</span>
                    <span className="t-micro" style={{ color: 'var(--text-low)' }}>{u.desc}</span>
                  </div>
                  <span className="t-micro" style={{ fontFamily: 'var(--font-mono)', color: earned ? accent : 'var(--text-low)' }}>
                    {earned ? 'UNLOCKED' : `LVL ${u.level}`}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </Reveal>

      {/* ── Combat record ── */}
      <Reveal>
        <section>
          <Eyebrow>Combat Record</Eyebrow>
          <div className={styles.statGrid}>
            <StatTile icon={DumbbellIcon} value={c.stats.totalWorkouts} label="Total Sessions" color={accent} />
            <StatTile icon={StreakIcon} value={c.longestStreak} label="Best Streak" color={accent} />
            <StatTile icon={TrophyIcon} value={c.streak} label="Current Streak" color={accent} />
            <StatTile icon={ForkIcon} value={c.stats.nutritionDaysThisMonth} label="Fuel Days / Mo" color={accent} />
          </div>
        </section>
      </Reveal>

      {/* ── Combat log ── */}
      <Reveal>
        <section>
          <Eyebrow right={events.length ? `${events.length} events` : undefined}>Combat Log</Eyebrow>
          {events.length === 0 ? (
            <p className="t-meta">No XP earned yet. Go log something.</p>
          ) : (
            <div className="stack gap-6">
              {events.slice(0, 15).map(e => (
                <div key={e.id} className={styles.logRow}>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-mid)' }}>{e.description || e.type}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: accent }}>+{e.xp}</span>
                  <span className="t-micro" style={{ color: 'var(--text-dim)', width: 34, textAlign: 'right' }}>{relTime(e.loggedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>
    </div>
  )
}
