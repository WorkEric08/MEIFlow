import { useEffect, useState } from 'react'

export interface PWAEnv {
  isStandalone: boolean
  isMobile: boolean
  isPWAMobile: boolean
  platform: 'android' | 'ios' | 'other'
}

function detect(): PWAEnv {
  if (typeof window === 'undefined') {
    return { isStandalone: false, isMobile: false, isPWAMobile: false, platform: 'other' }
  }

  const standaloneMQ = window.matchMedia('(display-mode: standalone)').matches
  const minimalUiMQ = window.matchMedia('(display-mode: minimal-ui)').matches
  const fullscreenMQ = window.matchMedia('(display-mode: fullscreen)').matches
  const iOSStandalone =
    'standalone' in navigator &&
    (navigator as { standalone?: boolean }).standalone === true

  const isStandalone = standaloneMQ || minimalUiMQ || fullscreenMQ || iOSStandalone

  const ua = navigator.userAgent || ''
  const isAndroid = /Android/i.test(ua)
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const platform: PWAEnv['platform'] = isAndroid ? 'android' : isIOS ? 'ios' : 'other'

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const isMobile = isAndroid || isIOS || (coarse && window.innerWidth <= 1024)

  return {
    isStandalone,
    isMobile,
    isPWAMobile: isStandalone && isMobile,
    platform,
  }
}

let cached: PWAEnv | null = null

export function getPWAEnv(): PWAEnv {
  if (!cached) cached = detect()
  return cached
}

export function useIsPWA(): PWAEnv {
  const [env, setEnv] = useState<PWAEnv>(() => getPWAEnv())

  useEffect(() => {
    const queries = [
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: minimal-ui)'),
      window.matchMedia('(display-mode: fullscreen)'),
    ]
    function update() {
      cached = detect()
      setEnv(cached)
    }
    queries.forEach((q) => q.addEventListener('change', update))
    window.addEventListener('resize', update)
    return () => {
      queries.forEach((q) => q.removeEventListener('change', update))
      window.removeEventListener('resize', update)
    }
  }, [])

  return env
}
