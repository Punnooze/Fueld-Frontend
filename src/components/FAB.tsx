import { PlusIcon } from '../assets/icons'
import styles from './FAB.module.css'

interface Props {
  onClick: () => void
  label?: string
}

export const FAB = ({ onClick, label }: Props) => (
  <button className={styles.fab} onClick={onClick} aria-label={label ?? 'Add'}>
    <PlusIcon width={22} height={22} />
  </button>
)
