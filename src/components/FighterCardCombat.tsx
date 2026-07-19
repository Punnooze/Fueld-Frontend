import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Character } from '../api/character'
import { useCountUp } from '../hooks/useCountUp'
import { rankColor } from '../utils/ranks'
import { EmberField } from './EmberField'
import { RankInsignia } from './RankInsignia'
import { XpBar } from './XpBar'

// UFC / trading-card: giant insignia watermark, name huge, fight-record strip.
// Themed by RANK — each rank has its own colour.
export const FighterCardCombat = ({ character: c, interactive = true }: { character: Character; interactive?: boolean }) => {
  const navigate = useNavigate()
  const level = Math.round(useCountUp(c.level, 700))
  const rc = rankColor(c.rankTier)
  const accent = c.decaying ? 'var(--danger)' : rc
  const dim = c.decaying ? 'rgba(229,72,77,0.13)' : `${rc}22`

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
      background: `radial-gradient(120% 80% at 100% 0%, ${rc}2e, transparent 55%), linear-gradient(150deg, ${dim}, var(--bg-1) 55%, #090b09)`,
      border: `1px solid ${c.decaying ? 'var(--danger)' : `${rc}66`}`,
      borderRadius: 'var(--r-card)',
      overflow: 'hidden',
      cursor: interactive ? 'pointer' : 'default',
      boxShadow: c.decaying ? 'none' : `0 8px 34px ${rc}33, 0 0 0 1px ${rc}12, inset 0 1px 0 ${rc}22`,
      animation: c.decaying ? 'decayPulse 2s var(--ease) infinite' : 'breathe 5s var(--ease) infinite',
    }}>
      <EmberField count={c.decaying ? 6 : 14} color={accent} />

      {/* giant insignia watermark */}
      <div style={{ position: 'absolute', right: -24, top: -14, opacity: 0.16, transform: 'rotate(8deg)' }} aria-hidden>
        <RankInsignia tier={c.rankTier} size={220} color={accent} />
      </div>
      {/* top accent bar */}
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, transparent)`, zIndex: 2 }} />
      {/* bolted corners */}
      {(['tl', 'tr', 'bl', 'br'] as const).map(p => <Bolt key={p} pos={p} color={accent} />)}
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

// riveted screw at a corner
function Bolt({ pos, color }: { pos: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const m = 8
  const p: CSSProperties = { position: 'absolute', zIndex: 3, lineHeight: 0 }
  if (pos === 'tl') { p.top = m; p.left = m }
  else if (pos === 'tr') { p.top = m; p.right = m }
  else if (pos === 'bl') { p.bottom = m; p.left = m }
  else { p.bottom = m; p.right = m }
  const slot = (pos === 'tl' || pos === 'br') ? 45 : -45
  return (
    <div style={p}>
      <svg width={15} height={15} viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="#111311" stroke={color} strokeWidth="1.4" opacity="0.9" />
        <line
          x1={8 - 3.4 * Math.cos((slot * Math.PI) / 180)} y1={8 - 3.4 * Math.sin((slot * Math.PI) / 180)}
          x2={8 + 3.4 * Math.cos((slot * Math.PI) / 180)} y2={8 + 3.4 * Math.sin((slot * Math.PI) / 180)}
          stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.85"
        />
      </svg>
    </div>
  )
}
