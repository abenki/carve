import { create } from 'zustand'
import type { AppSettings } from '@/types'

interface SettingsState {
  settings: AppSettings
  loaded: boolean
  setSettings: (settings: AppSettings) => void
  updateSettings: (patch: Partial<AppSettings>) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    apiKey: '',
    model: 'gemini-2.5-pro',
    slideSize: '16:9'
  },
  loaded: false,
  setSettings: (settings) => set({ settings, loaded: true }),
  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } }))
}))
