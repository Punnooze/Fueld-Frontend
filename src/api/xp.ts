import client from './client'

export interface XpEvent {
  id: string
  type: string
  xp: number
  description: string
  date: string
  loggedAt: string
}

export const getXp = async (limit = 20): Promise<XpEvent[]> => {
  const { data } = await client.get<Record<string, unknown>[]>('/xp', { params: { limit } })
  return (Array.isArray(data) ? data : []).map(e => ({
    id: String(e.id ?? e._id ?? ''),
    type: String(e.type ?? ''),
    xp: Number(e.xp ?? 0),
    description: String(e.description ?? ''),
    date: String(e.date ?? '').slice(0, 10),
    loggedAt: String(e.loggedAt ?? ''),
  }))
}
