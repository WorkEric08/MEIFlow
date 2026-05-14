import { useCallback } from 'react'
import { getPWAEnv } from './useIsPWA'

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  selection: 5,
  light: 10,
  medium: 18,
  heavy: 30,
  success: [12, 40, 12],
  warning: [20, 60, 20],
  error: [30, 50, 30, 50, 30],
}

let lastFire = 0

export function triggerHaptic(pattern: HapticPattern = 'light') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  const env = getPWAEnv()
  if (!env.isPWAMobile) return

  const now = Date.now()
  if (now - lastFire < 30) return
  lastFire = now

  try {
    navigator.vibrate(PATTERNS[pattern])
  } catch {
    // some browsers throw outside of user gesture
  }
}

export function useHaptic() {
  return useCallback((pattern: HapticPattern = 'light') => triggerHaptic(pattern), [])
}
