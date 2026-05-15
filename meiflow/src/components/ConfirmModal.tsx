import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

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
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCancel()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col z-[10000] animate-slide-up"
      style={{
        background: 'var(--bg-0)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-2 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-1)' }}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Voltar"
          className="p-2 rounded-input transition-all hover:opacity-70 min-h-[40px] min-w-[40px] flex items-center justify-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>

      {/* Conteúdo centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'var(--status-overdue-bg)', color: 'var(--status-overdue)' }}
        >
          <AlertTriangle size={28} />
        </div>
        <div className="flex flex-col gap-2 text-center max-w-xs">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
      </div>

      {/* Ações fixas na base */}
      <div
        className="flex flex-col gap-3 px-4 pb-6"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={onConfirm}
          className="w-full px-4 py-3 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--status-overdue)' }}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full px-4 py-3 rounded-input text-sm font-medium border transition-all hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          {cancelLabel}
        </button>
      </div>
    </div>,
    document.body
  )
}
