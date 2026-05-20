import { useEffect, useCallback } from 'react'

interface Options {
  key: string
  ctrlOrMeta?: boolean
  shift?: boolean
  enabled?: boolean
  onTrigger: () => void
}

export function useKeyboardShortcut({ key, ctrlOrMeta = false, shift = false, enabled = true, onTrigger }: Options) {
  const handler = useCallback((e: KeyboardEvent) => {
    if (!enabled) return
    if (ctrlOrMeta && !e.ctrlKey && !e.metaKey) return
    if (shift && !e.shiftKey) return
    if (e.key.toLowerCase() !== key.toLowerCase()) return
    e.preventDefault()
    onTrigger()
  }, [key, ctrlOrMeta, shift, enabled, onTrigger])

  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])
}
