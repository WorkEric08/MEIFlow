import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Modal ──────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn('w-full rounded-modal border animate-slide-up sm:animate-fade-in', widths[size], className)}
        style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} aria-label="Fechar"
            className="p-1.5 rounded-input transition-all hover:opacity-70"
            style={{ color: 'var(--text-tertiary)' }}>
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
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
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'var(--bg-2)', color: 'var(--text-tertiary)' }}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{description}</p>
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
    <div className={cn('relative p-4 rounded-card border overflow-hidden', blueprint && 'blueprint-corner')}
      style={{ background: 'var(--bg-1)', borderColor: blueprint ? 'var(--blueprint-border)' : 'var(--border)' }}>
      {blueprint && <div className="blueprint-grid absolute inset-0 pointer-events-none" />}
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: accent ?? 'var(--blueprint-text)' }}>
          {label}
        </p>
        <p className="text-2xl font-bold mt-1 font-mono" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
        {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{sub}</p>}
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
