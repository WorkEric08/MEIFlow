import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Eye, Trash2, Send, Calendar, Search, Pencil, X } from 'lucide-react'
import { useContracts, useDeleteContract, useSendContract, useRestoreDeletedContract } from '@/features/contracts/index'
import { useClients } from '@/features/clients/hooks'
import { useToast } from '@/store/toast'
import ContractModal from '@/features/contracts/components/ContractModal'
import ContractViewer from '@/features/contracts/components/ContractViewer'
import { ConfirmModal } from '@/components/ConfirmModal'
import { EmptyState, StatusBadge } from '@/components/shared'
import { SkeletonList } from '@/components/Skeleton'
import { formatDate } from '@/lib/utils'
import type { Contract, ContractStatus } from '@/services/db'
import { cn } from '@/lib/utils'

type Filter = 'all' | ContractStatus

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'draft',    label: 'Rascunhos' },
  { value: 'sent',     label: 'Enviados' },
  { value: 'accepted', label: 'Aceitos' },
]

const STATUS_ACCENT: Record<ContractStatus, { border: string; iconBg: string; iconColor: string }> = {
  draft:    { border: 'var(--border)',          iconBg: 'var(--bg-2)',              iconColor: 'var(--text-tertiary)' },
  sent:     { border: 'var(--status-active)',   iconBg: 'var(--status-active-bg)',  iconColor: 'var(--status-active)' },
  accepted: { border: 'var(--status-paid)',     iconBg: 'var(--status-paid-bg)',    iconColor: 'var(--status-paid)' },
  rejected: { border: 'var(--status-overdue)',  iconBg: 'var(--status-overdue-bg)', iconColor: 'var(--status-overdue)' },
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
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-tertiary)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título ou cliente"
              className="w-full pl-9 pr-9 py-2.5 rounded-input text-sm border outline-none transition-all focus:ring-1"
              style={{
                background: 'var(--bg-1)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border)',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-all hover:opacity-70"
                style={{ color: 'var(--text-tertiary)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'px-3 py-2 rounded-input text-xs font-semibold whitespace-nowrap transition-all',
                  filter === f.value ? '' : 'hover:opacity-80',
                )}
                style={{
                  background: filter === f.value ? 'var(--primary)' : 'var(--bg-1)',
                  color: filter === f.value ? '#fff' : 'var(--text-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
        <div className="flex flex-col gap-2.5">
          {filtered.map((c) => {
            const client = clients.find((cl) => cl.id === c.clientId)
            const accent = STATUS_ACCENT[c.status]
            return (
              <div
                key={c.id}
                className="rounded-card border overflow-hidden transition-all"
                style={{
                  background: 'var(--bg-1)',
                  borderColor: 'var(--border)',
                  borderLeft: `3px solid ${accent.border}`,
                }}
              >
                {/* ── Área clicável principal ── */}
                <button
                  onClick={() => setViewing(c)}
                  data-pwa-tap
                  className="w-full flex items-start gap-3 px-4 pt-4 pb-3.5 text-left hover:opacity-90 transition-opacity"
                >
                  <div
                    className="w-9 h-9 rounded-input flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: accent.iconBg, color: accent.iconColor }}
                  >
                    <FileText size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Título + badge */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {c.title}
                      </p>
                      <StatusBadge status={c.status} />
                    </div>

                    {/* Cliente */}
                    {client && (
                      <p className="text-xs font-medium mb-1.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                        {client.name}
                      </p>
                    )}

                    {/* Datas */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        <Calendar size={10} />
                        Criado {formatDate(c.createdAt)}
                      </span>
                      {c.sentAt && (
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--status-active)' }}>
                          <Send size={10} />
                          Enviado {formatDate(new Date(c.sentAt))}
                        </span>
                      )}
                      {c.acceptedAt && (
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--status-paid)' }}>
                          <Eye size={10} />
                          Aceito {formatDate(new Date(c.acceptedAt))}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* ── Barra de ações ── */}
                <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => setViewing(c)}
                    data-pwa-tap
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Eye size={13} /> Ver
                  </button>

                  {c.status !== 'accepted' && (
                    <>
                      <div className="w-px" style={{ background: 'var(--border)' }} />
                      <button
                        onClick={() => handleEdit(c)}
                        data-pwa-tap
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      <div className="w-px" style={{ background: 'var(--border)' }} />
                      <button
                        onClick={() => handleCopyLink(c)}
                        data-pwa-tap
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all hover:opacity-70"
                        style={{ color: 'var(--primary)' }}
                      >
                        <Send size={13} />
                        {c.status === 'draft' ? 'Enviar' : 'Copiar link'}
                      </button>
                    </>
                  )}

                  <div className="w-px" style={{ background: 'var(--border)' }} />
                  <button
                    onClick={() => handleDelete(c)}
                    data-pwa-tap
                    aria-label="Remover"
                    className="px-4 flex items-center justify-center transition-all hover:opacity-70"
                    style={{ color: 'var(--status-overdue)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
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
