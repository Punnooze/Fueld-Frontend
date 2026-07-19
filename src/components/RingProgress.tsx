import { useCountUp } from '../hooks/useCountUp'

interface Props {
  progress: number
  size: number
  strokeWidth: number
  color?: string
  trackColor?: string
  loopArrow?: boolean
  animate?: boolean
  children?: React.ReactNode
}

export const RingProgress = ({
  progress,
  size,
  strokeWidth,
  color = 'var(--accent)',
  trackColor = 'var(--bg-3)',
  loopArrow = false,
  animate = false,
  children,
}: Props) => {
  // animate fill (and arrow travel) from 0 on mount / change
  const animated = useCountUp(progress, 1000)
  const p = animate ? animated : progress

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const base = Math.min(Math.max(p, 0), 1)
  const baseOffset = circumference * (1 - base)
  const over = p > 1 ? Math.min(p - 1, 1) : 0
  const overOffset = circumference * (1 - over)

  // leading-edge position (Apple-style arrow rides the head)
  const tip = p <= 0 ? 0 : p >= 1 ? p % 1 : p
  const ang = (tip * 360 - 90) * (Math.PI / 180)
  const ax = size / 2 + radius * Math.cos(ang)
  const ay = size / 2 + radius * Math.sin(ang)
  const rot = tip * 360
  const showArrow = loopArrow && p > 0.02

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <defs>
          <filter id="ringHeadShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={baseOffset} strokeLinecap="round"
        />
        {over > 0 && (
          <>
            {/* shadow under the overflow head only (svg-local coords) */}
            <circle
              cx={size / 2 + radius * Math.cos(tip * 2 * Math.PI)}
              cy={size / 2 + radius * Math.sin(tip * 2 * Math.PI) + 2}
              r={strokeWidth * 0.52} fill="rgba(0,0,0,0.6)" filter="url(#ringHeadShadow)"
            />
            {/* overflow lap — same colour as base; the head shadow alone shows it loops over */}
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke={color} strokeWidth={strokeWidth}
              strokeDasharray={circumference} strokeDashoffset={overOffset} strokeLinecap="round"
            />
          </>
        )}
      </svg>

      {showArrow && (
        <div style={{ position: 'absolute', left: ax, top: ay, transform: `translate(-50%, -50%) rotate(${rot}deg)`, zIndex: 3, lineHeight: 0 }}>
          <svg width={strokeWidth * 0.8} height={strokeWidth * 0.8} viewBox="0 0 16 16" fill="none">
            <path d="M2.5 8 H12 M8 4 L12.5 8 L8 12" stroke="var(--bg-0)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  )
}
