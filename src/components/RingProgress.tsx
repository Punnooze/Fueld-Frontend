interface Props {
  progress: number
  size: number
  strokeWidth: number
  color?: string
  trackColor?: string
  children?: React.ReactNode
}

export const RingProgress = ({
  progress,
  size,
  strokeWidth,
  color = 'var(--accent)',
  trackColor = 'var(--bg-3)',
  children,
}: Props) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(progress, 0), 1)
  const offset = circumference * (1 - clamped)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={trackColor} strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: `stroke-dashoffset 0.3s var(--ease-out)` }}
        />
      </svg>
      {children && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}
