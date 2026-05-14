import { useState, useRef } from 'react'
import { Printer, BarChart3 } from 'lucide-react'
import { Modal } from '@/components/shared'
import CustomSelect from '@/components/CustomSelect'
import { usePayments } from '@/features/payments/index'
import { useProjects } from '@/features/projects/hooks'
import { useClients } from '@/features/clients/hooks'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #monthly-report, #monthly-report * { visibility: visible !important; }
  #monthly-report {
    position: fixed !important; inset: 0 !important;
    padding: 32px 48px !important; background: white !important;
    color: black !important; font-family: Arial, sans-serif !important;
    font-size: 11pt !important;
  }
  #monthly-report table { width: 100%; border-collapse: collapse; }
  #monthly-report th, #monthly-report td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; font-size: 10pt; }
  #monthly-report th { background: #f4f6fa; font-weight: bold; }
}
`

export default function MonthlyReportModal({ open, onClose }: Props) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear]   = useState(now.getFullYear())
  const styleRef = useRef<HTMLStyleElement | null>(null)

  const { data: payments  = [] } = usePayments()
  const { data: projects  = [] } = useProjects()
  const { data: clients   = [] } = useClients()

  const startOf = new Date(year, month, 1).toISOString().slice(0, 10)
  const endOf   = new Date(year, month + 1, 0).toISOString().slice(0, 10)

  const monthPayments = payments.filter(
    (p) => p.dueDate >= startOf && p.dueDate <= endOf
  )
  const paid    = monthPayments.filter((p) => p.status === 'paid')
  const pending = monthPayments.filter((p) => p.status === 'pending')
  const overdue = monthPayments.filter((p) => p.status === 'overdue')

  const totalPaid    = paid.reduce((s, p) => s + p.amount, 0)
  const totalPending = pending.reduce((s, p) => s + p.amount, 0)
  const totalOverdue = overdue.reduce((s, p) => s + p.amount, 0)

  const activeProjects = projects.filter(
    (p) => p.startDate <= endOf && (!p.endDate || p.endDate >= startOf)
  )

  function handlePrint() {
    if (!styleRef.current) {
      const s = document.createElement('style')
      s.innerHTML = PRINT_STYLES
      document.head.appendChild(s)
      styleRef.current = s
    }
    window.print()
  }

  const years = [now.getFullYear() - 1, now.getFullYear()]

  return (
    <Modal open={open} onClose={onClose} title="Relatório mensal" size="lg">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-5">
        <CustomSelect
          options={MONTHS.map((m, i) => ({ value: String(i), label: m }))}
          value={String(month)}
          onChange={(v) => setMonth(Number(v))}
        />
        <CustomSelect
          options={years.map((y) => ({ value: String(y), label: String(y) }))}
          value={String(year)}
          onChange={(v) => setYear(Number(v))}
        />
        <button onClick={handlePrint}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <Printer size={14} /> Exportar PDF
        </button>
      </div>

      {/* Report content */}
      <div id="monthly-report"
        className="rounded-card border p-5 overflow-auto max-h-[55vh]"
        style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>

        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} style={{ color: 'var(--primary)' }} />
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            MEIFlow — Relatório {MONTHS[month]} {year}
          </h2>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Recebido',  value: formatCurrency(totalPaid),    color: 'var(--status-paid)' },
            { label: 'Pendente',  value: formatCurrency(totalPending),  color: 'var(--status-pending)' },
            { label: 'Atrasado',  value: formatCurrency(totalOverdue),  color: 'var(--status-overdue)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 rounded-card border text-center"
              style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color }}>{label}</p>
              <p className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Pagamentos do mês */}
        {monthPayments.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Pagamentos do mês
            </p>

            {/* Mobile: cards empilhados */}
            <div className="flex flex-col gap-2 sm:hidden">
              {monthPayments.map((p) => {
                const client = clients.find((c) => c.id === p.clientId)
                const statusColor = p.status === 'paid' ? 'var(--status-paid)' : p.status === 'overdue' ? 'var(--status-overdue)' : 'var(--status-pending)'
                const statusLabel = p.status === 'paid' ? 'Pago' : p.status === 'overdue' ? 'Atrasado' : 'Pendente'
                return (
                  <div key={p.id} className="p-3 rounded-card border" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.description}</p>
                      <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: statusColor }}>{statusLabel}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {client?.name ?? '—'} · {formatDate(p.dueDate)} · <span className="font-mono">{formatCurrency(p.amount)}</span>
                    </p>
                  </div>
                )
              })}
            </div>

            {/* sm+: tabela completa */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{ background: 'var(--bg-1)' }}>
                    {['Descrição','Cliente','Vencimento','Valor','Status'].map((h) => (
                      <th key={h} className="text-left px-3 py-2 border font-semibold"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthPayments.map((p) => {
                    const client = clients.find((c) => c.id === p.clientId)
                    return (
                      <tr key={p.id}>
                        <td className="px-3 py-2 border" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{p.description}</td>
                        <td className="px-3 py-2 border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{client?.name ?? '—'}</td>
                        <td className="px-3 py-2 border font-mono" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{formatDate(p.dueDate)}</td>
                        <td className="px-3 py-2 border font-mono" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{formatCurrency(p.amount)}</td>
                        <td className="px-3 py-2 border" style={{ borderColor: 'var(--border)', color: p.status === 'paid' ? 'var(--status-paid)' : p.status === 'overdue' ? 'var(--status-overdue)' : 'var(--status-pending)' }}>
                          {p.status === 'paid' ? 'Pago' : p.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Projetos ativos */}
        {activeProjects.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Projetos ativos no período
            </p>

            {/* Mobile: cards */}
            <div className="flex flex-col gap-2 sm:hidden">
              {activeProjects.map((p) => {
                const client = clients.find((c) => c.id === p.clientId)
                return (
                  <div key={p.id} className="p-3 rounded-card border" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                      <span className="font-mono text-xs ml-2 shrink-0" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.value)}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{client?.name ?? '—'} · {p.status}</p>
                  </div>
                )
              })}
            </div>

            {/* sm+: tabela */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{ background: 'var(--bg-1)' }}>
                    {['Projeto','Cliente','Valor','Status'].map((h) => (
                      <th key={h} className="text-left px-3 py-2 border font-semibold"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                {activeProjects.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId)
                  return (
                    <tr key={p.id}>
                      <td className="px-3 py-2 border" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{p.name}</td>
                      <td className="px-3 py-2 border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{client?.name ?? '—'}</td>
                      <td className="px-3 py-2 border font-mono" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{formatCurrency(p.value)}</td>
                      <td className="px-3 py-2 border capitalize" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{p.status}</td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {monthPayments.length === 0 && activeProjects.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Nenhum dado para {MONTHS[month]} {year}.
          </p>
        )}
      </div>
    </Modal>
  )
}
