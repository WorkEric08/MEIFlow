import { useState } from 'react'
import { Users, Plus, Pencil, Trash2, Search, ChevronRight } from 'lucide-react'
import { useClients, useDeleteClient } from '@/features/clients/hooks'
import ClientModal from '@/features/clients/components/ClientModal'
import ClientDetail from '@/features/clients/components/ClientDetail'
import ProjectModal from '@/features/projects/components/ProjectModal'
import PaymentModal from '@/features/payments/components/PaymentModal'
import { EmptyState } from '@/components/shared'
import type { Client } from '@/services/db'

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients()
  const deleteClient = useDeleteClient()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const [detail, setDetail] = useState<Client | null>(null)
  const [projectModal, setProjectModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)
  function handleNew() { setEditing(null); setModal(true) }
  function handleEdit(c: Client) { setEditing(c); setModal(true) }
  function handleDelete(id: string) { if (confirm('Remover este cliente?')) deleteClient.mutate(id) }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} style={{ color: 'var(--primary)' }} />
            <h1 className="text-h2 font-bold" style={{ color: 'var(--text-primary)' }}>Clientes</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{clients.length} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <Plus size={15} /> Novo cliente
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou empresa…"
          className="w-full pl-9 pr-4 py-2 rounded-input text-sm border outline-none transition-all"
          style={{ background: 'var(--bg-1)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={20} />} title={search ? 'Nenhum resultado' : 'Nenhum cliente ainda'}
          description={search ? 'Tente outro termo de busca.' : 'Cadastre seu primeiro cliente para começar.'}
          action={!search ? <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white" style={{ background: 'var(--primary)' }}><Plus size={14} /> Novo cliente</button> : undefined} />
      ) : (
        <div className="rounded-card border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {filtered.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3.5"
              style={{ background: i % 2 === 0 ? 'var(--bg-1)' : 'var(--bg-2)', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {c.email}{c.company ? ` · ${c.company}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4 shrink-0">
                <button onClick={() => setDetail(c)} aria-label="Ver detalhe"
                  className="p-2.5 rounded-input transition-all hover:opacity-70"
                  style={{ color: 'var(--primary)' }}>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleEdit(c)} aria-label="Editar" className="p-2.5 rounded-input transition-all hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><Pencil size={14} /></button>
                <button onClick={() => handleDelete(c.id)} aria-label="Remover" className="p-2.5 rounded-input transition-all hover:opacity-70" style={{ color: 'var(--status-overdue)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

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
