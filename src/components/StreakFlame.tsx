import { FlameIcon, TrophyIcon } from '../assets/icons'

interface Props {
  streak: number
}

// Flame grows and changes color with streak length (spec §STREAK — VISUAL FIRE).
function tier(streak: number) {
  if (streak >= 30) return { size: 40, color: '#FFC93C', pulse: true, crown: true, glow: 'rgba(255,201,60,0.5)' }
  if (streak >= 14) return { size: 36, color: '#FF8A3D', pulse: true, crown: true, glow: 'rgba(255,138,61,0.4)' }
  if (streak >= 7)  return { size: 34, color: 'var(--accent)', pulse: true, crown: false, glow: 'rgba(200,241,53,0.35)' }
  if (streak >= 4)  return { size: 28, color: 'var(--accent)', pulse: false, crown: false, glow: 'rgba(200,241,53,0.2)' }
  return { size: 22, color: 'var(--text-mid)', pulse: false, crown: false, glow: 'transparent' }
}

export const StreakFlame = ({ streak }: Props) => {
  const t = tier(streak)
  if (streak <= 0) {
    return (
      <div className="row gap-6" style={{ color: 'var(--text-low)' }}>
        <FlameIcon width={20} height={20} />
        <span className="t-meta">No streak — start today</span>
      </div>
    )
  }
  return (
    <div className="row gap-8">
      <div style={{ position: 'relative', width: t.size, height: t.size, display: 'grid', placeItems: 'center' }}>
        {t.crown && (
          <TrophyIcon
            width={14}
            height={14}
            style={{ position: 'absolute', top: -8, color: t.color, zIndex: 2 }}
          />
        )}
        <div style={{
          filter: `drop-shadow(0 0 8px ${t.glow})`,
          animation: t.pulse ? 'flameFlicker 1.4s var(--ease) infinite' : undefined,
          color: t.color,
          display: 'grid',
          placeItems: 'center',
        }}>
          <FlameIcon width={t.size} height={t.size} />
        </div>
      </div>
      <div className="stack">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: t.color, lineHeight: 1 }}>
          {streak}
        </span>
        <span className="t-micro" style={{ color: 'var(--text-low)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          day streak
        </span>
      </div>
    </div>
  )
}
