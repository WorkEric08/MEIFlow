import { useEffect, useCallback } from 'react'
import { usePWAStore } from '@/store/pwa'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __deferredInstallPrompt: BeforeInstallPromptEvent | null
    __pwaListenersRegistered?: boolean
  }
}

export type { } from '@/store/pwa'

export function usePWAInstall() {
  const { state, setState } = usePWAStore()

  useEffect(() => {
    // ── Listeners registrados uma única vez no ciclo de vida do app ──
    // A flag no window evita duplicação quando o componente remonta
    if (window.__pwaListenersRegistered) {
      // Apenas re-sincroniza o estado com o que já está em window
      if (window.__deferredInstallPrompt) setState('available')
      return
    }
    window.__pwaListenersRegistered = true

    // ── 1. Já rodando como PWA instalado ───────────────────────────
    const mq = window.matchMedia('(display-mode: standalone)')
    const iOSStandalone =
      'standalone' in navigator &&
      (navigator as { standalone?: boolean }).standalone === true

    if (mq.matches || iOSStandalone) {
      setState('installed')
      return
    }

    // ── 2. Prompt já capturado antes do React montar (index.html) ──
    if (window.__deferredInstallPrompt) {
      setState('available')
    }

    // ── 3. beforeinstallprompt — dispara quando o navegador considera
    //       o app instalável. Pode reaparecer após dispensa. ──────────
    function onPrompt(e: Event) {
      e.preventDefault()
      window.__deferredInstallPrompt = e as BeforeInstallPromptEvent
      setState('available')
    }

    // ── 4. appinstalled — instalação via banner do navegador ────────
    function onInstalled() {
      setState('installed')
      window.__deferredInstallPrompt = null
    }

    // ── 5. display-mode change — detecta quando o PWA abre standalone
    function onMQChange(e: MediaQueryListEvent) {
      if (e.matches) setState('installed')
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    mq.addEventListener('change', onMQChange)

    // Listeners globais — não precisam ser removidos no unmount do componente
    // porque precisam sobreviver ao ciclo de vida de qualquer componente
  }, [setState])

  const install = useCallback(async () => {
    if (state !== 'available') return
    const prompt = window.__deferredInstallPrompt
    if (!prompt) return

    setState('installing')

    try {
      // Chama o prompt nativo — única ação que o usuário precisa fazer
      await prompt.prompt()
      const { outcome } = await prompt.userChoice

      if (outcome === 'accepted') {
        setState('installed')
        window.__deferredInstallPrompt = null
      } else {
        // Dispensado — prompt ainda válido, pode ser chamado novamente
        setState('available')
      }
    } catch {
      // Lança se chamado fora de gesto do usuário ou prompt já consumido
      setState('available')
    }
  }, [state, setState])

  return { state, install }
}
