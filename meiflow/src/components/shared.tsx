import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAndroidBack } from '@/hooks/useAndroidBack'
import { useScrollLock } from '@/hooks/useScrollLock'

// Curva padrão de bottom-sheets do iOS / Material 3 (decel suave, sem bounce)
const SHEET_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'
const SHEET_DURATION_MS = 280
const DISMISS_DISTANCE_RATIO = 0.3   // arrastou >30% da altura → fecha
const DISMISS_VELOCITY_PX_MS = 0.6   // ou flick > 0.6px/ms → fecha

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
  // No PWA mobile: botão Voltar do Android fecha o modal em vez de sair do app
  useAndroidBack(open, onClose)

  // Trava scroll do fundo enquanto o modal estiver aberto.
  // O conteúdo interno do modal continua rolando com sua própria barra.
  useScrollLock(open)

  // Tecla Escape (acessibilidade + desktop)
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const sheetRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startY: 0, dy: 0, startTime: 0, pointerId: -1 })

  function isMobileLayout() {
    return typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
  }

  function beginDrag(e: React.PointerEvent<HTMLElement>, fromBody = false) {
    if (!isMobileLayout()) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (fromBody && (scrollRef.current?.scrollTop ?? 0) > 0) return

    drag.current = {
      active: true,
      startY: e.clientY,
      dy: 0,
      startTime: performance.now(),
      pointerId: e.pointerId,
    }
    e.currentTarget.setPointerCapture(e.pointerId)

    if (sheetRef.current) sheetRef.current.style.transition = 'none'
    if (backdropRef.current) backdropRef.current.style.transition = 'none'
  }

  function moveDrag(e: React.PointerEvent<HTMLElement>) {
    if (!drag.current.active || e.pointerId !== drag.current.pointerId) return
    const dy = e.clientY - drag.current.startY
    // Resistência elástica ao tentar arrastar para cima
    const adjusted = dy < 0 ? -Math.pow(-dy, 0.6) : dy
    drag.current.dy = adjusted

    const sheet = sheetRef.current
    const backdrop = backdropRef.current
    if (sheet) sheet.style.transform = `translateY(${adjusted}px)`
    if (backdrop) {
      const h = sheet?.getBoundingClientRect().height ?? 1
      const progress = Math.min(1, Math.max(0, adjusted / h))
      backdrop.style.background = `rgba(0,0,0,${0.6 * (1 - progress)})`
    }
  }

  function endDrag(e: React.PointerEvent<HTMLElement>) {
    if (!drag.current.active || e.pointerId !== drag.current.pointerId) return
    const { dy, startTime } = drag.current
    drag.current.active = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}

    const sheet = sheetRef.current
    const backdrop = backdropRef.current
    if (!sheet) return

    const elapsed = Math.max(1, performance.now() - startTime)
    const velocity = dy / elapsed
    const height = sheet.getBoundingClientRect().height
    const shouldDismiss = dy > height * DISMISS_DISTANCE_RATIO || velocity > DISMISS_VELOCITY_PX_MS

    sheet.style.transition = `transform ${SHEET_DURATION_MS}ms ${SHEET_EASING}`
    if (backdrop) backdrop.style.transition = `background ${SHEET_DURATION_MS}ms ${SHEET_EASING}`

    if (shouldDismiss) {
      sheet.style.transform = `translateY(100%)`
      if (backdrop) backdrop.style.background = 'rgba(0,0,0,0)'
      const finish = () => { sheet.removeEventListener('transitionend', finish); onClose() }
      sheet.addEventListener('transitionend', finish)
    } else {
      sheet.style.transform = ''
      if (backdrop) backdrop.style.background = ''
    }
  }

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 modal-overscroll"
      style={{ background: 'rgba(0,0,0,0.6)', paddingTop: 'env(safe-area-inset-top)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault()
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault()
      }}
    >
      <div
        ref={sheetRef}
        className={cn(
          'w-full max-h-[92dvh] flex flex-col overflow-hidden border',
          'rounded-t-modal sm:rounded-modal',
          'animate-slide-up sm:animate-fade-in',
          widths[size],
          className,
        )}
        style={{ background: 'var(--bg-1)', borderColor: 'var(--border)', willChange: 'transform' }}
      >
        {/* Drag handle — área de toque ampliada, arrasta o sheet */}
        <div
          className="sm:hidden flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => beginDrag(e)}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className="block w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>
        <div
          className="flex items-center justify-between px-5 py-3 sm:py-4 border-b shrink-0 sm:cursor-default"
          style={{ borderColor: 'var(--border)', touchAction: 'pan-y' }}
          onPointerDown={(e) => {
            // Não inicia drag a partir do botão Fechar
            if ((e.target as HTMLElement).closest('button')) return
            beginDrag(e)
          }}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <h2 className="font-semibold text-base sm:text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} aria-label="Fechar"
            className="p-2 -mr-1 rounded-input transition-all hover:opacity-70 min-h-[40px] min-w-[40px] flex items-center justify-center"
            style={{ color: 'var(--text-tertiary)' }}>
            <X size={18} />
          </button>
        </div>
        <div
          ref={scrollRef}
          className="px-5 py-4 overflow-y-auto modal-scroll"
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            overscrollBehavior: 'contain',
          }}
          onPointerDown={(e) => beginDrag(e, true)}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
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
