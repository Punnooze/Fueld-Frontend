import client from './client'

export interface Measurement {
  id: string
  date: string
  neck?: number
  chest?: number
  waist?: number
  hip?: number
  rightArm?: number
  leftArm?: number
  forearm?: number
  thigh?: number
  calf?: number
}

export type MeasurementPayload = Omit<Measurement, 'id'>

const normalize = (raw: Record<string, unknown>): Measurement => ({
  id: String(raw.id ?? raw._id ?? ''),
  date: String(raw.date ?? ''),
  neck: raw.neck != null ? Number(raw.neck) : undefined,
  chest: raw.chest != null ? Number(raw.chest) : undefined,
  waist: raw.waist != null ? Number(raw.waist) : undefined,
  hip: raw.hip != null ? Number(raw.hip) : undefined,
  rightArm: raw.rightArm != null ? Number(raw.rightArm) : undefined,
  leftArm: raw.leftArm != null ? Number(raw.leftArm) : undefined,
  forearm: raw.forearm != null ? Number(raw.forearm) : undefined,
  thigh: raw.thigh != null ? Number(raw.thigh) : undefined,
  calf: raw.calf != null ? Number(raw.calf) : undefined,
})

export const getMeasurements = async (): Promise<Measurement[]> => {
  const { data } = await client.get<unknown[]>('/measurements')
  return (Array.isArray(data) ? data : []).map(d => normalize(d as Record<string, unknown>))
}

export const getLatestMeasurements = async (): Promise<Measurement | null> => {
  try {
    const { data } = await client.get<unknown>('/measurements/latest')
    if (!data) return null
    return normalize(data as Record<string, unknown>)
  } catch {
    return null
  }
}

export const createMeasurement = async (payload: MeasurementPayload): Promise<Measurement> => {
  const { data } = await client.post<unknown>('/measurements', payload)
  return normalize(data as Record<string, unknown>)
}

export const updateMeasurement = async (id: string, payload: MeasurementPayload): Promise<Measurement> => {
  const { data } = await client.put<unknown>(`/measurements/${id}`, payload)
  return normalize(data as Record<string, unknown>)
}

export const deleteMeasurement = async (id: string): Promise<void> => {
  await client.delete(`/measurements/${id}`)
}
