import { create } from 'zustand'

interface SplashStore {
  settingsActive: boolean
  triggerSettings: () => void
  dismissSettings: () => void
}

export const useSplashStore = create<SplashStore>((set) => ({
  settingsActive: false,
  triggerSettings: () => set({ settingsActive: true }),
  dismissSettings: () => set({ settingsActive: false }),
}))
