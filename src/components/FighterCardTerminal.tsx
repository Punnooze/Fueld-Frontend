import type { CSSProperties } from 'react'
import type { Character } from '../api/character'
import { useCountUp } from '../hooks/useCountUp'
import { getClassTheme } from '../utils/classes'

// Military weapons-system readout: mono grid, scanlines, bracket frame, cursor.
export const FighterCardTerminal = ({ character: c }: { character: Character }) => {
  const level = Math.round(useCountUp(c.level, 700))
  const theme = getClassTheme(c.class)
  const accent = c.decaying ? 'var(--danger)' : theme.color

  const pct = c.xp.neededForNext > 0 ? c.xp.intoLevel / c.xp.neededForNext : 1
  const SEG = 16
  const filled = Math.round(pct * SEG)
  const bar = '█'.repeat(filled) + '░'.repeat(SEG - filled)

  const rows: [string, string][] = [
    ['RANK', c.rank],
    ['CLASS', c.class.toUpperCase()],
    ['LEVEL', String(level)],
    ['STREAK', `${c.streak}D`],
    ['TOTAL XP', c.xp.total.toLocaleString()],
  ]

  const mono = (size: number, color = 'var(--text-hi)'): CSSProperties => ({
    fontFamily: 'var(--font-mono)', fontSize: size, color, letterSpacing: '0.02em',
  })

  return (
    <div style={{
      position: 'relative',
      background: '#080a08',
      border: `1px solid ${accent}`,
      borderRadius: 6,
      padding: 18,
      overflow: 'hidden',
      boxShadow: `inset 0 0 40px ${accent}18`,
      animation: c.decaying ? 'decayGlitch 5s steps(1) infinite' : undefined,
    }}>
      {/* scanlines */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.32) 0px, rgba(0,0,0,0.32) 1px, transparent 1px, transparent 3px)',
        animation: 'scan 6s linear infinite',
      }} />
      {/* bracket corners */}
      {(['tl', 'tr', 'bl', 'br'] as const).map(p => <span key={p} style={bracket(p, accent)} />)}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* header */}
        <div className="between" style={{ marginBottom: 16, borderBottom: `1px solid ${accent}44`, paddingBottom: 10 }}>
          <span style={{ ...mono(12, accent), letterSpacing: '0.14em' }}>FIGHTER://DOSSIER</span>
          <span style={mono(12, accent)}>{c.decaying ? 'ALERT' : 'ONLINE'}<span style={{ animation: 'blink 1.1s steps(1) infinite' }}>_</span></span>
        </div>

        {/* callsign */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ ...mono(11, 'var(--text-low)'), letterSpacing: '0.2em' }}>CALLSIGN</span>
          <div style={{ fontFamily: 'var(--font-mega)', fontSize: 40, fontWeight: 600, color: 'var(--text-hi)', textTransform: 'uppercase', lineHeight: 0.9 }}>
            {c.name}
          </div>
          <span style={{ ...mono(11, accent), letterSpacing: '0.14em' }}>“{c.title}”</span>
        </div>

        {/* data grid */}
        <div className="stack gap-6" style={{ marginBottom: 14 }}>
          {rows.map(([k, v]) => (
            <div key={k} className="row" style={{ gap: 8 }}>
              <span style={mono(12, 'var(--text-mid)')}>{k}</span>
              <span style={{ flex: 1, borderBottom: '1px dotted var(--line)', transform: 'translateY(-3px)' }} />
              <span style={mono(12)}>{v}</span>
            </div>
          ))}
        </div>

        {/* xp block bar */}
        <div className="stack gap-4">
          <div className="between">
            <span style={mono(11, 'var(--text-low)')}>XP</span>
            <span style={mono(11, 'var(--text-low)')}>{Math.round(c.xp.intoLevel)}/{c.xp.neededForNext}</span>
          </div>
          <div style={{ ...mono(15, accent), letterSpacing: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textShadow: `0 0 8px ${accent}66` }}>
            {bar}
          </div>
        </div>
      </div>
    </div>
  )
}

function bracket(pos: 'tl' | 'tr' | 'bl' | 'br', color: string): CSSProperties {
  const base: CSSProperties = { position: 'absolute', width: 14, height: 14, borderColor: color, borderStyle: 'solid', borderWidth: 0, zIndex: 2 }
  const m = 5
  if (pos === 'tl') return { ...base, top: m, left: m, borderTopWidth: 2, borderLeftWidth: 2 }
  if (pos === 'tr') return { ...base, top: m, right: m, borderTopWidth: 2, borderRightWidth: 2 }
  if (pos === 'bl') return { ...base, bottom: m, left: m, borderBottomWidth: 2, borderLeftWidth: 2 }
  return { ...base, bottom: m, right: m, borderBottomWidth: 2, borderRightWidth: 2 }
}
