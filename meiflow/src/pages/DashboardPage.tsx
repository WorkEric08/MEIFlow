import { useState } from 'react'
import { Users, FolderKanban, CreditCard, AlertTriangle, Plus, BarChart3 } from 'lucide-react'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import { usePayments, usePaymentSummary } from '@/features/payments/index'
import { MetricCard, StatusBadge } from '@/components/shared'
import ClientModal from '@/features/clients/components/ClientModal'
import ProjectModal from '@/features/projects/components/ProjectModal'
import PaymentModal from '@/features/payments/components/PaymentModal'
import MonthlyReportModal from '@/components/MonthlyReportModal'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()
  const { data: payments = [] } = usePayments()
  const { data: summary } = usePaymentSummary()

  const [clientModal, setClientModal] = useState(false)
  const [reportModal, setReportModal] = useState(false)
  const [projectModal, setProjectModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)

  const activeProjects  = projects.filter((p) => p.status === 'active').length
  const overduePayments = payments.filter((p) => p.status === 'overdue')
  const recentPayments  = payments.slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* ── Header — stack em mobile ── */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-h2 font-bold leading-tight"
          style={{ color: 'var(--text-primary)' }}>
          Início
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Visão geral do seu negócio
        </p>

        {/* Ações — grid 3 em mobile, inline em sm+ */}
        <div className="grid grid-cols-3 sm:flex sm:justify-end gap-2 mt-4">
          <button onClick={() => setReportModal(true)}
            data-pwa-tap
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-input text-xs font-medium border transition-all hover:opacity-80 min-h-[42px]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-1)' }}>
            <BarChart3 size={14} /> <span>Relatório</span>
          </button>
          <button onClick={() => setPaymentModal(true)}
            data-pwa-tap
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-input text-xs font-medium border transition-all hover:opacity-80 min-h-[42px]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-1)' }}>
            <Plus size={14} /> <span>Pagamento</span>
          </button>
          <button onClick={() => setProjectModal(true)}
            data-pwa-tap
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-input text-xs font-semibold text-white transition-all hover:opacity-90 min-h-[42px]"
            style={{ background: 'var(--primary)' }}>
            <Plus size={14} /> <span>Projeto</span>
          </button>
        </div>
      </div>

      {/* Alertas in-app */}
      {overduePayments.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-card border mb-5"
          style={{ background: 'var(--status-overdue-bg)', borderColor: 'var(--status-overdue)' }}>
          <AlertTriangle size={18} style={{ color: 'var(--status-overdue)', flexShrink: 0, marginTop: 1 }} />
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--status-overdue)' }}>
              {overduePayments.length} pagamento{overduePayments.length > 1 ? 's' : ''} em atraso
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Total: {formatCurrency(summary?.totalOverdue ?? 0)} — acesse Pagamentos para regularizar.
            </p>
          </div>
        </div>
      )}

      {/* Métricas — 2x2 em mobile, 4-col em lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
        <MetricCard label="Recebido" value={formatCurrency(summary?.totalPaid ?? 0)} sub="confirmados" blueprint />
        <MetricCard label="A receber" value={formatCurrency(summary?.totalPending ?? 0)} sub={`${payments.filter((p) => p.status === 'pending').length} pendentes`} blueprint />
        <MetricCard label="Projetos ativos" value={String(activeProjects)} sub={`${projects.length} no total`} blueprint />
        <MetricCard label="Clientes" value={String(clients.length)} sub="cadastrados" blueprint />
      </div>

      {/* Últimos pagamentos */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
            Últimos pagamentos
          </p>
          <button onClick={() => setPaymentModal(true)}
            data-pwa-tap
            className="flex items-center gap-1 text-xs font-medium transition-all hover:opacity-70 py-1 px-1.5"
            style={{ color: 'var(--primary)' }}>
            <Plus size={13} /> Novo
          </button>
        </div>

        {recentPayments.length === 0 ? (
          <div className="p-8 rounded-card border text-center"
            style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
            <CreditCard size={28} className="mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Nenhum pagamento registrado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentPayments.map((p) => {
              const project = projects.find((pr) => pr.id === p.projectId)
              const client  = clients.find((c) => c.id === p.clientId)
              return (
                <div key={p.id}
                  className="p-3.5 rounded-card border flex flex-col gap-2"
                  style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold leading-snug min-w-0 flex-1 break-words"
                      style={{ color: 'var(--text-primary)' }}>
                      {p.description}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <p className="text-xs leading-relaxed min-w-0 flex-1"
                      style={{ color: 'var(--text-tertiary)' }}>
                      <span className="block truncate">
                        {client?.name ?? '—'}{project ? ` · ${project.name}` : ''}
                      </span>
                      <span className="block mt-0.5">vence {formatDate(p.dueDate)}</span>
                    </p>
                    <span className="font-mono text-base font-bold shrink-0 tabular-nums"
                      style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Ações rápidas — sempre 1-col em mobile (cartões cheios e tocáveis) */}
      <section>
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest mb-3 px-1"
          style={{ color: 'var(--text-tertiary)' }}>
          Ações rápidas
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { icon: Users, label: 'Novo cliente', action: () => setClientModal(true) },
            { icon: FolderKanban, label: 'Novo projeto', action: () => setProjectModal(true) },
            { icon: CreditCard, label: 'Registrar pagamento', action: () => setPaymentModal(true) },
          ].map(({ icon: Icon, label, action }) => (
            <button key={label} onClick={action}
              data-pwa-tap
              className="flex items-center gap-3 p-4 rounded-card border text-left transition-all duration-fast hover:opacity-90 min-h-[60px]"
              style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-input flex items-center justify-center shrink-0"
                style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                <Icon size={18} />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <ClientModal open={clientModal} onClose={() => setClientModal(false)} />
      <ProjectModal open={projectModal} onClose={() => setProjectModal(false)} />
      <PaymentModal open={paymentModal} onClose={() => setPaymentModal(false)} />
      <MonthlyReportModal open={reportModal} onClose={() => setReportModal(false)} />
    </div>
  )
}
