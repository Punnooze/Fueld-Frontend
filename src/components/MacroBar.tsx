import styles from './MacroBar.module.css'
import { clamp } from '../utils/macros'

interface Props {
  label: string
  current: number
  target: number
  unit?: string
  color?: string
  overOk?: boolean // over target isn't bad (e.g. protein) → never red
}

export const MacroBar = ({ label, current, target, unit = 'g', color = 'var(--accent)', overOk = false }: Props) => {
  const pct = clamp((current / target) * 100, 0, 100)
  const over = current > target && !overOk

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <span className={styles.values} style={{ color: over ? 'var(--danger)' : 'var(--text-hi)' }}>
        <span className={styles.mono}>{Math.round(current)}</span>
        <span className={styles.sep}> / {target}{unit}</span>
      </span>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, background: over ? 'var(--danger)' : color }}
        />
      </div>
    </div>
  )
}
