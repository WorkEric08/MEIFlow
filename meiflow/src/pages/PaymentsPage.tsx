import { useState } from 'react'
import { CreditCard, Plus, Pencil, Trash2, Check, Calendar } from 'lucide-react'
import {
  usePayments, usePaymentSummary, useMarkAsPaid, useDeletePayment, useRestoreDeletedPayment,
} from '@/features/payments/index'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import { useToast } from '@/store/toast'
import PaymentModal from '@/features/payments/components/PaymentModal'
import { ConfirmModal } from '@/components/ConfirmModal'
import { EmptyState } from '@/components/shared'
import { SkeletonList } from '@/components/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Payment, PaymentStatus } from '@/services/db'

type FilterStatus = 'all' | PaymentStatus
const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all',     label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'overdue', label: 'Atrasados' },
  { value: 'paid',    label: 'Pagos' },
]

// ─── Cor única por status — usada em ponto + texto auxiliar ─────
function statusColor(status: PaymentStatus): string {
  if (status === 'paid')    return 'var(--status-paid)'
  if (status === 'overdue') return 'var(--status-overdue)'
  return 'var(--status-pending)'
}

function statusLine(p: Payment): string {
  if (p.status === 'paid')    return `Pago ${p.paidAt ? formatDate(p.paidAt) : ''}`.trim()
  if (p.status === 'overdue') return `Atrasou ${formatDate(p.dueDate)}`
  return `Vence ${formatDate(p.dueDate)}`
}

export default function PaymentsPage() {
  const { data: payments = [], isLoading } = usePayments()
  const { data: summary } = usePaymentSummary()
  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()
  const markAsPaid = useMarkAsPaid()
  const deletePayment = useDeletePayment()
  const restorePayment = useRestoreDeletedPayment()
  const toast = useToast()
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Payment | null>(null)

  const filtered = filter === 'all' ? payments : payments.filter((p) => p.status === filter)

  function handleEdit(p: Payment) { setEditing(p); setModal(true) }
  function handleNew() { setEditing(null); setModal(true) }
  function handleDelete(p: Payment) { setConfirmDelete(p) }

  function confirmDeletion() {
    if (!confirmDelete) return
    const p = confirmDelete
    setConfirmDelete(null)
    deletePayment.mutate(p.id, {
      onSuccess: () => toast.info('Pagamento removido.', {
        action: { label: 'Desfazer', onClick: () => restorePayment.mutate(p) },
      }),
    })
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="text-2xl sm:text-h2 font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}>
              Pagamentos
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {payments.length} registro{payments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={handleNew}
          data-pwa-tap
          aria-label="Novo pagamento"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0 min-h-[44px]"
          style={{ background: 'var(--primary)' }}>
          <Plus size={16} />
          <span className="hidden xs:inline">Novo</span>
        </button>
      </div>

      {/* ── Resumo financeiro: card único com 3 colunas ── */}
      <div className="mb-5 rounded-card border overflow-hidden grid grid-cols-3"
        style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
        <SummaryCol label="Recebido"  value={summary?.totalPaid ?? 0}    color="var(--status-paid)"     divider />
        <SummaryCol label="A receber" value={summary?.totalPending ?? 0}                                divider />
        <SummaryCol label="Atrasado"  value={summary?.totalOverdue ?? 0} color="var(--status-overdue)" />
      </div>

      {/* ── Filtros ── */}
      <div className="mb-4 -mx-4 sm:mx-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 px-4 sm:px-0 pb-1">
          {FILTERS.map((f) => {
            const active = filter === f.value
            return (
              <button key={f.value} onClick={() => setFilter(f.value)}
                data-pwa-tap
                className="shrink-0 px-3 py-1.5 rounded-badge text-xs font-semibold transition-all whitespace-nowrap"
                style={{
                  background: active ? 'var(--primary)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                }}>
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Lista ── */}
      {isLoading ? (
        <SkeletonList variant="payment" count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CreditCard size={22} />}
          title="Nenhum pagamento"
          description="Registre seu primeiro pagamento para acompanhar suas finanças."
          action={
            <button onClick={handleNew}
              data-pwa-tap
              className="flex items-center gap-2 px-5 py-2.5 rounded-input text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}>
              <Plus size={15} /> Novo pagamento
            </button>
          } />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((p) => {
            const client  = clients.find((c) => c.id === p.clientId)
            const project = projects.find((pr) => pr.id === p.projectId)
            const color = statusColor(p.status)
            const isPaid = p.status === 'paid'
            return (
              <article key={p.id}
                className="rounded-card border overflow-hidden transition-colors"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>

                {/* Linha principal — uma só, compacta */}
                <div className="px-4 py-3 flex items-start gap-3">
                  {/* Ponto de status */}
                  <span aria-hidden
                    className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                    style={{ background: color }} />

                  {/* Descrição + cliente/projeto */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug break-words"
                      style={{ color: 'var(--text-primary)' }}>
                      {p.description}
                    </p>
                    <p className="text-xs mt-0.5 truncate"
                      style={{ color: 'var(--text-tertiary)' }}>
                      {client?.name ?? 'Cliente removido'}
                      {project && ` · ${project.name}`}
                    </p>
                  </div>

                  {/* Valor + status/data */}
                  <div className="text-right shrink-0">
                    <p className="font-mono text-base font-bold tabular-nums leading-tight"
                      style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(p.amount)}
                    </p>
                    <p className="text-[11px] font-medium mt-0.5 inline-flex items-center gap-1"
                      style={{ color }}>
                      <Calendar size={10} aria-hidden />
                      {statusLine(p)}
                    </p>
                  </div>
                </div>

                {/* Ações — compactas, ícone-only para secundárias */}
                <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                  {!isPaid ? (
                    <button onClick={() => markAsPaid.mutate(p.id)}
                      data-pwa-tap
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all hover:opacity-70"
                      style={{ color: 'var(--status-paid)' }}>
                      <Check size={13} /> Marcar como pago
                    </button>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <button onClick={() => handleEdit(p)}
                    data-pwa-tap
                    aria-label="Editar"
                    title="Editar"
                    className="px-4 flex items-center justify-center transition-all hover:opacity-70 border-l"
                    style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(p)}
                    data-pwa-tap
                    aria-label="Remover"
                    title="Remover"
                    className="px-4 flex items-center justify-center transition-all hover:opacity-70 border-l"
                    style={{ color: 'var(--status-overdue)', borderColor: 'var(--border)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <PaymentModal open={modal} onClose={() => setModal(false)} editing={editing} />
      <ConfirmModal
        open={!!confirmDelete}
        title="Remover pagamento?"
        description={confirmDelete ? `"${confirmDelete.description}" será removido permanentemente.` : ''}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onConfirm={confirmDeletion}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// ─── Coluna do resumo financeiro ────────────────────────────────
function SummaryCol({
  label, value, color, divider,
}: {
  label: string; value: number; color?: string; divider?: boolean
}) {
  return (
    <div className="px-3 sm:px-4 py-3.5"
      style={{ borderRight: divider ? '1px solid var(--border)' : 'none' }}>
      <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="font-mono text-sm sm:text-base font-bold tabular-nums leading-none break-all"
        style={{ color: color ?? 'var(--text-primary)' }}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}
