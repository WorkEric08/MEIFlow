import { useRef } from 'react'
import { Printer, Send, User, FolderOpen, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { renderMarkdown } from '../markdown'
import { Modal, StatusBadge } from '@/components/shared'
import { useSendContract } from '../index'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import { formatDate } from '@/lib/utils'
import type { Contract } from '@/services/db'

interface Props {
  contract: Contract
  onClose: () => void
}

const BASE_PRINT_STYLES = `
  @media print {
    body * { visibility: hidden !important; }
    #contract-print, #contract-print * { visibility: visible !important; }
    #contract-print {
      position: fixed !important;
      inset: 0 !important;
      padding: 40px 60px !important;
      background: white !important;
      color: black !important;
      font-family: Georgia, serif !important;
      font-size: 12pt !important;
      line-height: 1.7 !important;
    }
    #contract-print h1 { font-size: 18pt; margin-bottom: 8px; }
    #contract-print h2 { font-size: 14pt; margin-top: 24px; margin-bottom: 6px; }
    #contract-print h3 { font-size: 12pt; margin-top: 16px; }
    #contract-print p, #contract-print li { margin-bottom: 6px; }
    #contract-print hr { border-top: 1px solid #ccc; margin: 20px 0; }
    #contract-print ul, #contract-print ol { padding-left: 20px; }
    #contract-print strong { font-weight: bold; }
    #contract-print u { text-decoration: underline; }
    #contract-print blockquote { border-left: 3px solid #999; padding-left: 12px; margin: 10px 0; font-style: italic; color: #444; }
    #contract-print a { color: #1A65C0; text-decoration: underline; }
  }
`

const DOCUMENT_STYLES = `
  #contract-print { font-family: Georgia, 'Times New Roman', serif; }
  #contract-print h1 { font-size: 22px; font-weight: 800; margin: 0 0 6px; color: #0D1117; line-height: 1.25; letter-spacing: -0.02em; }
  #contract-print h2 { font-size: 16px; font-weight: 700; margin: 28px 0 8px; padding-top: 18px; border-top: 1px solid #e5e7eb; color: #0D1117; line-height: 1.35; }
  #contract-print h3 { font-size: 14px; font-weight: 700; margin: 18px 0 6px; color: #1e293b; }
  #contract-print p { font-size: 14px; line-height: 1.8; margin-bottom: 12px; color: #334155; }
  #contract-print ul, #contract-print ol { padding-left: 22px; margin-bottom: 12px; }
  #contract-print li { font-size: 14px; line-height: 1.65; color: #334155; margin-bottom: 5px; }
  #contract-print strong { font-weight: 700; color: #0D1117; }
  #contract-print em { font-style: italic; }
  #contract-print u { text-decoration: underline; }
  #contract-print blockquote { border-left: 3px solid #94A3B8; padding: 6px 0 6px 16px; margin: 14px 0; color: #475569; font-style: italic; }
  #contract-print a { color: #1A65C0; text-decoration: underline; }
  #contract-print code { font-family: ui-monospace, 'Courier New', monospace; font-size: 12px; background: #f8fafc; padding: 1px 5px; border-radius: 3px; border: 1px solid #e2e8f0; }
  #contract-print hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
`

export default function ContractViewer({ contract, onClose }: Props) {
  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()
  const sendContract = useSendContract()
  const styleRef = useRef<HTMLStyleElement | null>(null)

  const client = clients.find((c) => c.id === contract.clientId)
  const project = projects.find((p) => p.id === contract.projectId)

  function handlePrint() {
    if (!styleRef.current) {
      const style = document.createElement('style')
      document.head.appendChild(style)
      styleRef.current = style
    }
    styleRef.current.innerHTML = BASE_PRINT_STYLES
    window.print()
  }

  function handleSend() {
    if (contract.status === 'draft') sendContract.mutate(contract.id)
    const url = `${window.location.origin}/contract/${contract.slug}`
    navigator.clipboard.writeText(url).then(() => alert(`Link copiado!\n\n${url}`))
  }

  const html = contract.content.trimStart().startsWith('<')
    ? contract.content
    : renderMarkdown(contract.content)

  return (
    <Modal open title={contract.title} onClose={onClose} size="lg">

      {/* ── Status + Ações ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <StatusBadge status={contract.status} />
        <div className="flex-1" />
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 rounded-input border text-xs font-medium transition-all hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <Printer size={13} /> Exportar PDF
        </button>
        {contract.status !== 'accepted' && (
          <button
            onClick={handleSend}
            className="flex items-center gap-1.5 px-3 py-2 rounded-input text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--primary)' }}
          >
            <Send size={13} />
            {contract.status === 'draft' ? 'Enviar para aceite' : 'Copiar link'}
          </button>
        )}
      </div>

      {/* ── Metadados ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        {client && (
          <MetaChip icon={User} label="Cliente" value={client.name} />
        )}
        {project && (
          <MetaChip icon={FolderOpen} label="Projeto" value={project.name} />
        )}
        <MetaChip icon={Calendar} label="Criado em" value={formatDate(contract.createdAt)} />
        {contract.sentAt && (
          <MetaChip icon={Clock} label="Enviado em" value={formatDate(new Date(contract.sentAt))} />
        )}
        {contract.acceptedAt && (
          <MetaChip icon={CheckCircle2} label="Aceito em" value={formatDate(new Date(contract.acceptedAt))} accent="var(--status-paid)" />
        )}
      </div>

      {/* ── Documento — fundo branco, tipografia serifa ── */}
      <div
        id="contract-print"
        className="rounded-card border overflow-hidden"
        style={{
          background: '#ffffff',
          borderColor: 'var(--border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}
      >
        <style>{DOCUMENT_STYLES}</style>
        <div className="px-6 sm:px-10 py-7 sm:py-10">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

    </Modal>
  )
}

function MetaChip({
  icon: Icon, label, value, accent,
}: {
  icon: React.ElementType
  label: string
  value: string
  accent?: string
}) {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2.5 rounded-input border"
      style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
    >
      <Icon size={12} className="mt-0.5 shrink-0" style={{ color: accent ?? 'var(--text-tertiary)' }} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider leading-none mb-0.5"
          style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </p>
        <p className="text-xs font-medium truncate" style={{ color: accent ?? 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  )
}
