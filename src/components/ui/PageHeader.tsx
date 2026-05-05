import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  right?: ReactNode
}

export const PageHeader = ({ title, subtitle, right }: Props) => (
  <header className="page-header between">
    <div className="stack gap-4">
      <h1 className="t-h1">{title}</h1>
      {subtitle && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--text-low)',
        }}>
          {subtitle}
        </span>
      )}
    </div>
    {right && <div>{right}</div>}
  </header>
)
