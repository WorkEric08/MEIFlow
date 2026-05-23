import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Eye, Trash2, Send, Calendar, Search, Pencil, X } from 'lucide-react'
import { useContracts, useDeleteContract, useSendContract, useRestoreDeletedContract } from '@/features/contracts/index'
import { useClients } from '@/features/clients/hooks'
import { useToast } from '@/store/toast'
import ContractModal from '@/features/contracts/components/ContractModal'
import ContractViewer from '@/features/contracts/components/ContractViewer'
import { ConfirmModal } from '@/components/ConfirmModal'
import { EmptyState } from '@/components/shared'
import { SkeletonList } from '@/components/Skeleton'
import { formatDate } from '@/lib/utils'
import type { Contract, ContractStatus } from '@/services/db'

type Filter = 'all' | ContractStatus

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'draft',    label: 'Rascunhos' },
  { value: 'sent',     label: 'Enviados' },
  { value: 'accepted', label: 'Aceitos' },
]

const STATUS_LABEL: Record<ContractStatus, string> = {
  draft:    'Rascunho',
  sent:     'Enviado',
  accepted: 'Aceito',
  rejected: 'Rejeitado',
}

function statusColor(status: ContractStatus): string {
  if (status === 'accepted') return 'var(--status-paid)'
  if (status === 'sent')     return 'var(--status-active)'
  if (status === 'rejected') return 'var(--status-overdue)'
  return 'var(--text-tertiary)'
}

/** Data e prefixo do "evento mais recente" relevante de cada contrato. */
function lastEventLine(c: Contract): string {
  if (c.acceptedAt) return `Aceito ${formatDate(new Date(c.acceptedAt))}`
  if (c.sentAt)     return `Enviado ${formatDate(new Date(c.sentAt))}`
  return `Criado ${formatDate(c.createdAt)}`
}

