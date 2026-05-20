import { create } from 'zustand'

export interface ToastItem {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  action?: { label: string; onClick: () => void }
  duration?: number
}

interface ToastStore {
  toasts: ToastItem[]
  add: (t: Omit<ToastItem, 'id'>) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (t) => set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), ...t }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function useToast() {
  const add = useToastStore((s) => s.add)
  const remove = useToastStore((s) => s.remove)
  return {
    success: (message: string, opts?: Omit<ToastItem, 'id' | 'message' | 'type'>) =>
      add({ type: 'success', message, ...opts }),
    error: (message: string, opts?: Omit<ToastItem, 'id' | 'message' | 'type'>) =>
      add({ type: 'error', message, ...opts }),
    info: (message: string, opts?: Omit<ToastItem, 'id' | 'message' | 'type'>) =>
      add({ type: 'info', message, ...opts }),
    remove,
  }
}
