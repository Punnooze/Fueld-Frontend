import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMeasurements, getLatestMeasurements,
  createMeasurement, deleteMeasurement,
  type MeasurementPayload,
} from '../api/measurements'

export const MEASUREMENTS_KEY = ['measurements']
export const LATEST_MEASUREMENTS_KEY = ['measurements', 'latest']

export const useMeasurements = () =>
  useQuery({ queryKey: MEASUREMENTS_KEY, queryFn: getMeasurements })

export const useLatestMeasurements = () =>
  useQuery({ queryKey: LATEST_MEASUREMENTS_KEY, queryFn: getLatestMeasurements })

export const useCreateMeasurement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: MeasurementPayload) => createMeasurement(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEASUREMENTS_KEY })
      qc.invalidateQueries({ queryKey: LATEST_MEASUREMENTS_KEY })
    },
  })
}

export const useDeleteMeasurement = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMeasurement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MEASUREMENTS_KEY })
      qc.invalidateQueries({ queryKey: LATEST_MEASUREMENTS_KEY })
    },
  })
}
