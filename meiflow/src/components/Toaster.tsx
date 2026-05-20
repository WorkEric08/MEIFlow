import { useEffect, useRef } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useToastStore, type ToastItem } from '@/store/toast'

function ToastCard({ toast }: { toast: ToastItem }) {
  const remove = useToastStore((s) => s.remove)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const duration = toast.duration ?? (toast.action ? 5000 : 3500)
    timerRef.current = window.setTimeout(() => remove(toast.id), duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [toast.id, toast.duration, toast.action, remove])

  const icon = { success: <CheckCircle2 size={15} />, error: <AlertCircle size={15} />, info: <Info size={15} /> }
  const iconColor = { success: 'var(--status-paid)', error: 'var(--status-overdue)', info: 'var(--primary)' }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-card border shadow-xl animate-fade-in w-[340px] max-w-[90vw] pointer-events-auto"
      style={{ background: 'var(--bg-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
    >
      {toast.type && (
        <span className="shrink-0" style={{ color: iconColor[toast.type] }}>
          {icon[toast.type]}
        </span>
      )}
      <span className="flex-1 text-sm leading-snug">{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => { toast.action!.onClick(); remove(toast.id) }}
          className="shrink-0 text-xs font-bold hover:opacity-75 transition-opacity"
          style={{ color: 'var(--primary)' }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={() => remove(toast.id)}
        className="shrink-0 hover:opacity-60 transition-opacity"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  if (!toasts.length) return null

  return (
    <div
      className="fixed z-[9999] flex flex-col gap-2 items-center pointer-events-none
                 bottom-20 left-1/2 -translate-x-1/2
                 lg:bottom-6 lg:right-6 lg:left-auto lg:translate-x-0 lg:items-end"
    >
      {toasts.map((t) => <ToastCard key={t.id} toast={t} />)}
    </div>
  )
}
