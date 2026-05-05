import { create } from 'zustand'
import { today } from '../utils/dates'

interface TodayState {
  selectedDate: string
  setSelectedDate: (date: string) => void
}

export const useTodayStore = create<TodayState>()((set) => ({
  selectedDate: today(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))
