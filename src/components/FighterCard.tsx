import type { CSSProperties } from 'react'
import type { Character } from '../api/character'
import { useCountUp } from '../hooks/useCountUp'
import { getClassTheme } from '../utils/classes'
import { rankPower } from '../utils/ranks'
import { RankAvatar } from './RankAvatar'
import { EmberField } from './EmberField'
import { RankInsignia } from './RankInsignia'
import { StreakFlame } from './StreakFlame'
import { XpBar } from './XpBar'

export const FighterCard = ({ character: c }: { character: Character }) => {
  const level = Math.round(useCountUp(c.level, 700))
  const totalXp = Math.round(useCountUp(c.xp.total, 900))

  const theme = getClassTheme(c.class)
  const highMomentum = c.streak >= 7 && !c.decaying
  const accent = c.decaying ? 'var(--danger)' : theme.color
  const dim = c.decaying ? 'rgba(229,72,77,0.13)' : theme.dim

  const animations = [
    'breathe 5s var(--ease) infinite',
    c.decaying ? 'decayPulse 2s var(--ease) infinite' : '',
    highMomentum ? 'momentumGlow 3.2s var(--ease) infinite' : '',
  ].filter(Boolean).join(', ')

  return (
    <div
      style={{
        position: 'relative',
        background: `linear-gradient(160deg, ${dim}, var(--bg-1) 45%, #0c0e0c)`,
        border: `1px solid ${c.decaying ? 'var(--danger)' : 'var(--line)'}`,
        borderRadius: 'var(--r-card)',
        padding: 24,
        overflow: 'hidden',
        animation: animations,
      }}
    >
      <EmberField count={c.decaying ? 6 : 14} color={accent} />
      {(['tl', 'tr', 'bl', 'br'] as const).map(p => <span key={p} style={cornerStyle(p)} />)}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Top: rank + level ── */}
        <div className="between" style={{ marginBottom: 20 }}>
          <div className="row gap-12">
            <div style={{ position: 'relative', width: 54, height: 54, display: 'grid', placeItems: 'center' }}>
              <span style={{
                position: 'absolute', inset: -3, borderRadius: '50%',
                border: `1px dashed ${accent}`, opacity: 0.25,
                animation: 'ringSpin 18s linear infinite',
              }} />
              <RankInsignia tier={c.rankTier} size={48} color={accent} />
            </div>
            <div className="stack gap-4">
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '0.16em', color: accent }}>
                {c.rank}
              </span>
              <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {c.class} Class
              </span>
            </div>
          </div>
          <div className="stack" style={{ alignItems: 'flex-end' }}>
            <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.2em' }}>LEVEL</span>
            <span style={{ fontFamily: 'var(--font-mega)', fontSize: 64, fontWeight: 600, lineHeight: 0.72, color: 'var(--text-hi)' }}>
              {level}
            </span>
          </div>
        </div>

        {/* ── Title identity + class persona ── */}
        <div className="between" style={{ marginBottom: 20, gap: 12 }}>
          <div className="stack gap-6 flex-1 min-w-0">
            <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.24em' }}>DESIGNATION</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
              letterSpacing: '0.04em', color: 'var(--text-hi)', textTransform: 'uppercase', lineHeight: 0.95,
            }}>
              {c.title}
            </span>
          </div>
          <div style={{ flexShrink: 0, marginTop: -8, marginBottom: -8 }}>
            <RankAvatar power={rankPower(c.level, c.rankTier)} size={92} color={accent} />
          </div>
        </div>

        <XpBar intoLevel={c.xp.intoLevel} neededForNext={c.xp.neededForNext} color={accent} />

        <div style={{ height: 1, background: 'var(--line)', margin: '20px 0 16px' }} />

        {/* ── Bottom: streak + total xp / decay ── */}
        <div className="between">
          <StreakFlame streak={c.streak} />
          {c.decaying ? (
            <div className="stack" style={{ alignItems: 'flex-end' }}>
              <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', fontFamily: 'var(--font-display)' }}>▼ SOFTENING</span>
              <span className="t-micro" style={{ color: 'var(--text-low)' }}>{c.daysSinceActive}d since active</span>
            </div>
          ) : (
            <div className="stack" style={{ alignItems: 'flex-end' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--text-hi)' }}>{totalXp.toLocaleString()}</span>
              <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>total xp</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function cornerStyle(pos: 'tl' | 'tr' | 'bl' | 'br'): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute', width: 10, height: 10, zIndex: 2,
    borderColor: 'var(--line)', borderStyle: 'solid', borderWidth: 0, opacity: 0.8,
  }
  const m = 8
  if (pos === 'tl') return { ...base, top: m, left: m, borderTopWidth: 1, borderLeftWidth: 1 }
  if (pos === 'tr') return { ...base, top: m, right: m, borderTopWidth: 1, borderRightWidth: 1 }
  if (pos === 'bl') return { ...base, bottom: m, left: m, borderBottomWidth: 1, borderLeftWidth: 1 }
  return { ...base, bottom: m, right: m, borderBottomWidth: 1, borderRightWidth: 1 }
}
