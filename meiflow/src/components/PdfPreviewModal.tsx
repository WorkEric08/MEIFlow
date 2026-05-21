import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Download, Share2, Printer, AlertCircle, Loader2 } from 'lucide-react'
import { useScrollLock } from '@/hooks/useScrollLock'
import { useToast } from '@/store/toast'
import {
  generatePdfBlob,
  renderPagesAsImages,
  downloadBlob,
  sharePdfBlob,
  slugifyForFilename,
} from '@/lib/pdfExport'

interface Props {
  open: boolean
  onClose: () => void
  /** Título — usado no header da tela e no nome do arquivo. */
  title: string
  /** HTML do documento a ser convertido em PDF. */
  contentHtml: string
  /** CSS extra aplicado dentro do documento; recebe scoping automático. */
  documentStyles?: string
  /** Fallback nativo (window.print) — recebe o controle se o usuário escolher. */
  onNativePrint?: () => void
}

/**
 * Prefixa cada seletor de um bloco CSS com um wrapper, evitando vazamento de
 * estilos para o resto da página enquanto o componente está aberto.
 */
function scopeStyles(css: string, scope: string): string {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
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

  const sourceRef = useRef<HTMLDivElement | null>(null)
  const [pages, setPages] = useState<string[]>([])
  const [blob, setBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const filename = `${slugifyForFilename(title)}.pdf`

  // ─── Gera preview (imagens) + PDF (blob) ao abrir ───────────────
  useEffect(() => {
    if (!open) return
    let cancelled = false

    async function run() {
      setGenerating(true)
      setError(null)
      setPages([])
      setBlob(null)
      try {
        // dá tempo do React montar o sourceRef + browser computar layout
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (cancelled) return
        if (!sourceRef.current) throw new Error('Fonte não montada')

        // Renderiza imagens das páginas para o preview (funciona em mobile)
        const previewPages = await renderPagesAsImages(sourceRef.current)
        if (cancelled) return
        setPages(previewPages)

        // Gera o PDF real em paralelo (vai ficar pronto até o usuário clicar em Baixar)
        const newBlob = await generatePdfBlob({ element: sourceRef.current, filename })
        if (cancelled) return
        setBlob(newBlob)
      } catch (e) {
        if (cancelled) return
        console.error(e)
        setError('Não foi possível gerar o PDF. Tente a impressão do sistema como alternativa.')
      } finally {
        if (!cancelled) setGenerating(false)
      }
    }

    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contentHtml])

  // Limpa estado ao fechar
  useEffect(() => {
    if (open) return
    setPages([])
    setBlob(null)
    setError(null)
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

  async function handleDownload() {
    if (!blob || !sourceRef.current) return
    setDownloading(true)
    try {
      downloadBlob(blob, filename)
      toast.success('Download iniciado!')
    } finally {
      setDownloading(false)
    }
  }

  async function handleShare() {
    if (!blob) return
    const ok = await sharePdfBlob(blob, filename)
    if (!ok) {
      downloadBlob(blob, filename)
      toast.info('Compartilhamento não suportado neste dispositivo. PDF baixado.')
    }
  }

  function handleNativePrint() {
    onClose()
    // dá tempo do overlay desmontar antes de abrir o diálogo do sistema
    setTimeout(() => onNativePrint?.(), 100)
  }

  return createPortal(
    <>
      {/* Documento offscreen — usado pelo html2canvas/html2pdf como fonte da renderização.
          ATENÇÃO: precisa estar em layout, então uso width fixa e tiro de vista com left negativo. */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          width: '794px', // ~A4 width em px (210mm @ 96dpi)
          background: '#ffffff',
          color: '#0D1117',
          fontFamily: "Georgia, 'Times New Roman', serif",
          pointerEvents: 'none',
        }}
      >
        <div ref={sourceRef} className="meiflow-pdf-source" style={{ padding: '24px' }}>
          {documentStyles && (
            <style>{scopeStyles(documentStyles, '.meiflow-pdf-source')}</style>
          )}
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>

      {/* Overlay full-screen */}
      <div
        className="fixed inset-0 z-[10000] flex flex-col animate-fade-in"
        style={{ background: 'var(--bg-0)' }}
      >
        {/* Header com Voltar + título */}
        <header
          className="flex items-center gap-3 px-3 sm:px-5 py-3 border-b backdrop-blur shrink-0"
          style={{
            background: 'color-mix(in srgb, var(--bg-1) 92%, transparent)',
            borderColor: 'var(--border)',
            paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          }}
        >
          <button
            onClick={onClose}
            data-pwa-tap
            aria-label="Voltar"
            className="p-2 -ml-2 rounded-input transition-all hover:opacity-70 active:scale-95 flex items-center justify-center min-h-[40px] min-w-[40px]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-tertiary)' }}>
              Exportar PDF
            </p>
            <h1 className="text-sm sm:text-base font-bold truncate"
              style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
          </div>
        </header>

        {/* Área do preview — folhas A4 brancas */}
        <main
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ background: 'var(--bg-2)' }}
        >
          {generating && (
            <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center min-h-[40dvh]">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Gerando preview…
              </p>
            </div>
          )}

          {error && !generating && (
            <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center min-h-[40dvh]">
              <AlertCircle size={28} style={{ color: 'var(--status-overdue)' }} />
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
              {onNativePrint && (
                <button
                  onClick={handleNativePrint}
                  className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-input border text-sm font-medium transition-all hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <Printer size={14} />
                  Usar impressão do sistema
                </button>
              )}
            </div>
          )}

          {!generating && !error && pages.length > 0 && (
            <div className="flex flex-col items-center gap-4 sm:gap-6 px-3 sm:px-6 py-5 sm:py-8">
              {pages.map((url, i) => (
                <figure
                  key={i}
                  className="w-full max-w-[640px] rounded-md overflow-hidden"
                  style={{
                    aspectRatio: '210 / 297',
                    background: '#ffffff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.12)',
                  }}
                >
                  <img
                    src={url}
                    alt={`Página ${i + 1} de ${pages.length}`}
                    className="w-full h-full block"
                    style={{ objectFit: 'contain', background: '#ffffff' }}
                  />
                </figure>
              ))}
              <p className="text-xs font-medium pb-2"
                style={{ color: 'var(--text-tertiary)' }}>
                {pages.length} {pages.length === 1 ? 'página' : 'páginas'} · A4
              </p>
            </div>
          )}
        </main>

        {/* Footer com ações */}
        <footer
          className="flex items-center gap-2 px-3 sm:px-5 py-3 border-t shrink-0"
          style={{
            background: 'var(--bg-1)',
            borderColor: 'var(--border)',
            paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          }}
        >
          {onNativePrint && (
            <button
              onClick={handleNativePrint}
              data-pwa-tap
              title="Usar impressão do sistema"
              className="flex items-center gap-1.5 px-3 py-2 rounded-input border text-sm font-medium transition-all hover:opacity-80 active:scale-95"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <Printer size={14} />
              <span className="hidden xs:inline">Imprimir</span>
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={handleShare}
            disabled={!blob}
            data-pwa-tap
            className="flex items-center gap-1.5 px-3 py-2 rounded-input border text-sm font-medium transition-all hover:opacity-80 active:scale-95 disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <Share2 size={14} />
            <span className="hidden xs:inline">Compartilhar</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!blob || downloading}
            data-pwa-tap
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--primary)' }}
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Baixar
          </button>
        </footer>
      </div>
    </>,
    document.body,
  )
}
