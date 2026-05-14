import { create } from 'zustand'
import type { InstallState } from '@/hooks/usePWAInstall'

/**
 * Store global para o estado de instalação do PWA.
 * Evita múltiplos listeners quando PWAInstallButton é renderizado
 * em mais de um lugar ao mesmo tempo (sidebar + header mobile).
 */
interface PWAStore {
  state: InstallState
  setState: (s: InstallState) => void
}

export const usePWAStore = create<PWAStore>((set) => ({
  state: 'idle',
  setState: (s) => set({ state: s }),
}))
