import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { renderPagesAsImages } from '@/lib/pdfExport'

interface Props {
  /** HTML do documento a ser renderizado em folhas A4. */
  contentHtml: string
  /** CSS aplicado ao documento (escopado automaticamente para não vazar). */
  documentStyles?: string
  /** Classe extra aplicada no container externo (e.g. para margens). */
  className?: string
  /** Mostra contador "X páginas · A4" no rodapé quando true (padrão: true). */
  showCount?: boolean
}

/**
 * Renderiza um documento HTML como uma sequência de folhas A4
 * (proporção 210x297mm). Útil para visualizar contratos em formato
 * de página real, espelhando o que o PDF exportado mostra.
 *
 * Funciona em qualquer plataforma porque usa html2canvas → imagem JPEG
 * (inclusive Android WebView, onde iframe de PDF não renderiza).
 */
export default function A4PageList({
  contentHtml, documentStyles, className, showCount = true,
}: Props) {
  const sourceRef = useRef<HTMLDivElement | null>(null)
  const [pages, setPages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setGenerating(true)
      setError(null)
      setPages([])
      try {
        // dá tempo do React montar o source + browser computar layout
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (cancelled) return
        if (!sourceRef.current) throw new Error('Fonte não montada')
        const previewPages = await renderPagesAsImages(sourceRef.current)
        if (cancelled) return
        setPages(previewPages)
      } catch (e) {
        if (cancelled) return
        console.error(e)
        setError('Não foi possível renderizar o documento.')
      } finally {
        if (!cancelled) setGenerating(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [contentHtml])

  return (
    <div className={className}>
      {/* Documento offscreen — fonte do html2canvas */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          width: '794px',
          background: '#ffffff',
          color: '#0D1117',
          fontFamily: "Georgia, 'Times New Roman', serif",
          pointerEvents: 'none',
        }}
      >
        <div ref={sourceRef} className="meiflow-a4-source" style={{ padding: '24px' }}>
          {documentStyles && (
            <style>{scopeStyles(documentStyles, '.meiflow-a4-source')}</style>
          )}
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>

      {/* Folhas visíveis */}
      {generating ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 size={26} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Gerando visualização…
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-6">
          <AlertCircle size={26} style={{ color: 'var(--status-overdue)' }} />
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:gap-5">
          {pages.map((url, i) => (
            <figure
              key={i}
              className="w-full max-w-[640px] rounded-md overflow-hidden"
              style={{
                aspectRatio: '210 / 297',
                background: '#ffffff',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
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
          {showCount && (
            <p className="text-xs font-medium pb-1"
              style={{ color: 'var(--text-tertiary)' }}>
              {pages.length} {pages.length === 1 ? 'página' : 'páginas'} · A4
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Prefixa cada seletor de um bloco CSS com um wrapper, evitando vazamento
 * de estilos para o resto da página.
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
