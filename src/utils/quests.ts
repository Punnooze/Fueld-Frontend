import type { ComponentType, SVGProps } from 'react'
import {
  ForkIcon, FlameIcon, CheckIcon, DumbbellIcon, LeafIcon, ScaleIcon,
  StreakIcon, HeartIcon, TrophyIcon,
} from '../assets/icons'
import type { Quest } from '../api/quests'

interface QuestMeta {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  flavor: string
}

// Per-quest icon + longer flavor text (shown in the detail sheet & as a badge).
export const QUEST_META: Record<string, QuestMeta> = {
  fuel_up: { icon: ForkIcon, flavor: 'Protein builds the machine. Hit your number today — no shortcuts.' },
  feed_the_beast: { icon: FlameIcon, flavor: 'The beast has to eat. Log at least one meal.' },
  on_target: { icon: CheckIcon, flavor: 'Precision over guesswork. Land within 100 kcal of target.' },
  warrior_week: { icon: DumbbellIcon, flavor: 'Four sessions in seven days. This is where warriors separate.' },
  protein_protocol: { icon: LeafIcon, flavor: 'Hit protein 5 of 7 days. Consistency is the whole game.' },
  weigh_in: { icon: ScaleIcon, flavor: 'Track the trend. Step on the scale 3 times this week.' },
  the_logged: { icon: StreakIcon, flavor: '30 consecutive active days. Become impossible to stop.' },
  shrink_the_core: { icon: HeartIcon, flavor: 'Take 2cm off the waist. Reforge the frame.' },
  macro_monk: { icon: TrophyIcon, flavor: 'Hit protein 20 of 30 days. Monk-level discipline.' },
}

export const questIcon = (key: string) => QUEST_META[key]?.icon ?? CheckIcon
export const questFlavor = (key: string) => QUEST_META[key]?.flavor ?? ''

export const QUEST_TYPE_COLOR: Record<Quest['type'], string> = {
  daily: 'var(--accent)',
  weekly: '#8b9dff',
  boss: '#FFC93C',
}

// Mirror of backend quest definitions — for the badge collection.
export const QUEST_DEFS: { key: string; title: string; type: Quest['type'] }[] = [
  { key: 'fuel_up', title: 'Fuel Up', type: 'daily' },
  { key: 'feed_the_beast', title: 'Feed the Beast', type: 'daily' },
  { key: 'on_target', title: 'On Target', type: 'daily' },
  { key: 'warrior_week', title: 'Warrior Week', type: 'weekly' },
  { key: 'protein_protocol', title: 'Protein Protocol', type: 'weekly' },
  { key: 'weigh_in', title: 'Weigh In', type: 'weekly' },
  { key: 'the_logged', title: 'The Logged', type: 'boss' },
  { key: 'shrink_the_core', title: 'Shrink the Core', type: 'boss' },
  { key: 'macro_monk', title: 'Macro Monk', type: 'boss' },
]
