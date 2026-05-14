import { useState } from 'react'
import { X, FolderKanban, CreditCard, FileText, Plus, Mail, Phone, Building } from 'lucide-react'
import { useProjectsByClient } from '@/features/projects/hooks'
import { usePayments } from '@/features/payments/index'
import { useContracts } from '@/features/contracts/index'
import { StatusBadge } from '@/components/shared'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Client } from '@/services/db'

interface Props {
  client: Client
  onClose: () => void
  onNewProject: () => void
  onNewPayment: () => void
}

function Section({ icon, title, count, onAdd, addLabel, children }: {
  icon: React.ReactNode; title: string; count: number
  onAdd: () => void; addLabel: string; children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--primary)' }}>{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>
            {title} ({count})
          </span>
        </div>
        <button onClick={onAdd} className="flex items-center gap-1 text-xs transition-all hover:opacity-70" style={{ color: 'var(--primary)' }}>
          <Plus size={12} /> {addLabel}
        </button>
      </div>
      {children}
    </div>
  )
}

export default function ClientDetail({ client, onClose, onNewProject, onNewPayment }: Props) {
  const { data: projects = [] } = useProjectsByClient(client.id)
  const { data: allPayments = [] } = usePayments()
  const { data: allContracts = [] } = useContracts()

  const payments  = allPayments.filter((p) => p.clientId === client.id)
  const contracts = allContracts.filter((c) => c.clientId === client.id)

  const totalBilled  = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-md flex flex-col animate-slide-up sm:animate-fade-in overflow-hidden"
        style={{ background: 'var(--bg-1)', borderLeft: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{client.name}</p>
              {client.company && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{client.company}</p>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-2.5 rounded-input hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Contato */}
          <div className="flex flex-col gap-2 mb-5 p-3 rounded-card border"
            style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <Mail size={13} style={{ color: 'var(--primary)' }} />{client.email}
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Phone size={13} style={{ color: 'var(--primary)' }} />{client.phone}
              </div>
            )}
            {client.company && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Building size={13} style={{ color: 'var(--primary)' }} />{client.company}
              </div>
            )}
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="p-3 rounded-card border" style={{ background: 'var(--bg-2)', borderColor: 'var(--blueprint-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--blueprint-text)' }}>Recebido</p>
              <p className="font-mono font-bold text-base" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalBilled)}</p>
            </div>
            <div className="p-3 rounded-card border" style={{ background: 'var(--bg-2)', borderColor: 'var(--blueprint-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--blueprint-text)' }}>A receber</p>
              <p className="font-mono font-bold text-base" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalPending)}</p>
            </div>
          </div>

          {/* Projetos */}
          <Section icon={<FolderKanban size={14} />} title="Projetos" count={projects.length} onAdd={onNewProject} addLabel="Novo">
            {projects.length === 0
              ? <p className="text-xs py-3 text-center" style={{ color: 'var(--text-tertiary)' }}>Nenhum projeto</p>
              : projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatDate(p.startDate)} · {formatCurrency(p.value)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
          </Section>

          {/* Pagamentos */}
          <Section icon={<CreditCard size={14} />} title="Pagamentos" count={payments.length} onAdd={onNewPayment} addLabel="Novo">
            {payments.length === 0
              ? <p className="text-xs py-3 text-center" style={{ color: 'var(--text-tertiary)' }}>Nenhum pagamento</p>
              : payments.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.description}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Vence {formatDate(p.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(p.amount)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
          </Section>

          {/* Contratos */}
          <Section icon={<FileText size={14} />} title="Contratos" count={contracts.length} onAdd={onNewProject} addLabel="Novo">
            {contracts.length === 0
              ? <p className="text-xs py-3 text-center" style={{ color: 'var(--text-tertiary)' }}>Nenhum contrato</p>
              : contracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                  <StatusBadge status={c.status} />
                </div>
              ))}
          </Section>

          {client.notes && (
            <div className="p-3 rounded-card border" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Observações</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{client.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
