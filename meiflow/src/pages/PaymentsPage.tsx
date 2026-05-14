import { useState } from 'react'
import { CreditCard, Plus, Pencil, Trash2, CheckCircle, Calendar } from 'lucide-react'
import { usePayments, usePaymentSummary, useMarkAsPaid, useDeletePayment } from '@/features/payments/index'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import PaymentModal from '@/features/payments/components/PaymentModal'
import { EmptyState, StatusBadge, MetricCard } from '@/components/shared'
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
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)

  const filtered = filter === 'all' ? payments : payments.filter((p) => p.status === filter)

  function handleEdit(p: Payment) { setEditing(p); setModal(true) }
  function handleNew() { setEditing(null); setModal(true) }
  function handleDelete(id: string) { if (confirm('Remover este pagamento?')) deletePayment.mutate(id) }

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
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
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
            return (
              <div key={p.id}
                className="rounded-card border overflow-hidden"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                {/* Topo: descrição + status */}
                <div className="px-4 pt-3.5 pb-2.5">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <p className="text-sm font-semibold leading-snug min-w-0 flex-1 break-words"
                      style={{ color: 'var(--text-primary)' }}>
                      {p.description}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs leading-snug truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {client?.name ?? '—'}{project ? ` · ${project.name}` : ''}
                  </p>
                </div>

                {/* Meio: vencimento + valor */}
                <div className="flex items-end justify-between gap-3 px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    <Calendar size={12} />
                    <span>vence {formatDate(p.dueDate)}</span>
                  </div>
                  <span className="font-mono text-base font-bold tabular-nums shrink-0"
                    style={{ color: p.status === 'overdue' ? 'var(--status-overdue)' : 'var(--text-primary)' }}>
                    {formatCurrency(p.amount)}
                  </span>
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
                  <button onClick={() => handleDelete(p.id)}
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
