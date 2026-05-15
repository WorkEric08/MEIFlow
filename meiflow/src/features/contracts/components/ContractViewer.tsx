import { useRef } from 'react'
import { Printer, Send, X } from 'lucide-react'
import { renderMarkdown } from '../markdown'
import { Modal } from '@/components/shared'
import { useSendContract } from '../index'
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


export default function ContractViewer({ contract, onClose }: Props) {
  const sendContract = useSendContract()
  const styleRef = useRef<HTMLStyleElement | null>(null)

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
    if (contract.status === 'draft') {
      sendContract.mutate(contract.id)
    }
    const url = `${window.location.origin}/contract/${contract.slug}`
    navigator.clipboard.writeText(url).then(() => alert(`Link copiado!\n\n${url}`))
  }

  // Contratos novos chegam em HTML (TipTap); contratos legados em markdown.
  // Detectamos pela presença de uma tag HTML no começo.
  const html = contract.content.trimStart().startsWith('<')
    ? contract.content
    : renderMarkdown(contract.content)

  return (
    <Modal open title={contract.title} onClose={onClose} size="lg">
      {/* Actions */}
      <div className="flex items-center justify-between mb-4 -mt-1">
        <div className="flex gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 rounded-input border text-xs font-medium transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <Printer size={13} /> Exportar PDF
          </button>
          <button onClick={handleSend}
            className="flex items-center gap-2 px-3 py-1.5 rounded-input text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--primary)' }}>
            <Send size={13} />
            {contract.status === 'draft' ? 'Enviar para aceite' : 'Copiar link'}
          </button>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-input hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Contract content */}
      <div id="contract-print"
        className="rounded-card border p-6 overflow-auto max-h-[60vh]"
        style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
        <style>{`
          #contract-print h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; color: var(--text-primary); }
          #contract-print h2 { font-size: 15px; font-weight: 700; margin-top: 24px; margin-bottom: 6px; color: var(--text-primary); padding-top: 16px; border-top: 1px solid var(--border); }
          #contract-print h3 { font-size: 13px; font-weight: 600; margin-top: 14px; color: var(--text-primary); }
          #contract-print p { font-size: 13px; line-height: 1.7; margin-bottom: 8px; color: var(--text-secondary); }
          #contract-print ul, #contract-print ol { padding-left: 20px; margin-bottom: 8px; }
          #contract-print li { font-size: 13px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 4px; }
          #contract-print strong { font-weight: 700; color: var(--text-primary); }
          #contract-print em { font-style: italic; }
          #contract-print u { text-decoration: underline; }
          #contract-print blockquote { border-left: 3px solid var(--border); padding: 2px 0 2px 12px; margin: 10px 0; color: var(--text-tertiary); font-style: italic; }
          #contract-print a { color: var(--primary); text-decoration: underline; }
          #contract-print code { font-family: monospace; font-size: 12px; background: var(--bg-1); padding: 1px 4px; border-radius: 3px; }
          #contract-print hr { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </Modal>
  )
}
