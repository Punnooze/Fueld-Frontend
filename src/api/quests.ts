import client from './client'

export interface Quest {
  id: string
  type: 'daily' | 'weekly' | 'boss'
  key: string
  title: string
  description: string
  xpReward: number
  targetValue: number
  currentValue: number
  completed: boolean
}

export const normalizeQuest = (raw: Record<string, unknown>): Quest => ({
  id: String(raw.id ?? raw._id ?? ''),
  type: (raw.type as Quest['type']) ?? 'daily',
  key: String(raw.key ?? ''),
  title: String(raw.title ?? ''),
  description: String(raw.description ?? ''),
  xpReward: Number(raw.xpReward ?? 0),
  targetValue: Number(raw.targetValue ?? 1),
  currentValue: Number(raw.currentValue ?? 0),
  completed: Boolean(raw.completed),
})

export const getQuests = async (): Promise<Quest[]> => {
  const { data } = await client.get<unknown[]>('/quests')
  return (Array.isArray(data) ? data : []).map(q => normalizeQuest(q as Record<string, unknown>))
}
