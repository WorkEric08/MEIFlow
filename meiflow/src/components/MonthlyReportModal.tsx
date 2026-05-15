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
      {/* Controles — stack em mobile, inline em sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 mb-5">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
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
        </div>
        <button onClick={handlePrint}
          data-pwa-tap
          className="sm:ml-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 min-h-[42px]"
          style={{ background: 'var(--primary)' }}>
          <Printer size={15} /> Exportar PDF
        </button>
      </div>

      {/* Report content */}
      <div id="monthly-report"
        className="rounded-card border overflow-hidden"
        style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>

        {/* ── Header do relatório — ícone destacado + título e subtítulo ── */}
        <div
          className="flex items-start gap-3 px-4 sm:px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-1)' }}
        >
          <div
            className="w-11 h-11 rounded-input flex items-center justify-center shrink-0"
            style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}
          >
            <BarChart3 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--primary)' }}
            >
              Relatório mensal · MEIFlow
            </p>
            <h2
              className="font-bold text-lg sm:text-xl leading-tight mt-0.5"
              style={{ color: 'var(--text-primary)' }}
            >
              {MONTHS[month]} <span style={{ color: 'var(--text-secondary)' }}>de</span> {year}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {monthPayments.length} pagamento{monthPayments.length !== 1 ? 's' : ''} ·{' '}
              {activeProjects.length} projeto{activeProjects.length !== 1 ? 's' : ''} ativo{activeProjects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {/* ── Métricas — 3 cards lado a lado em qualquer tamanho.
              Texto e números usam clamp() para escalar sem quebra de linha. ── */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-5">
            {[
              {
                label: 'Recebido',
                value: totalPaid,
                count: paid.length,
                color: 'var(--status-paid)',
                bg: 'var(--status-paid-bg)',
              },
              {
                label: 'Pendente',
                value: totalPending,
                count: pending.length,
                color: 'var(--status-pending)',
                bg: 'var(--status-pending-bg)',
              },
              {
                label: 'Atrasado',
                value: totalOverdue,
                count: overdue.length,
                color: 'var(--status-overdue)',
                bg: 'var(--status-overdue-bg)',
              },
            ].map(({ label, value, count, color, bg }) => (
              <div
                key={label}
                className="p-2 sm:p-3.5 rounded-card border flex flex-col gap-1 sm:gap-2 min-w-0 overflow-hidden"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between gap-1 min-w-0">
                  <span
                    className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-badge font-bold uppercase tracking-wider sm:tracking-widest min-w-0 whitespace-nowrap"
                    style={{ background: bg, color, fontSize: 'clamp(8px, 2.1vw, 10px)' }}
                  >
                    {label}
                  </span>
                  <span
                    className="font-mono tabular-nums shrink-0 whitespace-nowrap"
                    style={{ color: 'var(--text-tertiary)', fontSize: 'clamp(9px, 2.2vw, 11px)' }}
                  >
                    {count}
                  </span>
                </div>
                <p
                  className="font-mono font-bold tabular-nums leading-tight whitespace-nowrap overflow-hidden"
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: 'clamp(11px, 3.6vw, 20px)',
                    textOverflow: 'clip',
                  }}
                >
                  {formatCurrency(value)}
                </p>
              </div>
            ))}
          </div>

          {/* ── Pagamentos do mês ── */}
          {monthPayments.length > 0 && (
            <section className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                  Pagamentos do mês
                </p>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {monthPayments.length}
                </span>
              </div>

              {/* Mobile: cards verticais */}
              <div className="flex flex-col gap-2 sm:hidden">
                {monthPayments.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId)
                  const statusColor = p.status === 'paid' ? 'var(--status-paid)' : p.status === 'overdue' ? 'var(--status-overdue)' : 'var(--status-pending)'
                  const statusBg    = p.status === 'paid' ? 'var(--status-paid-bg)' : p.status === 'overdue' ? 'var(--status-overdue-bg)' : 'var(--status-pending-bg)'
                  const statusLabel = p.status === 'paid' ? 'Pago' : p.status === 'overdue' ? 'Atrasado' : 'Pendente'
                  return (
                    <div key={p.id} className="p-3 rounded-card border" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-semibold leading-snug break-words min-w-0 flex-1" style={{ color: 'var(--text-primary)' }}>
                          {p.description}
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-badge shrink-0"
                          style={{ color: statusColor, background: statusBg }}>
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <p className="text-xs leading-relaxed min-w-0 flex-1" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="block truncate">{client?.name ?? '—'}</span>
                          <span className="block mt-0.5">vence {formatDate(p.dueDate)}</span>
                        </p>
                        <span className="font-mono text-sm font-bold tabular-nums shrink-0"
                          style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(p.amount)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* sm+: tabela completa */}
              <div className="hidden sm:block overflow-x-auto rounded-card border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ background: 'var(--bg-1)' }}>
                      {['Descrição','Cliente','Vencimento','Valor','Status'].map((h) => (
                        <th key={h} className="text-left px-3 py-2.5 font-semibold uppercase tracking-widest text-[10px]"
                          style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthPayments.map((p, i) => {
                      const client = clients.find((c) => c.id === p.clientId)
                      const statusColor = p.status === 'paid' ? 'var(--status-paid)' : p.status === 'overdue' ? 'var(--status-overdue)' : 'var(--status-pending)'
                      const statusLabel = p.status === 'paid' ? 'Pago' : p.status === 'overdue' ? 'Atrasado' : 'Pendente'
                      return (
                        <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                          <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>{p.description}</td>
                          <td className="px-3 py-2.5" style={{ color: 'var(--text-secondary)' }}>{client?.name ?? '—'}</td>
                          <td className="px-3 py-2.5 font-mono" style={{ color: 'var(--text-secondary)' }}>{formatDate(p.dueDate)}</td>
                          <td className="px-3 py-2.5 font-mono font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.amount)}</td>
                          <td className="px-3 py-2.5 font-semibold" style={{ color: statusColor }}>{statusLabel}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Projetos ativos ── */}
          {activeProjects.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
                  Projetos ativos no período
                </p>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {activeProjects.length}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:hidden">
                {activeProjects.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId)
                  return (
                    <div key={p.id} className="p-3 rounded-card border" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold leading-snug break-words min-w-0 flex-1" style={{ color: 'var(--text-primary)' }}>
                          {p.name}
                        </p>
                        <span className="font-mono text-sm font-bold tabular-nums shrink-0" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(p.value)}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{client?.name ?? '—'}</span>
                        {' · '}<span className="capitalize">{p.status}</span>
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="hidden sm:block overflow-x-auto rounded-card border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr style={{ background: 'var(--bg-1)' }}>
                      {['Projeto','Cliente','Valor','Status'].map((h) => (
                        <th key={h} className="text-left px-3 py-2.5 font-semibold uppercase tracking-widest text-[10px]"
                          style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                  {activeProjects.map((p, i) => {
                    const client = clients.find((c) => c.id === p.clientId)
                    return (
                      <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                        <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                        <td className="px-3 py-2.5" style={{ color: 'var(--text-secondary)' }}>{client?.name ?? '—'}</td>
                        <td className="px-3 py-2.5 font-mono font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.value)}</td>
                        <td className="px-3 py-2.5 capitalize" style={{ color: 'var(--text-secondary)' }}>{p.status}</td>
                      </tr>
                    )
                  })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {monthPayments.length === 0 && activeProjects.length === 0 && (
            <div className="text-center py-10">
              <BarChart3 size={28} className="mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Nenhum dado para {MONTHS[month]} de {year}.
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Registre pagamentos ou projetos para ver o relatório.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
