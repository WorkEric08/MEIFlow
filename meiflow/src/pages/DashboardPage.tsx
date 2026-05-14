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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h2 font-bold" style={{ color: 'var(--text-primary)' }}>Início</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Visão geral do seu negócio</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setReportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-input text-xs font-medium border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <BarChart3 size={13} /> Relatório
          </button>
          <button onClick={() => setPaymentModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-input text-xs font-medium border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <Plus size={13} /> Pagamento
          </button>
          <button onClick={() => setProjectModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-input text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--primary)' }}>
            <Plus size={13} /> Projeto
          </button>
        </div>
      </div>

      {/* Alertas in-app */}
      {overduePayments.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-card border mb-6"
          style={{ background: 'var(--status-overdue-bg)', borderColor: 'var(--status-overdue)' }}>
          <AlertTriangle size={16} style={{ color: 'var(--status-overdue)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--status-overdue)' }}>
              {overduePayments.length} pagamento{overduePayments.length > 1 ? 's' : ''} em atraso
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Total: {formatCurrency(summary?.totalOverdue ?? 0)} — acesse Pagamentos para regularizar.
            </p>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Faturamento recebido" value={formatCurrency(summary?.totalPaid ?? 0)} sub="pagamentos confirmados" blueprint />
        <MetricCard label="A receber" value={formatCurrency(summary?.totalPending ?? 0)} sub={`${payments.filter((p) => p.status === 'pending').length} pendentes`} blueprint />
        <MetricCard label="Projetos ativos" value={String(activeProjects)} sub={`${projects.length} no total`} blueprint />
        <MetricCard label="Clientes" value={String(clients.length)} sub="cadastrados" blueprint />
      </div>

      {/* Últimos pagamentos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
            Últimos pagamentos
          </p>
          <button onClick={() => setPaymentModal(true)}
            className="flex items-center gap-1 text-xs transition-all hover:opacity-70"
            style={{ color: 'var(--primary)' }}>
            <Plus size={12} /> Novo
          </button>
        </div>

        {recentPayments.length === 0 ? (
          <div className="p-8 rounded-card border text-center"
            style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
            <CreditCard size={24} className="mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Nenhum pagamento registrado</p>
          </div>
        ) : (
          <div className="rounded-card border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {recentPayments.map((p, i) => {
              const project = projects.find((pr) => pr.id === p.projectId)
              const client  = clients.find((c) => c.id === p.clientId)
              return (
                <div key={p.id}
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: i % 2 === 0 ? 'var(--bg-1)' : 'var(--bg-2)', borderBottom: i < recentPayments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.description}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {client?.name} {project ? `· ${project.name}` : ''} · vence {formatDate(p.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(p.amount)}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        {[
          { icon: Users, label: 'Novo cliente', action: () => setClientModal(true) },
          { icon: FolderKanban, label: 'Novo projeto', action: () => setProjectModal(true) },
          { icon: CreditCard, label: 'Registrar pagamento', action: () => setPaymentModal(true) },
        ].map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-3 p-4 rounded-card border text-left transition-all duration-fast hover:opacity-80"
            style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
            <div className="w-8 h-8 rounded-input flex items-center justify-center shrink-0"
              style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <Icon size={15} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
          </button>
        ))}
      </div>

      <ClientModal open={clientModal} onClose={() => setClientModal(false)} />
      <ProjectModal open={projectModal} onClose={() => setProjectModal(false)} />
      <PaymentModal open={paymentModal} onClose={() => setPaymentModal(false)} />
      <MonthlyReportModal open={reportModal} onClose={() => setReportModal(false)} />
    </div>
  )
}
