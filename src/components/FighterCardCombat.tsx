import { useNavigate } from 'react-router-dom'
import type { Character } from '../api/character'
import { useCountUp } from '../hooks/useCountUp'
import { getClassTheme } from '../utils/classes'
import { EmberField } from './EmberField'
import { RankInsignia } from './RankInsignia'
import { XpBar } from './XpBar'
import { ChevronRightIcon } from '../assets/icons'

// UFC / trading-card: giant insignia watermark, name huge, fight-record strip.
export const FighterCardCombat = ({ character: c, interactive = true }: { character: Character; interactive?: boolean }) => {
  const navigate = useNavigate()
  const level = Math.round(useCountUp(c.level, 700))
  const theme = getClassTheme(c.class)
  const accent = c.decaying ? 'var(--danger)' : theme.color
  const dim = c.decaying ? 'rgba(229,72,77,0.13)' : theme.dim

  const record = [
    { v: c.streak, l: 'Streak' },
    { v: c.xp.total.toLocaleString(), l: 'Total XP' },
    { v: c.stats.totalWorkouts, l: 'Sessions' },
  ]

  return (
    <div
      onClick={interactive ? () => navigate('/profile') : undefined}
      role={interactive ? 'button' : undefined}
      style={{
      position: 'relative',
      background: `linear-gradient(150deg, ${dim}, var(--bg-1) 50%, #0b0d0b)`,
      border: `1px solid ${c.decaying ? 'var(--danger)' : 'var(--line)'}`,
      borderRadius: 'var(--r-card)',
      overflow: 'hidden',
      cursor: interactive ? 'pointer' : 'default',
      animation: c.decaying ? 'decayPulse 2s var(--ease) infinite' : 'breathe 5s var(--ease) infinite',
    }}>
      <EmberField count={c.decaying ? 6 : 12} color={accent} />

      {/* giant insignia watermark */}
      <div style={{ position: 'absolute', right: -28, top: -10, opacity: 0.1, transform: 'rotate(8deg)' }} aria-hidden>
        <RankInsignia tier={c.rankTier} size={210} color={accent} />
      </div>
      {interactive && (
        <div style={{ position: 'absolute', bottom: 10, right: 12, zIndex: 2 }} className="row gap-3">
          <span className="t-micro" style={{ color: 'var(--text-dim)', letterSpacing: '0.14em' }}>PROFILE</span>
          <ChevronRightIcon width={12} height={12} style={{ color: 'var(--text-dim)' }} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, padding: 22 }}>
        {/* top line */}
        <div className="between" style={{ marginBottom: 24 }}>
          <div className="row gap-8">
            <RankInsignia tier={c.rankTier} size={26} color={accent} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.16em', color: accent }}>
              {c.rank}
            </span>
            <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.12em' }}>· {c.class}</span>
          </div>
          <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
            <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.2em' }}>LVL</span>
            <span style={{ fontFamily: 'var(--font-mega)', fontSize: 40, fontWeight: 600, lineHeight: 0.8, color: 'var(--text-hi)' }}>{level}</span>
          </div>
        </div>

        {/* title = identity */}
        <span className="t-micro" style={{ display: 'block', color: 'var(--text-low)', letterSpacing: '0.24em', marginBottom: 6 }}>
          DESIGNATION
        </span>
        <span style={{
          display: 'block', fontFamily: 'var(--font-mega)', fontSize: 44, fontWeight: 600,
          letterSpacing: '0.01em', color: 'var(--text-hi)', textTransform: 'uppercase', lineHeight: 0.85, marginBottom: 20,
        }}>
          {c.title}
        </span>

        <XpBar intoLevel={c.xp.intoLevel} neededForNext={c.xp.neededForNext} color={accent} />
      </div>

      {/* record strip */}
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid var(--line)' }}>
        {record.map((r, i) => (
          <div key={r.l} style={{
            padding: '14px 10px', textAlign: 'center',
            borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--font-mega)', fontSize: 26, fontWeight: 600, color: 'var(--text-hi)', lineHeight: 1 }}>{r.v}</div>
            <div className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{r.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
