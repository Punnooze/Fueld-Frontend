import type { LogEntry } from '../api/logs'

export interface MacroTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export const DEFAULT_TARGETS: MacroTotals = {
  calories: 1700,
  protein: 140,
  carbs: 180,
  fat: 60,
}

// kept for backwards compatibility
export const TARGETS = DEFAULT_TARGETS

export const sumMacros = (entries: LogEntry[]): MacroTotals => {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)
