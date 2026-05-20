import { useState } from 'react'
import { CreditCard, Plus, Pencil, Trash2, CheckCircle, Calendar } from 'lucide-react'
import { usePayments, usePaymentSummary, useMarkAsPaid, useDeletePayment, useRestoreDeletedPayment } from '@/features/payments/index'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import { useToast } from '@/store/toast'
import PaymentModal from '@/features/payments/components/PaymentModal'
import { EmptyState, StatusBadge, MetricCard } from '@/components/shared'
import { SkeletonList } from '@/components/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Payment } from '@/services/db'

type FilterStatus = 'all' | 'pending' | 'paid' | 'overdue'
const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todos' }, { value: 'pending', label: 'Pendentes' },
  { value: 'overdue', label: 'Atrasados' }, { value: 'paid', label: 'Pagos' },
]

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

  const filtered = filter === 'all' ? payments : payments.filter((p) => p.status === filter)

  function handleEdit(p: Payment) { setEditing(p); setModal(true) }
  function handleNew() { setEditing(null); setModal(true) }
  function handleDelete(p: Payment) {
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

      {/* ── Métricas — 3 cards em qualquer largura, otimizado para mobile ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <MetricCard label="Recebido" value={formatCurrency(summary?.totalPaid ?? 0)} blueprint />
        <MetricCard label="A receber" value={formatCurrency(summary?.totalPending ?? 0)} blueprint />
        <MetricCard label="Atrasado" value={formatCurrency(summary?.totalOverdue ?? 0)} accent="var(--status-overdue)" blueprint />
      </div>

      {/* ── Filtros — scroll horizontal em mobile ── */}
      <div className="mb-4 -mx-4 sm:mx-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 sm:px-0 pb-1">
          {FILTERS.map((f) => {
            const active = filter === f.value
            return (
              <button key={f.value} onClick={() => setFilter(f.value)}
                data-pwa-tap
                className="shrink-0 px-3.5 py-2 rounded-badge text-xs font-semibold transition-all whitespace-nowrap min-h-[36px]"
                style={{
                  background: active ? 'var(--primary)' : 'var(--bg-1)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                }}>
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

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
        <div className="flex flex-col gap-2.5">
          {filtered.map((p) => {
            const client  = clients.find((c) => c.id === p.clientId)
            const project = projects.find((pr) => pr.id === p.projectId)
            const isPaid    = p.status === 'paid'
            const isOverdue = p.status === 'overdue'
            const dueColor  = isOverdue ? 'var(--status-overdue)' : isPaid ? 'var(--status-paid)' : 'var(--text-secondary)'
            return (
              <div key={p.id}
                className="rounded-card border overflow-hidden relative"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                {/* Barra lateral colorida de status — sinal visual rápido */}
                <span
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{
                    background: isPaid ? 'var(--status-paid)'
                      : isOverdue ? 'var(--status-overdue)'
                      : 'var(--status-pending)',
                  }}
                />

                {/* Topo: descrição + status badge */}
                <div className="px-4 pt-3.5 pb-2 pl-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] font-semibold leading-snug min-w-0 flex-1 break-words"
                      style={{ color: 'var(--text-primary)' }}>
                      {p.description}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                  {/* Cliente em destaque, projeto secundário */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-snug">
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {client?.name ?? 'Cliente removido'}
                    </span>
                    {project && (
                      <>
                        <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>{project.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Linha de destaque: VALOR (esquerda, grande) + VENCIMENTO (direita) */}
                <div className="px-4 pl-5 pt-1 pb-3 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--text-tertiary)' }}>
                      {isPaid ? 'Valor recebido' : 'Valor'}
                    </p>
                    <p className="font-mono text-xl font-extrabold tabular-nums leading-tight mt-0.5 break-all"
                      style={{ color: isOverdue ? 'var(--status-overdue)' : 'var(--text-primary)' }}>
                      {formatCurrency(p.amount)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--text-tertiary)' }}>
                      {isPaid ? 'Pago em' : isOverdue ? 'Atrasou em' : 'Vence em'}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5 font-mono text-xs font-semibold tabular-nums"
                      style={{ color: dueColor }}>
                      <Calendar size={12} />
                      <span>{formatDate(p.dueDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Rodapé: ações */}
                <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                  {p.status !== 'paid' && (
                    <>
                      <button onClick={() => markAsPaid.mutate(p.id)}
                        data-pwa-tap
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all hover:opacity-70"
                        style={{ color: 'var(--status-paid)' }}>
                        <CheckCircle size={13} /> Marcar pago
                      </button>
                      <div className="w-px" style={{ background: 'var(--border)' }} />
                    </>
                  )}
                  <button onClick={() => handleEdit(p)}
                    data-pwa-tap
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}>
                    <Pencil size={13} /> Editar
                  </button>
                  <div className="w-px" style={{ background: 'var(--border)' }} />
                  <button onClick={() => handleDelete(p)}
                    data-pwa-tap
                    aria-label="Remover"
                    className="px-4 flex items-center justify-center transition-all hover:opacity-70"
                    style={{ color: 'var(--status-overdue)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PaymentModal open={modal} onClose={() => setModal(false)} editing={editing} />
    </div>
  )
}
