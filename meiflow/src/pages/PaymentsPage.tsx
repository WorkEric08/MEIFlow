import { useState } from 'react'
import { CreditCard, Plus, Pencil, Trash2, CheckCircle } from 'lucide-react'
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={18} style={{ color: 'var(--primary)' }} />
            <h1 className="text-h2 font-bold" style={{ color: 'var(--text-primary)' }}>Pagamentos</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{payments.length} registro{payments.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <Plus size={15} /> Novo pagamento
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <MetricCard label="Recebido" value={formatCurrency(summary?.totalPaid ?? 0)} blueprint />
        <MetricCard label="A receber" value={formatCurrency(summary?.totalPending ?? 0)} blueprint />
        <MetricCard label="Atrasado" value={formatCurrency(summary?.totalOverdue ?? 0)} accent="var(--status-overdue)" blueprint />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className="px-3 py-1.5 rounded-badge text-xs font-medium transition-all"
            style={{ background: filter === f.value ? 'var(--primary)' : 'var(--bg-2)', color: filter === f.value ? '#fff' : 'var(--text-secondary)', border: `1px solid ${filter === f.value ? 'var(--primary)' : 'var(--border)'}` }}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CreditCard size={20} />} title="Nenhum pagamento" description="Registre seu primeiro pagamento."
          action={<button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white" style={{ background: 'var(--primary)' }}><Plus size={14} /> Novo</button>} />
      ) : (
        <div className="rounded-card border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {filtered.map((p, i) => {
            const client  = clients.find((c) => c.id === p.clientId)
            const project = projects.find((pr) => pr.id === p.projectId)
            return (
              <div key={p.id} className="flex items-center justify-between px-4 py-3.5"
                style={{ background: i % 2 === 0 ? 'var(--bg-1)' : 'var(--bg-2)', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.description}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {client?.name ?? '—'}{project ? ` · ${project.name}` : ''} · vence {formatDate(p.dueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className="font-mono text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.amount)}</span>
                  <StatusBadge status={p.status} />
                  {p.status !== 'paid' && (
                    <button onClick={() => markAsPaid.mutate(p.id)} aria-label="Marcar como pago"
                      className="p-2.5 rounded-input transition-all hover:opacity-70"
                      style={{ color: 'var(--status-paid)' }}>
                      <CheckCircle size={14} />
                    </button>
                  )}
                  <button onClick={() => handleEdit(p)} aria-label="Editar" className="p-2.5 rounded-input transition-all hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} aria-label="Remover" className="p-2.5 rounded-input transition-all hover:opacity-70" style={{ color: 'var(--status-overdue)' }}><Trash2 size={14} /></button>
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
