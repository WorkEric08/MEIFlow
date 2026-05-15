import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Eye, Trash2, Send, Calendar, Search, Pencil, X } from 'lucide-react'
import { useContracts, useDeleteContract, useSendContract } from '@/features/contracts/index'
import { useClients } from '@/features/clients/hooks'
import ContractModal from '@/features/contracts/components/ContractModal'
import ContractViewer from '@/features/contracts/components/ContractViewer'
import { ConfirmModal } from '@/components/ConfirmModal'
import { EmptyState, StatusBadge } from '@/components/shared'
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

export default function ContractsPage() {
  const navigate = useNavigate()
  const { data: contracts = [], isLoading } = useContracts()
  const { data: clients = [] } = useClients()
  const deleteContract = useDeleteContract()
  const sendContract = useSendContract()

  const [createModal, setCreateModal] = useState(false)
  const [viewing, setViewing] = useState<Contract | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Contract | null>(null)

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
    navigator.clipboard.writeText(url).then(() => alert(`Link copiado!\n\n${url}`))
  }

  function handleEdit(contract: Contract) {
    navigate(`/contracts/${contract.id}/edit`)
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
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
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
            return (
              <div key={c.id}
                className="rounded-card border overflow-hidden"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setViewing(c)}
                  data-pwa-tap
                  className="w-full flex items-start gap-3 px-4 pt-3.5 pb-3 text-left"
                >
                  <div className="w-10 h-10 rounded-input flex items-center justify-center shrink-0"
                    style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold leading-snug break-words"
                        style={{ color: 'var(--text-primary)' }}>
                        {c.title}
                      </p>
                      <StatusBadge status={c.status} />
                    </div>
                    {client && (
                      <p className="text-xs truncate font-medium"
                        style={{ color: 'var(--text-secondary)' }}>
                        {client.name}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      <Calendar size={11} />
                      <span>
                        Criado em {formatDate(c.createdAt)}
                        {c.acceptedAt && ` · Aceito em ${formatDate(c.acceptedAt)}`}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={() => setViewing(c)}
                    data-pwa-tap
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}>
                    <Eye size={13} /> Ver
                  </button>
                  {c.status !== 'accepted' && (
                    <>
                      <div className="w-px" style={{ background: 'var(--border)' }} />
                      <button onClick={() => handleEdit(c)}
                        data-pwa-tap
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                        style={{ color: 'var(--text-secondary)' }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <div className="w-px" style={{ background: 'var(--border)' }} />
                      <button onClick={() => handleCopyLink(c)}
                        data-pwa-tap
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all hover:opacity-70"
                        style={{ color: 'var(--primary)' }}>
                        <Send size={13} /> Enviar
                      </button>
                    </>
                  )}
                  <div className="w-px" style={{ background: 'var(--border)' }} />
                  <button onClick={() => setConfirmDelete(c)}
                    data-pwa-tap
                    aria-label="Remover"
                    className="px-4 flex items-center justify-center transition-all hover:opacity-70"
                    style={{ color: 'var(--status-overdue)' }}>
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
        description={confirmDelete ? `O contrato "${confirmDelete.title}" será removido. Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onConfirm={() => {
          if (confirmDelete) deleteContract.mutate(confirmDelete.id)
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
