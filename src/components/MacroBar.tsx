import styles from './MacroBar.module.css'
import { clamp } from '../utils/macros'

interface Props {
  label: string
  current: number
  target: number
  unit?: string
  size?: 'sm' | 'md'
}

export const MacroBar = ({ label, current, target, unit = 'g', size = 'md' }: Props) => {
  const pct = clamp((current / target) * 100, 0, 100)
  const over = current > target

  return (
    <div className={`${styles.wrap} ${styles[size]}`}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.values}>
          <span className={over ? styles.over : styles.normal}>{Math.round(current)}</span>
          <span className={styles.sep}>/</span>
          <span className={styles.target}>{target}{unit}</span>
        </span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${over ? styles.fillOver : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
