import type { CSSProperties, ReactNode } from 'react'

interface Props {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  style?: CSSProperties
}

const SIZES: Record<string, CSSProperties> = {
  sm: { fontSize: 18, letterSpacing: '-0.02em' },
  md: { fontSize: 24, letterSpacing: '-0.02em' },
  lg: { fontSize: 40, letterSpacing: '-0.03em' },
  xl: { fontSize: 56, letterSpacing: '-0.04em' },
}

export const MetricNumber = ({ children, size = 'md', color = 'var(--text-hi)', style }: Props) => (
  <span style={{
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
    lineHeight: 1,
    color,
    ...SIZES[size],
    ...style,
  }}>
    {children}
  </span>
)
