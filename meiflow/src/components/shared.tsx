import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAndroidBack } from '@/hooks/useAndroidBack'
import { useScrollLock } from '@/hooks/useScrollLock'
import { useDragToDismiss } from '@/hooks/useDragToDismiss'

// ─── Modal — bottom sheet (mobile) / dialog centralizado (desktop) ──
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLS: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  useAndroidBack(open, onClose)
  useScrollLock(open)
  const { panelRef, backdropRef, dragHandleProps } = useDragToDismiss(onClose)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center sm:justify-center">

      {/* Backdrop — blur + escurecimento */}
      <div
        ref={backdropRef}
        className="absolute inset-0 animate-backdrop-in"
        onClick={onClose}
        style={{
          background: 'rgba(0, 0, 0, 0.52)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Painel */}
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 w-full flex flex-col',
          'max-h-[92dvh] rounded-t-[22px] animate-modal-sheet',
          'sm:rounded-2xl sm:animate-modal-dialog sm:max-h-[88dvh] sm:mb-0',
          SIZE_CLS[size],
          className,
        )}
        style={{ background: 'var(--bg-1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar — drag-to-dismiss (mobile) */}
        <div
          className="sm:hidden flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing touch-none"
          {...dragHandleProps}
        >
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: 'var(--text-tertiary)', opacity: 0.35 }}
          />
        </div>

        {/* Header — também arrasta no mobile */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0 sm:cursor-default cursor-grab active:cursor-grabbing touch-none"
          style={{ borderColor: 'var(--border)' }}
          {...dragHandleProps}
        >
          <h2 className="font-semibold text-base select-none" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Fechar"
            className="p-2 -mr-2 rounded-input transition-all hover:opacity-70 flex items-center justify-center touch-auto cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 modal-scroll"
          style={{
            paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
            overscrollBehavior: 'contain',
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── EmptyState ─────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 gap-4 text-center rounded-card border"
      style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: 'var(--bg-2)', color: 'var(--text-tertiary)' }}>
        {icon}
      </div>
      <div className="max-w-xs">
        <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{description}</p>
      </div>
      {action}
    </div>
  )
}

// ─── StatusBadge ────────────────────────────────────────────────
type StatusKey = 'paid' | 'pending' | 'overdue' | 'active' | 'completed' | 'paused' | 'cancelled' | 'draft' | 'sent' | 'accepted' | 'rejected'

const STATUS_MAP: Record<StatusKey, { label: string; color: string; bg: string }> = {
  paid:      { label: 'Pago',          color: 'var(--status-paid)',    bg: 'var(--status-paid-bg)' },
  pending:   { label: 'Pendente',      color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  overdue:   { label: 'Atrasado',      color: 'var(--status-overdue)', bg: 'var(--status-overdue-bg)' },
  active:    { label: 'Em andamento',  color: 'var(--status-active)',  bg: 'var(--status-active-bg)' },
  completed: { label: 'Concluído',     color: 'var(--status-paid)',    bg: 'var(--status-paid-bg)' },
  paused:    { label: 'Pausado',       color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  cancelled: { label: 'Cancelado',     color: 'var(--status-overdue)', bg: 'var(--status-overdue-bg)' },
  draft:     { label: 'Rascunho',      color: 'var(--text-tertiary)',  bg: 'var(--border-subtle)' },
  sent:      { label: 'Enviado',       color: 'var(--status-active)',  bg: 'var(--status-active-bg)' },
  accepted:  { label: 'Aceito',        color: 'var(--status-paid)',    bg: 'var(--status-paid-bg)' },
  rejected:  { label: 'Recusado',      color: 'var(--status-overdue)', bg: 'var(--status-overdue-bg)' },
}

export function StatusBadge({ status }: { status: StatusKey }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.draft
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-semibold"
      style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

// ─── MetricCard ─────────────────────────────────────────────────
interface MetricCardProps {
  label: string
  value: string
  sub?: string
  accent?: string
  blueprint?: boolean
}

export function MetricCard({ label, value, sub, accent, blueprint = false }: MetricCardProps) {
  return (
    <div className={cn('relative p-3.5 sm:p-4 rounded-card border overflow-hidden', blueprint && 'blueprint-corner')}
      style={{ background: 'var(--bg-1)', borderColor: blueprint ? 'var(--blueprint-border)' : 'var(--border)' }}>
      {blueprint && <div className="blueprint-grid absolute inset-0 pointer-events-none" />}
      <div className="relative">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest leading-tight"
          style={{ color: accent ?? 'var(--blueprint-text)' }}>
          {label}
        </p>
        <p className="font-bold mt-1.5 font-mono leading-tight tabular-nums whitespace-nowrap overflow-hidden"
          style={{
            color: 'var(--text-primary)',
            // Escala suave: cabe no card mais estreito (3-col mobile) sem quebrar
            fontSize: 'clamp(13px, 4.2vw, 24px)',
            textOverflow: 'clip',
          }}>
          {value}
        </p>
        {sub && <p className="text-[11px] sm:text-xs mt-1 leading-snug" style={{ color: 'var(--text-tertiary)' }}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── Field wrapper ───────────────────────────────────────────────
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: 'var(--status-overdue)' }}>{error}</p>}
    </div>
  )
}

// ─── Input style helper ──────────────────────────────────────────
export const inputCls = (_hasError?: boolean) =>
  cn('w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast',
    'focus:ring-1')

export const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  background: 'var(--bg-2)',
  color: 'var(--text-primary)',
  borderColor: hasError ? 'var(--status-overdue)' : 'var(--border)',
})