export default function ContractsPage() {
  const navigate = useNavigate()
  const { data: contracts = [], isLoading } = useContracts()
  const { data: clients = [] } = useClients()
  const deleteContract = useDeleteContract()
  const restoreContract = useRestoreDeletedContract()
  const sendContract = useSendContract()
  const toast = useToast()

  const [createModal, setCreateModal] = useState(false)
  const [viewing, setViewing] = useState<Contract | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Contract | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return contracts.filter((c) => {
      if (filter !== 'all' && c.status !== filter) return false
      if (!q) return true
      const client = clients.find((cl) => cl.id === c.clientId)
      return (
        c.title.toLowerCase().includes(q) ||
        (client?.name.toLowerCase().includes(q) ?? false)
      )
    })
  }, [contracts, clients, filter, query])

  function handleCopyLink(contract: Contract) {
    if (contract.status === 'draft') sendContract.mutate(contract.id)
    const url = `${window.location.origin}/contract/${contract.slug}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copiado!'))
  }

  function handleEdit(contract: Contract) {
    navigate(`/contracts/${contract.id}/edit`)
  }

  function handleDelete(contract: Contract) { setConfirmDelete(contract) }

  function confirmDeletion() {
    if (!confirmDelete) return
    const contract = confirmDelete
    setConfirmDelete(null)
    deleteContract.mutate(contract.id, {
      onSuccess: () => toast.info(`"${contract.title}" removido.`, {
        action: { label: 'Desfazer', onClick: () => restoreContract.mutate(contract) },
      }),
    })
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="text-2xl sm:text-h2 font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}>
              Contratos
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {contracts.length} contrato{contracts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setCreateModal(true)}
          data-pwa-tap
          aria-label="Novo contrato"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0 min-h-[44px]"
          style={{ background: 'var(--primary)' }}>
          <Plus size={16} />
          <span className="hidden xs:inline">Novo</span>
        </button>
      </div>

      {/* ── Busca + Filtros ── */}
      {contracts.length > 0 && (
        <>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-tertiary)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título ou cliente"
              className="w-full pl-10 pr-10 py-2.5 rounded-input text-sm border outline-none transition-all"
              style={{
                background: 'var(--bg-1)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border)',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded transition-all hover:opacity-70"
                style={{ color: 'var(--text-tertiary)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="mb-4 -mx-4 sm:mx-0 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 px-4 sm:px-0 pb-1">
              {FILTERS.map((f) => {
                const active = filter === f.value
                return (
                  <button key={f.value} onClick={() => setFilter(f.value)} data-pwa-tap
                    className="shrink-0 px-3 py-1.5 rounded-badge text-xs font-semibold whitespace-nowrap transition-all"
                    style={{
                      background: active ? 'var(--primary)' : 'transparent',
                      color: active ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    }}>
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Lista ── */}
      {isLoading ? (
        <SkeletonList variant="generic" count={3} />
      ) : contracts.length === 0 ? (
        <EmptyState icon={<FileText size={22} />}
          title="Nenhum contrato ainda"
          description="Crie seu primeiro contrato a partir de um modelo pronto ou do zero."
          action={
            <button onClick={() => setCreateModal(true)}
              data-pwa-tap
              className="flex items-center gap-2 px-5 py-2.5 rounded-input text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}>
              <Plus size={15} /> Novo contrato
            </button>
          } />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search size={20} />}
          title="Nenhum contrato encontrado"
          description="Tente outra busca ou troque o filtro."
          action={
            <button onClick={() => { setQuery(''); setFilter('all') }}
              className="px-4 py-2 rounded-input text-sm font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              Limpar filtros
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((c) => {
            const client = clients.find((cl) => cl.id === c.clientId)
            const color = statusColor(c.status)
            const isAccepted = c.status === 'accepted'
            return (
              <article key={c.id}
                className="rounded-card border overflow-hidden transition-colors"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>

                {/* Linha principal — clicável (abre o viewer) */}
                <button
                  onClick={() => setViewing(c)}
                  data-pwa-tap
                  className="w-full px-4 py-3 flex items-start gap-3 text-left"
                >
                  {/* Ponto de status */}
                  <span aria-hidden
                    className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                    style={{ background: color }} />

                  {/* Título + cliente + último evento */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug break-words"
                      style={{ color: 'var(--text-primary)' }}>
                      {c.title}
                    </p>
                    {client && (
                      <p className="text-xs mt-0.5 truncate"
                        style={{ color: 'var(--text-tertiary)' }}>
                        {client.name}
                      </p>
                    )}
                  </div>

                  {/* Status + data do último evento */}
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-semibold leading-tight"
                      style={{ color }}>
                      {STATUS_LABEL[c.status]}
                    </p>
                    <p className="text-[11px] mt-0.5 inline-flex items-center gap-1"
                      style={{ color: 'var(--text-tertiary)' }}>
                      <Calendar size={10} aria-hidden />
                      {lastEventLine(c)}
                    </p>
                  </div>
                </button>

                {/* Ações */}
                <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                  {!isAccepted ? (
                    <button onClick={() => handleCopyLink(c)} data-pwa-tap
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all hover:opacity-70"
                      style={{ color: 'var(--primary)' }}>
                      <Send size={13} />
                      {c.status === 'draft' ? 'Enviar' : 'Copiar link'}
                    </button>
                  ) : (
                    <div className="flex-1" />
                  )}

                  <button onClick={() => setViewing(c)} data-pwa-tap
                    aria-label="Ver"
                    title="Ver"
                    className="px-4 flex items-center justify-center transition-all hover:opacity-70 border-l"
                    style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                    <Eye size={13} />
                  </button>

                  {!isAccepted && (
                    <button onClick={() => handleEdit(c)} data-pwa-tap
                      aria-label="Editar"
                      title="Editar"
                      className="px-4 flex items-center justify-center transition-all hover:opacity-70 border-l"
                      style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                      <Pencil size={13} />
                    </button>
                  )}

                  <button onClick={() => handleDelete(c)} data-pwa-tap
                    aria-label="Remover"
                    title="Remover"
                    className="px-4 flex items-center justify-center transition-all hover:opacity-70 border-l"
                    style={{ color: 'var(--status-overdue)', borderColor: 'var(--border)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ContractModal open={createModal} onClose={() => setCreateModal(false)} />
      {viewing && <ContractViewer contract={viewing} onClose={() => setViewing(null)} />}
      <ConfirmModal
        open={!!confirmDelete}
        title="Remover contrato?"
        description={confirmDelete ? `"${confirmDelete.title}" será removido permanentemente.` : ''}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onConfirm={confirmDeletion}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
