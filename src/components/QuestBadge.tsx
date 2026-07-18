import { questIcon } from '../utils/quests'

interface Props {
  questKey: string
  color: string
  size?: number
  earned?: boolean
}

// Hex medal with the quest's icon. Full colour when earned, dim when locked.
export const QuestBadge = ({ questKey, color, size = 56, earned = true }: Props) => {
  const Icon = questIcon(questKey)
  const c = earned ? color : 'var(--text-low)'
  const icon = Math.round(size * 0.4)
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center', opacity: earned ? 1 : 0.5 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', inset: 0, filter: earned ? `drop-shadow(0 0 6px ${color}55)` : 'none' }} aria-hidden>
        <path d="M50 4 L88 26 V74 L50 96 L12 74 V26 Z" fill={earned ? `${color}18` : 'transparent'} stroke={c} strokeWidth={3} strokeLinejoin="miter" />
      </svg>
      <Icon width={icon} height={icon} style={{ color: c, position: 'relative' }} />
    </div>
  )
}
