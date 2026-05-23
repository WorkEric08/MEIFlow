import { useState } from 'react'
import { Users, Plus, Pencil, Archive, ArchiveRestore, Search, X } from 'lucide-react'
import {
  useClients, useArchivedClients, useArchiveClient, useUnarchiveClient,
} from '@/features/clients/hooks'
import { useToast } from '@/store/toast'
import ClientModal from '@/features/clients/components/ClientModal'
import ClientDetail from '@/features/clients/components/ClientDetail'
import ProjectModal from '@/features/projects/components/ProjectModal'
import PaymentModal from '@/features/payments/components/PaymentModal'
import { EmptyState } from '@/components/shared'
import { SkeletonList } from '@/components/Skeleton'
import type { Client } from '@/services/db'

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients()
  const { data: archived = [], isLoading: loadingArchived } = useArchivedClients()
  const archiveClient = useArchiveClient()
  const unarchiveClient = useUnarchiveClient()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [detail, setDetail] = useState<Client | null>(null)
  const [projectModal, setProjectModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)

  const list = showArchived ? archived : clients
  const filtered = list.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function handleNew() { setEditing(null); setModal(true) }
  function handleEdit(c: Client) { setEditing(c); setModal(true) }

  function handleArchive(c: Client) {
    archiveClient.mutate(c.id, {
      onSuccess: () => toast.info(`${c.name} arquivado.`, {
        action: { label: 'Desfazer', onClick: () => unarchiveClient.mutate(c.id) },
      }),
    })
  }

  function handleUnarchive(c: Client) {
    unarchiveClient.mutate(c.id, {
      onSuccess: () => toast.success(`${c.name} restaurado.`),
    })
  }

  const loading = showArchived ? loadingArchived : isLoading

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="text-2xl sm:text-h2 font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Clientes
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {clients.length} cadastrado{clients.length !== 1 ? 's' : ''}
            {archived.length > 0 && ` · ${archived.length} arquivado${archived.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setShowArchived((v) => !v); setSearch('') }}
            title={showArchived ? 'Ver ativos' : 'Ver arquivados'}
            className="p-2.5 rounded-input border transition-all hover:opacity-80 min-h-[40px] min-w-[40px] flex items-center justify-center"
            style={{
              borderColor: showArchived ? 'var(--primary)' : 'var(--border)',
              color: showArchived ? 'var(--primary)' : 'var(--text-secondary)',
              background: showArchived ? 'var(--primary-subtle)' : 'transparent',
            }}
          >
            <Archive size={15} />
          </button>
          <button onClick={handleNew} data-pwa-tap aria-label="Novo cliente"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 min-h-[44px]"
            style={{ background: 'var(--primary)' }}>
            <Plus size={16} />
            <span className="hidden xs:inline">Novo</span>
          </button>
        </div>
      </div>

      {/* ── Busca ── */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={showArchived ? 'Buscar arquivados…' : 'Buscar nome, e-mail ou empresa…'}
          className="w-full pl-10 pr-10 py-2.5 rounded-input text-sm border outline-none transition-all"
          style={{ background: 'var(--bg-1)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
        {search && (
          <button onClick={() => setSearch('')} aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-input"
            style={{ color: 'var(--text-tertiary)' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {showArchived && (
        <div className="mb-3 px-3 py-2 rounded-input text-xs font-medium flex items-center gap-2"
          style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
          <Archive size={13} />
          Mostrando clientes arquivados
        </div>
      )}

      {loading ? (
        <SkeletonList variant="client" count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          title={search ? 'Nenhum resultado' : showArchived ? 'Nenhum cliente arquivado' : 'Nenhum cliente ainda'}
          description={search ? 'Tente outro termo.' : showArchived ? 'Arquivos aparecerão aqui.' : 'Cadastre seu primeiro cliente para começar.'}
          action={!search && !showArchived ? (
            <button onClick={handleNew} data-pwa-tap
              className="flex items-center gap-2 px-5 py-2.5 rounded-input text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}>
              <Plus size={15} /> Novo cliente
            </button>
          ) : undefined}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((c) => (
            <article key={c.id}
              className="rounded-card border overflow-hidden transition-colors"
              style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>

              {/* Linha principal — clicável (abre detalhe) */}
              <button onClick={() => !showArchived && setDetail(c)} data-pwa-tap
                disabled={showArchived}
                className="w-full px-4 py-3 flex items-center gap-3 text-left disabled:cursor-default">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {c.name}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {c.email}
                    {c.company && ` · ${c.company}`}
                  </p>
                </div>
              </button>

              {/* Ações — compactas */}
              <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                {showArchived ? (
                  <button onClick={() => handleUnarchive(c)} data-pwa-tap
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all hover:opacity-70"
                    style={{ color: 'var(--primary)' }}>
                    <ArchiveRestore size={13} /> Restaurar
                  </button>
                ) : (
                  <>
                    <div className="flex-1" />
                    <button onClick={() => handleEdit(c)} data-pwa-tap
                      aria-label="Editar"
                      title="Editar"
                      className="px-4 flex items-center justify-center transition-all hover:opacity-70 border-l"
                      style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleArchive(c)} data-pwa-tap
                      aria-label="Arquivar"
                      title="Arquivar"
                      className="px-4 flex items-center justify-center transition-all hover:opacity-70 border-l"
                      style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                      <Archive size={13} />
                    </button>
                  </>
                )}
              </div>
            </article>
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
          onNewProject={() => setProjectModal(true)}
          onNewPayment={() => setPaymentModal(true)}
        />
      )}
    </div>
  )
}
