import { AlertTriangle } from 'lucide-react'

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
  if (!open) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 300,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="w-full max-w-sm rounded-modal border animate-slide-up"
        style={{ background: 'var(--bg-1)', borderColor: 'var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.36)' }}
      >
        {/* Ícone + texto */}
        <div className="flex flex-col items-center text-center px-6 pt-7 pb-5 gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--status-overdue-bg)', color: 'var(--status-overdue)' }}
          >
            <AlertTriangle size={22} />
          </div>
          <div className="flex flex-col gap-1">
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
          className="flex gap-2 px-5 pb-5"
        >
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-input text-sm font-medium border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--status-overdue)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
