import { useEffect } from 'react'

// Contador global — suporta múltiplos modais abertos em pilha.
let lockCount = 0
let savedOverflow = ''
let savedPaddingRight = ''
let savedTouchAction = ''

function applyLock() {
  if (lockCount === 1) {
    const html = document.documentElement
    const body = document.body
    savedOverflow = html.style.overflow
    savedPaddingRight = body.style.paddingRight
    savedTouchAction = body.style.touchAction

    // Compensa o espaço da scrollbar para evitar shift do layout
    const scrollbarWidth = window.innerWidth - html.clientWidth
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }
    html.style.overflow = 'hidden'
    body.style.touchAction = 'none'
  }
}

function releaseLock() {
  if (lockCount === 0) {
    const html = document.documentElement
    const body = document.body
    html.style.overflow = savedOverflow
    body.style.paddingRight = savedPaddingRight
    body.style.touchAction = savedTouchAction
  }
}

/**
 * Trava o scroll do fundo quando `active` é true.
 * - Bloqueia scroll do <html> via overflow hidden
 * - Bloqueia touch-action no body para impedir scroll por toque (mobile)
 * - Compensa o espaço da scrollbar para não causar shift
 * - O conteúdo interno do modal segue rolando normalmente (overflow próprio)
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    lockCount += 1
    applyLock()
    return () => {
      lockCount -= 1
      releaseLock()
    }
  }, [active])
}
