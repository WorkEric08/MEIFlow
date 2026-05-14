import { useState } from 'react'
import { Users, Plus, Pencil, Trash2, Search, ChevronRight, X } from 'lucide-react'
import { useClients, useDeleteClient } from '@/features/clients/hooks'
import ClientModal from '@/features/clients/components/ClientModal'
import ClientDetail from '@/features/clients/components/ClientDetail'
import ProjectModal from '@/features/projects/components/ProjectModal'
import PaymentModal from '@/features/payments/components/PaymentModal'
import { EmptyState } from '@/components/shared'
import UpgradeModal from '@/components/UpgradeModal'
import { usePlanGate } from '@/hooks/usePlanGate'
import type { Client } from '@/services/db'

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients()
  const deleteClient = useDeleteClient()
  const planGate = usePlanGate()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [upgradeReason, setUpgradeReason] = useState('')

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const [detail, setDetail] = useState<Client | null>(null)
  const [projectModal, setProjectModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)

  function handleNew() {
    const gate = planGate.check('client')
    if (!gate.allowed) { setUpgradeReason(gate.reason); return }
    setEditing(null)
    setModal(true)
  }

  function handleEdit(c: Client) { setEditing(c); setModal(true) }
  function handleDelete(id: string) { if (confirm('Remover este cliente?')) deleteClient.mutate(id) }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="text-2xl sm:text-h2 font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}>
              Clientes
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {clients.length} cadastrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={handleNew}
          data-pwa-tap
          aria-label="Novo cliente"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0 min-h-[44px]"
          style={{ background: 'var(--primary)' }}>
          <Plus size={16} />
          <span className="hidden xs:inline">Novo</span>
        </button>
      </div>

      {/* ── Busca ── */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar nome, e-mail ou empresa…"
          className="w-full pl-10 pr-10 py-3 rounded-input text-sm border outline-none transition-all"
          style={{ background: 'var(--bg-1)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
        {search && (
          <button onClick={() => setSearch('')} aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-input"
            style={{ color: 'var(--text-tertiary)' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={22} />}
          title={search ? 'Nenhum resultado' : 'Nenhum cliente ainda'}
          description={search ? 'Tente outro termo de busca.' : 'Cadastre seu primeiro cliente para começar a organizar.'}
          action={!search ? (
            <button onClick={handleNew}
              data-pwa-tap
              className="flex items-center gap-2 px-5 py-2.5 rounded-input text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}>
              <Plus size={15} /> Novo cliente
            </button>
          ) : undefined} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((c) => (
            <div key={c.id}
              className="group rounded-card border overflow-hidden transition-all"
              style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
              <button
                onClick={() => setDetail(c)}
                data-pwa-tap
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shrink-0"
                  style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {c.name}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {c.email}
                  </p>
                  {c.company && (
                    <p className="text-xs truncate mt-0.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {c.company}
                    </p>
                  )}
                </div>
                <ChevronRight size={18} className="shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              </button>
              <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => handleEdit(c)}
                  data-pwa-tap
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                  style={{ color: 'var(--text-secondary)' }}>
                  <Pencil size={13} /> Editar
                </button>
                <div className="w-px" style={{ background: 'var(--border)' }} />
                <button onClick={() => handleDelete(c.id)}
                  data-pwa-tap
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                  style={{ color: 'var(--status-overdue)' }}>
                  <Trash2 size={13} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UpgradeModal open={!!upgradeReason} onClose={() => setUpgradeReason('')} reason={upgradeReason} />
      <ClientModal open={modal} onClose={() => setModal(false)} editing={editing} />
      <ProjectModal open={projectModal} onClose={() => setProjectModal(false)} defaultClientId={detail?.id} />
      <PaymentModal open={paymentModal} onClose={() => setPaymentModal(false)} />
      {detail && (
        <ClientDetail
          client={detail}
          onClose={() => setDetail(null)}
          onNewProject={() => { setProjectModal(true) }}
          onNewPayment={() => { setPaymentModal(true) }}
        />
      )}
    </div>
  )
}
