import { useState } from 'react'
import { FileText, Plus, Eye, Trash2, Send } from 'lucide-react'
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} style={{ color: 'var(--primary)' }} />
            <h1 className="text-h2 font-bold" style={{ color: 'var(--text-primary)' }}>Contratos</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{contracts.length} contrato{contracts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <Plus size={15} /> Novo contrato
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState icon={<FileText size={20} />} title="Nenhum contrato ainda"
          description="Crie seu primeiro contrato a partir de um template ou do zero."
          action={<button onClick={() => setCreateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white" style={{ background: 'var(--primary)' }}><Plus size={14} /> Novo contrato</button>} />
      ) : (
        <div className="flex flex-col gap-2">
          {contracts.map((c) => {
            const client = clients.find((cl) => cl.id === c.clientId)
            return (
              <div key={c.id}
                className="flex items-center justify-between p-4 rounded-card border transition-all"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {client?.name ?? '—'} · Criado em {formatDate(c.createdAt)}
                    {c.acceptedAt ? ` · Aceito em ${formatDate(c.acceptedAt)}` : ''}
                    {c.sentAt && c.status === 'sent' ? ` · Enviado em ${formatDate(c.sentAt)}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1 ml-4 shrink-0">
                  <button onClick={() => setViewing(c)} aria-label="Visualizar"
                    className="p-2.5 rounded-input transition-all hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}>
                    <Eye size={14} />
                  </button>
                  {c.status !== 'accepted' && (
                    <button onClick={() => handleCopyLink(c)} aria-label="Copiar link de aceite"
                      className="p-2.5 rounded-input transition-all hover:opacity-70"
                      style={{ color: 'var(--primary)' }}>
                      <Send size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(c.id)} aria-label="Remover"
                    className="p-2.5 rounded-input transition-all hover:opacity-70"
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
