import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react'
import { renderPagesAsImages } from '@/lib/pdfExport'

interface Props {
  /** HTML do documento a ser renderizado em folhas A4. */
  contentHtml: string
  /** CSS aplicado ao documento (escopado automaticamente para não vazar). */
  documentStyles?: string
  /** Classe extra aplicada no container externo (e.g. para margens). */
  className?: string
}

const BASE_PAGE_WIDTH = 640 // px — largura "natural" de uma folha (100%)
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3
const ZOOM_STEP = 0.25

/**
 * Renderiza um documento HTML como uma sequência de folhas A4
 * (proporção 210x297mm), com controles de zoom para leitura próxima.
 *
 * Funciona em qualquer plataforma porque usa html2canvas → imagem JPEG
 * (inclusive Android WebView, onde iframe de PDF não renderiza).
 */
export default function A4PageList({
  contentHtml, documentStyles, className,
}: Props) {
  const sourceRef = useRef<HTMLDivElement | null>(null)
  const [pages, setPages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(true)
  const [zoom, setZoom] = useState(1)

  // Reseta o zoom sempre que o conteúdo mudar
  useEffect(() => {
    setZoom(1)
  }, [contentHtml])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setGenerating(true)
      setError(null)
      setPages([])
      try {
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

  function zoomIn() {
    setZoom((z) => clamp(roundZoom(z + ZOOM_STEP), ZOOM_MIN, ZOOM_MAX))
  }
  function zoomOut() {
    setZoom((z) => clamp(roundZoom(z - ZOOM_STEP), ZOOM_MIN, ZOOM_MAX))
  }
  function zoomReset() {
    setZoom(1)
  }

  const canZoomIn  = zoom < ZOOM_MAX
  const canZoomOut = zoom > ZOOM_MIN
  const zoomed = zoom !== 1

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

      {/* Estado: gerando */}
      {generating && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 size={26} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Gerando visualização…
          </p>
        </div>
      )}

      {/* Estado: erro */}
      {!generating && error && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-6">
          <AlertCircle size={26} style={{ color: 'var(--status-overdue)' }} />
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
        </div>
      )}

      {/* Estado: pronto */}
      {!generating && !error && pages.length > 0 && (
        <>
          {/* Barra de zoom + contador */}
          <div className="flex items-center justify-between gap-3 mb-3 px-2 sm:px-3">
            <div
              className="flex items-center rounded-input border overflow-hidden"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-1)' }}
            >
              <button
                onClick={zoomOut}
                disabled={!canZoomOut}
                data-pwa-tap
                aria-label="Diminuir zoom"
                title="Diminuir zoom"
                className="p-2 transition-all hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={zoomReset}
                data-pwa-tap
                title="Voltar para 100%"
                disabled={!zoomed}
                className="px-2.5 py-2 text-xs font-semibold tabular-nums min-w-[52px] transition-all hover:opacity-70 disabled:cursor-default border-x"
                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={zoomIn}
                disabled={!canZoomIn}
                data-pwa-tap
                aria-label="Aumentar zoom"
                title="Aumentar zoom"
                className="p-2 transition-all hover:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ZoomIn size={14} />
              </button>
            </div>

            <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
              {pages.length} {pages.length === 1 ? 'página' : 'páginas'} · A4
            </p>
          </div>

          {/* Folhas — overflow-x quando zoomed pra permitir rolagem lateral */}
          <div className="overflow-x-auto" style={{ scrollbarWidth: zoomed ? 'thin' : 'none' }}>
            <div
              className="flex flex-col items-center gap-4 sm:gap-5 mx-auto px-2"
              style={{
                width: zoomed ? `${BASE_PAGE_WIDTH * zoom + 16}px` : '100%',
                maxWidth: zoomed ? 'none' : `${BASE_PAGE_WIDTH + 16}px`,
              }}
            >
              {pages.map((url, i) => (
                <figure
                  key={i}
                  className="rounded-md overflow-hidden w-full"
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
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────
function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

function roundZoom(n: number): number {
  return Math.round(n * 100) / 100
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
