import { useEffect, useState } from 'react'
import type { Character } from '../api/character'
import { RankInsignia } from './RankInsignia'

const KEY = 'fueld_seen_progress'

type Show = { kind: 'level' | 'rank' } | null

export const LevelUpOverlay = ({ character: c }: { character: Character }) => {
  const [show, setShow] = useState<Show>(null)

  useEffect(() => {
    const raw = localStorage.getItem(KEY)
    const seen = raw ? (JSON.parse(raw) as { level: number; rankTier: number }) : null
    if (seen) {
      if (c.rankTier > seen.rankTier) setShow({ kind: 'rank' })
      else if (c.level > seen.level) setShow({ kind: 'level' })
    }
    localStorage.setItem(KEY, JSON.stringify({ level: c.level, rankTier: c.rankTier }))
  }, [c.level, c.rankTier])

  if (!show) return null

  const isRank = show.kind === 'rank'
  const headline = isRank ? `RANK UP` : `LEVEL ${c.level}`
  const bigName = isRank ? c.rank : c.title
  const copy = isRank
    ? `${c.rank}. Earned in blood. Don't waste it.`
    : `${c.title}. You've earned this. Don't waste it.`

  return (
    <div
      onClick={() => setShow(null)}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.94)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 22, padding: 32, textAlign: 'center',
        animation: 'overlayFade 400ms var(--ease) both',
      }}
    >
      {/* shockwave ripple */}
      <div style={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        border: '2px solid var(--accent)',
        animation: 'shockwave 900ms var(--ease) 200ms both',
      }} />

      {/* slam-in mark */}
      <div style={{ animation: 'slamIn 700ms cubic-bezier(0.2,1.4,0.3,1) both' }}>
        {isRank ? (
          <RankInsignia tier={c.rankTier} size={120} />
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 96, fontWeight: 500, color: 'var(--accent)', lineHeight: 1 }}>
            {c.level}
          </span>
        )}
      </div>

      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
        letterSpacing: '0.3em', color: 'var(--text-mid)', textTransform: 'uppercase',
        animation: 'burnIn 700ms var(--ease) 500ms both',
      }}>
        {headline}
      </span>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30,
        letterSpacing: '0.1em', color: 'var(--accent)', textTransform: 'uppercase',
        animation: 'burnIn 800ms var(--ease) 800ms both',
      }}>
        {bigName}
      </span>
      <p style={{
        color: 'var(--text-mid)', fontSize: 14, maxWidth: 280,
        animation: 'overlayFade 600ms var(--ease) 1300ms both',
      }}>
        {copy}
      </p>
      <span className="t-micro" style={{ color: 'var(--text-low)', marginTop: 12, animation: 'overlayFade 600ms 1800ms both' }}>
        tap to continue
      </span>
    </div>
  )
}
