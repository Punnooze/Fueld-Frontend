import type { ComponentType, SVGProps } from 'react'
import { useCountUp } from '../hooks/useCountUp'

interface Props {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  value: number
  label: string
  suffix?: string
  color?: string
  decimals?: number
}

export const StatTile = ({ icon: Icon, value, label, suffix, color = 'var(--accent)', decimals = 0 }: Props) => {
  const v = useCountUp(value, 900)
  const shown = decimals ? v.toFixed(decimals) : Math.round(v).toString()
  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg-1)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-inner)',
      padding: 18,
      overflow: 'hidden',
    }}>
      <Icon width={16} height={16} style={{ color, opacity: 0.8 }} />
      <div className="row" style={{ alignItems: 'baseline', gap: 3, marginTop: 8 }}>
        <span style={{ fontFamily: 'var(--font-mega)', fontSize: 34, fontWeight: 600, lineHeight: 0.9, color: 'var(--text-hi)' }}>
          {shown}
        </span>
        {suffix && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-low)' }}>{suffix}</span>}
      </div>
      <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2, display: 'block' }}>
        {label}
      </span>
    </div>
  )
}
