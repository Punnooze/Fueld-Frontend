import { useEffect, useState } from 'react'
import type { Character } from '../api/character'
import { FlameIcon } from '../assets/icons'

const KEY = 'fueld_seen_streak'

export const StreakBreakOverlay = ({ character: c }: { character: Character }) => {
  const [broke, setBroke] = useState<number | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(KEY)
    const seen = raw != null ? Number(raw) : null
    // streak dropped meaningfully → it broke
    if (seen != null && seen >= 3 && c.streak < seen) setBroke(seen)
    localStorage.setItem(KEY, String(c.streak))
  }, [c.streak])

  if (broke == null) return null

  return (
    <div
      onClick={() => setBroke(null)}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.96)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 20, padding: 32, textAlign: 'center', animation: 'overlayFade 400ms var(--ease) both',
      }}
    >
      <div style={{ animation: 'slamIn 700ms cubic-bezier(0.2,1.4,0.3,1) both', color: 'var(--text-dim)', filter: 'grayscale(1)' }}>
        <FlameIcon width={90} height={90} />
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '0.3em', color: 'var(--text-mid)', textTransform: 'uppercase', animation: 'burnIn 700ms var(--ease) 400ms both' }}>
        Streak Ended
      </span>
      <span style={{ fontFamily: 'var(--font-mega)', fontSize: 64, fontWeight: 600, color: 'var(--danger)', lineHeight: 0.8, animation: 'burnIn 800ms var(--ease) 600ms both' }}>
        {broke} DAYS
      </span>
      <p style={{ color: 'var(--text-mid)', fontSize: 14, maxWidth: 280, animation: 'overlayFade 600ms 1100ms both' }}>
        Your best is still <b style={{ color: 'var(--text-hi)' }}>{c.longestStreak}</b>. Start again. Today.
      </p>
      <span className="t-micro" style={{ color: 'var(--text-low)', marginTop: 12, animation: 'overlayFade 600ms 1600ms both' }}>tap to continue</span>
    </div>
  )
}
