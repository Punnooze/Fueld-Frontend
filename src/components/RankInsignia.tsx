interface Props {
  tier: number // 0..6
  size?: number
  color?: string
}

// Brutal military insignia: (tier+1) stacked chevrons inside a hard hex frame.
export const RankInsignia = ({ tier, size = 44, color = 'var(--accent)' }: Props) => {
  const chevrons = Math.min(tier + 1, 7)
  const rows = Array.from({ length: chevrons }, (_, i) => 30 + i * 9)
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      {/* hex frame */}
      <path
        d="M50 4 L88 26 V74 L50 96 L12 74 V26 Z"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="miter"
        opacity={0.55}
      />
      {/* apex-predator mark for the top tier */}
      {tier >= 6 && (
        <circle cx="50" cy="20" r="4" fill={color} />
      )}
      {rows.map((y, i) => (
        <path
          key={i}
          d={`M30 ${y} L50 ${y - 12} L70 ${y}`}
          stroke={color}
          strokeWidth={5}
          strokeLinecap="square"
          strokeLinejoin="miter"
          opacity={0.6 + (i / chevrons) * 0.4}
        />
      ))}
    </svg>
  )
}
