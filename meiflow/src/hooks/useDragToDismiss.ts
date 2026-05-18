import { useRef } from 'react'

/**
 * Drag-to-dismiss para bottom sheets.
 * Só ativa em mobile (< 640px). No desktop não faz nada.
 *
 * Uso:
 *   const { panelRef, dragHandleProps } = useDragToDismiss(onClose)
 *   <div ref={panelRef}>
 *     <div {...dragHandleProps}>handle bar</div>
 *   </div>
 */
export function useDragToDismiss(onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null)
  const state = useRef({ startY: 0, delta: 0, dragging: false })
  const backdropRef = useRef<HTMLDivElement>(null)

  function isDesktop() { return window.innerWidth >= 640 }

  function onStart(clientY: number) {
    if (isDesktop()) return
    state.current = { startY: clientY, delta: 0, dragging: true }
    if (panelRef.current) panelRef.current.style.transition = 'none'
    if (backdropRef.current) backdropRef.current.style.transition = 'none'
  }

  function onMove(clientY: number) {
    if (!state.current.dragging || !panelRef.current) return
    const delta = Math.max(0, clientY - state.current.startY)
    state.current.delta = delta
    panelRef.current.style.transform = `translateY(${delta}px)`
    // Fade backdrop proportionally
    if (backdropRef.current) {
      const panelH = panelRef.current.offsetHeight || 500
      const progress = Math.min(delta / panelH, 1)
      backdropRef.current.style.opacity = String(1 - progress * 0.7)
    }
  }

  function onEnd() {
    if (!state.current.dragging || !panelRef.current) return
    state.current.dragging = false

    const panel = panelRef.current
    const threshold = Math.min(panel.offsetHeight * 0.32, 160)
    const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)'

    if (state.current.delta >= threshold) {
      panel.style.transition = `transform 300ms ${SPRING}`
      panel.style.transform = 'translateY(110%)'
      if (backdropRef.current) {
        backdropRef.current.style.transition = 'opacity 300ms ease'
        backdropRef.current.style.opacity = '0'
      }
      setTimeout(onClose, 300)
    } else {
      panel.style.transition = `transform 400ms ${SPRING}`
      panel.style.transform = 'translateY(0)'
      if (backdropRef.current) {
        backdropRef.current.style.transition = 'opacity 300ms ease'
        backdropRef.current.style.opacity = '1'
      }
    }
    state.current.delta = 0
  }

  const dragHandleProps = {
    onTouchStart: (e: React.TouchEvent) => onStart(e.touches[0].clientY),
    onTouchMove:  (e: React.TouchEvent) => { e.stopPropagation(); onMove(e.touches[0].clientY) },
    onTouchEnd:   () => onEnd(),
    onMouseDown:  (e: React.MouseEvent) => {
      onStart(e.clientY)
      const move = (ev: MouseEvent) => onMove(ev.clientY)
      const up   = () => { onEnd(); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    },
  }

  return { panelRef, backdropRef, dragHandleProps }
}
