import type { CSSProperties } from 'react'

interface Props {
  power: number // 0..RANKS.length, from rankPower()
  size?: number
  color?: string
}

const clamp = (n: number) => Math.max(0, Math.min(1, n))
const show = (power: number, from: number, full: number) => clamp((power - from) / (full - from))

const layer = (o: number): CSSProperties => ({
  opacity: o,
  transformBox: 'fill-box',
  transformOrigin: 'center',
  transform: `scale(${0.84 + 0.16 * o})`,
  transition: 'opacity 600ms var(--ease), transform 600ms var(--ease)',
})

/**
 * A broad-shouldered warrior that gains gear as `power` rises through the ranks
 * and sheds it on decay. Recruit = bare fighter → Apex = winged, crowned, armored.
 */
export const RankAvatar = ({ power, size = 96, color = 'var(--accent)' }: Props) => {
  const bodyFill = '#171a16'
  const plate = '#23281f'
  const glow = 6 + Math.min(power, 6) * 2.4

  const headband = show(power, 0.25, 0.85)
  const wrist = show(power, 0.5, 1.1)
  const belt = show(power, 1.1, 1.7)
  const chest = show(power, 1.4, 2.1)
  const sword = show(power, 2.2, 2.9)
  const helmet = show(power, 2.4, 3.0)
  const shoulders = show(power, 2.6, 3.2)
  const cape = show(power, 3.4, 4.2)
  const legplate = show(power, 3.6, 4.4)
  const crown = show(power, 4.9, 5.6)
  const wings = show(power, 5.6, 6.3)
  const bareHead = 1 - helmet * 0.92

  const B = { fill: bodyFill, stroke: color, strokeWidth: 2.4, strokeLinejoin: 'round' as const }
  const P = { fill: plate, stroke: color, strokeWidth: 2, strokeLinejoin: 'round' as const }

  return (
    <svg width={size} height={size} viewBox="0 0 120 150" fill="none"
      style={{ filter: `drop-shadow(0 0 ${glow}px ${color}55)` }} aria-hidden>

      {/* wings (apex) */}
      <g style={layer(wings)}>
        <path d="M50 62 C14 48 8 100 32 108 C24 88 38 72 54 78 Z" fill={color} fillOpacity={0.13} stroke={color} strokeOpacity={0.5} />
        <path d="M70 62 C106 48 112 100 88 108 C96 88 82 72 66 78 Z" fill={color} fillOpacity={0.13} stroke={color} strokeOpacity={0.5} />
      </g>

      {/* cape (elite) */}
      <g style={layer(cape)}>
        <path d="M46 50 L74 50 L90 132 L30 132 Z" fill={color} fillOpacity={0.16} stroke={color} strokeOpacity={0.4} />
      </g>

      {/* ── base figure (filled silhouette) ── */}
      {/* legs */}
      <path d="M50 92 L47 116 L44 138 L56 138 L56 116 L59 93 Z" {...B} />
      <path d="M70 92 L73 116 L76 138 L64 138 L64 116 L61 93 Z" {...B} />
      {/* arms */}
      <path d="M45 50 C36 52 31 62 31 74 C31 80 36 82 39 79 C40 68 43 58 49 54 Z" {...B} />
      <path d="M75 50 C84 52 89 62 89 74 C89 80 84 82 81 79 C80 68 77 58 71 54 Z" {...B} />
      {/* fists */}
      <circle cx="36" cy="80" r="4.6" {...B} />
      <circle cx="84" cy="80" r="4.6" {...B} />
      {/* neck */}
      <path d="M56 40 L64 40 L63 48 L57 48 Z" {...B} />
      {/* torso */}
      <path d="M44 50 C43 45 49 43 54 44 L60 43 L66 44 C71 43 77 45 76 50 L72 80 C71 88 66 93 60 93 C54 93 49 88 48 80 Z" {...B} />
      {/* head */}
      <circle cx="60" cy="30" r="12" fill={bodyFill} stroke={color} strokeWidth={2.4} style={{ opacity: bareHead, transition: 'opacity 600ms var(--ease)' }} />

      {/* ── gear ── */}
      {/* leg plates */}
      <g style={layer(legplate)}>
        <path d="M47 106 L57 106 L55 128 L46 128 Z" {...P} />
        <path d="M63 106 L73 106 L74 128 L65 128 Z" {...P} />
      </g>

      {/* chestplate */}
      <g style={layer(chest)}>
        <path d="M49 51 L71 51 L68 82 L52 82 Z" {...P} />
        <path d="M60 53 L60 80" stroke={color} strokeWidth={1.6} />
        <path d="M52 61 L68 61 M53 71 L67 71" stroke={color} strokeWidth={1.4} strokeOpacity={0.7} />
      </g>

      {/* belt */}
      <g style={layer(belt)}>
        <path d="M50 82 L70 82 L70 90 L50 90 Z" {...P} />
        <rect x="56" y="83" width="8" height="6" fill={color} />
      </g>

      {/* shoulder pads */}
      <g style={layer(shoulders)}>
        <path d="M41 51 Q40 41 55 46 L51 58 Z" {...P} />
        <path d="M79 51 Q80 41 65 46 L69 58 Z" {...P} />
      </g>

      {/* wrist wraps */}
      <g style={layer(wrist)}>
        <path d="M30 72 L40 75 L38 84 L28 81 Z" {...P} />
        <path d="M80 75 L90 72 L92 81 L82 84 Z" {...P} />
      </g>

      {/* headband */}
      <g style={layer(headband * (1 - helmet))}>
        <path d="M48 27 L72 27 L72 34 L48 34 Z" fill={color} />
        <path d="M72 30 L80 26 M72 33 L80 33" stroke={color} strokeWidth={1.6} />
      </g>

      {/* helmet */}
      <g style={layer(helmet)}>
        <path d="M47 31 A13 14 0 0 1 73 31 L73 41 L47 41 Z" {...P} />
        <path d="M50 37 L57 37 M63 37 L70 37" stroke={color} strokeWidth={1.8} />
        <path d="M60 18 L60 33" stroke={color} strokeWidth={2.6} />
      </g>

      {/* crown (master) */}
      <g style={layer(crown)}>
        <path d="M48 22 L52 10 L57 19 L60 7 L63 19 L68 10 L72 22 Z" fill={color} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      </g>

      {/* sword (warrior) */}
      <g style={layer(sword)}>
        <path d="M93 66 L112 26" stroke={color} strokeWidth={3.6} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        <path d="M87 62 L99 70" stroke={color} strokeWidth={3.2} strokeLinecap="round" />
        <path d="M91 67 L86 74" stroke={color} strokeWidth={3.2} strokeLinecap="round" />
        <circle cx="85" cy="75" r="2.6" fill={color} />
      </g>
    </svg>
  )
}
