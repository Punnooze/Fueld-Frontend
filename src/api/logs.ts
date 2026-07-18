import client from './client'

export interface LogEntry {
  id: string
  foodItemId: string
  foodName: string
  quantity: number
  calories: number
  protein: number
  carbs: number
  fat: number
  date: string
  note?: string
}

export interface WeekDay {
  date: string
  calories: number
  protein: number
}

export interface CreateLogPayload {
  foodItemId: string
  quantity: number
  date: string
  note?: string
}

const normalizeEntry = (raw: Record<string, unknown>): LogEntry => {
  const quantity = Number(raw.quantity ?? 1)

  // Mongoose populate: foodItemId becomes the full food object in GET responses
  const populatedFood =
    typeof raw.foodItemId === 'object' && raw.foodItemId !== null
      ? (raw.foodItemId as Record<string, unknown>)
      : typeof raw.foodItem === 'object' && raw.foodItem !== null
      ? (raw.foodItem as Record<string, unknown>)
      : typeof raw.food === 'object' && raw.food !== null
      ? (raw.food as Record<string, unknown>)
      : null

  const foodIdStr = populatedFood
    ? String(populatedFood._id ?? populatedFood.id ?? '')
    : String(raw.foodItemId ?? '')

  // Prefer flat pre-computed totals; fall back to per-serving × quantity from populated food
  const resolve = (flatKey: string, nestedKey: string) => {
    const flat = raw[flatKey]
    if (flat != null && Number(flat) !== 0) return Number(flat)
    if (populatedFood?.[nestedKey] != null) return Number(populatedFood[nestedKey]) * quantity
    return 0
  }

  return {
    id: String(raw.id ?? raw._id ?? ''),
    foodItemId: foodIdStr,
    foodName: String(raw.foodName ?? populatedFood?.name ?? ''),
    quantity,
    calories: resolve('calories', 'calories'),
    protein: resolve('protein', 'protein'),
    carbs: resolve('carbs', 'carbs'),
    fat: resolve('fat', 'fat'),
    date: String(raw.date ?? '').slice(0, 10),
    note: raw.note ? String(raw.note) : undefined,
  }
}

const normalizeWeekDay = (raw: Record<string, unknown>): WeekDay => ({
  date: String(raw.date ?? '').slice(0, 10),
  calories: Number(raw.calories ?? 0),
  protein: Number(raw.protein ?? 0),
})

export const getLogs = async (date: string): Promise<LogEntry[]> => {
  const { data } = await client.get<unknown[]>('/logs', { params: { date } })
  return (Array.isArray(data) ? data : []).map(e => normalizeEntry(e as Record<string, unknown>))
}

export const getWeekLogs = async (startDate: string): Promise<WeekDay[]> => {
  const { data } = await client.get<unknown[]>('/logs/week', { params: { startDate } })
  return (Array.isArray(data) ? data : []).map(d => normalizeWeekDay(d as Record<string, unknown>))
}

export const createLog = async (payload: CreateLogPayload): Promise<LogEntry> => {
  const { data } = await client.post<Record<string, unknown>>('/logs', payload)
  // backend returns { entry, completedQuests }
  const raw = (data?.entry as Record<string, unknown>) ?? data
  return normalizeEntry(raw as Record<string, unknown>)
}

export const getLogHistory = async (startDate: string, endDate: string): Promise<LogEntry[]> => {
  const { data } = await client.get<unknown>('/logs/history', { params: { startDate, endDate } })
  // API returns { "YYYY-MM-DD": entry[] } — flatten all date buckets into one list
  const entries: unknown[] = Array.isArray(data)
    ? data
    : data && typeof data === 'object'
    ? Object.values(data as Record<string, unknown[]>).flat()
    : []
  return entries.map(e => normalizeEntry(e as Record<string, unknown>))
}

export const deleteLog = async (id: string): Promise<void> => {
  await client.delete(`/logs/${id}`)
}
