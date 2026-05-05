interface Props {
  height?: number
  count?: number
  radius?: number
}

export const SkeletonCard = ({ height = 80, count = 1, radius = 18 }: Props) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton-row" style={{ height, borderRadius: radius }} />
    ))}
  </>
)
