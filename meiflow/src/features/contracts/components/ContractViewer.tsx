import { useRef, useState } from 'react'
import { FileDown, Send, User, FolderOpen, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { renderMarkdown } from '../markdown'
import { Modal, StatusBadge } from '@/components/shared'
import PdfPreviewModal from '@/components/PdfPreviewModal'
import A4PageList from '@/components/A4PageList'
import { CONTRACT_PDF_STYLES } from '../printStyles'
import { useSendContract } from '../index'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import { useToast } from '@/store/toast'
import { formatDate } from '@/lib/utils'
import type { Contract } from '@/services/db'

interface Props {
  contract: Contract
  onClose: () => void
}

/**
 * Estilos aplicados ao bloco oculto #contract-print quando o usuário
 * dispara a impressão nativa do sistema (fallback). Em `@media print`,
 * tudo no body é hidden e só #contract-print fica visível em fullscreen.
 */
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

export default function ContractViewer({ contract, onClose }: Props) {
  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()
  const sendContract = useSendContract()
  const toast = useToast()
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const [pdfOpen, setPdfOpen] = useState(false)

  const client = clients.find((c) => c.id === contract.clientId)
  const project = projects.find((p) => p.id === contract.projectId)

  function handleNativePrint() {
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
    navigator.clipboard.writeText(url).then(() => toast.success('Link copiado!'))
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
          onClick={() => setPdfOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-input border text-xs font-medium transition-all hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <FileDown size={13} /> Exportar PDF
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

      {/* ── Documento em folhas A4 (visualização principal) ── */}
      <div className="-mx-1 sm:-mx-2 rounded-card py-4 sm:py-5"
        style={{ background: 'var(--bg-2)' }}>
        <A4PageList contentHtml={html} documentStyles={CONTRACT_PDF_STYLES} />
      </div>

      {/* ── Bloco oculto para o print nativo (fallback) ──
          fica fora da tela; só aparece quando @media print kicks in
          (BASE_PRINT_STYLES força-o a fullscreen e esconde o resto) */}
      <div id="contract-print"
        aria-hidden
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          width: '794px',
          background: '#ffffff',
          color: '#0D1117',
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: '24px',
          pointerEvents: 'none',
        }}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      <PdfPreviewModal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        title={contract.title}
        contentHtml={html}
        documentStyles={CONTRACT_PDF_STYLES}
        onNativePrint={handleNativePrint}
      />
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
