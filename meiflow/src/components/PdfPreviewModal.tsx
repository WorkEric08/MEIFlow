import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Share2, Printer, AlertCircle, Loader2 } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'
import { useToast } from '@/store/toast'
import {
  generatePdfBlob,
  downloadBlob,
  sharePdfBlob,
  slugifyForFilename,
} from '@/lib/pdfExport'

interface Props {
  open: boolean
  onClose: () => void
  /** Título — usado no header do modal e no nome do arquivo. */
  title: string
  /** HTML do documento a ser convertido em PDF. */
  contentHtml: string
  /** CSS extra aplicado dentro do iframe do documento (sem o wrapper #contract-print). */
  documentStyles?: string
  /** Fallback nativo (window.print) — recebe o controle se o usuário escolher. */
  onNativePrint?: () => void
}

/**
 * Prefixa cada seletor de um bloco CSS com um wrapper, evitando vazamento de
 * estilos para o resto da página enquanto o modal está aberto.
 * Suporta seletores múltiplos separados por vírgula e ignora at-rules (@media).
 */
function scopeStyles(css: string, scope: string): string {
  // Remove comentários simples
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  // Casa blocos "selector { ... }" — selector não pode começar com @
  return clean.replace(/([^{}@]+)\{([^}]*)\}/g, (_match, selectors: string, body: string) => {
    const scoped = selectors
      .split(',')
      .map((s) => `${scope} ${s.trim()}`)
      .join(', ')
    return `${scoped} { ${body.trim()} }`
  })
}

export default function PdfPreviewModal({
  open, onClose, title, contentHtml, documentStyles, onNativePrint,
}: Props) {
  useScrollLock(open)
  const toast = useToast()

  // Container offscreen que segura o documento a ser convertido em PDF
  const sourceRef = useRef<HTMLDivElement | null>(null)

  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const filename = `${slugifyForFilename(title)}.pdf`

  // ─── Gera o PDF ao abrir ──────────────────────────────────────
  useEffect(() => {
    if (!open) return
    let revokedUrl: string | null = null
    let cancelled = false

    async function run() {
      setGenerating(true)
      setError(null)
      try {
        // O elemento offscreen precisa estar no DOM (sourceRef.current)
        // espera um frame pra garantir que o React montou ele
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (!sourceRef.current) throw new Error('Fonte não montada')

        const newBlob = await generatePdfBlob({
          element: sourceRef.current,
          filename,
        })
        if (cancelled) return

        const url = URL.createObjectURL(newBlob)
        revokedUrl = url
        setBlob(newBlob)
        setBlobUrl(url)
      } catch (e) {
        if (cancelled) return
        console.error(e)
        setError('Não foi possível gerar o PDF. Tente a impressão do sistema como alternativa.')
      } finally {
        if (!cancelled) setGenerating(false)
      }
    }

    run()
    return () => {
      cancelled = true
      if (revokedUrl) URL.revokeObjectURL(revokedUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contentHtml])

  // Limpa o blob URL ao fechar
  useEffect(() => {
    if (open) return
    if (blobUrl) URL.revokeObjectURL(blobUrl)
    setBlob(null)
    setBlobUrl(null)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Esc para fechar
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleDownload() {
    if (!blob) return
    downloadBlob(blob, filename)
    toast.success('Download iniciado!')
  }

  async function handleShare() {
    if (!blob) return
    const ok = await sharePdfBlob(blob, filename)
    if (!ok) {
      // Fallback: força download
      downloadBlob(blob, filename)
      toast.info('Compartilhamento não suportado. PDF baixado.')
    }
  }

  function handleNativePrint() {
    onNativePrint?.()
  }

  return createPortal(
    <>
      {/* Documento offscreen — usado pelo html2pdf como fonte da renderização.
          ATENÇÃO: o ref precisa estar no elemento estilizado (não no filho),
          pois o html2pdf captura exatamente o nó referenciado. */}
      <div
        ref={sourceRef}
        className="meiflow-pdf-source"
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          width: '794px', // ~A4 width em px (210mm @ 96dpi)
          background: '#ffffff',
          color: '#0D1117',
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: '24px',
          pointerEvents: 'none',
        }}
      >
        {documentStyles && (
          // Escopa as regras dentro de .meiflow-pdf-source pra não vazarem
          <style>{scopeStyles(documentStyles, '.meiflow-pdf-source')}</style>
        )}
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex flex-col items-stretch sm:items-center sm:justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 animate-backdrop-in"
          onClick={onClose}
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />

        {/* Painel */}
        <div
          className="relative z-10 w-full sm:max-w-3xl flex flex-col rounded-t-[22px] sm:rounded-2xl overflow-hidden animate-modal-sheet sm:animate-modal-dialog"
          style={{ background: 'var(--bg-1)', maxHeight: '92dvh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b shrink-0"
            style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                Exportar PDF
              </h2>
            </div>
            <button onClick={onClose} aria-label="Fechar"
              className="p-2 -mr-2 rounded-input transition-all hover:opacity-70 flex items-center justify-center"
              style={{ color: 'var(--text-tertiary)' }}>
              <X size={18} />
            </button>
          </div>

          {/* Preview */}
          <div className="flex-1 min-h-0 relative overflow-hidden" style={{ background: 'var(--bg-2)' }}>
            {generating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
                style={{ background: 'var(--bg-2)' }}>
                <Loader2 size={26} className="animate-spin" style={{ color: 'var(--primary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Gerando PDF…
                </p>
              </div>
            )}

            {error && !generating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <AlertCircle size={28} style={{ color: 'var(--status-overdue)' }} />
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
              </div>
            )}

            {blobUrl && !error && (
              <iframe
                src={blobUrl}
                title="Preview do PDF"
                className="w-full h-full"
                style={{ minHeight: '50dvh', border: 'none' }}
              />
            )}
          </div>

          {/* Footer com ações */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t shrink-0 flex-wrap"
            style={{
              borderColor: 'var(--border)',
              paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
            }}>
            {onNativePrint && (
              <button onClick={handleNativePrint} data-pwa-tap
                title="Usar impressão do sistema"
                className="flex items-center gap-1.5 px-3 py-2 rounded-input border text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <Printer size={14} />
                <span className="hidden xs:inline">Imprimir</span>
              </button>
            )}

            <div className="flex-1" />

            <button onClick={handleShare} disabled={!blob} data-pwa-tap
              className="flex items-center gap-1.5 px-3 py-2 rounded-input border text-sm font-medium transition-all hover:opacity-80 active:scale-95 disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <Share2 size={14} />
              Compartilhar
            </button>

            <button onClick={handleDownload} disabled={!blob} data-pwa-tap
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--primary)' }}>
              <Download size={14} />
              Baixar
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
