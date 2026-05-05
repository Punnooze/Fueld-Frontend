import styles from './SegmentedControl.module.css'

interface Option {
  value: string
  label: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (value: string) => void
}

export const SegmentedControl = ({ options, value, onChange }: Props) => (
  <div className={styles.track}>
    {options.map(opt => (
      <button
        key={opt.value}
        className={`${styles.segment} ${value === opt.value ? styles.active : ''}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
      </button>
    ))}
  </div>
)
