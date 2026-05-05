import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  right?: ReactNode
}

export const Eyebrow = ({ children, right }: Props) => (
  <div className="section-header">
    <span className="t-eyebrow">{children}</span>
    {right && <span style={{ fontSize: 11, color: 'var(--text-low)' }}>{right}</span>}
  </div>
)
