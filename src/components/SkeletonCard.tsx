import styles from './SkeletonCard.module.css'

interface Props {
  height?: number
  count?: number
  radius?: number
}

export const SkeletonCard = ({ height = 80, count = 1, radius = 16 }: Props) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={styles.skeleton}
        style={{ height, borderRadius: radius }}
      />
    ))}
  </>
)
