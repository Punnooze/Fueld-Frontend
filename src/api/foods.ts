import client from './client'

export interface FoodItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  type: 'meal' | 'item'
  isCustom?: boolean
}

export interface FoodPayload {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  type: 'meal' | 'item'
}

// Handles both id and _id (MongoDB)
const normalize = (raw: Record<string, unknown>): FoodItem => ({
  id: String(raw.id ?? raw._id ?? ''),
  name: String(raw.name ?? ''),
  calories: Number(raw.calories ?? 0),
  protein: Number(raw.protein ?? 0),
  carbs: Number(raw.carbs ?? 0),
  fat: Number(raw.fat ?? 0),
  type: (raw.type as 'meal' | 'item') ?? 'item',
  isCustom: Boolean(raw.isCustom ?? false),
})

export const getFoods = async (): Promise<FoodItem[]> => {
  const { data } = await client.get<unknown[]>('/foods')
  return (Array.isArray(data) ? data : []).map(item => normalize(item as Record<string, unknown>))
}

export const createFood = async (payload: FoodPayload): Promise<FoodItem> => {
  const { data } = await client.post<unknown>('/foods', payload)
  return normalize(data as Record<string, unknown>)
}

export const updateFood = async (id: string, payload: FoodPayload): Promise<FoodItem> => {
  const { data } = await client.put<unknown>(`/foods/${id}`, payload)
  return normalize(data as Record<string, unknown>)
}

export const deleteFood = async (id: string): Promise<void> => {
  await client.delete(`/foods/${id}`)
}
