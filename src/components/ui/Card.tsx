import type { CSSProperties, ReactNode } from 'react'

interface Props {
  children: ReactNode
  padding?: number
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export const Card = ({ children, padding = 16, className, style, onClick }: Props) => (
  <div
    className={`card ${className ?? ''}`}
    style={{ padding, ...style }}
    onClick={onClick}
  >
    {children}
  </div>
)
