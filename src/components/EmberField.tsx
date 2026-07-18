import type { CSSProperties } from 'react'

interface Props {
  count?: number
  color?: string
  height?: number | string
}

// Ambient embers drifting upward — heat coming off the fighter.
export const EmberField = ({ count = 14, color = 'var(--accent)', height = '100%' }: Props) => {
  const embers = Array.from({ length: count }, (_, i) => {
    const left = (i * 37) % 100
    const size = 2 + (i % 3)
    const dur = 3 + (i % 5) * 0.8
    const delay = (i % 7) * 0.6
    return { left, size, dur, delay, i }
  })
  return (
    <div style={{ position: 'absolute', inset: 0, height, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
      {embers.map(e => (
        <span
          key={e.i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            borderRadius: '50%',
            background: color,
            filter: 'blur(0.4px)',
            boxShadow: `0 0 6px ${color}`,
            opacity: 0,
            animation: `emberDrift ${e.dur}s var(--ease) ${e.delay}s infinite`,
          } as CSSProperties}
        />
      ))}
    </div>
  )
}
