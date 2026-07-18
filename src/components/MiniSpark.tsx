interface Props {
  values: number[]
  width?: number
  height?: number
  color?: string
}

// Tiny inline sparkline of a weight trend.
export const MiniSpark = ({ values, width = 64, height = 22, color = 'var(--accent)' }: Props) => {
  if (values.length < 2) {
    return <div style={{ width, height }} />
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 2) + 1
    const y = height - 2 - ((v - min) / span) * (height - 4)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }} aria-hidden>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r={2} fill={color} />
    </svg>
  )
}
