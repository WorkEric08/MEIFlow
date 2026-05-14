import { useEffect } from 'react'
import { getPWAEnv } from './useIsPWA'

type Interceptor = () => boolean

const stack: Interceptor[] = []
let installed = false
let exitArmed = false
let exitTimer: number | null = null

const SENTINEL = '__pwa_back__'

function ensureSentinel() {
  const state = window.history.state
  if (!state || state[SENTINEL] !== true) {
    window.history.pushState({ [SENTINEL]: true, prev: state ?? null }, '')
  }
}

function showExitToast() {
  const id = 'pwa-exit-toast'
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('div')
    el.id = id
    el.textContent = 'Pressione voltar novamente para sair'
    Object.assign(el.style, {
      position: 'fixed',
      bottom: 'calc(env(safe-area-inset-bottom) + 80px)',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(20, 20, 20, 0.92)',
      color: '#fff',
      padding: '10px 18px',
      borderRadius: '999px',
      fontSize: '13px',
      fontWeight: '500',
      zIndex: '999999',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 200ms ease-out',
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    } as CSSStyleDeclaration)
    document.body.appendChild(el)
  }
  requestAnimationFrame(() => { if (el) el.style.opacity = '1' })
  window.setTimeout(() => { if (el) el.style.opacity = '0' }, 1700)
}

function onPopState() {
  // Run topmost interceptor (modals, drawers, popovers)
  while (stack.length > 0) {
    const fn = stack[stack.length - 1]
    const handled = safeCall(fn)
    if (handled) {
      ensureSentinel()
      return
    }
    // interceptor reported it could not handle — pop it and continue
    stack.pop()
  }

  // No interceptors. At root with no history → double-press-to-exit.
  // We detect "root" by checking if previous sentinel push is the only entry beyond the initial.
  const onAppRoot = window.location.pathname === '/' || window.location.pathname === ''
  if (onAppRoot) {
    if (exitArmed) {
      // Allow navigation away → let browser exit / minimize
      exitArmed = false
      if (exitTimer) window.clearTimeout(exitTimer)
      // Don't re-push sentinel — back propagates
      return
    }
    exitArmed = true
    showExitToast()
    if (exitTimer) window.clearTimeout(exitTimer)
    exitTimer = window.setTimeout(() => { exitArmed = false }, 1800)
    ensureSentinel()
    return
  }
  // Non-root path: re-push sentinel so the next back press triggers popstate again,
  // and let the router handle the previous URL via the back we just consumed.
  // (popstate already moved us back — that's the desired navigation.)
  ensureSentinel()
}

function safeCall(fn: Interceptor): boolean {
  try { return !!fn() } catch { return false }
}

export function installAndroidBack() {
  if (installed) return
  const env = getPWAEnv()
  if (!env.isPWAMobile) return
  installed = true
  ensureSentinel()
  window.addEventListener('popstate', onPopState)
}

/**
 * Registra um interceptor para o botão Voltar.
 * Retorna true se o interceptor consumiu o evento (ex: fechou um modal).
 * O mais recente registrado é executado primeiro (LIFO).
 */
export function pushBackInterceptor(fn: Interceptor): () => void {
  stack.push(fn)
  ensureSentinel()
  return () => {
    const idx = stack.lastIndexOf(fn)
    if (idx >= 0) stack.splice(idx, 1)
  }
}

/**
 * React hook que adiciona um handler do botão Voltar enquanto `active` for true.
 * Útil para fechar modais com o gesto/botão Voltar do Android no PWA.
 */
export function useAndroidBack(active: boolean, handler: () => void) {
  useEffect(() => {
    if (!active) return
    const env = getPWAEnv()
    if (!env.isPWAMobile) return
    return pushBackInterceptor(() => { handler(); return true })
  }, [active, handler])
}
