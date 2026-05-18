import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'

interface Props {
  open: boolean
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title = 'Tem certeza?',
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: Props) {
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center sm:justify-center">

      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-backdrop-in"
        onClick={onCancel}
        style={{
          background: 'rgba(0, 0, 0, 0.52)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Painel compacto */}
      <div
        className="relative z-10 w-full sm:max-w-sm rounded-t-[22px] sm:rounded-2xl animate-modal-sheet sm:animate-modal-dialog"
        style={{ background: 'var(--bg-1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar — mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: 'var(--text-tertiary)', opacity: 0.35 }}
          />
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col items-center gap-4 px-6 pt-6 pb-5 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--status-overdue-bg)', color: 'var(--status-overdue)' }}
          >
            <AlertTriangle size={26} />
          </div>
          <div className="flex flex-col gap-1.5 max-w-xs">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div
          className="flex flex-col gap-2.5 px-5 pb-5"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={onConfirm}
            className="w-full px-4 py-3 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--status-overdue)' }}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-3 rounded-input text-sm font-medium border transition-all hover:opacity-80 active:scale-[0.98]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
