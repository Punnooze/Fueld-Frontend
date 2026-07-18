import { useEffect, useState } from 'react'

interface Props {
  intoLevel: number
  neededForNext: number
  color?: string
}

export const XpBar = ({ intoLevel, neededForNext, color = 'var(--accent)' }: Props) => {
  const pct = neededForNext > 0 ? Math.min((intoLevel / neededForNext) * 100, 100) : 100
  const [width, setWidth] = useState(0)

  // animate fill in on mount / change
  useEffect(() => {
    const raf = requestAnimationFrame(() => setWidth(pct))
    return () => cancelAnimationFrame(raf)
  }, [pct])

  return (
    <div className="stack gap-6">
      <div style={{
        position: 'relative',
        height: 10,
        borderRadius: 'var(--r-pill)',
        background: 'var(--bg-3)',
        overflow: 'hidden',
        border: '1px solid var(--line)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          width: `${width}%`,
          borderRadius: 'var(--r-pill)',
          background: `linear-gradient(90deg, ${color}33, ${color})`,
          boxShadow: `0 0 12px ${color}8c`,
          transition: 'width 900ms var(--ease)',
          overflow: 'hidden',
        }}>
          {/* travelling shine */}
          <span style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: 40,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            animation: 'xpShine 2.4s var(--ease) infinite',
          }} />
        </div>
      </div>
      <div className="between">
        <span className="t-micro" style={{ color: 'var(--text-low)', fontFamily: 'var(--font-mono)' }}>
          {Math.round(intoLevel)} / {neededForNext} XP
        </span>
        <span className="t-micro" style={{ color: 'var(--text-low)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          to next level
        </span>
      </div>
    </div>
  )
}
