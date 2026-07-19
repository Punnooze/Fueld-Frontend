import { questIcon } from '../utils/quests'

interface Props {
  questKey: string
  color: string
  size?: number
  earned?: boolean
}

// Hex medal with the quest's icon. Full colour + glow when earned; faint colour when locked.
export const QuestBadge = ({ questKey, color, size = 56, earned = true }: Props) => {
  const Icon = questIcon(questKey)
  const icon = Math.round(size * 0.4)
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center', opacity: earned ? 1 : 0.55 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ position: 'absolute', inset: 0, filter: earned ? `drop-shadow(0 0 7px ${color}66)` : 'none' }} aria-hidden>
        <path d="M50 3 L89 25.5 V70.5 L50 93 L11 70.5 V25.5 Z" fill={earned ? `${color}1f` : `${color}0a`} stroke={color} strokeWidth={earned ? 3 : 2} strokeLinejoin="miter" />
        {earned && <path d="M50 12 L81 30 V66 L50 84 L19 66 V30 Z" fill="none" stroke={color} strokeWidth={0.8} opacity={0.4} />}
      </svg>
      <Icon width={icon} height={icon} style={{ color, position: 'relative' }} />
    </div>
  )
}
