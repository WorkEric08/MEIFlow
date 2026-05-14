import { useState } from 'react'
import { FileText, Plus, Eye, Trash2, Send, Calendar } from 'lucide-react'
import { useContracts, useDeleteContract, useSendContract } from '@/features/contracts/index'
import { useClients } from '@/features/clients/hooks'
import ContractModal from '@/features/contracts/components/ContractModal'
import ContractViewer from '@/features/contracts/components/ContractViewer'
import { EmptyState, StatusBadge } from '@/components/shared'
import { formatDate } from '@/lib/utils'
import type { Contract } from '@/services/db'

export default function ContractsPage() {
  const { data: contracts = [], isLoading } = useContracts()
  const { data: clients = [] } = useClients()
  const deleteContract = useDeleteContract()
  const sendContract = useSendContract()

  const [createModal, setCreateModal] = useState(false)
  const [viewing, setViewing] = useState<Contract | null>(null)

  function handleDelete(id: string) {
    if (confirm('Remover este contrato?')) deleteContract.mutate(id)
  }

  function handleCopyLink(contract: Contract) {
    if (contract.status === 'draft') sendContract.mutate(contract.id)
    const url = `${window.location.origin}/contract/${contract.slug}`
    navigator.clipboard.writeText(url).then(() => alert(`Link copiado!\n\n${url}`))
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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState icon={<FileText size={22} />}
          title="Nenhum contrato ainda"
          description="Crie seu primeiro contrato a partir de um template ou do zero."
          action={
            <button onClick={() => setCreateModal(true)}
              data-pwa-tap
              className="flex items-center gap-2 px-5 py-2.5 rounded-input text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}>
              <Plus size={15} /> Novo contrato
            </button>
          } />
      ) : (
        <div className="flex flex-col gap-2.5">
          {contracts.map((c) => {
            const client = clients.find((cl) => cl.id === c.clientId)
            return (
              <div key={c.id}
                className="rounded-card border overflow-hidden"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                {/* Topo: ícone + título + status */}
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

                {/* Rodapé: ações */}
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
                      <button onClick={() => handleCopyLink(c)}
                        data-pwa-tap
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all hover:opacity-70"
                        style={{ color: 'var(--primary)' }}>
                        <Send size={13} /> Enviar
                      </button>
                    </>
                  )}
                  <div className="w-px" style={{ background: 'var(--border)' }} />
                  <button onClick={() => handleDelete(c.id)}
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
    </div>
  )
}
